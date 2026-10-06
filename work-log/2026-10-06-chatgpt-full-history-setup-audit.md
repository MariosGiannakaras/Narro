# 2026-10-06 — full implementation-history / setup audit

## Scope

Repository-wide audit from the M1 foundation through the current M6/M7/M9 state. The pass checked current source architecture, core correctness boundaries, ordered milestone tracking, canonical evidence routing, immutable validation history, live GitHub/CI state and stale-current-truth risks.

No production source/config/test file is changed by this audit.

## Live baseline

- starting `main`: `6947ac694dede23e0a0cbb439a2b703ec1d7ecd0`;
- PRs open at audit: none;
- PR241 exact head `57445875f7b04eae4d8b7e35fc8c0d5012899619`: CI985 PASS, merged as `3a06f1003a513f1af942ec076a9f50617f2abfe2`;
- resulting-main Windows CI986 / run `37477732682`: **SUCCESS**;
- progress remains `3/10M || 0/3 | 17/18`.

## Foundation result — M1 through M4

Current implementation was inspected rather than inferred from old PASS prose.

- Desktop/runtime: exactly the normal `main` + persistent `focusSurface` webviews; no production separate Timer webview. The coordinator owns shared presentation/timer/Focus-target state above Panel/Floating subtrees.
- Persistence/identity: local SQLite with migrations0001–0009, foreign keys, fresh/repeated upgrade tests, schedule constraints, task-owned cascades and recurrence uniqueness.
- Timer/session: Rust authority with monotonic/logical sleep clock, checked failures/checkpoints, and atomic product Done persistence before Idle publication.
- Scheduling/recurrence: local-date versus timed semantics, IANA timezone validation, DST gap/fold rejection and idempotent recurrence coverage remain present.
- Windows/native: display/DPI/work-area/power-resume recovery remains implemented; finding27 physical acceptance correctly stays open.
- CI: fast frontend/contracts + rustfmt precede the Windows candidate, which performs Rust check/clippy/tests, performance harness, visual fixtures, Tauri release, packaged Focus runtime, production physical build and diagnostic validation.

No missing M2–M4 foundational implementation or hidden replacement architecture was found.

## Current-truth omissions corrected

The audit found documentation/crosswalk drift, not lost source:

1. README still called finding07 uncompiled/unmerged WIP after PR237/CI967 integration.
2. Architecture still called the adopted single-`focusSurface` model “pending code and validation.”
3. Current routing still carried old supplemental35/36 OPEN shorthand although both source corrections are integrated.
4. M8 still requested modal17 retest despite modal17 PASS on CI944 and modal18 PASS on CI948.
5. M5 current gate still named modal17 as pending.
6. Several M9 crosswalk rows still said Overview PDF was unimplemented/FIX_NOW after PR238/CI971.
7. M7 crosswalk rows lagged later evidence: production physical-artifact validity, white-L finding09, tooltip09, modal18, writer19, catalog22, queue vertical/end/menu/Tab, drag24/menu paint26, metric20 and title21.

Historical failures remain immutable; only current dispositions were reconciled.

## Evidence conflicts

The parity workflow now makes the rule explicit: conflict resolution is **claim-level, not pass-level**. Pass-3 is the normal canonical input because it is the completed exhaustive analysis, but it does not automatically win because it is newer/deeper.

Resolve conflicts by exact claim, version/provenance/context, modality fitness, directness/completeness, corroboration, source history and relevant official platform/engineering guidance. Standards constrain safe Narro implementation; they do not prove what Blitzit visually did. Preserve version/state-specific differences, and keep unresolved evidence as conflict/evidence-limit/product-decision open.

The Board→Focus case therefore requires checking that the earlier fade evidence and VE-003 represent the materially same action/version/state before the fuller motion interval supersedes the earlier interpretation.

## Security/setup hardening finding

Current production `tauri.conf.json` has `app.security.csp: null`; `src-tauri/build.rs` uses the default app manifest, so custom invoke commands are not narrowed by webview command allowlist. Current official Tauri guidance says CSP is enabled only when configured and should be restricted, and registered custom commands are available to all app webviews by default unless constrained.

No unintended production remote-fetch path was found, so this audit does not claim an exploit. It records a defense-in-depth release obligation: evaluate/test a restrictive app-specific CSP and least-privilege command/window exposure or record a concrete accepted limitation.

References:
- <https://v2.tauri.app/security/csp/>
- <https://v2.tauri.app/security/capabilities/>

## Branch hygiene

No open PR exists. Historical/superseded/seed remote branches remain as already dispositioned in the 2026-10-04 coordination audit. No branch was deleted because deletion is destructive and unnecessary for correctness.

## Validation and continuation

Docs-only reconciliation; no executable/build/test/CI semantics changed and no new Windows CI is required. No physical/source gate advances.

Continue M6 P3-M6-05 on current `main`. Keep P3-M6-01 DESIGN_REQUIRED, P3-M6-06 policy ambiguity, finding07/finding27 physical acceptance, M5 P3-M5-04 direct source/physical acceptance, and M9 PDF physical/source acceptance open. M10 remains blocked; M11 dormant.
