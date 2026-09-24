# HANDOFF.md

Canonical zero-context continuation state for Narro. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active Milestone 7 in `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, the newest relevant immutable `work-log/*.md`, and current PR/CI state before changing source.

## CURRENT MILESTONE

**Milestone 7 — Floating Timer mode.**

- Milestones 1–6: COMPLETE / PASS.
- Milestone 7: ACTIVE / **6 of 14** top-level items validated.
- M7 items 1–6: COMPLETE / VALIDATED.
- M7 item 7: CI #480 PHYSICAL FAIL RECORDED; PR #125 IS AN UNVALIDATED CANDIDATE HANDED OFF TO CODEX FOR FURTHER ANALYSIS/IMPLEMENTATION.
- Current item-7 slice: **4/5 checkpoints complete**.
- Compact progress: `6/10M || 4/5 | 6/14`.

## CURRENT AUTOMATED-VALIDATED SOURCE BASELINE

Source/test SHA:

`6f99e9b1869b927e5a792cc569b6c8131859c7d8`

Source tree:

`a8108fc403e94ab90dc9a85c2070b8852667109f`

PR #124 exact validated head:

`2db045ef82286d8364d77a3ba9654842b9a66eb3`

The merge tree is byte-identical to the validated PR-head tree. Tracking-only Markdown descendants do not replace this source baseline.

Latest immutable evidence:

`work-log/2026-09-24-chatgpt-m7-compositor-paint-barrier-automated.md`

## PHYSICAL EVIDENCE FROM CI #477

Manual Windows re-test of exact resulting-main CI #477 produced:

- Panel -> Timer: PASS;
- Timer -> Panel: functional PASS, but small flicker remained;
- Expand/Collapse: FAIL;
- Panel returns to configured right side: PASS;
- normal product-size horizontal scrollbar: PASS;
- timer/session continuity: PASS;
- overall smoothness: not accepted because motion defects remained.

Supplied screenshots showed stale/duplicated expanded action-strip pixels during resize and old expanded pixels surviving into collapsed geometry. This is treated as a transient compositor/presentation failure, not evidence to redesign the established `340 x 300` expanded viewport.

## CORRECTION NOW AUTOMATED-VALIDATED

PR #124 adds only a narrow presentation/compositor barrier:

- outgoing Panel/Timer content still performs the finite exit, then becomes fully hidden before native geometry;
- a shared finite two-frame presented barrier lets the hidden state reach WebView composition before native mode geometry;
- Floating Timer expand/collapse now has an explicit hidden `resizing` phase;
- the final expanded/collapsed hierarchy is committed while hidden, held through another finite presented barrier, then enters through existing motion;
- no polling, timer clock, continuous animation, renderer-owned native position, third webview, or timer/session/task/scheduling authority was introduced;
- reduced-motion behavior and native/Rust geometry authority remain intact.

## VALIDATION EVIDENCE

PR #124 final head `2db045ef82286d8364d77a3ba9654842b9a66eb3`:

- CI #479 / run `35929764331` / job `107413269935`: PASS;
- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- runtime artifact `10781486137`, digest `sha256:e0ee9c832e1a770e10460b4b85f9815b406759ebf34ed0194bbdf89c008832c1`.

PR CI #478 failed only a stale deterministic collapsed contract after centralizing the paint helper; the contract was corrected in the final test-only commit and CI #479 passed.

Resulting-main source `6f99e9b1869b927e5a792cc569b6c8131859c7d8`:

- CI #480 / run `35931208957` / job `107417960065`: PASS;
- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- visual artifact `10781109686`, digest `sha256:9d81fc5ce5c6041797a8f8754cb501fe91599c71a6f76411028ceed05eda752f`;
- runtime artifact `10781866423`, digest `sha256:2c203f4c5cc62a645781fdb4ad341527bed6d60f8d0cb3b3cec2139be37c9f29`.

Local checkout/npm/Rust preflight: NOT RUN in this environment. Connector-side deterministic source-contract review: PASS.

## CHECKPOINT PLAN — 4/5 COMPLETE

1. COMPLETE — reconstructed transition ordering, prior physical evidence and parity boundary.
2. COMPLETE — corrected native staging/overflow and finite mode/resize motion.
3. COMPLETE — semantic review and deterministic contracts cover both Panel/Timer directions.
4. COMPLETE — latest compositor correction passed exact-head PR CI #479, merged, and resulting-main CI #480 passed.
5. **PENDING PHYSICAL WINDOWS RE-TEST** — transient desktop flicker/stale-pixel behavior cannot be proven by CI.

## LATEST PHYSICAL EVIDENCE — CI #480 FAIL

The user physically re-tested the exact resulting-main CI #480 runtime artifact.

- Panel -> Timer: PASS.
- Timer -> Panel: borderline/functional PASS; do not close the motion gate from this evidence.
- Expand/Collapse: **FAIL**.
- Panel returns to configured right side: PASS.
- Horizontal scrollbar at normal product geometry: PASS.
- Timer/session continuity: PASS.

Screenshots show each expand/collapse cycle retaining another stale copy of the expanded action strip and old expanded pixels surviving into collapsed geometry. Treat this as concrete native/WebView presentation evidence.

## ACTIVE CORRECTIVE PR — CODEX OWNERSHIP

PR #125 — `M7: hide Floating Timer during native expand resize`.

Current exact head:

`a652116dacda255bcb22a551ee6750504c72bc6a`

Current candidate scope:

- `set_floating_timer_expanded` reads native visibility, hides a visible `focusSurface`, performs `set_size` while hidden, best-effort restores visibility on resize failure, and shows only after resize succeeds;
- renderer publishes the target expanded/collapsed hierarchy while hidden, stages it transparently, invokes native hidden resize, waits one finite presented-frame boundary, then runs the existing entrance;
- renderer rolls back the prior expanded state if native resize fails;
- same focusSurface webview, same 340x110/340x300 geometry, native geometry authority, timer/session/task state and reduced-motion contracts remain unchanged.

Evidence/CI:

- connector-side source-contract review before PR: PASS;
- CI #481 / run `35936338414` on prior head `62e40ca34c86fe5fc19da447448aa1d540e80754`: FAIL only at `cargo fmt --check`;
- rustfmt-only correction head: `a652116dacda255bcb22a551ee6750504c72bc6a`;
- CI #482 / run `35936606645`, attempt 2: **manually stopped by the user before completion** so Codex can take over the analysis/implementation;
- no automated PASS exists for PR #125;
- do not assume the native hidden-resize approach is the right final fix merely because it is currently implemented.

The user explicitly wants Codex Goal to own the next technical analysis, corrections and implementation. A zero-context Codex agent must inspect the physical CI #480 screenshots/evidence and current PR #125 source critically, preserve the existing PR when appropriate, and change course only when repository evidence supports it. Do not blindly rerun CI before reviewing the candidate.

## USER AVAILABILITY / ROADMAP AUTHORIZATION

The user cannot perform physical Windows tests for several hours and explicitly wants Codex Goal to continue useful implementation work rather than idle.

This authorizes **parallel progress on independent later Milestone 7 items while the item-7 physical gate is waiting**, provided all of the following remain true:

- item 7 stays open and must not be marked complete without physical evidence;
- later work must not depend on assuming item 7 passed;
- keep each later item in its own coherent branch/PR/checkpoint and preserve rollback/isolation from item 7;
- do not skip to Milestone 8 or later milestones;
- do not merge a later M7 slice if doing so would make item-7 diagnosis or re-test ambiguous;
- repository tracking must continue to state clearly that item 7 is physically blocked.

## NEXT AGENT ACTION

The next implementation agent is **Codex Goal**, not this ChatGPT session.

1. Reconstruct current repository state and inspect PR #125, its exact current head, CI history, and the CI #480 physical-fail evidence before changing or rerunning anything.
2. Treat PR #125 as an unvalidated hypothesis. Analyze the repeated stale/duplicated WebView action-strip pixels and determine whether the current native hide/resize/show approach is technically sound. Keep and refine it if evidence supports it; replace it only if the current approach is proven inadequate.
3. Do not request or wait for physical Windows testing from the user for the next several hours. The user is unavailable for manual system tests.
4. Continue implementation work that can be validated without the user's physical interaction. This includes automated analysis/corrections for item 7 and, if item 7 remains physically blocked, independent later Milestone 7 items in roadmap order under the authorization below.
5. Keep item 7 OPEN until direct valid Windows physical evidence passes. Do not infer PASS from CI.
6. Do not advance to Milestone 8. Do not let later independent M7 work obscure the exact item-7 candidate/build that will need physical validation later.
7. For each coherent validated slice, maintain TODO/STATUS/HANDOFF/new immutable work-log evidence, exact SHAs, PR/CI state and artifact identity. Use expected-head guarded merges and resulting-main CI as required.

## INVARIANTS THAT MUST NOT REGRESS

- personal, local-only Windows 10/11 x64 scope;
- `main` plus reusable `focusSurface` remain the normal two-webview architecture;
- native/Rust remains monitor/work-area/DPI/physical-position authority;
- Timer-mode topmost/taskbar state remains native authority;
- renderer cannot become timer/session/task/scheduling authority;
- mode/expand changes cannot reset, duplicate, start, stop or switch the live session;
- item-2 drag/topmost/taskbar and items 4–6 actions/subtasks/tooltips remain intact;
- future-timed Today tasks remain ineligible until due;
- Notes URLs remain explicit activation only;
- no continuous decorative animation, polling or high-frequency JS native-window geometry loop;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain `?diagnostics=1` gated.

## BLOCKERS / NOT RUN

- **Physical Windows validation remains BLOCKING only for item 7 completion; the user is unavailable for manual testing for several hours. Independent later M7 work is explicitly allowed in the meantime.**
- Local Rust/Tauri/npm checkout validation: NOT RUN in this environment; exact-head PR CI #479 and resulting-main CI #480 passed authoritative Windows gates.
- No product decision blocks the implemented correction.
