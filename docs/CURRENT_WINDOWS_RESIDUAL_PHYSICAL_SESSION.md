# Current Windows residual physical session

Status: **current bounded physical/manual acceptance plan** for remaining M1/M5/M6/M7/M8/M9 gates.

This plan consolidates compatible current-candidate observations onto one already validated Windows executable. It does **not** reopen historical accepted gates and does **not** authorize a duplicate build merely to run manual acceptance.

## Exact reusable candidate

Use the exact full-green CI1025 production physical candidate:

- Windows CI: `37630032472` / CI1025
- exact workflow head: `8f921d7063f78a51ea4e42b0e102c96cfe8ef8e3`
- merged runtime/test source: `ad6019b87d1ea7382b99db34b1e7e75725d1b107`
- artifact: `narro-m7-physical-windows-x64`
- artifact id: `11486928221`
- ZIP SHA-256: `ac88a2b01d18597cf5de813f1af1b00cf16a6832d13234613e8b95faf7f91599`
- `narro.exe` SHA-256: `a7881c6c3984314f6c089865e87cd22c97c292606fe13997b170b3973ac4bfd1`
- NSIS SHA-256: `b057f098f2bce8da0df327e451f1a7f4bc2ebc799fc69b56615b805aaf6f71e4`
- MSI SHA-256: `ba5764423bf67a1fef83c11ae363b690a172d5a4f22da276657c1efb0656114f`

All later changes on `main` through this plan are Markdown/process/evidence only relative to that merged runtime source. PR245/Finding28 remains test-only. Therefore do not create another runtime build solely for these observations.

Before starting, verify the executable SHA-256. Record the active display topology, Windows scale on each display, animation preference, Narro theme, and any preference intentionally changed for the run. Restore reversible OS/Narro settings after the relevant observation.

## Already accepted — do not repeat without invalidating evidence

Preserve these results:

- CI942 selected-monitor ordinary placement, software topology recovery and Left/Right Focus placement;
- CI942 Preferences save/restart;
- CI944 modal action routing;
- CI948 native modal defaults / Ctrl+F ownership;
- user-manual browser Ctrl+Shift+T A/B/C 3/3;
- M6 P3-M6-02 Notes toolbar/URL scoped source+physical acceptance;
- M6 P3-M6-03 running dark live-card edge/glow scoped source+physical acceptance;
- M7 C1–C3/C5 accepted evidence, including saved-position restart/platform scope;
- queue vertical/end/menu/Tab physical coverage already accepted where recorded.

A failure in a current residual check reopens only that authority.

# Minimum closure set

## 0. M5 board current-candidate acceptance — narrow title + P3-M5-01/02/03

This is one bounded board observation, not a general M5 re-audit.

Use a normal planning board with:
- at least one narrow lane/card where the title previously risked disappearing;
- at least two movable ordinary tasks;
- Today containing enough tasks to show progress.

### Narrow title / M5-OBS-20261003-10

PASS requires:
- ordinary task title remains visibly readable in the narrow card;
- title/edit input is not reduced to an unusable sliver;
- hover/focus action reveal does not change card/title-row geometry;
- reserved action controls do not cover the title.

### P3-M5-01 Today progress

PASS requires the current source-backed Today treatment:
- persistent Today accent;
- anchored Blitz CTA;
- visible `done/total Done` progress coupled to the current Today task count.

### P3-M5-02 ordinary board row grammar

On rest → hover → keyboard focus:
- resting leading slot shows ordinal;
- hover/focus replaces/reveals completion at the leading slot without row shift;
- right rail exposes Subtasks / Notes / lane-left / lane-right / overflow in stable reserved geometry;
- full title remains accessible.

### P3-M5-03 drag presentation

Perform one owned same-lane or cross-lane drag that does not depend on a destructive side effect.

PASS requires:
- lifted-card feedback;
- live source/destination reflow with a card-height placeholder;
- positional insertion rather than append-only behavior when a positional target is used;
- finite settle with no stale duplicate/blank card;
- exactly one task identity moves.

Record representative screenshots/video ranges for later direct canonical comparison. This section establishes current packaged-Windows behavior; do not promote `SOURCE_PARITY_PASS` without the corresponding canonical comparison.

## 1. M5 P3-M5-04 — retained destructive menu

Authority: VE-006 Pass-3 destructive-row transition plus current production menu contract.

Use one ordinary non-live task.

1. Open the production task overflow menu.
2. Confirm ordinary menu order is Schedule / Change list / Duplicate / Delete.
3. Activate Delete.
4. Confirm the **same menu remains present** and the destructive row changes in place to trash + Confirm + X.
5. Confirm sibling rows remain visually unobscured; no underlying metadata/control paints over the menu.
6. Activate X and confirm the same menu returns to the ordinary Delete row with no task mutation.
7. Repeat once and Confirm deletion only on an owned disposable task.

PASS requires retained-menu presentation, readable/opaque stacking, inline Confirm+X, safe cancel, and exactly one intended deletion.

