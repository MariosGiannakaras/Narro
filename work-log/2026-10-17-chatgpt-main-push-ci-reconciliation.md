# 2026-10-17 — reconciled exact merged-main Windows CI and current trackers

**Owner:** ChatGPT implementation agent. **Scope:** documentation-only correction of newly accessible GitHub Actions facts, no source/config/test changes and no Windows physical operation.

**Main before reconciliation:** `aa783da60714606f3ff8d2df0e46436aa3833368`, latest executable merge PR371 `2cddd68a5440636e796a7c1100806883590bb897`. `main` has newer Markdown-only tracking commits. GitHub pull request inventory: only PR344 open, owned by another track, head `c44f6182e51620b95be30b664bddf7932d3b9ea5`.

## Exact resulting-main push workflow evidence

| PR | Merge SHA | Push/main run | Validation | Fast | Windows candidate |
|---|---|---|---|---|---|
| #365 | `a76050afe69d24585611b163c667974b0f4b545f` | [39018417122](https://github.com/MariosGiannakaras/Narro/actions/runs/39018417122) | SUCCESS | SUCCESS | SUCCESS |
| #368 | `07e35a3d6101b415d281a7cb1766522817f1b85a` | [39029894260](https://github.com/MariosGiannakaras/Narro/actions/runs/39029894260) | SUCCESS | SUCCESS | SUCCESS |
| #367 | `6c09ef892a6337d86f29d58bab84aa339bf865ff` | [39032469128](https://github.com/MariosGiannakaras/Narro/actions/runs/39032469128) | SUCCESS | SUCCESS | SUCCESS |
| #369 | `941c9bdfdb1e79e7b6411d95f4bba2141dfaa02c` | [39036018158](https://github.com/MariosGiannakaras/Narro/actions/runs/39036018158) | SUCCESS | SUCCESS | **FAIL** |
| #370 | `b1a342f3955010355c50d930d02e2c5a9f0abf50` | [39039147424](https://github.com/MariosGiannakaras/Narro/actions/runs/39039147424) | SUCCESS | SUCCESS | SUCCESS |
| #371 | `2cddd68a5440636e796a7c1100806883590bb897` | [39049929450](https://github.com/MariosGiannakaras/Narro/actions/runs/39049929450) | SUCCESS | SUCCESS | SUCCESS |

#369 failed Windows job `117406050615`: `Capture Visual Regression Fixtures` did not obtain `reports-overview-light` screenshot because Edge returned `net::ERR_NO_BUFFER_SPACE`. `Upload Packaged Focus Runtime Visual Artifact` had no artifact files after the interrupted sequence. Observed: validation and fast passed, earlier UI fixture capture progressed through Home/Focus/Floating/Archive/Theme. Classification: headless screenshot / runner resource failure at a specific step, not demonstrated production app UI defect. **Do not turn this failed run into SUCCESS.** Subsequent merge-run #370 and #371 Windows candidate succeed, supporting transient-context classification but not proving a fix for original run.

## Tracking consequences

- Prior PR365 remaining question was the *existence and outcome* of resulting-main run; this is now conclusively 3/3 SUCCESS. The bounded prior six-step evidence/source-review/handoff package becomes **6/6**; no new native Home or Blitzit acceptance is claimed.
- Preserved PR365 visual fixture confirmation and source file identity, PR369 exact-head logo capture, PR370 menu fixture, PR371 runtime validation, existing immutable records and historical CI failures.
- Main `TODO.md` validates M1–M4 **4/10** mandatory; the older `AI_START_HERE.md` **3/10** wording was stale. M5 onward remain OPEN, M10 one-time holistic audit gated; optional M11/M12 dormant, native PA-01–09 user-paused.
- U01–U41 41/41 Narro-local functional coverage and 9/9 confirmed original gap repairs remain unchanged. No broad source-parity or Windows acceptance claims.
- Updated `HANDOFF.md`, `STATUS.md`, `TODO.md`, and `AI_START_HERE.md` to point to actual evidence rather than unavailable Actions; older artifacts/work logs remain immutable. Documentation-only commit intentionally uses no Windows CI.

**Next operation:** inspect the first still-open evidenced unowned M5 requirement (A6/B23 Home source/visual geometry acceptance), reuse existing captured evidence and current code; implement only if an actual deterministic Narro-local defect can be supported, otherwise retain the separately paused physical/source acceptance gate. Do not touch PR344 or start M10/M11/M12/native PA work.
