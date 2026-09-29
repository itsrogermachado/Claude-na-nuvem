"""Generates the original (synthesized, royalty-free) music bed and one-shot SFX used by the Remotion composition."""
import numpy as np, wave, os, sys
SR = 48000
OUT = sys.argv[1] if len(sys.argv) > 1 else 'public'
os.makedirs(f'{OUT}/sfx', exist_ok=True)
rng = np.random.default_rng(11)

def write(name, x, peak=0.9):
    if x.ndim == 1: x = np.stack([x, x], 1)
    x = x / (np.abs(x).max() + 1e-9) * peak
    w = wave.open(name, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()

def lp(x, fc):
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    a = 1 - np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s += a[i] * (x[i] - s); y[i] = s
    return y
def hp(x, fc): return x - lp(x, fc)

def whoosh(d, up=True):
    n = int(d * SR); t = np.arange(n) / n; nz = rng.standard_normal(n)
    f = 250 + 6000 * np.sin(np.pi * (t if up else 1 - t) * 0.5 + (0 if up else 0)) ** 2 * np.sin(np.pi * t)
    y = lp(nz, f + 200) - lp(nz, (f + 200) * 0.2)
    y *= np.sin(np.pi * t) ** 1.5
    pan = np.linspace(-0.7, 0.7, n) * (1 if up else -1)
    return np.stack([y * (1 - pan), y * (1 + pan)], 1)

def hit(big=False):
    d = 1.6 if big else 0.7; n = int(d * SR); t = np.arange(n) / SR
    f = 42 + 120 * np.exp(-t * 16)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (2.6 if big else 6.5))
    y = body + lp(rng.standard_normal(n), 2200) * np.exp(-t * 28) * 0.5
    if big: y += lp(rng.standard_normal(n), 900) * np.exp(-t * 2.2) * 0.1
    return y

def pop(f0=900):
    n = int(0.1 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (f0 + 1000 * np.exp(-t * 60)) * t) * np.exp(-t * 50)

def click():
    n = int(0.035 * SR); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 2000) * np.exp(-t * 280) + np.sin(2 * np.pi * 2300 * t) * np.exp(-t * 380) * 0.5

def key(i):
    n = int(0.045 * SR); t = np.arange(n) / SR
    y = hp(rng.standard_normal(n), 1600) * np.exp(-t * 190)
    return y + np.sin(2 * np.pi * (1300 + 90 * i) * t) * np.exp(-t * 300) * 0.35

def riser(d):
    n = int(d * SR); t = np.arange(n) / n
    y = lp(rng.standard_normal(n), 300 + 8000 * t ** 2) * t ** 2
    y = y / (np.abs(y).max() + 1e-9) + np.sin(2 * np.pi * np.cumsum(200 + 700 * t ** 2) / SR) * t ** 3 * 0.35
    return y

def tick():
    n = int(0.02 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 3100 * t) * np.exp(-t * 340)

def shimmer(d=1.2):
    n = int(d * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for i, f in enumerate([1318.5, 1760, 2093, 2637, 3136]):
        st = int(i * 0.035 * SR)
        y[st:] += np.sin(2 * np.pi * f * t[:n - st]) * np.exp(-t[:n - st] * 3.2)
    return y

def magic():  # rising sparkle + soft swell for the 3D logo appearance
    n = int(1.1 * SR); t = np.arange(n) / SR
    sw = lp(rng.standard_normal(n), 600 + 5000 * np.clip(t / 0.35, 0, 1)) * np.exp(-np.abs(t - 0.3) * 7) * 0.6
    y = sw + shimmer(1.1) * 0.5
    return y

write(f'{OUT}/sfx/whoosh_up.wav', whoosh(0.45, True))
write(f'{OUT}/sfx/whoosh_down.wav', whoosh(0.45, False))
write(f'{OUT}/sfx/whoosh_short.wav', whoosh(0.28, True))
write(f'{OUT}/sfx/hit.wav', hit())
write(f'{OUT}/sfx/hit_big.wav', hit(True))
write(f'{OUT}/sfx/pop.wav', pop(900))
write(f'{OUT}/sfx/pop_hi.wav', pop(1300))
write(f'{OUT}/sfx/click.wav', click())
for i in range(4): write(f'{OUT}/sfx/key{i}.wav', key(i))
write(f'{OUT}/sfx/riser.wav', riser(0.72))
write(f'{OUT}/sfx/tick.wav', tick())
write(f'{OUT}/sfx/shimmer.wav', shimmer())
write(f'{OUT}/sfx/magic.wav', magic())

# ---------------- music bed ----------------
DUR = 2477 / 60 + 0.5
N = int(DUR * SR); BPM = 96; beat = 60 / BPM; bar = 4 * beat
mus = np.zeros((N, 2))
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def epiano(m, d):  # 2-op FM electric piano
    n = int(d * SR); t = np.arange(n) / SR; f = hz(m)
    mod = np.sin(2 * np.pi * f * 14 * t) * 1.4 * np.exp(-t * 9)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 1.6) * np.minimum(1, t / 0.004)
