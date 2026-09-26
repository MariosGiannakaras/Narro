# Milestone 7 consolidated Windows runtime validation

Use one real Windows 10/11 x64 session for the **remaining M7 physical gates only**. Do not repeat checks already established by earlier work logs unless a later source change directly affects them.

## Exact build

Validated source baseline:

`449eb5d1fda4a8d26832e803433209025a6dec38`, tree `51b27ba7a867dcea79a49927cb1ed4e0ee7bda6b`.

Latest full resulting-main validation:
- Windows CI #530 — PASS.
- Runtime artifact ID `10902390320`, name `narro-m1-runtime-harness-windows-x64`.
- Runtime artifact digest `sha256:726991f5a92eadda25eaa833d0a7443c21531896eb56e462609a0db6988cc6de`.
- Local validation package filename prepared for the user: `narro-m7-latest-main-ci530-windows-x64.zip`.

Later commits `8d3b488226c7fdc7ed23deae6bfc9f6acb0d8d62` and `34d75da3dfe54b7c52e06f90e38871b85681a97f` are documentation-only and do not replace the validated source baseline.

Fully quit any older Narro instance before launching `narro.exe` from the extracted #530 artifact.

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
