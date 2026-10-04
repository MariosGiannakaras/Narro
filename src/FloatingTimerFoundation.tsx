import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { formatInvokeError } from "./diagnosticApi";
import { FocusLiveActions } from "./FocusLiveActions";
import type { FocusCompletionSuccessState } from "./FocusCompletionSuccess";
import { FocusLiveSubtasks } from "./FocusLiveSubtasks";
import { focusTimerPresentation } from "./focusTimerPresentation";
import { captureCompactTimerFrame, setFloatingTimerExpanded } from "./focusSurfaceModeApi";
import {
  getListBoardSnapshot,
  type BoardSubtaskSnapshot,
  type ListBoardSnapshot,
  type ListBoardTask,
} from "./listBoardApi";
import { Tooltip } from "./overlayPrimitives";
import { waitForPresentedFrame } from "./presentationFrame";
import {
  applyTimerSessionProjection,
  connectLiveTimerSessionProjection,
  type TimerSessionPayload,
} from "./timerSessionApi";
import "./floatingTimerFoundation.css";

export type FloatingTimerFoundationProps = {
  onReturnToPanel: () => void;
  attentionPulseSequence?: number | null;
  onAttentionPulseEnd?: (sequence: number) => void;
  onResizePendingChange?: (pending: boolean) => void;
  transitionPending?: boolean;
  transitionError?: string | null;
  shortcutStatus?: string | null;
  onPresentationReady?: (payload: TimerSessionPayload | null) => void;
  refreshKey?: number;
  fixtureBoard?: ListBoardSnapshot;
  fixtureTimer?: TimerSessionPayload | null;
  sharedTimerProjection?: {
    payload: TimerSessionPayload | null;
    settled: boolean;
  };
  presentationActive?: boolean;
  controlledExpanded?: boolean;
  onRequestExpanded?: (expanded: boolean, compactFrame?: number[]) => Promise<void>;
  fixtureExpanded?: boolean;
  fixtureSubtasks?: BoardSubtaskSnapshot | null;
  onCompletionSuccess?: (state: FocusCompletionSuccessState) => void;
};

const FLOATING_TIMER_GEOMETRY_MOTION_MS = 270;

