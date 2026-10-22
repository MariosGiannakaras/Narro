from pathlib import Path
import struct, hashlib, json
root = Path(__file__).parent
paths = [root/'analysis/physical/narro.exe', root/'private-installer-backup/msi-installed-narro.exe']
result = []
for path in paths:
    data = path.read_bytes()
    offset = struct.unpack_from('<I', data, 60)[0]
    count = struct.unpack_from('<H', data, offset+6)[0]
    optional = struct.unpack_from('<H', data, offset+20)[0]
    sections = []
    for i in range(count):
        start = offset+24+optional+40*i
        name = data[start:start+8].rstrip(b'\0').decode()
        size, position = struct.unpack_from('<II', data, start+16)
        sections.append({'name':name,'bytes':size,'sha256':hashlib.sha256(data[position:position+size]).hexdigest()})
    result.append({'path':str(path),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'sections':sections,
        'sourceMarker':b'8bda5cc40be905c4a91506e0708d39e2770b4cde' in data,
        'runtimeVisualQuery':b'focus.html?runtimeVisual=1' in data})
blobs = [p.read_bytes() for p in paths]
differences = [i for i,(a,b) in enumerate(zip(*blobs)) if a != b]
comparison = {'files':result,'differentByteOffsets':differences,
    'bundleMarkers':['UNK','MSI'],
    'onlyBundleMarkerDiffers':len(blobs[0])==len(blobs[1]) and len(differences)==3
        and blobs[0].replace(b'__TAURI_BUNDLE_TYPE_VAR_UNK',b'__TAURI_BUNDLE_TYPE_VAR_MSI')==blobs[1]}
(root/'payload-comparison.json').write_text(json.dumps(comparison,indent=2)+'\n')
left = {s['name']:s for s in result[0]['sections']}
right = {s['name']:s for s in result[1]['sections']}
print(json.dumps({'sectionsEqual':{name:left[name]==right.get(name) for name in left},'sourceMarker':[x['sourceMarker'] for x in result],'runtimeVisualQuery':[x['runtimeVisualQuery'] for x in result]}))
