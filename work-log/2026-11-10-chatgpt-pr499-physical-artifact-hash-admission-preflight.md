# 2026-11-10 — Independent PR499 physical candidate ZIP integrity and admission preflight

## Authority, scope and result

**Independent non-executing preflight** by ChatGPT for [draft PR499](https://github.com/MariosGiannakaras/Narro/pull/499), which remains **OPEN/UNMERGED** at exact `ae0447c4bebd49215f0c49eb8cd9acf0db8fc80c`. Existing exact-head [CI42632330444](https://github.com/MariosGiannakaras/Narro/actions/runs/42632330444) already **3/3 PASS**. No new build, source change, on-host admission, Windows launch, physical test, recording or AppData change was performed. This is archive integrity + exact source provenance only, **not a native PA PASS**.

Downloaded original GitHub Actions artifact `narro-m7-physical-windows-x64`, artifact ID **13683936109** (run42632330444; 16,630,228 bytes). Rehashed entire downloaded archive:
- ZIP SHA256 **`679b6080e58c42b82ec4f1f495c9642389cbc261bc53aa579ffed866e66e821a`** — **PASS**, equals independently fetched GitHub provider artifact digest.
- ZIP integrity `testzip()` — **PASS**, no corrupt member.
- `artifacts/ci-provenance/physical.json`: `schema=narro-ci-artifact-provenance/v1`, `kind=physical`, `sourceSha=ae0447c4bebd49215f0c49eb8cd9acf0db8fc80c`, `githubRunId=42632330444`, `githubRunAttempt=1`, `observationFeatures=[physical-observability]`.

## All four manifest members independently read and rehashed

| Exact internal path | Bytes | SHA256 | Check |
| --- | ---: | --- | --- |
| `scripts/physical-session.mjs` | 34,424 | `cf65ed54a8743bbc7c66018d09d87ccd555affd24f96f443562294d110174f08` | PASS |
| `src-tauri/target-physical/release/narro.exe` | 17,387,008 | `a03daf92285a6bdb32a11e79b19c99a57ab4875f92485d6cd157d09aeae8d3ed` | PASS |
| `src-tauri/target-physical/release/bundle/nsis/Narro_0.1.0_x64-setup.exe` | 4,443,143 | `dc5793420a4192d41854a4e66eee1e6e092b29fbc7cc9fbaaa46ec901a7aa777` | PASS |
| `src-tauri/target-physical/release/bundle/msi/Narro_0.1.0_x64_en-US.msi` | 6,258,688 | `30843eba63846791dab30e8c8814e703e2b2669906bcef2ca79c8506b06d368f` | PASS |

Verified the EXE's MZ/PE header, AMD64 machine `0x8664`, PE32+ optional-header magic `0x20b` — **PASS, packaged binary is Windows x64**. Verified archive supervisor source against actual PR499 Git blob `9c6fcf3c1a5ecf004c7435c8023b5860aa1e659d`: packaged file has Windows CRLF line endings (497 CRLFs); canonical LF conversion yields Git blob SHA-1 **exactly** `9c6fcf3c1a5ecf004c7435c8023b5860aa1e659d`. Raw Windows checkout line endings are not a source mismatch.

## Important controller/upload compatibility

The immutable **PR499** package includes `scripts/physical-session.mjs` and `physical.json` but **does not contain `scripts/upload-physical-evidence.py`**. Its packaged supervisor has no `uploadFrozenEvidence` invocation; CLI collect/recover only collects/recovers. This is expected chronology: immediate uploader functionality was subsequently integrated by [PR500](https://github.com/MariosGiannakaras/Narro/pull/500), resulting-main validation completed separately. **Never replace or mutate the already admitted PR499 controller/EXE with a PR500 controller or use the PR500 executable to claim PR499 native outcomes.** For a fresh PR499 physical session, after the original admitted supervisor has safely frozen/collected the packet and all owned processes/recorder are closed, run the now-current standalone `scripts/upload-physical-evidence.py --root <exact-frozen-session-path>` under authenticated GitHub CLI to upload to **private draft release only**, verify remote bytes/hash and keep its receipt. A failed upload remains pending and local originals are preserved. Standalone upload is a separate post-freeze action; it is **not** a modification of the admitted controller.

## Next exact action / unresolved proof

The next available action is **on the already authorized Windows physical operator's machine**, not source rework: obtain this exact immutable PR499 ZIP, confirm archive/EXE/controller/manifest SHA, admit the actual executable's disk path/PID/feature/source and normal operator environment, and acquire the fresh D01/M8 preferences cross-surface, D02/M5 competing icon uploads, D03/M7 native presentation/raster watchdog and D04/M9 SQLite-lock UI responsiveness cases as appropriate under [PR499's canonical case delta](../docs/PHYSICAL_ACCEPTANCE_NEW_RECORDING_BASELINE_2026-11-06.md#pr499-d01d05-corrected-source-physical-acceptance-delta). D05 is CI-only. Original video/frame PTS and correlated native/log records are required to grade each exercised claim; hard-to-provoke race/fault claims stay NOT RUN if not actually demonstrated. Do not infer an outcome from package integrity.

The nine old physical ZIPs and two small verification-named ZIPs in private draft release ID439408831 have not had their authenticated **raw bytes** reviewed by this GitHub-only connection; existing private draft release metadata does not establish PR499 physical provenance. All **59 M5–M9 documentary acceptance rows remain OPEN** (6/13/18/11/11). Held ancestors and independent A389/B419 strict 8/8 are unchanged. No additional branch or PR, source change, physical run, native acceptance or source Blitzit comparison resulted from this integrity preflight.
