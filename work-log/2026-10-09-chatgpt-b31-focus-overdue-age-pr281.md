# M6 B31 local-calendar Focus overdue metadata — PR281, 2026-10-09

Evidence: current Blitzit SS-C19 direct screenshot in `docs/BLITZIT_FORENSIC_PASS3_SCREENSHOTS.md` shows warm `2d ago` for queued overdue task; calibrated visual system prescribes amber/orange. Current FocusTaskRow showed generic `Overdue` with an absolute scheduled date/time, although authoritative Board already owns overdue eligibility.

PR https://github.com/MariosGiannakaras/Narro/pull/281, branch `implementation/m6-focus-relative-overdue-age-20261009`, exact source head `aec60028cea3e06d52ce621007a7e95f103c382d`, from doc-current main `45d9f937d622c17042708716e393cf8ad3a64269`. CI exact head not yet accepted at docs checkpoint; local Node/Rust/Windows checks NOT RUN.

Files:
- `src/focusOverdueAge.ts` pure date helper validates stored strict ISO calendar date and projects **local calendar-day delta in `ListBoardSnapshot.displayTimezone`** via `Intl.DateTimeFormat` in Gregorian/Latin-numbering, NOT millisecond/24h age, thus DST-correct, fail closed invalid date/time/zone and current/future day.
- `src/FocusPanel.tsx`: passes authoritative Board timezone and one render-time sample to Focus rows; only `task.isOverdue` tasks can show `Nd ago`, same-day/invalid fallback to generic `Overdue`, absolute schedule remains accessible, task actions/reorder unchanged; visual fixtures preserve deterministic previous generic copy.
- `src/focusPanel.css`: calibrated `--color-warning` amber, tabular nonwrapping relative metadata.
- `scripts/test-focus-overdue-age.mjs`: 1/2/9 local-day ages, month/year crossing, Athens DST spring/fall, LA UTC boundary, invalid/future/same-day; `scripts/test-ui-focus-panel.mjs` static contract; `package.json` preflight wired.

**Concurrency:** PR280 B67 head `94f392b6d73972f8c51369bc7f5d912e71ecc807` is OPEN and touches `src/FocusPanel.tsx`, `src/focusPanel.css`, `scripts/test-ui-focus-panel.mjs`, and package preflight. If either merges first, the other must reconcile both source/test unions against authoritative main via coherent replacement commit and rerun exact-head full Windows CI; preserve every earlier accepted result as historical only. PR279 B42 source files separate except shared package preflight; protect union after any merge. This PR is **not** source/native visual acceptance and does not change timer/overdue eligibility. Source coding progress **30/33**.
