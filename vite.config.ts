import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { physicalTracePlugin } from "./scripts/physical-trace-vite.mjs";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  // @ts-expect-error process is a nodejs global
  plugins: [physicalTracePlugin(process.env.NARRO_PHYSICAL_FRONTEND === "1"), react()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        focus: "focus.html",
        visualFixtures: "visual-fixtures.html",
        focusPanelFixture: "focus-panel-fixture.html",
        focusEditorFixture: "focus-editor-fixture.html",
        floatingTimerFixture: "floating-timer-fixture.html",
        taskReorderFixture: "task-reorder-fixture.html",
        taskMetricFixture: "task-metric-fixture.html",
        taskScheduleFixture: "task-schedule-fixture.html",
        taskNotesFixture: "task-notes-fixture.html",
        taskSubtasksFixture: "task-subtasks-fixture.html",
        listSettingsFixture: "list-settings-fixture.html",
        searchPaletteFixture: "search-palette-fixture.html",
        archiveFixture: "archive-fixture.html",
        themeSettingsFixture: "theme-settings-fixture.html",
        reportsFixture: "reports-fixture.html",
      },
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
