import collections
import json
from pathlib import Path

base = Path('work-log/evidence-cleanup-review-20261101')
review = json.loads((base / 'matched-zip-consumer-review.json').read_text(encoding='utf-8'))
prior = [json.loads((base / name).read_text(encoding='utf-8')) for name in ('legacy-zip-content-review.json', 'remaining-zip-content-review.json')]
expected = {a['path'] for p in prior for a in p['archives'] if a['classification'].startswith('ALL_MEMBERS')}
archives = review['archives']
assert len(archives) == len(expected) == 21
assert {a['path'] for a in archives} == expected
assert sum(a['member_count'] == a['members_with_same_family_suffix_matches'] for a in archives) == 20
assert not any(a['same_zip_blob_other_paths'] for a in archives)
assert collections.Counter(a['decision'] for a in archives) == {'REVIEW_CONSUMERS_AND_CONTAINER': 14, 'HOLD_CURRENT_NATIVE_RAW_ARCHIVE': 6, 'HOLD_SURVIVING_REFERENCED_COPY': 1}
assert all(len(a['members']) == a['member_count'] for a in archives)
print('PASS: 21 matched archives reconciled; 20 same-family suffix coverage; 7 explicit holds')
