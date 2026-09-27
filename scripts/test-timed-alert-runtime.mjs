import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function read(relativePath) {
  return fs.readFile(path.join(root, relativePath), "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Timed-alert runtime contract failed: ${message}`);
}

const [
  migration,
  persistence,
  timerService,
  eventContract,
  rendererApi,
  preferences,
  packageText,
] = await Promise.all([
  read("src-tauri/migrations/0009_timed_alert_effects.sql"),
  read("src-tauri/src/persistence/timed_alert_effects.rs"),
  read("src-tauri/src/timer_service.rs"),
  read("src-tauri/src/domain/timed_alert_events.rs"),
  read("src/timedAlertApi.ts"),
  read("src-tauri/src/domain/preferences.rs"),
  read("package.json"),
]);

for (const table of ["timed_alert_runs", "timed_alert_effects"]) {
  invariant(migration.includes(`CREATE TABLE ${table}`), `${table} migration is missing`);
}
invariant(
  migration.includes("PRIMARY KEY (run_id, boundary_seconds)"),
  "timed-alert effect identity must be unique per run/boundary",
);
invariant(
  migration.includes("task_id TEXT PRIMARY KEY") && migration.includes("ON DELETE CASCADE"),
  "timed-alert run must remain task-owned and cascade on permanent delete",
);

for (const field of ["timed_alerts_enabled", "task_alert_interval_seconds"]) {
  invariant(preferences.includes(field), `persisted preference ${field} is missing`);
}

for (const needle of [
  "observe_timed_alert_run",
  "claim_pending_timed_alerts",
  "retire_timed_alert_run",
  "next_boundary(work_elapsed_seconds, interval_seconds)",
  "cursor.interval_seconds != interval_seconds",
  "WorkElapsedMovedBackwards",
]) {
  invariant(persistence.includes(needle), `timed-alert persistence is missing ${needle}`);
}

invariant(
  persistence.includes("while boundary <= work_elapsed_seconds"),
  "delayed observation must materialize every elapsed interval boundary",
);
invariant(
  persistence.includes("ON CONFLICT(run_id, boundary_seconds) DO NOTHING"),
  "repeated observation must remain idempotent",
);
invariant(
  persistence.includes("cursor_survives_database_reopen_and_delayed_observation_stays_idempotent"),
  "timed-alert recovery regression coverage is missing",
);
invariant(
  persistence.includes("enabling_or_changing_interval_does_not_backfill_old_work"),
  "enable/interval changes must not backfill historical work",
);

invariant(
  timerService.includes("payload.runtime.timer.work_elapsed_ms / 1_000"),
  "TimerService must derive timed-alert progress from authoritative work elapsed",
);
invariant(
  timerService.includes("get_preferences(effects_connection)")
    && timerService.includes("preferences.alerts.timed_alerts_enabled")
    && timerService.includes("preferences.alerts.task_alert_interval_seconds"),
  "TimerService must consume persisted timed-alert Preferences",
);
invariant(
  timerService.includes("reconcile_timed_alert_transition_best_effort")
    && timerService.includes("TimerSessionChange::Started")
    && timerService.includes("TimerSessionChange::TaskSwitched")
    && timerService.includes("TimerSessionChange::TaskCompleted")
    && timerService.includes("TimerSessionChange::TaskSkipped"),
  "timed-alert run lifecycle must follow authoritative task transitions",
);
invariant(
  !timerService.includes("setInterval("),
  "authoritative timed-alert generation must not be renderer/poll-interval owned",
);

invariant(
  eventContract.includes('TIMED_ALERT_EFFECT_EVENT_NAME: &str = "timed-alert-effect"'),
  "Rust timed-alert event name is missing",
);
invariant(
  rendererApi.includes('TIMED_ALERT_EFFECT_EVENT_NAME = "timed-alert-effect"')
    && rendererApi.includes("listen<TimedAlertEffectPayload>")
    && rendererApi.includes("boundarySeconds"),
  "renderer typed timed-alert effect listener is missing",
);
for (const forbidden of ["Audio(", "Notification", "flash", "setTimeout(", "setInterval("]) {
  invariant(
    !rendererApi.includes(forbidden),
    `PREF-R01 renderer boundary must not prematurely implement ${forbidden}`,
  );
}

const pkg = JSON.parse(packageText);
invariant(
  pkg.scripts["test:timed-alert-runtime"] === "node scripts/test-timed-alert-runtime.mjs",
  "timed-alert contract script registration differs",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:timed-alert-runtime"),
  "frontend preflight must include timed-alert runtime contracts",
);

console.log("Timed-alert runtime contracts: PASS");
