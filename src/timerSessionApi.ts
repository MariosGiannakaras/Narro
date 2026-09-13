import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export const TIMER_SESSION_EVENT_NAME = "timer-session-changed";
const LIVE_TIMER_SAMPLE_INTERVAL_MS = 1_000;

export type TimerStateKind =
  | "idle"
  | "running"
  | "paused"
  | "break"
  | "time_up"
  | "overtime_running"
  | "overtime_paused";

export type BreakKind = "manual" | "pomodoro";

export type TimerMode =
  | { kind: "count_up" }
  | { kind: "est_countdown"; est_ms: number }
  | { kind: "pomodoro"; work_ms: number; break_ms: number };

export type TimerSnapshot = {
  state: TimerStateKind;
  task_id: string | null;
  mode: TimerMode | null;
  work_elapsed_ms: number;
  total_break_ms: number;
  countdown_remaining_ms: number | null;
  overtime_ms: number;
  break_kind: BreakKind | null;
  break_remaining_ms: number | null;
};

export type TimerRuntimeSnapshot = {
  timer: TimerSnapshot;
  open_session_id: string | null;
};

export type TimerSessionChange =
  | { type: "started"; task_id: string; session_id: string }
  | { type: "paused" }
  | { type: "resumed" }
  | { type: "extended" }
  | {
      type: "manual_break_started";
      closed_work_session_id: string;
      break_session_id: string;
    }
  | {
      type: "break_finished";
      closed_break_session_id: string;
      work_session_id: string;
    }
  | {
      type: "break_skipped";
      closed_break_session_id: string;
      work_session_id: string;
    }
  | { type: "task_completed"; task_id: string; closed_session_id: string }
  | { type: "task_skipped"; task_id: string; closed_session_id: string }
  | {
      type: "task_switched";
      previous_task_id: string;
      current_task_id: string;
      previous_session_id: string;
      current_session_id: string;
    }
  | { type: "estimate_rebased"; task_id: string; est_seconds: number | null }
  | { type: "time_taken_rebased"; task_id: string; total_seconds: number }
  | {
      type: "automatic_boundary";
      previous_state: TimerStateKind;
      current_state: TimerStateKind;
      closed_session_id: string | null;
      opened_session_id: string | null;
    };

export type TimerSessionPayload = {
  revision: number;
  runtime: TimerRuntimeSnapshot;
  awaitingResume: boolean;
  change: TimerSessionChange | null;
};

export type SetPausedTimerEstimateRequest = {
  taskId: string;
  listId: string;
  expectedEstSeconds: number | null;
  estSeconds: number | null;
};

export type SetPausedTimerTimeTakenRequest = {
  taskId: string;
  expectedTotalSeconds: string;
  totalSeconds: number;
};

export function applyTimerSessionProjection(
  current: TimerSessionPayload | null,
  incoming: TimerSessionPayload,
): TimerSessionPayload {
  if (current === null || incoming.revision >= current.revision) {
    return incoming;
  }
  return current;
}

function timerStateNeedsLiveSampling(state: TimerStateKind): boolean {
  return state === "running" || state === "break" || state === "overtime_running";
}

export async function connectTimerSessionProjection(
  onPayload: (payload: TimerSessionPayload) => void,
): Promise<() => void> {
  const unlisten = await listen<TimerSessionPayload>(TIMER_SESSION_EVENT_NAME, (event) => {
    onPayload(event.payload);
  });

  try {
    const snapshot = await invoke<TimerSessionPayload>("timer_session_snapshot");
    onPayload(snapshot);
    return unlisten;
  } catch (error: unknown) {
    unlisten();
    throw error;
  }
}

export async function connectLiveTimerSessionProjection(
  onPayload: (payload: TimerSessionPayload) => void,
  onSampleError?: (error: unknown) => void,
): Promise<() => void> {
  let disposed = false;
  let latest: TimerSessionPayload | null = null;
  let sampleTimeout: number | null = null;

  function clearSample(): void {
    if (sampleTimeout !== null) {
      window.clearTimeout(sampleTimeout);
      sampleTimeout = null;
    }
  }

  function scheduleSample(): void {
    clearSample();
    if (disposed || latest === null || !timerStateNeedsLiveSampling(latest.runtime.timer.state)) {
      return;
    }

    sampleTimeout = window.setTimeout(() => {
      sampleTimeout = null;
      void invoke<TimerSessionPayload>("timer_session_snapshot")
        .then((snapshot) => {
          if (disposed) return;
          accept(snapshot);
        })
        .catch((error: unknown) => {
          if (disposed) return;
          onSampleError?.(error);
          scheduleSample();
        });
    }, LIVE_TIMER_SAMPLE_INTERVAL_MS);
  }

  function accept(incoming: TimerSessionPayload): void {
    latest = applyTimerSessionProjection(latest, incoming);
    onPayload(incoming);
    scheduleSample();
  }

  const unlisten = await listen<TimerSessionPayload>(TIMER_SESSION_EVENT_NAME, (event) => {
    if (!disposed) accept(event.payload);
  });

  try {
    accept(await invoke<TimerSessionPayload>("timer_session_snapshot"));
  } catch (error: unknown) {
    disposed = true;
    clearSample();
    unlisten();
    throw error;
  }

  return () => {
    disposed = true;
    clearSample();
    unlisten();
  };
}

export async function resumeTimer(): Promise<TimerSessionPayload> {
  return invoke<TimerSessionPayload>("timer_resume");
}

export function setPausedTimerEstimate(
  request: SetPausedTimerEstimateRequest,
): Promise<TimerSessionPayload> {
  return invoke<TimerSessionPayload>("timer_set_estimate", request);
}

export function setPausedTimerTimeTaken(
  request: SetPausedTimerTimeTakenRequest,
): Promise<TimerSessionPayload> {
  return invoke<TimerSessionPayload>("timer_set_time_taken", request);
}
