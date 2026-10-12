# 2026-10-12 — U21 PR338 exact-green guarded merge; 18/18 blob proof; resulting-main CI active

## Source/automated acceptance

- **Scope:** U21 Focus Break display-only title and suspended nonmutable queued work. Original work/task identity, timer session, task completion, persisted Done and Rust ledger unchanged. U22 Break Done and U23 transient EST remain separate. Approved user-owned Create/Edit List Spectrum Core color picker, image uploads and 218 offline icons unchanged.
- **PR:** [#338](https://github.com/MariosGiannakaras/Narro/pull/338), original branch `fix/20261012-u21-focus-break-live-projection`.
- **Exact accepted head:** `10d5370ac92a2e5be2ee696c04ba28ea368f4ae6`; [Windows CI run 38228307088](https://github.com/MariosGiannakaras/Narro/actions/runs/38228307088), attempt 1, event `pull_request`, exact head SHA verified from GitHub REST run, **validation-gate SUCCESS / fast-gate SUCCESS / windows-candidate SUCCESS**. PR open, mergeable=true / mergeable_state=clean and exact SHA rechecked at merge time.
- **Guarded squash merge:** `expected_head_sha=10d5370ac92a2e5be2ee696c04ba28ea368f4ae6`; GitHub returned **merged=true**, [merge SHA `334566f2a41293c458353991d99d968ad5fa9ad1`](https://github.com/MariosGiannakaras/Narro/commit/334566f2a41293c458353991d99d968ad5fa9ad1). New `main` head and PR merge SHA independently matched the returned commit. The PR changed **18 source/script/test/package files and no Markdown**, so authoritative documentation already newer on `main` was not overwritten by branch copies.
- **18/18 exact Git blob identities verified** by reading each of the following from both the exact accepted PR SHA and merged-main commit SHA, comparing Git blob SHA:
  1. `package.json`;
  2. `scripts/capture-focus-panel-fixtures.ps1`;
  3. `scripts/capture-visual-fixtures.ps1`;
  4. `scripts/focus-panel-capture-readiness.mjs`;
  5. `scripts/run-finding33-large-notes-escape.mjs`;
  6. `scripts/test-finding33-navigation-retry.mjs`;
  7. `scripts/test-focus-break-live-presentation.mjs`;
  8. `scripts/test-focus-panel-capture-readiness.mjs`;
  9. `scripts/test-timed-alert-flash-runtime.mjs`;
  10. `scripts/test-ui-focus-empty-states.mjs`;
  11. `scripts/test-ui-focus-panel.mjs`;
  12. `scripts/test-ui-focus-row-titles.mjs`;
  13. `scripts/test-ui-focus-visual-states.mjs`;
  14. `scripts/test-ui-m6-parity-reconciliation.mjs`;
  15. `scripts/test-ui-task-notes-large.mjs`;
  16. `scripts/validate-focus-visual-state-captures.mjs`;
  17. `src/FocusPanel.tsx`;
  18. `src/focusBreakPresentation.ts`.
- **Resulting-main CI:** new push [38231906248](https://github.com/MariosGiannakaras/Narro/actions/runs/38231906248), exact source `334566f2a41293c458353991d99d968ad5fa9ad1`; validation SUCCESS, fast/Windows **IN PROGRESS / NOT FULL PASS** at latest checkpoint. Do not confuse exact-head PR 3/3 PASS with resulting-main acceptance.

## Failure-analysis context

The earlier U21 branch went through three obsolete FocusPanel JSX string checks and two independent Edge bootstrap/visual tests, all analyzed from actual failed-job steps and artifacts. The latest head includes strict DOM/scenario/theme/PNG readiness with limited retry for genuinely incomplete fixture rendering and one classified Finding33 Page.navigate bootstrap reattempt only when recorded evidence proves no modules loaded and no real keyboard/renderer errors. Neither changes user-visible app behavior nor relaxes pixel/geometry assertions. Immutable earlier logs:
- `work-log/2026-10-12-chatgpt-u21-complete-static-consumer-causal-reconciliation.md`;
- `work-log/2026-10-12-chatgpt-u21-ci-visual-empty-root-causal-fix.md`;
- `work-log/2026-10-12-chatgpt-u21-finding33-page-navigate-evidence-classified-retry.md`;
- `work-log/2026-10-12-chatgpt-u21-finding33-original-driver-static-contract-fast-correction.md`.

**Bounded coding progress: U12/U40/U35/U21 = 4/4 individually Windows CI accepted and guarded merged.** B49 infrastructure = 1/1 separately accepted. This does **not** mean all Narro source parity, latest production artifacts, user-paused physical Windows checks or 10 milestone gates are complete. Physically accepted mandatory milestones still **3/10**; PA-01–09 user-paused, M10 blocked, M11 hard opt-in dormant.

## Next action (authoritative until updated)

1. Inspect actual final run 38231906248 validation/fast/Windows outcomes, and first failing step/artifacts only if red.
2. Only if exact resulting-main 3/3 SUCCESS, download the actual production ZIP artifact for that run and independently verify ZIP CRC/SHA256 and extracted `narro.exe`, NSIS and MSI SHA256. Do not reuse historical #333 hashes.
3. Record four real hashes/artifact ID/source SHA in `docs/CURRENT_WINDOWS_RESIDUAL_PHYSICAL_SESSION.md`, `docs/PRE_CODEX_RISK_AUDIT_2026-10-11.md`, `HANDOFF.md`, `TODO.md`, `STATUS.md` and a **new** immutable artifact proof log. Recheck live `main` before editing shared Markdown, preserve other agents' work.
4. Leave user-paused PA-01–09 physically NOT RUN and original-current Blitzit source parity OPEN. Never activate optional M11 implicitly.
