import { invoke } from "@tauri-apps/api/core";
import { useEffect, useMemo, useState } from "react";
import { formatVisibleDate, formatVisibleTime } from "./dateTimeFormat";
import { formatInvokeError } from "./diagnosticApi";
import { FocusLiveActions } from "./FocusLiveActions";
import { FocusLiveTitle } from "./FocusLiveTitle";
import { FocusTaskRowTitle } from "./FocusTaskRowTitle";
import type { HomeSnapshot } from "./HomeDashboard";
import {
  getListBoardSnapshot,
  type ListBoardRequestTarget,
  type ListBoardSnapshot,
  type ListBoardTask,
} from "./listBoardApi";
import { Tooltip } from "./overlayPrimitives";
import {
  applyTimerSessionProjection,
  connectLiveTimerSessionProjection,
  type TimerSessionPayload,
  type TimerSnapshot,
} from "./timerSessionApi";
import "./focusPanel.css";

const ALL_LISTS_VALUE = "__all_lists__";

type FocusListOption = {
  id: string;
  title: string;
};

type FocusTimerPresentation = {
  text: string;
  label: string;
  mode: string;
};

export type FocusPanelProps = {
  fixtureBoard?: ListBoardSnapshot;
  fixtureLists?: FocusListOption[];
  fixtureTimer?: TimerSessionPayload | null;
  onRequestCompact?: () => void;
  compactTransitionPending?: boolean;
};

function formatEstimate(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "—";
  const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}hr`;
  return `${hours}hr ${minutes}min`;
}

function formatDuration(rawSeconds: string): string {
  const seconds = Number(rawSeconds);
  if (!Number.isFinite(seconds) || seconds <= 0) return "0min";
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}hr`;
  return `${hours}hr ${minutes}min`;
}

