import type { FocusSurfaceMode } from "./focusSurfaceModeApi";

export class FocusModeTransitionCancelledError extends Error {
  readonly code = "FOCUS_SURFACE_TRANSITION_CANCELLED";

  constructor() {
    super("Focus surface transition was cancelled");
    this.name = "FocusModeTransitionCancelledError";
  }
}

export class FocusModeTransitionRecoveryError extends Error {
  readonly code = "FOCUS_SURFACE_TRANSITION_RECOVERY_FAILED";
  readonly transitionFailure: unknown;
  readonly recoveryFailure: unknown;

  constructor(transitionFailure: unknown, recoveryFailure: unknown) {
    super(
      `Focus surface transition failed and recovery also failed: ${String(recoveryFailure)}`,
    );
    this.name = "FocusModeTransitionRecoveryError";
    this.transitionFailure = transitionFailure;
    this.recoveryFailure = recoveryFailure;
  }
}

export type FocusModeTransitionDependencies = {
  previousMode: FocusSurfaceMode;
  targetMode: FocusSurfaceMode;
  prepareMode: (mode: FocusSurfaceMode) => Promise<void>;
  publishMode: (mode: FocusSurfaceMode) => void;
  waitForPresentedFrame: () => Promise<void>;
  revealMode: (mode: FocusSurfaceMode) => Promise<void>;
  isCancelled?: () => boolean;
};

function cancellationFailure(isCancelled?: () => boolean): FocusModeTransitionCancelledError | null {
  return isCancelled?.() ? new FocusModeTransitionCancelledError() : null;
}

export async function coordinateFocusModeTransition({
  previousMode,
  targetMode,
  prepareMode,
  publishMode,
  waitForPresentedFrame,
  revealMode,
  isCancelled,
}: FocusModeTransitionDependencies): Promise<void> {
  if (previousMode === targetMode) return;

  const beforeStartCancellation = cancellationFailure(isCancelled);
  if (beforeStartCancellation) throw beforeStartCancellation;

  let preparedTarget = false;
  try {
    await prepareMode(targetMode);
    preparedTarget = true;

    const afterPrepareCancellation = cancellationFailure(isCancelled);
    if (afterPrepareCancellation) throw afterPrepareCancellation;

    publishMode(targetMode);
    await waitForPresentedFrame();

    const beforeRevealCancellation = cancellationFailure(isCancelled);
    if (beforeRevealCancellation) throw beforeRevealCancellation;

    await revealMode(targetMode);
  } catch (transitionFailure) {
    if (!preparedTarget) throw transitionFailure;

    try {
      await prepareMode(previousMode);
      publishMode(previousMode);
      await waitForPresentedFrame();
      await revealMode(previousMode);
    } catch (recoveryFailure) {
      throw new FocusModeTransitionRecoveryError(transitionFailure, recoveryFailure);
    }

    throw transitionFailure;
  }
}
