import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import {
  getPreferenceSettings,
  PREFERENCES_CHANGED_EVENT,
  type PreferenceSettingsSnapshot,
} from "./preferencesApi";

export function usePreferenceSettingsProjection(disabled = false) {
  const [snapshot, setSnapshot] = useState<PreferenceSettingsSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settled, setSettled] = useState(disabled);

  useEffect(() => {
    if (disabled) {
      setSnapshot(null);
      setError(null);
      setSettled(true);
      return;
    }

    let disposed = false;
    let stopListening: (() => void) | undefined;
    let observedEvent = false;
    setSettled(false);

    void listen<PreferenceSettingsSnapshot>(PREFERENCES_CHANGED_EVENT, (event) => {
      if (disposed) return;
      observedEvent = true;
      setSnapshot(event.payload);
      setError(null);
      setSettled(true);
    })
      .then((unlisten) => {
        if (disposed) unlisten();
        else stopListening = unlisten;
      })
      .catch((failure: unknown) => {
        if (!disposed) setError(formatInvokeError(failure));
      });

    void getPreferenceSettings()
      .then((payload) => {
        if (!disposed && !observedEvent) {
          setSnapshot(payload);
          setError(null);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) setError(formatInvokeError(failure));
      })
      .finally(() => {
        if (!disposed) setSettled(true);
      });

    return () => {
      disposed = true;
      stopListening?.();
    };
  }, [disabled]);

  return { snapshot, error, settled };
}
