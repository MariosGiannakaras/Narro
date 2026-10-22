from pathlib import Path
import json,sqlite3,hashlib,subprocess,datetime
r=Path(__file__).parent
current=json.loads((r/'profile-protection-private.json').read_text())
prior=json.loads(Path(r'E:\SystemFiles\Desktop\Narro-PA353-native-20261014\profile-protection-private.json').read_text())
out=[]
for ledger in [prior,current]:
    item=next(x for x in ledger['namespaces'] if x['kind']=='Roaming')
    p=Path(item['retainedPostfix'])/'narro.db'
    c=sqlite3.connect(p.as_uri()+'?mode=ro',uri=True)
    facts={'quickCheck':c.execute('pragma quick_check').fetchone()[0],'tables':{}}
    for name in ['lists','tasks','subtasks','task_notes','sessions']:
        rows=list(c.execute('SELECT * FROM '+name+' ORDER BY 1'))
        facts['tables'][name]={'rows':len(rows),'contentSha256':hashlib.sha256(repr(rows).encode()).hexdigest()}
    c.close();out.append(facts)
out={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'beforeOwned':out[0],'afterOwned':out[1],
     'allOwnedRowsEqual':out[0]==out[1],'originalProfile':json.loads((r/'original-profile-restoration-proof.json').read_text())}
changes=json.loads((r/'owned-row-change-details.json').read_text())
out['changedFields']=changes
out['allOwnedBusinessDataEqual']=all(x['table']=='sessions' and set(x['fields'])=={'updated_at'} for x in changes)
out['timestampOnlyNormalQuit']=out['allOwnedBusinessDataEqual'] and out['beforeOwned']['tables']['sessions']['rows']==out['afterOwned']['tables']['sessions']['rows']
(r/'owned-data-retention-proof.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({'allOwnedRowsEqual':out['allOwnedRowsEqual'],'counts':{k:v['rows'] for k,v in out['afterOwned']['tables'].items()}}))
