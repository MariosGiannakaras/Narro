import { ActionIcon } from "./ActionIcon";
import { useEffect, useLayoutEffect, useRef, type CSSProperties, type FormEvent, type KeyboardEvent, type MouseEvent } from "react";
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
      style={{ "--subtask-progress": `${percent}%` } as CSSProperties}
      data-board-subtask-progress-ring="true"
    >
      <span aria-hidden="true" />
    </span>
  );
}

function belongsToRenderedTask(
  event: MouseEvent<HTMLElement>,
  subtask: BoardSubtask,
): boolean {
  const renderedTaskId = event.currentTarget
    .closest<HTMLElement>("[data-task-id]")
    ?.dataset.taskId;
  return renderedTaskId === subtask.taskId;
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
  const newSubtaskInputRef = useRef<HTMLInputElement>(null);
  const createFocusRef = useRef<{
    input: HTMLInputElement;
    taskId: string | undefined;
    value: string;
    count: number;
    sawPending: boolean;
  } | null>(null);
  // Disabling a focused input during native commit moves focus to the body.
  // Restore the initiating field only after authoritative refresh re-enables it.
  // Explicit navigation elsewhere cancels that intent, including outside clicks
  // on non-focusable content and focus moves that subsequently return to body.
  useEffect(() => {
    if (!expanded) return;
    const cancelForOtherTarget = (event: Event) => {
      const request = createFocusRef.current;
      if (request && event.target !== request.input
        && !request.input.form?.contains(event.target as Node)) createFocusRef.current = null;
    };
    document.addEventListener("focusin", cancelForOtherTarget);
    document.addEventListener("pointerdown", cancelForOtherTarget, true);
    return () => {
      createFocusRef.current = null;
      document.removeEventListener("focusin", cancelForOtherTarget);
      document.removeEventListener("pointerdown", cancelForOtherTarget, true);
    };
  }, [expanded]);
  useLayoutEffect(() => {
    const request = createFocusRef.current;
    if (!request) return;
    if (!expanded || !model?.mutable || model.loading || model.error
      || request.input !== newSubtaskInputRef.current
      || request.taskId !== request.input.closest<HTMLElement>("[data-task-id]")?.dataset.taskId) {
      createFocusRef.current = null;
      return;
    }
    if (model.pending) {
      request.sawPending = true;
      return;
    }
    if (!request.sawPending && model.createValue === request.value
      && model.subtasks.length === request.count) return;
    createFocusRef.current = null;
    if (request.input.isConnected && !request.input.disabled
      && (document.activeElement === document.body || document.activeElement === request.input)) {
      request.input.focus({ preventScroll: true });
    }
  });
  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (model?.pending || !model?.mutable || !model.createValue.trim() || createFocusRef.current) return;
    const input = newSubtaskInputRef.current;
    if (input) createFocusRef.current = {
      input,
      taskId: input.closest<HTMLElement>("[data-task-id]")?.dataset.taskId,
      value: model.createValue,
      count: model.subtasks.length,
      sawPending: false,
    };
    onCreate();
  };

  return (
    <div
      className="list-board-task__subtasks"
      data-task-subtasks={expanded ? "expanded" : "collapsed"}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="list-board-task__subtask-header" data-task-subtask-header="true" data-can-expand={canExpand}>
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
        <span className="list-board-task__subtask-chevron"><ActionIcon name={expanded ? "chevron-up" : "chevron-down"} /></span>
      </button>
      <span className="list-board-task__subtask-header-copy">
        <Progress completed={completedCount} total={totalCount} />
        <span>{totalCount === 0 ? "Subtasks" : `${completedCount}/${totalCount} Subtasks`}</span>
      </span>
      {expanded && model?.mutable && !model.loading && !model.error ? (
        <button type="button" className="list-board-task__subtask-add-trigger motion-interactive"
          data-task-subtask-control="add-focus" aria-label={`Add a subtask to ${taskTitle}`}
          disabled={model.pending} onClick={() => newSubtaskInputRef.current?.focus()}
        ><ActionIcon name="plus" /></button>
      ) : null}
      </div>

      {expanded && model ? (
        <div className="list-board-task__subtask-panel" data-task-subtask-panel="true">
          {model.loading ? (
            <span className="type-metadata" role="status">Loading subtasks…</span>
          ) : model.error ? (
            <span className="list-board-task__subtask-error type-metadata" role="alert">{model.error}</span>
          ) : (
            <>
              <div className="list-board-task__subtask-list" role="list" aria-label={`Subtasks for ${taskTitle}`}>
                {model.subtasks.map((subtask, index) => {
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
                          onClick={(event) => {
                            if (belongsToRenderedTask(event, subtask)) onToggleCompleted(subtask);
                          }}
                        >
                          <ActionIcon name={completed ? "circle-check" : "circle"} />
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
                          onClick={(event) => {
                            if (belongsToRenderedTask(event, subtask)) onStartEdit(subtask);
                          }}
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
                              ><ActionIcon name="close" /></button>
                            </Tooltip>
                            <Tooltip content="Save subtask title">
                              <button
                                type="button"
                                className="list-board-task__subtask-action motion-interactive"
                                data-task-subtask-control="save-edit"
                                aria-label="Save subtask title"
                                disabled={model.pending || !model.editor?.value.trim()}
                                onClick={onSaveEdit}
                              ><ActionIcon name="check" /></button>
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
                                onClick={(event) => {
                                  if (belongsToRenderedTask(event, subtask)) onMove(subtask, "up");
                                }}
                              ><ActionIcon name="arrow-up" /></button>
                            </Tooltip>
                            <Tooltip content="Move subtask down">
                              <button
                                type="button"
                                className="list-board-task__subtask-action motion-interactive"
                                data-task-subtask-control="move-down"
                                aria-label={`Move subtask down: ${subtask.title}`}
                                disabled={!model.mutable || model.pending || index === model.subtasks.length - 1}
                                onClick={(event) => {
                                  if (belongsToRenderedTask(event, subtask)) onMove(subtask, "down");
                                }}
                              ><ActionIcon name="arrow-down" /></button>
                            </Tooltip>
                            <Tooltip content="Delete subtask">
                              <button
                                type="button"
                                className="list-board-task__subtask-action list-board-task__subtask-action--delete motion-interactive"
                                data-task-subtask-control="delete"
                                aria-label={`Delete subtask: ${subtask.title}`}
                                disabled={!model.mutable || model.pending}
                                onClick={(event) => {
                                  if (belongsToRenderedTask(event, subtask)) onDelete(subtask);
                                }}
                              ><ActionIcon name="trash" /></button>
                            </Tooltip>
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {model.mutable ? (
                <form className="list-board-task__subtask-create" data-task-subtask-control="create" onSubmit={handleCreate}>
                  <div className="list-board-task__subtask-create-field">
                  <input
                    ref={newSubtaskInputRef}
                    value={model.createValue}
                    data-task-subtask-control="create-input"
                    aria-label={`New subtask for ${taskTitle}`}
                    placeholder="Enter subtask task title*"
                    disabled={model.pending}
                    onChange={(event) => onCreateValueChange(event.target.value)}
                  />
                    <button
                      type="button"
                      className="list-board-task__subtask-clear motion-interactive"
                      aria-label="Clear new subtask draft"
                      data-task-subtask-control="cancel-create"
                      disabled={model.pending || !model.createValue}
                      onClick={() => {
                        onCreateValueChange("");
                        newSubtaskInputRef.current?.focus();
                      }}
                    ><ActionIcon name="close" /></button>
                  </div>
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
