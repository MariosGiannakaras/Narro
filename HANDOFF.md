# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md` where timer/session reliability risk applies, and the newest relevant immutable `work-log/*.md` entries. Inspect open implementation PRs and their exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **0 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `c89526dbc40742570d8d89353244add2d6350d2d`

Source tree: `26023de8bc73aef304627b014f8319d5cd74e4ed`

This is the expected-head guarded squash merge of PR #100. Markdown-only tracking descendants do not replace this validated source baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**Milestone 5 item 28/28 — Remove all account/trial/upgrade/cloud/integration controls.**

Immutable evidence: `work-log/2026-09-12-chatgpt-m5-excluded-controls.md`.

- implementation branch: `m5-excluded-controls`;
- final exact PR #100 head: `db78e0d6adebd51ab9e56a81185e4dac0206d1c5`;
- Windows PR CI #390 / run `34715260353` / job `103611248532`: **SUCCESS**;
- PR visual artifact `10303923986`, digest `sha256:f9504c66d2d747f0cfb6b3d6e488c8b07f7820553b568146fe176242635880ff`;
- PR diagnostic artifact `10304538904`, digest `sha256:a9f506019f483e60faf50fdf007eddc06780c9a2e0aec23d0ab0b1744baa3414`;
- expected-head guarded squash merge source SHA `c89526dbc40742570d8d89353244add2d6350d2d`;
- Windows main CI #391 / run `34716334667` / job `103614139737`: **SUCCESS**;
- main visual artifact `10304734623`, digest `sha256:85d2443897558d5517d994860ad67dde373ce57e750aa1cadbbd399c057a67c0`;
- main diagnostic artifact `10304844701`, digest `sha256:92eec5b842c19837e704fd910a6c37172ec68ddbbfe9f5d824ae3bbebcd3592b`.

Validated capability:

- excluded source-product account/trial/upgrade/profile/avatar/integration/billing/subscription/cloud/Blitzy-AI/sign-in/login controls are absent from production renderer surfaces;
- a deterministic absence gate recursively checks production `.tsx` renderer sources and is wired into frontend preflight;
- local Search, Settings, Reports and explicit `?diagnostics=1` access are positively protected from over-broad exclusion cleanup;
- no production UI/Rust/schema/dependency/lockfile mutation was required because excluded controls were already omitted rather than stubbed;
- all 28 ordered Milestone 5 items are now validated and Gate E is PASS.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 1/16 — Start Blitz from eligible Today tasks.**

No M6 implementation branch or PR should be assumed from this reconciliation. Reconstruct exact current main/open-PR state before source changes.

Current small-slice progress: **0/5**.

### Five checkpoints for this slice

1. mandatory reconstruction + exact Focus-entry/eligibility contract — pending;
2. narrow authoritative implementation + deterministic/runtime coverage + semantic/diff review — pending;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- Focus Panel and Floating Timer must remain presentations of the existing authoritative Rust-owned timer/session state; renderer state cannot become a parallel authority.
- `main` and `focusSurface` remain the normal two-webview architecture; do not create a third persistent focus webview.
- starting Focus/Blitz must preserve stable task identity, durable Time Taken/session accounting, persistence-first transitions, crash/restart recovery, sleep policy, Time's Up/overtime and Pomodoro semantics already validated in M3.
- Focus entry may start only an eligible Today task; future-timed Today tasks remain ineligible until their scheduled time arrives, matching validated M4 scheduling rules.
- source evidence says the top eligible Today task starts live automatically when Blitz Mode opens; do not reinterpret this as arbitrary renderer ordering.
- entering Focus Mode must never auto-open note URLs.
- task/list/archive/Search/theme/preferences behavior validated through M5 must not regress.
- System/Dark/Light remains shared SQLite-backed preference state across both normal webviews.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent.
- keyboard/focus-visible access, stable action geometry, reduced-motion behavior and tabular timer numerals remain required.
- do not absorb Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Milestone 9 Reports, or Milestone 10 release work into the first M6 slice.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Re-run the mandatory startup sequence from current `main`. Confirm the M5 reconciliation tracking descendant is current and no unfinished M6 PR/branch supersedes it. Then reconstruct M6 item 1 from existing timer/session commands/events, scheduling eligibility, Today task projection, current `focusSurface` diagnostic/temporary modes, window coordination, tests, and Focus/Blitz source evidence. Determine the narrow authoritative boundary for `Start Blitz from eligible Today tasks` and how the top eligible Today task becomes live without duplicating timer/session authority. Read `docs/BLITZIT_HISTORY_RISK_INDEX.md` before touching timer/session integration. Create a coherent M6 branch only after that reconstruction. Do not begin M6 item 2 as a separate behavior unless item 1's source contract strictly requires top-eligible auto-selection as an inseparable dependency.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 1.
- Full local Rust/Tauri validation may be unavailable in connector-only environments; authoritative Windows GitHub Actions remains required before merge.