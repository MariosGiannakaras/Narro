import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { ThemeSettingsPanelView } from "./ThemeSettingsPanel";
import type { ThemePreference } from "./themeApi";

const params = new URLSearchParams(window.location.search);
const requested = params.get("preference");
const theme: ThemePreference = requested === "dark" || requested === "light" ? requested : "system";
const error = params.get("error") === "1"
  ? "[THEME_PREFERENCE_FAILED] The theme preference could not be saved."
  : null;

document.documentElement.dataset.theme = theme;
document.body.classList.add("visual-fixture-body");
document.body.dataset.themeSettingsPreference = theme;

const root = document.getElementById("root");
if (!root) throw new Error("Theme settings fixture root is missing.");

flushSync(() => {
  createRoot(root).render(
    <ThemeSettingsPanelView
      theme={theme}
      error={error}
      onSelectTheme={() => undefined}
    />,
  );
});

document.documentElement.dataset.themeSettingsFixtureReady = "true";
