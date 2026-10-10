# 2026-10-10 — Audit A06 Focus Panel create/duplicate same-render ownership risk (analysis only)

## Evidence and causal classification
Current source `src/FocusPanel.tsx` (as of main `e787b6fad688e17ac400b9152e197d9fb6a195ff`; PR306 pending) uses React-only in-progress state:
- `commitRowMutation(task, mutation, success)` guards `mutationPendingTaskId !== null` from the current render closure, then calls `setMutationPendingTaskId(task.id)` before awaiting the mutation (~lines 699–726).
- `duplicateTask` routes through `commitRowMutation` to `duplicateListBoardTask` (~lines 810–817). Two pointer/shortcut callbacks in the same render can both pass `mutationPendingTaskId === null`. The backend duplicate API allocates a new identity for each accepted duplicate, so relying on React state for exclusivity risks duplicate commits.
- `submitAddTask` checks `addTaskPending` render state, sets true, then awaits `createListBoardTask` with the same form title/list (~lines 853–889). Two same-render handlers can submit twice before React publishes disabled state, creating two tasks. This is the same class as A01 FocusLiveActions and A04 ListBoard/Search, but **different owner and code path**.
- `makeTaskLive`, `confirmTaskChangeList`, `confirmDelete` similarly use rendered pending states; cannot infer native duplicate ledger writes because Rust authoritative state/version checking may reject repeats, but the UI may surface misleading stale loser errors.
- Reports manual Add Session is separately tracked A05. Do not combine all independent widgets in one broad source rewrite.
**Disposition:** `NEEDS_REGRESSION_FIRST` for concrete double-create/duplicate, then `READY_FOR_FIX` if test demonstrates the same-tick path. A control-local synchronous mutex/ref should guard the real write lifecycle before `await`, hold through committed refresh, release on retryable failure; preserve UI and timer authority. Do not add global timer locks or alter persisted state.

## Concurrency boundary / next action
PR306 Focus selector already touches `src/FocusPanel.tsx`. A03 Focus stale-response guard is the earlier repo-recorded line and touches the same source state ownership. Keep these **sequential** to avoid semantic overlap, using accepted current main. First validate/merge PR306, then deterministic A03 stale-response regression/fix, then A06 deterministic same-tick form duplicate/row duplicate test and narrow source fix. PR307 owns **ListBoard/Search only** and does not authorize changing FocusPanel concurrently.
No source changes or tests were made under A06 in this analysis. CI/Narro physical/source parity **NOT RUN**; this is a code-proven timing vulnerability, not an observed user bug.
