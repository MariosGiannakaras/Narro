import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import type { FocusCompletionSuccessState } from "./FocusCompletionSuccess";
import { FocusLiveMetrics, type FocusMetricKind } from "./FocusLiveMetrics";
import { FocusLiveSubtasks } from "./FocusLiveSubtasks";
import {
  getListBoardSnapshot,
  type ListBoardRequestTarget,
  type ListBoardSnapshot,
  type ListBoardTask,
} from "./listBoardApi";
import {
  FOCUS_IN_APP_SHORTCUT_EVENT,
  hasActiveModalShortcutBoundary,
  isEditableShortcutTarget,
  isFocusActionShortcut,
  resolveInAppShortcut,
  type InAppShortcut,
} from "./inAppShortcuts";
import { Tooltip } from "./overlayPrimitives";
import { usePreferenceSettingsProjection } from "./usePreferenceSettingsProjection";
import { TaskNotes } from "./TaskNotes";
import {
  DEFAULT_SUCCESS_SOUND,
  playLocalSound,
} from "./localSoundCatalog";
import {
  completeTimerTask,
  extendTimer,
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

type FocusLiveActionsProps = {
  task: ListBoardTask;
  target: ListBoardRequestTarget;
  timer: TimerSessionPayload;
  fixtureMode: boolean;
  fixtureMetricEditor?: FocusMetricKind | null;
  onTimerPayload: (payload: TimerSessionPayload) => void;
  onTaskMutationCommitted?: () => Promise<void>;
  presentation?: "panel" | "floating";
  onReturnToPanel?: () => void;
  transitionPending?: boolean;
  presentationActive?: boolean;
  onEnsureNotesVisible?: () => boolean | Promise<boolean>;
  onCompletionSuccess?: (state: FocusCompletionSuccessState) => void;
};

type FocusAction = "break" | "pause_resume" | "skip" | "done" | "extend";

function isEligibleQueueTask(task: ListBoardTask): boolean {
  return task.scheduledLocalTime === null || task.isOverdue;
}

function nextEligibleTask(board: ListBoardSnapshot, currentTaskId: string): ListBoardTask | null {
  return board.today.tasks.find(
    (candidate) => candidate.id !== currentTaskId && isEligibleQueueTask(candidate),
  ) ?? null;
}

export function focusModeForTask(currentMode: TimerMode | null, task: ListBoardTask): TimerMode {
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
  extendEnabled: boolean;
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
    extendEnabled: timer.state === "time_up",
  };
}

function assertExpectedLiveTask(payload: TimerSessionPayload, expectedTaskId: string): void {
  if (payload.runtime.timer.task_id !== expectedTaskId || payload.runtime.timer.state === "idle") {
    throw new Error("The live task changed before the Focus action could run. Refresh the Focus Panel and try again.");
  }
}

type FloatingActionIconKind = "break" | "notes" | "pause" | "resume" | "skip" | "extend" | "done" | "return";

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
      return <svg {...common}><path d="M7 8h10a4 4 0 0 1 3.8 2.8l1 5.1a2 2 0 0 1-3.3 1.8L16 15H8l-2.5 2.7a2 2 0 0 1-3.3-1.8l1-5.1A4 4 0 0 1 7 8Z" /><path d="M7 10v4M5 12h4" /><circle cx="16" cy="11" r=".5" /><circle cx="18" cy="13" r=".5" /></svg>;
    case "notes":
      return <svg {...common}><path d="M6 3h9l3 3v15H6Z" /><path d="M15 3v4h4M9 11h6M9 15h6" /></svg>;
    case "pause":
      return <svg {...common}><path d="M9 6v12M15 6v12" /></svg>;
    case "resume":
      return <svg {...common}><path d="m9 6 9 6-9 6Z" /></svg>;
    case "skip":
      return <svg {...common}><path d="m7 6 8 6-8 6Z" /><path d="M17 6v12" /></svg>;
    case "extend":
      return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 8v8M8 12h8" /></svg>;
    case "done":
      return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.2 2.2 4.8-5" /></svg>;
    case "return":
      return <svg {...common}><path d="M8 5H5v3M16 19h3v-3M5 8l5-5M19 16l-5 5" /></svg>;
  }
}

type FloatingActionButtonProps = {
  action: string;
  label: string;
  pillLabel?: string;
  icon: FloatingActionIconKind;
  disabled?: boolean;
  expanded?: boolean;
  align?: "start" | "center" | "end";
  onClick: () => void;
};

