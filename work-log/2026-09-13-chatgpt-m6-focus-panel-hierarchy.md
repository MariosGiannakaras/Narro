# 2026-09-13 — ChatGPT — M6 Focus Panel hierarchy

## Scope

Validated and reconciled Milestone 6 item 3/16:

`Reproduce Focus Panel hierarchy: list selector, Today, quick controls, aggregate EST/progress, active live card, remaining queue, Add Task, scheduled group, done group.`

This slice remained presentation/read-model only. It did not add a second timer/session authority, new schema, new persistent webview, scheduling policy, later Focus actions, Floating Timer behavior, preferences/shortcuts, Reports, or release features.

## Source baseline before implementation

Pre-slice reconciled main tracking tip:

`4f0624a5d865d0ef5df9c5e68c44e9e25bea9fde`

Validated M6 items 1–2 source baseline before this slice:

`bea3f352c609456762f83e4911017ac9ef23f682`

Tree:

`5df0821b29fa4a017a3dc84ea14c40937c85cf35`

## Implementation

Branch:

`m6-focus-panel-hierarchy`

Pull request:

#102 — `M6: reproduce Focus Panel hierarchy`

Implemented behavior:

- added production `FocusPanel` projection on the existing `focusSurface` webview;
- normal `focusSurface` renders product Focus Panel; M1 diagnostics remain explicitly available through `?diagnostics=1` only;
- reused existing `get_home_snapshot`, `get_list_board_snapshot`, and revisioned timer-session projection rather than creating renderer/domain authority;
- list selector changes only the planning read context;
- authoritative timer-session transitions refresh the planning projection through existing typed event flow;
- reproduced hierarchy evidenced by Focus screenshots/spec: All/list selector, Today, Preferences/Home/compact structural controls, aggregate EST/progress, active live card, remaining queue, list-origin chips, overdue/schedule/subtask metadata, `+ ADD TASK`, Scheduled group, Done group;
- hierarchy-only controls belonging to later M6 items remain explicitly non-mutating;
- used existing theme/geometry/motion/reduced-motion foundations;
- added deterministic production-component Focus fixture and Windows Edge light/dark capture/DOM/geometry validation;
- added `scripts/test-ui-focus-panel.mjs` to frontend preflight and Focus fixture capture/validation to Windows visual regression.

Final PR changed files:

- `HANDOFF.md`
- `focus-panel-fixture.html`
- `package.json`
- `scripts/capture-focus-panel-fixtures.ps1`
- `scripts/test-ui-focus-panel.mjs`
- `scripts/validate-focus-panel-captures.mjs`
- `src/FocusPanel.tsx`
- `src/focus.tsx`
- `src/focusPanel.css`
- `src/focusPanelVisualFixture.tsx`
- `vite.config.ts`

No Rust/Tauri source, schema/migration, timer engine, scheduling policy, dependency/lockfile, Notes URL behavior, Floating Timer, preferences/shortcuts, Reports, or release source changed.

## Evidence-backed PR fixes

Initial exact PR head `a981941e4e95398cf23fd265c66cf863ac7506be` ran Windows CI #396 / run `34723207498` / job `103632684937`.

CI #396 failed only at TypeScript/Vite build after the preceding frontend/static gates, including `test:ui-focus-panel`, passed. The compiler error was `src/FocusPanel.tsx(118,80): TS2339`: TypeScript did not narrow the second `ListBoardRequestTarget` union member before `right.id` was read. Commit `13fb8258cacea6ddbe6511b72ea962dcbe860de9` applied only the evidence-backed narrowing correction; no behavior or scope changed.

A later exact head `503c83db08dd47a4d3b1b8d442a8303bfb848739` ran Windows CI #398 / run `34723326535` / job `103633154280`.

CI #398 passed the entire Repository Preflight: frontend/static gates, TypeScript/Vite production build, rustfmt, cargo check, Clippy, all Rust tests and performance harness. It also successfully created the Focus Panel light/dark Edge screenshots/DOM captures and existing visual fixtures. It failed only in `validate-focus-panel-captures.mjs` because the validator incorrectly assumed the DOM layout viewport height should approximate the 720px PNG capture viewport. The fix recorded the measured headless Edge DOM viewport in the fixture contract and required the panel to fill that measured layout viewport while retaining the exact 420x720 PNG assertion. No production Focus CSS/layout or product behavior changed.

## Final exact PR-head validation

Final exact PR head:

`4f34d1e9bc108bb3a44c42be24121239b13f82f3`

Windows CI #401:

- run `34723924944`;
- job `103634614847`;
- conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Focus Panel + existing Windows Edge visual regression: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**.

PR visual artifact:

- id `10307940032`;
- digest `sha256:ff6b596e284cf65ad5aab2d36098cc6f3f296e2b68f1c76149bc704d75c64203`.

PR diagnostic artifact:

- id `10307700842`;
- digest `sha256:4ba893354d5ab3486db9cc11a998bc54fa41afa973cfa40ee222fd2ff3ef87ee`.

Final review evidence:

- PR remained open, mergeable and non-draft at exact head `4f34d1e9bc108bb3a44c42be24121239b13f82f3`;
- `main` remained exactly at PR base `4f0624a5d865d0ef5df9c5e68c44e9e25bea9fde` through review;
- changed-file scope was exactly the 11 files listed above;
- no PR comments;
- no submitted reviews requiring action;
- no unresolved review threads.

## Merge

PR #102 was squash-merged with expected-head guard:

`4f34d1e9bc108bb3a44c42be24121239b13f82f3`

Resulting main source SHA:

`afaffaf616be89f8a967e61fb1c82b8453d83af8`

Resulting source tree:

`14fe75bdc155fb1aeb8a101ad76948fe10f38503`

The merge commit has parent `4f0624a5d865d0ef5df9c5e68c44e9e25bea9fde` and contains the validated PR scope.

## Resulting-main validation

Push-triggered Windows CI #402:

- run `34728728053`;
- job `103647484892`;
- exact head/source SHA `afaffaf616be89f8a967e61fb1c82b8453d83af8`;
- conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows Edge visual regression: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**.

Main visual artifact:

- id `10309072118`;
- digest `sha256:c17f5a7aba0fcd44defc7d5a1da4243f632bdf344791fdc1ec8b01346a9cd196`.

Main diagnostic artifact:

- id `10309022543`;
- digest `sha256:9c608b9033ebcb0e37d5a27cad0bc74ad30f2841890cb7e627fbdd6866b9daed`.

## Reconciliation result

- M6 item 3 is fully validated and may be marked complete in `TODO.md`.
- Milestone 6 progress advances from **2/16** to **3/16** top-level items validated.
- General roadmap progress remains **5/10 milestones complete**; Milestone 6 remains active.
- The validated source/test baseline is now `afaffaf616be89f8a967e61fb1c82b8453d83af8`, tree `14fe75bdc155fb1aeb8a101ad76948fe10f38503`.
- The next ordered item is M6 item 4: **Render current task and authoritative timer with fixed/tabular timer geometry.**
- The markdown-only tracking commit containing this immutable entry does not replace the validated source/test baseline above.

## Exact continuation

A zero-context agent should reconstruct from current `main`, confirm there is no unfinished implementation PR/CI, then start M6 item 4. Re-read the Focus screenshots/spec, current `FocusPanel`, timer projection/session API, and `docs/BLITZIT_HISTORY_RISK_INDEX.md` because the next slice touches timer presentation reliability. Keep renderer time presentation derived from authoritative timer/session state; do not introduce a second renderer-owned session clock or weaken M3 tracked-time/recovery invariants.
