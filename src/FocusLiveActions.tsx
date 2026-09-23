import { useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import { FocusLiveMetrics, type FocusMetricKind } from "./FocusLiveMetrics";
import { FocusLiveSubtasks } from "./FocusLiveSubtasks";
import {
  getListBoardSnapshot,
  type ListBoardRequestTarget,
  type ListBoardSnapshot,
  type ListBoardTask,
} from "./listBoardApi";
import { Tooltip } from "./overlayPrimitives";
import { TaskNotes } from "./TaskNotes";
import {
  completeTimerTask,
  pauseTimer,
  resumeTimer,
  skipBreakTimer,
  skipTimerTask,
  snapshotTimerSession,
  startManualBreakTimer,
  startTimerTask,
  switchTimerTask,
  type TimerMode,
  type TimerSessionPayload,
  type TimerSnapshot,
} from "./timerSessionApi";

// M8 will expose this already-established preference in the Settings UI. Until then the Focus
// action uses the schema/product default rather than inventing a second configurable value.
const DEFAULT_MANUAL_BREAK_MS = 10 * 60 * 1_000;

type FocusLiveActionsProps = {
  task: ListBoardTask;
  target: ListBoardRequestTarget;
  timer: TimerSessionPayload;
  fixtureMode: boolean;
  fixtureMetricEditor?: FocusMetricKind | null;
  onTimerPayload: (payload: TimerSessionPayload) => void;
  presentation?: "panel" | "floating";
  onReturnToPanel?: () => void;
  transitionPending?: boolean;
};

type FocusAction = "break" | "pause_resume" | "skip" | "done";

function isEligibleQueueTask(task: ListBoardTask): boolean {
  return task.scheduledLocalTime === null || task.isOverdue;
}

function nextEligibleTask(board: ListBoardSnapshot, currentTaskId: string): ListBoardTask | null {
  return board.today.tasks.find(
    (candidate) => candidate.id !== currentTaskId && isEligibleQueueTask(candidate),
  ) ?? null;
}

function modeForNextTask(currentMode: TimerMode | null, task: ListBoardTask): TimerMode {
  if (currentMode?.kind === "pomodoro") {
    return currentMode;
  }
  const seconds = task.estSeconds;
  if (seconds !== null && Number.isSafeInteger(seconds) && seconds > 0) {
    return { kind: "est_countdown", est_ms: seconds * 1_000 };
  }
  return { kind: "count_up" };
}

function actionState(timer: TimerSnapshot): {
  breakEnabled: boolean;
  pauseResumeEnabled: boolean;
  pauseResumeLabel: "Pause" | "Resume";
  skipEnabled: boolean;
  doneEnabled: boolean;
} {
  const working = timer.state === "running"
    || timer.state === "paused"
    || timer.state === "overtime_running"
    || timer.state === "overtime_paused";
  const paused = timer.state === "paused" || timer.state === "overtime_paused";
  const breakState = timer.state === "break";
  return {
    breakEnabled: working,
    pauseResumeEnabled: working || breakState,
    pauseResumeLabel: paused || breakState ? "Resume" : "Pause",
    skipEnabled: working || timer.state === "time_up",
    doneEnabled: working || timer.state === "time_up",
  };
}

function assertExpectedLiveTask(payload: TimerSessionPayload, expectedTaskId: string): void {
  if (payload.runtime.timer.task_id !== expectedTaskId || payload.runtime.timer.state === "idle") {
    throw new Error("The live task changed before the Focus action could run. Refresh the Focus Panel and try again.");
  }
}

type FloatingActionIconKind = "break" | "notes" | "pause" | "resume" | "skip" | "done" | "return";

function FloatingActionIcon({ kind }: { kind: FloatingActionIconKind }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (kind) {
    case "break":
      return <svg {...common}><path d="M5 8h11v5a5 5 0 0 1-5 5H9a4 4 0 0 1-4-4V8Z" /><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" /><path d="M8 4v2M12 4v2" /></svg>;
    case "notes":
      return <svg {...common}><path d="M6 3h9l3 3v15H6Z" /><path d="M15 3v4h4M9 11h6M9 15h6" /></svg>;
    case "pause":
      return <svg {...common}><path d="M9 6v12M15 6v12" /></svg>;
    case "resume":
      return <svg {...common}><path d="m9 6 9 6-9 6Z" /></svg>;
    case "skip":
      return <svg {...common}><path d="m7 6 8 6-8 6Z" /><path d="M17 6v12" /></svg>;
    case "done":
      return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.2 2.2 4.8-5" /></svg>;
    case "return":
      return <svg {...common}><path d="M8 5H5v3M16 19h3v-3M5 8l5-5M19 16l-5 5" /></svg>;
  }
}

type FloatingActionButtonProps = {
  action: string;
  label: string;
  icon: FloatingActionIconKind;
  disabled?: boolean;
  expanded?: boolean;
  align?: "start" | "center" | "end";
  onClick: () => void;
};

function FloatingActionButton({
  action,
  label,
  icon,
  disabled = false,
  expanded,
  align = "center",
  onClick,
}: FloatingActionButtonProps) {
  return (
    <Tooltip content={label} placement="bottom" align={align}>
      <button
        type="button"
        className="floating-timer-foundation__action motion-interactive"
        data-floating-action={action}
        aria-label={label}
        aria-expanded={expanded}
        disabled={disabled}
        onClick={onClick}
      >
        <FloatingActionIcon kind={icon} />
      </button>
    </Tooltip>
  );
}

export function FocusLiveActions({
  task,
  target,
  timer,
  fixtureMode,
  fixtureMetricEditor = null,
  onTimerPayload,
  presentation = "panel",
  onReturnToPanel,
  transitionPending = false,
}: FocusLiveActionsProps) {
  const [pendingAction, setPendingAction] = useState<FocusAction | null>(null);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const state = actionState(timer.runtime.timer);
  const busy = pendingAction !== null || (presentation === "floating" && transitionPending);

  const applyPayload = (payload: TimerSessionPayload) => {
    onTimerPayload(payload);
    setError(null);
  };

  const fail = (failure: unknown) => {
    setStatus(null);
    setError(formatInvokeError(failure));
  };

  const run = async (
    action: FocusAction,
    mutation: () => Promise<TimerSessionPayload>,
    success: string,
  ) => {
    if (fixtureMode || busy) return;
    setPendingAction(action);
    setStatus(null);
    setError(null);
    try {
      applyPayload(await mutation());
      setStatus(success);
    } catch (failure: unknown) {
      fail(failure);
    } finally {
      setPendingAction(null);
    }
  };

  const handlePauseResume = () => {
    const timerState = timer.runtime.timer.state;
    if (timerState === "break") {
      void run("pause_resume", skipBreakTimer, "Break skipped. Work resumed.");
      return;
    }
    if (timerState === "paused" || timerState === "overtime_paused") {
      void run("pause_resume", resumeTimer, "Task resumed.");
      return;
    }
    void run("pause_resume", pauseTimer, "Task paused.");
  };

  const handleSkip = async () => {
    if (fixtureMode || busy) return;
    setPendingAction("skip");
    setStatus(null);
    setError(null);
    try {
      const [freshBoard, authoritative] = await Promise.all([
        getListBoardSnapshot(target),
        snapshotTimerSession(),
      ]);
      assertExpectedLiveTask(authoritative, task.id);
      if (authoritative.runtime.timer.state === "break") {
        throw new Error("Skip is unavailable during a break. Resume work first.");
      }

      const next = nextEligibleTask(freshBoard, task.id);
      const payload = next
        ? await switchTimerTask(next.id, modeForNextTask(authoritative.runtime.timer.mode, next))
        : await skipTimerTask();
      applyPayload(payload);
      setNotesExpanded(false);
      setStatus(next ? `Skipped to ${next.title}.` : "Task skipped. No other eligible task is available in this Focus view.");
    } catch (failure: unknown) {
      fail(failure);
    } finally {
      setPendingAction(null);
    }
  };

  const handleDone = async () => {
    if (fixtureMode || busy) return;
    setPendingAction("done");
    setStatus(null);
    setError(null);
    try {
      const [freshBoard, authoritative] = await Promise.all([
        getListBoardSnapshot(target),
        snapshotTimerSession(),
      ]);
      assertExpectedLiveTask(authoritative, task.id);
      if (authoritative.runtime.timer.state === "break") {
        throw new Error("Done is unavailable during a break. Resume work first.");
      }

      const next = nextEligibleTask(freshBoard, task.id);
      const nextMode = next ? modeForNextTask(authoritative.runtime.timer.mode, next) : null;
      const completed = await completeTimerTask();
      applyPayload(completed);
      setNotesExpanded(false);

      if (!next || !nextMode) {
        setStatus("Task completed. No other eligible task is available in this Focus view.");
        return;
      }

      // Completion has already committed. A failure to start the next task must not turn that
      // successful completion into a reported failure or encourage an unsafe retry.
      try {
        const started = await startTimerTask(next.id, nextMode);
        applyPayload(started);
        setStatus(`Task completed. ${next.title} is now live.`);
      } catch (nextFailure: unknown) {
        const detail = formatInvokeError(nextFailure);
        try {
          const latest = await snapshotTimerSession();
          applyPayload(latest);
        } catch {
          // Keep the committed completion projection when even the secondary refresh fails.
        }
        setStatus(`Task completed, but the next task could not start automatically. ${detail}`);
      }
    } catch (failure: unknown) {
      fail(failure);
    } finally {
      setPendingAction(null);
    }
  };

  const floating = presentation === "floating";
  const notesEditor = (
    <TaskNotes
      taskId={task.id}
      listId={task.listId}
      taskTitle={task.title}
      expanded={notesExpanded}
      canExpand
      readOnly={false}
      onToggleExpanded={() => setNotesExpanded((expanded) => !expanded)}
      onMutationStatus={(message, detail) => {
        setStatus(message || null);
        setError(detail);
      }}
      onRefreshBlocked={(message) => {
        setStatus(null);
        setError(message);
      }}
    />
  );

  return (
    <div
      className={floating ? "floating-timer-foundation__actions-wrap" : "focus-panel__live-actions-wrap"}
      data-focus-live-actions="true"
      data-live-actions-presentation={presentation}
    >
      {!floating ? (
        <>
          <FocusLiveMetrics
            task={task}
            target={target}
            timer={timer}
            fixtureMode={fixtureMode}
            fixtureEditor={fixtureMetricEditor}
            interactionBlocked={busy}
            onTimerPayload={applyPayload}
          />

          <FocusLiveSubtasks task={task} target={target} fixtureMode={fixtureMode} />

          <div className="focus-panel__live-actions" role="group" aria-label="Live task actions">
            <button
              type="button"
              data-focus-action="break"
              disabled={busy || !state.breakEnabled}
              onClick={() => void run("break", () => startManualBreakTimer(DEFAULT_MANUAL_BREAK_MS), "Break started.")}
            >
              Break
            </button>
            <button
              type="button"
              data-focus-action="notes"
              aria-expanded={notesExpanded}
              disabled={busy}
              onClick={() => setNotesExpanded((expanded) => !expanded)}
            >
              Notes
            </button>
            <button
              type="button"
              data-focus-action="pause-resume"
              disabled={busy || !state.pauseResumeEnabled}
              onClick={handlePauseResume}
            >
              {state.pauseResumeLabel}
            </button>
            <button
              type="button"
              data-focus-action="skip"
              disabled={busy || !state.skipEnabled}
              onClick={() => void handleSkip()}
            >
              Skip
            </button>
            <button
              type="button"
              data-focus-action="done"
              disabled={busy || !state.doneEnabled}
              onClick={() => void handleDone()}
            >
              Done
            </button>
          </div>
        </>
      ) : (
        <div className="floating-timer-foundation__actions" role="group" aria-label="Floating Timer actions">
          <FloatingActionButton
            action="break"
            label="Start break"
            icon="break"
            align="start"
            disabled={busy || !state.breakEnabled}
            onClick={() => void run("break", () => startManualBreakTimer(DEFAULT_MANUAL_BREAK_MS), "Break started.")}
          />
          <FloatingActionButton
            action="notes"
            label="Notes"
            icon="notes"
            expanded={notesExpanded}
            disabled={busy}
            onClick={() => setNotesExpanded((expanded) => !expanded)}
          />
          <FloatingActionButton
            action="pause-resume"
            label={state.pauseResumeLabel}
            icon={state.pauseResumeLabel === "Resume" ? "resume" : "pause"}
            disabled={busy || !state.pauseResumeEnabled}
            onClick={handlePauseResume}
          />
          <FloatingActionButton
            action="skip"
            label="Skip task"
            icon="skip"
            disabled={busy || !state.skipEnabled}
            onClick={() => void handleSkip()}
          />
          <FloatingActionButton
            action="done"
            label="Complete task"
            icon="done"
            disabled={busy || !state.doneEnabled}
            onClick={() => void handleDone()}
          />
          <FloatingActionButton
            action="return-to-panel"
            label="Return to Focus Panel"
            icon="return"
            align="end"
            disabled={transitionPending || !onReturnToPanel}
            onClick={() => onReturnToPanel?.()}
          />
        </div>
      )}

      {floating ? (
        <div className="floating-timer-foundation__notes" hidden={!notesExpanded}>{notesEditor}</div>
      ) : (
        <div className="focus-panel__notes" hidden={!notesExpanded}>{notesEditor}</div>
      )}

      {status ? (
        <div className={floating ? "floating-timer-foundation__action-status type-metadata" : "focus-panel__action-status type-metadata"} role="status">
          {status}
        </div>
      ) : null}
      {error ? (
        <div className={floating ? "floating-timer-foundation__action-error type-metadata" : "focus-panel__action-error type-metadata"} role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}
