import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import {
  createListBoardSubtask,
  deleteListBoardSubtask,
  getListBoardSnapshot,
  getListBoardTaskSubtasks,
  reorderListBoardSubtasks,
  setListBoardSubtaskCompletion,
  updateListBoardSubtaskTitle,
  type BoardSubtask,
  type BoardSubtaskSnapshot,
  type ListBoardRequestTarget,
  type ListBoardTask,
} from "./listBoardApi";
import { Tooltip } from "./overlayPrimitives";
import { TaskSubtasks, type TaskSubtasksModel } from "./TaskSubtasks";

type FocusLiveSubtasksProps = {
  task: ListBoardTask;
  target: ListBoardRequestTarget;
  fixtureMode: boolean;
  fixtureSnapshot?: BoardSubtaskSnapshot | null;
  fixtureExpanded?: boolean;
  presentation?: "panel" | "floating";
  expanded?: boolean;
  interactionPending?: boolean;
  onExpandedChange?: (expanded: boolean) => boolean | void | Promise<boolean | void>;
  onTaskProjection?: (task: ListBoardTask) => void;
};

function progressState(task: ListBoardTask, snapshot: BoardSubtaskSnapshot | null) {
  const total = snapshot?.subtasks.length ?? task.subtaskTotalCount ?? 0;
  const completed = snapshot
    ? snapshot.subtasks.filter((subtask) => subtask.completedAt !== null).length
    : task.subtaskCompletedCount ?? 0;
  const clampedTotal = Math.max(0, total);
  const clampedCompleted = Math.min(Math.max(0, completed), clampedTotal);
  const percent = clampedTotal === 0 ? 0 : Math.round((clampedCompleted / clampedTotal) * 100);
  return { total: clampedTotal, completed: clampedCompleted, percent };
}

function movedOrder(subtasks: BoardSubtask[], subtaskId: string, direction: "up" | "down") {
  const expectedOrder = subtasks.map((subtask) => subtask.id);
  const index = expectedOrder.indexOf(subtaskId);
  if (index < 0) return null;
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (nextIndex < 0 || nextIndex >= expectedOrder.length) return null;
  const orderedIds = [...expectedOrder];
  [orderedIds[index], orderedIds[nextIndex]] = [orderedIds[nextIndex], orderedIds[index]];
  return { expectedOrder, orderedIds };
}

