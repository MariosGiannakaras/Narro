# Narro Engineering Risk Register

Status: **BINDING PREVENTION INDEX**

Last updated: 2026-10-10

## Purpose

This register turns **Narro's own implementation and validation corrections** into reusable prevention rules. It exists so a later agent can recognize a known failure family before writing another version of the same mistake.

It complements, rather than replaces:

- `docs/BLITZIT_HISTORY_RISK_INDEX.md` — hazards learned from Blitzit's public/source-product history;
- `docs/DEEP_ANALYSIS_IMPLEMENTATION_WORKFLOW.md` — how broad/current findings are analyzed and dispositioned;
- `docs/CI_VALIDATION_STRATEGY.md` — how claims are validated and invalidated;
- `TODO.md`, `HANDOFF.md`, `STATUS.md` — current work ordering and acceptance truth;
- immutable `work-log/*.md` — incident-level history and evidence.

This file is **not** another backlog, issue tracker, milestone ledger, acceptance gate or CI stage. A risk entry never means that a current bug is open, and a guarded entry never closes an existing physical/source-parity gate.

## How to use it

Before a non-trivial source/config/test slice:

1. identify the affected surface(s) and authority boundaries (renderer, coordinator, Rust/domain, SQLite, Windows/native, evidence/tooling, tracking);
2. scan only the matching tags/rows below;
3. carry applicable prevention invariants and guards into the implementation and validation plan;
4. preserve existing stronger rules when they overlap.

After a material failure or correction:

1. preserve exact incident/build/evidence in an immutable work log;
2. map the lesson to an existing family and strengthen its guard/evidence, or add a new family only when it is reusable;
3. record the causal boundary, why the previous check missed it, and the regression/preflight/physical guard added;
4. if no useful automated guard exists, say so rather than creating a brittle test.

Do not add permanent process for trivial one-off typos that existing preflight already catches.

### Control-state meaning

- **GUARDED** — a durable prevention rule plus meaningful automated/process guard exists. This does not imply all physical/source acceptance involving that area is complete.
- **PARTIAL** — the prevention invariant is known, but an important guard remains observational, incomplete, or intentionally cannot be automated reliably.
- **WATCH** — reusable pattern is established, but the project still needs stronger prevention evidence before treating the family as guarded.

## Current failure families

