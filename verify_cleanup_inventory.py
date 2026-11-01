import csv
import json
from pathlib import Path

p = Path('work-log/evidence-cleanup-review-20261101')
data = json.loads((p / 'inventory.json').read_text(encoding='utf-8'))
with (p / 'paths.csv').open(encoding='utf-8', newline='') as f:
    rows = list(csv.DictReader(f))
assert len(rows) == data['evidence_files']
assert sum(int(row['size']) for row in rows) == data['evidence_bytes']
assert len({row['path'] for row in rows}) == len(rows)
assert sum(item['files'] for item in data['families']) + len(data['evidence_root_files']) == len(rows)
assert all(row['classification'] == 'REVIEW_REQUIRED' for row in rows)
print(json.dumps({'paths': len(rows), 'sum_bytes': data['evidence_bytes'], 'family_count': len(data['families']), 'literal_file_references': sum(bool(r['direct_markdown_refs']) for r in rows), 'same_blob_elsewhere': sum(int(r['same_blob_other_path_count']) > 0 for r in rows), 'all_review_required': True}))
