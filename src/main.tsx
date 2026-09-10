import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { TimerSessionProjection } from "./TimerSessionProjection";
import "./taskScheduleDialog.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
    <TimerSessionProjection label="Main" />
  </React.StrictMode>,
);
