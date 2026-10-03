import { useEffect, useRef } from "react";
import {
  DEFAULT_TASK_ALERT_SOUND,
  playLocalSound,
  stopLocalSoundPlayback,
} from "./localSoundCatalog";
import { connectTimedAlertEffects, type TimedAlertEffectPayload } from "./timedAlertApi";
import { usePreferenceSettingsProjection } from "./usePreferenceSettingsProjection";

export function TimedAlertSoundRuntime() {
  const { snapshot } = usePreferenceSettingsProjection();
  const settingsRef = useRef(snapshot);
  const pendingEffectRef = useRef<TimedAlertEffectPayload | null>(null);

  const playEffect = (effect: TimedAlertEffectPayload) => {
    const settings = settingsRef.current;
    if (!settings?.alerts.timedAlertsEnabled) return;

    const soundId = settings.alerts.taskAlertSound ?? DEFAULT_TASK_ALERT_SOUND;
    void playLocalSound(soundId, settings.alerts.taskAlertVolumePercent).catch((error: unknown) => {
      console.warn(`Timed alert sound could not play for task ${effect.taskId}.`, error);
    });
  };

  useEffect(() => {
    settingsRef.current = snapshot;
    if (!snapshot?.alerts.timedAlertsEnabled) {
      pendingEffectRef.current = null;
      stopLocalSoundPlayback();
      return;
    }

    const pending = pendingEffectRef.current;
    if (pending) {
      pendingEffectRef.current = null;
      playEffect(pending);
    }
  }, [snapshot]);

  useEffect(() => {
    let disposed = false;
    let stopListening: (() => void) | undefined;

    void connectTimedAlertEffects((effect) => {
      if (disposed) return;
      if (settingsRef.current === null) {
        pendingEffectRef.current = effect;
        return;
      }
      playEffect(effect);
    })
      .then((unlisten) => {
        if (disposed) unlisten();
        else stopListening = unlisten;
      });

    return () => {
      disposed = true;
      pendingEffectRef.current = null;
      stopListening?.();
      stopLocalSoundPlayback();
    };
  }, []);

  return null;
}
