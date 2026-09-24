import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import { FocusLiveActions } from "./FocusLiveActions";
import { FocusLiveSubtasks } from "./FocusLiveSubtasks";
import { focusTimerPresentation } from "./focusTimerPresentation";
import { setFloatingTimerExpanded } from "./focusSurfaceModeApi";
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
  fixtureBoard?: ListBoardSnapshot;
  fixtureTimer?: TimerSessionPayload | null;
  fixtureExpanded?: boolean;
  fixtureSubtasks?: BoardSubtaskSnapshot | null;
};

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
  fixtureBoard,
  fixtureTimer = null,
  fixtureExpanded = false,
  fixtureSubtasks = null,
}: FloatingTimerFoundationProps) {
  const fixtureMode = fixtureBoard !== undefined;
  const [board, setBoard] = useState<ListBoardSnapshot | null>(fixtureBoard ?? null);
  const [timer, setTimer] = useState<TimerSessionPayload | null>(fixtureMode ? fixtureTimer : null);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [timerError, setTimerError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(fixtureMode && fixtureExpanded);
  const [resizePending, setResizePending] = useState(false);
  const [resizePhase, setResizePhase] = useState<"idle" | "exiting" | "resizing" | "entering">("idle");
  const resizeTransitionResolverRef = useRef<(() => void) | null>(null);
  const resizeRequestInFlightRef = useRef(false);
  const [resizeError, setResizeError] = useState<string | null>(null);

  useEffect(() => {
    if (!fixtureMode) return;
    setExpanded(fixtureExpanded);
    setResizePending(false);
    setResizePhase("idle");
    resizeTransitionResolverRef.current = null;
    setResizeError(null);
  }, [fixtureExpanded, fixtureMode]);

  useEffect(() => () => onResizePendingChange?.(false), [onResizePendingChange]);

  useEffect(() => {
    if (fixtureMode) {
      setTimer(fixtureTimer);
      setTimerError(null);
      return;
    }

    let disposed = false;
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
        else disconnect = stop;
      })
      .catch((failure: unknown) => {
        if (!disposed) setTimerError(formatInvokeError(failure));
      });

    return () => {
      disposed = true;
      disconnect?.();
    };
  }, [fixtureMode, fixtureTimer]);

  const liveTaskId = timer?.runtime.timer.task_id ?? null;

  useEffect(() => {
    if (fixtureMode) {
      setBoard(fixtureBoard ?? null);
      setBoardError(null);
      return;
    }
    if (liveTaskId === null) {
      setBoard(null);
      setBoardError(null);
      return;
    }

    let disposed = false;
    void getListBoardSnapshot({ kind: "all" })
      .then((snapshot) => {
        if (!disposed) {
          setBoard(snapshot);
          setBoardError(null);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setBoard(null);
          setBoardError(formatInvokeError(failure));
        }
      });

    return () => {
      disposed = true;
    };
  }, [fixtureBoard, fixtureMode, liveTaskId]);

  const liveTask = useMemo(
    () => liveTaskId === null ? null : board?.today.tasks.find((task) => task.id === liveTaskId) ?? null,
    [board, liveTaskId],
  );
  const liveTimer = timer ? focusTimerPresentation(timer.runtime.timer) : null;
  const progress = useMemo(() => subtaskProgress(liveTask), [liveTask]);
  const error = transitionError ?? resizeError ?? timerError ?? boardError;
  const title = liveTask?.title ?? (liveTaskId ? "Loading focus task…" : "No active focus task");

  const waitForResizeTransition = (phase: "idle" | "exiting") => new Promise<void>((resolve) => {
    resizeTransitionResolverRef.current = resolve;
    setResizePhase(phase);
  });

  const finishResizeTransition = () => {
    const resolve = resizeTransitionResolverRef.current;
    if (!resolve) return;
    resizeTransitionResolverRef.current = null;
    resolve();
  };

  const requestExpanded = async (nextExpanded: boolean) => {
    if (transitionPending || resizeRequestInFlightRef.current) return false;
    if (nextExpanded === expanded) return true;
    if (fixtureMode) {
      setExpanded(nextExpanded);
      setResizeError(null);
      return true;
    }

    resizeRequestInFlightRef.current = true;
    onResizePendingChange?.(true);
    setResizePending(true);
    setResizeError(null);
    try {
      await waitForResizeTransition("exiting");
      setResizePhase("resizing");
      setExpanded(nextExpanded);
      await waitForPresentedFrame();
      await setFloatingTimerExpanded(nextExpanded);
      await waitForPresentedFrame();
      setResizePhase("entering");
      await waitForPresentedFrame();
      await waitForResizeTransition("idle");
      return true;
    } catch (failure: unknown) {
      setExpanded(expanded);
      setResizeError(formatInvokeError(failure));
      return false;
    } finally {
      resizeRequestInFlightRef.current = false;
      onResizePendingChange?.(false);
      resizeTransitionResolverRef.current = null;
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
      data-floating-resize-pending={resizePending ? "true" : "false"}
      data-floating-resize-phase={resizePhase}
      data-tauri-drag-region="true"
      aria-label="Floating Timer"
    >
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
        onTransitionEnd={(event) => {
          if (event.currentTarget !== event.target) return;
          if (event.propertyName !== "opacity") return;
          finishResizeTransition();
        }}
      >
        {expanded && liveTask && timer ? (
          <FocusLiveActions
            key={liveTask.id}
            task={liveTask}
            target={{ kind: "all" }}
            timer={timer}
            fixtureMode={fixtureMode}
            presentation="floating"
            transitionPending={transitionPending || resizePending}
            onReturnToPanel={onReturnToPanel}
            onTimerPayload={(payload) => {
              setTimer((current) => applyTimerSessionProjection(current, payload));
            }}
          />
        ) : (
          <div className="floating-timer-foundation__heading" data-tauri-drag-region="true">
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
              data-timer-numerals="true"
              data-tauri-drag-region="true"
              aria-label={liveTimer?.label ?? "Timer unavailable"}
              aria-live="off"
            >
              {liveTimer?.text ?? "--:--"}
            </span>
          </div>
        )}

        {liveTask ? (
          <FocusLiveSubtasks
            key={liveTask.id}
            task={liveTask}
            target={{ kind: "all" }}
            fixtureMode={fixtureMode}
            fixtureSnapshot={fixtureSubtasks}
            fixtureExpanded={fixtureExpanded}
            presentation="floating"
            expanded={expanded}
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
            <Tooltip content="Add subtask" align="end">
              <button type="button" className="floating-timer-foundation__subtask-control" aria-label="Add subtask" disabled>+</button>
            </Tooltip>
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
