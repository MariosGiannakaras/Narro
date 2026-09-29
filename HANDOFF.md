# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 2/5 | 11/19`

**Reopened Milestone 1 corrective foundation remains the active ordered roadmap work.** PR #192 implementation and exact-head automated validation are complete, but the first exact-artifact physical Gate 7 retest has **FAILED**. Continue the same PR with the narrow evidence-backed correction; do not restart or replace the selected architecture.

- Roadmap: **4/10 milestones currently complete**. M1 and M6 remain reopened in the exact scope invalidated by the single-Focus replacement; M2–M5 remain complete.
- Current corrective slice: **2/5** — (1) implementation/static migration closure PASS, (2) exact-head automated validation PASS, (3) Gate 7 physical continuity FAIL/OPEN, (4) Gate 12 mixed-DPI recovery OPEN/NOT RUN, (5) guarded merge/resulting-main/tracking closure OPEN.
- M1: **11/19 top-level items currently validated**. No counter advances from the failed physical retest.
- M6: **15/18** validated; placement/topology/full replacement-host integration remain open.
- M7: **1/15** validated; Gate 7 remains a blocking FIX_NOW defect.
- M8: **3/8** validated; affected Focus shortcut work remains blocked behind the corrective chain.
- PR #192 remains **OPEN** on `plan/m7-single-focus`. Exact failed physical candidate: `73d10ab6a21d731ca363e9932b4ccaf13a000b43`.
- Windows CI #672 / run `36589997295` is PASS on that exact head.
- Runtime artifact id `11043444940`, digest `sha256:e1110b10c6d7cb867401126df931f3b52af414f097bb6a0bd9d790f6dac2fd76`.
- User recording `2026-09-29 20-49-29.mkv`: SHA-256 `b843eaa81d8296fe03febfb79e6dbb1f95b2a0834caf11acec68f2f467df4536`, H.264 2560×1080, 60 fps, 49.384 s. Windows “Show animations in Windows” is visibly On.
- Four Panel→Timer boundaries repeatedly expose a large blank/light 340×700 host area for about 0.23–0.25 s: ~4.883–5.117, 11.167–11.383, 21.950–22.167 and 25.400–25.617 s. Shorter reverse-boundary exposure occurs around 8.050–8.100, 19.100–19.150 and 24.367–24.417 s.
- Compact↔expanded Timer cycles in the same recording do not show the same full-height blank tail. The same task/session remains active and the running timer advances without reset.
- Evidence-backed cause: the Tauri `focusSurface` is already transparent, but shared `App.css` paints `:root` and `body` with opaque `var(--color-canvas)`. During the intentional renderer-clip/native-region offset, that document canvas becomes visible.
- Corrective scope: make the runtime `focus.html` document root/body/#root transparent, preserve opaque backgrounds inside actual Panel/Timer surfaces, and add a preflight/static invariant. Do not alter window count, native presentation architecture, timer/session authority, or compact/expanded sequencing from this evidence alone.
- Immutable physical-fail record: `work-log/2026-09-29-chatgpt-m7-ci672-physical-fail.md`.
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

## M7 PHYSICAL CLOSURE — OPEN; CI PASS, EXACT-ARTIFACT GATE 7 FAIL

The single-Focus replacement passed authoritative CI on exact head `73d10ab6...`, then failed Gate 7 on its exact runtime artifact with Windows animations On.

The failure is now specific and reproducible rather than architectural speculation:
- Panel→Timer leaves the transparent Tauri host backed by an opaque HTML document canvas while the Panel clip contracts before native Win32 clipping.
- Timer→Panel briefly exposes the same canvas after native expansion and before the prepared Panel clip finishes revealing.
- This produces the observed blank/light host intervals.
- Compact↔expanded Timer did not reproduce the full-height defect in the submitted recording.

The next candidate must change only the focus-document canvas transparency plus its regression contracts, then pass exact-head CI before another Gate 7 physical retest.

Gate 12 remains OPEN/NOT RUN on the replacement because the submitted recording does not provide the required visible 125% secondary-display scenario.

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

1. Reconcile `plan/m7-single-focus` with current `main` Markdown/process truth.
2. On the same PR branch, implement the narrow Gate 7 correction:
   - add a focus-entry-only stylesheet or equivalent that makes the runtime `focus.html` `:root`/html/body/#root background transparent;
   - leave Main and diagnostics/component surface backgrounds unchanged/opaque where they are intentionally painted;
   - assert `focusSurface.transparent === true` in repository config validation;
   - add a static transition contract requiring the focus-entry transparency override.
3. Run the narrow frontend/config/transition checks available locally, then authoritative exact-head Windows CI.
4. If CI passes, produce/use the exact new runtime artifact for another animations-On Gate 7 recording.
5. Only after Gate 7 passes continue to Gate 12 and later guarded merge/tracking closure.

Do not revive PR #191 visual-hold/split-window mechanisms and do not broaden this correction into native-region animation unless the transparent-document candidate still physically fails.

## USER ACTION REQUIRED

None while the correction and CI are pending.

After a corrected exact-head CI artifact exists, a new Gate 7 physical recording will again be required because compositor continuity cannot be proven by automated CI. Gate 12 will later require a Windows-visible 125% secondary display; if unavailable, keep it NOT RUN.
