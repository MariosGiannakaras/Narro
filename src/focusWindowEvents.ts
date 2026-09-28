export const FOCUS_MODE_CHANGED_EVENT = "focus-surface-mode-changed";
export const FOCUS_MODE_REQUEST_EVENT = "focus-surface-mode-requested";
export const TIMER_PRESENTATION_READY_EVENT = "floating-timer-presentation-ready";
export const TIMER_PRESENTATION_QUERY_EVENT = "floating-timer-presentation-query";
export const TIMER_RESIZE_BUSY_EVENT = "floating-timer-resize-busy";

export type TimerPresentationReady = {
  requestId: number;
  revision: number;
  taskId: string | null;
  openSessionId: string | null;
};

export type FocusModeRequest = {
  mode: "panel" | "timer";
  quickTask?: boolean;
};
