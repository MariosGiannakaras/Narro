import collections
import hashlib
import json
import subprocess
import zipfile
from pathlib import Path

BASE = Path('work-log/evidence-cleanup-review-20261101')
BASELINE = '4fcd2fe084ecdc7b66cad5671da54d63e71aabe3'
previous = [json.loads((BASE / n).read_text(encoding='utf-8')) for n in ('legacy-zip-content-review.json', 'remaining-zip-content-review.json')]
tree = subprocess.check_output(['git', 'ls-tree', '-r', '-l', '-z', BASELINE])
tracked = collections.defaultdict(list)
for entry in tree.split(b'\0'):
    if entry:
        metadata, name = entry.split(b'\t', 1)
        mode, kind, blob, size = metadata.decode().split()
        if kind == 'blob':
            tracked[blob].append(name.decode('utf-8', 'surrogateescape'))

entries = []
for archive in [a for d in previous for a in d['archives']]:
    prior = archive['members']
    with zipfile.ZipFile(archive['path']) as z:
        infos = [info for info in z.infolist() if not info.is_dir()]
        if len(infos) != len(prior):
            raise ValueError('member count changed: ' + archive['path'])
        for index, (info, item) in enumerate(zip(infos, prior)):
            if (info.filename, info.file_size, f'{info.CRC:08x}') != (item['name'], item['bytes'], item['crc32']):
                raise ValueError('member identity changed: ' + archive['path'])
            if item['status'] != 'NO_TRACKED_BLOB_MATCH':
                continue
            result = {'archive': archive['path'], 'member_index': index, 'name': info.filename, 'bytes': info.file_size, 'original_git_blob': item['git_blob']}
            if info.file_size > 8 * 1024 * 1024:
                result['status'] = 'NOT_READ_OVER_8MIB'
            else:
                data = z.read(info)
                if b'\x00' in data:
                    result['status'] = 'NOT_UTF8_TEXT'
                else:
                    try:
                        data.decode('utf-8')
                    except UnicodeDecodeError:
                        result['status'] = 'NOT_UTF8_TEXT'
                    else:
                        if b'\r\n' not in data:
                            result['status'] = 'NO_CRLF_TO_NORMALIZE'
                        else:
                            normalized = data.replace(b'\r\n', b'\n')
                            blob = hashlib.sha1(b'blob ' + str(len(normalized)).encode() + b'\0' + normalized).hexdigest()
                            result['normalized_git_blob'] = blob
                            result['normalized_matching_paths'] = tracked.get(blob, [])
                            result['status'] = 'CRLF_NORMALIZED_MATCH' if result['normalized_matching_paths'] else 'CRLF_NORMALIZED_NO_MATCH'
            entries.append(result)

counts = collections.Counter(x['status'] for x in entries)
if len(entries) != 11103:
    raise ValueError('unexpected unmatched member count: ' + str(len(entries)))
result = {'baseline': BASELINE, 'scope': 'Previously unmatched ZIP members, comparing UTF-8 text CRLF-to-LF only', 'limitations': 'Normalization is not byte identity; UTF-16, encodings other than UTF-8, unmatched transformations, untracked content and members above 8 MiB were not established. No deletion decisions.', 'counts': dict(counts), 'entries': entries}
(BASE / 'zip-newline-review.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'members': len(entries), 'counts': dict(counts)}))
