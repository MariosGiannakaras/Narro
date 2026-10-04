from pathlib import Path
import json, hashlib
p = Path(r'E:\SystemFiles\Desktop\NarroUpload\artifacts\m7-ci936-physical-20261004\run-final\actions.jsonl')
b = p.read_bytes()
if b'\x00' not in b:
    rows = [json.loads(line) for line in b.decode('utf-8-sig').splitlines() if line.strip()]
    print(f'Already UTF8: {len(rows)} rows')
else:
    for line in b.split(b'\n'):
        if b'\x00' in line and any(v >= 128 for v in line):
            raise ValueError('Non-ASCII UTF16 segment needs explicit decoding')
    fixed = b.replace(b'\x00', b'')
    rows = [json.loads(line.lstrip('\ufeff')) for line in fixed.decode('utf-8-sig').splitlines() if line.strip()]
    digest = hashlib.sha256(b).hexdigest()
    raw = p.with_name('actions-mixed-encoding-' + digest[:12] + '.bin')
    if raw.exists():
        raise FileExistsError(raw)
    raw.write_bytes(b)
    p.write_text('\n'.join(json.dumps(r, ensure_ascii=False) for r in rows) + '\n', encoding='utf8')
    p.with_name('actions-encoding-repair-' + digest[:12] + '.json').write_text(json.dumps({
        'reason': 'PowerShell 5 Tee-Object appended ASCII JSON as UTF16LE to UTF8. All affected code units verified ASCII; original bytes retained; no action dropped.',
        'rows': len(rows), 'originalSha256': digest,
        'normalizedSha256': hashlib.sha256(p.read_bytes()).hexdigest()
    }, indent=2) + '\n', encoding='utf8')
    print(f'Normalized {len(rows)} rows; raw retained')
