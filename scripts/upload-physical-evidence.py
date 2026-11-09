"""Upload frozen evidence immediately, privately in a draft release; verify remote bytes."""
import argparse,hashlib,json,pathlib,subprocess,tempfile,zipfile,datetime,os,shutil

def zip_member(name):
    # Delivery identity depends on evidence bytes, never host metadata or wall clock.
    info=zipfile.ZipInfo(name,(1980,1,1,0,0,0))
    info.create_system=3;info.external_attr=0o100644<<16
    info.compress_type=zipfile.ZIP_DEFLATED
    return info

def gh(*args, binary=False):
    p=subprocess.run(['gh',*args],capture_output=True)
    if p.returncode: raise RuntimeError(p.stderr.decode(errors='replace'))
    return p.stdout if binary else p.stdout.decode()
def digest(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
    return h.hexdigest()
def upload(root,repo,tag):
    root=pathlib.Path(root).resolve(strict=True)
    session=root/'session.json'
    if session.exists():
        s=json.loads(session.read_text(encoding='utf-8-sig'))
        if s.get('state') not in ('FROZEN','INCOMPLETE') or s.get('activeOwnedNarroPid') or not s.get('recording',{}).get('closed'):
            raise RuntimeError('Refusing an unfrozen/live packet')
    elif not (root/'complete-analysis/FINAL_ANALYSIS.md').exists():raise RuntimeError('Not a collected session or campaign analysis root')
    files=[]
    for p in sorted(root.rglob('*'),key=lambda p:p.relative_to(root).as_posix()):
        if p.is_symlink():raise RuntimeError('Symlink in evidence')
        if p.is_file() and p.relative_to(root).as_posix() not in ('UPLOAD_RECEIPT.json','UPLOAD_STATUS.json'):
            p.resolve().relative_to(root)
            files.append({'path':p.relative_to(root).as_posix(),'bytes':p.stat().st_size,'sha256':digest(p)})
    manifest={'schema':'narro-remote-evidence/v1','root':root.name,'files':files,'coverage':'Original coverage gaps and verdicts are preserved; upload is not acceptance.'}
    # Always erase staged private desktop video, including auth/upload/digest failures.
    with tempfile.TemporaryDirectory(prefix='narro-upload-') as staging_dir:
        temp=pathlib.Path(staging_dir)
        archive=temp/(root.name+'.zip')
        with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=1,allowZip64=True) as z:
            z.writestr(zip_member('UPLOAD_MANIFEST.json'),json.dumps(manifest,indent=2),compresslevel=1)
            for f in files:
                p=root/f['path']
                with p.open('rb') as source,z.open(zip_member(root.name+'/'+f['path']),'w',force_zip64=True) as target:
                    shutil.copyfileobj(source,target,1024*1024)
                if p.stat().st_size!=f['bytes'] or digest(p)!=f['sha256']:raise RuntimeError('Source changed while packaging')
        sha=digest(archive);asset=root.name+'-'+sha[:16]+'.zip';renamed=temp/asset;archive.rename(renamed)
        try:release=json.loads(gh('release','view',tag,'--repo',repo,'--json','id,isDraft,url'))
        except RuntimeError:
            gh('release','create',tag,'--repo',repo,'--draft','--title','Physical evidence '+tag,'--notes','User-authorized evidence transfer. Draft only: desktop captures are not publicly published. Original coverage gaps remain explicit.')
            release=json.loads(gh('release','view',tag,'--repo',repo,'--json','id,isDraft,url'))
        if not release['isDraft']:raise RuntimeError('Refusing raw evidence on a published release')
        remote=next(r for r in json.loads(gh('api',f'repos/{repo}/releases?per_page=100')) if r['tag_name']==tag)
        release['id']=remote['id']
        assets=json.loads(gh('api',f'repos/{repo}/releases/{release["id"]}/assets?per_page=100'))
        found=next((a for a in assets if a['name']==asset),None)
        if not found:
            gh('release','upload',tag,str(renamed),'--repo',repo)
            assets=json.loads(gh('api',f'repos/{repo}/releases/{release["id"]}/assets?per_page=100'))
            found=next(a for a in assets if a['name']==asset)
        if found['size']!=renamed.stat().st_size:raise RuntimeError('Remote size mismatch')
        if found.get('digest')!='sha256:'+sha:
            payload=gh('api','-H','Accept: application/octet-stream',f'repos/{repo}/releases/assets/{found["id"]}',binary=True)
            if hashlib.sha256(payload).hexdigest()!=sha:raise RuntimeError('Remote download hash mismatch')
        receipt={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'UPLOADED_VERIFIED','repository':repo,'releaseTag':tag,'releaseId':release['id'],'draft':True,'releaseUrl':release['url'],'assetId':found['id'],'assetName':asset,'bytes':found['size'],'sha256':sha,'files':len(files),'fileManifest':manifest}
        (root/'UPLOAD_RECEIPT.json').write_text(json.dumps(receipt,indent=2),encoding='utf8')

        return {k:v for k,v in receipt.items() if k!='fileManifest'}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--root',required=True);p.add_argument('--repo',default='MariosGiannakaras/Narro');p.add_argument('--tag');a=p.parse_args()
    print(json.dumps(upload(a.root,a.repo,a.tag or 'physical-evidence-'+pathlib.Path(a.root).name),indent=2),flush=True)
