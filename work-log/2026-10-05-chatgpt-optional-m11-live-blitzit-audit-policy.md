# 2026-10-05 — Optional M11 live Blitzit audit policy

## Scope

Documentation/process/tracking only. No Narro production source, tests, Rust/React/Tauri configuration, CI workflow, migrations, build logic, active PR #234 source, Windows evidence or validation result was changed.

The user explicitly requested a new **optional Milestone 11** for a future live Blitzit trial/reference audit, with a strict requirement that it must never start unless the user gives a separate explicit activation instruction.

## Policy established

Milestone 11 is now:

**M11 — Optional Live Blitzit Reference Audit**

It is **DORMANT / STRICTLY OPT-IN**.

Binding activation rule:
- `continue`, `keep going`, `finish the project`, `continue to the end`, completion of M10, availability of Blitzit, an installed trial, account/subscription availability, or an agent's judgment that more source evidence would help do **not** authorize M11;
- only an explicit user instruction specifically activating M11 / the live Blitzit audit authorizes work on it.

While dormant:
- M11 checkboxes are non-blocking;
- M11 is not incomplete required work;
- the roadmap denominator remains **10**;
- validated M10 proceeds directly to the required Final Comprehensive Review.

If explicitly activated:
- activation must be recorded durably before audit work starts;
- the progress denominator becomes **11** from that point onward;
- M11 starts from a fully validated M10 baseline SHA;
- the live-source audit must complete and any selected Narro corrections must be validated before the Final Comprehensive Review baseline is frozen.

## Intended M11 purpose

The live audit is not a second broad replay of the already-complete canonical corpus.

It exists to resolve material evidence limits that curated Blitzit screenshots/tutorial recordings cannot expose reliably, including:
- unshown hover/focus/pressed/disabled states;
- menus/popovers/dialogs/tooltips and contextual controls not opened in supplied media;
- transient/loading/empty/error/success states;
- exact interaction ordering and motion/timing where existing evidence is insufficient;
- drag/resize/window-placement details;
- conditional Preferences states;
- material observable edge cases needed for a Narro implementation decision.

The audit starts from the existing canonical Pass-3/static-calibration evidence and current audit crosswalk.

## Evidence and version discipline

If activated, the live Blitzit environment must record observable version/build, date, Windows/display/DPI context, trial/subscription limitations, relevant settings and observation provenance.

A newer live Blitzit observation does not silently overwrite older canonical evidence. Version conflicts and ambiguities remain explicit.

Every material new live finding must:
1. have reproducible/provenance-aware evidence where practical;
2. distinguish direct observation from inference;
3. be reconciled against existing canonical evidence;
4. update the implementation crosswalk before Narro changes;
5. produce only narrow evidence-backed corrections;
6. revalidate affected prior gates.

Credentials, payment details, private account data and unrelated personal content must not be captured into evidence artifacts.

## Files changed

- `docs/BLITZIT_LIVE_REFERENCE_AUDIT.md` — new binding dormant M11 protocol.
- `AGENT_WORKFLOW.md` — hard M11 opt-in gate, denominator semantics and Final Review ordering.
- `AI_START_HERE.md` — bootstrap-level prohibition on implicit M11 activation and progress semantics.
- `TODO.md` — new optional M11 checklist between M10 and Final Comprehensive Review; Final Review baseline/order reconciled.
- `HANDOFF.md` — current explicit M11 dormant/not-authorized banner.
- `STATUS.md` — durable project-level M11 policy.
- this immutable work log.

## Current project state unchanged

This policy does not alter the active implementation line:
- active PR #234 remains the current M7/M2/M5 integration work;
- no active milestone checkbox was closed by this documentation change;
- M10 remains blocked by its existing M1–M9 hard entry gate;
- M11 is not authorized;
- current progress remains governed by the existing active handoff and uses the **10-milestone denominator**.

## Continuation

Continue the current authoritative M1–M9/M7/PR234 line normally.

After all required M1–M9 gates close, M10 may begin under its existing hard entry gate.

After M10:
- if the user has **not** explicitly activated M11, skip M11 and proceed directly to Final Comprehensive Review;
- if the user **explicitly activates M11**, record activation, switch to /11M reporting, execute the live audit protocol and complete/revalidate selected corrections before Final Comprehensive Review.
