#!/usr/bin/env python3
"""Read-only original-MKV visual review via an isolated GitHub Actions branch.

Sources only the frozen main Git blobs. Extracts chronological original-frame
contact sheets; screenshots, CI, QPC and raster metadata are not visual PASS.
No Narro app execution, checkout modifications or evidence mutation.
"""
import base64
import datetime as datetime
import json
import math
import pathlib
import subprocess
import tempfile

REPO = "work-log/evidence/physical-acceptance-20261025"
ACC = REPO + "/acceptance/"
TOP = REPO + "/topology/"
ROUTES = (("panel", "timerCompact"), ("timerCompact", "timerExpanded"),
          ("timerExpanded", "timerCompact"), ("timerCompact", "panel"))


def git_bytes(path):
    completed = subprocess.run(["git", "show", "FETCH_HEAD:" + path],
                               capture_output=True, check=True)
    return completed.stdout


def data_json(path):
    return json.loads(git_bytes(path))


def stamp(iso):
    return datetime.datetime.fromisoformat(iso.replace("Z", "+00:00"))


def original_path(rel, tmp):
    path = pathlib.Path(tmp) / pathlib.Path(rel).name
    with path.open("wb") as f:
        check = subprocess.run(["git", "show", "FETCH_HEAD:" + rel],
                               stdout=f, stderr=subprocess.PIPE)
        if check.returncode:
            raise RuntimeError("git show " + rel + " " + check.stderr.decode(errors="replace"))
    assert path.stat().st_size > 0
    return path


def image_sheet(video, seek, duration, vf, label, metadata):
    with tempfile.TemporaryDirectory() as td:
        output = pathlib.Path(td) / "sheet.jpg"
        command = ["ffmpeg", "-hide_banner", "-nostdin", "-loglevel", "error",
                   "-ss", f"{seek:.6f}", "-i", str(video), "-t", f"{duration:.6f}",
                   "-vf", vf, "-frames:v", "1", "-q:v", "8", "-y", str(output)]
        done = subprocess.run(command, capture_output=True, text=True)
        if done.returncode or not output.exists() or not output.stat().st_size:
            raise RuntimeError(f"{label}: {done.stderr}")
        raw = output.read_bytes()
        encoded = base64.b64encode(raw).decode()
        print("NARRO25_SHEET_META|" + json.dumps(dict(metadata, label=label,
              seekSeconds=round(seek, 6), durationSeconds=duration, filter=vf,
              jpegBytes=len(raw)), separators=(",", ":")), flush=True)
        print(f"NARRO25_SHEET_BEGIN|{label}|{len(raw)}", flush=True)
        for idx in range(0, len(encoded), 4000):
            print(f"NARRO25_SHEET_PART|{label}|{encoded[idx:idx + 4000]}", flush=True)
        print(f"NARRO25_SHEET_END|{label}", flush=True)


def inspect_transitions():
    reviewed = 0
    for candidate in ("A", "B"):
        rows = [json.loads(line) for line in git_bytes(
            ACC + f"native-traces-{candidate}/focus-transition-trace.jsonl").decode().splitlines() if line]
        starts = [r for r in rows if r.get("stage") == "native.begin"]
        assert len(starts) == 8
        commits = {r["rasterToken"]:r for r in rows if r.get("stage") == "native.committed"}
        for mode in ("normal", "reduced"):
            segment = f"{candidate}-{mode}"
            start_info = data_json(ACC + segment + "/start.json")
            path = ACC + segment + "/native-original.mkv"
            with tempfile.TemporaryDirectory() as tmp:
                video = original_path(path, tmp)
                ffprobe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                   "-show_entries", "stream=width,height,avg_frame_rate,duration",
                   "-of", "json", str(video)],capture_output=True,text=True,check=True)
                info = json.loads(ffprobe.stdout)["streams"][0]
                if int(info["width"]) != 2560 or int(info["height"]) != 1080:
                    raise ValueError(f"Unexpected original video dimensions: {info}")
                for idx, route in enumerate(ROUTES):
                    token = idx + (1 if mode == "normal" else 5)
                    entry = next(e for e in starts if e["rasterToken"] == token)
                    finish = commits.get(token)
                    assert finish, (candidate, mode, token)
                    actual = (entry["details"]["data"]["from"], entry["details"]["data"]["to"])
                    assert actual == route, (candidate,mode,token,actual)
                    elapsed = (stamp(entry["utc"]) - stamp(start_info["utc"])).total_seconds()
                    native_ms = round((finish["qpcTicks"]-entry["qpcTicks"])/
                                      entry["qpcFrequency"] * 1000, 3)
                    # The video wall-clock and runtime-QPC cannot be synchronized
                    # to subframe precision. Supply pre/post margins accordingly.
                    seek = max(0, elapsed - 0.20)
                    duration = 1.20 if mode == "normal" else 0.72
                    label = f"{candidate}-{mode}-{idx+1}"
                    meta = {"candidate":candidate,"motion":mode,"route":list(route),
                            "token":token, "sourceSha":entry["sourceSha"],
                            "nativeBeginUtc":entry["utc"],
                            "nativeCommitUtc":finish["utc"],
                            "nativeCommitMs":native_ms,
                            "requestedDurationMs":entry["details"]["data"]["durationMs"],
                            "sourceVideoBytes":video.stat().st_size,
                            "sourceVideo":path, "sourceVideoStream":info,
                            "viewCaveat":"original video PTS; not exact DWM present sync"}
                    # 7x8 chronological source-PTS samples; use a complete
                    # 2560-wide desktop frame to avoid clipping moving HWNDs.
                    image_sheet(video,seek,duration,
                        "crop=2560:740:0:0,scale=512:148:flags=lanczos,"
                        "tile=7x8:padding=2:margin=1:color=black",
                        label+"-desktop",meta)
                    if idx in (1, 2):
                        # Compact↔Expanded is stationary on second-half primary
                        # monitor at native x2220. Zoom to inspect A02 title etc.
                        image_sheet(video,seek,duration,
                            "crop=340:365:2220:0,scale=306:329:flags=lanczos,"
                            "tile=7x8:padding=2:margin=1:color=black",
                            label+"-timer",meta)
                    print("NARRO25_CASE_DONE|" + label,flush=True)
                    reviewed += 1
    assert reviewed == 16
    print("NARRO25_TRANSITION_SHEETS_COMPLETE|16",flush=True)


