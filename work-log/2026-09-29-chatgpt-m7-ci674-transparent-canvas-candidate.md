# 2026-09-29 — Gate 7 transparent-canvas corrective candidate

**Agent:** ChatGPT  
**Scope:** narrow evidence-backed correction after PR #192 CI #672 physical Gate 7 failure

## Evidence input

The exact CI #672 artifact at source `73d10ab6a21d731ca363e9932b4ccaf13a000b43` physically failed strict Gate 7 with Windows animations On. The 60 fps recording repeatedly exposed a blank/light 340×700 Focus host during Panel→Timer and shorter reverse-boundary exposure. Immutable failure analysis: `work-log/2026-09-29-chatgpt-m7-ci672-physical-fail.md`.

The failure path showed that the native `focusSurface` was already transparent but the shared application document canvas remained opaque through `App.css` while React clip-path motion and the Win32 visible-region transaction intentionally overlapped in time.

## Corrective implementation

Active PR: **#192**  
Branch: `plan/m7-single-focus`  
Exact candidate head: `44119dbe829131d38f56fd35250142ed973b2574`

Before editing source, current main tracking truth through `826d75ce195d1eddef761b18dc292ccf15018053` was merged into the branch in `eb200965b326fc2bb16867666e0f6160e7eb643c`.

The corrective commit changes only:
- `src/focus.tsx` — imports a Focus-entry-only document stylesheet after shared `App.css`;
- new `src/focusDocument.css` — overrides `:root`, `html`, `body`, and `#root` to `background: transparent`;
- `scripts/verify-config.mjs` — requires `focusSurface.transparent === true`;
- `scripts/test-ui-focus-surface-transition.mjs` — requires the focus-entry transparency override and forbids `var(--color-canvas)` in that override.

No native geometry, window count, timer/session authority, persistence, presentation state machine, or compact/expanded sequencing changed.

## Validation

### Narrow static check

PASS on exact head `44119dbe...`:
- Focus entry imports the override;
- override covers root/html/body/#root;
- override is transparent and does not paint the shared canvas token;
- Tauri config keeps native focusSurface transparency;
- config verification owns the transparency invariant;
- transition preflight owns the focus-document invariant.

### Windows CI

**PASS** — Windows CI #674 / run `36609576132` on exact head `44119dbe829131d38f56fd35250142ed973b2574`.

Passed:
- validation gate;
- Repository Preflight;
- Windows visual-regression fixtures and validation;
- reused frontend-dist verification;
- Tauri release build;
- required artifact uploads.

Runtime artifact:
- name: `narro-m1-runtime-harness-windows-x64`
- id: `11052303615`
- digest: `sha256:eca3865bb08d754f7f43a0b9bd436f6a83a45f89b209345a328b66ec8c534bfd`

Visual artifact:
- name: `narro-m5-visual-regression`
- id: `11052433065`
- digest: `sha256:6815f49fe70f0226b83d1867b28a78574d2fc4e9066e95f97d28b949fbdb7b4e`

## Acceptance disposition

This exact candidate is **automated-validated but not physically accepted**.

Gate 7 remains OPEN until an animations-On recording of the exact #674 runtime artifact demonstrates that the prior blank/light host exposure is gone while task/session/time continuity remains intact.

Gate 12 remains OPEN/NOT RUN until the replacement is exercised on a Windows-visible secondary display at 125% scaling.

## Progress

No counter advances yet:

`4/10M || 2/5 | 11/19`

The third small-slice checkpoint is the physical Gate 7 result, not the existence of another CI-green candidate.

## Exact continuation

Use runtime artifact `11052303615` from CI #674 for the next Gate 7 physical retest with Windows animations On. Exercise at least 3× Panel→Timer→Panel and 3× compact Timer Expand→Collapse while preserving one identifiable task/session/time. If Gate 7 passes, record the physical evidence and advance to Gate 12 when a 125% secondary display is available. If it fails, fix only the new observed exact-build signature on PR #192.
