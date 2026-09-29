# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 2/5 | 11/19`

**Reopened Milestone 1 corrective foundation remains the active ordered roadmap work.** PR #192 implementation and the exact-head automated checkpoint are now complete; physical Windows acceptance is the next unresolved boundary. The binding architecture remains one persistent fixed-host `focusSurface` with dynamic React Panel/compact Timer/expanded Timer presentations plus DPI-aware native visible-region/position coordination.

- Roadmap: **4/10 milestones currently complete**. M1 and M6 remain reopened in the exact scope invalidated by the single-Focus replacement; M2–M5 remain complete.
- Current corrective slice: **2/5** — (1) implementation/static migration closure PASS, (2) exact-head automated validation PASS, (3) Gate 7 physical continuity OPEN, (4) Gate 12 mixed-DPI physical recovery OPEN, (5) guarded merge/resulting-main/tracking closure OPEN.
- M1: **11/19 top-level items currently validated**. Windows CI now closes the two-window replacement composition and consolidated Focus-only production entry; interactive presentation/topology, physical behavior and performance items remain open.
- M6: **15/18 top-level items currently validated**; Focus placement/topology and full replacement-host integration remain open.
- M7: **1/15 top-level items currently validated**; host/presentation/placement/shortcut/performance-dependent items remain reopened except the unrelated validated Change List/Duplicate capability.
- M8: **3/8 top-level items currently validated**; in-app/global Focus routing and Start Break remain reopened because their integration target changed. Unaffected conflict handling, nested Preferences behavior and settings persistence remain validated.
- Audit `FIX_NOW`: **M7-PHYS-01 and M7-PHYS-02** remain open solely for required physical acceptance.
- PR #192 is **OPEN** on `plan/m7-single-focus`, current exact head `73d10ab6a21d731ca363e9932b4ccaf13a000b43`, mergeable. Windows CI #672 / run `36589997295` is PASS on that exact head.
- Runtime artifact: `narro-m1-runtime-harness-windows-x64`, id `11043444940`, digest `sha256:e1110b10c6d7cb867401126df931f3b52af414f097bb6a0bd9d790f6dac2fd76`.
- Visual artifact: `narro-m5-visual-regression`, id `11043762203`, digest `sha256:51f21e05abd5aace6147f6be86c4645371d8dd06dc1f459375752d72c69a46cb`.
- CI #672 passed Repository Preflight, the single-Focus architecture/transition contracts, frontend build, Rust fmt/check/clippy/tests, Windows visual regression, reused frontend-dist verification and Tauri release.
- The prior old-head CI #666 lexical-order failure is superseded. Do not treat it as a current blocker.
- Documentation/process truth continues to live directly on `main`; later Markdown-only `main` commits do not change the exact validated PR source tree. Before any further source edit, reconcile the active branch with current `main` tracking truth without reinterpreting that merge as new source validation.
- The parked `brand/pure-vector-runtime` branch at `92551eaba723ce5ae94fa2cc92e0027e46df1942` remains preserved and is not the active slice.

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

## M7 PHYSICAL CLOSURE — OPEN; AUTOMATED VALIDATION PASS, PHYSICAL ACCEPTANCE NEXT

Exact PR #192 head `73d10ab6a21d731ca363e9932b4ccaf13a000b43` passed authoritative Windows CI #672 / run `36589997295`. The replacement now has reproducible automated evidence for the one-`focusSurface` architecture, fixed 340×700 host, 340×110/340×300 Timer regions, prepaint/inert transition ordering, rollback-safe native commits, topology/DPI logic, frontend/Rust tests, visual fixtures and release packaging.

This **does not close Gate 7 or Gate 12**. The earlier exact-build physical failures were compositor/window-runtime observations and can only be replaced by physical evidence from this exact candidate (or a later corrected exact head).

Required physical evidence now:
- **Gate 7:** Windows animations On; use the exact #672 runtime artifact. With one live/paused task/session, run at least 3× Panel→Timer→Panel and 3× compact Timer Expand→Collapse cycles. Confirm no pure-white host frame, no old/stale expanded tail, no Timer/Panel overlap, no loading copy, no scrollbar flash, no abrupt visual discontinuity, and unchanged task/session/time across each cycle.
- **Gate 12:** when a Windows-visible secondary display is available, set/use 125% scaling on the secondary monitor, move the compact Timer there, and confirm its logical 340×110 presentation does not shrink or expose scrollbars. Expand near the bottom/work-area edge and confirm controls remain reachable, then collapse. Preserve session/time throughout.
- Keep Windows animation settings and the user's profile state restored after testing.
- If either gate fails, record exact artifact/build identity plus the observed signature and fix only that evidence-backed defect on PR #192. Do not start a replacement architecture or revive PR #191 mechanisms without new evidence.

M8 forward feature work remains blocked until the corrective M1→M6→M7 replacement chain has sufficient physical acceptance to re-close the affected integration basis.

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

Obtain **Gate 7 physical continuity evidence on the exact PR #192 CI #672 runtime artifact**. Gate 7 is now the first unresolved acceptance criterion that cannot be established by the available non-interactive tooling.

If Gate 7 passes:
1. record the exact observation and artifact identity in a new immutable work log;
2. perform Gate 12 mixed-DPI validation when a visible secondary display is available;
3. after all required replacement physical evidence passes, expected-head-guard merge PR #192, verify resulting-main tree/source identity or run required main validation if it differs, then reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md`, audit crosswalk and work log;
4. only after the affected M1→M6→M7 basis is reclosed, revalidate the reopened M8 Focus shortcut integration and resume remaining M8 work.

If Gate 7 fails, keep PR #192 open and fix only the observed exact-build failure on the same branch; repeat exact-head CI before another physical attempt.

## USER ACTION REQUIRED

**Gate 7 requires a physical Windows observation now.** Available CI/browser/repository tooling cannot prove continuous desktop compositor behavior. Use runtime artifact id `11043444940` from Windows CI #672 / run `36589997295`, exact source head `73d10ab6a21d731ca363e9932b4ccaf13a000b43`.

Required observation:
- Windows animations **On**;
- retain one identifiable live/paused task/session and visible time;
- 3× Panel→Timer→Panel;
- 3× compact Timer Expand→Collapse;
- report whether any white/blank frame, stale tail, Timer/Panel overlap, loading copy, scrollbar flash or abrupt discontinuity appears;
- confirm the same task/session/time survives the cycles.

For Gate 12, a Windows-visible secondary monitor at 125% scaling is required later. If no second display is currently available, record Gate 12 as unavailable rather than inferring PASS.

No other user/product decision is blocking implementation.
