import cv2, numpy as np, json
cap=cv2.VideoCapture('src.mp4')
casc=cv2.CascadeClassifier(cv2.data.haarcascades+'haarcascade_frontalface_default.xml')
res=[];i=0
while True:
    ok,f=cap.read()
    if not ok: break
    if i%2==0:
        g=cv2.cvtColor(cv2.resize(f,(960,540)),cv2.COLOR_BGR2GRAY)
        fs=casc.detectMultiScale(g,1.1,6,minSize=(60,60))
        if len(fs):
            x,y,w,h=max(fs,key=lambda r:r[2]*r[3])
            res.append([i/60,float(x+w/2)*2,float(y+h/2)*2,float(w)*2])
        else: res.append([i/60,None,None,None])
    i+=1
json.dump(res,open('faces.json','w'))
v=[r for r in res if r[1]]
print(len(res),len(v)); a=np.array([r[1:] for r in v]); print(a.min(0),a.max(0),np.median(a,0))
