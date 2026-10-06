# 2026-10-06 — validation invalidation protocol

## Scope

Process-only refinement requested to reduce redundant builds/tests without weakening Narro's validation standard. Starting authoritative `main`: `eec576aa8a02bf1614ab6e0420b7e14ae9fbf703`. Active source work remains PR239 at exact head `a17c8b9ca3d2b23ab26bf29229883bcd9b5d0189`; Windows CI/run `37445464188` is **in_progress** at the time this process slice was prepared.

## Decision

The repository now uses a **claim-driven / invalidation-driven validation protocol** inside the existing CI strategy rather than adding a parallel workflow.

Core rules:

- identify the concrete claim to prove and which prior evidence a change actually invalidates;
- run the narrowest deterministic affected check first for failure isolation;
- preserve the existing required aggregate preflight and exact-head Windows CI for coherent source/config/test candidates;
- batch dependency-safe fixes before expensive CI/build work rather than building after each micro-edit;
- reuse an unchanged exact-head validated artifact for compatible deferred physical/manual gates;
- starting a new manual/review session is not, by itself, a build trigger;
- after a failure and correction, rerun only the downstream evidence invalidated by that correction, while preserving unrelated PASS evidence.

This deliberately does **not** weaken the current Windows candidate gate or allow source changes to bypass exact-head CI.

## Material changes

- `docs/CI_VALIDATION_STRATEGY.md` — authoritative decision sequence, practical matrix, artifact reuse and downstream-rerun rule.
- `ENGINEERING_QUALITY.md` — pre-CI discipline now invokes the invalidation decision before choosing checks/builds.
- `AI_START_HERE.md` — zero-context agents are explicitly told to apply the protocol and reuse valid artifacts.
- `AGENT_WORKFLOW.md` — validation timing now preserves unaffected evidence and discourages rebuild-by-habit.
- `HANDOFF.md` — records the new validation method and reconciles stale finding36 continuation with live PR239/CI state.

No runtime, test harness, workflow, dependency, packaging, manifest or build input changed.

## Validation evidence

- Documentation/process semantic review: **PASS** — the new rule preserves mandatory source/config preflight + exact-head Windows CI and changes only validation selection/reuse semantics.
- Runtime/frontend/Rust build: **NOT RUN / NOT REQUIRED** — Markdown-only process/tracking change.
- Windows CI for this documentation slice: **NOT RUN / NOT REQUIRED** — all changed files are Markdown and the commit uses `[skip ci]`; no executable/build/test/CI semantics changed.
- PR239 product validation: unchanged by this slice; its own exact-head Windows CI remains the authority for finding36.

## Tracking

No TODO checkbox, milestone acceptance, physical PASS, source-parity PASS or roadmap counter advances from this process-only change. `STATUS.md` is unchanged because no product/runtime truth changed. `HANDOFF.md` is refreshed only to remove the stale "implement finding36" action and point to the already-open PR239 validation path.

## Continuation

Follow the live PR239 exact-head CI outcome and merge/resulting-main procedure recorded in `HANDOFF.md`. Then continue finding35 if it remains the highest-priority unblocked READY_FOR_FIX line. Deferred physical findings07/27 and M9 PDF creation/open/rendering remain OPEN and should be consolidated on a compatible validated artifact; they do not require a rebuild merely because a manual session starts.
