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

export async function presentFocusPanel(): Promise<void> {
  await invoke<void>("focus_surface_mode_panel");
  await invoke<void>("focus_surface_focus");
}
