import type { TimerMode } from "./timerSessionApi";
import { successTimingCopy } from "./focusSuccessTiming";
import { FocusCelebrationReaction } from "./FocusCelebrationReaction";
import "./focusCompletionSuccess.css";

export type FocusCompletionSuccessState = {
  completedTaskId: string;
  completedTaskTitle: string;
  estSeconds: number | null;
  timeTakenSeconds: string | null;
  /** Persisted preference sampled at the committed completion boundary. */
  funGifEnabled?: boolean;
  nextTask: { id: string; title: string; mode: TimerMode } | null;
};

type Props = {
  state: FocusCompletionSuccessState;
  pending: boolean;
  error: string | null;
  onNextTask: () => void;
  onClose: () => void;
};

function formatDuration(seconds: number | null): string {
  if (seconds === null || !Number.isSafeInteger(seconds) || seconds <= 0) return "—";
  const minutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) return `${remainder}min`;
  return remainder === 0 ? `${hours}hr` : `${hours}hr ${remainder}min`;
}

export function FocusCompletionSuccess({ state, pending, error, onNextTask, onClose }: Props) {
  const taken = state.timeTakenSeconds && /^\d+$/.test(state.timeTakenSeconds)
    ? Number(state.timeTakenSeconds)
    : null;
  const timingCopy = successTimingCopy(state.estSeconds, state.timeTakenSeconds);
  return (
    <section
      className="focus-completion-success"
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-completion-success-title"
      data-focus-completion-success="true"
      onKeyDown={(event) => {
        if (event.key !== "Escape" || pending) return;
        event.preventDefault();
        onClose();
      }}
    >
      <div className="focus-completion-success__card">
        <p className="type-metadata">Task complete</p>
        <h1 id="focus-completion-success-title">Well done!</h1>
        <p className="focus-completion-success__task">{state.completedTaskTitle}</p>
        {state.funGifEnabled === true ? (
          <FocusCelebrationReaction taskId={state.completedTaskId} />
        ) : null}
        <div className="focus-completion-success__metrics type-metadata">
          <span>EST <strong>{formatDuration(state.estSeconds)}</strong></span>
          <span>Taken <strong>{formatDuration(taken)}</strong></span>
        </div>
        {timingCopy ? (
          <p className="focus-completion-success__timing" data-focus-success-timing="true">{timingCopy}</p>
        ) : null}
        <div className="focus-completion-success__actions">
          {state.nextTask ? <button type="button" data-focus-success-action="next-task" disabled={pending} onClick={onNextTask} autoFocus>{pending ? "Starting…" : "Next Task"}</button> : null}
          <button type="button" data-focus-success-action="take-break" disabled title="The source shows this control, but its post-click timer/session behavior is not established.">Take a Break</button>
          <button type="button" data-focus-success-action="close" disabled={pending} onClick={onClose} autoFocus={!state.nextTask}>Close</button>
        </div>
        <p className="focus-completion-success__unavailable type-metadata">Take a Break is unavailable until its timer/session transition is established.</p>
        {error ? <p className="focus-completion-success__error type-metadata" role="alert">{error}</p> : null}
      </div>
    </section>
  );
}