This closes physical/current-candidate acceptance only. Direct pixel/source parity remains bounded by the available canonical VE-006 frame evidence and must not be overstated.

## 2. M6 A–D — Focus acceptance bundle

The detailed acceptance steps are authoritative in [M6 current residual physical checklist](M6_CURRENT_RESIDUAL_PHYSICAL_CHECKLIST.md). Run only:

- **A / P3-M6-01:** Board → Focus one-shot window morph, no blank/stale frame, same committed session.
- **B / P3-M6-04:** Focus-local Quick Preferences composition + one reversible persisted setting.
- **C / P3-M6-05:** ordinary queue-row action order/overflow/keyboard/stable geometry.
- **D / P3-M6-06:** Home visibly PAUSED before exit, paused re-entry, guarded one-shot resume after Panel presentation, no resume of intentional user pause.

Do not repeat CI942 placement/topology or already accepted Notes/live-edge checks.

## 3. M7 C4 — current continuous Focus continuity

Use one owned paused or running task/session and keep identity/time observable throughout.

Run a compact bounded sequence with Windows animations **On**:
- Panel → Timer → Panel, at least 3 settled cycles;
- compact Timer → expanded Timer → compact Timer, at least 3 settled cycles.

PASS requires:
- one Focus host/surface;
- same task/session/time continuity;
- no blank white/pale/staging frame;
- no stale/duplicated old Panel/Timer pixels;
- no transient loading/empty-task copy during settled mode handoff;
- no document-level horizontal scrollbar;
- no abrupt return flicker;
- expanded controls are fully available before the expanded state is treated as presented;
- collapsed content is fully restored after collapse.

If a failure is visible with animations On, record the exact transition and stop repeating the same cycle. Reduced-motion/animations-Off is needed only if the current failure classification requires it; do not duplicate an already sufficient failure.

This check is the current C4 continuity gate. It does not reopen C5 or accepted placement/restart/platform evidence.

## 3A. Finding28 — native packaged-WebView post-drag keyboard rail

This observation resolves only the remaining CI953 native/Tauri-WebView/UIA discrepancy. PR245/CI1029 already proves the production browser DOM/CSS contract and **does not authorize a CSS/TaskCard workaround**.

Use one owned ordinary board task:
1. Perform one real pointer reorder.
2. Move pointer away from the task.
3. Put real keyboard focus on the reordered task title without hovering the card.
4. Observe the rendered rail and, if available, native/UIA focused element.
5. Press real Tab once, then Shift+Tab.

PASS requires:
- title focus reveals the action rail without pointer hover;
- Tab enters the first rail action and Shift+Tab returns to title;
- no second reorder or title edit occurs.

If UIA reports title `HasKeyboardFocus=true` while the rendered rail remains absent, record **FAIL / NATIVE DISCREPANCY PERSISTS**. Do not add a blind CSS/focus patch; preserve the CI1029 browser-DOM PASS and reopen only the Tauri/WebView/UIA boundary.

## 4. Reports Findings29/30 — packaged Windows acceptance

Open Reports → Sessions → Add Session.

### Finding29 modal keyboard ownership

PASS requires:
- opening Add Session places keyboard focus inside the modal, on the task-search field;
- Tab and Shift+Tab remain contained;
- Escape dismisses when no Add mutation is pending;
- focus returns to the opener after dismissal;
- during a pending Add mutation, dismissal is blocked and focus remains owned by the dialog.

Do not infer the pending state from a disabled button alone; observe that keyboard Escape/Tab do not escape/dismiss while the mutation is actually pending.

### Finding30 bounded Recent Tasks picker

Use or locate a sufficiently long task/list label.

PASS requires:
- no horizontal scrollbar;
- task/list text stays on one line and truncates rather than widening the picker;
- vertical scrolling remains usable;
- right-side list identity remains legible/accessible.

Canonical bounded-picker source parity against SS-H17 is already scoped PASS; this check is packaged-Windows behavior only.

## 5. Finding33 — native large Notes Escape

This is **not** a browser-DOM source-fix check. CI1025 already proves real Edge/contenteditable Escape works in the rendered production DOM.

From Main or Focus:
1. Open large Notes.
2. Put real keyboard focus in the contenteditable body.
3. Press physical Escape once.

Record whether the large Notes presentation closes to compact and focus returns appropriately.

- PASS: native Tauri/WebView path now agrees with the Edge regression.
- FAIL: preserve as Tauri/WebView/native discrepancy; do not add another blind `TaskNotes` Escape listener.

Resize remains separate. Only test resize if the pointer start is explicitly on the actual lower-right UA resize grip/corner. The older CI953 starts were too far inside the surface to establish a resize defect.

## 6. Findings35/36 — packaged Focus behavior

### Finding35 Time's Up action substitution

Drive an owned timed task to authoritative Time's Up.

