# CI942 physical Windows results and reusable acceptance

**PASS for the exercised native continuity/C5, two-display placement/software topology and bounded quiet-performance requirements; FAIL for modal shortcut isolation (`M7-OBS-20261004-17`).** M7 closure and whole M5/M6/M8 source parity remain open. [Whole evidence package, video, gallery and logs](evidence/m7-ci942-20261004/README.md).

## Exact build and capture

PR231 source `c2821e6f998c6cd7424d5aed8673f5c9a3ff9e9d` PASSed full Windows CI942/run37191346390 and guarded-squash merged `416ff40ecd6c50b660ecfef9c9c0b57c2dc7dd92`, zero non-Markdown differences. Production artifact11299369259 EXE SHA256 `3e836e942b45f3586e71bda15208f60b8b8cc901449146fdef76b8999b5b61ea`; isolated diagnostic11299363071 SHA256 `89b2c7c6799743e891a8c602c0e969aab8d0ecdd6b64a809c453f44e567af648`.

Uninterrupted dual-display OBS09:45:40.777Z→10:31:04.202Z,4480×1080/60fps; complete original2722.867s and all11 native log files are preserved. Original byte reassembly and log-ZIP identity PASS. All840 motion PNG exports are retained. Directly inspected600 unique consecutive source frames from five PTS ranges, seven ROIs with paired Main/Focus views counted once, plus six video-derived stills. OBS reports202 render-lag frames (0.1%) and32 encoding skips; no assumption of unique physical refresh per encoded frame. Full recording remains available for independent review; not every frame was manually inspected.

## PASS/FAIL and detailed observations

| Requirement | Verdict and actual evidence |
| --- | --- |
| M1 selected-monitor Left/Right | PASS:4/4 at100%/125%, repeated4/4 after reconnect. Primary `(0,0)`/`(2220,0)`340×700; secondary `(-1920,0)`/`(-425,0)`425×875. Original secondary/right preference physically restored. Initial stale monitor selection remains a failed precondition in raw data. |
| M1 topology/recovery | PASS exercised software2→1→2 with Main present and destroyed; same diagnostic PID86292/Focus HWND3081490 survives and compact recovers within primary work area at96DPI. Duplicate→Extend restores both active displays. Physical cable/display sleep-wake NOT RUN. |
| M1 storage isolation | PASS exact diagnostic identity and empty task inventory; product Roaming/Local task storage was not replaced. |
| M7 Collapse/entry motion | PASS inspected affected ranges: normal125%, normal100%, reduced100% Collapse retain Timer pixels, without observed pale/native-caption/desktop gaps. CI936 previously accepted two-DPI normal/reduced/bottom-edge paths remain exact-source historical evidence; CI942 retains unchanged native path. Normal100% range includes next intentional Expand near its end; reduced range includes the functional Locate pulse. |
| M6 board entry | Normal Main board briefly fades after authoritative Start Blitz, restores after presentation; reduced Main stays opaque and populated Focus appears directly. Both120-frame paired views reviewed. Button disabled/Starting Blitz opacity is separate from board motion. Narrow observed motion acceptance only; no exact whole-board calibration PASS. |
| M7 C5 restart | PASS actual qualifying2392px drag, tray Quit PID17624, new PID135708 on the identical EXE, Ctrl+Shift+T restores `(1330,613)` with same owned task paused05:08. Native evaluator records unchanged fingerprint/source/topology and exact placement. First accidental Subtasks-area gesture is NONQUALIFYING despite its old misleading filename; acceptance uses `c5-qualifying-drag.json`. |
| Notes/editor containment | PASS exercised source-order seven toolbar controls, automatic http(s) hyperlink recognition, live edit/save/restart, large editor324×284 inside340×300 at100% reduced motion, Save/Escape reachable. No horizontal editor overflow in examined state. Formatting semantic coverage is bounded: controls clicked before typing, not exhaustive independent formatting combinations. |
| Tracked-time durability | PASS owned integrated task130dde4e... retains464 durable work seconds on completion; English companion32fd4eee... retains27. Live title edit preserves identity/session. Greek companion2594ad65... remains pending; preexisting owned CI873 task remains recoverable. Read-only ledger evidence retained. No direct production database writes/restoration. |
| Finish from compact | PASS full Panel displayed before success; Next Task/Close fully visible and reachable. Existing source-ambiguous Take a Break disabled disposition is preserved; not a new clipping failure. |
| English/Greek physical shortcuts | Ordinary T/B/P/S/F/N and Main Ctrl+F exercised with actual focused WebView HKL4090409/4080408. Modal isolation FAIL below. No blanket shortcut acceptance. |
| M8 Preferences contention correction | PASS actual dark/success-on save survives normal Quit/relaunch, original light/success-off restored. Complements automated two-connection lock regression; no physical forced-lock stress claim. Whole Preferences canonical comparison remains open. |
| Modal input ownership | FAIL: focused Add button in Add task modal allows B/P/N to change background domain/Notes. Exact timestamped observations/video retained. PR232 fixes affected Main, coordinator and delivered-event/committed Focus paths; exact new build physical retest required. |

