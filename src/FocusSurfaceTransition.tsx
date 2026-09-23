import { useEffect, useState, type ReactNode } from "react";
import type { FocusSurfaceMode } from "./focusSurfaceModeApi";
import "./focusSurfaceTransition.css";

export function FocusSurfaceTransition({
  mode,
  children,
}: {
  mode: FocusSurfaceMode;
  children: ReactNode;
}) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className="focus-surface-transition motion-focus-surface"
      data-focus-surface-transition={mode}
      data-focus-surface-entered={entered ? "true" : "false"}
    >
      {children}
    </div>
  );
}
