# 2026-10-17 — PR372 M5/B43 rendered Done heading regression, merged-main final acceptance

**Owner:** ChatGPT implementation. **Scope:** deterministic automated visual regression for existing production Board; no user-native Windows operation, no app/persistence/packaging/code changes, no live Blitzit or M11/M12.

## Proven gap and implementation
Prior source and frozen native evidence already established left-date/right-count Done heading structure, but `scripts/validate-visual-fixtures.mjs` merely required at least one Done task, without checking real per-date header text and child geometry. PR372 modified only:
- `src/visualFixtures.tsx`: serialize exact live DOM Done date/count text, local day, bounding boxes and scroll/clipping metrics from existing production `ListBoard` fixture routes.
- `scripts/validate-visual-fixtures.mjs`: require fixture-local `2026-09-08`, authoritative `1 task` for single list and `2 tasks` for All Lists, separate right-justified count, nonoverlapping geometry and no date/count clipping.
- `scripts/test-ui-list-board.mjs`: guard fixture/validator wiring against regression.

Four actual Windows fixture captures (individual/All Lists × dark/light) confirmed no clipping and an **8px** date-to-count gap, with singular/plural copy. Artifact `12111685529`, PR [#372](https://github.com/MariosGiannakaras/Narro/pull/372); no separate native installation. These fixtures are not exhaustive long-date, narrow multi-locale or actual Done scroll testing.

## Exact-head and resulting-main validation
- Feature branch: `test/m5-b43-rendered-done-headings`, PR head `835c294034be7ef7b00781adfa2532738a08c166`.
- [PR run 39060175537](https://github.com/MariosGiannakaras/Narro/actions/runs/39060175537): validation-gate **SUCCESS**, fast-gate **SUCCESS**, windows-candidate **SUCCESS**, exact PR head.
- Expected-head guarded squash-merge SHA: `03c01d73705423dea67d65f611449b59eeff869f`.
- GitHub commit file comparison: all three paths have identical blob SHAs in tested head and merged main: `scripts/test-ui-list-board.mjs` `10061ea3412eb8424f55109c1134ab5c5bd3627e`; `scripts/validate-visual-fixtures.mjs` `4ac417a0eb361b941be535fbf55d04581ca89f26`; `src/visualFixtures.tsx` `609a3ca8f017ff9f3127c0145aeaf0e27cdb7262`.
- [Resulting-main push run 39064534266](https://github.com/MariosGiannakaras/Narro/actions/runs/39064534266), exact merged SHA: **validation-gate SUCCESS / fast-gate SUCCESS / windows-candidate SUCCESS**. Completed release and visual fixture capture, packaged Focus runtime capture, M7 physical build creation / automatic validation logging, M1 diagnostic build and storage-isolation checks. Artifacts: resulting-main visual `12112109672`, packaged Focus `12112384138`, M7 validation build `12113446688`, M7 physical build `12113501494`, M1 diagnostic `12113546702`. Producing these artifacts does **not** equal running PA tests.
- Repo documentation after merge was Markdown-only and marked skip CI. Historical PR369 failing merge run remains FAIL.

## Disposition
**PR372 / resulting-main CI accepted and integrated.** B43 scoped automatic visual grammar/no-overlap assertions PASS. Original/current Blitzit exact geometry, long localized date heading variants, real personal native Done scroll/motion remain OPEN. No M5 milestone or physical PA acceptance, and no M10 whole-app sweep begun. U01–U41 remains 41/41 Narro-local coverage, original nine confirmed gaps 9/9 repaired, mandatory milestones 4/10 accepted. Existing Spectrum Core picker/upload/218 offline icons unchanged. Sole other-open PR344 remains another owner.

**Next operation:** narrow existing-source/evidence check of M6 Finding35 ordinary Time's Up presentation `TIME'S UP` versus `00:00`, avoiding duplicate M6 B50/B67 implementation; act on a concrete unowned defect only and keep user-paused native PA-01–09 untouched.
