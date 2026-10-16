# 2026-10-16 — M10 evidence reuse and delta-only validation policy

## Scope and user decision

User directed that tests already successfully completed while closing mandatory milestones M1–M9 must not be mechanically repeated in M10. M10 remains the **hard-gated** final release-candidate acceptance stage, not a new execution of every earlier test. This is a **documentation/process-only change**; it does not authorize beginning M10 while earlier gates are open, waive real release-specific/native/source checks, or change completion counts.

## Files changed on main

- `AGENT_WORKFLOW.md`: inserted M10 evidence-reuse/no-blanket-replay decision and required claim/evidence/dependency matrix after the existing M10 hard entry gate. Commits `2796caa6d74cffb1c550026708eca926e0cc9fe5` and correction `6afbffe996230ee3d484fd1e41d047af5d61cb1f`.
- `docs/CI_VALIDATION_STRATEGY.md`: inserted M10-specific claim-driven reconciliation, reuse and delta-only new checks, preserving mandatory release candidate gates. Commit `99e82ab78f33726c62eed72831e6649f14788d9b`.
- `TODO.md`: inserted binding M10 rule and narrowed check descriptions for regression coverage, replaced foundations, screenshot fidelity, animation/performance and known anti-regressions. Commits `340185c63451590ee45509fca6faf5ce91dbb185` and correction `2967fe6456f88f3a0eae11e78292b5650d42ad12`. All 15 M10 checkbox items retain their prior unchecked state.

## Acceptance and invalidation contract

Once the M1–M9 hard gate is genuinely closed on resulting `main`, produce a per-M10-criterion evidence matrix with prior source/executable/artifact/CI/native/source-parity identity, exercised environment and claim, intervening dependency changes, validity and exact remaining validation. Mark `REUSED_VALID` when accepted evidence still proves the claim, `NEW_CHECK_REQUIRED` when missing/stale or inherently release-candidate-specific, `LIMITATION_ACCEPTED` only when explicitly bounded/approved, otherwise `OPEN`. Re-execute only missing/invalidated checks, narrowly justified integrated checks, and final-candidate-specific installer/upgrade/sign-in/build requirements. Do not rerun unaffected milestone tests for freshness or equate source CI PASS to a native observation. Existing M10 hard entry gate, security hardening note, mandatory release candidate gates and final review path remain unchanged.

## Verification / limitations

- **PASS (document static assertions):** hard M10 entry and security note retained; all 15 M10 unchecked items retained; no blanket rerun policy, targeted replacement-foundation rule and screenshot-evidence reuse present; process and CI-strategy documents consistent; recurrent-failure section renumbered.
- **NOT RUN (correctly not applicable):** source/unit/build/Windows CI or physical Windows validation. These changes affect documentation/process text only, no executable/build/test inputs.
- **OPEN:** M1–M9 remaining acceptance including M5 active work; M10 has not started. No new milestone or release PASS claimed.

## Continuation

Do **not** replace the active `HANDOFF.md` M5 task/owner with this documentation-only policy. Continue the exact live M5 PR/CI/source-acceptance operation recorded there. Apply this M10 policy only after all required M1–M9 gates close, and do not activate optional M11.
