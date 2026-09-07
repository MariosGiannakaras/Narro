# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, relevant `docs/UI_UX_SPEC.md` / `docs/RESEARCH_EVIDENCE.md` / `docs/BLITZIT_HISTORY_RISK_INDEX.md` evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 9 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`62d8d8a600ecdb6c42ba70db43f345a9687cfddf`

This is the guarded squash merge of PR #81 — `M5: add Home dashboard list cards`; Windows resulting-main CI #289 / run `34153630279` / job `101840803319` passed repository preflight, real Home Edge captures, Tauri release and required artifacts. Main docs-only tracking tip `3d49d50c8807aca068f2c9c76ad7d33b4b2c695a` does not replace the validated source/test baseline.

## ACTIVE SLICE

**M5 Main UI — List-card rest, hover/Open, overflow-menu and create-list states.**

Branch: `m5-list-card-interaction-states`, based on main docs tip `3d49d50c8807aca068f2c9c76ad7d33b4b2c695a`.

Candidate implementation now includes:

- typed callback-gated `HomeListCardActions` for Open/Edit/Duplicate/Archive; normal product Home receives none, so no dead controls are exposed before later targets exist;
- existing 2rem card-header action geometry now hosts the shared `Menu`/`MenuItem` primitives only when at least one real menu callback exists;
- `Open` is an absolutely positioned preview overlay that appears on pointer hover or keyboard `:focus-within` without changing card/header/title/footer geometry;
- overflow menu reproduces `Edit List`, `Duplicate`, divider and destructive `Archive List` states and retains existing keyboard navigation/dismissal/focus restoration from the shared menu primitive;
- Create List is a callback-gated dashed tile with centered plus / uppercase label and no looping animation;
- fixture-only callbacks force a deterministic Study hover/Open state, open overflow menu and Create List tile; normal fixture/product mode remains callback-free;
- Windows Edge capture harness now captures `list-card-states-light` and `list-card-states-dark` in addition to existing fixtures;
- visual validation checks rest/hover/create card geometry equality, menu/Open/Create presence, open-menu state, and exact light/dark geometry parity;
- deterministic `scripts/test-ui-list-card-states.mjs` checks callback gating, fixed action slot, absolute Open overlay, keyboard/focus parity, reduced-motion contract, validated token use and fixture wiring;
- `preflight:frontend` includes the new list-card state contract check;
- source review corrected two initially referenced nonexistent motion tokens before CI (`--motion-duration-interactive`, `--motion-distance-interactive`) to the validated `--motion-duration-hover-focus` / `--motion-distance-lift` tokens;
- no Rust/domain/persistence/list CRUD/modal/board/search/settings/reports code changed.

Local Node/Rust preflight: **NOT RUN** in this connector-only environment because no executable checkout/toolchain is available. No local PASS is claimed. Windows CI is the authoritative reproducible gate.

## USER-FACING PROGRESS

**`M-5/10 | 2/5 | 9/28`**

List-card-interaction-state checkpoints:

1. mandatory startup + current-main/spec/Home/overlay/visual-harness/risk inspection + narrow branch/scope — COMPLETE;
2. reusable rest/hover/Open/menu/create-list state implementation + deterministic static/visual candidate review — COMPLETE;
3. exact PR-head Windows CI including repository preflight, state captures, release and required artifacts — PENDING;
4. exact-head semantic/diff/review-thread check + expected-head guarded merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## IMPORTANT INVARIANTS

- authoritative Rust/domain/persistence state remains unchanged by this visual-state slice;
- validated Home read-only SQLite projection remains unchanged;
- card hover/focus/menu state must never change card/header/title/footer geometry or move pointer targets;
- runtime controls render only when an actual callback/target exists; deterministic fixture-only callbacks may exercise future visual states without becoming dead product controls;
- reuse the validated accessible overlay primitives instead of inventing a parallel menu implementation;
- keyboard focus mirrors pointer hover and existing menu keyboard behavior remains usable;
- reduced-motion removes nonessential Open translation while retaining state clarity;
- deterministic fixture sample data never appears as normal user data;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- do not absorb the separate Create/Edit List modal or any later M5 item.

## NEXT AGENT ACTION

Open/reuse one PR from `m5-list-card-interaction-states`, record its exact head SHA, and observe authoritative Windows CI on that exact head. Require repository preflight including the new list-card state static contract, real Edge light/dark list-card state captures, visual artifact upload, Tauri release and diagnostic artifact upload to succeed. If CI fails, inspect the exact failure log and fix only evidence-backed problems.

After exact-head PASS, inspect the exact changed-file diff plus all PR comments/reviews/inline threads, merge only with an expected-head guard, validate the resulting main source SHA with Windows CI, and only then mark `List-card rest, hover/Open, overflow-menu and create-list states` complete and reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` plus one new immutable work-log entry.

## USER ACTION REQUIRED

**None.**
