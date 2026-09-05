import { useEffect, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import {
  type TimerSessionPayload,
  applyTimerSessionProjection,
  connectTimerSessionProjection,
  resumeTimer,
} from "./timerSessionApi";

type TimerSessionProjectionProps = {
  label: string;
  compact?: boolean;
};

export function TimerSessionProjection({ label, compact = false }: TimerSessionProjectionProps) {
  const [payload, setPayload] = useState<TimerSessionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
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
        if (disposed) {
          unlisten();
        } else {
          stopListening = unlisten;
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setError(formatInvokeError(failure));
        }
      });

    return () => {
      disposed = true;
      stopListening?.();
    };
  }, []);

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
      aria-label={`${label} authoritative timer session projection`}
      style={{
        marginTop: compact ? "0.5rem" : "1rem",
        padding: compact ? "0.5rem" : "1rem",
        background: compact ? "#222" : "#1f1f1f",
        color: "#fff",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: compact ? "1rem" : undefined }}>
        Authoritative Timer / Session Projection
      </h2>
      {payload?.awaitingResume && (
        <div role="alert" style={{ marginBottom: "0.75rem" }}>
          <div>Pomodoro break complete. Resume work when you&apos;re ready.</div>
          <button
            type="button"
            disabled={resuming}
            onClick={() => void resumePomodoroWork()}
            style={{ marginTop: "0.5rem" }}
          >
            {resuming ? "Resuming…" : "Resume work"}
          </button>
        </div>
      )}
      {error && <div style={{ color: "#ffb4b4" }}>{error}</div>}
      <pre
        style={{
          margin: 0,
          whiteSpace: "pre-wrap",
          fontSize: compact ? "0.72rem" : undefined,
        }}
      >
        {JSON.stringify(payload, null, 2)}
      </pre>
    </section>
  );
}
