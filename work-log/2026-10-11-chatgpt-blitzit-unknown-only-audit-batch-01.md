# Blitzit unknown-only audit — batch 01 (U01–U02)

- **Date:** 2026-10-11 (Europe/Athens)
- **Track:** audit/analysis only; no Narro application/source/test/config/CI modifications; optional M11 remains dormant.
- **Repository examined:** `MariosGiannakaras/Narro`, initial main `2e3585adac8ee0a1f2f013a2513a4d3e329ae809`; PR #321 is separate open test/capture work and was not modified.
- **Audit actions:** 3/42 completed (1 existing-scope/canonical-discovery action + 2 full U-item reviews).
- **Findings reviewed:** 2/41. Original register U01–U41 counts independent source questions; the 31 snapshot `EVIDENCE_LIMIT` control claims are separately enumerated supporting evidence, *not* counted as automatically independent U-items.
- **Changed documentation:** `docs/BLITZIT_UNVERIFIED_BEHAVIOR_REGISTER.md` and this immutable log; no modifications to `TODO.md`, `HANDOFF.md`, `STATUS.md` or unrelated implementation continuation.

## Discovery inputs (read-only)

- `AI_START_HERE.md`, `AGENTS.md`, `AGENT_WORKFLOW.md`, `ENGINEERING_QUALITY.md`, `HANDOFF.md`, active `TODO.md` and `STATUS.md`; current only open PR #321 and exact main identity.
- `docs/EVIDENCE_ROUTING_MAP.md`, `docs/DEEP_ANALYSIS_IMPLEMENTATION_WORKFLOW.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, `docs/BLITZIT_UNVERIFIED_BEHAVIOR_REGISTER.md`, `docs/BLITZIT_CONTROL_STATE_AUDIT_MATRIX.md`, `docs/BLITZIT_FORENSIC_PASS3_TRACKER.md`, `docs/BLITZIT_FORENSIC_PASS3_SCREENSHOTS.md`, completed Pass-3 handoff and relevant earlier evidence. No new raw Blitzit MP4/frame-level PASS claimed.
- Existing source: `reference/original-blitzit-screenshots/current-v2.6.69-create-list-dialog.png` via canonical SS-C01 forensic record; historical VE-005 source-visibility limits; approved user reference `reference/narro-approved-designs/2026-10-09-spectrum-core-large-icon-library.html` and README.
- Current contract review: `src/ListEditorModal.tsx`, `src/ListEditorPopovers.tsx`, `src/listSpectrumColor.ts`, `src/ListIcon.tsx`, `src/listEditorApi.ts`, `src-tauri/src/list_editor.rs`, `src-tauri/src/list_builtin_icons.rs`, `src-tauri/src/persistence/lists.rs`, `scripts/test-ui-list-editor-modal.mjs`, `scripts/test-list-spectrum-color.mjs`, `scripts/test-list-builtin-icon-catalog.mjs`. Older pre-#282 native-color/HEX approach explicitly rejected in crosswalk B7; do not resurrect it.

## U01 — exact source boundary and local contract

**BLITZIT_CONFIRMED:** v2.6.69 create-list modal has `Pick a list color`, a multicolor-first swatch, six-color-family row and selected-swatch indication; current static screen does not show picker opened.

**UNKNOWN/SOURCE_ONLY:** actual picker structure, exact swatch RGBs, preview/commit policy, HEX input, keyboard/Escape/outside, transitions, persistence when canceled, error paths. Neither still nor cited older source action settles those.

**NARRO_INFERRED + USER_APPROVED_LOCKED:** UI's 184px HSV wheel and HEX six-digit direct selection, draft-only immediate changes, picker-opening rollback on Escape, retaining draft on outside click, list mutation only on successful Save/Create; frontend invalid-HEX guard, Rust `validate_color` typed validation, SQLite list color storage and effect ordering. Implementation is present. This is *not* original Blitzit-confirmed functionality.

**Disposition:** source-only uncertainty, no observed source-backed regression, no recommended implementation change; preserve approved visual/functional design. Existing tests reviewed but **NOT RUN** now. Physical Windows/browser rendered comparison **NOT RUN**. No product decision necessary for a reversible list-color draft.

## U02 — exact source boundary and local contract

**BLITZIT_CONFIRMED:** upload a list icon is offered in same SS-C01 modal. Screenshot does not confirm source native 218-icon chooser.

**UNKNOWN/SOURCE_ONLY:** built-in palette/metadata count and behavior, letter vs uploaded icon precedence, edit/duplicate/archive/reopen/restore, keyboard and cancel behavior. Do not attribute app-owned offline icon registry to Blitzit.

**NARRO_INFERRED + USER_APPROVED_LOCKED:** 218 offline whitelisted icons; typed `Keep|Letter|Builtin{id}|Upload{filename,bytes}` frontend/Rust contract; allowlist check; separate SQLite `icon_id` and owned `icon_asset`; archive restores same list identity; duplicate retains builtin ID or copies a distinct local upload; update cleans former upload only after successful DB mutation; rollback removes staged icon on failed transaction. Tests for allowlist, exact count, rejection, duplicate, keep/upload/clear and persistence are present. Do not confuse their historical CI with any new run.

**Disposition:** source-only uncertainty and deliberate product-specific extension; no evidence of a source-parity defect or critical domain change request. No new `PRODUCT_DECISION_REQUIRED` is introduced. Native physical verification **NOT RUN**, direct Blitzit comparison **NOT RUN**.

## Validation and stop condition

- GitHub repository/document/source review completed for this batch; no application code patch, no tests run, no builds run, no CI started, no Windows physical or M11 checks performed.
- Reviewed **2/41** registered Blitzit-unknown findings; **audit actions 3/42** including the baseline inventory discovery.
- No new `BLITZIT_CONFIRMED` claims; no demonstrated bug; no implementation requests.
- **STOP HERE.** Do not review U03 or advance either counter until the user explicitly asks to continue. Next audit subject: U03 sound toggles, selection, volume and playback/event/persistence versus source SS-C09/VE-014; use claim-level evidence and protect local invariants.
