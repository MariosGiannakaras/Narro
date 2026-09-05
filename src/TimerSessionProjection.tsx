import { useEffect, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import {
  type TimerSessionPayload,
  applyTimerSessionProjection,
  connectTimerSessionProjection,
} from "./timerSessionApi";

type TimerSessionProjectionProps = {
  label: string;
  compact?: boolean;
};

export function TimerSessionProjection({ label, compact = false }: TimerSessionProjectionProps) {
  const [payload, setPayload] = useState<TimerSessionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

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
