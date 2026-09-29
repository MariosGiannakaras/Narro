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
  animateFocusSurfacePresentation,
  applyFocusSurfacePresentation,
  focusSurfaceModeOf,
  getFocusSurfacePresentation,
  type FocusSurfaceMode,
  type FocusSurfacePresentation,
} from "./focusSurfaceModeApi";
import { isEditableShortcutTarget, resolveInAppShortcut } from "./inAppShortcuts";
import { commitPreparedFocusPresentation } from "./focusPresentationTransition";
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
const FOCUS_GEOMETRY_MOTION_MS = 270;

type FocusGeometryMotion = {
  from: FocusSurfacePresentation;
  to: FocusSurfacePresentation;
  phase: "start" | "running";
};

type PresentationReadiness = {
  panel: boolean;
  timer: boolean;
};

function modePresentation(mode: FocusSurfaceMode): FocusSurfacePresentation {
  return mode === "panel" ? "panel" : "timerCompact";
}

export function FocusSurfaceCoordinator() {
  const [presentation, setPresentation] = useState<FocusSurfacePresentation>("panel");
  const [presentationHydrated, setPresentationHydrated] = useState(false);
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
  const [geometryMotion, setGeometryMotion] = useState<FocusGeometryMotion | null>(null);

  const presentationRef = useRef<FocusSurfacePresentation>("panel");
  const presentationHydratedRef = useRef(false);
  const timerResizePendingRef = useRef(false);
  const pendingModeRef = useRef<FocusSurfaceMode | null>(null);
  const transitionGateRef = useRef(false);
  const readinessRef = useRef<PresentationReadiness>({ panel: false, timer: false });
  const readinessWaitersRef = useRef<Record<FocusSurfaceMode, Set<() => void>>>({
    panel: new Set(),
    timer: new Set(),
  });
  const lastToggleRequestRef = useRef(0);
  const lastFindRequestRef = useRef(0);
  const deferredToggleSequenceRef = useRef<number | null>(null);
  const deferredFindSequenceRef = useRef<number | null>(null);
  const presentationReconcileRevisionRef = useRef(0);
  const quickTaskAfterPanelRef = useRef(false);
  const requestModeRef = useRef<(mode: FocusSurfaceMode, quickTask?: boolean) => Promise<void>>(async () => {});

  const publishPresentation = useCallback((next: FocusSurfacePresentation) => {
    presentationRef.current = next;
    setPresentation(next);
  }, []);

  const setTimerResizeBusy = useCallback((pending: boolean) => {
    timerResizePendingRef.current = pending;
    setTimerResizePending(pending);
  }, []);

  const markReady = useCallback((mode: FocusSurfaceMode) => {
    readinessRef.current[mode] = true;
    const waiters = readinessWaitersRef.current[mode];
    for (const resolve of waiters) resolve();
    waiters.clear();
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
        readinessWaitersRef.current[mode].add(resolve);
        timeout = window.setTimeout(() => {
          readinessWaitersRef.current[mode].delete(resolve);
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
      if (waiter) readinessWaitersRef.current[mode].delete(waiter);
    }
  }, []);

  const runGeometryMotion = useCallback(async (
    from: FocusSurfacePresentation,
    to: FocusSurfacePresentation,
    durationMs: number,
  ) => {
    if (focusSurfaceModeOf(from) === focusSurfaceModeOf(to)) return;

    flushSync(() => setGeometryMotion({ from, to, phase: "start" }));
    await waitForPresentedFrame();
    flushSync(() => setGeometryMotion({ from, to, phase: "running" }));
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, durationMs);
    });
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

  const requestMode = useCallback(async (targetMode: FocusSurfaceMode, quickTask = false) => {
    if (!presentationHydrated) {
      if (quickTask) setShortcutStatus("Focus is still reconciling its presentation.");
      return;
    }
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
      // The target subtree is fully painted below the committed presentation.
      // The helper enforces prepaint -> native transaction -> renderer ownership,
      // and restores native state if renderer publication itself ever throws.
      const motionDurationMs = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 1
        : FOCUS_GEOMETRY_MOTION_MS;
      await commitPreparedFocusPresentation({
        previousPresentation,
        targetPresentation,
        waitForTargetReady: () => waitForReady(targetMode),
        applyNativePresentation: applyFocusSurfacePresentation,
        animateNativePresentation: (next) =>
          animateFocusSurfacePresentation(next, motionDurationMs),
        runConcurrentMotion: () =>
          runGeometryMotion(previousPresentation, targetPresentation, motionDurationMs),
        commitRendererPresentation: (next) => {
          flushSync(() => publishPresentation(next));
        },
      });

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
      // Native presentation commands own their physical rollback. Because the
      // committed React presentation was never changed before native success,
      // the outgoing view remains visible and authoritative on failure.
      publishPresentation(previousPresentation);
      setTransitionError(primary);
      pendingModeRef.current = null;
      setPendingMode(null);
      if (quickTaskAfterPanelRef.current) {
        quickTaskAfterPanelRef.current = false;
        setShortcutStatus(`Quick task creation could not open the Focus Panel. ${primary}`);
      }
    } finally {
      setGeometryMotion(null);
      transitionGateRef.current = false;
      setTransitionPending(false);
    }
  }, [presentationHydrated, publishPresentation, runGeometryMotion, timerResizePending, waitForReady]);

  requestModeRef.current = requestMode;

  const requestTimerExpanded = useCallback(async (expanded: boolean) => {
    if (!presentationHydrated || transitionGateRef.current || focusSurfaceModeOf(presentationRef.current) !== "timer") {
      throw new Error("Floating Timer size cannot change during another Focus presentation transition.");
    }

    const previous = presentationRef.current;
    const target: FocusSurfacePresentation = expanded ? "timerExpanded" : "timerCompact";
    if (previous === target) return;

    transitionGateRef.current = true;
    try {
      await commitPreparedFocusPresentation({
        previousPresentation: previous,
        targetPresentation: target,
        waitForTargetReady: async () => {},
        applyNativePresentation: applyFocusSurfacePresentation,
        commitRendererPresentation: publishPresentation,
      });
    } finally {
      transitionGateRef.current = false;
    }
  }, [presentationHydrated, publishPresentation]);

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
      if (!presentationHydratedRef.current) {
        deferredToggleSequenceRef.current = Math.max(
          deferredToggleSequenceRef.current ?? 0,
          sequence,
        );
        return;
      }
      lastToggleRequestRef.current = sequence;
      const currentMode = focusSurfaceModeOf(presentationRef.current);
      void requestModeRef.current(currentMode === "panel" ? "timer" : "panel");
    });

    void subscribe<number>("focus-timer-find-requested", (sequence) => {
      if (!Number.isSafeInteger(sequence) || sequence <= lastFindRequestRef.current) return;
      if (!presentationHydratedRef.current) {
        deferredFindSequenceRef.current = Math.max(
          deferredFindSequenceRef.current ?? 0,
          sequence,
        );
        return;
      }
      lastFindRequestRef.current = sequence;
      if (
        focusSurfaceModeOf(presentationRef.current) === "timer"
        && !transitionGateRef.current
        && !timerResizePendingRef.current
      ) {
        setFindTimerPulse(sequence);
      }
    });

    return () => {
      disposed = true;
      for (const stop of stops) stop();
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    let stopListening: (() => void) | undefined;

    const reconcileAuthoritativePresentation = async () => {
      const revision = presentationReconcileRevisionRef.current + 1;
      presentationReconcileRevisionRef.current = revision;
      try {
        const authoritative = await getFocusSurfacePresentation();
        if (
          !disposed
          && revision === presentationReconcileRevisionRef.current
          && !transitionGateRef.current
        ) {
          publishPresentation(authoritative);
          presentationHydratedRef.current = true;
          setPresentationHydrated(true);
        }
      } catch (failure: unknown) {
        if (!disposed && revision === presentationReconcileRevisionRef.current) {
          setTransitionError(formatInvokeError(failure));
        }
      }
    };

    // Subscribe before taking the snapshot so a native presentation commit
    // cannot fall into a snapshot/listener gap. Events are invalidation hints;
    // the authoritative native snapshot always wins. The revision token also
    // prevents slower, older IPC responses from overwriting a newer snapshot.
    void listen<FocusPresentationChanged>(FOCUS_PRESENTATION_CHANGED_EVENT, () => {
      if (disposed || transitionGateRef.current) return;
      void reconcileAuthoritativePresentation();
    })
      .then((unlisten) => {
        if (disposed) {
          unlisten();
          return;
        }
        stopListening = unlisten;
        void reconcileAuthoritativePresentation();
      })
      .catch((failure: unknown) => {
        if (!disposed) setTransitionError(formatInvokeError(failure));
      });

    return () => {
      disposed = true;
      presentationReconcileRevisionRef.current += 1;
      stopListening?.();
    };
  }, [publishPresentation]);

  useEffect(() => {
    if (!presentationHydrated) return;

    const deferredToggle = deferredToggleSequenceRef.current;
    if (deferredToggle !== null && deferredToggle > lastToggleRequestRef.current) {
      deferredToggleSequenceRef.current = null;
      lastToggleRequestRef.current = deferredToggle;
      const currentMode = focusSurfaceModeOf(presentationRef.current);
      void requestModeRef.current(currentMode === "panel" ? "timer" : "panel");
    }

    const deferredFind = deferredFindSequenceRef.current;
    if (deferredFind !== null && deferredFind > lastFindRequestRef.current) {
      deferredFindSequenceRef.current = null;
      lastFindRequestRef.current = deferredFind;
      if (
        focusSurfaceModeOf(presentationRef.current) === "timer"
        && !transitionGateRef.current
        && !timerResizePendingRef.current
      ) {
        setFindTimerPulse(deferredFind);
      }
    }
  }, [presentationHydrated]);

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

      if (!presentationHydrated) {
        setShortcutStatus("Focus is still reconciling its presentation.");
        return;
      }

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
  }, [presentationHydrated, timerResizePending]);

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
  const panelActive = presentationHydrated && mode === "panel";
  const timerActive = presentationHydrated && mode === "timer";
  const sharedTimerProjection = useMemo(() => ({
    payload: timerProjection,
    settled: timerProjectionSettled,
  }), [timerProjection, timerProjectionSettled]);

  return (
    <main
      className="focus-surface-coordinator"
      data-focus-surface-coordinator="true"
      data-focus-presentation={presentation}
      data-focus-presentation-hydrated={presentationHydrated ? "true" : "false"}
      data-focus-transition-pending={transitionPending ? "true" : "false"}
      data-focus-geometry-motion={geometryMotion ? "true" : "false"}
      data-focus-geometry-motion-from={geometryMotion?.from ?? ""}
      data-focus-geometry-motion-to={geometryMotion?.to ?? ""}
      data-focus-geometry-motion-phase={geometryMotion?.phase ?? ""}
      aria-busy={!presentationHydrated || transitionPending || timerResizePending}
    >
      {renderPanel ? (
        <section
          className="focus-surface-coordinator__presentation"
          data-focus-presentation="panel"
          data-focus-visibility={panelActive ? "active" : "preparing"}
          aria-hidden={panelActive && completionSuccess === null ? undefined : true}
          inert={!panelActive || completionSuccess !== null}
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
          aria-hidden={timerActive && completionSuccess === null ? undefined : true}
          inert={!timerActive || completionSuccess !== null}
        >
          <FloatingTimerFoundation
            sharedTimerProjection={sharedTimerProjection}
            presentationActive={timerActive}
            controlledExpanded={presentation === "timerExpanded"}
            onRequestExpanded={requestTimerExpanded}
            onReturnToPanel={() => void requestMode("panel")}
            transitionPending={transitionPending}
            transitionError={transitionError ?? timerProjectionError}
            shortcutStatus={shortcutStatus}
            onResizePendingChange={setTimerResizeBusy}
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
