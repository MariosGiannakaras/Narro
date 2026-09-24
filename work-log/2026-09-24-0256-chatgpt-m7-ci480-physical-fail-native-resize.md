# M7 item 7 — CI #480 physical fail and native hidden-resize candidate

Date: 2026-09-24
Agent/tool: ChatGPT / GitHub connector
Milestone/item: M7 item 7
Result: **PHYSICAL FAIL RECORDED / CORRECTIVE PR #125 IN PROGRESS**

## Exact physical build

Resulting-main CI #480 runtime artifact:

- source SHA: `6f99e9b1869b927e5a792cc569b6c8131859c7d8`;
- run: `35931208957`;
- runtime artifact: `10781866423`;
- artifact digest: `sha256:2c203f4c5cc62a645781fdb4ad341527bed6d60f8d0cb3b3cec2139be37c9f29`.

## User physical evidence

- Panel -> Timer: PASS.
- Timer -> Panel: borderline/functional PASS; not sufficient to close the motion gate.
- Expand/Collapse: **FAIL**.
- Panel returns right: PASS.
- Horizontal scrollbar at normal product geometry: PASS.
- Timer/session continuity: PASS.

The supplied screenshots show a repeatable failure where every expand/collapse cycle retains another stale copy of the expanded action strip. Old expanded pixels also survive into collapsed geometry. This is stronger evidence than the prior one-off compositor artifact and indicates that renderer-only opacity/visibility barriers do not clear the native WebView presentation surface during `set_size`.

## Corrective candidate

Branch: `m7-item7-native-hidden-resize`.

PR #125 exact current head:

`62e40ca34c86fe5fc19da447448aa1d540e80754`

Material changes:

- `src-tauri/src/lib.rs`: `set_floating_timer_expanded` hides a visible native window before `set_size`, restores visibility on resize failure, and shows only after successful resize.
- `src/FloatingTimerFoundation.tsx`: target hierarchy is published while hidden and staged transparent before native resize; after native show a finite presented-frame boundary precedes the existing entrance; failed native resize rolls back the renderer expanded state.
- `scripts/test-ui-floating-expanded.mjs`: deterministic ordering and failure-recovery contracts cover the native hide/resize/show sequence and renderer staging.

Preserved invariants:

- no third focus webview;
- native/Rust remains geometry authority;
- 340x110 collapsed and 340x300 expanded geometry unchanged;
- timer/session/task/scheduling state unchanged;
- no polling or high-frequency native geometry loop;
- reduced-motion contract remains intact.

Connector-side source-contract review: **PASS**.

Local checkout/npm/Rust validation: **NOT RUN** in this environment.

Windows CI #481 / run `35936338414` is running on exact head `62e40ca34c86fe5fc19da447448aa1d540e80754`. Do not record automated PASS until that run succeeds and the guarded merge/resulting-main CI sequence completes.

## User availability

The user cannot perform physical Windows testing for several hours and explicitly requested that Codex Goal continue useful work instead of waiting. While item 7 remains physically open, independent later M7 work may proceed in isolated branches/PRs without treating item 7 as complete and without advancing to Milestone 8.
