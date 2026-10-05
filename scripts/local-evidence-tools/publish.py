import hashlib, json, pathlib, subprocess, sys, traceback, msvcrt
ROOT=pathlib.Path(r'E:\SystemFiles\Desktop\NarroUpload')
MAIN=pathlib.Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload')
HERE=pathlib.Path(__file__).parent
DOCS=['HANDOFF.md','TODO.md','STATUS.md','docs/AUDIT_IMPLEMENTATION_CROSSWALK.md']
def git(*args):
    p=subprocess.run(['git','-C',str(MAIN),*args],capture_output=True)
    if p.returncode: raise RuntimeError(p.stderr.decode('utf-8','replace'))
    return p.stdout
def sha(p):
    with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
def run():
    assert git('branch','--show-current').decode().strip()=='main','Publication checkout is not main'
    assert git('remote','get-url','origin').decode().strip().removesuffix('.git')=='https://github.com/MariosGiannakaras/Narro','Unexpected remote'
    queue=HERE/'ready.json'
    if not queue.exists():
        print('No prepared evidence packet is waiting. Nothing changed. This button publishes prepared evidence; it does not invent results or capture the screen.')
        return
    job=json.loads(queue.read_text(encoding='utf-8-sig'))
    name=job['packet'];assert pathlib.PurePosixPath(name).name==name
    rel='work-log/evidence/'+name;packet=MAIN/rel
    manifest=json.loads((packet/'sha256-manifest.json').read_text(encoding='utf-8-sig'))
    expected={e['path'] for e in manifest}|{'sha256-manifest.json'}
    assert {p.relative_to(packet).as_posix() for p in packet.rglob('*') if p.is_file()}==expected,'Packet file list differs from frozen manifest'
    for e in manifest:
        p=packet/e['path'];assert p.resolve().is_relative_to(packet.resolve())
        assert p.stat().st_size==e['bytes'] and sha(p)==e['sha256'],'Evidence hash mismatch: '+e['path']
        assert p.stat().st_size<100_000_000,'Split oversized media before publishing'
    allowed=set(DOCS)|{rel+'/'+s for s in expected}
    changed=set(git('diff','--name-only','HEAD').decode().splitlines())
    staged=set(git('diff','--cached','--name-only').decode().splitlines())
    assert changed|staged<=allowed,'Unexpected tracked changes; source files will not be published'
    git('fetch','origin','main')
    assert git('merge-base','--is-ancestor','origin/main','HEAD')==b'', 'Remote main changed; reconcile documentation first'
    unpublished=git('diff','--name-only','origin/main','HEAD').decode().splitlines()
    assert all(s.endswith('.md') or s.startswith('work-log/evidence/') for s in unpublished),'Unpublished executable/tooling changes detected'
    if '--check' in sys.argv:
        print('CHECK PASS: frozen hashes, main branch, remote and publication allowlist verified. No commit or push performed.');return
    git('add','--sparse',*DOCS)
    git('add','--sparse','-f',rel)
    for e in manifest:
        assert hashlib.sha256(git('show',':'+rel+'/'+e['path'])).hexdigest()==e['sha256'],'Git index changed evidence bytes'
    assert git('show',':'+rel+'/sha256-manifest.json')==(packet/'sha256-manifest.json').read_bytes()
    assert set(git('diff','--cached','--name-only').decode().splitlines())<=allowed
    git('-c','core.whitespace=cr-at-eol','diff','--cached','--check','--',*DOCS)
    if git('diff','--cached','--name-only').strip():git('commit','-m',job['message']+' [skip ci]')
    git('push','origin','main')
    head=git('rev-parse','HEAD').decode().strip()
    assert git('ls-remote','origin','refs/heads/main').decode().split()[0]==head
    (HERE/'last-publication.json').write_text(json.dumps({'packet':name,'main':head,'verifiedRemote':True},indent=2)+'\n',encoding='utf-8')
    queue.unlink()
    print('PUBLISHED AND VERIFIED: '+head+'\nhttps://github.com/MariosGiannakaras/Narro/tree/main/'+rel)
try:
    with (HERE/'publication.lock').open('a+b') as lock:
        lock.seek(0)
        if not lock.read(1):lock.write(b'0');lock.flush()
        lock.seek(0)
        msvcrt.locking(lock.fileno(),msvcrt.LK_NBLCK,1)
        try:run()
        finally:lock.seek(0);msvcrt.locking(lock.fileno(),msvcrt.LK_UNLCK,1)
except Exception:
    message=traceback.format_exc();(HERE/'last-error.txt').write_text(message,encoding='utf-8');print(message);print('Publication stopped safely. Details: '+str(HERE/'last-error.txt'));sys.exit(1)
