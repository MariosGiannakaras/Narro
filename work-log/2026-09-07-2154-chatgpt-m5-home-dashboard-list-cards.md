# M5 Home dashboard/list cards validation

Date: 2026-09-07
Agent/tool: ChatGPT with GitHub connector
Milestone/slice: Milestone 5 — Main UI — Home dashboard/list cards

## Source and PR

- Starting fully main-validated source/test baseline: `31f84a1fe2064e59ea27acc7c9afa9f650669608`.
- Implementation branch: `m5-home-dashboard-list-cards`.
- PR: #81 — `M5: add Home dashboard list cards`.
- Final exact validated PR head: `42655fcf712cbb72d28dd5ad93dc4943a56091e4`.
- Final PR changed files: 12, confined to Home read-model/UI integration, Home/static/visual test coverage, the existing visual harness and branch handoff.
- PR comments: none.
- Review submissions: none.
- Inline review threads: none.

## Material implementation

- Added read-only `src-tauri/src/home_snapshot.rs` composed from the existing validated `active_lists` and `active_tasks_in_bucket` persistence reads.
- Excluded archived lists and completed/archived tasks through those existing primitives rather than creating a parallel persistence model.
- Added checked pending-count/aggregate-EST arithmetic and four-row preview caps without losing full totals.
- Added deterministic Rust regressions for empty Home data, active-list filtering, completed-task exclusion, preview ordering/capping and totals.
- Exposed `get_home_snapshot` as a narrow typed Tauri read command using local app-data SQLite and stable `HOME_SNAPSHOT_FAILED` errors; no mutation boundary changed.
- Replaced the temporary Home placeholder inside the validated App shell with reusable `HomeDashboard` content.
- Added neutral time-based greeting, `Your Lists`, helper copy, `All Lists` aggregate card and active-list baseline cards.
- Added loading, empty and typed-error states.
- Kept renderer recreation persistence-driven: a new Main renderer invokes the Home SQLite read again.
- Added safe six-digit-hex list accent projection and deliberately did not render arbitrary stored icon paths as image URLs.
- Reserved the card header's future action slot while deliberately excluding the next ordered hover/Open/overflow/create-list interaction states.
- Added deterministic Home fixture data only to `visualFixtures.tsx`; normal product mode never receives that sample data.
- Extended the Windows Edge harness with `home-light` and `home-dark` captures, semantic hierarchy checks and light/dark geometry-parity validation.
- Added `scripts/test-ui-home-dashboard.mjs` and wired it into frontend preflight.
- Source review before authoritative CI corrected a test-only invalid `expect_err` use, a nonexistent `--color-text-muted` token and fixture card wrapping that would have hidden part of the Home hierarchy.

## Validation

Local Node/Rust checkout validation: **NOT RUN**. The connector-only environment could not obtain an executable checkout because outbound GitHub DNS/network access was unavailable. No local PASS is claimed.

### First PR CI evidence

Windows CI #287 reached repository preflight and failed only at `cargo fmt --check` for `home_snapshot.rs`. Frontend/static contract checks and the TypeScript/Vite production build had already passed. The exact rustfmt diff from the job log was applied without behavioral changes. This failed run did not advance progress.

### Exact PR-head Windows CI

Windows CI #288:

- run: `34150415778`;
- job: `101831341373`;
- exact head: `42655fcf712cbb72d28dd5ad93dc4943a56091e4`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact: `10029290625`, `narro-m5-visual-regression`, digest `sha256:584514e21547a69770b61b92922b7b65591c5e3df021a9f71822c8ccbab36c7b`;
- diagnostic artifact: `10029428916`, `narro-m1-runtime-harness-windows-x64`, digest `sha256:5d43cab738b2cb830d83a35d7d0f1b530e82bbd721364c7b92a5669b039b97ae`.

The final exact-head diff/review check passed after CI. PR #81 was squash-merged using an expected-head guard set to the validated head.

## Merge and resulting-main validation

- Squash merge source SHA: `62d8d8a600ecdb6c42ba70db43f345a9687cfddf`.
- Windows main CI #289:
  - run: `34153630279`;
  - job: `101840803319`;
  - exact source SHA: `62d8d8a600ecdb6c42ba70db43f345a9687cfddf`;
  - conclusion: **SUCCESS**;
  - Repository Preflight: **PASS**;
  - Capture Visual Regression Fixtures: **PASS**;
  - Upload Visual Regression Artifact: **PASS**;
  - Tauri Release: **PASS**;
  - Upload Diagnostic Harness Artifact: **PASS**;
  - visual artifact: `10030335039`, `narro-m5-visual-regression`, digest `sha256:f2125065aa0d046165179d20870545c3f7bed4b02df831cb3b887984d4216d46`;
  - diagnostic artifact: `10030472150`, `narro-m1-runtime-harness-windows-x64`, digest `sha256:0111064264e0ac26334424a9605fc77f1af921c44e6f35880f36f3f85dfcf852`.

No separate physical Windows acceptance is required for this slice. It adds renderer presentation plus a read-only local SQLite projection; no native interactive/window behavior or mutation semantics changed. The authoritative Windows CI exercised the production build and real Edge visual capture path.

## Tracking reconciliation

- `TODO.md`: mark `Home dashboard/list cards` validated complete.
- `STATUS.md`: advance Milestone 5 from 8/28 to 9/28 and set `62d8d8a600ecdb6c42ba70db43f345a9687cfddf` as the latest fully main-validated source/test baseline.
- `HANDOFF.md`: close this five-checkpoint slice and advance the exact next ordered action to `List-card rest, hover/Open, overflow-menu and create-list states`.
- Markdown-only tracking descendants do not replace the validated source/test SHA above.

## Blockers and continuation

Blockers: none.

Exact continuation point: perform mandatory startup again and implement only the next ordered M5 item, `List-card rest, hover/Open, overflow-menu and create-list states`. Start from the validated Home card geometry, reuse existing accessible overlay primitives, preserve the reserved action slot/no-layout-shift invariant, and do not absorb the separate Create/Edit List modal or later board/task/search/settings/report items.
