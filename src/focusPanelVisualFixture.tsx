import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { FocusPanel } from "./FocusPanel";
import { FocusCompletionSuccess } from "./FocusCompletionSuccess";
import { TOOLTIP_INTENT_DELAY_MS } from "./overlayPrimitives";
import type {
  BoardTaskNoteSnapshot,
  ListBoardSnapshot,
  ListBoardTask,
  NoteDocument,
} from "./listBoardApi";
import type { TimerSessionPayload, TimerStateKind } from "./timerSessionApi";

function reportFixtureError(error: string) {
  const node = document.createElement("script");
  node.id = "focus-panel-visual-contract";
  node.type = "application/json";
  node.textContent = JSON.stringify({error});
  document.body.append(node);
  document.documentElement.dataset.focusPanelFixtureReady = "true";
}
window.addEventListener("error", event => reportFixtureError(event.message));
window.addEventListener("unhandledrejection", event => reportFixtureError(String(event.reason)));

const params = new URLSearchParams(window.location.search);
const theme = params.get("theme") === "light" ? "light" : "dark";
const requestedScenario = params.get("scenario") ?? "running";
const scenarios = [
  "running",
  "paused-metrics",
  "break",
  "time-up",
  "overtime",
  "notes-expanded",
  "live-actions-focus",
  "success",
  "no-eligible",
  "empty",
] as const;
type Scenario = (typeof scenarios)[number];
const scenario: Scenario = scenarios.includes(requestedScenario as Scenario)
  ? requestedScenario as Scenario
  : "running";

document.documentElement.dataset.theme = theme;
document.body.style.margin = "0";
document.body.style.minHeight = "100vh";
document.body.style.background = "var(--color-canvas)";

function task(
  id: string,
  title: string,
  listId: string,
  listTitle: string,
  listColor: string,
  options: Partial<ListBoardTask> = {},
): ListBoardTask {
  return {
    id,
    listId,
    listTitle,
    listColor,
    title,
    estSeconds: 1800,
    timeTakenSeconds: "0",
    subtaskTotalCount: 0,
    subtaskCompletedCount: 0,
    scheduledLocalDate: null,
    scheduledLocalTime: null,
    isOverdue: false,
    completedAt: null,
    ...options,
  };
}

const workId = "11111111-1111-4111-8111-111111111111";
const personalId = "11111111-1111-4111-8111-111111111112";
const longListTitle = "Long owning list title for source-readable queue";
const liveId = "21111111-1111-4111-8111-111111111111";
const overdueId = "21111111-1111-4111-8111-111111111112";
const longTitleId = "21111111-1111-4111-8111-111111111113";
const scheduledId = "21111111-1111-4111-8111-111111111114";
const longTitle = ["Plan weekend errands", "and confirm the pickup route before leaving home"].join(" ");

const liveTask = task(liveId, "Prepare BFCM strategy", workId, "Work", "#48d6c5", {
  estSeconds: 3600,
  timeTakenSeconds: "1320",
  subtaskTotalCount: 4,
  subtaskCompletedCount: 1,
});
const overdueTask = task(overdueId, "Review campaign notes", workId, "Work", "#48d6c5", {
  estSeconds: 1800,
  scheduledLocalDate: "2026-09-11",
  isOverdue: true,
});
const longTitleTask = task(longTitleId, longTitle, personalId, longListTitle, "#b7d96d", {
  estSeconds: 900,
});
const scheduledTask = task(scheduledId, "Client follow-up call", workId, "Work", "#48d6c5", {
  estSeconds: 1500,
  scheduledLocalDate: "2026-09-15",
  scheduledLocalTime: "18:30",
});
const doneTask = task("21111111-1111-4111-8111-111111111115", "Confirm morning agenda", workId, "Work", "#48d6c5", {
  estSeconds: 1200,
  timeTakenSeconds: "1260",
  completedAt: "2026-09-13T08:50:00Z",
});

