# 2026-10-16 — Optional M12 professional in-app QA specification

## User request and scope

The user requested a **new optional Milestone 12** for professional QA/testing of Narro, **limited to actions an ordinary user takes inside the application**. Specifically exclude complex two-screen testing, unplugging cables, changes to Windows settings and comparable OS/hardware/system scenarios.

This request authorizes **documentation of M12**, not execution, installation, environment changes, physical testing or activation of M11/M12.

## Documentation changes

- `docs/NARRO_OPTIONAL_USER_QA.md` — binding optional protocol: independent strict opt-in, scope/exclusions, realistic user journeys QA-01…QA-12, safe disposable data, smoke/functional/exploratory testing, issue triage/severity, actual in-app retest, regression, exact release identity, honest outcomes and exit gates.
- `TODO.md` — adds optional M12 after optional M11, before required Final Comprehensive Review; corrects final-review prerequisites and source SHA baseline when either/both optional stages are activated. Existing mandatory roadmap remains ten milestones.
- `AGENTS.md` and `AI_START_HERE.md` — durable hard opt-in and user-only in-app restrictions. Neither optional milestone implicitly starts the other.
- `STATUS.md` and `HANDOFF.md` — current documentation-only M12 disposition without replacing the active M5 next operation or changing previously validated acceptance.

## Invariants and non-actions

- **M12 DORMANT / NOT RUN**, independently of **M11 DORMANT**. No optional item becomes a required blocker or increases the denominator merely by being documented.
- Preserve all pre-existing milestone work and active M5 session/owner. Do not restart PA-01–09 or any Windows physical testing via this specification.
- No source/config/test/build/CI changes, no release candidate execution, no installation, no AppData/DB changes, no Windows/hardware operations, no Blitzit capture.
- Preserve the approved Spectrum Core list picker, image upload and 218 offline icons.

## Validation and next action

Documentation-only validation: confirm new optional section, strict activation gate, QA matrix, exclusions and correct final-review ordering in the current GitHub files. **Actual M12 QA: NOT RUN.**

**Next action:** continue the active M5 operation from `HANDOFF.md`; do **not** start M12 unless separately and explicitly activated after a validated candidate is available.
