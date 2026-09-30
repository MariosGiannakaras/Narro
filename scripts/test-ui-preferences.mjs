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
  reminderService,
  scheduleReminderEffects,
  timerService,
  packageText,
] = await Promise.all([
  read("src-tauri/src/preference_settings.rs"),
  read("src-tauri/src/lib.rs"),
  read("src-tauri/src/domain/preferences.rs"),
  read("src/preferencesApi.ts"),
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
  read("src/focus.tsx"),
  read("src/FocusCompletionSuccess.tsx"),
  read("src/themeSettingsVisualFixture.tsx"),
  read("scripts/capture-theme-settings-fixtures.ps1"),
  read("scripts/validate-theme-settings-captures.mjs"),
  read("src/preferenceSettingsSections.css"),
  read("src-tauri/src/reminder_service.rs"),
  read("src-tauri/src/persistence/schedule_reminder_effects.rs"),
  read("src-tauri/src/timer_service.rs"),
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
invariant(lib.includes("preference_settings::get_preference_settings"), "Preferences read command is not registered");
invariant(lib.includes("preference_settings::update_preference_settings"), "Preferences update command is not registered");
invariant(domain.includes("pub const PREFERENCES_SCHEMA_VERSION: u32 = 3"), "Preferences must remain on the validated v3 payload");

for (const needle of [
  'invoke<PreferenceSettingsSnapshot>("get_preference_settings")',
  'invoke<PreferenceSettingsSnapshot>("update_preference_settings"',
  'invoke<MonitorDescriptor[]>("list_monitors")',
]) {
  invariant(api.includes(needle), `renderer Preferences API is missing ${needle}`);
}
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

invariant(
  timerService.includes("notification_alerts_enabled_best_effort")
    && timerService.includes("record.payload.alerts.notification_alerts_enabled")
    && timerService.includes("submit_claimed_notifications(app_handle, effects_connection, pending)"),
  "Notification Alerts must gate the existing authoritative Pomodoro notification delivery path",
);
invariant(
  timerService.indexOf("let pending = claim_notifications_best_effort")
    < timerService.indexOf("submit_claimed_notifications(app_handle, effects_connection, pending)"),
  "Pomodoro boundary notifications must remain durably claimed before preference-gated submission",
);
invariant(
  timerService.includes("notification_alert_gate_defaults_off_and_tracks_persisted_preference"),
  "Notification Alerts preference gate needs a Rust regression test",
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
invariant(sections.includes("Preview unavailable"), "sound rows must expose explicit unavailable preview feedback");
invariant(!/https?:\/\//.test(sections), "Preferences must not introduce remote sound/media dependencies");
invariant(
  sections.includes("disabled={busy || !snapshot.focus.pomodoroEnabled}")
    && sections.includes("disabled={busy || !snapshot.alerts.timedAlertsEnabled}")
    && sections.includes("disabled={busy || !snapshot.alerts.scheduleRemindersEnabled}")
    && sections.includes("disabled={busy || !snapshot.celebration.showSuccessScreen}"),
  "nested Preferences must remain mounted and disable from their parent without scroll-jump remounting",
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
invariant(focusRoot.includes("startNextTaskFromSuccess"), "Focus root must own the explicit success-screen Next Task transition");
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
invariant(pkg.scripts["preflight:frontend"].includes("npm run test:ui-preferences"), "frontend preflight must include Preferences contracts");
invariant(pkg.scripts["preflight:frontend"].includes("npm run test:est-title-parser"), "frontend preflight must include EST parser tests");

console.log("M8 Preferences contracts passed.");
