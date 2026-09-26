import { useEffect, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import {
  type TimerSessionPayload,
  applyTimerSessionProjection,
  connectTimerSessionProjection,
  resumeTimer,
} from "./timerSessionApi";

export function PomodoroResumePrompt() {
  const [payload, setPayload] = useState<TimerSessionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resuming, setResuming] = useState(false);

  useEffect(() => {
    let disposed = false;
    let stopListening: (() => void) | undefined;
    void connectTimerSessionProjection((incoming) => {
      if (!disposed) {
        setPayload((current) => applyTimerSessionProjection(current, incoming));
        setError(null);
      }
    })
      .then((unlisten) => {
        if (disposed) unlisten();
        else stopListening = unlisten;
      })
      .catch((failure: unknown) => {
        if (!disposed) setError(formatInvokeError(failure));
      });

    return () => {
      disposed = true;
      stopListening?.();
    };
  }, []);

  if (!payload?.awaitingResume && !error) return null;

  async function resumePomodoroWork() {
    setResuming(true);
    setError(null);
    try {
      const resumed = await resumeTimer();
      setPayload((current) => applyTimerSessionProjection(current, resumed));
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
    } finally {
      setResuming(false);
    }
  }

  return (
    <section
      className="pomodoro-resume-prompt"
      aria-label="Pomodoro resume"
      data-pomodoro-resume-prompt="true"
      role={payload?.awaitingResume ? "alert" : "status"}
    >
      {payload?.awaitingResume ? (
        <>
          <strong>Pomodoro break complete.</strong>
          <span>Resume work when you&apos;re ready.</span>
          <button type="button" disabled={resuming} onClick={() => void resumePomodoroWork()}>
            {resuming ? "Resuming…" : "Resume work"}
          </button>
        </>
      ) : null}
      {error ? <span className="pomodoro-resume-prompt__error">{error}</span> : null}
    </section>
  );
}
