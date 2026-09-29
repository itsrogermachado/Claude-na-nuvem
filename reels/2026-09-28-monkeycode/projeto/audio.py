import numpy as np, wave
SR = 48000
DUR = 751 / 30
N = int(DUR * SR)
rng = np.random.default_rng(7)

def write(name, x):
    x = np.clip(x, -1, 1)
    if x.ndim == 1: x = np.stack([x, x], 1)
    w = wave.open(name, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()

def env(n, a, r):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    e *= np.exp(-np.arange(n) / (r * SR)); return e

def lp(x, fc):  # one-pole low-pass, fc may be array
    y = np.zeros_like(x); s = 0.0
    fc = np.broadcast_to(fc, x.shape)
    a = 1 - np.exp(-2 * np.pi * fc / SR)
    for i in range(len(x)): s += a[i] * (x[i] - s); y[i] = s
    return y

def hp(x, fc): return x - lp(x, fc)

# ---------------- SFX ----------------
def whoosh(d=0.45, up=True, lvl=0.5):
    n = int(d * SR); t = np.arange(n) / n
    nz = rng.standard_normal(n)
    f = 300 + 5000 * (np.sin(np.pi * t) ** 2)
    y = lp(nz, f) - lp(nz, f * 0.25)
    e = np.sin(np.pi * t) ** 1.6
    y = y * e
    y /= np.abs(y).max() + 1e-9
    pan = np.linspace(-0.6, 0.6, n) if up else np.linspace(0.6, -0.6, n)
    return np.stack([y * (1 - pan) * 0.7, y * (1 + pan) * 0.7], 1) * lvl

def hit(lvl=0.8, big=False):
    d = 1.4 if big else 0.6; n = int(d * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 18)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (3 if big else 7))
    nz = lp(rng.standard_normal(n), 2500) * np.exp(-t * 30) * 0.6
    y = body + nz
    if big:
        tail = lp(rng.standard_normal(n), 1200) * np.exp(-t * 2.5) * 0.12
        y += tail
    y /= np.abs(y).max()
    return np.stack([y, y], 1) * lvl

def pop(lvl=0.4, f0=900):
    n = int(0.09 * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * (f0 + 900 * np.exp(-t * 60)) * t) * np.exp(-t * 55)
    return np.stack([y, y], 1) * lvl

def click(lvl=0.35):
    n = int(0.03 * SR); t = np.arange(n) / SR
    y = hp(rng.standard_normal(n), 2000) * np.exp(-t * 300) + np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 400) * 0.5
    return np.stack([y, y], 1) * lvl

def key(lvl=0.22):
    n = int(0.04 * SR); t = np.arange(n) / SR
    y = hp(rng.standard_normal(n), 1500) * np.exp(-t * 200)
    y += np.sin(2 * np.pi * (1400 + rng.uniform(-200, 200)) * t) * np.exp(-t * 300) * 0.4
    p = rng.uniform(-0.3, 0.3)
    return np.stack([y * (1 - p), y * (1 + p)], 1) * lvl

def riser(d=0.75, lvl=0.35):
    n = int(d * SR); t = np.arange(n) / n
    nz = rng.standard_normal(n)
    y = lp(nz, 400 + 7000 * t ** 2) * t ** 2
    tone = np.sin(2 * np.pi * np.cumsum(220 + 660 * t ** 2) / SR) * t ** 3 * 0.3
    y = y / (np.abs(y).max() + 1e-9) + tone
    return np.stack([y, y], 1) * lvl

def tick(lvl=0.18):
    n = int(0.02 * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * 3000 * t) * np.exp(-t * 350)
    return np.stack([y, y], 1) * lvl

