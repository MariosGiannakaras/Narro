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
  "selector-open",
  "paused-metrics",
  "break",
  "pomodoro-work",
  "pomodoro-break",
  "time-up",
  "overtime",
  "notes-expanded",
  "live-actions-focus",
  "success",
  "success-late",
  "success-equal",
  "success-no-est",
  "success-fun-gif",
  "no-eligible",
  "empty",
] as const;
type Scenario = (typeof scenarios)[number];
const scenario: Scenario = scenarios.includes(requestedScenario as Scenario)
  ? requestedScenario as Scenario
  : "running";
const isSuccessScenario = scenario.startsWith("success");
const isPomodoroScenario = scenario === "pomodoro-work" || scenario === "pomodoro-break";
const isBreakScenario = scenario === "break" || scenario === "pomodoro-break";

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
  estSeconds: isPomodoroScenario ? 0 : 3600,
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

// Exercise the actual committed-success view with authoritative metric variants.
const successEstSeconds = scenario === "success-no-est" ? null
  : scenario === "success-late" || scenario === "success-equal" ? 600
    : liveTask.estSeconds;
const successTakenSeconds = scenario === "success-late" ? "660"
  : scenario === "success-equal" || scenario === "success-no-est" ? "600"
    : liveTask.timeTakenSeconds;
const normalTodayTasks = [liveTask, overdueTask, longTitleTask, scheduledTask];
const todayTasks = scenario === "no-eligible" ? [scheduledTask]
  : scenario === "empty" ? []
  : isSuccessScenario ? [overdueTask, longTitleTask, scheduledTask]
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
    count: isSuccessScenario ? 2 : 1,
    aggregateEstSeconds: isSuccessScenario ? 1200 + (successEstSeconds ?? 0) : 1200,
    tasks: isSuccessScenario
      ? [doneTask, { ...liveTask, estSeconds: successEstSeconds, timeTakenSeconds: successTakenSeconds, completedAt: "2026-09-13T09:20:00Z" }]
      : [doneTask],
  },
  todayCompletionCount: isSuccessScenario ? 1 : 0,
  thisWeekCompletionCount: 0,
  doneMonthCompletionCount: 1,
};

function timerState(): TimerStateKind {
  switch (scenario) {
    case "paused-metrics":
      return "paused";
    case "break":
    case "pomodoro-break":
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
const noLiveScenario = scenario === "no-eligible" || scenario === "empty" || isSuccessScenario;
const timer: TimerSessionPayload | null = noLiveScenario ? null : {
  revision: scenarios.indexOf(scenario) + 7,
  runtime: {
    timer: {
      state,
      task_id: liveId,
      mode: isPomodoroScenario
        ? { kind: "pomodoro", work_ms: 1_500_000, break_ms: 300_000 }
        : { kind: "est_countdown", est_ms: 3_600_000 },
      work_elapsed_ms: isPomodoroScenario ? 420_000 : 1_320_000,
      total_break_ms: isBreakScenario ? (isPomodoroScenario ? 120_000 : 180_000) : 0,
      countdown_remaining_ms: state === "time_up" || state.startsWith("overtime") ? 0
        : isPomodoroScenario ? 1_080_000 : 2_280_000,
      overtime_ms: state.startsWith("overtime") ? 420_000 : 0,
      break_kind: isBreakScenario ? (isPomodoroScenario ? "pomodoro" : "manual") : null,
      break_remaining_ms: isBreakScenario ? (isPomodoroScenario ? 180_000 : 420_000) : null,
      break_planned_ms: isBreakScenario ? (isPomodoroScenario ? 300_000 : 600_000) : null,
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
        { id: workId, title: "Work", color: "#f6e26d" },
        { id: personalId, title: longListTitle, color: "#acb55f" },
        { id: "a1111111-1111-4111-8111-111111111111", title: "Research", color: "#48d6c5" },
      ]}
      fixtureTimer={timer}
      fixtureDoneBreaks={scenario === "break" ? [{
        id: "41111111-1111-4111-8111-111111111111",
        endedAt: "2026-09-13T09:10:00Z",
        durationSeconds: "600",
      }] : []}
      completionSuccessContent={isSuccessScenario ? (
        <FocusCompletionSuccess inline
          state={{ completedTaskId: liveId, completedTaskTitle: liveTask.title,
            estSeconds: successEstSeconds, timeTakenSeconds: successTakenSeconds,
            funGifEnabled: scenario === "success-fun-gif",
            nextTask: { id: overdueId, title: overdueTask.title, mode: { kind: "count_up" } } }}
          pending={false} error={null} onNextTask={() => undefined} onTakeBreak={() => undefined} onClose={() => undefined}
        />
      ) : null}
    />,
  );
});

