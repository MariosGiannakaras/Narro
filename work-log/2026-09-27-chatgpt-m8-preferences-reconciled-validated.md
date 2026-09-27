# M8 Preferences/runtime reconciliation — validated

Date: 2026-09-27  
Agent: ChatGPT  
Scope: reconcile existing PR #170 onto validated main; validate evidence-driven Preferences/runtime checkpoints without overclaiming unfinished runtime effects.

## Starting source baseline

Validated application source entering reconciliation:
`f4c80d04b25f58637c0ef04c03b60dcd52fcff57`

The existing PR #170 head `a22b552623195e40d7f88cf0e23a9b05a1eb0792` was 38 commits ahead and 7 commits behind current main. Its historical Windows CI #586 was therefore not accepted for merge.

## Reconciliation

The existing branch/PR was preserved.

Only four PR files overlapped post-branch main changes:
- `src-tauri/src/lib.rs`;
- `src/ListBoard.tsx`;
- `src/TaskCard.tsx`;
- `src/listBoard.css`.

Thirty non-overlap M8 file blobs were preserved unchanged. The four overlaps were reconciled manually onto current main so the validated VE-F003 task overflow, Change List/Duplicate commands, fixed action geometry and transactional live guards were retained.

Reconciled exact head:
`633877b1e64b2de3c8b24fad388bef2af6c1793b`

## Validated behavior

### VE-F001 — EST terminal suffix normalization

- preference-gated through `auto_parse_est_from_title`;
- supported successful terminal suffix parses store EST;
- only the successfully parsed terminal suffix is removed from the persisted visible title;
- failed/non-matching parses leave the title untouched;
- shared across List Board create, Search/quick-create and Focus Add Task.

### VE-F002 — success-screen-enabled completion gate

- Done commits authoritative task/timer completion first;
- when `show_success_screen` is enabled, no next task starts automatically;
- success UI retains completed-task EST/Taken context;
- explicit `Next Task` samples idle timer state before starting the recorded eligible next task;
- success-screen-disabled behavior remains the pre-existing Narro path pending stronger evidence;
- source-visible `Take a Break` is present but disabled/unavailable because its post-click timer/session semantics remain unresolved.

### VE-F008 / nested Preferences

- nested Pomodoro, timed-alert, notification/reminder and celebration controls remain mounted in place;
- parent state disables children rather than remounting/collapsing them, preventing disruptive scroll jumps;
- Hide EST / Time Taken keeps hover/focus disclosure;
- upper/middle/lower Preferences states are covered by Windows visual fixtures.

### Additional validated runtime consumers

- event-driven cross-window Preferences projection, no polling;
- persisted default manual break duration consumed by Focus;
- scrolling live title preference remains live;
- v3 typed/versioned SQLite Preferences boundary retained;
- autostart preference/native coordination keeps rollback/postcondition checks;
- unavailable sound previews remain explicit and local-only.

## Explicit non-claims

The top-level Preferences roadmap item remains open. This slice does not claim complete runtime behavior for:
- timed task alerts;
- animated timer flash;
- notification-alert gating/effects;
- schedule-reminder preference/lead integration;
- real local sound catalog or preview playback.

The separate Windows-locale date/time M8 item also remains open.

## Authoritative validation

- exact PR head: `633877b1e64b2de3c8b24fad388bef2af6c1793b`;
- Windows CI #604 / run `36350930729`: PASS;
- visual artifact id `10942775993`, digest `sha256:5be194669c48d3442a3ac301ccdc4168a51f378d00b332ac690f8defb61413b5`;
- diagnostic artifact id `10942122319`, digest `sha256:53543709c13df1a17bd76ed95fa5d6aba14d1f8092e3236cf16e43bceb4b2782`;
- expected-head guarded squash merge: `0a54b20f16f5cb69a32602148750b10d533ad470`;
- resulting-main Windows CI #605 / run `36351530441`: PASS via identical-tree validation gate;
- validated source diff from prior application baseline: **+2273/-105 across 38 files**.

## Progress

- roadmap: **6/10 milestones complete**;
- M8: **6/8 top-level items validated**;
- M7 physical/manual closure remains deferred/open.

## Exact continuation

Implement the remaining Preferences runtime effects narrowly and idempotently, reusing authoritative M3/M4 timer/notification/reminder infrastructure rather than creating renderer-owned parallel schedulers. Then close Windows-locale date/time presentation before M9.
