# M5 Notes spellcheck — validated completion

Date: 2026-09-12

Milestone: 5 — Design system and Main window product UI

Ordered item: 23/28 — Use WebView/browser spellcheck where practical.

## Outcome

COMPLETE / MAIN VALIDATED.

Narro now opts the existing production Notes `contentEditable` into native WebView/browser spellcheck using one React `spellCheck` hint. The compact and larger/resizable Notes presentations continue to reuse the same mounted editor/draft path. Read-only saved-note viewers remain non-editable and do not receive spellcheck.

This slice deliberately does not introduce a Narro spelling dictionary, language service, autocorrect behavior, network request, persistence field, IPC command, Rust implementation or schema change. Actual spelling suggestions/underlines remain controlled by the host WebView/browser and user-agent settings.

## Source scope

Feature branch: `m5-notes-spellcheck`

Slice base / prior tracking tip: `88bb0e2c928a645bb5b066e62085e43301833aca`

Final PR #95 exact head: `3affb7078f3bc89f6a6d03adeb0625c763a8f7c7`

Expected-head guarded merge / validated main source SHA: `d65b97b4f83a498bb0426b4d793449b8fd5e044b`

Validated source tree: `7c99559b708dd381892a2fb35d4df27dcf1c801e`

Production change: exactly one added `spellCheck` attribute on the existing `RichNoteEditor` production editor in `src/TaskNotes.tsx`.

Test/tooling scope:

- added `scripts/test-ui-task-notes-spellcheck.mjs` and wired it into `preflight:frontend`;
- added `scripts/validate-task-note-spellcheck-captures.mjs` and wired it into the Windows visual-regression pipeline;
- revised the prior larger-Notes scope-separation gate so the shared compact/large editor is now required to carry exactly one native spellcheck hint;
- no dependency or package-lock change was required.

Final diff review from slice base confirmed only the intended tracking/package/test files plus the single production line; no persistence, timer/session, scheduling, list-settings, search, archives, theme or Focus Panel behavior was absorbed.

## Deterministic contract

Static/source validation requires:

- exactly one production `spellCheck` hint and exactly one Notes editor control;
- unchanged `contentEditable={!pending}` and structural `onSave(editorDocument(root));` boundary;
- `NoteViewer` remains without `spellCheck` or `contentEditable`;
- no custom spelling dependencies such as spellchecker/hunspell/nspell/cspell/languagetool;
- no autocorrect or network spelling path inside `RichNoteEditor`;
- no authoritative Notes persistence/open-URL operations migrate into the editor component.

Runtime Windows Edge validation reuses the existing compact/large, light/dark Notes production fixtures. Each captured DOM must contain exactly one production editor with both `contenteditable="true"` and `spellcheck="true"`; read-only viewers must remain non-editable and without spellcheck. The tests intentionally do not assert dictionary-specific underline pixels or correction menus.

## PR exact-head validation

PR: #95 — `M5: enable native Notes spellcheck`

Windows CI #370:

- run: `34637737822`
- job: `103389643888`
- exact head: `3affb7078f3bc89f6a6d03adeb0625c763a8f7c7`
- conclusion: **SUCCESS**
- Repository Preflight: **SUCCESS**
- Capture Visual Regression Fixtures: **SUCCESS**
- Upload Visual Regression Artifact: **SUCCESS**
- Build Tauri Release: **SUCCESS**
- Upload Diagnostic Harness Artifact: **SUCCESS**

Artifacts:

- visual: `10278628664`
- visual digest: `sha256:14647da2898117ce7b22271f8ce4f780ee3f860b3440fe615eead1b5ecd80860`
- diagnostic: `10279316550`
- diagnostic digest: `sha256:e5587ad07e7bec1cf1ccf1052a2732f04410a6759f7cc8a1fafdac0688cab438`

Final pre-merge evidence:

- PR head unchanged at the validated SHA;
- mergeable: true;
- submitted reviews: none;
- unresolved review threads: none;
- expected-head guarded merge succeeded.

## Resulting-main validation

Merge SHA: `d65b97b4f83a498bb0426b4d793449b8fd5e044b`

Windows CI #371:

- run: `34639143128`
- job: `103394283704`
- exact main source SHA: `d65b97b4f83a498bb0426b4d793449b8fd5e044b`
- conclusion: **SUCCESS**
- Repository Preflight: **SUCCESS**
- Capture Visual Regression Fixtures: **SUCCESS**
- Upload Visual Regression Artifact: **SUCCESS**
- Build Tauri Release: **SUCCESS**
- Upload Diagnostic Harness Artifact: **SUCCESS**

Artifacts:

- visual: `10279363099`
- visual digest: `sha256:ff22f10e2b77f84a662be13677114de1b2ed8ad3d7ea8b2d502150c81ab9d3f1`
- diagnostic: `10280001356`
- diagnostic digest: `sha256:55b4e8fef16de2d7127bf5d8fc0868032779735e58d949f03dce21792fdcedeb`

## Preserved invariants

- one mounted compact/large Notes editor and unsaved-draft path;
- persistence-first note save/delete and stale-version guards;
- constrained local `NoteDocument` serialization;
- explicit-only `http`/`https` URL activation and no remote preview/fetch behavior;
- read-only All Lists/saved-note viewer behavior already specified elsewhere;
- no renderer authority over durable Notes data;
- no Rust/Tauri IPC/SQLite/schema/timer/session/focus-transition changes;
- spellcheck is a user-agent hint only.

## Roadmap continuation

With item 23 main validated, Milestone 5 is now 23/28. The next ordered item is:

`List settings: name, icon, archive/delete flows.`

Before changing source for that item, reconstruct current repository state and inspect existing list CRUD/archive/delete semantics and UI tests. Because archive/permanent-delete behavior touches durable history semantics, consult `docs/BLITZIT_HISTORY_RISK_INDEX.md` and preserve the validated M2 persistence-first list model. Do not absorb search, archived browsing surfaces, theme work or Focus Panel work.
