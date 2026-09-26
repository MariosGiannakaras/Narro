import { invoke } from "@tauri-apps/api/core";
import { useEffect, useMemo, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import { focusTimerPresentation, focusTimerStateLabel } from "./focusTimerPresentation";
import { FocusLiveActions } from "./FocusLiveActions";
import { FocusLiveTitle } from "./FocusLiveTitle";
import { FocusTaskRow } from "./FocusTaskRow";
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
import { TaskScheduleDialog } from "./TaskScheduleDialog";
import {
  applyTimerSessionProjection,
  connectLiveTimerSessionProjection,
  snapshotTimerSession,
  startTimerTask,
  switchTimerTask,
  type TimerMode,
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

function formatEstimate(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "—";
  const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}hr`;
  return `${hours}hr ${minutes}min`;
}

function subtaskLabel(task: ListBoardTask): string | null {
  const total = task.subtaskTotalCount ?? 0;
  if (total <= 0) return null;
  return `${task.subtaskCompletedCount ?? 0}/${total} subtasks`;
}

function isEligibleFocusTask(task: ListBoardTask): boolean {
  return task.scheduledLocalTime === null || task.isOverdue;
}

function modeForFocusTask(currentMode: TimerMode | null, task: ListBoardTask): TimerMode {
  if (currentMode?.kind === "pomodoro") return currentMode;
  if (task.estSeconds !== null && Number.isSafeInteger(task.estSeconds) && task.estSeconds > 0) {
    return { kind: "est_countdown", est_ms: task.estSeconds * 1_000 };
  }
  return { kind: "count_up" };
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
  const [mutationStatus, setMutationStatus] = useState("");
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [mutationRefreshBlocked, setMutationRefreshBlocked] = useState(false);
  const [scheduleTask, setScheduleTask] = useState<ListBoardTask | null>(null);
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

  const statusError = error ?? mutationError ?? preferenceError ?? modeTransitionError;

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
  const queueReorderTasks = aggregateView
    ? []
    : remainingTasks.filter((task) => task.scheduledLocalDate === null);
  const interactionBlocked = fixtureMode
    || mutationRefreshBlocked
    || mutationPendingTaskId !== null
    || deleteTarget !== null
    || scheduleTask !== null
    || addTaskPending
    || homePending;

  const refreshBoard = async () => {
    const refreshed = await getListBoardSnapshot(target);
    setBoard(refreshed);
    return refreshed;
  };

  const handleCommittedRefreshFailure = (failure: unknown) => {
    setMutationRefreshBlocked(true);
    setMutationError(
      `Task change was saved, but Focus could not refresh. ${formatInvokeError(failure)} Reopen Focus before making more task changes.`,
    );
  };

  const refreshAfterCommittedTaskChange = async () => {
    try {
      await refreshBoard();
      setMutationRefreshBlocked(false);
    } catch (failure: unknown) {
      handleCommittedRefreshFailure(failure);
    }
  };

  const makeTaskLive = async (task: ListBoardTask) => {
    if (interactionBlocked || !isEligibleFocusTask(task)) return;
    setMutationPendingTaskId(task.id);
    setMutationError(null);
    setMutationStatus("");
    try {
      const authoritative = await snapshotTimerSession();
      if (authoritative.runtime.timer.state === "break") {
        throw new Error("Resume work before switching the live task.");
      }
      if (authoritative.runtime.timer.task_id === task.id && authoritative.runtime.timer.state !== "idle") {
        setTimer((current) => applyTimerSessionProjection(current, authoritative));
        setMutationStatus(`${task.title} is already live.`);
        return;
      }

      const mode = modeForFocusTask(authoritative.runtime.timer.mode, task);
      const payload = authoritative.runtime.timer.state === "idle" || authoritative.runtime.timer.task_id === null
        ? await startTimerTask(task.id, mode)
        : await switchTimerTask(task.id, mode);
      setTimer((current) => applyTimerSessionProjection(current, payload));
      setMutationStatus(`${task.title} is now live.`);
      await refreshAfterCommittedTaskChange();
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
      setMutationStatus(`Could not make ${task.title} live.`);
    } finally {
      setMutationPendingTaskId(null);
    }
  };

  const completeTask = async (task: ListBoardTask) => {
    if (interactionBlocked || task.completedAt !== null) return;
    setMutationPendingTaskId(task.id);
    setMutationError(null);
    try {
      await completeListBoardTask({ taskId: task.id, listId: task.listId });
      setMutationStatus(`Completed ${task.title}.`);
      await refreshAfterCommittedTaskChange();
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
      setMutationStatus(`Could not complete ${task.title}.`);
    } finally {
      setMutationPendingTaskId(null);
    }
  };

  const moveQueueTask = async (task: ListBoardTask, direction: "up" | "down") => {
    if (interactionBlocked || aggregateView || task.scheduledLocalDate !== null) return;
    const index = queueReorderTasks.findIndex((candidate) => candidate.id === task.id);
    if (index < 0) return;
    const beforeTaskId = direction === "up"
      ? queueReorderTasks[index - 1]?.id ?? null
      : queueReorderTasks[index + 2]?.id ?? null;
    if ((direction === "up" && index === 0) || (direction === "down" && index === queueReorderTasks.length - 1)) return;

    setMutationPendingTaskId(task.id);
    setMutationError(null);
    try {
      await reorderListBoardTask({
        taskId: task.id,
        listId: task.listId,
        sourceLane: "today",
        beforeTaskId,
      });
      setMutationStatus(`Reordered ${task.title}.`);
      await refreshAfterCommittedTaskChange();
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
      setMutationStatus(`Could not reorder ${task.title}.`);
    } finally {
      setMutationPendingTaskId(null);
    }
  };

  const requestDelete = (task: ListBoardTask) => {
    if (interactionBlocked) return;
    setDeleteError(null);
    setMutationError(null);
    setDeleteTarget(task);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deletePending) return;
    const task = deleteTarget;
    setDeletePending(true);
    setMutationPendingTaskId(task.id);
    setDeleteError(null);
    try {
      await permanentlyDeleteListBoardTask({ taskId: task.id, listId: task.listId });
      setDeleteTarget(null);
      setMutationStatus(`Permanently deleted ${task.title}.`);
      await refreshAfterCommittedTaskChange();
    } catch (failure: unknown) {
      setDeleteError(formatInvokeError(failure));
    } finally {
      setDeletePending(false);
      setMutationPendingTaskId(null);
    }
  };

  const handleScheduleCommitted = async (
    taskId: string,
    message: string,
    warning?: string | null,
  ) => {
    setMutationPendingTaskId(taskId);
    setScheduleTask(null);
    setMutationStatus(message);
    setMutationError(warning
      ? `Recurrence change was saved, but immediate occurrence materialization failed. ${warning} Background recurrence processing will retry.`
      : null);
    await refreshAfterCommittedTaskChange();
    setMutationPendingTaskId(null);
  };

  const submitAddTask = async () => {
    const title = addTaskTitle.trim();
    const listId = aggregateView ? addTaskListId : board.target.id;
    if (!title || !listId || addTaskPending || mutationRefreshBlocked) return;
    setAddTaskPending(true);
    setMutationError(null);
    try {
      await createListBoardTask({
        listId,
        lane: "today",
        title,
        estSeconds: null,
        insertAtTop: false,
      });
      setAddTaskOpen(false);
      setAddTaskTitle("");
      setAddTaskListId("");
      setMutationStatus(`Added ${title} to Today.`);
      await refreshAfterCommittedTaskChange();
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
      setMutationStatus(`Could not add ${title}.`);
    } finally {
      setAddTaskPending(false);
    }
  };

  const exitToHome = async () => {
    if (fixtureMode || homePending) return;
    setHomePending(true);
    setMutationError(null);
    try {
      await invoke<void>("exit_focus_to_main");
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
      setHomePending(false);
    }
  };

  const applyTaskProjection = (projected: ListBoardTask) => {
    setBoard((current) => current
      ? {
          ...current,
          today: {
            ...current.today,
            tasks: current.today.tasks.map((task) => task.id === projected.id ? projected : task),
          },
        }
      : current);
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
          <button
            type="button"
            aria-label="Home"
            title="Home"
            data-focus-home-control="true"
            disabled={fixtureMode || homePending}
            onClick={() => void exitToHome()}
          >
            {homePending ? "…" : "Home"}
          </button>
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
                onTaskTitleCommitted={async () => {
                  await refreshAfterCommittedTaskChange();
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
          {remainingTasks.map((task) => {
            const reorderIndex = queueReorderTasks.findIndex((candidate) => candidate.id === task.id);
            return (
              <FocusTaskRow
                key={task.id}
                task={task}
                target={target}
                aggregateView={aggregateView}
                fixtureMode={fixtureMode}
                pending={interactionBlocked || mutationPendingTaskId === task.id}
                canMakeLive={Boolean(timer) && timer?.runtime.timer.state !== "break" && isEligibleFocusTask(task)}
                canMoveUp={!aggregateView && task.scheduledLocalDate === null && reorderIndex > 0}
                canMoveDown={!aggregateView && task.scheduledLocalDate === null && reorderIndex >= 0 && reorderIndex < queueReorderTasks.length - 1}
                onComplete={(candidate) => void completeTask(candidate)}
                onMakeLive={(candidate) => void makeTaskLive(candidate)}
                onSchedule={(candidate) => {
                  if (!interactionBlocked) setScheduleTask(candidate);
                }}
                onMove={(candidate, direction) => void moveQueueTask(candidate, direction)}
                onDelete={requestDelete}
                onStatus={(status, detail) => {
                  setMutationStatus(status);
                  setMutationError(detail);
                }}
                onRefreshBlocked={(message) => {
                  setMutationRefreshBlocked(true);
                  setMutationError(message);
                }}
                onTaskProjection={applyTaskProjection}
              />
            );
          })}
        </div>

        {addTaskOpen ? (
          <form
            className="focus-panel__add-task-editor"
            data-focus-add-task-editor="true"
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
                  disabled={addTaskPending}
                  aria-label="List for new Focus task"
                  onChange={(event) => setAddTaskListId(event.target.value)}
                >
                  <option value="">Choose list</option>
                  {selectorOptions.map((list) => <option key={list.id} value={list.id}>{list.title}</option>)}
                </select>
              </label>
            ) : null}
            <label className="focus-panel__add-task-title">
              <span className="type-metadata">Task title</span>
              <input
                value={addTaskTitle}
                autoFocus={!fixtureMode}
                disabled={addTaskPending}
                aria-label="New Focus task title"
                onChange={(event) => setAddTaskTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && !addTaskPending) {
                    event.preventDefault();
                    setAddTaskOpen(false);
                    setAddTaskTitle("");
                    setAddTaskListId("");
                  }
                }}
              />
            </label>
            <div className="focus-panel__add-task-actions">
              <button
                type="button"
                disabled={addTaskPending}
                onClick={() => {
                  setAddTaskOpen(false);
                  setAddTaskTitle("");
                  setAddTaskListId("");
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addTaskPending || !addTaskTitle.trim() || (aggregateView && !addTaskListId)}
              >
                {addTaskPending ? "Adding…" : "Add"}
              </button>
            </div>
          </form>
        ) : (
          <button
            className="focus-panel__add-task"
            type="button"
            aria-label="Add task in Focus Panel"
            data-focus-add-task-control="true"
            disabled={fixtureMode || interactionBlocked}
            onClick={() => {
              setAddTaskOpen(true);
              setAddTaskTitle("");
              setAddTaskListId(target.kind === "list" ? target.id : "");
              setMutationError(null);
            }}
          >
            + ADD TASK
          </button>
        )}

        <section className="focus-panel__group" data-focus-group="scheduled" aria-labelledby="focus-scheduled-title">
          <h2 id="focus-scheduled-title" className="focus-panel__group-title">
            {scheduledTasks.length} Scheduled {scheduledTasks.length === 1 ? "task" : "tasks"}
          </h2>
          {scheduledTasks.map((task) => (
            <FocusTaskRow
              key={task.id}
              task={task}
              target={target}
              aggregateView={aggregateView}
              fixtureMode={fixtureMode}
              scheduled
              pending={interactionBlocked || mutationPendingTaskId === task.id}
              canMakeLive={false}
              canMoveUp={false}
              canMoveDown={false}
              onComplete={(candidate) => void completeTask(candidate)}
              onMakeLive={(candidate) => void makeTaskLive(candidate)}
              onSchedule={(candidate) => {
                if (!interactionBlocked) setScheduleTask(candidate);
              }}
              onMove={(candidate, direction) => void moveQueueTask(candidate, direction)}
              onDelete={requestDelete}
              onStatus={(status, detail) => {
                setMutationStatus(status);
                setMutationError(detail);
              }}
              onRefreshBlocked={(message) => {
                setMutationRefreshBlocked(true);
                setMutationError(message);
              }}
              onTaskProjection={applyTaskProjection}
            />
          ))}
        </section>

        <section className="focus-panel__group" data-focus-group="done" aria-labelledby="focus-done-title">
          <h2 id="focus-done-title" className="focus-panel__group-title">
            {doneTasks.length} Done
          </h2>
          {doneTasks.map((task) => (
            <FocusTaskRow
              key={task.id}
              task={task}
              target={target}
              aggregateView={aggregateView}
              fixtureMode={fixtureMode}
              done
              pending
              canMakeLive={false}
              canMoveUp={false}
              canMoveDown={false}
              onComplete={() => {}}
              onMakeLive={() => {}}
              onSchedule={() => {}}
              onMove={() => {}}
              onDelete={() => {}}
              onStatus={() => {}}
              onRefreshBlocked={() => {}}
              onTaskProjection={() => {}}
            />
          ))}
        </section>
      </section>

      {mutationStatus ? <div className="focus-panel__action-status type-metadata" role="status">{mutationStatus}</div> : null}
      {statusError ? <div className="focus-panel__error type-metadata" role="status">{statusError}</div> : null}

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
          onClose={() => setScheduleTask(null)}
          onCommitted={handleScheduleCommitted}
        />
      ) : null}
    </main>
  );
}
