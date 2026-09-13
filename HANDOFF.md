# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, the newest relevant immutable `work-log/*.md` entries, and `docs/BLITZIT_HISTORY_RISK_INDEX.md` whenever reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **10 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

General roadmap progress: **5/10 milestones complete**.

Item-11 implementation slice: **2/5 checkpoints complete**.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`fc0e52f6951e92f961aa8c38bee2069265bdaf1a`

Source tree:

`c0012d64417d3791860d232a56f760b7cc12986d`

This is the expected-head guarded squash merge of PR #110 after authoritative resulting-main Windows CI #418 passed. Markdown-only tracking descendants after this source SHA do **not** replace the validated source/test baseline.

Latest immutable completed evidence:

`work-log/2026-09-14-chatgpt-m6-focus-display-reaction.md`

## ACTIVE IMPLEMENTATION SLICE

**M6 item 11/16 — Implement configured scrolling behavior for the live title.**

Implementation branch:

`m6-focus-live-title-scroll`

Branch base/tracking tip:

`f635d2b0bf84cc87f8c5309c3c87a0a70458a34c`

Latest source/test implementation head before this handoff-only commit:

`3c1a15c4243271ae0c7eeaf465c4cfcba536ae25`

Tree:

`36fde7b64047f9e6bfbc22d372625d05fe140ae7`

No item-11 PR exists yet.

### Checkpoint 1/5 — COMPLETE: contract reconstructed

Repository evidence establishes the narrow contract:

- use the existing persisted `focus.scrolling_title` preference; its established safe default is `false`;
- scrolling applies only to the **active/live title**, never every ordinary Focus task row;
- disabled preference preserves static ellipsis behavior;
- enabled preference scrolls only when the active title actually overflows its available horizontal slot;
- overflow/reflow detection must be event-driven, not a polling or JavaScript animation loop;
- title motion must use transform-only presentation and must not change sibling/timer geometry;
- `prefers-reduced-motion` disables the scrolling animation and preserves static ellipsis/full-title access;
- source/product evidence does not define an exact scroll speed/direction, so the implementation must not claim source-fidelity for timing details;
- Milestone 8 owns preference editing/live settings UI; item 11 consumes the persisted setting only;
- item 12 ordinary row-title wrapping/full-title behavior and items 13–16 remain separate.

### Checkpoint 2/5 — COMPLETE: narrow implementation + deterministic/static review

Source/test changes are limited to seven files:

- `src-tauri/src/focus_preferences.rs`
  - new read-only native boundary for persisted `focus.scrolling_title`;
  - no schema/migration or preference mutation;
  - native regression proves default `false` and a persisted `true` value are read correctly.
- `src-tauri/src/lib.rs`
  - only module + Tauri-command registration additions.
- `src/FocusLiveTitle.tsx`
  - active-title-only component;
  - synchronous initial overflow measurement plus `ResizeObserver` revalidation;
  - no `setInterval` or `requestAnimationFrame` loop;
  - emits explicit off/idle/active scroll state and measured overflow CSS variable.
- `src/focusLiveTitle.css`
  - static ellipsis by default;
  - transform-only overflow animation for active state;
  - reduced-motion override disables animation and restores ellipsis.
- `src/FocusPanel.tsx`
  - loads the persisted preference through the narrow native command in production;
  - preference-read failure fails closed to non-scrolling and remains visible as a nonfatal Focus status error;
  - only the live title uses `FocusLiveTitle`; ordinary task rows remain unchanged.
- `scripts/test-ui-focus-live-title.mjs`
  - locks preference source/default, native read-only boundary/registration, active-title-only wiring, overflow measurement, absence of polling/JS animation loop, transform-only motion, reduced-motion fallback and ordinary-row separation.
- `package.json`
  - registers the new deterministic contract test in frontend preflight.

Review evidence:

- semantic diff from base contains exactly those seven files;
- `src-tauri/src/lib.rs` diff is exactly two added registration lines; no unrelated native code changed;
- no database schema/migration, lockfile/dependency, timer/session/task/scheduling behavior, ordinary row-title presentation, display topology, Preferences UI, Floating Timer or later Focus visual-state work changed;
- exact new `.mjs` syntax check with Node: **PASS**;
- local Rust/rustfmt/Tauri validation: **NOT RUN / unavailable locally**; Windows CI remains authoritative.

### Checkpoint 3/5 — PENDING

Open one PR from this branch and require authoritative Windows CI on the exact PR head: Repository Preflight (including the new static test, TypeScript build, rustfmt/check/Clippy/tests), Windows visual regression, Tauri Release and both required artifact uploads.

### Checkpoint 4/5 — PENDING

After exact-head CI success, verify unchanged head, mergeability, changed-file scope and all comments/reviews/threads; then squash merge with expected-head guard.

### Checkpoint 5/5 — PENDING

Validate the resulting main source SHA with authoritative Windows CI. Only after full success reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable work log; M6 then becomes 11/16.

## INVARIANTS THAT MUST NOT REGRESS

- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- display handling remains event-driven/coalesced and item-10 recovery semantics remain intact.
- task/list/subtask identities, queue partitioning, scheduling eligibility and tracked Time Taken remain authoritative and unchanged by title presentation.
- renderer motion cannot become timer/session authority.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- future-timed Today tasks remain ineligible until due.
- Notes URLs remain explicit pointer/keyboard activation only.
- ordinary Focus task-row title behavior remains item 12 scope.
- reduced-motion remains usable and timer numerals retain fixed/tabular geometry.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Open/inspect the item-11 PR from `m6-focus-live-title-scroll`, record its exact head SHA, and run authoritative Windows CI. If CI fails, inspect the exact failure and fix only evidence-backed issues on the same branch/PR. Do not start item 12.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks item 11.
- Local Rust/rustfmt/Tauri validation remains unavailable; authoritative Windows CI is required.