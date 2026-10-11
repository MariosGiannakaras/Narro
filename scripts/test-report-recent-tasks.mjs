import assert from "node:assert/strict";
import fs from "node:fs";
import { orderRecentSessionTasks } from "../src/recentSessionTaskChoices.ts";

const task = (id, updatedAt) => ({
  id,
  title: id,
  listId: "list-a",
  listTitle: "Work",
  listColor: "#45baca",
  lane: "Today",
  updatedAt,
});
const choices = Object.freeze([
  Object.freeze(task("legacy-no-time", null)),
  Object.freeze(task("older", "2026-10-09T09:00:00Z")),
  Object.freeze(task("newer", "2026-10-12T10:00:00+03:00")),
  Object.freeze(task("newest", "2026-10-12T08:00:00Z")),
  Object.freeze(task("same-instant", "2026-10-12T11:00:00+03:00")),
  Object.freeze(task("malformed", "not-a-timestamp")),
]);
const ranked = orderRecentSessionTasks(choices);
assert.deepEqual(
  ranked.map((value) => value.id),
  ["newest", "same-instant", "newer", "older", "legacy-no-time", "malformed"],
  "recent task choice ordering must use comparable instants and stable ties, with missing timestamps last",
);
assert.deepEqual(
  choices.map((value) => value.id),
  ["legacy-no-time", "older", "newer", "newest", "same-instant", "malformed"],
  "ranking must not mutate the upstream global search/board order",
);
assert.equal(ranked[0].listColor, "#45baca", "saved list badge metadata must be preserved");
assert.deepEqual(orderRecentSessionTasks([]), [], "empty task picker remains empty");
assert.deepEqual(
  orderRecentSessionTasks([task("a", undefined), task("b", "invalid")]).map((value) => value.id),
  ["a", "b"],
  "invalid or absent historical timestamps retain stable source order",
);

const boardRust = fs.readFileSync("src-tauri/src/list_board.rs", "utf8");
const typedBoard = fs.readFileSync("src/listBoardApi.ts", "utf8");
const searchApi = fs.readFileSync("src/searchPaletteApi.ts", "utf8");
const reportsView = fs.readFileSync("src/ReportsSessionsView.tsx", "utf8");
assert(boardRust.includes("pub updated_at: String"),
  "authoritative board projection must expose the already persisted task.updated_at");
assert(boardRust.includes("updated_at: projected.task.updated_at,"),
  "board projection must copy saved task update time without synthetic recency writes");
assert(typedBoard.includes("updatedAt?: string | null"),
  "client read DTO must support historical fixture payloads without manufactured timestamps");
assert(searchApi.includes("updatedAt: task.updatedAt ?? null"),
  "shared Search API retains persisted timestamp metadata without sorting its own results");
assert(reportsView.includes("orderRecentSessionTasks(tasks)"),
  "only Add Session picker should rank by task recency");
assert(reportsView.includes("const filtered = orderedTasks.filter("),
  "picker must filter ranked tasks before its existing twelve-choice cap");
assert(reportsView.includes("filtered.slice(0, 12)"),
  "the original picker visible-choice cap must remain");
assert(reportsView.includes('aria-label="Recent Tasks"'),
  "source-backed Recent Tasks heading and accessible name must remain");

console.log("Recent Tasks U35 local updated_at ordering and source-owner contracts: PASS");
