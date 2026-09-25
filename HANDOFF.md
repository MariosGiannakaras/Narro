# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active M7 `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md` when applicable, the newest immutable `work-log/` entry, and live PR/CI state before implementation.

The Narro worktrees are grouped under the Desktop folder `E:\\SystemFiles\\Desktop\\Narro Project`. Inspect branch/dirty state before switching; GitHub `main` remains the durable source truth.

## CURRENT MILESTONE

Milestone 7 — Floating Timer mode. Milestones 1–6 are complete. M7 items 1–6 and 13–14 are validated. Item 7 remains open solely because the newest transparent-prewarm source still requires physical Windows compositor/reduced-motion retest. Do not advance to M8 before the remaining M7 acceptance conditions are observed.

## CURRENT VALIDATED SOURCE

Validated source baseline: `f59e4d16a49659832ea562c3718cc5ba748b74fb` (guarded squash merge of PR #147), tree `ab122091235c2f3720df74ede84152238020cfd9`. The tree is identical to exact PR head `8f173cd37fc8d1506ec546feb2248e92db81cebe`.

PR #147 exact-head Windows CI #516 / run `36186563007`: **PASS**.
- runtime artifact `10886772181`, digest `sha256:14491b38fd6a6d2144856353c46964fe6e24fa0d9b02d81219f2e801c5f58585`;
- visual artifact `10887286466`, digest `sha256:a4e9b442382d86e5d6be437d20a59ded4543c2b5c88aad8f13cbba3adc595f11`.

Resulting-main Windows CI #517 / run `36188196900` / job `108246665399`: **PASS** on exact source SHA `f59e4d16a49659832ea562c3718cc5ba748b74fb`.
- runtime artifact `10886794088`, digest `sha256:644ca2135ec313334da862778869a7d1cd5771b62840bc43fbd4aeadaa67dbb5`;
- visual artifact `10887670005`, digest `sha256:6a553510abc8ee15100e419d89378b86c441365cef8dd2b6bce6d8d57d3e6982`.

Any later markdown-only tracking commit does **not** replace this validated source baseline.

## PHYSICAL EVIDENCE THAT CAUSED PR #147

The user supplied a 2560×1080, 60 fps, ~43.2 s recording from the CI #514 runtime artifact. Frame inspection establishes:
- normal Windows animations: Panel→Timer exposes transient target staging/loading states before the real task projection settles;
- the recording visibly changes Windows 10 `Show animations in Windows` from On to Off at ~27 s;
- with animations Off, transitions around ~32.8 s and ~34.3 s contain blank white target-host frames before Panel content appears;
- therefore PR #145's sequence (hidden native prepare → target React publish → hidden two-frame barrier → show) is insufficient for compositor continuity because a hidden WebView is not guaranteed to have a presentable composed frame.

This is a physical **FAIL** for item 7 on source `c875b4894e90cc75c04c9ff9508ef1dc1a176ad5` / CI #514. It is not evidence against the new #147 source until #517 is physically retested.

## COMPLETED CAPABILITY IN PR #147

The corrective path now performs:
1. hidden native target geometry preparation;
2. synchronous target React publication;
3. Win32 one-shot transparent prewarm of the same `focusSurface` HWND using `WS_EX_LAYERED` + alpha 0;
4. show the real host while fully transparent so WebView2 can paint;
5. the existing finite two-frame presented-frame barrier;
6. uncloak to alpha 255, remove the layered style when Narro added it, then publish native mode authority.

Recovery uses the same prepare → publish → transparent prewarm → frame → reveal path for the previous mode. Explicit prewarm cleanup exists for failed/cancelled paths. No additional focus webview, fixed-delay heuristic, polling loop, high-frequency JS window geometry, or renderer-owned timer/session authority was introduced.

The broader PR #146 was closed as superseded after #147 merged, leaving one implementation line.

## INVARIANTS

Preserve:
- normal two-webview model only: `main` plus reusable `focusSurface`;
- Rust/native authority for geometry, monitor/work-area/DPI placement and presentation mode;
- authoritative timer/session/task/scheduling/persistence outside renderer memory;
- live session continuity across Panel↔Timer, expand/collapse, shortcuts and window lifecycle;
- finite opacity/transform motion and reduced-motion usability;
- complete rollback/cleanup, including removal of Narro-owned layered style;
- no fixed timing delay/polling as a compositor substitute;
- all M1–M6 persistence-first/domain correctness invariants.

## UNFINISHED M7 WORK

Immediate item-7 physical retest on CI #517:
- continuous Panel→Timer and Timer→Panel at 60 fps with normal Windows animations;
- repeat after actual Windows `Show animations in Windows` is Off, then restore the user's setting;
- no blank/pale/staging/loading target frame or abrupt return flicker;
- no horizontal focus-surface scrollbar;
- expand/collapse retains no stale/duplicated expanded pixels;
- live session identity/time remains continuous.

Other existing M7 gates remain open exactly as tracked in `TODO.md` and `docs/M7_FLOATING_RUNTIME_VALIDATION.md`: native-hidden/Panel shortcut follow-up, secondary-monitor/topology/no-saved-position recovery, non-default taskbar/constrained-work-area/high-DPI cases, and independent borderless/optional exclusive-fullscreen stacking. Do not repeat settled resource measurements unless a performance-relevant source change occurs.

## EXACT NEXT ACTION

1. Recheck `main`, open PRs and CI before source work.
2. Use CI #517 runtime artifact `10886794088` for the same 60 fps physical transition test that failed #514.
3. Test normal animations first, then actual Windows animations Off; restore the OS setting afterward.
4. Inspect the returned recording frame-by-frame. If any target staging/loading/blank frame remains, diagnose that exact sequence and make only an evidence-backed M7 item-7 correction. If clean, record physical PASS and continue the remaining M7 matrix.
5. Create a new immutable work log for the physical result and reconcile TODO/STATUS/HANDOFF. Do not start M8.

No product-policy decision blocks the next action.