function formatTimerClock(milliseconds: number | null, rounding: "ceil" | "floor"): string {
  if (milliseconds === null || !Number.isFinite(milliseconds) || milliseconds < 0) return "--:--";
  const seconds = rounding === "ceil" ? Math.ceil(milliseconds / 1_000) : Math.floor(milliseconds / 1_000);
  if (!Number.isSafeInteger(seconds)) return "--:--";

  const hours = Math.floor(seconds / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  const remainingSeconds = seconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function focusTimerStateLabel(timer: TimerSnapshot): string {
  switch (timer.state) {
    case "running":
      return timer.mode?.kind === "pomodoro" ? "Pomodoro work" : "Running";
    case "paused":
      return timer.mode?.kind === "pomodoro" ? "Pomodoro paused" : "Paused";
    case "break":
      return timer.break_kind === "pomodoro" ? "Pomodoro break" : "Break";
    case "time_up":
      return "Time's Up";
    case "overtime_running":
      return "Overtime";
    case "overtime_paused":
      return "Overtime paused";
    case "idle":
      return "Idle";
  }
}

function focusTimerPresentation(timer: TimerSnapshot): FocusTimerPresentation {
  const mode = timer.mode?.kind ?? "none";
  const stateLabel = focusTimerStateLabel(timer);

  if (timer.state === "break") {
    const text = formatTimerClock(timer.break_remaining_ms, "ceil");
    return { text, label: `${stateLabel}: ${text} remaining`, mode };
  }
  if (timer.state === "time_up") {
    return { text: "00:00", label: "Time's Up", mode };
  }
  if (timer.state === "overtime_running" || timer.state === "overtime_paused") {
    const text = `+${formatTimerClock(timer.overtime_ms, "floor")}`;
    return { text, label: `${stateLabel}: ${text}`, mode };
  }
  if (timer.mode?.kind === "count_up") {
    const text = formatTimerClock(timer.work_elapsed_ms, "floor");
    return { text, label: `${stateLabel}: ${text} elapsed`, mode };
  }

  const text = formatTimerClock(timer.countdown_remaining_ms, "ceil");
  return { text, label: `${stateLabel}: ${text} remaining`, mode };
}

function taskScheduleLabel(task: ListBoardTask): string | null {
  if (!task.scheduledLocalDate) return null;
  try {
    if (task.scheduledLocalTime) return formatVisibleTime(task.scheduledLocalTime);
    return formatVisibleDate(task.scheduledLocalDate);
  } catch {
    return task.scheduledLocalTime ?? task.scheduledLocalDate;
  }
}

function subtaskLabel(task: ListBoardTask): string | null {
  const total = task.subtaskTotalCount ?? 0;
  if (total <= 0) return null;
  return `${task.subtaskCompletedCount ?? 0}/${total} subtasks`;
}

function FocusTaskRow({
  task,
  aggregateView,
  done = false,
  scheduled = false,
}: {
  task: ListBoardTask;
  aggregateView: boolean;
  done?: boolean;
  scheduled?: boolean;
}) {
  const schedule = taskScheduleLabel(task);
  return (
    <article
      className={`focus-panel__task-row${done ? " focus-panel__task-row--done" : ""}${task.isOverdue ? " focus-panel__task-row--overdue" : ""}`}
      data-focus-task-row={done ? "done" : scheduled ? "scheduled" : "remaining"}
      data-focus-overdue={task.isOverdue ? "true" : "false"}
      data-task-id={task.id}
    >
      <div className="focus-panel__task-main">
        <div className="focus-panel__task-title-row">
          <FocusTaskRowTitle title={task.title} />
          {aggregateView ? (
            <span
              className="focus-panel__list-chip"
              title={task.listTitle}
              style={task.listColor ? { borderColor: task.listColor } : undefined}
            >
              {task.listTitle}
            </span>
          ) : null}
        </div>
        <div className="focus-panel__task-meta type-metadata">
          {task.isOverdue ? <span className="focus-panel__overdue">Overdue</span> : null}
          {schedule ? <span>{schedule}</span> : null}
          {subtaskLabel(task) ? <span>{subtaskLabel(task)}</span> : null}
        </div>
      </div>
      {done ? <span className="focus-panel__done-time type-metadata">{formatDuration(task.timeTakenSeconds)}</span> : null}
    </article>
  );
}

function targetFromValue(value: string): ListBoardRequestTarget {
  return value === ALL_LISTS_VALUE ? { kind: "all" } : { kind: "list", id: value };
}

function sameTarget(left: ListBoardRequestTarget, right: ListBoardRequestTarget): boolean {
  if (left.kind !== right.kind) return false;
  if (left.kind === "all") return true;
  return right.kind === "list" && left.id === right.id;
}

export function FocusPanel({
  fixtureBoard,
  fixtureLists,
  fixtureTimer = null,
  onRequestCompact,
  compactTransitionPending = false,
}: FocusPanelProps) {
  const [target, setTarget] = useState<ListBoardRequestTarget>(() =>
    fixtureBoard?.target.kind === "list" && fixtureBoard.target.id
      ? { kind: "list", id: fixtureBoard.target.id }
      : { kind: "all" },
  );
  const [board, setBoard] = useState<ListBoardSnapshot | null>(fixtureBoard ?? null);
  const [lists, setLists] = useState<FocusListOption[]>(fixtureLists ?? []);
  const [timer, setTimer] = useState<TimerSessionPayload | null>(fixtureTimer);
  const [scrollingTitleEnabled, setScrollingTitleEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferenceError, setPreferenceError] = useState<string | null>(null);
  const fixtureMode = Boolean(fixtureBoard);

  useEffect(() => {
    if (fixtureBoard) {
      setBoard(fixtureBoard);
      setTarget(
        fixtureBoard.target.kind === "list" && fixtureBoard.target.id
          ? { kind: "list", id: fixtureBoard.target.id }
          : { kind: "all" },
      );
      setError(null);
      return;
    }

    let disposed = false;
    setBoard(null);
    void getListBoardSnapshot(target)
      .then((snapshot) => {
        if (!disposed) {
          setBoard(snapshot);
          setError(null);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setBoard(null);
          setError(formatInvokeError(failure));
        }
      });
    return () => {
      disposed = true;
    };
  }, [fixtureBoard, target.kind, target.kind === "list" ? target.id : null]);

  useEffect(() => {
    if (fixtureLists) {
      setLists(fixtureLists);
      return;
    }
    let disposed = false;
    void invoke<HomeSnapshot>("get_home_snapshot")
      .then((home) => {
        if (!disposed) setLists(home.lists.map((list) => ({ id: list.id, title: list.title })));
      })
      .catch((failure: unknown) => {
        if (!disposed) setError(formatInvokeError(failure));
      });
    return () => {
      disposed = true;
    };
  }, [fixtureLists]);

  useEffect(() => {
    if (fixtureMode) {
      setScrollingTitleEnabled(false);
      setPreferenceError(null);
      return;
    }

    let disposed = false;
    void invoke<boolean>("get_focus_scrolling_title_preference")
      .then((enabled) => {
        if (!disposed) {
          setScrollingTitleEnabled(enabled);
          setPreferenceError(null);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setScrollingTitleEnabled(false);
          setPreferenceError(formatInvokeError(failure));
        }
      });
    return () => {
      disposed = true;
    };
  }, [fixtureMode]);

  useEffect(() => {
    if (fixtureMode) {
      setTimer(fixtureTimer);
      return;
    }

    let disposed = false;
    let stopListening: (() => void) | undefined;
    void connectLiveTimerSessionProjection(
      (incoming) => {
        if (disposed) return;
        setTimer((current) => applyTimerSessionProjection(current, incoming));
        if (incoming.change) {
          const refreshTarget = target;
          void getListBoardSnapshot(refreshTarget)
            .then((snapshot) => {
              if (!disposed && sameTarget(refreshTarget, target)) setBoard(snapshot);
            })
            .catch((failure: unknown) => {
              if (!disposed) setError(formatInvokeError(failure));
            });
        }
      },
      (failure) => {
        if (!disposed) setError(formatInvokeError(failure));
      },
    )
      .then((unlisten) => {
        if (disposed) unlisten();
        else stopListening = unlisten;
      })
      .catch((failure: unknown) => {
        if (!disposed) setError(formatInvokeError(failure));
      });

    return () => {
      disposed = true;
      stopListening?.();
    };
  }, [fixtureMode, fixtureTimer, target.kind, target.kind === "list" ? target.id : null]);

  const selectorOptions = useMemo(() => {
    const options = [...lists];
    if (board?.target.kind === "list" && board.target.id && !options.some((list) => list.id === board.target.id)) {
      options.push({ id: board.target.id, title: board.target.title });
    }
    return options;
  }, [board, lists]);

  const statusError = error ?? preferenceError;

  if (error && !board) {
    return (
      <main className="focus-panel focus-panel--message" data-focus-panel="error" role="alert">
        <strong>Focus Panel could not be loaded.</strong>
        <span>{error}</span>
      </main>
    );
  }

  if (!board) {
    return (
      <main className="focus-panel focus-panel--message" data-focus-panel="loading" role="status">
        Loading Focus Panel…
      </main>
    );
  }

  const aggregateView = board.target.kind === "all_lists";
  const selectedValue = aggregateView ? ALL_LISTS_VALUE : board.target.id ?? ALL_LISTS_VALUE;
  const liveTaskId = timer?.runtime.timer.task_id ?? null;
  const liveTask = liveTaskId ? board.today.tasks.find((task) => task.id === liveTaskId) ?? null : null;
  const liveTimer = liveTask && timer ? focusTimerPresentation(timer.runtime.timer) : null;
  const remainingCandidates = board.today.tasks.filter((task) => task.id !== liveTaskId);
  const scheduledTasks = remainingCandidates.filter(
    (task) => task.scheduledLocalTime !== null && !task.isOverdue,
  );
  const scheduledIds = new Set(scheduledTasks.map((task) => task.id));
  const remainingTasks = remainingCandidates.filter((task) => !scheduledIds.has(task.id));
  const noEligibleVisualState = liveTask === null && remainingTasks.length === 0 && scheduledTasks.length > 0;
  const emptyTodayState = liveTask === null && remainingTasks.length === 0 && scheduledTasks.length === 0;
  const emptyStateKind = noEligibleVisualState ? "no-eligible" : emptyTodayState ? "empty" : "none";
  const doneTasks = board.done.tasks;
  const totalCount = board.today.count + board.done.count;
  const donePercent = totalCount > 0 ? Math.min(100, Math.round((board.done.count / totalCount) * 100)) : 0;

  return (
    <main className="focus-panel" data-focus-panel="main" data-focus-target={board.target.kind}>
      <header className="focus-panel__topbar">
        <label className="focus-panel__selector-wrap">
          <span className="sr-only">Focus list</span>
          <select
            className="focus-panel__selector"
            aria-label="Focus list"
            data-focus-list-selector="true"
            value={selectedValue}
            disabled={fixtureMode}
            onChange={(event) => setTarget(targetFromValue(event.currentTarget.value))}
          >
            <option value={ALL_LISTS_VALUE}>All</option>
            {selectorOptions.map((list) => (
              <option key={list.id} value={list.id}>{list.title}</option>
            ))}
          </select>
        </label>
        <h1 className="focus-panel__title">Today</h1>
        <div className="focus-panel__quick-controls" aria-label="Focus Panel quick controls">
          <Tooltip content="Preferences">
            <button type="button" aria-disabled="true" aria-label="Preferences" data-focus-placeholder-control="preferences">⚙</button>
          </Tooltip>
          <button type="button" disabled aria-label="Home" title="Home">Home</button>
          <Tooltip content="Compact view">
            <button
              type="button"
              aria-label="Compact view"
              data-focus-compact-control="true"
              disabled={!onRequestCompact || compactTransitionPending}
              onClick={onRequestCompact}
            >
              ↙
            </button>
          </Tooltip>
        </div>
      </header>

      <section className="focus-panel__summary" aria-label="Today progress">
        <div className="focus-panel__summary-row">
          <span className="type-metadata">Est: {formatEstimate(board.today.aggregateEstSeconds)}</span>
          <span className="type-metadata" data-focus-done-count="true">{board.done.count}/{totalCount} Done</span>
        </div>
        <div className="focus-panel__progress" aria-hidden="true">
          <span style={{ width: `${donePercent}%` }} />
        </div>
      </section>

      <section className="focus-panel__queue" aria-label="Focus queue">
        {liveTask ? (
          <article
            className="focus-panel__live-card"
            data-focus-live-card="true"
            data-task-id={liveTask.id}
            data-focus-live-state={timer?.runtime.timer.state ?? "idle"}
          >
            <div className="focus-panel__live-heading">
              <FocusLiveTitle title={liveTask.title} scrollingEnabled={scrollingTitleEnabled} />
              {liveTimer ? (
                <span
                  className="focus-panel__live-timer timer-numerals"
                  data-focus-live-timer="true"
                  data-focus-live-timer-mode={liveTimer.mode}
                  data-timer-numerals="true"
                  aria-label={liveTimer.label}
                  aria-live="off"
                >
                  {liveTimer.text}
                </span>
              ) : null}
            </div>
            <div className="focus-panel__live-meta type-metadata">
              {aggregateView ? <span className="focus-panel__list-chip">{liveTask.listTitle}</span> : null}
              {subtaskLabel(liveTask) ? <span>{subtaskLabel(liveTask)}</span> : null}
              {timer ? <span className="focus-panel__live-state">{focusTimerStateLabel(timer.runtime.timer)}</span> : null}
            </div>
            {timer ? (
              <FocusLiveActions
                key={liveTask.id}
                task={liveTask}
                target={target}
                timer={timer}
                fixtureMode={fixtureMode}
                onTimerPayload={(incoming) => {
                  setTimer((current) => applyTimerSessionProjection(current, incoming));
                }}
              />
            ) : null}
          </article>
        ) : (
          <div
            className={`focus-panel__live-card focus-panel__live-card--empty${noEligibleVisualState ? " focus-panel__live-card--no-eligible" : ""}`}
            data-focus-live-card="false"
            data-focus-live-state={noEligibleVisualState ? "no-eligible" : "idle"}
            data-focus-empty-state={emptyStateKind}
          >
            {noEligibleVisualState ? (
              <div className="focus-panel__empty-state">
                <strong>Nothing eligible yet</strong>
                <span className="type-metadata">Scheduled tasks will be ready when due.</span>
              </div>
            ) : emptyTodayState ? (
              <div className="focus-panel__empty-state">
                <strong>All Clear</strong>
                <span className="type-metadata">No Today tasks left to focus on.</span>
              </div>
            ) : (
              <span className="type-metadata">No live task in this view</span>
            )}
          </div>
        )}

        <div className="focus-panel__remaining" data-focus-group="remaining">
          {remainingTasks.map((task) => (
            <FocusTaskRow key={task.id} task={task} aggregateView={aggregateView} />
          ))}
        </div>

        <button className="focus-panel__add-task" type="button" disabled aria-label="Add task in Focus Panel">
          + ADD TASK
        </button>

        <section className="focus-panel__group" data-focus-group="scheduled" aria-labelledby="focus-scheduled-title">
          <h2 id="focus-scheduled-title" className="focus-panel__group-title">
            {scheduledTasks.length} Scheduled {scheduledTasks.length === 1 ? "task" : "tasks"}
          </h2>
          {scheduledTasks.map((task) => (
            <FocusTaskRow key={task.id} task={task} aggregateView={aggregateView} scheduled />
          ))}
        </section>

        <section className="focus-panel__group" data-focus-group="done" aria-labelledby="focus-done-title">
          <h2 id="focus-done-title" className="focus-panel__group-title">
            {doneTasks.length} Done
          </h2>
          {doneTasks.map((task) => (
            <FocusTaskRow key={task.id} task={task} aggregateView={aggregateView} done />
          ))}
        </section>
      </section>

      {statusError ? <div className="focus-panel__error type-metadata" role="status">{statusError}</div> : null}
    </main>
  );
}
