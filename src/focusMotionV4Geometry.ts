/** Source-measured native Motion v4 Timer geometry; no mock pixel anchors. */
export type MotionV4Rect = Readonly<{
  x: number; y: number; width: number; height: number;
}>;
export type MotionV4SharedRect = Readonly<{
  from: MotionV4Rect; to: MotionV4Rect;
}>;
export type MotionV4RasterLayout = Readonly<{
  title: MotionV4SharedRect;
  timer: MotionV4SharedRect;
  toolbar: MotionV4SharedRect;
  actions: MotionV4Rect | null;
  rows: readonly MotionV4Rect[];
}>;
export type MotionV4MeasuredTimer = Readonly<{
  taskId: string;
  title: MotionV4Rect;
  timer: MotionV4Rect;
  toolbar: MotionV4Rect;
  actions: MotionV4Rect | null;
  rows: readonly MotionV4Rect[];
  expanded: boolean;
}>;

/** Refuse semantic title/time pixels from a different live task during IPC capture. */
export function assertMotionV4TaskIdentity(expected: string | null, actual: string | null): void {
  if (actual !== expected) {
    throw new Error("The live Focus task changed during Timer resize; retry the transition.");
  }
}

const valid = (r: MotionV4Rect): boolean =>
  [r.x, r.y, r.width, r.height].every(Number.isFinite)
  && r.x >= 0 && r.y >= 0 && r.width > 0 && r.height > 0
  && r.x + r.width <= 340 && r.y + r.height <= 700;

export function measureMotionV4Timer(root: ParentNode): MotionV4MeasuredTimer | null {
  const host = root.querySelector<HTMLElement>(".focus-surface-coordinator");
  const timer = root.querySelector<HTMLElement>('.floating-timer-foundation[data-floating-timer="foundation"]');
  if (!host || !timer || timer.querySelector('[data-floating-time-up-label="true"]')
      || timer.querySelector('[data-floating-subtasks-loading="true"]')) return null;
  const taskId = timer.dataset.floatingLiveTaskId;
  if (!taskId) return null;
  const origin = host.getBoundingClientRect();
  const rect = (selector: string): MotionV4Rect | null => {
    const element = timer.querySelector<HTMLElement>(selector);
    if (!element) return null;
    const bounds = element.getBoundingClientRect();
    const value = {
      x: bounds.left - origin.left,
      y: bounds.top - origin.top,
      width: bounds.width, height: bounds.height,
    };
    return valid(value) ? value : null;
  };
  const title = rect('[data-floating-task-title="true"]');
  const time = rect('[data-floating-live-timer="true"]');
  const toolbar = rect(".floating-timer-foundation__subtask-toolbar");
  if (!title || !time || !toolbar) return null;
  const expanded = timer.dataset.floatingExpanded === "true";
  const actions = expanded ? rect(".floating-timer-foundation__actions-wrap") : null;
  const rows: MotionV4Rect[] = [];
  if (expanded) {
    for (const element of timer.querySelectorAll<HTMLElement>("[data-floating-subtask-id]")) {
      const bounds = element.getBoundingClientRect();
      const measured = {
        x: bounds.left - origin.left,
        y: bounds.top - origin.top,
        width: bounds.width,
        height: bounds.height,
      };
      if (!valid(measured)) return null;
      rows.push(measured);
      if (rows.length > 64) return null;
    }
  }
  return { taskId, title, timer: time, toolbar, actions, rows, expanded };
}

export function createMotionV4TimerLayout(
  from: MotionV4MeasuredTimer | null,
  to: MotionV4MeasuredTimer | null,
): MotionV4RasterLayout | null {
  if (!from || !to || from.taskId !== to.taskId || from.expanded === to.expanded) return null;
  const enlarged = to.expanded ? to : from;
  // A rectangle outside either actual native endpoint would be dropped by
  // the compositor. Fail closed to the established pixel-preserving path.
  const fits = (rect: MotionV4Rect, height: number) =>
    valid(rect) && rect.y + rect.height <= height;
  const fromHeight = from.expanded ? 300 : 110;
  const toHeight = to.expanded ? 300 : 110;
  if (![from.title, from.timer, from.toolbar].every(rect => fits(rect, fromHeight))
      || ![to.title, to.timer, to.toolbar].every(rect => fits(rect, toHeight))
      || (enlarged.actions !== null && !fits(enlarged.actions, 300))
      || enlarged.rows.some(rect => !fits(rect, 300))) return null;
  return {
    title: { from: from.title, to: to.title },
    timer: { from: from.timer, to: to.timer },
    toolbar: { from: from.toolbar, to: to.toolbar },
    actions: enlarged.actions,
    rows: enlarged.rows,
  };
}
