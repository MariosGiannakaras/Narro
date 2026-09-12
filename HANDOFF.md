# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 5 in `TODO.md`, relevant `STATUS.md`, exclusion/account/integration sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, and the newest relevant immutable `work-log/*.md` entries. Inspect open implementation PRs and their exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **27 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `40ac4acabea105e82a1f1a1211436bda628d4526`

Source tree: `0e7dc95db73a5577cc83ff4aa7c933ae9aba906d`

This is the resulting-main source merge of PR #99. Markdown-only tracking descendants do not replace this source baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M5 item 27/28 — Light/dark/system theme.**

Immutable evidence: `work-log/2026-09-12-chatgpt-m5-theme-preference.md`.

- implementation branch: `m5-theme-preference`;
- final exact PR head: `048f5009e5cee07cb78544f7ccd6290c43f33980`;
- PR #99: `M5: add persisted light dark and system theme`;
- Windows PR CI #388 / run `34711580262` / job `103601188758`: **SUCCESS**;
- PR visual artifact `10303218552`, digest `sha256:af6a8261abb3693e3123a4551daa6f91db1c862ad49bc01712582013898ffb7b`;
- PR diagnostic artifact `10303194119`, digest `sha256:77b60fa4bca214ca8bb5b30f9a349a6a7fac8b3996626559b2223d49ab8cc3e9`;
- resulting main source/test SHA `40ac4acabea105e82a1f1a1211436bda628d4526` / tree `0e7dc95db73a5577cc83ff4aa7c933ae9aba906d`;
- Windows main CI #389 / run `34712441687` / rerun job `103608683661`: **SUCCESS**;
- main visual artifact `10303868283`, digest `sha256:7322bd3cb3cca9cf7726ccc08819ce253dc8c113d3109c200f501c0ec51fe776`;
- main diagnostic artifact `10304293100`, digest `sha256:624df25ab71fc867fb06f14021eaed7133b88f4f4ab8d98089b721ac40388712`.

The first main attempt job `103603519635` was cancelled at the workflow's 30-minute job timeout while visual capture was running after successful Repository Preflight; rerunning the same exact main SHA completed every required gate successfully.

Validated capability:

- authoritative local SQLite preferences persist `System`, `Dark` or `Light` without schema changes;
- theme writes preserve every non-theme preference and publish renderer success only after commit;
- both `main` and `focusSurface` consume the same theme authority through `ThemeRuntimeProvider`;
- System follows Windows/WebView2 `prefers-color-scheme` without polling or persistence rewrites;
- Settings exposes the evidenced Preferences → General → Theme segmented control with pending/error states and accessible pressed/group semantics;
- deterministic Rust/static coverage plus Windows Edge System/Dark/Light/failed-save fixtures are authoritative-validated;
- no timer/session, scheduling, archive, Notes, Reports, cloud/account/integration authority or unrelated M8 preference family changed.

## ACTIVE IMPLEMENTATION SLICE

**M5 item 28/28 — Remove all account/trial/upgrade/cloud/integration controls.**

No item-28 implementation branch or PR should be assumed from this reconciliation. Reconstruct exact current main/open-PR state before source changes.

Current small-slice progress: **0/5**.

### Five checkpoints for this slice

1. mandatory reconstruction + exact exclusion/control inventory — pending;
2. narrow implementation + deterministic coverage + semantic/diff review — pending;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains fully local and must not introduce auth, cloud sync, telemetry, trial, upgrade, profile, AI-agent, webhooks or third-party integration authority;
- removal scope must not delete legitimate local Settings, Search, Reports navigation, task/list features, local icon import, local external-link activation, or diagnostic tooling gated behind `?diagnostics=1`;
- authoritative preferences remain SQLite-backed; both normal webviews keep the same validated System/Dark/Light behavior;
- list/task/subtask identities, archives, Search, timer/session/Time Taken, scheduling/date-only/timezone/recurrence/reminders and Notes behavior remain unchanged;
- keyboard/focus-visible access, reduced-motion behavior and existing visual-regression coverage remain required.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Re-run the mandatory startup sequence from current `main`, confirm this reconciliation tracking descendant is current and no unfinished item-28 PR/branch supersedes it, then inventory source and tests for account/trial/upgrade/profile/AI/cloud/integration controls and strings. Cross-check the exclusion policy in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md` and `docs/SOURCE_AUDIT.md`. Implement only evidence-backed removals or an explicit deterministic absence gate; do not remove legitimate local product controls and do not start Milestone 6 before item 28 completes the full five-checkpoint validation sequence.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks item 28.
- Full local repository preflight remains unavailable in this connector environment; Windows GitHub Actions is authoritative for Rust/Tauri validation.