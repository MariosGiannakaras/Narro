import fs from "node:fs";

function invariant(condition, message) {
  if (!condition) throw new Error(`Timed-alert sound contract failed: ${message}`);
}

const runtime = fs.readFileSync("src/TimedAlertSoundRuntime.tsx", "utf8");
const focus = fs.readFileSync("src/focus.tsx", "utf8");
const catalog = fs.readFileSync("src/localSoundCatalog.ts", "utf8");
const timedAlertApi = fs.readFileSync("src/timedAlertApi.ts", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

for (const required of [
  "connectTimedAlertEffects",
  "usePreferenceSettingsProjection",
  "settings?.alerts.timedAlertsEnabled",
  "settings.alerts.taskAlertSound ?? DEFAULT_TASK_ALERT_SOUND",
  "settings.alerts.taskAlertVolumePercent",
  "playLocalSound(soundId",
]) {
  invariant(runtime.includes(required), `runtime is missing ${required}`);
}

invariant(
  runtime.includes("settingsRef.current === null") && runtime.includes("pendingEffectRef.current = effect"),
  "effect arriving before Preferences hydration must remain pending rather than using guessed settings",
);
invariant(
  runtime.includes("stopLocalSoundPlayback()"),
  "disabling/unmounting timed-alert sound must stop active local playback",
);
invariant(
  !runtime.includes("setInterval(") && !runtime.includes("setTimeout("),
  "timed-alert sound must consume authoritative effects without a renderer scheduler",
);
invariant(
  focus.includes("<TimedAlertSoundRuntime />"),
  "persistent Focus surface must mount exactly one timed-alert sound consumer",
);
invariant(
  (focus.match(/<TimedAlertSoundRuntime \/>/g) ?? []).length === 1,
  "timed-alert sound consumer must not be duplicated across Focus presentations",
);
invariant(
  timedAlertApi.includes('TIMED_ALERT_EFFECT_EVENT_NAME = "timed-alert-effect"'),
  "sound runtime must reuse the authoritative PREF-R01 effect boundary",
);
invariant(
  catalog.includes("export async function playLocalSound(")
    && catalog.includes("stopLocalSoundPlayback();"),
  "runtime and preview must share one local sound owner so playback cannot overlap indefinitely",
);
invariant(
  !/https?:\/\//.test(catalog) && !/fetch\s*\(/.test(catalog),
  "runtime sound catalog must remain local-only",
);
invariant(
  pkg.scripts["test:timed-alert-sound-runtime"]
    === "node scripts/test-timed-alert-sound-runtime.mjs",
  "timed-alert sound test registration differs",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:timed-alert-sound-runtime"),
  "frontend preflight must include timed-alert sound contracts",
);

console.log("Timed-alert sound runtime contracts: PASS");
