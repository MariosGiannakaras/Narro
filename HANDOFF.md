# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, `docs/UI_UX_SPEC.md`, `docs/RESEARCH_EVIDENCE.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 13 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`9a93ae58c235a0d56b3879bb48d553dcb021aeb7`

This is the expected-head guarded squash merge of PR #85 — `M5: add task card state model`.

Task-card validation evidence:

- final PR #85 head `e192df8a920cfb2c9227c734ca47a2307dc21dc2`;
- Windows PR CI #317 / run `34270409390` / job `102210278846`: **SUCCESS**;
- PR visual artifact `10073839851`, digest `sha256:3503ab0dc7e9e601af07f640667e73a95971748f78321b958c81977a0c09d5f5`;
- PR diagnostic artifact `10074080790`, digest `sha256:c6d745469ff4914a75aaf182463ee6041b604677db6451386e4080507076fc1e`;
- expected-head guarded squash merge produced `9a93ae58c235a0d56b3879bb48d553dcb021aeb7`;
- Windows main CI #318 / run `34271876368` / job `102215181335`: **SUCCESS**;
- main visual artifact `10074394863`, digest `sha256:077835b516adbaecef115ae621d5765933f20672cc2b0768c949c137092d6272`;
- main diagnostic artifact `10074634760`, digest `sha256:18871e7966d097c3f8b7d13987d7debac8aacf612f2ecbf962dc138315f8a951`.

PR CI #316 / run `34267196942` failed only at `cargo fmt --check`; the exact Windows rustfmt output was applied to `src-tauri/src/list_board.rs` in the final validated head. No runtime/test semantic change was made by that correction.

Tracking descendants are markdown-only and do not replace the validated source/test baseline. Detailed completed-slice evidence: `work-log/2026-09-08-chatgpt-m5-task-card-state-model.md`.

## ACTIVE SLICE

**M5 Main UI — Drag/drop or equivalent reorder/move behavior with stable placeholder/drop animation.**

No feature branch/PR exists yet for this new slice. Create a coherent branch from the latest main tracking tip after verifying it still descends from validated source SHA `9a93ae58c235a0d56b3879bb48d553dcb021aeb7`.

Scope for this slice:

- persistence-backed task reorder within a planning lane and task move between planning lanes, reusing validated M2 identity/order mutation boundaries;
- renderer interaction that never treats DOM order as authoritative and only presents success after the local mutation commits;
- stable drag/drop or keyboard-equivalent affordance with deterministic placeholder/drop feedback and reduced-motion behavior;
- exact-set anti-regression coverage: repeated reorder/move preserves task count and task IDs, including scheduled tasks;
- minimum board refresh/projection/fixture/visual-validation plumbing required to exercise the behavior.

Explicitly out of scope unless a strict dependency is proven: the separate hover-action-geometry checklist item, task creation/inline editing, EST/Time Taken editing, scheduling/recurrence editor, subtasks, rich notes, list settings, search, Settings and Reports.

## USER-FACING PROGRESS

**`M-5/10 | 0/5 | 13/28`**

The current-slice counter resets here because the validated task-card slice is complete and this is a genuinely new ordered implementation slice.

Drag/drop/reorder checkpoints:

1. mandatory startup + exact current-main/domain/persistence/board/risk/spec/test inspection + narrow reorder/move scope — PENDING;
2. persistence-backed reorder/move implementation + interaction/placeholder/reduced-motion + deterministic identity/regression/visual coverage + semantic/diff review — PENDING;
3. exact PR-head Windows CI including repository preflight, visual captures, release and required artifacts — PENDING;
4. exact-head semantic/diff/feedback review + expected-head guarded merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## COMPLETED CAPABILITIES / INVARIANTS THAT MUST NOT REGRESS

- authoritative Rust/domain/persistence state and persistence-first mutation semantics remain authoritative;
- reorder changes position/lane only; it must never create, delete or alias task identities;
- stable task identities and one-open-session invariant must not regress;
- renderer-independent timer/session accounting must not regress;
- scheduled tasks retain validated M4 schedule semantics; lane moves must not duplicate identities or incorrectly erase schedule metadata;
- scheduled pending tasks remain projected through effective planning-lane semantics rather than schedule-driven `manual_lane` mutation;
- archived lists/tasks remain absent; completed non-archived tasks project to Done exactly once;
- All Lists remains an aggregate projection, never a persisted synthetic list;
- task identity duplication in board projection fails closed;
- stored configured timezone wins over renderer fallback and timezone identifiers remain validated;
- task-card production states now include normal, scheduled, overdue and done from authoritative read metadata plus durable Time Taken;
- action-revealed task-card geometry is reserved/overlayed and must not reflow title/card geometry or move pointer targets;
- fixture-only inline-create, notes-expanded, subtasks-expanded, paused/editable and destructive-confirm presentations must not be mistaken for implemented mutations;
- notes must never auto-launch URLs; explicit click/keyboard activation remains required when link behavior is implemented;
- existing Create/Edit List, Home, shell, theme, overlay, reduced-motion and exact 1280x720 PNG contracts must not regress;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Inspect the existing M2 task reorder/move persistence APIs and tests, the current `ListBoard`/`TaskCard` renderer path, relevant `docs/UI_UX_SPEC.md` drag/drop/motion evidence, and the reorder/duplication failure family in `docs/BLITZIT_HISTORY_RISK_INDEX.md`. Verify the latest main/tracking tip and that no implementation PR appeared concurrently.

Then create one coherent M5 reorder branch and implement the narrow persistence-backed reorder/move slice directly. Prefer the simplest deterministic interaction that preserves stable IDs, persistence-first success, keyboard accessibility and reduced-motion semantics. Add regression coverage for repeated same-lane reorder, cross-lane move, scheduled-task move and exact task-ID-set preservation before authoritative Windows CI.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user blocker is known.
- Local checkout/toolchain validation in the connector-only environment: **NOT RUN**. Use the strongest connector/repository review available before pushing; Windows GitHub Actions remains the authoritative reproducible compile/test/release/visual gate.