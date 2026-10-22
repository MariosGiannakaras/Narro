from pathlib import Path
import json,ctypes as c,ctypes.wintypes as w,subprocess,sys,datetime
r=Path(__file__).resolve().parent
u=c.windll.user32;u.SetProcessDpiAwarenessContext(c.c_void_p(-4))
launch=json.loads((r/'launch.json').read_text(encoding='utf-8-sig'))
ledger=json.loads((r/'profile-protection-private.json').read_text())
assert ledger['state']=='OWNED_PROFILE_ACTIVE' and ledger['sessionRoot']==str(r)
windows=json.loads(subprocess.check_output([sys.executable,str(r/'native-input.py'),'windows'],encoding='utf-8'))
found=[x for x in windows if x['title']=='Narro' and x['pid']==launch['pid']];assert len(found)==1
width=int(sys.argv[1]);height=int(sys.argv[2]);label=sys.argv[3]
assert 800<=width<=1800 and 700<=height<=1040
h=w.HWND(found[0]['hwnd'])
assert u.SetWindowPos(h,None,0,0,width,height,0x0004|0x0010)
rect=w.RECT();assert u.GetWindowRect(h,c.byref(rect))
data={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'label':label,'hwnd':h.value,'before':found[0],'requested':[0,0,width,height],'actual':[rect.left,rect.top,rect.right,rect.bottom],'scope':'owned Main only; no display/primary/DPI/topology change'}
(r/'observations'/(label+'-placement.json')).write_text(json.dumps(data,indent=2))
print(json.dumps(data))