PASS requires:
- Time's Up remains visible;
- six-slot Floating action geometry remains stable;
- Extend occupies the ordinary Pause/Resume role slot during `time_up`;
- Skip and Done remain available in their established slots;
- after entering overtime, ordinary Pause/Resume returns;
- stale prior action-status copy is not retained.

Exact Floating-Time's-Up source pixels are EVIDENCE_LIMIT; judge physical behavior/system consistency, not unavailable direct pixel parity.

### Finding36 Success → Next Task scope

Use a Focus Panel explicitly scoped to a known list containing at least two eligible tasks and another older eligible task outside that list.

1. Complete the live task into the success state.
2. Activate explicit Next Task.

PASS requires the next task to come from the current Focus queue/list scope, not from the global older task, and the scope must survive Panel remount/re-entry.

Do not infer success behavior from automation alone; this check is the packaged-Windows path.

## 7. M9 Overview PDF

Use Reports Overview with non-empty representative data.

1. Choose a known report range/filter.
2. Activate Overview → PDF.
3. Confirm Narro creates a new non-overwriting local PDF.
4. Open the generated file in the normal Windows PDF handler/viewer.
5. Confirm it renders successfully and visibly contains the expected report identity/range plus representative summary/chart/list content.
6. Re-run export once and confirm the first file is not overwritten.

PASS closes the sole M9 12th top-level implementation/physical item. Direct Reports/Blitzit source-parity comparison remains a separate non-counting gate.

# Conditional physical gates

Run these in the same executable session only when their prerequisites are available. Their absence keeps the gate OPEN; it is not a failure.

## 8. M1 Finding27 — selected-monitor DPI identity recovery

Use the exact steps already pinned in [M6 current residual physical checklist](M6_CURRENT_RESIDUAL_PHYSICAL_CHECKLIST.md):

- explicitly select a named non-primary display at 125%;
- present Focus on that display and note side/safe anchor;
- change that same physical display to 100%;
- re-present without restarting Narro;
- same physical display identity must remain selected and recover to a safe visible anchor;
- a genuinely unavailable/stale display must remain visibly unavailable rather than being silently rewritten;
- explicitly selecting Automatic must commit and clear the stale selection.

Restore the Windows scale after the observation.

Do not repeat ordinary CI942 placement/removal-reconnect acceptance.

## 9. Finding07 / M7 C4 dependency — blocked-SQLite keyboard responsiveness

Authority baseline: `work-log/evidence/m7-ci950-loading-20261005/README.md`.

Preconditions:
- owned session paused;
- preserve a pre-test data snapshot/backup appropriate to the existing physical-validation workflow;
- use a separate SQLite connection against the rollback-journal production DB;
- the lock exercise must execute **no data statements**.

Reproduce the prior controlled condition:
- begin `BEGIN EXCLUSIVE`;
- hold for either 1.8 s or 4 s;
- always rollback and close the external connection.

While a Home/List-board read is waiting on the lock, use real keyboard input.

PASS requires:
- loading/blocked read may remain pending;
- Escape/Tab and other local keyboard UI handling are **not queued until database unlock**;
- the UI/event loop remains responsive while the authoritative read waits;
- once the lock releases, the read resolves to correct data/error semantics;
- no data identity/session/checkpoint/preference mutation arises from the lock harness.

The old CI950 failure was precisely Escape/Tab queued until release. PR237 moved the relevant reads through the shared async `spawn_blocking` boundary; this physical check validates that UI responsiveness result.

Do not merge or revive the old WIP branch merely to run this test. If an operator-side lock helper is needed, it is evidence tooling only.

## 10. M8 actual Windows notification delivery

Run only if Windows notification permissions/audio routing permit a real observable result.

Use an owned timed task and current Preferences:
- enable Notification Alerts;
- choose a known local notification sound;
- trigger one authoritative Break Started or Break Finished delivery boundary;
- separately, if practical, create one owned scheduled reminder with a short known lead.

PASS requires:
- exactly one Windows notification at the authoritative boundary;
- configured sound/visible notification behavior corresponds to current preference;
- disabling Notification Alerts suppresses delivery without later backfill of the consumed boundary;
- no duplicate delivery from repeated polling/re-entry.

Do not infer PASS from elapsed time, preference state or effect-ledger mutation alone. If OS policy prevents observation, leave this gate OPEN.

# Session hygiene and evidence

For every exercised gate:
- record exact executable hash once at session start;
- record only the minimal before/after task/session/preferences needed to prove no collateral mutation;
- use owned disposable tasks/sessions for destructive tests;
- restore reversible Narro preferences, Windows scale and animation setting;
- do not claim a gate that was not actually observed;
- do not convert source-parity or native physical discrepancies into PASS from automation alone.

A single capture can support multiple gates only when the relevant state/action is visibly and unambiguously present. Record each gate's result separately.

## Closure routing

After the session:
- update only the gates actually exercised;
- failures reopen only their owning authority;
- M10 remains blocked until all required M1–M9 implementation and acceptance gates are clear;
- progress counters advance only when the repository's milestone closure rules are actually satisfied.
