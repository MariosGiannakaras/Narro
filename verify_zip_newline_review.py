import collections
import json
from pathlib import Path

base = Path('work-log/evidence-cleanup-review-20261101')
review = json.loads((base / 'zip-newline-review.json').read_text(encoding='utf-8'))
entries = review['entries']
prior = [json.loads((base / n).read_text(encoding='utf-8')) for n in ('legacy-zip-content-review.json', 'remaining-zip-content-review.json')]
unmatched = {(a['path'], i, m['name']) for doc in prior for a in doc['archives'] for i, m in enumerate(a['members']) if m['status'] == 'NO_TRACKED_BLOB_MATCH'}
actual = {(e['archive'], e['member_index'], e['name']) for e in entries}
assert len(actual) == len(entries) == len(unmatched) == 11103 and actual == unmatched
counts = collections.Counter(e['status'] for e in entries)
assert dict(counts) == review['counts']
assert all(e.get('normalized_matching_paths') for e in entries if e['status'] == 'CRLF_NORMALIZED_MATCH')
print(json.dumps({'member_coverage': len(entries), 'statuses': dict(counts), 'archives_with_normalized_matches': len({e['archive'] for e in entries if e['status'] == 'CRLF_NORMALIZED_MATCH'})}))
