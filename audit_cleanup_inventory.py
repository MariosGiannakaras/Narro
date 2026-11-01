import collections
import csv
import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REF = 'origin/main'
OUT = ROOT / 'work-log' / 'evidence-cleanup-review-20261101'
OUT.mkdir(parents=True, exist_ok=True)

def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)

sha = git('rev-parse', REF).decode().strip()
entries = []
for raw in git('ls-tree', '-r', '-l', '-z', sha).split(b'\0'):
    if not raw:
        continue
    metadata, path = raw.split(b'\t', 1)
    mode, kind, blob, size = metadata.decode().split()
    if kind != 'blob':
        continue
    path = path.decode('utf-8', 'surrogateescape')
    entries.append(dict(path=path, sha=blob, size=int(size)))

evidence = [e for e in entries if e['path'].startswith('work-log/evidence/')]
families = collections.defaultdict(list)
for e in evidence:
    parts = e['path'].split('/')
    if len(parts) > 3:
        families[parts[2]].append(e)
all_blobs = collections.Counter(e['sha'] for e in entries)
paths_by_blob = collections.defaultdict(list)
for e in entries:
    paths_by_blob[e['sha']].append(e['path'])
pattern_file = OUT / 'family-patterns.txt'
pattern_file.write_text(''.join(name + '\n' for name in sorted(families)), encoding='utf-8')
proc = subprocess.run(['git', 'grep', '-I', '-n', '-F', '-f', str(pattern_file), sha, '--', 'docs/*.md', 'work-log/*.md', 'HANDOFF.md', 'TODO.md', 'STATUS.md', ':(exclude)work-log/evidence/**'], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
if proc.returncode not in (0, 1):
    raise RuntimeError(proc.stderr.decode(errors='replace'))
refs_by_family = collections.defaultdict(set)
refs_by_path = collections.defaultdict(set)
for line in proc.stdout.decode('utf-8', 'replace').splitlines():
    parts = line.split(':', 3)
    if len(parts) < 4:
        continue
    path, content = parts[1], parts[3]
    for name in families:
        if name in content and not path.startswith('work-log/evidence/' + name + '/'):
            refs_by_family[name].add(path)
            for entry in families[name]:
                relative = entry['path'].removeprefix('work-log/evidence/')
                if relative in content:
                    refs_by_path[entry['path']].add(path)
rows = []
for name, files in sorted(families.items()):
    external = sorted(refs_by_family[name])
    rows.append({'family': name, 'files': len(files), 'bytes': sum(x['size'] for x in files), 'unique_git_blobs': len({x['sha'] for x in files}), 'blobs_with_other_paths_repo_wide': sum(all_blobs[x['sha']] > 1 for x in files), 'external_reference_files': external, 'classification': 'REVIEW_REQUIRED'})

with (OUT / 'inventory.json').open('w', encoding='utf-8', newline='\n') as f:
    json.dump({'main_sha': sha, 'scope': 'All tracked work-log/evidence paths; no deletion decisions', 'total_repo_blobs': len(entries), 'evidence_files': len(evidence), 'evidence_bytes': sum(e['size'] for e in evidence), 'evidence_root_files': [e['path'] for e in evidence if len(e['path'].split('/')) == 3], 'families': rows}, f, ensure_ascii=False, indent=2)
    f.write('\n')
with (OUT / 'paths.csv').open('w', encoding='utf-8', newline='') as f:
    w = csv.DictWriter(f, fieldnames=['path', 'sha', 'size', 'same_blob_other_path_count', 'direct_markdown_refs', 'classification'])
    w.writeheader()
    for e in evidence:
        alternatives = [p for p in paths_by_blob[e['sha']] if p != e['path']]
        w.writerow({**e, 'same_blob_other_path_count': len(alternatives), 'direct_markdown_refs': '|'.join(sorted(refs_by_path[e['path']])), 'classification': 'REVIEW_REQUIRED'})
with (OUT / 'duplicate-blob-paths.json').open('w', encoding='utf-8', newline='\n') as f:
    json.dump({sha: paths for sha, paths in paths_by_blob.items() if len(paths) > 1 and any(p.startswith('work-log/evidence/') for p in paths)}, f, ensure_ascii=False, indent=2)
    f.write('\n')
print(json.dumps({'main_sha': sha, 'evidence_files': len(evidence), 'evidence_bytes': sum(e['size'] for e in evidence), 'families': len(rows), 'families_with_external_reference_files': sum(bool(r['external_reference_files']) for r in rows), 'output': str(OUT)}))