const normalTodayTasks = [liveTask, overdueTask, longTitleTask, scheduledTask];
const todayTasks = scenario === "no-eligible" ? [scheduledTask]
  : scenario === "empty" ? []
  : scenario === "success" ? [overdueTask, longTitleTask, scheduledTask]
  : normalTodayTasks;
const board: ListBoardSnapshot = {
  target: { kind: "all_lists", id: null, title: "All Lists", color: null },
  displayTimezone: "Europe/Athens",
  backlog: { tasks: [], count: 0, aggregateEstSeconds: 0 },
  thisWeek: { tasks: [], count: 0, aggregateEstSeconds: 0 },
  today: {
    count: todayTasks.length,
    aggregateEstSeconds: todayTasks.reduce((total, item) => total + (item.estSeconds ?? 0), 0),
    tasks: todayTasks,
  },
  done: {
    count: scenario === "success" ? 2 : 1,
    aggregateEstSeconds: scenario === "success" ? 4800 : 1200,
    tasks: scenario === "success"
      ? [doneTask, { ...liveTask, completedAt: "2026-09-13T09:20:00Z" }]
      : [doneTask],
  },
  todayCompletionCount: scenario === "success" ? 1 : 0,
  thisWeekCompletionCount: 0,
  doneMonthCompletionCount: 1,
};

function timerState(): TimerStateKind {
  switch (scenario) {
    case "paused-metrics":
      return "paused";
    case "break":
      return "break";
    case "time-up":
      return "time_up";
    case "overtime":
      return "overtime_running";
    default:
      return "running";
  }
}

const state = timerState();
const noLiveScenario = scenario === "no-eligible" || scenario === "empty" || scenario === "success";
const timer: TimerSessionPayload | null = noLiveScenario ? null : {
  revision: scenarios.indexOf(scenario) + 7,
  runtime: {
    timer: {
      state,
      task_id: liveId,
      mode: { kind: "est_countdown", est_ms: 3_600_000 },
      work_elapsed_ms: 1_320_000,
      total_break_ms: state === "break" ? 180_000 : 0,
      countdown_remaining_ms: state === "time_up" || state.startsWith("overtime") ? 0 : 2_280_000,
      overtime_ms: state.startsWith("overtime") ? 420_000 : 0,
      break_kind: state === "break" ? "manual" : null,
      break_remaining_ms: state === "break" ? 420_000 : null,
    },
    open_session_id: "31111111-1111-4111-8111-111111111111",
  },
  awaitingResume: false,
  change: null,
};

const noteDocument: NoteDocument = {
  blocks: [
    {
      kind: "paragraph",
      runs: [
        { text: "Confirm launch assumptions and review the ", bold: true },
        { text: "source brief", link: "https://example.com/narro-focus" },
        { text: " before finishing this task." },
      ],
    },
  ],
};
const noteSnapshot: BoardTaskNoteSnapshot = {
  taskId: liveId,
  listId: workId,
  mutable: true,
  note: {
    taskId: liveId,
    editorFormatVersion: 1,
    document: noteDocument,
    updatedAt: "2026-09-15T09:00:00Z",
  },
};

type TauriInternals = {
  invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown>;
};

(window as unknown as { __TAURI_INTERNALS__: TauriInternals }).__TAURI_INTERNALS__ = {
  invoke: async (command, args) => {
    if (command === "get_list_board_task_note") {
      if (String(args?.taskId ?? "") !== liveId || String(args?.listId ?? "") !== workId) {
        throw new Error("Focus visual fixture requested a note for an unexpected task identity.");
      }
      return noteSnapshot;
    }
    throw new Error(`Unexpected Focus visual fixture invoke: ${command}`);
  },
};

const root = document.getElementById("root");
if (!root) throw new Error("Focus Panel fixture root is missing.");
root.style.minHeight = "100vh";
root.style.display = "flex";
root.style.justifyContent = "center";
root.style.alignItems = "flex-start";

