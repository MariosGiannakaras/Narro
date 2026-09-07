# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, relevant `docs/UI_UX_SPEC.md` sections/reference evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 8 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`31f84a1fe2064e59ea27acc7c9afa9f650669608`

This is the squash merge of PR #80 — `M5: add app shell navigation`.

Exact validation evidence:

- final exact validated PR head `e1a0eb737cce5095b04cae32130fa3f08b3dcb5d`;
- Windows PR CI #285 / run `34144266196` / job `101812742288`: **SUCCESS**; repository preflight, real Edge shell captures, visual artifact, Tauri release and diagnostic artifact all PASS;
- PR visual artifact `10027211577`, `narro-m5-visual-regression`, digest `sha256:b1df010bcd84089ff2f49999337e3e059f9dab9530274b2c3158d9643e8cc9fd`;
- PR diagnostic artifact `10027371165`, `narro-m1-runtime-harness-windows-x64`, digest `sha256:f870171b482fe9a42f3550bebaef6162e75604ee82f3b9dfe0308f0f67827f09`;
- final exact-head semantic/diff review: PASS; no comments, review submissions, or inline review threads requiring resolution;
- PR #80 squash-merged with expected-head guard set to that exact validated head;
- resulting source SHA `31f84a1fe2064e59ea27acc7c9afa9f650669608`;
- Windows resulting-main CI #286 / run `34146374105` / job `101819196686`: **SUCCESS**; repository preflight, real Edge shell captures, visual artifact, Tauri release and diagnostic artifact all PASS;
- main visual artifact `10027957828`, `narro-m5-visual-regression`, digest `sha256:d28c47553ec3ecbbda5aa7bde8d7eacddaa5cd1c803ad22f2e63faf86aeb4d53`;
- main diagnostic artifact `10028115494`, `narro-m1-runtime-harness-windows-x64`, digest `sha256:d5f60f59a284361432fdcc1e929ba32c97bf77d588790c14181e75cb1efa5add`.

Markdown-only tracking descendants do not replace this validated source/test baseline.

## LATEST COMPLETED SLICE

**M5 Main UI — App shell/navigation.**

Validated capabilities:

- default Main window renders reusable `AppShell` rather than the temporary diagnostic dashboard;
- compact left navigation: `+ Create new list`, `All my lists`, `Archived lists`;
- stable upper-right Search and Settings utility entry points;
- stable bottom Home and Reports primary navigation;
- `aria-current="page"`, navigation landmarks, focus-visible states, reduced-motion-safe transitions, and stable geometry;
- legacy Windows diagnostic controls remain available only through explicit `?diagnostics=1`; normal product mode does not start shortcut/monitor/autostart diagnostic probes;
- authoritative Rust `get_state` / `state-changed` projection remains intact;
- `scripts/test-ui-app-shell.mjs` is in frontend preflight;
- visual CI now captures and validates real `app-shell-light` and `app-shell-dark` states in addition to the existing foundation fixtures;
- no Home-card, board/task, search-palette, Settings-content, Reports-content, Rust/domain/persistence/native-window work was folded into the slice.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-app-shell-navigation.md`.

## USER-FACING PROGRESS

**`M-5/10 | 5/5 | 8/28`**

App-shell/navigation checkpoints:

1. mandatory startup + repo/spec/frontend inspection + narrow branch/scope — COMPLETE;
2. shell/navigation implementation + preserved diagnostic path + deterministic contract/visual candidate review — COMPLETE;
3. exact PR-head Windows CI including preflight, shell dark/light capture, release and artifacts — COMPLETE;
4. exact-head semantic/review check + expected-head guarded merge — COMPLETE;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — COMPLETE.

A new implementation slice has not started. Reset the small-slice counter only after defining the Home dashboard/list-cards slice and its meaningful checkpoints.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations remain unchanged;
- stable task identities and renderer-independent timer/session authority remain unchanged;
- main-window recreation derives authoritative state from Rust/SQLite, not hidden renderer memory;
- App shell remains presentation/navigation only;
- validated shell geometry and active/focus states must not reflow sibling content or move pointer targets;
- semantic color, typography, geometry and motion contracts remain the styling source of truth;
- reduced motion remains usable and removes nonessential motion;
- keyboard/focus accessibility remains required;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostic controls remain explicitly gated and outside normal product navigation;
- visual capture dimensions are validated from PNG output and must not rely on DOM viewport equality.

## NEXT AGENT ACTION

Perform mandatory startup again and start only the next ordered Milestone 5 item:

`Home dashboard/list cards.`

Before source changes inspect the relevant Home/list-card evidence in `docs/UI_UX_SPEC.md`, current `src/AppShell.tsx` / `src/App.tsx` and direct dependencies, existing domain/list-read interfaces, shared visual contracts, and the validated Edge visual-regression harness. Define a narrow deterministic Home-dashboard slice with representative dark/light fixture coverage. Preserve the validated shell/navigation hierarchy, keyboard/focus/reduced-motion/no-layout-shift invariants and authoritative Rust/domain boundaries.

Do **not** absorb the following separate ordered item — `List-card rest, hover/Open, overflow-menu and create-list states` — except for the minimum static/reserved list-card geometry genuinely required to implement the baseline Home dashboard/list-card content. Do not jump ahead to create/edit-list modal, board/task UI, search palette, Settings content, or Reports behavior.

## USER ACTION REQUIRED

**None.**
