# Post-correction programming review — PR248 active

Date: 2026-10-07
Agent: ChatGPT
Scope: user-clarified bounded review of corrections introduced from the current implementation context onward, specifically the corrective PR236–247 generation and directly related M6/M7/M9 deltas. This was not a whole-history or whole-repository re-audit.

## Review method

- Synced current authoritative main at `b91b9dd9072ae15328bbc1fbb40c919b4a7af6ab`.
- Read the current bootstrap/handoff, engineering-quality standard, deep-analysis workflow and Narro engineering-risk register.
- Re-read the production/test diffs for PR236–247 and checked them against recurring Narro failure families: stale/concurrent state, authority/lifecycle ownership, async/pending behavior, cross-layer validation divergence, cleanup/error paths and physical-vs-automated claim separation.
- A suspected bounded-tooltip React/DOM placement issue was investigated and **not** promoted to a defect; React does not necessarily rewrite an unchanged declarative attribute after an imperative DOM adjustment. No tooltip patch was made.

## Confirmed findings

1. **PR236 monitor identity — cross-layer parser divergence**
   - Rust rejects persisted monitor descriptor numeric fields outside `i32`/`u32` ranges.
   - Renderer fallback parsing previously checked only decimal shape, so malformed out-of-range keys could appear compatible in Preferences while native resolution rejected them as stale.
   - Correction: renderer range validation now matches Rust bounds; semantic overflow regressions added.

2. **PR246 Reports Add Session — pending-shell Shift+Tab escape**
   - Pending mode intentionally focuses the dialog shell while all controls are disabled.
   - When pending returned to interactive after an error/non-close result, focus remained on the `tabIndex=-1` shell; Shift+Tab from that shell was not one of the trap boundary cases and could escape behind the modal.
   - Correction: shell focus is treated as an explicit trap boundary; the real rendered Reports keyboard fixture now exercises pending -> interactive -> Shift+Tab.

3. **PR238 Reports Overview PDF — stale request/capture race**
   - Filter/range changes could render their new labels while the previous Overview payload remained on screen until the async refresh completed; Export stayed available.
   - WebView2 PrintToPdf captures the current Main WebView, so navigation/interaction during the capture could also mutate the document being exported.
   - Correction: Overview request identity is tracked; export is disabled until the visible payload belongs to the exact current request and no refresh is pending. Main document interaction is frozen during capture and restored in `finally`.

4. **PR244 Focus Home pause provenance — stale post-reveal resume race**
   - A second Home exit could occur after Focus had been revealed but before the two-frame guarded auto-resume completed.
   - The previous implementation cleared the Home lease before checking whether the timer was already Home-paused, and the later stale reveal callback had no generation identity. This could lose or wrongly consume provenance.
   - Correction: every Home pause/renewal receives a monotonic nonce; repeated Home on the exact same paused task/session/revision renews rather than drops the lease; the post-reveal event carries the current nonce and coordinated resume consumes only a matching nonce. Rollback-after-failed-exit keeps the existing unconditional one-shot path.

5. **PR238 WebView2 PDF timeout — late temp-file leak**
   - If the bounded 20s receiver timed out while WebView2 PrintToPdf later completed, the immediate cleanup could run before the PDF existed and the late callback would leave an orphan temp file.
   - Correction: the completion callback removes the temp output when the receiver has already been dropped.

## Implementation state

- Branch: `review/post-correction-hardening-20261007`
- PR: #248 — **Harden recent corrective slices against stale-state races**
- Exact current PR head: `4d5b57bb13372f36036b3c737ff189a948046656`
- Changed production/test surfaces are limited to the five findings above.
- Windows CI #1032 / run `37658873387`: **QUEUED** at this checkpoint.
- Windows CI #1031 targets an older PR248 head and is superseded for acceptance by the current exact head.
- Local repository preflight: **NOT RUN**. This execution environment has no repository checkout and direct GitHub network cloning is unavailable; exact-head Windows CI is therefore required before integration.
- Physical Windows validation: **NOT RUN** on PR248.
- Source parity: no new PASS is claimed by this programming review.

## Current claim impact

No roadmap/progress counter advances.

If PR248 is integrated, the prior CI1025 packaged artifact is no longer the current physical candidate for surfaces touched by PR248. Use the new exact validated artifact for affected physical checks. Unaffected historical evidence remains valid under the claim/invalidation protocol.

## Exact next action

Inspect Windows CI #1032 on exact head `4d5b57bb13372f36036b3c737ff189a948046656`.

- If CI fails, inspect the exact failed step/log and correct only the evidenced cause.
- If CI passes, re-check live main/PR state, expected-head guard the merge, verify resulting-main source/test identity or resulting-main CI as required, then reconcile HANDOFF/STATUS/TODO and repin the consolidated physical candidate without closing any physical gate automatically.