| ID | Tags / trigger | Learned failure family | Prevention invariant / guard | Control |
| --- | --- | --- | --- | --- |
| **NER-001** | `visual`, `motion`, `video`, `native` | Static frames, transcripts or sampled screenshots can look acceptable while continuous transition/state sequencing is wrong. | Motion/transient claims require the actual relevant MP4/continuous capture interval; static evidence remains support only. Resolve conflicting evidence at claim level using the parity conflict protocol; no Pass-3/newer/deeper label wins automatically. | **GUARDED** |
| **NER-002** | `windows`, `composition`, `repeat-failure` | Repeated small patches to the same failed acceptance criterion can optimize symptoms without fixing the mechanism. | After two separately corrected, CI-green builds physically fail the same acceptance criterion, invoke the existing repeated-failure escalation: reassess the whole causal path and compare a materially different scoped mechanism before more micro-fixes. Distinguish “same criterion” from “identical symptom.” | **GUARDED** |
| **NER-003** | `ci`, `preflight`, `tooling` | Cheap deterministic failures discovered after expensive Windows packaging waste CI and obscure product-signal quality. | Run strongest available local preflight and fast-gate checks first; formatting/parser/static-contract failures must fail before expensive candidate work. | **GUARDED** |
| **NER-004** | `harness`, `timeout`, `capture`, `ci` | Validation harness timing/transport limits can masquerade as product failures when real operations outlive fixed samplers/readiness budgets. | Prefer semantic/end checkpoints with hard outer bounds over short guessed sleep windows; prove product source is unchanged before classifying a timeout as harness-only; preserve product vs harness failure separately. When interpreting Windows CI failures, distinguish the first failing step and its stable diagnostic from downstream artifact upload errors; group in-fixture PowerShell assertions, readiness failures and post-capture screenshot-validation failures as distinct candidate families using fixture identity and stable diagnostics, never a generic exit code; root-cause classification remains evidence-led. | **GUARDED** |
| **NER-005** | `tracking`, `handoff`, `counters`, `evidence-drift` | Conversation memory, stale denominators or stale current-truth/crosswalk rows can contradict later validated repository evidence and send agents into duplicate work. | Derive counters from current TODO; repository current truth outranks chat; after material validation/merge reconcile HANDOFF/STATUS/TODO/crosswalk/README/architecture pointers that describe current state; run a stale-pattern scan before closing a substantial reconciliation. Keep historical snapshots immutable rather than rewriting them. | **GUARDED** |
| **NER-006** | `git`, `branch`, `merge`, `concurrency` | A validated feature branch can be older than authoritative process/evidence truth on `main`; merging stale copies can silently restore obsolete tracking/spec state. | Before merge inspect changed filenames and live `main`; reconcile any protected current-truth files; use expected-head guard; after merge compare affected source/test blobs/tree against the exact green head. Documentation-only divergence does not require source revalidation. | **GUARDED** |
| **NER-007** | `sqlite`, `async`, `responsiveness`, `native-read` | A synchronous SQLite/native read can display loading yet still block renderer command/input progress under a real lock. | Long/blocking reads or writes must not occupy the async/UI command executor; offload blocking storage work, preserve typed results/errors, and use a real-lock regression. Physical keyboard responsiveness remains a separate gate where required. | **PARTIAL** |
| **NER-008** | `windows`, `monitor`, `dpi`, `topology` | Persisting volatile monitor descriptor geometry/DPI as if it were permanent identity can strand a valid user selection after scale/work-area change. | Resolve persisted selection against current topology with safe compatibility rules; fail closed on ambiguity; expose stale selection explicitly instead of pretending it is Automatic; revalidate placement on topology/DPI changes. | **PARTIAL** |
| **NER-009** | `state-ownership`, `react`, `focus`, `timer` | Presentation-local state can accidentally own cross-presentation workflow context, or stale local status can outlive a newer authoritative state. | State that must survive Panel/Floating/success/remount boundaries belongs above presentation subtrees or in authoritative domain/coordinator state. Components project authority; they do not become a second authority. Automatic authoritative transitions must invalidate incompatible local status copy. | **GUARDED** |
| **NER-010** | `css`, `overlay`, `menu`, `rendering` | Functional/DOM correctness does not prove visual stacking or top-hit ownership; an underlying disabled control can paint or hit above the intended menu. | For stacking-sensitive UI, add rendered occlusion/top-hit coverage and retain physical/source comparison where browser/native composition matters. Do not treat a successful action callback alone as paint correctness. | **PARTIAL** |
| **NER-011** | `github`, `tooling`, `metadata`, `history` | Broad or placeholder write actions can damage durable repository metadata even when source refs are untouched. | Read-before-write, mutate the narrow target, never use placeholder/no-op content on real historical objects, verify the resulting object immediately, and retain immutable evidence sufficient to reconstruct metadata. | **GUARDED** |
| **NER-012** | `validation`, `physical`, `parity`, `ci` | Automated green, physical Windows correctness and source parity are different claims; collapsing them causes false PASS and unnecessary reruns. | Use the existing validation ladder and claim/invalidation protocol. Merge automated-green source when allowed while keeping observational gates OPEN; rerun only evidence invalidated by a correction. | **GUARDED** |
| **NER-013** | `react`, `mutation`, `double-submit`, `timer`, `sqlite` | A React `pending` state update does not synchronously lock an event-handler closure. Multiple pointer/keyboard/shortcut callbacks in the same render can launch conflicting commands or create distinct persisted task/session IDs. | For irreversible, non-idempotent or cross-owner mutations acquire a synchronous single-flight owner before the first asynchronous read/IPC, keep it through authoritative refresh and release on every retryable failure. Prove double-submit rejection and failure recovery with deferred-mutation regressions, then preserve Rust transaction authority. Do not infer actual duplicate writes without native/domain evidence. | **WATCH** |
| **NER-014** | `react`, `async-read`, `invalidation`, `stale-response` | Independently versioned initial reads, cross-window invalidation reads and post-mutation refreshes can commit out of completion order. A stale request may overwrite a newer authoritative UI projection even when one individual effect uses `disposed` or local revision guards. | Exercise A(initial stale)→B(new event)→B resolves→A resolves with delayed mocked IPC. All competing readers of one projection need a common freshness/target fence; retain latest typed authoritative snapshot and proper error states. Do not add polling or declare a database corruption bug from transient stale rendering. | **WATCH** |