if (scenario === "selector-open") {
  const trigger = document.querySelector<HTMLButtonElement>('[data-focus-list-selector="true"]');
  if (!trigger || trigger.disabled) throw new Error("Focus list selector fixture trigger unavailable");
  flushSync(() => trigger.click());
  const optionNodes = document.querySelectorAll('[data-focus-list-option]');
  if (optionNodes.length !== 4) {
    throw new Error(`Focus list selector expected All Lists and three saved lists; saw ${optionNodes.length}`);
  }
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
  // B63 keeps the queue visible but inert until Next Task/Close. Never demand
  // its ordinary focus-triggered tooltip while completion owns interaction.
  const successQueueInert = isSuccessScenario && queuedRow.closest('[inert]') !== null;
  if (isSuccessScenario) {
    if (!successQueueInert) throw new Error('Committed success queue must remain inert');
    title.focus({preventScroll: true});
    if (document.activeElement === title) throw new Error('Committed success queue title incorrectly accepted focus');
  } else if (rowIsVisible) {
    title.focus({preventScroll: true});
    await new Promise<void>(resolve => window.setTimeout(resolve, TOOLTIP_INTENT_DELAY_MS + 50));
    const focusedTooltip = title.closest('.overlay-anchor')!.querySelector<HTMLElement>('[role="tooltip"]');
    // Headless CDP without virtual-time acceleration can delay the real React
    // tooltip timer/commit beyond the nominal intent delay. Wait for the real
    // mounted tooltip to OPEN, never treat elapsed time or DOM presence as PASS.
    const tooltipDeadline = performance.now() + 2_000;
    while (document.activeElement === title
      && focusedTooltip?.dataset.open !== "true"
      && performance.now() < tooltipDeadline) {
      await new Promise<void>(resolve => window.setTimeout(resolve, 100));
    }
    if (document.activeElement !== title || focusedTooltip?.dataset.open !== "true") {
      throw new Error('Focused queued title tooltip did not open before containment measurement: '
        + JSON.stringify({focusOwner: document.activeElement === title,
          activeTag: document.activeElement?.tagName ?? null,
          tooltipOpen: focusedTooltip?.dataset.open ?? null,
          rowVisible: rowIsVisible, viewport: [window.innerWidth, window.innerHeight]}));
    }
  }
  if (JSON.stringify(bounds()) !== JSON.stringify(before)) throw new Error('Revealing queued actions moved title, card or targets');
  if (queuedRow.scrollWidth > queuedRow.clientWidth + 1) throw new Error('Queued task has horizontal overflow ' + JSON.stringify({width: queuedRow.clientWidth, scrollWidth: queuedRow.scrollWidth, escaping: Array.from(queuedRow.querySelectorAll<HTMLElement>('*')).filter(node => node.getBoundingClientRect().right > queuedRow.getBoundingClientRect().right).map(node => ({text: node.textContent?.slice(0,35), class: node.className, right: node.getBoundingClientRect().right}))}));
  const tooltipNode = title.closest('.overlay-anchor')!.querySelector<HTMLElement>('[role="tooltip"]')!;
  const tooltip = tooltipNode.getBoundingClientRect();
  const rowBounds = queuedRow.getBoundingClientRect();
  const tooltipEscapes = !isSuccessScenario && (tooltip.left < rowBounds.left
    || tooltip.right > rowBounds.right
    || (rowIsVisible && (tooltip.top < 0 || tooltip.bottom > window.innerHeight)));
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
  queueTitleLayout = {titleWiderThanBadge: true, railBelowTitle: true,
    revealGeometryStable: isSuccessScenario ? null : rowIsVisible,
    rowContained: true, tooltipContained: isSuccessScenario ? null : rowIsVisible,
    successQueueInert, viewportChecked: rowIsVisible, titleWidth: before[1].width, badgeWidth: badge.getBoundingClientRect().width,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches};
}

