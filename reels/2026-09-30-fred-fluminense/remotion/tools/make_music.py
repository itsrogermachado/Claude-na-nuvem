"""Original (synthesized) score for the Fred reel.
Part 1 (0 – 59.4 s): tense, minor, pulsing — the criticism and the facts.
Part 2 (59.4 s – end): warm, major, building — idolatry and connection, lifting at 84.4 s ("conexão")."""
import numpy as np, wave, sys

SR = 44100
DUR = 94.2
N = int(DUR * SR)
rng = np.random.default_rng(3)
PART2 = 59.4
LIFT = 84.4
OUT = sys.argv[1] if len(sys.argv) > 1 else 'public/music.wav'

def hz(m): return 440 * 2 ** ((m - 69) / 12)
mus = np.zeros((N, 2))

def add(x, t0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    x = x[:N - i]
    mus[i:i + len(x), 0] += x * (1 - pan)
    mus[i:i + len(x), 1] += x * (1 + pan)

def lp(x, a):  # simple one-pole low-pass (a = smoothing 0..1)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s += a * (x[i] - s); y[i] = s
    return y

def pad(chord, d, bright=0.3):
    n = int(d * SR); t = np.arange(n) / SR
    y = np.zeros(n)
    for m in chord:
        for det in (-0.004, 0.0, 0.004):
            ph = rng.uniform(0, 6.28)
            y += np.sin(2 * np.pi * hz(m) * (1 + det) * t + ph) + bright * np.sin(4 * np.pi * hz(m) * (1 + det) * t + ph)
    env = np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.8)
    return y * env / (len(chord) * 3)

def piano(m, d=2.0, vel=1.0):
    n = int(d * SR); t = np.arange(n) / SR; f = hz(m)
    y = sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (2.2 + k * 1.3)) / k for k in (1, 2, 3, 4))
    return y * np.minimum(1, t / 0.005) * vel

def kick(d=0.4):
    n = int(d * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-t * 28)) / SR) * np.exp(-t * 8)

def tick():
    n = int(0.05 * SR); t = np.arange(n) / SR
    return rng.standard_normal(n) * np.exp(-t * 120) * 0.5

# ---------- part 1: D minor tension, 92 bpm ----------
bpm = 92; beat = 60 / bpm; bar = 4 * beat
prog1 = [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 61]]  # Dm Bb C A
t = 0.0; b = 0
while t < PART2:
    ch = prog1[b % 4]
    add(pad(ch, bar + 0.8, 0.25) * 0.5, t)
    for k in range(8):  # pulsing low 8ths
        n = int(beat / 2 * SR); tt = np.arange(n) / SR
        x = np.tanh(2 * np.sin(2 * np.pi * hz(ch[0] - 12) * tt)) * np.exp(-tt * 6) * 0.35
        add(x, t + k * beat / 2)
    motif = [ch[3] + 12, ch[2] + 12, ch[1] + 12, ch[2] + 12]
    for k, m in enumerate(motif):
        add(piano(m, 1.6, 0.35), t + k * beat, pan=0.25 if k % 2 else -0.25)
    for k in range(4):
        add(tick() * 0.25, t + k * beat + beat / 2, pan=0.4)
    if b % 2 == 1: add(kick() * 0.5, t)
    t += bar; b += 1

# ---------- part 2: F major warmth, builds to the lift ----------
bpm2 = 84; beat2 = 60 / bpm2; bar2 = 4 * beat2
prog2 = [[53, 60, 65, 69], [50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64]]  # F Dm Bb C
t = PART2; b = 0
while t < DUR:
    ch = prog2[b % 4]
    lifted = t >= LIFT - 0.1
    add(pad(ch, bar2 + 1.0, 0.45 if lifted else 0.3) * (0.75 if lifted else 0.55), t)
    add(pad([ch[0] - 12], bar2 + 1.0, 0.1) * 0.6, t)
    arp = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12, ch[1] + 12, ch[2] + 12, ch[3] + 12]
    for k, m in enumerate(arp):
        add(piano(m, 1.8, 0.28 if not lifted else 0.36), t + k * beat2 / 2, pan=-0.3 + 0.6 * (k % 2))
    if t > PART2 + bar2 * 2 or lifted:
        for k in range(4):
            add(kick() * (0.55 if lifted else 0.35), t + k * beat2)
    t += bar2; b += 1

# swell into the lift
n = int(2.0 * SR); tt = np.arange(n) / SR
swell = lp(rng.standard_normal(n), 0.08) * (tt / 2.0) ** 2 * 0.6
add(swell, LIFT - 2.0)
# fade in / out
g = np.ones(N)
g[:int(0.6 * SR)] = np.linspace(0, 1, int(0.6 * SR))
g[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR))
# brief dip at the switch to part 2
i0, i1 = int((PART2 - 0.5) * SR), int(PART2 * SR)
g[i0:i1] *= np.linspace(1, 0.2, i1 - i0)
mus *= g[:, None]
mus /= np.abs(mus).max() + 1e-9
wv = wave.open(OUT, 'wb'); wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
wv.writeframes((mus * 0.85 * 32767).astype(np.int16).tobytes()); wv.close()
print('ok', OUT, DUR)
