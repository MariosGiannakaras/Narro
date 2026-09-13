# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, the newest relevant immutable `work-log/*.md` entries, and `docs/BLITZIT_HISTORY_RISK_INDEX.md` whenever reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **10 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

General roadmap progress: **5/10 milestones complete**.

A new item-11 implementation slice is now active at **0/5 checkpoints**.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`fc0e52f6951e92f961aa8c38bee2069265bdaf1a`

Source tree:

`c0012d64417d3791860d232a56f760b7cc12986d`

This is the expected-head guarded squash merge of PR #110 after authoritative resulting-main Windows CI #418 passed on the exact merged source SHA. Markdown-only tracking descendants after this source SHA do **not** replace the validated source/test baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 item 10/16 — React to monitor/display changes while Focus Mode is open.**

Immutable evidence:

`work-log/2026-09-14-chatgpt-m6-focus-display-reaction.md`

Validated behavior:

- the existing M1 Win32 display observer remains event-driven and coalesced; no polling was added;
- display geometry revalidation covers display change, DPI change, work-area change and Windows resume events;
- generic M1 visible-work-area recovery runs before specialized preference-aware Focus Panel revalidation;
- specialized revalidation runs only for an already-visible native Panel-mode `focusSurface`;
- a display event cannot show/focus a hidden surface or convert Timer/Floating presentation into Panel;
- exact saved-monitor semantics remain unchanged: stale explicit monitor keys are not rewritten or silently redirected; no-selection retains native primary-monitor fallback;
- generic visible-area recovery remains effective even when specialized selected-monitor revalidation cannot resolve a stale key;
- task/timer/session state, renderer geometry authority, Preferences UI, Floating Timer persistence/polish and webview count are unchanged.

PR #110 evidence:

- final exact PR head `8bd4021c9b2a2b63293acee42d9e29b5ab129ca6`;
- tree `c0012d64417d3791860d232a56f760b7cc12986d`;
- Windows CI #417 / run `34779023404` first job `103782478568` passed preflight/item-10 tests and then hit a transient unrelated `task-scheduling-dark` visual readiness miss;
- evidence-backed same-head rerun job `103787883396`: **SUCCESS** across preflight, visual regression, Tauri Release and required uploads;
- PR visual artifact `10324987092`, digest `sha256:1e0db7c3b05c28509b32d0575094369a693c8767cdd641b16ef9fccf682ae9f2`;
- PR diagnostic/runtime artifact `10324709335`, digest `sha256:15f0a20b583a08698ecf316d705f2acee0206231a1274b0f1b6812011a521746`;
- final review: unchanged exact head, mergeable, exactly four expected files, no PR comments/reviews/inline comments;
- expected-head guarded squash merge source/test SHA `fc0e52f6951e92f961aa8c38bee2069265bdaf1a`.

Resulting-main Windows CI #418:

- run `34781877521`;
- job `103790256608`;
- exact main source SHA `fc0e52f6951e92f961aa8c38bee2069265bdaf1a`;
- conclusion **SUCCESS**;
- Repository Preflight, Windows visual regression, Tauri Release and both required artifact uploads: **SUCCESS**;
- main visual artifact `10324493612`, digest `sha256:3abcb8e113e78cc28275cc4791fec3d8fa0e5d6a7dd1704d4301d9a6d7595388`;
- main diagnostic/runtime artifact `10325578509`, digest `sha256:22ed8e6a29ad8679052379b97ec531a89cd5094a5845553fa19c8046f3fd3309`.

Tracking reconciliation for item 10 is complete in `TODO.md`, `STATUS.md`, this handoff and the immutable work log.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 11/16 — Implement configured scrolling behavior for the live title.**

No item-11 implementation branch or PR exists yet.

Current small-slice progress: **0/5**.

### Five checkpoints for this slice

1. reconstruct the exact item-11 contract from current Focus live-title rendering, persisted scrolling-title preference/domain state, product/UI/source evidence, shared motion/reduced-motion primitives and existing Focus visual/static tests — pending;
2. implement the narrow presentation-only behavior plus deterministic/static/visual coverage and semantic diff review — pending;
3. validate the exact PR head with authoritative Windows CI: repository preflight, Windows visual regression, Tauri Release and required artifact uploads — pending;
4. final exact-head review + expected-head guarded squash merge — pending;
5. validate the resulting main source SHA with Windows CI, then reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable work log — pending.

Scope boundary for item 11:

- configure scrolling behavior only for the **active/live title**;
- derive behavior from the existing persisted preference rather than inventing a second setting or renderer-only authority;
- preserve reduced-motion behavior and avoid continuous decorative work when scrolling is unnecessary;
- do not absorb item 12 ordinary Focus row-title two-line/full-title behavior;
- do not absorb item 13 reserved action slots, item 14 tooltips, item 15 visual-state polish, item 16 empty states, Milestone 7 Floating Timer work or Milestone 8 Preferences UI.

## INVARIANTS THAT MUST NOT REGRESS

- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust coordination remains monitor/work-area/DPI/physical-position authority; React cannot become parallel geometry or timer/session authority.
- display handling remains event-driven/coalesced and item-10 recovery semantics remain intact.
- task/list/subtask identities, queue partitioning, scheduling eligibility and tracked Time Taken remain authoritative and unchanged by title presentation.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- future-timed Today tasks remain ineligible until due.
- Notes URLs remain explicit pointer/keyboard activation only.
- hover/focus interactions may not reflow sibling geometry; reduced-motion remains usable; timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Reconstruct item 11 before editing. Inspect the current Focus live-title markup/CSS and tests, the persisted scrolling-title preference/domain/schema/defaults, `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, shared motion/reduced-motion implementation, and the newest relevant Focus work logs.

Determine the narrowest rule for when/how the active title scrolls, including overflow/no-overflow and reduced-motion behavior. Reuse the existing preference and shared motion primitives. Do not begin item 12 or later work in parallel.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks item 11.
- Local Rust/Tauri capability may remain unavailable in the current environment; use the strongest local frontend/static checks available and record unavailable native checks as `NOT RUN` before authoritative Windows CI.