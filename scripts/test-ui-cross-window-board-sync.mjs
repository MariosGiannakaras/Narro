import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const invariant = (condition, message) => {
  if (!condition) throw new Error(`Cross-window board sync contract failed: ${message}`);
};

const invalidation = read("src/boardInvalidation.ts");
const boardApi = read("src/listBoardApi.ts");
const scheduleApi = read("src/taskScheduleApi.ts");
const timerApi = read("src/timerSessionApi.ts");
const listBoard = read("src/ListBoard.tsx");
const focusPanel = read("src/FocusPanel.tsx");
const appShell = read("src/AppShell.tsx");
const pkg = JSON.parse(read("package.json"));

invariant(
  invalidation.includes('BOARD_INVALIDATED_EVENT = "board-data-invalidated"')
    && invalidation.includes("await emit(BOARD_INVALIDATED_EVENT)")
    && invalidation.includes("catch {")
    && invalidation.includes("listen(BOARD_INVALIDATED_EVENT"),
  "board invalidation must broadcast best-effort and never convert committed persistence into a mutation failure",
);

for (const [source, command] of [
  [boardApi, "create_list_board_task"],
  [boardApi, "complete_list_board_task"],
  [boardApi, "set_list_board_subtask_completion"],
  [scheduleApi, "update_list_board_task_schedule"],
  [scheduleApi, "save_list_board_task_recurrence"],
  [timerApi, "timer_complete_task"],
  [timerApi, "timer_switch_task"],
]) {
  invariant(
    source.includes(command) && source.includes("emitBoardInvalidated"),
    `${command} must publish a board invalidation after authoritative success`,
  );
}

for (const [source, label] of [
  [listBoard, "Main ListBoard"],
  [focusPanel, "Focus Panel"],
  [appShell, "Home shell"],
]) {
  invariant(
    source.includes("listenForBoardInvalidation"),
    `${label} must subscribe to cross-window board invalidation`,
  );
}

invariant(
  listBoard.includes("getListBoardSnapshot(refreshTarget)")
    && listBoard.includes("externalRefreshRevisionRef"),
  "Main ListBoard must re-read the authoritative target with stale-response protection",
);
invariant(
  focusPanel.includes("getListBoardSnapshot(refreshTarget)")
    && focusPanel.includes("currentTargetKeyRef.current === expectedTargetKey")
    && focusPanel.includes("externalBoardRefreshRevisionRef"),
  "Focus Panel must re-read the current authoritative target without applying stale responses",
);
invariant(
  appShell.includes("setHomeRefreshKey((value) => value + 1)"),
  "Home projection must invalidate after cross-window task changes",
);
invariant(
  pkg.scripts["test:ui-cross-window-board-sync"] === "node scripts/test-ui-cross-window-board-sync.mjs"
    && pkg.scripts["preflight:frontend"].includes("npm run test:ui-cross-window-board-sync"),
  "cross-window board synchronization regression must run in frontend preflight",
);

console.log("Cross-window authoritative board synchronization contracts passed.");
