# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 1/5 | 9/19`

**Reopened Milestone 1 corrective foundation remains the active ordered roadmap work**, triggered by the M7 Gate 7/12 failures. The PR #192 **implementation phase is complete by static repository reconciliation**, but the current corrective small slice remains **1/5 completed/verified** because the four implementation/validation checkpoints that depend on tests, builds, Windows CI and physical evidence are intentionally not counted before validation. Exact implementation source head: `b506fd016eea2d3c45635a2cbdc74acde831d674`. The separate PureVector runtime branch remains preserved at its prior 2/3 implementation state and is not the active slice. The binding architecture is one persistent fixed-host `focusSurface` with dynamic React Panel/Timer presentation plus native visible-region/position coordination.

- Roadmap: **4/10 milestones currently complete**. M1 and M6 are reopened in the exact scope invalidated by the single-Focus replacement; M2–M5 remain complete.
- M1: **9/19 top-level items currently validated**; replacement window/presentation/DPI/topology/bundle/performance items are reopened.
- M6: **15/18 top-level items currently validated**; Focus placement/topology and full replacement-host integration are reopened.
- M7: **1/15 top-level items currently validated**; all host/presentation/placement/shortcut/performance-dependent items are reopened except the unrelated validated Change List/Duplicate capability.
- M8: **3/8 top-level items currently validated**; in-app shortcuts, global Focus routing and Start Break are reopened because their integration target changes. Unaffected conflict handling, nested Preferences behavior and settings persistence remain validated.
- Current audit `FIX_NOW` queue: **M7-PHYS-01 and M7-PHYS-02**. Gate 7 is now routed to the selected single-host/dynamic-component replacement; Gate 12 requires mixed-DPI validation on that replacement.
- **Documentation/process truth policy:** implementation instructions/spec/tracking/work-log/evidence changes that do not affect executable/build/test/CI semantics go directly to `main` without Windows CI. Markdown is already path-ignored; non-Markdown evidence-only commits use `[skip ci]`. Workflow YAML, scripts/tests, manifests/config and other tooling-consumed files are not docs/evidence-only. Before further source editing, the active implementation branch must be reconciled with current `main` repository truth.
- **PureVector branding correction (user-directed, 2026-09-29):** uploaded kit inventory is **101 files / 16 SVG / 73 PNG**. Independent audit confirms **16/16 SVG pure vector** with no embedded raster/image, external resource, script or live text/font dependency. Duplicate platform aliases were intentionally not copied wholesale into this Windows-only repo. `main` commit `4eec40492c2ac8678ea812d94be7003feed01be0` now has the curated source set, explicit stacked-light/dark + horizontal pairs, theme-aware README branding and the original pure-vector app-icon pair. Runtime wiring is staged on `brand/pure-vector-runtime` at `92551eaba723ce5ae94fa2cc92e0027e46df1942`: Tauri icon generation uses the square light app-icon SVG, runs before both dev and build, the old app-icon→tray copy mechanism is removed, the tray uses a dedicated 64×64 transparent symbol derivative, and `scripts/verify-branding.mjs` guards the vector/raster/runtime contracts. The committed generic Tauri icon files were identified as generated outputs rather than canonical brand sources; real dev/build preparation regenerates them from the Narro SVG. No PR or workflow run has been triggered for the branding branch.
- **Repository-wide architecture re-audit completed 2026-09-29:** active specifications, M1/M7 validation docs, README, roadmap/process rules and the live partial implementation were checked against the intended Single-Activity/Dynamic Component Toggling idea. The binding desktop interpretation is one persistent `focusSurface` HWND/WebView + one React root/coordinator + Panel/compact/expanded component presentations. The live migration ledger in `docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md` is now statically reconciled on PR #192 head `b506fd01...`; validation remains separate and open. Immutable audit log: `work-log/2026-09-29-chatgpt-single-focus-repo-wide-architecture-reaudit.md`.
- **PR #191 is CLOSED UNMERGED as superseded.** Its split-window/visual-hold branch remains historical evidence only. **PR #192 is OPEN** on `plan/m7-single-focus`; exact implementation source head is `b506fd016eea2d3c45635a2cbdc74acde831d674`. Before the final implementation commits, the branch merged tracking `main` `16d9b114630280ff701f46c3d87b829ec2ea1ad8` in `f95fea42b0f799cd438031872db0cf9f45a392ec`; that tracking main already descended from the build-affecting branding state `9a4bfff...`. The current source head contains the additional compact↔expanded Timer geometry motion and corrected transition contracts. The latest actual Windows CI remains old-head #666 / run `36568312141` on `567aa177...`, which failed the now-corrected lexical listener/snapshot assertion. **No test/build/CI/runtime/physical validation has run on `b506fd01...`**, and no workflow run exists for it because the implementation commits use `[skip ci]` under the validation deferral. Newer `main` descendants are tracking/work-log Markdown only; always read current `main` before any future source edit.
- **Current binding implementation direction:** use one persistent nominal 340×700 Focus HWND/WebView and one React root/coordinator. Panel (340×700), compact Timer (340×110) and expanded Timer (340×300) are dynamic components/presentations inside that host. Ordinary presentation changes must not close/open, create/destroy, hide/show or resize the Focus WebView; use target prepaint + native region/position/topmost/taskbar coordination instead. `Single-Activity Architecture` is an analogy only, not an Android/React API requirement. The complete implementation sequence is in `docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md`.
- The replacement starts at the affected **M1 native Focus window foundation**, carries through **M6 Panel integration**, then **M7 Timer/transition**, and finally the directly affected **M8 Focus-shortcut integration**. The affected milestone items are explicitly reopened; historical PASS records remain evidence for the old implementation only. Preserve M2–M5 and unaffected M8 work. See the dependency map in the plan.

