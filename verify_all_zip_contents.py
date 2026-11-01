import collections
import csv
import json
from pathlib import Path

base = Path('work-log/evidence-cleanup-review-20261101')
previous = json.loads((base / 'legacy-zip-content-review.json').read_text(encoding='utf-8'))
current = json.loads((base / 'remaining-zip-content-review.json').read_text(encoding='utf-8'))
with (base / 'paths.csv').open(encoding='utf-8', newline='') as f:
    expected = {r['path'] for r in csv.DictReader(f) if r['path'].lower().endswith('.zip')}
old = {a['path'] for a in previous['archives']}
new = {a['path'] for a in current['archives']}
assert len(old) == 32 and len(new) == 71 and not old.intersection(new)
assert old.union(new) == expected and len(expected) == 103
assert all('error' not in a for a in current['archives'])
members = [m for a in current['archives'] for m in a['members']]
counts = collections.Counter(m['status'] for m in members)
print(json.dumps({'all_evidence_zips': len(expected), 'previous': len(old), 'new': len(new), 'new_members': len(members), 'new_member_statuses': dict(counts), 'new_all_matched_archives': sum(a['classification'].startswith('ALL_MEMBERS') for a in current['archives'])}))
