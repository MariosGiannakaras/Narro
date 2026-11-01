import csv
import hashlib
import json
import re
import subprocess
import zipfile
from collections import defaultdict
from pathlib import Path

BASE = Path('work-log/evidence-cleanup-review-20261101')
BASELINE = '4fcd2fe084ecdc7b66cad5671da54d63e71aabe3'
tracker = Path('docs/TEMP_EVIDENCE_DELETION_PROGRESS.md').read_text(encoding='utf-8')
table = tracker.split('## Batch 2', 1)[1]
families = set(re.findall(r'^\| `([^`]+)` \| [\d,]+ \| [\d,]+ \| BLOCKED / NOT REMOVED \|', table, re.M))
if len(families) != 27:
    raise ValueError('unexpected batch 2 family count: ' + str(len(families)))
with (BASE / 'paths.csv').open(encoding='utf-8', newline='') as handle:
    paths = list(csv.DictReader(handle))
candidate_paths = [r for r in paths if len(r['path'].split('/')) > 3 and r['path'].split('/')[2] in families]
if len(candidate_paths) != 4065:
    raise ValueError('unexpected path count: ' + str(len(candidate_paths)))

tree = subprocess.check_output(['git', 'ls-tree', '-r', '-l', '-z', BASELINE])
tracked = defaultdict(list)
for entry in tree.split(b'\0'):
    if not entry:
        continue
    metadata, name = entry.split(b'\t', 1)
    mode, kind, blob, size = metadata.decode().split()
    if kind == 'blob':
        tracked[blob].append(name.decode('utf-8', 'surrogateescape'))

results = []
for row in candidate_paths:
    if not row['path'].lower().endswith('.zip'):
        continue
    path = Path(row['path'])
    archive = {'path': row['path'], 'bytes': int(row['size']), 'git_blob': row['sha'], 'direct_markdown_refs': row['direct_markdown_refs'], 'members': [], 'classification': 'REVIEW_REQUIRED'}
    data_hash = hashlib.sha1(b'blob ' + str(path.stat().st_size).encode() + b'\0')
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            data_hash.update(chunk)
    if data_hash.hexdigest() != row['sha'] or path.stat().st_size != int(row['size']):
        raise ValueError('archive blob mismatch: ' + row['path'])
    try:
        with zipfile.ZipFile(path) as z:
            for info in z.infolist():
                if info.is_dir():
                    continue
                member = {'name': info.filename, 'bytes': info.file_size, 'crc32': f'{info.CRC:08x}'}
                if info.file_size > 512 * 1024 * 1024 or info.flag_bits & 1:
                    member['status'] = 'NOT_READ_LIMIT_OR_ENCRYPTED'
                else:
                    h = hashlib.sha1(b'blob ' + str(info.file_size).encode() + b'\0')
                    with z.open(info) as stream:
                        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
                            h.update(chunk)
                    member['git_blob'] = h.hexdigest()
                    member['matching_tracked_paths'] = tracked.get(h.hexdigest(), [])
                    member['status'] = 'MATCHED_TRACKED_BLOB' if member['matching_tracked_paths'] else 'NO_TRACKED_BLOB_MATCH'
                archive['members'].append(member)
    except (zipfile.BadZipFile, RuntimeError, OSError, NotImplementedError) as exc:
        archive['error'] = str(exc)
    if archive['members'] and all(m['status'] == 'MATCHED_TRACKED_BLOB' for m in archive['members']) and 'error' not in archive:
        archive['classification'] = 'ALL_MEMBERS_MATCH_TRACKED_REVIEW_CONTAINER_AND_CONSUMERS'
    results.append(archive)

output = {'baseline': BASELINE, 'scope': 'ZIP files inside 27 previously listed legacy evidence families', 'family_count': len(families), 'family_paths': len(candidate_paths), 'zip_count': len(results), 'limits': 'ZIP content matching is not permission to delete; container bytes, ordering, duplicate names, metadata, provenance, consumers, historical source and retained paths require review. No other files, Blitzit originals or current artifacts are affected.', 'archives': results}
(BASE / 'legacy-zip-content-review.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'families': len(families), 'paths': len(candidate_paths), 'zips': len(results), 'members': sum(len(x['members']) for x in results), 'all_members_match': sum(x['classification'].startswith('ALL_MEMBERS') for x in results), 'errors': sum('error' in x for x in results)}))
