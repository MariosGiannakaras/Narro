# 2026-10-17 — One-time global visual audit belongs in M10, not each PR

**Explicit user decision:** Do **not** perform a holistic whole-app visual inspection after every change. Instead, schedule **one systematic whole-product user-visible/branding audit in required Milestone 10**.

**Documentation-only action:** `TODO.md` now has a distinct unchecked M10 whole-app visual identity/screen-state coverage task covering all relevant app surfaces, official Narro logo/assets, dark/light, shared navigation, overlays, empty/error states and accepted source screenshots. It requires an explicit screen/state/source/candidate evidence matrix and focused follow-up fixes, without default recapture or duplicate prior validated tests. `docs/DEEP_ANALYSIS_IMPLEMENTATION_WORKFLOW.md` now enforces only affected-area checks/CI for ordinary PRs and preserves M10's hard entry gate.

**Important limitations:** This decision changes **when the broad audit occurs**, not the obligation to fix a concrete, already-proven defect or to validate affected components in a current PR. M10 remains **NOT STARTED / hard-entry gated**; no extra Windows/PA-01–09 testing, OBS, AppData access, M11/M12 activation, application source change or CI gate executed by this documentation-only change. Existing approved Spectrum Core Create/Edit List picker, image upload and 218 offline icons untouched.

**Next action unchanged:** Continue active branding [PR #369](https://github.com/MariosGiannakaras/Narro/pull/369) from its exact-head CI/visual-fixture checkpoint, without starting a global sweep. Reuse accepted screenshots for later M10.
