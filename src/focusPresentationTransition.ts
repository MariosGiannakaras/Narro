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
  commitRendererPresentation: (presentation: TPresentation) => void;
};

/**
 * Commits a presentation that has already been mounted/prepared by the caller.
 *
 * Ordering is intentionally strict:
 * 1. wait until the target subtree has painted,
 * 2. commit native region/position/window attributes,
 * 3. transfer renderer interaction ownership.
 *
 * Native commands own rollback when their own transaction fails. If the native
 * commit succeeds but renderer publication throws, this helper explicitly
 * restores the previous native presentation before surfacing the failure.
 */
export async function commitPreparedFocusPresentation<TPresentation extends string>({
  previousPresentation,
  targetPresentation,
  waitForTargetReady,
  beforeNativeCommit,
  applyNativePresentation,
  afterNativeCommit,
  commitRendererPresentation,
}: PreparedFocusPresentationTransition<TPresentation>): Promise<boolean> {
  if (previousPresentation === targetPresentation) return false;

  await waitForTargetReady();
  await beforeNativeCommit?.();
  await applyNativePresentation(targetPresentation);

  try {
    await afterNativeCommit?.();
    commitRendererPresentation(targetPresentation);
    return true;
  } catch (transitionFailure) {
    try {
      await applyNativePresentation(previousPresentation);
      commitRendererPresentation(previousPresentation);
    } catch (recoveryFailure) {
      throw new FocusPresentationRecoveryError(transitionFailure, recoveryFailure);
    }
    throw transitionFailure;
  }
}
