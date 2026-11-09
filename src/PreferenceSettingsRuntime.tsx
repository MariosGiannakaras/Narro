import { listen } from "@tauri-apps/api/event";
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
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
  | "timerPositionRestart"
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
  | "successSoundEnabled"
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
  retryInitialLoad: () => void;
};

const PreferenceSettingsRuntimeContext = createContext<PreferenceSettingsRuntimeValue | null>(null);

export function PreferenceSettingsRuntimeProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<PreferenceSettingsSnapshot | null>(null);
  const [monitors, setMonitors] = useState<MonitorDescriptor[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingKey, setPendingKey] = useState<PreferencePendingKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  // Synchronous admission owner: React pendingKey only publishes on a later render.
  const saveInFlightRef = useRef(false);
  const initialReadInFlightRef = useRef(false);
  // Delayed initial reads cannot override newer committed cross-window events.
  const snapshotRevisionRef = useRef(0);
  // Async saves/readbacks must not publish into a disposed provider.
  const mountedRef = useRef(true);

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
    mountedRef.current = true;
    let stopListening: (() => void) | undefined;
    const readStartRevision = snapshotRevisionRef.current;

    void listen<PreferenceSettingsSnapshot>(PREFERENCES_CHANGED_EVENT, (event) => {
      if (!disposed) {
        snapshotRevisionRef.current += 1;
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
        if (snapshotRevisionRef.current === readStartRevision) {
          setSnapshot(settings);
        }
        setMonitors(monitorList);
        setError(null);
      })
      .catch((failure: unknown) => {
        if (!disposed) setError(formatInvokeError(failure));
      })
      .finally(() => {
        if (!disposed) {
          initialReadInFlightRef.current = false;
          setLoading(false);
        }
      });

    return () => {
      disposed = true;
      mountedRef.current = false;
      stopListening?.();
    };
  }, [loadAttempt]);

  const retryInitialLoad = () => {
    if (loading || snapshot !== null || !error || saveInFlightRef.current || initialReadInFlightRef.current) return;
    initialReadInFlightRef.current = true;
    setError(null);
    setLoading(true);
    setLoadAttempt((attempt) => attempt + 1);
  };

  const save = async (patch: PreferenceSettingsPatch, key: PreferencePendingKey) => {
    if (saveInFlightRef.current) return false;
    saveInFlightRef.current = true;
    const revisionAtStart = snapshotRevisionRef.current;
    setPendingKey(key);
    setError(null);
    try {
      const committed = await updatePreferenceSettings(patch);
      if (!mountedRef.current) return true;
      if (snapshotRevisionRef.current === revisionAtStart) {
        // A successful response can own the view when no newer cross-window
        // publication arrived. Invalidate an older in-flight initial read.
        snapshotRevisionRef.current += 1;
        setSnapshot(committed);
      } else {
        // An intervening event may precede OR follow our own committed write.
        // Do not guess which payload is latest from IPC completion order:
        // re-read the authoritative persisted snapshot *after* our write.
        const readRevision = snapshotRevisionRef.current;
        try {
          const latest = await getPreferenceSettings();
          if (mountedRef.current && snapshotRevisionRef.current === readRevision) {
            snapshotRevisionRef.current += 1;
            setSnapshot(latest);
          }
        } catch (refreshFailure: unknown) {
          if (mountedRef.current) {
            setError(`Preferences saved; refresh failed: ${formatInvokeError(refreshFailure)}`);
          }
        }
      }
      return true;
    } catch (failure: unknown) {
      if (!mountedRef.current) return false;
      setError(formatInvokeError(failure));
      // A partial native commit can reject after broadcasting its new value.
      // A recovery read must never override a newer event delivered mid-read.
      const readRevision = snapshotRevisionRef.current;
      try {
        const latest = await getPreferenceSettings();
        if (mountedRef.current && snapshotRevisionRef.current === readRevision) {
          snapshotRevisionRef.current += 1;
          setSnapshot(latest);
        }
      } catch (refreshFailure: unknown) {
        if (mountedRef.current) {
          setError(
            `${formatInvokeError(failure)} | Preferences refresh failed: ${formatInvokeError(refreshFailure)}`,
          );
        }
      }
      return false;
    } finally {
      saveInFlightRef.current = false;
      if (mountedRef.current) setPendingKey(null);
    }
  };

  return (
    <PreferenceSettingsRuntimeContext.Provider
      value={{ snapshot, monitors, loading, pendingKey, error, save, refreshMonitors, retryInitialLoad }}
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
