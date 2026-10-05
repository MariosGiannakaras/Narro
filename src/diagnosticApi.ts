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

export type ShortcutErrorSnapshot = {
  code: string;
  message: string;
};

export type ShortcutDiagnostics = {
  observerInstalled: boolean;
  registered: boolean;
  chord: string;
  triggerCount: number;
  revision: number;
  lastError: ShortcutErrorSnapshot | null;
  focusToggleRegistered: boolean;
  focusToggleChord: string;
  focusToggleTriggerCount: number;
  focusToggleLastError: ShortcutErrorSnapshot | null;
  findTimerRegistered: boolean;
  findTimerChord: string;
  findTimerTriggerCount: number;
  findTimerLastError: ShortcutErrorSnapshot | null;
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

export type FocusPanelPlacementProbe = {
  monitor: MonitorDescriptor;
  side: FocusPanelSide;
  expectedPosition: PhysicalPoint;
  actualPosition: PhysicalPoint;
  actualSize: PhysicalSize;
  visible: boolean;
  presentation: "panel" | "timerCompact" | "timerExpanded" | "unknown";
  edgeAligned: boolean;
  fullyWithinWorkArea: boolean;
  pass: boolean;
};

export type DiagnosticStoragePaths = {
  identifier: string;
  appDataDir: string;
  appLocalDataDir: string;
  isolationPass: boolean;
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

export type ShortcutCommand = "global_shortcut_register" | "global_shortcut_unregister";
export type FocusShortcutKind = "toggle" | "findTimer";

export function isCommandErrorPayload(value: unknown): value is CommandErrorPayload {
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

/** Keep a failed retry from leaving a stale generic error after a concurrent success. */
export function focusShortcutRetryError(
  failure: unknown,
  latest: ShortcutDiagnostics,
  kind: FocusShortcutKind,
): string | null {
  const registered = kind === "toggle" ? latest.focusToggleRegistered : latest.findTimerRegistered;
  const reported = kind === "toggle" ? latest.focusToggleLastError : latest.findTimerLastError;
  return registered || reported ? null : formatInvokeError(failure);
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

export function applyNewerShortcutDiagnostics(
  current: ShortcutDiagnostics | null,
  incoming: ShortcutDiagnostics,
): ShortcutDiagnostics {
  if (current === null || incoming.revision > current.revision) {
    return incoming;
  }
  return current;
}

type PersistedMonitorIdentity = {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

function parseMonitorKeyInteger(
  value: string,
  minimum: number,
  maximum: number,
): number | null {
  if (!/^-?\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null;
}

function parsePersistedMonitorIdentity(monitorKey: string): PersistedMonitorIdentity | null {
  const parts = monitorKey.split("|");
  if (parts.length < 10) return null;

  const scaleBits = parts.pop();
  const workHeight = parts.pop();
  const workWidth = parts.pop();
  const workY = parts.pop();
  const workX = parts.pop();
  const height = parts.pop();
  const width = parts.pop();
  const y = parts.pop();
  const x = parts.pop();
  if (
    scaleBits === undefined
    || workHeight === undefined
    || workWidth === undefined
    || workY === undefined
    || workX === undefined
    || height === undefined
    || width === undefined
    || y === undefined
    || x === undefined
    || !/^[0-9a-fA-F]{16}$/.test(scaleBits)
  ) {
    return null;
  }

  if (
    parseMonitorKeyInteger(workHeight, 0, 0xffff_ffff) === null
    || parseMonitorKeyInteger(workWidth, 0, 0xffff_ffff) === null
    || parseMonitorKeyInteger(workY, -0x8000_0000, 0x7fff_ffff) === null
    || parseMonitorKeyInteger(workX, -0x8000_0000, 0x7fff_ffff) === null
  ) {
    return null;
  }

  const parsedHeight = parseMonitorKeyInteger(height, 0, 0xffff_ffff);
  const parsedWidth = parseMonitorKeyInteger(width, 0, 0xffff_ffff);
  const parsedY = parseMonitorKeyInteger(y, -0x8000_0000, 0x7fff_ffff);
  const parsedX = parseMonitorKeyInteger(x, -0x8000_0000, 0x7fff_ffff);
  if (parsedHeight === null || parsedWidth === null || parsedY === null || parsedX === null) {
    return null;
  }

  return {
    name: parts.join("|"),
    x: parsedX,
    y: parsedY,
    width: parsedWidth,
    height: parsedHeight,
  };
}

export function monitorMatchesSelectionKey(
  monitor: MonitorDescriptor,
  monitorKey: string,
): boolean {
  if (monitor.key === monitorKey) return true;

  const saved = parsePersistedMonitorIdentity(monitorKey);
  return saved !== null
    && saved.name === (monitor.name ?? "")
    && saved.x === monitor.position.x
    && saved.y === monitor.position.y
    && saved.width === monitor.size.width
    && saved.height === monitor.size.height;
}

export function isValidMonitorSelection(
  monitorKey: string | null,
  monitors: readonly MonitorDescriptor[],
): monitorKey is string {
  return (
    monitorKey !== null
    && monitorKey.length > 0
    && monitors.some((monitor) => monitorMatchesSelectionKey(monitor, monitorKey))
  );
}

export function findSelectedMonitor(
  monitorKey: string | null,
  monitors: readonly MonitorDescriptor[],
): MonitorDescriptor | null {
  if (monitorKey === null || monitorKey.length === 0) {
    return null;
  }
  return monitors.find((monitor) => monitorMatchesSelectionKey(monitor, monitorKey)) ?? null;
}

export function formatMonitorLabel(monitor: MonitorDescriptor): string {
  const name = monitor.name?.trim() || `Monitor ${monitor.index + 1}`;
  const scalePercent = Math.round(monitor.scaleFactor * 100);
  return `${monitor.index}: ${name} — ${monitor.size.width}×${monitor.size.height} @ ${scalePercent}%`;
}
