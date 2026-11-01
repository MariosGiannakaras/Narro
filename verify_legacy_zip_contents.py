import collections
import json
from pathlib import Path

p = Path('work-log/evidence-cleanup-review-20261101/legacy-zip-content-review.json')
d = json.loads(p.read_text(encoding='utf-8'))
archives = d['archives']
assert d['family_count'] == 27 and d['family_paths'] == 4065 and d['zip_count'] == len(archives) == 32
assert len({a['path'] for a in archives}) == len(archives)
assert all(a['path'].endswith('.zip') and 'error' not in a for a in archives)
members = [m for a in archives for m in a['members']]
statuses = collections.Counter(m['status'] for m in members)
classes = collections.Counter(a['classification'] for a in archives)
assert len(members) == 2399
assert classes['ALL_MEMBERS_MATCH_TRACKED_REVIEW_CONTAINER_AND_CONSUMERS'] == 10
for a in archives:
    if a['classification'].startswith('ALL_MEMBERS'):
        assert a['members'] and all(m['matching_tracked_paths'] for m in a['members'])
print(json.dumps({'archives': len(archives), 'members': len(members), 'member_statuses': dict(statuses), 'archive_classes': dict(classes)}))
