import type { CSSProperties, FormEvent, KeyboardEvent } from "react";
import { useLayoutEffect, useRef } from "react";
import { formatVisibleDate, formatVisibleDateTime } from "./dateTimeFormat";
import type { BoardSubtask, ListBoardTask } from "./listBoardApi";
import { Menu, MenuItem, Tooltip } from "./overlayPrimitives";
import { TaskNotes } from "./TaskNotes";
import { TaskSubtasks, type TaskSubtasksModel } from "./TaskSubtasks";
import type { TimerStateKind } from "./timerSessionApi";

type FixturePresentationState =
  | "normal"
  | "action_revealed"
  | "scheduled"
  | "overdue"
  | "done"
  | "inline_create"
  | "notes_expanded"
  | "subtasks_expanded"
  | "paused_editable"
  | "destructive_confirm";

export type TaskCardActions = {
  onSubtasks?: () => void;
  onNotes?: () => void;
  onMoveLaneLeft?: () => void;
  onMoveLaneRight?: () => void;
  onSchedule?: () => void;
  onChangeList?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
};

export type TaskCardDeleteConfirmation = {
  pending: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export type TaskCardTitleEditor = {
  value: string;
  pending: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export type TaskCardMetricKind = "estimate" | "time_taken";

export type TaskCardMetricEditor = {
  metric: TaskCardMetricKind;
  value: string;
  pending: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export type TaskCardNotes = {
  expanded: boolean;
  canExpand: boolean;
  readOnly: boolean;
  onToggleExpanded: () => void;
  onMutationStatus: (status: string, error: string | null) => void;
  onRefreshBlocked: (message: string) => void;
};

export type TaskCardSubtasks = {
  model?: TaskSubtasksModel;
  canExpand: boolean;
  onToggleExpanded: () => void;
  onCreateValueChange: (value: string) => void;
  onCreate: () => void;
  onStartEdit: (subtask: BoardSubtask) => void;
  onEditValueChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggleCompleted: (subtask: BoardSubtask) => void;
  onMove: (subtask: BoardSubtask, direction: "up" | "down") => void;
  onDelete: (subtask: BoardSubtask) => void;
};

type TaskCardProps = {
  task: ListBoardTask;
  aggregateView: boolean;
  fixtureState?: FixturePresentationState;
  actions?: TaskCardActions;
  onComplete?: () => void;
  onTitleEdit?: () => void;
  titleEditor?: TaskCardTitleEditor;
  onEstimateEdit?: () => void;
  onTimeTakenEdit?: () => void;
  metricEditor?: TaskCardMetricEditor;
  onScheduleEdit?: () => void;
  notes?: TaskCardNotes;
  subtasks?: TaskCardSubtasks;
  liveState?: TimerStateKind | null;
  hideTaskTimes?: boolean;
  ordinal?: number;
  deleteConfirmation?: TaskCardDeleteConfirmation;
  interactionDisabled?: boolean;
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const WHOLE_SECONDS = /^\d+$/;
const fixtureAction = () => undefined;
const FIXTURE_REORDER_ACTIONS: TaskCardActions = {
  onSubtasks: fixtureAction,
  onNotes: fixtureAction,
  onMoveLaneLeft: fixtureAction,
  onMoveLaneRight: fixtureAction,
  onSchedule: fixtureAction,
};

function safeListAccent(color: string | null): CSSProperties | undefined {
  if (!color || !HEX_COLOR.test(color)) return undefined;
  return { "--list-board-task-accent": color } as CSSProperties;
}

function formatEstimate(totalSeconds: number | null): string {
  if (totalSeconds === null || !Number.isFinite(totalSeconds) || totalSeconds <= 0) return "—";
  const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatTimeTaken(rawSeconds: string): string {
  if (!WHOLE_SECONDS.test(rawSeconds)) return "—";
  const seconds = BigInt(rawSeconds);
  if (seconds === 0n) return "0m";
  const totalMinutes = (seconds + 59n) / 60n;
  const hours = totalMinutes / 60n;
  const minutes = totalMinutes % 60n;
  if (hours === 0n) return `${minutes}m`;
  if (minutes === 0n) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function scheduleLabel(task: ListBoardTask): string | null {
  if (!task.scheduledLocalDate) return null;
  return task.scheduledLocalTime
    ? formatVisibleDateTime(task.scheduledLocalDate, task.scheduledLocalTime)
    : formatVisibleDate(task.scheduledLocalDate);
}

function recurrenceLabel(task: ListBoardTask): string | null {
  if (task.recurrenceRuleId) return "Repeats";
  if (task.recurrenceParentTaskId) return "Occurrence";
  return null;
}

function recurrenceState(task: ListBoardTask): "parent" | "occurrence" | "none" {
  if (task.recurrenceRuleId) return "parent";
  if (task.recurrenceParentTaskId) return "occurrence";
  return "none";
}

function derivedState(task: ListBoardTask): FixturePresentationState {
  if (task.completedAt) return "done";
  if (task.isOverdue) return "overdue";
  if (task.scheduledLocalDate) return "scheduled";
  return "normal";
}

function liveStateLabel(state: TimerStateKind | null | undefined): string | null {
  switch (state) {
    case "paused":
      return "Live · Paused";
    case "overtime_paused":
      return "Live · Overtime paused";
    case "running":
      return "Live · Running";
    case "overtime_running":
      return "Live · Overtime";
    case "break":
      return "Live · Break";
    case "time_up":
      return "Live · Time's up";
    case "idle":
    case null:
    case undefined:
      return null;
  }
}

function TaskActionButton({
  label,
  glyph,
  action,
  actionId,
  disabled = false,
}: {
  label: string;
  glyph: string;
  action: () => void;
  actionId: "subtasks" | "notes" | "lane-left" | "lane-right";
  disabled?: boolean;
}) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        className="list-board-task__action-button motion-interactive"
        aria-label={label}
        data-task-action={actionId}
        draggable={false}
        disabled={disabled}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={action}
      >
        <span aria-hidden="true">{glyph}</span>
      </button>
    </Tooltip>
  );
}

function TaskOverflowMenu({
  actions,
  scheduleActionLabel,
  confirmation,
}: {
  actions: TaskCardActions;
  scheduleActionLabel: "Schedule" | "Update Schedule";
  confirmation?: TaskCardDeleteConfirmation;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const hadConfirmation = useRef(false);
  const confirming = Boolean(confirmation);
  useLayoutEffect(() => {
    if (confirmation?.pending) return;
    if (!confirming && !hadConfirmation.current) return;
    hadConfirmation.current = confirming;
    if (!rootRef.current?.querySelector('[role="menu"][data-open="true"]')) return;
    const control = rootRef.current.querySelector<HTMLButtonElement>(confirming
      ? '[data-task-delete-control="confirm"]' : '[data-destructive="true"]');
    control?.focus();
  }, [confirming, confirmation?.pending]);
  const hasMenuAction = Boolean(
    actions.onSchedule || actions.onChangeList || actions.onDuplicate || actions.onDelete,
  );
  if (!hasMenuAction) return null;

  return (
    <span
      ref={rootRef}
      className="list-board-task__overflow"
      data-task-action="overflow"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <Menu
        triggerLabel="Task actions"
        align="end"
        trigger={<span aria-hidden="true">…</span>}
        onDismiss={confirmation?.onCancel}
        dismissDisabled={confirmation?.pending}
      >
        {actions.onSchedule ? (
          <MenuItem disabled={confirming} onSelect={actions.onSchedule}>{scheduleActionLabel}</MenuItem>
        ) : null}
        {actions.onChangeList ? (
          <MenuItem disabled={confirming} onSelect={actions.onChangeList}>Change List</MenuItem>
        ) : null}
        {actions.onDuplicate ? (
          <MenuItem disabled={confirming} onSelect={actions.onDuplicate}>Duplicate</MenuItem>
        ) : null}
        {confirmation ? <InlineDeleteConfirmation confirmation={confirmation} /> : actions.onDelete ? (
          <MenuItem destructive closeOnSelect={false} onSelect={actions.onDelete}>Delete</MenuItem>
        ) : null}
      </Menu>
    </span>
  );
}

function TaskActionRail({
  actions,
  scheduleActionLabel,
  confirmation,
}: {
  actions: TaskCardActions;
  scheduleActionLabel: "Schedule" | "Update Schedule";
  confirmation?: TaskCardDeleteConfirmation;
}) {
  return (
    <span className="list-board-task__actions" data-task-actions="source-hover-rail">
      <span className="list-board-task__action-position" data-task-action-position="subtasks">
        {actions.onSubtasks ? (
          <TaskActionButton
            label="Subtasks"
            glyph="☷"
            action={actions.onSubtasks}
            actionId="subtasks"
            disabled={Boolean(confirmation)}
          />
        ) : null}
      </span>
      <span className="list-board-task__action-position" data-task-action-position="notes">
        {actions.onNotes ? (
          <TaskActionButton
            label="Notes"
            glyph="▤"
            action={actions.onNotes}
            actionId="notes"
            disabled={Boolean(confirmation)}
          />
        ) : null}
      </span>
      <span className="list-board-task__action-position" data-task-action-position="lane-left">
        {actions.onMoveLaneLeft ? (
          <TaskActionButton
            label="Move task one lane left"
            glyph="←"
            action={actions.onMoveLaneLeft}
            actionId="lane-left"
            disabled={Boolean(confirmation)}
          />
        ) : null}
      </span>
      <span className="list-board-task__action-position" data-task-action-position="lane-right">
        {actions.onMoveLaneRight ? (
          <TaskActionButton
            label="Move task one lane right"
            glyph="→"
            action={actions.onMoveLaneRight}
            actionId="lane-right"
            disabled={Boolean(confirmation)}
          />
        ) : null}
      </span>
      <span className="list-board-task__action-position" data-task-action-position="overflow">
        <TaskOverflowMenu actions={actions} scheduleActionLabel={scheduleActionLabel} confirmation={confirmation} />
      </span>
    </span>
  );
}

function InlineDeleteConfirmation({
  confirmation,
}: {
  confirmation: TaskCardDeleteConfirmation;
}) {
  return (
    <span
      className="list-board-task__delete-confirm"
      data-task-delete-confirm="inline"
      aria-label="Confirm permanent task deletion"
    >
      <button
        type="button"
        className="list-board-task__delete-confirm-action motion-interactive"
        data-task-delete-control="confirm"
        role="menuitem"
        data-menu-close-on-select="false"
        disabled={confirmation.pending}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={confirmation.onConfirm}
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M3 4h10M6 4V2h4v2M4 4l1 10h6l1-10M6.5 6v6M9.5 6v6" />
        </svg>
        {confirmation.pending ? "Deleting…" : "Confirm"}
      </button>
      <Tooltip content="Cancel delete">
        <button
          type="button"
          className="list-board-task__delete-cancel motion-interactive"
          aria-label="Cancel permanent task deletion"
          data-task-delete-control="cancel"
          role="menuitem"
          data-menu-close-on-select="false"
          disabled={confirmation.pending}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={confirmation.onCancel}
        >
          <span aria-hidden="true">×</span>
        </button>
      </Tooltip>
      {confirmation.error ? (
        <span className="list-board-task__delete-error type-metadata" role="alert">
          {confirmation.error}
        </span>
      ) : null}
    </span>
  );
}

function InlineTitleEditor({ editor, done }: { editor: TaskCardTitleEditor; done: boolean }) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor.pending) editor.onSubmit();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    if (!editor.pending) editor.onCancel();
  };

  return (
    <form
      className="list-board-task__title-row list-board-task__title-row--editing"
      data-task-title-editor="true"
      onSubmit={handleSubmit}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <span className="list-board-task__completion-slot" aria-hidden="true">
        <span className="list-board-task__completion-mark">{done ? "✓" : "○"}</span>
      </span>
      <input
        className="list-board-task__title-input"
        data-task-title-control="input"
        aria-label="Task title"
        value={editor.value}
        onChange={(event) => editor.onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={editor.pending}
        autoFocus
      />
      <span className="list-board-task__action-slot" data-task-action-slot="reserved">
        <span className="list-board-task__title-edit-actions">
          <Tooltip content="Cancel title edit">
            <button
              type="button"
              className="list-board-task__action-button motion-interactive"
              aria-label="Cancel title edit"
              data-task-title-control="cancel"
              draggable={false}
              disabled={editor.pending}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={editor.onCancel}
            >
              <span aria-hidden="true">×</span>
            </button>
          </Tooltip>
          <Tooltip content="Save task title">
            <button
              type="submit"
              className="list-board-task__action-button motion-interactive"
              aria-label="Save task title"
              data-task-title-control="save"
              draggable={false}
              disabled={editor.pending}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <span aria-hidden="true">✓</span>
            </button>
          </Tooltip>
        </span>
      </span>
    </form>
  );
}

function MetricEditActions({ editor }: { editor: TaskCardMetricEditor }) {
  return (
    <span className="list-board-task__metric-edit-actions" data-task-metric-actions={editor.metric}>
      <Tooltip content="Cancel metric edit" boundarySelector=".list-board-task">
        <button
          type="button"
          className="list-board-task__action-button motion-interactive"
          aria-label="Cancel metric edit"
          data-task-metric-control="cancel"
          draggable={false}
          disabled={editor.pending}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={editor.onCancel}
        >
          <span aria-hidden="true">×</span>
        </button>
      </Tooltip>
      <Tooltip content="Save metric" boundarySelector=".list-board-task">
        <button
          type="button"
          className="list-board-task__action-button motion-interactive"
          aria-label="Save metric"
          data-task-metric-control="save"
          draggable={false}
          disabled={editor.pending}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={editor.onSubmit}
        >
          <span aria-hidden="true">✓</span>
        </button>
      </Tooltip>
    </span>
  );
}

function MetricValue({
  metric,
  label,
  value,
  onEdit,
  editor,
  disabled = false,
}: {
  metric: TaskCardMetricKind;
  label: string;
  value: string;
  onEdit?: () => void;
  editor?: TaskCardMetricEditor;
  disabled?: boolean;
}) {
  if (editor?.metric === metric) {
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!editor.pending) editor.onCancel();
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (!editor.pending) editor.onSubmit();
      }
    };
    return (
      <span className="list-board-task__metric list-board-task__metric--editing" data-task-metric={metric}>
        <span>{label}:</span>
        <input
          className="list-board-task__metric-input timer-numerals"
          aria-label={`${label} duration in H:MM:SS`}
          data-task-metric-control="input"
          data-task-metric-input={metric}
          value={editor.value}
          onChange={(event) => editor.onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onPointerDown={(event) => event.stopPropagation()}
          disabled={editor.pending}
          placeholder={metric === "estimate" ? "H:MM:SS or blank" : "H:MM:SS"}
          autoFocus
        />
      </span>
    );
  }

  if (onEdit) {
    return (
      <button
        type="button"
        className="list-board-task__metric list-board-task__metric-button motion-interactive"
        aria-label={`Edit ${label}: ${value}`}
        data-task-metric={metric}
        data-task-metric-control="open"
        draggable={false}
        disabled={disabled}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onEdit}
      >
        <span>{label}:</span> <strong>{value}</strong>
      </button>
    );
  }

  return (
    <span className="list-board-task__metric" data-task-metric={metric}>
      {label}: {value}
    </span>
  );
}

