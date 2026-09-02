import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import {
  type AppStatePayload,
  type DiagnosticCommand,
  type FocusPanelSide,
  type MonitorDescriptor,
  applyNewerState,
  formatInvokeError,
  formatMonitorLabel,
  isValidMonitorSelection,
} from "./diagnosticApi";

type StateCommand = "mutate_state" | "toggle_timer";

function App() {
  const [state, setState] = useState<AppStatePayload | null>(null);
  const [windows, setWindows] = useState<string[]>([]);
  const [monitors, setMonitors] = useState<MonitorDescriptor[]>([]);
  const [selectedMonitorIndex, setSelectedMonitorIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshWindows() {
    try {
      const labels = await invoke<string[]>("list_windows");
      setWindows(labels);
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
    }
  }

  async function refreshMonitors() {
    try {
      const discovered = await invoke<MonitorDescriptor[]>("list_monitors");
      setMonitors(discovered);
      setSelectedMonitorIndex((current) =>
        isValidMonitorSelection(current, discovered) ? current : discovered[0]?.index ?? null,
      );
      setError(null);
    } catch (failure: unknown) {
      setMonitors([]);
      setSelectedMonitorIndex(null);
      setError(formatInvokeError(failure));
    }
  }

  useEffect(() => {
    let disposed = false;
    let stopListening: (() => void) | undefined;

    void listen<AppStatePayload>("state-changed", (event) => {
      if (!disposed) {
        setState((current) => applyNewerState(current, event.payload));
      }
    })
      .then((unlisten) => {
        if (disposed) {
          unlisten();
        } else {
          stopListening = unlisten;
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

    void refreshWindows();
    void refreshMonitors();

    return () => {
      disposed = true;
      stopListening?.();
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

  async function positionFocusSurface(side: FocusPanelSide) {
    if (!isValidMonitorSelection(selectedMonitorIndex, monitors)) {
      setError("[MONITOR_SELECTION_INVALID] Select a currently available monitor first.");
      return;
    }

    try {
      await invoke<void>("position_focus_surface", {
        monitorIndex: selectedMonitorIndex,
        side,
      });
      setError(null);
      await refreshMonitors();
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
      await refreshMonitors();
    }
  }

  function handleMonitorSelection(value: string) {
    const candidate = Number(value);
    if (!Number.isSafeInteger(candidate) || candidate < 0 || candidate >= monitors.length) {
      setSelectedMonitorIndex(null);
      setError("[MONITOR_SELECTION_INVALID] The selected monitor is not available.");
      return;
    }

    setSelectedMonitorIndex(candidate);
    setError(null);
  }

  const selectedMonitor = isValidMonitorSelection(selectedMonitorIndex, monitors)
    ? monitors[selectedMonitorIndex]
    : null;

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
                value={selectedMonitorIndex ?? ""}
                onChange={(event) => handleMonitorSelection(event.target.value)}
                disabled={monitors.length === 0}
              >
                {monitors.length === 0 && <option value="">No monitor available</option>}
                {monitors.map((monitor) => (
                  <option key={monitor.index} value={monitor.index}>
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
            onClick={() => void positionFocusSurface("left")}
          >
            Position FocusSurface Left
          </button>
          <button
            disabled={!selectedMonitor}
            onClick={() => void positionFocusSurface("right")}
          >
            Position FocusSurface Right
          </button>
        </div>
      </div>
    </main>
  );
}

export default App;
