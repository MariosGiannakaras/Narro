# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, the Focus/Blitz sections of `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, the newest relevant immutable `work-log/*.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md` when reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **11 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

General roadmap progress: **5/10 milestones complete**.

Item-12 implementation slice: **2/5 checkpoints complete**.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`088b9dd75a7af0aa7e5d32dcbcfffdbc501d90cb`

Source tree:

`fbc93b4779f1f8988b4e3f38e1205facf9f7023b`

This is the expected-head guarded squash merge of PR #111 after authoritative resulting-main Windows CI #421 passed on the exact merged source SHA. Markdown-only tracking descendants after this source SHA do **not** replace the validated source/test baseline.

Latest immutable completed evidence:

`work-log/2026-09-14-chatgpt-m6-focus-live-title-scrolling.md`

## ACTIVE IMPLEMENTATION SLICE

**M6 item 12/16 — Allow ordinary focus-row task titles up to two lines where practical; expose full title accessibly.**

Implementation branch:

`m6-focus-row-title-wrapping`

Branch base/tracking tip:

`4932985e5bc21cb0049ce219b9fbf699ca12dc06`

Latest source/test implementation head before this handoff-only commit:

`8df20783a193f7dbe9f2dd7450d1254a8bc9af75`

Tree:

`d8d254ad455db42d5437eadde487949fbeb6ba46`

No item-12 PR existed when this checkpoint handoff was written.

### Checkpoint 1/5 — COMPLETE: contract reconstructed

Repository evidence establishes the narrow contract:

- item 12 applies only to ordinary Remaining/Scheduled/Done Focus task-row titles; item-11 active/live title scrolling remains separate and unchanged;
- ordinary titles may use up to two lines where the compact layout permits, then remain clipped rather than expanding without bound;
- the complete title must be available by an established accessible mechanism that works with keyboard focus, not pointer hover alone;
- reuse the already validated shared `Tooltip` primitive rather than inventing a second tooltip implementation;
- because the shared tooltip anchor defaults to fixed flex sizing, Focus needs a narrow title-row override so the tooltip wrapper remains `min-width: 0` and participates in the existing flexible title slot;
- ordinary title wrapping may grow a row vertically to accommodate the second line, but it must not change row width, move established horizontal hit targets, or absorb item-13 action-slot work;
- no continuous animation or transform is required for ordinary row titles;
- task/timer/session/scheduling authority, item-11 scrolling, reduced-motion behavior, Floating Timer and Preferences remain unchanged.

### Checkpoint 2/5 — COMPLETE: narrow implementation + deterministic/static/visual review

Source/test scope is seven files:

- `src/FocusTaskRowTitle.tsx`
  - new ordinary-row title presentation reusing `Tooltip`;
  - full title remains visible to assistive technology and is associated with tooltip content through the existing `aria-describedby` primitive;
  - the title is keyboard focusable and receives a visible focus treatment.
- `src/focusTaskRowTitle.css`
  - Focus-specific flexible tooltip-anchor override preserves the existing title slot;
  - ordinary titles use a two-line clamp, normal wrapping and `overflow-wrap: anywhere` for long unbroken text;
  - no animation or transform is introduced.
- `src/FocusPanel.tsx`
  - only the ordinary `FocusTaskRow` title rendering changes to `FocusTaskRowTitle`;
  - the active/live `FocusLiveTitle` path remains unchanged.
- `src/focusPanelVisualFixture.tsx`
  - includes a deliberately long ordinary title and records its computed clamp/accessibility/row geometry.
- `scripts/test-ui-focus-row-titles.mjs`
  - locks active/live separation, Tooltip reuse, keyboard/full-title accessibility, two-line clamp, flexible wrapper geometry and no-motion scope.
- `scripts/validate-focus-row-title-captures.mjs`
  - validates the existing Windows Focus captures prove a two-line title, stable row width, vertical second-line growth and tooltip association across light/dark and running/paused fixtures.
- `package.json`
  - registers the deterministic contract test in frontend preflight and the new visual validator in Windows visual regression.

Review evidence:

- semantic compare from branch base to source head contains exactly the seven files above;
- `src/FocusPanel.tsx` semantic change is only one import plus replacement of the ordinary title span with the shared row-title component;
- no dependency/lockfile, Rust/native, database, timer/session/task/scheduling, live-title, action-slot, Floating Timer or Preferences change exists;
- local `node --check` for both new `.mjs` files: **PASS**;
- full local frontend/Rust/Tauri preflight: **NOT RUN / unavailable without a local repository checkout and Rust toolchain**; authoritative Windows CI remains required.

### Checkpoint 3/5 — PENDING

Open one item-12 PR from this branch and require authoritative Windows CI on its exact final head: Repository Preflight (including the new static contract), Windows visual regression (including the long-title geometry validator), Tauri Release and both required artifact uploads.

### Checkpoint 4/5 — PENDING

After exact-head CI success, verify unchanged head, mergeability, changed-file scope and all comments/reviews/threads; then squash merge with an expected-head guard.

### Checkpoint 5/5 — PENDING

Validate the resulting main source SHA with authoritative Windows CI. Only after full success reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable item-12 work log; Milestone 6 then becomes 12/16.

## INVARIANTS THAT MUST NOT REGRESS

- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- display handling remains event-driven/coalesced and item-10 recovery semantics remain intact.
- task/list/subtask identities, queue partitioning, scheduling eligibility and tracked Time Taken remain authoritative and unchanged by title presentation.
- renderer title presentation cannot become timer/session/task authority.
- item-11 active/live title scrolling remains preference-driven, overflow-aware, transform-only and reduced-motion-safe.
- ordinary Focus row titles may grow only vertically for the second line; established horizontal row geometry/hit targets must remain stable.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- future-timed Today tasks remain ineligible until due.
- Notes URLs remain explicit pointer/keyboard activation only.
- reduced-motion remains usable and timer numerals retain fixed/tabular geometry.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Inspect the current exact branch/PR head for `m6-focus-row-title-wrapping`. Open the item-12 PR if it does not yet exist, then require authoritative Windows CI on that exact head. If CI fails, inspect the exact failing job/log and fix only evidence-backed issues on the same branch/PR. Do not start item 13 in parallel.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks item 12.
- Full local frontend/Rust/Tauri validation is unavailable in the current environment; Windows CI is authoritative.
