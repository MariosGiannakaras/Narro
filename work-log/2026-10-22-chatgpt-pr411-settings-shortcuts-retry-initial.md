# Initial PR411 Preferences / Windows Shortcuts local-read recovery (2026-10-22)

**ChatGPT-owned independent code batch**, concurrent with existing Windows candidate PR410 exact head `6fd8748721932bec9171eb4251222f95afe3f708` CI `39768224869`. Current accepted main docs SHA `33550abd31ba993e2bff6d94acb35e502b887b0d`.

## Confirmed source issue and bounded change
1. `PreferenceSettingsRuntimeProvider` initial `Promise.all(getPreferenceSettings, listPreferenceMonitors)` failure had no in-place rerun. `ThemeSettingsPanelContent` displayed terminal text. New retry generation + synchronous single-flight admission, loading/error distinction, native subscription disposal and existing user save semantics preserved.
2. `WindowsShortcutSettingsPanel` had a terminal unavailable message saying to retry but no Retry button. New initial-read-only retry, synchronous admission and explicit release on both success/failure, preserved global shortcut toggles/diagnostics listener cleanup.
3. `scripts/test-settings-initial-read-retry.mjs` extracts **real production callbacks** using TypeScript AST + VM. Tests positive/blocked retry eligibility (loading, loaded snapshot, no error, concurrent settings save/toggle/retry) and exact effect generation/wiring; imported by existing `scripts/test-ui-preferences.mjs` mandatory frontend preflight.

**Source candidate:** [PR411](https://github.com/MariosGiannakaras/Narro/pull/411), exact head `47b9f3e62629d102585451f6d4b58d908d8ce72e`, run `39769632922` CI **RUNNING / no PASS claimed**; 3 production TSX + 2 script files changed. No new CI job. Local full npm preflight NOT RUN (no checkout/node_modules in this tool environment).

**Acceptance:** CI, guarded merge, resulting-main validation and native Windows physical PASS all **PENDING/NOT RUN**. Does not modify Spectrum Core Create/Edit List picker, upload, 218 icons, persisted schema, timer, native PR389, PA-01–09 or opt-in M11/M12. Native PR389 physical 4/8 FAIL remains other-owned.

**Next:** PR410 exact candidate first after 3/3 Windows success or diagnose actual failure; independently reconcile PR411 CI. 5/5 fixed-scope code groups from PR410 (3) + PR411 (2) coded; 5 remain full-source accepted only after CI/merge/main evidence.
