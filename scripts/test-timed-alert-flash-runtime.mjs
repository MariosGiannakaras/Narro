import fs from "node:fs";

function invariant(condition, message) {
  if (!condition) throw new Error(`Timed-alert flash runtime contract failed: ${message}`);
}

const runtime = fs.readFileSync("src/TimedAlertFlashRuntime.tsx", "utf8");
const css = fs.readFileSync("src/timedAlertFlash.css", "utf8");
const focus = fs.readFileSync("src/focus.tsx", "utf8");
const panel = fs.readFileSync("src/FocusPanel.tsx", "utf8");
const floating = fs.readFileSync("src/FloatingTimerFoundation.tsx", "utf8");
const timedAlertApi = fs.readFileSync("src/timedAlertApi.ts", "utf8");
const packageJson = fs.readFileSync("package.json", "utf8");

for (const required of [
  "connectTimedAlertEffects",
  "usePreferenceSettingsProjection",
  "settings?.alerts.timedAlertsEnabled",
  "settings.alerts.animatedTimerFlash",
  'REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"',
  "effect.taskId",
  "FLASH_DURATION_MS = 560",
  "window.setTimeout(clearFlash, FLASH_DURATION_MS)",
  "target.classList.remove(FLASH_ACTIVE_CLASS)",
  "target.classList.add(FLASH_ACTIVE_CLASS)",
  'reducedMotion.addEventListener("change", handleReducedMotionChange)',
]) {
  invariant(runtime.includes(required), `runtime is missing ${required}`);
}
invariant(!runtime.includes("setInterval("), "flash must be finite and event-driven, never interval-driven");
invariant(
  timedAlertApi.includes('TIMED_ALERT_EFFECT_EVENT_NAME = "timed-alert-effect"'),
  "runtime must reuse the authoritative PREF-R01 timed-alert event",
);
invariant(
  panel.includes("data-timed-alert-flash-task-id={liveTask.id}"),
  "Focus Panel live timer must bind the flash target to the authoritative live task id",
);
invariant(
  floating.includes("data-timed-alert-flash-task-id={liveTaskId ?? undefined}"),
  "Floating Timer must bind the flash target to its authoritative live task id projection",
);
invariant(
  focus.includes('import { TimedAlertFlashRuntime } from "./TimedAlertFlashRuntime"')
    && focus.includes("<TimedAlertFlashRuntime />"),
  "Focus product root must mount exactly one flash runtime consumer",
);
for (const required of [
  "@keyframes narro-timed-alert-flash",
  "animation: narro-timed-alert-flash 560ms var(--motion-ease-enter) 1 both",
  "@media (prefers-reduced-motion: reduce)",
  "animation: none !important",
]) {
  invariant(css.includes(required), `flash CSS is missing ${required}`);
}
invariant(
  packageJson.includes('"test:timed-alert-flash-runtime"')
    && packageJson.includes("npm run test:timed-alert-flash-runtime"),
  "frontend preflight must include the PREF-R02 flash contract",
);
console.log("Timed-alert flash runtime contracts passed.");
