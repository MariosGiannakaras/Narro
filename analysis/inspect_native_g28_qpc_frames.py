#!/usr/bin/env python3
"""Original-byte, read-only A02 G28 image/QPC review bridge; not Narro app CI."""
import base64,hashlib,json,pathlib,io
from PIL import Image, ImageDraw, ImageFont, ImageChops
ROOT=pathlib.Path("work-log/evidence/physical-native-final-20261024")
for typ in ("A02","B02"):
    folder=ROOT/f"{typ}-normal-qpc"
    frames=json.loads((folder/"frames.json").read_text())
    corrs=json.loads((folder/"correlation.json").read_text())
    events={}
    for row in corrs:
        for e in [row.get("previous"),*row.get("during",[]),row.get("next")]:
            if e and e.get("stage")=="native.begin" and e.get("details",{}).get("data",{}).get("from")=="timerCompact" and e.get("details",{}).get("data",{}).get("to")=="timerExpanded":
                events["start"]=e
            if e and e.get("stage")=="native.committed" and e.get("details",{}).get("data",{}).get("target")=="timerExpanded":
                events["commit"]=e
    assert "start" in events
    beg=events["start"]["qpcTicks"]
    end=events.get("commit",{}).get("qpcTicks")
    indexes=list(range(max(0,len(frames)-17),len(frames)))
    images=[]
    for f in frames:
        p=folder/f["fileName"]
        assert p.exists(),p
        with Image.open(p) as im:
            if f["index"] in indexes: images.append((f,im.convert("RGB")))
    assert len(images)==len(indexes)
    hashes={};changes=[]
    for f,im in images:
        hashes[f["index"]]=hashlib.sha256(im.tobytes()).hexdigest()[:12]
    for (a,ima),(b,imb) in zip(images,images[1:]):
        diff=ImageChops.difference(ima,imb)
        box=diff.getbbox()
        changes.append((a["index"],b["index"],box is not None,box))
    cw,ch=240,494
    columns=5; rows=(len(images)+columns-1)//columns
    sheet=Image.new("RGB",(columns*cw,rows*(ch+42)),(229,229,229));d=ImageDraw.Draw(sheet)
    labels=[]
    for j,(f,im) in enumerate(images):
        x=(j%columns)*cw;y=(j//columns)*(ch+42)
        status="BEFORE" if f["captureQpcAfter"]<beg else ("AFTER" if end and f["captureQpcBefore"]>end else "DURING")
        labels.append([f["index"],status,hashes[f["index"]]])
        sheet.paste(im.resize((cw,ch)),(x,y+42))
        d.text((x+4,y+5),f'{typ} {f["index"]:03d} {status}',fill=(22,22,22))
        d.text((x+4,y+22),hashes[f["index"]],fill=(44,44,44))
    out=io.BytesIO();sheet.save(out,"JPEG",quality=76,optimize=True)
    encoded=base64.b64encode(out.getvalue()).decode()
    print("G28_EVIDENCE|"+json.dumps({
       "type":typ,"allFrames":len(frames),"sampledFrames":len(images),
       "startUTC":events["start"]["utc"],"endUTC":events.get("commit",{}).get("utc"),
       "framesBefore":sum(f["captureQpcAfter"]<beg for f in frames),
       "framesAfter":sum(bool(end and f["captureQpcBefore"]>end) for f in frames),
       "framesInOrStraddle":sum(not(f["captureQpcAfter"]<beg or (end and f["captureQpcBefore"]>end)) for f in frames),
       "distinctPixelsLast17":len(set(hashes.values())),"changes":changes,"panels":labels},separators=(",",":")),flush=True)
    print(f"G28_IMAGE_BEGIN|{typ}|{len(out.getvalue())}",flush=True)
    for i in range(0,len(encoded),4000):print("G28_IMAGE_PART|"+typ+"|"+encoded[i:i+4000],flush=True)
    print("G28_IMAGE_END|"+typ,flush=True)
print("G28_ANALYSIS_DONE|2",flush=True)
