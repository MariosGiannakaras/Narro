# HANDOFF.md

Canonical zero-context continuation state for Narro. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 5 in `TODO.md`, relevant `STATUS.md`, list-settings sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md` when reliability risk applies, and the newest relevant `work-log/*.md` entry before changing source.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **23 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `d65b97b4f83a498bb0426b4d793449b8fd5e044b`

Source tree: `7c99559b708dd381892a2fb35d4df27dcf1c801e`

This is the expected-head guarded merge of PR #95. Markdown-only tracking descendants do not replace it.

## LATEST COMPLETED IMPLEMENTATION / CI

**M5 item 23/28 — native WebView/browser spellcheck on the existing Notes editor.**

Immutable evidence: `work-log/2026-09-12-0025-chatgpt-m5-notes-spellcheck.md`.

- final PR #95 head `3affb7078f3bc89f6a6d03adeb0625c763a8f7c7`;
- Windows PR CI #370 / run `34637737822` / job `103389643888`: **SUCCESS**;
- PR visual artifact `10278628664`, digest `sha256:14647da2898117ce7b22271f8ce4f780ee3f860b3440fe615eead1b5ecd80860`;
- PR diagnostic artifact `10279316550`, digest `sha256:e5587ad07e7bec1cf1ccf1052a2732f04410a6759f7cc8a1fafdac0688cab438`;
- expected-head guarded merge main SHA `d65b97b4f83a498bb0426b4d793449b8fd5e044b`;
- Windows main CI #371 / run `34639143128` / job `103394283704`: **SUCCESS**;
- main visual artifact `10279363099`, digest `sha256:ff22f10e2b77f84a662be13677114de1b2ed8ad3d7ea8b2d502150c81ab9d3f1`;
- main diagnostic artifact `10280001356`, digest `sha256:55b4e8fef16de2d7127bf5d8fc0868032779735e58d949f03dce21792fdcedeb`.

Validated behavior:

- exactly one production Notes `contentEditable` opts into native spellcheck with React `spellCheck`;
- compact and large Notes presentations still reuse the same mounted editor and draft path;
- read-only saved-note viewers remain non-editable and without spellcheck;
- structural `NoteDocument` serialization, persistence-first save/delete, stale-version guards and explicit-only URL activation remain unchanged;
- static preflight rejects custom spelling services/dependencies/network behavior inside the editor;
- Windows Edge compact/large light/dark captured DOM proves one rendered `spellcheck="true"` + `contenteditable="true"` production editor without relying on underline pixels;
- no Rust/Tauri IPC/SQLite/schema/timer/session/list-settings behavior was added.

## ACTIVE IMPLEMENTATION SLICE

**M5 item 24/28 — List settings: name, icon, archive/delete flows.**

No implementation branch or PR has been started yet by this tracking reconciliation.

### Required reconstruction before source changes

- re-read the mandatory startup documents from repository state;
- inspect existing list editor/menu/settings UI, list persistence APIs and tests before choosing the narrow slice;
- read `docs/BLITZIT_HISTORY_RISK_INDEX.md` because archive/permanent-delete behavior can affect durable list/task/history semantics;
- inspect newest relevant immutable work logs and current open PR/CI state;
- preserve the existing persistence-first list mutation boundary, stable identities, archive/restore history and permanent-delete semantics already validated in M2;
- derive product behavior from current specs/source evidence rather than inventing new archive/delete policy.

## USER-FACING PROGRESS

**`M-5/10 | 0/5 | 23/28`** for the next list-settings slice once implementation begins.

## INVARIANTS THAT MUST NOT REGRESS

- list/task/subtask identity remains stable across ordinary edit/archive flows;
- list mutations publish UI success only after local persistence succeeds;
- archive/restore preserves history; permanent deletion stays explicit and follows validated report/history semantics;
- All Lists remains an aggregate/read-only list surface where already specified and must not become a mutable synthetic list;
- list-card hover/focus action slots and modal geometry remain stable; keyboard/focus-visible equivalents remain usable;
- no source-product account/cloud/integration controls are introduced;
- Notes keep one compact/large editor path, explicit URL activation and native-only spellcheck behavior;
- timer/session/scheduling/runtime authority remains outside renderer memory.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Reconstruct item 24 from repository state using the mandatory startup sequence, inspect the current list editor/menu and existing list CRUD/archive/delete API/test surfaces, then define the smallest deterministic implementation slice for list name/icon/archive/delete settings. Create or resume one coherent feature branch only after that evidence review. Do not absorb search, archive browsing surfaces, theme work or Focus Panel work.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision is currently known to block item 24; verify specs before implementation.
- Full local repository preflight remains unavailable in this connector environment; Windows GitHub Actions is authoritative for source validation.
