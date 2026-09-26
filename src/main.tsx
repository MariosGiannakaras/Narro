import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BlitzEntryButton } from "./BlitzEntryButton";
import { ThemeRuntimeProvider } from "./ThemeRuntime";
import { PomodoroResumePrompt } from "./PomodoroResumePrompt";
import { TimerSessionProjection } from "./TimerSessionProjection";
import "./taskScheduleDialog.css";

const diagnosticMode = new URLSearchParams(window.location.search).get("diagnostics") === "1";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeRuntimeProvider>
      <App />
      <BlitzEntryButton />
      <PomodoroResumePrompt />
      {diagnosticMode ? <TimerSessionProjection label="Main" /> : null}
    </ThemeRuntimeProvider>
  </React.StrictMode>,
);
