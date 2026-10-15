from pathlib import Path
import json,sqlite3,datetime,uuid,ctypes as c,ctypes.wintypes as w
from zoneinfo import ZoneInfo
r=Path(__file__).parent.resolve();l=json.loads((r/'profile-protection-private.json').read_text());p=json.loads((r/'launch.json').read_text())
assert l['state']=='OWNED_PROFILE_ACTIVE' and l['sessionRoot']==str(r)
u=c.windll.user32;matches=[]
@c.WINFUNCTYPE(w.BOOL,w.HWND,w.LPARAM)
def enum(h,param):
    pid=w.DWORD();u.GetWindowThreadProcessId(h,c.byref(pid));name=c.create_unicode_buffer(64);u.GetWindowTextW(h,name,64)
    if pid.value==p['pid'] and name.value=='Narro':matches.append(int(h))
    return True
u.EnumWindows(enum,0);assert len(matches)==1,matches
db=Path(next(x['active'] for x in l['namespaces'] if x['kind']=='Roaming'))/'narro.db'
assert json.loads((db.parent/'pa-owned-profile.json').read_text())['sessionRoot']==str(r)
d=sqlite3.connect(db);d.row_factory=sqlite3.Row;task=dict(d.execute('select * from tasks limit 1').fetchone())
now=datetime.datetime.now(datetime.timezone.utc);stamp=now.isoformat();due=now.replace(second=0,microsecond=0)+datetime.timedelta(minutes=1);local=due.astimezone(ZoneInfo('Europe/Athens'))
task.update(id=str(uuid.uuid4()),title='PA356 FINAL background controlled',completed_at=None,archived_at=None,created_at=stamp,updated_at=stamp)
rid=str(uuid.uuid4())
with d:
    d.execute('insert into tasks('+','.join(task)+') values('+','.join('?' for _ in task)+')',list(task.values()))
    d.execute('insert into reminders values(?,?,?,?,?,NULL,NULL,?,?)',(rid,task['id'],local.strftime('%Y-%m-%d'),local.strftime('%H:%M'),'Europe/Athens',stamp,stamp))
d.close()
(r/'first-invalid-probe-plan.json').write_bytes((r/'probe-plan.json').read_bytes())
(r/'probe-plan.json').write_text(json.dumps({'setup':'Owned current process, new synthetic reminder, actual future deadline; prior setup attempt invalid because exact-Settings foreground guard failed','probes':[{'condition':'enabled-background','taskId':task['id'],'reminderId':rid,'dueUtc':due.isoformat(),'localTime':local.isoformat()}],'mainHwnd':matches[0]},indent=2))
print(json.dumps({'main':matches[0],'dueUtc':due.isoformat()}))
