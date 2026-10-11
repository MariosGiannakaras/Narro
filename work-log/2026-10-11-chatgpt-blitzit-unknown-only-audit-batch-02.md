# Blitzit unknown-only audit — batch 02 (U03)

- **Date:** 2026-10-11, Europe/Athens.
- **Mode:** audit/source-semantics analysis **only**, deliberately bounded to U03 (Success Sound). No Narro implementation, tests, runtime, configurations or other UI features modified. User-owned Create/Edit List, Color Picker and icon palette are **excluded from alteration**.
- **Baseline:** `MariosGiannakaras/Narro` `main` `a65575ffc5d94e219d39c06c341e1cdeace2871f`; existing unrelated open PR #321 not touched.
- **Counters after this batch:** **Audit actions: 4/42 completed** (1 repository/evidence scope discovery + U01–U03 analyses). **Findings reviewed: 3/41**. Same established denominator; no new independently deduplicated U route found.
- **Other tracking changes:** one top-level current checkpoint in `docs/BLITZIT_UNVERIFIED_BEHAVIOR_REGISTER.md`; this immutable log. Did not modify the app's `HANDOFF.md`, `TODO.md`, `STATUS.md`, code, tests, source media, CI or ongoing implementation PR.

## What was inspected

1. **Source provenance:** `docs/BLITZIT_FORENSIC_PASS3_SCREENSHOTS.md` SS-C08/SS-C09; completed `docs/BLITZIT_FORENSIC_PASS3_VIDEOS.md` VE-014 ~01:33–01:52, ~01:56–02:06 and ~02:06–02:28; `docs/BLITZIT_VIDEO_EVIDENCE.md` VE-014; `docs/BLITZIT_HELP_CENTER_EVIDENCE.md`; `docs/BLITZIT_CONTROL_STATE_AUDIT_MATRIX.md` SS-C09-02..07. SS-C09 is direct-current v2.6.69; VE-014 is older demonstration. Completed canonical source records consumed, no new raw MP4/audio review or live-source M11 claims.
2. **Source versus code/tracking:** `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` B9/B18, `docs/UI_UX_SPEC.md` 8.4–8.5, active `TODO.md` M8, `HANDOFF.md`, `STATUS.md`, and prior immutable `work-log/2026-10-09-chatgpt-b9-b17-current-code-reconciliation.md`, `work-log/2026-10-09-chatgpt-b18-merge-b19-fixture-repair-b41-open.md`, `work-log/2026-10-03-chatgpt-m8-pref-r05-pr220-merged-main882-active.md`.
3. **Current implementation:** `src/PreferenceSettingsSections.tsx`, `src/SoundPreferenceControl.tsx`, `src/localSoundCatalog.ts`, `src/PreferenceSettingsRuntime.tsx`, `src/preferencesApi.ts`, `src/FocusLiveActions.tsx`, `src/TimedAlertSoundRuntime.tsx`, `src-tauri/src/domain/preferences.rs`, `src-tauri/src/preference_settings.rs`, `src-tauri/src/persistence/preferences.rs`, `src-tauri/tests/preferences_persistence.rs`.
4. **Existing tests read (not rerun):** `scripts/test-ui-preferences.mjs`, `scripts/test-local-sound-catalog.mjs`, `scripts/test-success-sound-runtime.mjs` and Rust unit/integration tests in the above preference modules. Earlier accepted CI: PREF-R05 #220 exact-head Windows run `37111582864` SUCCESS / merge `45c3218f5923c2ff673d8c1dd562de7545be1ecb`, with separate resulting-main validation previously recorded as green; B18 #262 exact-head Windows run `37861947296` SUCCESS / merge `0ff767115be3a9013e0580c250a32f4f0773f471`. Historical validation proves bounded Narro contract, not audio equality with Blitzit. New tests, build, Windows physical audio capture **NOT RUN**.

## U03 evidence-disposition / cause map

**BLITZIT_CONFIRMED (claim-limited):**
- Current SS-C09 depicts `Celebrate task completion`, `Show success screen`, `Fun gif on success screen` and a separate `Success sound effect` row with its own ON toggle, speaker icon, triangle preview and selected sound truncated `Victory B...`.
- VE-014 explicitly shows `Victory Bell` in the completion sound selector and pointer interaction with preview; a speaker-triggered compact, vertical green-accent volume popover is directly demonstrated for sound rows. Fun GIF is a separately conditional child of Show Success Screen. The sound row is sibling-capability, not a GIF property.
- These claims are about **visible controls/states**, not codec, volume scaling, playback ownership, persistence or complete catalog.

**BLITZIT SOURCE_ONLY_UNKNOWN / EVIDENCE_LIMIT:**
- Exact full list of selectable sounds; actual audio/waveforms/licensing/defaults; persistent volume numeric scale/step and whether it is per sound versus per setting; preview restart/interrupt and error treatment.
- Whether finishing a task with `Show success screen = OFF` still plays the independently enabled sound, and exact interplay between the two toggles; what OFF state hides versus disables; selector save-on-change/cancel/reopen semantics.
- Behavior if completion, notification/timed alert and preview overlap; cross-window audio priority; repeated rapid Done; device/audio-init unavailable; actual latency and background/Focus-window audio ownership. Neither canonical still nor VE-014 demonstrates these end-to-end cases.

