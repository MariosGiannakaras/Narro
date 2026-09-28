import { emitTo, listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useRef, useState } from "react";
import { FloatingTimerFoundation } from "./FloatingTimerFoundation";
import { FocusCompletionSuccess, type FocusCompletionSuccessState } from "./FocusCompletionSuccess";
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
import { getFocusSurfaceMode, type FocusSurfaceMode } from "./focusSurfaceModeApi";
import { isEditableShortcutTarget, isFocusActionShortcut, resolveInAppShortcut } from "./inAppShortcuts";
import { waitForPresentedFrame } from "./presentationFrame";
import { snapshotTimerSession, startTimerTask, type TimerSessionPayload } from "./timerSessionApi";

export function FloatingTimerWindow() {
  const readyRef = useRef<TimerSessionPayload | null>(null);
  const queryIdRef = useRef<number | null>(null);
  const modeRef = useRef<FocusSurfaceMode>("panel");
  const resizePendingRef = useRef(false);
  const lastFindRequestRef = useRef(0);
  const [findTimerPulse, setFindTimerPulse] = useState<number | null>(null);
  const [shortcutStatus, setShortcutStatus] = useState<string | null>(null);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [resizePending, setResizePending] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [completionSuccess, setCompletionSuccess] = useState<FocusCompletionSuccessState | null>(null);
  const [completionSuccessPending, setCompletionSuccessPending] = useState(false);
  const [completionSuccessError, setCompletionSuccessError] = useState<string | null>(null);

  const announceReady = useCallback(async (rendered: TimerSessionPayload) => {
    const requestId = queryIdRef.current;
    if (requestId === null) return;
    await waitForPresentedFrame();
    const authoritative = await snapshotTimerSession();
    if (queryIdRef.current !== requestId) return;
    if (authoritative.revision !== rendered.revision
      || authoritative.runtime.timer.task_id !== rendered.runtime.timer.task_id
      || authoritative.runtime.open_session_id !== rendered.runtime.open_session_id) {
      readyRef.current = null;
      setRefreshKey((value) => value + 1);
      return;
    }
    const payload: TimerPresentationReady = {
      requestId,
      revision: rendered.revision,
      taskId: rendered.runtime.timer.task_id,
      openSessionId: rendered.runtime.open_session_id,
    };
    await emitTo("focusSurface", TIMER_PRESENTATION_READY_EVENT, payload);
    if (queryIdRef.current === requestId) queryIdRef.current = null;
  }, []);

  const onPresentationReady = useCallback((payload: TimerSessionPayload | null) => {
    if (!payload) return;
    readyRef.current = payload;
    void announceReady(payload).catch((failure: unknown) => setTransitionError(formatInvokeError(failure)));
  }, [announceReady]);

  useEffect(() => {
    let disposed = false;
    const stops: Array<() => void> = [];
    const subscribe = async <T,>(name: string, callback: (payload: T) => void) => {
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
    void subscribe<number>(TIMER_PRESENTATION_QUERY_EVENT, (requestId) => {
      if (!Number.isSafeInteger(requestId)) return;
      if (queryIdRef.current !== requestId) {
        queryIdRef.current = requestId;
        readyRef.current = null;
        setRefreshKey((value) => value + 1);
      } else if (readyRef.current) {
        void announceReady(readyRef.current)
          .catch((failure: unknown) => setTransitionError(formatInvokeError(failure)));
      }
    });
    void subscribe<FocusSurfaceMode>(FOCUS_MODE_CHANGED_EVENT, (mode) => {
      if (mode === "panel" || mode === "timer") {
        modeRef.current = mode;
        if (mode !== "timer") setFindTimerPulse(null);
      }
    });
    void subscribe<number>("focus-timer-find-requested", (sequence) => {
      if (!Number.isSafeInteger(sequence) || sequence <= lastFindRequestRef.current) return;
      lastFindRequestRef.current = sequence;
      if (modeRef.current === "timer" && !resizePendingRef.current) setFindTimerPulse(sequence);
    });
    return () => { disposed = true; for (const stop of stops) stop(); };
  }, [announceReady]);

  const requestPanel = useCallback(async (quickTask = false) => {
    try {
      const payload: FocusModeRequest = { mode: "panel", quickTask };
      await emitTo("focusSurface", FOCUS_MODE_REQUEST_EVENT, payload);
      setTransitionError(null);
    } catch (failure: unknown) {
      setTransitionError(formatInvokeError(failure));
    }
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
      if (resizePending) {
        setShortcutStatus("Quick task creation is unavailable while the Timer changes size.");
        return;
      }
      void requestPanel(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [requestPanel, resizePending]);

  useEffect(() => {
    if (!shortcutStatus) return;
    const timeout = window.setTimeout(() => setShortcutStatus(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [shortcutStatus]);

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
    } catch (failure: unknown) {
      setCompletionSuccessError(formatInvokeError(failure));
    } finally {
      setCompletionSuccessPending(false);
    }
  };

  return (
    <>
      <FloatingTimerFoundation
        onReturnToPanel={() => void requestPanel()}
        transitionError={transitionError}
        shortcutStatus={shortcutStatus}
        onResizePendingChange={(pending) => {
          resizePendingRef.current = pending;
          setResizePending(pending);
          void emitTo("focusSurface", TIMER_RESIZE_BUSY_EVENT, pending)
            .catch((failure: unknown) => setTransitionError(formatInvokeError(failure)));
        }}
        attentionPulseSequence={findTimerPulse}
        onAttentionPulseEnd={(sequence) => {
          setFindTimerPulse((current) => current === sequence ? null : current);
        }}
        onPresentationReady={onPresentationReady}
        refreshKey={refreshKey}
        onCompletionSuccess={(state) => {
          setCompletionSuccess(state);
          setCompletionSuccessPending(false);
          setCompletionSuccessError(null);
        }}
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
    </>
  );
}
