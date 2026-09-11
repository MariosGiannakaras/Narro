# HANDOFF.md

Canonical zero-context continuation state for Narro. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 5 in `TODO.md`, relevant `STATUS.md`, Notes/focus sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/SOURCE_AUDIT.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant immutable `work-log/*.md` entry before changing source.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **20 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`766781b03caa01b9c70d7af10827d751d998caba`

Source tree:

`93e72feb5da74fcaf6de16ab3b120c32008eddc6`

This is the expected-head guarded merge of PR #92 — `M5: add rich task notes editor and viewer`. Markdown-only tracking descendants, including reconciliation commit `983213fba7b233183151fd3939fc246ba6918166`, do not replace this source baseline.

Latest completed immutable evidence: `work-log/2026-09-11-1629-chatgpt-m5-rich-task-notes.md`.

## ACTIVE IMPLEMENTATION SLICE

**M5 item 21/28 — Require explicit click/keyboard activation to open note URLs; do not auto-launch links when entering focus.**

Branch: `m5-note-url-activation`

Slice base / main tracking tip at start:

`983213fba7b233183151fd3939fc246ba6918166`

Reviewed source/test candidate before this HANDOFF-only descendant:

`2652d6a2a35b36d49ee635ec8b916b645eb009a6`

No open implementation PR or unfinished implementation CI existed at slice startup. The markdown-only reconciliation commit triggered no CI.

### Checkpoint 1 — startup reconstruction + evidence-backed contract — COMPLETE

Evidence inspected:

- mandatory repository startup files and active M5 roadmap/tracking state;
- newest validated Rich Notes work log and PR/main CI evidence;
- `docs/BLITZIT_HISTORY_RISK_INDEX.md` risk N-01: source-product automatic note-link opening on Blitz entry is a resolved bug class and a required Narro anti-regression;
- `docs/SOURCE_AUDIT.md` and `docs/PRODUCT_SPEC.md`: historical Help Center text described auto-open on live-task entry, while later roadmap evidence resolves it as a bug;
- `docs/BEHAVIOR_MATRIX.md`: note URL click opens explicitly in the default browser; a task containing a URL becoming live must not auto-launch;
- current `TaskNotes.tsx`, `taskNotes.css`, `scripts/test-ui-task-notes.mjs`, `focus.tsx`, `TimerSessionProjection.tsx`, package preflight and all repository `openUrl` / opener call sites.

Current source finding:

- exactly one production `openUrl()` call and one production opener import exist, both in `TaskNotes.tsx`;
- the call is inside the click handler of a native button, which supplies pointer plus Enter/Space keyboard activation;
- the saved-link button already has focus-visible styling;
- editor anchor pointer navigation is suppressed;
- Notes lazy-load effects and current focus/timer projections have no URL-open side effect;
- no evidence-backed behavior defect required a behavior rewrite.

Contract:

- Preserve existing explicit saved-link opener behavior and `http`/`https` validation; never reintroduce historical auto-open behavior.
- Keep focus entry/show/mode projection, task-live selection/switch, pause/resume, timer/session events, renderer refresh/recreation and note lazy refresh URL-side-effect free.
- Keep the explicit opener encapsulated in reusable `TaskNotes`, so future M6 Focus Notes may reuse it without direct focus-transition opener code.
- Add durable anti-regression coverage without schema/native-command/polling/remote-preview/timer changes.
- Keep larger/resizable Notes editing and spellcheck separate.

### Checkpoint 2 — hardening + deterministic anti-regression + semantic/diff review — COMPLETE

Implementation:

- `TaskNotes.tsx` saved-link button now carries `data-note-url-activation="explicit"` and an explicit accessible name; visual geometry and opener behavior are otherwise unchanged.
- Added `scripts/test-note-url-activation.mjs` as the dedicated N-01 regression gate.
- The new gate recursively inspects production TypeScript/TSX source and requires exactly one opener import and exactly one `openUrl()` call, both isolated to `TaskNotes.tsx`.
- It isolates `NoteRun` and requires native `<button type="button">` semantics, the explicit marker, accessible name, click handler and opener-call ordering.
- It preserves `http`/`https` validation, editor anchor-navigation suppression and saved-link `:focus-visible` styling.
- It rejects effect/focus-driven opener logic in the saved-link component.
- It checks `focus.tsx`, `TimerSessionProjection.tsx`, `timerSessionApi.ts`, `App.tsx`, `ListBoard.tsx` and `TaskCard.tsx` for direct opener/browser-navigation side effects, covering current focus/live/session/window projection paths.
- It separately isolates the task-note lazy-load effect and requires it to remain URL-side-effect free.
- Wired the new gate as `test:note-url-activation` into `preflight:frontend` immediately after the existing rich Notes contract.

Review / validation available before CI:

- exact base `983213fba7b233183151fd3939fc246ba6918166` to candidate `2652d6a2a35b36d49ee635ec8b916b645eb009a6`: ahead by 4, behind by 0;
- changed files: `TaskNotes.tsx` +2 lines, new 122-line anti-regression script, `package.json` +2/-1, `HANDOFF.md` tracking only;
- no Rust, persistence, timer/session, focus behavior, layout/CSS or later Notes scope changed;
- local scratch `node --check` of the exact new `.mjs` source: **PASS**;
- full local repository test/preflight: **NOT RUN** because this environment cannot obtain a local GitHub checkout; Windows GitHub Actions remains authoritative.

## USER-FACING PROGRESS

Five-checkpoint slice:

1. startup reconstruction + evidence-backed URL activation/no-auto-launch contract — **COMPLETE**;
2. explicit activation hardening + deterministic source-wide anti-regression coverage + semantic/diff review — **COMPLETE**;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/work-log reconciliation — PENDING.

## INVARIANTS THAT MUST NOT REGRESS

- Rust/domain/persistence remains authoritative and mutations remain persistence-first.
- Stable task/subtask identity, tracked Time Taken, timer/session accounting and one-open-session protection must not regress.
- All Lists remains an aggregate read projection.
- Scheduling/date-only/timezone/recurrence semantics validated through M4/M5 remain unchanged.
- Notes persistence, rich formatting and task-card geometry from item 20/28 remain unchanged.
- Note URLs require explicit pointer/keyboard activation and may never auto-launch merely because focus/live task/session/window state changes.
- Future Focus Notes may call the same reusable explicit `TaskNotes` activation path; focus transition/effect code itself must not open URLs.
- Excluded account/trial/upgrade/profile/AI/integration controls remain absent.
- Diagnostics remain gated behind `?diagnostics=1`.

## TRACKING STATE

- `TODO.md`: item 21 remains unchecked until exact-head PR CI, expected-head merge, resulting-main Windows CI and reconciliation all pass.
- `STATUS.md`: M5 remains **20/28**.
- Validated source baseline remains `766781b03caa01b9c70d7af10827d751d998caba`.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Open/resume the implementation PR for `m5-note-url-activation`, record its exact head SHA and inspect authoritative Windows CI. If CI fails, change only the evidence-backed failure. If CI succeeds, perform final exact-head diff/review-thread checks, expected-head merge, resulting-main Windows CI, then reconcile item 21 to 21/28 in TODO/STATUS/HANDOFF and create a new immutable work log.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks checkpoint 3.
- Full local repository preflight is NOT RUN because the container cannot resolve GitHub and no local Narro checkout is available.
- Windows GitHub Actions remains authoritative for full frontend/Rust/Tauri validation.