**Current NARRO_INFERRED_IMPLEMENTED (not certified source behavior):**
- `LowerPreferenceSections` independently exposes `successSoundEnabled` even with `showSuccessScreen=false`; nested Fun GIF is conditional on the screen. The shared `SoundPreferenceControl` has a native select, play preview, speaker-opened vertical slider, keyboard/Escape/close behavior, local error status and pending disables. Preview and volume controls are disabled with sound OFF; enabling/disabling preserves selected sound and volume. Volume patches are 0–100, input step 5 and persist on pointer release/blur/key release.
- `LOCAL_SOUND_OPTIONS` contains four locally synthesized `futuristic-ding`, `melodic-bell`, `quick-chime`, `victory-bell` recipes; offline `AudioContext` generation, no network fetch; chosen `victory-bell` Narro default agrees in label with a demonstrated Blitzit selection, **not** proven same audio or default. In each WebView, local sound playback stops/replaces the prior context via generation guard/cleanup, including preview and event sounds. **It does not establish a single OS-wide cross-window audio owner.**
- Typed Rust v5 preference payload stores success toggle, sound ID and 0–100 volume separately; invalid IDs/URLs/volumes are rejected; SQLite immediate writer transaction validates mutations and preserves unrelated fields. Legacy v4 payload missing toggle decodes ON; legacy v3 missing volumes defaults 100. Runtime pending guard and explicit refresh-on-save-failure prevent falsely claiming persisted preference. Post-commit cross-window event broadcast is best-effort and logs any failure.
- `FocusLiveActions.handleDone` checks expected task/timer state, commits `completeTimerTask()` **before** queuing sound (when saved switch ON), then handles success-screen gate/next-task flow. A failed sound is logged and does not reverse or duplicate committed completion; failure to commit prevents sound. If preference snapshot absent, sound is skipped rather than guessed. This is a coherent Narro-local policy, not direct Blitzit equivalence.
- `playLocalSound` may reject unavailable `AudioContext`; preview surfaces `Preview unavailable`, committed Done logs warning and retains data. Available-catalog snapshot flag is currently a backend constant `true` indicating bundled definitions, **not an actual Windows audio-device health probe**. Actual device-failure UX remains native/unverified, not a demonstrated source bug.

**Tests/coverage limit:**
- Existing static tests assert wiring, post-commit order and separate on/off switch. Fake `AudioContext` exercises same-WebView preview replacement and cleanup; Rust tests assert validation, legacy migration, v5 persistence/reopen and isolated toggle mutations.
- The string `evidence-backed local catalog labels` in `scripts/test-local-sound-catalog.mjs` is a provenance **overstatement** for the *complete* four-entry list: the test verifies the deliberate Narro catalog, not a fully observed Blitzit option inventory. This is a future documentation/assertion-language clarification, **not proof of a user-visible code defect**.
- No new runtime execution/physical speakers/audio playback was observed in this batch. Do not upgrade source visual/sonic parity or native acoustic behavior to PASS.

## Classification and recommendations (analysis only)

- **U03 status:** `BLITZIT_CONFIRMED` controls plus `NARRO_INFERRED_IMPLEMENTED` local sound/persistence/playback semantics plus `SOURCE_AUDIO_INTERACTION_PARITY_OPEN`/physical audio acceptance **OPEN**.
- **Demonstrated new implementation bug:** none attributable to the unknown Blitzit behavior. Previously recorded B9/B18 missing-control claims have been superseded by accepted source/CI integrations; do not reimplement them from an older control-state matrix.
- **Safe local contract if live comparison never occurs:** keep independent saved switch, whitelist local sounds, per-family selected sound and bounded volume, allow preview with real errors, serialize setting changes, play at most once per successfully committed Done, do not touch timer/session ledger on audio failure, retain a single nonoverlapping sound owner **per current WebView**; audio overlap priority across WebViews may be separately specified/tested on future functional work if actually needed.
- **Product decision required?** Not for the currently tested locally inferred sound behavior. Any later request to globally synchronize audio across windows or change when completion sounds fire must be separately scoped and must never be attributed to Blitzit on current evidence.
- **No patch in this audit.** A later separate source-owned task may refine the misleading test provenance wording; separate native Windows/audio checks remain open.
- **NEXT, ONLY WHEN USER INSTRUCTS CONTINUE:** U04 Archived Done trash/delete confirmation, destructive safety, restore/reports/history and source limits. Do not treat visual trash control as proof of Blitzit destructive semantics; flag `PRODUCT_DECISION_REQUIRED` where implementing an unproven irreversible/data-history rule would alter fundamental invariants. No U04 work in this batch.

## Stop

**Audit actions 4/42 completed. Findings reviewed 3/41.** This is the end of batch 02; no next-batch inspection, implementation or CI was started.
