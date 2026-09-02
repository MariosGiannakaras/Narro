import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

type AppStatePayload = {
  active_task: string | null;
  is_running: boolean;
  counter: number;
};

function FocusApp() {
  const [state, setState] = useState<AppStatePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoke<AppStatePayload>("get_state").then(setState).catch(setError);

    const unlisten = listen<AppStatePayload>("state-changed", (event) => {
      setState(event.payload);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const runCmd = (cmd: string) => {
    invoke(cmd).then(() => setError(null)).catch(setError);
  };

  return (
    <main className="container" style={{ padding: "0.5rem", fontFamily: "sans-serif", display: "flex", flexDirection: "column", height: "100vh", boxSizing: "border-box" }}>
      <h3 style={{ margin: "0 0 0.5rem 0" }}>Focus Surface</h3>
      {error && <div style={{ color: "red", fontSize: "0.8em" }}>{error}</div>}
      
      <div style={{ background: "#222", padding: "0.5rem", fontSize: "0.8em", overflow: "auto", flex: 1, borderRadius: "4px" }}>
        <pre style={{ margin: 0 }}>{JSON.stringify(state, null, 2)}</pre>
      </div>
      
      <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button onClick={() => runCmd("mutate_state")}>Mutate State</button>
        <button onClick={() => runCmd("main_window_recreate")}>Recreate Main</button>
        <button onClick={() => runCmd("main_window_show")}>Show Main</button>
        <button onClick={() => runCmd("main_window_hide")}>Hide Main</button>
        <button onClick={() => runCmd("main_window_destroy")}>Destroy Main</button>
        <button onClick={() => runCmd("main_window_close")}>Close Main</button>
        <button onClick={() => runCmd("focus_surface_mode_panel")}>Panel Mode</button>
        <button onClick={() => runCmd("focus_surface_mode_timer")}>Timer Mode</button>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <FocusApp />
  </React.StrictMode>
);
