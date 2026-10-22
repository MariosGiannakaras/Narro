# 2026-10-17 — PR365 B23 integration, exact-head CI and resulting-main verification limits

**Owner:** ChatGPT. **User priority:** stop additional Codex/OBS capture; analyze published M5/Focus evidence and implement only confirmed Narro gaps. Report truthful work-package X/Y and hand back precise remaining work. No unpause of M11/M12 or user-paused PA tests.

## Evidence and correction

B23 is a visual mismatch directly observable by comparing `reference/original-blitzit-screenshots/current-v2.6.69-home-dark.png` / `current-v2.6.69-home-light-list-hover.png` against `work-log/evidence/pr364-native-20261017/C4-010-dark-home-main.png`: original preview tasks appear in **individual muted rounded rows** with subdued ordinal; Narro baseline rendered **bare lines and accent ordinals**.

Scoped PR [#365](https://github.com/MariosGiannakaras/Narro/pull/365) changes only:

- `src/homeDashboard.css`: semantic-theme filled rounded Home preview rows, independent row spacing, muted ordinal and nowrap right-side EST.
- `src/visualFixtures.tsx`: visual contract row background/size/radius + ordinal color.
- `scripts/test-ui-home-dashboard.mjs`: explicit layout/semantic theme contract regression.

No task persistence/state schema, timer data, Open list action or approved Spectrum Core picker/image upload/218 icons changed.

## CI, historical failure and merge

- Original PR head `1c312a3edcd18515ea258c7a27282a5c02025cf2` / CI run `39016786611`: **validation PASS, fast FAIL, Windows SKIPPED**. First failure TS2322 on unsupported fixture keys (`paddingLeft`, `paddingRight`, `opacity`); repaired using *supported* keys, without weakening tests. Historical failed SHA remains failed.
- Replacement exact head `c155719030d760d8cc11655eb518e464ffb9e190` / GitHub Actions **run `39016905982`**: **validation-gate SUCCESS, fast-gate SUCCESS, windows-candidate SUCCESS (3/3)**.
- Guarded **squash merge PR #365 SUCCESS**, expected head guard exactly `c155719030d760d8cc11655eb518e464ffb9e190`; resulting main merge SHA **`a76050afe69d24585611b163c667974b0f4b545f`**; PR state closed/merged.
- **Main source identity verified** for all three changed files: blob SHA on resulting main equals the already validated PR head, respectively `src/homeDashboard.css` = `968844dac376c6c83ca8370d2ffa16bb544d478a`, `src/visualFixtures.tsx` = `6ae9111c3bc70f57331dfbae08b1985f89de2cd9`, `scripts/test-ui-home-dashboard.mjs` = `6b69351fdb80a234cea3563aa5d6221a887bb99f`.
- **Resulting-main GitHub Actions run conclusion: NOT VERIFIED** with available connector: `fetch_commit_workflow_runs` returns only *PR-triggered* runs, not pushes; merged SHA yielded no such runs. `get_commit_combined_status` returned no legacy statuses (not a PASS or FAIL claim). External public Github API was inaccessible. **Do not mark resulting-main CI as PASS by inference from PR head identity.**
- **Post-merge physical Windows rendering of newly changed Home CSS: NOT RUN/OPEN.** The frozen screenshots predate PR365. Normal CI visual fixture execution is automated validation, not a direct post-merge native user acceptance.

## Published image/state review and useful OBS boundary

- Frozen 7/7 acquired groups are exactly `4/4` M5 + `3/3` Focus, **not all project physical tests**.
- Review: [first bounded findings](2026-10-17-published-m5-m6-evidence-initial-review.md), [source-to-Narro still comparison](2026-10-17-source-to-narro-static-comparison.md), and [new final C3 proof](2026-10-17-c3-final-lanes-visual-followup.md).
- Specific **C3-037-final-lanes-main.png** directly confirms `1 Scheduled task this week` with date Oct 18 2026 and `1 Scheduled task in backlog` with Oct 24 2026. Contrary to two intermediate scrolled screenshots, **final frozen frame makes these headers VISUALLY OBSERVED**. Source parity/animations remain separate.
- Native archived-list Unarchive/Delete Forever buttons visibly appear with hover and keyboard in light/dark; no repeat capture required just for their visibility. Color `#111111` retained in saved/reopened test list; D3 work(2s)→break(26s)→work observed in owned-state snapshots.
- OBS initial original **9238.7s** includes a long no-input interval; published **170s action excerpt**, **221.1s** continuation, **284.35s** Focus recording. Raw original preserved. Do not inspect every duplicated idle frame; autonomous late transitions are not proved absent solely by input logs.
- Direct **frame-by-frame useful video motion inspection was NOT COMPLETED here**, because only metadata/screenshots/state were available programmatically in this environment; recorded video bytes not mountable locally and runtime cannot access raw.githubusercontent.com. No animation-duration/continuous-motion parity claims.

## Next executable action and user-safe restart guidance

**One exact next action:** via a Codex/Windows-capable authenticated environment, retrieve **push/main workflow run for merge commit `a76050afe69d24585611b163c667974b0f4b545f`**; confirm its **validation, fast, Windows candidate** gate conclusions exactly for that commit. On failure, identify first failing job/step and fix through normal PR; on success, record actual run ID/3/3 PASS. Reconfirm changed blob identity (already matched), affected rendered native Home comparison **only if separately authorized under paused PA restrictions**.

After that, **re-use existing raw video files for bounded actual motion review** if needed, ideally locally on Codex, without initiating any OBS or Narro recording. Deduplicate any remaining M6 selector/POMO, M7, M8, M9 capture requests against all older manifests first; those are open coverage decisions, not blanket authorization to record. Any truly missing physical test requires the user's separate explicit resumption instruction and must respect user-paused PA restrictions.

**Current six-item bounded review/correction work package: 5/6.** Item 5 (resulting-main actual CI verification) is blocked on connector visibility, despite PR exact-head 3/3 SUCCESS and merge/identity verification; item 6 (final comprehensive handoff to user) is being furnished with this log. This counter is not a 10-milestone progress denominator and must not be equated with M5/M6 PASS. Overall mandatory M1–M4 remain **4/10 validated**, M5 OPEN, optional M11/M12 dormant.
