# M5 SS-C01 create-list color-picker coverage gap — bounded reconciliation

Date: 2026-10-08 (Europe/Athens)

## Scope and baseline

Read-only inspection of authoritative `main` head `53481f3d9bf7fbc9a4702e78f67fc2809d73c260`, source screenshot finding SS-C01, Pass-3 VE-005 ~00:23–00:32, UI_UX_SPEC, existing crosswalk B3, and production `src/ListEditorModal.tsx`, CSS, Rust `src-tauri/src/list_editor.rs`, frontend API and list-editor tests. Also checked current handoff and open GitHub PR/CI state. This is a **bounded Create/Edit List control-level audit**, not a fresh global 46-image/19-video no-orphan proof.

## Supported findings and evidence limits

1. **Custom-color entry missing from Narro:** SS-C01 directly shows a *multicolor first swatch*; user confirms the source product lets users choose a custom list color. Current Narro has six fixed radio swatches and no multicolor entry, custom-color trigger or picker surface. No canonical screenshot/video inspected here demonstrates the custom popover/dialog, its opening transition, color model or apply/cancel behavior. Record capability gap separately from uncertain interaction and never claim the first swatch's exact click behavior as visually proven.
2. **Palette mismatch:** SS-C01 source swatch row includes a multicolor entry and additional hue families, whereas `ListEditorModal.tsx` hardcodes six colors: `#48d6c5`, `#b7d96d`, `#5da7e8`, `#8a78dc`, `#e0a34d`, `#df716b`. Calibration prohibits invented byte-exact reference hex values.
3. **Text mismatch:** canonical `Pick a list color` vs Narro `List color`; canonical title placeholder `Enter your list title` vs no `placeholder` on production title input. Other geometry/motion differences are not claimed without direct current-candidate comparison.
4. **Infrastructure exists:** React `ListEditorRequest` transports arbitrary color string; Rust `validate_color` accepts optional well-formed 6-digit hex, and current Home/list rendering guards accept that format. Thus adding a custom-color control does not require a new persistence schema. Existing validated flow and error/focus semantics must not regress.
5. **Tracking root cause:** 2026-10-04 global no-orphan reconciliation covered SS-C01 as part of a family-level Home/list/create/search ledger and B3 tracked generic palette fidelity only under M10. The original M5 scoped create/edit implementation was marked validated with preset radio coverage; that did not prove source control inventory completeness. This is a **finding-to-implementation coverage/granularity failure**, not evidence that the original M5 tests falsely reported their scoped outcomes.

## Disposition and continuation

- Crosswalk B3 is now explicit about source palette, B7 isolates missing custom-color behavior and its evidence limit, B8 isolates label/placeholder copy. Each routes to the **open M5 source-parity correction**; M10 remains release-candidate revalidation, not initial implementation.
- TODO M5 retains the historical validated basic Create/Edit List path but has an explicitly unchecked nested SS-C01 corrective gate (no new top-level item/counter denominator). Review exact remaining source evidence for trigger behavior, then implement the narrow accessible custom-color fallback and source-backed copy/swatches, test keyboard/pending/error/creation/edit/reopen persistence and check canonical layout in a suitable release candidate before closing M5 parity.
- Do **not** mark SS-C01 `SOURCE_PARITY_PASS` merely because a custom `<input type="color">` or arbitrary conventional picker is implemented. Unknown source UI is an explicit bounded evidence limit.
- Other unrelated findings are not reclassified by this targeted review; the family-level no-orphan ledger should not be interpreted as proof that no other control/state omissions exist. Future comparison should check source affordance/state **one by one**, reconcile exact implementation/disposition, and distinguish an open issue from a known intentional deviation.
- Existing `HANDOFF.md` higher-priority repinned Windows physical session is unchanged. No Windows physical observation, application code change, new CI run, new visual parity PASS or validation milestone advancement occurred in this documentation-only correction.

## Validation

Static consistency checked against the source and required target-file anchors before commit. Application tests/CI/physical verification: **NOT RUN** (Markdown-only evidence/tracking update). No PASS or progress-counter change.
