import type { MotionV4Rect } from "./focusMotionV4Geometry";

export type MotionV4SharedPixels = Readonly<{
  from: MotionV4Rect;
  to: MotionV4Rect;
}>;
export type MotionV4PanelLayout = Readonly<{
  title: MotionV4SharedPixels;
  timer: MotionV4SharedPixels;
}>;
export type MotionV4PanelAnchors = Readonly<{
  taskId: string;
  titleText: string;
  timerText: string;
  title: MotionV4Rect;
  timer: MotionV4Rect;
}>;

const physical = (r: MotionV4Rect, height: number): boolean =>
  [r.x, r.y, r.width, r.height].every(Number.isFinite)
  && r.x >= 0 && r.y >= 0 && r.width > 0 && r.height > 0
  && r.x + r.width <= 340 && r.y + r.height <= height;

const overlap = (a: MotionV4Rect, b: MotionV4Rect): boolean =>
  a.x < b.x + b.width && b.x < a.x + a.width
  && a.y < b.y + b.height && b.y < a.y + a.height;

function measure(
  host: Element, root: Element, id: string, titleSelector: string,
  timerSelector: string, height: number,
): MotionV4PanelAnchors | null {
  if (!id) return null;
  const title = root.querySelector<HTMLElement>(titleSelector);
  const timer = root.querySelector<HTMLElement>(timerSelector);
  if (!title || !timer) return null;
  // Moving marquee source glyphs and a DOM that is mid-automatic-advance
  // cannot be frozen as immutable native sprites.
  if (title.closest('[data-focus-live-title-scroll="active"]')) return null;
  const origin = host.getBoundingClientRect();
  const bounds = (element: HTMLElement): MotionV4Rect => {
    const r = element.getBoundingClientRect();
    return {x:r.left-origin.left,y:r.top-origin.top,width:r.width,height:r.height};
  };
  const a = bounds(title);
  const b = bounds(timer);
  const titleText = title.textContent?.trim() ?? "";
  const timerText = timer.textContent?.trim() ?? "";
  if (!physical(a,height) || !physical(b,height) || overlap(a,b)
      || !titleText || !timerText) return null;
  return {taskId:id,titleText,timerText,title:a,timer:b};
}

/** Measured source pixels from the *real* Focus Panel live card. */
export function measureMotionV4Panel(root: ParentNode): MotionV4PanelAnchors | null {
  const host = root.querySelector<HTMLElement>(".focus-surface-coordinator");
  const card = root.querySelector<HTMLElement>(
    '.focus-surface-coordinator__presentation[data-focus-presentation="panel"] .focus-panel__live-card[data-task-id]',
  );
  if (!host || !card || card.dataset.focusBreakCard === "true"
      || card.querySelector('[data-focus-live-title-scroll="active"]')) return null;
  return measure(host,card,card.dataset.taskId ?? "",
    ".focus-panel__live-title",".focus-panel__live-timer",700);
}

/** Equivalent measured pixels from the *real* committed/prepainted Timer. */
export function measureMotionV4PanelTimer(
  root: ParentNode, expanded: boolean,
): MotionV4PanelAnchors | null {
  const host = root.querySelector<HTMLElement>(".focus-surface-coordinator");
  const timer = root.querySelector<HTMLElement>(
    '.focus-surface-coordinator__presentation[data-focus-presentation="timer"] .floating-timer-foundation[data-floating-timer="foundation"]',
  );
  if (!host || !timer || timer.dataset.floatingExpanded !== String(expanded)
      || timer.querySelector('[data-floating-time-up-label="true"]')
      || timer.querySelector('[data-floating-subtasks-loading="true"]')) return null;
  return measure(host,timer,timer.dataset.floatingLiveTaskId ?? "",
    '[data-floating-task-title="true"]','[data-floating-live-timer="true"]',
    expanded ? 300 : 110);
}

/** Both endpoint glyphs must denote exactly one unchanged semantic task. */
export function createMotionV4PanelLayout(
  from: MotionV4PanelAnchors | null,
  to: MotionV4PanelAnchors | null,
  fromHeight: number,
  toHeight: number,
): MotionV4PanelLayout | null {
  if (!from || !to || !from.taskId || from.taskId !== to.taskId
      || from.titleText !== to.titleText || from.timerText !== to.timerText
      || ![110,300,700].includes(fromHeight) || ![110,300,700].includes(toHeight)
      || (fromHeight !== 700 && toHeight !== 700) || fromHeight === toHeight
      || !physical(from.title,fromHeight) || !physical(from.timer,fromHeight)
      || !physical(to.title,toHeight) || !physical(to.timer,toHeight)
      || overlap(from.title,from.timer) || overlap(to.title,to.timer)) return null;
  return {title:{from:from.title,to:to.title},timer:{from:from.timer,to:to.timer}};
}
