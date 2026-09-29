export class FocusPresentationRecoveryError extends Error {
  readonly transitionFailure: unknown;
  readonly recoveryFailure: unknown;

  constructor(transitionFailure: unknown, recoveryFailure: unknown) {
    super(`Focus presentation committed natively but renderer recovery failed: ${String(recoveryFailure)}`);
    this.name = "FocusPresentationRecoveryError";
    this.transitionFailure = transitionFailure;
    this.recoveryFailure = recoveryFailure;
  }
}

export type PreparedFocusPresentationTransition<TPresentation extends string> = {
  previousPresentation: TPresentation;
  targetPresentation: TPresentation;
  waitForTargetReady: () => Promise<void>;
  beforeNativeCommit?: () => Promise<void>;
  applyNativePresentation: (presentation: TPresentation) => Promise<void>;
  afterNativeCommit?: () => Promise<void>;
  animateNativePresentation?: (presentation: TPresentation) => Promise<void>;
  runConcurrentMotion?: () => Promise<void>;
  commitRendererPresentation: (presentation: TPresentation) => void;
};

async function restorePreviousPresentation<TPresentation extends string>(
  previousPresentation: TPresentation,
  transitionFailure: unknown,
  applyNativePresentation: (presentation: TPresentation) => Promise<void>,
  commitRendererPresentation: (presentation: TPresentation) => void,
): Promise<never> {
  try {
    await applyNativePresentation(previousPresentation);
    commitRendererPresentation(previousPresentation);
  } catch (recoveryFailure) {
    throw new FocusPresentationRecoveryError(transitionFailure, recoveryFailure);
  }
  throw transitionFailure;
}

/**
 * Commits a presentation that has already been mounted/prepared by the caller.
 *
 * Standard path:
 * 1. wait until the target subtree has painted,
 * 2. commit native region/position/window attributes,
 * 3. transfer renderer interaction ownership.
 *
 * Panel/Timer mode changes can instead provide an animated native commit and
 * renderer motion. Those run concurrently so the one persistent HWND moves
 * with the same finite geometry transition rather than teleporting afterward.
 *
 * Native commands own rollback when their own transaction fails. If concurrent
 * renderer motion fails after/during an animated native commit, or renderer
 * publication fails after native success, this helper restores the previous
 * native and renderer presentation before surfacing the failure.
 */
export async function commitPreparedFocusPresentation<TPresentation extends string>({
  previousPresentation,
  targetPresentation,
  waitForTargetReady,
  beforeNativeCommit,
  applyNativePresentation,
  afterNativeCommit,
  animateNativePresentation,
  runConcurrentMotion,
  commitRendererPresentation,
}: PreparedFocusPresentationTransition<TPresentation>): Promise<boolean> {
  if (previousPresentation === targetPresentation) return false;

  await waitForTargetReady();

  if (animateNativePresentation && runConcurrentMotion) {
    try {
      await Promise.all([
        animateNativePresentation(targetPresentation),
        runConcurrentMotion(),
      ]);
    } catch (transitionFailure) {
      return restorePreviousPresentation(
        previousPresentation,
        transitionFailure,
        applyNativePresentation,
        commitRendererPresentation,
      );
    }

    try {
      commitRendererPresentation(targetPresentation);
      return true;
    } catch (transitionFailure) {
      return restorePreviousPresentation(
        previousPresentation,
        transitionFailure,
        applyNativePresentation,
        commitRendererPresentation,
      );
    }
  }

  await beforeNativeCommit?.();
  await applyNativePresentation(targetPresentation);

  try {
    await afterNativeCommit?.();
    commitRendererPresentation(targetPresentation);
    return true;
  } catch (transitionFailure) {
    return restorePreviousPresentation(
      previousPresentation,
      transitionFailure,
      applyNativePresentation,
      commitRendererPresentation,
    );
  }
}
