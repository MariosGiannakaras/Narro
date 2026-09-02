import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

type AppStatePayload = {
  active_task: string | null;
  is_running: boolean;
};

function App() {
  const [state, setState] = useState<AppStatePayload | null>(null);

  useEffect(() => {
    // Initial fetch
    invoke<AppStatePayload>("get_state").then(setState);

    // Listen to changes
    const unlisten = listen<AppStatePayload>("state-changed", (event) => {
      setState(event.payload);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  return (
    <main className="container" style={{ padding: "2rem" }}>
      <h1>Narro Diagnostic - Main</h1>
      <div style={{ marginTop: "2rem", textAlign: "left", background: "#222", padding: "1rem", borderRadius: "8px" }}>
        <h2>Authoritative Rust State</h2>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>
      <div style={{ marginTop: "2rem" }}>
        <button onClick={() => invoke("toggle_timer")}>Toggle Timer</button>
      </div>
    </main>
  );
}

export default App;
