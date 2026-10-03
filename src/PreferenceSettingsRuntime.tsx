import { listen } from "@tauri-apps/api/event";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { formatInvokeError, type MonitorDescriptor } from "./diagnosticApi";
import {
  getPreferenceSettings,
  listPreferenceMonitors,
  PREFERENCES_CHANGED_EVENT,
  type PreferenceSettingsPatch,
  type PreferenceSettingsSnapshot,
  updatePreferenceSettings,
} from "./preferencesApi";

export type PreferencePendingKey =
  | "monitor"
  | "side"
  | "openOnLogin"
  | "hideTaskTimes"
  | "autoParseEst"
  | "timezone"
  | "pomodoro"
  | "pomodoroWork"
  | "pomodoroBreak"
  | "defaultBreak"
  | "scrollingTitle"
  | "timedAlerts"
  | "taskAlertInterval"
  | "taskAlertSound"
  | "taskAlertVolume"
  | "timerFlash"
  | "notificationAlerts"
  | "notificationSound"
  | "notificationVolume"
  | "scheduleReminders"
  | "reminderLead"
  | "successScreen"
  | "funGif"
  | "successSound"
  | "successSoundVolume";

type PreferenceSettingsRuntimeValue = {
  snapshot: PreferenceSettingsSnapshot | null;
  monitors: MonitorDescriptor[];
  loading: boolean;
  pendingKey: PreferencePendingKey | null;
  error: string | null;
  save: (patch: PreferenceSettingsPatch, key: PreferencePendingKey) => Promise<boolean>;
  refreshMonitors: () => Promise<void>;
};

const PreferenceSettingsRuntimeContext = createContext<PreferenceSettingsRuntimeValue | null>(null);

export function PreferenceSettingsRuntimeProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<PreferenceSettingsSnapshot | null>(null);
  const [monitors, setMonitors] = useState<MonitorDescriptor[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingKey, setPendingKey] = useState<PreferencePendingKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshMonitors = async () => {
    try {
      const next = await listPreferenceMonitors();
      setMonitors(next);
      setError(null);
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
    }
  };

  useEffect(() => {
    let disposed = false;
    let stopListening: (() => void) | undefined;

    void listen<PreferenceSettingsSnapshot>(PREFERENCES_CHANGED_EVENT, (event) => {
      if (!disposed) {
        setSnapshot(event.payload);
        setError(null);
      }
    })
      .then((unlisten) => {
        if (disposed) unlisten();
        else stopListening = unlisten;
      })
      .catch((failure: unknown) => {
        if (!disposed) setError(formatInvokeError(failure));
      });

    void Promise.all([getPreferenceSettings(), listPreferenceMonitors()])
      .then(([settings, monitorList]) => {
        if (disposed) return;
        setSnapshot(settings);
        setMonitors(monitorList);
        setError(null);
      })
      .catch((failure: unknown) => {
        if (!disposed) setError(formatInvokeError(failure));
      })
      .finally(() => {
        if (!disposed) setLoading(false);
      });

    return () => {
      disposed = true;
      stopListening?.();
    };
  }, []);

  const save = async (patch: PreferenceSettingsPatch, key: PreferencePendingKey) => {
    if (pendingKey) return false;
    setPendingKey(key);
    setError(null);
    try {
      const committed = await updatePreferenceSettings(patch);
      setSnapshot(committed);
      return true;
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
      try {
        setSnapshot(await getPreferenceSettings());
      } catch (refreshFailure: unknown) {
        setError(
          `${formatInvokeError(failure)} | Preferences refresh failed: ${formatInvokeError(refreshFailure)}`,
        );
      }
      return false;
    } finally {
      setPendingKey(null);
    }
  };

  return (
    <PreferenceSettingsRuntimeContext.Provider
      value={{ snapshot, monitors, loading, pendingKey, error, save, refreshMonitors }}
    >
      {children}
    </PreferenceSettingsRuntimeContext.Provider>
  );
}

export function usePreferenceSettingsRuntime(): PreferenceSettingsRuntimeValue {
  const value = useContext(PreferenceSettingsRuntimeContext);
  if (!value) throw new Error("usePreferenceSettingsRuntime must be used inside PreferenceSettingsRuntimeProvider");
  return value;
}