def shimmer(lvl=0.12, d=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    y = sum(np.sin(2 * np.pi * f * t + i) for i, f in enumerate([1318.5, 1760, 2093, 2637])) * np.exp(-t * 3.5) / 4
    return np.stack([y, y], 1) * lvl

sfx = np.zeros((N + SR * 2, 2))
def put(x, t):
    i = int(t * SR); sfx[i:i + len(x)] += x

put(hit(0.55), 0.0); put(whoosh(0.35, True, 0.35), 0.0)
put(whoosh(0.3, True, 0.3), 2.60); put(pop(0.35, 700), 2.80)
put(whoosh(0.3, False, 0.22), 5.88)
put(whoosh(0.8, True, 0.25), 7.02)
put(hit(0.45), 8.52)
put(whoosh(0.5, False, 0.45), 9.45); put(pop(0.25, 1100), 9.98)
put(whoosh(0.4, True, 0.4), 14.25)
for k in range(14):
    put(tick(0.14), 15.05 + 0.6 * (1 - (1 - k / 14) ** 1.8))
put(hit(0.55), 15.65)
put(pop(0.25, 800), 15.72); put(click(0.3), 16.12)
put(whoosh(0.45, True, 0.4), 17.15)
put(riser(0.75, 0.38), 17.27)
put(hit(0.9, True), 18.0); put(shimmer(0.16), 18.02)
put(whoosh(0.4, False, 0.35), 18.72)
put(whoosh(0.35, True, 0.3), 19.9)
for k in range(10): put(key(0.2), 20.3 + k * 0.06 + rng.uniform(-0.01, 0.01))
put(pop(0.2, 1000), 20.95); put(click(0.35), 21.15)
put(pop(0.3, 750), 21.62); put(whoosh(0.3, False, 0.25), 21.55)
put(whoosh(0.3, True, 0.28), 23.3); put(pop(0.28, 900), 23.4)
put(click(0.4), 24.02); put(pop(0.35, 1200), 24.08); put(shimmer(0.1, 0.9), 24.1)
write('sfx.wav', sfx[:N])

# ---------------- music bed (original, synthesized) ----------------
BPM = 104; beat = 60 / BPM
t = np.arange(N) / SR
mus = np.zeros((N, 2))
def note(f): return 440 * 2 ** ((f - 69) / 12)
# chord progression Am - F - C - G (2 beats... 4 beats each)
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
bass = [45, 41, 48, 43]
bar = 4 * beat
for bi in range(int(DUR / bar) + 2):
    ch = chords[bi % 4]; t0 = bi * bar
    i0 = int(t0 * SR); n = int(bar * SR)
    if i0 >= N: break
    n = min(n, N - i0); tt = np.arange(n) / SR
    pad = sum(np.sin(2 * np.pi * note(m) * tt * (1 + dt)) for m in ch for dt in (-0.003, 0.003)) / 6
    pad *= np.minimum(1, tt / 0.25) * np.minimum(1, (bar - tt) / 0.2)
    mus[i0:i0 + n, 0] += pad * 0.10; mus[i0:i0 + n, 1] += pad * 0.10
    # plucked arpeggio 8ths
    for s in range(8):
        m = ch[[0, 1, 2, 1, 0, 2, 1, 2][s]] + 12
        j0 = i0 + int(s * beat / 2 * SR); nn = int(0.3 * SR)
        if j0 + nn > N: continue
        ta = np.arange(nn) / SR
        pl = (np.sin(2 * np.pi * note(m) * ta) + 0.3 * np.sin(4 * np.pi * note(m) * ta)) * np.exp(-ta * 12)
        pan = 0.3 if s % 2 else -0.3
        mus[j0:j0 + nn, 0] += pl * 0.05 * (1 - pan); mus[j0:j0 + nn, 1] += pl * 0.05 * (1 + pan)
    # bass
    for s in range(4):
        j0 = i0 + int(s * beat * SR); nn = int(beat * 0.9 * SR)
        if j0 + nn > N: continue
        tb = np.arange(nn) / SR
        b = np.tanh(2.5 * np.sin(2 * np.pi * note(bass[bi % 4]) * tb)) * np.exp(-tb * 3)
        mus[j0:j0 + nn] += (b * 0.11)[:, None]
# drums
nb = int(DUR / beat) + 1
for b in range(nb):
    tb0 = b * beat; j0 = int(tb0 * SR)
    kn = int(0.35 * SR)
    if j0 + kn < N and b % 2 == 0:
        tk = np.arange(kn) / SR
        k = np.sin(2 * np.pi * np.cumsum(50 + 90 * np.exp(-tk * 30)) / SR) * np.exp(-tk * 9)
        mus[j0:j0 + kn] += (k * 0.35)[:, None]
    if j0 + kn < N and b % 2 == 1:
        sn = lp(rng.standard_normal(kn), 4000) * np.exp(-np.arange(kn) / SR * 22) * 0.12
        mus[j0:j0 + kn] += sn[:, None]
    for h in (0.5,):
        jh = int((tb0 + h * beat) * SR); hn = int(0.05 * SR)
        if jh + hn < N:
            hh = hp(rng.standard_normal(hn), 7000) * np.exp(-np.arange(hn) / SR * 90) * 0.07
            mus[jh:jh + hn] += hh[:, None]
# drop the music just before the logo reveal (riser carries it), then return on the impact
g = np.ones(N)
def ramp(a, b, v0, v1):
    i, j = int(a * SR), int(b * SR); g[i:j] = np.linspace(v0, v1, j - i)
ramp(17.25, 17.6, 1, 0.15); g[int(17.6 * SR):int(18.0 * SR)] = 0.15
ramp(18.0, 18.05, 0.15, 1)
ramp(DUR - 0.8, DUR, 1, 0)
g[:int(0.3 * SR)] *= np.linspace(0.3, 1, int(0.3 * SR))
mus *= g[:, None]
mus /= np.abs(mus).max()
write('music.wav', mus * 0.9)
print('ok')