function InlineCreateState() {
  return (
    <div className="list-board-task__fixture-body" data-fixture-only-body="inline-create">
      <span className="list-board-task__fixture-helper type-metadata">Add a new task</span>
      <span className="list-board-task__fixture-input">Title</span>
      <span className="list-board-task__fixture-input">Est. time</span>
      <span className="list-board-task__fixture-footer type-metadata">
        <span>Cancel</span><strong>Confirm</strong>
      </span>
    </div>
  );
}

function NotesExpandedState() {
  return (
    <div className="list-board-task__fixture-body" data-fixture-only-body="notes-expanded">
      <span className="list-board-task__fixture-toolbar type-metadata" aria-hidden="true">
        <strong>B</strong><em>I</em><s>S</s><span>• List</span><span>1. List</span><span>↶</span><span>↷</span>
      </span>
      <p className="list-board-task__fixture-note">Review the launch notes and confirm the final checklist.</p>
      <span className="list-board-task__fixture-helper type-metadata">Links open only after explicit activation.</span>
    </div>
  );
}

function SubtasksExpandedState() {
  return (
    <div className="list-board-task__fixture-body" data-fixture-only-body="subtasks-expanded">
      <div className="list-board-task__subtask-summary">
        <span className="type-metadata">2/3 subtasks</span>
        <span className="list-board-task__subtask-progress" aria-label="2 of 3 subtasks complete"><span /></span>
      </div>
      <span className="list-board-task__subtask"><span aria-hidden="true">✓</span><s>Collect references</s></span>
      <span className="list-board-task__subtask"><span aria-hidden="true">✓</span><s>Draft outline</s></span>
      <span className="list-board-task__subtask"><span aria-hidden="true">○</span><span>Review final copy</span></span>
    </div>
  );
}

