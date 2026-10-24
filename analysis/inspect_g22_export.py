#!/usr/bin/env python3
"""Analysis-only PDF source-archive verification and page preview (no product changes)."""
import base64
import hashlib
import pathlib
import re
import subprocess
import tempfile

PDF = pathlib.Path("work-log/evidence/physical-gap-restart-20261024/exports/narro-overview-2026-09-24-to-2026-10-24.pdf")
assert PDF.is_file(), "Original PDF missing"
raw=PDF.read_bytes()
assert raw.startswith(b"%PDF-"), "Not PDF content"
print("G22_PDF_METADATA|bytes="+str(len(raw))+"|sha256="+hashlib.sha256(raw).hexdigest(), flush=True)

def run(*args):
    cp=subprocess.run(args,capture_output=True,text=True,check=True)
    return cp.stdout

info=run("pdfinfo",str(PDF))
print("G22_PDFINFO_BEGIN\n"+info[:7000]+"\nG22_PDFINFO_END",flush=True)
page=re.search(r"^Pages:\s*(\d+)",info,re.M)
assert page, "PDF page count unavailable"
pages=int(page.group(1))
assert 1<=pages<=30, "Unexpected page count"
text=run("pdftotext","-layout",str(PDF),"-")
print("G22_TEXT_BEGIN\n"+text[:18000]+"\nG22_TEXT_END",flush=True)
print("G22_PAGES|"+str(pages),flush=True)

with tempfile.TemporaryDirectory() as t:
    prefix=str(pathlib.Path(t)/"page")
    run("pdftoppm","-f","1","-l",str(min(pages,12)),"-scale-to","1150",
        "-jpeg","-jpegopt","quality=67",str(PDF),prefix)
    files=sorted(pathlib.Path(t).glob("page-*.jpg"))
    assert len(files)==min(pages,12),(len(files),pages)
    for i,p in enumerate(files,1):
        data=p.read_bytes()
        b=base64.b64encode(data).decode("ascii")
        label=f"G22-page-{i}"
        print(f"PAGE_BEGIN|{label}|{len(data)}",flush=True)
        for j in range(0,len(b),4000):
            print(f"PAGE_PART|{label}|{b[j:j+4000]}",flush=True)
        print(f"PAGE_END|{label}",flush=True)
print("G22_PDF_REVIEW_PREPARED|"+str(min(pages,12))+"/"+str(pages),flush=True)
