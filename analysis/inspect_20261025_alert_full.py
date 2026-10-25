#!/usr/bin/env python3
"""Read-only supplemental full-interval Timer flash evidence; no app operation."""
import base64,datetime as dt,json,pathlib,subprocess,tempfile
ROOT="work-log/evidence/physical-acceptance-20261025/topology/"
def git_bytes(p):return subprocess.run(["git","show","FETCH_HEAD:"+ROOT+p],check=True,capture_output=True).stdout
def stamp(s):return dt.datetime.fromisoformat(s.replace("Z","+00:00"))
rows=[json.loads(x) for x in git_bytes("timer-observation.jsonl").splitlines() if x.strip()]
effects={(v["run_id"],v["boundary_seconds"]):v for r in rows for v in r.get("timed_alert_effects",[]) if v.get("boundary_seconds")==391}
assert len(effects)==1, effects
effect=list(effects.values())[0]
start=json.loads(git_bytes("secondary-normal-alert/start.json"))
motion=json.loads(git_bytes("secondary-normal-media.json"))
assert any('"reduced\\":false' in json.dumps(x) for x in motion)
rel=(stamp(effect["decided_at"])-stamp(start["utc"])).total_seconds()
print("ALERT2_PROVENANCE|"+json.dumps({"source":"secondary-normal-alert/native-original.mkv","utc":effect["decided_at"],"relativeSeconds":rel,"runId":effect["run_id"],"scope":"frame-accurate source PTS not DWM present","reduced":False},separators=(",",":")),flush=True)
with tempfile.TemporaryDirectory() as td:
 video=pathlib.Path(td)/"original.mkv"
 with open(video,"wb") as f:subprocess.run(["git","show","FETCH_HEAD:"+ROOT+"secondary-normal-alert/native-original.mkv"],check=True,stdout=f)
 for i,shift in enumerate((-0.75,0.0,0.75),1):
  begin=max(0,rel+shift)
  sheet=pathlib.Path(td)/f"part{i}.jpg"
  vf="crop=340:680:0:0,scale=306:612:flags=lanczos,tile=7x8:padding=2:margin=1:color=black"
  subprocess.run(["ffmpeg","-hide_banner","-nostdin","-loglevel","error",
                 "-ss",f"{begin:.6f}","-i",str(video),"-t","0.92","-vf",vf,
                 "-frames:v","1","-q:v","7","-y",str(sheet)],check=True)
  data=sheet.read_bytes();enc=base64.b64encode(data).decode();label=f"T1-zoom-{i}"
  print("ALERT2_META|"+json.dumps({"label":label,"seek":round(begin,3),"secondsRelativeEventStart":round(shift,3),"originalBytes":video.stat().st_size,"framesPerSheetMax":56,"sampling":"consecutive original PTS nominal60fps; compressed contact sheet; no hardware subframe guarantee"},separators=(",",":")),flush=True)
  print(f"ALERT2_BEGIN|{label}|{len(data)}",flush=True)
  for o in range(0,len(enc),4000):print(f"ALERT2_PART|{label}|{enc[o:o+4000]}",flush=True)
  print("ALERT2_END|"+label,flush=True)
print("ALERT2_DONE|3",flush=True)
