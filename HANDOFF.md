# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 2/5 | 11/19`

**Reopened Milestone 1 corrective foundation remains the active ordered roadmap work.** PR #192 now contains the two evidence-backed corrections from the CI #674 physical failures, and exact head `c0be4ec0fe94863182bbf0d2e1ba4931ada67d93` passed authoritative Windows CI #679. Gate 7 and Gate 12 are **PHYSICAL RETEST OPEN** on this new exact artifact.

- Roadmap: **4/10 milestones complete**. M1 and M6 remain reopened in the exact scope invalidated by the single-Focus replacement; M2–M5 remain complete.
- Current corrective slice: **2/5** — (1) implementation/static migration closure PASS, (2) exact-head automated validation PASS, (3) Gate 7 physical continuity RETEST OPEN, (4) Gate 12 mixed-DPI recovery RETEST OPEN, (5) guarded merge/resulting-main/tracking closure OPEN.
- M1: **11/19** top-level items validated.
- M6: **15/18** validated.
- M7: **1/15** validated.
- M8: **3/8** validated; affected Focus shortcut work remains blocked.
- PR #192 remains **OPEN** on `plan/m7-single-focus`.
- Current exact candidate: `c0be4ec0fe94863182bbf0d2e1ba4931ada67d93`.
- Windows CI #679 / run `36630411679`: PASS on that exact head after rerunning the initially cancelled build-and-test job.
- Runtime artifact: `narro-m1-runtime-harness-windows-x64`, id `11065275562`, digest `sha256:8b50e089fdaf6e5eaf572dd2b469eac42a521a8ea447c4532161edbc35163400`.
- Visual artifact: `narro-m5-visual-regression`, id `11064761303`, digest `sha256:00f25712f57349bb70bbbbaddacc177c220967bbb6bfb9006c7307bbb89f4e7e`.
- The preceding exact-build physical failure evidence is `work-log/2026-09-29-chatgpt-m7-ci674-physical-gates-fail.md`.
- The current automated-green corrective candidate is recorded in `work-log/2026-09-30-chatgpt-m7-ci679-position-dpi-candidate.md`.

## WHY CI #674 FAILED PHYSICALLY

Exact #674 source `44119dbe829131d38f56fd35250142ed973b2574` removed the earlier opaque white/blank host tail, but its dual-monitor physical recording still proved:

- **Gate 7 FAIL:** Panel↔Timer spatially teleported the same persistent HWND between Panel edge placement and saved Timer placement.
- **Gate 12 FAIL:** the 125% display showed correct Timer scaling, but mixed-DPI movement/recovery could interfere with the native drag and the return-to-Panel path could leave a stale WebView viewport with horizontal/vertical browser scrollbars.
- The same task/session `fas` and elapsed-time continuity survived those failures.
- Earlier 21:32/21:33 chat recordings were CI #672 and are not #674/#679 acceptance evidence.

## CI #679 CORRECTIVE IMPLEMENTATION

The selected one-`focusSurface` architecture and transparent Focus document remain intact.

- `WM_ENTERSIZEMOVE` / `WM_EXITSIZEMOVE` delimit interactive native movement.
- DPI/topology recovery is deferred/coalesced while the interactive move is active, then requested once after move exit when dirty.
- Programmatic presentation movement also suspends competing display recovery.
- Panel host geometry is computed from the selected target monitor scale; target-monitor staging occurs before the exceptional DPI host-size correction and final full-host region.
- Timer destination planning uses target-monitor scale.
- Panel↔Timer mode changes plan the final native destination and use finite native position motion coordinated with the existing ~270 ms same-WebView geometry motion.
- Native transition rollback, saved Timer placement, transparent document canvas, one HWND/WebView identity, authoritative timer/session state, and ordinary no-hide/show/no-resize presentation mechanics remain invariants.
- Static/transition architecture contracts cover these corrective mechanisms.

CI #679 exact-head evidence:
- validation gate PASS;
- Repository Preflight PASS;
- Rust checks/tests PASS;
- Windows visual-regression capture/validation PASS;
- reused frontend-dist verification PASS;
- Tauri release PASS;
- runtime + visual artifacts uploaded.

The first build-and-test attempt for #679 was cancelled during visual fixture capture without a code failure signature. The same job was rerun against the unchanged exact head and completed PASS.

## CURRENT VALIDATED APPLICATION SOURCE BASELINE

**`e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`**

This remains the fully merged/physically accepted application-source baseline (PREF-R01). PR #192 is not promoted to the validated baseline until its required physical gates pass, it is guarded-merged, and resulting-main validation/tracking reconciliation completes.

## EVIDENCE / AUDIT STATE

- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` is authoritative for finding disposition.
- `M7-PHYS-01` and `M7-PHYS-02` remain `FIX_NOW / PHYSICAL RETEST OPEN`; automated CI #679 does not close them.
- Uploaded tutorial/source evidence and prior validated milestones remain unchanged.
- Gate 12 now has a real user-confirmed 125% secondary-display test environment, so it must be physically exercised rather than left NOT RUN.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains local-only Windows software with Tauri 2 + React/TypeScript, SQLite, and authoritative Rust/domain state.
- Runtime window composition remains only `main` + one persistent `focusSurface`.
- Focus Panel, compact Timer and expanded Timer remain presentations inside the same persistent Focus HWND/WebView.
- Ordinary Focus presentation changes do not create/destroy/hide/show/resize the Focus WebView.
- Focus/Floating presentation changes cannot reset, duplicate or independently advance a live session.
- Panel/Timer geometry remains 340×700, 340×110 and 340×300 logical respectively, DPI-aware through native visible-region handling.
- Transparent Focus document canvas remains required so region/clip transitions cannot expose an opaque host.
- Native presentation changes remain serialized and rollback-safe.
- Existing local-only product, persistence, task identity, scheduling, recurrence, accessibility and explicit-link-activation invariants remain intact.
- PR #191 remains closed/unmerged historical evidence only.

## NEXT AGENT ACTION

The next unresolved boundary is **physical Windows validation of exact CI #679 artifact id `11065275562`**.

After the user supplies the combined recording:
1. Analyze Gate 7 repeated Panel↔Timer cycles for both blank/opaque host exposure **and** spatial teleport/jump.
2. Analyze compact↔expanded Timer cycles for stale/blank tails.
3. Analyze a normal single drag to the user-confirmed 125% display; verify DPI-correct compact/expanded geometry and no drag resistance caused by Narro recovery.
4. Analyze return to Panel; reject any horizontal/vertical browser scrollbar, clipped/offset content, stale viewport or malformed host.
5. Confirm the same task/session/time remains continuous.
6. If both gates PASS, record immutable evidence and continue guarded merge/resulting-main validation. If either fails, keep PR #192 open and fix only the observed exact-build signature.

Do not merge PR #192 before both physical gates pass.

## USER ACTION REQUIRED

Use only the CI #679 runtime artifact from exact head `c0be4ec0fe94863182bbf0d2e1ba4931ada67d93`.

Record one combined Windows session with animations On:
- at least 3× Panel→Timer→Panel;
- at least 3× compact Timer Expand→Collapse;
- one ordinary drag to the 125% secondary display;
- compact + expanded checks there;
- return to Panel;
- keep one identifiable active/paused task/session visible enough to prove timer continuity.

Acceptance requires no blank/light host tail, no Panel/Timer spatial teleport, no repeated-push requirement to cross displays, no browser scrollbars/stale viewport after return, and preserved task/session/time.
