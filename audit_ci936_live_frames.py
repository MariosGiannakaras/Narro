import collections
import csv
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path('work-log/evidence/m7-ci936-20261004')
OUT = Path('work-log/evidence-cleanup-review-20261101/ci936-live-frame-review.json')
provenance = json.loads((ROOT / 'video-provenance.json').read_text(encoding='utf-8'))[0]
current_paths = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', '4fcd2fe084ecdc7b66cad5671da54d63e71aabe3', '--', (ROOT / 'raw-video/recording-1').as_posix()])
if current_paths:
    raise ValueError('source exists at frozen baseline; reevaluate current-main claim')
total_hash = hashlib.sha256()
total_bytes = 0
for part in provenance['parts']:
    h = hashlib.sha256()
    part_path = ROOT / part['file']
    process = subprocess.Popen(['git', 'cat-file', 'blob', '6bef54f79c9d1a0015afabc8e050cc93b40c8584:' + part_path.as_posix()], stdout=subprocess.PIPE)
    part_bytes = 0
    for chunk in iter(lambda: process.stdout.read(1024 * 1024), b''):
        h.update(chunk)
        total_hash.update(chunk)
        total_bytes += len(chunk)
        part_bytes += len(chunk)
    process.stdout.close()
    if process.wait() or h.hexdigest() != part['sha256'] or part_bytes != part['bytes']:
        raise ValueError('source part mismatch: ' + str(part_path))
if total_hash.hexdigest() != provenance['originalSha256'] or total_bytes != provenance['originalBytes']:
    raise ValueError('reassembled source hash mismatch')

with Path('work-log/evidence-cleanup-review-20261101/paths.csv').open(encoding='utf-8', newline='') as handle:
    indexed = {row['path']: row for row in csv.DictReader(handle)}

sequences = []
for name in ('100-normal-collapse-1', '100-normal-collapse-2'):
    directory = ROOT / 'live-motion' / name
    metadata = json.loads((directory / 'provenance.json').read_text(encoding='utf-8'))
    files = sorted(directory.glob('frame-*.png'))
    entries = []
    for path in files:
        ordinal = int(re.search(r'frame-(\d+)\.png$', path.name).group(1))
        content = path.read_bytes()
        git_sha = hashlib.sha1(b'blob ' + str(len(content)).encode() + b'\0' + content).hexdigest()
        row = indexed[path.as_posix()]
        if git_sha != row['sha'] or len(content) != int(row['size']):
            raise ValueError('frame content mismatch: ' + str(path))
        entries.append({'path': path.as_posix(), 'ordinal': ordinal, 'git_blob': git_sha, 'bytes': len(content), 'direct_markdown_refs': row['direct_markdown_refs']})
    if not entries or [x['ordinal'] for x in entries] != list(range(1, len(entries) + 1)):
        raise ValueError('frame sequence incomplete: ' + name)
    if len(entries) != metadata['frames']:
        raise ValueError('frame count differs from provenance: ' + name)
    by_sha = collections.defaultdict(list)
    for item in entries:
        by_sha[item['git_blob']].append(item)
    keep = {x['path'] for x in entries if x['ordinal'] <= 30 or x['ordinal'] > len(entries) - 5 or x['ordinal'] % 10 == 0 or x['direct_markdown_refs']}
    for group in by_sha.values():
        keep.add(group[0]['path'])
    for item in entries:
        item['disposition'] = 'RETAIN_SAMPLE' if item['path'] in keep else 'DUPLICATE_REVIEW_CANDIDATE'
        if item['path'] not in keep:
            retained = [x['path'] for x in by_sha[item['git_blob']] if x['path'] in keep]
            if not retained:
                raise AssertionError('duplicate lacks retained same-sequence copy')
            item['same_blob_retained_path'] = retained[0]
    sequences.append({'sequence': name, 'declared_frames': metadata['frames'], 'tracked_frames': len(entries), 'provenance_reviewed': metadata['reviewed'], 'distinct_git_blobs': len(by_sha), 'entries': entries})

result = {'inventory_baseline': '4fcd2fe084ecdc7b66cad5671da54d63e71aabe3', 'source_recovery_commit': '6bef54f79c9d1a0015afabc8e050cc93b40c8584', 'source_current_main': 'ABSENT', 'source_original_sha256': total_hash.hexdigest(), 'source_bytes': total_bytes, 'source_parts_verified': len(provenance['parts']), 'status': 'AUDIT_ONLY_NO_DELETION', 'limitation': 'Duplicate candidates require consumer, source timeline, complete path and policy review before any deletion. Provenance marks source frames unreviewed. Source is available in historical Git, not current main. No physical verdict is inferred.', 'sequences': sequences}
OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'source_parts_verified': len(provenance['parts']), 'source_bytes': total_bytes, 'sequences': [{'name': s['sequence'], 'tracked': s['tracked_frames'], 'declared': s['declared_frames'], 'distinct': s['distinct_git_blobs'], 'retained': sum(e['disposition'] == 'RETAIN_SAMPLE' for e in s['entries']), 'candidate': sum(e['disposition'] == 'DUPLICATE_REVIEW_CANDIDATE' for e in s['entries'])} for s in sequences]}))
