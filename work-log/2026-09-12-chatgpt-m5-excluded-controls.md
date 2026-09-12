# 2026-09-12 — M5 excluded account/service controls validation and reconciliation

## Scope

Completed Milestone 5 item 28/28: **Remove all account/trial/upgrade/cloud/integration controls**.

This entry is immutable validation evidence. Markdown tracking descendants do not replace the validated source/test SHA recorded below.

## Source baseline and branch

- prior reconciled tracking tip: `610627db256a939f4dadff92477b817e5b776296`;
- prior fully main-validated source/test baseline: `40ac4acabea105e82a1f1a1211436bda628d4526`;
- implementation branch: `m5-excluded-controls`;
- reviewed implementation candidate before checkpoint-only documentation: `58172a01a1bfa3a3e661f2d7648a67b3927e7c50`;
- final exact PR head: `db78e0d6adebd51ab9e56a81185e4dac0206d1c5`.

## Reconstructed contract

Repository/source evidence established that Narro must omit, not stub, source-product service/account controls:

- plan/trial status;
- upgrade controls;
- account avatar/profile identity;
- integrations and external service controls;
- billing/subscription/licensing surfaces;
- cloud controls;
- Blitzy/AI assistant controls;
- sign-in/login surfaces.

`docs/UI_UX_SPEC.md` additionally requires Search and Settings to remain accessible, and `docs/SOURCE_AUDIT.md` requires shortcut/preferences access without an account/avatar dependency.

Current production `AppShell.tsx` and `HomeDashboard.tsx` already contained only local Narro planning/navigation controls. No excluded service/account control existed to remove. The correct narrow implementation was therefore a deterministic absence contract rather than invented replacement UI or destructive cleanup of legitimate local controls.

## Implemented behavior

- Added `scripts/test-ui-excluded-controls.mjs`.
- The gate recursively scans production `.tsx` renderer sources under `src/` while excluding fixture-only entry files.
- It rejects account, trial, upgrade, profile/avatar identity, integrations, billing/subscription, cloud, Blitzy/AI-assistant, sign-in and login control terms in production renderer source.
- It positively requires local Search, Settings and Reports controls to remain in `AppShell.tsx`.
- It positively requires the explicit `?diagnostics=1` diagnostic-mode gate to remain in `App.tsx`.
- Wired `test:ui-excluded-controls` into `preflight:frontend` directly after the existing app-shell contract gate.
- No production renderer, Rust/Tauri source, schema, dependency/lockfile, visual fixture, timer/session, scheduling, archive, Notes or theme behavior changed.

## Exact PR-head validation

PR #100: `M5: guard excluded account and service controls`.

Final exact head: `db78e0d6adebd51ab9e56a81185e4dac0206d1c5`.

Windows PR CI #390:

- run `34715260353`;
- job `103611248532`;
- conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- production Windows Edge visual regression: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**.

PR artifacts:

- visual `narro-m5-visual-regression`: artifact `10303923986`, digest `sha256:f9504c66d2d747f0cfb6b3d6e488c8b07f7820553b568146fe176242635880ff`;
- diagnostic `narro-m1-runtime-harness-windows-x64`: artifact `10304538904`, digest `sha256:a9f506019f483e60faf50fdf007eddc06780c9a2e0aec23d0ab0b1744baa3414`.

Final PR review evidence:

- base main `610627db256a939f4dadff92477b817e5b776296`;
- final branch diff contained only `HANDOFF.md`, `package.json`, and `scripts/test-ui-excluded-controls.mjs`;
- no production renderer/Rust/schema/dependency/lockfile change;
- no submitted reviews, PR conversation comments, or inline review comments;
- final PR head remained the exact head validated by CI before merge.

## Merge

PR #100 was squash-merged with expected-head guard:

`db78e0d6adebd51ab9e56a81185e4dac0206d1c5`

Resulting main source/test SHA:

`c89526dbc40742570d8d89353244add2d6350d2d`

Source tree:

`26023de8bc73aef304627b014f8319d5cd74e4ed`

## Resulting-main validation

Windows main CI #391:

- run `34716334667`;
- job `103614139737`;
- conclusion **SUCCESS**;
- exact main SHA `c89526dbc40742570d8d89353244add2d6350d2d`;
- Repository Preflight: **SUCCESS**;
- production Windows Edge visual regression: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**.

Main artifacts:

- visual `narro-m5-visual-regression`: artifact `10304734623`, digest `sha256:85d2443897558d5517d994860ad67dde373ce57e750aa1cadbbd399c057a67c0`;
- diagnostic `narro-m1-runtime-harness-windows-x64`: artifact `10304844701`, digest `sha256:92eec5b842c19837e704fd910a6c37172ec68ddbbfe9f5d824ae3bbebcd3592b`.

## Reconciliation result

- M5 item 28/28 is fully validated.
- Milestone 5 Gate E is **PASS** with all 28 ordered items validated.
- General roadmap progress advances from 4/10 to **5/10** completed milestones only after the successful resulting-main CI above.
- The next ordered milestone is **Milestone 6 — Blitz Mode / Focus Panel**.
- The first ordered M6 item is **Start Blitz from eligible Today tasks**.
- `TODO.md`, `STATUS.md`, and `HANDOFF.md` are reconciled in the markdown-only tracking commit that includes this immutable entry.
- The validated source baseline remains `c89526dbc40742570d8d89353244add2d6350d2d`; this markdown-only tracking commit does not replace it.