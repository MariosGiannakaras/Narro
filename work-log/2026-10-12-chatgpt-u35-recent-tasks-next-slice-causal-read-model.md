# 2026-10-12 — U35 Sessions Recent Tasks, independent next-slice causal read-model analysis (NO implementation)

**This log is a deliberately non-executable analysis alongside active U12/U40 CI, not authority to open a concurrent overlapping source PR or activate M11.** It supplements U35/B68 in the 41-question register and consolidated triage. Approved user-owned Create/Edit List Spectrum Core/upload/218 icons unaffected.

## Evidence boundary

Historical Blitzit VE-015 and SS-H17 show the Add Session task-picker title `Recent Tasks`, search, list-color badges and selecting a task. **No direct source evidence establishes the actual recency algorithm** (recently created, edited, completed, worked, selected, list-scoped, or on-screen visible) or how far older records remain selectable. This does not authorize claiming any exact Blitzit ordering.

## Current Narro implementation — exact data causality

- `src/ReportsSessions.tsx` calls `getSearchPaletteData()` in a mount effect, stores `searchData`, then passes `tasks={searchData?.tasks ?? []}` into `ReportAddSessionDialog`.
- `src/searchPaletteApi.ts::getSearchPaletteData` constructs tasks by concatenating `board.backlog`, `board.thisWeek`, `board.today`, `board.done`, deduplicates by task id, and maps `id,listId,listTitle,listColor,title,lane`. **No creation/updated/completion timestamp is included in `SearchPaletteTaskResult`**.
- `src/ReportsSessionsView.tsx::ReportAddSessionDialog` filters the entire passed array by case-insensitive title substring and displays `filtered.slice(0,12)` beneath the visible + aria name `Recent Tasks`. It **never** ranks by date. The matching task selection, Escape, pending modal and focus restore are already implemented and must not be broken.
- **Timestamps already exist in authoritative Rust domain and SQLite:** `src-tauri/src/domain/tasks.rs::TaskRecord` exposes `created_at`, `updated_at`, `completed_at`; `src-tauri/src/persistence/tasks.rs` reads all in `TASK_COLUMNS`; but `src-tauri/src/list_board.rs::ListBoardTask` projects only `completed_at`, **not `created_at` or `updated_at`**. Thus using the existing client task array alone to sort by "recency" would be an arbitrary fake chronological order, not a real implementation.
- Additional nuance: `searchData` loads at the Reports Sessions mount and is not automatically refreshed each time the picker opens. Changing the selector ordering must not silently claim absolute freshness when the board snapshot has become stale.

## Evidence-first local contract candidate (needs separately scoped implementation/test validation)

A narrow Narro-local rule, not Blitzit parity proof: **sort the Add Session picker by the saved task `updated_at` descending** (most recently modified first), tie by stable original board/order/identity, bounded/invalid timestamps handled deterministically. Use a source-of-truth timestamp projected through existing read model; **do not reorder the shared global Search Palette results or persist new task ranks**. Safely include completion via standard task updated timestamp and preserve all task/list IDs, badges, search, selected task and `slice(0,12)` after sorting. Test pending/done mixes, same instant, missing/malformed legacy timestamps, case-insensitive query, dialog focus/Escape and no duplicate mutation; current Rust schema and UTC normalization requirements before selecting exact sort comparator. If a consistent meaning for `Recent` cannot be established without source, record this as a *Narro-local documented rule*, not source confirmation. `created_at` could be separate tie-breaker, but do not invent a new 'recent session activity' timestamp from session rows.

**Not implemented, no test/CI PASS claimed.** Pending independent coding: U12 PR334 head `3688f22d2051d762bd4d70997fd4947255031cff` CI 38182179391 with validation+fast PASS and Windows Check Rust in progress; U40 PR335 head `878559303aef1184035f300b0a3ba2ccaab103d9` CI 38182357941 validation+fast PASS at last actual read. User-paused Windows Codex remains 3/10 native-milestone acceptance; optional live Blitzit M11 dormant.
