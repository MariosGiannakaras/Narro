import type { TimerSnapshot } from "./timerSessionApi";

export type FocusTimerPresentation = {
  text: string;
  label: string;
  mode: string;
};

export function formatTimerClock(milliseconds: number | null, rounding: "ceil" | "floor"): string {
  if (milliseconds === null || !Number.isFinite(milliseconds) || milliseconds < 0) return "--:--";
  const seconds = rounding === "ceil" ? Math.ceil(milliseconds / 1_000) : Math.floor(milliseconds / 1_000);
  if (!Number.isSafeInteger(seconds)) return "--:--";

  const hours = Math.floor(seconds / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  const remainingSeconds = seconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function focusTimerStateLabel(timer: TimerSnapshot): string {
  switch (timer.state) {
    case "running":
      return timer.mode?.kind === "pomodoro" ? "Pomodoro work" : "Running";
    case "paused":
      return timer.mode?.kind === "pomodoro" ? "Pomodoro paused" : "Paused";
    case "break":
      return timer.break_kind === "pomodoro" ? "Pomodoro break" : "Break";
    case "time_up":
      return "Time's Up";
    case "overtime_running":
      return "Overtime";
    case "overtime_paused":
      return "Overtime paused";
    case "idle":
      return "Idle";
  }
}

export function focusTimerPresentation(timer: TimerSnapshot): FocusTimerPresentation {
  const mode = timer.mode?.kind ?? "none";
  const stateLabel = focusTimerStateLabel(timer);

  if (timer.state === "break") {
    const text = formatTimerClock(timer.break_remaining_ms, "ceil");
    return { text, label: `${stateLabel}: ${text} remaining`, mode };
  }
  if (timer.state === "time_up") {
    return { text: "00:00", label: "Time's Up", mode };
  }
  if (timer.state === "overtime_running" || timer.state === "overtime_paused") {
    const text = `+${formatTimerClock(timer.overtime_ms, "floor")}`;
    return { text, label: `${stateLabel}: ${text}`, mode };
  }
  if (timer.mode?.kind === "count_up") {
    const text = formatTimerClock(timer.work_elapsed_ms, "floor");
    return { text, label: `${stateLabel}: ${text} elapsed`, mode };
  }

  const text = formatTimerClock(timer.countdown_remaining_ms, "ceil");
  return { text, label: `${stateLabel}: ${text} remaining`, mode };
}
