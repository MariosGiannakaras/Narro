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

- there is exactly one production `openUrl()` call and one production `@tauri-apps/plugin-opener` import, both in `TaskNotes.tsx`;
- the opener call is inside the `onClick` handler of a native `<button type="button">`, so normal pointer activation and native Enter/Space keyboard activation are explicit;
- the saved-link button already has `:focus-visible` styling;
- the editor prevents navigation when clicking editable anchors;
- the Notes lazy-load `useEffect` does not open links;
- `focus.tsx` and `TimerSessionProjection.tsx` contain no Notes/opener URL side effect;
- there is no evidence-backed behavior defect to fix before adding the dedicated anti-regression layer.

Implementation contract:

- Preserve the existing explicit saved-link button/opener behavior; do not introduce auto-open compatibility with historical Blitzit Help Center text.
- Keep `http`/`https` validation and no-remote-preview behavior unchanged.
- Add a durable explicit activation marker/accessibility label to the saved-link button without changing visual geometry.
- Add one dedicated deterministic source-product anti-regression script that scans production frontend source, not only `TaskNotes.tsx`.
- The anti-regression must require exactly one production opener import/call, bound to the explicit Notes button handler, and reject opener/navigation side effects outside that path.
- Explicitly cover focus/live transition surfaces: `focus.tsx`, `TimerSessionProjection.tsx`, `timerSessionApi.ts`, `App.tsx`, `ListBoard.tsx`, and `TaskCard.tsx` must not directly open note URLs from state/event/effect transitions.
- Do not forbid future Focus UI from rendering the reusable `TaskNotes` component; future explicit link clicks in Focus remain allowed because opening stays encapsulated in the same explicit button path.
- State/event transitions that must remain URL-side-effect free include focus entry/show/mode projection, task-live selection/switch, pause/resume, timer/session events, renderer refresh/recreation and board/note lazy refresh.
- Do not add a schema migration, new native URL command, polling, remote fetch/preview, or timer/session mutation.
- Keep larger/resizable Notes editing and WebView/browser spellcheck as later ordered TODO items.
- No new manual Windows observation is required for this source-only anti-regression slice unless CI or implementation introduces a native behavior change; Windows CI remains authoritative for build/static/Rust/Tauri regression validation.

## USER-FACING PROGRESS

New five-checkpoint slice:

1. startup reconstruction + evidence-backed URL activation/no-auto-launch contract — **COMPLETE**;
2. explicit activation hardening + deterministic source-wide anti-regression coverage + semantic/diff review — PENDING;
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
- Excluded account/trial/upgrade/profile/AI/integration controls remain absent.
- Diagnostics remain gated behind `?diagnostics=1`.

## TRACKING STATE

- `TODO.md`: item 21 remains unchecked until exact-head PR CI, expected-head merge, resulting-main Windows CI and reconciliation all pass.
- `STATUS.md`: M5 remains **20/28**.
- Validated source baseline remains `766781b03caa01b9c70d7af10827d751d998caba`.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Continue on `m5-note-url-activation`. Implement checkpoint 2 narrowly: add the explicit saved-link activation marker/accessibility hardening, add the dedicated source-wide N-01 anti-regression script, wire it into frontend preflight, then review the exact diff from base `983213fba7b233183151fd3939fc246ba6918166`. Do not change URL behavior unless source/tests reveal an actual defect.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks checkpoint 2.
- Local checkout/toolchain validation is unavailable because the container cannot resolve GitHub.
- Windows GitHub Actions remains authoritative for full frontend/Rust/Tauri validation after the reviewed source candidate is ready.
