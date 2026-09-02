import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import {
  type AppStatePayload,
  type DiagnosticCommand,
  type FocusPanelSide,
  type MonitorDescriptor,
  type ShortcutConflictProbeResult,
  type ShortcutStatus,
  applyNewerShortcutStatus,
  applyNewerState,
  findSelectedMonitor,
  formatInvokeError,
  formatMonitorLabel,
  isValidMonitorSelection,
} from "./diagnosticApi";

type StateCommand = "mutate_state" | "toggle_timer";
type ShortcutCommand = "shortcut_register" | "shortcut_unregister";

function App() {
  const [state, setState] = useState<AppStatePayload | null>(null);
  const [shortcut, setShortcut] = useState<ShortcutStatus | null>(null);
  const [shortcutProbe, setShortcutProbe] = useState<ShortcutConflictProbeResult | null>(null);
  const [windows, setWindows] = useState<string[]>([]);
  const [monitors, setMonitors] = useState<MonitorDescriptor[]>([]);
  const [selectedMonitorKey, setSelectedMonitorKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshWindows() {
    try {
      const labels = await invoke<string[]>("list_windows");
      setWindows(labels);
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

    void listen<ShortcutStatus>("shortcut-state-changed", (event) => {
      if (!disposed) {
        setShortcut((current) => applyNewerShortcutStatus(current, event.payload));
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

    void invoke<ShortcutStatus>("shortcut_status")
      .then((status) => {
        if (!disposed) {
          setShortcut((current) => applyNewerShortcutStatus(current, status));
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setError(formatInvokeError(failure));
        }
      });

    void refreshWindows();
    void refreshMonitors();

    return () => {
      disposed = true;
      stopStateListening?.();
      stopShortcutListening?.();
    };
  }, []);

  async function runStateCommand(command: StateCommand) {
    try {
      const payload = await invoke<AppStatePayload>(command);
      setState((current) => applyNewerState(current, payload));
      setError(null);
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
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

  async function runShortcutCommand(command: ShortcutCommand) {
    try {
      const status = await invoke<ShortcutStatus>(command);
      setShortcut((current) => applyNewerShortcutStatus(current, status));
      setShortcutProbe(null);
      setError(null);
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
    }
  }

  async function probeShortcutConflict() {
    try {
      const result = await invoke<ShortcutConflictProbeResult>("shortcut_probe_conflict");
      setShortcutProbe(result);
      setError(null);
    } catch (failure: unknown) {
      setShortcutProbe(null);
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
    <main className="container" style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>Narro Diagnostic - Main Window</h1>
      {error && (
        <div style={{ color: "red", background: "#fdd", padding: "0.5rem" }}>
          Error: {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <div
          style={{
            flex: 1,
            background: "#333",
            color: "#fff",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <h2>Authoritative Rust State</h2>
          <pre>{JSON.stringify(state, null, 2)}</pre>
          <button onClick={() => void runStateCommand("mutate_state")}>
            Mutate State (Counter)
          </button>
          <button onClick={() => void runStateCommand("toggle_timer")}>
            Toggle Timer
          </button>

          <hr />
          <h3>Global Shortcut Diagnostics</h3>
          <pre>{JSON.stringify(shortcut, null, 2)}</pre>
          <p>
            After registration, press {shortcut?.accelerator ?? "Ctrl+Alt+Shift+F10"} from any
            normal Windows application. The Rust-owned triggerCount should increment.
          </p>
          <button onClick={() => void runShortcutCommand("shortcut_register")}>
            Register Shortcut
          </button>
          <button onClick={() => void runShortcutCommand("shortcut_unregister")}>
            Unregister Shortcut
          </button>
          <button
            disabled={!shortcut?.registered}
            onClick={() => void probeShortcutConflict()}
          >
            Probe Duplicate Conflict
          </button>
          {shortcutProbe && <pre>{JSON.stringify(shortcutProbe, null, 2)}</pre>}
        </div>

        <div
          style={{
            flex: 1,
            background: "#eee",
            color: "#000",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <h2>Window Controls</h2>
          <ul>
            <li>Active Webviews: {windows.join(", ")}</li>
          </ul>
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
          <div style={{ marginTop: "0.5rem" }}>
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
          {selectedMonitor && (
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(selectedMonitor, null, 2)}
            </pre>
          )}
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
        </div>
      </div>
    </main>
  );
}

export default App;
