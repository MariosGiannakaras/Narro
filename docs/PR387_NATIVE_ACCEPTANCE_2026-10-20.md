# PR387 native acceptance — Success ON closure

**Capture3/3, review3/3, scoped native PASS3/3.** Both confirmed first-success next-row omissions are corrected. First/next/last success now exposes a coherent summary, remaining queue and Done projection from its first acquired success frame. RA01-A and RA02-A/B narrow corrective scopes are closed; this does not close whole M5/M6 or source pixel/motion parity.

## Exact implementation and executable

- [PR387](https://github.com/MariosGiannakaras/Narro/pull/387) head `cdd88335c920f423630f322e7ba0c25dbba7f3c0`, [exact CI39386125624](https://github.com/MariosGiannakaras/Narro/actions/runs/39386125624) **validation/fast/Windows3/3 SUCCESS**.
- Expected-head guarded squash merge `9e631952158c5c6b9763e0e0d79e33b79e8c7ca3`; prospective and actual merge tree identical, all3 changed source/test/driver blobs and full runtime/build/test/workflow inputs equivalent. Main differs from tested head only by unconsumed tracking Markdown. [Proof packet](../work-log/evidence/focus-first-success-20261020/README.md).
- Physical artifact12248223263 ZIP SHA256 `a330ba6697872a41e61bcbc3c8ae3d257dad39c15955623be3371f7dc20af4cd`, CRC and safe extraction verified. Actual `narro.exe`16201728bytes SHA256 **`ef9cdb9f2d9d62ce14d3b4a8b295403fef420b82ab0aaab133725b5eca8778e4`**.
- Actual Windows visual artifact12247857998 CRC/digest verified, all4 light/dark×normal/reduced HTML contracts contain all9 required nativeHandoff receipts. Local production matrix4/4 and complete frontend preflight/TS/build/Rustfmt passed. Genuine old-source first-success RED retained. Local Rust compilation NOT RUN(missingMSVClink.exe); authoritative Windows compilation/Clippy/Rust tests PASS.
- Exact resulting-main [CI39389033088](https://github.com/MariosGiannakaras/Narro/actions/runs/39389033088) **3/3 SUCCESS**. Actual mainWindowsvisualZIP12249212632 CRC/digest and4/4x9receipts verified. PhysicalZIP12249543153 SHA256 `d848ef4bbade73d32219bde33845944bf1a0dfae30698202869d8e2cb480c273`; mainEXE SHA256 `bced8a9f533fedb726bedc7fa2d90eec98324b2f9b15db77b8f1ad1c79b5f909`. MSI/NSIS digests in main-package proof. Native ran explicitly equivalent greenPR EXEef9cdb9f, never relabeled as mainpackage bytes. No duplicate manualCI or new physical rerun.

## Environment, procedure and protection

Actual Windows10Pro19045, RadeonRX570,2560×1080/144Hz, one active monitor. Dark theme/normal OS motion, owned Focus HWND789904 stayed unchanged; physical region2220,0,340,700. DPI not independently probed; no invented DPI/source-pixel claim. Original OS reduced setting0/false restored after normal-motion test. OBS stayed stopped(StartRecording00:00); DXGI DesktopDuplication240 acquisition ceiling/dup_frames0/VFR/source encoder timebase1:1000000 records actual ~144desktopframes/s without frame synthesis. Real Sky keyboard/XY input grounded in fresh GDI/UIA; no WGC retry loop.

Fresh original SQLite backup/quickcheck/hash before isolated9-task profile; original namespace preserved, then restored hash-identically to `13185e54bc0ea08f3b368ccc48a8ede429683e1d58a60b15b8f7491a06d2224d`. Exact-owned process18384 stopped after final idle state; transient WebView profile lock cleared on bounded recovery. No owned app/recorder remains running; original motion restored. Completed ledger must NEVER be replayed. Personal backups/ledger excluded from evidence.

Prepared fixture SuccessON, global shortcuts/autostart/alerts disabled. Ordinary Board Blitz entry uses existing global/AllLists Focus scope and initially started CompleteFirst. Explicitly selected RA02LastTask and made OnlyEligible live before capture. That preparation produces one separate113s setup work segment, not a duplicate tested start. No claim that this existing entry/scope behavior is newly changed or fully parity-validated.

All3 test cases were executed once. Two original120s clips preserve the entire useful sequence: the first finite cap ended at the stable second-success screen, then the second starts from that same state and covers final Next/Done/rest. Initial one-clip plan was adjusted at a neutral boundary; no test transition falls in the gap and no completed case was rerun. First recorder stdin was closed; automatic120s cap stopped it cleanly. Second had a controllable TTY and also ended cleanly. Originals remain unchanged, including pauses between actions.

## Frame results

[Full evidence](../work-log/evidence/pr387-native-20261020/README.md). Zero-based decoded frame indices and original PTS seconds are authoritative. Action UTCs are chronological alignment only. Review covers every frame in the named boundary windows plus before/after UIA/screenshots/DB; not all34545 frames manually scrutinized. Whole-stream pixel-delta analysis only locates transitions and does not create PASS.

| Requirement | Original / reviewed frames | First success or settled frame | Result |
|---|---|---|---|
| ONfirst, two remaining | ON-acceptance-original,4390–4411/30.508–30.648s | **4399/30.565s** | **PASS**: ready1/3+EST20min, ONNext and ONThird both present immediately, correct Done1. No old pending summary/next-row omission at success. |
| ONnext, one remaining | same original,15483–15508/107.596–107.761s | **15499/107.699s** | **PASS**: ready2/3+EST10min and ONThird immediately present, correct Done2. |
| ONlast, none remaining | ON-last-rest-original,9730–9753/67.587–67.754s | **9741/67.671s** | **PASS**: ready3/3+EST—, no Next action/remaining row, completed ONThird in Done3. |
| ExplicitNext twice | first8268–8280/57.447–57.526s; last6570–6588/45.644 onward | first8275/57.492 and last6583/45.724s | **Functional PASS**: disabled Starting feedback, then authoritative Running; exactly one corresponding work segment per click. Pointer over live card invokes the established hover action rail, so title can be hidden without losing identity; UIA and DB preserve actual next identity. |
| Final untimed rest | last13560–13581/94.194–94.333s | **13570/94.257s** AllClear | **PASS**: no new task timer or timed Break session. Native tooltip partly outside the narrow ROI is an acquisition bound, not proof of product clipping. |
| Feedback expiry | last14757/102.502s and17275/119.995s, plus final native UIA | >8s and>25s after rest | **PASS scoped RA02-B**: no obsolete now-live message returns, correct3/3+Done3 retained. |

Pending Completing/Starting feedback before authoritative success is explicit and noninteractive. In particular a next row may be withheld during Completing; the fixed requirement is that ready success+fresh board no longer retains that obsolete pending intent. Finite progress-fill animation after numeric counts change is preserved; this review does not certify exact Blitzit easing/timing.

The first original has17269frames/119.999s, strictly increasing PTS/maxgap20ms globally; second17276frames/119.999s, strictly increasing PTS/maxgap16ms. Critical success-window max gaps are9ms(first),8ms(next),16ms(last),0duplicatePTS. No interpolation, retiming or duplicate-frame filler. Rawvideo analysis can emit output-timebase DTS quantization warnings; original ffprobe PTS and decoded-frame count match and are preserved separately, so do not misclassify those decoder-output warnings as original capture duplicates. Absence claims are bounded to acquired frames/144Hz desktop cadence.

## Persistence and evidence reuse

All9 original task IDs remain unique/unchanged; exactly3 ON tasks completed. Four closed work segments: CompleteFirst113s(setup), OnlyEligible92s, ONNext50s, ONThird21s. Zero timed Break sessions, zero open runtime checkpoint, no duplicate tested next-start. Filtered before/after snapshots and `analysis/persistence-receipts.json` support this; no personal DB published.

Reuse [PR386 RA01/OFF review](PR386_NATIVE_RETEST_2026-10-20.md) for unaffected Board4/4 and OFF2/2 paths. PR387 changes only guarded SuccessON publication plus test/driver; it does not materially change those paths. This is combined coverage of9 core requirement cases from explicitly identified artifacts, **not a claim that all9 were rerun on this latest EXE**. Historical PR3867PASS/2FAIL remains immutable, with its two failures superseded by corrected native results here.

| Already-open gate/surface | What this same session establishes | What remains open |
|---|---|---|
| M6/RA02-A | Three corrected first-success cases nativePASS | Whole Focus/source fidelity not closed. |
| M6/RA02-B | Final untimed-rest/no-old-status/native persistence PASS | No unrelated sound/notification acceptance. |
| M6/B63 inline success | Actual retained header/queue/Done and inline success composition observed3times | Exact canonical geometry/media/motion separate. |
| M6/A3 selector | Actual pointer selection/filtering of RA02LastTask observed | Complete source/keyboard parity not exercised. |
| M5/B23 Home previews | Initial native screenshot shows muted independent preview rows/subdued ordinals/trailing time presence after merge | Exact source geometry/row-time meaning not established; no source patch from different datasets. |
| M1 host | Same owned Focus HWND during these cases | No Panel↔Timer, performance, topology, DPI or hotplug revalidation. |
| M7/M8/M9 and M10 | Not sufficiently exercised | No checkbox/counter advanced. M10 hard entry gate unchanged. |

Mandatory milestone acceptance remains4/10(M1–M4), remaining M5–M9 groups and gated M10 in [remaining snapshot](REMAINING_ACCEPTANCE_2026-10-20.md). Optional M11/M12 dormant. No protected SpectrumCore picker/upload/218icons or other-owner PR344 changes. No additional user action is needed for RA01/RA02 closure.
