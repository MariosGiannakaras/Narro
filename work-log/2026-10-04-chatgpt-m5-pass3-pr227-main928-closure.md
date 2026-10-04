# 2026-10-04 — M5 Pass-3 PR #227 / resulting-main #928 closure

## Scope

This immutable entry closes only the coherent M5 Pass-3 implementation correction `P3-M5-01..05`. It does not perform new Blitzit forensic analysis, does not claim direct source parity, and does not take M7/M9/M10 ownership.

## Authoritative source and validation

- pre-merge authoritative main: `ff89a55154e3bdb5fc1792576ada17975708b456`;
- PR #227 branch: `fix/m5-pass3-parity-corrections`;
- exact validated PR head: `d40cd9edec6456bc25dafb792ad3ab29876abe99`;
- exact-head Windows CI #927 / run `37161179503`: **PASS**;
- expected-head guarded squash merge: `cdbe496bb995311f5dacc0527ef94072683032d1`;
- resulting-main Windows CI #928 / run `37162873321`: **PASS**.

CI #928 passed validation-gate, fast-gate and the full Windows candidate, including frontend/contracts, Rust formatting/check/Clippy/tests, performance harness, Windows visual regression and artifact upload, Tauri release, packaged Focus runtime capture/validation, physical-validation release and M1 diagnostic validation.

Local executable preflight in this ChatGPT runtime was **NOT RUN** because the runtime could not resolve GitHub for a local checkout. No local PASS is claimed.

## Implemented corrections

1. `P3-M5-01`: Today now projects source-style done/total Done progress from an authoritative typed completion count plus current pending count, retaining the established Today accent and anchored Blitz CTA.
2. `P3-M5-02`: board cards rest with an ordinal; hover/focus swaps the leading slot to completion and exposes Subtasks / Notes / lane-left / lane-right / overflow in reserved geometry.
3. `P3-M5-03`: drag presentation adds lifted-card feedback, card-height live placeholder/reflow and finite settle without changing the already validated positional `beforeTaskId` persistence contract.
4. `P3-M5-04`: permanent task deletion uses inline destructive Confirm + X while preserving explicit confirmation, stable task/list identity and report-exclusion semantics.
5. `P3-M5-05`: reversible active-list Archive applies directly from the list menu; permanent archived-list deletion remains separately destructive and confirmed.

## Preserved boundaries

- PR #225 narrow planning-title/readability regression remains preserved and still has its separate exact-EXE physical observation open.
- Narro-owned fixtures and Windows CI are regression evidence, not direct Blitzit `SOURCE_PARITY_PASS`.
- `P3-VAL-01` and `P3-VAL-02` remain open where recorded.
- M7 `P3-M7-01/02`, remaining M9 Overview PDF, and M10 remain outside this line's ownership.

## Continuation

The next owned implementation slice is M6 `P3-M6-01..03` from latest authoritative `main`: board fade before Focus, Notes toolbar/automatic http(s) recognition with explicit external activation retained, and calibrated Focus live-card cyan→mint/lime edge/glow. Stop this implementation line after validated/merged M6.
