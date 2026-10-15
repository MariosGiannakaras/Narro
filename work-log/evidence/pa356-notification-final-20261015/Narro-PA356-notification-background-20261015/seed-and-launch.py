from pathlib import Path
import json, sqlite3, datetime, uuid, subprocess, sys
from zoneinfo import ZoneInfo
r=Path(__file__).parent.resolve()
subprocess.run([sys.executable,str(r/'assert-launch-safe.py')],check=True)
ledger=json.loads((r/'profile-protection-private.json').read_text())
db=Path(next(x['active'] for x in ledger['namespaces'] if x['kind']=='Roaming'))/'narro.db'
d=sqlite3.connect(db);d.row_factory=sqlite3.Row
base=dict(d.execute('select * from tasks limit 1').fetchone())
now=datetime.datetime.now(datetime.timezone.utc);stamp=now.isoformat()
first=now.replace(second=0,microsecond=0)+datetime.timedelta(minutes=1)
probes=[]
with d:
    d.execute('update reminders set dismissed_at=?,updated_at=? where fired_at is null and dismissed_at is null',(stamp,stamp))
    for i,condition in enumerate(['enabled-background']):
        due=first+datetime.timedelta(minutes=i)
        local=due.astimezone(ZoneInfo('Europe/Athens'))
        task=dict(base);task.update(id=str(uuid.uuid4()),title='PA356 FINAL '+condition,completed_at=None,archived_at=None,
            manual_lane='backlog',sort_rank=100+i,est_seconds=None,manual_time_adjustment_seconds=0,
            schedule_kind='none',scheduled_local_date=None,scheduled_local_time=None,schedule_timezone=None,
            recurrence_rule_id=None,recurrence_parent_task_id=None,created_at=stamp,updated_at=stamp)
        d.execute('insert into tasks('+','.join(task)+') values('+','.join('?' for _ in task)+')',list(task.values()))
        rid=str(uuid.uuid4());d.execute('insert into reminders values(?,?,?,?,?,NULL,NULL,?,?)',
            (rid,task['id'],local.strftime('%Y-%m-%d'),local.strftime('%H:%M'),'Europe/Athens',stamp,stamp))
        probes.append({'condition':condition,'taskId':task['id'],'reminderId':rid,'dueUtc':due.isoformat(),'localTime':local.isoformat()})
assert d.execute('pragma quick_check').fetchone()[0]=='ok';d.close()
(r/'probe-plan.json').write_text(json.dumps({'setup':'Synthetic owned task/reminder rows only; unmodified native runtime uses real wall/monotonic time; no delivery or clock simulation','probes':probes},indent=2),encoding='utf8')
m=json.loads((r/'session-meta.json').read_text());p=subprocess.Popen([m['executable']])
launch={'pid':p.pid,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'executable':m['executable'],'sha256':m['sha256']}
(r/'launch.json').write_text(json.dumps(launch,indent=2),encoding='utf8')
print(json.dumps({'launch':launch,'probes':probes}))
