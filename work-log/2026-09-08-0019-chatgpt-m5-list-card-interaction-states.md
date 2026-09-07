# M5 list-card interaction states — validated

Date: 2026-09-08 (Europe/Athens)

## Scope

Completed only the ordered Milestone 5 item `List-card rest, hover/Open, overflow-menu and create-list states`.

Validated implementation:

- callback-gated `Open`, `Edit List`, `Duplicate`, and `Archive List` actions on Home list cards;
- reuse of the shared accessible `Menu` / `MenuItem` primitives inside the pre-reserved 2rem action slot;
- absolutely positioned `Open` affordance on pointer hover and keyboard `:focus-within`, with unchanged card/header/title/footer geometry;
- callback-gated dashed `CREATE LIST` tile;
- reduced-motion-safe interaction presentation;
- normal product Home remains callback-free, so later board/modal/archive targets are not exposed as dead controls;
- deterministic light/dark `list-card-states` fixture with forced hover/Open, open overflow menu, and Create List tile;
- static `scripts/test-ui-list-card-states.mjs` coverage in frontend preflight;
- visual validation enforces rest/interactive/create-card geometry parity and light/dark parity;
- no Rust/domain/persistence/list CRUD/modal/board/search/settings/reports behavior changed.

## Exact PR validation

PR #82: `M5: add list-card interaction states`.

Final validated PR head:

`35c2668fd2fa0f1d88764584d41cf42df9795964`

Windows PR CI #290:

- run `34161062758`;
- job `101862841977`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10032735331`, digest `sha256:ba2d353a45051fd6cd8ae7c6faf53dcac173eddcbb87d3052d797799ccb1f7e8`;
- diagnostic artifact `10032854077`, digest `sha256:a95087f02de6ef7d248cc4471af90f97f7fd874ead75d4dca0c27fef5c8a7bb2`;
- final exact-head semantic/diff review: **PASS**; 9 changed files, confined to Home interaction states, visual harness/preflight, and branch handoff;
- PR comments, review submissions, and inline review threads requiring resolution: **none**.

PR #82 was squash-merged with expected-head guard `35c2668fd2fa0f1d88764584d41cf42df9795964`.

## Resulting-main validation

Validated source/test SHA:

`61fd8b982839c03133e05163842f5a1f9b2c8e0d`

Windows main CI #291:

- run `34161939996`;
- job `101865381504`;
- exact source SHA `61fd8b982839c03133e05163842f5a1f9b2c8e0d`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10033003446`, digest `sha256:7919f1f34c84c45a4ae9a8048d2ba161dc1cd5cb38917ee6d49c9613f7724ee0`;
- diagnostic artifact `10033125255`, digest `sha256:67133df3313f25bb068c382b753504d58bc62245c4a91982fb18330f6298d1e1`.

Markdown-only tracking descendants do not replace the validated source/test SHA above.

## Continuation

Milestone 5 advances to **10 of 28** validated top-level items. The next ordered item is `Create/Edit List modal with icon import, color selection, title, cancel/create states`. Do not absorb the later list board, task-card states, or list-settings/archive/delete flows while implementing that modal.