flushSync(() => {
  createRoot(root).render(
    <FocusPanel
      fixtureBoard={board}
      fixtureLists={[
        { id: workId, title: "Work" },
        { id: personalId, title: longListTitle },
      ]}
      fixtureTimer={timer}
      completionSuccessContent={scenario === "success" ? (
        <FocusCompletionSuccess inline
          state={{ completedTaskId: liveId, completedTaskTitle: liveTask.title,
            estSeconds: liveTask.estSeconds, timeTakenSeconds: liveTask.timeTakenSeconds,
            funGifEnabled: false,
            nextTask: { id: overdueId, title: overdueTask.title, mode: { kind: "count_up" } } }}
          pending={false} error={null} onNextTask={() => undefined} onTakeBreak={() => undefined} onClose={() => undefined}
        />
      ) : null}
    />,
  );
});

if (scenario === "live-actions-focus") {
  const action = document.querySelector<HTMLButtonElement>('[data-focus-action="pause-resume"]');
  const rail = document.querySelector<HTMLElement>(".focus-panel__live-actions");
  const heading = document.querySelector<HTMLElement>(".focus-panel__live-heading");
  const liveCard = document.querySelector<HTMLElement>('[data-focus-live-card="true"]');
  if (!action || !rail || !heading || !liveCard || action.disabled) {
    throw new Error("B49 focus reveal requires a real enabled contextual action and live card.");
  }
  const cardBefore = liveCard.getBoundingClientRect();
  const railBefore = rail.getBoundingClientRect();
  action.focus({preventScroll: true});
  // Edge may publish focus and compute the opacity transition on different
  // frames in light/dark fixtures. Require the same fully revealed final
  // state, but wait for actual style settlement instead of one fixed timeout.
  const revealDeadline = performance.now() + 1_500;
  while (performance.now() < revealDeadline
    && (getComputedStyle(rail).opacity !== "1"
      || getComputedStyle(heading).opacity !== "0")) {
    await new Promise<void>(resolve => window.setTimeout(resolve, 40));
  }
  const cardAfter = liveCard.getBoundingClientRect();
  const railAfter = rail.getBoundingClientRect();
  const label = action.querySelector<HTMLElement>(".focus-panel__live-action-label");
  const revealProblems = [
    document.activeElement !== action ? "keyboard-focus-owner" : null,
    liveCard.dataset.focusActionsKeyboard !== "true" ? "explicit-keyboard-focus-marker-missing" : null,
    getComputedStyle(rail).opacity !== "1" ? `action-rail-opacity=${getComputedStyle(rail).opacity}` : null,
    getComputedStyle(heading).opacity !== "0" ? `heading-opacity=${getComputedStyle(heading).opacity}` : null,
    !label || label.getClientRects().length === 0 ? "focused-label-not-visible" : null,
    Math.abs(cardAfter.height - cardBefore.height) > 1
      ? `live-card-height-shift=${(cardAfter.height - cardBefore.height).toFixed(2)}px` : null,
    Math.abs(railAfter.width - railBefore.width) > 1
      ? `action-rail-width-shift=${(railAfter.width - railBefore.width).toFixed(2)}px` : null,
    Math.abs(railAfter.top - railBefore.top) > 1
      ? `action-rail-top-shift=${(railAfter.top - railBefore.top).toFixed(2)}px` : null,
  ].filter((problem): problem is string => problem !== null);
  if (revealProblems.length > 0) {
    throw new Error(`B49 action focus failed to reveal a labeled icon without moving live-card geometry: ${revealProblems.join(", ")}`);
  }
  document.documentElement.dataset.focusActionRevealPass = "true";
}

if (scenario === "notes-expanded") {
  const notesButton = document.querySelector<HTMLButtonElement>('[data-focus-action="notes"]');
  if (!notesButton) throw new Error("Focus visual fixture Notes action is missing.");
  notesButton.click();
  await new Promise<void>((resolve) => window.setTimeout(resolve, 80));
}

