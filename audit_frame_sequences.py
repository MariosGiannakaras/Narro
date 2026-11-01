import collections
import csv
import hashlib
import json
import re
from pathlib import Path

BASE = Path('work-log/evidence-cleanup-review-20261101')
ACTIVE_PREFIXES = ('pr389-', 'pr419-', 'pr437-', 'physical-native-final-', 'physical-residual-', 'physical-ab-')
with (BASE / 'paths.csv').open(encoding='utf-8', newline='') as handle:
    rows = list(csv.DictReader(handle))
groups = collections.defaultdict(list)
for row in rows:
    path = Path(row['path'])
    match = re.fullmatch(r'frame-(\d+)\.png', path.name, re.I)
    if not match or '/m7-ci936-20261004/live-motion/' in row['path']:
        continue
    family = row['path'].split('/')[2]
    content = path.read_bytes()
    sha = hashlib.sha1(b'blob ' + str(len(content)).encode() + b'\0' + content).hexdigest()
    if sha != row['sha'] or len(content) != int(row['size']):
        raise ValueError('mismatch: ' + row['path'])
    groups[path.parent.as_posix()].append({'path': row['path'], 'ordinal': int(match.group(1)), 'git_blob': sha, 'bytes': len(content), 'direct_markdown_refs': row['direct_markdown_refs'], 'family': family})

summaries = []
for name, items in sorted(groups.items()):
    items.sort(key=lambda item: item['ordinal'])
    by_blob = collections.defaultdict(list)
    for item in items:
        by_blob[item['git_blob']].append(item)
    protected = items[0]['family'].startswith(ACTIVE_PREFIXES)
    ordinals = [i['ordinal'] for i in items]
    contiguous = ordinals == list(range(min(ordinals), max(ordinals) + 1))
    keep = {x['path'] for x in items if x['ordinal'] <= min(ordinals) + 29 or x['ordinal'] >= max(ordinals) - 4 or x['ordinal'] % 10 == 0 or x['direct_markdown_refs']}
    for group in by_blob.values():
        keep.add(group[0]['path'])
    for item in items:
        if protected or not contiguous:
            item['status'] = 'HOLD_ACTIVE_OR_SPARSE_SEQUENCE'
        elif item['path'] in keep:
            item['status'] = 'RETAIN_SAMPLE_PROPOSED'
        else:
            item['status'] = 'DUPLICATE_REVIEW_CANDIDATE'
            item['same_directory_retained_path'] = next(x['path'] for x in by_blob[item['git_blob']] if x['path'] in keep)
    summaries.append({'directory': name, 'family': items[0]['family'], 'frames': len(items), 'first': min(ordinals), 'last': max(ordinals), 'contiguous': contiguous, 'active_prefix_hold': protected, 'distinct_blobs': len(by_blob), 'entries': items})
counts = collections.Counter(item['status'] for group in summaries for item in group['entries'])
out = {'baseline': '4fcd2fe084ecdc7b66cad5671da54d63e71aabe3', 'scope': 'Tracked frame-NNN.png paths, excluding CI936 live sequences already audited', 'limits': 'Byte and ordinal checks only; all candidates need provenance, source-recovery, full consumer and timeline review. No deletion authorized. Active-prefix checks are not an exhaustive active gate audit.', 'groups': summaries}
(BASE / 'frame-sequence-index.json').write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'groups': len(summaries), 'paths': sum(g['frames'] for g in summaries), 'families': len({g['family'] for g in summaries}), 'counts': dict(counts)}))