## CURRENT VALIDATED APPLICATION SOURCE BASELINE

**`e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`**

Latest source slice: **PREF-R01 authoritative timed task alerts**.

Validation evidence:
- PR #184 exact validated head: `fc61ed5926fdb1c605de8ce1e1a9fb28ea0dfd7e`;
- Windows CI #624 / run `36357415253`: PASS;
- Repository Preflight, Windows visual regression and Tauri Release: PASS;
- visual artifact `narro-m5-visual-regression`: id `10944696812`, digest `sha256:2569c35b4aef14a713b4d73d4f80b9bd6e02114e764b6e9f8646aa29a781c769`;
- runtime artifact `narro-m1-runtime-harness-windows-x64`: id `10944304485`, digest `sha256:4f76740bc6f69dcd1d664c9fb80011520567612c9eb6d87ab4e09e02e3b1bf7c`;
- expected-head guarded squash merge: `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`;
- resulting-main source-tree identity: PASS. The merge used base `0770e3d41b3f5a55b2d23b6874975cbd420ef379`, and all nine files changed by PR #184 have identical blob SHAs at the validated PR head and merged main SHA.

PREF-R01 now uses persisted timed-alert preferences, authoritative Rust work elapsed state, durable idempotent run/boundary effects, delayed catch-up without backfill, lifecycle retirement/reset, and a typed local `timed-alert-effect` boundary. Timer flash, sound playback and PREF-R03 notification gating remain intentionally outside this validated slice.

## EVIDENCE / AUDIT STATE

- Final audit methodology is hardened for explicit 46/46 canonical-image disposition, named professional UI/UX evaluation lenses, measurable accessibility/contrast evidence, repeatable visual measurements, and a local-desktop security/privacy sweep. These are post-M10 final-review requirements and do not change current milestone counters.

