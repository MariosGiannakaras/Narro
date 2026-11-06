# Cleanup residue and workflow/handoff audit — 2026-11-07

## Scope and result

Base: `e953db3225406cc03e432c2bc0f1715ca743c19f`. Owner: Codex. Branch: `cleanup/workflow-handoff-residuals-20261107`.

This is an independently scoped cleanup of obsolete root audit tooling and contradictory live documentation. It is **not** the previously refused 27-family deletion or refused temporary-tracker update. Those paths remain untouched, with cleanup **OPEN 1/5**. No application behavior, native acceptance, source parity, PR389/419/431/436/437 integration or milestone checkbox is changed.

## Exhaustive metadata and bounded content checks

- Complete current Git tree: **6,012 blobs**, not a truncated 300-file compare.
- Non-evidence text scan: **1,840 files**, including source, configuration, workflow, scripts, specs and historical receipts. This is a static dependency/document audit, not an exhaustive functional/security audit of every application behavior.
- Proposed old-evidence scope independently enumerated: **27 folders /4,065 paths /2,340,643,868 logical B**; every family count and size matches Batch 2. There are **zero literal family/path consumers** in `src/`, `src-tauri/`, `scripts/`, `tests/` or `.github/`. Historical receipts contain 9,263 matching lines; citation presence alone does not establish a current consumer or permit removal.
- Original Blitzit manifest: **86/86 blob IDs and sizes match**, 256,345,969 bytes; zero changed/missing entries. 46 screenshots, 19 original MP4, 19 SRT, two explicitly derived VE005 frames. No media were recompressed or rewritten.
- Both workflow files inspected: `ci.yml` and `ci-learning.yml`. Checked CI tiering, Markdown exclusions, full-tree merge deduplication, minimal job permissions, artifact provenance/fail-closed upload guards, short retention of transient visual artifacts, and scheduled recurrence-scan behavior. Literal script targets in workflows/package commands resolve; no removed root helper is an application, package, workflow or test consumer. Workflow YAML unchanged.
- Live PR heads checked read-only: 389 `ec9227a2`, 419 `6a72cf56`, 431 `3c3b72b0`, 436 `3561597d`, 437 `63234502`; all open, draft except 431. This audit does not infer current CI or new package acceptance from those states.
- Markdown-link scan found **1,199 candidate unresolved relative links** in the original tree. These include root-relative syntax interpreted from subdirectories and links to intentionally retired evidence. This is a discovery count, not 1,199 runtime defects. Historical immutable receipts were preserved. The active navigation was rewritten, and the crosswalk now explains recovery via the relevant pre-deletion receipt rather than implying old recordings remain usable/current. Exhaustive semantic repair of every dated historical citation is **not claimed**.

## Changes

- Remove **14** one-off root Python audit/verification helpers: eight `audit_*.py` and six `verify_*.py`. Their outputs are frozen 2026-11-01 provenance; several would overwrite that frozen directory or require retired recordings if run today. No production/package/workflow/test consumer references these helpers. Recover helper and matching historical inputs from the exact base commit when reproducing history in a disposable checkout. The historical output JSON/CSV/receipts remain tracked.
- Replace the 97-KB handoff chronology with one current NOW/NEXT, verified PR heads, explicit independent gates, recovery links and real deletion blocker. Remove duplicated historical checkpoint prose from STATUS, TODO, evidence inventory and tracker index. Every removed historical paragraph remains recoverable at the base Git commit; no additional duplicate snapshot directory was created.
- Preserve the detailed TODO milestone ledger **verbatim**, including all **419 checkbox tokens**, M10 entry/user-review hold and independent M11/M12 opt-ins. Historical TODO preambles/trailing obsolete WIP are no longer competing current instructions.
- Clarify that the temporary tracker stage 1/5 remains current but its old cumulative counters are historical; do not retry its separately refused update or remove it before actual full closure.
- Fix one CI-tiering test portability defect: split `.gitignore` lines with `/\r?\n/` rather than LF alone. This preserves the exact required ignore-rule assertion while accepting a normal CRLF Windows checkout.
- Preserve all app source, Rust/frontend configuration, tests other than that one CI-tiering assertion, branding, original Blitzit and the 27-family evidence tree. Generated build icons were restored to exact base content after validation; generated local outputs are not committed.

## Validation

- **PASS:** original Windows CRLF checkout reproduced the CI-tiering failure; corrected test passes without changing `.gitignore` or weakening its requirement.
- **PASS:** targeted Node run — **21/21** tests across CI learning, CI tiering, preflight impact and single-focus architecture.
- **PASS:** full `npm run preflight:frontend`, including **111 npm test command entries**, configuration invariants, artifact manifests and TypeScript/Vite production build, with source text normalized locally to Git/CI LF. No application source content changes enter the diff.
- **Environment observations:** initial full run also hit a pre-existing literal-LF assertion in `test-ui-focus-entry.mjs` against CRLF Rust source. It passed with the identical Git content in LF. A subsequent sparse-checkout run lacked SQL migrations; adding the source/migration paths resolved that local fixture absence. Neither is represented as an application-source failure or silently patched app behavior.
- **PASS:** exact deletion list contains only the 14 independently audited root helpers; milestone ledger unchanged; protected-source/media/27-family/tracker diff empty; `git diff --check` clean. NER-003/011/012 controls reviewed: strongest local preflight, exact narrow mutation/recovery and separate acceptance claims.
- Exact PR-head remote CI and resulting-main verification are recorded in HANDOFF after publication. They are not preclaimed by this receipt.
- **NOT RUN:** Rust compilation/Clippy/native tests, real Windows UI/motion/hardware scenarios, new physical capture, AppData changes or fresh source-parity acceptance. The change does not invalidate existing application-binary behavior evidence.

## Remaining blocker and next operation

Issue #491 remains open with no recorded clearance. The original denial diagnostic/code is unavailable; its exact mechanism is **UNDETERMINED**, not established as GitHub permissions or a size limit. No rejected operation was retried or routed through a local clone. Full historical evidence cleanup remains incomplete: **4,065 retired Narro files remain**. The old frozen media/ZIP cohort remains 562/700 retired and 138/700 present; evidence retirement count remains 32,536. Root helper removals are a separate maintenance count.

Publish this independent slice, validate exact-head gates and resulting-main protected tree, then remove only the owned temporary clone. Obtain a supported resolution of the original tool denial before any 27-family removal; do not claim final whole-cleanup closure from this independent improvement.
