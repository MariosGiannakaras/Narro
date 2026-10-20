# Frozen partial acquisition — 2026-10-20

**Capture only, not an acceptance or analysis report.** User requested inventory/reuse plus recording of all 57 remaining M5–M9 lines, then upload. Inventory 57/57; new surface material 42/57 (25 surface packets and 17 partial packets), 3 scenarios not exercised, 1 analysis/reconciliation wrapper deferred, 11 Reports lines NOT RUN. These are acquisition labels, not PASS counts or proof every substate was exercised.

Computer Use imposed a mandatory turn stop while observing isolated Edge for the F11/borderless scenario: it could not verify the current browser URL well enough to enforce policy. No fullscreen action or further Windows input followed. Cleanup used only guarded process termination/profile restoration and evidence publishing. Personal profiles are restored with the original database hash identical. No source/config/test fix, build or CI was run.

## Evidence

- `requirements.json`: all 57 full TODO requirements, existing evidence routing and acquisition limits. Each verdict remains NOT_ANALYZED.
- `actions.jsonl`: chronological factual actions/UTC/bookmarks. An attempted input or an initial planned group marker does not prove completion. Some actions failed or triggered window recreation; preserve their explicit outcomes.
- `clips.jsonl`: automatically bounded 180-second DXGI segments. The recorder is checked/restarted before subsequent button actions. Starts are process-launch UTC, not calibrated first-frame UTC. Earlier manual finite clips ended independently, so do not infer continuous video coverage from the full journal span.
- `media-metadata.json`: 12 original videos, metadata-only ffprobe results and integrity. Includes setup/health and imperfect OBS starts; not 12 accepted test films. Windows file-created times and copied OBS filenames are provenance aids, not exact action-to-frame sync.
- `screenshots/`, `observations/`: physical GDI screenshots, Sky snapshots and fresh read-only native UIA geometry. Sky accessibility sometimes lagged rendering; preserve both records, do not use stale indexes/handles for new inputs.
- `system-audio-original.wav`, `audio-start.json`, `audio-metadata.json`: actual Windows output loopback, no microphone. Only 3.264 seconds were acquired across a longer wall-clock span; **discontinuous/unmapped audio, no audio PASS or exact AV sync**.
- `observations/final-owned-state.json`: retained synthetic test namespace only. Not the personal database. Fixture rows/sessions were explicitly seeded before launch and do not prove user create/history operations.
- `original-profile-restoration-proof.json`: original user database hash unchanged after restoration.

The user personally accepted color-picker and built-in icon operation. This is USER_ATTESTED_PASS with no video claimed; image upload/list rendering were explicitly excluded from that attestation. Actual upload chooser/list-create actions and image fixture are in this packet for later review. No whole M5 acceptance is advanced.

## Reconstruct exact original videos

Original MKV bytes exceed GitHub's per-file limit in two cases. All twelve originals are published as ordered <=40 MiB **byte chunks**, with original and per-part SHA256 in `video-parts.json`. Original local MKVs were not altered. Reassembly makes an exact byte-identical original, with no crop, transcoding or frame changes. Run Python from this evidence directory:

```python
from pathlib import Path
import hashlib, json
root = Path.cwd()
out = root / "reconstructed-videos"
out.mkdir(exist_ok=True)
for entry in json.loads((root / "video-parts.json").read_text()):
    target = out / entry["file"]
    if target.exists():
        assert hashlib.sha256(target.read_bytes()).hexdigest() == entry["sha256"]
        continue
    with target.open("xb") as stream:
        for part in entry["parts"]:
            data = (root / part["path"]).read_bytes()
            assert len(data) == part["bytes"]
            assert hashlib.sha256(data).hexdigest() == part["sha256"]
            stream.write(data)
    assert target.stat().st_size == entry["bytes"]
    assert hashlib.sha256(target.read_bytes()).hexdigest() == entry["sha256"]
```

## Continuation

A new authorized Computer Use turn may resume **Reports C47–C57 first**, using a newly protected profile and current verified executable. The previous isolation ledger is COMPLETED/ORIGINAL_PROFILES_RESTORED; NEVER replay it or act on stale HWNDs/PIDs. Reuse the retained owned fixture only after a fresh ledger and source check. Preserve these immutable clips; no need to repeat adequately captured states.

Remaining targeted acquisition: actual Timer movement/bottom-edge/restart (C21/C31/C33), automatic POMO Break (C09), actual timed flash (C45), missing Skip and complete reduced-motion/normal continuity scopes, stable continuous system audio, plus scoped partial-state gaps in `requirements.json`. C32 borderless fullscreen is NOT RUN. M10 entry, optional M11/M12 and source-original parity claims remain unchanged. Do not turn attempted gestures, source fixtures or wrappers into physical PASS.

Only after acquisition is frozen should the next phase analyze video/frame motion, compare canonical Pass3/current code, disposition each requirement and batch confirmed corrections. No substantive video analysis was performed here.