function FloatingActionButton({
  action,
  label,
  pillLabel = label,
  icon,
  disabled = false,
  expanded,
  align = "center",
  onClick,
}: FloatingActionButtonProps) {
  return (
    <Tooltip content={label} placement="bottom" align={align} boundarySelector=".floating-timer-foundation">
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
        <span className="floating-timer-foundation__action-label" aria-hidden="true">{pillLabel}</span>
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
  onTaskMutationCommitted,
  presentation = "panel",
  onReturnToPanel,
  transitionPending = false,
  presentationActive = true,
  onEnsureNotesVisible,
  onCompletionSuccess,
}: FocusLiveActionsProps) {
  const [pendingAction, setPendingAction] = useState<FocusAction | null>(null);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shortcutHandlerRef = useRef<(shortcut: InAppShortcut) => void>(() => {});
  const timerState = timer.runtime.timer.state;
  const previousTimerStateRef = useRef(timerState);
  const state = actionState(timer.runtime.timer);
  const busy = !presentationActive
    || pendingAction !== null
    || (presentation === "floating" && transitionPending);
  const preferences = usePreferenceSettingsProjection(fixtureMode);
  const defaultBreakMs = preferences.snapshot
    ? preferences.snapshot.focus.defaultBreakSeconds * 1_000
    : null;
  const hideTaskTimes = preferences.snapshot?.general.hideTaskTimes ?? false;
  const showSuccessScreen = preferences.snapshot?.celebration.showSuccessScreen ?? true;

  useEffect(() => {
    const previousTimerState = previousTimerStateRef.current;
    if (timerState === "time_up" && previousTimerState !== "time_up") {
      setStatus(null);
    }
    previousTimerStateRef.current = timerState;
  }, [timerState]);

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

  const beginBreak = () => {
    if (defaultBreakMs === null) {
      setStatus(null);
      setError(preferences.error
        ? `Break settings are unavailable. ${preferences.error}`
        : "Break settings are still loading.");
      return;
    }
    void run("break", () => startManualBreakTimer(defaultBreakMs), "Break started.");
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
        ? await switchTimerTask(next.id, focusModeForTask(authoritative.runtime.timer.mode, next))
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
      const nextMode = next ? focusModeForTask(authoritative.runtime.timer.mode, next) : null;
      const completed = await completeTimerTask();
      // The sound switch is independent from the success-screen presentation.
      // Never play before the authoritative completion transaction commits.
      const celebration = preferences.snapshot?.celebration;
      if (celebration?.successSoundEnabled) {
        const successSound = celebration.successSound ?? DEFAULT_SUCCESS_SOUND;
        void playLocalSound(
          successSound,
          celebration.successSoundVolumePercent,
        ).catch((soundFailure: unknown) => {
          console.warn("Success sound could not play after committed task completion.", soundFailure);
        });
      }

      if (showSuccessScreen) {
        let postCompletionBoard: ListBoardSnapshot | null = null;
        try {
          postCompletionBoard = await getListBoardSnapshot(target);
        } catch {
          // Completion is committed; keep the success gate if the secondary board read fails.
        }
        const completedTask = postCompletionBoard?.done.tasks.find((candidate) => candidate.id === task.id) ?? task;
        const nextAfterCompletion = postCompletionBoard ? nextEligibleTask(postCompletionBoard, task.id) : next;
        const nextAfterCompletionMode = nextAfterCompletion
          ? focusModeForTask(authoritative.runtime.timer.mode, nextAfterCompletion)
          : null;
        onCompletionSuccess?.({
          completedTaskId: completedTask.id,
          completedTaskTitle: completedTask.title,
          estSeconds: completedTask.estSeconds,
          timeTakenSeconds: completedTask.timeTakenSeconds,
          nextTask: nextAfterCompletion && nextAfterCompletionMode
            ? { id: nextAfterCompletion.id, title: nextAfterCompletion.title, mode: nextAfterCompletionMode }
            : null,
        });
        applyPayload(completed);
        setNotesExpanded(false);
        if (onTaskMutationCommitted) {
          try {
            await onTaskMutationCommitted();
          } catch {
            // Do not turn a committed completion into a retryable failure.
          }
        }
        return;
      }

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

  shortcutHandlerRef.current = (shortcut: InAppShortcut) => {
    if (!isFocusActionShortcut(shortcut)) return;
    setError(null);

    switch (shortcut) {
      case "start-break":
        if (!state.breakEnabled) {
          setStatus("Break is unavailable until an active task is running or paused.");
          return;
        }
        beginBreak();
        return;
      case "pause-resume":
        if (!state.pauseResumeEnabled) {
          setStatus("Pause or resume is unavailable without an active task or break.");
          return;
        }
        handlePauseResume();
        return;
      case "skip-task":
        if (!state.skipEnabled) {
          setStatus(
            timer.runtime.timer.state === "break"
              ? "Skip task is unavailable during a break. Resume work first."
              : "Skip task is unavailable without an active task.",
          );
          return;
        }
        void handleSkip();
        return;
      case "finish-task":
        if (!state.doneEnabled) {
          setStatus(
            timer.runtime.timer.state === "break"
              ? "Finish task is unavailable during a break. Resume work first."
              : "Finish task is unavailable without an active task.",
          );
          return;
        }
        void handleDone();
        return;
      case "notes":
        if (busy) {
          setStatus("Notes are unavailable while another Focus action is in progress.");
          return;
        }
        setStatus(null);
        if (!onEnsureNotesVisible) {
          setNotesExpanded(true);
          return;
        }
        void Promise.resolve(onEnsureNotesVisible())
          .then((accepted) => {
            if (accepted) setNotesExpanded(true);
            else setStatus("Notes could not be opened while the Floating Timer is changing size.");
          })
          .catch((failure: unknown) => fail(failure));
        return;
    }
  };

  useEffect(() => {
    if (fixtureMode || !presentationActive) return;

    let disposed = false;
    let stopListening: (() => void) | undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcut = resolveInAppShortcut(event);
      if (!shortcut || event.defaultPrevented) return;
      if (hasActiveModalShortcutBoundary()) {
        event.preventDefault();
        return;
      }
      if (!isFocusActionShortcut(shortcut) || isEditableShortcutTarget(event.target)) return;
      event.preventDefault();
      shortcutHandlerRef.current(shortcut);
    };

    window.addEventListener("keydown", onKeyDown);
    void listen<InAppShortcut>(FOCUS_IN_APP_SHORTCUT_EVENT, (event) => {
      if (!disposed && isFocusActionShortcut(event.payload) && !hasActiveModalShortcutBoundary()) {
        shortcutHandlerRef.current(event.payload);
      }
    })
      .then((unlisten) => {
        if (disposed) unlisten();
        else stopListening = unlisten;
      })
      .catch((failure: unknown) => {
        if (!disposed) setError(`Focus shortcut routing could not start. ${formatInvokeError(failure)}`);
      });

    return () => {
      disposed = true;
      window.removeEventListener("keydown", onKeyDown);
      stopListening?.();
    };
  }, [fixtureMode, presentationActive]);

  const floating = presentation === "floating";
  const notesEditor = (
    <TaskNotes
      taskId={task.id}
      listId={task.listId}
      taskTitle={task.title}
      expanded={notesExpanded}
      canExpand
      readOnly={false}
      allowTitleEdit={!fixtureMode && presentation === "panel"}
      onTitleCommitted={onTaskMutationCommitted}
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
            hideTaskTimes={hideTaskTimes}
            onTimerPayload={applyPayload}
          />

          <FocusLiveSubtasks task={task} target={target} fixtureMode={fixtureMode} />

          <div className="focus-panel__live-actions" role="group" aria-label="Live task actions">
            <button
              type="button"
              data-focus-action="break"
              disabled={busy || !state.breakEnabled || defaultBreakMs === null}
              onClick={beginBreak}
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
            {state.extendEnabled ? (
              <button
                type="button"
                data-focus-action="extend"
                disabled={busy}
                onClick={() => void run("extend", extendTimer, "Timer extended into overtime.")}
              >
                Extend
              </button>
            ) : (
              <button
                type="button"
                data-focus-action="pause-resume"
                disabled={busy || !state.pauseResumeEnabled}
                onClick={handlePauseResume}
              >
                {state.pauseResumeLabel}
              </button>
            )}
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
            pillLabel="Break"
            icon="break"
            align="start"
            disabled={busy || !state.breakEnabled || defaultBreakMs === null}
            onClick={beginBreak}
          />
          <FloatingActionButton
            action="notes"
            label="Notes"
            icon="notes"
            expanded={notesExpanded}
            disabled={busy}
            onClick={() => {
              if (notesExpanded) { setNotesExpanded(false); return; }
              if (!onEnsureNotesVisible) { setNotesExpanded(true); return; }
              void Promise.resolve(onEnsureNotesVisible())
                .then((accepted) => { if (accepted) setNotesExpanded(true); })
                .catch((failure: unknown) => fail(failure));
            }}
          />
          {state.extendEnabled ? (
            <FloatingActionButton
              action="extend"
              label="Extend timer"
              pillLabel="Extend"
              icon="extend"
              disabled={busy}
              onClick={() => void run("extend", extendTimer, "Timer extended into overtime.")}
            />
          ) : (
            <FloatingActionButton
              action="pause-resume"
              label={state.pauseResumeLabel}
              icon={state.pauseResumeLabel === "Resume" ? "resume" : "pause"}
              disabled={busy || !state.pauseResumeEnabled}
              onClick={handlePauseResume}
            />
          )}
          <FloatingActionButton
            action="skip"
            label="Skip task"
            pillLabel="Skip"
            icon="skip"
            disabled={busy || !state.skipEnabled}
            onClick={() => void handleSkip()}
          />
          <FloatingActionButton
            action="done"
            label="Complete task"
            pillLabel="Done"
            icon="done"
            disabled={busy || !state.doneEnabled}
            onClick={() => void handleDone()}
          />
          <FloatingActionButton
            action="return-to-panel"
            label="Return to Focus Panel"
            pillLabel="Focus"
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
      {error || preferences.error ? (
        <div className={floating ? "floating-timer-foundation__action-error type-metadata" : "focus-panel__action-error type-metadata"} role="alert">
          {error ?? preferences.error}
        </div>
      ) : null}
    </div>
  );
}