### NER-013 — React state is not a synchronous command mutex

**2026-10-10 original observation (historical) / 2026-10-11 current reconciliation:** the original audit found React-only pending guards across `FocusLiveActions`, `ListBoard`, `SearchPalette`, `ReportsSessions` and Focus mutations. **Accepted source + three-job CI remedies now exist:** #305 FocusLiveActions sync gate, #307 Board/Search local create owner (with #317 Search success release correction), #310 Reports Add and #318 shared Add/Edit/Delete owner, #311 Focus row/add plus #312 six-handler FocusPanel common owner, #313 Blitz entry, #314 live subtasks/metrics, #315 Archive Restore/Delete; #309 separately handles Focus read freshness. Exact original PR-head CI and changed merge blobs reviewed in frozen S0 audit. **NER-013 remains WATCH for outstanding scope, not because the named patches are still pending:** coordinator post-Done Next Task/Take a Break previously used pending-only same-render admission at audit closure; **#322 now exact-head Windows 3/3 PASS and guarded merged `8e7590f635004a00e3fc0d1d5bdf3efc0856b845`** with real production handler deferred-IPC regression, but native/multiple-surface physical acceptance stays OPEN, and actual mounted handler/native cross-surface tests remain conditional Q03–Q14. None of this proves observed duplicate native persisted writes. Evidence `work-log/2026-10-10-chatgpt-pre-codex-code-and-rendered-audit-phase1.md`, `work-log/2026-10-11-chatgpt-0600-audit-p06-pr307-board-search-single-flight.md`, `work-log/2026-10-11-chatgpt-0600-audit-p08-p11-309-312.md` and post-audit action queue.

### NER-014 — all read producers must share freshness ownership

**2026-10-10 original observation (historical) / 2026-10-11 current reconciliation:** the initial `FocusPanel`, `ListBoard` and event-invalidation reads could commit out of order. The exact accepted #309 FocusPanel head `7b9d6d3dd0baf27fdbad2857094ae48a6c800503` passed run `38052663090` all three jobs, guarded merged `f5b9db263ca03124467714a816662bacaa348ae0`, with an **actual rendered M7 test** that resolves a fresher event board before the initial stale board and verifies its task remains visible. Current FocusPanel uses cross-path `boardReadRevisionRef` and target identity for initial/invalidation/timer/mutation projections, including guarded stale error paths. **#323 ListBoard initial/event read-order fix** exact-head run `38091028848` all three SUCCESS guarded merged `6ee07799b441831f69eb56ba57892788a8d09d5c` with mounted M7 inversion regression, and **#324 ReportsSessions filter/detail/post-commit read-owner fix** exact-head run `38093211469` all three SUCCESS guarded merged `7e6e8ecdd51a374a884e3d96c79ec41e761372a9` with deferred actual-handler source tests. **NER-014 remains WATCH for other as-yet-unreproduced ListBoard post-write/Reports read producers, target-switch/timer/late-error combinations and native acceptance**, Q05/Q18; do not copy the Focus fix speculatively or claim a current lost task without a reproduced failing actual handler. No native database corruption evidenced.

## Seed evidence and why each family exists

### NER-001 — evidence depth must match the claim

The M7 continuity program repeatedly demonstrated that sampled/settled frames could miss transient white/desktop/loading states in continuous Panel↔Timer and resize motion. Later PR235 notes also record that normal-motion headless screenshots can sample a partially faded rail and therefore are not settled menu/source evidence. The current M6 reconciliation found the same class at the specification level: an earlier “board fade” assumption survived after full Pass-3 VE-003 had established a shrink/translate window morph.

Evidence:
- `work-log/2026-09-28-codex-m7-visual-continuity-history.md`
- `work-log/2026-10-05-codex-m7-pr235-pointer-overlay-correction.md`
- `work-log/2026-10-06-chatgpt-m6-whole-focus-reconciliation-pr241-active.md`

### NER-002 — stop symptom-patch loops

