import csv
import hashlib
import json
import re
from pathlib import Path

BASE = Path('work-log/evidence-cleanup-review-20261101')
PREFIX = 'work-log/evidence/'
groups = {
    'pa01-08-20261013': ('recording/continuous.mkv.part', 'docs/WINDOWS_PA01_08_REPORT_2026-10-13.md'),
    'ci1046-physical-20261008': ('Narro-M7-Logs/', 'work-log/2026-10-08-codex-ci1046-physical-publication.md'),
    'pa351-native-20261014': ('obs-active-part', 'docs/WINDOWS_PA351_NATIVE_REPORT_2026-10-14.md'),
    'pa354-native-20261014': ('pa354-reports', 'docs/WINDOWS_PA354_NATIVE_REPORT_2026-10-14.md'),
    'pa355-native-20261015': ('pa355-native.mkv.part', 'docs/WINDOWS_PA355_NATIVE_REPORT_2026-10-15.md'),
    'pr362-native-20261016': ('video/2026-10-16 14-55-36.mkv', 'work-log/2026-10-16-pr362-native-cross-window-acceptance.md'),
    'm5-remaining-native-20261017': ('video/segment2-complete.mkv', 'work-log/evidence/m5-remaining-native-20261017/README.md'),
}
records = []
with (BASE / 'paths.csv').open(encoding='utf-8', newline='') as handle:
    for row in csv.DictReader(handle):
        path = row['path']
        if not path.startswith(PREFIX):
            continue
        relative = path[len(PREFIX):]
        family, separator, tail = relative.partition('/')
        if not separator or family not in groups:
            continue
        start, source = groups[family]
        if not tail.startswith(start):
            continue
        if family == 'ci1046-physical-20261008' and not tail.endswith('.mkv'):
            continue
        if family in ('pa01-08-20261013', 'pa351-native-20261014', 'pa354-native-20261014', 'pa355-native-20261015') and not re.search(r'\.mkv\.part\d+$', tail):
            continue
        local = Path(path)
        hasher = hashlib.sha256()
        with local.open('rb') as media:
            for chunk in iter(lambda: media.read(1024 * 1024), b''):
                hasher.update(chunk)
        actual_size = local.stat().st_size
        if actual_size != int(row['size']):
            raise ValueError('size mismatch: ' + path)
        records.append({'path': path, 'git_blob': row['sha'], 'bytes': actual_size, 'sha256': hasher.hexdigest(), 'decision': 'RETAIN_FOR_NOW', 'reason': 'Published original native recording or required part; observed consumer cites the session; replacement/retirement not established.', 'source': source})

expected = {'pa01-08-20261013': 5, 'ci1046-physical-20261008': 9, 'pa351-native-20261014': 7, 'pa354-native-20261014': 6, 'pa355-native-20261015': 4, 'pr362-native-20261016': 1, 'm5-remaining-native-20261017': 1}
for family, count in expected.items():
    found = sum('/' + family + '/' in r['path'] for r in records)
    if found != count:
        raise ValueError(f'{family}: expected {count}, got {found}')

pa351 = json.loads(Path('work-log/evidence/pa351-native-20261014/video-reassembly-manifest.json').read_text(encoding='utf-8'))
parts = {x['file']: x['sha256'] for recording in pa351['recordings'].values() for x in recording['parts']}
for r in records:
    if '/pa351-native-20261014/' in r['path']:
        expected_sha = parts[Path(r['path']).name]
        if r['sha256'] != expected_sha:
            raise ValueError('PA351 manifest SHA mismatch: ' + r['path'])
        r['sha256_matches_session_manifest'] = True

pa01 = json.loads(Path('work-log/evidence/pa01-08-20261013/recording/recording-manifest.json').read_text(encoding='utf-8'))
pa01_parts = {x['file']: x['sha256'] for x in pa01['parts']}
ci1046 = json.loads(Path('work-log/evidence/ci1046-physical-20261008/file-manifest.json').read_text(encoding='utf-8'))
ci1046_files = {x['path']: x['sha256'] for x in ci1046['files']}
for r in records:
    if '/pa01-08-20261013/' in r['path']:
        expected_sha = pa01_parts[Path(r['path']).name]
    elif '/ci1046-physical-20261008/' in r['path']:
        expected_sha = ci1046_files[r['path'].split('/ci1046-physical-20261008/', 1)[1]]
    else:
        continue
    if r['sha256'] != expected_sha:
        raise ValueError('session manifest SHA mismatch: ' + r['path'])
    r['sha256_matches_session_manifest'] = True

out = {'baseline': '4fcd2fe084ecdc7b66cad5671da54d63e71aabe3', 'scope': 'seven sessions, original full recordings and split parts only', 'record_count': len(records), 'total_bytes': sum(r['bytes'] for r in records), 'records': records}
(BASE / 'original-recording-retention.json').write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'records': len(records), 'bytes': out['total_bytes'], 'session_manifest_sha_verified': 21, 'all': 'RETAIN_FOR_NOW'}))
