import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Actual FocusPanel TypeScript event-handler bodies, not a separately modeled
// mutex. Drive same-render competing callbacks with deferred native writes,
// post-commit reads, and a native Home pause→failed exit→resume rollback.
const source = fs.readFileSync("src/FocusPanel.tsx", "utf8");
const boundaries = [
  ["  const commitRowMutation = async (", "  const makeTaskLive = async ("],
  ["  const makeTaskLive = async (", "  const requestTaskChangeList = ("],
  ["  const exitFocusHome = async () => {", "  const submitAddTask = async () => {"],
  ["  const submitAddTask = async () => {", "  const confirmDelete = async () => {"],
  ["  const confirmDelete = async () => {", "  const statusError = "],
];
const fragments = boundaries.map(([start, end]) => {
  const i = source.indexOf(start), j = source.indexOf(end, i + start.length);
  assert(i >= 0 && j > i, `Missing production Focus owner handler ${start}`);
  return source.slice(i, j).trim();
});
const script = ts.transpileModule(
  `(() => {\n${fragments.join("\n")}\nreturn {commitRowMutation,makeTaskLive,exitFocusHome,submitAddTask,confirmDelete};\n})()`,
  { compilerOptions: { target:ts.ScriptTarget.ES2022, module:ts.ModuleKind.None } },
).outputText;
const delay = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => {resolve = yes; reject = no;});
  return {promise, resolve, reject};
};
const task = {id:"task-one", listId:"list-one", title:"Task one", estSeconds:null};
const timer = {runtime:{timer:{state:"idle", task_id:null, mode:{kind:"count_up"}}}};
function harness() {
  const calls={rows:0,lives:0,adds:0,deletes:0,refresh:0,pauses:0,resumes:0,exits:0,
    errors:[], statuses:[], editorClosed:[], deleteClosed:[], pending:[], homePending:[]};
  const ctx={
    fixtureMode:false, presentationActive:true, mutationPendingTaskId:null,
    homePending:false, addTaskPending:false, deletePending:false,
    automaticAdvance:null,
    focusMutationOwnerRef:{current:null}, rowMutationInFlightRef:{current:false}, addTaskInFlightRef:{current:false},
    addTaskTitle:"New task", addTaskListId:"list-one", autoParseEstFromTitle:false,
    target:{kind:"list",id:"list-one"}, deleteTarget:task,
    parseEstimateSuffix:()=>null,
    setMutationPendingTaskId:value=>calls.pending.push(value),
    setMutationStatus:value=>calls.statuses.push(value),
    setError:value=>calls.errors.push(value),
    setHomePending:value=>calls.homePending.push(value),
    setAddTaskPending:()=>{},
    setAddTaskTitle:()=>{},
    setAddTaskOpen:value=>calls.editorClosed.push(value),
    setDeletePending:()=>{},
    setDeleteError:value=>calls.errors.push(value),
    setDeleteTarget:value=>calls.deleteClosed.push(value),
    setNotesTaskId:()=>{},
    setSubtasksTaskId:()=>{},
    formatInvokeError:error=>String(error.message??error),
    snapshotTimerSession:async()=>timer,
    focusModeForTask:()=>({kind:"count_up"}),
    startTimerTask:async()=>{calls.lives++;return timer;},
    switchTimerTask:async()=>{calls.lives++;return timer;},
    setTimer:callback=>callback(null),
    applyTimerSessionProjection:(_current,payload)=>payload,
    refreshBoard:async()=>{calls.refresh++;},
    pauseTimerForFocusHome:async()=>{calls.pauses++; return timer;},
    waitForPresentedFrameOrThrow:async()=>{},
    invoke:async(command)=>{assert.equal(command,"focus_surface_exit_to_main"); calls.exits++;},
    resumeTimerFromFocusHome:async()=>{calls.resumes++;return timer;},
    createListBoardTask:async()=>{calls.adds++;return "added";},
    permanentlyDeleteListBoardTask:async()=>{calls.deletes++;},
  };
  const handlers=vm.runInNewContext(script,ctx,{timeout:3000});
  return {ctx,calls,...handlers};
}
// Shared production owner blocks sibling actions throughout the native write
// and its fallible authoritative readback, not just React pending state.
{
  const h=harness(), write=delay(), refresh=delay();
  h.ctx.refreshBoard=async()=>{h.calls.refresh++; return refresh.promise;};
  const first=h.commitRowMutation(task,async()=>{h.calls.rows++;return write.promise;},"Saved");
  await h.makeTaskLive(task); await h.exitFocusHome(); await h.submitAddTask();
  await h.confirmDelete();
  assert.deepEqual([h.calls.rows,h.calls.lives,h.calls.pauses,h.calls.adds,h.calls.deletes],[1,0,0,0,0]);
  assert.equal(h.ctx.focusMutationOwnerRef.current,"row");
  write.resolve(); await Promise.resolve(); await Promise.resolve();
  await h.makeTaskLive(task);
  assert.equal(h.calls.lives,0,"shared owner must survive committed-but-refresh-pending mutation");
  refresh.resolve(); await first;
  assert.equal(h.ctx.focusMutationOwnerRef.current,null);
  assert.equal(h.ctx.rowMutationInFlightRef.current,false);
  await h.makeTaskLive(task);
  assert.equal(h.calls.lives,1,"subsequent intentional Make Live after release must work");
}
// Home rollback is still in progress when native exit fails, so a same-render
// competing Make Live/Add/Row command may not interleave during native resume.
{
  const h=harness(), rollback=delay();
  h.ctx.invoke=async()=>{h.calls.exits++;throw new Error("native focus exit rejected");};
  h.ctx.resumeTimerFromFocusHome=async()=>{h.calls.resumes++;return rollback.promise;};
  const first=h.exitFocusHome();
  for(let i=0;i<12&&h.calls.resumes===0;i++)await Promise.resolve();
  assert.equal(h.calls.pauses,1);
  assert.equal(h.calls.exits,1);
  assert.equal(h.calls.resumes,1,"Home must start rollback after failed native exit");
  assert.equal(h.ctx.focusMutationOwnerRef.current,"home");
  await h.makeTaskLive(task);
  await h.submitAddTask();
  await h.commitRowMutation(task,async()=>{h.calls.rows++;},"Saved");
  assert.deepEqual([h.calls.lives,h.calls.adds,h.calls.rows],[0,0,0],
    "no mutation can start before rollback finishes");
  rollback.resolve(timer); await first;
  assert.equal(h.ctx.focusMutationOwnerRef.current,null);
  assert.deepEqual(h.calls.homePending,[true,false]);
  assert.match(String(h.calls.errors.at(-1)),/native focus exit rejected/);
  await h.makeTaskLive(task);
  assert.equal(h.calls.lives,1);
}
// A suspended painter must fail closed and undo its guarded Home pause,
// without dispatching native Focus exit or allowing another command to race.
{
  const h=harness();
  h.ctx.waitForPresentedFrameOrThrow=async()=>{throw new Error("paint deadline expired");};
  await h.exitFocusHome();
  assert.equal(h.calls.pauses,1);
  assert.equal(h.calls.exits,0,"Home must not exit when the PAUSED frame failed to paint");
  assert.equal(h.calls.resumes,1,"paint deadline failure must restore the guarded pause lease");
  assert.equal(h.ctx.focusMutationOwnerRef.current,null);
  assert.deepEqual(h.calls.homePending,[true,false]);
  assert.match(String(h.calls.errors.at(-1)),/paint deadline expired/);
}
// A committed add must close its editor before an independently failed board
// refresh, and release both the shared owner and local Add owner.
{
  const h=harness();
  h.ctx.refreshBoard=async()=>{h.calls.refresh++;throw new Error("board refresh unavailable");};
  await h.submitAddTask();
  assert.equal(h.calls.adds,1);
  assert(h.calls.editorClosed.includes(false));
  assert.match(String(h.calls.errors.at(-1)),/Task was added, but Focus could not refresh/);
  assert.equal(h.ctx.focusMutationOwnerRef.current,null);
  assert.equal(h.ctx.addTaskInFlightRef.current,false);
}
// A committed completion in its parent-owned handoff is not an opportunity
// for a second Add before the authoritative next-task queue has refreshed.
{
  const h = harness();
  h.ctx.automaticAdvance = { completedTaskId: "task-one", nextTaskId: "next-two", nextTaskTitle: "Next", phase: "pending" };
  await h.submitAddTask();
  assert.equal(h.calls.adds, 0, "auto-advance must block Add while committed Focus state is reconciling");
  h.ctx.automaticAdvance = { ...h.ctx.automaticAdvance, phase: "refresh-blocked" };
  await h.submitAddTask();
  assert.equal(h.calls.adds, 0, "failed post-commit refresh cannot invite a second write");
  h.ctx.automaticAdvance = null;
  await h.submitAddTask();
  assert.equal(h.calls.adds, 1, "normal Add resumes only after settled Focus projection");
}
// Delete retains shared owner after persistence, including the readback phase;
// its modal closes after commit, not before an asynchronous write resolves.
{
  const h=harness(), write=delay(), refresh=delay();
  // Wait for the actual production handler's committed modal-close callback,
  // rather than assuming any fixed number of cross-context VM microtasks.
  let signalDeleteCommitted;
  const modalClosed = new Promise(resolve => { signalDeleteCommitted = resolve; });
  h.ctx.setDeleteTarget=value=>{
    h.calls.deleteClosed.push(value);
    if (value===null) signalDeleteCommitted();
  };
  h.ctx.permanentlyDeleteListBoardTask=async()=>{h.calls.deletes++;return write.promise;};
  h.ctx.refreshBoard=async()=>{h.calls.refresh++;return refresh.promise;};
  const first=h.confirmDelete();
  await h.submitAddTask(); await h.makeTaskLive(task);
  assert.equal(h.calls.deletes,1);
  assert.equal(h.calls.adds+h.calls.lives,0);
  assert.equal(h.calls.deleteClosed.length,0);
  write.resolve();
  // Observe the real handler callback across the Node/VM event-loop boundary.
  // A fixed Promise.resolve loop can run before the awaited native-IPC
  // assimilation advances in the isolated VM context.
  await Promise.race([
    modalClosed,
    new Promise((_, reject) => setTimeout(
      () => reject(new Error("Committed native delete never dismissed modal")), 2_000,
    )),
  ]);
  assert(h.calls.deleteClosed.includes(null),"confirmed backend deletion must dismiss modal");
  await h.submitAddTask();
  assert.equal(h.calls.adds,0);
  refresh.reject(new Error("post-delete read unavailable")); await first;
  assert.equal(h.ctx.focusMutationOwnerRef.current,null);
  assert.match(String(h.calls.errors.at(-1)),/Task was deleted, but Focus could not refresh/);
}
console.log("Actual FocusPanel Row/MakeLive/Add/Delete/Home handlers: immediate shared owner and Home native rollback PASS.");
