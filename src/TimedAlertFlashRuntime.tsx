import { useEffect, useRef } from "react";
import { connectTimedAlertEffects, type TimedAlertEffectPayload } from "./timedAlertApi";
import { usePreferenceSettingsProjection } from "./usePreferenceSettingsProjection";
import "./timedAlertFlash.css";

const FLASH_DURATION_MS = 560;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FLASH_TARGET_ATTRIBUTE = "data-timed-alert-flash-task-id";
const FLASH_ACTIVE_CLASS = "timed-alert-flash--active";

export function TimedAlertFlashRuntime() {
  const { snapshot } = usePreferenceSettingsProjection();
  const settingsRef = useRef(snapshot);
  const pendingEffectRef = useRef<TimedAlertEffectPayload | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const activeTargetsRef = useRef<HTMLElement[]>([]);

  const clearFlash = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    for (const target of activeTargetsRef.current) {
      target.classList.remove(FLASH_ACTIVE_CLASS);
    }
    activeTargetsRef.current = [];
  };

  const flashEffect = (effect: TimedAlertEffectPayload) => {
    const settings = settingsRef.current;
    if (
      !settings?.alerts.timedAlertsEnabled
      || !settings.alerts.animatedTimerFlash
      || window.matchMedia(REDUCED_MOTION_QUERY).matches
    ) {
      return;
    }

    const targets = [...document.querySelectorAll<HTMLElement>(`[${FLASH_TARGET_ATTRIBUTE}]`)]
      .filter((target) => target.getAttribute(FLASH_TARGET_ATTRIBUTE) === effect.taskId);
    if (targets.length === 0) return;

    clearFlash();
    for (const target of targets) {
      target.classList.remove(FLASH_ACTIVE_CLASS);
      void target.getBoundingClientRect();
      target.classList.add(FLASH_ACTIVE_CLASS);
    }
    activeTargetsRef.current = targets;
    timeoutRef.current = window.setTimeout(clearFlash, FLASH_DURATION_MS);
  };

  useEffect(() => {
    settingsRef.current = snapshot;
    if (!snapshot?.alerts.timedAlertsEnabled || !snapshot.alerts.animatedTimerFlash) {
      clearFlash();
      pendingEffectRef.current = null;
      return;
    }

    const pending = pendingEffectRef.current;
    if (pending) {
      pendingEffectRef.current = null;
      flashEffect(pending);
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
      flashEffect(effect);
    })
      .then((unlisten) => {
        if (disposed) unlisten();
        else stopListening = unlisten;
      });

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    const handleReducedMotionChange = () => {
      if (reducedMotion.matches) clearFlash();
    };
    reducedMotion.addEventListener("change", handleReducedMotionChange);

    return () => {
      disposed = true;
      pendingEffectRef.current = null;
      stopListening?.();
      reducedMotion.removeEventListener("change", handleReducedMotionChange);
      clearFlash();
    };
  }, []);

  return null;
}
