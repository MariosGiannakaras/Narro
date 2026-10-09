# B42 schedule date X only target refinement — 2026-10-09

Following PR279 `implementation/m5-scheduled-quick-remove-20261009` creation, a narrow source/safety review found its first candidate made the **entire date line** one clickable `MenuItem`; this permits schedule deletion when users intended to inspect/click the date instead of the source-proven circular X. The direct VE-007/VE-008 source uses pointer specifically on X. This was corrected **before merge** without changing Rust/domain/persistence or the stored-manual-lane B70 open issue.

Initial #279 head `406e4df764b2766e7177db8a768bc39257234a8a`, CI `37890312005` passed validation/fast and had Windows candidate in progress, then **CANCELLED** after new head pushed. Do not treat old CI as new-head PASS.

Replacement commit/head **`024db8c892181d21ef6b55cd8afb414b67693622`**, exact run **`37892048979` IN PROGRESS/NOT PASS** at handoff. Four bounded additional files:
- `TaskCard.tsx`: date line remains informative `role=group`, separate MenuItem circular X gets `ariaLabel=Remove schedule for <date>`; no nested buttons; only X invokes `onRemoveSchedule`.
- `overlayPrimitives.tsx`: backward-compatible optional `MenuItemProps.ariaLabel` forwarded to menuitem button; existing generic keyboard navigation and dismissal reused.
- `listBoard.css`: shared token-consistent informative row + circular X hit target, accessible geometry.
- `scripts/test-ui-task-scheduling.mjs`: static production assertion that date row is informative and X has independent accessible action.
Existing pure stale-safe CAS tests and `package.json` preflight from original head remain. Local Node/Rust/Windows checks NOT RUN (GitHub connector-only); complete Windows exact-head CI required before SHA-guarded merge and source/native visual parity remains OPEN.

Independent B67 PR280 head `94f392b6d73972f8c51369bc7f5d912e71ecc807` run `37891408784` IN PROGRESS; latest executable-main run `37889958312` IN PROGRESS. Progress **30/32**, neither PR merged; no milestone increment.
