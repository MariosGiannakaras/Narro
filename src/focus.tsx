import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import {
  type AppStatePayload,
  type DiagnosticCommand,
  applyNewerState,
  formatInvokeError,
} from "./diagnosticApi";

function FocusApp() {
  const [state, setState] = useState<AppStatePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    return () => {
      disposed = true;
      stopListening?.();
    };
  }, []);

  async function mutateState() {
    try {
      const payload = await invoke<AppStatePayload>("mutate_state");
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
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
    }
  }

  return (
    <main
      className="container"
      style={{
        padding: "0.5rem",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        boxSizing: "border-box",
      }}
    >
      <h3 style={{ margin: "0 0 0.5rem 0" }}>Focus Surface</h3>
      {error && <div style={{ color: "red", fontSize: "0.8em" }}>{error}</div>}

      <div
        style={{
          background: "#222",
          padding: "0.5rem",
          fontSize: "0.8em",
          overflow: "auto",
          flex: 1,
          borderRadius: "4px",
        }}
      >
        <pre style={{ margin: 0 }}>{JSON.stringify(state, null, 2)}</pre>
      </div>

      <div
        style={{
          marginTop: "0.5rem",
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => void mutateState()}>Mutate State</button>
        <button onClick={() => void runWindowCommand("main_window_recreate")}>
          Recreate Main
        </button>
        <button onClick={() => void runWindowCommand("main_window_show")}>Show Main</button>
        <button onClick={() => void runWindowCommand("main_window_hide")}>Hide Main</button>
        <button onClick={() => void runWindowCommand("main_window_destroy")}>
          Destroy Main
        </button>
        <button onClick={() => void runWindowCommand("main_window_close")}>Close Main</button>
        <button onClick={() => void runWindowCommand("focus_surface_mode_panel")}>
          Panel Mode
        </button>
        <button onClick={() => void runWindowCommand("focus_surface_mode_timer")}>
          Timer Mode
        </button>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <FocusApp />
  </React.StrictMode>,
);
