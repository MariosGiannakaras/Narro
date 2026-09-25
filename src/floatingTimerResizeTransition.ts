export class FloatingTimerResizeRecoveryError extends Error {
  readonly code = "FLOATING_TIMER_RESIZE_RECOVERY_FAILED";
  readonly transitionFailure: unknown;
  readonly recoveryFailure: unknown;

  constructor(transitionFailure: unknown, recoveryFailure: unknown) {
    super(
      `Floating Timer resize failed and recovery also failed: ${String(recoveryFailure)}`,
    );
    this.name = "FloatingTimerResizeRecoveryError";
    this.transitionFailure = transitionFailure;
    this.recoveryFailure = recoveryFailure;
  }
}

export type FloatingTimerResizeTransitionDependencies = {
  previousExpanded: boolean;
  targetExpanded: boolean;
  prepareResize: (expanded: boolean) => Promise<void>;
  publishExpanded: (expanded: boolean) => void;
  waitForPresentedFrame: () => Promise<void>;
  revealResize: () => Promise<void>;
  rollbackResize: () => Promise<void>;
};

export async function coordinateFloatingTimerResize({
  previousExpanded,
  targetExpanded,
  prepareResize,
  publishExpanded,
  waitForPresentedFrame,
  revealResize,
  rollbackResize,
}: FloatingTimerResizeTransitionDependencies): Promise<void> {
  if (previousExpanded === targetExpanded) return;

  let preparedTarget = false;
  try {
    await prepareResize(targetExpanded);
    preparedTarget = true;
    publishExpanded(targetExpanded);
    await waitForPresentedFrame();
    await revealResize();
  } catch (transitionFailure) {
    if (!preparedTarget) throw transitionFailure;

    try {
      publishExpanded(previousExpanded);
      await waitForPresentedFrame();
      await rollbackResize();
    } catch (recoveryFailure) {
      throw new FloatingTimerResizeRecoveryError(transitionFailure, recoveryFailure);
    }

    throw transitionFailure;
  }
}
