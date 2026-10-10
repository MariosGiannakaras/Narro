import { invoke } from "@tauri-apps/api/core";
import { type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { formatVisibleDate, formatVisibleTime } from "./dateTimeFormat";
import { focusOverdueAge } from "./focusOverdueAge";
import { listenForBoardInvalidation } from "./boardInvalidation";
import { formatInvokeError } from "./diagnosticApi";
import { focusTimerPresentation, focusTimerStateLabel } from "./focusTimerPresentation";
import { FocusLiveActions, focusModeForTask } from "./FocusLiveActions";
import type { FocusCompletionSuccessState } from "./FocusCompletionSuccess";
import { FocusLiveTitle } from "./FocusLiveTitle";
import { FocusLiveSubtasks } from "./FocusLiveSubtasks";
import { FocusQuickPreferences } from "./FocusQuickPreferences";
import { FocusTaskRowTitle } from "./FocusTaskRowTitle";
import { useFocusListCatalog } from "./useFocusListCatalog";
import {
  changeListBoardTask,
  completeListBoardTask,
  createListBoardTask,
  duplicateListBoardTask,
  getListBoardSnapshot,
  permanentlyDeleteListBoardTask,
  reorderListBoardTask,
  type ListBoardRequestTarget,
  type ListBoardSnapshot,
  type ListBoardTask,
} from "./listBoardApi";
import { Tooltip } from "./overlayPrimitives";
import { TaskChangeListDialog } from "./TaskChangeListDialog";
import { TaskDeleteConfirmDialog } from "./TaskDeleteConfirmDialog";
import { parseEstimateSuffix } from "./taskEstimateParser";
import { beginFocusTaskPointerDrag } from "./focusTaskPointerDrag";
import { usePreferenceSettingsProjection } from "./usePreferenceSettingsProjection";
import { TaskNotes } from "./TaskNotes";
import { TaskScheduleDialog } from "./TaskScheduleDialog";
import {
  applyTimerSessionProjection,
  connectLiveTimerSessionProjection,
  pauseTimerForFocusHome,
  resumeTimerFromFocusHome,
  snapshotTimerSession,
  startTimerTask,
  switchTimerTask,
  type TimerSessionPayload,
} from "./timerSessionApi";
import { waitForPresentedFrame } from "./presentationFrame";
import "./focusPanel.css";

const ALL_LISTS_VALUE = "__all_lists__";

type FocusListOption = {
  id: string;
  title: string;
};

type FocusChangeListState = {
  task: ListBoardTask;
  targetListId: string;
};

export type FocusPanelProps = {
  fixtureBoard?: ListBoardSnapshot;
  fixtureLists?: FocusListOption[];
  fixtureTimer?: TimerSessionPayload | null;
  sharedTimerProjection?: {
    payload: TimerSessionPayload | null;
    settled: boolean;
  };
  target?: ListBoardRequestTarget;
  onTargetChange?: (target: ListBoardRequestTarget) => void;
  presentationActive?: boolean;
  onRequestCompact?: () => void;
  compactTransitionPending?: boolean;
  modeTransitionError?: string | null;
  shortcutStatus?: string | null;
  refreshKey?: number;
  onPresentationReady?: (payload: TimerSessionPayload | null) => void;
  onCompletionSuccess?: (state: FocusCompletionSuccessState) => void;
};

type FocusTaskRowProps = {
  task: ListBoardTask;
  aggregateView: boolean;
  displayTimezone: string;
  nowForOverdueAge: Date;
  done?: boolean;
  scheduled?: boolean;
  disabled: boolean;
  notesExpanded: boolean;
  subtasksExpanded: boolean;
  target: ListBoardRequestTarget;
  fixtureMode: boolean;
  canMakeLive: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canReorder: boolean;
  onMakeLive: () => void;
  onPointerReorder: (event: ReactPointerEvent<HTMLElement>) => void;
  onKeyboardReorder: (direction: "up" | "down") => void;
  onComplete: () => void;
  onToggleSubtasks: () => void;
  onSubtasksExpandedChange: (expanded: boolean) => void;
  onToggleNotes: () => void;
  onSchedule: () => void;
  onChangeList: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMutationStatus: (status: string, error: string | null) => void;
  onRefreshBlocked: (message: string) => void;
  hideTaskTimes: boolean;
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
  displayTimezone,
  nowForOverdueAge,
  done = false,
  scheduled = false,
  disabled,
  notesExpanded,
  subtasksExpanded,
  target,
  fixtureMode,
  canMakeLive,
  canMoveUp,
  canMoveDown,
  canReorder,
  onMakeLive,
  onPointerReorder,
  onKeyboardReorder,
  onComplete,
  onToggleSubtasks,
  onSubtasksExpandedChange,
  onToggleNotes,
  onSchedule,
  onChangeList,
  onDuplicate,
  onDelete,
  onMutationStatus,
  onRefreshBlocked,
  hideTaskTimes,
}: FocusTaskRowProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const schedule = taskScheduleLabel(task);
  const overdueAge = task.isOverdue && !fixtureMode && task.scheduledLocalDate
    ? focusOverdueAge(task.scheduledLocalDate, displayTimezone, nowForOverdueAge)
    : null;
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
      data-focus-task-times-hidden={hideTaskTimes ? "true" : "false"}
      data-focus-drag-task={ordinary && canReorder ? task.id : undefined}
      data-focus-reorderable={ordinary && canReorder ? "true" : "false"}
      data-task-id={task.id}
      tabIndex={ordinary && canReorder ? 0 : undefined}
      onPointerDown={ordinary && canReorder && !moreOpen ? onPointerReorder : undefined}
      onKeyDown={ordinary && canReorder && !moreOpen ? (event) => {
        if (
          event.target instanceof Element
          && event.target.closest("button, input, select, textarea, [contenteditable]")
        ) return;
        if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
        const direction = event.key === "ArrowUp" ? "up" : "down";
        if ((direction === "up" && !canMoveUp) || (direction === "down" && !canMoveDown)) return;
        event.preventDefault();
        onKeyboardReorder(direction);
      } : undefined}
    >
      <div className="focus-panel__task-row-mainline">
        <span className="focus-panel__task-completion-slot">
          {ordinary ? (
            <Tooltip content="Complete task" boundarySelector=".focus-panel__task-row">
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
            {task.isOverdue ? (
              <span className="focus-panel__overdue" data-focus-overdue-age={overdueAge ?? "unknown"}>
                {overdueAge ?? "Overdue"}
              </span>
            ) : null}
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
              <Tooltip content="Make live" boundarySelector=".focus-panel__task-row">
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
              <Tooltip content="Subtasks" boundarySelector=".focus-panel__task-row">
                <button
                  type="button"
                  className="focus-panel__row-action motion-interactive"
                  data-focus-row-action="subtasks"
                  aria-label={`Subtasks: ${task.title}`}
                  aria-expanded={subtasksExpanded}
                  disabled={disabled}
                  onClick={onToggleSubtasks}
                >
                  ≡
                </button>
              </Tooltip>
              <Tooltip content="Notes" boundarySelector=".focus-panel__task-row">
                <button
                  type="button"
                  className="focus-panel__row-action motion-interactive"
                  data-focus-row-action="notes"
                  aria-label={`Notes: ${task.title}`}
                  aria-expanded={notesExpanded}
                  disabled={disabled}
                  onClick={onToggleNotes}
                >
                  ▤
                </button>
              </Tooltip>
              <Tooltip content="More task actions" boundarySelector=".focus-panel__task-row">
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
                <button type="button" role="menuitem" onClick={() => runMoreAction(onSchedule)}>
                  Schedule
                </button>
                <button type="button" role="menuitem" onClick={() => runMoreAction(onChangeList)}>
                  Change list
                </button>
                <button type="button" role="menuitem" onClick={() => runMoreAction(onDuplicate)}>
                  Duplicate
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="focus-panel__row-menu-delete"
                  onClick={() => runMoreAction(onDelete)}
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <span className="focus-panel__done-time type-metadata">{formatDuration(task.timeTakenSeconds)}</span>
        )}
      </div>

      {ordinary && subtasksExpanded ? (
        <div className="focus-panel__row-subtasks">
          <FocusLiveSubtasks
            task={task}
            target={target}
            fixtureMode={fixtureMode}
            expanded
            onExpandedChange={(expanded) => {
              onSubtasksExpandedChange(expanded);
              return true;
            }}
          />
        </div>
      ) : null}

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
  sharedTimerProjection,
  target: controlledTarget,
  onTargetChange,
  presentationActive = true,
  onRequestCompact,
  compactTransitionPending = false,
  modeTransitionError = null,
  shortcutStatus = null,
  refreshKey = 0,
  onPresentationReady,
  onCompletionSuccess,
}: FocusPanelProps) {
  const [localTarget, setLocalTarget] = useState<ListBoardRequestTarget>(() =>
    fixtureBoard?.target.kind === "list" && fixtureBoard.target.id
      ? { kind: "list", id: fixtureBoard.target.id }
      : { kind: "all" },
  );
  const target = controlledTarget ?? localTarget;
  const setFocusTarget = (
    next: ListBoardRequestTarget | ((current: ListBoardRequestTarget) => ListBoardRequestTarget),
  ) => {
    const resolved = typeof next === "function" ? next(target) : next;
    if (sameTarget(target, resolved)) return;
    if (controlledTarget === undefined) setLocalTarget(resolved);
    onTargetChange?.(resolved);
  };
  const [board, setBoard] = useState<ListBoardSnapshot | null>(fixtureBoard ?? null);
  const { lists, loaded: catalogLoaded, error: catalogError } = useFocusListCatalog(
    fixtureLists, refreshKey, presentationActive,
  );
  const [timer, setTimer] = useState<TimerSessionPayload | null>(fixtureTimer);
  const [error, setError] = useState<string | null>(null);
  const [boardReadyTargetKey, setBoardReadyTargetKey] = useState<string | null>(null);
  const [boardReadyRefreshKey, setBoardReadyRefreshKey] = useState(0);
  const [timerSettled, setTimerSettled] = useState(Boolean(fixtureBoard));
  const [mutationPendingTaskId, setMutationPendingTaskId] = useState<string | null>(null);
  const [mutationStatus, setMutationStatus] = useState<string | null>(null);
  const [notesTaskId, setNotesTaskId] = useState<string | null>(null);
  const [subtasksTaskId, setSubtasksTaskId] = useState<string | null>(null);
  const [scheduleTaskId, setScheduleTaskId] = useState<string | null>(null);
  const [changeListState, setChangeListState] = useState<FocusChangeListState | null>(null);
  const [changeListPending, setChangeListPending] = useState(false);
  const [changeListError, setChangeListError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ListBoardTask | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addTaskTitle, setAddTaskTitle] = useState("");
  const [addTaskListId, setAddTaskListId] = useState("");
  const [addTaskPending, setAddTaskPending] = useState(false);
  const [homePending, setHomePending] = useState(false);
  const [quickPreferencesOpen, setQuickPreferencesOpen] = useState(false);
  const fixtureMode = Boolean(fixtureBoard);
  const currentTargetKey = targetKey(target);
  const currentTargetKeyRef = useRef(currentTargetKey);
  const externalBoardRefreshRevisionRef = useRef(0);
  const focusPointerDragCleanupRef = useRef<(() => void) | null>(null);
  currentTargetKeyRef.current = currentTargetKey;
  const latestSharedTimerProjectionRef = useRef<TimerSessionPayload | null>(
    sharedTimerProjection?.payload ?? null,
  );
  latestSharedTimerProjectionRef.current = sharedTimerProjection?.payload ?? null;
  const preferences = usePreferenceSettingsProjection(fixtureMode);
  const scrollingTitleEnabled = preferences.snapshot?.focus.scrollingTitle ?? false;
  const hideTaskTimes = preferences.snapshot?.general.hideTaskTimes ?? false;
  const autoParseEstFromTitle = preferences.snapshot?.general.autoParseEstFromTitle ?? false;

  useEffect(() => () => {
    focusPointerDragCleanupRef.current?.();
    focusPointerDragCleanupRef.current = null;
  }, []);

  useEffect(() => {
    if (fixtureBoard) {
      setBoard(fixtureBoard);
      setBoardReadyRefreshKey(refreshKey);
      setFocusTarget(
        fixtureBoard.target.kind === "list" && fixtureBoard.target.id
          ? { kind: "list", id: fixtureBoard.target.id }
          : { kind: "all" },
      );
      setError(null);
      return;
    }

    let disposed = false;
    const retainCurrentBoard = board !== null && boardReadyTargetKey === currentTargetKey;
    if (!retainCurrentBoard) {
      setBoard(null);
      setBoardReadyTargetKey(null);
    }
    void getListBoardSnapshot(target)
      .then((snapshot) => {
        if (!disposed) {
          setBoard(snapshot);
          setBoardReadyRefreshKey(refreshKey);
          setBoardReadyTargetKey(targetKey(target));
          setError(null);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          if (!retainCurrentBoard) setBoard(null);
          setBoardReadyRefreshKey(refreshKey);
          setBoardReadyTargetKey(targetKey(target));
          setError(formatInvokeError(failure));
        }
      });
    return () => {
      disposed = true;
    };
  }, [fixtureBoard, refreshKey, target.kind, target.kind === "list" ? target.id : null]);

  useEffect(() => {
    if (fixtureMode) return;

    let disposed = false;
    let stopListening: (() => void) | undefined;
    void listenForBoardInvalidation(() => {
      const revision = externalBoardRefreshRevisionRef.current + 1;
      externalBoardRefreshRevisionRef.current = revision;
      const refreshTarget = target;
      const expectedTargetKey = targetKey(refreshTarget);
      void getListBoardSnapshot(refreshTarget)
        .then((snapshot) => {
          if (
            !disposed
            && revision === externalBoardRefreshRevisionRef.current
            && currentTargetKeyRef.current === expectedTargetKey
          ) {
            setBoard(snapshot);
            setError(null);
          }
        })
        .catch((failure: unknown) => {
          if (
            !disposed
            && revision === externalBoardRefreshRevisionRef.current
            && currentTargetKeyRef.current === expectedTargetKey
          ) {
            setError(`Focus data changed, but this view could not refresh. ${formatInvokeError(failure)}`);
          }
        });
    })
      .then((unlisten) => {
        if (disposed) unlisten();
        else stopListening = unlisten;
      })
      .catch((failure: unknown) => {
        if (!disposed) setError(`Cross-window Focus refresh could not start. ${formatInvokeError(failure)}`);
      });

    return () => {
      disposed = true;
      externalBoardRefreshRevisionRef.current += 1;
      stopListening?.();
    };
  }, [fixtureMode, target.kind, target.kind === "list" ? target.id : null]);

  useEffect(() => {
    focusPointerDragCleanupRef.current?.();
    focusPointerDragCleanupRef.current = null;
    setNotesTaskId(null);
    setSubtasksTaskId(null);
    setScheduleTaskId(null);
    setChangeListState(null);
    setChangeListPending(false);
    setChangeListError(null);
    setDeleteTarget(null);
    setDeleteError(null);
    setAddTaskOpen(false);
    setAddTaskTitle("");
    setMutationStatus(null);
  }, [target.kind, target.kind === "list" ? target.id : null]);

  useEffect(() => {
    if (!catalogLoaded || fixtureMode) return;
    setFocusTarget((current) => current.kind === "list" && !lists.some(({ id }) => id === current.id)
      ? { kind: "all" } : current);
    setAddTaskListId((current) => current && !lists.some(({ id }) => id === current) ? "" : current);
  }, [catalogLoaded, lists, fixtureMode]);

  useEffect(() => {
    if (fixtureMode) {
      setTimer(fixtureTimer);
      setTimerSettled(true);
      return;
    }

    let disposed = false;
    if (sharedTimerProjection !== undefined) {
      const projected = sharedTimerProjection.payload;
      setTimer(projected);
      setTimerSettled(sharedTimerProjection.settled);
      if (projected?.change) {
        const refreshTarget = target;
        const expectedTargetKey = currentTargetKey;
        const expectedRevision = projected.revision;
        const expectedTaskId = projected.runtime.timer.task_id;
        const expectedSessionId = projected.runtime.open_session_id;
        const refreshStillCurrent = () => {
          const latest = latestSharedTimerProjectionRef.current;
          return !disposed
            && currentTargetKeyRef.current === expectedTargetKey
            && latest?.revision === expectedRevision
            && latest.runtime.timer.task_id === expectedTaskId
            && latest.runtime.open_session_id === expectedSessionId;
        };

        void getListBoardSnapshot(refreshTarget)
          .then((snapshot) => {
            if (refreshStillCurrent()) {
              setBoard(snapshot);
              setError(null);
            }
          })
          .catch((failure: unknown) => {
            if (refreshStillCurrent()) setError(formatInvokeError(failure));
          });
      }
      return () => {
        disposed = true;
      };
    }

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
  }, [
    fixtureMode,
    fixtureTimer,
    sharedTimerProjection,
    target.kind,
    target.kind === "list" ? target.id : null,
  ]);

  useEffect(() => {
    if (fixtureMode || (timerSettled && timer !== null
      && boardReadyTargetKey === currentTargetKey && boardReadyRefreshKey === refreshKey)) {
      onPresentationReady?.(timer);
    }
  }, [boardReadyRefreshKey, boardReadyTargetKey, currentTargetKey, fixtureMode, onPresentationReady, refreshKey, timer, timerSettled]);

  const selectorOptions = useMemo(() => {
    const options = [...lists];
    if (!catalogLoaded && board?.target.kind === "list" && board.target.id && !options.some((list) => list.id === board.target.id)) {
      options.push({ id: board.target.id, title: board.target.title });
    }
    return options;
  }, [board, lists, catalogLoaded]);

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
    if (fixtureMode || !presentationActive || mutationPendingTaskId !== null) return;
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
    if (fixtureMode || !presentationActive || mutationPendingTaskId !== null) return;
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
      setSubtasksTaskId(null);
      setMutationStatus(`${task.title} is now live.`);
      await refreshBoard();
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
    } finally {
      setMutationPendingTaskId(null);
    }
  };


  const requestTaskChangeList = (task: ListBoardTask) => {
    if (fixtureMode || !presentationActive || mutationPendingTaskId !== null || changeListPending) return;
    const destination = selectorOptions.find((option) => option.id !== task.listId);
    if (!destination) {
      setMutationStatus(null);
      setError("No other active list is available for this task.");
      return;
    }
    setNotesTaskId(null);
    setSubtasksTaskId(null);
    setMutationStatus(null);
    setError(null);
    setChangeListError(null);
    setChangeListState({ task, targetListId: destination.id });
  };

  const confirmTaskChangeList = async () => {
    if (!changeListState || changeListPending || mutationPendingTaskId !== null) return;
    const destination = selectorOptions.find(
      (option) => option.id === changeListState.targetListId && option.id !== changeListState.task.listId,
    );
    if (!destination) {
      setChangeListError("Choose another active list.");
      return;
    }

    const task = changeListState.task;
    setChangeListPending(true);
    setMutationPendingTaskId(task.id);
    setChangeListError(null);
    setError(null);
    try {
      await changeListBoardTask({
        taskId: task.id,
        expectedListId: task.listId,
        targetListId: destination.id,
      });
      setChangeListState(null);
      setMutationStatus(`Moved ${task.title} to ${destination.title}.`);
      try {
        await refreshBoard();
      } catch (failure: unknown) {
        setError(
          `Task change was saved, but Focus could not refresh. ${formatInvokeError(failure)} Reopen Focus before making more task changes.`,
        );
      }
    } catch (failure: unknown) {
      setChangeListError(formatInvokeError(failure));
    } finally {
      setChangeListPending(false);
      setMutationPendingTaskId(null);
    }
  };

  const duplicateTask = (task: ListBoardTask) => {
    void commitRowMutation(
      task,
      async () => {
        await duplicateListBoardTask({ taskId: task.id, expectedListId: task.listId });
      },
      `Duplicated ${task.title}.`,
    );
  };

  const exitFocusHome = async () => {
    if (fixtureMode || !presentationActive || homePending) return;
    setHomePending(true);
    setError(null);
    let pausedByHome = false;
    try {
      const paused = await pauseTimerForFocusHome();
      if (paused !== null) {
        pausedByHome = true;
        setTimer((current) => applyTimerSessionProjection(current, paused));
        await waitForPresentedFrame();
      }
      await invoke<void>("focus_surface_exit_to_main");
    } catch (failure: unknown) {
      if (pausedByHome) {
        try {
          const resumed = await resumeTimerFromFocusHome();
          if (resumed !== null) {
            setTimer((current) => applyTimerSessionProjection(current, resumed));
          }
        } catch (rollbackFailure: unknown) {
          setError(
            `${formatInvokeError(failure)} Home-pause rollback also failed. ${formatInvokeError(rollbackFailure)}`,
          );
          return;
        }
      }
      setError(formatInvokeError(failure));
    } finally {
      setHomePending(false);
    }
  };

  const submitAddTask = async () => {
    if (fixtureMode || !presentationActive || addTaskPending) return;
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

    const automaticEstimate = autoParseEstFromTitle ? parseEstimateSuffix(title) : null;
    const persistedTitle = automaticEstimate?.titleWithoutSuffix ?? title;

    setAddTaskPending(true);
    setError(null);
    setMutationStatus(null);
    try {
      await createListBoardTask({
        listId,
        lane: "today",
        title: persistedTitle,
        estSeconds: automaticEstimate?.seconds ?? null,
        insertAtTop: false,
      });
      await refreshBoard();
      setAddTaskTitle("");
      setAddTaskOpen(false);
      setMutationStatus(`Added ${persistedTitle} to Today.`);
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
    } finally {
      setAddTaskPending(false);
    }
  };

  const confirmDelete = async () => {
    if (!presentationActive || !deleteTarget || deletePending) return;
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
    setSubtasksTaskId((current) => current === task.id ? null : current);
    setMutationStatus(`Permanently deleted ${task.title}.`);
    try {
      await refreshBoard();
    } catch (failure: unknown) {
      setError(
        `Task was deleted, but Focus could not refresh. ${formatInvokeError(failure)} Reopen Focus before making more task changes.`,
      );
    }
  };

  const statusError = error ?? preferences.error ?? modeTransitionError;

  if (quickPreferencesOpen) {
    return (
      <main className="focus-panel focus-panel--quick-preferences" data-focus-panel="main" data-focus-view="quick-preferences">
        <FocusQuickPreferences onBack={() => setQuickPreferencesOpen(false)} />
      </main>
    );
  }

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
  const nowForOverdueAge = new Date();
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
    || !presentationActive
    || mutationPendingTaskId !== null
    || scheduleTaskId !== null
    || changeListState !== null
    || changeListPending
    || deleteTarget !== null
    || addTaskPending;
  const scheduleTask = scheduleTaskId
    ? [...remainingTasks, ...scheduledTasks].find((task) => task.id === scheduleTaskId) ?? null
    : null;

  const commitFocusTaskReorder = (task: ListBoardTask, beforeTaskId: string | null, success: string) => {
    const index = reorderIndex.get(task.id);
    if (index === undefined) return;
    const currentBeforeTaskId = reorderableTasks[index + 1]?.id ?? null;
    if (beforeTaskId === task.id || beforeTaskId === currentBeforeTaskId) return;
    void commitRowMutation(
      task,
      () => reorderListBoardTask({
        taskId: task.id,
        listId: task.listId,
        sourceLane: "today",
        beforeTaskId,
      }),
      success,
    );
  };

  const moveFocusTask = (task: ListBoardTask, direction: "up" | "down") => {
    const index = reorderIndex.get(task.id);
    if (index === undefined) return;
    const beforeTaskId = direction === "up"
      ? reorderableTasks[index - 1]?.id ?? null
      : reorderableTasks[index + 2]?.id ?? null;
    commitFocusTaskReorder(task, beforeTaskId, `Moved ${task.title} ${direction}.`);
  };

  const beginFocusTaskReorder = (task: ListBoardTask, event: ReactPointerEvent<HTMLElement>) => {
    if (rowInteractionDisabled || !reorderIndex.has(task.id)) return;
    focusPointerDragCleanupRef.current?.();
    const cleanup = beginFocusTaskPointerDrag({
      source: event.currentTarget,
      target: event.target,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      taskId: task.id,
      onFinish: (drop) => {
        focusPointerDragCleanupRef.current = null;
        if (!drop) return;
        commitFocusTaskReorder(task, drop.beforeTaskId, `Reordered ${task.title}.`);
      },
    });
    focusPointerDragCleanupRef.current = cleanup;
  };

  const renderTaskRow = (task: ListBoardTask, scheduled = false) => {
    const index = reorderIndex.get(task.id);
    return (
      <FocusTaskRow
        key={task.id}
        task={task}
        aggregateView={aggregateView}
        displayTimezone={board.displayTimezone}
        nowForOverdueAge={nowForOverdueAge}
        scheduled={scheduled}
        disabled={rowInteractionDisabled || mutationPendingTaskId === task.id}
        notesExpanded={notesTaskId === task.id}
        subtasksExpanded={subtasksTaskId === task.id}
        target={target}
        fixtureMode={fixtureMode}
        canMakeLive={!scheduled}
        canMoveUp={index !== undefined && index > 0}
        canMoveDown={index !== undefined && index < reorderableTasks.length - 1}
        canReorder={index !== undefined && notesTaskId !== task.id && subtasksTaskId !== task.id}
        onMakeLive={() => void makeTaskLive(task)}
        onPointerReorder={(event) => beginFocusTaskReorder(task, event)}
        onKeyboardReorder={(direction) => moveFocusTask(task, direction)}
        onComplete={() => void commitRowMutation(
          task,
          () => completeListBoardTask({ taskId: task.id, listId: task.listId }),
          `Completed ${task.title}.`,
        )}
        onToggleSubtasks={() => {
          setNotesTaskId(null);
          setSubtasksTaskId((current) => current === task.id ? null : task.id);
        }}
        onSubtasksExpandedChange={(expanded) => {
          setSubtasksTaskId(expanded ? task.id : null);
        }}
        onToggleNotes={() => {
          setSubtasksTaskId(null);
          setNotesTaskId((current) => current === task.id ? null : task.id);
        }}
        onSchedule={() => {
          setNotesTaskId(null);
          setSubtasksTaskId(null);
          setScheduleTaskId(task.id);
        }}
        onChangeList={() => requestTaskChangeList(task)}
        onDuplicate={() => duplicateTask(task)}
        onDelete={() => {
          setNotesTaskId(null);
          setSubtasksTaskId(null);
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
        hideTaskTimes={hideTaskTimes}
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
            onChange={(event) => setFocusTarget(targetFromValue(event.currentTarget.value))}
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
            <button
              type="button"
              aria-label="Preferences"
              data-focus-preferences-control="true"
              disabled={!presentationActive}
              onClick={() => setQuickPreferencesOpen(true)}
            >
              ⚙
            </button>
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

      <section className="focus-panel__queue" aria-label="Focus queue" tabIndex={0}>
        {catalogError ? <p className="focus-panel__action-error type-metadata" role="alert">{catalogError}</p> : null}
        {liveTask ? (
          <article
            className="focus-panel__live-card"
            data-focus-live-card="true"
            data-timed-alert-flash-task-id={liveTask.id}
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
                  data-focus-timer-overtime={timer?.runtime.timer.state === "overtime_running" || timer?.runtime.timer.state === "overtime_paused" ? "true" : "false"}
                  data-timed-alert-flash-task-id={liveTask.id}
                  data-timer-numerals="true"
                  aria-label={liveTimer.label}
                  aria-live="off"
                >
                  {liveTimer.text}
                </span>
              ) : null}
            </div>
            <div className="focus-panel__live-meta type-metadata">
              {timer?.runtime.timer.mode?.kind === "pomodoro" ? (
                <span className="focus-panel__pomodoro-badge" data-focus-pomodoro-badge="true" aria-label="Pomodoro mode">POMO</span>
              ) : null}
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
                presentationActive={presentationActive}
                onTimerPayload={(incoming) => {
                  setTimer((current) => applyTimerSessionProjection(current, incoming));
                }}
                onTaskMutationCommitted={async () => {
                  await refreshBoard();
                }}
                onCompletionSuccess={onCompletionSuccess}
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

        <div className="focus-panel__remaining" data-focus-group="remaining" data-focus-reorder-zone="true">
          {remainingTasks.map((task) => renderTaskRow(task))}
        </div>

        {!addTaskOpen ? (
          <button
            className="focus-panel__add-task"
            type="button"
            data-focus-add-task="open"
            disabled={fixtureMode || !presentationActive || addTaskPending || mutationPendingTaskId !== null}
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
              displayTimezone={board.displayTimezone}
              nowForOverdueAge={nowForOverdueAge}
              done
              disabled
              notesExpanded={false}
              subtasksExpanded={false}
              target={target}
              fixtureMode={fixtureMode}
              canMakeLive={false}
              canMoveUp={false}
              canMoveDown={false}
              canReorder={false}
              onMakeLive={() => {}}
              onPointerReorder={() => {}}
              onKeyboardReorder={() => {}}
              onComplete={() => {}}
              onToggleSubtasks={() => {}}
              onSubtasksExpandedChange={() => {}}
              onToggleNotes={() => {}}
              onSchedule={() => {}}
              onChangeList={() => {}}
              onDuplicate={() => {}}
              onDelete={() => {}}
              onMutationStatus={() => {}}
              onRefreshBlocked={() => {}}
              hideTaskTimes={hideTaskTimes}
            />
          ))}
        </section>
      </section>

      {changeListState ? (
        <TaskChangeListDialog
          taskTitle={changeListState.task.title}
          options={selectorOptions}
          selectedListId={changeListState.targetListId}
          pending={changeListPending}
          error={changeListError}
          onSelectedListChange={(targetListId) => setChangeListState((current) => current ? { ...current, targetListId } : current)}
          onCancel={() => {
            if (changeListPending) return;
            setChangeListState(null);
            setChangeListError(null);
          }}
          onConfirm={() => void confirmTaskChangeList()}
        />
      ) : null}

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

      {shortcutStatus || mutationStatus ? (
        <div className="focus-panel__status type-metadata" role="status">{shortcutStatus ?? mutationStatus}</div>
      ) : null}
      {statusError ? <div className="focus-panel__error type-metadata" role="alert">{statusError}</div> : null}
    </main>
  );
}
