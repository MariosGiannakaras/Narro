from pathlib import Path
import argparse, hashlib, json

parser=argparse.ArgumentParser(description='Verify and reconstruct the complete original CI948 OBS recording.')
parser.add_argument('--output', required=True, type=Path)
args=parser.parse_args()
root=Path(__file__).resolve().parent
metadata=json.loads((root/'parts.json').read_text(encoding='utf8'))
target=args.output.resolve()
if target.exists(): raise SystemExit('Output exists; choose a new path.')
target.parent.mkdir(parents=True, exist_ok=True)
staging=target.with_name(target.name+'.assembling')
if staging.exists(): raise SystemExit('Temporary output exists; choose a new path.')
overall=hashlib.sha256();total=0
try:
    with staging.open('xb') as output:
        for part in metadata['parts']:
            path=(root/part['file']).resolve()
            if not path.is_relative_to(root): raise ValueError('Part escapes evidence folder.')
            digest=hashlib.sha256();size=0
            with path.open('rb') as source:
                while chunk:=source.read(8*1024*1024):
                    digest.update(chunk);overall.update(chunk);output.write(chunk)
                    size+=len(chunk);total+=len(chunk)
            if size!=part['bytes'] or digest.hexdigest()!=part['sha256']:
                raise ValueError('Part size/hash mismatch: '+part['file'])
    if total!=metadata['originalBytes'] or overall.hexdigest()!=metadata['sha256']:
        raise ValueError('Original video size/hash mismatch.')
    if target.exists(): raise FileExistsError('Output appeared during reconstruction.')
    staging.rename(target)
except BaseException:
    if staging.exists(): staging.unlink()
    raise
print(json.dumps({'output':str(target),'bytes':total,'sha256':overall.hexdigest(),'verified':True}))