Gate 7 physically failed on multiple separately corrected, exact-CI-green builds with different visible signatures. The project therefore added the repeated-failure escalation now embedded in `AGENTS.md`: after the threshold, stop successive tiny fixes and reassess composition/architecture using the same acceptance criterion.

Evidence:
- `work-log/2026-09-28-codex-m7-visual-continuity-history.md`

### NER-003 — cheap failures must be cheap

Historical CI #794 reached substantial frontend/build work before failing only on `cargo fmt --check`. CI #869 failed before app launch because its PowerShell validator had a parser error; the correction added an earlier parser preflight. These are exactly the failures the current fast-gate/pre-CI discipline is intended to prevent.

**2026-10-10 M6/Focus regression prevention:** A B50 change correctly made the Time's Up action row five contextual buttons, but two independent Windows capture/M7 fixture validators still demanded an obsolete six-button Pause+Extend layout. When an interaction/state contract changes, search *every renderer-based fixture and Windows capture validator* for the old contract, then add a targeted fast preflight guard for the rendered validator itself before expensive Windows builds. A subsequent B67 CSS edit inserted a warning selector at a generic first-matching `.floating-timer-foundation__actions-wrap` text anchor, unintentionally moving a clipping-specific `transition: none` to global scope and limiting the overtime warning to clipping. The prior full-green candidate did not catch the real visual defect. Prefer exact CSS selector/block replacement or AST-aware edits, and assert both normal and special-state selectors. Negative source-string tests must anchor to whole selectors (e.g. line start), not search unanchored substrings that also match a longer legitimate selector. Initial new fast CI failed solely because such a negative assertion was overbroad; the final regex-anchored guard preserves the originally correct source fix. Scope the fix to the first actual failure, not the downstream missing-artifact step.

**2026-10-12 PR338 U21 repeat fast-gate prevention:** Three successive source-only JSX changes exposed independent obsolete exact-string checks in `test-ui-focus-row-titles`, `test-ui-focus-empty-states`, and `test-timed-alert-flash-runtime`. All failed in sequential `preflight:frontend` before Windows, but each late discovery forced another new head/CI. **Before a shared React component attribute/conditional composition edit is submitted, enumerate every consumer test/fixture/validator of that component and reconcile its semantic expectation across the complete dependent set, not merely the first failing script.** Prefer a scoped same-element/behavior assertion over adjacency or an unimportant exact JSX expression. Run the complete available preflight before push; where connector-only access prevents local execution, explicitly label **NOT RUN**, complete a static consumer survey, and keep automated CI open rather than claiming preflight. This reinforces the existing rule, not a new gate or a green CI claim. [Causal evidence](../work-log/2026-10-12-chatgpt-u21-complete-static-consumer-causal-reconciliation.md).


