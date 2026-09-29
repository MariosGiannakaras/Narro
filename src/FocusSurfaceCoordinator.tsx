import { listen } from "@tauri-apps/api/event";
import { flushSync } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FloatingTimerFoundation } from "./FloatingTimerFoundation";
import { FocusCompletionSuccess, type FocusCompletionSuccessState } from "./FocusCompletionSuccess";
import { FocusPanel } from "./FocusPanel";
import { SearchPalette } from "./SearchPalette";
import { formatInvokeError } from "./diagnosticApi";
import {
  FOCUS_PRESENTATION_CHANGED_EVENT,
  type FocusPresentationChanged,
} from "./focusWindowEvents";
import {
  applyFocusSurfacePresentation,
  focusSurfaceModeOf,
  getFocusSurfacePresentation,
  type FocusSurfaceMode,
  type FocusSurfacePresentation,
} from "./focusSurfaceModeApi";
import { isEditableShortcutTarget, resolveInAppShortcut } from "./inAppShortcuts";
import { waitForPresentedFrame } from "./presentationFrame";
import {
  applyTimerSessionProjection,
  connectLiveTimerSessionProjection,
  snapshotTimerSession,
  startTimerTask,
  type TimerSessionPayload,
} from "./timerSessionApi";
import "./focusSurfaceCoordinator.css";

const PRESENTATION_READY_TIMEOUT_MS = 7_000;

type PresentationReadiness = {
  panel: boolean;
  timer: boolean;
};

function modePresentation(mode: FocusSurfaceMode): FocusSurfacePresentation {
  return mode === "panel" ? "panel" : "timerCompact";
}