function box(selector: string) {
  const node = document.querySelector<HTMLElement>(selector);
  if (!node) throw new Error(`Focus Panel fixture selector missing: ${selector}`);
  const rect = node.getBoundingClientRect();
  return { width: Math.round(rect.width), height: Math.round(rect.height) };
}

function optionalBox(selector: string) {
  const node = document.querySelector<HTMLElement>(selector);
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  return { width: Math.round(rect.width), height: Math.round(rect.height) };
}

function styleContract(selector: string) {
  const node = document.querySelector<HTMLElement>(selector);
  if (!node) return null;
  const style = getComputedStyle(node);
  return {
    backgroundColor: style.backgroundColor,
    backgroundImage: style.backgroundImage,
    borderColor: style.borderColor,
    borderStyle: style.borderStyle,
    color: style.color,
    boxShadow: style.boxShadow,
  };
}

function titleContract(selector: string) {
  const node = document.querySelector<HTMLElement>(selector);
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  const style = getComputedStyle(node);
  return {
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    display: style.display,
    lineClamp: style.getPropertyValue("-webkit-line-clamp"),
    whiteSpace: style.whiteSpace,
    overflow: style.overflow,
    tabIndex: node.tabIndex,
    describedBy: node.getAttribute("aria-describedby"),
  };
}

