"""
Builds src/data.json and public/voice.wav from public/src.mp4.

- transcript with word timestamps (faster-whisper large-v3)
- face track (OpenCV Haar cascade, 30 Hz)
- hand track for the "Claude" moment (MediaPipe Hand Landmarker, 60 Hz)
- edit decision list (60 fps source frames) + the voice track cut sample-accurately

Requirements: ffmpeg, faster-whisper, opencv-python-headless<5, mediapipe,
and hand_landmarker.task from
https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task
"""
import json, subprocess, sys
import numpy as np, cv2

SRC = 'public/src.mp4'
HAND_MODEL = sys.argv[1] if len(sys.argv) > 1 else 'hand_landmarker.task'

# Cuts (seconds in the original). Removed: the self-correction "Não o Claude Code, mas o",
# every "beleza?", "que é basicamente" and the pauses.
EDL_S = [(1.2, 4.55), (5.7667, 9.0333), (9.8, 21.0667), (21.9333, 23.5), (24.1667, 26.9333), (27.2333, 28.9667), (29.2333, 30.9333)]
EDL = [[round(a * 60), round(b * 60)] for a, b in EDL_S]

# ---- transcript ----
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-ac', '1', '-ar', '16000', '/tmp/a16.wav'], check=True)
from faster_whisper import WhisperModel
model = WhisperModel('large-v3', device='cpu', compute_type='int8')
segs, _ = model.transcribe('/tmp/a16.wav', language='pt', word_timestamps=True,
                           initial_prompt='Claude Code, Claude Opus 5.5, inteligência artificial, IA, contexto, tokens.')
words = [{'s': round(w.start, 2), 'e': round(w.end, 2), 'w': w.word.strip()} for s in segs for w in s.words]

# ---- face track ----
cap = cv2.VideoCapture(SRC)
casc = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
faces, i = [], 0
while True:
    ok, f = cap.read()
    if not ok: break
    if i % 2 == 0:
        g = cv2.cvtColor(cv2.resize(f, (960, 540)), cv2.COLOR_BGR2GRAY)
        fs = casc.detectMultiScale(g, 1.1, 6, minSize=(60, 60))
        if len(fs):
            x, y, w, h = max(fs, key=lambda r: r[2] * r[3])
            faces.append([i / 60, float(x + w / 2) * 2, float(y + h / 2) * 2, float(w) * 2])
    i += 1

# ---- hand track (left hand raised while he says "Claude Code / Claude Opus 5.5") ----
import mediapipe as mp
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision
lm = vision.HandLandmarker.create_from_options(vision.HandLandmarkerOptions(
    base_options=mpt.BaseOptions(model_asset_path=HAND_MODEL), running_mode=vision.RunningMode.VIDEO,
    num_hands=2, min_hand_detection_confidence=0.4, min_tracking_confidence=0.4))
cap = cv2.VideoCapture(SRC)
hands, i = [], 0
while True:
    ok, f = cap.read()
    if not ok: break
    t = i / 60
    r = lm.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(f, cv2.COLOR_BGR2RGB)), int(t * 1000))
    if 3.3 <= t <= 7.4:
        for h in r.hand_landmarks:
            p = np.array([[q.x * 1920, q.y * 1080] for q in h])
            palm = p[[0, 5, 9, 13, 17]].mean(0)
            if palm[0] > 700: continue
            sz = float(np.linalg.norm(p[0] - p[9]))
            ang = float(np.degrees(np.arctan2(p[9][0] - p[0][0], -(p[9][1] - p[0][1]))))
            hands.append([round(t, 4), round(float(palm[0]), 1), round(float(palm[1]), 1), round(sz, 1), round(ang, 1)])
    i += 1

json.dump({'fps': 60, 'edl': EDL, 'words': words, 'faces': faces, 'hands': hands}, open('src/data.json', 'w'))

# ---- voice: original audio, cut with 6-10 ms fades at each edit point ----
fc = []
for k, (a, b) in enumerate(EDL):
    s, e = a / 60, b / 60
    fc.append(f'[0:a]atrim=start_sample={round(s * 48000)}:end_sample={round(e * 48000)},asetpts=PTS-STARTPTS,'
              f'afade=t=in:d=0.006,afade=t=out:st={e - s - 0.010:.4f}:d=0.010[a{k}]')
fc.append(''.join(f'[a{k}]' for k in range(len(EDL))) + f'concat=n={len(EDL)}:v=0:a=1[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-filter_complex', ';'.join(fc), '-map', '[out]',
                '-ar', '48000', '-ac', '2', 'public/voice.wav'], check=True)
print('ok', len(words), 'words', len(faces), 'faces', len(hands), 'hand samples')
