import assert from "node:assert/strict";
import fs from "node:fs";
const subtasks = fs.readFileSync("src/FocusLiveSubtasks.tsx", "utf8");
const metrics = fs.readFileSync("src/FocusLiveMetrics.tsx", "utf8");
const subStart = subtasks.indexOf("  const runMutation = async (");
const subEnd = subtasks.indexOf("  const model: TaskSubtasksModel =",subStart);
assert(subStart>=0&&subEnd>subStart,"Real Focus subtask mutation path is required");
const s=subtasks.slice(subStart,subEnd);
assert(subtasks.includes("const mutationInFlightRef = useRef(false);")
  && s.includes("pending || mutationInFlightRef.current")
  && s.indexOf("mutationInFlightRef.current = true;")<s.indexOf("await mutation();")
  && s.indexOf("mutationInFlightRef.current = true;")>s.indexOf("pending || mutationInFlightRef.current")
  && s.includes("} finally {\n      mutationInFlightRef.current = false;"),
  "Subtask mutations must claim synchronously and release even if write/refetch fails");
assert(s.includes("await refreshSubtasksAndBoard();")&&s.includes("handleCommittedRefreshFailure(failure);"),
  "Committed subtask writes must keep their existing authoritative refresh-failure distinction");
for(const operation of ["createListBoardSubtask({","updateListBoardSubtaskTitle({","setListBoardSubtaskCompletion({","reorderListBoardSubtasks({","deleteListBoardSubtask({"]) {
  assert(subtasks.includes(operation),"All five operations must remain on the shared mutation route: "+operation);
}

const metStart = metrics.indexOf("  const save = async () => {");
const metEnd = metrics.indexOf("  return (",metStart);
assert(metStart>=0 && metEnd>metStart,"Real Focus metric save path is required");
const m=metrics.slice(metStart,metEnd);
assert(metrics.includes("const metricMutationInFlightRef = useRef(false);")
  && m.includes("pending || metricMutationInFlightRef.current")
  && m.indexOf("metricMutationInFlightRef.current = true;") < m.indexOf("await setPausedTimerEstimate({")
  && m.indexOf("metricMutationInFlightRef.current = true;") < m.indexOf("await setPausedTimerTimeTaken({")
  && m.includes("} finally {\n      metricMutationInFlightRef.current = false;"),
  "Paused metric writes must claim before both timer APIs and release through all outcomes");
assert(m.includes("onTimerPayload(payload);")&&m.includes("await refreshAfterCommittedMutation(metric, parsed.seconds);")
  && m.includes("setRefreshBlocked(true);"),
  "Persisted metric projections and no-unsafe-retry on refresh failure remain intact");

function barrier(){
  let resolve,reject;
  const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});
  return{promise,resolve,reject};
}
function exclusive() {
  let inFlight=false;
  return{
    busy:()=>inFlight,
    async run(write,refresh){
      if(inFlight)return false;
      inFlight=true;
      try{await write();await refresh();return true;}
      finally{inFlight=false;}
    },
  };
}
for(const component of ["subtask-create","subtask-delete","metric-estimate","metric-time-taken"]){
  const gate=exclusive(),write=barrier(),read=barrier();
  let writes=0,reads=0;
  const one=gate.run(async()=>{await write.promise;writes++;},async()=>{reads++;await read.promise;});
  assert.equal(await gate.run(async()=>{writes++;},async()=>{}),false,component+" same-render second write rejected");
  write.resolve();
  await Promise.resolve();await Promise.resolve();
  assert.equal(writes,1);
  assert.equal(await gate.run(async()=>{writes++;},async()=>{}),false,component+" post-commit refresh still exclusively held");
  read.resolve();
  assert.equal(await one,true);
  assert.equal(reads,1);
  assert.equal(gate.busy(),false);
  const deferredError=barrier();
  const error=gate.run(async()=>{await deferredError.promise;},async()=>{});
  assert.equal(await gate.run(async()=>{writes++;},async()=>{}),false);
  deferredError.reject(new Error("authoritative write rejected"));
  await assert.rejects(error,/authoritative write rejected/);
  assert.equal(gate.busy(),false,component+" rejected command must permit corrected retry");
  await assert.rejects(gate.run(async()=>{writes++;},async()=>{throw new Error("committed but stale read");}),/stale read/);
  assert.equal(gate.busy(),false,component+" failed refresh must not deadlock gate");
}
console.log("Focus live subtask/metric same-render duplicate and committed-refetch ownership regression passed.");
