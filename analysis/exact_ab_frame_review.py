#!/usr/bin/env python3
"""Analysis-only, original-byte read-only frame contact sheet extraction.
Temporary isolated GitHub branch; never a production source/CI validation.
Output base64 chunk text so a disconnected reviewer can inspect actual original
Narro Windows desktop frames without pretending that UIA/QPC is visual proof.
"""
import base64
import datetime as dt
import json
import pathlib
import subprocess
import tempfile

ROOT = pathlib.Path("work-log/evidence/physical-ab-20261024")
SEGMENTS = {v["segment"]: v for v in json.loads((ROOT / "segments.json").read_text(encoding="utf-8"))}
DATE = lambda s: dt.datetime.fromisoformat(s.replace("Z", "+00:00"))
SOURCE_MAP = {"A": ("A-reduced-verified", "A-normal-verified"),
              "B": ("B-reduced", "B-normal")}


def emit_image(path, label):
    data = pathlib.Path(path).read_bytes()
    b64 = base64.b64encode(data).decode("ascii")
    print(f"FRAME_BEGIN|{label}|{len(data)}", flush=True)
    for start in range(0, len(b64), 4000):
        print(f"FRAME_PART|{label}|{b64[start:start + 4000]}", flush=True)
    print(f"FRAME_END|{label}", flush=True)


for candidate in ("A", "B"):
    trace = ROOT / "native-trace" / candidate / "focus-transition-trace.jsonl"
    rows = [json.loads(line) for line in trace.read_text(encoding="utf-8").splitlines() if line]
    beginnings = [v for v in rows if v.get("stage") == "native.begin"]
    assert len(beginnings) == 8, (candidate, len(beginnings))
    for i, record in enumerate(beginnings):
        source_segment = SOURCE_MAP[candidate][0 if i < 4 else 1]
        file_path = ROOT / "recordings" / source_segment / "native-original.mkv"
        assert file_path.is_file()
        start = max(0, (DATE(record["utc"]) - DATE(SEGMENTS[source_segment]["start"]["utc"])).total_seconds() - 0.12)
        label = f"{candidate}{i + 1:02}-{('reduced' if i < 4 else 'normal')}"
        with tempfile.TemporaryDirectory() as directory:
            jpg = pathlib.Path(directory) / "sheet.jpg"
            filt = "crop=340:700:2220:0,fps=60,scale=170:350:flags=neighbor,tile=8x5:padding=2:margin=1:color=black"
            cmd = ["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-ss", f"{start:.3f}",
                   "-i", str(file_path), "-t", "0.70", "-vf", filt,
                   "-frames:v", "1", "-q:v", "6", "-y", str(jpg)]
            done = subprocess.run(cmd, capture_output=True, text=True)
            if done.returncode or not jpg.is_file():
                raise RuntimeError(f"{label} ffmpeg: {done.stderr}")
            print("FRAME_META|" + json.dumps({"label":label,"segment":source_segment,"time":start,
                  "beginUtc":record["utc"],"durationMs":record["details"]["data"]["durationMs"],
                  "sourceSha":record["sourceSha"],"clipSha256":None}, separators=(",", ":")), flush=True)
            emit_image(jpg, label)
print("FRAME_REVIEW_COMPLETE|16", flush=True)
