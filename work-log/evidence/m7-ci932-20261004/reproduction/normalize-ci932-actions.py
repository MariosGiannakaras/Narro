from pathlib import Path
import json,hashlib
p=Path('artifacts/m7-ci932-physical-20261004/run-final/actions.jsonl')
b=p.read_bytes()
if b'\x00' not in b:raise SystemExit('Already normalized')
for line in b.split(b'\n'):
 if b'\x00' in line and any(v>=128 for v in line):raise ValueError('Non-ASCII UTF16 segment needs explicit decoder')
fixed=b.replace(b'\x00',b'')
rows=[json.loads(line.lstrip('\ufeff')) for line in fixed.decode('utf-8-sig').splitlines() if line.strip()]
raw=p.with_name('actions-mixed-encoding-'+hashlib.sha256(b).hexdigest()[:12]+'.bin')
if raw.exists():raise FileExistsError(raw)
raw.write_bytes(b)
p.write_text('\n'.join(json.dumps(r,ensure_ascii=False) for r in rows)+'\n',encoding='utf8')
p.with_name('actions-encoding-repair-'+hashlib.sha256(b).hexdigest()[:12]+'.json').write_text(json.dumps({'reason':'Windows PowerShell 5 Tee-Object appended ASCII JSON as UTF16LE to existing UTF8; all affected code units verified ASCII. Raw original retained; NUL-byte removal restored parseable exact JSON data. No action dropped.','rows':len(rows),'originalSha256':hashlib.sha256(b).hexdigest(),'normalizedSha256':hashlib.sha256(p.read_bytes()).hexdigest()},indent=2)+'\n')
print(len(rows))
