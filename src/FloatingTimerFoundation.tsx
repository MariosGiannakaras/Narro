import { Tooltip } from "./overlayPrimitives";
import "./floatingTimerFoundation.css";

export type FloatingTimerFoundationProps = {
  onReturnToPanel: () => void;
  transitionPending?: boolean;
};

export function FloatingTimerFoundation({
  onReturnToPanel,
  transitionPending = false,
}: FloatingTimerFoundationProps) {
  return (
    <main
      className="floating-timer-foundation"
      data-floating-timer="foundation"
      aria-label="Floating Timer"
    >
      <span className="floating-timer-foundation__label type-metadata">Floating Timer</span>
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
