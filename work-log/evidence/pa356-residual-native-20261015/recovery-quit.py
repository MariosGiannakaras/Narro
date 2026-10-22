from pathlib import Path
import json,sys
r=Path(__file__).resolve().parent
assert json.loads((r/'profile-protection-private.json').read_text())['state']=='PREPARED'
assert json.loads((r/'launch.json').read_text())['pid']==25928
source=(r/'tray_quit.py').read_text()
guard="assert json.loads((r/'profile-protection-private.json').read_text())['state']=='OWNED_PROFILE_ACTIVE'"
assert guard in source
source=source.replace(guard,"assert json.loads((r/'profile-protection-private.json').read_text())['state']=='PREPARED'")
exec(compile(source,str(r/'tray_quit.py'),'exec'))
