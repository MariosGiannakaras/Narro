import assert from "node:assert/strict";
import fs from "node:fs";

const panel = fs.readFileSync("src/ArchivedListsPanel.tsx", "utf8");
assert(panel.includes("const archiveMutationInFlightRef = useRef(false);"),
  "Archived list destructive/restoration actions require an immediate per-mounted owner");
function handler(a,b) {
  const start=panel.indexOf(a),end=panel.indexOf(b,start+a.length);
  assert(start>=0&&end>start,`Expected real archive handler ${a}`);
  return panel.slice(start,end);
}
const restore=handler("  async function restoreList(", "  function requestDelete(");
const request=handler("  function requestDelete(", "  async function confirmDelete(");
const del=handler("  async function confirmDelete(", "  return (");
assert(restore.includes("pendingRestoreId || deletePending || archiveMutationInFlightRef.current")
  && restore.indexOf("archiveMutationInFlightRef.current = true;") < restore.indexOf("await restoreListFromSettings(list.id);")
  && restore.includes("} finally {\n      archiveMutationInFlightRef.current = false;"),
  "Restore must guard immediately and release after the persisted write finishes");
assert(request.includes("pendingRestoreId || deletePending || archiveMutationInFlightRef.current"),
  "Confirm dialog must not be created while an incompatible archived list write is pending");
assert(del.includes("deletePending || pendingRestoreId || archiveMutationInFlightRef.current")
  && del.indexOf("archiveMutationInFlightRef.current = true;") < del.indexOf("await permanentlyDeleteListFromSettings(deleteTarget.id);")
  && del.includes("} finally {\n      archiveMutationInFlightRef.current = false;"),
  "Permanent Delete must synchronously block duplicate and competing Restore actions");
assert(panel.includes("if (!deletePending && !archiveMutationInFlightRef.current)"),
  "Same-render Cancel cannot dismiss an executing permanent-delete confirmation");
assert(del.indexOf("await permanentlyDeleteListFromSettings(")<del.indexOf("setDeleteTarget(null);"),
  "Permanent Delete cannot optimistically dismiss before persisted success");

function deferred(){let resolve,reject;const promise=new Promise((y,n)=>{resolve=y;reject=n;});return{promise,resolve,reject};}
function archiveOwner(){
  let busy=false;
  return{
    busy:()=>busy,
    async run(mutation){
      if(busy)return false;
      busy=true;
      try{await mutation();return true;}
      finally{busy=false;}
    },
  };
}
const gate=archiveOwner(),wait=deferred();let restoreCalls=0,deleteCalls=0;
const first=gate.run(async()=>{restoreCalls++;await wait.promise;});
assert.equal(await gate.run(async()=>{restoreCalls++;}),false,"second same-render restore rejected");
assert.equal(await gate.run(async()=>{deleteCalls++;}),false,"delete cannot race pending restore");
assert.equal(restoreCalls,1);
assert.equal(deleteCalls,0);
wait.resolve();
assert.equal(await first,true);
assert.equal(gate.busy(),false);
const deleteWait=deferred();
const deleting=gate.run(async()=>{deleteCalls++;await deleteWait.promise;});
assert.equal(await gate.run(async()=>{deleteCalls++;}),false,"same-render double permanent deletion blocked");
assert.equal(await gate.run(async()=>{restoreCalls++;}),false,"restore cannot race permanent deletion");
deleteWait.reject(new Error("must archive first"));
await assert.rejects(deleting,/must archive first/);
assert.equal(gate.busy(),false,"failed deletion must allow deliberate retry");
assert.equal(await gate.run(async()=>{deleteCalls++;}),true);
assert.equal(deleteCalls,2);
assert.equal(gate.busy(),false);
console.log("Archived list Restore/Delete same-render and cross-owner command exclusivity passed.");
