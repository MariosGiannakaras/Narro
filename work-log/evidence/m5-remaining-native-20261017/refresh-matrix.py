from pathlib import Path
import json,re,hashlib,subprocess,datetime
r=Path(__file__).resolve().parent;repo=Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload')
meta=json.loads((r/'session-meta.json').read_text());prep=json.loads((r/'PREPARATION.json').read_text());meta['scope']=prep['scope'];(r/'session-meta.json').write_text(json.dumps(meta,indent=2),encoding='utf-8')
current=None;gates=[]
for i,line in enumerate((repo/'TODO.md').read_text(encoding='utf-8').splitlines(),1):
 m=re.match(r'## Milestone (\d+) ',line)
 if m:current=int(m[1])
 if current and 1<=current<=9 and '[ ]' in line:gates.append({'milestone':current,'line':i,'criterion':line.strip(),'disposition':'OPEN until actually sufficiently exercised'})
paths=['TODO.md','HANDOFF.md','docs/AUDIT_IMPLEMENTATION_CROSSWALK.md']
d={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'main':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,encoding='utf-8').strip(),'source':meta['head'],'ci':meta['ci'],'state':'PREPARED_NOT_RUN','openM1M9Gates':gates,'planned8groups':prep['groups'],'documents':[{'path':p,'sha256':hashlib.sha256((repo/p).read_bytes()).hexdigest()} for p in paths],'previousAccepted':'PR3623/3childsync; B58heading2/2; B42ordinarydateX; unaffectedPA01–08; no replay','knownFail':'B43 date/count sourceheader; does not block independent capture','restrictions':'No source edits/deep analysis during useful recording; no M10/M11 advance; approvedpicker/upload/218icons locked'}
(r/'session-evidence-matrix-before.json').write_text(json.dumps(d,indent=2),encoding='utf-8');print(json.dumps({'preparedGroups':len(prep['groups']),'openM1M9Gates':len(gates),'source':meta['head']}))
