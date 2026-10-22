# 2026-10-18 — PR379 B49 Done last-slot keyboard painted regression

**Owner:** ChatGPT implementation. **Branch:** `test/m6-b49-done-edge-focus-painted`; **accepted exact PR head:** `12bf299b1f0171337306521c708cc87346438ea9`. [PR379](https://github.com/MariosGiannakaras/Narro/pull/379); [PR CI run 39156141584](https://github.com/MariosGiannakaras/Narro/actions/runs/39156141584): validation/fast/windows-candidate **3/3 SUCCESS**. Earlier run 39156029445 was CANCELLED after the superseding head change, not a PASS. Expected-head guarded squash merge **`1c3080fbdfeae5004a0b5e98b20be86b08b72625`**, five changed Git blobs **5/5 identical** to validated PR head on merged main.

## Why a new test was justified

The existing Focus B49 production CDP fixture actually captured and compared 420×720 Windows PNGs / 492×628 measured viewport for normal running vs *center Pause keyboard focus*. The rightmost **Done** button uses a different CSS `justify-self:end` expansion rule and had no specific painted-label/edge test. Existing historic D1 native evidence had Done hover but not this exact same-viewport CI keyboard-paint assertion.

Five **test/capture/validator-only** files changed: `src/focusPanelVisualFixture.tsx`, `scripts/capture-focus-panel-fixtures.ps1`, `scripts/capture-focus-action-cdp.mjs`, `scripts/validate-focus-visual-state-captures.mjs`, `scripts/test-ui-focus-action-slots.mjs`. A real Done focus fixture asserts focus ownership, heading dismissal, rail reveal, text/pill/card containment and nonmoving card/rail. Its CDP readback now identifies the correct focused action from URL scenario (prior always assumed Pause). The Windows validator independently checks same-viewport real light/dark painted pixel changes and label width, not just a DOM ready marker. No production CSS, app behavior, timer ownership, IPC, persistence, PA or original Blitzit research changed.

## Exact artifact verification

Run39156141584 Windows artifact `narro-m5-visual-regression` ID **12147188917**; original ZIP SHA256 **`bb51c14257db1e007f4ab05d8665b470cf3b092f0e5c3a2394e53a9d8c45c053`**, byte-identical to GitHub published digest, ZIP CRC **PASS**. Actual rendered files `focus-panel-live-actions-done-focus-light/dark.png` (30114 / 29929 bytes) and matching DOMs both have scenario `live-actions-done-focus`, 492×628 measured page, action `done`, painted label **Done**, whole right-edge action x=329.84375, width=61.15625, label width=51.15625 fully inside content available width=51.15625, action rail x=101 width=290 and y=117 height=37. Original focus/rest screenshots and actual comparison image inspected; strict real-pixel Windows validator passed. The matched screenshot dimensions are 420×720 PNG; the distinct layout viewport is not conflated with PNG size.

All six workflow artifacts were listed at PR run completion: visual, packaged Focus, M7 physical-build and automated-validation, M1 diagnostic, fast frontend. The validated screenshot **does not** establish a personal native Windows acceptance or exact original Blitzit motion/appearance.

## Remaining exact work

**Resulting-main push CI at exact merge SHA `1c3080fbdfeae5004a0b5e98b20be86b08b72625`: NOT VERIFIED.** The available GitHub connector's `fetch_commit_workflow_runs` lists PR-triggered runs only, and returned no entries for the resulting-main push. Do not infer PASS from PR-head 3/3, matching source blobs or artifact availability. Check the actual resulting-main workflow through a supported source before closing the release gate. Preserve PA-01–09 USER-PAUSED; other-owner PR344 unchanged.

Separate read-only M8 B29 backlog check: PR294 is **already guarded-merged** at `2ddf98538f35090b74ffc6ffb21e8e08fd689fdc` and current main includes `WindowsShortcutsDialog.tsx` and the light/dark rendered fixture. Its older TODO text claiming unmerged proposed-only code is historical, not a fresh implementation gap. Source/current-version and physical acceptance remain independently OPEN. No duplicate code PR needed.

**Progress-count limitation:** the exact currently recorded M1–M9 TODO checklist has **259 checked / 317 total** checkboxes (58 unchecked). These numbers include previously completed work by all owners, optional deferrals, source-parity questions and USER-PAUSED native gates; they are **not** an honest X/Y for current ChatGPT-owned executable work. Maintain a future agent-owned set only from confirmed, nonoverlapping actionable tasks, not arbitrary PR or investigative micro-counters.
