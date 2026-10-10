# 2026-10-10 — A03 Focus Panel out-of-order board projection regression design

## Original code path and causal model
On current PR306 Focus code:
- initial `useEffect` fires `getListBoardSnapshot(target)`; fulfilled result commits `setBoard(snapshot)` if only the effect's `disposed` closure remains false, and sets `boardReadyTargetKey`/refresh key;
- separate `listenForBoardInvalidation` callback increments `externalBoardRefreshRevisionRef` and its fulfilled read commits when that **local event-only revision** matches and selected target matches;
- shared timer change effect separately reads the board and checks timer/session revision/target, not all latest board reads;
- synchronous mutation `refreshBoard()` unconditionally commits its awaited result.

There is no **single cross-path request sequence**. Counterexample without any bad SQLite state:
T0 initial snapshot A starts and is delayed (captures old state);
T1 independent external update is committed and board invalidation B emitted;
T2 B read returns newer tasks and is rendered;
T3 delayed A returns and passes `!disposed`; old tasks are rendered last.
Subtlety: if invalidation delivered before event subscription establishment, B might not fire at all; catalog's `useFocusListCatalog` already follows subscribe-before-first-read whereas Focus board effect starts the initial read independently. New code should preserve this gap consideration rather than pretending revision guards alone eliminate subscription bootstrap races.

## Required deterministic regression (before source implementation)
Reuse real React `src/m7IntegrationRegression.tsx` and Tauri IPC fake; add deferred `get_list_board_snapshot` only when isolated scenario is enabled and proper `get_home_snapshot` events remain immediate. After mounting Focus, hold the initial read and confirm one waiter. Fire `emitBoardInvalidated` after listener registered, hold second read; fulfill B with a board that includes a sentinel new task, await React repaint, assert new task visible; fulfill A with older board missing sentinel, await repaint and assert sentinel still visible. Verify target identity remains unchanged. Add reverse order B failure and A success disposition to ensure no stale-error or phantom stuck loading: decide error precedence from latest attempted authoritative read, not caller name. Add target change while A pending to ensure no prior-scope response commits (existing selected-list guard protects some paths); ensure explicit snapshot recovery.
For real source correction require shared request epoch `useRef`, invalidate preceding outstanding reads before starting the latest read, and check snapshot target/epoch before `setBoard`; cannot make a stale asynchronous result authoritative just because it returned later. Handle mutation refresh separately: successful write is committed even if downstream refresh is superseded, and no duplicate retryable-write error may be generated. Avoid adding polling, indiscriminate effects, or second timer state authority.

## Branch/sequencing
PR306 (SS-H04) currently modifies `FocusPanel.tsx` and `m7IntegrationRegression.tsx`, two exact A03 files; do **not** start a hard-overlap source branch until #306 passes required CI and merges. PR307 ListBoard/Search may work independently. Once #306 merges, add regression first to a narrow branch from resulting main, validate it truly fails on old source before patch (e.g. exact fast CI failing at deterministic assertion), then implement the causal fence and revalidate. Native Codex does not help establish out-of-order async correctness.

**Status:** analysis/test design only; no executable test or source fix written; new A03 0/1. No physical or CI PASS claimed.
