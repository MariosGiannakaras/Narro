import collections
import json
from pathlib import Path

base = Path('work-log/evidence-cleanup-review-20261101')
data = [json.loads((base / name).read_text(encoding='utf-8')) for name in ('legacy-zip-content-review.json', 'remaining-zip-content-review.json')]
duplicate_blobs = json.loads((base / 'duplicate-blob-paths.json').read_text(encoding='utf-8'))
archives = [a for d in data for a in d['archives'] if a['classification'].startswith('ALL_MEMBERS')]
assert len(archives) == 21
out = []
for archive in archives:
    path = archive['path']
    family = '/'.join(path.split('/')[:3]) + '/'
    members = []
    for m in archive['members']:
        member_name = m['name'].replace('\\', '/').lstrip('/')
        candidates = m['matching_tracked_paths']
        same_family = [p for p in candidates if p.startswith(family)]
        suffix = [p for p in same_family if p.endswith('/' + member_name)]
        members.append({'name': m['name'], 'git_blob': m['git_blob'], 'same_family_matches': same_family, 'same_family_suffix_matches': suffix})
    if any(x in path for x in ('physical-ab-20261024/', 'physical-gap-restart-20261024/', 'physical-gaps-20261024/', 'physical-native-final-20261024/', 'physical-recovery-20261025/', 'physical-upload-20261024/')):
        decision = 'HOLD_CURRENT_NATIVE_RAW_ARCHIVE'
        reason = 'Original raw-text container of a recent native session; member content match does not retire session provenance or raw container.'
    elif 'paused-intake/executed-profile-protection-helpers.zip' in path:
        decision = 'HOLD_SURVIVING_REFERENCED_COPY'
        reason = 'Previously retained matching copy after PR461; preserve it and linked recovery proof.'
    else:
        decision = 'REVIEW_CONSUMERS_AND_CONTAINER'
        reason = 'All members have tracked byte matches; archive provenance, direct links and current consumers require separate per-session determination.'
    out.append({'path': path, 'bytes': archive['bytes'], 'git_blob': archive['git_blob'], 'same_zip_blob_other_paths': [p for p in duplicate_blobs.get(archive['git_blob'], []) if p != path], 'direct_markdown_refs': archive['direct_markdown_refs'], 'member_count': len(members), 'members_with_same_family_matches': sum(bool(m['same_family_matches']) for m in members), 'members_with_same_family_suffix_matches': sum(bool(m['same_family_suffix_matches']) for m in members), 'decision': decision, 'reason': reason, 'members': members})
result = {'baseline': '4fcd2fe084ecdc7b66cad5671da54d63e71aabe3', 'scope': '21 evidence ZIPs with all uncompressed member blobs matched to tracked paths', 'decision_note': 'No deletion approved; selected holds are based on recent session or surviving referenced copy, others need consumer and container review.', 'archives': out}
(base / 'matched-zip-consumer-review.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'archives': len(out), 'decision_counts': dict(collections.Counter(a['decision'] for a in out)), 'all_same_family': sum(a['member_count'] == a['members_with_same_family_matches'] for a in out), 'all_same_family_suffix': sum(a['member_count'] == a['members_with_same_family_suffix_matches'] for a in out), 'same_container_blob_copy': sum(bool(a['same_zip_blob_other_paths']) for a in out)}))
