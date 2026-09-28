# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`6/10M || 4/4 | 6/8`

- Roadmap: **6/10 milestones complete**.
- M7: **12/14 top-level checklist items validated** after the CI #624 physical batch; Gates 7 and 12 remain FAIL and M7 closure remains OPEN.
- M8: **6/8 top-level items validated**; the top-level Preferences item and Windows-locale presentation remain open.
- Current audit `FIX_NOW` queue: **M7-PHYS-01 and M7-PHYS-02**. Gate 7 needs the chosen alternative-composition experiment; Gate 12 still needs the secondary-display physical retest.
- Open implementation PR: **#191**. Four same-HWND visual-hold heads failed physical Gate 7. The separate fixed-size Timer WebView/region candidate `8b94946` passed CI `36493571169` and physical On/Off batches avoided the old white resize frames, but On mode transitions exposed brief loading placeholders. A same-target board-refresh correction is local and frontend-validated; exact-head CI, physical retest and CPU/memory comparison remain pending. See `work-log/2026-09-29-codex-m7-separate-timer-physical.md`.

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

## M7 PHYSICAL CLOSURE — ACTIVE

By the user's 2026-09-28 direction, **do not start another M8 source slice before the deferred M7 physical batch is run**.

The CI #624 physical batch has now run on its exact artifact:
- artifact id: `10944304485`;
- digest: `sha256:4f76740bc6f69dcd1d664c9fb80011520567612c9eb6d87ab4e09e02e3b1bf7c`;
- source tree is identical to merged main `e3a9abf8...`;
- immutable result: `work-log/2026-09-28-codex-m7-ci624-physical-batch.md` with sanitized frames in `work-log/evidence/`;
- Gate 7 **FAIL** (On white frames on Timer→Panel and Expand/Collapse), Gate 12 **FAIL** (125% secondary-monitor Timer shrink/scrollbars);
- Gates 8, 9, 10 and 11 **PASS** within the documented physical scope.

PR #191 exact-build and physical chronology is consolidated in `work-log/2026-09-28-codex-m7-visual-continuity-history.md`. CI success on three corrected heads was followed by physical Gate 7 failure, so the `AGENTS.md` repeated-failure rule now applies. Gate 12's exact-build secondary-monitor result remains open. Do not merge PR #191 until the required physical gates pass.

The original SQLite profile backup is in ignored `artifacts/m7-ci624-runtime/profile-before.db`. The test profile currently has a temporary no-saved-placement row deletion; restore the full original backup after the final test. The user restored the second monitor to its original 100%. Windows animations are currently On, confirmed by `SPI_GETANIMATION=1` and `SPI_GETCLIENTAREAANIMATION=1`; restore this original On state after any Off retest.

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
- `main` + reusable `focusSurface` remain the normal two-webview architecture.
- persistence-first mutations, stable task identities, session/time accounting, recurrence idempotence and Windows-local scheduling semantics remain authoritative.
- Focus/Floating presentation changes cannot reset, duplicate or independently advance a live session.
- Notes URLs require explicit activation; aggregate All Lists reorder remains disabled.
- hover/focus actions keep reserved geometry and keyboard/reduced-motion accessibility.
- No Repeat may delete only pristine active generated children when explicitly requested; customized/history-bearing/completed/archived/legacy-linked children survive detached.
- excluded account/cloud/trial/upgrade/profile/AI/integration controls remain absent.

## REPOSITORY HYGIENE NOTE

The abandoned CI dedup regression guard was recovered, validated and merged in PR #186 / Windows CI #626. The old regression branch was subsequently removed. Before this audit-method slice, live branch state was clean with only `main` and no open PRs. The validated application source baseline remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.

## NEXT AGENT ACTION

The repeated Gate 7 failure history is consolidated in `work-log/2026-09-28-codex-m7-visual-continuity-history.md`. The completed assessment and latest exact-build physical FAIL are in `work-log/2026-09-28-codex-m7-architecture-assessment.md`. Four CI-validated PR #191 builds, including `b23c8ab`, failed physical Gate 7. The next technical step is the **bounded alternative-composition experiment**, not another bitmap-hold patch. The original SQLite profile has been restored and verified byte-for-byte; both animation settings are On. Windows exposes one display, so secondary-monitor Gate 12 remains open.

1. Read live PR #191/CI state; the latest known source head is `b23c8ab518c5b654dd33b3cb582388b193ce82e5` with CI PASS and physical Gate 7 **FAIL**. The following local documentation commits do not change that executable.
2. Do **not** begin PREF-R02 yet.
3. Prototype the separate persistent Timer WebView with fixed expanded outer size/native compact clipping in isolation, following the assessment's full acceptance and resource comparison. Later physical retests must use the exact validated runtime artifact. Preserve the restored original profile; use an isolated test copy for further app runs.
4. Record the retest in a new immutable work log; update `TODO.md`, `STATUS.md`, and this handoff from evidence.
5. After further testing, restore the user's original profile and OS display/animation settings; keep M7 open if either gate remains failed/unverified.
6. Stop at M7. The user has not authorized a new M8 slice in this goal.

## USER ACTION REQUIRED

For the exact-build retest, the user may need to toggle Windows animations Off and move the Timer between the two physical monitors. Those actions should be requested only when the candidate artifact is ready.

No Blitzit evidence upload is pending. The uploaded corpus and its analysis are complete.
