type Lane = "backlog" | "thisWeek" | "today";
type Drop = { lane: Lane; beforeTaskId: string | null };

const interactive = "button, a, input, select, textarea, [contenteditable], [data-task-action], [data-task-title-control], [data-task-metric-control], [data-task-schedule-control], [data-task-note-control], [data-task-subtask-control]";

// Only this temporary pointer session owns the preview. Durable mutation and
// keyboard movement remain with the board, independently of visual feedback.
export function beginBoardTaskPointerDrag(options: {
  source: HTMLElement; target: EventTarget | null; pointerId: number;
  x: number; y: number; taskId: string; sourceLane: Lane;
  onLift: (height: number) => void;
  onTarget: (target: Drop | null) => void;
  onFinish: (target: Drop | null) => void;
}): (() => void) | null {
  if (!(options.target instanceof Element) || options.target.closest(interactive)) return null;
  const { source, pointerId, taskId } = options;
  const board = source.closest<HTMLElement>('.list-board');
  if (!board) return null;
  const initial = source.getBoundingClientRect();
  let x = options.x, y = options.y, lifted = false, closed = false;
  let preview: HTMLElement | null = null, target: Drop | null = null;
  let scrollFrame: number | null = null;
  const scale = initial.width / source.offsetWidth || 1;
  const updatePreview = () => {
    if (!preview) return;
    preview.style.left = `${(x - (options.x - initial.left)) / scale}px`;
    preview.style.top = `${(y - (options.y - initial.top)) / scale}px`;
  };
  const updateTarget = () => {
    const hit = document.elementFromPoint(x, y);
    const list = hit?.closest<HTMLElement>('[data-board-drop-lane]');
    let next: Drop | null = null;
    if (list && board.contains(list)) {
      const lane = list.dataset.boardDropLane as Lane;
      const placeholder = list.querySelector<HTMLElement>('[data-task-drop-placeholder]')?.getBoundingClientRect();
      if (target?.lane === lane && placeholder && y >= placeholder.top && y <= placeholder.bottom) {
        next = target;
      } else {
        const cards = Array.from(list.querySelectorAll<HTMLElement>('[data-board-drag-task][data-task-reorderable="true"]'))
          .filter(card => card.dataset.boardDragTask !== taskId);
        const before = cards.find(card => {
          const bounds = card.getBoundingClientRect();
          return y < bounds.top + bounds.height / 2;
        });
        next = { lane, beforeTaskId: before?.dataset.boardDragTask ?? null };
      }
    }
    if (next?.lane !== target?.lane || next?.beforeTaskId !== target?.beforeTaskId || Boolean(next) !== Boolean(target)) {
      target = next; options.onTarget(next);
    }
  };
  const scrollAtEdge = () => {
    scrollFrame = null;
    if (closed || !lifted) return;
    let node = document.elementFromPoint(x, y) as HTMLElement | null;
    while (node && node !== document.documentElement) {
      if (node.scrollHeight > node.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(node).overflowY)) break;
      node = node.parentElement;
    }
    if (node === document.documentElement || !node) node = document.scrollingElement as HTMLElement | null;
    if (!node) return;
    const bounds = node === document.scrollingElement
      ? { top: 0, bottom: window.innerHeight } : node.getBoundingClientRect();
    const direction = y < bounds.top + 28 ? -1 : y > bounds.bottom - 28 ? 1 : 0;
    if (!direction || (direction < 0 ? node.scrollTop <= 0 : node.scrollTop + node.clientHeight >= node.scrollHeight)) return;
    node.scrollTop += direction * 8;
    updateTarget();
    scrollFrame = window.requestAnimationFrame(scrollAtEdge);
  };
  const cleanup = () => {
    if (closed) return;
    closed = true;
    if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', cancel);
    window.removeEventListener('blur', cancel);
    window.removeEventListener('keydown', key);
    source.removeEventListener('lostpointercapture', cancel);
    preview?.remove();
    if (source.hasPointerCapture(pointerId)) source.releasePointerCapture(pointerId);
  };
  const finish = (drop: Drop | null) => {
    if (closed) return;
    cleanup(); options.onFinish(drop);
  };
  const move = (event: PointerEvent) => {
    if (event.pointerId !== pointerId || closed) return;
    x = event.clientX; y = event.clientY;
    if (!lifted && Math.hypot(x - options.x, y - options.y) < 6) return;
    event.preventDefault();
    if (!lifted) {
      lifted = true;
      preview = source.cloneNode(true) as HTMLElement;
      preview.classList.add('list-board-task-drag-preview');
      preview.setAttribute('aria-hidden', 'true'); preview.inert = true;
      preview.removeAttribute('role'); preview.removeAttribute('id'); preview.removeAttribute('tabindex');
      for (const node of preview.querySelectorAll('[id], [tabindex]')) { node.removeAttribute('id'); node.removeAttribute('tabindex'); }
      preview.style.width = `${initial.width / scale}px`; preview.style.zoom = String(scale);
      document.body.appendChild(preview);
      target = { lane: options.sourceLane, beforeTaskId: taskId };
      options.onLift(initial.height); options.onTarget(target);
    }
    updatePreview(); updateTarget();
    if (scrollFrame === null) scrollFrame = window.requestAnimationFrame(scrollAtEdge);
  };
  const up = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    if (lifted) { x = event.clientX; y = event.clientY; updateTarget(); }
    finish(lifted && target?.beforeTaskId !== taskId ? target : null);
  };
  const cancel = (event?: Event) => {
    if (event instanceof PointerEvent && event.pointerId !== pointerId) return;
    finish(null);
  };
  const key = (event: KeyboardEvent) => {
    if (event.key === 'Escape') { event.preventDefault(); cancel(); }
  };
  window.addEventListener('pointermove', move, { passive: false });
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', cancel);
  window.addEventListener('blur', cancel);
  window.addEventListener('keydown', key);
  source.addEventListener('lostpointercapture', cancel);
  try { source.setPointerCapture(pointerId); } catch { /* Window listeners cover synthetic regression input too. */ }
  return () => finish(null);
}
