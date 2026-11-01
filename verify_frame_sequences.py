import collections
import json
from pathlib import Path

base = Path('work-log/evidence-cleanup-review-20261101')
d = json.loads((base / 'frame-sequence-index.json').read_text(encoding='utf-8'))
other = json.loads((base / 'ci936-live-frame-review.json').read_text(encoding='utf-8'))
items = [e for group in d['groups'] for e in group['entries']]
paths = {e['path'] for e in items}
assert len(paths) == len(items) == 1005
assert paths.isdisjoint({e['path'] for g in other['sequences'] for e in g['entries']})
assert len(d['groups']) == 28
counts = collections.Counter(e['status'] for e in items)
assert counts == {'RETAIN_SAMPLE_PROPOSED': 259, 'HOLD_ACTIVE_OR_SPARSE_SEQUENCE': 746}
for group in d['groups']:
    assert len(group['entries']) == group['frames']
    for entry in group['entries']:
        if entry['status'] == 'DUPLICATE_REVIEW_CANDIDATE':
            assert any(other['path'] == entry['same_directory_retained_path'] and other['git_blob'] == entry['git_blob'] and other['status'] == 'RETAIN_SAMPLE_PROPOSED' for other in group['entries'])
print('PASS: 1005 unique paths, group counts, disjointness, dispositions')
