# PR493 final historical Narro cleanup — 2026-11-07

## Actual deletion and resulting-main proof

- Base/recovery commit: `5abf8f312d922293676b00a5ebdb1626c88472e7`.
- Deletion commit: `b2cf211527bcd378be08d6f5a2d0f9173b6989ff`; PR493; expected-head guarded squash merge `cc5138444bbcf41f48a2dbda3229fec7c3e1406c`.
- Candidate and actual merge root tree: `fa7c5483fc73342c3545745654ff4b35675e5ac7`. Complete local and remote tree comparison, not GitHub's first-300 diff: **4,065 removals /2,340,643,868 logical bytes**, all in the exact final 27 historical Narro families; **0 added or modified paths**. Every retained path preserves mode and blob ID.
- Actual resulting-main tree: **0 tracked `work-log/evidence/` files**, 1,935 retained blobs before this documentation-only closure. All 86 original/derived Blitzit manifest assets preserve blob IDs and sizes: 46 screenshots, 19 MP4, 19 SRT, two labeled VE005 frames. Entire `reference/`, source, scripts, tests, configuration and workflow subtrees are unchanged by PR493.
- Historical evidence retirements: 32,536 prior +4,065 now = **36,601 paths**. Frozen 700 video/ZIP cohort: **700 retired /0 remain**. The 14 independently removed root helpers remain a separate maintenance count. No Git history rewrite or remote Git-object reclamation claim.

## Current operation versus earlier descriptions

Earlier chats and repository documents described a denied operation but lacked its original tool response or diagnostic. Those descriptions were incorrectly treated as a current blanket prohibition. Under the latest explicit user instruction, the ordinary current local Git index deletion, commit, push, PR and guarded merge succeeded. No safety control, tool permission or repository protection was disabled. Actual current tool decisions remain authoritative; this does not authorize bypassing genuine denials.

The local partial clone allowed complete metadata comparisons without materializing gigabytes of retired media. Index deletion exactly matched the reviewed full-tree scope. Interrupted metadata/summary operations were checked for side effects; one verified stale zero-byte local index lock was cleared only after no owner process/open handle remained. No user checkout or unrelated data was reset.

## Audit and validation

- Current source grep for `work-log/evidence` found only two synthetic CI-tiering test examples/assertions, not filesystem reads of the retired corpus. The `.gitignore` guard remains to prevent new raw recordings accumulating in Git.
- Source/application/workflow trees preserve the previously fully validated PR492 state: CI42312821108 validation/fast/Windows **3/3 SUCCESS**. PR493 is archive-only `[skip ci]`; new remote source CI NOT RUN because source/build inputs are unchanged. No workflow/test requirement was disabled to perform the cleanup.
- Post-deletion frontend preflight/build: **PASS** — all 111 npm test command entries and TypeScript/Vite production build completed successfully after the evidence deletion. Source files were read in Git/CI LF form in the disposable checkout; generated icons were restored before publication. Initial missing sparse-checkout fixture inputs were supplied before the successful complete run.
- Milestone ledger and its 419 checkbox tokens are preserved. Native Windows/physical/source-parity acceptance is **NOT RUN** and remains independent; no application launch, AppData mutation or milestone promotion.
- Active handoff, status, TODO maintenance rows, AGENTS, retention policy, recording baseline and navigation reconciled with actual zero remaining files. The obsolete temporary deletion tracker is removed at actual **5/5** closure. Immutable historical receipts are not rewritten; references to retired media are interpreted through their recovery commit.

## Cleanup gates

1. Frozen technical inventory and protected scope: DONE.
2. Current user-directed retirement and consumer/source boundaries: DONE; all old Narro captures retired from new acceptance use; no executable consumer of removed corpus.
3. Exact eligible final scope: DONE; 27 families /4,065 exact paths, sizes/blobs, protected exclusions and recovery base verified.
4. Final deletion PR: DONE; PR493 merged with expected-head guard.
5. Actual resulting-main whole-tree verification and documentation closure: DONE; zero evidence paths, unchanged originals/source/workflows, truthful native NOT RUN status; temporary tracker removed.

Temporary clone disposal and final issue closure are recorded after their actual completion in HANDOFF. Original Blitzit sources remain permanently protected; future Narro recordings should live outside tracked Git unless a named current consumer justifies a bounded exception.
