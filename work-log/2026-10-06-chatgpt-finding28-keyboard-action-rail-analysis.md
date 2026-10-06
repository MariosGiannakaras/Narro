# Finding28 — post-drag keyboard action-rail analysis

Date: 2026-10-06

Status: **ANALYZED / NEEDS_REGRESSION_FIRST**

Scope: analysis/disposition only. No Narro runtime/source/test correction is implemented by this record.

## Finding

On the exact CI953 Windows candidate, after real pointer drag activity in the recreated 100% Main board, the owned Alpha task title retained real keyboard focus while the task action rail remained absent. Actual pointer hover immediately exposed the rail.

The original capture marked this as `REVIEW_PENDING`; this analysis resolves the observation as a real runtime mismatch against Narro's already-accepted keyboard-access contract, but does **not** yet establish the safe causal correction.

## Exact evidence identity

- Candidate/source: CI953 / `38219e20...`, EXE SHA-256 `bde7646d9a3f17af0078c41e8a90173bc044f6747d24fde278e6f5739ebe05d8`.
- Packet: `work-log/evidence/m7-ci953-theme-20261005/`.
- Relevant whole recording: second original beginning 2026-10-05T08:16:21.598Z; packet bookmark is approximately 332–335 s.
- Exact runtime: recreated Main HWND `1968730`, PID `130912`, Windows native DPI 96 / 100%.
- 08:20:30.293Z and 08:20:34.821Z: real SendInput drags.
- 08:21:54.452Z: physical Tab.
- 08:21:54.895Z: physical Shift+Tab.
- Observation36 at 08:21:18.684Z and observation37 at 08:21:55.922Z expose the Alpha title button with `focus: true` while the rail action controls are absent.
- Observation38 at 08:21:56.897Z keeps the Alpha title focused and, after actual pointer hover, exposes Subtasks, Notes, lane-left, lane-right and Task actions.

The native observation helper was checked directly: its JSON `focus` field is `AutomationElement.Current.HasKeyboardFocus`, not a generic focusable-state flag. Therefore the observations establish genuine keyboard focus.

## Current-source comparison

Current `src/TaskCard.tsx` renders the editable task title as a real button inside `.list-board-task` and retains the task action rail in a reserved action slot.

Current `src/listBoard.css` intentionally hides the rail at rest, but explicitly reveals it for:

- `.list-board-task:hover .list-board-task__actions`;
- `.list-board-task:focus-within .list-board-task__actions`;
- `.list-board-task-drag-shell:focus-visible .list-board-task__actions`.

The existing `scripts/test-ui-task-hover-actions.mjs` checks that those selectors exist, but it is a source/static contract and does not deterministically reproduce post-drag runtime focus + computed visibility.

The established M5 hover-action contract already says that hover, task-card focus and child focus reveal the action rail. This finding therefore does not require inventing new Blitzit semantics to recognize the Narro accessibility/interaction mismatch.

## Causal assessment

The observed runtime state contradicts the apparent CSS contract: a descendant title button has real keyboard focus, yet the rail behaves as if neither `:focus-within` nor the shell focus path owns reveal; pointer hover then works immediately.

That contradiction is sufficient to establish a failure, but insufficient to select a safe patch. Plausible mechanisms include post-drag DOM/focus ownership, renderer/WebView focus projection, remount/state churn, selector applicability, or another computed-style/runtime condition. No one of those causes is yet proven.

A blind extra CSS rule, forced persistent rail, or focus reassignment would therefore be speculative and could regress drag, title editing, pointer behavior or keyboard traversal.

## Disposition

**NEEDS_REGRESSION_FIRST**

Before changing production behavior, add the narrowest deterministic runtime regression that reproduces the relevant sequence and records/asserts:

1. the exact `document.activeElement` after drag and Tab/Shift+Tab;
2. whether the owning card matches `:focus-within`;
3. whether the drag shell matches `:focus-visible`;
4. the rail's computed `opacity`, `visibility` and `pointer-events`;
5. the same values before/after actual pointer hover;
6. no mutation/reorder/title-edit side effect from the keyboard probe.

Only after that regression identifies which authority diverges should an implementation chat route a narrow correction.

## Evidence limit

The committed whole recording and packet bookmark remain canonical evidence, but this analysis environment did not independently decode/review the binary MP4/MKV frames. The disposition above relies on the exact physical-input timeline plus three native UIA snapshots from the same run and direct source/test inspection. Because the claim is keyboard-focus/action-availability state rather than motion timing or visual-source parity, this is enough to establish the runtime mismatch, but not enough to claim a continuous-motion or source-parity result.

## Non-effects

- No application source or tests changed.
- No CI/build/manual acceptance was run.
- No roadmap/milestone counter advances.
- PR242 / M6 Focus rail work is separate and must not be treated as a correction for this Main-board finding.
