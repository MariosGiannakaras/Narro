import { connectTimedAlertEffects, type TimedAlertEffectPayload } from "./timedAlertApi";

/**
 * A Tauri listener can fail to register while the native event bridge is
 * starting or unavailable. Reconnect only a finite number of times; never
 * establish a renderer polling loop or duplicate a native timed-alert owner.
 *
 * The returned disposer synchronously cancels retries and will unlisten even
 * if the original registration resolves after the component unmounts.
 */
export const TIMED_ALERT_LISTENER_RETRY_DELAYS_MS = [250, 750] as const;

export function connectTimedAlertEffectsWithRecovery(
  onEffect: (effect: TimedAlertEffectPayload) => void,
  onRegistrationFailure: (error: unknown) => void,
): () => void {
  let disposed = false;
  let unlisten: (() => void) | null = null;
  let pendingRetry: ReturnType<typeof setTimeout> | null = null;
  let nextRetryIndex = 0;

  const attach = () => {
    void connectTimedAlertEffects((effect) => {
      if (!disposed) onEffect(effect);
    }).then((stop) => {
      if (disposed) stop();
      else unlisten = stop;
    }).catch((error: unknown) => {
      if (disposed) return;
      const delay = TIMED_ALERT_LISTENER_RETRY_DELAYS_MS[nextRetryIndex];
      if (delay === undefined) {
        onRegistrationFailure(error);
        return;
      }
      nextRetryIndex += 1;
      pendingRetry = globalThis.setTimeout(() => {
        pendingRetry = null;
        if (!disposed) attach();
      }, delay);
    });
  };

  attach();
  return () => {
    if (disposed) return;
    disposed = true;
    if (pendingRetry !== null) globalThis.clearTimeout(pendingRetry);
    unlisten?.();
    unlisten = null;
  };
}