**2026-10-12 PR343 U04 prevention (CI still pending):** User-approved Archived Done deletion reused the existing list-confirmation modal with a new `delete-done-task` variant and extended Edge archive capture from four to five states. Exact fast CI on first head [38283243930](https://github.com/MariosGiannakaras/Narro/actions/runs/38283243930) failed an obsolete literal `openerRef.current?.focus()` contract even though the new focus-recovery fallback still preserved return-to-opener behavior; keep the old semantic focus guard and the fallback instead of deleting the test. Next [38283626778](https://github.com/MariosGiannakaras/Narro/actions/runs/38283626778) failed because `test-ui-archives.mjs` asserted exactly four capture modes; expand the assertion to require the new `done-delete-confirm` light/dark state, do not weaken validation. Third [38284091358](https://github.com/MariosGiannakaras/Narro/actions/runs/38284091358) exposed Rust `cargo fmt --check`; 18 precise rustfmt hunks from the actual failed job were applied to the two Rust paths, without changing implementation or tests. Replacement [CI38284568221](https://github.com/MariosGiannakaras/Narro/actions/runs/38284568221) still **PENDING/NOT PASS** at this entry. These are a single preflight-consumer/formatting family (NER-003), not 3 independent app defects or an extra gate. When local toolchain is unavailable, enumerate affected static checks/fixture loops before pushing, retain their meaningful assertions, and use the first real CI diff for deterministic style-only repairs. [Exact immutable failure/repair proof](../work-log/2026-10-12-chatgpt-u04-pr343-two-fast-contract-failures-corrected-ci3.md).

Evidence:
- `work-log/2026-10-10-chatgpt-five-of-eight-pr301-and-b67-css-revalidation.md`
- #299 CI `37990651522` first M7 capture failure, repaired via CI `37996271400`
- #280 CI `38004427052` overbroad negative test; corrected head `b3eff7a39a595a2146ff28127d682661a705a2fb` CI `38004842175` (status separate)

Evidence:
- current `STATUS.md` historical CI #794 / #869 records
- `ENGINEERING_QUALITY.md`
- `docs/CI_VALIDATION_STRATEGY.md`

### NER-004 — validate the harness before blaming the product

CI #840's first capture attempts stopped before the real transition endpoint; later harness work changed the sampler/end-checkpoint behavior while the product transition source remained unchanged. CI #952 similarly exhausted a 2500 ms virtual capture budget after the sequential integration suite grew; the correction expanded only that scenario's harness budget.

**2026-10-10 PR301 B49/B63 prevention:** (a) When a rendered fixture uses an asynchronous bounded style/focus settling wait, the *corresponding Edge virtual-time screenshot budget must exceed that deadline*, and a cheap preflight must assert the relationship. The B49 light screenshot on failed run `38033695809` captured a visible focused icon/pill but before the fixture's readiness marker because Edge budget was only 600ms (minimum 800ms) against a 1500ms fixture wait; the source-only correction raised exactly that scenario's capture budget to 2500ms, without weakening opacity/focus/1px geometry acceptance. (b) When production deliberately marks an on-screen queue `inert` during a committed-success state, a generic queued-title tooltip test cannot require keyboard focus there: test **rejected focus + intact geometry in the inert state** and preserve ordinary title tooltip assertions elsewhere. The first failing step in run `38036152746` proved this contradiction; corrected B63 test semantics then passed exact-head Windows CI `38037669076`. Always distinguish early screenshot from product UI failure, and preserve failed PNG+DOM artifacts. These examples strengthen the existing NER-004 harness/state-conditioned fixture family; no new risk ID or global threshold relaxation needed.

Evidence:
- `work-log/2026-10-10-chatgpt-b49-edge-virtual-time-budget-root-cause.md`
- `work-log/2026-10-10-chatgpt-pr301-success-inert-queue-visual-fixture-fix.md`
- [PR301 exact green Windows run 38037669076](https://github.com/MariosGiannakaras/Narro/actions/runs/38037669076)
- current `STATUS.md` CI #840 / PR215 history
- `work-log/2026-10-05-codex-m7-pr235-pointer-overlay-correction.md`

**2026-10-11 B49 Q01 true browser-viewport mismatch (same NER-004 family, not new product defect):** the actual [#321 CI 38148720131](https://github.com/MariosGiannakaras/Narro/actions/runs/38148720131) generated 420×720 PNGs for both ordinary and keyboard focus, but the ordinary legacy Edge `--window-size=420,720 --screenshot` DOM reported `492×628` while the focused CDP `Emulation.setDeviceMetricsOverride` DOM reported `420×720`. This shifted the *entire centered rail* from x101 to x65 by exactly 36px with unchanged intrinsic rail/card geometry. **Guard:** when subtracting rendered screenshot regions, verify real `documentElement.clientWidth/clientHeight` on both source states, not nominal PNG dimensions or CLI window size. Capture both states under one exactly controlled viewport, preserve semantic focus/opacity constraints and minimum real decoded painted-pixel difference; never translate one screenshot inside acceptance merely to force a green delta. The existing original PR #321 same-branch candidate adds this guard at head `c7a12625797c0762ec3a8a7975007ce34963dacf`, [CI 38151014717](https://github.com/MariosGiannakaras/Narro/actions/runs/38151014717) **NOT YET FULL PASS** at checkpoint. Immutable evidence: `work-log/2026-10-11-chatgpt-b49-exact-inner-viewport-mismatch-repair.md`. This does not validate native Windows user interaction, source Blitzit parity or final Q12.

**2026-10-11 Finding33 first-failure observability correction (existing NER-004, not a new failure family):** [#321 exact Windows run 38151014717](https://github.com/MariosGiannakaras/Narro/actions/runs/38151014717) first failed in the *preceding separate* Finding33 Edge Notes/Escape interactive test: HTML `readyState=interactive`, empty `#root`, no React-ready marker or keyboard trace, while light/dark Notes screenshot fixtures in the same run mounted normally. Before this incident the driver only checked HTML HTTP 200, navigated Edge **before** CDP Network/Runtime/Log observers attached and piped stderr without draining it. A successful HTML GET or `readyState` does not prove a dynamic Vite module bootstrap, and an unobserved source import/JS/network failure must remain **UNKNOWN**, not be classified as a product Notes keyboard regression or mere timing flake. **Prevention:** attach CDP observers before navigation, check built module entry URL, preserve actual `Network.loadingFailed`, HTTP errors, `Runtime.exceptionThrown`, stderr and DOM/root state as failure artifacts; maintain hard CDP-command and page-ready bounds and the original real Escape key/DOM/ARIA assertions. New exact PR head `1d8ee1759f1f171439a44403b7d60cd81477ce58`, [run 38152724519](https://github.com/MariosGiannakaras/Narro/actions/runs/38152724519) **NOT YET FULL PASS** at checkpoint. Detailed immutable `work-log/2026-10-11-chatgpt-b49-full-ci-first-failure-finding33-bootstrap-observability.md`. Do not weaken or skip the Finding33 gate to merge #321.

**2026-10-11 #321 22-state extension to NER-004 (actual CI 38152724519):** the initially narrow B49 baseline/focused correction inadvertently made **4** CDP captures use a 420×720 DOM layout, while **18** legacy Focus scenarios used the 492×628 DOM layout produced by Edge for the *same nominal 420×720 PNG*. Windows correctly failed at cross-state Break hit-slot coordinate x65 versus x101. This was proved by enumerating all 22 real failure-ZIP HTML contracts, not inferred from CSS. **Prevention:** before changing capture viewport/engine, enumerate ALL consumers of the shared geometry baseline and test every scenario's *actual measured inner browser viewport* across themes. Preserve nominal PNG dimension as a separate invariant, never use image translation or threshold relaxation to hide a failed geometry match. The #321 candidate normalizes the 4 CDP states to the existing 18's **492×628** layout while retaining **420×720** screenshot clip and original Focus semantic/pixel checks; only exact Windows 3/3 grants acceptance. Source `work-log/2026-10-11-chatgpt-b49-22-focus-scenario-viewport-normalization.md`, [pending run 38155893406](https://github.com/MariosGiannakaras/Narro/actions/runs/38155893406).

**2026-10-12 PR338 U21 empty React root (same NER-004 family):** [run 38222942950](https://github.com/MariosGiannakaras/Narro/actions/runs/38222942950) exact head `0b34973...` passed validation, fast, 397 Rust unit tests and captured 21/22 normal Focus Panel screenshots, but one Notes-expanded/light Edge invocation returned a 420×720 **2353-byte** almost-empty screenshot and a **2711-byte static HTML shell with unmounted `#root`** (no fixture-ready or contract), while dark Notes and both actual Break captures rendered. The first actual failure was strict Focus visual-state screenshot size; the later missing packaged artifact was derivative. **Guard:** don't equate Edge exit, HTML 200, nominal PNG size, or nonempty DOM with mounted React and painted content. Check a scenario/theme-matched ready JSON contract and actual PNG signature/dimensions/content length, retry **only** incomplete browser bootstrap/paint with a fixed cap and clean capture files, fail closed immediately on rendered app errors/mismatched state, and retain strict visual/pixel validation. Implemented in PR338 head `2cac3c0...`; exact CI [38225791603](https://github.com/MariosGiannakaras/Narro/actions/runs/38225791603) **PENDING** at evidence checkpoint; no native or source-parity PASS. Immutable full evidence: [U21 empty-root corrective work log](../work-log/2026-10-12-chatgpt-u21-ci-visual-empty-root-causal-fix.md).

**2026-10-12 PR338 Finding33 Page.navigate timed out (NER-004, separate from Focus screenshot failure):** [Windows run 38225791603](https://github.com/MariosGiannakaras/Narro/actions/runs/38225791603) stopped at the *earlier* interactive large Notes CDP test before executing the corrected Focus screenshot harness; validation/fast and 397 Rust tests PASS. Downloaded diagnostic archive 11736928849: `Page.navigate` 8s timeout **after URL changed** but DOM remained `interactive` with empty root, `loadedResources=[]`, no runtime/network error event and no key input. Exact underlying Edge stall remains unknown; no Notes product defect was proved. Evidence-based guard is a **single independent fresh-process retry only for that exact pre-bootstrap state**, never for an existing React error, loaded/failed asset, missing diagnostics, or real Escape/focus failure; preserve first attempt artifact, bound total attempts and prove wrapper CLI actually executes. Full Finding33 keyboard assertions and visual checks remain binding. PR338 head `0434c050...` [CI 38227901343](https://github.com/MariosGiannakaras/Narro/actions/runs/38227901343) pending; do not claim Windows/physical acceptance. [Immutable detailed proof](../work-log/2026-10-12-chatgpt-u21-finding33-page-navigate-evidence-classified-retry.md).

### NER-005 — current truth must be derived, not remembered

A resumed chat once reported a completed slice as 4/6 despite repository evidence proving 6/6. Later M7 tracking used denominator 14 until a direct TODO recount established 15. Forensic closure also required follow-up reconciliation when stale source attribution survived an earlier audit.

Evidence:
- `work-log/2026-09-05-1740-chatgpt-progress-continuity-hardening.md`
- `work-log/2026-09-29-chatgpt-m7-current-counter-correction.md`
- `work-log/2026-10-04-0034-chatgpt-blitzit-forensic-closure-audit-followup.md`

### NER-006 — green branch does not own newer main truth

PR241 was exact-head green while its branch base predated two documentation-only current-truth commits on `main`. Because the PR changed only seven source/test files, the expected-head guarded merge preserved newer main documentation; all seven resulting-main blobs were then verified identical to the validated head. This is the desired merge pattern, not an instruction to rebase every docs divergence.

Evidence:
- PR241 exact head `57445875f7b04eae4d8b7e35fc8c0d5012899619`, CI985/run `37472276330`
- merge `3a06f1003a513f1af942ec076a9f50617f2abfe2`
- `AGENT_WORKFLOW.md` authoritative-main merge preservation

### NER-007 — blocking reads are an interaction defect, not just a loading-state problem

CI950 showed a real exclusive SQLite lock: loading feedback appeared, but Escape/Tab remained queued until the lock released. The scoped correction moved authoritative reads to a blocking worker while preserving DTO/error semantics and added a real-lock regression. The routed physical responsiveness acceptance remains open, so this family is only PARTIAL. PA04 on ec7673c adds a4.2s native UIA gap under exclusive lock, correlated with synchronous manual Add Session write. Its scoped async worker/real-lock regression is a candidate; no replacement-binary PASS.

Evidence:
- `work-log/2026-10-06-chatgpt-pr236-pr237-implementation-resume.md`

### NER-008 — monitor identity must survive safe descriptor drift

Finding27 showed an explicitly selected monitor becoming stale after real 125%→100% DPI change because the persisted key embedded volatile geometry/DPI details. The correction retains detailed identity but permits a unique safe monitor-name compatibility match and explicit stale/ambiguous handling. Physical selected-monitor/DPI acceptance remains open.

Evidence:
- `work-log/2026-10-06-chatgpt-pr236-pr237-implementation-resume.md`

### NER-009 — ownership must match lifecycle

Finding36 traced wrong Success→Next Task behavior and list reset to one cause: selected Focus scope lived inside a Panel subtree that could unmount, while Floating independently loaded All. Finding35 separately showed local “Task resumed.” copy surviving an authoritative transition into Time's Up. Both are ownership/lifetime mismatches rather than isolated labels.

Evidence:
- `work-log/2026-10-06-chatgpt-finding36-focus-scope-analysis.md`
- `work-log/2026-10-06-chatgpt-finding35-time-up-analysis.md`

### NER-010 — behavior can be correct while paint is wrong

PR235 reproduced a native-visible confirmation-menu failure where underlying disabled metadata painted above the transformed menu rail. A rendered top-hit/occlusion assertion caught the problem that action semantics alone could not establish. Physical/source painting acceptance remains a distinct gate.

Evidence:
- `work-log/2026-10-05-codex-m7-pr235-pointer-overlay-correction.md`

### NER-011 — repository tooling can damage non-code history

While loading a GitHub file-update action, an agent accidentally replaced historical closed PR #1's body with `noop`. Source/refs/CI were unaffected and immutable evidence allowed reconstruction. The prevention lesson is narrow tool mutation plus immediate verification, not a new approval ceremony for ordinary safe writes.

Evidence:
- `work-log/2026-09-05-1740-chatgpt-progress-continuity-hardening.md`

### NER-012 — keep validation claims separate

Multiple M7 candidates were automated-green and still physically failed continuity. Conversely, an integrated automated-green source correction may legitimately await later physical/source comparison. Existing policy already encodes the correct ladder; this risk entry exists to make that lesson discoverable before a future agent mistakenly promotes or reruns the wrong evidence.

Evidence:
- `work-log/2026-09-28-codex-m7-visual-continuity-history.md`
- `docs/CI_VALIDATION_STRATEGY.md`
- `AI_START_HERE.md` validation boundary

## Maintenance rule

Prefer **strengthening an existing row** over adding near-duplicate IDs. Split a new family only when its trigger, causal invariant or prevention guard is materially different.

When a prevention rule becomes fully encoded elsewhere (for example in `ENGINEERING_QUALITY.md` or a semantic regression), keep the risk row as the compact discovery pointer instead of duplicating the full rule here.

Do not use this register to keep obsolete active-work state. Current PR/CI/artifact/counter truth belongs in the normal tracking files.

## CI recurrence feedback loop

The operational detector is `.github/workflows/ci-learning.yml` with `scripts/ci-learning.mjs`; its GitHub issues are **triage candidates**, not new failure families, current acceptance status or an automated cause verdict. It inspects completed Windows CI history rather than relying on an agent remembering a prior failure. A repeated signature across independent run IDs is enough for review, not enough to declare identical causes. Generic exit codes and unavailable logs are excluded from automatic grouping and reported as incomplete coverage.

After a validated investigation, strengthen the appropriate existing family:
- **NER-003** for recurrent deterministic problems that should have failed cheaply before Windows packaging;
- **NER-004** for real test/harness timing, transient OS or transport limitations only after evidence distinguishes product behavior;
- **NER-005** when risk/history tracking itself goes stale;
- **NER-012** when an agent conflates rerun, exact-head CI, physical validation or source parity.

Record a precise immutable incident/correction in `work-log/` with failed run/attempt/SHA, first causal failed step, evidence and outcome. Update this register for a **reusable prevention invariant or improved guard**, not once per failure or rerun. Before closing triage, verify the guard actually addresses the cause and label nonautomatable evidence honestly. Do not claim that this Markdown automatically learns or that the daily scanner edits this file.

**2026-10-14 NER-003 native diagnostic dependency guard:** PA351 run38517414879 first failed Check Rust E0433 for an undeclared `log::warn!` dependency; later missing packaged artifact was downstream. Reuse existing native diagnostics and validate external logging macro namespaces against direct Cargo dependencies in notification delivery preflight, especially on hosts missing MSVC. Exact corrected38519177394/fa3ca8e0 remains pending; no native PASS. [Immutable failure and guard](../work-log/2026-10-14-pa351-compiler-failure-local-guard.md).

**2026-10-15 PA355 / existing NER-003 and NER-009 prevention:** a noop theme fixture could not expose focused-control disabling during real asynchronous persistence, and chart element containment did not imply non-overlapping glyphs. PR356 adds actual parent+child pending/success/failure/late-close keyboard regressions (body-targeted keys, nested ownership and listener cleanup) and real print-CSS textRange endpoint/adjacent-label bounds across8/31/61/91days. Both reproduce the old behavior before correction; exactCI/native gates remain separate. [Immutable causal boundary and local evidence](../work-log/2026-10-15-pa356-residuals-ci-checkpoint.md).

**2026-10-15 PR356 / existing NER-004 and NER-003:** exactCI38684913852 first failed new Preferences readiness; the PNG retained only an intentional closed-modal phase, while legacy theme capture discarded failedDOM before four retries. Preserve exact failure asUNKNOWN phase; use bounded actual marker/JS-error readiness with first DOM/PNG/network/phase diagnostics for sequential regressions, not a larger blind budget or weakened assertions. Keep calibrated legacy capture modes unchanged. [Immutable failure](../work-log/2026-10-15-pa356-first-ci-readiness-failure.md).
