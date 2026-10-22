# PR362 final review before merge

Old0e9cdae1 exactCI38889617175 completed3/3SUCCESS but **integration is held**. A stronger actualcomponent regression reproduced an introduced partial-read failure: after the write committed and pairedboard read failed, a delayed successful child read cleared the blocked error in both Board and Focus (`boardCommittedErrorRetained:false`, `partialFocusErrorRetained:false`). This is a product error-state/freshness issue, not a CI failure. The candidate is not physically accepted.

Correction on the same branch: synchronous committed-error latches suppress late callbacks, disable that detail subscription while unsafe, and reject same-render retry; initial board/fixture/new real component remains the recovery boundary. Mounted green regression passes. The actual-source VM handler test was updated with the new ref and now tests same-render blocked admission in Focus and Board. Final aggregate/matrix validation is in progress before one source push to the samePR.

A separate unkeyed barecomponent draft-reuse assertion failed, but current productionFocusPanel keys FocusLiveActions by liveTask.id (and queuedrows bytask.id), and FloatingTimer keys its subtaskcomponent bytask.id. That test composition does not establish a current productdraft-migration defect. Exploratory owner-state changes were removed; approved task-switch/draft behavior is preserved. Keep the raw diagnostic as harness-scoped, not a native/productFAIL. No sourcepatch based on that result.

No correctednativecapture/profileactive; PA360originals restored. Same planned0/3direction capture after finalsourceCI/integration/providerhash. M10blocked/M11dormant.