chords = [[57, 60, 64, 71], [53, 57, 60, 64], [48, 52, 55, 62], [55, 59, 62, 66]]
bassn = [33, 29, 36, 31]
def add(x, t0, gl=1.0, gr=1.0):
    i = int(t0 * SR)
    if i >= N: return
    x = x[:N - i]
    if x.ndim == 1: mus[i:i + len(x), 0] += x * gl; mus[i:i + len(x), 1] += x * gr
    else: mus[i:i + len(x)] += x
nbars = int(DUR / bar) + 1
for b in range(nbars):
    t0 = b * bar; ch = chords[b % 4]
    for k, m in enumerate(ch):
        add(epiano(m, bar) * 0.09, t0 + k * 0.012, 1 - 0.15 * (k % 2), 0.85 + 0.15 * (k % 2))
        add(epiano(m, beat * 1.5) * 0.05, t0 + 2.5 * beat + k * 0.01)
    bn = int(bar * SR); tb = np.arange(bn) / SR
    bass = np.sin(2 * np.pi * hz(bassn[b % 4]) * tb) * (0.6 + 0.4 * np.exp(-tb * 2)) * np.minimum(1, (bar - tb) / 0.05)
    add(bass * 0.16, t0)
for i in range(int(DUR / beat) + 1):
    t0 = i * beat
    kn = int(0.3 * SR); tk = np.arange(kn) / SR
    if i % 4 in (0, 2) or (i % 8 == 7):
        add(np.sin(2 * np.pi * np.cumsum(48 + 80 * np.exp(-tk * 32)) / SR) * np.exp(-tk * 10) * 0.42, t0 if i % 8 != 7 else t0 + beat / 2)
    if i % 4 in (1, 3):
        sn = lp(rng.standard_normal(kn), 3500) * np.exp(-tk * 20) * 0.10
        add(sn, t0)
    for h in (0.0, 0.5):
        hn = int(0.05 * SR)
        hh = hp(rng.standard_normal(hn), 7500) * np.exp(-np.arange(hn) / SR * (80 if h else 110)) * (0.05 if h else 0.03)
        add(hh, t0 + h * beat, 0.8, 1.2)
# vinyl-ish air
mus += (lp(rng.standard_normal(N), 5000) * 0.006)[:, None]
# arrangement: short breath before "Primeiro" (the steps section) and before the summary
g = np.ones(N)
def ramp(a, b, v0, v1):
    i, j = int(a * SR), int(b * SR); g[i:j] = np.linspace(v0, v1, j - i)
for drop in (12.867, 35.183):
    ramp(drop - 0.45, drop - 0.3, 1, 0.25); g[int((drop - 0.3) * SR):int(drop * SR)] = 0.25; ramp(drop, drop + 0.03, 0.25, 1)
g[:int(0.4 * SR)] *= np.linspace(0.0, 1, int(0.4 * SR))
ramp(DUR - 1.2, DUR, 1, 0)
mus *= g[:, None]
write(f'{OUT}/music.wav', mus, 0.8)
print('ok', DUR)
