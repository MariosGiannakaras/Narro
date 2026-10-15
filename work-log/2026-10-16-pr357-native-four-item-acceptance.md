# PR357 — four changed M5 Board claims accepted

Acquisition **4/4**, review **4/4**, scoped acceptance **4/4 PASS**. This closes the four claims below, not all M5 or the entire interface. M1–M4 remain **4/10** mandatory milestones; M10 entry remains blocked and optional M11 stays dormant.

## Candidate and protection

PR357 head `a56571d26611cbe2978669bf6144edcef827cd4e`, exact CI [38796243985](https://github.com/MariosGiannakaras/Narro/actions/runs/38796243985) **3/3 SUCCESS**, guarded squash merge `2378a632c322b51ce889dde32afaaad54e598b2d`. Resulting-main CI [38816212773](https://github.com/MariosGiannakaras/Narro/actions/runs/38816212773) independently completed all three jobs successfully, including Windows candidate22:20:09–22:43:09UTC. All **552 executable/build/test/config/workflow input blobs** match the exact PR head; only documentation/evidence differs. Source inputs include CI-consumed logging documentation.

Artifact `narro-m7-validation-windows-x64` id12002784723; ZIP SHA256 `bda264390a489e266f765ec5c7648ae1533073c97f5b53e1f9e935da37801ae2`; EXE SHA256 `9cd45b762713932c7bc1f2fd9f41a3970fb964174846aacc298a923b6a813819`. Provider digest/CRC/PE-x64 verified. Actual process37288/mainHWND6095598 used throughout; no browser/mock substitute.

Fresh empty owned Roaming/Local namespaces followed readonly SQLite backup/quick_check and checked same-parent protection renames. Normal actual tray `Quit Narro` succeeded23:26:57UTC; process exit verified. Personal namespaces restored and DB SHA256 `13185e54bc0ea08f3b368ccc48a8ede429683e1d58a60b15b8f7491a06d2224d` is unchanged. Private DBs, backups and isolation ledger are excluded from Git. No primary-monitor/topology, OS motion, FocusAssist, notification, installer or startup setting was changed. Approved Spectrum Core/image upload/218icons were preserved.

## Native evidence and dispositions

Continuous original OBS recording **304.450s,4480×1080,60fps**, both displays side by side, about23:21:53.7–23:26:58.7UTC (local16Oct02:21–02:26). Complete original MKV,28 native PNGs, observed UIA snapshots, per-action UTC chronology, window/monitor/system facts, private-free six-task persistence proof and the **whole seven-file Narro-M7-Logs folder** are published [in the evidence directory](evidence/pr357-native-20261016/README.md). Video hash `4ed01925cf9e8f9135b449fbfbbf090d021166928634cc30cd2308afe469b620`. Original-byte observation ZIP avoids ambiguity from Git line-ending conversion. No video tail omitted.

| Claim | Exercised native states and review | Disposition |
| --- | --- | --- |
| B61/U39 empty-copy | Empty four-lane Board at100%; UIA contains exactly four `All Clear` labels and no Done-create action. Later empty Done remains visible in both themes/DPIs. Canonical VE004/005/previous Pass3 copy comparison retained. PNG07/08/32/52. | **COPY_SOURCE_AND_NATIVE_PASS**. Separate B60 gradient/check empty-state emblem remains OPEN. |
| B52/U28 inline-create composition | Actual bottom Today editor: CANCEL, Title, Est time, Add a new task, Confirm; real keyboard creation, cleared/refocused draft. Light Backlog and actual125% ThisWeek equivalent states. PNG09/12/15/46/63 and before/after UIA. Compare canonical VE005/SS-T02 via frozen source calibration. | **COMPOSITION_SOURCE_AND_NATIVE_PASS** for this inline editor; no new claim for every EST/suffix/error path. |
| B47/U25 created-task priority | Video then Record voice from bottom create, newest first; explicit top creates Top entry; same bottom form retained/cleared. Light Backlog repeated pair and125% ThisWeek create. Readonly persisted proof: Today Top entry,Record voice,Video; Backlog Light Record voice,Light Video; six distinctIDs, no completion/deletion. Compare canonical VE005 demonstrated sequence. | **ORDER_SOURCE_AND_NATIVE_PASS**. Existing transaction/rank tests retained; no unrelated reorder/domain change. |
| B48/P3-M5-04 compact menu/retained confirmation | Native dark/light×100/125%: compact plain Schedule/Duplicate/red Delete, one separator; retained dimmed siblings + trash/Confirm/neutralX. Same sibling and Delete→confirmation bounding rectangles in all4variants. X cancellation restores Delete; Escape closes/restores Task actions; reopen exercised. No irreversible delete needed for this styling slice. Eight stills directly compared with VE00616/18s and previous SS-H13 calibration. | **AFFECTED_MENU_SOURCE_AND_NATIVE_PASS**. Prior domain deletion/report safety unchanged. Source Change List not newly exercised because this profile has one destination list. |

Chronology uses authoritative UTC actions; rough video offsets:44–60s empty/title,69–102s repeat/top create,120–143s dark menu/cancel,156–180s light/theme/menu/Tab,187–202s light repeated create/restore,210–244s secondary125%/menu/create,271–281s dark125%/menu,303s normal tray Quit. Full manifest allows exact alignment. Timeline contact-sheet labels are approximate; they are context views, not timing measurements.

## Review method and honest limits

The full recording was decoded successfully;30 ten-second context samples were viewed in three sheets, all eight native menu stills compared together with canonical VE00616/18s, and relevant create/empty screenshots/UIA/persistence reviewed. This establishes the changed static/functional claims. It is **not** exhaustive frame-by-frame micro-animation acceptance or whole-window pixel parity. Physical reduced-motion was not run; unchanged motion logic and prior/local normal/reduced4/4 production DOM coverage remain separate evidence.

The trial Tab from Confirm dismissed/canceled the menu and moved focus into the task, matching the existing Menu Tab-dismiss contract; it does not prove a focus trap or focus on cancelX. Its screenshot name39 contains `cancel-focus`, but the actual observation is authoritative. No product FAIL was inferred from the misleading filename. `m7-c5-latest-result` is expected **INCONCLUSIVE** because Timer saved-placement was not exercised; previous C5 acceptance is unaffected.

Computer Use initially returned null UIA, screenshot `IGraphicsCaptureItemInterop.CreateForMonitor ...0x80070057`, then indexed input `coordinate input geometry is unavailable`. Reselection restored text observation but not usable input geometry. Existing guarded native UIA/GDI/physical SendInput fallback and actual OBS controls were used. OBS's previous-crash warning cleared before recording. EXE launch preceded recording by13s, so startup-motion PASS is not claimed. Invalid initial click/helper invocation and subsequent recovery remain in raw chronology; recording did not conceal them.

## Reuse and next operation

Before and after this session, current TODO/HANDOFF/crosswalk were inspected. B46 repeated-create native behavior gains scoped evidence; M1 gains samePID/HWND Main migration96→120DPI observations, and M8 gains actual theme switching/close/reopen evidence. These do not independently close their broader parity/performance/shortcut gates. M6/M7/M9 surfaces were not sufficiently exercised and receive no new PASS. M10 counters do not move.

Next coherent source slice: **B70/U36 confirmed quick-clear-schedule lane/rank discrepancy**, with atomic transaction, stale/live-task/recurrence/identity guards and regression coverage described in [the frozen causal plan](2026-10-15-m5-u24-u36-causal-disposition.md). Existing green PR346 search layout is reusable work to inspect/reconcile, not a reason to reimplement it. B60 empty-state emblem and other source comparisons remain separate; no wholeM5 completion claim.
