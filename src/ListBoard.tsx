import { invoke } from "@tauri-apps/api/core";
import {
  type CSSProperties,
  type DragEvent as ReactDragEvent,
  type FormEvent as ReactFormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { formatInvokeError } from "./diagnosticApi";
import type { HomeSnapshot } from "./HomeDashboard";
import {
  createListBoardSubtask,
  createListBoardTask,
  deleteListBoardSubtask,
  getListBoardSnapshot,
  getListBoardTaskSubtasks,
  moveListBoardTask,
  reorderListBoardSubtasks,
  reorderListBoardTask,
  setListBoardSubtaskCompletion,
  updateListBoardSubtaskTitle,
  updateListBoardTaskEstimate,
  updateListBoardTaskTimeTaken,
  updateListBoardTaskTitle,
  type BoardSubtask,
  type BoardSubtaskSnapshot,
  type ListBoardLane,
  type ListBoardRequestTarget,
  type ListBoardSnapshot,
  type ListBoardTask,
  type PlanningLaneToken,
} from "./listBoardApi";
import { TaskCard, type TaskCardMetricKind } from "./TaskCard";
import { TaskScheduleDialog } from "./TaskScheduleDialog";
import {
  applyTimerSessionProjection,
  connectTimerSessionProjection,
  setPausedTimerEstimate,
  setPausedTimerTimeTaken,
  type TimerSessionPayload,
  type TimerStateKind,
} from "./timerSessionApi";
import "./listBoard.css";

type LaneKey = "backlog" | "thisWeek" | "today" | "done";
type PendingLaneKey = Exclude<LaneKey, "done">;
type WithinLaneDirection = "up" | "down";
type SubtaskDirection = "up" | "down";

type ListBoardProps = {
  target: ListBoardRequestTarget;
  fixtureSnapshot?: ListBoardSnapshot;
  fixtureReorderState?: ListBoardFixtureReorderState;
  onTargetChange?: (target: ListBoardRequestTarget) => void;
};

type ListBoardOption = {
  id: string;
  title: string;
};

type DragState = {
  taskId: string;
  sourceLane: PendingLaneKey;
};

type DropTarget = {
  lane: PendingLaneKey;
  beforeTaskId: string | null;
};

type TaskEditorState =
  | { kind: "create"; lane: PendingLaneKey; title: string }
  | { kind: "edit"; taskId: string; expectedTitle: string; title: string }
  | {
      kind: "metric";
      taskId: string;
      listId: string;
      metric: TaskCardMetricKind;
      value: string;
      initialValue: string;
      expectedEstSeconds: number | null;
      expectedTimeTakenSeconds: string;
      live: boolean;
    };

type SubtaskPanelState = {
  taskId: string;
  listId: string;
  loading: boolean;
  snapshot: BoardSubtaskSnapshot | null;
  error: string | null;
  createValue: string;
  editor: { id: string; expectedTitle: string; value: string } | null;
  pending: boolean;
};

type BoardSubtaskControls = {
  panel: SubtaskPanelState | null;
  canOpen: boolean;
  onToggle: (task: ListBoardTask) => void;
  onCreateValueChange: (value: string) => void;
  onCreate: () => void;
  onStartEdit: (subtask: BoardSubtask) => void;
  onEditValueChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggleCompleted: (subtask: BoardSubtask) => void;
  onMove: (subtask: BoardSubtask, direction: SubtaskDirection) => void;
  onDelete: (subtask: BoardSubtask) => void;
};

export type ListBoardFixtureReorderState = {
  draggingTaskId?: string;
  sourceLane?: PendingLaneKey;
  dropLane?: PendingLaneKey;
  beforeTaskId?: string | null;
  settlingTaskId?: string;
};

const LANES: Array<{
  key: LaneKey;
  title: string;
  mutationLane: PlanningLaneToken | null;
}> = [
  { key: "backlog", title: "Backlog", mutationLane: "backlog" },
  { key: "thisWeek", title: "This Week", mutationLane: "this_week" },
  { key: "today", title: "Today", mutationLane: "today" },
  { key: "done", title: "Done", mutationLane: null },
];

const PENDING_LANES: PendingLaneKey[] = ["backlog", "thisWeek", "today"];
const LANE_TOKEN: Record<PendingLaneKey, PlanningLaneToken> = {
  backlog: "backlog",
  thisWeek: "this_week",
  today: "today",
};
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const WHOLE_SECONDS = /^\d+$/;
const DURATION_INPUT = /^(\d+):([0-5]\d):([0-5]\d)$/;
const ALL_LISTS_VALUE = "__all_lists__";
const SETTLE_DURATION_MS = 220;
const MAX_EDITABLE_SECONDS = 4_294_967_295n;

function formatEstimate(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "—";
  const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatDurationSeconds(seconds: bigint): string {
  const hours = seconds / 3_600n;
  const minutes = (seconds % 3_600n) / 60n;
  const remainder = seconds % 60n;
  return `${hours}:${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
}

function estimateDraft(seconds: number | null): string {
  return seconds === null ? "" : formatDurationSeconds(BigInt(seconds));
}

function timeTakenDraft(rawSeconds: string): string {
  return WHOLE_SECONDS.test(rawSeconds) ? formatDurationSeconds(BigInt(rawSeconds)) : "0:00:00";
}

function parseMetricDuration(
  raw: string,
  metric: TaskCardMetricKind,
): { ok: true; seconds: number | null } | { ok: false; message: string } {
  const value = raw.trim();
  if (metric === "estimate" && value === "") return { ok: true, seconds: null };
  const match = DURATION_INPUT.exec(value);
  if (!match) {
    return {
      ok: false,
      message: metric === "estimate"
        ? "EST must use H:MM:SS, or be left blank to clear it."
        : "Time Taken must use H:MM:SS.",
    };
  }

  const hours = BigInt(match[1]);
  const minutes = BigInt(match[2]);
  const seconds = BigInt(match[3]);
  const total = hours * 3_600n + minutes * 60n + seconds;
  if (total > MAX_EDITABLE_SECONDS) {
    return { ok: false, message: "Duration exceeds Narro's editable range." };
  }
  if (metric === "estimate" && total === 0n) {
    return { ok: false, message: "EST must be greater than zero, or blank to clear it." };
  }
  return { ok: true, seconds: Number(total) };
}

function safeListAccent(color: string | null): CSSProperties | undefined {
  if (!color || !HEX_COLOR.test(color)) return undefined;
  return { "--list-board-task-accent": color } as CSSProperties;
}

function isManualReorderTask(task: ListBoardTask): boolean {
  return task.completedAt === null && task.scheduledLocalDate === null;
}

function taskIndex(tasks: ListBoardTask[], taskId: string): number {
  return tasks.findIndex((task) => task.id === taskId);
}

function manualTasks(lane: ListBoardLane): ListBoardTask[] {
  return lane.tasks.filter(isManualReorderTask);
}

function placeholderAfterTaskId(lane: ListBoardLane): string | null {
  const eligible = manualTasks(lane);
  return eligible.length > 0 ? eligible[eligible.length - 1].id : null;
}

function liveStateForTask(
  timerPayload: TimerSessionPayload | null,
  taskId: string,
): TimerStateKind | null {
  return timerPayload?.runtime.timer.task_id === taskId
    ? timerPayload.runtime.timer.state
    : null;
}

function DropPlaceholder() {
  return (
    <div
      className="list-board-task-drop-placeholder"
      data-task-drop-placeholder="true"
      aria-hidden="true"
    >
      <span />
    </div>
  );
}

function InlineCreateEditor({
  title,
  pending,
  laneTitle,
  onChange,
  onSubmit,
  onCancel,
}: {
  title: string;
  pending: boolean;
  laneTitle: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const handleSubmit = (event: ReactFormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pending) onSubmit();
  };

  return (
    <form
      className="list-board-task list-board-task--inline-create"
      data-board-task-create="editor"
      onSubmit={handleSubmit}
    >
      <label className="list-board-task-create__field">
        <span className="type-metadata">Add task to {laneTitle}</span>
        <input
          value={title}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Escape" || pending) return;
            event.preventDefault();
            onCancel();
          }}
          disabled={pending}
          aria-label={`New ${laneTitle} task title`}
          data-task-create-title="true"
          autoFocus
        />
      </label>
      <div className="list-board-task-create__actions">
        <button type="button" onClick={onCancel} disabled={pending}>Cancel</button>
        <button type="submit" disabled={pending || title.trim().length === 0}>Add task</button>
      </div>
    </form>
  );
}

function BoardLane({
  laneKey,
  lane,
  title,
  aggregateView,
  presentationReorderEnabled,
  interactionReorderEnabled,
  canStartCreate,
  canStartTaskEditor,
  canStartScheduleEditor,
  timerPayload,
  editorState,
  editorMutationPending,
  dragState,
  dropTarget,
  settlingTaskId,
  mutationPendingTaskId,
  subtaskControls,
  onDragStart,
  onDragOverTask,
  onDragOverLane,
  onDrop,
  onDragEnd,
  onTaskKeyDown,
  onMoveWithinLane,
  onStartCreate,
  onCreateTitleChange,
  onSubmitCreate,
  onStartTitleEdit,
  onEditTitleChange,
  onSubmitTitleEdit,
  onStartMetricEdit,
  onMetricValueChange,
  onSubmitMetricEdit,
  onStartScheduleEdit,
  onCancelEditor,
}: {
  laneKey: LaneKey;
  lane: ListBoardLane;
  title: string;
  aggregateView: boolean;
  presentationReorderEnabled: boolean;
  interactionReorderEnabled: boolean;
  canStartCreate: boolean;
  canStartTaskEditor: boolean;
  canStartScheduleEditor: boolean;
  timerPayload: TimerSessionPayload | null;
  editorState: TaskEditorState | null;
  editorMutationPending: boolean;
  dragState: DragState | null;
  dropTarget: DropTarget | null;
  settlingTaskId: string | null;
  mutationPendingTaskId: string | null;
  subtaskControls?: BoardSubtaskControls;
  onDragStart: (task: ListBoardTask, lane: PendingLaneKey, event: ReactDragEvent<HTMLDivElement>) => void;
  onDragOverTask: (task: ListBoardTask, lane: PendingLaneKey, event: ReactDragEvent<HTMLDivElement>) => void;
  onDragOverLane: (lane: PendingLaneKey, event: ReactDragEvent<HTMLDivElement>) => void;
  onDrop: (event: ReactDragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onTaskKeyDown: (task: ListBoardTask, lane: PendingLaneKey, event: ReactKeyboardEvent<HTMLDivElement>) => void;
  onMoveWithinLane: (task: ListBoardTask, lane: PendingLaneKey, direction: WithinLaneDirection) => void;
  onStartCreate: (lane: PendingLaneKey) => void;
  onCreateTitleChange: (value: string) => void;
  onSubmitCreate: () => void;
  onStartTitleEdit: (task: ListBoardTask) => void;
  onEditTitleChange: (value: string) => void;
  onSubmitTitleEdit: () => void;
  onStartMetricEdit: (task: ListBoardTask, metric: TaskCardMetricKind, live: boolean) => void;
  onMetricValueChange: (value: string) => void;
  onSubmitMetricEdit: () => void;
  onStartScheduleEdit: (task: ListBoardTask) => void;
  onCancelEditor: () => void;
}) {
  const headingId = `list-board-${title.replace(/\s+/g, "-").toLowerCase()}`;
  const pendingLane = laneKey === "done" ? null : laneKey;
  const acceptsDrop = pendingLane !== null && presentationReorderEnabled;
  const laneDropTarget = pendingLane !== null && dropTarget?.lane === pendingLane ? dropTarget : null;
  const crossLaneAppend = pendingLane !== null
    && laneDropTarget?.beforeTaskId === null
    && dragState !== null
    && dragState.sourceLane !== pendingLane;
  const appendAfterId = laneDropTarget?.beforeTaskId === null && !crossLaneAppend
    ? placeholderAfterTaskId(lane)
    : null;
  const showLeadingPlaceholder = laneDropTarget?.beforeTaskId === null
    && appendAfterId === null
    && !crossLaneAppend;
  const showLaneEndPlaceholder = laneDropTarget?.beforeTaskId === null && crossLaneAppend;
  const eligibleTasks = pendingLane !== null ? manualTasks(lane) : [];
  const createEditor = editorState?.kind === "create" && editorState.lane === pendingLane
    ? editorState
    : null;

  return (
    <section
      className="list-board-lane"
      data-board-lane={title}
      data-drop-active={laneDropTarget ? "true" : "false"}
      aria-labelledby={headingId}
    >
      <header className="list-board-lane__header">
        <div>
          <h2 id={headingId} className="type-section-title">
            {title}
          </h2>
          <span className="list-board-lane__count type-metadata">
            {lane.count} {lane.count === 1 ? "task" : "tasks"}
          </span>
        </div>
        <span className="list-board-lane__est type-metadata">
          Est: {formatEstimate(lane.aggregateEstSeconds)}
        </span>
      </header>

      <div className="list-board-lane__reserved-action" aria-hidden="true" data-board-add-slot="reserved" />

      <div
        className="list-board-lane__tasks"
        role="list"
        aria-label={`${title} tasks`}
        onDragOver={acceptsDrop && interactionReorderEnabled
          ? (event) => onDragOverLane(pendingLane, event)
          : undefined}
        onDrop={acceptsDrop && interactionReorderEnabled ? onDrop : undefined}
      >
        {showLeadingPlaceholder ? <DropPlaceholder /> : null}
        {lane.tasks.length > 0 ? (
          lane.tasks.map((task) => {
            const reorderable = pendingLane !== null
              && presentationReorderEnabled
              && isManualReorderTask(task);
            const reorderIndex = reorderable ? taskIndex(eligibleTasks, task.id) : -1;
            const actionsEnabled = reorderable
              && interactionReorderEnabled
              && mutationPendingTaskId === null
              && pendingLane !== null;
            const onMoveUp = actionsEnabled && reorderIndex > 0
              ? () => onMoveWithinLane(task, pendingLane, "up")
              : undefined;
            const onMoveDown = actionsEnabled && reorderIndex >= 0 && reorderIndex < eligibleTasks.length - 1
              ? () => onMoveWithinLane(task, pendingLane, "down")
              : undefined;
            const taskActions = onMoveUp || onMoveDown ? { onMoveUp, onMoveDown } : undefined;
            const titleEditor = editorState?.kind === "edit" && editorState.taskId === task.id
              ? {
                  value: editorState.title,
                  pending: editorMutationPending,
                  onChange: onEditTitleChange,
                  onSubmit: onSubmitTitleEdit,
                  onCancel: onCancelEditor,
                }
              : undefined;
            const metricEditor = editorState?.kind === "metric" && editorState.taskId === task.id
              ? {
                  metric: editorState.metric,
                  value: editorState.value,
                  pending: editorMutationPending,
                  onChange: onMetricValueChange,
                  onSubmit: onSubmitMetricEdit,
                  onCancel: onCancelEditor,
                }
              : undefined;
            const liveState = liveStateForTask(timerPayload, task.id);
            const isLiveTask = liveState !== null && liveState !== "idle";
            const liveMetricEditable = liveState === "paused" || liveState === "overtime_paused";
            const canEditMetric = canStartTaskEditor && (!isLiveTask || liveMetricEditable);
            const canEditSchedule = canStartScheduleEditor && task.completedAt === null && !isLiveTask;
            const taskSubtaskPanel = subtaskControls?.panel?.taskId === task.id
              ? subtaskControls.panel
              : null;
            const subtaskModel = taskSubtaskPanel
              ? {
                  expanded: true,
                  loading: taskSubtaskPanel.loading,
                  error: taskSubtaskPanel.error,
                  mutable: Boolean(taskSubtaskPanel.snapshot?.mutable) && !aggregateView,
                  subtasks: taskSubtaskPanel.snapshot?.subtasks ?? [],
                  createValue: taskSubtaskPanel.createValue,
                  editor: taskSubtaskPanel.editor,
                  pending: taskSubtaskPanel.pending,
                }
              : undefined;
            const dragging = dragState?.taskId === task.id;
            const settling = settlingTaskId === task.id;
            const pending = mutationPendingTaskId === task.id
              || Boolean(titleEditor?.pending)
              || Boolean(metricEditor?.pending)
              || Boolean(taskSubtaskPanel?.pending);
            const placeholderBefore = laneDropTarget?.beforeTaskId === task.id;
            const placeholderAfter = laneDropTarget?.beforeTaskId === null
              && appendAfterId === task.id;

            return (
              <div key={task.id} className="list-board-task-slot">
                {placeholderBefore ? <DropPlaceholder /> : null}
                <div
                  role="listitem"
                  className="list-board-task-drag-shell"
                  data-task-reorderable={reorderable ? "true" : "false"}
                  data-task-dragging={dragging ? "true" : "false"}
                  data-task-settling={settling ? "true" : "false"}
                  data-task-mutation-pending={pending ? "true" : "false"}
                  draggable={reorderable && interactionReorderEnabled && !mutationPendingTaskId}
                  tabIndex={reorderable && interactionReorderEnabled ? 0 : undefined}
                  aria-describedby={reorderable && interactionReorderEnabled
                    ? "list-board-reorder-instructions"
                    : undefined}
                  onDragStart={reorderable && interactionReorderEnabled && pendingLane !== null
                    ? (event) => onDragStart(task, pendingLane, event)
                    : undefined}
                  onDragOver={reorderable && interactionReorderEnabled && pendingLane !== null
                    ? (event) => onDragOverTask(task, pendingLane, event)
                    : undefined}
                  onDragEnd={reorderable && interactionReorderEnabled ? onDragEnd : undefined}
                  onKeyDown={reorderable && interactionReorderEnabled && pendingLane !== null
                    ? (event) => onTaskKeyDown(task, pendingLane, event)
                    : undefined}
                >
                  <TaskCard
                    task={task}
                    aggregateView={aggregateView}
                    actions={taskActions}
                    onTitleEdit={canStartTaskEditor && !isLiveTask
                      ? () => onStartTitleEdit(task)
                      : undefined}
                    titleEditor={titleEditor}
                    onEstimateEdit={canEditMetric
                      ? () => onStartMetricEdit(task, "estimate", isLiveTask)
                      : undefined}
                    onTimeTakenEdit={canEditMetric
                      ? () => onStartMetricEdit(task, "time_taken", isLiveTask)
                      : undefined}
                    metricEditor={metricEditor}
                    onScheduleEdit={canEditSchedule ? () => onStartScheduleEdit(task) : undefined}
                    subtasks={subtaskControls ? {
                      model: subtaskModel,
                      canExpand: taskSubtaskPanel ? !taskSubtaskPanel.pending : subtaskControls.canOpen,
                      onToggleExpanded: () => subtaskControls.onToggle(task),
                      onCreateValueChange: subtaskControls.onCreateValueChange,
                      onCreate: subtaskControls.onCreate,
                      onStartEdit: subtaskControls.onStartEdit,
                      onEditValueChange: subtaskControls.onEditValueChange,
                      onSaveEdit: subtaskControls.onSaveEdit,
                      onCancelEdit: subtaskControls.onCancelEdit,
                      onToggleCompleted: subtaskControls.onToggleCompleted,
                      onMove: subtaskControls.onMove,
                      onDelete: subtaskControls.onDelete,
                    } : undefined}
                    liveState={liveState}
                  />
                </div>
                {placeholderAfter ? <DropPlaceholder /> : null}
              </div>
            );
          })
        ) : laneDropTarget ? null : (
          <div className="list-board-lane__empty type-metadata">No tasks</div>
        )}
        {showLaneEndPlaceholder ? <DropPlaceholder /> : null}
        {createEditor ? (
          <InlineCreateEditor
            title={createEditor.title}
            pending={editorMutationPending}
            laneTitle={title}
            onChange={onCreateTitleChange}
            onSubmit={onSubmitCreate}
            onCancel={onCancelEditor}
          />
        ) : null}
      </div>

      {pendingLane !== null && !aggregateView ? (
        <div className="list-board-lane__add-region" data-board-add-slot="bottom">
          {!createEditor ? (
            <button
              type="button"
              className="list-board-lane__add-task motion-interactive"
              onClick={() => onStartCreate(pendingLane)}
              disabled={!canStartCreate}
              aria-label={`Add task to ${title}`}
              data-board-add-task={pendingLane}
            >
              <span aria-hidden="true">+</span> ADD TASK
            </button>
          ) : (
            <span className="list-board-lane__add-placeholder type-metadata" aria-hidden="true">
              Adding task
            </span>
          )}
        </div>
      ) : (
        <div
          className="list-board-lane__reserved-action list-board-lane__reserved-action--bottom"
          aria-hidden="true"
          data-board-add-slot="reserved"
        />
      )}
    </section>
  );
}

function fixtureOptions(snapshot: ListBoardSnapshot | undefined): ListBoardOption[] {
  if (!snapshot || snapshot.target.kind !== "list" || !snapshot.target.id) return [];
  return [{ id: snapshot.target.id, title: snapshot.target.title }];
}

export function ListBoard({
  target,
  fixtureSnapshot,
  fixtureReorderState,
  onTargetChange,
}: ListBoardProps) {
  const [snapshot, setSnapshot] = useState<ListBoardSnapshot | null>(fixtureSnapshot ?? null);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [mutationStatus, setMutationStatus] = useState<string>("");
  const [mutationRefreshBlocked, setMutationRefreshBlocked] = useState(false);
  const [listOptions, setListOptions] = useState<ListBoardOption[]>(() => fixtureOptions(fixtureSnapshot));
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [mutationPendingTaskId, setMutationPendingTaskId] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<TaskEditorState | null>(null);
  const [editorMutationPending, setEditorMutationPending] = useState(false);
  const [scheduleEditorTaskId, setScheduleEditorTaskId] = useState<string | null>(null);
  const [subtaskPanel, setSubtaskPanel] = useState<SubtaskPanelState | null>(null);
  const [settlingTaskId, setSettlingTaskId] = useState<string | null>(null);
  const [timerPayload, setTimerPayload] = useState<TimerSessionPayload | null>(null);
  const [timerProjectionError, setTimerProjectionError] = useState<string | null>(null);
  const settleTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
  }, []);

  useEffect(() => {
    if (fixtureSnapshot) {
      setSnapshot(fixtureSnapshot);
      setError(null);
      setMutationError(null);
      setMutationStatus("");
      setMutationRefreshBlocked(false);
      setEditorState(null);
      setEditorMutationPending(false);
      setScheduleEditorTaskId(null);
      setSubtaskPanel(null);
      setListOptions(fixtureOptions(fixtureSnapshot));
      return;
    }

    let disposed = false;
    setSnapshot(null);
    setError(null);
    setMutationError(null);
    setMutationStatus("");
    setMutationRefreshBlocked(false);
    setEditorState(null);
    setEditorMutationPending(false);
    setScheduleEditorTaskId(null);
    setSubtaskPanel(null);
    void getListBoardSnapshot(target)
      .then((payload) => {
        if (!disposed) {
          setSnapshot(payload);
          setError(null);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setSnapshot(null);
          setError(formatInvokeError(failure));
        }
      });

    return () => {
      disposed = true;
    };
  }, [fixtureSnapshot, target.kind, target.kind === "list" ? target.id : null]);

  useEffect(() => {
    if (fixtureSnapshot) {
      setTimerPayload(null);
      setTimerProjectionError(null);
      return;
    }

    let disposed = false;
    let stopListening: (() => void) | undefined;
    setTimerPayload(null);
    setTimerProjectionError(null);
    void connectTimerSessionProjection((incoming) => {
      if (!disposed) {
        setTimerPayload((current) => applyTimerSessionProjection(current, incoming));
        setTimerProjectionError(null);
      }
    })
      .then((unlisten) => {
        if (disposed) {
          unlisten();
        } else {
          stopListening = unlisten;
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) setTimerProjectionError(formatInvokeError(failure));
      });

    return () => {
      disposed = true;
      stopListening?.();
    };
  }, [fixtureSnapshot]);

  useEffect(() => {
    if (fixtureSnapshot) return;

    let disposed = false;
    void invoke<HomeSnapshot>("get_home_snapshot")
      .then((home) => {
        if (!disposed) {
          setListOptions(home.lists.map((list) => ({ id: list.id, title: list.title })));
        }
      })
      .catch(() => {
        if (!disposed) setListOptions([]);
      });

    return () => {
      disposed = true;
    };
  }, [fixtureSnapshot]);

  const selectorOptions = useMemo(() => {
    const options = [...listOptions];
    if (
      snapshot?.target.kind === "list"
      && snapshot.target.id
      && !options.some((option) => option.id === snapshot.target.id)
    ) {
      options.push({ id: snapshot.target.id, title: snapshot.target.title });
    }
    return options;
  }, [listOptions, snapshot]);

  if (error) {
    return (
      <section className="list-board list-board--message" data-list-board="error" role="alert">
        <strong>List board could not be loaded.</strong>
        <span>{error}</span>
      </section>
    );
  }

  if (!snapshot) {
    return (
      <section className="list-board list-board--message" data-list-board="loading" role="status">
        Loading your local planning board…
      </section>
    );
  }

  const aggregateView = snapshot.target.kind === "all_lists";
  const selectedTarget = aggregateView ? ALL_LISTS_VALUE : snapshot.target.id ?? ALL_LISTS_VALUE;
  const interactionBoardEnabled = !fixtureSnapshot
    && !mutationRefreshBlocked
    && target.kind === "list"
    && snapshot.target.kind === "list"
    && snapshot.target.id === target.id;
  const interactionReorderEnabled = interactionBoardEnabled
    && editorState === null
    && !editorMutationPending
    && scheduleEditorTaskId === null
    && subtaskPanel === null;
  const canStartCreate = interactionBoardEnabled
    && mutationPendingTaskId === null
    && editorState === null
    && !editorMutationPending
    && scheduleEditorTaskId === null
    && subtaskPanel === null;
  const canStartTaskEditor = canStartCreate
    && timerPayload !== null
    && timerProjectionError === null;
  const canStartScheduleEditor = canStartCreate
    && timerPayload !== null
    && timerProjectionError === null;
  const canOpenSubtasks = !fixtureSnapshot
    && !mutationRefreshBlocked
    && mutationPendingTaskId === null
    && editorState === null
    && !editorMutationPending
    && scheduleEditorTaskId === null
    && subtaskPanel === null;
  const presentationReorderEnabled = interactionReorderEnabled || fixtureReorderState !== undefined;
  const displayedDragState = fixtureReorderState?.draggingTaskId && fixtureReorderState.sourceLane
    ? {
        taskId: fixtureReorderState.draggingTaskId,
        sourceLane: fixtureReorderState.sourceLane,
      }
    : dragState;
  const displayedDropTarget = fixtureReorderState?.dropLane
    ? {
        lane: fixtureReorderState.dropLane,
        beforeTaskId: fixtureReorderState.beforeTaskId ?? null,
      }
    : dropTarget;
  const displayedSettlingTaskId = fixtureReorderState?.settlingTaskId ?? settlingTaskId;

  const findTask = (taskId: string): ListBoardTask | null => {
    for (const { key } of LANES) {
      const task = snapshot[key].tasks.find((candidate) => candidate.id === taskId);
      if (task) return task;
    }
    return null;
  };
  const scheduleEditorTask = scheduleEditorTaskId ? findTask(scheduleEditorTaskId) : null;

  const markSettling = (taskId: string) => {
    setSettlingTaskId(taskId);
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      setSettlingTaskId(null);
      settleTimer.current = null;
    }, SETTLE_DURATION_MS);
  };

  const refreshAfterMutation = async (taskId: string) => {
    const payload = await getListBoardSnapshot(target);
    setSnapshot(payload);
    markSettling(taskId);
  };

  const handleCommittedRefreshFailure = (failure: unknown) => {
    setMutationRefreshBlocked(true);
    setMutationError(
      `Task change was saved, but the board could not refresh. ${formatInvokeError(failure)} Switch lists or reopen this board before making more task changes.`,
    );
  };

  const handleCommittedSubtaskRefreshFailure = (failure: unknown) => {
    setMutationRefreshBlocked(true);
    setMutationError(
      `Subtask change was saved, but authoritative task details could not refresh. ${formatInvokeError(failure)} Switch lists or reopen this board before making more task changes.`,
    );
    setSubtaskPanel((current) => current
      ? {
          ...current,
          loading: false,
          pending: false,
          error: "Subtasks changed, but this panel is stale. Reopen the board before editing again.",
        }
      : current);
  };

  const refreshSubtasksAndBoard = async (taskId: string, listId: string) => {
    const [subtasksPayload, boardPayload] = await Promise.all([
      getListBoardTaskSubtasks(taskId, listId),
      getListBoardSnapshot(target),
    ]);
    setSnapshot(boardPayload);
    setSubtaskPanel((current) => current?.taskId === taskId
      ? {
          ...current,
          loading: false,
          snapshot: subtasksPayload,
          error: null,
          pending: false,
        }
      : current);
    markSettling(taskId);
  };

  const handleScheduleCommitted = async (
    taskId: string,
    message: string,
    warning?: string | null,
  ) => {
    setMutationPendingTaskId(taskId);
    setScheduleEditorTaskId(null);
    setMutationStatus(message);
    setMutationError(warning
      ? `Recurrence change was saved, but immediate occurrence materialization failed. ${warning} Background recurrence processing will retry.`
      : null);
    try {
      await refreshAfterMutation(taskId);
      setMutationRefreshBlocked(false);
    } catch (failure: unknown) {
      handleCommittedRefreshFailure(failure);
    } finally {
      setMutationPendingTaskId(null);
    }
  };

  const commitDrop = async (
    taskId: string,
    sourceLane: PendingLaneKey,
    targetLane: PendingLaneKey,
    beforeTaskId: string | null,
  ) => {
    if (
      !interactionReorderEnabled
      || target.kind !== "list"
      || mutationPendingTaskId
      || mutationRefreshBlocked
    ) return;
    const task = findTask(taskId);
    if (!task || !isManualReorderTask(task)) return;

    setMutationPendingTaskId(taskId);
    setMutationError(null);
    setDragState(null);
    setDropTarget(null);

    const sameLane = sourceLane === targetLane;
    const successMessage = sameLane
      ? `Reordered ${task.title}.`
      : `Moved ${task.title} to ${LANES.find((lane) => lane.key === targetLane)?.title ?? "lane"}.`;

    try {
      if (sameLane) {
        await reorderListBoardTask({
          taskId,
          listId: target.id,
          sourceLane: LANE_TOKEN[sourceLane],
          beforeTaskId,
        });
      } else {
        await moveListBoardTask({
          taskId,
          listId: target.id,
          sourceLane: LANE_TOKEN[sourceLane],
          targetLane: LANE_TOKEN[targetLane],
        });
      }
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
      setMutationStatus(`${sameLane ? "Could not reorder" : "Could not move"} ${task.title}.`);
      setMutationPendingTaskId(null);
      return;
    }

    setMutationStatus(successMessage);
    try {
      await refreshAfterMutation(taskId);
      setMutationRefreshBlocked(false);
    } catch (failure: unknown) {
      handleCommittedRefreshFailure(failure);
    } finally {
      setMutationPendingTaskId(null);
    }
  };

  const submitCreate = async () => {
    if (
      !interactionBoardEnabled
      || target.kind !== "list"
      || editorState?.kind !== "create"
      || editorMutationPending
      || mutationPendingTaskId
    ) return;
    const title = editorState.title.trim();
    if (!title) {
      setMutationError("Task title must not be empty.");
      setMutationStatus("Could not add task.");
      return;
    }

    setEditorMutationPending(true);
    setMutationError(null);
    let createdTaskId: string;
    try {
      createdTaskId = await createListBoardTask({
        listId: target.id,
        lane: LANE_TOKEN[editorState.lane],
        title,
      });
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
      setMutationStatus(`Could not add ${title}.`);
      setEditorMutationPending(false);
      return;
    }

    setEditorState(null);
    setMutationStatus(`Added ${title}.`);
    try {
      await refreshAfterMutation(createdTaskId);
      setMutationRefreshBlocked(false);
    } catch (failure: unknown) {
      handleCommittedRefreshFailure(failure);
    } finally {
      setEditorMutationPending(false);
    }
  };

  const submitTitleEdit = async () => {
    if (
      !interactionBoardEnabled
      || target.kind !== "list"
      || editorState?.kind !== "edit"
      || editorMutationPending
      || mutationPendingTaskId
    ) return;
    const title = editorState.title.trim();
    if (!title) {
      setMutationError("Task title must not be empty.");
      setMutationStatus("Could not save task title.");
      return;
    }
    if (title === editorState.expectedTitle) {
      setEditorState(null);
      setMutationError(null);
      return;
    }
    if (liveStateForTask(timerPayload, editorState.taskId) !== null) {
      setMutationError("Live task titles cannot be edited from the List Board.");
      setMutationStatus("Could not save task title.");
      return;
    }

    const { taskId, expectedTitle } = editorState;
    setEditorMutationPending(true);
    setMutationError(null);
    try {
      await updateListBoardTaskTitle({
        taskId,
        listId: target.id,
        expectedTitle,
        title,
      });
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
      setMutationStatus(`Could not rename ${expectedTitle}.`);
      setEditorMutationPending(false);
      return;
    }

    setEditorState(null);
    setMutationStatus(`Renamed ${expectedTitle} to ${title}.`);
    try {
      await refreshAfterMutation(taskId);
      setMutationRefreshBlocked(false);
    } catch (failure: unknown) {
      handleCommittedRefreshFailure(failure);
    } finally {
      setEditorMutationPending(false);
    }
  };

  const submitMetricEdit = async () => {
    if (
      !interactionBoardEnabled
      || target.kind !== "list"
      || editorState?.kind !== "metric"
      || editorMutationPending
      || mutationPendingTaskId
    ) return;
    if (editorState.value.trim() === editorState.initialValue) {
      setEditorState(null);
      setMutationError(null);
      return;
    }

    const parsed = parseMetricDuration(editorState.value, editorState.metric);
    if (!parsed.ok) {
      setMutationError(parsed.message);
      setMutationStatus("Could not save task metric.");
      return;
    }

    const taskId = editorState.taskId;
    const metricLabel = editorState.metric === "estimate" ? "EST" : "Time Taken";
    setEditorMutationPending(true);
    setMutationError(null);
    try {
      if (editorState.metric === "estimate") {
        if (editorState.live) {
          const payload = await setPausedTimerEstimate({
            taskId,
            listId: editorState.listId,
            expectedEstSeconds: editorState.expectedEstSeconds,
            estSeconds: parsed.seconds,
          });
          setTimerPayload((current) => applyTimerSessionProjection(current, payload));
        } else {
          await updateListBoardTaskEstimate({
            taskId,
            listId: editorState.listId,
            expectedEstSeconds: editorState.expectedEstSeconds,
            estSeconds: parsed.seconds,
          });
        }
      } else {
        const totalSeconds = parsed.seconds;
        if (totalSeconds === null) {
          setMutationError("Time Taken must not be blank.");
          setMutationStatus("Could not save task metric.");
          setEditorMutationPending(false);
          return;
        }
        if (editorState.live) {
          const payload = await setPausedTimerTimeTaken({
            taskId,
            expectedTotalSeconds: editorState.expectedTimeTakenSeconds,
            totalSeconds,
          });
          setTimerPayload((current) => applyTimerSessionProjection(current, payload));
        } else {
          await updateListBoardTaskTimeTaken({
            taskId,
            listId: editorState.listId,
            expectedTotalSeconds: editorState.expectedTimeTakenSeconds,
            totalSeconds,
          });
        }
      }
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
      setMutationStatus(`Could not save ${metricLabel}.`);
      setEditorMutationPending(false);
      return;
    }

    setEditorState(null);
    setMutationStatus(`${metricLabel} saved.`);
    try {
      await refreshAfterMutation(taskId);
      setMutationRefreshBlocked(false);
    } catch (failure: unknown) {
      handleCommittedRefreshFailure(failure);
    } finally {
      setEditorMutationPending(false);
    }
  };

  const toggleSubtaskPanel = (task: ListBoardTask) => {
    if (subtaskPanel?.taskId === task.id) {
      if (!subtaskPanel.pending) setSubtaskPanel(null);
      return;
    }
    if (!canOpenSubtasks) return;

    setDragState(null);
    setDropTarget(null);
    setMutationError(null);
    setSubtaskPanel({
      taskId: task.id,
      listId: task.listId,
      loading: true,
      snapshot: null,
      error: null,
      createValue: "",
      editor: null,
      pending: false,
    });
    void getListBoardTaskSubtasks(task.id, task.listId)
      .then((payload) => {
        setSubtaskPanel((current) => current?.taskId === task.id
          ? { ...current, loading: false, snapshot: payload, error: null }
          : current);
      })
      .catch((failure: unknown) => {
        setSubtaskPanel((current) => current?.taskId === task.id
          ? { ...current, loading: false, error: formatInvokeError(failure) }
          : current);
      });
  };

  const beginSubtaskMutation = (): SubtaskPanelState | null => {
    if (
      !interactionBoardEnabled
      || target.kind !== "list"
      || !subtaskPanel
      || subtaskPanel.loading
      || subtaskPanel.error
      || !subtaskPanel.snapshot?.mutable
      || subtaskPanel.pending
      || subtaskPanel.listId !== target.id
    ) return null;
    setSubtaskPanel((current) => current ? { ...current, pending: true } : current);
    setMutationError(null);
    return subtaskPanel;
  };

  const finishSubtaskCommit = async (
    panel: SubtaskPanelState,
    message: string,
  ) => {
    setMutationStatus(message);
    try {
      await refreshSubtasksAndBoard(panel.taskId, panel.listId);
      setMutationRefreshBlocked(false);
    } catch (failure: unknown) {
      handleCommittedSubtaskRefreshFailure(failure);
    }
  };

  const failSubtaskMutation = (failure: unknown, message: string) => {
    setMutationError(formatInvokeError(failure));
    setMutationStatus(message);
    setSubtaskPanel((current) => current ? { ...current, pending: false } : current);
  };

  const submitSubtaskCreate = async () => {
    const panel = beginSubtaskMutation();
    if (!panel) return;
    const title = panel.createValue.trim();
    if (!title) {
      setSubtaskPanel((current) => current ? { ...current, pending: false } : current);
      setMutationError("Subtask title must not be empty.");
      setMutationStatus("Could not add subtask.");
      return;
    }
    try {
      await createListBoardSubtask({ taskId: panel.taskId, listId: panel.listId, title });
    } catch (failure: unknown) {
      failSubtaskMutation(failure, `Could not add ${title}.`);
      return;
    }
    setSubtaskPanel((current) => current?.taskId === panel.taskId
      ? { ...current, createValue: "" }
      : current);
    await finishSubtaskCommit(panel, `Added subtask ${title}.`);
  };

  const submitSubtaskTitleEdit = async () => {
    const panel = beginSubtaskMutation();
    if (!panel || !panel.editor) {
      setSubtaskPanel((current) => current ? { ...current, pending: false } : current);
      return;
    }
    const title = panel.editor.value.trim();
    if (!title) {
      setSubtaskPanel((current) => current ? { ...current, pending: false } : current);
      setMutationError("Subtask title must not be empty.");
      setMutationStatus("Could not save subtask title.");
      return;
    }
    if (title === panel.editor.expectedTitle) {
      setSubtaskPanel((current) => current ? { ...current, pending: false, editor: null } : current);
      return;
    }
    try {
      await updateListBoardSubtaskTitle({
        subtaskId: panel.editor.id,
        taskId: panel.taskId,
        listId: panel.listId,
        expectedTitle: panel.editor.expectedTitle,
        title,
      });
    } catch (failure: unknown) {
      failSubtaskMutation(failure, `Could not rename ${panel.editor.expectedTitle}.`);
      return;
    }
    setSubtaskPanel((current) => current?.taskId === panel.taskId
      ? { ...current, editor: null }
      : current);
    await finishSubtaskCommit(panel, `Renamed subtask to ${title}.`);
  };

  const toggleSubtaskCompleted = async (subtask: BoardSubtask) => {
    const panel = beginSubtaskMutation();
    if (!panel || subtask.taskId !== panel.taskId) return;
    const completed = subtask.completedAt === null;
    try {
      await setListBoardSubtaskCompletion({
        subtaskId: subtask.id,
        taskId: panel.taskId,
        listId: panel.listId,
        expectedCompletedAt: subtask.completedAt,
        completed,
      });
    } catch (failure: unknown) {
      failSubtaskMutation(failure, `Could not ${completed ? "complete" : "reopen"} ${subtask.title}.`);
      return;
    }
    await finishSubtaskCommit(panel, `${completed ? "Completed" : "Reopened"} ${subtask.title}.`);
  };

  const moveSubtask = async (subtask: BoardSubtask, direction: SubtaskDirection) => {
    const panel = beginSubtaskMutation();
    if (!panel?.snapshot || subtask.taskId !== panel.taskId) return;
    const expectedOrder = panel.snapshot.subtasks.map((item) => item.id);
    const index = expectedOrder.indexOf(subtask.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= expectedOrder.length) {
      setSubtaskPanel((current) => current ? { ...current, pending: false } : current);
      return;
    }
    const orderedIds = [...expectedOrder];
    [orderedIds[index], orderedIds[targetIndex]] = [orderedIds[targetIndex], orderedIds[index]];
    try {
      await reorderListBoardSubtasks({
        taskId: panel.taskId,
        listId: panel.listId,
        expectedOrder,
        orderedIds,
      });
    } catch (failure: unknown) {
      failSubtaskMutation(failure, `Could not move ${subtask.title}.`);
      return;
    }
    await finishSubtaskCommit(panel, `Moved ${subtask.title} ${direction}.`);
  };

  const deleteSubtask = async (subtask: BoardSubtask) => {
    const panel = beginSubtaskMutation();
    if (!panel || subtask.taskId !== panel.taskId) return;
    try {
      await deleteListBoardSubtask({
        subtaskId: subtask.id,
        taskId: panel.taskId,
        listId: panel.listId,
        expectedUpdatedAt: subtask.updatedAt,
      });
    } catch (failure: unknown) {
      failSubtaskMutation(failure, `Could not delete ${subtask.title}.`);
      return;
    }
    await finishSubtaskCommit(panel, `Deleted subtask ${subtask.title}.`);
  };

  const handleDragStart = (
    task: ListBoardTask,
    lane: PendingLaneKey,
    event: ReactDragEvent<HTMLDivElement>,
  ) => {
    if ((event.target as HTMLElement).closest(
      "[data-task-action], [data-task-title-control], [data-task-metric-control], [data-task-schedule-control], [data-task-subtask-control]",
    )) {
      event.preventDefault();
      return;
    }
    if (!interactionReorderEnabled || mutationPendingTaskId) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", task.id);
    setDragState({ taskId: task.id, sourceLane: lane });
    setDropTarget({ lane, beforeTaskId: task.id });
    setMutationError(null);
  };

  const handleDragOverTask = (
    task: ListBoardTask,
    lane: PendingLaneKey,
    event: ReactDragEvent<HTMLDivElement>,
  ) => {
    if (!dragState || mutationPendingTaskId) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";

    if (dragState.sourceLane !== lane) {
      setDropTarget({ lane, beforeTaskId: null });
      return;
    }

    const eligible = manualTasks(snapshot[lane]);
    const hoveredIndex = taskIndex(eligible, task.id);
    if (hoveredIndex < 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const before = event.clientY < bounds.top + bounds.height / 2;
    setDropTarget({
      lane,
      beforeTaskId: before
        ? task.id
        : eligible[hoveredIndex + 1]?.id ?? null,
    });
  };

  const handleDragOverLane = (
    lane: PendingLaneKey,
    event: ReactDragEvent<HTMLDivElement>,
  ) => {
    if (!dragState || mutationPendingTaskId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTarget({ lane, beforeTaskId: null });
  };

  const handleDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!dragState || !dropTarget) return;
    void commitDrop(
      dragState.taskId,
      dragState.sourceLane,
      dropTarget.lane,
      dropTarget.beforeTaskId,
    );
  };

  const handleMoveWithinLane = (
    task: ListBoardTask,
    lane: PendingLaneKey,
    direction: WithinLaneDirection,
  ) => {
    if (mutationPendingTaskId) return;
    const eligible = manualTasks(snapshot[lane]);
    const index = taskIndex(eligible, task.id);
    if (index < 0) return;

    if (direction === "up" && index > 0) {
      void commitDrop(task.id, lane, lane, eligible[index - 1].id);
      return;
    }
    if (direction === "down" && index < eligible.length - 1) {
      void commitDrop(task.id, lane, lane, eligible[index + 2]?.id ?? null);
    }
  };

  const handleTaskKeyDown = (
    task: ListBoardTask,
    lane: PendingLaneKey,
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (!event.altKey || mutationPendingTaskId) return;
    const eligible = manualTasks(snapshot[lane]);
    const index = taskIndex(eligible, task.id);
    if (index < 0) return;

    if (event.key === "ArrowUp" && index > 0) {
      event.preventDefault();
      handleMoveWithinLane(task, lane, "up");
      return;
    }
    if (event.key === "ArrowDown" && index < eligible.length - 1) {
      event.preventDefault();
      handleMoveWithinLane(task, lane, "down");
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const laneIndex = PENDING_LANES.indexOf(lane);
      const direction = event.key === "ArrowLeft" ? -1 : 1;
      const targetLane = PENDING_LANES[laneIndex + direction];
      if (!targetLane) return;
      event.preventDefault();
      void commitDrop(task.id, lane, targetLane, null);
    }
  };

  const subtaskControls: BoardSubtaskControls | undefined = fixtureSnapshot
    ? undefined
    : {
        panel: subtaskPanel,
        canOpen: canOpenSubtasks,
        onToggle: toggleSubtaskPanel,
        onCreateValueChange: (value) => {
          setSubtaskPanel((current) => current ? { ...current, createValue: value } : current);
        },
        onCreate: () => void submitSubtaskCreate(),
        onStartEdit: (subtask) => {
          if (!subtaskPanel?.snapshot?.mutable || subtaskPanel.pending) return;
          setSubtaskPanel((current) => current
            ? {
                ...current,
                editor: { id: subtask.id, expectedTitle: subtask.title, value: subtask.title },
              }
            : current);
          setMutationError(null);
          setMutationStatus("");
        },
        onEditValueChange: (value) => {
          setSubtaskPanel((current) => current?.editor
            ? { ...current, editor: { ...current.editor, value } }
            : current);
        },
        onSaveEdit: () => void submitSubtaskTitleEdit(),
        onCancelEdit: () => {
          if (subtaskPanel?.pending) return;
          setSubtaskPanel((current) => current ? { ...current, editor: null } : current);
          setMutationError(null);
        },
        onToggleCompleted: (subtask) => void toggleSubtaskCompleted(subtask),
        onMove: (subtask, direction) => void moveSubtask(subtask, direction),
        onDelete: (subtask) => void deleteSubtask(subtask),
      };

  return (
    <section
      className="list-board"
      data-list-board="main"
      data-board-target={snapshot.target.kind}
      data-board-reorder-enabled={interactionReorderEnabled ? "true" : "false"}
      data-board-task-editor={editorState?.kind ?? "idle"}
      data-board-metric-editor={editorState?.kind === "metric" ? editorState.metric : "none"}
      data-board-schedule-editor={scheduleEditorTaskId ? "open" : "closed"}
      data-board-subtask-panel={subtaskPanel?.taskId ?? "closed"}
      data-board-timer-projection={timerPayload ? "ready" : timerProjectionError ? "error" : "loading"}
      aria-labelledby="list-board-title"
    >
      <p id="list-board-reorder-instructions" className="list-board__reorder-instructions">
        Reorder an unscheduled task with Alt plus Up or Down. Move it between Backlog, This Week, and Today with Alt plus Left or Right.
      </p>
      <div className="list-board__reorder-status" aria-live="polite" aria-atomic="true">
        {mutationStatus}
      </div>
      {mutationError ? (
        <div className="list-board__mutation-error type-metadata" role="alert">
          {mutationError}
        </div>
      ) : null}
      {timerProjectionError ? (
        <div className="list-board__mutation-error type-metadata" role="alert">
          Task editing is unavailable because live timer state could not be loaded. {timerProjectionError}
        </div>
      ) : null}

      <header className="list-board__header">
        <div className="list-board__identity">
          <span
            className="list-board__accent"
            aria-hidden="true"
            style={safeListAccent(snapshot.target.color)}
          />
          <div>
            <p className="list-board__eyebrow type-metadata">Planning</p>
            <h1 id="list-board-title" className="list-board__title type-page-title">
              {snapshot.target.title}
            </h1>
          </div>
        </div>

        <div className="list-board__controls">
          <label
            className="list-board__selector"
            data-board-list-selector="true"
            data-board-selected-target={selectedTarget}
          >
            <span className="type-metadata">List</span>
            <select
              value={selectedTarget}
              onChange={(event) => {
                if (!onTargetChange) return;
                const value = event.target.value;
                onTargetChange(
                  value === ALL_LISTS_VALUE
                    ? { kind: "all" }
                    : { kind: "list", id: value },
                );
              }}
              disabled={!onTargetChange
                || mutationPendingTaskId !== null
                || editorMutationPending
                || scheduleEditorTaskId !== null
                || subtaskPanel !== null}
              aria-label="Planning list"
            >
              <option value={ALL_LISTS_VALUE}>All Lists</option>
              {selectorOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.title}</option>
              ))}
            </select>
          </label>
          <p className="list-board__helper">
            {aggregateView
              ? "Tasks from your active lists, organized into one planning view."
              : "Plan this list across Backlog, This Week, Today, and Done."}
          </p>
        </div>
      </header>

      <div className="list-board__lanes" data-board-lane-count={LANES.length}>
        {LANES.map(({ key, title }) => (
          <BoardLane
            key={key}
            laneKey={key}
            lane={snapshot[key]}
            title={title}
            aggregateView={aggregateView}
            presentationReorderEnabled={presentationReorderEnabled}
            interactionReorderEnabled={interactionReorderEnabled}
            canStartCreate={canStartCreate}
            canStartTaskEditor={canStartTaskEditor}
            canStartScheduleEditor={canStartScheduleEditor}
            timerPayload={timerPayload}
            editorState={editorState}
            editorMutationPending={editorMutationPending}
            dragState={displayedDragState}
            dropTarget={displayedDropTarget}
            settlingTaskId={displayedSettlingTaskId}
            mutationPendingTaskId={mutationPendingTaskId}
            subtaskControls={subtaskControls}
            onDragStart={handleDragStart}
            onDragOverTask={handleDragOverTask}
            onDragOverLane={handleDragOverLane}
            onDrop={handleDrop}
            onDragEnd={() => {
              setDragState(null);
              setDropTarget(null);
            }}
            onTaskKeyDown={handleTaskKeyDown}
            onMoveWithinLane={handleMoveWithinLane}
            onStartCreate={(lane) => {
              if (!canStartCreate) return;
              setMutationError(null);
              setMutationStatus("");
              setEditorState({ kind: "create", lane, title: "" });
            }}
            onCreateTitleChange={(value) => {
              setEditorState((current) => current?.kind === "create"
                ? { ...current, title: value }
                : current);
            }}
            onSubmitCreate={() => void submitCreate()}
            onStartTitleEdit={(task) => {
              if (!canStartTaskEditor || liveStateForTask(timerPayload, task.id) !== null) return;
              setMutationError(null);
              setMutationStatus("");
              setEditorState({
                kind: "edit",
                taskId: task.id,
                expectedTitle: task.title,
                title: task.title,
              });
            }}
            onEditTitleChange={(value) => {
              setEditorState((current) => current?.kind === "edit"
                ? { ...current, title: value }
                : current);
            }}
            onSubmitTitleEdit={() => void submitTitleEdit()}
            onStartMetricEdit={(task, metric, live) => {
              if (!canStartTaskEditor) return;
              const initialValue = metric === "estimate"
                ? estimateDraft(task.estSeconds)
                : timeTakenDraft(task.timeTakenSeconds);
              setMutationError(null);
              setMutationStatus("");
              setEditorState({
                kind: "metric",
                taskId: task.id,
                listId: task.listId,
                metric,
                value: initialValue,
                initialValue,
                expectedEstSeconds: task.estSeconds,
                expectedTimeTakenSeconds: task.timeTakenSeconds,
                live,
              });
            }}
            onMetricValueChange={(value) => {
              setEditorState((current) => current?.kind === "metric"
                ? { ...current, value }
                : current);
            }}
            onSubmitMetricEdit={() => void submitMetricEdit()}
            onStartScheduleEdit={(task) => {
              if (!canStartScheduleEditor || liveStateForTask(timerPayload, task.id) !== null) return;
              setMutationError(null);
              setMutationStatus("");
              setDragState(null);
              setDropTarget(null);
              setScheduleEditorTaskId(task.id);
            }}
            onCancelEditor={() => {
              if (editorMutationPending) return;
              setEditorState(null);
              setMutationError(null);
            }}
          />
        ))}
      </div>

      {scheduleEditorTask && target.kind === "list" ? (
        <TaskScheduleDialog
          taskId={scheduleEditorTask.id}
          listId={target.id}
          taskTitle={scheduleEditorTask.title}
          displayTimezone={snapshot.displayTimezone}
          onClose={() => setScheduleEditorTaskId(null)}
          onCommitted={handleScheduleCommitted}
        />
      ) : null}
    </section>
  );
}