def inspect_alert():
    start = data_json(TOP + "secondary-normal-alert/start.json")
    baseline = data_json(TOP + "secondary-normal-media.json")
    assert any('"reduced\\":false' in json.dumps(e) for e in baseline)
    claims = [json.loads(x) for x in git_bytes(TOP+"timer-observation.jsonl").decode().splitlines() if x]
    hit = []
    for row in claims:
        for effect in row.get("timed_alert_effects",[]):
            if effect.get("boundary_seconds")==391:
                hit.append(effect)
    assert hit and len({(v["run_id"],v["boundary_seconds"]) for v in hit})==1
    effect=hit[0]
    utc = stamp(effect["decided_at"])
    rel = (utc - stamp(start["utc"])).total_seconds()
    path = TOP + "secondary-normal-alert/native-original.mkv"
    with tempfile.TemporaryDirectory() as tmp:
        video=original_path(path,tmp)
        meta={"category":"normal-media-timer-alert",
              "boundarySeconds":391,"runId":effect["run_id"],
              "decidedAt":effect["decided_at"],"claimedAt":effect["claimed_at"],
              "sourceVideo":path,"sourceVideoBytes":video.stat().st_size,
              "sourceSeconds":round(rel,3),"region":"1920x1080 selected secondary",
              "limitation":"Original source PTS; no confirmed audio identity from PCM alone"}
        image_sheet(video,max(0,rel-0.75),2.10,
            "crop=1920:1080:0:0,scale=432:243:flags=lanczos,"
            "tile=8x8:padding=2:margin=1:color=black",
            "T1-normal-alert-desktop",meta)
        # Read-only automatic frame-difference triage over the same interval:
        # 8-bit grayscale 128x72; report only numbers (not subjective PASS).
        command=["ffmpeg","-hide_banner","-nostdin","-loglevel","error",
                 "-ss",f"{max(0,rel-0.75):.4f}","-i",str(video),"-t","2.10",
                 "-vf","scale=128:72:flags=area,format=gray",
                 "-f","rawvideo","-"]
        proc=subprocess.run(command,capture_output=True,check=True)
        size=128*72
        frames=[proc.stdout[p:p+size] for p in range(0,len(proc.stdout),size)
                if len(proc.stdout[p:p+size])==size]
        changes=[]
        for i in range(1,len(frames)):
            delta=sum(abs(a-b) for a,b in zip(frames[i],frames[i-1]))/size
            changes.append({"frame":i,"meanAbsGrayDelta":round(delta,4)})
        print("NARRO25_ALERT_META|"+json.dumps({"frames":len(frames),
              "nonzeroConsecutiveFrameChanges":sum(q["meanAbsGrayDelta"]>0 for q in changes),
              "topDifferences":sorted(changes,key=lambda d:d["meanAbsGrayDelta"],
                                      reverse=True)[:16],
              "decisionUtc":effect["decided_at"],
              "visualFlash":"PENDING_ORIGINAL_FRAME_HUMAN_REVIEW"},separators=(",",":")),flush=True)
    print("NARRO25_ALERT_SHEET_COMPLETE|1",flush=True)


inspect_transitions()
inspect_alert()
print("NARRO25_BRIDGE_DONE|17|NATIVE_FRAMES_ONLY_NOT_PHYSICAL_PASS",flush=True)
