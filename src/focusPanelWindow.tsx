import { emitTo, listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useRef, useState } from "react";
import { FocusCompletionSuccess, type FocusCompletionSuccessState } from "./FocusCompletionSuccess";
import { FocusPanel } from "./FocusPanel";
import { SearchPalette } from "./SearchPalette";
import { formatInvokeError } from "./diagnosticApi";
import {
  FOCUS_MODE_CHANGED_EVENT,
  FOCUS_MODE_REQUEST_EVENT,
  TIMER_PRESENTATION_QUERY_EVENT,
  TIMER_PRESENTATION_READY_EVENT,
  TIMER_RESIZE_BUSY_EVENT,
  type FocusModeRequest,
  type TimerPresentationReady,
} from "./focusWindowEvents";
import {
  getFocusSurfaceMode,
  prepareFloatingTimer,
  prepareFocusPanel,
  presentFloatingTimer,
  presentFocusPanel,
  revealFloatingTimer,
  revealFocusPanel,
  type FocusSurfaceMode,
} from "./focusSurfaceModeApi";
import { isEditableShortcutTarget, isFocusActionShortcut, resolveInAppShortcut } from "./inAppShortcuts";
import { switchPersistentFocusWindows } from "./persistentFocusWindowTransition";
import { snapshotTimerSession, startTimerTask } from "./timerSessionApi";

