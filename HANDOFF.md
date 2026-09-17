# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, the Focus/Blitz sections of `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, the newest relevant immutable `work-log/*.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md` when reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **15 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.
- General roadmap progress: **5/10 milestones complete**.
- Item 15 closed at **5/5 checkpoints complete**.
- Current item-16 implementation slice: **0/5 checkpoints complete**.

Repository compact progress source values: `5/10M || 0/5 | 15/16`.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`1ddf7daf60c1507f12fc87b67119aa65fc8621bb`

Source tree:

`e6e984689ea8a82c34b60790fdcee328c6d7b37b`

This is the expected-head guarded squash merge of PR #115 after authoritative resulting-main Windows CI #442 passed on the exact merged source SHA. Markdown-only tracking descendants after this SHA do **not** replace the validated source/test baseline.

Latest immutable completed evidence:

`work-log/2026-09-17-2215-chatgpt-m6-focus-visual-states.md`

## LATEST VALIDATION EVIDENCE — M6 ITEM 15

PR #115 — `M6: add Focus visual states`

Final exact PR head:

`9e68c546826513255d2e9538e6fc9baae428a432`

Authoritative PR Windows CI #441:

- run `35088139238`;
- job `104767793017`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- both required artifact uploads: **SUCCESS**;
- visual artifact `10443108727`, digest `sha256:b7bf9c7372e744e4e46879581c56e94cf23dc32d94b601f917d6f1ef568ab99f`;
- diagnostic/runtime artifact `10444005797`, digest `sha256:af4846a9b2c554c73dc5179a8dce986beb423006277742b06798df6ef3ec5364`.

Final review verified the exact head unchanged and mergeable, `main` still at the PR base, exactly 11 expected changed files, and no PR conversation comments, submitted reviews or inline review threads.

Expected-head guarded squash merge:

`1ddf7daf60c1507f12fc87b67119aa65fc8621bb`

Authoritative resulting-main Windows CI #442:

- run `35264051291`;
- job `105346638723`;
- exact main source SHA `1ddf7daf60c1507f12fc87b67119aa65fc8621bb`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- both required artifact uploads: **SUCCESS**;
- visual artifact `10515379819`, digest `sha256:a99b0bdec30c42ae5f572a4142a90fb99027e8fe7e6f135b0c145bc6d447279c`;
- diagnostic/runtime artifact `10516970405`, digest `sha256:fe3b6317750b0bedc24c4a4f538bf5c0063191dec88ec5dc541be42a4d86ed75`.

Validated item-15 capability:

- running/active, paused, break, Time's Up, overtime, overdue, Notes-expanded and no-eligible visual states are deterministic token-based projections of authoritative existing state;
- overdue presentation reuses `task.isOverdue` rather than recalculating scheduling state;
- Notes-expanded presentation reuses the existing production Notes path;
- no-eligible presentation is marked only when there is no live task, no Remaining task and at least one Scheduled future-timed Today task;
- existing empty-card copy/action behavior was intentionally left unchanged for item 16;
- item-11 live-title motion, item-12 row-title access, item-13 reserved action geometry and item-14 tooltips/accessibility remain intact;
- no Rust/Tauri, persistence, scheduling classification, task/domain or timer/session transition authority changed.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 16/16 — Handle empty/no-eligible-task states.**

No item-16 implementation branch or PR is established by this handoff yet.

### Checkpoint plan — 0/5 complete

1. Reconstruct the exact empty/no-eligible behavior/content contract from current production code, item-15 visual projection, authoritative Focus entry/eligibility rules and relevant product/UI/evidence docs.
2. Implement the narrow behavior/content slice with deterministic/static/visual coverage and semantic review; preserve timer/session/scheduling/native authority and all M6 items 1–15 invariants.
3. Validate the exact PR head with authoritative Windows CI: Repository Preflight, Windows visual regression, Tauri Release and both required artifact uploads.
4. Verify exact head unchanged, expected changed-file scope, clean PR comments/reviews/threads and mergeability; squash merge with an expected-head guard.
5. Validate the resulting-main source SHA with authoritative Windows CI, then reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable item-16 work log. Only after that may Milestone 6 be considered complete and general roadmap progress advance.

### Item-16 starting boundary already established

- item 15 owns only visual state styling/markers; item 16 owns actual empty/no-eligible content and user-facing behavior;
- a future-timed Today task remains visible in Scheduled but is not Focus-eligible until due;
- genuinely empty Today work and no-currently-eligible-but-scheduled-later work are distinct states and must not be conflated;
- the renderer must not invent eligibility rules or auto-start timers;
- existing authoritative Focus entry, scheduling partitioning and timer/session transitions remain unchanged unless repository evidence proves an item-16 dependency requires a narrow change;
- no Floating Timer, Preferences, Reports, account/cloud/integration or Milestone 7+ scope belongs in item 16.

## INVARIANTS THAT MUST NOT REGRESS

- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- display handling remains event-driven/coalesced and item-10 recovery semantics remain intact.
- task/list/subtask identities, queue partitioning, scheduling eligibility and tracked Time Taken remain authoritative.
- renderer presentation cannot become timer/session/task/scheduling authority.
- item-11 active/live title scrolling remains preference-driven, overflow-aware, transform-only and reduced-motion-safe.
- item-12 ordinary Focus row titles remain two-line-clamped with keyboard-accessible full-title access.
- item-13 hidden/revealed action controls keep reserved geometry and existing hit positions.
- item-14 icon-only tooltips retain keyboard/pointer discovery, accessible names, placeholder inactivity and stable geometry.
- item-15 visual state projection remains intact and presentation-only.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- future-timed Today tasks remain ineligible until due.
- Focus queue partitioning must not duplicate task identities or reinterpret scheduling state.
- Notes URLs remain explicit pointer/keyboard activation only.
- reduced-motion remains usable and timer numerals retain fixed/tabular geometry.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Reconstruct the exact item-16 empty/no-eligible behavior/content contract from `FocusPanel`, current Focus fixtures/tests, authoritative Focus-entry/scheduling eligibility code and the relevant Focus/Blitz spec/evidence sections. Then create the item-16 implementation branch from the latest `main` tracking tip and implement only the narrow evidence-backed slice. Do not start Milestone 7 in parallel.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks item 16.
- Full local repository/frontend/Rust/Tauri preflight is not available in this connector-only environment; use the strongest available static checks before push and authoritative Windows CI for the complete gate.