export function FocusSurfaceCoordinator() {
  const [presentation, setPresentation] = useState<FocusSurfacePresentation>("panel");
  const [pendingMode, setPendingMode] = useState<FocusSurfaceMode | null>(null);
  const [transitionPending, setTransitionPending] = useState(false);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [shortcutStatus, setShortcutStatus] = useState<string | null>(null);
  const [quickTaskOpen, setQuickTaskOpen] = useState(false);
  const [panelRefreshKey, setPanelRefreshKey] = useState(0);
  const [timerRefreshKey, setTimerRefreshKey] = useState(0);
  const [findTimerPulse, setFindTimerPulse] = useState<number | null>(null);
  const [timerResizePending, setTimerResizePending] = useState(false);
  const [timerProjection, setTimerProjection] = useState<TimerSessionPayload | null>(null);
  const [timerProjectionSettled, setTimerProjectionSettled] = useState(false);
  const [timerProjectionError, setTimerProjectionError] = useState<string | null>(null);
  const [completionSuccess, setCompletionSuccess] = useState<FocusCompletionSuccessState | null>(null);
  const [completionSuccessPending, setCompletionSuccessPending] = useState(false);
  const [completionSuccessError, setCompletionSuccessError] = useState<string | null>(null);

  const presentationRef = useRef<FocusSurfacePresentation>("panel");
  const pendingModeRef = useRef<FocusSurfaceMode | null>(null);
  const transitionGateRef = useRef(false);
  const readinessRef = useRef<PresentationReadiness>({ panel: false, timer: false });
  const readinessWaitersRef = useRef(new Set<() => void>());
  const lastToggleRequestRef = useRef(0);
  const lastFindRequestRef = useRef(0);
  const quickTaskAfterPanelRef = useRef(false);
  const requestModeRef = useRef<(mode: FocusSurfaceMode, quickTask?: boolean) => Promise<void>>(async () => {});

  const publishPresentation = useCallback((next: FocusSurfacePresentation) => {
    presentationRef.current = next;
    setPresentation(next);
  }, []);

  const markReady = useCallback((mode: FocusSurfaceMode) => {
    readinessRef.current[mode] = true;
    for (const resolve of readinessWaitersRef.current) resolve();
    readinessWaitersRef.current.clear();
  }, []);

  const waitForReady = useCallback(async (mode: FocusSurfaceMode) => {
    if (readinessRef.current[mode]) {
      await waitForPresentedFrame();
      return;
    }

    let timeout: number | undefined;
    let waiter: (() => void) | undefined;
    try {
      await new Promise<void>((resolve, reject) => {
        waiter = resolve;
        readinessWaitersRef.current.add(resolve);
        timeout = window.setTimeout(() => {
          readinessWaitersRef.current.delete(resolve);
          reject(new Error(
            mode === "panel"
              ? "Focus Panel did not finish preparing."
              : "Floating Timer did not finish preparing.",
          ));
        }, PRESENTATION_READY_TIMEOUT_MS);
      });
      await waitForPresentedFrame();
    } finally {
      if (timeout !== undefined) window.clearTimeout(timeout);
      if (waiter) readinessWaitersRef.current.delete(waiter);
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    let disconnect: (() => void) | undefined;
    setTimerProjectionSettled(false);
    void connectLiveTimerSessionProjection(
      (incoming) => {
        if (disposed) return;
        setTimerProjection((current) => applyTimerSessionProjection(current, incoming));
        setTimerProjectionError(null);
      },
      (failure) => {
        if (!disposed) setTimerProjectionError(formatInvokeError(failure));
      },
    )
      .then((stop) => {
        if (disposed) stop();
        else {
          disconnect = stop;
          setTimerProjectionSettled(true);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setTimerProjectionSettled(true);
          setTimerProjectionError(formatInvokeError(failure));
        }
      });

    return () => {
      disposed = true;
      disconnect?.();
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    void getFocusSurfacePresentation()
      .then((initial) => {
        if (!disposed) publishPresentation(initial);
      })
      .catch((failure: unknown) => {
        if (!disposed) setTransitionError(formatInvokeError(failure));
      });
    return () => {
      disposed = true;
    };
  }, [publishPresentation]);

  const requestMode = useCallback(async (targetMode: FocusSurfaceMode, quickTask = false) => {
    if (quickTask) quickTaskAfterPanelRef.current = true;

    const currentMode = focusSurfaceModeOf(presentationRef.current);
    if (targetMode === currentMode && pendingModeRef.current === null) {
      if (targetMode === "panel" && quickTaskAfterPanelRef.current) {
        quickTaskAfterPanelRef.current = false;
        setQuickTaskOpen(true);
      }
      return;
    }

    if (transitionGateRef.current || timerResizePending) {
      if (quickTask) {
        quickTaskAfterPanelRef.current = false;
        setShortcutStatus("Quick task creation is unavailable while the Focus surface is changing.");
      }
      return;
    }

    transitionGateRef.current = true;
    setTransitionPending(true);
    setTransitionError(null);
    pendingModeRef.current = targetMode;
    setPendingMode(targetMode);
    readinessRef.current[targetMode] = false;

    if (targetMode === "panel") {
      setPanelRefreshKey((value) => value + 1);
    } else {
      setTimerRefreshKey((value) => value + 1);
    }

    const previousPresentation = presentationRef.current;
    const targetPresentation = modePresentation(targetMode);

    try {
      await waitForReady(targetMode);

      // The target subtree has already been rendered in this same WebView at
      // opacity 0. Commit its renderer state synchronously, then change only
      // native region/position/window attributes. No Focus WebView is hidden,
      // resized, destroyed or created during this ordinary mode switch.
      flushSync(() => {
        publishPresentation(targetPresentation);
      });

      await applyFocusSurfacePresentation(targetPresentation);

      pendingModeRef.current = null;
      setPendingMode(null);
      if (targetMode === "panel") {
        setFindTimerPulse(null);
        if (quickTaskAfterPanelRef.current) {
          quickTaskAfterPanelRef.current = false;
          setQuickTaskOpen(true);
        }
      }
    } catch (failure: unknown) {
      const primary = formatInvokeError(failure);
      try {
        await applyFocusSurfacePresentation(previousPresentation);
        flushSync(() => publishPresentation(previousPresentation));
        setTransitionError(primary);
      } catch (recoveryFailure: unknown) {
        setTransitionError(
          `${primary} | Focus presentation rollback also failed: ${formatInvokeError(recoveryFailure)}`,
        );
      }
      pendingModeRef.current = null;
      setPendingMode(null);
      if (quickTaskAfterPanelRef.current) {
        quickTaskAfterPanelRef.current = false;
        setShortcutStatus(`Quick task creation could not open the Focus Panel. ${primary}`);
      }
    } finally {
      transitionGateRef.current = false;
      setTransitionPending(false);
    }
  }, [publishPresentation, timerResizePending, waitForReady]);

  requestModeRef.current = requestMode;

  useEffect(() => {
    let disposed = false;
    const stops: Array<() => void> = [];

    const subscribe = async <T,>(name: string, callback: (payload: T) => void) => {
      try {
        const stop = await listen<T>(name, (event) => {
          if (!disposed) callback(event.payload);
        });
        if (disposed) stop();
        else stops.push(stop);
      } catch (failure: unknown) {
        if (!disposed) setTransitionError(formatInvokeError(failure));
      }
    };

    void subscribe<number>("focus-surface-toggle-requested", (sequence) => {
      if (!Number.isSafeInteger(sequence) || sequence <= lastToggleRequestRef.current) return;
      lastToggleRequestRef.current = sequence;
      const currentMode = focusSurfaceModeOf(presentationRef.current);
      void requestModeRef.current(currentMode === "panel" ? "timer" : "panel");
    });

    void subscribe<number>("focus-timer-find-requested", (sequence) => {
      if (!Number.isSafeInteger(sequence) || sequence <= lastFindRequestRef.current) return;
      lastFindRequestRef.current = sequence;
      if (focusSurfaceModeOf(presentationRef.current) === "timer"
        && !transitionGateRef.current
        && !timerResizePending) {
        setFindTimerPulse(sequence);
      }
    });

    void subscribe<FocusPresentationChanged>(FOCUS_PRESENTATION_CHANGED_EVENT, (next) => {
      if (next !== "panel" && next !== "timerCompact" && next !== "timerExpanded") return;
      // Native commands invoked from diagnostics/tray may change presentation
      // outside the React transition request. Reconcile only when no renderer
      // transition is in flight; otherwise the requesting path owns the commit.
      if (!transitionGateRef.current) publishPresentation(next);
    });

    return () => {
      disposed = true;
      for (const stop of stops) stop();
    };
  }, [publishPresentation, timerResizePending]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcut = resolveInAppShortcut(event);
      if (shortcut === "search") {
        event.preventDefault();
        setShortcutStatus("Search is unavailable while Focus mode is open.");
        return;
      }
      if (shortcut !== "create-task" || isEditableShortcutTarget(event.target)) return;
      event.preventDefault();

      if (transitionGateRef.current || timerResizePending) {
        setShortcutStatus("Quick task creation is unavailable while the Focus surface is changing.");
        return;
      }

      if (focusSurfaceModeOf(presentationRef.current) === "panel") {
        setShortcutStatus(null);
        setQuickTaskOpen(true);
      } else {
        void requestModeRef.current("panel", true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [timerResizePending]);

  useEffect(() => {
    if (!shortcutStatus) return;
    const timeout = window.setTimeout(() => setShortcutStatus(null), 2_400);
    return () => window.clearTimeout(timeout);
  }, [shortcutStatus]);

  const recordCompletionSuccess = useCallback((state: FocusCompletionSuccessState) => {
    setCompletionSuccess(state);
    setCompletionSuccessPending(false);
    setCompletionSuccessError(null);
    setPanelRefreshKey((value) => value + 1);
    setTimerRefreshKey((value) => value + 1);
  }, []);

  const startNextTaskFromSuccess = async () => {
    const success = completionSuccess;
    if (!success?.nextTask || completionSuccessPending) return;
    setCompletionSuccessPending(true);
    setCompletionSuccessError(null);
    try {
      const authoritative = await snapshotTimerSession();
      if (authoritative.runtime.timer.state !== "idle" || authoritative.runtime.timer.task_id !== null) {
        throw new Error("Another Focus task is already active. Close this success screen to continue.");
      }
      const payload = await startTimerTask(success.nextTask.id, success.nextTask.mode);
      setTimerProjection((current) => applyTimerSessionProjection(current, payload));
      setCompletionSuccess(null);
      setPanelRefreshKey((value) => value + 1);
      setTimerRefreshKey((value) => value + 1);
    } catch (failure: unknown) {
      setCompletionSuccessError(formatInvokeError(failure));
    } finally {
      setCompletionSuccessPending(false);
    }
  };

  const mode = focusSurfaceModeOf(presentation);
  const renderPanel = mode === "panel" || pendingMode === "panel";
  const renderTimer = mode === "timer" || pendingMode === "timer";
  // The committed presentation stays active while its target prepaints below
  // it. Only publishPresentation() flips side-effect/interaction ownership.
  const panelActive = mode === "panel";
  const timerActive = mode === "timer";
  const sharedTimerProjection = useMemo(() => ({
    payload: timerProjection,
    settled: timerProjectionSettled,
  }), [timerProjection, timerProjectionSettled]);

  return (
    <main
      className="focus-surface-coordinator"
      data-focus-surface-coordinator="true"
      data-focus-presentation={presentation}
      data-focus-transition-pending={transitionPending ? "true" : "false"}
      aria-busy={transitionPending || timerResizePending}
    >
      {renderPanel ? (
        <section
          className="focus-surface-coordinator__presentation"
          data-focus-presentation="panel"
          data-focus-visibility={panelActive ? "active" : "preparing"}
          aria-hidden={panelActive ? undefined : true}
          inert={!panelActive}
        >
          <FocusPanel
            sharedTimerProjection={sharedTimerProjection}
            presentationActive={panelActive}
            onRequestCompact={() => void requestMode("timer")}
            compactTransitionPending={transitionPending}
            modeTransitionError={transitionError ?? timerProjectionError}
            shortcutStatus={shortcutStatus}
            refreshKey={panelRefreshKey}
            onPresentationReady={() => markReady("panel")}
            onCompletionSuccess={recordCompletionSuccess}
          />
        </section>
      ) : null}

      {renderTimer ? (
        <section
          className="focus-surface-coordinator__presentation"
          data-focus-presentation="timer"
          data-focus-visibility={timerActive ? "active" : "preparing"}
          aria-hidden={timerActive ? undefined : true}
          inert={!timerActive}
        >
          <FloatingTimerFoundation
            sharedTimerProjection={sharedTimerProjection}
            presentationActive={timerActive}
            onReturnToPanel={() => void requestMode("panel")}
            transitionPending={transitionPending}
            transitionError={transitionError ?? timerProjectionError}
            shortcutStatus={shortcutStatus}
            onResizePendingChange={setTimerResizePending}
            attentionPulseSequence={findTimerPulse}
            onAttentionPulseEnd={(sequence) => {
              setFindTimerPulse((current) => current === sequence ? null : current);
            }}
            onPresentationReady={() => markReady("timer")}
            refreshKey={timerRefreshKey}
            onCompletionSuccess={recordCompletionSuccess}
          />
        </section>
      ) : null}

      {completionSuccess ? (
        <FocusCompletionSuccess
          state={completionSuccess}
          pending={completionSuccessPending}
          error={completionSuccessError}
          onNextTask={() => void startNextTaskFromSuccess()}
          onClose={() => {
            if (completionSuccessPending) return;
            setCompletionSuccess(null);
            setCompletionSuccessError(null);
          }}
        />
      ) : null}

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
          setPanelRefreshKey((value) => value + 1);
          setTimerRefreshKey((value) => value + 1);
          setShortcutStatus("Task added.");
        }}
      />
    </main>
  );
}
