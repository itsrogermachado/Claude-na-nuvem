"""
Builds src/data.json and public/voice.wav for the "IA edita meus vídeos" reel.

Inputs (from the analysis step, see README):
  words.json          whisper large-v3 word timestamps per clip
  tracks.json         face (Haar, 30 Hz) + hand (MediaPipe, 60 Hz) tracks per clip
  c4_landmarks.json   21 hand landmarks per frame for clip c4 (tracking visual)
  edl.json            [clip, startSec, endSec] cuts, already snapped to 1/60 s
Usage: python tools/prepare_data.py <analysis dir>
"""
import json, subprocess, sys, os

D = sys.argv[1]
edl = json.load(open(f'{D}/edl.json'))
words = json.load(open(f'{D}/words.json'))
tracks = json.load(open(f'{D}/tracks.json'))
lms = json.load(open(f'{D}/c4_landmarks.json'))

# which hand carries the story in each clip (left side for the logo, right side for the 1-2-3 count)
HAND_SIDE = {'c1': 'left', 'c2': None, 'c3': 'right', 'c4': 'left'}

def pick(hs, side):
    if not hs or side is None: return None
    if side == 'left':
        c = [h for h in hs if h[0] < 950]
        return min(c, key=lambda h: h[0]) if c else None
    c = [h for h in hs if h[0] > 1250]
    return max(c, key=lambda h: h[0]) if c else None

clips = {}
for c, d in tracks.items():
    hands = []
    for t, hs in d['hands']:
        h = pick(hs, HAND_SIDE[c])
        if h: hands.append([t, h[0], h[1], h[2], h[3], h[4], h[5], h[6]])
    clips[c] = {
        'faces': [[f[0], f[1], f[2], f[3]] for f in d['faces']],
        'hands': hands,
        'words': [{'s': w['s'], 'e': w['e'], 'w': w['w']} for w in words[c]],
    }
clips['c4']['landmarks'] = [[t, p] for t, p in lms if p]

segments = [{'clip': c, 'srcStart': round(a * 60), 'srcEnd': round(b * 60)} for c, a, b in edl]
json.dump({'fps': 60, 'segments': segments, 'clips': clips}, open('src/data.json', 'w'))

# voice: original audio of each cut, with 6/10 ms fades at every edit point
ins, fc = [], []
order = sorted({s['clip'] for s in segments})
for c in order: ins += ['-i', f'public/{c}.mp4']
for k, s in enumerate(segments):
    a, b = s['srcStart'] / 60, s['srcEnd'] / 60
    fc.append(f"[{order.index(s['clip'])}:a]atrim=start_sample={round(a * 48000)}:end_sample={round(b * 48000)},"
              f"asetpts=PTS-STARTPTS,afade=t=in:d=0.006,afade=t=out:st={b - a - 0.010:.4f}:d=0.010[s{k}]")
fc.append(''.join(f'[s{k}]' for k in range(len(segments))) + f'concat=n={len(segments)}:v=0:a=1[o]')
subprocess.run(['ffmpeg', '-v', 'error', '-y'] + ins + ['-filter_complex', ';'.join(fc), '-map', '[o]',
                '-ar', '48000', '-ac', '2', 'public/voice.wav'], check=True)
total = sum(s['srcEnd'] - s['srcStart'] for s in segments)
print('ok', len(segments), 'segments,', total, 'frames =', round(total / 60, 2), 's')
