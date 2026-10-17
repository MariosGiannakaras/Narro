from pathlib import Path
import sqlite3,json,hashlib,datetime,sys
r=Path(__file__).resolve().parent;ledger=json.loads((r/'profile-protection-private.json').read_text(encoding='utf-8-sig'))
assert ledger['state']=='OWNED_PROFILE_ACTIVE' and ledger['sessionRoot']==str(r)
roam=Path(next(x for x in ledger['namespaces'] if x['kind']=='Roaming')['active'])
assert json.loads((roam/'pa-owned-profile.json').read_text())['sessionRoot']==str(r)
db=sqlite3.connect((roam/'narro.db').as_uri()+'?mode=ro',uri=True);db.row_factory=sqlite3.Row;db.execute('BEGIN')
data={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'label':sys.argv[1],
'tasks':[dict(x) for x in db.execute('SELECT * FROM tasks ORDER BY list_id,manual_lane,sort_rank')],
'lists':[dict(x) for x in db.execute('SELECT * FROM lists ORDER BY sort_rank')],
'sessions':[dict(x) for x in db.execute('SELECT * FROM sessions')],
'notes':[{'task_id':x['task_id'],'contentSha256':hashlib.sha256(x['content'].encode()).hexdigest()} for x in db.execute('SELECT task_id,content FROM task_notes')],
'subtasks':[dict(x) for x in db.execute('SELECT * FROM subtasks ORDER BY task_id,sort_rank')],
'recurrenceRules':[dict(x) for x in db.execute('SELECT * FROM recurrence_rules')],
'quickCheck':db.execute('PRAGMA quick_check').fetchone()[0]}
db.close();assert data['quickCheck']=='ok'
(r/'observations'/(sys.argv[1]+'-owned-db.json')).write_text(json.dumps(data,indent=2),encoding='utf-8')
print(json.dumps({'label':data['label'],'tasks':len(data['tasks']),'sessions':len(data['sessions']),'quickCheck':data['quickCheck']}))
