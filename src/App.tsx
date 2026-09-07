import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import { AppShell } from "./AppShell";
import {
  type AppStatePayload,
  type DiagnosticCommand,
  type FocusPanelSide,
  type MonitorDescriptor,
  type ShortcutCommand,
  type ShortcutDiagnostics,
  applyNewerShortcutDiagnostics,
  applyNewerState,
  findSelectedMonitor,
  formatInvokeError,
  formatMonitorLabel,
  isCommandErrorPayload,
  isValidMonitorSelection,
} from "./diagnosticApi";

type StateCommand = "mutate_state" | "toggle_timer";

type NotificationTestResult = {
  title: string;
  body: string;
  submitted: boolean;
};

type ReminderAcceptanceProbeResult = {
  listId: string;
  taskId: string;
  reminderId: string;
  remindLocalDate: string;
  remindLocalTime: string;
  timezone: string;
  notificationTitle: string;
  notificationBody: string;
};

type AutostartStatus = {
  enabled: boolean;
  changed: boolean;
};

const REMINDER_ACCEPTANCE_DELAY_MS = 2 * 60 * 1000;

function twoDigits(value: number): string {
  return value.toString().padStart(2, "0");
}

function localReminderParts(value: Date): { localDate: string; localTime: string } {
  return {
    localDate: `${value.getFullYear()}-${twoDigits(value.getMonth() + 1)}-${twoDigits(value.getDate())}`,
    localTime: `${twoDigits(value.getHours())}:${twoDigits(value.getMinutes())}`,
  };
}

