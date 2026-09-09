import type { CSSProperties } from "react";
import { formatVisibleDate, formatVisibleDateTime } from "./dateTimeFormat";
import type { ListBoardTask } from "./listBoardApi";
import { Tooltip } from "./overlayPrimitives";

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
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

type TaskCardProps = {
  task: ListBoardTask;
  aggregateView: boolean;
  fixtureState?: FixturePresentationState;
  actions?: TaskCardActions;
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const WHOLE_SECONDS = /^\d+$/;
const fixtureAction = () => undefined;
const FIXTURE_REORDER_ACTIONS: TaskCardActions = {
  onMoveUp: fixtureAction,
  onMoveDown: fixtureAction,
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

function derivedState(task: ListBoardTask): FixturePresentationState {
  if (task.completedAt) return "done";
  if (task.isOverdue) return "overdue";
  if (task.scheduledLocalDate) return "scheduled";
  return "normal";
}

function TaskActionButton({
  label,
  glyph,
  action,
  actionId,
}: {
  label: string;
  glyph: string;
  action: () => void;
  actionId: "move-up" | "move-down";
}) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        className="list-board-task__action-button motion-interactive"
        aria-label={label}
        data-task-action={actionId}
        draggable={false}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={action}
      >
        <span aria-hidden="true">{glyph}</span>
      </button>
    </Tooltip>
  );
}

function TaskActionRail({ actions }: { actions: TaskCardActions }) {
  return (
    <span className="list-board-task__actions" data-task-actions="reorder">
      <span className="list-board-task__action-position" data-task-action-position="move-up">
        {actions.onMoveUp ? (
          <TaskActionButton
            label="Move task up"
            glyph="↑"
            action={actions.onMoveUp}
            actionId="move-up"
          />
        ) : null}
      </span>
      <span className="list-board-task__action-position" data-task-action-position="move-down">
        {actions.onMoveDown ? (
          <TaskActionButton
            label="Move task down"
            glyph="↓"
            action={actions.onMoveDown}
            actionId="move-down"
          />
        ) : null}
      </span>
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

export function TaskCard({ task, aggregateView, fixtureState, actions }: TaskCardProps) {
  const state = fixtureState ?? derivedState(task);
  const scheduled = scheduleLabel(task);
  const isFixtureOnly = fixtureState !== undefined;
  const showBaseContent = state !== "inline_create";
  const effectiveActions = actions ?? (
    isFixtureOnly && (state === "normal" || state === "action_revealed")
      ? FIXTURE_REORDER_ACTIONS
      : undefined
  );
  const hasActions = Boolean(effectiveActions?.onMoveUp || effectiveActions?.onMoveDown);

  return (
    <article
      className="list-board-task"
      data-board-task="task-card"
      data-task-card-state={state}
      data-task-id={task.id}
      data-completed={task.completedAt ? "true" : "false"}
      data-task-actions-available={hasActions ? "true" : "false"}
      data-fixture-presentation={isFixtureOnly ? "true" : "false"}
      style={safeListAccent(task.listColor)}
      tabIndex={isFixtureOnly && state === "action_revealed" ? 0 : undefined}
    >
      {showBaseContent ? (
        <>
          <div className="list-board-task__title-row">
            <span className="list-board-task__completion-slot" aria-hidden="true">
              <span className="list-board-task__completion-mark">{state === "done" ? "✓" : "○"}</span>
            </span>
            <span className="list-board-task__title" title={task.title}>{task.title}</span>
            <span
              className="list-board-task__action-slot"
              data-task-action-slot="reserved"
              aria-hidden={hasActions ? undefined : true}
            >
              {effectiveActions && hasActions ? <TaskActionRail actions={effectiveActions} /> : null}
            </span>
          </div>

          {scheduled ? (
            <div className="list-board-task__schedule type-metadata" data-overdue={task.isOverdue ? "true" : "false"}>
              <span>{task.isOverdue ? "Overdue" : "Scheduled"}</span>
              <span>{scheduled}</span>
            </div>
          ) : null}

          <div className="list-board-task__meta type-metadata">
            {aggregateView ? (
              <span className="list-board-task__list" title={task.listTitle}>{task.listTitle}</span>
            ) : <span />}
            <span className="list-board-task__times">
              <span>Est: {formatEstimate(task.estSeconds)}</span>
              <span>Taken: {formatTimeTaken(task.timeTakenSeconds)}</span>
            </span>
          </div>
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
