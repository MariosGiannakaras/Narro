# 2026-10-27 — PR431 compiled Search CSS and M7 three-branch integration pre-physical review

**Owner:** ChatGPT user-requested M5–M9 source/prephysical reconciliation. GitHub current source, no Windows program launch, user's AppData/OS settings untouched. These are **bounded source/package inspections**, not physical source-parity PASS and not permission to merge.

## Source-to-production Search CSS

Downloaded the exact [PR431 `7794299a` fast frontend dist artifact `12700372763`](https://github.com/MariosGiannakaras/Narro/actions/runs/40427685169) and independently inspected all 22 compiled CSS files inside the archive. The release frontend bundle **does** contain a separate `assets/SearchPalette-3_MUulwT.css` with the actual minified rules:
- `.search-palette__query-row:focus-within{border-color:var(--color-accent-solid);box-shadow:0 0 0 1px var(--color-accent-solid)}`
- `.search-palette .search-palette__query:focus-visible{outline:none;box-shadow:none}`
- selectors targeting Search quick-action icon accent and transparent/unboxed icon background.
The actual Windows HTML/React Search fixture from the same source generation showed the intended **rounded turquoise parent focus**, not the earlier square nested focus. This is evidence that the relevant CSS **is included in a production-compiled bundle** and is not merely an uncompiled source file; it does **not** establish exact native runtime Search CSS injection, target process identity, UI size/state, focus hierarchy or user-observed visual PASS on their new EXE. Avoid speculative duplicate CSS rules while the conflicting older physical recording lacks a same-final-build provenance pair.

## PR431 vs PR389 and PR419 overlap risk

Read the GitHub PR patch manifests for all three actual open PRs (without modifying their source or branches):
- PR431 changes **30** paths, including Focus/Timer Rust native `src-tauri/src/lib.rs`.
- PR389 A changes **46** paths; overlaps PR431 in **4** paths: `package.json`, `scripts/test-single-focus-architecture.mjs`, `scripts/test-ui-focus-entry.mjs`, `src-tauri/src/lib.rs`.
- PR419 B Motion v4 changes **56** paths; overlaps PR431 in the **same four** paths, and overlaps PR389 on approximately the whole compositor/native integration and visual regression architecture. B depends on A for independent physical-before-merge.
- Therefore three separate green CI runs and three verified EXEs do **not** equal one source-integrated candidate. In particular the current PR431 Panel inset/native Timer first-reveal geometry and alternative A/B source `lib.rs` transitions may conflict, and source test assertions must be reworked according to the final owner. Any integration needs dependency order, fresh exact-head CI, resulting-main tests **after accepted guarded merges**, and physical acceptance on the exact combined executable. Don't cherry-pick a 500ms animation over an unaccepted native compositor merely to make a single ZIP.

## Existing discrepancy not a second bug

Current `src/ArchivedListsPanel.tsx` uses actual badge/title header, per-task preview grid and footer restore/delete actions; `src/archivedListsPanel.css` uses responsive CSS grid cards. The old archived-list wide horizontal row defect in [older 2026-10-17 reconciliation](2026-10-17-archived-list-card-source-reconciliation.md) was already superseded in the same live `TODO.md` entry and [newer existing source/fixture review](2026-10-17-chatgpt-m5-a2-archived-existing-fixture-review.md). Remaining A2/SS-H14 concern is older-source metadata/spacing visual evidence, not permission to replace the implemented preview DTO with invented time metadata.

## User request / status

All 57 unchecked M5–M9 cells are an *inventory*, not 57 bugs. True demonstrated source differences were already corrected in merged PR388/422 and active PR431; the serious independent unresolved M7 compositor concerns require strictly bounded original physical frame and interaction evidence before acceptance. Latest source at log authoring PR431 `ead9a0c14d6457a527c57ee6b35d008f0e3d9eb7` adds **actual React SSR Quick Preferences first-paint/error/ready/pending regression** and updates stale Panel-edge wording to reflect native 16-DIP gap. [CI40437739504](https://github.com/MariosGiannakaras/Narro/actions/runs/40437739504) Windows candidate RUNNING when recorded; no final current head green/EXE claimed.
