from pathlib import Path
import tempfile,json,hashlib,shutil,subprocess,sys
r=Path(__file__).resolve().parent;results=[]
fixture_parent=r/'guard-fixtures';fixture_parent.mkdir(exist_ok=True)
cases=['owned-exact','wrong-executable','unowned-profile','foreign-marker','missing-protected','originals-restored']
for case in cases:
    with tempfile.TemporaryDirectory(prefix=case+'-',dir=fixture_parent) as folder:
        p=Path(folder).resolve();assert p.is_relative_to(fixture_parent.resolve())
        shutil.copyfile(r/'assert-launch-safe.py',p/'assert-launch-safe.py')
        exe=p/'fixture.exe';exe.write_bytes(b'not executable; no launch is attempted')
        active=p/'owned';active.mkdir();protected=p/'protected';protected.mkdir()
        meta={'state':'ARTIFACT_VERIFIED','executable':str(exe),'sha256':hashlib.sha256(exe.read_bytes()).hexdigest()}
        ledger={'state':'OWNED_PROFILE_ACTIVE','sessionRoot':str(p),'namespaces':[{'active':str(active),'protected':str(protected)}]}
        marker={'owned':True,'sessionRoot':str(p)}
        if case=='wrong-executable':meta['sha256']='0'*64
        if case=='unowned-profile':marker['owned']=False
        if case=='foreign-marker':marker['sessionRoot']='foreign session'
        if case=='missing-protected':protected.rmdir()
        if case=='originals-restored':ledger['state']='ORIGINAL_PROFILES_RESTORED'
        (p/'session-meta.json').write_text(json.dumps(meta))
        (p/'profile-protection-private.json').write_text(json.dumps(ledger))
        (active/'pa-owned-profile.json').write_text(json.dumps(marker))
        completed=subprocess.run([sys.executable,str(p/'assert-launch-safe.py')],capture_output=True,text=True,creationflags=0x08000000)
        assert (completed.returncode==0)==(case=='owned-exact'),(case,completed.stdout,completed.stderr)
        results.append({'case':case,'expected':'ALLOW' if case=='owned-exact' else 'REFUSE','actual':'ALLOW' if completed.returncode==0 else 'REFUSE','pass':True})
(r/'analysis/launch-guard-regression.json').write_text(json.dumps({'cases':results,'noAppLaunched':True,'noPersonalProfileAccessed':True},indent=2));print(json.dumps(results))
