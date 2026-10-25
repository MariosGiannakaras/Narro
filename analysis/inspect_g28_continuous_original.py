#!/usr/bin/env python3
"""Cross-check continuous 30fps whole-desktop original frames with QPC sample's
approximate A02 time; review only, no image edit or Narro runtime execution.
The host's video timestamps and QPC event timestamps are not assumed exact.
"""
import base64,datetime as dt,json,pathlib,subprocess,tempfile
ROOT=pathlib.Path("work-log/evidence/physical-native-final-20261024")
segments={x["name"]:x for x in json.loads((ROOT/"segments.json").read_text())}
def timestamp(s):return dt.datetime.fromisoformat(s.replace("Z","+00:00"))
for name,segment in (("A02","A-qpc-control"),("B02","recovery-reduced")):
    f=ROOT/f"{name}-normal-qpc"
    corr=json.loads((f/"correlation.json").read_text())
    records=[e for x in corr for e in [x.get("previous"),*x.get("during",[]),x.get("next")] if e]
    begins=[e for e in records if e.get("stage")=="native.begin" and e.get("details",{}).get("data",{}).get("from")=="timerCompact" and e.get("details",{}).get("data",{}).get("to")=="timerExpanded"]
    assert begins
    begin=begins[0]
    matches=[e for e in records if e.get("stage")=="native.committed" and e.get("rasterToken")==begin.get("rasterToken")]
    started=max(0,(timestamp(begin["utc"])-timestamp(segments[segment]["start"]["utc"])).total_seconds()-0.75)
    clip=ROOT/"recordings"/segment/"native-original.mkv"
    assert clip.is_file()
    with tempfile.TemporaryDirectory() as tmp:
        out=pathlib.Path(tmp)/"sheet.jpg"
        # Crop includes timer bounds (x=2220..2560) plus its left outside-HWND
        # flank where previously observed ghost text could belong to main.
        vf="crop=640:760:1915:0,scale=256:304:flags=lanczos,tile=8x7:padding=2:margin=1:color=black"
        cmd=["ffmpeg","-hide_banner","-nostdin","-loglevel","error",
             "-ss",f"{started:.3f}","-i",str(clip),"-frames:v","56",
             "-vf",vf,"-q:v","8","-y",str(out)]
        done=subprocess.run(cmd,capture_output=True,text=True)
        if done.returncode or not out.is_file():raise RuntimeError(name+" ffmpeg "+done.stderr)
        data=out.read_bytes();encoded=base64.b64encode(data).decode("ascii")
        print("G28_CONTINUOUS_META|"+json.dumps({"name":name,"segment":segment,"sourceSeconds":started,"nativeBeginUtc":begin["utc"],"nativeCommitUtc":matches[0]["utc"] if matches else None,"sourceOriginalBytes":clip.stat().st_size,"totalFramesRequested":56,"fpsNominal":30,"cropXYWH":[1915,0,640,760],"displayFrameRange":"source PTS sequence, not exact DWM present synchronization"},separators=(",",":")),flush=True)
        print(f"G28_CONTINUOUS_BEGIN|{name}|{len(data)}",flush=True)
        for i in range(0,len(encoded),4000):print("G28_CONTINUOUS_PART|"+name+"|"+encoded[i:i+4000],flush=True)
        print("G28_CONTINUOUS_END|"+name,flush=True)
print("G28_CONTINUOUS_COMPLETE|2",flush=True)
