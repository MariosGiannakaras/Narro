from pathlib import Path
import json,hashlib
r=Path(__file__).resolve().parent
meta=json.loads((r/'session-meta.json').read_text(encoding='utf-8-sig'))
ledger=json.loads((r/'profile-protection-private.json').read_text())
assert meta['state']=='ARTIFACT_VERIFIED' and ledger['state']=='OWNED_PROFILE_ACTIVE'
assert ledger['sessionRoot']==str(r)
assert hashlib.sha256(Path(meta['executable']).read_bytes()).hexdigest()==meta['sha256']
for item in ledger['namespaces']:
    active=Path(item['active']); marker=json.loads((active/'pa-owned-profile.json').read_text())
    assert marker['owned'] and marker['sessionRoot']==str(r)
    assert Path(item['protected']).is_dir()
print('SAFE_OWNED_EXACT_LAUNCH')
