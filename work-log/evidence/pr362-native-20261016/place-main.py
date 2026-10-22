from pathlib import Path
import json, ctypes as c, ctypes.wintypes as w, subprocess, sys, datetime
r=Path(__file__).resolve().parent;u=c.windll.user32;u.SetProcessDpiAwarenessContext(c.c_void_p(-4))
launch=json.loads((r/'launch.json').read_text(encoding='utf-8-sig'))
windows=json.loads(subprocess.check_output([sys.executable,str(r/'native-input.py'),'windows'],encoding='utf-8'))
matches=[x for x in windows if x['title']=='Narro' and x['pid']==launch['pid']];assert len(matches)==1
h=w.HWND(matches[0]['hwnd']);x,y,width,height=0,0,1800,1040
assert u.SetWindowPos(h,None,x,y,width,height,0x0004|0x0010),'Owned Main placement failed'
(r/'observations/main-placement.json').write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'hwnd':h.value,'before':matches[0],'requested':[x,y,width,height],'reason':'Both already-open Board and right-edge Focus remain visible on primary without topology or primary-monitor changes; no 125% acceptance claimed'},indent=2),encoding='utf-8')
print(json.dumps({'hwnd':h.value,'requested':[x,y,width,height]}))
