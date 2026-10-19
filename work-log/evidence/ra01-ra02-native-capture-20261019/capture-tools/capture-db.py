from pathlib import Path
import sqlite3,json,sys,datetime
r=Path(__file__).resolve().parent
assert json.loads((r/'profile-protection-private.json').read_text())['state']=='OWNED_PROFILE_ACTIVE'
db=sqlite3.connect((Path.home()/'AppData/Roaming/com.mariosg.Narro/narro.db').as_uri()+'?mode=ro',uri=True)
db.row_factory=sqlite3.Row
data={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ownedProfile':True,'tables':{}}
for row in db.execute("select name from sqlite_master where type='table' and name not like 'sqlite_%'"):
 name=row[0];data['tables'][name]=[dict(x) for x in db.execute('select * from "'+name.replace('"','""')+'"')]
db.close()
(r/'observations'/(sys.argv[1]+'-db.json')).write_text(json.dumps(data,indent=2),encoding='utf-8')
print(json.dumps({'label':sys.argv[1],'utc':data['utc'],'tables':list(data['tables'])}))
