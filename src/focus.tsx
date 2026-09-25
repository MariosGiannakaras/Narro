import React, { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import { FloatingTimerFoundation } from "./FloatingTimerFoundation";
import { FocusSurfaceTransition } from "./FocusSurfaceTransition";
import { FocusPanel } from "./FocusPanel";
import {
  getFocusSurfaceMode,
  prepareFloatingTimer,
  prepareFocusPanel,
  revealFloatingTimer,
  revealFocusPanel,
  type FocusSurfaceMode,
} from "./focusSurfaceModeApi";
import { coordinateFocusModeTransition } from "./focusModeTransition";
import { ThemeRuntimeProvider } from "./ThemeRuntime";
import { waitForPresentedFrame } from "./presentationFrame";
import { TimerSessionProjection } from "./TimerSessionProjection";
import {
  type AppStatePayload,
  type DiagnosticCommand,
  applyNewerState,
  formatInvokeError,
} from "./diagnosticApi";

function FocusSurfaceProduct() {
  const [mode, setMode] = useState<FocusSurfaceMode | null>(null);
  const [transitionPending, setTransitionPending] = useState(false);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [pendingMode, setPendingMode] = useState<FocusSurfaceMode | null>(null);
  const [preparedMode, setPreparedMode] = useState<FocusSurfaceMode | null>(null);
  const transitionCommitRef = useRef(false);
  const modeRef = useRef<FocusSurfaceMode | null>(null);
  const transitionBusyRef = useRef(false);
  const resizeBusyRef = useRef(false);
  const lastToggleRequestRef = useRef(0);
  const lastFindRequestRef = useRef(0);
  const [findTimerPulse, setFindTimerPulse] = useState<number | null>(null);
  const toggleRequestRef = useRef<() => void>(() => {});
  const reportResizePending = useCallback((pending: boolean) => {
    resizeBusyRef.current = pending;
  }, []);

  useEffect(() => {
    let disposed = false;
    let stopListening: (() => void) | undefined;
    void listen<number>("focus-surface-toggle-requested", (event) => {
      const sequence = event.payload;
      if (disposed || !Number.isSafeInteger(sequence) || sequence <= lastToggleRequestRef.current) return;
      lastToggleRequestRef.current = sequence;
      toggleRequestRef.current();
    })
      .then((unlisten) => {
        if (disposed) unlisten();
        else stopListening = unlisten;
      })
      .catch((failure: unknown) => {
        if (!disposed) setTransitionError(formatInvokeError(failure));
      });

    return () => {
      disposed = true;
      stopListening?.();
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    let stopListening: (() => void) | undefined;
    void listen<number>("focus-timer-find-requested", (event) => {
      const sequence = event.payload;
      if (disposed || !Number.isSafeInteger(sequence) || sequence <= lastFindRequestRef.current) return;
      lastFindRequestRef.current = sequence;
      if (modeRef.current === "timer" && !transitionBusyRef.current && !resizeBusyRef.current) {
        setFindTimerPulse(sequence);
      }
    })
      .then((unlisten) => {
        if (disposed) unlisten();
        else stopListening = unlisten;
      })
      .catch((failure: unknown) => {
        if (!disposed) setTransitionError(formatInvokeError(failure));
      });

    return () => {
      disposed = true;
      stopListening?.();
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    void getFocusSurfaceMode()
      .then((currentMode) => {
        if (!disposed) {
          modeRef.current = currentMode;
          setMode(currentMode);
          setTransitionError(null);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          modeRef.current = "panel";
          setMode("panel");
          setTransitionError(formatInvokeError(failure));
        }
      });

    return () => {
      disposed = true;
    };
  }, []);

  function requestMode(targetMode: FocusSurfaceMode) {
    if (transitionBusyRef.current || resizeBusyRef.current || modeRef.current === targetMode) return;
    transitionBusyRef.current = true;
    setFindTimerPulse(null);
    setTransitionPending(true);
    setTransitionError(null);
    setPendingMode(targetMode);
  }

  async function commitPendingModeTransition() {
    const targetMode = pendingMode;
    const previousMode = modeRef.current;
    if (!targetMode || !previousMode || transitionCommitRef.current) return;

    transitionCommitRef.current = true;
    try {
      await coordinateFocusModeTransition({
        previousMode,
        targetMode,
        prepareMode: async (nextMode) => {
          if (nextMode === "timer") {
            await prepareFloatingTimer();
          } else {
            await prepareFocusPanel();
          }
        },
        publishMode: (nextMode) => {
          flushSync(() => {
            setPreparedMode(nextMode);
            setPendingMode(null);
            setMode(nextMode);
          });
        },
        waitForPresentedFrame,
        revealMode: async (nextMode) => {
          if (nextMode === "timer") {
            await revealFloatingTimer();
          } else {
            await revealFocusPanel();
          }
        },
      });
      modeRef.current = targetMode;
      setTransitionError(null);
    } catch (failure: unknown) {
      setTransitionError(formatInvokeError(failure));
    } finally {
      transitionCommitRef.current = false;
      transitionBusyRef.current = false;
      setPreparedMode(null);
      setPendingMode(null);
      setTransitionPending(false);
    }
  }

  function failPendingModeTransition(failure: unknown) {
    if (transitionCommitRef.current) return;
    transitionBusyRef.current = false;
    setPendingMode(null);
    setTransitionPending(false);
    setTransitionError(formatInvokeError(failure));
  }

  toggleRequestRef.current = () => {
    const currentMode = modeRef.current;
    if (currentMode !== null) {
      requestMode(currentMode === "panel" ? "timer" : "panel");
    }
  };

  function enterCompactMode() {
    requestMode("timer");
  }

  function returnToPanel() {
    requestMode("panel");
  }

  if (mode === null) {
    return (
      <main className="focus-panel focus-panel--message" data-focus-surface-mode="loading" role="status">
        Loading Focus surface…
      </main>
    );
  }

  if (mode === "timer") {
    return (
      <FocusSurfaceTransition
        key="timer"
        mode="timer"
        exiting={pendingMode !== null}
        prepainted={preparedMode === "timer"}
        onExitComplete={() => void commitPendingModeTransition()}
        onExitFailure={failPendingModeTransition}
      >
        <FloatingTimerFoundation
          onReturnToPanel={() => void returnToPanel()}
          transitionPending={transitionPending}
          transitionError={transitionError}
          onResizePendingChange={reportResizePending}
          attentionPulseSequence={findTimerPulse}
          onAttentionPulseEnd={(sequence) => {
            setFindTimerPulse((current) => current === sequence ? null : current);
          }}
        />
      </FocusSurfaceTransition>
    );
  }

  return (
    <FocusSurfaceTransition
      key="panel"
      mode="panel"
      exiting={pendingMode !== null}
      prepainted={preparedMode === "panel"}
      onExitComplete={() => void commitPendingModeTransition()}
      onExitFailure={failPendingModeTransition}
    >
      <FocusPanel
        onRequestCompact={() => void enterCompactMode()}
        compactTransitionPending={transitionPending}
        modeTransitionError={transitionError}
      />
    </FocusSurfaceTransition>
  );
}

function FocusDiagnostics() {
  const [state, setState] = useState<AppStatePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let stopListening: (() => void) | undefined;

    void listen<AppStatePayload>("state-changed", (event) => {
      if (!disposed) setState((current) => applyNewerState(current, event.payload));
    })
      .then((unlisten) => {
        if (disposed) unlisten();
        else stopListening = unlisten;
      })
      .catch((failure: unknown) => {
        if (!disposed) setError(formatInvokeError(failure));
      });

    void invoke<AppStatePayload>("get_state")
      .then((payload) => {
        if (!disposed) setState((current) => applyNewerState(current, payload));
      })
      .catch((failure: unknown) => {
        if (!disposed) setError(formatInvokeError(failure));
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
        fontFamily: "var(--font-family-ui)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        boxSizing: "border-box",
        overflow: "auto",
        color: "var(--color-text-primary)",
        background: "var(--color-canvas)",
      }}
    >
      <h3 style={{ margin: "0 0 0.5rem 0" }}>Focus Surface Diagnostics</h3>
      {error ? <div style={{ color: "var(--color-destructive)", fontSize: "0.8em" }}>{error}</div> : null}
      <div
        style={{
          background: "var(--color-surface-raised)",
          border: "1px solid var(--color-border-subtle)",
          padding: "0.5rem",
          fontSize: "0.8em",
          overflow: "auto",
          minHeight: "8rem",
          borderRadius: "var(--radius-control)",
        }}
      >
        <pre style={{ margin: 0 }}>{JSON.stringify(state, null, 2)}</pre>
      </div>
      <TimerSessionProjection label="Focus Surface" compact />
      <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button onClick={() => void mutateState()}>Mutate State</button>
        <button onClick={() => void runWindowCommand("main_window_recreate")}>Recreate Main</button>
        <button onClick={() => void runWindowCommand("main_window_show")}>Show Main</button>
        <button onClick={() => void runWindowCommand("main_window_hide")}>Hide Main</button>
        <button onClick={() => void runWindowCommand("main_window_destroy")}>Destroy Main</button>
        <button onClick={() => void runWindowCommand("main_window_close")}>Close Main</button>
        <button onClick={() => void runWindowCommand("focus_surface_mode_panel")}>Panel Mode</button>
        <button onClick={() => void runWindowCommand("focus_surface_mode_timer")}>Timer Mode</button>
      </div>
    </main>
  );
}

const diagnostics = new URLSearchParams(window.location.search).get("diagnostics") === "1";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeRuntimeProvider>
      {diagnostics ? <FocusDiagnostics /> : <FocusSurfaceProduct />}
    </ThemeRuntimeProvider>
  </React.StrictMode>,
);
