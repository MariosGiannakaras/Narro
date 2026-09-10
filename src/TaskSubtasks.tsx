import type { FormEvent, KeyboardEvent } from "react";
import type { BoardSubtask } from "./listBoardApi";
import { Tooltip } from "./overlayPrimitives";

export type SubtaskTitleEditor = {
  id: string;
  expectedTitle: string;
  value: string;
};

export type TaskSubtasksModel = {
  expanded: boolean;
  loading: boolean;
  error: string | null;
  mutable: boolean;
  subtasks: BoardSubtask[];
  createValue: string;
  editor: SubtaskTitleEditor | null;
  pending: boolean;
};

type TaskSubtasksProps = {
  taskTitle: string;
  totalCount: number;
  completedCount: number;
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

function Progress({ completed, total }: { completed: number; total: number }) {
  const clampedTotal = Math.max(0, total);
  const clampedCompleted = Math.min(Math.max(0, completed), clampedTotal);
  const percent = clampedTotal === 0 ? 0 : Math.round((clampedCompleted / clampedTotal) * 100);
  return (
    <span
      className="list-board-task__subtask-progress"
      role="progressbar"
      aria-label={`${clampedCompleted} of ${clampedTotal} subtasks complete`}
      aria-valuemin={0}
      aria-valuemax={clampedTotal}
      aria-valuenow={clampedCompleted}
      style={{ "--subtask-progress": `${percent}%` } as React.CSSProperties}
    >
      <span />
    </span>
  );
}

export function TaskSubtasks({
  taskTitle,
  totalCount,
  completedCount,
  model,
  canExpand,
  onToggleExpanded,
  onCreateValueChange,
  onCreate,
  onStartEdit,
  onEditValueChange,
  onSaveEdit,
  onCancelEdit,
  onToggleCompleted,
  onMove,
  onDelete,
}: TaskSubtasksProps) {
  const expanded = Boolean(model?.expanded);
  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (model?.pending || !model?.mutable) return;
    onCreate();
  };

  return (
    <div
      className="list-board-task__subtasks"
      data-task-subtasks={expanded ? "expanded" : "collapsed"}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="list-board-task__subtask-trigger motion-interactive"
        data-task-subtask-control="toggle"
        aria-expanded={expanded}
        aria-label={`${expanded ? "Collapse" : "Expand"} subtasks for ${taskTitle}`}
        disabled={!canExpand}
        draggable={false}
        onClick={onToggleExpanded}
      >
        <span>{totalCount === 0 ? "Subtasks" : `${completedCount}/${totalCount} subtasks`}</span>
        {totalCount > 0 ? <Progress completed={completedCount} total={totalCount} /> : null}
        <span aria-hidden="true" className="list-board-task__subtask-chevron">{expanded ? "⌃" : "⌄"}</span>
      </button>

      {expanded && model ? (
        <div className="list-board-task__subtask-panel" data-task-subtask-panel="true">
          {model.loading ? (
            <span className="type-metadata" role="status">Loading subtasks…</span>
          ) : model.error ? (
            <span className="list-board-task__subtask-error type-metadata" role="alert">{model.error}</span>
          ) : (
            <>
              <div className="list-board-task__subtask-summary">
                <span className="type-metadata">
                  {model.subtasks.filter((subtask) => subtask.completedAt !== null).length}/{model.subtasks.length} complete
                </span>
                {model.subtasks.length > 0 ? (
                  <Progress
                    completed={model.subtasks.filter((subtask) => subtask.completedAt !== null).length}
                    total={model.subtasks.length}
                  />
                ) : null}
              </div>

              <div className="list-board-task__subtask-list" role="list" aria-label={`Subtasks for ${taskTitle}`}>
                {model.subtasks.length === 0 ? (
                  <span className="list-board-task__subtask-empty type-metadata">No subtasks yet.</span>
                ) : model.subtasks.map((subtask, index) => {
                  const editing = model.editor?.id === subtask.id;
                  const completed = subtask.completedAt !== null;
                  return (
                    <div
                      key={subtask.id}
                      className="list-board-task__subtask-row"
                      data-subtask-id={subtask.id}
                      data-subtask-completed={completed ? "true" : "false"}
                      role="listitem"
                    >
                      <Tooltip content={completed ? "Reopen subtask" : "Complete subtask"}>
                        <button
                          type="button"
                          className="list-board-task__subtask-check motion-interactive"
                          data-task-subtask-control="complete"
                          aria-label={`${completed ? "Reopen" : "Complete"} subtask: ${subtask.title}`}
                          disabled={!model.mutable || model.pending || editing}
                          draggable={false}
                          onClick={() => onToggleCompleted(subtask)}
                        >
                          <span aria-hidden="true">{completed ? "✓" : "○"}</span>
                        </button>
                      </Tooltip>

                      {editing && model.editor ? (
                        <input
                          className="list-board-task__subtask-title-input"
                          data-task-subtask-control="title-input"
                          aria-label="Subtask title"
                          value={model.editor.value}
                          disabled={model.pending}
                          autoFocus
                          onChange={(event) => onEditValueChange(event.target.value)}
                          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                            if (event.key === "Escape") {
                              event.preventDefault();
                              if (!model.pending) onCancelEdit();
                            } else if (event.key === "Enter") {
                              event.preventDefault();
                              if (!model.pending) onSaveEdit();
                            }
                          }}
                        />
                      ) : (
                        <button
                          type="button"
                          className="list-board-task__subtask-title motion-interactive"
                          data-task-subtask-control="edit"
                          title={subtask.title}
                          disabled={!model.mutable || model.pending}
                          draggable={false}
                          onClick={() => onStartEdit(subtask)}
                        >
                          {completed ? <s>{subtask.title}</s> : subtask.title}
                        </button>
                      )}

                      <span className="list-board-task__subtask-actions">
                        {editing ? (
                          <>
                            <Tooltip content="Cancel subtask edit">
                              <button
                                type="button"
                                className="list-board-task__subtask-action motion-interactive"
                                data-task-subtask-control="cancel-edit"
                                aria-label="Cancel subtask edit"
                                disabled={model.pending}
                                onClick={onCancelEdit}
                              >×</button>
                            </Tooltip>
                            <Tooltip content="Save subtask title">
                              <button
                                type="button"
                                className="list-board-task__subtask-action motion-interactive"
                                data-task-subtask-control="save-edit"
                                aria-label="Save subtask title"
                                disabled={model.pending || !model.editor?.value.trim()}
                                onClick={onSaveEdit}
                              >✓</button>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            <Tooltip content="Move subtask up">
                              <button
                                type="button"
                                className="list-board-task__subtask-action motion-interactive"
                                data-task-subtask-control="move-up"
                                aria-label={`Move subtask up: ${subtask.title}`}
                                disabled={!model.mutable || model.pending || index === 0}
                                onClick={() => onMove(subtask, "up")}
                              >↑</button>
                            </Tooltip>
                            <Tooltip content="Move subtask down">
                              <button
                                type="button"
                                className="list-board-task__subtask-action motion-interactive"
                                data-task-subtask-control="move-down"
                                aria-label={`Move subtask down: ${subtask.title}`}
                                disabled={!model.mutable || model.pending || index === model.subtasks.length - 1}
                                onClick={() => onMove(subtask, "down")}
                              >↓</button>
                            </Tooltip>
                            <Tooltip content="Delete subtask">
                              <button
                                type="button"
                                className="list-board-task__subtask-action list-board-task__subtask-action--delete motion-interactive"
                                data-task-subtask-control="delete"
                                aria-label={`Delete subtask: ${subtask.title}`}
                                disabled={!model.mutable || model.pending}
                                onClick={() => onDelete(subtask)}
                              >×</button>
                            </Tooltip>
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {model.mutable ? (
                <form className="list-board-task__subtask-create" onSubmit={handleCreate}>
                  <input
                    value={model.createValue}
                    data-task-subtask-control="create-input"
                    aria-label={`New subtask for ${taskTitle}`}
                    placeholder="Add subtask"
                    disabled={model.pending}
                    onChange={(event) => onCreateValueChange(event.target.value)}
                  />
                  <button
                    type="submit"
                    className="motion-interactive"
                    data-task-subtask-control="create"
                    disabled={model.pending || !model.createValue.trim()}
                  >Add</button>
                </form>
              ) : (
                <span className="list-board-task__subtask-readonly type-metadata">Completed tasks keep subtasks as read-only history.</span>
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
