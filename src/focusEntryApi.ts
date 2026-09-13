import { invoke } from "@tauri-apps/api/core";
import { systemDisplayTimezone } from "./listBoardApi";
import type { TimerSessionPayload } from "./timerSessionApi";

export type StartBlitzOutcome =
  | { status: "started"; taskId: string; timer: TimerSessionPayload }
  | { status: "already_active"; taskId: string; timer: TimerSessionPayload }
  | { status: "no_eligible_today_tasks" };

export function startBlitz(): Promise<StartBlitzOutcome> {
  return invoke<StartBlitzOutcome>("start_blitz", {
    displayTimezone: systemDisplayTimezone(),
  });
}

export function presentFocusPanel(): Promise<void> {
  return invoke<void>("present_focus_panel");
}
