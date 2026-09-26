import { useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { formatVisibleDate, formatVisibleTime } from "./dateTimeFormat";
import { FocusLiveSubtasks } from "./FocusLiveSubtasks";
import { FocusTaskRowTitle } from "./FocusTaskRowTitle";
import type { ListBoardRequestTarget, ListBoardTask } from "./listBoardApi";
import { Menu, MenuItem, Tooltip } from "./overlayPrimitives";
import { TaskNotes } from "./TaskNotes";

type FocusTaskRowProps = {
  task: ListBoardTask;
  target: ListBoardRequestTarget;
  aggregateView: boolean;
  fixtureMode: boolean;
  done?: boolean;
  scheduled?: boolean;
  pending: boolean;
  canMakeLive: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onComplete: (task: ListBoardTask) => void;
  onMakeLive: (task: ListBoardTask) => void;
  onSchedule: (task: ListBoardTask) => void;
  onMove: (task: ListBoardTask, direction: "up" | "down") => void;
  onDelete: (task: ListBoardTask) => void;
  onStatus: (status: string, error: string | null) => void;
  onRefreshBlocked: (message: string) => void;
  onTaskProjection: (task: ListBoardTask) => void;
};

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

export function FocusTaskRow({
  task,
  target,
  aggregateView,
  fixtureMode,
  done = false,
  scheduled = false,
  pending,
  canMakeLive,
  canMoveUp,
  canMoveDown,
  onComplete,
  onMakeLive,
  onSchedule,
  onMove,
  onDelete,
  onStatus,
  onRefreshBlocked,
  onTaskProjection,
}: FocusTaskRowProps) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [subtasksExpanded, setSubtasksExpanded] = useState(false);
  const schedule = taskScheduleLabel(task);

  const toggleNotes = () => {
    setSubtasksExpanded(false);
    setNotesExpanded((current) => !current);
  };

  const toggleSubtasks = () => {
    setNotesExpanded(false);
    setSubtasksExpanded((current) => !current);
  };

  const handleRowKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (done || scheduled || aggregateView || pending || !event.altKey) return;
    if (event.key === "ArrowUp" && canMoveUp) {
      event.preventDefault();
      onMove(task, "up");
    } else if (event.key === "ArrowDown" && canMoveDown) {
      event.preventDefault();
      onMove(task, "down");
    }
  };

  return (
    <div
      className="focus-panel__task-item"
      data-focus-task-item={task.id}
      data-focus-task-notes={notesExpanded ? "expanded" : "collapsed"}
      data-focus-task-subtasks={subtasksExpanded ? "expanded" : "collapsed"}
    >
      <article
        className={`focus-panel__task-row${done ? " focus-panel__task-row--done" : ""}${task.isOverdue ? " focus-panel__task-row--overdue" : ""}`}
        data-focus-task-row={done ? "done" : scheduled ? "scheduled" : "remaining"}
        data-focus-overdue={task.isOverdue ? "true" : "false"}
        data-task-id={task.id}
        tabIndex={done ? undefined : 0}
        onKeyDown={handleRowKeyDown}
      >
        {!done ? (
          <Tooltip content="Complete task" align="start">
            <button
              type="button"
              className="focus-panel__task-complete motion-interactive"
              data-focus-task-action="complete"
              aria-label={`Complete task: ${task.title}`}
              disabled={pending}
              onClick={() => onComplete(task)}
            >
              <span aria-hidden="true">○</span>
            </button>
          </Tooltip>
        ) : null}

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

        {done ? (
          <span className="focus-panel__done-time type-metadata">{formatDuration(task.timeTakenSeconds)}</span>
        ) : (
          <span className="focus-panel__task-actions" aria-label={`Actions for ${task.title}`}>
            <Tooltip content="Make live">
              <button
                type="button"
                className="focus-panel__task-action motion-interactive"
                data-focus-task-action="make-live"
                aria-label={`Make live: ${task.title}`}
                disabled={pending || !canMakeLive}
                onClick={() => onMakeLive(task)}
              >
                <span aria-hidden="true">▶</span>
              </button>
            </Tooltip>
            <Tooltip content="Notes">
              <button
                type="button"
                className="focus-panel__task-action motion-interactive"
                data-focus-task-action="notes"
                aria-label={`${notesExpanded ? "Close" : "Open"} notes: ${task.title}`}
                aria-expanded={notesExpanded}
                disabled={pending}
                onClick={toggleNotes}
              >
                <span aria-hidden="true">N</span>
              </button>
            </Tooltip>
            <span className="focus-panel__task-menu">
              <Menu
                triggerLabel={`More actions for ${task.title}`}
                align="end"
                trigger={<span aria-hidden="true">⋯</span>}
              >
                <MenuItem disabled={pending} onSelect={toggleSubtasks}>
                  {subtasksExpanded ? "Close subtasks" : "Subtasks"}
                </MenuItem>
                <MenuItem disabled={pending} onSelect={() => onSchedule(task)}>
                  Update Schedule
                </MenuItem>
                <MenuItem disabled={pending || aggregateView || scheduled || !canMoveUp} onSelect={() => onMove(task, "up")}>
                  Move up
                </MenuItem>
                <MenuItem disabled={pending || aggregateView || scheduled || !canMoveDown} onSelect={() => onMove(task, "down")}>
                  Move down
                </MenuItem>
                <MenuItem destructive disabled={pending} onSelect={() => onDelete(task)}>
                  Permanently delete
                </MenuItem>
              </Menu>
            </span>
          </span>
        )}
      </article>

      {notesExpanded && !done ? (
        <div className="focus-panel__ordinary-notes" data-focus-ordinary-notes="true">
          <TaskNotes
            taskId={task.id}
            listId={task.listId}
            taskTitle={task.title}
            expanded
            canExpand
            readOnly={false}
            onToggleExpanded={toggleNotes}
            onMutationStatus={onStatus}
            onRefreshBlocked={onRefreshBlocked}
          />
        </div>
      ) : null}

      {subtasksExpanded && !done ? (
        <div className="focus-panel__ordinary-subtasks" data-focus-ordinary-subtasks="true">
          <FocusLiveSubtasks
            task={task}
            target={target}
            fixtureMode={fixtureMode}
            expanded
            interactionPending={pending}
            onExpandedChange={(expanded) => {
              setSubtasksExpanded(expanded);
              return true;
            }}
            onTaskProjection={onTaskProjection}
          />
        </div>
      ) : null}
    </div>
  );
}
