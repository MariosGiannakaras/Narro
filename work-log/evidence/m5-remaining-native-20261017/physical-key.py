import ctypes as c,ctypes.wintypes as w,sys,time,json,datetime,pathlib
r=pathlib.Path(__file__).parent;u=c.windll.user32;u.GetForegroundWindow.restype=w.HWND
h=int(sys.argv[1]);vk=int(sys.argv[2],0)
assert int(u.GetForegroundWindow())==h
assert json.loads((r/'profile-protection-private.json').read_text())['state']=='OWNED_PROFILE_ACTIVE'
class KI(c.Structure):_fields_=[('vk',w.WORD),('scan',w.WORD),('flags',w.DWORD),('time',w.DWORD),('extra',c.c_size_t)]
class MI(c.Structure):_fields_=[('x',w.LONG),('y',w.LONG),('data',w.DWORD),('flags',w.DWORD),('time',w.DWORD),('extra',c.c_size_t)]
class UN(c.Union):_fields_=[('ki',KI),('mi',MI)]
class INPUT(c.Structure):_fields_=[('type',w.DWORD),('data',UN)]
extended=1 if vk in (0x21,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x2d,0x2e) else 0
scan=u.MapVirtualKeyW(vk,0)&0xff
for flags in (8|extended,8|extended|2):
    item=INPUT(1,UN(ki=KI(0,scan,flags,0,0)));assert u.SendInput(1,c.byref(item),c.sizeof(item))==1
    time.sleep(.08)
data={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'action':'held SendInput physical scancode','hwnd':h,'vk':vk,'scan':scan,'extended':bool(extended)}
with (r/'actions.jsonl').open('a',encoding='utf8') as f:f.write(json.dumps(data)+'\n')
print(json.dumps(data))
