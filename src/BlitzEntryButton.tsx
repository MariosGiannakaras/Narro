import { useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import { presentFocusForBlitz, startBlitz } from "./focusEntryApi";
import "./blitzEntryButton.css";

const BLITZ_BOARD_FADE_MS = 250;

async function fadeBoardBeforeFocusPresentation(): Promise<() => void> {
  const board = document.querySelector<HTMLElement>('[data-list-board="main"]');
  if (!board || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  board.dataset.blitzFocusTransition = "fading";
  await new Promise<void>((resolve) => window.setTimeout(resolve, BLITZ_BOARD_FADE_MS));

  return () => {
    if (board.dataset.blitzFocusTransition === "fading") {
      delete board.dataset.blitzFocusTransition;
    }
  };
}

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

      let restoreBoard = () => {};
      try {
        restoreBoard = await fadeBoardBeforeFocusPresentation();
        await presentFocusForBlitz();
      } catch (presentationFailure: unknown) {
        setError(
          `Focus session is active, but the Focus Panel could not be shown. ${formatInvokeError(presentationFailure)}`,
        );
      } finally {
        restoreBoard();
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