function App() {
  const [state, setState] = useState<AppStatePayload | null>(null);
  const [shortcutDiagnostics, setShortcutDiagnostics] = useState<ShortcutDiagnostics | null>(null);
  const [shortcutProbeStatus, setShortcutProbeStatus] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const [reminderAcceptanceStatus, setReminderAcceptanceStatus] = useState<string | null>(null);
  const [autostartStatus, setAutostartStatus] = useState<AutostartStatus | null>(null);
  const [windows, setWindows] = useState<string[]>([]);
  const [monitors, setMonitors] = useState<MonitorDescriptor[]>([]);
  const [selectedMonitorKey, setSelectedMonitorKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const diagnosticMode = new URLSearchParams(window.location.search).get("diagnostics") === "1";

  async function refreshWindows() {
    try {
      const labels = await invoke<string[]>("list_windows");
      setWindows(labels);
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
    }
  }

  async function refreshShortcutDiagnostics() {
    try {
      const payload = await invoke<ShortcutDiagnostics>("global_shortcut_status");
      setShortcutDiagnostics((current) => applyNewerShortcutDiagnostics(current, payload));
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
    }
  }

  function applyMonitorList(discovered: MonitorDescriptor[]) {
    setMonitors(discovered);
    setSelectedMonitorKey((current) =>
      isValidMonitorSelection(current, discovered) ? current : discovered[0]?.key ?? null,
    );
  }

  function clearMonitorList() {
    setMonitors([]);
    setSelectedMonitorKey(null);
  }

  async function fetchAndApplyMonitors() {
    const discovered = await invoke<MonitorDescriptor[]>("list_monitors");
    applyMonitorList(discovered);
    return discovered;
  }

  async function refreshMonitors() {
    try {
      await fetchAndApplyMonitors();
      setError(null);
    } catch (failure: unknown) {
      clearMonitorList();
      setError(formatInvokeError(failure));
    }
  }

  useEffect(() => {
    let disposed = false;
    let stopStateListening: (() => void) | undefined;
    let stopShortcutListening: (() => void) | undefined;

    void listen<AppStatePayload>("state-changed", (event) => {
      if (!disposed) {
        setState((current) => applyNewerState(current, event.payload));
      }
    })
      .then((unlisten) => {
        if (disposed) {
          unlisten();
        } else {
          stopStateListening = unlisten;
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setError(formatInvokeError(failure));
        }
      });

    void invoke<AppStatePayload>("get_state")
      .then((payload) => {
        if (!disposed) {
          setState((current) => applyNewerState(current, payload));
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setError(formatInvokeError(failure));
        }
      });

    if (diagnosticMode) {
      void listen<ShortcutDiagnostics>("shortcut-diagnostic-changed", (event) => {
        if (!disposed) {
          setShortcutDiagnostics((current) =>
            applyNewerShortcutDiagnostics(current, event.payload),
          );
        }
      })
        .then((unlisten) => {
          if (disposed) {
            unlisten();
          } else {
            stopShortcutListening = unlisten;
          }
        })
        .catch((failure: unknown) => {
          if (!disposed) {
            setError(formatInvokeError(failure));
          }
        });

      void invoke<ShortcutDiagnostics>("global_shortcut_status")
        .then((payload) => {
          if (!disposed) {
            setShortcutDiagnostics((current) =>
              applyNewerShortcutDiagnostics(current, payload),
            );
          }
        })
        .catch((failure: unknown) => {
          if (!disposed) {
            setError(formatInvokeError(failure));
          }
        });

      void refreshAutostartStatus();
      void refreshWindows();
      void refreshMonitors();
    }

    return () => {
      disposed = true;
      stopStateListening?.();
      stopShortcutListening?.();
    };
  }, [diagnosticMode]);

  async function runStateCommand(command: StateCommand) {
    try {
      const payload = await invoke<AppStatePayload>(command);
      setState((current) => applyNewerState(current, payload));
      setError(null);
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
    }
  }

  async function runShortcutCommand(command: ShortcutCommand) {
    try {
      const payload = await invoke<ShortcutDiagnostics>(command);
      setShortcutDiagnostics((current) => applyNewerShortcutDiagnostics(current, payload));
      setShortcutProbeStatus(null);
      setError(null);
    } catch (failure: unknown) {
      setShortcutProbeStatus(null);
      setError(formatInvokeError(failure));
      await refreshShortcutDiagnostics();
    }
  }

  async function runShortcutConflictProbe() {
    try {
      await invoke<void>("global_shortcut_conflict_probe");
      setShortcutProbeStatus(
        "Unexpected result: duplicate registration did not report the expected conflict.",
      );
      setError(null);
    } catch (failure: unknown) {
      await refreshShortcutDiagnostics();
      if (isCommandErrorPayload(failure) && failure.code === "SHORTCUT_CONFLICT") {
        setShortcutProbeStatus(
          "PASS: deterministic duplicate registration returned SHORTCUT_CONFLICT.",
        );
        setError(null);
        return;
      }

      setShortcutProbeStatus(null);
      setError(formatInvokeError(failure));
    }
  }

  async function sendTestNotification() {
    try {
      const result = await invoke<NotificationTestResult>("send_test_notification");
      setNotificationStatus(
        result.submitted
          ? `Submitted to Windows: ${result.title} — ${result.body}`
          : "Unexpected result: notification command returned without a submitted notification.",
      );
      setError(null);
    } catch (failure: unknown) {
      setNotificationStatus(null);
      setError(formatInvokeError(failure));
    }
  }

  async function scheduleReminderAcceptanceProbe() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timezone) {
      setReminderAcceptanceStatus(null);
      setError(
        "[REMINDER_TIMEZONE_UNAVAILABLE] WebView2 did not expose a local IANA timezone for the acceptance probe.",
      );
      return;
    }

    const due = new Date(Date.now() + REMINDER_ACCEPTANCE_DELAY_MS);
    const { localDate, localTime } = localReminderParts(due);

    try {
      const result = await invoke<ReminderAcceptanceProbeResult>(
        "schedule_reminder_acceptance_probe",
        { localDate, localTime, timezone },
      );
      setReminderAcceptanceStatus(
        `Persisted real reminder ${result.reminderId} for ${result.remindLocalDate} ${result.remindLocalTime} ${result.timezone}. Expected exactly one Windows notification: “${result.notificationTitle}” — “${result.notificationBody}”. Hide or close Main and leave Narro running in the tray/background; allow up to 30 seconds after the due minute for the background poll.`,
      );
      setError(null);
    } catch (failure: unknown) {
      setReminderAcceptanceStatus(null);
      setError(formatInvokeError(failure));
    }
  }

  async function refreshAutostartStatus() {
    try {
      const result = await invoke<AutostartStatus>("autostart_status");
      setAutostartStatus(result);
      setError(null);
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
    }
  }

  async function setAutostartEnabled(enabled: boolean) {
    try {
      const result = await invoke<AutostartStatus>(
        enabled ? "autostart_enable" : "autostart_disable",
      );
      setAutostartStatus(result);
      setError(null);
    } catch (failure: unknown) {
      const primaryFailure = formatInvokeError(failure);
      try {
        const refreshed = await invoke<AutostartStatus>("autostart_status");
        setAutostartStatus(refreshed);
        setError(primaryFailure);
      } catch (refreshFailure: unknown) {
        setError(
          `${primaryFailure} | Autostart status refresh also failed: ${formatInvokeError(refreshFailure)}`,
        );
      }
    }
  }

  async function runWindowCommand(command: DiagnosticCommand) {
    try {
      await invoke<void>(command);
      setError(null);
      await refreshWindows();
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
    }
  }

  async function positionFocusPanel(side: FocusPanelSide) {
    if (!isValidMonitorSelection(selectedMonitorKey, monitors)) {
      setError("[MONITOR_SELECTION_INVALID] Select a currently available monitor first.");
      return;
    }

    try {
      await invoke<void>("position_focus_panel", {
        monitorKey: selectedMonitorKey,
        side,
      });
      setError(null);

      try {
        await fetchAndApplyMonitors();
      } catch (refreshFailure: unknown) {
        clearMonitorList();
        setError(
          `Position succeeded, but monitor refresh failed: ${formatInvokeError(refreshFailure)}`,
        );
      }
    } catch (failure: unknown) {
      const primaryFailure = formatInvokeError(failure);
      try {
        await fetchAndApplyMonitors();
        setError(primaryFailure);
      } catch (refreshFailure: unknown) {
        clearMonitorList();
        setError(
          `${primaryFailure} | Monitor refresh also failed: ${formatInvokeError(refreshFailure)}`,
        );
      }
    }
  }

  function handleMonitorSelection(value: string) {
    if (!isValidMonitorSelection(value, monitors)) {
      setSelectedMonitorKey(null);
      setError("[MONITOR_SELECTION_INVALID] The selected monitor is not available.");
      return;
    }

    setSelectedMonitorKey(value);
    setError(null);
  }

  const selectedMonitor = findSelectedMonitor(selectedMonitorKey, monitors);

  return (
    <AppShell>
      {error && (
        <div className="app-shell__error" role="alert">
          {error}
        </div>
      )}

      {diagnosticMode && (
        <details className="app-shell__diagnostics">
          <summary>Windows diagnostic controls</summary>
          <div className="app-shell__diagnostics-content">
            <div className="app-shell__diagnostic-grid">
              <section className="app-shell__diagnostic-card">
                <h2>Authoritative Rust State</h2>
                <pre>{JSON.stringify(state, null, 2)}</pre>
                <button onClick={() => void runStateCommand("mutate_state")}>
                  Mutate State (Counter)
                </button>
                <button onClick={() => void runStateCommand("toggle_timer")}>
                  Toggle Timer
                </button>

                <hr />
                <h2>Global Shortcut Diagnostics</h2>
                <p>
                  Default test chord: <strong>{shortcutDiagnostics?.chord ?? "Ctrl+Shift+B"}</strong>
                </p>
                <pre>{JSON.stringify(shortcutDiagnostics, null, 2)}</pre>
                <button onClick={() => void refreshShortcutDiagnostics()}>
                  Refresh Shortcut Status
                </button>
                <button onClick={() => void runShortcutCommand("global_shortcut_register")}>
                  Register Shortcut
                </button>
                <button onClick={() => void runShortcutCommand("global_shortcut_unregister")}>
                  Unregister Shortcut
                </button>
                <button
                  disabled={!shortcutDiagnostics?.registered}
                  onClick={() => void runShortcutConflictProbe()}
                >
                  Run Deterministic Conflict Probe
                </button>
                {shortcutProbeStatus && <p>{shortcutProbeStatus}</p>}

                <hr />
                <h2>Windows Notification Diagnostics</h2>
                <button onClick={() => void sendTestNotification()}>Send Test Notification</button>
                {notificationStatus && <p>{notificationStatus}</p>}

                <h3>M4 Due-Reminder Acceptance</h3>
                <button onClick={() => void scheduleReminderAcceptanceProbe()}>
                  Schedule Real Reminder Probe (+2 min)
                </button>
                {reminderAcceptanceStatus && <p>{reminderAcceptanceStatus}</p>}

                <hr />
                <h2>Windows Autostart Diagnostics</h2>
                <pre>{JSON.stringify(autostartStatus, null, 2)}</pre>
                <button onClick={() => void refreshAutostartStatus()}>
                  Refresh Autostart Status
                </button>
                <button
                  disabled={autostartStatus?.enabled === true}
                  onClick={() => void setAutostartEnabled(true)}
                >
                  Enable Autostart
                </button>
                <button
                  disabled={autostartStatus?.enabled !== true}
                  onClick={() => void setAutostartEnabled(false)}
                >
                  Disable Autostart
                </button>
              </section>

              <section className="app-shell__diagnostic-card">
                <h2>Window Controls</h2>
                <p>Active Webviews: {windows.join(", ") || "none"}</p>
                <button onClick={() => void refreshWindows()}>Refresh Window List</button>
                <hr />
                <button onClick={() => void runWindowCommand("main_window_hide")}>Hide Main</button>
                <button onClick={() => void runWindowCommand("main_window_show")}>Show Main</button>
                <button onClick={() => void runWindowCommand("main_window_focus")}>Focus Main</button>
                <button onClick={() => void runWindowCommand("main_window_destroy")}>
                  Destroy Main
                </button>
                <button onClick={() => void runWindowCommand("main_window_recreate")}>
                  Recreate Main
                </button>
                <button onClick={() => void runWindowCommand("main_window_close")}>Close Main</button>
                <hr />
                <button onClick={() => void runWindowCommand("focus_surface_show")}>
                  Show FocusSurface
                </button>
                <button onClick={() => void runWindowCommand("focus_surface_hide")}>
                  Hide FocusSurface
                </button>
                <button onClick={() => void runWindowCommand("focus_surface_focus")}>
                  Focus FocusSurface
                </button>
                <button onClick={() => void runWindowCommand("focus_surface_mode_panel")}>
                  FocusSurface -&gt; Panel
                </button>
                <button onClick={() => void runWindowCommand("focus_surface_mode_timer")}>
                  FocusSurface -&gt; Timer
                </button>

                <hr />
                <h3>Monitor Diagnostics</h3>
                <button onClick={() => void refreshMonitors()}>Refresh Monitors</button>
                <div>
                  <label>
                    Monitor:{" "}
                    <select
                      value={selectedMonitorKey ?? ""}
                      onChange={(event) => handleMonitorSelection(event.target.value)}
                      disabled={monitors.length === 0}
                    >
                      {monitors.length === 0 && <option value="">No monitor available</option>}
                      {monitors.map((monitor) => (
                        <option key={monitor.key} value={monitor.key}>
                          {formatMonitorLabel(monitor)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {selectedMonitor && <pre>{JSON.stringify(selectedMonitor, null, 2)}</pre>}
                <button
                  disabled={!selectedMonitor}
                  onClick={() => void positionFocusPanel("left")}
                >
                  Position Focus Panel Left
                </button>
                <button
                  disabled={!selectedMonitor}
                  onClick={() => void positionFocusPanel("right")}
                >
                  Position Focus Panel Right
                </button>
              </section>
            </div>
          </div>
        </details>
      )}
    </AppShell>
  );
}

export default App;
