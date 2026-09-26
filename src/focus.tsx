import React, { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import { FloatingTimerFoundation } from "./FloatingTimerFoundation";
import { FocusSurfaceTransition } from "./FocusSurfaceTransition";
import { FocusPanel } from "./FocusPanel";
import { isEditableShortcutTarget, resolveInAppShortcut } from "./inAppShortcuts";
import { SearchPalette } from "./SearchPalette";
import {
  beginFocusVisualHold,
  clearFocusSurfacePrewarm,
  endFocusVisualHold,
  getFocusSurfaceMode,
  prepareFloatingTimer,
  prepareFocusPanel,
  prewarmFocusSurface,
  revealFloatingTimer,
  revealFocusPanel,
  type FocusSurfaceMode,
} from "./focusSurfaceModeApi";
import { coordinateFocusModeTransition } from "./focusModeTransition";
import { FocusVisualHoldOwner } from "./focusVisualHoldOwner";
import { ThemeRuntimeProvider } from "./ThemeRuntime";
import { waitForPresentedFrame } from "./presentationFrame";
import { TimerSessionProjection } from "./TimerSessionProjection";
import { snapshotTimerSession } from "./timerSessionApi";
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
  const visualHoldOwnerRef = useRef<FocusVisualHoldOwner | null>(null);
  const visualHoldOwner = visualHoldOwnerRef.current
    ?? new FocusVisualHoldOwner(beginFocusVisualHold, endFocusVisualHold);
  visualHoldOwnerRef.current = visualHoldOwner;
  const resizeBusyRef = useRef(false);
  const panelReadyRef = useRef(false);
  const panelReadyWaitersRef = useRef(new Set<() => void>());
  const timerReadyRef = useRef(false);
  const timerReadyWaitersRef = useRef(new Set<() => void>());
  const lastToggleRequestRef = useRef(0);
  const lastFindRequestRef = useRef(0);
  const [findTimerPulse, setFindTimerPulse] = useState<number | null>(null);
  const [quickTaskOpen, setQuickTaskOpen] = useState(false);
  const [focusRefreshKey, setFocusRefreshKey] = useState(0);
  const [shortcutStatus, setShortcutStatus] = useState<string | null>(null);
  const toggleRequestRef = useRef<() => void>(() => {});
  const reportResizePending = useCallback((pending: boolean) => {
    resizeBusyRef.current = pending;
  }, []);

  const resetPanelReady = useCallback(() => {
    panelReadyRef.current = false;
  }, []);

  const markPanelReady = useCallback(() => {
    panelReadyRef.current = true;
    for (const resolve of panelReadyWaitersRef.current) resolve();
    panelReadyWaitersRef.current.clear();
  }, []);

  const waitForPanelReady = useCallback((): Promise<void> => {
    if (panelReadyRef.current) return Promise.resolve();
    return new Promise((resolve) => {
      panelReadyWaitersRef.current.add(resolve);
    });
  }, []);

  const resetTimerReady = useCallback(() => {
    timerReadyRef.current = false;
  }, []);

  const markTimerReady = useCallback(() => {
    timerReadyRef.current = true;
    for (const resolve of timerReadyWaitersRef.current) resolve();
    timerReadyWaitersRef.current.clear();
  }, []);

  const waitForTimerReady = useCallback((): Promise<void> => {
    if (timerReadyRef.current) return Promise.resolve();
    return new Promise((resolve) => {
      timerReadyWaitersRef.current.add(resolve);
    });
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
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcut = resolveInAppShortcut(event);
      if (shortcut === "search") {
        event.preventDefault();
        setShortcutStatus("Search is unavailable while Focus mode is open.");
        return;
      }
      if (isFocusActionShortcut(shortcut)) {
        if (isEditableShortcutTarget(event.target)) return;
        event.preventDefault();
        void snapshotTimerSession()
          .then((payload) => {
            if (payload.runtime.timer.state === "idle" || payload.runtime.timer.task_id === null) {
              setShortcutStatus("No active Focus task is available for this shortcut.");
            }
          })
          .catch((failure: unknown) => {
            setShortcutStatus(`Focus shortcut state could not be read. ${formatInvokeError(failure)}`);
          });
        return;
      }
      if (shortcut !== "create-task" || isEditableShortcutTarget(event.target)) return;

      event.preventDefault();
      if (transitionBusyRef.current || resizeBusyRef.current) {
        setShortcutStatus("Quick task creation is unavailable during a Focus window transition.");
        return;
      }
      setShortcutStatus(null);
      setQuickTaskOpen(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!shortcutStatus) return;
    const timeout = window.setTimeout(() => setShortcutStatus(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [shortcutStatus]);

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

  async function requestMode(targetMode: FocusSurfaceMode) {
    if (transitionBusyRef.current || resizeBusyRef.current || modeRef.current === targetMode) return;
    transitionBusyRef.current = true;
    setFindTimerPulse(null);
    setTransitionPending(true);
    setTransitionError(null);
    try {
      // Capture the complete outgoing surface before its exit animation or
      // native hide. The copy remains visible through target preparation.
      await visualHoldOwner.release();
      await visualHoldOwner.acquire();
      setPendingMode(targetMode);
    } catch (failure: unknown) {
      transitionBusyRef.current = false;
      setTransitionPending(false);
      setTransitionError(formatInvokeError(failure));
    }
  }

  async function clearVisualHold() {
    try {
      await visualHoldOwner.release();
    } catch (failure: unknown) {
      setTransitionError(formatInvokeError(failure));
    }
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
          if (nextMode === "panel") resetPanelReady();
          else resetTimerReady();
          flushSync(() => {
            setPreparedMode(nextMode);
            setPendingMode(null);
            setMode(nextMode);
          });
        },
        prewarmMode: async () => {
          await prewarmFocusSurface();
        },
        waitForModeReady: async (nextMode) => {
          if (nextMode === "panel") await waitForPanelReady();
          else await waitForTimerReady();
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
      const transitionFailure = formatInvokeError(failure);
      try {
        await clearFocusSurfacePrewarm();
        setTransitionError(transitionFailure);
      } catch (cleanupFailure: unknown) {
        setTransitionError(
          `${transitionFailure}; prewarm cleanup failed: ${formatInvokeError(cleanupFailure)}`,
        );
      }
    } finally {
      await clearVisualHold();
      transitionCommitRef.current = false;
      transitionBusyRef.current = false;
      setPreparedMode(null);
      setPendingMode(null);
      setTransitionPending(false);
    }
  }

  async function failPendingModeTransition(failure: unknown) {
    if (transitionCommitRef.current) return;
    await clearVisualHold();
    transitionBusyRef.current = false;
    setPendingMode(null);
    setTransitionPending(false);
    setTransitionError(formatInvokeError(failure));
  }

  toggleRequestRef.current = () => {
    const currentMode = modeRef.current;
    if (currentMode !== null) {
      void requestMode(currentMode === "panel" ? "timer" : "panel");
    }
  };

  function enterCompactMode() {
    void requestMode("timer");
  }

  function returnToPanel() {
    void requestMode("panel");
  }

  const quickTaskOverlay = (
    <SearchPalette
      open={quickTaskOpen}
      initialMode="task-create"
      taskCreateOnly
      onRequestClose={() => setQuickTaskOpen(false)}
      onOpenList={() => {}}
      onOpenTask={() => {}}
      onAddList={() => {
        setQuickTaskOpen(false);
        setShortcutStatus("Open the Main window to create a list first.");
      }}
      onGoReports={() => {}}
      onTaskCreated={() => {
        setFocusRefreshKey((value) => value + 1);
        setShortcutStatus("Task added.");
      }}
    />
  );

  if (mode === null) {
    return (
      <main className="focus-panel focus-panel--message" data-focus-surface-mode="loading" role="status">
        Loading Focus surface…
      </main>
    );
  }

  if (mode === "timer") {
    return (
      <>
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
            shortcutStatus={shortcutStatus}
            onResizePendingChange={reportResizePending}
            attentionPulseSequence={findTimerPulse}
            onAttentionPulseEnd={(sequence) => {
              setFindTimerPulse((current) => current === sequence ? null : current);
            }}
            onPresentationReady={markTimerReady}
          />
        </FocusSurfaceTransition>
        {quickTaskOverlay}
      </>
    );
  }

  return (
    <>
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
          shortcutStatus={shortcutStatus}
          refreshKey={focusRefreshKey}
          onPresentationReady={markPanelReady}
        />
      </FocusSurfaceTransition>
      {quickTaskOverlay}
    </>
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
