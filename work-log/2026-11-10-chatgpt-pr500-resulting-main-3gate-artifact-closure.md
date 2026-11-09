# 2026-11-10 — PR500 integration closure: exact PR and resulting-main PASS

## Scope / owner

Owner: ChatGPT, source workflow, explicitly reassigned by user from Codex on 2026-11-09. Scope is **private immediate upload of already safely frozen Narro physical evidence**, not a new physical acceptance campaign or an application-source change. [PR500](https://github.com/MariosGiannakaras/Narro/pull/500) was continued on its existing branch `fix/immediate-physical-evidence-upload`; no second PR or fresh Windows physical recording was created.

## Corrections and tests

- `scripts/physical-session.mjs`: excluded uploader-owned root `UPLOAD_STATUS.json` and `UPLOAD_RECEIPT.json` from immutable frozen inventory; retains original `collectedUtc` when the recomputed index payload and evidence are otherwise identical on repeated `collect/recover`. Real changes still regenerate index/asset identity.
- `scripts/upload-physical-evidence.py`: `tempfile.TemporaryDirectory` safely erases staged private desktop ZIP on **success and failure**. Existing private draft-release guard, remote size/SHA-256 verification and canonical ZIP metadata are preserved.
- `scripts/test-physical-session.mjs`: repeatedly collects the same fixture packet while varying uploader status/receipt timestamps; asserts exact index byte stability and no root uploader-owned evidence inventory.
- `scripts/test-physical-evidence-upload.py`: failure-injected remote upload and published-release refusal assert staged ZIP removal, original frozen media retention and absence of a false success receipt.
- `docs/PHYSICAL_EVIDENCE_UPLOAD.md` explains stable packet identity, error cleanup and required independent privacy protections.
- **Fast frontend/contract gate actually executed and passed** the physical-session regression and uploader Python tests. Normal Windows Rust, physical-observer, visual, release, physical and diagnostic checks actually passed in the exact-head Windows candidate.

## Exact PR-to-main validation chain

- PR head: **`8e8300d7dd802f9a26a4b2c19953a55cfae85306`**.
- PR run: [Windows CI42682593487](https://github.com/MariosGiannakaras/Narro/actions/runs/42682593487), completed **SUCCESS**: validation-gate **PASS**, fast-gate **PASS**, windows-candidate **PASS**.
- Guarded merge: [PR500](https://github.com/MariosGiannakaras/Narro/pull/500), expected-head checked, **MERGED**, resulting-main commit **`e8ad714be29854528f502877fae1d8723327af60`**.
- Main CI: [run42687119235](https://github.com/MariosGiannakaras/Narro/actions/runs/42687119235), **push to exact merge SHA**, completed **SUCCESS**: validation-gate **PASS**, fast-gate **PASS**, windows-candidate **PASS** (3/3).
- Seven resulting-main artifacts, all GitHub metadata source SHA **`e8ad714be29854528f502877fae1d8723327af60`**:
  - `narro-m7-physical-windows-x64` **13705369955**
  - `narro-m7-validation-windows-x64` **13706781979**
  - `narro-m1-diagnostic-windows-x64` **13706288783**
  - `narro-m5-visual-regression` **13706620863**
  - `narro-m7-focus-runtime-visual` **13706357527**
  - `narro-fast-frontend-dist` **13704518484**
  - `narro-ci-bundle-download-attempts` **13706473303**
- Independently downloaded resulting-main physical artifact ID **13705369955**, examined `artifacts/ci-provenance/physical.json`; `sourceSha=e8ad714...`, `githubRunId=42687119235`, `observationFeatures=["physical-observability"]`. **All five manifest files verified SHA-256 and length PASS**, including Narro EXE, session supervisor, private evidence uploader, NSIS and MSI. Important exact EXE SHA-256: **`c6d610695b636c7ad5d2ac71d840f9d65e1cbd733ebf4ba080b04f581082f848`**. The resulting-main physical artifact is a different source candidate than held PR499, even though the uploader fixes now exist in main.
- Independently compared the five affected main files to the exact PR head after merge; all five Git blob identities matched, including both regression test files, supervisor, uploader and upload protocol.
- The older PR500 head `e58ad53119ccd1e3036c11351e8a648add363b31` and no-job [run42672076433](https://github.com/MariosGiannakaras/Narro/actions/runs/42672076433) remain **historical FAIL**, not silently reclassified.

## Explicit independent holds / next operation

- Physical PA tests and source-Blitzit parity are **NOT RUN here**. The 59 M5–M9 documentary acceptance rows (6/13/18/11/11) remain **OPEN**, not evidence of 59 bugs. No Windows installation, run, AppData edit or new recording was performed in this source chat.
- Nine older physical session/campaign ZIPs remain in a **private draft GitHub release**. Upload size/SHA metadata is known, but this ChatGPT connector cannot fetch their private raw video/PTS/full-stack log bytes, hence **independent frame/causal grading is NOT RUN**.
- Application [PR499](https://github.com/MariosGiannakaras/Narro/pull/499), head `ae0447c4bebd49215f0c49eb8cd9acf0db8fc80c`, stays **DRAFT/OPEN/UNMERGED** with its own exact-head 3/3 technical CI; PR437 and independent A389/B419 strict physical-before-merge holds remain. PR500's completion **does not close or waive these**.
- Next single action: designated Windows physical agent admits the **PR499 exact source candidate** artifact id **13683936109** (not this resulting-main uploader artifact), verifies source/controller/EXE SHA/feature/PID/path, and acquires/grades fresh PA-01–09 and D01–D04 native cases with original video PTS and correlated logs. Physical authority is already available to that agent, not this GitHub-only session; Codex-initiated PA remains USER-PAUSED separately. Actual new packet bytes must be uploaded privately and reviewed before any native PASS or PR499 merge.
