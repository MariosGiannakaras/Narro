# ChatGPT PR388 — frozen57 evidence-based frontend correction batch (2026-10-20)

## Identity and ownership
- Owner ChatGPT implementation track; one PR [#388](https://github.com/MariosGiannakaras/Narro/pull/388) on `fix/capture57-batched-volume-done-freshness`.
- Last pushed head `de9b41640b17726d582e04c682dd347c1e927e53` from documentation-only main baseline `f9a4362e173db9d9068452a9f1c8be9d18de91c3`. Confirmed application source originally `9e631952158c5c6b9763e0e0d79e33b79e8c7ca3`.
- The 57 C-ID entries in `docs/CAPTURE_57_ANALYSIS_2026-10-20.md` are **57 analytical dispositions, not 57 bugs or PASSes**. Preserve independent `NO_FIX`, `EVIDENCE_LIMIT`, `SOURCE_PARITY_OPEN`, `PHYSICAL_ONLY`, `FAIL` verdicts.

## Proposed corrections
- **C44**: `src/SoundPreferenceControl.tsx` and three `PreferenceSettingsSections.tsx` callers distinguish temporarily saving from actually disabled. While pending the speaker range remains mounted/focused; duplicate commands blocked. Parent-off still closes it.
- **C51**: `src/reportDoneOrdering.ts` and `ReportsOverview.tsx` sort only presentation by real parsed completion instant (newest first, deterministic task ID ties, malformed values last); never reorder backend/report history or the persistence owner. Same Done projection used in UI/PDF.
- **C39**: Correct exactly evidenced information-marker inventory in General/Monitor/Timezone/EST rows (decorative, no invented tooltip).
- **C40 (bounded)**: Replace Fun GIF internal source-follow-up user-facing help with meaningful function description; section grouping and source density still OPEN.
- **C38 (bounded)**: Scope denser shortcut-row presentation to standalone light `WindowsShortcutsDialog` without altering global registrations, app bindings, keyboard focus, conflict status, retry or accessible descriptions. Geometry/source-pixel acceptance still OPEN.
- New `scripts/test-report-done-ordering.mjs`, `scripts/test-sound-preference-save-focus.mjs` wired in mandatory `package.json` preflight; existing `scripts/test-ui-preferences.mjs` augmented for C38/C39/C40.

## Validation facts
- Connector-side source structure, test/preflight wiring, saved-timezone assumptions and info-icon source inventory were checked and matched expected authored code. **Static source checks only; do not promote to execution PASS.**
- Full frontend/npm test execution: **NOT RUN** (no checked-out dependency tree in the GitHub connector environment). Native Rust/Windows visual: **NOT RUN**.
- PR-head CI: **NOT CHECKED / UNKNOWN** under user's no-wait/no-poll instruction. **Not merged**. No CI PASS claimed or historical head promoted.
- The known C26–28/C35 Timer↔Panel stale WebView pixels are still recorded native **FAIL**, require regression-first source/native freshness remedy plus targeted physical confirmation after user permits. No Timer code modified.
- Other residual source presentation differences C06/C12/C40/C41/C55/C56 remain limited/open, along with untouched physical M5–M9 acceptance. M1–M4 formally accepted 4/10; M10 gated; M11/M12 dormant; PA-01–09 user-paused.
- No user AppData, live native session, external Blitzit audit or approved Spectrum Core picker/image upload/218 offline icons touched.

## One next action
At the next useful execution gate, check exact PR #388 head and corresponding CI **once** if necessary for diagnosis/guarded merge (do not idle-poll); if failed, fix only proven cause on same branch and rerun matching validation; if three gates PASS, guarded merge and verify resulting main. Separately implement only an evidenced Timer freshness change with boundary regression and compatible exact Windows candidate; do not substitute another rAF delay or assert native C27/C28 closure from CI.