The seven toolbar grammar and URL checks are directly compared with canonical VE01035s and current supplied Notes evidence. Current screenshot showing queued-task Notes is a different state from this live editor; it does not establish a discrepancy merely because composition differs. No whole Notes `SOURCE_PARITY_PASS` is inferred. Typed newline sequences in the automation did not reliably synthesize physical Enter; the single-paragraph result is not evidence of a serializer line-break defect. An explicit Enter test may be reused in the next actual session.

Native fixed host700/875px height is not the compact region110/138px height. Underlying desktop/Codex tooltip pixels outside the native Timer region are not established Narro overflow. Mistaken `compact-success-navigation-crop.png` captures Codex, remains raw only and is excluded from gallery/acceptance.

## Quiet performance decision

Exact unmodified collector on fresh diagnostic PID25528, Main destroyed, compact340×110, no active session/animations, OBS closed. Three30s warm-up/60s sample runs: every native scenario/hash preflight PASS, all steady-state valid, zero process churn. One-core CPU run averages0.025896%,0.025813%,0.077799%; median0.025896%. Median summed working set399.420MiB and private333.006MiB; six WebView2 processes are explicitly included.

A separate matched cold CI936 launch on the same isolated storage/current displays, Main destroyed, same30s/60s collector, averages CPU0.025999%, working399.266MiB/private324.727MiB. This is one matched comparison, not a second three-run baseline. CI942 private difference8.279MiB (+2.55%); endpoint attribution is WebView2 allocation, while native Narro private is lower62.711 versus63.566MiB. Allocation cause is not proven. The earlier warmed CI936310.789MiB must not be treated as a matched cold baseline; its warm→cold variation is13.938MiB. Three CI942 runs remain bounded333MiB without native growth/process churn, working set nearly identical to cold936 and below the previously accepted final-UI CI505429.76/421.39MiB; private below that candidate's collapsed375.19MiB and near expanded327.56MiB.

**Disposition: PASS the existing M1 measured/documented/near-idle/not-clearly-unacceptable and M7 no-major-memory-regression acceptance.** A2.55% cold private difference with near-identical working set/CPU, stable native allocation and no churn does not justify native fallback or a framework migration. Record the small startup-dependent WebView2 allocation variation explicitly; do not assert zero regression, exact allocation cause or long-duration leak freedom. Re-measure after performance-relevant source changes. PR232 adds only event-time modal checks and no native composition, timer polling or idle loop; these measurements are reusable for its unchanged performance paths.

## Post-capture M1–M9 dispositions

The user's cross-gate rule arrived during this capture. TODO/HANDOFF/crosswalk were inspected before the remaining production phase and again after direct review; no false pre-start claim for earlier diagnostic phase.

| Milestone | Consumed evidence and remaining scope |
| --- | --- |
| M1 | Replacement B/C and D requirements now adequately exercised/measured: selected-monitor, software reconnect, Main destroyed, hash/scenario-valid3×quiet measurements. Close these reopened items. Unaffected accepted architecture/tray/notifications/autostart are preserved; cable/sleep is not added as a fabricated PASS. |
| M2 | Owned creation and identity ledger corroborate existing domain acceptance; no exhaustive persistence/domain rerun claimed. |
| M3 | Live metadata, interruption recovery and completion464/27s corroborate existing engine acceptance. Dedicated risk regressions remain separately recorded, no M10 count. |
| M4 | Reminder/DST/recurrence and source visual states NOT RUN; open routed visual gates remain open. |
| M5 | Today count/board and entry appear, but narrow title/edit/hover and canonical ordinal/action/drag/delete/archive acceptance remain open. These actions were not all exercised. |
| M6 | Replacement placement/topology inherits this actual shared host evidence; observed entry/Notes/live styles get narrow dispositions. Full replacement integration/modal17 and stable source calibration remain open. |
| M7 | C5 and affected native paths PASS; C4/integration remains open for17 and final bounded tracking/source reconciliation. Earlier809/936 evidence is retained by exact changed-path lineage. |
| M8 | Preference save/restart adequately validates the corrected path; real two-layout shortcuts exercised but modal17 still fails. Complete Preferences/source visual comparison remains open. |
| M9 | Reports/Sessions/CSV/PDF NOT RUN. Overview PDF remains unimplemented FIX_NOW. |

No unrelated later-milestone implementation was started from incidental visibility. M10 evidence may be reused only after the hard entry gate; no checkbox/counter advances now. Explicitly announce all required M1–M9 complete before M10.

## Corrective source checkpoint

PR232 exact head `6029b5529f025c8dffb4e05331e11a6bbcbb4bec`,9 files`+204/-10` from8f542a92, PASSed full Windows CI944/run37197934204. Shared active-modal boundary suppresses global in-app routing while a visible modal owns input, ignores hidden/inert preparation, rechecks Main after async snapshot and guards delivered cross-window Focus callbacks. Forty-two actual rendered regression scenarios and full frontend preflight PASS. Local Rust compile/Clippy/tests NOT RUN because MSVC `link.exe` unavailable; authoritative Windows CI performed native checks/builds. Guarded squash merge `0df4c14cfa6fa8632cff49529ddc36510d67ddd3` has zero non-Markdown differences; resulting-main CI945 passes identical-tree gate, downstream jobs intentionally skipped. Exact validation artifact11302770897 EXE SHA256 `b6814cf572e89c0d738659726d2fa1fc06cda1dea65721f4cb1f6d04900439fa`. Physical correction acceptance remains OPEN.
