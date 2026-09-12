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

Latest reconciled main tracking tip before this feature branch: `610627db256a939f4dadff92477b817e5b776296`.

Markdown-only tracking/checkpoint commits do not replace the validated source baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M5 item 27/28 — Light/dark/system theme.**

Immutable evidence: `work-log/2026-09-12-chatgpt-m5-theme-preference.md`.

- final exact PR #99 head `048f5009e5cee07cb78544f7ccd6290c43f33980`;
- Windows PR CI #388 / run `34711580262` / job `103601188758`: **SUCCESS**;
- resulting main source/test SHA `40ac4acabea105e82a1f1a1211436bda628d4526`;
- Windows main CI #389 / run `34712441687` / rerun job `103608683661`: **SUCCESS**.

## ACTIVE IMPLEMENTATION SLICE

**M5 item 28/28 — Remove all account/trial/upgrade/cloud/integration controls.**

Implementation branch: `m5-excluded-controls`.

Current small-slice progress: **1/5**.

### Checkpoint 1/5 — COMPLETE: mandatory reconstruction + exact exclusion/control inventory

Repository reconstruction established:

- reconciled `main` was `610627db256a939f4dadff92477b817e5b776296` when this branch was created; no open item-28 implementation PR or superseding branch was found;
- `docs/PRODUCT_SPEC.md` explicitly excludes plan/trial status, `Upgrade Now`, integrations grid, account avatar/profile identity and the Blitzy/AI floating control; these service-dependent controls are to be omitted rather than stubbed;
- `docs/UI_UX_SPEC.md` requires Search and Settings to remain accessible while account/trial/upgrade/profile/AI/integration controls are removed;
- `docs/SOURCE_AUDIT.md` likewise excludes subscription/billing/licensing/trial/upgrade/account-dependent surfaces;
- current production `AppShell.tsx` exposes only local list navigation, Search, Settings, Home and Reports; current `HomeDashboard.tsx` exposes only local list/task planning content; no excluded service/account control is currently present in those source-evidenced surfaces;
- repository code search found exclusion terms in documentation/tracking and unrelated words such as sleep `accounting`, but no production renderer control that should be deleted;
- therefore the narrow implementation is an explicit deterministic absence gate over production renderer sources, not invented replacement UI or destructive removal of legitimate local controls;
- the gate must also positively preserve Search, Settings, Reports and the existing diagnostics query gate so future cleanup cannot satisfy exclusion checks by deleting valid local product access.

### Five checkpoints for this slice

1. mandatory reconstruction + exact exclusion/control inventory — **COMPLETE**;
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

Continue on `m5-excluded-controls`. Add the narrow deterministic production-renderer absence contract, wire it into frontend preflight, and preserve positive assertions for Search, Settings, Reports and diagnostics. Run the available dependency-light static check if possible, then review the exact branch diff for false-positive/overbroad exclusions. Do not add service/account stubs, remove legitimate local controls, or begin Milestone 6. After checkpoint 2, open the PR and require exact-head Windows CI before merge.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks item 28.
- Full local repository preflight remains unavailable in this connector environment; Windows GitHub Actions is authoritative for Rust/Tauri validation.