import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Q04: execute the actual current TSX handler bodies, not a stand-alone
// reimplementation of an exclusive Promise mutex. Native IPC is controlled
// through deterministic deferred promises, not Windows/SQLite simulation.
const boardSource = fs.readFileSync("src/ListBoard.tsx", "utf8");
const paletteSource = fs.readFileSync("src/SearchPalette.tsx", "utf8");

function extract(source, start, end) {
  const first = source.indexOf(start);
  const after = source.indexOf(end, first + start.length);
  assert(first >= 0 && after > first, `Missing production handler: ${start}`);
  return source.slice(first, after).trim();
}
function actualHandler(source, start, end, name, variables) {
  const declaration = extract(source, start, end);
  const transpiled = ts.transpileModule(
    `(() => {\n${declaration}\nreturn ${name};\n})()`,
    { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
  ).outputText;
  const callback = vm.runInNewContext(transpiled, variables, { timeout: 3000 });
  assert.equal(typeof callback, "function");
  return callback;
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function createBoardHarness() {
  const calls = { creates: 0, duplicates: 0, refreshes: 0, errors: [], statuses: [],
    editorUpdates: [], pending: [], mutationPending: [], blocked: [] };
  const context = {
    interactionBoardEnabled: true, target: {kind: "list", id: "list-a"},
    editorState: {kind: "create", title: "My task", est: "", lane: "today", insertAtTop: false},
    editorMutationPending: false, mutationPendingTaskId: null, mutationRefreshBlocked: false,
    createInFlightRef: {current: false}, duplicateInFlightRef: {current: false},
    autoParseEstFromTitle: false, LANE_TOKEN: {today: "today"},
    parseMetricDuration: () => ({ok: true, seconds: null}), parseEstimateSuffix: () => null,
    createListBoardTask: async () => { calls.creates++; return "created"; },
    duplicateListBoardTask: async () => { calls.duplicates++; return "duplicated"; },
    refreshAfterMutation: async () => { calls.refreshes++; },
    setEditorMutationPending: value => calls.pending.push(value),
    setMutationPendingTaskId: value => calls.mutationPending.push(value),
    setMutationError: value => calls.errors.push(value),
    setMutationStatus: value => calls.statuses.push(value),
    setMutationRefreshBlocked: value => calls.blocked.push(value),
    setEditorState: value => calls.editorUpdates.push(value),
    handleCommittedRefreshFailure: error => calls.errors.push("COMMITTED: " + String(error)),
    formatInvokeError: error => String(error.message ?? error),
  };
  return {
    calls, context,
    create: actualHandler(boardSource, "  const submitCreate = async () => {",
      "  const submitTitleEdit = async () => {", "submitCreate", context),
    duplicate: actualHandler(boardSource, "  const duplicateTaskFromBoard = async (",
      "  const handleCommittedSubtaskRefreshFailure", "duplicateTaskFromBoard", context),
  };
}
function createSearchHarness() {
  const calls = {writes: 0, errors: [], closes: 0, navigations: 0, pending: []};
  const context = {
    quickTaskPending: false, quickTaskInFlightRef: {current: false},
    quickTaskTitle: "New task", quickTaskListId: "list-a", quickTaskLane: "today",
    preferences: {snapshot: {general: {autoParseEstFromTitle: false}}},
    parseEstimateSuffix: () => null,
    suppressFocusRestoreRef: {current: false},
    setQuickTaskPending: value => calls.pending.push(value),
    setQuickTaskError: value => calls.errors.push(value),
    formatInvokeError: error => String(error.message ?? error),
    createListBoardTask: async () => {calls.writes++; return "created-search-task";},
    onRequestClose: () => {calls.closes++;},
    onTaskCreated: (list, id) => {assert.equal(list, "list-a"); assert.equal(id, "created-search-task"); calls.navigations++;},
  };
  return {
    calls, context,
    submit: actualHandler(paletteSource, "  const submitQuickTask = async (",
      "  const renderSearchSurface = () => {", "submitQuickTask", context),
    event: {preventDefault() {}},
  };
}
// Real Board create: same-render duplicate rejected before its first write
// settles and still excluded through an independently delayed refresh.
{
  const h = createBoardHarness(), write = deferred(), refresh = deferred();
  h.context.createListBoardTask = async () => { h.calls.creates++; return await write.promise; };
  h.context.refreshAfterMutation = async () => {h.calls.refreshes++; return refresh.promise;};
  const first = h.create();
  await h.create();
  assert.equal(h.calls.creates, 1);
  assert.equal(h.context.createInFlightRef.current, true);
  write.resolve("created"); await Promise.resolve(); await Promise.resolve();
  await h.create();
  assert.equal(h.calls.creates, 1, "a committed write still owns the post-commit refresh");
  refresh.resolve(); await first;
  assert.equal(h.context.createInFlightRef.current, false);
  assert.deepEqual(h.calls.pending, [true, false]);
  await h.create();
  assert.equal(h.calls.creates, 2, "a completed legitimate second create must be allowed");
}
// Failed create releases; a successful native write with failed refresh must
// not retain the inline draft for accidental duplicate retry.
{
  const h = createBoardHarness();
  h.context.createListBoardTask = async () => {h.calls.creates++; throw new Error("native create failed");};
  await h.create();
  assert.equal(h.calls.creates, 1);
  assert.equal(h.context.createInFlightRef.current, false);
  assert.match(String(h.calls.errors.at(-1)), /native create failed/);
  h.context.createListBoardTask = async () => {h.calls.creates++; return "created";};
  h.context.refreshAfterMutation = async () => {throw new Error("read failed after commit");};
  await h.create();
  assert.equal(h.calls.creates, 2);
  assert(h.calls.editorUpdates.includes(null), "successful commit must close draft if refresh fails");
  assert(h.calls.errors.some(x => String(x).includes("COMMITTED:")));
  assert.equal(h.context.createInFlightRef.current, false);
}
// Board duplicate has its own immediate owner; two repeats cannot duplicate
// the same source task while native work/readback is in flight.
{
  const h = createBoardHarness(), write = deferred(), refresh = deferred();
  h.context.duplicateListBoardTask = async () => {h.calls.duplicates++; return write.promise;};
  h.context.refreshAfterMutation = async () => {h.calls.refreshes++; return refresh.promise;};
  const sourceTask = {id:"task-a", listId:"list-a", title:"Example"};
  const first = h.duplicate(sourceTask);
  await h.duplicate(sourceTask);
  assert.equal(h.calls.duplicates, 1);
  write.resolve("new-id"); await Promise.resolve(); await Promise.resolve();
  await h.duplicate(sourceTask);
  assert.equal(h.calls.duplicates, 1);
  refresh.resolve(); await first;
  assert.equal(h.context.duplicateInFlightRef.current, false);
  await h.duplicate(sourceTask);
  assert.equal(h.calls.duplicates, 2);
}
// Search Quick Task: live production handler holds owner across callbacks,
// releases after close, and permits a second create in the SAME mounted dialog.
{
  const h = createSearchHarness(), write = deferred();
  h.context.createListBoardTask = async () => {h.calls.writes++; return write.promise;};
  const first = h.submit(h.event);
  await h.submit(h.event);
  assert.equal(h.calls.writes, 1);
  assert.equal(h.context.quickTaskInFlightRef.current, true);
  write.resolve("created-search-task"); await first;
  assert.equal(h.calls.closes, 1);
  assert.equal(h.calls.navigations, 1);
  assert.equal(h.context.quickTaskInFlightRef.current, false);
  await h.submit(h.event);
  assert.equal(h.calls.writes, 2, "a reopened persistent SearchPalette must not retain the lock");
}
// Search error and post-commit callback error both release the production ref.
{
  const h = createSearchHarness();
  h.context.createListBoardTask = async () => {h.calls.writes++; throw new Error("write failed");};
  await h.submit(h.event);
  assert.equal(h.context.quickTaskInFlightRef.current, false);
  assert.match(String(h.calls.errors.at(-1)), /write failed/);
  h.context.createListBoardTask = async () => {h.calls.writes++; return "created-search-task";};
  h.context.onTaskCreated = () => {throw new Error("navigation failed");};
  await assert.rejects(h.submit(h.event), /navigation failed/);
  assert.equal(h.context.quickTaskInFlightRef.current, false);
  assert.equal(h.calls.writes, 2);
}
console.log("Actual Board Create/Duplicate and Search Quick Task handlers: native same-render ownership, post-commit, failure/reopen PASS.");
