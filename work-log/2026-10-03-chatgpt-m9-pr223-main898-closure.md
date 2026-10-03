# M9 PR #223 resulting-main closure

Date: 2026-10-03

## Scope

This closes the nonvisual M9 source-evidence reconciliation batch. It does not claim production Reports/Sessions UI completion and does not close a top-level M9 roadmap item.

## Validated lineage

PR #205:
- Overview aggregation typed command/API;
- resulting-main source `f1cca810ea7d7fe6130d43ae0f6bfe649a7154af`;
- Windows CI #889 / run `37131590766`: PASS.

PR #223:
- title: `M9: align report filters and Sessions contracts with source evidence`;
- exact head `8ea467a8eeea0f3c623a82927bc3575aa4221780`;
- Windows CI #897 / run `37135494993`: PASS;
- merged source `a36125664831243faf36954f4691f9733a325d76`;
- resulting-main Windows CI #898 / run `37136599839`: PASS.

CI #898 passed:
- validation-gate;
- fast frontend/contracts;
- Rust formatting;
- Rust check;
- Clippy;
- Rust tests;
- performance harness;
- visual regression;
- Tauri release build;
- packaged Focus runtime;
- physical-validation build verification;
- required M7 validation-log smoke;
- M1 diagnostic storage-isolation verification.

The fast gate explicitly logged:
`Reports history/session command API contracts passed.`

## Source evidence consumed

VE-015, VE-011 and VE-012 are SOURCE_COMPLETE.

PR #223 implements the nonvisual high-confidence contracts needed before production UI wiring:
- report list filter is multi-select (`listIds`);
- empty list selection means All Lists;
- Sessions report rows present reverse-chronologically;
- work-session ordinals are task-relative and derived from each task's complete closed work-session history, not from the current report range;
- task-session detail is independent from the selected report range;
- break-session ordinal stays null because supplied source does not establish its semantics;
- large duration/ordinal values remain lossless strings over IPC;
- renderer commands stay invoke-driven with no polling/raw session SQL/timer authority.

## Not closed

No top-level Milestone 9 item is marked complete by this batch alone.

Still required:
- reconcile open PR #198 against current main and completed Reports/Sessions source evidence;
- wire production Reports/Sessions surfaces to the validated APIs;
- implement evidenced interactions and local export targets;
- validate exact user-facing output before M9 closure.

## Continuation

The next M9 action is PR #198 reconciliation, not a new parallel visual implementation.

Progress:
`5/10M || M9 data/API batch 4/4`.
