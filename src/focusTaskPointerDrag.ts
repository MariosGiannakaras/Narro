type FocusTaskDrop = { beforeTaskId: string | null };

const INTERACTIVE = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "[contenteditable]",
  "[data-focus-row-action]",
  "[data-task-note-control]",
  "[data-task-subtask-control]",
].join(", ");

export function beginFocusTaskPointerDrag(options: {
  source: HTMLElement;
  target: EventTarget | null;
  pointerId: number;
  x: number;
  y: number;
  taskId: string;
  onFinish: (drop: FocusTaskDrop | null) => void;
}): (() => void) | null {
  if (!(options.target instanceof Element) || options.target.closest(INTERACTIVE)) return null;

  const zone = options.source.closest<HTMLElement>('[data-focus-reorder-zone="true"]');
  if (!zone) return null;

  const { source, pointerId, taskId } = options;
  const initial = source.getBoundingClientRect();
  let x = options.x;
  let y = options.y;
  let lifted = false;
  let closed = false;
  let preview: HTMLElement | null = null;
  let drop: FocusTaskDrop | null = null;

  const updatePreview = () => {
    if (!preview) return;
    preview.style.left = `${x - (options.x - initial.left)}px`;
    preview.style.top = `${y - (options.y - initial.top)}px`;
  };

  const updateDrop = () => {
    const rows = Array.from(
      zone.querySelectorAll<HTMLElement>('[data-focus-drag-task][data-focus-reorderable="true"]'),
    ).filter((row) => row.dataset.focusDragTask !== taskId);

    const before = rows.find((row) => {
      const bounds = row.getBoundingClientRect();
      return y < bounds.top + bounds.height / 2;
    });
    drop = { beforeTaskId: before?.dataset.focusDragTask ?? null };
  };

  const cleanup = () => {
    if (closed) return;
    closed = true;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", cancel);
    window.removeEventListener("blur", cancel);
    window.removeEventListener("keydown", key);
    source.removeEventListener("lostpointercapture", cancel);
    source.removeAttribute("data-focus-task-dragging");
    preview?.remove();
    if (source.hasPointerCapture(pointerId)) source.releasePointerCapture(pointerId);
  };

  const finish = (result: FocusTaskDrop | null) => {
    if (closed) return;
    cleanup();
    options.onFinish(result);
  };

  const move = (event: PointerEvent) => {
    if (event.pointerId !== pointerId || closed) return;
    x = event.clientX;
    y = event.clientY;
    if (!lifted && Math.hypot(x - options.x, y - options.y) < 6) return;

    event.preventDefault();
    if (!lifted) {
      lifted = true;
      preview = source.cloneNode(true) as HTMLElement;
      preview.classList.add("focus-panel__task-drag-preview");
      preview.setAttribute("aria-hidden", "true");
      preview.inert = true;
      preview.removeAttribute("role");
      preview.removeAttribute("id");
      preview.removeAttribute("tabindex");
      for (const node of preview.querySelectorAll<HTMLElement>("[id], [tabindex]")) {
        node.removeAttribute("id");
        node.removeAttribute("tabindex");
      }
      preview.style.width = `${initial.width}px`;
      preview.style.height = `${initial.height}px`;
      document.body.appendChild(preview);
      source.dataset.focusTaskDragging = "true";
    }

    updatePreview();
    updateDrop();
  };

  const up = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    if (!lifted) {
      finish(null);
      return;
    }
    x = event.clientX;
    y = event.clientY;
    updateDrop();
    finish(drop);
  };

  const cancel = (event?: Event) => {
    if (event instanceof PointerEvent && event.pointerId !== pointerId) return;
    finish(null);
  };

  const key = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    cancel();
  };

  window.addEventListener("pointermove", move, { passive: false });
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", cancel);
  window.addEventListener("blur", cancel);
  window.addEventListener("keydown", key);
  source.addEventListener("lostpointercapture", cancel);
  try {
    source.setPointerCapture(pointerId);
  } catch {
    // Window listeners retain deterministic cancellation/finish coverage.
  }

  return () => finish(null);
}
