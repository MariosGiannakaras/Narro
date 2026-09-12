import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        focus: "focus.html",
        visualFixtures: "visual-fixtures.html",
        taskReorderFixture: "task-reorder-fixture.html",
        taskMetricFixture: "task-metric-fixture.html",
        taskScheduleFixture: "task-schedule-fixture.html",
        taskNotesFixture: "task-notes-fixture.html",
        taskSubtasksFixture: "task-subtasks-fixture.html",
        listSettingsFixture: "list-settings-fixture.html",
        searchPaletteFixture: "search-palette-fixture.html",
        archiveFixture: "archive-fixture.html",
        themeSettingsFixture: "theme-settings-fixture.html",
      },
    },
  },

  // Tauri expects a fixed port and uses TAURI_DEV_HOST only for desktop development.
  clearScreen: false,
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
      ignored: ["**/src-tauri/**"],
    },
  },
}));
