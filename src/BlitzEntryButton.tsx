import { useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import { presentFocusPanel, startBlitz } from "./focusEntryApi";

export function BlitzEntryButton() {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (pending) return;
    setPending(true);
    setStatus("");
    setError(null);

    try {
      const outcome = await startBlitz();
      if (outcome.status === "no_eligible_today_tasks") {
        setStatus("No eligible Today task is ready yet.");
        return;
      }

      const committedStatus = outcome.status === "started"
        ? "Blitz started."
        : "Blitz is already active.";
      setStatus(committedStatus);

      try {
        await presentFocusPanel();
      } catch (presentationFailure: unknown) {
        setError(
          `Focus session is active, but the Focus Panel could not be shown. ${formatInvokeError(presentationFailure)}`,
        );
      }
    } catch (failure: unknown) {
      setError(`Blitz could not start. ${formatInvokeError(failure)}`);
    } finally {
      setPending(false);
    }
  };

  return (
    <section
      aria-label="Blitz entry"
      data-blitz-entry="true"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.75rem 1rem",
        borderTop: "1px solid var(--color-border-subtle)",
        background: "var(--color-surface-raised)",
      }}
    >
      <button
        type="button"
        onClick={() => void handleStart()}
        disabled={pending}
        data-start-blitz="true"
      >
        {pending ? "Starting Blitz…" : "Blitz now"}
      </button>
      <span className="type-metadata" aria-live="polite" aria-atomic="true">
        {status}
      </span>
      {error ? (
        <span className="type-metadata" role="alert" style={{ color: "var(--color-destructive)" }}>
          {error}
        </span>
      ) : null}
    </section>
  );
}
