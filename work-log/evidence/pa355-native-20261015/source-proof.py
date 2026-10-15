from pathlib import Path
import subprocess,json,datetime,sys
r=Path(__file__).resolve().parent
checkout=Path(r'E:\SystemFiles\Desktop\Narro-PA352')
head='7b54e62f5d5f814e3e37ed93d8dfa996e9bad6e5'; main=sys.argv[1]
def tree(rev):
    data=subprocess.check_output(['git','ls-tree','-r',rev],cwd=checkout).decode('utf8')
    result={}
    for line in data.splitlines():
        meta,path=line.split('\t',1)
        if path.startswith(('src/','src-tauri/','scripts/','assets/','.github/')) or ('/' not in path and not path.endswith('.md')):
            result[path]=meta.split()[2]
    return result
left,right=tree(head),tree(main)
diff=[p for p in sorted(set(left)|set(right)) if left.get(p)!=right.get(p)]
proof={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pr_head':head,'main':main,'ci':38630226135,'source_build_test_config_blobs_matched':len(left) if not diff else None,'mismatches':diff,'workflow_unchanged':left.get('.github/workflows/ci.yml')==right.get('.github/workflows/ci.yml'),'main_validation':'Exact PR tree reuse only when all executable/build/test/config blobs match under CI_VALIDATION_STRATEGY section7'}
(r/'analysis/main-source-proof.json').write_text(json.dumps(proof,indent=2),encoding='utf8')
assert not diff, diff
print(json.dumps(proof))
