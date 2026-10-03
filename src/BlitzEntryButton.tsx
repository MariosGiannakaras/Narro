import { useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import { presentFocusForBlitz, startBlitz } from "./focusEntryApi";
import "./blitzEntryButton.css";

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
        await presentFocusForBlitz();
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
    <section className="blitz-entry" aria-label="Blitz entry" data-blitz-entry="today-lane">
      <button
        type="button"
        className="blitz-entry__button"
        onClick={() => void handleStart()}
        disabled={pending}
        data-start-blitz="true"
      >
        <span aria-hidden="true">🚀</span>
        <span>{pending ? "Starting Blitz…" : "Blitz now"}</span>
      </button>
      {status || error ? (
        <span
          className="blitz-entry__feedback type-metadata"
          data-error={error ? "true" : "false"}
          role={error ? "alert" : undefined}
          aria-live="polite"
          aria-atomic="true"
        >
          {error ?? status}
        </span>
      ) : null}
    </section>
  );
}
