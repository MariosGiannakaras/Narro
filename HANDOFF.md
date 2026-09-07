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

Branch: `m5-list-card-interaction-states`, created from current main docs tip `3d49d50c8807aca068f2c9c76ad7d33b4b2c695a`.

Evidence/scope established from current repository state:

- `docs/UI_UX_SPEC.md` requires list-card rest state with icon/name/overflow/preview/footer, hover state with a prominent `Open` affordance and unchanged card geometry, overflow menu items `Edit List`, `Duplicate`, divider, `Archive List`, and a dashed rounded `CREATE LIST` tile;
- `docs/RESEARCH_EVIDENCE.md` identifies `Screenshot_3.png` as the direct current list-card hover/overflow reference and `Screenshot_2.png` as the direct Create List tile reference;
- source-product reliability evidence requires hover/action controls to occupy reserved geometry and never move while targeted;
- validated Home cards already reserve a fixed 2rem header action slot and existing `Menu`/`MenuItem` overlay primitives provide keyboard navigation, dismissal and focus restoration;
- `Open` targets the later list-board item, `Edit List` targets the separate Create/Edit List modal item, and archive/settings flows are later ordered work. Therefore normal product mode must not expose no-op controls before valid callbacks/targets exist;
- implement reusable callback-driven card/tile interaction capability plus deterministic fixtures that force the evidenced hover/Open/menu/create-list states; normal Home should preserve its current baseline unless a real callback is supplied;
- do not add list CRUD/mutation commands, Create/Edit List modal, list board, task editing, search, Settings or Reports behavior in this slice.

Local Node/Rust preflight remains **NOT RUN** in this connector-only environment because no executable checkout/toolchain is available here. Authoritative Windows CI remains required after candidate review.

## USER-FACING PROGRESS

**`M-5/10 | 1/5 | 9/28`**

List-card-interaction-state checkpoints:

1. mandatory startup + current-main/spec/Home/overlay/visual-harness/risk inspection + narrow branch/scope — COMPLETE;
2. reusable rest/hover/Open/menu/create-list state implementation + deterministic static/visual candidate review — PENDING;
3. exact PR-head Windows CI including repository preflight, state captures, release and required artifacts — PENDING;
4. exact-head semantic/diff/review-thread check + expected-head guarded merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## IMPORTANT INVARIANTS

- authoritative Rust/domain/persistence state remains unchanged by this visual-state slice;
- validated Home read-only SQLite projection remains unchanged;
- card hover/focus/menu state must never change card/header/title/footer geometry or move pointer targets;
- runtime controls render only when an actual callback/target exists; deterministic fixture-only controls may exercise future visual states without becoming dead product controls;
- reuse the validated accessible overlay primitives instead of inventing a parallel menu implementation;
- keyboard focus must mirror pointer hover and menu keyboard behavior must remain usable;
- reduced-motion behavior must remain usable and remove nonessential translation/scale;
- deterministic fixture sample data must never appear as normal user data;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- do not absorb the separate Create/Edit List modal or any later M5 item.

## NEXT AGENT ACTION

Implement checkpoint 2 only: refactor the existing Home list card into a reusable state-capable component without changing its validated rest geometry; add callback-gated `Open` and overflow menu actions using the existing `Menu`/`MenuItem` primitives; add a callback-gated Create List tile; extend deterministic fixtures/harness with representative rest, forced-hover/Open, open-overflow and Create List tile states in light/dark; add static contract checks for callback gating, keyboard/accessibility and no-layout-shift geometry. Review the complete diff before opening one PR.

## USER ACTION REQUIRED

**None.**
