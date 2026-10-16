from pathlib import Path
import json,sqlite3,uuid,datetime,subprocess
r=Path(__file__).resolve().parent;ledger=json.loads((r/'profile-protection-private.json').read_text());assert ledger['state']=='OWNED_PROFILE_ACTIVE' and ledger['sessionRoot']==str(r)
roam=Path(next(x for x in ledger['namespaces'] if x['kind']=='Roaming')['active']);assert json.loads((roam/'pa-owned-profile.json').read_text())['sessionRoot']==str(r)
assert not (r/'seeded-done-history.json').exists(),'Never repeat seed'
assert not json.loads(subprocess.check_output(['powershell','-NoLogo','-NoProfile','-Command',"@(Get-Process narro,narro-m7-validation -ErrorAction SilentlyContinue | Select-Object Id) | ConvertTo-Json -Compress"],encoding='utf-8',creationflags=0x08000000) or '[]'),'Seed before app launch only'
c=sqlite3.connect(roam/'narro.db');c.execute('pragma foreign_keys=on');c.execute('BEGIN IMMEDIATE');lid=c.execute("select id from lists where title='PA360 Board'").fetchone()[0];rows=[]
for day in [12,13,14]:
 for i in range(1,8):
  ident=str(uuid.uuid4());stamp=f'2026-10-{day:02d}T12:00:00Z';title=f'PA362 history {day} row {i}'
  c.execute('insert into tasks (id,list_id,title,manual_lane,sort_rank,completed_at,created_at,updated_at) values (?,?,?,?,?,?,?,?)',(ident,lid,title,'today',day*10+i,stamp,stamp,stamp));rows.append({'id':ident,'title':title,'completedAt':stamp,'listId':lid})
assert c.execute('pragma quick_check').fetchone()[0]=='ok';c.commit();c.close()
(r/'seeded-done-history.json').write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ownedOnly':True,'method':'Explicit synthetic SQLite fixture before launch; not evidence of UI create/complete operations','purpose':'B43 date groups/counts/internal scroll visibility; independent of core cross-window task','rows':rows},indent=2),encoding='utf-8');print('OWNED_HISTORY_21_ROWS_SEEDED_NOT_UI_MUTATION_PASS')
