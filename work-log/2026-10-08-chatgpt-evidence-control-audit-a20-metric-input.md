# A20 — inline Board creation anatomy and HH:MM input incompatibility

Date: 2026-10-08 (Europe/Athens). GitHub main baseline `e80bf787215ddad7452c6f7da6080664d88a6c16`, Codex owns app/native implementation; previous A17–A19 evidence tracked and no pending Actions or open PRs observed earlier. No new raw video playback required to identify the specific input grammar from Pass-3 source records.

## B52 — visible Board create editor, source control composition

Direct VE-005 ~01:25–01:50 shows Today inline creation with upper `× CANCEL`, title/EST pair, `Add a new task` helper and gradient `Confirm`; current `src/ListBoard.tsx::InlineCreateEditor` renders `Add task to Today` and `EST (optional)`, 0:25:00 placeholder, and bottom action row `Cancel`/`Add task` without source helper and upper cancel grammar. M5 SOURCE_CONTROL_PARITY_OPEN. This is an independent styling/control-layout gap from B46 repeat-entry persistence and B47 initial priority order. A source-version caveat applies to exact button geometry/copy; user-visible parity needs final direct source-candidate comparison. Preserve accessible key and pending/cancel behavior.

## B53 — substantive HH:MM input compatibility defect

VE-005 editor's EST slot uses HH:MM-style input. VE-016 ~00:38–00:41 demonstrates pausing the active task and editing EST in `00:30` format; ~02:11–02:16 demonstrates manual Time Taken input `00:30`, with visible committed `30min`. Source explicitly interprets two-component clock input as hours:minutes. Production `src/ListBoard.tsx` has `const DURATION_INPUT = /^(\\d+):([0-5]\\d):([0-5]\\d)$/;`, with `parseMetricDuration` requiring a three-component H:MM:SS value. `InlineCreateEditor` uses that parser via `submitCreate`; ordinary `TaskCard` estimate and Time Taken metric save flow also calls the same helper. Therefore the directly evidenced hour:minute string is rejected by these Board pathways, even though stored values use seconds and normal H:MM:SS parsing is scoped validated. **M5 FIX_NOW SOURCE_INPUT_COMPATIBILITY_GAP** distinct from a placeholder mismatch. Requirements: accept HH:MM and H:MM:SS without ambiguity, preserve typed duration/overflow/negative limits, EST null/zero semantics, exact stored-second projection, no conflation with date/time-of-day, keyboard commit, and regression for `00:30` = 1800s. Inspect Focus-specific metric parser separately before broad claims; do not assume its implementation shares this regex merely because source references live editing.

## Nearby negative matches

- Task ETA/time-zone formatting is unrelated to duration input grammar. B53 does not authorize rewriting schedule clock handling.
- Single-task inline create and atomic top-create are present. B52/B53 are corrected at existing UI/formatter/parser boundary, not new persistence workflow.
- Reports Sessions break filter and date/group controls already have functional implementations. Source filter icon B51 is cosmetic and separate.

## Tracking and NOT RUN

Added nested noncounting M5 TODO B52/B53, canonical crosswalk, source-route index and UI_UX_SPEC; reconciled board family/video summary. No production/config/tests edits, no TS/Rust test, Windows CI, physical Windows operator interaction or direct source-to-current screenshot run. **NOT RUN**, no milestone/checkpoint/source PASS advanced. Existing tested data-domain contracts remain historical PASS for the previously accepted narrower H:MM:SS workflow.
