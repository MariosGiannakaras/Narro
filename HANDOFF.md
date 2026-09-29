# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 2/5 | 11/19`

**Reopened Milestone 1 corrective foundation remains the active ordered roadmap work.** PR #192 exact head `44119dbe829131d38f56fd35250142ed973b2574` passed Windows CI #674 but the exact physical retest now fails both Gate 7 and Gate 12. Continue the same PR with only the newly evidenced transition-position and mixed-DPI recovery corrections.

- Roadmap: **4/10 milestones currently complete**. M1 and M6 remain reopened in the exact scope invalidated by the single-Focus replacement; M2–M5 remain complete.
- Current corrective slice: **2/5** — (1) implementation/static migration closure PASS, (2) exact-head automated validation PASS, (3) Gate 7 physical continuity FAIL/OPEN, (4) Gate 12 mixed-DPI recovery FAIL/OPEN, (5) guarded merge/resulting-main/tracking closure OPEN.
- M1: **11/19 top-level items currently validated**. No counter advances from failed physical evidence.
- M6: **15/18** validated.
- M7: **1/15** validated.
- M8: **3/8** validated; affected Focus shortcut work remains blocked.
- PR #192 remains **OPEN** on `plan/m7-single-focus`.
- Exact physical candidate: `44119dbe829131d38f56fd35250142ed973b2574`.
- Windows CI #674 / run `36609576132`: PASS.
- Runtime artifact id `11052303615`, digest `sha256:eca3865bb08d754f7f43a0b9bd436f6a83a45f89b209345a328b66ec8c534bfd`.
- Exact physical recording: `2026-09-29 21-50-58.mp4`, SHA-256 `281834ac49986549cab0fc3ab7d716ee24c53d5609499f2ae83aaad7ec56642f`, H.264 4480×1080, 60 fps, 60.183 s.
- The user confirms the alternate display in that recording is set to 125% scaling.
- Gate 7: the CI #674 transparency fix removes the prior opaque white/blank 340×700 host tail, but repeated Panel↔Timer cycles still spatially jump between the Panel edge position and saved Timer position instead of moving continuously. Clear repeated boundaries occur around 39.1–39.4, 41.3–41.4, 42.6–42.8, 44.3–44.4 and 45.9–46.2 s.
- Gate 12: compact/expanded Timer does reach the 125% display; expanded Timer measures 425×375 physical px around 50 s, matching 340×300 logical at 125%. However crossing displays requires repeated drag attempts, and after the mixed-DPI return path the Panel is persistently malformed with browser-level vertical/horizontal scrollbars from about 53 s onward.
- Same task/session `fas` remains active and timer time advances across the tested changes.
- Evidence-backed mixed-DPI cause: `WM_DPICHANGED` currently triggers immediate Narro recovery during the native interactive move loop, so recovery can fight the user's drag; Panel restoration then immediately resizes/reclips across the DPI boundary, leaving a stale viewport race.
- Evidence-backed Gate 7 cause: CSS clip motion changes visible height, but native Panel↔Timer placement still teleports the same HWND between distinct saved positions.
- Immutable exact-build evidence: `work-log/2026-09-29-chatgpt-m7-ci674-physical-gates-fail.md`.
- Earlier 21:32/21:33 chat recordings were CI #672 and are not #674 evidence.

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

## M7 PHYSICAL CLOSURE — OPEN; CI #674 PHYSICALLY FAILS GATE 7 AND GATE 12

The focus-document transparency correction is retained because it removed the prior opaque blank-host tail, but it did not close strict visual continuity.

**Gate 7 FAIL:** repeated Panel↔Timer transitions contract/reveal at one position and then jump the persistent HWND to the other saved position. There is no longer a white host tail, but there is still an abrupt spatial discontinuity.

**Gate 12 FAIL:** the exact #674 build reaches the 125% display at correct scaled Timer geometry, but one normal cross-monitor drag is not reliable and the return-to-Panel path can leave a stale DPI viewport with both document scrollbars exposed.

Next correction must:
- defer/coalesce DPI recovery during `WM_ENTERSIZEMOVE` → `WM_EXITSIZEMOVE`;
- perform one post-drag recovery on the final monitor;
- make Panel target-monitor sizing/region restoration DPI-deterministic;
- coordinate finite native position motion with the existing ~270 ms same-WebView Panel↔Timer geometry motion;
- preserve transparent document canvas, one persistent `focusSurface`, rollback, timer/session authority, and ordinary no-hide/show/no-resize architecture.

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

1. Reconcile `plan/m7-single-focus` with latest main tracking truth.
2. Implement the two exact-build failures on the same PR:
   - interactive-move DPI deferral/coalescing and deterministic post-DPI Panel recovery;
   - finite Panel↔Timer native position motion coordinated with the existing renderer geometry motion.
3. Add/update architecture/static/Rust tests for:
   - no display recovery while an interactive move is active;
   - one recovery after move exit when DPI/topology became dirty;
   - target-monitor-scale host geometry;
   - no instant Panel↔Timer position teleport in the production transition path.
4. Run proportionate local/static checks, then authoritative exact-head Windows CI.
5. Produce the exact runtime artifact for one combined physical batch rechecking Gate 7 and Gate 12.

Do not merge PR #192 until both physical failures are closed.

## USER ACTION REQUIRED

None while the next corrective implementation and CI are pending.

After a new exact-head CI artifact exists, one combined Windows recording will be required: repeated Panel↔Timer cycles plus a single normal drag to the 125% monitor, compact/expanded checks there, and return to Panel without browser scrollbars or malformed viewport.
