import { useCallback, useEffect, useRef } from "react";
import { listenForBoardInvalidation } from "./boardInvalidation";
import { getListBoardTaskSubtasks, type BoardSubtaskSnapshot } from "./listBoardApi";

type ProjectionOptions = {
  taskId?: string;
  listId?: string;
  enabled: boolean;
  onLoad: () => void;
  onSnapshot: (snapshot: BoardSubtaskSnapshot) => void;
  onError: (failure: unknown) => void;
};

// Board aggregates and expanded children are separate authoritative reads.
// Initial, invalidation and post-write child reads share this freshness owner;
// refreshing data must not recreate the caller's draft/editor/focus state.
export function useSubtaskProjection(options: ProjectionOptions) {
  const { taskId, listId, enabled } = options;
  const key = enabled && taskId && listId ? `${taskId}:${listId}` : null;
  const renderedKey = useRef(key);
  renderedKey.current = key;
  const callbacks = useRef(options);
  callbacks.current = options;
  const revision = useRef(0);
  const active = useRef<object | null>(null);
  const accepted = useRef<{ snapshot: BoardSubtaskSnapshot; revision: number } | null>(null);

  const refresh = useCallback(async (): Promise<BoardSubtaskSnapshot | null> => {
    if (!key || !taskId || !listId || renderedKey.current !== key || !active.current) return null;
    const owner = active.current;
    const request = ++revision.current;
    const current = () => renderedKey.current === key && active.current === owner && revision.current === request;
    try {
      const snapshot = await getListBoardTaskSubtasks(taskId, listId);
      if (!current()) return null;
      if (snapshot.taskId !== taskId || snapshot.listId !== listId
        || snapshot.subtasks.some(child => child.taskId !== taskId)) {
        throw new Error("Authoritative subtask snapshot did not match its task/list owner.");
      }
      accepted.current = { snapshot, revision: request };
      callbacks.current.onSnapshot(snapshot);
      return snapshot;
    } catch (failure: unknown) {
      if (!current()) return null;
      callbacks.current.onError(failure);
      throw failure;
    }
  }, [key, taskId, listId]);

  useEffect(() => {
    if (!key) return;
    const owner = {};
    active.current = owner;
    let stopListening: (() => void) | undefined;
    callbacks.current.onLoad();
    // Subscribe before the initial read so a commit cannot fall into a
    // read-before-listener gap. No polling or work while the detail is closed.
    void listenForBoardInvalidation(() => { void refresh().catch(() => undefined); })
      .then(unlisten => {
        if (active.current !== owner || renderedKey.current !== key) { unlisten(); return; }
        stopListening = unlisten;
        void refresh().catch(() => undefined);
      })
      .catch((failure: unknown) => {
        if (active.current === owner && renderedKey.current === key) callbacks.current.onError(failure);
      });
    return () => {
      if (active.current === owner) active.current = null;
      ++revision.current;
      stopListening?.();
    };
  }, [key, refresh]);

  const isCurrent = (snapshot: BoardSubtaskSnapshot) => Boolean(active.current)
    && renderedKey.current === key && accepted.current?.snapshot === snapshot
    && accepted.current.revision === revision.current;
  return { refresh, isCurrent };
}
