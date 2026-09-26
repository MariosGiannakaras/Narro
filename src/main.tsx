import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BlitzEntryButton } from "./BlitzEntryButton";
import { PomodoroResumePrompt } from "./PomodoroResumePrompt";
import { ThemeRuntimeProvider } from "./ThemeRuntime";
import "./taskScheduleDialog.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeRuntimeProvider>
      <App />
      <BlitzEntryButton />
      <PomodoroResumePrompt />
    </ThemeRuntimeProvider>
  </React.StrictMode>,
);
