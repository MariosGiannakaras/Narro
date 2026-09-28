import { listen } from "@tauri-apps/api/event";

export const TIMED_ALERT_EFFECT_EVENT_NAME = "timed-alert-effect";

export type TimedAlertEffectPayload = {
  runId: string;
  taskId: string;
  boundarySeconds: number;
  decidedAt: string;
};

export async function connectTimedAlertEffects(
  onEffect: (effect: TimedAlertEffectPayload) => void,
): Promise<() => void> {
  return listen<TimedAlertEffectPayload>(TIMED_ALERT_EFFECT_EVENT_NAME, (event) => {
    onEffect(event.payload);
  });
}
