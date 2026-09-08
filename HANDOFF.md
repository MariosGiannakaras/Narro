# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, relevant `docs/UI_UX_SPEC.md` / `docs/RESEARCH_EVIDENCE.md` / `docs/BLITZIT_HISTORY_RISK_INDEX.md` evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 10 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`61fd8b982839c03133e05163842f5a1f9b2c8e0d`

This is the guarded squash merge of PR #82 — `M5: add list-card interaction states`; Windows resulting-main CI #291 / run `34161939996` / job `101865381504` passed repository preflight, real list-card interaction captures, Tauri release and required artifacts. Main tracking tip `498d1be65117b60cefa0e33e6e3ab3088bb8352c` is docs-only and does not replace the validated source/test baseline.

Detailed completed-slice evidence: `work-log/2026-09-08-0019-chatgpt-m5-list-card-interaction-states.md`.

## ACTIVE SLICE

**M5 Main UI — Create/Edit List modal with icon import, color selection, title, cancel/create states.**

Branch: `m5-create-edit-list-modal`, based on main docs tip `498d1be65117b60cefa0e33e6e3ab3088bb8352c`.

PR: #83 — `M5: add Create/Edit List modal` — OPEN / mergeable.

Candidate implementation includes:

- reusable `ListEditorModal` with create/edit modes, dimmed backdrop, close X, Escape dismissal, Tab focus trap, opener focus restoration, title validation, Cancel and persistence-backed Create / Save changes states;
- local icon selection and preview for JPG/JPEG/PNG/SVG with frontend size/signature checks and 1 MiB cap;
- app-data-owned `list-icons/` storage in Rust with filename-extension/content validation, scripted/`javascript:` SVG rejection, UUID filenames, relative stored paths and cleanup of new files when a list mutation fails;
- reuse of the validated M2 `create_list` / `update_list` persistence boundaries rather than parallel renderer-owned CRUD;
- renderer-facing `create_list_from_editor` / `update_list_from_editor` commands with typed command errors and success-only `CommandResult<()>` IPC; internal `ListRecord` values remain domain/test-only and Home re-reads authoritative SQLite state after a successful commit;
- runtime wiring from `+ Create new list`, the Home Create List tile and the existing `Edit List` menu item; Open/Duplicate/Archive remain unbound because their targets are later ordered items;
- successful create/edit closes the modal, returns to Home and increments a refresh key that triggers a fresh `get_home_snapshot` read; failed mutations keep the modal open and show the mapped error;
- deterministic light/dark `list-editor-create` and `list-editor-edit` visual fixtures, capture wiring and geometry/semantic validation;
- deterministic `scripts/test-ui-list-editor-modal.mjs` preflight contract covering CRUD reuse, owned icon storage, typed errors, success-only IPC, focus/accessibility, runtime wiring, fixture coverage and scope exclusions;
- previous Home/list-card static contracts updated only where their old literal assertions became stale after real Create/Edit callbacks were introduced;
- no list board/task-card/drag-drop/task-edit/scheduling/subtasks/notes/list-settings/archive-delete/search/settings/reports behavior was added.

Local Node/Rust preflight: **NOT RUN**. The current execution environment has no repository checkout/Rust toolchain; no local PASS is claimed. Windows GitHub Actions CI is the authoritative reproducible gate.

### Latest CI evidence / active diagnostic

Latest failed exact PR head before the geometry-only validator correction:

`c49ab6193c49a39c14983788378f01d417cb9316`

Windows PR CI #303 / run `34192821845` / job `101954219210`:

- Repository Preflight: **PASS**;
- `test:ui-list-editor-modal`: **PASS**;
- frontend build: **PASS**;
- Rust fmt/check/Clippy/tests: **PASS**; 188 Rust unit tests passed plus integration suites;
- performance harness self-test: **PASS**;
- the previous DOM-layout-viewport backdrop failure is fixed and the strict exact 1280x720 PNG IHDR contract remains intact;
- the previous edit-fixture selected-color failure is fixed by using the real palette swatch `#48d6c5` only in `editFixtureList`;
- Capture Visual Regression Fixtures: **FAIL** only on `List editor create light/dark geometry differs`;
- visual artifact upload / Tauri release / diagnostic artifact upload were skipped because capture validation failed first.

The #303 failure is a validator-only parity bug, not production UI evidence. `listEditorGeometry` stored the full `contract.modal`, which contains theme-specific `backgroundColor`, then compared the resulting object between light and dark under a geometry-only invariant. Light and dark modal surface colors are intentionally different.

Evidence-backed correction is implemented in source/test candidate commit:

`2add6d452a69a6416641bb8484cfab7198e49836`

That correction projects the modal parity contract to only `width`, `height`, and `borderRadius`. Existing per-theme semantic checks, selected-color checks, modal size/radius checks, measured DOM layout viewport/backdrop coverage, exact 1280x720 PNG validation, and production modal/Rust behavior are unchanged.

The validated visual-harness decision in `work-log/2026-09-07-1920-chatgpt-m5-visual-regression-harness.md` remains in force: exact 1280x720 is the PNG output contract, not a browser DOM layout viewport assumption.

## USER-FACING PROGRESS

**`M-5/10 | 2/5 | 10/28`**

Create/Edit List modal checkpoints:

1. mandatory startup + current-main/open-PR/spec/screenshot/M2 list CRUD/icon-asset/focus/visual-harness inspection + narrow branch/scope — COMPLETE;
2. modal + persistence-backed create/edit + owned icon import + deterministic static/visual candidate implementation and semantic/diff review — COMPLETE;
3. exact PR-head Windows CI including repository preflight, create/edit modal captures, release and required artifacts — PENDING;
4. exact-head semantic/diff/review-thread check + expected-head guarded merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## IMPORTANT INVARIANTS

- authoritative Rust/domain/persistence state and persistence-first mutation semantics remain authoritative;
- list editor success is not presented until the existing M2 SQLite mutation commits;
- renderer IPC does not own or trust a duplicated persisted-list representation after mutation; Home reloads authoritative state;
- imported icons are copied to Narro-owned app-data storage and only relative owned paths are persisted;
- never delete arbitrary paths supplied by stored/user data; cleanup is restricted to validated `list-icons/<filename>` paths;
- normal product Home exposes only real Create/Edit targets added by this slice; Open/Duplicate/Archive remain callback-absent;
- deterministic fixture data and fixture callbacks never appear as normal user data/actions;
- modal keyboard/focus behavior and reduced-motion usability must remain intact;
- exact 1280x720 is the PNG capture-output contract, not a DOM layout viewport assumption;
- edit fixture color must be an actual editor-palette swatch so the captured selected-color state is meaningful;
- light/dark geometry parity must compare geometry only; theme-specific surface colors must remain independently validated rather than treated as equal geometry;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`;
- do not absorb the later list board, task-card, drag/drop, list-settings/archive-delete, search, settings or reports items.

## NEXT AGENT ACTION

Inspect PR #83 after this tracking update, record its exact current head, and observe the fresh authoritative Windows CI run for that head. Do not make another source change unless the new run produces evidence-backed failure.

Require Repository Preflight including `test:ui-list-editor-modal`, real Edge light/dark create/edit modal captures, visual artifact upload, Tauri release and diagnostic artifact upload to succeed on the same exact PR head.

After exact-head PASS, inspect the exact changed-file diff plus all PR comments/reviews/inline threads, merge only with an expected-head guard, validate the resulting main source SHA with Windows CI, and only then mark `Create/Edit List modal with icon import, color selection, title, cancel/create states` complete and reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` plus one new immutable work-log entry.

## USER ACTION REQUIRED

**None.**
