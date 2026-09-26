# M7 current-state reconciliation after PR #153/#154 — 2026-09-26

## Scope

Documentation-only reconciliation after concurrent repository progress. No source/runtime change and no Windows CI intended.

## Source validation now authoritative

- PR #153 exact head `ed046af079038952f5877b19324b6bf36912e69f` — CI #527 PASS.
- PR #153 merged source `57a18a2b9ffd81b1b2d968c54bf1e997311c0cd8` — CI #528 PASS.
- PR #154 exact head `0ddd837d5aabbdb6284a63fad37cb964dc10f8aa` — CI #529 PASS.
- PR #154 merged source `449eb5d1fda4a8d26832e803433209025a6dec38` — CI #530 PASS.

PR #153 implements the atomic transparent-host Expand/Collapse resize correction. Physical confirmation remains open.

PR #154 corrects the identical-tree CI dedup proof after #528 showed the first implementation still ran the duplicate heavy main job. The gate now binds to the same workflow ID.

## Remaining M7 work

No further evidence-backed source correction is currently recorded. Remaining open work is physical Windows acceptance and should be performed as one consolidated latest-build matrix rather than as repeated small interruptions.

## General workflow

The separate general policy commit now codifies coherent implementation batching before CI, avoidance of micro-PR/CI churn, and safe consolidation of manual Windows gates while keeping them OPEN until real evidence exists.
