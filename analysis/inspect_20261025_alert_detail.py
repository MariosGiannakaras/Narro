#!/usr/bin/env python3
"""Detail pass on the frozen original secondary-normal-media Timer alert only."""
import base64, json, pathlib, subprocess, tempfile, datetime as dt

base="work-log/evidence/physical-acceptance-20261025/topology/"
def show(path):
    return subprocess.run(["git","show","FETCH_HEAD:"+base+path],check=True,capture_output=True).stdout
record=json.loads(show("secondary-normal-alert/start.json"))
observations=[json.loads(x) for x in show("timer-observation.jsonl").decode().splitlines() if x]
claim=next(x for o in observations for x in o.get("timed_alert_effects",[]) if x.get("boundary_seconds")==391)
date=lambda x: dt.datetime.fromisoformat(x.replace("Z","+00:00"))
moment=(date(claim["decided_at"])-date(record["utc"])).total_seconds()
with tempfile.TemporaryDirectory() as td:
    path=pathlib.Path(td)/"original.mkv"
    with path.open("wb") as f:
        subprocess.run(["git","show","FETCH_HEAD:"+base+"secondary-normal-alert/native-original.mkv"],stdout=f,check=True)
    for label,offset in [("T1-early",-0.40),("T1-late",0.40)]:
        start=max(0,moment+offset)
        image=pathlib.Path(td)/(label+".jpg")
        cmd=["ffmpeg","-nostdin","-hide_banner","-loglevel","error","-ss",str(start),
           "-i",str(path),"-t","0.93",
           "-vf","crop=370:350:0:0,scale=370:350:flags=lanczos,tile=8x7:padding=2:margin=1:color=black",
           "-frames:v","1","-q:v","7","-y",str(image)]
        job=subprocess.run(cmd,check=True,capture_output=True)
        data=image.read_bytes()
        print("NARRO25_DETAIL_META|"+json.dumps({"label":label,"seek":start,
              "decisionSeconds":moment,"offset":offset,"bytes":len(data),
              "dataSource":"unchanged original frozen 20261025 secondary-normal-alert MKV",
              "frameCadence":"original 60fps native PTS, no fps interpolation",
              "flash":"must be independently graded"},separators=(",",":")),flush=True)
        print("NARRO25_DETAIL_BEGIN|"+label+"|"+str(len(data)),flush=True)
        encoded=base64.b64encode(data).decode()
        for i in range(0,len(encoded),4000):
            print("NARRO25_DETAIL_PART|"+label+"|"+encoded[i:i+4000],flush=True)
        print("NARRO25_DETAIL_END|"+label,flush=True)
    # Contrast color differences in exact Timer ROI (no provenance-free conclusions).
    cmd=["ffmpeg","-hide_banner","-nostdin","-loglevel","error","-ss",str(moment-0.35),
         "-i",str(path),"-t","1.5","-vf","crop=340:260:0:0,scale=85:65:flags=area,format=rgb24",
         "-f","rawvideo","-"]
    v=subprocess.run(cmd,check=True,capture_output=True).stdout
    step=85*65*3
    images=[v[p:p+step] for p in range(0,len(v),step) if len(v[p:p+step])==step]
    scores=[]
    for i in range(1,len(images)):
        old,new=images[i-1],images[i]
        delta=sum(abs(a-b) for a,b in zip(old,new))/len(old)
        scores.append([i,round(delta,4)])
    print("NARRO25_DETAIL_DIFF|"+json.dumps({"frameCount":len(images),
          "topMeanPixelDifferences":sorted(scores,key=lambda x:x[1],reverse=True)[:18],
          "warning":"ROI changes include ordinary timer seconds and are not sufficient to prove flash fidelity"},separators=(",",":")),flush=True)
print("NARRO25_DETAIL_COMPLETE|1",flush=True)
