# 2026-11-09 — D01-D05 narrow pre-physical source correction (evidence checkpoint)

## Source ownership and exact provenance

- Active owner: ChatGPT; PR [#499](https://github.com/MariosGiannakaras/Narro/pull/499), DRAFT/OPEN, branch `fix/prephysical-d01-d05-20261109`.
- PR499 descends from held PR437 at `ccdd993ca9808e36f0c23e626dbcc4eea62e9a49`; it is not another competing standalone M7 source. Preserve independent PR389/419 strict 8/8 gates, PR431/436 upstream requirements and motion/source parity ownership.
- Corrective candidate head `ae0447c4bebd49215f0c49eb8cd9acf0db8fc80c`, [CI42632330444](https://github.com/MariosGiannakaras/Narro/actions/runs/42632330444): validation and fast SUCCESS; Windows candidate still RUNNING at this checkpoint. Rust Check, Clippy and Rust Tests have independently reported SUCCESS within the running Windows job; remaining observer/fixture/package gates not yet settled. Earlier exact-head attempts failed on recorded original code-contract assertions, genuine VM-harness cross-realm assertion handling and rustfmt; those SHAs remain historical FAIL.
- Compared branch with exact PR437 ancestor: ahead23 commits, behind0,15 changed paths; narrowed to Preferences, List Editor, default raster watchdog, Reports command and their executable/source tests/preflight. No original Blitzit or approved Spectrum/218 icons/compositor A/B source changes.

## Why the existing proof needed correction

1. D01: Actual provider updates previously applied save/recovery replies regardless of newer cross-window committed events. A plain event-count guard cannot identify a later own save after an earlier external event. Solution has serialized server commit revision, revision-aware publisher, authoritative post-save read on concurrent event, stale recovery guard and disposal exclusion. No persistence migration.
2. D02: File validation awaited `File.arrayBuffer()` outside the synchronous icon draft/Save ownership. A later chosen PNG could lose to an older read, or Save could persist the previous icon before validation. Solution synchronizes request/disposal/invalid selection, prevents pending Save, releases preview blob URLs under draft ownership and preserves existing design.
3. D03: Default watchdog returned after a transient busy presentation gate at expiry while retaining the Rust native raster lease. Existing A/B off-thread retry and its Rust regressions were reconciled into default; no new claim about historical mutex poison causality.
4. D04: Create manual Reports session already used `spawn_blocking`, while reads and Edit/Delete held SQLite on sync Tauri commands and CSV/PDF output could perform blocking IO. Offload existing commands via existing `blocking_read`/`run_manual_session_write` helpers, preserving CAS, error identity, transaction ordering and postcommit invalidation. The existing real-lock helpers give supporting library evidence, **not** a measured command-level UI freeze or native retest.
5. D05: Reports actual source-producer test extracted a LF-only source slice. EOL normalization plus explicit CRLF equivalence retains the semantic assertions.

## Validation scope and restrictions

- New real compiled-provider order/disposal regression, actual List Editor PNG/invalid/reorder/pending/disposal tests, and per-command Rust owner contract added to frontend preflight.
- The exact candidate passed Linux frontend tests/build and rustfmt; Windows Rust check/Clippy/unit tests passed during this observed in-progress CI checkpoint. Full exact-head CI not yet marked 3/3; only actual final run result can do that.
- No physical Narro EXE was launched through this repository-only session. No new native input/drag/display/motion/Windows pause/restart recording, full-stack trace/PTS analysis, frame-by-frame native comparison, or Blitzit source parity test was performed. No M5-M9 acceptance row can be counted closed from this source-only work.
- Previous F01-F06 correction identity and exact prior head 437/389/419 CI/packages remain their own bounded evidence. A corrected executable needs its own Windows CI artifact and physical gates.
- M1-M4 accepted; M5-M9 59 rows remain OPEN (6/13/18/11/11); M10 user approval hold; M11/M12 independently dormant.

## Single next operation

Resume the exact PR499 head/run in HANDOFF. If CI42632330444 completes PASS, record exact build and exercise the dependency-safe source-specific pre-physical/native criteria without bypassing independent A/B holds. If it fails, read the first failed job/step/log, correct the demonstrated issue and require a new exact-head CI run.