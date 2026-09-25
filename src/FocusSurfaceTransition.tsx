import { useEffect, useRef, useState, type ReactNode } from "react";
import type { FocusSurfaceMode } from "./focusSurfaceModeApi";
import { waitForOpacityTransition } from "./opacityTransition";
import "./focusSurfaceTransition.css";

export function FocusSurfaceTransition({
  mode,
  children,
  exiting = false,
  prepainted = false,
  onExitComplete,
  onExitFailure,
}: {
  mode: FocusSurfaceMode;
  children: ReactNode;
  exiting?: boolean;
  prepainted?: boolean;
  onExitComplete?: () => void;
  onExitFailure?: (failure: unknown) => void;
}) {
  const [entered, setEntered] = useState(prepainted);
  const [exitSettled, setExitSettled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const completionRef = useRef(onExitComplete);
  const failureRef = useRef(onExitFailure);
  completionRef.current = onExitComplete;
  failureRef.current = onExitFailure;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!exiting) {
      setExitSettled(false);
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;
    void waitForOpacityTransition(root, 0.45)
      .then(() => {
        if (cancelled) return;
        setExitSettled(true);
        completionRef.current?.();
      })
      .catch((failure: unknown) => {
        if (!cancelled) failureRef.current?.(failure);
      });
    return () => {
      cancelled = true;
    };
  }, [exiting]);

  return (
    <div
      ref={rootRef}
      className="focus-surface-transition motion-focus-surface"
      data-focus-surface-transition={mode}
      data-focus-surface-entered={entered ? "true" : "false"}
      data-focus-surface-exiting={exiting ? "true" : "false"}
      data-focus-surface-prepainted={prepainted ? "true" : "false"}
      data-focus-surface-exit-settled={exitSettled ? "true" : "false"}
    >
      {children}
    </div>
  );
}
