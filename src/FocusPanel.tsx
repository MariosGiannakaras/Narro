import { invoke } from "@tauri-apps/api/core";
import { useEffect, useMemo, useState } from "react";
import { formatVisibleDate, formatVisibleTime } from "./dateTimeFormat";
import { formatInvokeError } from "./diagnosticApi";
import { focusTimerPresentation, focusTimerStateLabel } from "./focusTimerPresentation";
import { FocusLiveActions, focusModeForTask } from "./FocusLiveActions";
import { FocusLiveTitle } from "./FocusLiveTitle";
import { FocusTaskRowTitle } from "./FocusTaskRowTitle";
import type { HomeSnapshot } from "./HomeDashboard";
import {
  completeListBoardTask,
  createListBoardTask,
  getListBoardSnapshot,
  permanentlyDeleteListBoardTask,
  reorderListBoardTask,
  type ListBoardRequestTarget,
  type ListBoardSnapshot,
  type ListBoardTask,
} from "./listBoardApi";
import { Tooltip } from "./overlayPrimitives";
import { TaskDeleteConfirmDialog } from "./TaskDeleteConfirmDialog";
import { TaskNotes } from "./TaskNotes";
import { TaskScheduleDialog } from "./TaskScheduleDialog";
import {
  applyTimerSessionProjection,
  connectLiveTimerSessionProjection,
  snapshotTimerSession,
  startTimerTask,
  switchTimerTask,
  type TimerSessionPayload,
} from "./timerSessionApi";
import "./focusPanel.css";

const ALL_LISTS_VALUE = "__all_lists__";

type FocusListOption = {
  id: string;
  title: string;
};

export type FocusPanelProps = {
  fixtureBoard?: ListBoardSnapshot;
  fixtureLists?: FocusListOption[];
  fixtureTimer?: TimerSessionPayload | null;
  onRequestCompact?: () => void;
  compactTransitionPending?: boolean;
  modeTransitionError?: string | null;
  onPresentationReady?: () => void;
};