// Keep the strict keyboard-action focus proof LAST among interactive fixture
// probes. The queued-title tooltip/geometry probe above intentionally focuses
// a different task row and had been stealing focus AFTER the old B49 "pass"
// marker, leaving its PNG indistinguishable from the ordinary running state.
// No validation threshold or application behavior changes.
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
  // Edge headless virtual time advances timer callbacks without necessarily
  // advancing compositor opacity transitions. Complete only the real CSS
  // opacity transitions after the focus selectors become active; never write
  // opacity directly or bypass the strict final-state/geometry assertions.
  const revealDeadline = performance.now() + 1_500;
  while (performance.now() < revealDeadline) {
    const focusStylesActive = liveCard.matches(":focus-within")
      && getComputedStyle(rail).pointerEvents === "auto";
    if (focusStylesActive) {
      for (const element of [rail, heading]) {
        for (const animation of element.getAnimations()) {
          if (animation instanceof CSSTransition
            && animation.transitionProperty === "opacity"
            && animation.playState !== "finished") {
            animation.finish();
          }
        }
      }
    }
    if (getComputedStyle(rail).opacity === "1"
      && getComputedStyle(heading).opacity === "0") break;
    await new Promise<void>(resolve => window.setTimeout(resolve, 40));
  }
  const cardAfter = liveCard.getBoundingClientRect();
  const railAfter = rail.getBoundingClientRect();
  const label = action.querySelector<HTMLElement>(".focus-panel__live-action-label");
  const revealProblems = [
    document.activeElement !== action ? "keyboard-focus-owner" : null,
    liveCard.dataset.focusActionsKeyboard !== "true" ? "explicit-keyboard-focus-marker-missing" : null,
    !liveCard.matches(":focus-within") ? "card-focus-within-not-matched" : null,
    getComputedStyle(rail).pointerEvents !== "auto" ? `action-rail-pointer-events=${getComputedStyle(rail).pointerEvents}` : null,
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

const focusSelector = document.querySelector<HTMLElement>('[data-focus-list-selector="true"]');
const focusPopup = document.querySelector<HTMLElement>('.board-list-picker--focus .board-list-picker__menu');
const focusPanelRect = document.querySelector('.focus-panel')?.getBoundingClientRect();
const focusPopupRect = focusPopup?.getBoundingClientRect();
const focusSelectorContract = {
  trigger: focusSelector ? {
    width: focusSelector.getBoundingClientRect().width,
    height: focusSelector.getBoundingClientRect().height,
    expanded: focusSelector.getAttribute('aria-expanded'),
  } : null,
  popup: focusPopupRect ? { width: focusPopupRect.width, height: focusPopupRect.height, right: focusPopupRect.right } : null,
  popupWithinPanel: Boolean(focusPopupRect && focusPanelRect
    && focusPopupRect.left >= focusPanelRect.left - 1
    && focusPopupRect.right <= focusPanelRect.right + 1
    && focusPopupRect.top >= focusPanelRect.top - 1
    && focusPopupRect.bottom <= focusPanelRect.bottom + 1),
  listOptions: Array.from(document.querySelectorAll<HTMLElement>('[data-focus-list-option]'),
    node => ({
      label: node.querySelector('.board-list-picker__option-title')?.textContent?.trim() ?? '',
      selected: node.getAttribute('aria-selected'),
      badgeVisible: Boolean(node.querySelector('.board-list-picker__badge')),
    })),
  optionLayout: Array.from(document.querySelectorAll<HTMLElement>('[data-focus-list-option]'), node => {
    const title = node.querySelector<HTMLElement>('.board-list-picker__option-title');
    const optionRect = node.getBoundingClientRect();
    const titleRect = title?.getBoundingClientRect();
    return {
      optionRight: optionRect.right,
      titleRight: titleRect?.right ?? null,
      titleClientWidth: title?.clientWidth ?? 0,
      titleScrollWidth: title?.scrollWidth ?? 0,
      titleOverflow: title ? getComputedStyle(title).textOverflow : null,
    };
  }),
  overflowBadge: document.querySelector('.board-list-picker--focus .board-list-picker__remaining-count')?.textContent?.trim() ?? null,
  savedBadgeColors: Array.from(document.querySelectorAll<HTMLElement>(
    '[data-focus-list-option]:not([data-focus-list-option="__all_lists__"]) .board-list-picker__badge'
  ), node => getComputedStyle(node).backgroundColor),
};
const contract = {
  focusSelectorContract,
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
  // Read real rendered success-copy dimensions without duplicating its formatter.
  successTiming: (() => {
    const timing = document.querySelector<HTMLElement>('[data-focus-success-timing="true"]');
    if (!timing) return null;
    const card = timing.closest<HTMLElement>(".focus-completion-success__card");
    if (!card) throw new Error("Visible timing has no completion card");
    const rect = timing.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    return {
      text: timing.textContent?.trim() ?? "",
      width: rect.width,
      height: rect.height,
      fitsCard: rect.left >= cardRect.left - 1 && rect.right <= cardRect.right + 1
        && rect.top >= cardRect.top - 1 && rect.bottom <= cardRect.bottom + 1,
      notClipped: timing.scrollWidth <= timing.clientWidth + 1
        && timing.scrollHeight <= timing.clientHeight + 1,
    };
  })(),
  // Real production celebration geometry, for enabled-preference screenshot
  // validation; do not infer paint solely from the DOM presence marker.
  successReaction: (() => {
    const reaction = document.querySelector<HTMLElement>('[data-focus-success-reaction="true"]');
    if (!reaction) return null;
    const card = document.querySelector<HTMLElement>(".focus-panel__live-card");
    const svg = reaction.querySelector("svg");
    if (!card || !svg) throw new Error("Enabled Focus success reaction is not mounted in its card");
    const rect = reaction.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    return {
      paintRegion: {
        x: Math.floor(rect.left), y: Math.floor(rect.top),
        width: Math.ceil(rect.right) - Math.floor(rect.left),
        height: Math.ceil(rect.bottom) - Math.floor(rect.top),
      },
      fitsCard: rect.left >= cardRect.left - 1 && rect.right <= cardRect.right + 1
        && rect.top >= cardRect.top - 1 && rect.bottom <= cardRect.bottom + 1,
      svgVisible: svgRect.width > 0 && svgRect.height > 0,
      notClipped: reaction.scrollHeight <= reaction.clientHeight + 1,
    };
  })(),

  liveCardStyle: styleContract(".focus-panel__live-card"),
  liveTimer: optionalBox(".focus-panel__live-timer"),
  liveTimerStyle: styleContract(".focus-panel__live-timer"),
  // Inspect the actual production chip paint/placement in both Pomodoro phases.
  pomodoroBadge: (() => {
    const badge = document.querySelector<HTMLElement>('[data-focus-pomodoro-badge="true"]');
    if (!badge) return null;
    const liveCard = document.querySelector<HTMLElement>(".focus-panel__live-card");
    if (!liveCard) throw new Error("POMO badge has no active Focus card");
    const badgeRect = badge.getBoundingClientRect();
    const cardRect = liveCard.getBoundingClientRect();
    const style = getComputedStyle(badge);
    return {
      text: badge.textContent?.trim() ?? "",
      width: badgeRect.width,
      height: badgeRect.height,
      color: style.color,
      borderColor: style.borderColor,
      visible: style.visibility === "visible" && style.opacity !== "0",
      fitsCard: badgeRect.left >= cardRect.left - 1 && badgeRect.right <= cardRect.right + 1
        && badgeRect.top >= cardRect.top - 1 && badgeRect.bottom <= cardRect.bottom + 1,
      notClipped: badge.scrollWidth <= badge.clientWidth + 1
        && badge.scrollHeight <= badge.clientHeight + 1,
    };
  })(),
  liveStateStyle: styleContract(".focus-panel__live-state"),
  metrics: optionalBox(".focus-panel__live-metrics"),
  metricRow: optionalBox(".focus-panel__metric-row"),
  metricInput: scenario === "paused-metrics" ? optionalBox(".focus-panel__metric-input") : null,
  subtasks: optionalBox(".focus-panel__subtasks"),
  subtaskRing: optionalBox(".focus-panel__subtask-ring"),
  actions: optionalBox(".focus-panel__live-actions"),
  // State-matched action-rail pixel bounds for focused versus resting PNGs.
  // This is measured from the actual production element, never hard-coded.
  focusActionPaintRegion: (() => {
    const rail = document.querySelector<HTMLElement>(".focus-panel__live-actions");
    if (!rail) return null;
    const rect = rail.getBoundingClientRect();
    return { x: Math.floor(rect.left), y: Math.floor(rect.top),
      width: Math.ceil(rect.right) - Math.floor(rect.left),
      height: Math.ceil(rect.bottom) - Math.floor(rect.top) };
  })(),
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
