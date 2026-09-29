import numpy as np, json, subprocess, wave
w=wave.open('a.wav'); sr=w.getframerate(); a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
def rms(t): i=int(t*sr); s=a[max(0,i-80):i+80]; return float(np.sqrt((s**2).mean()+1e-12))
def refine(t,lo,hi):
    ts=np.arange(t-lo,t+hi,0.005); v=[rms(x) for x in ts]; return float(ts[int(np.argmin(v))])
segs=[(1.22,3.87),(5.74,8.98),(9.84,16.50),(18.27,21.04),(21.91,23.46),(24.13,26.93),(27.22,28.99),(29.22,30.95)]
out=[]
for s,e in segs:
    s2=refine(s,0.06,0.03); e2=refine(e,0.03,0.06)
    print(f'{s:.2f}->{s2:.3f} ({20*np.log10(rms(s2)):.0f}dB)   {e:.2f}->{e2:.3f} ({20*np.log10(rms(e2)):.0f}dB)')
    out.append([round(s2,3),round(e2,3)])
json.dump(out,open('edl.json','w'))
print(sum(e-s for s,e in out))
