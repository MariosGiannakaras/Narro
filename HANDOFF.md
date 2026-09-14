# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, the Focus/Blitz sections of `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, the newest relevant immutable `work-log/*.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md` when reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **12 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

General roadmap progress: **5/10 milestones complete**.

Item-13 implementation slice: **0/5 checkpoints complete**.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`a62ff3424525486ea1487429ff043d0139b85abd`

Source tree:

`7d269939de6e5812e66ef1b002796d11132b00a7`

This is the squash merge of PR #112 after authoritative resulting-main Windows CI #426 passed on the exact merged source SHA in same-SHA attempt 2. Markdown-only tracking descendants after this source SHA do **not** replace the validated source/test baseline.

Latest immutable completed evidence:

`work-log/2026-09-14-chatgpt-m6-focus-row-title-wrapping.md`

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 item 12/16 — ordinary Focus row-title wrapping and accessible full-title access.**

Validated behavior:

- only ordinary Remaining/Scheduled/Done Focus row titles use the two-line presentation; active/live title scrolling remains separate;
- ordinary titles clamp to two lines and safely wrap long unbroken text;
- full-title access reuses the shared keyboard-capable `Tooltip` / `aria-describedby` primitive;
- the Focus tooltip wrapper stays flexible with `min-width: 0` inside the existing title slot;
- a second line may grow the row vertically, but row width/horizontal title geometry remain stable;
- no animation/transform or authority change was introduced.

PR #112 evidence:

- final exact PR head `789cd1a69efca59e33035660a4b91c11d63f1a39`;
- authoritative Windows CI #425 / run `34811100017` / job `103872454315`: **SUCCESS**;
- PR visual artifact `10334544083`, digest `sha256:5d43cd8b449d5a854246819b6bf99fd3c641618fd65642f4a449dc624a6c261f`;
- PR diagnostic/runtime artifact `10334883696`, digest `sha256:7927d191f6877d533129ebe9622b50e9a5ce38ae44068c0220b510dc36f18312`;
- final review: nine expected changed files, no conversation comments, reviews or inline threads;
- squash merge source/test SHA `a62ff3424525486ea1487429ff043d0139b85abd`, tree `7d269939de6e5812e66ef1b002796d11132b00a7`.

Resulting-main Windows CI #426 / run `34819905050`:

- attempt 1 job `103898850739` passed preflight and the Focus/item-12 captures, then failed only because the unrelated existing `task-scheduling-light` capture did not report ready state;
- no source/harness change was made;
- same exact main SHA attempt 2 job `103901669712`: **SUCCESS** across preflight, Windows visual regression, Tauri Release and both required uploads;
- main visual artifact `10338361964`, digest `sha256:659986ba76d0ac911ea80343d6e552eaf7826d355902efed1abba5970d9b2281`;
- main diagnostic/runtime artifact `10338572056`, digest `sha256:1f72c7c9c04cc93a65d28a495ffb8a44a081c87b0e8ec5d1b8e698f3633092f9`.

Tracking reconciliation for item 12 is complete in `TODO.md`, `STATUS.md`, this handoff and the immutable work log.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 13/16 — Reserve action slots for hover/focus controls so controls never push task text or move hit targets.**

No item-13 implementation branch or PR exists yet.

Current small-slice progress: **0/5**.

### Five checkpoints for this slice

1. reconstruct the exact item-13 contract from current Focus ordinary/live action markup/CSS, product/UI/source evidence, shared overlay/action primitives, the validated M5 task-card reserved-action pattern, item-12 title geometry and current Focus static/visual tests — pending;
2. implement the narrow presentation-only reserved-slot behavior plus deterministic/static/visual coverage and semantic diff review — pending;
3. validate the exact PR head with authoritative Windows CI: repository preflight, Windows visual regression, Tauri Release and required artifact uploads — pending;
4. final exact-head review + expected-head guarded squash merge — pending;
5. validate the resulting main source SHA with Windows CI, then reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable work log — pending.

Scope boundary for item 13:

- stabilize the space occupied by hover/focus action controls so revealing controls cannot push task text, resize the title slot or move existing pointer/focus targets;
- reuse established shared geometry/action-slot patterns rather than inventing a second interaction system;
- preserve the item-12 two-line/full-title title contract;
- do not absorb item 14 tooltip work, item 15 visual-state polish, item 16 empty states, Milestone 7 Floating Timer work or Milestone 8 Preferences UI.

## INVARIANTS THAT MUST NOT REGRESS

- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- display handling remains event-driven/coalesced and item-10 recovery semantics remain intact.
- task/list/subtask identities, queue partitioning, scheduling eligibility and tracked Time Taken remain authoritative and unchanged by presentation work.
- renderer title/action presentation cannot become timer/session/task authority.
- item-11 active/live title scrolling remains preference-driven, overflow-aware, transform-only and reduced-motion-safe.
- item-12 ordinary Focus row titles remain two-line-clamped with keyboard-accessible full-title access.
- hover/focus control revelation must not reflow sibling geometry or move hit targets.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- future-timed Today tasks remain ineligible until due.
- Notes URLs remain explicit pointer/keyboard activation only.
- reduced-motion remains usable and timer numerals retain fixed/tabular geometry.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Reconstruct item 13 before editing. Inspect current Focus ordinary/live action markup and CSS, shared overlay/action-slot primitives, the M5 task-card reserved-action implementation/tests, item-12 title component and Focus visual fixture/validators, and Focus-related product/UI/source evidence. Then implement only the narrowest reserved-action-slot contract on one coherent branch. Do not start item 14 in parallel.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks item 13.
- Local repository checkout/Rust/Tauri capability may remain unavailable in this environment; use the strongest connector/static checks available and authoritative Windows CI.