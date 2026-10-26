import { FocusPresentationRecoveryError } from "./focusPresentationTransition.ts";

export type TimerPresentation = "timerCompact" | "timerExpanded";

export interface ProtectedTimerResize {
  previous: TimerPresentation;
  target: TimerPresentation;
  protectOutgoing: (target: TimerPresentation) => Promise<number>;
  prepareRenderer: (presentation: TimerPresentation) => void;
  waitForPaint: () => Promise<void>;
  animate: (target: TimerPresentation, token: number) => Promise<void>;
  publish: (presentation: TimerPresentation) => void;
  restoreNative: (token: number) => Promise<void>;
  release: (token: number) => Promise<void>;
}

/** Protect before changing renderer geometry, including during recovery.
 * Paint/capture receipts are ordering barriers, not proof of physical pixels.
 */
export async function commitProtectedTimerResize(ops: ProtectedTimerResize): Promise<boolean> {
  if (ops.previous === ops.target) return false;
  // A failed acquisition owns no lease and must not mutate either presentation.
  const token = await ops.protectOutgoing(ops.target);
  try {
    ops.prepareRenderer(ops.target);
    await ops.waitForPaint();
    await ops.animate(ops.target, token);
    ops.publish(ops.target);
    await ops.waitForPaint();
    await ops.release(token);
    return true;
  } catch (failure) {
    try {
      ops.prepareRenderer(ops.previous);
      await ops.waitForPaint();
      await ops.restoreNative(token);
      ops.publish(ops.previous);
      await ops.waitForPaint();
      await ops.release(token);
    } catch (recoveryFailure) {
      // The native lease/watchdog retains cleanup responsibility on failure.
      throw new FocusPresentationRecoveryError(failure, recoveryFailure);
    }
    throw failure;
  }
}