export function FocusLiveSubtasks({
  task,
  target,
  fixtureMode,
  fixtureSnapshot = null,
  fixtureExpanded = false,
  presentation = "panel",
  expanded: controlledExpanded,
  interactionPending = false,
  onExpandedChange,
  onTaskProjection,
}: FocusLiveSubtasksProps) {
  const mountedRef = useRef(true);
  const [internalExpanded, setInternalExpanded] = useState(fixtureMode && fixtureExpanded);
  const [loading, setLoading] = useState(false);
  const [snapshot, setSnapshot] = useState<BoardSubtaskSnapshot | null>(fixtureMode ? fixtureSnapshot : null);
  const [error, setError] = useState<string | null>(null);
  const [createValue, setCreateValue] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editor, setEditor] = useState<TaskSubtasksModel["editor"]>(null);
  const [pending, setPending] = useState(false);
  const [refreshBlocked, setRefreshBlocked] = useState(false);
  const expanded = controlledExpanded ?? internalExpanded;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!fixtureMode) return;
    setSnapshot(fixtureSnapshot);
    if (controlledExpanded === undefined) setInternalExpanded(fixtureExpanded);
    setLoading(false);
    setError(null);
    setCreateValue("");
    setCreateOpen(false);
    setEditor(null);
    setPending(false);
    setRefreshBlocked(false);
  }, [controlledExpanded, fixtureExpanded, fixtureMode, fixtureSnapshot]);

  const progress = useMemo(() => progressState(task, snapshot), [snapshot, task]);
  const mutable = Boolean(snapshot?.mutable) && !refreshBlocked;

  const loadSubtasks = async () => {
    if (fixtureMode || loading) return;
    setLoading(true);
    setError(null);
    try {
      const incoming = await getListBoardTaskSubtasks(task.id, task.listId);
      if (incoming.taskId !== task.id || incoming.listId !== task.listId) {
        throw new Error("Authoritative subtask snapshot did not match the live task.");
      }
      if (mountedRef.current) setSnapshot(incoming);
    } catch (failure: unknown) {
      if (mountedRef.current) setError(formatInvokeError(failure));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const requestExpanded = async (nextExpanded: boolean) => {
    if (interactionPending) return false;
    const accepted = await onExpandedChange?.(nextExpanded);
    if (accepted === false) return false;
    if (controlledExpanded === undefined) setInternalExpanded(nextExpanded);
    return true;
  };

  const ensureExpanded = async (openCreate = false) => {
    if (expanded) {
      if (openCreate) setCreateOpen(true);
      return;
    }
    if (!refreshBlocked) setError(null);
    const accepted = await requestExpanded(true);
    if (accepted && openCreate) setCreateOpen(true);
  };

  const toggleExpanded = async () => {
    if (expanded) {
      const accepted = await requestExpanded(false);
      if (!accepted) return;
      setCreateOpen(false);
      setEditor(null);
      return;
    }
    await ensureExpanded();
  };

  useEffect(() => {
    if (expanded && !snapshot && !fixtureMode && !loading && !error) void loadSubtasks();
  }, [error, expanded, fixtureMode, loading, snapshot, task.id, task.listId]);

  const refreshSubtasksAndBoard = async () => {
    const [subtasksPayload, boardPayload] = await Promise.all([
      getListBoardTaskSubtasks(task.id, task.listId),
      getListBoardSnapshot(target),
    ]);
    if (subtasksPayload.taskId !== task.id || subtasksPayload.listId !== task.listId) {
      throw new Error("Authoritative subtask refresh did not match the live task.");
    }
    const projectedTask = boardPayload.today.tasks.find((candidate) => candidate.id === task.id);
    if (!projectedTask) {
      throw new Error("The live task was missing from the authoritative Focus board refresh.");
    }
    const projectedTotal = projectedTask.subtaskTotalCount ?? 0;
    const projectedCompleted = projectedTask.subtaskCompletedCount ?? 0;
    const actualCompleted = subtasksPayload.subtasks.filter((subtask) => subtask.completedAt !== null).length;
    if (projectedTotal !== subtasksPayload.subtasks.length || projectedCompleted !== actualCompleted) {
      throw new Error("Authoritative Focus subtask progress did not reconcile after the saved change.");
    }
    if (!mountedRef.current) return;
    setSnapshot(subtasksPayload);
    onTaskProjection?.(projectedTask);
    setError(null);
  };

  const handleCommittedRefreshFailure = (failure: unknown) => {
    if (!mountedRef.current) return;
    setRefreshBlocked(true);
    setError(
      `Subtask change was saved, but authoritative Focus progress could not refresh. ${formatInvokeError(failure)} Reopen Focus before making more subtask changes.`,
    );
  };

  const runMutation = async (
    mutation: () => Promise<unknown>,
    afterCommit?: () => void,
  ) => {
    if (fixtureMode || interactionPending || pending || refreshBlocked || !snapshot?.mutable) return;
    setPending(true);
    setError(null);
    try {
      await mutation();
      afterCommit?.();
      try {
        await refreshSubtasksAndBoard();
      } catch (failure: unknown) {
        handleCommittedRefreshFailure(failure);
      }
    } catch (failure: unknown) {
      if (mountedRef.current) setError(formatInvokeError(failure));
    } finally {
      if (mountedRef.current) setPending(false);
    }
  };

  const model: TaskSubtasksModel = {
    expanded,
    loading,
    error,
    mutable,
    subtasks: snapshot?.subtasks ?? [],
    createValue,
    editor,
    pending: pending || fixtureMode,
  };

  if (presentation === "floating") {
    const interactionBlocked = interactionPending || pending || refreshBlocked || !snapshot?.mutable;
    return (
      <section
        className="floating-timer-foundation__subtasks"
        data-floating-subtasks={expanded ? "expanded" : "collapsed"}
        data-floating-subtask-refresh-blocked={refreshBlocked ? "true" : "false"}
        data-task-id={task.id}
        aria-label={`Subtasks for ${task.title}`}
      >
        <div className="floating-timer-foundation__subtask-toolbar" aria-label="Floating Timer subtask summary">
          <span
            className="floating-timer-foundation__subtask-ring"
            role="progressbar"
            aria-label={`${progress.completed} of ${progress.total} subtasks complete`}
            aria-valuemin={0}
            aria-valuemax={progress.total}
            aria-valuenow={progress.completed}
            data-floating-subtask-progress="true"
            data-tauri-drag-region="true"
            style={{ "--floating-subtask-progress": `${progress.percent * 3.6}deg` } as CSSProperties}
          >
            <span aria-hidden="true">{progress.completed}/{progress.total}</span>
          </span>
          <span
            className="floating-timer-foundation__subtask-count type-metadata"
            data-floating-subtask-count="true"
            data-tauri-drag-region="true"
          >
            {progress.total === 0 ? "Subtasks" : `${progress.completed}/${progress.total} Subtasks`}
          </span>
          <Tooltip content="Add subtask" align="end">
            <button
              type="button"
              className="floating-timer-foundation__subtask-control motion-interactive"
              data-floating-subtask-control="add"
              aria-label={`Add subtask for ${task.title}`}
              disabled={interactionPending || pending || refreshBlocked}
              onClick={() => void ensureExpanded(true)}
            >
              +
            </button>
          </Tooltip>
          <Tooltip content={expanded ? "Collapse subtasks" : "Expand Floating Timer"} align="end">
            <button
              type="button"
              className="floating-timer-foundation__subtask-control motion-interactive"
              data-floating-subtask-control="expand"
              aria-label={expanded ? "Collapse Floating Timer" : "Expand Floating Timer"}
              aria-expanded={expanded}
              disabled={interactionPending || pending}
              onClick={() => void toggleExpanded()}
            >
              <span aria-hidden="true">{expanded ? "⌃" : "⌄"}</span>
            </button>
          </Tooltip>
        </div>

        {expanded ? (
          <div className="floating-timer-foundation__subtask-panel" data-floating-subtask-panel="true">
            {loading ? (
              <span className="type-metadata" role="status">Loading subtasks…</span>
            ) : error ? (
              <span className="floating-timer-foundation__subtask-error type-metadata" role="alert">{error}</span>
            ) : (
              <>
                <div className="floating-timer-foundation__subtask-list" role="list" aria-label={`Subtasks for ${task.title}`}>
                  {(snapshot?.subtasks ?? []).length === 0 ? (
                    <span className="floating-timer-foundation__subtask-empty type-metadata">No subtasks yet.</span>
                  ) : (snapshot?.subtasks ?? []).map((subtask, index, subtasks) => {
                    const completed = subtask.completedAt !== null;
                    return (
                      <div
                        key={subtask.id}
                        className="floating-timer-foundation__subtask-row"
                        data-floating-subtask-id={subtask.id}
                        data-floating-subtask-completed={completed ? "true" : "false"}
                        role="listitem"
                      >
                        <Tooltip content={completed ? "Reopen subtask" : "Complete subtask"} align="start">
                          <button
                            type="button"
                            className="floating-timer-foundation__subtask-check motion-interactive"
                            data-floating-subtask-action="complete"
                            aria-label={`${completed ? "Reopen" : "Complete"} subtask: ${subtask.title}`}
                            disabled={interactionBlocked}
                            onClick={() => void runMutation(() => setListBoardSubtaskCompletion({
                              subtaskId: subtask.id,
                              taskId: task.id,
                              listId: task.listId,
                              expectedCompletedAt: subtask.completedAt,
                              completed: !completed,
                            }))}
                          >
                            <span aria-hidden="true">{completed ? "✓" : "○"}</span>
                          </button>
                        </Tooltip>

                        <span className="floating-timer-foundation__subtask-title" title={subtask.title}>
                          {completed ? <s>{subtask.title}</s> : subtask.title}
                        </span>

                        <span className="floating-timer-foundation__subtask-actions">
                          <Tooltip content="Move subtask up" align="end">
                            <button
                              type="button"
                              className="floating-timer-foundation__subtask-action motion-interactive"
                              data-floating-subtask-action="move-up"
                              aria-label={`Move subtask up: ${subtask.title}`}
                              disabled={interactionBlocked || index === 0}
                              onClick={() => {
                                const order = movedOrder(subtasks, subtask.id, "up");
                                if (order) void runMutation(() => reorderListBoardSubtasks({
                                  taskId: task.id,
                                  listId: task.listId,
                                  expectedOrder: order.expectedOrder,
                                  orderedIds: order.orderedIds,
                                }));
                              }}
                            >↑</button>
                          </Tooltip>
                          <Tooltip content="Move subtask down" align="end">
                            <button
                              type="button"
                              className="floating-timer-foundation__subtask-action motion-interactive"
                              data-floating-subtask-action="move-down"
                              aria-label={`Move subtask down: ${subtask.title}`}
                              disabled={interactionBlocked || index === subtasks.length - 1}
                              onClick={() => {
                                const order = movedOrder(subtasks, subtask.id, "down");
                                if (order) void runMutation(() => reorderListBoardSubtasks({
                                  taskId: task.id,
                                  listId: task.listId,
                                  expectedOrder: order.expectedOrder,
                                  orderedIds: order.orderedIds,
                                }));
                              }}
                            >↓</button>
                          </Tooltip>
                          <Tooltip content="Delete subtask" align="end">
                            <button
                              type="button"
                              className="floating-timer-foundation__subtask-action floating-timer-foundation__subtask-action--delete motion-interactive"
                              data-floating-subtask-action="delete"
                              aria-label={`Delete subtask: ${subtask.title}`}
                              disabled={interactionBlocked}
                              onClick={() => void runMutation(() => deleteListBoardSubtask({
                                subtaskId: subtask.id,
                                taskId: task.id,
                                listId: task.listId,
                                expectedUpdatedAt: subtask.updatedAt,
                              }))}
                            >×</button>
                          </Tooltip>
                        </span>
                      </div>
                    );
                  })}
                </div>

                {createOpen ? (
                  <form
                    className="floating-timer-foundation__subtask-create"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const title = createValue.trim();
                      if (!title || interactionBlocked) return;
                      void runMutation(
                        () => createListBoardSubtask({ taskId: task.id, listId: task.listId, title }),
                        () => setCreateValue(""),
                      );
                    }}
                  >
                    <input
                      value={createValue}
                      aria-label={`New subtask for ${task.title}`}
                      placeholder="Add subtask"
                      disabled={interactionBlocked}
                      autoFocus={!fixtureMode}
                      onChange={(event) => setCreateValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape" && !pending) {
                          event.preventDefault();
                          setCreateOpen(false);
                          setCreateValue("");
                        }
                      }}
                    />
                    <button type="submit" disabled={interactionBlocked || !createValue.trim()}>Add</button>
                  </form>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section
      className="focus-panel__subtasks"
      data-focus-subtasks={expanded ? "expanded" : "collapsed"}
      data-focus-subtask-refresh-blocked={refreshBlocked ? "true" : "false"}
      aria-label={`Subtasks for ${task.title}`}
    >
      <div className="focus-panel__subtask-toolbar">
        <span
          className="focus-panel__subtask-ring"
          role="progressbar"
          aria-label={`${progress.completed} of ${progress.total} subtasks complete`}
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.completed}
          style={{ "--focus-subtask-progress": `${progress.percent * 3.6}deg` } as CSSProperties}
          data-focus-subtask-progress="true"
        >
          <span aria-hidden="true">{progress.completed}/{progress.total}</span>
        </span>
        <button
          type="button"
          className="focus-panel__subtask-toggle motion-interactive"
          data-focus-subtask-control="toggle"
          aria-expanded={expanded}
          onClick={() => void toggleExpanded()}
        >
          <span>{progress.total === 0 ? "Subtasks" : `${progress.completed}/${progress.total} Subtasks`}</span>
          <span aria-hidden="true">{expanded ? "⌃" : "⌄"}</span>
        </button>
        <Tooltip content="Add subtask">
          <button
            type="button"
            className="focus-panel__subtask-add motion-interactive"
            data-focus-subtask-control="add"
            aria-label={`Add subtask for ${task.title}`}
            disabled={fixtureMode || refreshBlocked}
            onClick={() => void ensureExpanded()}
          >
            +
          </button>
        </Tooltip>
      </div>

      {expanded ? (
        <div className="focus-panel__subtask-panel" data-focus-subtask-panel="true">
          <TaskSubtasks
            taskTitle={task.title}
            totalCount={progress.total}
            completedCount={progress.completed}
            model={model}
            canExpand
            onToggleExpanded={() => void toggleExpanded()}
            onCreateValueChange={setCreateValue}
            onCreate={() => {
              const title = createValue.trim();
              if (!title) return;
              void runMutation(
                () => createListBoardSubtask({ taskId: task.id, listId: task.listId, title }),
                () => setCreateValue(""),
              );
            }}
            onStartEdit={(subtask) => setEditor({ id: subtask.id, expectedTitle: subtask.title, value: subtask.title })}
            onEditValueChange={(value) => setEditor((current) => current ? { ...current, value } : current)}
            onSaveEdit={() => {
              if (!editor) return;
              const title = editor.value.trim();
              if (!title) return;
              void runMutation(
                () => updateListBoardSubtaskTitle({
                  subtaskId: editor.id,
                  taskId: task.id,
                  listId: task.listId,
                  expectedTitle: editor.expectedTitle,
                  title,
                }),
                () => setEditor(null),
              );
            }}
            onCancelEdit={() => setEditor(null)}
            onToggleCompleted={(subtask) => {
              void runMutation(() => setListBoardSubtaskCompletion({
                subtaskId: subtask.id,
                taskId: task.id,
                listId: task.listId,
                expectedCompletedAt: subtask.completedAt,
                completed: subtask.completedAt === null,
              }));
            }}
            onMove={(subtask, direction) => {
              const order = movedOrder(snapshot?.subtasks ?? [], subtask.id, direction);
              if (!order) return;
              void runMutation(() => reorderListBoardSubtasks({
                taskId: task.id,
                listId: task.listId,
                expectedOrder: order.expectedOrder,
                orderedIds: order.orderedIds,
              }));
            }}
            onDelete={(subtask) => {
              void runMutation(() => deleteListBoardSubtask({
                subtaskId: subtask.id,
                taskId: task.id,
                listId: task.listId,
                expectedUpdatedAt: subtask.updatedAt,
              }));
            }}
          />
        </div>
      ) : null}
    </section>
  );
}
