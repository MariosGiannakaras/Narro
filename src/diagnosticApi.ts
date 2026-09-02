export type AppStatePayload = {
  active_task: string | null;
  is_running: boolean;
  counter: number;
  revision: number;
};

export type CommandErrorPayload = {
  code: string;
  message: string;
};

export type DiagnosticCommand =
  | "main_window_hide"
  | "main_window_show"
  | "main_window_focus"
  | "main_window_destroy"
  | "main_window_recreate"
  | "main_window_close"
  | "focus_surface_show"
  | "focus_surface_hide"
  | "focus_surface_focus"
  | "focus_surface_mode_panel"
  | "focus_surface_mode_timer";

function isCommandErrorPayload(value: unknown): value is CommandErrorPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.code === "string" && typeof candidate.message === "string";
}

export function formatInvokeError(error: unknown): string {
  if (isCommandErrorPayload(error)) {
    return `[${error.code}] ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error) ?? "Unknown command failure";
  } catch {
    return "Unknown command failure";
  }
}

export function applyNewerState(
  current: AppStatePayload | null,
  incoming: AppStatePayload,
): AppStatePayload {
  if (current === null || incoming.revision > current.revision) {
    return incoming;
  }
  return current;
}
