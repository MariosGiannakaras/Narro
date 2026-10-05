import hashlib,json,pathlib,sys
root=pathlib.Path(__file__).resolve().parent
dest=pathlib.Path(sys.argv[1]);dest.mkdir(parents=True,exist_ok=True)
for video in json.loads((root/'video-originals/index.json').read_text()):
    output=dest/video['fileName'];temp=output.with_suffix('.assembling')
    if output.exists():
        if hashlib.sha256(output.read_bytes()).hexdigest()==video['sha256']:continue
        raise RuntimeError('Existing output has a different hash: '+str(output))
    h=hashlib.sha256();size=0
    with temp.open('wb') as f:
        for part in video['parts']:
            data=(root/part['file']).read_bytes()
            assert len(data)==part['bytes'] and hashlib.sha256(data).hexdigest()==part['sha256']
            f.write(data);h.update(data);size+=len(data)
    assert size==video['bytes'] and h.hexdigest()==video['sha256']
    temp.rename(output);print(output)
