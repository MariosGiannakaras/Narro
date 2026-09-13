# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, the newest relevant immutable `work-log/*.md` entries, and `docs/BLITZIT_HISTORY_RISK_INDEX.md` whenever reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **11 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

General roadmap progress: **5/10 milestones complete**.

A new item-12 implementation slice is active at **0/5 checkpoints**.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`088b9dd75a7af0aa7e5d32dcbcfffdbc501d90cb`

Source tree:

`fbc93b4779f1f8988b4e3f38e1205facf9f7023b`

This is the expected-head guarded squash merge of PR #111 after authoritative resulting-main Windows CI #421 passed on the exact merged source SHA. Markdown-only tracking descendants after this source SHA do **not** replace the validated source/test baseline.

Latest immutable completed evidence:

`work-log/2026-09-14-chatgpt-m6-focus-live-title-scrolling.md`

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 item 11/16 — Implement configured scrolling behavior for the live title.**

Validated behavior:

- the existing persisted `focus.scrolling_title` preference is reused and its safe default remains `false`;
- scrolling applies only to the active/live title, never ordinary Focus task rows;
- disabled preference or no actual overflow keeps static ellipsis;
- enabled overflowing titles use initial synchronous measurement plus `ResizeObserver` revalidation, with no polling or JavaScript animation loop;
- motion is transform-only and does not alter timer/sibling geometry;
- `prefers-reduced-motion` disables the animation and restores static ellipsis while full-title access remains available;
- the production native preference boundary is read-only and adds no preference mutation, schema/migration, or Preferences UI;
- source/product evidence does not define exact scroll speed/direction, so Narro does not claim source-fidelity for the selected animation pacing.

PR #111 evidence:

- initial Windows CI #419 / run `34783581280` / job `103794887023` failed only at `cargo fmt -- --check` after frontend/static contracts and the frontend production build passed;
- only the exact rustfmt changes in new `src-tauri/src/focus_preferences.rs` were applied;
- final exact PR head `fe16914c341badea32c0087cc2a45385b0988de0`;
- authoritative Windows CI #420 / run `34783673637` / job `103795136716`: **SUCCESS** across Repository Preflight, Windows visual regression, Tauri Release and required uploads;
- PR visual artifact `10326121804`, digest `sha256:a2f832fa137f09bfb3bcde920921a174ded832aa291082c86d418ec101089972`;
- PR diagnostic/runtime artifact `10325962636`, digest `sha256:fa90989aadb279da4d9b526924acbaba9169b531f8740a20f87f2aaf159fb45b`;
- final review: exact head unchanged and mergeable, exactly eight expected changed files, no PR conversation comments, reviews or inline review threads;
- expected-head guarded squash merge source/test SHA `088b9dd75a7af0aa7e5d32dcbcfffdbc501d90cb`.

Resulting-main Windows CI #421:

- run `34785000692`;
- job `103798741480`;
- exact main source SHA `088b9dd75a7af0aa7e5d32dcbcfffdbc501d90cb`;
- conclusion **SUCCESS**;
- Repository Preflight, Windows visual regression, Tauri Release and both required artifact uploads: **SUCCESS**;
- main visual artifact `10326331827`, digest `sha256:aaa71f3dbb91e522a1d1c8291939819729e720f0a31ad40e4c4463aa51cf8572`;
- main diagnostic/runtime artifact `10326422964`, digest `sha256:35abf0bba3a27fb9d42f3360eccd3e9f84abb3e252fe1f1159f9d51019a87afc`.

Tracking reconciliation for item 11 is complete in `TODO.md`, `STATUS.md`, this handoff and the immutable work log.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 12/16 — Allow ordinary focus-row task titles up to two lines where practical; expose full title accessibly.**

No item-12 implementation branch or PR exists yet.

Current small-slice progress: **0/5**.

### Five checkpoints for this slice

1. reconstruct the exact item-12 contract from current ordinary Focus row markup/CSS, product/UI/source evidence, current title/full-text accessibility conventions, layout-shift invariants, and Focus visual/static tests — pending;
2. implement the narrow presentation-only behavior plus deterministic/static/visual coverage and semantic diff review — pending;
3. validate the exact PR head with authoritative Windows CI: Repository Preflight, Windows visual regression, Tauri Release and required artifact uploads — pending;
4. final exact-head review + expected-head guarded squash merge — pending;
5. validate the resulting main source SHA with Windows CI, then reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable work log — pending.

Scope boundary for item 12:

- change ordinary Focus row-title presentation only, not the active/live title scrolling behavior completed in item 11;
- permit up to two lines where the existing layout can support them without moving reserved hit targets or destabilizing surrounding geometry;
- provide full-title access through an established accessible mechanism rather than pointer-only disclosure;
- preserve reduced-motion behavior and all authoritative task/timer/session/scheduling boundaries;
- do not absorb item 13 reserved action-slot implementation, item 14 icon-only tooltips, item 15 visual-state polish, item 16 empty/no-eligible states, Milestone 7 Floating Timer work, or Milestone 8 Preferences UI.

## INVARIANTS THAT MUST NOT REGRESS

- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- display handling remains event-driven/coalesced and item-10 recovery semantics remain intact.
- task/list/subtask identities, queue partitioning, scheduling eligibility and tracked Time Taken remain authoritative and unchanged by title presentation.
- renderer title presentation cannot become timer/session/task authority.
- item-11 active/live title scrolling remains preference-driven, overflow-aware, transform-only and reduced-motion-safe.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- future-timed Today tasks remain ineligible until due.
- Notes URLs remain explicit pointer/keyboard activation only.
- hover/focus interactions may not reflow sibling geometry or move established pointer targets.
- reduced-motion remains usable and timer numerals retain fixed/tabular geometry.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Reconstruct item 12 before editing. Inspect the current ordinary Focus row-title markup and CSS in `src/FocusPanel.tsx` / `src/focusPanel.css`, existing Focus static/visual tests and fixtures, current accessible full-title conventions in the repository, and the relevant title-density/screenshots/product evidence in `docs/UI_UX_SPEC.md`, `docs/PRODUCT_SPEC.md`, `docs/SOURCE_AUDIT.md` and `docs/BEHAVIOR_MATRIX.md`.

Define the narrowest two-line rule that preserves stable row/action geometry and full-title accessibility. Then create one coherent item-12 branch. Do not start item 13 or later work in parallel.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks item 12.
- Local Rust/Tauri capability may remain unavailable in the current environment; use the strongest applicable local frontend/static checks and record unavailable native checks as `NOT RUN` before authoritative Windows CI.