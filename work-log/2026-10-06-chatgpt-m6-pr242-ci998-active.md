# 2026-10-06 — M6 P3-M6-05 PR242 CI998 active checkpoint

## Scope

Active implementation/validation checkpoint for P3-M6-05 ordinary Focus queue parity. This log records current evidence only; it does not mark the slice or Milestone 6 complete and does not close physical/source-parity gates.

## Active source

- PR: #242 `Fix M6 ordinary Focus action rail parity`
- Branch: `fix/m6-focus-ordinary-rail`
- Exact head at this checkpoint: `48d0b3e060ff5c049751353829244999ec2cbb97`
- Exact-head Windows run: CI998 / `37530344717` — IN_PROGRESS at checkpoint
- Changed files: source/test only; PR242 does not modify current-truth Markdown.

Implemented product delta:
- ordinary rail: `Complete → Make Live → Subtasks → Notes → overflow`;
- overflow: `Schedule → Change list → Duplicate → Delete`;
- Change List/Duplicate/Notes/Subtasks reuse existing authoritative boundaries;
- visible non-source move-up/down rail buttons are removed;
- individual-list reorder uses transient Pointer Events drag plus Alt+Arrow keyboard access while durable order remains `reorderListBoardTask`;
- aggregate All Lists reorder remains disabled;
- existing explicit Narro delete-confirmation safety boundary remains.

## CI failure history and evidence-backed corrections

### CI988

The first exact candidate failed because `scripts/validate-focus-panel-captures.mjs` still required removed `move-up`/`move-down` actions. The validator was reconciled to the P3-M6-05 source grammar and explicitly rejects those removed visible actions.

### CI989 through CI995

After the rail validator was corrected, Windows visual capture exposed the pre-existing bounded full-title Tooltip containment contract under normal motion. Successive diagnostics established that this was not a rail-width regression.

CI995 rendered geometry at exact head `b281a5e5d5611dedd4d001745b340ab7ff8105e3`:
- row: x=88, width=316;
- title anchor: x=137, width=154;
- tooltip: x=-62, width≈301.84;
- calculated bounded inline start: -45px relative to the anchor, which would place the tooltip at x=92 inside the row;
- computed transform still contained an approximately -154px X translation: `matrix(0.98, 0, 0, 0.98, -154, 4)`.

Therefore the bounded inset math was correct; the normal-motion tooltip's default centered `translateX(-50%)` was still affecting first-transition geometry. The correction is deliberately narrow:
- bounded Tooltips expose `data-bounded="true"`;
- bounded Tooltip CSS sets `--tooltip-translate-x: 0px` from first paint;
- unbounded centered Tooltips retain their existing centered transform;
- deterministic overlay contracts lock the bounded first-paint rule;
- existing intent-delay/open-state/vertical-overflow fixture guards remain.

No fixture-only exemption or weakening of the containment assertion was introduced.

## Validation state

On CI995 before the visual assertion:
- fast gate: PASS;
- Rust check: PASS;
- Clippy: PASS;
- Rust tests: PASS;
- performance harness: PASS;
- visual capture: FAIL at the bounded tooltip assertion above.

CI998 is the only current exact-head authority for the latest correction. Do not infer PASS from earlier successful sub-gates.

## Continuation

1. Inspect CI998 exact result.
2. On evidence-backed failure, continue fixing only that failure on PR242.
3. On success, re-check live main/head/mergeability, expected-head-guard merge, then resulting-main validation per workflow policy.
4. Reconcile tracking without closing deferred physical/source-parity gates.
5. Then start P3-M6-01 from resulting main using `work-log/2026-10-06-chatgpt-m6-p3-m6-01-design-analysis.md`.

Current accepted roadmap/milestone counters remain unchanged: `3/10M || 0/3 | 17/18`.
