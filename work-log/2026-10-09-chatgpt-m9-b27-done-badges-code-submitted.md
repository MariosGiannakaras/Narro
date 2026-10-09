# Reports Done identity/punctuality presentation — proposed implementation (2026-10-09)

## Scope and authoritative source

The current `TODO.md` M9 B27 and `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` B27 route VE-011 02:18–02:54: populated Done rows show a list-colored badge plus Early/Late/No Est pill and retain right-aligned Taken, date groups and internal scrolling. Before this patch `ReportsOverviewView` rendered plain list text and unboxed status text. This is an implementation correction, **not** a Codex/CI1046 physical failure and **not** a redefinition of unknown source metric thresholds (register U16).

## Exact proposal

Independent source PR [#293](https://github.com/MariosGiannakaras/Narro/pull/293) branch `implementation/m9-b27-done-list-status-badges-20261009`, original base main `216def676dddef267de370556c79e24ac7a0df2d`, exact proposed head `e1431a47f04d4366b1f0f8eef0199b12d9c716ab`. Eight source/test files:
- Pure `reportListAccent(listId, currentColors)` keyed by stable ID and guarded with exact #RRGGBB. Titles are not used as identifiers; absent archived/deleted list color yields a **neutral marker, not an invented historic accent**.
- Existing `ReportsOverview` runtime HomeSnapshot list-color projection now also feeds the already scoped Done task view, without Rust queries or modified report aggregation.
- `ReportsOverviewView` uses one compact list dot and token-based Early/Late/On-time/No Est pill. Punctuality copy/calculation, Time Taken and date grouping remain unchanged. CSS preserves compact layout and print/PDF Done-list expansion.
- Populated visual fixture and existing test contracts updated; pure helper tests include identity separation, unknown/archived, malformed and absent color.

The accepted diff changes no Tauri/Rust/report history/timer/SQLite state, no physical-window mode and no other open PR source files (#280/#285/#286/#288/#290). The branch's updated fixture file `src/reportsVisualFixture.tsx` also appears in independent #286's changed-file set; this is a **mechanical/fixture overlap** requiring reconciliation after #286 merges before any exact-head final validation/merge, not an assumption that the branches merge cleanly.

## Validation truth and continuation

- Source changes **IMPLEMENTED / PROPOSED**, **NOT MERGED**, no accepted whole feature or milestone counter increment.
- Local Node/npm/TypeScript/Rust verification: **NOT RUN** (no checked-out remote repository; local network Git unavailable).
- CI **NOT CHECKED** per user instruction (the user will report when Actions complete). Do not treat Actions as green or perform polling in this interaction.
- Physical packaged-Windows check and direct current Blitzit render comparison: **NOT RUN / OPEN**.
- After user says Actions finished: inspect the exact proposed head only if instructed to check, reconcile any #286 shared visual-fixture update on latest main, run required validations on replacement head if needed; merge only with exact expected-head guard and resulting-main source evidence. This branch must not overwrite newer main Markdown.
- Continue other **independent known implementation** work where semantics are source-supported; do not pre-empt Codex physical findings or unverified Blitzit formula cases.