- Uploaded video corpus: **38/38 raw files, 19/19 MP4/SRT pairs, 19/19 analyzed/reconciled/dispositioned**.
- UI/UX forensic second pass: **19/19 complete**.
- Help Center pass: **34/34 visible legacy-navigation pages inventoried/classified; 15/15 Narro-relevant pages deep-reviewed**.
- Canonical screenshot corpus: **46 retained images** — 22 current v2.6.69, 17 Help Center originals, 7 historical.
- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` is authoritative for finding disposition.
- CORR-01 recurrence No Repeat/Delete Existing correction is VALIDATED.
- New exact-build physical findings `M7-PHYS-01` and `M7-PHYS-02` remain `FIX_NOW` in the audit crosswalk until exact-build physical acceptance passes.
- M9 findings remain routed to M9; M10/final-review findings remain routed to later gates; unresolved source ambiguities remain explicit.

## M7 PHYSICAL CLOSURE — OPEN; IMPLEMENTATION COMPLETE, VALIDATION DEFERRED

The coherent replacement implementation is now complete by static repository reconciliation. By current user direction, do not run tests/builds/CI/app launches/physical checks until explicitly authorized. When validation is authorized, re-close the reopened milestones in dependency order: **M1 → M6 → M7 → affected M8 shortcut items**. Do not start unrelated remaining M8 feature work before that corrective chain is validated/reconciled.

The CI #624 physical batch has now run on its exact artifact:
- artifact id: `10944304485`;
- digest: `sha256:4f76740bc6f69dcd1d664c9fb80011520567612c9eb6d87ab4e09e02e3b1bf7c`;
- source tree is identical to merged main `e3a9abf8...`;
- immutable result: `work-log/2026-09-28-codex-m7-ci624-physical-batch.md` with sanitized frames in `work-log/evidence/`;
- Gate 7 **FAIL** (On white frames on Timer→Panel and Expand/Collapse), Gate 12 **FAIL** (125% secondary-monitor Timer shrink/scrollbars);
- Gates 8, 9, 10 and 11 **PASS** within the documented physical scope.

PR #191 exact-build and physical chronology is consolidated in `work-log/2026-09-28-codex-m7-visual-continuity-history.md`. Its split-window composition is superseded and must not be merged as the final solution. Gate 12 remains open for the replacement build.

The original SQLite profile is restored and its SHA-256 matches the pretest copy at `artifacts/m7-separate-timer-runtime/profile-before.db`. The test profiles and raw captures remain in ignored artifacts. Windows animations are On, confirmed by both `SPI_GETANIMATION=1` and `SPI_GETCLIENTAREAANIMATION=1`. One 100% display is currently exposed; the secondary 125% Gate 12 branch remains unavailable.

## REMAINING M8 ORDER

After the single-Focus replacement corrective chain is implemented, validated and reconciled:
1. PREF-R02 — finite animated timer flash, reduced-motion safe.
2. PREF-R03 — Notification Alerts gating without duplicating authoritative M3 effects.
3. PREF-R05 — local/Narro-owned sound catalog and non-overlapping preview behavior.
4. PREF-R06 — Windows locale/system 12/24-hour date/time presentation.

PREF-R01 and PREF-R04 are validated and must not be reimplemented.

## INVARIANTS THAT MUST NOT REGRESS

- Product-fidelity default: for in-scope personal/local functionality, confirmed Blitzit behavior and visuals are the target. Do not introduce discretionary redesign. Known Blitzit reliability failures are preventive engineering input and must shape implementation/tests before affected work. If an exact source detail remains unknowable after relevant evidence is exhausted, choose the strongest professional reconstruction consistent with adjacent Blitzit patterns, Narro's established UI/UX, Windows conventions, accessibility and reliability, and record it as inference/design decision rather than confirmed source behavior.
- Narro remains local-only Windows software with Tauri 2 + React/TypeScript, SQLite, and authoritative Rust/domain state.
- `main` + reusable `focusSurface` remain the validated two-window architectural baseline. PR #191 is closed unmerged and its separate Timer WebView is historical evidence only; the active replacement uses the single persistent `focusSurface`.
- persistence-first mutations, stable task identities, session/time accounting, recurrence idempotence and Windows-local scheduling semantics remain authoritative.
- Focus/Floating presentation changes cannot reset, duplicate or independently advance a live session.
- Notes URLs require explicit activation; aggregate All Lists reorder remains disabled.
- hover/focus actions keep reserved geometry and keyboard/reduced-motion accessibility.
- No Repeat may delete only pristine active generated children when explicitly requested; customized/history-bearing/completed/archived/legacy-linked children survive detached.
- excluded account/cloud/trial/upgrade/profile/AI/integration controls remain absent.

## REPOSITORY HYGIENE NOTE

The abandoned CI dedup regression guard was recovered, validated and merged in PR #186 / Windows CI #626. The old regression branch was subsequently removed. That earlier clean-state sentence is historical only. Live state now includes open PR #192 on `plan/m7-single-focus` at implementation source head `b506fd01...` plus the parked user-directed unvalidated `brand/pure-vector-runtime` branch. The PR #192 source tree has the build-affecting branding state from `main` `9a4bfff...`; later direct-main Markdown tracking commits do not replace the validated application source baseline. The validated application source baseline remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.

## NEXT AGENT ACTION

**Do not start another implementation slice.** PR #192 implementation is complete at exact source head `b506fd016eea2d3c45635a2cbdc74acde831d674`; the next ordered action is the **deferred validation phase**, and it must not begin until the user explicitly authorizes testing.

Before validation:
- read current `main` tracking truth and confirm PR #192 still points to `b506fd016eea2d3c45635a2cbdc74acde831d674` or record any newer exact head;
- if `main` has only newer Markdown tracking descendants, do not reinterpret them as source validation;
- preserve the parked `brand/pure-vector-runtime` branch at `92551eaba723ce5ae94fa2cc92e0027e46df1942`;
- do not resurrect `timer.html`, `focusPanelWindow.tsx`, a second Timer WebView, bitmap visual hold, or ordinary Focus WebView hide/show/resize switching.

When the user explicitly authorizes testing, validate the exact then-current PR head in this order:
1. Repository Preflight and the narrow single-Focus/transition contracts first.
2. Full authoritative Windows frontend/Rust checks/tests and visual regression.
3. Tauri release build plus required artifacts.
4. Confirm successful exact-head PR Windows CI.
5. Perform physical Gate 7 continuity with Windows animations On.
6. Perform mixed-DPI Gate 12 when a Windows-visible secondary display is available.
7. Fix only evidence-backed failures on the same PR branch; revalidate the exact new head.
8. After required evidence passes, use expected-head-guarded merge, validate resulting `main`, then reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md`, crosswalk and a new immutable work log.

Immutable implementation-complete record: `work-log/2026-09-29-chatgpt-m7-single-focus-implementation-complete.md`.

## USER ACTION REQUIRED

After the implementation phase, the user's explicit instruction is required to begin tests/CI/physical validation. A future secondary-display Gate 12 retest also requires a Windows-visible second monitor. Neither condition blocks the implementation work above.

No Blitzit evidence upload is pending. The uploaded corpus and its analysis are complete.
