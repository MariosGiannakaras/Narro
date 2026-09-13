# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md` when timer/session reliability risks apply, and the newest relevant immutable `work-log/*.md` entries. Inspect open implementation PRs and their exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **3 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `afaffaf616be89f8a967e61fb1c82b8453d83af8`

Source tree: `14fe75bdc155fb1aeb8a101ad76948fe10f38503`

Latest reconciled tracking tip before this feature branch: `4a3944a436ab1c2a1c6d1ec1a967e089f9893da2`.

This source baseline is the resulting-main source SHA of PR #102 after authoritative Windows main CI #402 passed. Markdown-only tracking/checkpoint commits do not replace it.

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 item 3/16 — Reproduce Focus Panel hierarchy.**

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-panel-hierarchy.md`.

- PR #102 final exact head `4f34d1e9bc108bb3a44c42be24121239b13f82f3`;
- Windows PR CI #401 / run `34723924944` / job `103634614847`: **SUCCESS**;
- expected-head guarded squash merge source SHA `afaffaf616be89f8a967e61fb1c82b8453d83af8`;
- Windows main CI #402 / run `34728728053` / job `103647484892`: **SUCCESS**;
- visual artifact `10309072118`, digest `sha256:c17f5a7aba0fcd44defc7d5a1da4243f632bdf344791fdc1ec8b01346a9cd196`;
- diagnostic artifact `10309022543`, digest `sha256:9c608b9033ebcb0e37d5a27cad0bc74ad30f2841890cb7e627fbdd6866b9daed`.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 4/16 — Render current task and authoritative timer with fixed/tabular timer geometry.**

Implementation branch: `m6-focus-live-timer`.

Current small-slice progress: **2/5**.

Implementation candidate before this checkpoint documentation:

`00e654c352a4f2c13f418a1ec4341e01b3ce39ab`

### Checkpoint 1/5 — COMPLETE: mandatory reconstruction + presentation contract

Repository/source evidence establishes:

- source hierarchy requires highlighted current task with live timer at right;
- timer numerals must be tabular and occupy stable/fixed geometry;
- EST countdown displays authoritative `countdown_remaining_ms` and reaches explicit `Time's Up` at zero;
- count-up displays authoritative `work_elapsed_ms`;
- Pomodoro work uses authoritative sprint countdown rather than task EST;
- breaks use authoritative `break_remaining_ms`;
- overtime uses authoritative `overtime_ms` and is visually distinct from remaining estimate;
- actual work/session accounting remains Rust-owned and independent from renderer refresh cadence;
- the existing Rust timer runtime advances from its monotonic logical clock and `timer_session_snapshot` exposes the last Rust-observed persistence-coherent projection;
- no item-4 work may introduce a renderer-owned elapsed-time clock, second session authority, per-second database writes, item-5 queue semantics or item-6 controls.

### Checkpoint 2/5 — COMPLETE: narrow implementation + deterministic/visual coverage + semantic/diff review

Implemented scope:

- `FocusPanel` now renders the current task title with an authoritative timer readout in the active card;
- display formatting covers EST countdown, count-up, Pomodoro work, break countdown, explicit `Time's Up`, overtime running and overtime paused using only fields from `TimerSnapshot`;
- countdown values round upward to the next displayed second; elapsed/overtime values round downward, avoiding premature zero or fabricated elapsed time;
- timer geometry is a fixed `10ch` slot and uses the existing `timer-numerals` / `data-timer-numerals` tabular-figure primitive;
- timer updates do not animate digits and use `aria-live="off"` to avoid per-second screen-reader chatter while retaining an accessible state/value label;
- added `connectLiveTimerSessionProjection`: it preserves listen-before-snapshot race protection and revision ordering, then requests `timer_session_snapshot` at most once per second only while the authoritative state is `running`, `break`, or `overtime_running`;
- the renderer timeout controls only when to request the next Rust snapshot; it never derives elapsed/remaining time, mutates timer/session state, writes persistence, or replaces Rust timer authority;
- paused, Time's Up, overtime-paused and idle states stop live sampling until a typed timer event makes a ticking state authoritative again;
- existing list-board refresh remains transition-driven (`incoming.change` only), so per-second timer sampling does not poll planning state;
- deterministic production Focus fixture now captures live timer geometry and EST value; Windows visual validator requires the authoritative `38:00` fixture value, tabular marker, accessible label and stable live-timer width across light/dark themes;
- the existing Focus static preflight gate now rejects local `Date.now`, `performance.now` and `setInterval` timer authority, requires authoritative snapshot sampling/revision ordering, and verifies mode/state presentation branches;
- exact reviewed diff from reconciled main contains only six files: `src/timerSessionApi.ts`, `src/FocusPanel.tsx`, `src/focusPanel.css`, `src/focusPanelVisualFixture.tsx`, `scripts/validate-focus-panel-captures.mjs`, `scripts/test-ui-focus-panel.mjs`;
- no Rust/Tauri source, schema/migration, domain/timer engine, scheduling policy, dependency/lockfile, Focus actions, queue grouping semantics, Notes URL behavior, Floating Timer, preferences/shortcuts, Reports or release scope changed.

Local Node/Rust preflight is **NOT RUN** because this implementation environment is connector-only. Authoritative Windows CI is required on the exact PR head.

### Five checkpoints for this slice

1. mandatory reconstruction + exact current-task/timer presentation contract from source docs/screenshots and existing timer projection — **COMPLETE**;
2. narrow production implementation + deterministic/visual coverage + semantic/diff review — **COMPLETE**;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- Focus Panel and Floating Timer remain presentations of the existing authoritative Rust-owned timer/session state; renderer state cannot become parallel authority.
- `main` and `focusSurface` remain the normal two-webview architecture; do not create a third persistent focus webview.
- Start Blitz and later focus controls preserve stable task identity, durable Time Taken/session accounting, persistence-first transitions, recovery, sleep policy, Time's Up/overtime and Pomodoro semantics validated in M3.
- Future-timed Today tasks remain ineligible until due; Focus rendering cannot reinterpret scheduling eligibility.
- Narro launch or renderer creation cannot implicitly start a timer; only explicit domain actions mutate timer/session state.
- Item 4 consumes the existing revisioned timer/session projection; renderer sampling frequency cannot determine authoritative elapsed time or session state.
- Live timer sampling may request the Rust snapshot only while a displayed value is changing; it must stop in stable timer states and must not poll SQLite/list-board state.
- Timer geometry remains fixed and timer numerals tabular; ordinary refreshes cannot reflow the active-card title or move hit targets.
- Entering Focus Mode or changing the live task must never auto-open note URLs.
- Task/list/archive/Search/theme/preferences behavior validated through M5 must not regress.
- diagnostics remain gated behind `?diagnostics=1`.
- do not absorb item 5 grouping/workflow semantics, item 6 Focus actions, Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Milestone 9 Reports or Milestone 10 release work.

## UNFINISHED WORK / EXACT NEXT ACTION

Inspect the exact branch head after this HANDOFF commit, open one PR for `m6-focus-live-timer`, and require authoritative Windows CI on that exact PR head. Do not change implementation unless CI or review produces evidence. Require Repository Preflight, TypeScript/Vite build, Focus Panel Windows Edge light/dark capture/validation, Tauri Release and required artifact uploads before checkpoint 3.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks M6 item 4.
- Full local Rust/Tauri/Node validation is unavailable in this connector-only environment; local preflight is **NOT RUN** and authoritative Windows GitHub Actions is required before merge.