async function waitForFloatingTimerGeometryMotion(): Promise<void> {
  const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 1
    : FLOATING_TIMER_GEOMETRY_MOTION_MS;
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function subtaskProgress(task: ListBoardTask | null) {
  const total = Math.max(0, task?.subtaskTotalCount ?? 0);
  const completed = Math.min(Math.max(0, task?.subtaskCompletedCount ?? 0), total);
  return {
    total,
    completed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function FloatingTimerFoundation({
  onReturnToPanel,
  attentionPulseSequence = null,
  onAttentionPulseEnd,
  onResizePendingChange,
  transitionPending = false,
  transitionError = null,
  shortcutStatus = null,
  onPresentationReady,
  refreshKey = 0,
  fixtureBoard,
  fixtureTimer = null,
  sharedTimerProjection,
  presentationActive = true,
  controlledExpanded,
  onRequestExpanded,
  fixtureExpanded = false,
  fixtureSubtasks = null,
  onCompletionSuccess,
}: FloatingTimerFoundationProps) {
  const fixtureMode = fixtureBoard !== undefined;
  const [board, setBoard] = useState<ListBoardSnapshot | null>(fixtureBoard ?? null);
  const [timer, setTimer] = useState<TimerSessionPayload | null>(fixtureMode ? fixtureTimer : null);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [timerError, setTimerError] = useState<string | null>(null);
  const [timerSettled, setTimerSettled] = useState(fixtureMode);
  const [timerSettledKey, setTimerSettledKey] = useState(0);
  const [boardSettledKey, setBoardSettledKey] = useState(0);
  const [boardTaskId, setBoardTaskId] = useState<string | null>(
    fixtureMode ? fixtureTimer?.runtime.timer.task_id ?? null : null,
  );
  const initialExpanded = controlledExpanded ?? (fixtureMode && fixtureExpanded);
  const [expanded, setExpanded] = useState(initialExpanded);
  const [regionExpanded, setRegionExpanded] = useState(initialExpanded);
  const [resizePending, setResizePending] = useState(false);
  const [resizePhase, setResizePhase] = useState<
    "idle" | "prepainting" | "revealing-start" | "revealing" | "contracting-start" | "contracting" | "clipping"
  >("idle");
  const resizeRequestInFlightRef = useRef(false);
  const [resizeError, setResizeError] = useState<string | null>(null);
  const [compactHovered, setCompactHovered] = useState(false);
  const [compactFocused, setCompactFocused] = useState(false);
  const compactActionsVisible = !expanded && (compactHovered || compactFocused);

  useEffect(() => {
    if (controlledExpanded !== undefined) {
      // A child-initiated resize commits the authoritative parent presentation
      // before its finite reveal/contraction finishes. Do not let the controlled
      // prop effect erase that in-flight geometry phase.
      if (resizeRequestInFlightRef.current) return;
      setExpanded(controlledExpanded);
      setRegionExpanded(controlledExpanded);
      setResizePending(false);
      setResizePhase("idle");
      return;
    }
    if (!fixtureMode) return;
    setExpanded(fixtureExpanded);
    setRegionExpanded(fixtureExpanded);
    setResizePending(false);
    setResizePhase("idle");
    setResizeError(null);
  }, [controlledExpanded, fixtureExpanded, fixtureMode]);

  useEffect(() => () => onResizePendingChange?.(false), [onResizePendingChange]);

  useEffect(() => {
    if (fixtureMode) {
      setTimer(fixtureTimer);
      setTimerSettled(true);
      setTimerSettledKey(refreshKey);
      setTimerError(null);
      return;
    }
    if (sharedTimerProjection !== undefined) {
      setTimer(sharedTimerProjection.payload);
      setTimerSettled(sharedTimerProjection.settled);
      setTimerSettledKey(refreshKey);
      setTimerError(null);
      return;
    }

    let disposed = false;
    setTimerSettled(false);
    let disconnect: (() => void) | undefined;
    void connectLiveTimerSessionProjection(
      (incoming) => {
        if (!disposed) {
          setTimer((current) => applyTimerSessionProjection(current, incoming));
          setTimerError(null);
        }
      },
      (failure) => {
        if (!disposed) setTimerError(formatInvokeError(failure));
      },
    )
      .then((stop) => {
        if (disposed) stop();
        else {
          disconnect = stop;
          setTimerSettled(true);
          setTimerSettledKey(refreshKey);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setTimerSettled(true);
          setTimerSettledKey(refreshKey);
          setTimerError(formatInvokeError(failure));
        }
      });

    return () => {
      disposed = true;
      disconnect?.();
    };
  }, [fixtureMode, fixtureTimer, refreshKey, sharedTimerProjection]);

  const liveTaskId = timer?.runtime.timer.task_id ?? null;

  useEffect(() => {
    if (fixtureMode) {
      setBoard(fixtureBoard ?? null);
      setBoardError(null);
      setBoardSettledKey(refreshKey);
      return;
    }
    if (liveTaskId === null) {
      setBoard(null);
      setBoardTaskId(null);
      setBoardError(null);
      setBoardSettledKey(refreshKey);
      return;
    }

    let disposed = false;
    const retainCurrentBoard = board !== null && boardTaskId === liveTaskId;
    if (!retainCurrentBoard) {
      setBoard(null);
      setBoardTaskId(null);
    }
    setBoardError(null);
    void getListBoardSnapshot({ kind: "all" })
      .then((snapshot) => {
        if (!disposed) {
          setBoard(snapshot);
          setBoardTaskId(liveTaskId);
          setBoardError(null);
          setBoardSettledKey(refreshKey);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          if (!retainCurrentBoard) setBoard(null);
          setBoardTaskId(liveTaskId);
          setBoardError(formatInvokeError(failure));
          setBoardSettledKey(refreshKey);
        }
      });

    return () => {
      disposed = true;
    };
  }, [fixtureBoard, fixtureMode, liveTaskId, refreshKey]);

  const presentationReady = fixtureMode
    || (timerSettled && timer !== null && timerSettledKey === refreshKey && boardSettledKey === refreshKey
      && (liveTaskId === null || (boardTaskId === liveTaskId && board !== null)));

  useEffect(() => {
    if (presentationReady) onPresentationReady?.(timer);
  }, [onPresentationReady, presentationReady, timer]);

  const liveTask = useMemo(
    () => liveTaskId === null ? null : board?.today.tasks.find((task) => task.id === liveTaskId) ?? null,
    [board, liveTaskId],
  );
  const liveTimer = timer ? focusTimerPresentation(timer.runtime.timer) : null;
  const progress = useMemo(() => subtaskProgress(liveTask), [liveTask]);
  const error = transitionError ?? resizeError ?? timerError ?? boardError;
  const title = liveTask?.title
    ?? (liveTaskId
      ? boardTaskId === liveTaskId ? "Focus task unavailable" : "Loading focus task…"
      : "No active focus task");

  const requestExpanded = async (nextExpanded: boolean) => {
    if (transitionPending || resizeRequestInFlightRef.current) return false;
    if (nextExpanded === expanded) return true;
    if (fixtureMode) {
      setExpanded(nextExpanded);
      setRegionExpanded(nextExpanded);
      setResizeError(null);
      return true;
    }

    resizeRequestInFlightRef.current = true;
    onResizePendingChange?.(true);
    setResizePending(true);
    setResizeError(null);
    let nativeRegionCommitted = false;
    try {
      if (nextExpanded) {
        // Prepaint the full 300px hierarchy while Win32 still clips the host to
        // 110px. After the native region expands, reveal those already-painted
        // pixels with a finite same-WebView clip animation.
        flushSync(() => {
          setExpanded(true);
          setResizePhase("prepainting");
        });
        await waitForPresentedFrame();
        if (onRequestExpanded) await onRequestExpanded(true);
        else await setFloatingTimerExpanded(true);
        nativeRegionCommitted = true;
        flushSync(() => {
          setRegionExpanded(true);
          setResizePhase("revealing-start");
        });
        await waitForPresentedFrame();
        flushSync(() => setResizePhase("revealing"));
        await waitForFloatingTimerGeometryMotion();
      } else {
        // Contract the painted 300px Timer to the exact 110px compact geometry
        // before Win32 clips/restores the compact origin. The host WebView never
        // resizes or hides during this ordinary presentation change.
        flushSync(() => setResizePhase("contracting-start"));
        await waitForPresentedFrame();
        flushSync(() => setResizePhase("contracting"));
        await waitForFloatingTimerGeometryMotion();
        // The compact hierarchy, not a clipped expanded hierarchy, is the
        // incoming frame. Present it before native clipping so the native
        // one-shot raster contains the correct title/action/subtask geometry.
        flushSync(() => {
          setResizePhase("clipping");
          setExpanded(false);
        });
        await waitForPresentedFrame();
        const compactFrame = await captureCompactTimerFrame();
        if (onRequestExpanded) await onRequestExpanded(false, compactFrame);
        else await setFloatingTimerExpanded(false, compactFrame);
        nativeRegionCommitted = true;
        flushSync(() => {
          setRegionExpanded(false);
        });
      }
      return true;
    } catch (failure: unknown) {
      if (!nativeRegionCommitted) {
        flushSync(() => {
          setExpanded(expanded);
          setRegionExpanded(expanded);
        });
      }
      setResizeError(formatInvokeError(failure));
      return nativeRegionCommitted;
    } finally {
      resizeRequestInFlightRef.current = false;
      onResizePendingChange?.(false);
      setResizePhase("idle");
      setResizePending(false);
    }
  };

  const applyTaskProjection = (projectedTask: ListBoardTask) => {
    setBoard((current) => {
      if (!current) return current;
      const todayTasks = current.today.tasks.map((task) => task.id === projectedTask.id ? projectedTask : task);
      if (!todayTasks.some((task, index) => task !== current.today.tasks[index])) return current;
      return { ...current, today: { ...current.today, tasks: todayTasks } };
    });
  };

  return (
    <main
      className="floating-timer-foundation"
      data-floating-timer="foundation"
      data-floating-live-state={timer?.runtime.timer.state ?? "idle"}
      data-floating-live-task-id={liveTaskId ?? ""}
      data-floating-expanded={expanded ? "true" : "false"}
      data-floating-compact-actions={compactActionsVisible ? "true" : "false"}
      data-floating-region-expanded={regionExpanded ? "true" : "false"}
      data-floating-resize-pending={resizePending ? "true" : "false"}
      data-floating-resize-phase={resizePhase}
      data-tauri-drag-region="true"
      aria-label="Floating Timer"
      onPointerEnter={() => setCompactHovered(true)}
      onPointerLeave={() => setCompactHovered(false)}
      onFocusCapture={() => setCompactFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setCompactFocused(false);
      }}
    >
      {shortcutStatus ? (
        <span className="floating-timer-foundation__shortcut-status type-metadata" role="status">
          {shortcutStatus}
        </span>
      ) : null}
      {attentionPulseSequence !== null && (
        <span
          key={attentionPulseSequence}
          className="floating-timer-foundation__attention-pulse"
          aria-hidden="true"
          onAnimationEnd={() => onAttentionPulseEnd?.(attentionPulseSequence)}
        />
      )}
      <div
        className="floating-timer-foundation__content"
        data-tauri-drag-region="true"
      >
        <div
          key="timer-heading"
          className="floating-timer-foundation__heading"
          data-tauri-drag-region="true"
          tabIndex={!expanded && liveTask && timer ? 0 : undefined}
          aria-label={!expanded && liveTask && timer ? "Show Floating Timer actions" : undefined}
        >
          <strong
            className="floating-timer-foundation__title"
            data-floating-task-title="true"
            data-tauri-drag-region="true"
            title={liveTask?.title}
          >
            {title}
          </strong>
          <span
            className="floating-timer-foundation__timer timer-numerals"
            data-floating-live-timer="true"
            data-floating-live-timer-mode={liveTimer?.mode ?? "none"}
            data-timed-alert-flash-task-id={liveTaskId ?? undefined}
            data-timer-numerals="true"
            data-tauri-drag-region="true"
            aria-label={liveTimer?.label ?? "Timer unavailable"}
            aria-live="off"
          >
            {liveTimer?.text ?? "--:--"}
          </span>
        </div>
        {liveTask && timer ? (
          <div
            key={`actions-host:${liveTask.id}`}
            data-floating-actions-controller="true"
            className="floating-timer-foundation__actions-controller"
            inert={resizePending || (!expanded && !compactActionsVisible) || (expanded && !regionExpanded)}
            aria-hidden={resizePending || (!expanded && !compactActionsVisible) || (expanded && !regionExpanded) ? true : undefined}
          >
            <FocusLiveActions
              task={liveTask}
              target={{ kind: "all" }}
              timer={timer}
              fixtureMode={fixtureMode}
              presentation="floating"
              transitionPending={transitionPending || resizePending}
              presentationActive={presentationActive}
              onReturnToPanel={onReturnToPanel}
              onEnsureNotesVisible={() => requestExpanded(true)}
              onTimerPayload={(payload) => {
                setTimer((current) => applyTimerSessionProjection(current, payload));
              }}
              onCompletionSuccess={onCompletionSuccess}
            />
          </div>
        ) : null}

        {liveTask && timer && !expanded ? (
          <span className="floating-timer-foundation__drag-handle" data-tauri-drag-region="true" aria-hidden="true" />
        ) : null}

        {liveTask ? (
          <FocusLiveSubtasks
            key={`subtasks:${liveTask.id}`}
            task={liveTask}
            target={{ kind: "all" }}
            fixtureMode={fixtureMode}
            fixtureSnapshot={fixtureSubtasks}
            fixtureExpanded={fixtureExpanded}
            presentation="floating"
            expanded={expanded}
            contentInert={resizePending || (expanded && !regionExpanded)}
            interactionPending={transitionPending || resizePending}
            onExpandedChange={requestExpanded}
            onTaskProjection={applyTaskProjection}
          />
        ) : (
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
            <span className="floating-timer-foundation__subtask-count type-metadata" data-floating-subtask-count="true" data-tauri-drag-region="true">
              Subtasks
            </span>
            {expanded ? (
              <Tooltip content="Collapse Timer" align="end">
                <button
                  type="button"
                  className="floating-timer-foundation__subtask-control motion-interactive"
                  data-floating-fallback-action="collapse"
                  aria-label="Collapse Timer"
                  disabled={transitionPending || resizePending}
                  onClick={() => { void requestExpanded(false); }}
                >⌃</button>
              </Tooltip>
            ) : (
              <Tooltip content="Add subtask" align="end">
                <button type="button" className="floating-timer-foundation__subtask-control" aria-label="Add subtask" disabled>+</button>
              </Tooltip>
            )}
            <Tooltip content="Return to Focus Panel" align="end">
              <button
                type="button"
                className="floating-timer-foundation__subtask-control motion-interactive"
                data-floating-fallback-action="return-to-panel"
                aria-label="Return to Focus Panel"
                disabled={transitionPending || resizePending}
                onClick={onReturnToPanel}
              >↗</button>
            </Tooltip>
          </div>
        )}

        {error ? (
          <span className="floating-timer-foundation__error type-metadata" role="alert" data-tauri-drag-region="true">
            {error}
          </span>
        ) : null}
      </div>
    </main>
  );
}