type FocusTaskRowProps = {
  task: ListBoardTask;
  aggregateView: boolean;
  done?: boolean;
  scheduled?: boolean;
  disabled: boolean;
  notesExpanded: boolean;
  canMakeLive: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMakeLive: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onComplete: () => void;
  onToggleNotes: () => void;
  onSchedule: () => void;
  onDelete: () => void;
  onMutationStatus: (status: string, error: string | null) => void;
  onRefreshBlocked: (message: string) => void;
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
  disabled,
  notesExpanded,
  canMakeLive,
  canMoveUp,
  canMoveDown,
  onMakeLive,
  onMoveUp,
  onMoveDown,
  onComplete,
  onToggleNotes,
  onSchedule,
  onDelete,
  onMutationStatus,
  onRefreshBlocked,
}: FocusTaskRowProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const schedule = taskScheduleLabel(task);
  const ordinary = !done;

  const runMoreAction = (action: () => void) => {
    setMoreOpen(false);
    action();
  };

  return (
    <article
      className={`focus-panel__task-row${done ? " focus-panel__task-row--done" : ""}${task.isOverdue ? " focus-panel__task-row--overdue" : ""}`}
      data-focus-task-row={done ? "done" : scheduled ? "scheduled" : "remaining"}
      data-focus-overdue={task.isOverdue ? "true" : "false"}
      data-task-id={task.id}
    >
      <div className="focus-panel__task-row-mainline">
        <span className="focus-panel__task-completion-slot">
          {ordinary ? (
            <Tooltip content="Complete task">
              <button
                type="button"
                className="focus-panel__row-action focus-panel__row-action--complete motion-interactive"
                data-focus-row-action="complete"
                aria-label={`Complete task: ${task.title}`}
                disabled={disabled}
                onClick={onComplete}
              >
                ○
              </button>
            </Tooltip>
          ) : (
            <span className="focus-panel__done-mark" aria-hidden="true">✓</span>
          )}
        </span>

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

        {ordinary ? (
          <div
            className="focus-panel__row-action-slot"
            data-focus-row-action-slot="reserved"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                setMoreOpen(false);
              }
            }}
          >
            <div className="focus-panel__row-actions">
              <Tooltip content="Make live">
                <button
                  type="button"
                  className="focus-panel__row-action motion-interactive"
                  data-focus-row-action="make-live"
                  aria-label={`Make live: ${task.title}`}
                  disabled={disabled || !canMakeLive}
                  onClick={onMakeLive}
                >
                  🚀
                </button>
              </Tooltip>
              <Tooltip content="Move up">
                <button
                  type="button"
                  className="focus-panel__row-action motion-interactive"
                  data-focus-row-action="move-up"
                  aria-label={`Move up: ${task.title}`}
                  disabled={disabled || !canMoveUp}
                  onClick={onMoveUp}
                >
                  ↑
                </button>
              </Tooltip>
              <Tooltip content="Move down">
                <button
                  type="button"
                  className="focus-panel__row-action motion-interactive"
                  data-focus-row-action="move-down"
                  aria-label={`Move down: ${task.title}`}
                  disabled={disabled || !canMoveDown}
                  onClick={onMoveDown}
                >
                  ↓
                </button>
              </Tooltip>
              <Tooltip content="More task actions">
                <button
                  type="button"
                  className="focus-panel__row-action motion-interactive"
                  data-focus-row-action="more"
                  aria-label={`More actions for ${task.title}`}
                  aria-expanded={moreOpen}
                  disabled={disabled}
                  onClick={() => setMoreOpen((open) => !open)}
                >
                  ⋯
                </button>
              </Tooltip>
            </div>
            {moreOpen ? (
              <div className="focus-panel__row-menu" role="menu" aria-label={`Actions for ${task.title}`}>
                <button type="button" role="menuitem" onClick={() => runMoreAction(onToggleNotes)}>
                  {notesExpanded ? "Close Notes" : "Notes"}
                </button>
                <button type="button" role="menuitem" onClick={() => runMoreAction(onSchedule)}>
                  Schedule
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="focus-panel__row-menu-delete"
                  onClick={() => runMoreAction(onDelete)}
                >
                  Permanently delete
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <span className="focus-panel__done-time type-metadata">{formatDuration(task.timeTakenSeconds)}</span>
        )}
      </div>

      {ordinary && notesExpanded ? (
        <div className="focus-panel__row-notes">
          <TaskNotes
            taskId={task.id}
            listId={task.listId}
            taskTitle={task.title}
            expanded
            canExpand
            readOnly={false}
            onToggleExpanded={onToggleNotes}
            onMutationStatus={onMutationStatus}
            onRefreshBlocked={onRefreshBlocked}
          />
        </div>
      ) : null}
    </article>
  );
}

function targetFromValue(value: string): ListBoardRequestTarget {
  return value === ALL_LISTS_VALUE ? { kind: "all" } : { kind: "list", id: value };
}