const longRowSelector = `[data-task-id="${longTitleId}"]`;
const overdueSelector = `[data-task-id="${overdueId}"]`;
let queueTitleLayout = null;
const queuedRow = document.querySelector<HTMLElement>(longRowSelector);
if (queuedRow) {
  const title = queuedRow.querySelector<HTMLElement>('[data-focus-task-title="true"]')!;
  const badge = queuedRow.querySelector<HTMLElement>('.focus-panel__list-chip')!;
  const rail = queuedRow.querySelector<HTMLElement>('.focus-panel__row-action-slot')!;
  const bounds = () => [queuedRow, title, rail].map(node => node.getBoundingClientRect().toJSON());
  const before = bounds();
  if (before[1].width <= badge.getBoundingClientRect().width) throw new Error('Long list badge dominates the ordinary title');
  if (before[2].top < before[1].bottom) throw new Error('Action rail competes with title allocation');
  const rowIsVisible = before[0].top >= 0 && before[0].bottom <= window.innerHeight;
  if (rowIsVisible) {
    title.focus({preventScroll: true});
    await new Promise<void>(resolve => window.setTimeout(resolve, TOOLTIP_INTENT_DELAY_MS + 50));
    const focusedTooltip = title.closest('.overlay-anchor')!.querySelector<HTMLElement>('[role="tooltip"]');
    if (focusedTooltip?.dataset.open !== "true") throw new Error('Focused queued title tooltip did not open before containment measurement');
  }
  if (JSON.stringify(bounds()) !== JSON.stringify(before)) throw new Error('Revealing queued actions moved title, card or targets');
  if (queuedRow.scrollWidth > queuedRow.clientWidth + 1) throw new Error('Queued task has horizontal overflow ' + JSON.stringify({width: queuedRow.clientWidth, scrollWidth: queuedRow.scrollWidth, escaping: Array.from(queuedRow.querySelectorAll<HTMLElement>('*')).filter(node => node.getBoundingClientRect().right > queuedRow.getBoundingClientRect().right).map(node => ({text: node.textContent?.slice(0,35), class: node.className, right: node.getBoundingClientRect().right}))}));
  const tooltipNode = title.closest('.overlay-anchor')!.querySelector<HTMLElement>('[role="tooltip"]')!;
  const tooltip = tooltipNode.getBoundingClientRect();
  const rowBounds = queuedRow.getBoundingClientRect();
  const tooltipEscapes = tooltip.left < rowBounds.left
    || tooltip.right > rowBounds.right
    || (rowIsVisible && (tooltip.top < 0 || tooltip.bottom > window.innerHeight));
  if (tooltipEscapes) {
    const style = getComputedStyle(tooltipNode);
    throw new Error(
      'Full queued title tooltip escapes tested horizontal row/visible viewport bounds '
      + JSON.stringify({
        tooltip: tooltip.toJSON(),
        row: rowBounds.toJSON(),
        anchor: title.closest('.overlay-anchor')!.getBoundingClientRect().toJSON(),
        viewport: {width: window.innerWidth, height: window.innerHeight},
        rowIsVisible,
        placement: tooltipNode.dataset.placement ?? null,
        maxWidth: style.maxWidth,
        insetInlineStart: style.insetInlineStart,
        insetInlineEnd: style.insetInlineEnd,
        insetBlockStart: style.insetBlockStart,
        insetBlockEnd: style.insetBlockEnd,
        transform: style.transform,
      }),
    );
  }
  queueTitleLayout = {titleWiderThanBadge: true, railBelowTitle: true, revealGeometryStable: rowIsVisible,
    rowContained: true, tooltipContained: rowIsVisible, viewportChecked: rowIsVisible, titleWidth: before[1].width, badgeWidth: badge.getBoundingClientRect().width,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches};
}
const contract = {
  queueTitleLayout,
  theme,
  scenario,
  layoutViewport: {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  },
  panel: box(".focus-panel"),
  topbar: box(".focus-panel__topbar"),
  summary: box(".focus-panel__summary"),
  liveCard: box(".focus-panel__live-card"),
  liveCardStyle: styleContract(".focus-panel__live-card"),
  liveTimer: optionalBox(".focus-panel__live-timer"),
  liveTimerStyle: styleContract(".focus-panel__live-timer"),
  liveStateStyle: styleContract(".focus-panel__live-state"),
  metrics: optionalBox(".focus-panel__live-metrics"),
  metricRow: optionalBox(".focus-panel__metric-row"),
  metricInput: scenario === "paused-metrics" ? optionalBox(".focus-panel__metric-input") : null,
  subtasks: optionalBox(".focus-panel__subtasks"),
  subtaskRing: optionalBox(".focus-panel__subtask-ring"),
  actions: optionalBox(".focus-panel__live-actions"),
  actionLabels: Array.from(document.querySelectorAll<HTMLButtonElement>(".focus-panel__live-actions > button"), (button) => {
    const rect = button.getBoundingClientRect();
    const style = getComputedStyle(button);
    const range = document.createRange();
    range.selectNodeContents(button);
    // clientWidth rounds to whole pixels and can hide subpixel truncation that
    // still triggers CSS ellipsis. Measure the actual fractional content box.
    const availableWidth = rect.width - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth)
      - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    return {
      action: button.dataset.focusAction,
      label: button.textContent?.trim(),
      x: rect.x,
      width: rect.width,
      labelWidth: range.getBoundingClientRect().width,
      availableWidth,
    };
  }),
  notes: optionalBox(".focus-panel__notes:not([hidden])"),
  notesStyle: styleContract(".focus-panel__notes:not([hidden])"),
  firstRow: optionalBox('.focus-panel__task-row[data-focus-task-row="remaining"]'),
  rowActionSlot: optionalBox('.focus-panel__task-row[data-focus-task-row="remaining"] .focus-panel__row-action-slot'),
  overdueRow: optionalBox(overdueSelector),
  overdueRowStyle: styleContract(overdueSelector),
  longRow: optionalBox(longRowSelector),
  longRowStyle: styleContract(longRowSelector),
  longTitle: titleContract(`${longRowSelector} [data-focus-task-title="true"]`),
  scheduledRow: optionalBox(`[data-task-id="${scheduledId}"]`),
  addTask: box(".focus-panel__add-task"),
};

const contractNode = document.createElement("script");
contractNode.id = "focus-panel-visual-contract";
contractNode.type = "application/json";
contractNode.textContent = JSON.stringify(contract);
document.body.append(contractNode);
document.documentElement.dataset.focusPanelFixtureReady = "true";
