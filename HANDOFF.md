# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`6/10M || 4/4 | 12/14`

**Implementation in progress on `plan/m7-single-focus` (2026-09-29).** The user has now authorized source changes for the single fixed-host Focus composition. The Tauri window/capability/Vite entry cleanup has begun; native and React consolidation are being implemented in this same checkout. Until a later explicit user instruction, do not run tests, builds, CI, app launches or physical checks. Treat all newly edited source as unvalidated and keep Gate 7/12 open. If this session stops early, continue the incomplete implementation from this branch and inspect its Git diff before doing anything else.

- Roadmap: **6/10 milestones complete**.
- M7: **12/14 top-level checklist items validated** after the CI #624 physical batch; Gates 7 and 12 remain FAIL and M7 closure remains OPEN.
- M8: **6/8 top-level items validated**; the top-level Preferences item and Windows-locale presentation remain open.
- Current audit `FIX_NOW` queue: **M7-PHYS-01 and M7-PHYS-02**. Gate 7 needs the chosen alternative-composition experiment; Gate 12 still needs the secondary-display physical retest.
- Open implementation PR: **#191**. Four same-HWND visual-hold heads failed physical Gate 7. The separate fixed-size Timer WebView candidate removed the old white resize frames but first showed loading copy, then a longer Timer/Panel overlap. Head `4e4960b` passed CI `36530577060` and its exact-build On capture reduced the overlap to 0.07–0.10 seconds across three settled cycles, with no white host/loading copy in inspected boundaries. Strict Gate 7 remains OPEN/FAIL; PR #191 is unmerged. The original SQLite profile and animations On were restored. See `work-log/2026-09-29-codex-m7-separate-timer-physical.md`.
- **Current implementation direction, authorized 2026-09-29:** return to one Focus HWND/WebView, keep its host at maximum Panel geometry during ordinary presentation changes, conditionally render Panel/Timer within that WebView, and clip the native visible region for Panel/compact/expanded states. The complete implementation sequence is in `docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md`. Replacement implementation has started on this branch but is incomplete and unvalidated. The user requires implementation to finish **before** any tests/builds/CI/app launch/physical checks, and requires a further explicit instruction to start the testing phase.
- The replacement starts at the affected **M1 native Focus window foundation**, carries through the **M6 Panel presentation**, and completes the **M7 Timer/transition presentation**. This does **not** reopen M1 or M6 or reset their counters: their affected validated behaviors are regression obligations of the M7 replacement. Preserve M2–M5 and already-validated M8 work; do not restart unrelated milestones. M8 remaining work stays blocked until M7 closes. See the milestone map in the plan.

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

## M7 PHYSICAL CLOSURE — OPEN; IMPLEMENTATION FIRST

By current user direction, **do not start another M8 source slice while the active M7 replacement and its `FIX_NOW` Gate 7/12 findings remain unresolved**. The earlier deferred physical batch has already run; remaining M8 work resumes only after the replacement is completed, authorized for validation, validated, and tracking-reconciled.

The CI #624 physical batch has now run on its exact artifact:
- artifact id: `10944304485`;
- digest: `sha256:4f76740bc6f69dcd1d664c9fb80011520567612c9eb6d87ab4e09e02e3b1bf7c`;
- source tree is identical to merged main `e3a9abf8...`;
- immutable result: `work-log/2026-09-28-codex-m7-ci624-physical-batch.md` with sanitized frames in `work-log/evidence/`;
- Gate 7 **FAIL** (On white frames on Timer→Panel and Expand/Collapse), Gate 12 **FAIL** (125% secondary-monitor Timer shrink/scrollbars);
- Gates 8, 9, 10 and 11 **PASS** within the documented physical scope.

PR #191 exact-build and physical chronology is consolidated in `work-log/2026-09-28-codex-m7-visual-continuity-history.md`. CI success on three corrected heads was followed by physical Gate 7 failure, so the `AGENTS.md` repeated-failure rule now applies. Gate 12's exact-build secondary-monitor result remains open. Do not merge PR #191 until the required physical gates pass.