function targetKey(target: ListBoardRequestTarget): string {
  return target.kind === "all" ? "all" : `list:${target.id}`;
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
  modeTransitionError = null,
  onPresentationReady,
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
  const [boardReadyTargetKey, setBoardReadyTargetKey] = useState<string | null>(null);
  const [timerSettled, setTimerSettled] = useState(Boolean(fixtureBoard));
  const [mutationPendingTaskId, setMutationPendingTaskId] = useState<string | null>(null);
  const [mutationStatus, setMutationStatus] = useState<string | null>(null);
  const [notesTaskId, setNotesTaskId] = useState<string | null>(null);
  const [scheduleTaskId, setScheduleTaskId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ListBoardTask | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addTaskTitle, setAddTaskTitle] = useState("");
  const [addTaskListId, setAddTaskListId] = useState("");
  const [addTaskPending, setAddTaskPending] = useState(false);
  const [homePending, setHomePending] = useState(false);
  const fixtureMode = Boolean(fixtureBoard);
  const currentTargetKey = targetKey(target);

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
    setBoardReadyTargetKey(null);
    void getListBoardSnapshot(target)
      .then((snapshot) => {
        if (!disposed) {
          setBoard(snapshot);
          setBoardReadyTargetKey(targetKey(target));
          setError(null);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setBoard(null);
          setBoardReadyTargetKey(targetKey(target));
          setError(formatInvokeError(failure));
        }
      });
    return () => {
      disposed = true;
    };
  }, [fixtureBoard, target.kind, target.kind === "list" ? target.id : null]);

  useEffect(() => {
    setNotesTaskId(null);
    setScheduleTaskId(null);
    setDeleteTarget(null);
    setDeleteError(null);
    setAddTaskOpen(false);
    setAddTaskTitle("");
    setMutationStatus(null);
  }, [target.kind, target.kind === "list" ? target.id : null]);

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
      setTimerSettled(true);
      return;
    }

    let disposed = false;
    let stopListening: (() => void) | undefined;
    setTimerSettled(false);
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
        else {
          stopListening = unlisten;
          setTimerSettled(true);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setTimerSettled(true);
          setError(formatInvokeError(failure));
        }
      });

    return () => {
      disposed = true;
      stopListening?.();
    };
  }, [fixtureMode, fixtureTimer, target.kind, target.kind === "list" ? target.id : null]);

  useEffect(() => {
    if (fixtureMode || (timerSettled && boardReadyTargetKey === currentTargetKey)) {
      onPresentationReady?.();
    }
  }, [boardReadyTargetKey, currentTargetKey, fixtureMode, onPresentationReady, timerSettled]);

  const selectorOptions = useMemo(() => {
    const options = [...lists];
    if (board?.target.kind === "list" && board.target.id && !options.some((list) => list.id === board.target.id)) {
      options.push({ id: board.target.id, title: board.target.title });
    }
    return options;
  }, [board, lists]);

  const refreshBoard = async (): Promise<ListBoardSnapshot> => {
    const refreshed = await getListBoardSnapshot(target);
    setBoard(refreshed);
    setError(null);
    return refreshed;
  };

  const commitRowMutation = async (
    task: ListBoardTask,
    mutation: () => Promise<void>,
    success: string,
  ) => {
    if (fixtureMode || mutationPendingTaskId !== null) return;
    setMutationPendingTaskId(task.id);
    setMutationStatus(null);
    setError(null);
    try {
      await mutation();
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
      setMutationPendingTaskId(null);
      return;
    }

    setMutationStatus(success);
    try {
      await refreshBoard();
    } catch (failure: unknown) {
      setError(
        `Task change was saved, but Focus could not refresh. ${formatInvokeError(failure)} Reopen Focus before making more task changes.`,
      );
    } finally {
      setMutationPendingTaskId(null);
    }
  };

  const makeTaskLive = async (task: ListBoardTask) => {
    if (fixtureMode || mutationPendingTaskId !== null) return;
    setMutationPendingTaskId(task.id);
    setMutationStatus(null);
    setError(null);
    try {
      const authoritative = await snapshotTimerSession();
      if (authoritative.runtime.timer.state === "break") {
        throw new Error("Resume work before switching the live task.");
      }
      const mode = focusModeForTask(authoritative.runtime.timer.mode, task);
      const payload = authoritative.runtime.timer.task_id === null
        || authoritative.runtime.timer.state === "idle"
        ? await startTimerTask(task.id, mode)
        : await switchTimerTask(task.id, mode);
      setTimer((current) => applyTimerSessionProjection(current, payload));
      setNotesTaskId(null);
      setMutationStatus(`${task.title} is now live.`);
      await refreshBoard();
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
    } finally {
      setMutationPendingTaskId(null);
    }
  };

  const exitFocusHome = async () => {
    if (fixtureMode || homePending) return;
    setHomePending(true);
    setError(null);
    try {
      await invoke<void>("focus_surface_exit_to_main");
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
    } finally {
      setHomePending(false);
    }
  };

  const submitAddTask = async () => {
    if (fixtureMode || addTaskPending) return;
    const title = addTaskTitle.trim();
    const listId = target.kind === "list" ? target.id : addTaskListId;
    if (!title) {
      setError("Task title must not be empty.");
      return;
    }
    if (!listId) {
      setError("Choose the list that will own this task.");
      return;
    }

    setAddTaskPending(true);
    setError(null);
    setMutationStatus(null);
    try {
      await createListBoardTask({
        listId,
        lane: "today",
        title,
        estSeconds: null,
        insertAtTop: false,
      });
      await refreshBoard();
      setAddTaskTitle("");
      setAddTaskOpen(false);
      setMutationStatus(`Added ${title} to Today.`);
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
    } finally {
      setAddTaskPending(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deletePending) return;
    const task = deleteTarget;
    setDeletePending(true);
    setDeleteError(null);
    setError(null);
    try {
      await permanentlyDeleteListBoardTask({ taskId: task.id, listId: task.listId });
    } catch (failure: unknown) {
      setDeleteError(formatInvokeError(failure));
      setDeletePending(false);
      return;
    }

    setDeleteTarget(null);
    setDeletePending(false);
    setNotesTaskId((current) => current === task.id ? null : current);
    setMutationStatus(`Permanently deleted ${task.title}.`);
    try {
      await refreshBoard();
    } catch (failure: unknown) {
      setError(
        `Task was deleted, but Focus could not refresh. ${formatInvokeError(failure)} Reopen Focus before making more task changes.`,
      );
    }
  };

  const statusError = error ?? preferenceError ?? modeTransitionError;

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
  const reorderableTasks = target.kind === "list"
    ? remainingTasks.filter((task) => task.scheduledLocalDate === null && task.listId === target.id)
    : [];
  const reorderIndex = new Map(reorderableTasks.map((task, index) => [task.id, index]));
  const noEligibleVisualState = liveTask === null && remainingTasks.length === 0 && scheduledTasks.length > 0;
  const emptyTodayState = liveTask === null && remainingTasks.length === 0 && scheduledTasks.length === 0;
  const emptyStateKind = noEligibleVisualState ? "no-eligible" : emptyTodayState ? "empty" : "none";
  const doneTasks = board.done.tasks;
  const totalCount = board.today.count + board.done.count;
  const donePercent = totalCount > 0 ? Math.min(100, Math.round((board.done.count / totalCount) * 100)) : 0;
  const rowInteractionDisabled = fixtureMode
    || mutationPendingTaskId !== null
    || scheduleTaskId !== null
    || deleteTarget !== null
    || addTaskPending;
  const scheduleTask = scheduleTaskId
    ? [...remainingTasks, ...scheduledTasks].find((task) => task.id === scheduleTaskId) ?? null
    : null;

  const moveFocusTask = (task: ListBoardTask, direction: "up" | "down") => {
    const index = reorderIndex.get(task.id);
    if (index === undefined) return;
    const beforeTaskId = direction === "up"
      ? reorderableTasks[index - 1]?.id ?? null
      : reorderableTasks[index + 2]?.id ?? null;
    void commitRowMutation(
      task,
      () => reorderListBoardTask({
        taskId: task.id,
        listId: task.listId,
        sourceLane: "today",
        beforeTaskId,
      }),
      `Moved ${task.title} ${direction}.`,
    );
  };

  const renderTaskRow = (task: ListBoardTask, scheduled = false) => {
    const index = reorderIndex.get(task.id);
    return (
      <FocusTaskRow
        key={task.id}
        task={task}
        aggregateView={aggregateView}
        scheduled={scheduled}
        disabled={rowInteractionDisabled || mutationPendingTaskId === task.id}
        notesExpanded={notesTaskId === task.id}
        canMakeLive={!scheduled}
        canMoveUp={index !== undefined && index > 0}
        canMoveDown={index !== undefined && index < reorderableTasks.length - 1}
        onMakeLive={() => void makeTaskLive(task)}
        onMoveUp={() => moveFocusTask(task, "up")}
        onMoveDown={() => moveFocusTask(task, "down")}
        onComplete={() => void commitRowMutation(
          task,
          () => completeListBoardTask({ taskId: task.id, listId: task.listId }),
          `Completed ${task.title}.`,
        )}
        onToggleNotes={() => setNotesTaskId((current) => current === task.id ? null : task.id)}
        onSchedule={() => {
          setNotesTaskId(null);
          setScheduleTaskId(task.id);
        }}
        onDelete={() => {
          setNotesTaskId(null);
          setDeleteError(null);
          setDeleteTarget(task);
        }}
        onMutationStatus={(status, detail) => {
          setMutationStatus(status || null);
          setError(detail);
        }}
        onRefreshBlocked={(message) => {
          setMutationStatus(null);
          setError(message);
        }}
      />
    );
  };

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
            disabled={fixtureMode || mutationPendingTaskId !== null || addTaskPending}
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
          <Tooltip content="Home">
            <button
              type="button"
              aria-label="Home"
              data-focus-home-control="true"
              disabled={fixtureMode || homePending}
              onClick={() => void exitFocusHome()}
            >
              Home
            </button>
          </Tooltip>
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
                onTaskMutationCommitted={async () => {
                  await refreshBoard();
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
          {remainingTasks.map((task) => renderTaskRow(task))}
        </div>

        {!addTaskOpen ? (
          <button
            className="focus-panel__add-task"
            type="button"
            data-focus-add-task="open"
            disabled={fixtureMode || addTaskPending || mutationPendingTaskId !== null}
            aria-label="Add task in Focus Panel"
            onClick={() => {
              setAddTaskOpen(true);
              setAddTaskTitle("");
              setAddTaskListId(target.kind === "list" ? target.id : selectorOptions[0]?.id ?? "");
              setError(null);
            }}
          >
            + ADD TASK
          </button>
        ) : (
          <form
            className="focus-panel__add-task-editor"
            data-focus-add-task="editor"
            onSubmit={(event) => {
              event.preventDefault();
              void submitAddTask();
            }}
          >
            {aggregateView ? (
              <label>
                <span className="type-metadata">List</span>
                <select
                  value={addTaskListId}
                  data-focus-add-task-list="true"
                  disabled={addTaskPending}
                  onChange={(event) => setAddTaskListId(event.target.value)}
                >
                  <option value="">Choose list</option>
                  {selectorOptions.map((list) => (
                    <option key={list.id} value={list.id}>{list.title}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <label>
              <span className="type-metadata">Task title</span>
              <input
                value={addTaskTitle}
                data-focus-add-task-title="true"
                autoFocus
                disabled={addTaskPending}
                onChange={(event) => setAddTaskTitle(event.target.value)}
                placeholder="What needs doing?"
              />
            </label>
            <div className="focus-panel__add-task-actions">
              <button
                type="button"
                disabled={addTaskPending}
                onClick={() => {
                  setAddTaskOpen(false);
                  setAddTaskTitle("");
                  setError(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addTaskPending || addTaskTitle.trim().length === 0 || (aggregateView && !addTaskListId)}
              >
                {addTaskPending ? "Adding…" : "Add task"}
              </button>
            </div>
          </form>
        )}

        <section className="focus-panel__group" data-focus-group="scheduled" aria-labelledby="focus-scheduled-title">
          <h2 id="focus-scheduled-title" className="focus-panel__group-title">
            {scheduledTasks.length} Scheduled {scheduledTasks.length === 1 ? "task" : "tasks"}
          </h2>
          {scheduledTasks.map((task) => renderTaskRow(task, true))}
        </section>

        <section className="focus-panel__group" data-focus-group="done" aria-labelledby="focus-done-title">
          <h2 id="focus-done-title" className="focus-panel__group-title">
            {doneTasks.length} Done
          </h2>
          {doneTasks.map((task) => (
            <FocusTaskRow
              key={task.id}
              task={task}
              aggregateView={aggregateView}
              done
              disabled
              notesExpanded={false}
              canMakeLive={false}
              canMoveUp={false}
              canMoveDown={false}
              onMakeLive={() => {}}
              onMoveUp={() => {}}
              onMoveDown={() => {}}
              onComplete={() => {}}
              onToggleNotes={() => {}}
              onSchedule={() => {}}
              onDelete={() => {}}
              onMutationStatus={() => {}}
              onRefreshBlocked={() => {}}
            />
          ))}
        </section>
      </section>

      {deleteTarget ? (
        <TaskDeleteConfirmDialog
          taskTitle={deleteTarget.title}
          pending={deletePending}
          error={deleteError}
          onCancel={() => {
            if (deletePending) return;
            setDeleteTarget(null);
            setDeleteError(null);
          }}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}

      {scheduleTask ? (
        <TaskScheduleDialog
          taskId={scheduleTask.id}
          listId={scheduleTask.listId}
          taskTitle={scheduleTask.title}
          displayTimezone={board.displayTimezone}
          onClose={() => setScheduleTaskId(null)}
          onCommitted={async (_taskId, message, warning) => {
            setMutationStatus(warning ? `${message} ${warning}` : message);
            await refreshBoard();
            setScheduleTaskId(null);
          }}
        />
      ) : null}

      {mutationStatus ? (
        <div className="focus-panel__status type-metadata" role="status">{mutationStatus}</div>
      ) : null}
      {statusError ? <div className="focus-panel__error type-metadata" role="alert">{statusError}</div> : null}
    </main>
  );
}
