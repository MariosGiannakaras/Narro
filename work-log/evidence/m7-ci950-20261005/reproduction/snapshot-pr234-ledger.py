import datetime, json, os, pathlib, sqlite3, sys

db = pathlib.Path(os.environ['APPDATA']) / 'com.mariosg.Narro/narro.db'
c = sqlite3.connect(db.as_uri() + '?mode=ro', uri=True)
c.row_factory = sqlite3.Row
tasks = []
for row in c.execute("SELECT id,title,manual_lane,sort_rank,manual_time_adjustment_seconds,completed_at FROM tasks WHERE title LIKE 'M7 PR234%' OR title LIKE 'M7 PR233%' OR title LIKE 'M7 CI944%' OR title LIKE 'M7 CI942%' OR title='M7 C5 CI873 validation'"):
    task = dict(row)
    sessions = [dict(r) for r in c.execute('SELECT id,kind,started_at,ended_at,duration_seconds,source FROM sessions WHERE task_id=? ORDER BY started_at', (task['id'],))]
    note = c.execute('SELECT editor_format_version,content,updated_at FROM task_notes WHERE task_id=?', (task['id'],)).fetchone()
    tasks.append(dict(task=task, sessions=sessions, note=dict(note) if note else None,
                      closedWorkSeconds=sum(s['duration_seconds'] for s in sessions if s['kind']=='work') + task['manual_time_adjustment_seconds']))
p = c.execute('SELECT payload_json,updated_at FROM preferences WHERE id=1').fetchone()
checkpoint = c.execute('SELECT session_id,payload_json,updated_at FROM timer_runtime_checkpoint').fetchone()
result = dict(utc=datetime.datetime.now(datetime.timezone.utc).isoformat(), readOnly=True, tasks=tasks,
              preferences=dict(payload=json.loads(p['payload_json']), updatedAt=p['updated_at']),
              checkpoint=dict(checkpoint) if checkpoint else None)
c.close()
pathlib.Path(sys.argv[1]).write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf8')
print(json.dumps(dict(utc=result['utc'], tasks=[(t['task']['title'],t['closedWorkSeconds'],t['task']['completed_at']) for t in tasks],
                     checkpoint=result['checkpoint']), ensure_ascii=False))
