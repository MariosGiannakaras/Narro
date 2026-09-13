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

This is the resulting-main source SHA of PR #102 after authoritative Windows main CI #402 passed. Markdown-only tracking descendants do not replace this validated source/test baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 item 3/16 — Reproduce Focus Panel hierarchy.**

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-panel-hierarchy.md`.

Implementation branch: `m6-focus-panel-hierarchy`.

PR #102 — `M6: reproduce Focus Panel hierarchy`.

Final exact PR head:

`4f34d1e9bc108bb3a44c42be24121239b13f82f3`

Authoritative PR validation:

- Windows CI #401 / run `34723924944` / job `103634614847`: **SUCCESS**;
- Repository Preflight, TypeScript/Vite, Rust fmt/check/clippy/tests, Focus Panel Windows Edge light/dark capture/validation, Tauri Release and both required artifact uploads: **SUCCESS**;
- visual artifact `10307940032`, digest `sha256:ff6b596e284cf65ad5aab2d36098cc6f3f296e2b68f1c76149bc704d75c64203`;
- diagnostic artifact `10307700842`, digest `sha256:4ba893354d5ab3486db9cc11a998bc54fa41afa973cfa40ee222fd2ff3ef87ee`;
- final PR review found only the expected 11-file Focus Panel/fixture/HANDOFF scope; no comments, reviews, or unresolved threads required action;
- `main` remained at the exact PR base through review;
- expected-head guarded squash merge succeeded.

Resulting-main validation:

- source SHA `afaffaf616be89f8a967e61fb1c82b8453d83af8`;
- tree `14fe75bdc155fb1aeb8a101ad76948fe10f38503`;
- Windows CI #402 / run `34728728053` / job `103647484892`: **SUCCESS**;
- Repository Preflight, production Windows Edge visual regression, visual artifact upload, Tauri Release and diagnostic artifact upload: **SUCCESS**;
- visual artifact `10309072118`, digest `sha256:c17f5a7aba0fcd44defc7d5a1da4243f632bdf344791fdc1ec8b01346a9cd196`;
- diagnostic artifact `10309022543`, digest `sha256:9c608b9033ebcb0e37d5a27cad0bc74ad30f2841890cb7e627fbdd6866b9daed`.

Validated capability:

- normal `focusSurface` now renders the source-evidenced Focus Panel hierarchy; the prior M1 diagnostic renderer remains available only through `?diagnostics=1`;
- the panel composes existing home/list-board/timer-session read models and keeps renderer state presentation-only;
- list selector, Today heading, quick controls, aggregate EST/progress, active live card, remaining queue, All-list origin chips, overdue/schedule/subtask metadata, Add Task hierarchy row, Scheduled group and Done group are present;
- list selector changes read context only and does not mutate domain/session state;
- timer transitions update the planning projection through the existing revisioned typed event path; no polling or parallel timer authority was introduced;
- hierarchy-only later-item controls remain explicitly non-mutating;
- deterministic production-component fixtures and Windows Edge light/dark captures validate production Focus DOM/CSS;
- no Rust/Tauri source, schema/migration, timer engine, scheduling policy, dependencies/lockfile, Notes URL behavior, Floating Timer, preferences/shortcuts, Reports or release behavior changed in item 3.

Earlier CI #396 and #398 failures were narrow evidence-only failures: a TypeScript union narrowing issue and then a visual validator assumption about DOM layout height. Both were corrected without broadening product behavior; final PR CI #401 and resulting-main CI #402 passed.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 4/16 — Render current task and authoritative timer with fixed/tabular timer geometry.**

No implementation branch or PR for item 4 should be assumed from this reconciliation. Reconstruct exact current `main`, open PRs, and CI before source changes.

Current small-slice progress: **0/5**.

### Five checkpoints for this slice

1. mandatory reconstruction + exact current-task/timer presentation contract from source docs/screenshots and existing timer projection — pending;
2. narrow production implementation + deterministic/visual coverage + semantic/diff review — pending;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- Focus Panel and Floating Timer remain presentations of the existing authoritative Rust-owned timer/session state; renderer state cannot become parallel authority.
- `main` and `focusSurface` remain the normal two-webview architecture; do not create a third persistent focus webview.
- Start Blitz and later focus controls preserve stable task identity, durable Time Taken/session accounting, persistence-first transitions, recovery, sleep policy, Time's Up/overtime and Pomodoro semantics validated in M3.
- Future-timed Today tasks remain ineligible until due; Focus rendering cannot reinterpret scheduling eligibility.
- Narro launch or renderer creation cannot implicitly start a timer; only explicit domain actions mutate timer/session state.
- Item 4 must consume the existing revisioned timer/session projection; it must not derive authoritative elapsed time from a renderer-owned interval or create a second session clock.
- Timer geometry must remain stable/fixed and timer numerals tabular; ordinary renderer refreshes cannot cause control/text reflow that moves hit targets.
- Entering Focus Mode or changing the live task must never auto-open note URLs.
- Task/list/archive/Search/theme/preferences behavior validated through M5 must not regress.
- keyboard/focus-visible access, stable action geometry, reduced-motion behavior and accessible naming remain required.
- diagnostics remain gated behind `?diagnostics=1`.
- do not absorb Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Milestone 9 Reports, or Milestone 10 release work.

## UNFINISHED WORK / EXACT NEXT ACTION

Start M6 item 4 only after the mandatory startup reconstruction. Inspect the current production `FocusPanel`, `TimerSessionProjection`/timer session API, `focusSurface` entry, relevant Focus screenshots/spec text, and source-risk index for timer reliability. Define the exact presentation-only contract for current task identity/title and authoritative timer state/geometry before editing source. Preserve the already validated item-3 hierarchy and do not begin item 5 grouping or item 6 controls unless item 4 has an inseparable dependency.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 4.
- Full local Rust/Tauri/Node validation remains unavailable in the connector-only environment; authoritative Windows GitHub Actions is required for implementation validation.
