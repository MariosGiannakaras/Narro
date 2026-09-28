# Milestone 7 consolidated Windows runtime validation

Use one real Windows 10/11 x64 session for the **remaining M7 physical gates only**. Do not repeat checks already established by earlier work logs unless a later source change directly affects them.

## Exact build

Latest physically tested validated source baseline: `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`, tree identical to CI #624 PR head `fc61ed5926fdb1c605de8ce1e1a9fb28ea0dfd7e`.

- Windows CI #624 / run `36357415253` — PASS for repository preflight, visual regression and Tauri release.
- Runtime artifact ID `10944304485`, name `narro-m1-runtime-harness-windows-x64`, digest `sha256:4f76740bc6f69dcd1d664c9fb80011520567612c9eb6d87ab4e09e02e3b1bf7c`.
- 2026-09-28 physical batch: gates 7 and 12 **FAIL**; gates 8–11 **PASS** with their recorded scope. See `work-log/2026-09-28-codex-m7-ci624-physical-batch.md` and its sanitized frame evidence.
- PR #191 first candidate `f1ef35a` passed Windows CI run `36371772752` and was physically tested with animations Off. Three Panel↔Timer and three Expand/Collapse cycles settled, but the latter still exposed the old expanded white surface beneath compact content; Gate 7 remains **FAIL**. The On attempt was interrupted before cycles and Gate 12 was not run. See `work-log/2026-09-28-codex-m7-pr191-retest-in-progress.md`.
- PR #191 second candidate `12707c0` passed exact-head Windows CI run `36373768756`; runtime artifact id `10949818132`, digest `sha256:5d03ce449875167e9c559316df980c0ec9f64a1b74baf153985d376b0f3b2850`. Three animations-On Panel↔Timer and Expand/Collapse cycles settled but the resize still exposed the old expanded white area, so Gate 7 remained FAIL.
- Target-bounds candidate `d505b93` passed CI run `36374929708` but physically failed Off resize with two full-white expanded Timer frames. Current head `b23c8ab` passed CI run `36397349549` and then also physically **FAILED Gate 7** with Off full-white expansion and white collapse frames. The full history, current-build evidence and chosen bounded architecture experiment are in `work-log/2026-09-28-codex-m7-visual-continuity-history.md` and `work-log/2026-09-28-codex-m7-architecture-assessment.md`. The `AGENTS.md` rule bars further small hold-mechanism patches before the different composition is compared physically.

Fully quit the older Narro instance before launching the next exact-build `narro.exe`.

## Test setup

Use one active task/session for the entire matrix where practical. Record:
- Windows version;
- monitor count/layout and scaling;
- taskbar edge for the taskbar/DPI checks;
- the active task title and visible timer value at the start;
- the application used for the borderless/full-screen stacking check.

For transition checks, a 60 fps recording is preferred. Keep each gate as `PASS`, `FAIL`, or `NOT RUN`.

## Remaining consolidated matrix

### Gate 7 — Panel/Timer and Expand/Collapse continuity

With **Show animations in Windows = On**:
1. Run at least 3 cycles of `Panel -> Timer -> Panel`.
2. Run at least 3 cycles of `collapsed -> expanded -> collapsed`.

Then turn **Show animations in Windows = Off** and repeat at least 2 cycles of each direction/state. Restore the original OS setting afterward.

PASS requires:
- no transient `No active focus task`, `Loading focus task…`, or `Loading Focus Panel…`;
- no blank/pale/staging frame or abrupt return flicker;
- no enlarged or shrinking empty white Timer surface;
- no stale/duplicated expanded pixels;
- no horizontal focus-surface scrollbar;
- same active task/session identity and continuous timer state.

This validates PR #151 readiness-before-prewarm and PR #153 atomic transparent-host resize on the latest build.

### Gate 8 — Ctrl+Shift+T transition-boundary stress

With one active session:
1. Trigger Ctrl+Shift+T during/near a Panel/Timer transition.
2. Repeat rapidly several times.
3. If practical, also trigger during Timer expand/collapse.

PASS requires:
- one settled Focus window;
- one accepted mode change per non-conflicting request;
- no duplicated session/window;
- task/session/timer continuity;
- no permanent busy/locked state.

Basic shortcut operation and conflict/retry already passed earlier builds; this gate is only the unresolved transition-boundary stress.

### Gate 9 — Find Timer edge behavior

Test Ctrl+Shift+P:
1. repeatedly while Timer is visible;
2. while focus surface is in Panel mode;
3. after a native hide/show scenario if available in the validation flow;
4. with actual Windows animations Off.

PASS requires:
- visible Timer receives one finite restrained pulse per accepted request and settles;
- Panel mode does not mutate session/mode;
- no duplicate window or stuck pulse;
- reduced-motion behavior remains finite and clear.

### Gate 10 — Position/topology recovery

Using a secondary monitor if available:
1. move Timer to that monitor and restart Narro;
2. disconnect/reconnect or otherwise change display topology while Timer is visible;
3. exercise a fresh/no-saved-placement profile if practical.

PASS requires:
- Timer remains or recovers fully inside an available work area;
- no off-screen trap;
- no duplicate focus window;
- active session identity remains continuous.

Same-monitor restart/restore already passed earlier and does not need repeating unless a failure suggests regression.

### Gate 11 — Topmost stacking

Test Timer above an independent borderless full-screen Windows application and switch focus back and forth.

If true exclusive full-screen is available, record it separately rather than inferring from borderless behavior.

PASS evidence should record:
- application/mode used;
- whether Timer remains visible/topmost;
- taskbar behavior;
- any exclusive-fullscreen limitation observed.

Maximized Edge and Edge F11 already passed earlier and need not be repeated unless regression appears.

### Gate 12 — Taskbar / constrained work area / DPI

Using the strongest available combination:
- non-default taskbar position;
- secondary monitor;
- constrained/short work area;
- 125%, 150%, 200% scaling where available.

Place Timer near the bottom/work-area edge and expand it.

PASS requires:
- expanded outer window stays inside the selected monitor work area;
- all controls remain reachable through fit/scroll behavior;
- collapse remains usable;
- no off-screen placement;
- no session/timer discontinuity.

Primary-monitor bottom expansion already passed earlier; prioritize the still-unvalidated configurations.

## Already-settled M7 evidence — do not repeat by default

Do not spend time re-running these unless a new failure directly implicates them:
- native drag and return-to-Panel affordance;
- normal always-on-top and normal taskbar absence;
- collapsed/expanded content functionality;
- action/subtask mutations;
- duplicate React-key stale-pixel fix;
- ordinary Panel/Timer shortcut use and shortcut conflict/retry;
- same-monitor last-position restore;
- primary-monitor bottom expansion;
- maximized Edge / Edge F11 stacking;
- idle-animation audit and final Floating Timer CPU/memory measurements.

## Recording result

After the session, record one immutable `work-log/` entry with:
- exact source/artifact identity;
- environment details;
- one PASS/FAIL/NOT RUN row per gate 7–12;
- timestamps/screenshots/recording references for any visual failure;
- session continuity observation;
- any source correction required.

Do not close M7 or start M8 until every required remaining physical gate passes or is explicitly re-scoped by the user.
