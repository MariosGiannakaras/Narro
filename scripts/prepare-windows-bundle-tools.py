"""Preload the exact Tauri CLI2.11.4 tools through GitHub's asset API.

No installer/hash checks are disabled. Public immutable asset IDs and SHA256
pins avoid the release-download route that repeatedly returned HTTP504.
"""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import stat
import sys
import time
import urllib.error
import urllib.request
import urllib.parse
import zipfile

TOOLS = [
    dict(name="wix.zip", repo="wixtoolset/wix3", asset=158158052, bytes=41297555,
         sha256="6ac824e1642d6f7277d0ed7ea09411a508f6116ba6fae0aa5f2c7daa2ff43d31"),
    dict(name="nsis.zip", repo="tauri-apps/binary-releases", asset=317051073, bytes=2361546,
         sha256="c7d27f780ddb6cffb4730138cd1591e841f4b7edb155856901cdf5f214394fa1"),
    dict(name="nsis_tauri_utils.dll", repo="tauri-apps/nsis-tauri-utils", asset=345882097, bytes=34304,
         sha256="5ba143b5db4a87d32d6e7802e033330aae56cbceabe0d1e3ba41948385ad4709"),
]
WIX_REQUIRED = ["candle.exe", "candle.exe.config", "darice.cub", "light.exe", "light.exe.config",
                "wconsole.dll", "winterop.dll", "wix.dll", "WixUIExtension.dll", "WixUtilExtension.dll"]
NSIS_REQUIRED = ["makensis.exe", "Bin/makensis.exe", "Stubs/lzma-x86-unicode", "Stubs/lzma_solid-x86-unicode",
                 "Plugins/x86-unicode/additional/nsis_tauri_utils.dll", "Include/MUI2.nsh", "Include/FileFunc.nsh",
                 "Include/x64.nsh", "Include/nsDialogs.nsh", "Include/WinMessages.nsh", "Include/Win/COM.nsh",
                 "Include/Win/Propkey.nsh", "Include/Win/RestartManager.nsh"]

def verify(data, tool):
    if len(data) != tool["bytes"] or hashlib.sha256(data).hexdigest() != tool["sha256"]:
        raise ValueError("Pinned bundle-tool size/SHA256 mismatch: " + tool["name"])
    return data

def extract(data, destination, prefix=""):
    destination = destination.resolve()
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        if archive.testzip() is not None:
            raise ValueError("Bundle-tool ZIP CRC failed")
        entries = []
        for info in archive.infolist():
            name = info.filename.replace("\\", "/")
            if prefix:
                if not name.startswith(prefix):
                    raise ValueError("Unexpected bundle-tool archive prefix")
                name = name[len(prefix):]
            target = destination / name
            if not target.resolve().is_relative_to(destination) or stat.S_ISLNK(info.external_attr >> 16):
                raise ValueError("Unsafe bundle-tool archive member")
            entries.append((info, target))
        for info, target in entries:
            if info.is_dir():
                target.mkdir(parents=True, exist_ok=True)
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(archive.read(info))

class AssetRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, newurl):
        parsed = urllib.parse.urlsplit(newurl)
        if parsed.scheme != "https" or parsed.hostname not in {
            "api.github.com", "github.com", "release-assets.githubusercontent.com", "objects.githubusercontent.com"
        }:
            raise urllib.error.URLError("Unexpected GitHub asset redirect")
        redirected = super().redirect_request(request, fp, code, message, headers, newurl)
        if parsed.hostname != urllib.parse.urlsplit(request.full_url).hostname:
            redirected.remove_header("Authorization")
        return redirected

def download(tool, records):
    url = f'https://api.github.com/repos/{tool["repo"]}/releases/assets/{tool["asset"]}'
    headers = {"Accept": "application/octet-stream", "User-Agent": "Narro-bundle-tool-bootstrap",
               "X-GitHub-Api-Version": "2022-11-28"}
    token = os.environ.get("GH_TOKEN")
    if token:
        headers["Authorization"] = "Bearer " + token
    for attempt in range(1, 4):
        try:
            # Cache separation prevents a stale JSON/504 response being reused
            # across attempts. The URL still addresses the same pinned asset.
            request = urllib.request.Request(url + "?narro=" + str(time.time_ns()), headers=headers)
            with urllib.request.build_opener(AssetRedirect()).open(request, timeout=60) as response:
                data = response.read()
            verify(data, tool)  # A mismatch fails immediately, never retries.
            records.append(dict(name=tool["name"], attempt=attempt, result="VERIFIED", sha256=tool["sha256"]))
            return data
        except (urllib.error.URLError, TimeoutError) as error:
            records.append(dict(name=tool["name"], attempt=attempt, result="FAILED", error=str(error)))
            if isinstance(error, urllib.error.HTTPError) and error.code not in (408, 429, 500, 502, 503, 504):
                raise
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)
    raise RuntimeError("Unreachable download state")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--cache-root")
    parser.add_argument("--assets-dir", type=Path, help="Verify already downloaded official pinned assets for local testing")
    args = parser.parse_args()
    project = Path(__file__).resolve().parent.parent
    version = json.loads((project / "package-lock.json").read_text(encoding="utf-8"))["packages"]["node_modules/@tauri-apps/cli"]["version"]
    if version != "2.11.4":
        raise ValueError("Update the reviewed tool/cache pins for Tauri CLI " + version)
    if not args.cache_root and (os.name != "nt" or os.environ.get("GITHUB_ACTIONS") != "true"):
        raise ValueError("Local validation requires an explicit owned --cache-root")
    cache = Path(args.cache_root or (Path(os.environ["LOCALAPPDATA"]) / "tauri")).resolve()
    if cache == Path(cache.anchor):
        raise ValueError("Require a dedicated tool-cache directory")
    receipt = {"cliVersion": version, "source": "official GitHub release asset API; pinned SHA256",
               "sourceSha": os.environ.get("NARRO_CI_SOURCE_SHA"), "run": os.environ.get("GITHUB_RUN_ID"),
               "runAttempt": os.environ.get("GITHUB_RUN_ATTEMPT"),
               "cacheRoot": str(cache), "attempts": [], "status": "PREPARING"}
    output = project / "artifacts/ci-bundle-tools-downloads/TOOLS.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    try:
        data = {tool["name"]: verify((args.assets_dir / tool["name"]).read_bytes(), tool)
                if args.assets_dir else download(tool, receipt["attempts"]) for tool in TOOLS}
        extract(data["wix.zip"], cache / "WixTools314")
        extract(data["nsis.zip"], cache / "NSIS", "nsis-3.11/")
        plugin = cache / "NSIS/Plugins/x86-unicode/additional/nsis_tauri_utils.dll"
        plugin.parent.mkdir(parents=True, exist_ok=True)
        plugin.write_bytes(data["nsis_tauri_utils.dll"])
        for folder, required in [("WixTools314", WIX_REQUIRED), ("NSIS", NSIS_REQUIRED)]:
            for name in required:
                if not (cache / folder / name).is_file():
                    raise ValueError("Missing Tauri-required tool: " + folder + "/" + name)
        if hashlib.sha1(plugin.read_bytes()).hexdigest() != "75197fee3c6a814fe035788d1c34ead39349b860":
            raise ValueError("Tauri's own plugin hash would reject the cache")
        receipt["status"] = "VERIFIED"
        print("Pinned official WiX/NSIS/plugin API downloads and complete Tauri cache: PASS")
    except Exception as error:
        receipt["status"] = "FAILED"
        receipt["error"] = str(error)
        raise
    finally:
        output.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")

if __name__ == "__main__":
    main()
