"""
Builds src/data.json and public/voice.wav for the Empire Live reel.

Inputs (from the analysis step, see README):
  words.json   whisper large-v3 word timestamps per clip ({c1: [{s, e, w}], c2: [...]})
  faces.json   face track per clip (OpenCV Haar, 15 Hz, proxy px)
Usage: python tools/prepare_data.py <analysis dir>
"""
import json, subprocess, sys

D = sys.argv[1]
words = json.load(open(f'{D}/words.json'))
faces = json.load(open(f'{D}/faces.json'))

# Cuts in source seconds: pauses removed, every boundary sits in silence (ffmpeg silencedetect, -35 dB)
EDL = [
    ('c1', 0.40, 2.10),   # "Hoje eu vou te ensinar como eu fiz"
    ('c1', 2.33, 3.38),   # "esse valor aqui,"
    ('c1', 3.66, 8.03),   # "sem investir um real em anúncios, sem ficar perdendo tempo indo atrás de"
    ('c1', 8.57, 10.78),  # "produto na Shopee, etc."
    ('c1', 11.22, 11.78), # "E aí,"
    ('c1', 12.02, 13.95), # "você vai me dizer se valeu a pena ou não."
    ('c2', 0.22, 4.47),   # "Primeira coisa que eu fiz ... o link tá na bio, beleza?"
    ('c2', 4.70, 6.67),   # "Você vai entrar, você vai conectar suas contas nela e"
    ('c2', 6.90, 13.56),  # "ela basicamente vai te explicar ... os melhores produtos."
    ('c2', 13.85, 14.71), # "E pronto,"
    ('c2', 14.85, 21.00), # "cara, você já tá vendendo como afiliado ... no momento e"
    ('c2', 21.36, 24.26), # "é a melhor coisa que vocês podem fazer no momento, cara."
]

def silences(path):
    log = subprocess.run(['ffmpeg', '-i', path, '-vn', '-af', 'silencedetect=n=-35dB:d=0.15', '-f', 'null', '-'], capture_output=True, text=True).stderr
    st = [float(l.split('silence_start: ')[1]) for l in log.splitlines() if 'silence_start' in l]
    en = [float(l.split('silence_end: ')[1].split()[0]) for l in log.splitlines() if 'silence_end' in l]
    return list(zip(st, en))

def snap(ws, sil):
    # whisper's word edges drift into pauses; pull them back to where the voice actually starts/stops
    out = []
    for w in ws:
        s, e = w['s'], w['e']
        for a, b in sil:
            if a <= s < b: s = b
            if a < e <= b: e = a
            if s < a and b < e:  # a pause inside the word: keep the side that holds more of it
                if a - s >= e - b: e = a
                else: s = b
        out.append({'s': round(s, 3), 'e': round(max(e, s + 0.05), 3), 'w': w['w']})
    return out

clips = {c: {'faces': faces[c], 'words': snap(words[c], silences(f'public/{c}.mp4'))} for c in ('c1', 'c2')}
segments = [{'clip': c, 'srcStart': round(a * 60), 'srcEnd': round(b * 60)} for c, a, b in EDL]
json.dump({'fps': 60, 'segments': segments, 'clips': clips}, open('src/data.json', 'w'), ensure_ascii=False)

# voice: original audio of each cut, untouched apart from 6/10 ms fades at every edit point
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
