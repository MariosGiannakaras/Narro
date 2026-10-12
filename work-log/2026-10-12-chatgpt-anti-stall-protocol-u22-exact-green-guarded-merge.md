# 2026-10-12 — Resume-in-place guardrails and U22 PR341 continuation to exact-head guarded merge

## Trigger and user requirement

The user observed repeated stalls/restarts of the Narro coding agent despite an existing U22 PR with CI running, updated the project instructions, and explicitly requested corresponding repository changes. This is a **process/continuation reliability** correction, NOT permission to restart source implementation, activate M11 or run paused Codex native Windows PA-01–09.

## Exact verified live correction

- Before acting, `HANDOFF.md` still said [U22 PR341](https://github.com/MariosGiannakaras/Narro/pull/341) replacement Windows CI pending, exact head `3c306300bd9d9eedd6818ec15e87e3de3dc8a3cf`.
- A single scoped GitHub check proved [PR-head CI 38256743036](https://github.com/MariosGiannakaras/Narro/actions/runs/38256743036) **validation-gate/fast-gate/windows-candidate all 3/3 COMPLETED SUCCESS**, with the same exact head; `PR341` still OPEN and mergeable, no competing open PR, and `main` only documentation changes beyond the previous U06+U09 validated executable baseline.
- On the **existing** U22 PR head (no new branch/PR/source fix), checked the 12 changed files' Git blob SHAs, verified exact-head CI, used `expected_head_sha=3c306300bd9d9eedd6818ec15e87e3de3dc8a3cf` with squash merge. GitHub confirmed merge **`c8085e94ae6b329fec8a0ad0635f4e2eb294485d`**.
- Independently fetched the merge-source tree and compared **12/12 changed source/fixture/test Git blobs exactly identical** to validated PR head (no tracking files overwritten by older branch).
- Resulting-main [Actions run 38262440802](https://github.com/MariosGiannakaras/Narro/actions/runs/38262440802) started on exact merge SHA. Validation and fast PASS in last observed job state; windows-candidate is **IN PROGRESS**, so **full merged-main Windows candidate and replacement ZIP/exe/NSIS/MSI SHA256 are NOT YET ACCEPTED**. Earlier U06+U09 artifact is a **previous executable**.
- Prior accepted independent source work: U12/U40/U35/U21 **4/4**, U06 **1/1**, U09 **1/1**. U22 **1/1 source exact-head CI/guarded merged**; resulting-main candidate remains open. Separate native Windows PA-01–09 remain **USER-PAUSED/NOT RUN**, mandatory milestones **3/10**, M10 blocked, optional M11 strictly dormant. The user-owned Spectrum Core Create/Edit List picker/upload/218 icons is unchanged.

## Prevention protocol made binding in repo

- `AI_START_HERE.md`: A **resume-in-place fast path preceding the zero-context bootstrap**. Follow-ups and stalls first use last concrete tool result, PR/head SHA and run. If an action was interrupted, check whether side effects happened before retrying. Green exact-head CI leads to guarded merge, red to first failure log, running to independent work rather than repeated polling. Answer 'ολοκλήρωσες;' with actual status and no fabricated progress.
- `AGENT_WORKFLOW.md`: A formal state-transition table for interrupted calls, active/failed/successful PR CI, merge/resulting-main CI/artifact and actual blocked work. No parallel duplicate PRs, stale branch-owned tracking overwrites or unsupported physical PASS.
- `AGENTS.md`: User instruction precedence and resume-in-place priority over redundant onboarding; only full bootstrap on genuinely new coding chat lacking context.
- These are **Markdown-only direct-main `[skip ci]` commits** and do not invalidate the exact executable candidate or justify a new Windows run; on every following resumed user turn the same protocol applies, not another full repository scan.

## Next exact action

Read the latest result of **resulting-main run 38262440802**, not PR341 as if still open. If all three jobs SUCCESS, fetch actual merged-main Windows artifacts and independently check ZIP CRC and SHA256 of ZIP, narro.exe, NSIS and MSI, then repin current physical candidate and update TODO/HANDOFF/STATUS/register with exact proof. If FAIL, inspect first failed step/log before an evidence-based follow-up on latest main. Once U22 source/main is accepted, next independent coding dependency is U23 planned active Break EST read-only typed snapshot and Focus header view, per `work-log/2026-10-12-chatgpt-u23-typed-break-planned-duration-independent-design-while-u22-ci.md`. No Codex physical install/run until explicit user reactivation; never activate M11 by generic continuation.
