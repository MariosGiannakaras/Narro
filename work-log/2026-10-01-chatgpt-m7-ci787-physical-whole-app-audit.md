# M7 CI #787 physical whole-app audit — active-session retest

Date: 2026-10-01

## Evidence

User physical recording:
- file: `2026-10-01 02-02-06.mp4`
- SHA-256: `0d922f55aef30d5e88ad32fab9a1c41ed8458b71013ad18e3bebc70fdf4da99c`
- duration: approximately 111.32 seconds
- frame size: 2560×1080
- source candidate: PR #192 exact head `dce6933ff7a777c837822f7a5a83c37d47434e07`
- source Windows CI: #787 / run `36786367870` PASS
- physical runtime artifact: `11129693452`, digest `sha256:0f708660fd9449e3239af6d89932790df188d4f5a23152c6c22c20e9037578f3`

This recording is **not** final M7 Gate 7 / Gate 12 PASS evidence.

## Positive evidence

- `Blitz now` with no eligible Today task remains a no-surprise-start path.
- An eligible Today task was created and then ran as an active Focus task.
- Active Panel→compact Timer presentation retained the same task and continuous elapsed/countdown progression.
- The sampled Panel↔Timer transition path did not expose an obvious full white/blank/stale frame.
- The single-host transition is materially improved over the older split-window behavior.
- No Narro T/P shortcut conflict cards were visible in this recording.
- Compact Timer remained visible over normal Main/desktop content in the observed sequence.

These observations are useful but do not close the physical matrix.

## Physical correctness findings

### B6 extension — idle/no-task Timer can still be exposed

Early in the recording a compact Floating Timer is visible with:
- `No active focus task`
- `--:--`
- `0/0 Subtasks`

The recording does not expose keyboard input, so it does not prove whether this was spontaneous startup visibility or a Find-Timer/global shortcut action. Source inspection narrows the actual loopholes:
- startup native setup itself initializes `focusSurface` hidden and in Panel presentation;
- Ctrl+Shift+T already had an authoritative `TimerService::snapshot()` active-task gate;
- Ctrl+Shift+P / Find Timer only checked that the remembered presentation was Timer and could re-show a stale hidden Timer without validating active Focus state;
- the coordinator did not globally normalize an already-committed Timer presentation after authoritative runtime became Idle/no-task.

Correction implemented in PR #192 commit:
`6972c4e08d8fce4b1eb4f7843123f22564c28607`

The correction:
- gates Find Timer through the same non-Idle + task-binding authority used by Ctrl+Shift+T;
- makes the coordinator return a committed Timer presentation to Panel once the settled authoritative projection becomes Idle/no-task.

This is **CI_PENDING / PHYSICAL_RETEST_REQUIRED**.

### M7-PHYS-05 — expanded active Timer hides the current task and live time

Compact active Timer correctly shows current task + live time. Once fully expanded, the stable 340×300 Timer in this recording shows actions/subtasks but removes the current task title and live timer text.

This violates the source-product Floating Timer contract: expanded presentation is still the Floating Timer and must keep current task + countdown/time visible.

Source cause was explicit:
`FloatingTimerFoundation.tsx` rendered the heading only while the expanded native region was not fully committed. Existing visual regression also encoded title/time absence as correct.

Correction implemented in `6972c4e0...`:
- task/title/live timer heading remains the first row in both compact and expanded Timer;
- expanded layout becomes heading + actions + subtasks within the existing 340×300 region;
- visual/static regression now requires expanded task/time;
- packaged runtime visual harness now seeds a real persisted active task/session through production APIs before exercising Timer presentation.

This is **CI_PENDING / PHYSICAL_RETEST_REQUIRED**.

### M7-PHYS-06 — Main board remains stale after Focus task creation

The recording shows Main All Lists already open with Today reporting zero tasks. Focus quick-create then persists a Today task and starts it live, while the visible Main board remains at `Today: 0 tasks` / empty for the remainder of the observed sequence.

This is a cross-window projection correctness defect, not a separate source of truth: both surfaces are backed by the same SQLite authority but were independently hydrated and had no common invalidation path for renderer-originated mutations.

Correction implemented in PR #192 commit:
`c77ece58439753d92ab486d1ebb3a43605efbbd3`

The correction:
- adds best-effort `board-data-invalidated` renderer event;
- publishes it only after authoritative task/subtask/schedule/timer mutation success;
- event delivery failure never converts an already committed mutation into a retryable mutation error;
- Main ListBoard, Focus Panel and Home projection re-read authoritative SQLite snapshots after invalidation;
- stale-response guards prevent an older cross-window read from replacing a newer target.

This is **CI_PENDING / PHYSICAL_RETEST_REQUIRED** and reopens the M6 cross-surface correctness boundary until validated.

## Automated harness strengthening

The prior packaged Focus runtime harness directly exercised Timer presentation while its deterministic timer fixture was idle. That made it unsuitable for enforcing the newly strict product invariant that a Timer presentation requires active Focus execution.

Commit `6972c4e0...` changes the runtime visual driver to create a real persisted list/task, start an authoritative timer through production APIs, then perform the single-host Panel/compact/expanded sequence. If this remains green, the packaged artifact will now verify active-task title/time and the idle normalization invariant instead of relying on an idle placeholder.

## Remaining physical matrix

Even after the above corrections pass CI, physical acceptance still requires a fresh exact artifact and:
1. exactly one Narro runtime / second launch does not create competing authority;
2. active task/session;
3. repeated Panel↔Timer many times;
4. repeated compact↔expanded many times;
5. same task/session identity and continuous authoritative time;
6. no white/blank/stale/staging/duplicate pixels/document scrollbar;
7. visible Timer → `Blitz now` → Focus Panel;
8. idle/no-task Ctrl+Shift+T and Find Timer do not expose Timer;
9. Main/Focus/Home projections reconcile after cross-window mutations;
10. always-on-top over a maximized/fullscreen app;
11. drag/save/restart placement near edge/taskbar;
12. real two-monitor 100%↔125% crossing, expand/collapse near edges/taskbar and topology/hotplug recovery.

No M7 or reopened milestone/item counter advances from this recording.
