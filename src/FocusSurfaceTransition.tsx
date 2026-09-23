import { useEffect, useRef, useState, type ReactNode } from "react";
import type { FocusSurfaceMode } from "./focusSurfaceModeApi";
import "./focusSurfaceTransition.css";

export function FocusSurfaceTransition({
  mode,
  children,
  exiting = false,
  onExitComplete,
}: {
  mode: FocusSurfaceMode;
  children: ReactNode;
  exiting?: boolean;
  onExitComplete?: () => void;
}) {
  const [entered, setEntered] = useState(false);
  const [exitSettled, setExitSettled] = useState(false);
  const exitNotifiedRef = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!exiting) {
      exitNotifiedRef.current = false;
      setExitSettled(false);
    }
  }, [exiting]);

  const completeExit = () => {
    if (!exiting || exitNotifiedRef.current) return;
    exitNotifiedRef.current = true;
    setExitSettled(true);
    onExitComplete?.();
  };

  return (
    <div
      className="focus-surface-transition motion-focus-surface"
      data-focus-surface-transition={mode}
      data-focus-surface-entered={entered ? "true" : "false"}
      data-focus-surface-exiting={exiting ? "true" : "false"}
      data-focus-surface-exit-settled={exitSettled ? "true" : "false"}
      onTransitionEnd={(event) => {
        if (event.currentTarget !== event.target) return;
        if (event.propertyName !== "opacity" && event.propertyName !== "transform") return;
        completeExit();
      }}
    >
      {children}
    </div>
  );
}
