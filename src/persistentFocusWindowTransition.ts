import type { FocusSurfaceMode } from "./focusSurfaceModeApi";

export class PersistentFocusWindowRecoveryError extends Error {
  readonly transitionFailure: unknown;
  readonly recoveryFailure: unknown;

  constructor(transitionFailure: unknown, recoveryFailure: unknown) {
    super(`Focus window transition and recovery failed: ${String(recoveryFailure)}`);
    this.name = "PersistentFocusWindowRecoveryError";
    this.transitionFailure = transitionFailure;
    this.recoveryFailure = recoveryFailure;
  }
}

export type PersistentFocusWindowTransition = {
  previousMode: FocusSurfaceMode;
  targetMode: FocusSurfaceMode;
  prepareMode: (mode: FocusSurfaceMode) => Promise<void>;
  waitForModeReady: (mode: FocusSurfaceMode) => Promise<void>;
  revealMode: (mode: FocusSurfaceMode) => Promise<void>;
  restoreMode: (mode: FocusSurfaceMode) => Promise<void>;
};

export async function switchPersistentFocusWindows({
  previousMode,
  targetMode,
  prepareMode,
  waitForModeReady,
  revealMode,
  restoreMode,
}: PersistentFocusWindowTransition): Promise<void> {
  if (previousMode === targetMode) return;
  try {
    await prepareMode(targetMode);
    await waitForModeReady(targetMode);
    await revealMode(targetMode);
  } catch (transitionFailure) {
    try {
      await restoreMode(previousMode);
    } catch (recoveryFailure) {
      throw new PersistentFocusWindowRecoveryError(transitionFailure, recoveryFailure);
    }
    throw transitionFailure;
  }
}
