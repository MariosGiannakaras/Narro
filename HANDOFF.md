# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`6/10M || 4/4 | 6/8`

- Roadmap: **6/10 milestones complete**.
- M7 source implementation: **9/14 top-level items validated**; required physical/manual closure remains OPEN.
- M8: **6/8 top-level items validated**; the top-level Preferences item and Windows-locale presentation remain open.
- Current audit `FIX_NOW` queue: **clear**.
- Open implementation PRs: **none** at this handoff.

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

- Uploaded video corpus: **38/38 raw files, 19/19 MP4/SRT pairs, 19/19 analyzed/reconciled/dispositioned**.
- UI/UX forensic second pass: **19/19 complete**.
- Help Center pass: **34/34 visible legacy-navigation pages inventoried/classified; 15/15 Narro-relevant pages deep-reviewed**.
- Canonical screenshot corpus: **46 retained images** — 22 current v2.6.69, 17 Help Center originals, 7 historical.
- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` is authoritative for finding disposition.
- CORR-01 recurrence No Repeat/Delete Existing correction is VALIDATED.
- No material finding is currently classified `FIX_NOW`.
- M9 findings remain routed to M9; M10/final-review findings remain routed to later gates; unresolved source ambiguities remain explicit.

## M7 PHYSICAL CLOSURE — NEXT GATE

By the user's 2026-09-28 direction, **do not start another M8 source slice before the deferred M7 physical batch is run**.

Use the latest suitable validated Windows runtime artifact from CI #624:
- artifact id: `10944304485`;
- digest: `sha256:4f76740bc6f69dcd1d664c9fb80011520567612c9eb6d87ab4e09e02e3b1bf7c`;
- source tree is identical to merged main `e3a9abf8...`.

The consolidated physical batch remains:
1. Panel ↔ Floating Timer continuous visual continuity with normal Windows animations.
2. Repeat Panel ↔ Floating Timer with Windows animations Off.
3. Floating Timer Expand/Collapse continuity and stale-pixel/blank-frame check.
4. Transition-boundary shortcut stress and Locate Timer native-hidden/reduced-motion behavior.
5. Secondary-monitor/topology/no-saved-placement recovery, including non-default taskbar/constrained work area/high-DPI placement.
6. Always-on-top stacking over normal maximized and borderless/fullscreen applications where Windows permits it.

Record PASS/FAIL/NOT RUN per gate. Automated evidence must not close these physical gates.

## REMAINING M8 ORDER

After the M7 physical batch is reconciled:
1. PREF-R02 — finite animated timer flash, reduced-motion safe.
2. PREF-R03 — Notification Alerts gating without duplicating authoritative M3 effects.
3. PREF-R05 — local/Narro-owned sound catalog and non-overlapping preview behavior.
4. PREF-R06 — Windows locale/system 12/24-hour date/time presentation.

PREF-R01 and PREF-R04 are validated and must not be reimplemented.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains local-only Windows software with Tauri 2 + React/TypeScript, SQLite, and authoritative Rust/domain state.
- `main` + reusable `focusSurface` remain the normal two-webview architecture.
- persistence-first mutations, stable task identities, session/time accounting, recurrence idempotence and Windows-local scheduling semantics remain authoritative.
- Focus/Floating presentation changes cannot reset, duplicate or independently advance a live session.
- Notes URLs require explicit activation; aggregate All Lists reorder remains disabled.
- hover/focus actions keep reserved geometry and keyboard/reduced-motion accessibility.
- No Repeat may delete only pristine active generated children when explicitly requested; customized/history-bearing/completed/archived/legacy-linked children survive detached.
- excluded account/cloud/trial/upgrade/profile/AI/integration controls remain absent.

## REPOSITORY HYGIENE NOTE

The CI dedup regression guard that had been left only on `test/ci-dedup-metadata-regression` is now durably merged:
- PR #186 exact head `152dcee10594eaa8399a3c4e45a3c141b240ea37`;
- Windows CI #626 / run `36364443693`: PASS, including Repository Preflight, visual fixtures, Tauri Release and required artifact uploads;
- expected-head guarded squash merge: `1a03c1129a7153ed00a42ce89e9d32bcd3912c13`;
- merged `scripts/verify-config.mjs` blob is exactly identical to the prior regression branch blob `be0a4ea1e77c8ae773af04b4ef63a7652961bc30`;
- this changes repository validation only; the validated application source baseline remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.

At this checkpoint the only remote branches are `main` and `test/ci-dedup-metadata-regression`. The latter contains no remaining unique useful work and is safe to delete manually. The current GitHub connector cannot delete remote refs/branches, so that final deletion remains a user-admin action.

## NEXT AGENT ACTION

1. Re-read live repository/PR/CI state; there should be no open implementation PR from this handoff.
2. Do **not** begin PREF-R02 yet.
3. When the user is ready, use the CI #624 runtime artifact and run the consolidated M7 physical batch above.
4. Reconcile the physical result into a new immutable work-log plus `TODO.md`, `STATUS.md`, and `HANDOFF.md`.
5. Fix evidence-backed M7 failures before further M8 work when a failed gate can affect acceptance.
6. After M7 physical closure is safely reconciled, resume M8 at PREF-R02.

## USER ACTION REQUIRED

**Deferred until the user is ready:** the M7 physical Windows batch above.

No Blitzit evidence upload is pending. The uploaded corpus and its analysis are complete.
