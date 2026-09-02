import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

type AppStatePayload = {
  active_task: string | null;
  is_running: boolean;
  counter: number;
};

function App() {
  const [state, setState] = useState<AppStatePayload | null>(null);
  const [windows, setWindows] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refreshWindows = () => {
    invoke<string[]>("list_windows").then(setWindows).catch(setError);
  };

  useEffect(() => {
    invoke<AppStatePayload>("get_state").then(setState).catch(setError);
    refreshWindows();

    const unlisten = listen<AppStatePayload>("state-changed", (event) => {
      setState(event.payload);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const runCmd = (cmd: string) => {
    invoke(cmd).then(() => {
      setError(null);
      refreshWindows();
    }).catch(setError);
  };

  return (
    <main className="container" style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>Narro Diagnostic - Main Window</h1>
      {error && <div style={{ color: "red", background: "#fdd", padding: "0.5rem" }}>Error: {error}</div>}
      
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <div style={{ flex: 1, background: "#333", color: "#fff", padding: "1rem", borderRadius: "8px" }}>
          <h2>Authoritative Rust State</h2>
          <pre>{JSON.stringify(state, null, 2)}</pre>
          <button onClick={() => runCmd("mutate_state")}>Mutate State (Counter)</button>
          <button onClick={() => runCmd("toggle_timer")}>Toggle Timer</button>
        </div>

        <div style={{ flex: 1, background: "#eee", color: "#000", padding: "1rem", borderRadius: "8px" }}>
          <h2>Window Controls</h2>
          <ul>
            <li>Active Webviews: {windows.join(", ")}</li>
          </ul>
          <button onClick={refreshWindows}>Refresh Window List</button>
          <hr />
          <button onClick={() => runCmd("main_window_hide")}>Hide Main</button>
          <button onClick={() => runCmd("main_window_show")}>Show Main</button>
          <button onClick={() => runCmd("main_window_focus")}>Focus Main</button>
          <button onClick={() => runCmd("main_window_destroy")}>Destroy Main</button>
          <button onClick={() => runCmd("main_window_recreate")}>Recreate Main</button>
          <hr />
          <button onClick={() => runCmd("focus_surface_mode_panel")}>FocusSurface -> Panel</button>
          <button onClick={() => runCmd("focus_surface_mode_timer")}>FocusSurface -> Timer</button>
        </div>
      </div>
    </main>
  );
}

export default App;
