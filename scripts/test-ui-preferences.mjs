import { readFile } from "node:fs/promises";

function invariant(condition, message) {
  if (!condition) throw new Error(`M8 Preferences contract failed: ${message}`);
}

async function read(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

const [
  rust,
  lib,
  domain,
  api,
  diagnosticApi,
  runtime,
  sections,
  themePanel,
  liveActions,
  focusPanel,
  liveMetrics,
  taskCard,
  listBoard,
  searchPalette,
  parser,
  focusRoot,
  completionSuccess,
  fixture,
  capture,
  validator,
  css,
  soundControl,
  soundCatalog,
  reminderService,
  scheduleReminderEffects,
  packageText,
] = await Promise.all([
  read("src-tauri/src/preference_settings.rs"),
  read("src-tauri/src/lib.rs"),
  read("src-tauri/src/domain/preferences.rs"),
  read("src/preferencesApi.ts"),
  read("src/diagnosticApi.ts"),
  read("src/PreferenceSettingsRuntime.tsx"),
  read("src/PreferenceSettingsSections.tsx"),
  read("src/ThemeSettingsPanel.tsx"),
  read("src/FocusLiveActions.tsx"),
  read("src/FocusPanel.tsx"),
  read("src/FocusLiveMetrics.tsx"),
  read("src/TaskCard.tsx"),
  read("src/ListBoard.tsx"),
  read("src/SearchPalette.tsx"),
  read("src/taskEstimateParser.ts"),
  read("src/FocusSurfaceCoordinator.tsx"),
  read("src/FocusCompletionSuccess.tsx"),
  read("src/themeSettingsVisualFixture.tsx"),
  read("scripts/capture-theme-settings-fixtures.ps1"),
  read("scripts/validate-theme-settings-captures.mjs"),
  read("src/preferenceSettingsSections.css"),
  read("src/SoundPreferenceControl.tsx"),
  read("src/localSoundCatalog.ts"),
  read("src-tauri/src/reminder_service.rs"),
  read("src-tauri/src/persistence/schedule_reminder_effects.rs"),
  read("package.json"),
]);

for (const needle of [
  "pub struct PreferenceSettingsSnapshot",
  "pub struct PreferenceSettingsPatch",
  "mutate_preferences(&mut connection",
  "PREFERENCES_GATE",
  "PREFERENCES_CHANGED_EVENT",
  "previous_autostart",
  "restore_autostart",
  "saved open-on-login preference does not match Windows autostart state",
]) {
  invariant(rust.includes(needle), `Rust Preferences boundary is missing ${needle}`);
}
invariant(
  rust.indexOf("let saved = mutate_preferences") < rust.indexOf("app_handle.emit(PREFERENCES_CHANGED_EVENT"),
  "Preferences event must be emitted only after persistence commits",
);
invariant(lib.includes("pub mod preference_settings;"), "Preferences Rust module is not registered");
const modalSource = await read("src/PreferencesDialog.tsx");
const modalCss = await read("src/preferencesDialog.css");
const shellSource = await read("src/AppShell.tsx");
invariant(shellSource.includes("setPreferencesOpen(true)"), "full Preferences opens as overlay, not a route replacement");
invariant(modalSource.includes('role="dialog"'), "full Preferences has native dialog semantics");
invariant(modalSource.includes('aria-modal="true"'), "full Preferences traps focus and owns input");
invariant(modalSource.includes('aria-labelledby="theme-settings-title"'), "dialog labels current Preferences heading");
invariant(modalCss.includes("overflow-y: auto"), "full Preferences has bounded internal scroll");
invariant(modalSource.includes("openerRef.current?.focus()"), "full Preferences returns focus to utility opener");

invariant(lib.includes("preference_settings::get_preference_settings"), "Preferences read command is not registered");
invariant(lib.includes("preference_settings::update_preference_settings"), "Preferences update command is not registered");
invariant(domain.includes("pub const PREFERENCES_SCHEMA_VERSION: u32 = 5"), "independent success sound toggle must use versioned v5 payload");

for (const needle of [
  'invoke<PreferenceSettingsSnapshot>("get_preference_settings")',
  'invoke<PreferenceSettingsSnapshot>("update_preference_settings"',
  'invoke<MonitorDescriptor[]>("list_monitors")',
]) {
  invariant(api.includes(needle), `renderer Preferences API is missing ${needle}`);
}
invariant(
  diagnosticApi.includes("parsePersistedMonitorName")
    && diagnosticApi.includes("const compatible = monitors.filter")
    && diagnosticApi.includes("compatible.length === 1")
    && diagnosticApi.includes("findSelectedMonitor"),
  "monitor selection must preserve physical-display identity across DPI/work-area descriptor changes",
);
invariant(
  sections.includes("findSelectedMonitor(selected, monitors)")
    && sections.includes("__saved_monitor_unavailable__")
    && sections.includes("Saved display unavailable"),
  "Preferences must resolve DPI-compatible monitor keys and expose a distinct stale value so Automatic can clear it",
);
invariant(runtime.includes("PREFERENCES_CHANGED_EVENT"), "Preferences runtime must consume cross-window committed updates");
invariant(!runtime.includes("setInterval("), "Preferences runtime must not poll");
invariant(runtime.includes("setSnapshot(await getPreferenceSettings())"), "failed writes must refresh authoritative Preferences");

invariant(
  reminderService.includes("schedule_reminders_enabled")
    && reminderService.includes("reminder_lead_seconds")
    && reminderService.includes("dispatch_schedule_preference_due_with"),
  "Schedule-reminder Preferences must drive the authoritative background reminder service",
);
invariant(
  scheduleReminderEffects.includes("schedule_preference_reminder_effects")
    && scheduleReminderEffects.includes("ON CONFLICT(task_id, scheduled_local_date, scheduled_local_time, timezone) DO NOTHING"),
  "Schedule-reminder Preferences must use a durable idempotent effect ledger",
);

for (const label of [
  "Blitz Panel",
  "Monitor",
  "Panel side",
  "Start with Windows",
  "Hide EST / Time Taken",
  "Auto-parse EST from title",
  "Timezone",
  "Blitz Mode",
  "Pomodoros",
  "Default break length",
  "Scrolling title on live timer",
  "Alerts",
  "Timed alerts during a task",
  "Animated flash on timer",
  "Notification alerts",
  "Schedule reminders",
  "Celebration",
  "Show success screen",
  "Fun GIF",
  "Success sound",
]) {
  invariant(sections.includes(label), `Preferences surface is missing ${label}`);
}
invariant(sections.includes("SoundPreferenceControl"), "sound rows must use the shared local preview/volume control");
for (const field of [
  "taskAlertSound",
  "taskAlertVolumePercent",
  "notificationSound",
  "notificationVolumePercent",
  "successSound",
  "successSoundEnabled",
  "successSoundVolumePercent",
]) {
  const rustField = field === "successSoundEnabled" ? "success_sound_enabled" : field;
  invariant(api.includes(field) && rust.includes(rustField), `typed sound preference field ${field} must cross Rust/renderer boundaries`);
}
for (const label of ["Futuristic Ding", "Melodic Bell", "Quick Chime", "Victory Bell"]) {
  invariant(soundCatalog.includes(label), `local sound catalog is missing ${label}`);
}
invariant(soundControl.includes('type="range"'), "sound control must expose the evidenced volume affordance");
invariant(sections.includes('label="Success sound effect"'), "source independent success sound switch");
invariant(sections.includes('onChange={(successSoundEnabled) => onSave('), "success sound switch must persist separately");
invariant(sections.includes('!snapshot.celebration.successSoundEnabled'), "sound preview is gated when sound switch off");
invariant(domain.includes("legacy_v4_payload_without_success_sound_toggle_preserves_implicit_on"), "old stored Preferences preserve former implicit sound");
invariant(runtime.includes('"successSoundEnabled"'), "independent toggle has its own pending mutation key");
invariant(soundControl.includes("playLocalSoundPreview"), "sound control must expose local preview playback");
invariant(soundCatalog.includes("stopLocalSoundPlayback();"), "new local sound playback must stop the previous playback before starting");
invariant(!/https?:\/\//.test(soundCatalog), "local sound catalog must not contain remote media dependencies");
invariant(!/fetch\s*\(/.test(soundCatalog), "local sound catalog must not fetch media");
invariant(!/https?:\/\//.test(sections), "Preferences must not introduce remote sound/media dependencies");
for (const parent of [
  "snapshot.focus.pomodoroEnabled ? (",
  "snapshot.alerts.timedAlertsEnabled ? (",
  "snapshot.alerts.notificationAlertsEnabled ? (",
  "snapshot.alerts.scheduleRemindersEnabled ? (",
  "snapshot.celebration.showSuccessScreen ? (",
]) {
  invariant(sections.includes(parent), `parent-off Preferences children must be conditionally hidden: ${parent}`);
}
invariant(
  sections.includes("disabled={busy || !snapshot.focus.pomodoroEnabled}")
    && sections.includes("disabled={busy || !snapshot.alerts.timedAlertsEnabled}")
    && sections.includes("disabled={busy || !snapshot.alerts.scheduleRemindersEnabled}")
    && sections.includes("disabled={busy || !snapshot.celebration.showSuccessScreen}"),
  "visible child controls must remain mutation-gated during saves and parent state changes",
);
invariant(themePanel.includes("beforeGeneral") && themePanel.includes("generalChildren"), "Preferences composition slots are missing");

invariant(!liveActions.includes("DEFAULT_MANUAL_BREAK_MS"), "manual break must no longer use the M7 hard-coded default");
invariant(liveActions.includes("startManualBreakTimer(defaultBreakMs)"), "Start Break must use persisted defaultBreakSeconds");
invariant(liveActions.includes("usePreferenceSettingsProjection(fixtureMode)"), "Focus actions must receive live Preferences updates");
invariant(focusPanel.includes("scrollingTitleEnabled = preferences.snapshot?.focus.scrollingTitle"), "Focus scrolling-title preference is not live");
invariant(focusPanel.includes("hideTaskTimes = preferences.snapshot?.general.hideTaskTimes"), "Focus hide-times preference is not live");
invariant(liveMetrics.includes('data-focus-times-hidden={hideTaskTimes ? "true" : "false"}'), "live metrics hide-times contract is missing");
invariant(taskCard.includes('data-task-times-hidden={hideTaskTimes ? "true" : "false"}'), "List task hide-times contract is missing");
invariant(css.includes("@media (prefers-reduced-motion: reduce)"), "Preferences switches need reduced-motion handling");

for (const source of [listBoard, searchPalette, focusPanel]) {
  invariant(source.includes("parseEstimateSuffix"), "all task-create surfaces must use the shared EST parser when enabled");
}
invariant(parser.includes("ESTIMATE_SUFFIX"), "EST suffix parser is missing");
invariant(parser.includes("titleWithoutSuffix"), "EST suffix parser must return the normalized visible title");
for (const source of [listBoard, searchPalette, focusPanel]) {
  invariant(source.includes("titleWithoutSuffix"), "auto-parsed task creation must persist the title without the parsed EST suffix");
}
invariant(liveActions.includes("showSuccessScreen"), "Done must read the persisted success-screen preference");
invariant(liveActions.includes("onCompletionSuccess?.({"), "success-screen-enabled Done must gate next-task start behind success state");
invariant(
  focusRoot.includes("startNextTaskFromSuccess")
    && focusRoot.includes("<FocusCompletionSuccess")
    && focusRoot.includes("onCompletionSuccess={recordCompletionSuccess}"),
  "The single Focus coordinator must own the explicit success-screen Next Task transition for both presentations",
);
invariant(completionSuccess.includes("Next Task"), "success state must expose explicit Next Task");
invariant(completionSuccess.includes("Take a Break"), "success state must expose the directly evidenced Take a Break choice");
invariant(
  listBoard.includes("autoParseEstFromTitle")
    && searchPalette.includes("autoParseEstFromTitle")
    && focusPanel.includes("autoParseEstFromTitle"),
  "auto-parse preference must gate every supported task-create path",
);

for (const state of ["preferences-upper", "preferences-middle", "preferences-lower"]) {
  invariant(capture.includes(state), `Windows capture is missing ${state}`);
  invariant(validator.includes(`theme-settings-${state}`) || validator.includes('["upper", "middle", "lower"]'), `validator is missing ${state}`);
}
invariant(fixture.includes("preferenceSnapshot"), "Preferences visual fixture needs a deterministic snapshot");
invariant(fixture.includes("preferenceMonitors"), "Preferences visual fixture needs deterministic monitors");

const pkg = JSON.parse(packageText);
invariant(pkg.scripts["test:ui-preferences"] === "node scripts/test-ui-preferences.mjs", "Preferences test script registration differs");
invariant(
  pkg.scripts["test:local-sound-catalog"] === "node --experimental-strip-types scripts/test-local-sound-catalog.mjs",
  "local sound catalog test script registration differs",
);
invariant(pkg.scripts["preflight:frontend"].includes("npm run test:ui-preferences"), "frontend preflight must include Preferences contracts");
invariant(pkg.scripts["preflight:frontend"].includes("npm run test:local-sound-catalog"), "frontend preflight must include local sound contracts");
invariant(pkg.scripts["preflight:frontend"].includes("npm run test:est-title-parser"), "frontend preflight must include EST parser tests");

console.log("M8 Preferences contracts passed.");
