import React from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import { FloatingTimerWindow } from "./floatingTimerWindow";
import { ThemeRuntimeProvider } from "./ThemeRuntime";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeRuntimeProvider>
      <FloatingTimerWindow />
    </ThemeRuntimeProvider>
  </React.StrictMode>,
);
