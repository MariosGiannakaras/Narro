import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

type AppStatePayload = {
  active_task: string | null;
  is_running: boolean;
};

function FocusApp() {
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
    <main className="container" style={{ padding: "1rem" }}>
      <h2>Narro - Focus</h2>
      <div style={{ marginTop: "1rem", textAlign: "left", background: "#222", padding: "1rem", borderRadius: "8px" }}>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => invoke("toggle_timer")}>Toggle</button>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <FocusApp />
  </React.StrictMode>
);
