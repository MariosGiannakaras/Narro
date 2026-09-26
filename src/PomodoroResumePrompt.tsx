import { useEffect, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import {
  applyTimerSessionProjection,
  connectTimerSessionProjection,
  resumeTimer,
  type TimerSessionPayload,
} from "./timerSessionApi";
import "./pomodoroResumePrompt.css";

export function PomodoroResumePrompt() {
  const [payload, setPayload] = useState<TimerSessionPayload | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resuming, setResuming] = useState(false);

  useEffect(() => {
    let disposed = false;
    let stopListening: (() => void) | undefined;

    void connectTimerSessionProjection((incoming) => {
      if (!disposed) {
        setPayload((current) => applyTimerSessionProjection(current, incoming));
      }
    })
      .then((unlisten) => {
        if (disposed) unlisten();
        else stopListening = unlisten;
      })
      .catch(() => {
        // Normal Main stays free of diagnostic runtime output. If the projection
        // cannot connect, no user-facing resume action can be offered safely.
      });

    return () => {
      disposed = true;
      stopListening?.();
    };
  }, []);

  if (!payload?.awaitingResume) return null;

  async function resumeWork() {
    if (resuming) return;
    setResuming(true);
    setResumeError(null);
    try {
      const resumed = await resumeTimer();
      setPayload((current) => applyTimerSessionProjection(current, resumed));
    } catch (failure: unknown) {
      setResumeError(formatInvokeError(failure));
    } finally {
      setResuming(false);
    }
  }

  return (
    <aside
      className="pomodoro-resume-prompt"
      data-pomodoro-resume-prompt="true"
      role="alert"
      aria-live="assertive"
    >
      <div>
        <strong>Pomodoro break complete</strong>
        <span>Resume work when you&apos;re ready.</span>
      </div>
      {resumeError ? (
        <span className="pomodoro-resume-prompt__error">{resumeError}</span>
      ) : null}
      <button
        type="button"
        className="pomodoro-resume-prompt__action motion-interactive"
        disabled={resuming}
        onClick={() => void resumeWork()}
      >
        {resuming ? "Resuming…" : "Resume work"}
      </button>
    </aside>
  );
}
