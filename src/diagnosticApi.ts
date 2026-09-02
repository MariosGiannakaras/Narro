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

export type FocusPanelSide = "left" | "right";

export type PhysicalPoint = {
  x: number;
  y: number;
};

export type PhysicalSize = {
  width: number;
  height: number;
};

export type PhysicalRect = {
  position: PhysicalPoint;
  size: PhysicalSize;
};

export type MonitorDescriptor = {
  key: string;
  index: number;
  name: string | null;
  scaleFactor: number;
  position: PhysicalPoint;
  size: PhysicalSize;
  workArea: PhysicalRect;
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

export function isValidMonitorSelection(
  monitorKey: string | null,
  monitors: readonly MonitorDescriptor[],
): monitorKey is string {
  return (
    monitorKey !== null &&
    monitorKey.length > 0 &&
    monitors.some((monitor) => monitor.key === monitorKey)
  );
}

export function findSelectedMonitor(
  monitorKey: string | null,
  monitors: readonly MonitorDescriptor[],
): MonitorDescriptor | null {
  if (!isValidMonitorSelection(monitorKey, monitors)) {
    return null;
  }
  return monitors.find((monitor) => monitor.key === monitorKey) ?? null;
}

export function formatMonitorLabel(monitor: MonitorDescriptor): string {
  const name = monitor.name?.trim() || `Monitor ${monitor.index + 1}`;
  const scalePercent = Math.round(monitor.scaleFactor * 100);
  return `${monitor.index}: ${name} — ${monitor.size.width}×${monitor.size.height} @ ${scalePercent}%`;
}
