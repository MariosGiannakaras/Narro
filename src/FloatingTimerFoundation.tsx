import { Tooltip } from "./overlayPrimitives";
import "./floatingTimerFoundation.css";

export type FloatingTimerFoundationProps = {
  onReturnToPanel: () => void;
  transitionPending?: boolean;
  transitionError?: string | null;
};

export function FloatingTimerFoundation({
  onReturnToPanel,
  transitionPending = false,
  transitionError = null,
}: FloatingTimerFoundationProps) {
  return (
    <main
      className="floating-timer-foundation"
      data-floating-timer="foundation"
      data-tauri-drag-region="true"
      aria-label="Floating Timer"
    >
      <div className="floating-timer-foundation__status" data-tauri-drag-region="true">
        <span className="floating-timer-foundation__label type-metadata" data-tauri-drag-region="true">Floating Timer</span>
        {transitionError ? (
          <span
            className="floating-timer-foundation__error type-metadata"
            role="alert"
            data-tauri-drag-region="true"
          >
            {transitionError}
          </span>
        ) : null}
      </div>
      <Tooltip content="Return to Focus Panel">
        <button
          type="button"
          className="floating-timer-foundation__return"
          aria-label="Return to Focus Panel"
          data-floating-return-to-panel="true"
          disabled={transitionPending}
          onClick={onReturnToPanel}
        >
          ↗
        </button>
      </Tooltip>
    </main>
  );
}
