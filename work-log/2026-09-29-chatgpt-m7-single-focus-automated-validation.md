# 2026-09-29 — Single-Focus replacement exact-head automated validation

**Agent:** ChatGPT  
**Scope:** PR #192 automated validation checkpoint; physical Gate 7/12 remain open

## Exact candidate

- PR: #192
- Branch: `plan/m7-single-focus`
- Exact validated head: `73d10ab6a21d731ca363e9932b4ccaf13a000b43`
- Windows CI: #672
- Workflow run: `36589997295`
- Result: **PASS**

This candidate supersedes the earlier old-head CI #666 failure. The final head includes the evidence-backed contract corrections made after the implementation-complete checkpoint plus Rust formatting required by authoritative preflight; it does not change the selected one-`focusSurface` architecture.

## Automated evidence

Windows CI #672 completed successfully on the exact PR head.

Passed:
- validation gate;
- Repository Preflight;
- configuration and single-Focus architecture contracts;
- Panel/Timer transition and rollback contracts;
- frontend TypeScript/Vite build;
- Rust `cargo fmt --check`;
- Rust check/clippy/tests;
- Windows visual-regression capture and validation;
- reused frontend-dist verification;
- Tauri release build;
- required artifact uploads.

### Runtime artifact

- name: `narro-m1-runtime-harness-windows-x64`
- artifact id: `11043444940`
- digest: `sha256:e1110b10c6d7cb867401126df931f3b52af414f097bb6a0bd9d790f6dac2fd76`

### Visual artifact

- name: `narro-m5-visual-regression`
- artifact id: `11043762203`
- digest: `sha256:51f21e05abd5aace6147f6be86c4645371d8dd06dc1f459375752d72c69a46cb`

## Acceptance disposition

Automated evidence now validates:
- exactly two configured production WebViews: `main` + one persistent `focusSurface`;
- no production `floatingTimer` runtime label or `timer.html` entry;
- fixed nominal 340×700 Focus host with 340×110 compact and 340×300 expanded Timer regions;
- one React coordinator/shared authoritative timer projection;
- prepainted inactive presentations remain inert/non-interactive;
- ordinary presentation changes avoid Focus WebView create/destroy/hide/show/host-resize;
- serialized rollback-safe native presentation commits;
- automated geometry and topology/DPI/work-area contracts;
- consolidated Focus-only production entry/dist;
- retired split-window/visual-hold implementation contracts remain absent.

Automated validation does **not** establish continuous Windows compositor behavior, physical selected-monitor behavior, physical display hotplug/mixed-DPI behavior, runtime performance, or always-on-top/taskbar observations.

## Progress reconciliation

Current user-facing progress after this checkpoint:

`4/10M || 2/5 | 11/19`

Small-slice checkpoints:
1. implementation/static migration closure — PASS;
2. exact-head automated validation — PASS;
3. Gate 7 physical continuity — OPEN;
4. Gate 12 mixed-DPI physical recovery — OPEN;
5. guarded merge/resulting-main/tracking closure — OPEN.

M1 increases from 9/19 to 11/19 because two reopened top-level items are fully automated acceptance items and now have exact-head evidence:
- two-window replacement composition;
- consolidated Focus-only production entry/bundle.

No M6/M7/M8 top-level physical/integration item is closed by this CI result.

## Remaining blockers

### Gate 7 — physical continuity

Must use the exact #672 runtime artifact with Windows animations On. Observe at least:
- 3× Panel→Timer→Panel;
- 3× compact Timer Expand→Collapse;
- same identifiable task/session/time retained;
- no white/blank host frame;
- no stale expanded tail;
- no Timer/Panel overlap;
- no loading copy;
- no scrollbar flash;
- no abrupt discontinuity.

### Gate 12 — mixed DPI

Requires a Windows-visible secondary display, preferably at 125% scaling for regression parity with the recorded failure. Confirm compact Timer sizing/scrollbar behavior and bottom-edge expansion/collapse on the replacement.

If the environment does not expose the secondary monitor, record Gate 12 as **NOT RUN**, not PASS.

## Repository reconciliation

Updated on `main`:
- `TODO.md` — automated-only replacement items and CI evidence;
- `STATUS.md` — current PR #192 automated-validated candidate state;
- `HANDOFF.md` — exact next physical gate and artifact identity;
- `docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md` — validation state advanced to automated PASS;
- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` — M7-PHYS-01/02 remain FIX_NOW only for physical acceptance.

The merged fully validated application-source baseline remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed` until required physical acceptance, guarded merge and resulting-main reconciliation are complete.

## Exact continuation point

Obtain Gate 7 physical evidence on artifact `11043444940`. Do not start a replacement architecture, revive PR #191 mechanisms, or close Gate 7/12 from CI. On failure, fix only the observed exact-build defect on PR #192 and revalidate the new exact head. On PASS, continue to Gate 12 when the required display is available, then guarded merge/resulting-main closure.
