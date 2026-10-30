"""Analysis only. Real production schema/SQL, isolated in-memory SQLite.
No Narro process, profile, production connection or repository source mutation.
This proves the SQL postcondition; Rust/UI consequences are source-traced.
"""
from pathlib import Path
import sqlite3,uuid,re,json,hashlib,subprocess

repo=Path(r'C:\Users\MariosG\.codex\worktrees\pr437-semantic-transition\NarroUpload')
out=Path(__file__).parent
meta=(repo/'src-tauri/src/persistence/task_metadata.rs').read_text(encoding='utf-8')
sessions=(repo/'src-tauri/src/persistence/sessions.rs').read_text(encoding='utf-8')
def statement(source, function, prefix):
    start=source.index('fn '+function+'(')
    text=source[start:]
    matches=re.finditer(r'"([^"\\]*(?:\\.[^"\\]*)*)"',text)
    return next(m.group(1) for m in matches if m.group(1).startswith(prefix))
sql={
 'sum':statement(meta,'persisted_work_seconds','SELECT COALESCE(SUM(duration_seconds), 0)'),
 'rebase':statement(meta,'set_task_time_taken_in_transaction','UPDATE tasks'),
 'create':statement(sessions,'create_manual_work_session','INSERT INTO sessions'),
 'edit':statement(sessions,'edit_closed_session_if_expected','UPDATE sessions'),
 'delete':statement(sessions,'delete_closed_session_if_expected','DELETE FROM sessions'),
}
records=[]
for desired in [5,90,100]:
 for mutation in ['edit','delete']:
    db=sqlite3.connect(':memory:');db.execute('PRAGMA foreign_keys=ON')
    for migration in sorted((repo/'src-tauri/migrations').glob('*.sql')):
        db.executescript(migration.read_text(encoding='utf-8'))
    lid,tid,sid=(str(uuid.uuid4()) for _ in range(3))
    t0='2026-10-30T08:00:00Z';t1='2026-10-30T08:01:00Z';t2='2026-10-30T08:02:00Z'
    db.execute('INSERT INTO lists(id,title,sort_rank,created_at,updated_at) VALUES(?,?,0,?,?)',(lid,'Audit synthetic',t0,t0))
    db.execute("INSERT INTO tasks(id,list_id,title,manual_lane,sort_rank,created_at,updated_at) VALUES(?,?,?,'today',0,?,?)",(tid,lid,'Read-only audit fixture',t0,t0))
    db.execute(sql['create'],(sid,tid,'2026-10-30T07:58:00Z',t0,90,t0));db.commit()
    persisted=db.execute(sql['sum'],(tid,)).fetchone()[0]
    # Exact documented signed-adjustment rule in the Rust service; only its
    # production SQL is executed here, not a replacement implementation claim.
    adjustment=desired-persisted
    db.execute(sql['rebase'],(adjustment,t1,tid));db.commit()
    before=db.execute(sql['sum'],(tid,)).fetchone()[0]+adjustment
    assert before==desired
    if mutation=='edit':
        affected=db.execute(sql['edit'],('2026-10-30T07:58:00Z',t0,1,t2,sid,t0)).rowcount
    else:affected=db.execute(sql['delete'],(sid,t0)).rowcount
    db.commit();assert affected==1
    stored=db.execute('SELECT manual_time_adjustment_seconds FROM tasks WHERE id=?',(tid,)).fetchone()[0]
    after_work=db.execute(sql['sum'],(tid,)).fetchone()[0]
    total=after_work+stored
    assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
    records.append({'manualDesired':desired,'mutation':mutation,'beforeEffective':before,'persistedAfter':after_work,'adjustmentAfter':stored,'afterEffective':total,'committedRows':affected,'nonnegativeInvariantPass':total>=0})
    db.close()
assert [r['afterEffective'] for r in records[:2]]==[-84,-85]
record={'source':subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD'],text=True).strip(),'schema':'all11 actual migrations','sqliteVersion':sqlite3.sqlite_version,'method':'actual extracted production SQL; Rust reader/error/board consequences established by source, not Rust execution or physical observation','sql':sql,'cases':records,'findingCases':2,'controlCases':4,'sourceHashes':{str(p.relative_to(repo)):hashlib.sha256(p.read_bytes()).hexdigest() for p in [repo/'src-tauri/src/persistence/task_metadata.rs',repo/'src-tauri/src/persistence/sessions.rs']}}
(out/'history-underflow-result.json').write_text(json.dumps(record,indent=2),encoding='utf-8',newline='\n')
print(json.dumps({'source':record['source'],'findingCases':records[:2],'controlCasesPass':all(r['nonnegativeInvariantPass'] for r in records[2:])}))
