# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 2/5 | 11/19`

**Reopened Milestone 1 corrective foundation remains the active ordered roadmap work.** The first exact-artifact Gate 7 candidate failed, its evidence-backed focus-document transparency correction is implemented on the same PR, and the corrected exact head has now passed authoritative Windows CI. Physical Gate 7 retest is the next unresolved boundary.

- Roadmap: **4/10 milestones currently complete**. M1 and M6 remain reopened in the exact scope invalidated by the single-Focus replacement; M2–M5 remain complete.
- Current corrective slice: **2/5** — (1) implementation/static migration closure PASS, (2) exact-head automated validation PASS, (3) Gate 7 physical continuity OPEN after one FAIL and corrected CI-green candidate, (4) Gate 12 mixed-DPI recovery OPEN/NOT RUN, (5) guarded merge/resulting-main/tracking closure OPEN.
- M1: **11/19 top-level items currently validated**. No counter advances until the corrected candidate physically passes its reopened acceptance.
- M6: **15/18** validated; placement/topology/full replacement-host integration remain open.
- M7: **1/15** validated; Gate 7 remains the blocking FIX_NOW acceptance item.
- M8: **3/8** validated; affected Focus shortcut work remains blocked behind the corrective chain.
- PR #192 remains **OPEN** on `plan/m7-single-focus`.
- Previous exact physical-fail candidate: `73d10ab6a21d731ca363e9932b4ccaf13a000b43`, Windows CI #672 PASS, physical Gate 7 FAIL.
- Current corrected candidate: `44119dbe829131d38f56fd35250142ed973b2574`.
- Windows CI #674 / run `36609576132`: **PASS** on the exact corrected head.
- Runtime artifact: `narro-m1-runtime-harness-windows-x64`, id `11052303615`, digest `sha256:eca3865bb08d754f7f43a0b9bd436f6a83a45f89b209345a328b66ec8c534bfd`.
- Visual artifact: `narro-m5-visual-regression`, id `11052433065`, digest `sha256:6815f49fe70f0226b83d1867b28a78574d2fc4e9066e95f97d28b949fbdb7b4e`.
- CI #674 passed Repository Preflight, Windows visual regression, reused frontend-dist verification, Tauri release and required artifact uploads.
- Corrective delta is intentionally narrow: `src/focusDocument.css` makes only the Focus entry document canvas transparent; actual Panel/Timer surfaces stay painted. Config and transition preflight now protect native/document transparency.
- No native geometry, window count, timer/session authority, persistence or compact/expanded sequencing changed.
- Immutable failure record: `work-log/2026-09-29-chatgpt-m7-ci672-physical-fail.md`.
- Immutable corrected-candidate record: `work-log/2026-09-29-chatgpt-m7-ci674-transparent-canvas-candidate.md`.
- The parked `brand/pure-vector-runtime` branch remains preserved and is not active.

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

## M7 PHYSICAL CLOSURE — OPEN; CORRECTED CI #674 CANDIDATE AWAITS RETEST

Exact #672 source `73d10ab6...` physically failed Gate 7 because the shared opaque HTML document canvas became visible while React clipping and the Win32 region temporarily differed.

The narrow correction is now implemented and automated-validated:
- exact candidate `44119dbe829131d38f56fd35250142ed973b2574`;
- focus-entry-only document background is transparent;
- native `focusSurface.transparent` is explicitly guarded;
- transition preflight guards the transparent Focus document contract;
- Windows CI #674 / run `36609576132` PASS.

This does **not** close Gate 7. Continuous Windows compositor behavior must be re-observed on artifact id `11052303615`.

Gate 12 remains OPEN/NOT RUN because no replacement candidate has yet been physically exercised on the required Windows-visible 125% secondary display.

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

PR #191 is closed unmerged and remains historical evidence only. Live implementation state is PR #192 on `plan/m7-single-focus` at exact automated-validated head `73d10ab6a21d731ca363e9932b4ccaf13a000b43`. The parked PureVector runtime branch remains intentionally preserved and unmerged. The merged fully validated application-source baseline remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed` until PR #192 receives required physical acceptance, guarded merge and resulting-main reconciliation.

Current `main` contains newer documentation/tracking commits recording CI #672. Those Markdown-only commits do not alter the PR executable tree.

## NEXT AGENT ACTION

Obtain Gate 7 physical evidence on the exact PR #192 CI #674 runtime artifact, source `44119dbe829131d38f56fd35250142ed973b2574`.

Acceptance procedure:
1. Keep Windows animations On.
2. Use one identifiable live/paused task/session with visible timer continuity.
3. Run at least 3× Panel→Timer→Panel.
4. Run at least 3× compact Timer Expand→Collapse.
5. Confirm the prior blank/light 340×700 host exposure is gone in both directions.
6. Also reject any white/blank frame, stale expanded tail, Timer/Panel overlap, loading copy, scrollbar flash or abrupt discontinuity.
7. Confirm the same task/session/time is preserved.

If Gate 7 passes, record exact physical evidence and advance to Gate 12 when a visible 125% secondary display is available. If Gate 7 fails, keep PR #192 open and fix only the observed exact-build failure signature, then repeat exact-head CI.

Do not merge PR #192 before the required physical gates are satisfied.

## USER ACTION REQUIRED

**Gate 7 physical retest is required now.** Use the exact CI #674 runtime artifact, id `11052303615`, source `44119dbe829131d38f56fd35250142ed973b2574`. A screen recording is preferred because the criterion is continuous transition behavior.

Gate 12 will later require a Windows-visible secondary display at 125% scaling. If that display is unavailable, keep Gate 12 as NOT RUN rather than inferring PASS.
