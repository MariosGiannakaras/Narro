# 2026-10-10 — M5 Home source/static visual review (SS-C03; no source change)

## Direct evidence opened
- Canonical Blitzit `reference/original-blitzit-screenshots/current-v2.6.69-home-dark.png` (SS-C03; GitHub blob `af4d59b9cec3613bad4595e40dc79c9bb365af29`), 2559×1079 Windows desktop source screenshot. Inspected actual pixels, not just Pass-3 notes.
- PR306 latest rendered Windows CI `narro-m5-visual-regression` artifact ID `11668793415` from [run 38049022590](https://github.com/MariosGiannakaras/Narro/actions/runs/38049022590): directly opened actual `home-dark.png` and `list-card-states-dark.png`, both 1280×720 Edge fixture captures. These are static frontend render observations, NOT native multiwindow/compositor observations.

## Comparison and explicit limits
SS-C03 includes left navigation, greeting, lists row, numbered task previews and right-aligned duration fields, per-card pending/Est summary, final dashed Create List tile, bottom Home/Reports navigation. Narro screenshots visibly contain matching **general hierarchy** and numbered task previews/right-edge timing metadata, card footer count/EST, the navigation/heading areas. No current direct Blitzit evidence substantiates whether individual trailing time represents EST versus Taken in every state; B23's existing source-semantic uncertainty remains OPEN and we did **not** change timer/business values merely to match screenshot text.

The ordinary `home-dark.png` regression shows three cards but **no Create List tile**. This is NOT a production missing-control defect: `src/visualFixtures.tsx`'s generic Home fixture passes `<HomeDashboard fixtureSnapshot={...} fixtureHour={20}/>` with **no** `onCreateList`; production `src/AppShell.tsx` supplies `onCreateList={openCreateList}` to `HomeDashboard`. The separate actual `list-card-states-dark.png` fixture **does supply** `onCreateList` and renders the dashed gradient Create List tile in the same user-visible grid, confirming static production component treatment. Preserve the distinction between a fixture intentionally omitting injected interactive props and real product absence.

Original screenshot has larger 2559px viewport, full-screen dark desktop, account/free-trial/upgrade/assistant controls excluded from Narro's explicit personal/local-only scope, and multiple cards not matching the artificial Narro fixture dataset; exact overlay/pixel claim would be invalid. Actual rendered screenshot review supports macro composition and required controls but is **not SOURCE_PARITY_PASS** in absence of matched viewport/system plus any stricter current evidence.

**Disposition: NO_FIX** for presumed missing Create List tile (fixture false alarm); **SOURCE_PARITY_OPEN** for unresolved B23 trailing-time original semantics and responsive full-shell pixel-match. Any needed further static alignment should use actual state-matched Edge screenshots or source evidence; do not spend paused Codex physical time merely to observe an ordinary static tile.

No code/test, semantic data, M5 milestone checkbox or CI acceptance changed based on this observation.
