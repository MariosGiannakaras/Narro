# PR362 native cross-window acceptance — 2026-10-16

Acquisition **3/3 directions in1/1 recording**, aggregate review **3/3 scoped PASS**. The confirmed PA360-XW-SUBTASKS stale detail failure is closed on the final corrected executable. No whole M5/M6/M7 completion: M1–M4 remain **4/10**, M10 hard-blocked, M11 dormant.

## Exact candidate and integration

[PR362](https://github.com/MariosGiannakaras/Narro/pull/362), source `560efeb076d2ec167232b9d86aa3354f6893214b`, [WindowsCI38894130069](https://github.com/MariosGiannakaras/Narro/actions/runs/38894130069) **3/3 SUCCESS**, expected-head guarded merge `5dfbede3feaf69eee493427f109fcdc90fd79c4b`. All **554 executable/build/test/config input blobs and CI workflow identical** after merge; duplicate resulting-main38896834174 cancellation requested only after proof, not counted as a PASS. Artifact `narro-m7-validation-windows-x64` **12043788138**, provider ZIP SHA256 `49e2e5f1b55965607ab2bdcf5003a844f0ab2d3e4c59443aabd0f7d23d7cfc15`, CRC/x64 checksPASS; contained EXE SHA256 `434b7182266086dca541d85c229f1cc4c2db413e5812551501ad1ab2f380da48`. Runtime log records the same exact sourceSHA. Superseded0e9 candidate was never merged or physically accepted.

Full frontend preflight and exact Windows production-component semantic captures **4/4 themes/motion ×7 cross-window/failure invariants PASS**. Final synchronous committed-refresh latch preserves saved-write errors against late reads and rejects same-render retries; those injected failure paths are automated evidence, not fabricated physical fault injection. No Rust/window/CSS/approved picker/upload/218icon changes in PR362.

## Native result matrix

Both actual windows stayed open after explicit ShowMain: PID11752, MainHWND7801954, FocusHWND6099850. Main1800×1040 primary100%, Focus right-edge same primary; unchanged secondary125% remains simultaneously recorded. No primary/topology change. One new actual Today taskPA362Live/EST00:20, paused after22seconds; existing owned PA360 fixture and21 explicitly synthetic completed-history rows were seeded before launch. Seeded rows are not UI-create PASS.

| Direction | Actual exercise / final proof | Result |
| --- | --- | --- |
| Focus→Board | Focus creates second child, renames original, reorders and completes; already-expanded Board retains `Board draft retained`, both show1/2 and same two IDs/order/states. Raw033 state/DB, pairedPNG and continuous video. | **PASS** |
| Board→Focus | Board creates third child, renames completed child, reorders/completes; already-expanded Focus retains `Focus draft retained`, both show2/3 and same three IDs/order/states. Raw048. | **PASS** |
| Board→expanded Timer | Same Focus HWND goes compact→expanded; Board adds fourth child, renames/reorders/completes; Timer retains `Timer draft retained`, both show3/4 and same four IDs/order/states. Raw064; actual wheel066 reaches last row and draft inside300px viewport. | **PASS scoped** |

No receiver detail was closed/reopened to force synchronization. No task clone, lost child ID or extra session; 23tasks/two sessions includes22 preexisting owned fixture tasks and one prior fixture session. The observed second Delta-up click did not create another effective move; at least one actual reorder succeeded and DB/both UIs agree. Its exact non-effect cause is unestablished; do not turn an action label into proof of two moves or an unsupported app defect.

## Compatible observations and next correction

- **B26 Board Notes**: actual lower-right×Close, Save/reopen, dirty replacement/Close/reopen and larger editor open captured. Saved note/hash survives; unsaved replacement is discarded by existing explicit manual-Save policy. Direct SS-H10 comparison supports Board close-control location. Source pixels do not establish autosave/Cancel semantics; preserve the validated local policy. **Focus Notes was not exercised**, so shared B26/whole M6 remainsOPEN.
- **B43 Done**:22 owned completed tasks, four local-date groups/counts1/7/7/7, last synthetic row reached through real internal Main scroll; no data mutation. **SOURCE_VISUAL_FAIL / M5 FIX_NOW:** current header combines `Oct14,2026 ·7Done`; canonical SS-H01 has date left and separate `7tasks` right. Correct only that confirmed header discrepancy, with locale/singular/plural/long-label/layout coverage. Scrolling moved the overall internal Board content; no independent-Done-column scrolling PASS. Broader card/lane composition remains unaccepted; no speculative unrelated layout rewrite.
- **B62 empty Today**: subdued CTA remained reachable; real click at11:56:23Z reports `No eligible Today task is ready yet`, no Focus window/new session. Direct VE00560s supports subdued visual intent; exact source empty-click behavior stays unobserved. This is a tested existing Narro-local eligibility policy, not source click equivalence or a due-time edge-case native PASS.
- Source controls/Search/B58/B42 accepted on unchanged relevant dependencies are retained. No new Preferences/source motion/audio/scheduler/Reports/installer/performance/HDMI PASS from appearances. M7C5 evaluator is **INCONCLUSIVE as expected**: no qualifying drag/relaunch in this data-projection run; accepted earlier C5 is unchanged.

## Complete evidence and preservation

[Whole raw evidence](evidence/pr362-native-20261016/README.md), [aggregate review/results](evidence/pr362-native-review-20261016/results.json), [chronological actions/video offsets](evidence/pr362-native-review-20261016/chronological-manifest.json), [before/after gate matrix](evidence/pr362-native-20261016/session-evidence-matrix-after.json).

Continuous dual-screen OBS **519.617s,4480×1080/60fps,H264/AAC**,67,634,310bytes; full decode exit0/no errors. Whole video,24 actual nativePNGs, raw UIA/owned DB projections/actions/HWND/system facts and **all7files of Narro-M7-Logs** published. Raw structured ZIP preserves text bytes across Git newline normalization. 45 selected whole-video context frames/three sheets, all24native screenshot overviews and selected full-size paired detail/Notes/source comparisons reviewed; no claim every movie frame or every microanimation was visually inspected. PNG066/068 were suppressed by inherited no-snapshot flag; original UIA/full video remain, and explicitly labeled derived OBS frames supply their visual states. Initial001 is occluded by other windows and is excluded from Narro startup/blank-paint verdicts. Guard027 found two same-name UIA elements and sent no input; fresh button-coordinate recovery027b is logged.

NormaltrayQuit12:04:14Z, OBSstop12:04:16Z, original namespaces restored byte-identically, DB SHA256 `13185e54bc0ea08f3b368ccc48a8ede429683e1d58a60b15b8f7491a06d2224d`. No recording/ownedNarro remains. Personal DB/profile/cache/backups excluded. **Next: confirmed B43 header correction in one compatible M5 source batch; do not replay the accepted3/3 synchronization checks absent relevant invalidation.**