// The Panel renderer is the sole coordinator. The Timer renderer only requests
// a mode change, so two independent WebViews cannot race to change windows.
export function FocusPanelWindow() {
  const modeRef = useRef<FocusSurfaceMode>("panel");
  const busyRef = useRef(false);
  const timerResizeBusyRef = useRef(false);
  const timerReadyRef = useRef(false);
  const timerReadyWaitersRef = useRef(new Set<(payload: TimerPresentationReady) => void>());
  const expectedTimerReadyRequestRef = useRef(0);
  const lastToggleRequestRef = useRef(0);
  const quickTaskAfterPanelRef = useRef(false);
  const requestModeRef = useRef<(mode: FocusSurfaceMode, quickTask?: boolean) => Promise<void>>(async () => {});
  const [transitionPending, setTransitionPending] = useState(false);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [shortcutStatus, setShortcutStatus] = useState<string | null>(null);
  const [quickTaskOpen, setQuickTaskOpen] = useState(false);
  const [focusRefreshKey, setFocusRefreshKey] = useState(0);
  const [completionSuccess, setCompletionSuccess] = useState<FocusCompletionSuccessState | null>(null);
  const [completionSuccessPending, setCompletionSuccessPending] = useState(false);
  const [completionSuccessError, setCompletionSuccessError] = useState<string | null>(null);

  const markTimerReady = useCallback((payload: TimerPresentationReady) => {
    if (payload.requestId !== expectedTimerReadyRequestRef.current) return;
    timerReadyRef.current = true;
    for (const resolve of timerReadyWaitersRef.current) resolve(payload);
    timerReadyWaitersRef.current.clear();
  }, []);

  const waitForTimerReady = async (): Promise<void> => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const requestId = ++expectedTimerReadyRequestRef.current;
      timerReadyRef.current = false;
      let timeout: number | undefined;
      let query: number | undefined;
      let resolveReady: ((payload: TimerPresentationReady) => void) | undefined;
      try {
        const ready = await new Promise<TimerPresentationReady>((resolve, reject) => {
          resolveReady = resolve;
          timerReadyWaitersRef.current.add(resolve);
          timeout = window.setTimeout(() => {
            timerReadyWaitersRef.current.delete(resolve);
            reject(new Error("Floating Timer did not finish loading."));
          }, 7000);
          const ask = () => { void emitTo("floatingTimer", TIMER_PRESENTATION_QUERY_EVENT, requestId).catch(() => {}); };
          ask();
          query = window.setInterval(ask, 300);
        });
        const authoritative = await snapshotTimerSession();
        if (ready.revision === authoritative.revision
          && ready.taskId === authoritative.runtime.timer.task_id
          && ready.openSessionId === authoritative.runtime.open_session_id) return;
      } finally {
        if (timeout !== undefined) window.clearTimeout(timeout);
        if (query !== undefined) window.clearInterval(query);
        if (resolveReady) timerReadyWaitersRef.current.delete(resolveReady);
      }
    }
    throw new Error("Floating Timer state changed during presentation preparation.");
  };

  async function requestMode(targetMode: FocusSurfaceMode, quickTask = false): Promise<void> {
    if (busyRef.current || timerResizeBusyRef.current) return;
    busyRef.current = true;
    setTransitionPending(true);
    setTransitionError(null);
    if (quickTask) quickTaskAfterPanelRef.current = true;
    let previousMode = modeRef.current;
    try {
      previousMode = await getFocusSurfaceMode();
      modeRef.current = previousMode;
      if (targetMode !== previousMode) {
        // The source remains visible while the already-mounted target WebView
        // is prepared. No source bitmap, WebView resize or hide/prewarm occurs.
        await switchPersistentFocusWindows({
          previousMode,
          targetMode,
          prepareMode: (mode) => mode === "timer" ? prepareFloatingTimer() : prepareFocusPanel(),
          waitForModeReady: (mode) => mode === "timer" ? waitForTimerReady() : Promise.resolve(),
          revealMode: (mode) => mode === "timer" ? revealFloatingTimer() : revealFocusPanel(),
          restoreMode: (mode) => mode === "timer" ? presentFloatingTimer() : presentFocusPanel(),
        });
        modeRef.current = targetMode;
        if (targetMode === "panel") setFocusRefreshKey((value) => value + 1);
      }
      if (targetMode === "panel" && quickTaskAfterPanelRef.current) {
        quickTaskAfterPanelRef.current = false;
        setQuickTaskOpen(true);
      }
    } catch (failure: unknown) {
      const error = formatInvokeError(failure);
      if (targetMode === "panel" && quickTaskAfterPanelRef.current) {
        quickTaskAfterPanelRef.current = false;
        setShortcutStatus(`Quick task creation could not open the Focus Panel. ${error}`);
      } else {
        setTransitionError(error);
      }
      modeRef.current = previousMode;
    } finally {
      busyRef.current = false;
      setTransitionPending(false);
    }
  }
  requestModeRef.current = requestMode;

  useEffect(() => {
    let disposed = false;
    const stops: Array<() => void> = [];
    const subscribe = async <T,>(name: string, callback: (value: T) => void) => {
      try {
        const stop = await listen<T>(name, (event) => { if (!disposed) callback(event.payload); });
        if (disposed) stop();
        else stops.push(stop);
      } catch (failure: unknown) {
        if (!disposed) setTransitionError(formatInvokeError(failure));
      }
    };
    void getFocusSurfaceMode().then((mode) => { if (!disposed) modeRef.current = mode; })
      .catch((failure: unknown) => { if (!disposed) setTransitionError(formatInvokeError(failure)); });
    void subscribe<number>("focus-surface-toggle-requested", (sequence) => {
      if (!Number.isSafeInteger(sequence) || sequence <= lastToggleRequestRef.current) return;
      lastToggleRequestRef.current = sequence;
      void requestModeRef.current(modeRef.current === "panel" ? "timer" : "panel");
    });
    void subscribe<FocusModeRequest>(FOCUS_MODE_REQUEST_EVENT, (request) => {
      if (request?.mode === "panel" || request?.mode === "timer") {
        void requestModeRef.current(request.mode, request.quickTask === true);
      }
    });
    void subscribe<TimerPresentationReady>(TIMER_PRESENTATION_READY_EVENT, markTimerReady);
    void subscribe<boolean>(TIMER_RESIZE_BUSY_EVENT, (busy) => {
      timerResizeBusyRef.current = busy;
    });
    void subscribe<FocusSurfaceMode>(FOCUS_MODE_CHANGED_EVENT, (mode) => {
      if (mode === "panel" || mode === "timer") modeRef.current = mode;
    });
    return () => { disposed = true; for (const stop of stops) stop(); };
  }, [markTimerReady]);

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
        void snapshotTimerSession().then((payload) => {
          if (payload.runtime.timer.state === "idle" || payload.runtime.timer.task_id === null) {
            setShortcutStatus("No active Focus task is available for this shortcut.");
          }
        }).catch((failure: unknown) => {
          setShortcutStatus(`Focus shortcut state could not be read. ${formatInvokeError(failure)}`);
        });
        return;
      }
      if (shortcut !== "create-task" || isEditableShortcutTarget(event.target)) return;
      event.preventDefault();
      if (busyRef.current) {
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

  const recordCompletionSuccess = (state: FocusCompletionSuccessState) => {
    setCompletionSuccess(state);
    setCompletionSuccessPending(false);
    setCompletionSuccessError(null);
    setFocusRefreshKey((value) => value + 1);
  };

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
      await startTimerTask(success.nextTask.id, success.nextTask.mode);
      setCompletionSuccess(null);
      setFocusRefreshKey((value) => value + 1);
    } catch (failure: unknown) {
      setCompletionSuccessError(formatInvokeError(failure));
    } finally {
      setCompletionSuccessPending(false);
    }
  };

  return (
    <>
      <FocusPanel
        onRequestCompact={() => void requestMode("timer")}
        compactTransitionPending={transitionPending}
        modeTransitionError={transitionError}
        shortcutStatus={shortcutStatus}
        refreshKey={focusRefreshKey}
        onCompletionSuccess={recordCompletionSuccess}
      />
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
          setFocusRefreshKey((value) => value + 1);
          setShortcutStatus("Task added.");
        }}
      />
    </>
  );
}