function PausedEditableState({ task }: { task: ListBoardTask }) {
  return (
    <div className="list-board-task__fixture-body" data-fixture-only-body="paused-editable">
      <span className="list-board-task__paused-badge type-metadata">Paused · editable</span>
      <div className="list-board-task__editable-grid type-metadata">
        <span><small>EST</small><strong>{formatEstimate(task.estSeconds)}</strong></span>
        <span><small>Time Taken</small><strong>{formatTimeTaken(task.timeTakenSeconds)}</strong></span>
      </div>
      <span className="list-board-task__fixture-helper type-metadata">Authoritative timer state remains outside the renderer.</span>
    </div>
  );
}

function DestructiveConfirmState() {
  return (
    <div className="list-board-task__fixture-body list-board-task__fixture-body--destructive" data-fixture-only-body="destructive-confirm">
      <strong>Delete this task permanently?</strong>
      <span className="type-metadata">This presentation does not perform a deletion.</span>
      <span className="list-board-task__fixture-footer type-metadata"><span>Cancel</span><strong>Delete</strong></span>
    </div>
  );
}

export function TaskCard({
  task,
  aggregateView,
  fixtureState,
  actions,
  onComplete,
  onTitleEdit,
  titleEditor,
  onEstimateEdit,
  onTimeTakenEdit,
  metricEditor,
  onScheduleEdit,
  notes,
  subtasks,
  liveState,
  hideTaskTimes = false,
  ordinal,
  deleteConfirmation,
  interactionDisabled = false,
}: TaskCardProps) {
  const state = fixtureState ?? derivedState(task);
  const scheduled = scheduleLabel(task);
  const repeatStatus = recurrenceLabel(task);
  const isFixtureOnly = fixtureState !== undefined;
  const showBaseContent = state !== "inline_create";
  const noteExpanded = Boolean(notes?.expanded);
  const subtaskExpanded = Boolean(subtasks?.model?.expanded);
  // Keep the pre-confirmation controls in place, but disable them while the
  // board reserves the destructive action. Removing callbacks changes layout.
  const cardControlsRef = useRef({ onComplete, onTitleEdit, onEstimateEdit, onTimeTakenEdit, onScheduleEdit });
  if (!interactionDisabled) cardControlsRef.current = { onComplete, onTitleEdit, onEstimateEdit, onTimeTakenEdit, onScheduleEdit };
  if (interactionDisabled) ({ onComplete, onTitleEdit, onEstimateEdit, onTimeTakenEdit, onScheduleEdit } = cardControlsRef.current);
  const menuActionsRef = useRef<TaskCardActions | undefined>(actions);
  // The board disables other edits during confirmation. Retain the same menu
  // composition while every sibling action is disabled, rather than unmounting
  // the open menu and moving destructive confirmation into the hover rail.
  if (!deleteConfirmation) menuActionsRef.current = actions;
  const effectiveActions = deleteConfirmation ? menuActionsRef.current : titleEditor || metricEditor || noteExpanded || subtaskExpanded
    ? undefined
    : actions ?? (
      isFixtureOnly && (state === "normal" || state === "action_revealed")
        ? FIXTURE_REORDER_ACTIONS
        : undefined
    );
  const hasActions = Boolean(
    deleteConfirmation
      || effectiveActions?.onSubtasks
      || effectiveActions?.onNotes
      || effectiveActions?.onMoveLaneLeft
      || effectiveActions?.onMoveLaneRight
      || effectiveActions?.onSchedule
      || effectiveActions?.onChangeList
      || effectiveActions?.onDuplicate
      || effectiveActions?.onDelete,
  );
  const liveLabel = liveStateLabel(liveState);
  const scheduleStateLabel = task.isOverdue
    ? repeatStatus ? `Overdue · ${repeatStatus}` : "Overdue"
    : repeatStatus ? `Scheduled · ${repeatStatus}` : "Scheduled";

  return (
    <article
      className="list-board-task"
      data-board-task="task-card"
      data-task-card-state={state}
      data-task-id={task.id}
      data-completed={task.completedAt ? "true" : "false"}
      data-task-actions-available={hasActions ? "true" : "false"}
      data-task-title-editing={titleEditor ? "true" : "false"}
      data-task-metric-editing={metricEditor?.metric ?? "none"}
      data-task-live-state={liveState ?? "none"}
      data-task-times-hidden={hideTaskTimes ? "true" : "false"}
      data-task-recurrence={recurrenceState(task)}
      data-task-notes-expanded={noteExpanded ? "true" : "false"}
      data-task-subtasks-expanded={subtaskExpanded ? "true" : "false"}
      data-fixture-presentation={isFixtureOnly ? "true" : "false"}
      style={safeListAccent(task.listColor)}
      tabIndex={isFixtureOnly && state === "action_revealed" ? 0 : undefined}
    >
      {showBaseContent ? (
        <>
          {titleEditor ? (
            <InlineTitleEditor editor={titleEditor} done={state === "done"} />
          ) : (
            <div className="list-board-task__title-row">
              {ordinal !== undefined && state !== "done" ? (
                <span
                  className="list-board-task__completion-slot list-board-task__leading-slot"
                  data-task-leading-slot="ordinal-completion"
                >
                  <span className="list-board-task__ordinal" aria-hidden="true">{ordinal}</span>
                  {onComplete ? (
                    <button
                      type="button"
                      className="list-board-task__completion-button motion-interactive"
                      aria-label={`Complete task: ${task.title}`}
                      data-task-completion-control="complete"
                      disabled={interactionDisabled}
                      draggable={false}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={onComplete}
                    >
                      <span className="list-board-task__completion-mark">○</span>
                    </button>
                  ) : (
                    <span className="list-board-task__completion-preview" aria-hidden="true">
                      <span className="list-board-task__completion-mark">○</span>
                    </span>
                  )}
                </span>
              ) : onComplete && state !== "done" ? (
                <button
                  type="button"
                  className="list-board-task__completion-slot list-board-task__completion-button motion-interactive"
                  aria-label={`Complete task: ${task.title}`}
                  data-task-completion-control="complete"
                  disabled={interactionDisabled}
                  draggable={false}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={onComplete}
                >
                  <span className="list-board-task__completion-mark">○</span>
                </button>
              ) : (
                <span className="list-board-task__completion-slot" aria-hidden="true">
                  <span className="list-board-task__completion-mark">{state === "done" ? "✓" : "○"}</span>
                </span>
              )}
              {onTitleEdit ? (
                <button
                  type="button"
                  className="list-board-task__title list-board-task__title-button"
                  title={task.title}
                  aria-label={`Edit task title: ${task.title}`}
                  data-task-title-control="open"
                  disabled={interactionDisabled}
                  draggable={false}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={onTitleEdit}
                >
                  {task.title}
                </button>
              ) : (
                <span className="list-board-task__title" title={task.title}>{task.title}</span>
              )}
              <span
                className="list-board-task__action-slot"
                data-task-action-slot="reserved"
                aria-hidden={hasActions || metricEditor ? undefined : true}
              >
                {!deleteConfirmation && metricEditor ? <MetricEditActions editor={metricEditor} /> : null}
                {effectiveActions && hasActions ? (
                  <TaskActionRail
                    actions={effectiveActions}
                    scheduleActionLabel={scheduled || repeatStatus ? "Update Schedule" : "Schedule"}
                    confirmation={deleteConfirmation}
                  />
                ) : null}
              </span>
            </div>
          )}

          {scheduled ? (
            onScheduleEdit ? (
              <button
                type="button"
                className="list-board-task__schedule list-board-task__schedule-button type-metadata motion-interactive"
                data-overdue={task.isOverdue ? "true" : "false"}
                data-task-schedule-control="open"
                disabled={interactionDisabled}
                aria-label={`Edit task schedule: ${scheduled}${repeatStatus ? `, ${repeatStatus}` : ""}`}
                draggable={false}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={onScheduleEdit}
              >
                <span>{scheduleStateLabel}</span>
                <span>{scheduled}</span>
              </button>
            ) : (
              <div className="list-board-task__schedule type-metadata" data-overdue={task.isOverdue ? "true" : "false"}>
                <span>{scheduleStateLabel}</span>
                <span>{scheduled}</span>
              </div>
            )
          ) : null}

          <div className="list-board-task__meta type-metadata">
            {aggregateView ? (
              <span className="list-board-task__list" title={task.listTitle}>
                {task.listTitle}{repeatStatus ? ` · ${repeatStatus}` : ""}
              </span>
            ) : liveLabel ? (
              <span className="list-board-task__live-state">
                {liveLabel}{repeatStatus ? ` · ${repeatStatus}` : ""}
              </span>
            ) : onScheduleEdit && !scheduled ? (
              <button
                type="button"
                className="list-board-task__schedule-trigger motion-interactive"
                data-task-schedule-control="open"
                disabled={interactionDisabled}
                draggable={false}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={onScheduleEdit}
              >
                {repeatStatus === "Repeats"
                  ? "Repeats · Edit"
                  : repeatStatus === "Occurrence"
                    ? "Occurrence · Schedule"
                    : "Schedule / Repeat"}
              </button>
            ) : repeatStatus && !scheduled ? (
              <span className="list-board-task__recurrence-marker">{repeatStatus}</span>
            ) : <span />}
            <span className="list-board-task__times">
              <MetricValue
                metric="estimate"
                label="Est"
                value={formatEstimate(task.estSeconds)}
                onEdit={onEstimateEdit}
                editor={metricEditor}
                disabled={interactionDisabled}
              />
              <MetricValue
                metric="time_taken"
                label="Taken"
                value={formatTimeTaken(task.timeTakenSeconds)}
                onEdit={onTimeTakenEdit}
                editor={metricEditor}
                disabled={interactionDisabled}
              />
            </span>
          </div>

          {notes ? (
            <TaskNotes
              taskId={task.id}
              listId={task.listId}
              taskTitle={task.title}
              expanded={notes.expanded}
              canExpand={notes.canExpand}
              readOnly={notes.readOnly}
              onToggleExpanded={notes.onToggleExpanded}
              onMutationStatus={notes.onMutationStatus}
              onRefreshBlocked={notes.onRefreshBlocked}
            />
          ) : null}

          {subtasks ? (
            <TaskSubtasks
              taskTitle={task.title}
              totalCount={task.subtaskTotalCount ?? 0}
              completedCount={task.subtaskCompletedCount ?? 0}
              model={subtasks.model}
              canExpand={subtasks.canExpand}
              onToggleExpanded={subtasks.onToggleExpanded}
              onCreateValueChange={subtasks.onCreateValueChange}
              onCreate={subtasks.onCreate}
              onStartEdit={subtasks.onStartEdit}
              onEditValueChange={subtasks.onEditValueChange}
              onSaveEdit={subtasks.onSaveEdit}
              onCancelEdit={subtasks.onCancelEdit}
              onToggleCompleted={subtasks.onToggleCompleted}
              onMove={subtasks.onMove}
              onDelete={subtasks.onDelete}
            />
          ) : null}
        </>
      ) : null}

      {state === "inline_create" ? <InlineCreateState /> : null}
      {state === "notes_expanded" ? <NotesExpandedState /> : null}
      {state === "subtasks_expanded" ? <SubtasksExpandedState /> : null}
      {state === "paused_editable" ? <PausedEditableState task={task} /> : null}
      {state === "destructive_confirm" ? <DestructiveConfirmState /> : null}
    </article>
  );
}

export type { FixturePresentationState as TaskCardFixtureState };