The original SQLite profile is restored and its SHA-256 matches the pretest copy at `artifacts/m7-separate-timer-runtime/profile-before.db`. The test profiles and raw captures remain in ignored artifacts. Windows animations are On, confirmed by both `SPI_GETANIMATION=1` and `SPI_GETCLIENTAREAANIMATION=1`. One 100% display is currently exposed; the secondary 125% Gate 12 branch remains unavailable.

## REMAINING M8 ORDER

After the M7 physical batch is reconciled:
1. PREF-R02 — finite animated timer flash, reduced-motion safe.
2. PREF-R03 — Notification Alerts gating without duplicating authoritative M3 effects.
3. PREF-R05 — local/Narro-owned sound catalog and non-overlapping preview behavior.
4. PREF-R06 — Windows locale/system 12/24-hour date/time presentation.

PREF-R01 and PREF-R04 are validated and must not be reimplemented.

## INVARIANTS THAT MUST NOT REGRESS

- Product-fidelity default: for in-scope personal/local functionality, confirmed Blitzit behavior and visuals are the target. Do not introduce discretionary redesign. Known Blitzit reliability failures are preventive engineering input and must shape implementation/tests before affected work. If an exact source detail remains unknowable after relevant evidence is exhausted, choose the strongest professional reconstruction consistent with adjacent Blitzit patterns, Narro's established UI/UX, Windows conventions, accessibility and reliability, and record it as inference/design decision rather than confirmed source behavior.
- Narro remains local-only Windows software with Tauri 2 + React/TypeScript, SQLite, and authoritative Rust/domain state.
- `main` + reusable `focusSurface` remain the validated main-branch architecture. PR #191's separate persistent Timer WebView is still an unmerged, physically incomplete experiment.
- persistence-first mutations, stable task identities, session/time accounting, recurrence idempotence and Windows-local scheduling semantics remain authoritative.
- Focus/Floating presentation changes cannot reset, duplicate or independently advance a live session.
- Notes URLs require explicit activation; aggregate All Lists reorder remains disabled.
- hover/focus actions keep reserved geometry and keyboard/reduced-motion accessibility.
- No Repeat may delete only pristine active generated children when explicitly requested; customized/history-bearing/completed/archived/legacy-linked children survive detached.
- excluded account/cloud/trial/upgrade/profile/AI/integration controls remain absent.

## REPOSITORY HYGIENE NOTE

The abandoned CI dedup regression guard was recovered, validated and merged in PR #186 / Windows CI #626. The old regression branch was subsequently removed. Before this audit-method slice, live branch state was clean with only `main` and no open PRs. The validated application source baseline remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.

## NEXT AGENT ACTION

The repeated Gate 7 failure history and composition assessment are in `work-log/2026-09-28-codex-m7-visual-continuity-history.md` and `work-log/2026-09-28-codex-m7-architecture-assessment.md`. The separate-WebView experiment and exact-build physical captures are in `work-log/2026-09-29-codex-m7-separate-timer-physical.md`. Latest experimental application source `4e4960b221f4aad310080ab0b07379e059b52fdc` passed CI `36530577060` but leaves a 0.07–0.10-second Timer/Panel overlap; strict Gate 7 remains OPEN/FAIL. The prior proposal to try a native layered Timer next is superseded by the user's single fixed-host Focus direction.

1. **Implement only** `docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md` from this unmerged PR #191 checkout (or a child branch), using validated `main` as the behavioral baseline. Replace the experimental second Timer WebView with one fixed-host `focusSurface`; retain useful region/DPI code. Preserve unrelated user changes and Rust timer/session authority.
2. When implementation is complete, record the exact code state and remaining uncertainty in `TODO.md`, `STATUS.md`, the audit crosswalk, and this handoff. Do not claim Gate 7/12 PASS.
3. **Stop before validation.** Do not run tests, builds, CI, app launches, recordings or physical checks, and do not push source in a way that automatically starts CI. Wait for the user's explicit instruction to begin testing. Do not start an unrelated M8 slice.

## USER ACTION REQUIRED

After the implementation phase, the user's explicit instruction is required to begin tests/CI/physical validation. A future secondary-display Gate 12 retest also requires a Windows-visible second monitor. Neither condition blocks the implementation work above.

No Blitzit evidence upload is pending. The uploaded corpus and its analysis are complete.
