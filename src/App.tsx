import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import { AppShell } from "./AppShell";
import {
  type AppStatePayload,
  type DiagnosticCommand,
  type DiagnosticStoragePaths,
  type FocusPanelPlacementProbe,
  type FocusPanelSide,
  type FocusShortcutKind,
  type MonitorDescriptor,
  type ShortcutCommand,
  type ShortcutDiagnostics,
  applyNewerShortcutDiagnostics,
  applyNewerState,
  findSelectedMonitor,
  focusShortcutRetryError,
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

type FocusPanelPlacementMatrixEntry = {
  monitorKey: string;
  monitorIndex: number;
  monitorName: string | null;
  side: FocusPanelSide;
  probe: FocusPanelPlacementProbe;
};

type FocusPanelPlacementMatrix = {
  generatedAt: string;
  monitorCount: number;
  entryCount: number;
  passCount: number;
  pass: boolean;
  entries: FocusPanelPlacementMatrixEntry[];
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
  const [diagnosticStoragePaths, setDiagnosticStoragePaths] = useState<DiagnosticStoragePaths | null>(null);
  const [windows, setWindows] = useState<string[]>([]);
  const [monitors, setMonitors] = useState<MonitorDescriptor[]>([]);
  const [selectedMonitorKey, setSelectedMonitorKey] = useState<string | null>(null);
  const [placementProbe, setPlacementProbe] = useState<FocusPanelPlacementProbe | null>(null);
  const [placementMatrix, setPlacementMatrix] = useState<FocusPanelPlacementMatrix | null>(null);
  const [placementMatrixPending, setPlacementMatrixPending] = useState(false);
  const [placementMatrixStep, setPlacementMatrixStep] = useState<string | null>(null);
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

  async function refreshDiagnosticStoragePaths() {
    try {
      const paths = await invoke<DiagnosticStoragePaths>("diagnostic_storage_paths");
      setDiagnosticStoragePaths(paths);
      setError(null);
    } catch (failure: unknown) {
      setDiagnosticStoragePaths(null);
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
    setPlacementProbe(null);
    setPlacementMatrix(null);
  }

  async function fetchAndApplyMonitors() {
    const discovered = await invoke<MonitorDescriptor[]>("list_monitors");
    applyMonitorList(discovered);
    return discovered;
  }

  async function refreshMonitors() {
    setPlacementProbe(null);
    setPlacementMatrix(null);
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

    void listen<ShortcutDiagnostics>("shortcut-diagnostic-changed", (event) => {
      if (!disposed) {
        setShortcutDiagnostics((current) =>
          applyNewerShortcutDiagnostics(current, event.payload),
        );
      }
    })
      .then((unlisten) => {
        if (disposed) unlisten();
        else stopShortcutListening = unlisten;
      })
      .catch((failure: unknown) => {
        if (!disposed) setError(formatInvokeError(failure));
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
        if (!disposed) setError(formatInvokeError(failure));
      });

    if (diagnosticMode) {
      void refreshAutostartStatus();
      void refreshDiagnosticStoragePaths();
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

  async function retryFocusToggleRegistration() {
    try {
      const payload = await invoke<ShortcutDiagnostics>("global_focus_toggle_register");
      setShortcutDiagnostics((current) => applyNewerShortcutDiagnostics(current, payload));
      setError(null);
    } catch (failure: unknown) {
      await reconcileFocusShortcutRetry(failure, "toggle");
    }
  }

  async function retryFindTimerRegistration() {
    try {
      const payload = await invoke<ShortcutDiagnostics>("global_find_timer_register");
      setShortcutDiagnostics((current) => applyNewerShortcutDiagnostics(current, payload));
      setError(null);
    } catch (failure: unknown) {
      await reconcileFocusShortcutRetry(failure, "findTimer");
    }
  }

  async function reconcileFocusShortcutRetry(failure: unknown, kind: FocusShortcutKind) {
    try {
      const latest = await invoke<ShortcutDiagnostics>("global_shortcut_status");
      setShortcutDiagnostics((current) => applyNewerShortcutDiagnostics(current, latest));
      setError(focusShortcutRetryError(failure, latest, kind));
    } catch (refreshFailure: unknown) {
      setError(`${formatInvokeError(failure)} | Shortcut status refresh failed: ${formatInvokeError(refreshFailure)}`);
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
    setPlacementProbe(null);
    setPlacementMatrix(null);
    if (!isValidMonitorSelection(selectedMonitorKey, monitors)) {
      setError("[MONITOR_SELECTION_INVALID] Select a currently available monitor first.");
      return;
    }

    try {
      await invoke<void>("position_focus_panel", {
        monitorKey: selectedMonitorKey,
        side,
      });
      const probe = await invoke<FocusPanelPlacementProbe>("focus_panel_placement_probe", {
        monitorKey: selectedMonitorKey,
        side,
      });
      setPlacementProbe(probe);
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

  async function runFocusPanelPlacementMatrix() {
    if (placementMatrixPending) return;

    setPlacementProbe(null);
    setPlacementMatrix(null);
    setPlacementMatrixStep(null);
    setPlacementMatrixPending(true);

    try {
      const discovered = await fetchAndApplyMonitors();
      if (discovered.length === 0) {
        throw new Error("No monitor is available for the Focus Panel placement matrix.");
      }

      await invoke<void>("focus_surface_mode_panel");
      await invoke<void>("focus_surface_show");

      const entries: FocusPanelPlacementMatrixEntry[] = [];
      for (const monitor of discovered) {
        for (const side of ["left", "right"] as const) {
          const stepLabel = `Monitor ${monitor.index + 1}${monitor.name ? ` (${monitor.name})` : ""} — ${side === "left" ? "Left" : "Right"}`;
          setPlacementMatrixStep(stepLabel);
          await invoke<void>("position_focus_panel", {
            monitorKey: monitor.key,
            side,
          });
          // Keep every diagnostic placement visibly settled long enough for a
          // screen recording/human observer to verify the actual monitor edge.
          await new Promise<void>((resolve) => window.setTimeout(resolve, 750));
          const probe = await invoke<FocusPanelPlacementProbe>("focus_panel_placement_probe", {
            monitorKey: monitor.key,
            side,
          });
          entries.push({
            monitorKey: monitor.key,
            monitorIndex: monitor.index,
            monitorName: monitor.name,
            side,
            probe,
          });
        }
      }

      const passCount = entries.filter((entry) => entry.probe.pass).length;
      const matrix: FocusPanelPlacementMatrix = {
        generatedAt: new Date().toISOString(),
        monitorCount: discovered.length,
        entryCount: entries.length,
        passCount,
        pass: entries.length > 0 && passCount === entries.length,
        entries,
      };
      setPlacementMatrix(matrix);
      setPlacementProbe(entries[entries.length - 1]?.probe ?? null);
      setError(
        matrix.pass
          ? null
          : "[FOCUS_PANEL_PLACEMENT_MATRIX_FAILED] One or more native placement probes failed.",
      );
    } catch (failure: unknown) {
      setPlacementMatrix(null);
      setError(formatInvokeError(failure));
      try {
        await fetchAndApplyMonitors();
      } catch {
        clearMonitorList();
      }
    } finally {
      setPlacementMatrixStep(null);
      setPlacementMatrixPending(false);
    }
  }

  function handleMonitorSelection(value: string) {
    if (!isValidMonitorSelection(value, monitors)) {
      setSelectedMonitorKey(null);
      setError("[MONITOR_SELECTION_INVALID] The selected monitor is not available.");
      return;
    }

    setSelectedMonitorKey(value);
    setPlacementProbe(null);
    setPlacementMatrix(null);
    setError(null);
  }

  const selectedMonitor = findSelectedMonitor(selectedMonitorKey, monitors);
  const diagnosticStorageIsolated = diagnosticStoragePaths?.isolationPass === true;

  return (
    <AppShell>
      {error && (
        <div className="app-shell__error" role="alert">
          {error}
        </div>
      )}
      {shortcutDiagnostics?.focusToggleLastError && (
        <div className="app-shell__error" role="alert">
          {shortcutDiagnostics.focusToggleChord}: {shortcutDiagnostics.focusToggleLastError.message}
          <button type="button" onClick={() => void retryFocusToggleRegistration()}>
            Retry shortcut
          </button>
        </div>
      )}
      {shortcutDiagnostics?.findTimerLastError && (
        <div className="app-shell__error" role="alert">
          {shortcutDiagnostics.findTimerChord}: {shortcutDiagnostics.findTimerLastError.message}
          <button type="button" onClick={() => void retryFindTimerRegistration()}>
            Retry shortcut
          </button>
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
                <h2>Diagnostic Build Identity</h2>
                <p>Expected isolated Tauri identifier: com.mariosg.Narro.M1Diagnostic</p>
                <p>
                  Storage isolation (native identifier + resolved paths):{" "}
                  <strong>
                    {diagnosticStoragePaths
                      ? diagnosticStorageIsolated
                        ? "PASS"
                        : "FAIL"
                      : "not checked"}
                  </strong>
                </p>
                <button onClick={() => void refreshDiagnosticStoragePaths()}>
                  Refresh Storage Paths
                </button>
                {diagnosticStoragePaths && (
                  <pre>{JSON.stringify(diagnosticStoragePaths, null, 2)}</pre>
                )}
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
                <p>Available monitors: {monitors.length}</p>
                <details>
                  <summary>All monitor descriptors</summary>
                  <pre>{JSON.stringify(monitors, null, 2)}</pre>
                </details>
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
                  disabled={!selectedMonitor || placementMatrixPending}
                  onClick={() => void positionFocusPanel("left")}
                >
                  Position Focus Panel Left
                </button>
                <button
                  disabled={!selectedMonitor || placementMatrixPending}
                  onClick={() => void positionFocusPanel("right")}
                >
                  Position Focus Panel Right
                </button>
                <button
                  disabled={monitors.length === 0 || placementMatrixPending}
                  onClick={() => void runFocusPanelPlacementMatrix()}
                  data-m1-placement-matrix-run
                >
                  {placementMatrixPending ? "Running placement matrix…" : "Run all monitor Left/Right probes"}
                </button>
                {placementMatrixPending && placementMatrixStep && (
                  <p data-m1-placement-matrix-step>
                    Current matrix step: <strong>{placementMatrixStep}</strong>
                  </p>
                )}
                {placementMatrix && (
                  <>
                    <p>
                      Placement matrix: <strong>{placementMatrix.pass ? "PASS" : "FAIL"}</strong>{" "}
                      ({placementMatrix.passCount}/{placementMatrix.entryCount})
                    </p>
                    <pre data-m1-placement-matrix-result>
                      {JSON.stringify(placementMatrix, null, 2)}
                    </pre>
                  </>
                )}
                {placementProbe && (
                  <>
                    <p>
                      Placement probe: <strong>{placementProbe.pass ? "PASS" : "FAIL"}</strong>
                    </p>
                    <pre>{JSON.stringify(placementProbe, null, 2)}</pre>
                  </>
                )}
              </section>
            </div>
          </div>
        </details>
      )}
    </AppShell>
  );
}

export default App;
