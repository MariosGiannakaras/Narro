import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BlitzEntryButton } from "./BlitzEntryButton";
import { ThemeRuntimeProvider } from "./ThemeRuntime";
import { TimerSessionProjection } from "./TimerSessionProjection";
import "./taskScheduleDialog.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeRuntimeProvider>
      <App />
      <BlitzEntryButton />
      <TimerSessionProjection label="Main" />
    </ThemeRuntimeProvider>
  </React.StrictMode>,
);
