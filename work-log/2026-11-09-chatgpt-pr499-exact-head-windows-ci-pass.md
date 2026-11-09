# 2026-11-09 — PR499 exact-head Windows CI 3/3 source validation

## Owner / source

- Active owner: ChatGPT; existing correction PR [#499](https://github.com/MariosGiannakaras/Narro/pull/499), DRAFT and UNMERGED at this evidence receipt.
- Branch `fix/prephysical-d01-d05-20261109`, head `ae0447c4bebd49215f0c49eb8cd9acf0db8fc80c`, strict descendant of held PR437 source `ccdd993ca9808e36f0c23e626dbcc4eea62e9a49`. Changed source/test paths limited to D01–D05; A/B 389/419 comparator heads and protected Spectrum/218-icon appearance were not modified.
- GitHub Actions [run42632330444](https://github.com/MariosGiannakaras/Narro/actions/runs/42632330444): final status `completed`, final conclusion **success**, three jobs: validation-gate **success**, fast-gate **success**, windows-candidate **success**. Prior head failures were diagnosed/replaced on new commits; they remain historical FAIL and are not converted retroactively.

## Verified Windows job gates

- Actual frontend preflight, new D01 real compiled-provider order/disposal/commit-revision regression, new D02 actual ListEditor callback PNG/invalid/selection/Save/blob regressions, D04 Reports source/worker/lock harness, D05 CRLF producer control, existing M5–M9 regressions and Vite build passed.
- Rust formatting, cargo check, Clippy, native Rust unit tests, physical-observer internals, performance harness and visual regression fixture capture passed.
- Normal Tauri release built; packaged Focus runtime captured and artifact uploaded.
- Separate physical validation release built and verified; full-stack logging lifecycle and M7 automatic logging verification passed; artifact provenance recorded.
- M1 diagnostic release built; diagnostic storage isolation verified; artifact provenance recorded.
- CI is a deterministic packaged/software gate, **not** a new physical user acceptance or source Blitzit behavior/parity verdict.

## Exact GitHub artifact identity (all associated with head ae0447c4...)

| Artifact | GitHub artifact ID | Bytes |
| --- | ---: | ---: |
| narro-m7-physical-windows-x64 | 13683936109 | 16630228 |
| narro-ci-bundle-download-attempts | 13683432156 | 7498 |
| narro-m1-diagnostic-windows-x64 | 13682454129 | 6081241 |
| narro-m7-validation-windows-x64 | 13682384621 | 6155319 |
| narro-m5-visual-regression | 13682279193 | 6892871 |
| narro-m7-focus-runtime-visual | 13681449536 | 2497409 |
| narro-fast-frontend-dist | 13680802789 | 398084 |

These are provider-reported immutable artifact metadata/associated source SHA. The per-binary hashes/provenance are subject to the already passing CI provenance scripts; this receipt does not invent hashes or claim a human screenshot/frame review.

## Outstanding guards

- D01–D05 source correction **CI VALIDATED**, native manual contention and lifecycle tests **NOT RUN**, user PA-01–09 physical **USER-PAUSED**, full real continuous video/PTS/log packet and frame-by-frame inspection **NOT RUN**. No physical evidence was fabricated. No new M5–M9 accepted rows; the59 documentary rows remain OPEN (6/13/18/11/11).
- PR499 DRAFT, unmerged; PR437 and A/B389/419 remain separately held with strict8/8 physical gating. A green CI for PR499 cannot authorize merge around those dependencies. M10 user review/approval remains required after M1–M9 closure; M11/M12 not activated.
- Main documentation-only commits tracking this receipt do not alter the branch artifact's source tree. A source merge and resulting-main validation have **NOT RUN**.

## Sole next operation

Maintain the draft source branch and source SHA. Wait for **explicit physical PA reactivation or genuine external native evidence** to validate corrected-source behavior on authorized Windows hardware; then follow the existing per-milestone physical dependency ordering, strict A/B comparator 8/8 if relevant, guarded source integration and resulting-main verification. Only reopen D01–D05 coding if a demonstrated failing case appears.