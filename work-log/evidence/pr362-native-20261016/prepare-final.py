from pathlib import Path
import json, datetime, re, hashlib
r=Path(__file__).resolve().parent
head='560efeb076d2ec167232b9d86aa3354f6893214b'; run=38894130069
for name in ['download-candidate.py','prove-main.py','CAPTURE_ORDER.md']:
 p=r/name;s=p.read_text(encoding='utf-8')
 s=s.replace('0e9cdae1835caad37baaef402b8faca46b591cff',head).replace('38889617175',str(run)).replace('exact0e9cdae1','exact560efeb0')
 p.write_text(s,encoding='utf-8')
p=r/'native-input.py';s=p.read_text();s=s.replace('u.GetAncestor.restype=w.HWND','u.GetAncestor.argtypes=[w.HWND,w.UINT];u.GetAncestor.restype=w.HWND');p.write_text(s,encoding='utf-8')
p=r/'PREPARATION.json';data=json.loads(p.read_text());data.update(state='FINAL_CI_PENDING',exactCI=run,exactSource=head,approvedFinalCandidate=False);p.write_text(json.dumps(data,indent=2),encoding='utf-8')
repo=Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload')
todo=(repo/'TODO.md').read_text(encoding='utf-8');current=None;gates=[]
for i,line in enumerate(todo.splitlines(),1):
 m=re.match(r'## Milestone (\d+) ',line)
 if m:current=int(m[1])
 if current and 1<=current<=9 and '[ ]' in line:gates.append({'milestone':current,'line':i,'criterion':line.strip(),'disposition':'OPEN unless this recording sufficiently exercises full criterion'})
paths=['TODO.md','HANDOFF.md','docs/AUDIT_IMPLEMENTATION_CROSSWALK.md']
matrix={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':head,'ci':run,'state':'PREPARED_NOT_RUN','documents':[{'path':p,'sha256':hashlib.sha256((repo/p).read_bytes()).hexdigest()} for p in paths],'openM1M9Gates':gates,'planned':[{'id':'XW1','claim':'Focus→already expanded Board create/title/order/completion/draft/count/identity'},{'id':'XW2','claim':'Board→already expanded Focus create/title/order/completion/draft/count/identity'},{'id':'XW3','claim':'Board→expanded Timer create/same-count change/draft/count/identity'}],'compatibleOptional':['B43 Done date grouping/count/internal scroll','B26 Notes Close/Save/reopen and actual dirty-close behavior','B62 empty Today subdued CTA / factual click response; no inferred Blitzit outcome'],'notInvalidated':['M1 window/render foundation/performance','C5 restart placement','PA01–08 unaffected native acceptance','PA360 selector/subtask source controls/Search'],'limits':['No physical HDMI acceptance','No M10 advance','M11 dormant','No approved picker/upload/218 icon changes']}
(r/'session-evidence-matrix-before.json').write_text(json.dumps(matrix,indent=2),encoding='utf-8')
print(json.dumps({'finalHead':head,'run':run,'openM1M9CriteriaInventoried':len(gates),'nativeDirections':'0/3','approved':False}))
