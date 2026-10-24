# Deep analysis → implementation workflow

Status: **BINDING**

Last updated: 2026-10-24

## Purpose

This workflow defines how Narro should analyze a broad set of open implementation, visual, motion, physical and source-parity findings before and during remediation.

The goal is not a shallow audit followed by opportunistic fixes. The goal is an **evidence-complete, causal, dependency-aware analysis campaign** that can continue across zero-context chats while still allowing independent validated implementation to progress in parallel.

This file does not replace the Blitzit Pass-3 corpus or the parity reconciliation workflow. It defines how implementation/reconciliation agents consume those sources and how new Narro evidence is analyzed.

## Optional dedicated pre-physical readiness audit — user opt-in

This is an **optional, user-reserved inspection**, not a standing prerequisite, not an autonomous continuation task, and not a substitute for actual Windows physical validation. **Do not begin or resume it without a separate explicit user instruction.** Recording this optimized protocol does **not** activate the audit, M11/M12, a physical PA session, or M10's release-candidate-wide sweep. Ordinary scoped engineering review and required tests/CI remain permitted independently of this optional audit.

If the user activates the dedicated pre-physical audit after the applicable implementation and exact-head CI are ready, use the existing source/evidence/disposition workflow below with these five *additional execution controls*. They improve efficiency **without reducing required coverage, weakening proof, or turning an unobserved behavior into PASS**:

1. **Risk-prioritized inspection, full scoped coverage.** Start with the most consequential state owners and failure paths: Focus/Timer native composition and transitions, lifecycle, restart/persistence, asynchronous event ordering and concurrency, IPC/OS/DPI/window ownership, keyboard/focus/accessibility, and previously evidenced FAIL/PENDING cases. Prioritize by potential user impact, known failure evidence, dependency fan-out and uncertainty; **do not omit lower-risk in-scope requirements**. Track inspected and uninspected requirements so priority never silently becomes a scope exclusion.
2. **Evidence reuse and no redundant investigation.** Resolve each requirement/finding against current `main`, exact candidate SHA, existing tests/CI, canonical Blitzit Pass-3/calibration records, previously accepted physical evidence and immutable work logs. Identify what changed since each accepted proof (code semantics, data, dependencies, build inputs, artifact, UI states and environment). Reuse proof where still valid; inspect only the uncovered or invalidated delta. Never promote an old-build physical PASS/FAIL onto a new build or redo completed video analysis without a specific new question. Reuse current tracker IDs/owners; no duplicate research queues.
3. **Combined per-surface review, separately graded claims.** For each in-scope screen/component and natural state journey, examine together: actual functional behavior and state authority; UI/layout/text/icons and available source-reference fidelity; pointer, hover, focus, Tab/Escape and keyboard/accessibility; empty/loading/error/disabled states; rollback, persistence/restart and timing/transition behavior. Check compatible adjacent/shared-surface requirements together, **but record an independent verdict and evidence for every claim**. Source inspection and static fixtures may expose risks; they cannot certify compositor frames, real input delivery, multi-monitor/DPI behavior or unobserved Blitzit parity.
4. **Systematic completeness and test-gap crosswalk.** Cross-check the existing `TODO.md` and canonical finding IDs against product/spec evidence, reachable production code paths, state owners, consumers, fixtures and regression tests. Mark uncovered behavior, untested error/concurrency/lifecycle paths, contradictory invariants and unsupported parity assumptions explicitly. Distinguish **missing implementation** from **missing test/proof**, **unknown Blitzit-specific details**, and **physical-only observation**; neither an unchecked acceptance item nor an evidence limit alone is a confirmed code bug. Use the existing disposition matrix below, with cause and an exact next proof/action for each open item.
5. **Cause-led repair batches and claim-driven CI.** For `READY_FOR_FIX` / `NEEDS_REGRESSION_FIRST`, reproduce or establish the narrowest defensible cause, implement the smallest compatible fix on its existing owned branch, and add behavior-level regression coverage. Batch only genuinely dependency-safe corrections of the same affected surface; avoid speculative changes, separate per-symptom PRs and redundant full Windows builds. Run narrow tests first, then exact-head required validation/fast/Windows CI where source/config/test/build semantics changed, using `docs/CI_VALIDATION_STRATEGY.md` invalidation rules. Preserve a documented `PHYSICAL_BEFORE_MERGE` hold and never mark physical/source parity PASS from green CI.

**Audit deliverable and stop criterion (only if activated):** Leave one deduplicated requirement/finding-level matrix in the existing tracking system, including: scope/ID, state/route, source owner, evidence and exact candidate identity, risk, implementation status, test/CI status, direct source-parity status, physical status, disposition/cause, and the smallest outstanding action. Report (a) confirmed defects corrected and their validation, (b) verified unchanged behavior/evidence reused, and (c) physical-only, source-parity, product-decision or evidence-limited gates. The optional audit ends when all **in-scope source-inspectable claims** have an evidence-grounded disposition and no actionable source defect remains without a documented fix/blocker; it **does not require real Windows execution or certify physical acceptance**. Leave existing milestone, PR, and M10 gates unchanged unless new evidence actually satisfies their separate acceptance rules.

## Core operating model

Use a **deep-analysis-first, pipelined workflow**:

1. establish exact current repository/build/evidence identity;
2. analyze the complete independent open-finding set deeply enough to classify each item;
3. trace every substantiated discrepancy to a causal implementation boundary;
4. group findings by shared cause/dependency/file ownership;
5. implement only evidence-backed deltas;
6. allow independent branches/CI to run while analysis continues elsewhere;
7. defer compatible physical checks into a later consolidated Windows session when their result does not determine the next safe source change;
8. keep every non-run/manual/source-parity gate explicitly OPEN.

Do **not** impose either extreme:
- do not patch immediately after the first superficial symptom;
- do not block every independent fix until every unrelated finding in the project has been analyzed.

The unit of sequencing is the dependency graph, not the order in which observations happened to be discovered.

## Research intake deduplication — before Phase A

For any new analysis/corrective campaign, first read [tracker and branch ownership index](TRACKER_STATUS_INDEX.md) and locate the existing canonical U-ID or source finding (or record why no suitable ID exists). If an existing closed finding already covers the observation, record a new *delta only*: newly observed build/source artifact and SHA, exact changed protocol/state, current implementation owner, impact and a regression hypothesis. Reuse and link earlier evidence rather than copying media, building duplicate trackers, or reimplementing an abandoned branch. `41/41` indicates functional local coverage of a **fixed historical uncertainty register**, not a claim that no new evidence can arrive. Maintain a single current task owner in `HANDOFF`; immutable logs hold history. No branch pruning, Git LFS/evidence migration, native PA execution or optional live-source M11 is implied by an intake review.

## Phase A — freeze the evidence identity

Before interpreting a finding, record or recover:

- exact Narro commit/build/artifact;
- exact source/reference identity where parity is involved;
- capture/log packet and timestamp/action sequence;
- DPI/theme/motion/monitor/runtime state when material;
- whether the evidence is screenshot, continuous video, UIA/DOM/native telemetry, log, persistence snapshot, automated test, or physical observation;
- known capture limitations, missing intervals and instrumentation failures.

Never combine observations from different builds as if they were one continuous run.

An action manifest proves an attempted action, not that the intended visible result occurred.

## Phase B — exhaustive finding analysis

For every open finding, inspect enough evidence to determine what actually happened before proposing a fix.

### Static image analysis

For image-backed user-visible work, inspect at minimum:

- whole-window composition and hierarchy;
- component bounding geometry and relative proportions;
- spacing rhythm, padding, alignment and baseline relationships;
- typography hierarchy, truncation/wrapping and numeric stability;
- borders, radii, dividers, shadows/elevation and clipping;
- accent/gradient/glow relationships;
- icon size/weight/alignment;
- state-specific details such as hover, selected, disabled, destructive, live, paused, done, loading and empty;
- overflow and scroll behavior;
- DPI/theme/reduced-motion variants when the evidence makes them relevant.

Do not reduce visual review to isolated color/radius sampling. Use the calibrated Blitzit visual system for ordinary styling and measure distinctive/signature geometry when useful.

### Video / motion analysis

A transcript, action log or sampled screenshot is **not** a substitute for the actual motion evidence.

For a finding whose correctness depends on motion, transition, transient state, ordering or continuity:

1. inspect the actual relevant MP4 interval;
2. when the behavior depends on preceding/following context, inspect the complete continuous segment or full video;
3. identify:
   - pre-state;
   - trigger/action;
   - first visible response;
   - intermediate/transient states;
   - ordering of simultaneous/serial changes;
   - reflow, resize, position and opacity behavior;
   - hover/focus latency where observable;
   - duration/easing/settling character where measurable;
   - terminal state;
   - recovery or next transition;
4. compare normal and reduced motion separately when applicable;
5. distinguish source motion character from Windows/native correctness.

For direct parity acceptance, sampled frames may support a finding but cannot prove continuous motion equivalence by themselves.

**Long idle OBS-tail boundary — binding for any native/source video review:** Some OBS originals continue for hours after the *last useful action* with effectively repeated frames. Before full-motion analysis, align the input/action timeline, session log, clock offsets, normal quit/OBS stop and a bounded sampling of the alleged tail. Determine the **last material visible/audio/UI/state event** (not simply the last mouse movement), retain appropriate lead-in/follow-up margin, and inspect the useful interval in motion at the required depth. When later samples/state/logs support a long inactive/no-change tail, **do not decode or individually compare every near-identical frame** merely because the raw file is long. Preserve the full original with hash, an explicit excerpt interval/processing method and any interval not reviewed; distinguish a lossless excerpt from the complete raw recording. The input log alone does **not** prove that timers, alerts, asynchronous completion or other autonomous transitions stopped; if plausible, probe their bounded expected times or mark the late activity **UNVERIFIED**. If video bytes are inaccessible to the current agent, never claim that an entire idle tail or motion sequence was visually cleared based only on filenames/logs. Reference [2026-10-17 frozen M5/Focus review](../work-log/2026-10-17-published-m5-m6-evidence-initial-review.md) for the 9238.7s → 170s practical case. This is an **analysis rule**; it does not authorize starting/stopping a user's external OBS instance or reactivating paused physical capture.

### State decomposition

Do not judge a surface only in its default state. Where relevant, enumerate and analyze:

- rest;
- hover;
- pressed;
- keyboard focus;
- selected;
- loading;
- live/running;
- paused;
- expanded/collapsed;
- menu/popover/dialog open;
- disabled/off;
- destructive/confirmation;
- overdue/time-up;
- done/success;
- error;
- recovery/restart;
- DPI/theme/reduced-motion variants.

Analyze only states supported by the active requirement/evidence; do not invent unnecessary states.

## Phase C — source precedence and reconciliation

For Blitzit-related work, use the existing canonical evidence route:

`EVIDENCE_ROUTING_MAP → PARITY_RECONCILIATION_WORKFLOW → Pass-3 canonical finding → VISUAL_SYSTEM/calibration when visual → CROSSWALK/UI_UX_SPEC → current Narro implementation/tests`.

Do **not** broadly repeat the completed Blitzit forensic pass.

Re-open raw Blitzit screenshots/videos only when:

- the canonical record is ambiguous for the decision;
- evidence records conflict;
- a new Narro behavior exposes an unrecorded source detail;
- final direct side-by-side/overlay/motion verification requires the original.

When raw video is re-opened for a motion-dependent question, inspect the actual motion interval at the same forensic depth as Pass 3; do not replace it with transcript-only reasoning.

Evidence precedence must be explicit when source versions conflict. A convenient older reference must not override stronger current direct evidence.

## Phase D — causal tracing

For every substantiated Narro discrepancy, trace the symptom to the narrowest causal boundary before editing.

Typical chain:

`rendered/native symptom → component/state/CSS → coordinator/event ordering → IPC command → Rust/native authority → persistence/OS boundary`.

Not every finding uses every layer.

Requirements:

- distinguish symptom from cause;
- test competing hypotheses against existing logs/source/tests;
- prefer deterministic reproduction or semantic regression tests;
- do not fix provider telemetry when rendered behavior is already bounded and no user-visible failure exists;
- do not patch a visual symptom if stale authoritative state/event ordering is the actual cause;
- preserve accepted behavior outside the evidenced causal boundary.

## Required disposition matrix

Before implementation, assign each analyzed finding one current disposition:

- **READY_FOR_FIX** — discrepancy and causal correction are sufficiently evidenced;
- **NEEDS_REGRESSION_FIRST** — real failure exists but the safe cause needs deterministic diagnostic/test coverage before changing runtime behavior;
- **NO_FIX** — evidence does not establish a product defect, or current behavior is an intentional/validated deviation;
- **SOURCE_PARITY_OPEN** — implementation may be functionally correct but direct canonical visual/motion comparison remains;
- **PHYSICAL_ONLY** — source change is not currently justified; required conclusion depends on real Windows observation;
- **PRODUCT_DECISION_REQUIRED** — source/evidence does not define the intended behavior and implementation would invent product semantics;
- **EVIDENCE_LIMIT** — capture/source is insufficient to support a stronger conclusion;
- **BLOCKED_BY_DEPENDENCY** — another result must resolve before this item can be safely implemented.

Record the reason and the exact evidence supporting the disposition. A label alone is insufficient.

## Cross-finding analysis before edits

After individual findings are analyzed, compare them as a set.

Look for:

- shared state authority;
- common event/revision ordering;
- common CSS/layout primitive;
- common native window/topology helper;
- common persistence/read boundary;
- one symptom caused by another finding;
- fixes that would touch the same high-risk/shared file;
- findings whose apparent fixes contradict one another.

Prefer one causal fix with multiple regressions over several symptom patches.

## Implementation batching and concurrency

Implementation starts from the disposition matrix, not from discovery order.

### May proceed concurrently

Independent work may proceed in parallel when:

- each item is already evidence-backed;
- neither item's correct implementation depends on the other's unresolved result;
- they do not create unsafe overlapping ownership of shared source/tracking;
- each branch has a coherent review/validation story.

Before calling two implementation lines independent, compare their expected changed-file sets. Classify any shared source as:

- **soft/mechanical overlap** — shared glue such as module/command registration where each semantic change remains independently reasoned. Parallel work is allowed only with an explicit merge order and a mandatory reconcile of the later branch onto resulting `main` before exact-head validation/merge;
- **hard/semantic overlap** — shared state authority, behavior, schema, algorithm, high-risk helper, or tests whose meaning can change with merge order. Keep these lines sequential unless stronger repository evidence proves the interaction safe.

A planned reconcile/rebase after the earlier branch merges is normal coordination, not a product/implementation failure. Track it separately from compile, test, CI, or physical-validation failures. Do not label branches with a shared source file as fully independent without recording the overlap classification.

Examples:
- an M7 native-read branch may validate while an unrelated M9 Reports export branch is analyzed/implemented;
- documentation/evidence reconciliation on `main` may continue while source CI runs.

### Must remain sequential

Keep work sequential when:

- both changes modify the same state authority or shared high-risk file and interaction cannot be reasoned independently;
- the second implementation depends on the first CI/manual result;
- a replacement invalidates the evidence basis of the later change;
- merge order can change semantics or tests materially.

Do not create parallel replacement branches for the same problem.

## Validation ladder

Keep each level distinct:

1. **ANALYZED** — evidence reviewed and disposition recorded;
2. **IMPLEMENTED** — source/config/test delta exists;
3. **COMPILED** — relevant build/check passes;
4. **AUTOMATED_VALIDATED** — applicable tests/CI pass on exact candidate;
5. **PHYSICAL_WINDOWS_PASS** — required native/manual observation passes;
6. **SOURCE_PARITY_PASS** — required direct canonical image/motion comparison passes.

Narro-owned visual fixtures are regression protection, not proof of Blitzit parity.

**Scope of repeated checks vs one-time release-candidate sweep (user decision, 2026-10-17):** Normal implementation PRs retain their **targeted affected-component/source-state regression and required CI gates**. Do **not** demand a new whole-app screenshot/brand inventory after every change. The **systematic whole-app visual-composition, official branding, shared shell/controls and screen/state coverage sweep is a named required checkbox in M10**; it begins only after M10's hard entry prerequisites. At that point reuse all still-valid existing image/video/fixture evidence, supplement only genuine gaps, and respect separate user authorization for paused native Windows PA work. A high-confidence defect found earlier (e.g., actual production placeholder logo) may still be fixed immediately with its own focused tests; deferring the *global sweep* never justifies ignoring a proven local defect.

A source PR may be integrated after exact-head automated validation while compatible physical/source-parity gates remain explicitly OPEN, per `docs/CI_VALIDATION_STRATEGY.md`.

## Visual/source acceptance standard

For a user-visible item requiring source parity, the acceptance record should state:

- exact Narro candidate;
- exact canonical Blitzit reference/finding;
- state(s) compared;
- DPI/theme/motion mode when material;
- whether comparison used side-by-side, overlay, measured geometry, full-motion review, or a combination;
- material matches;
- material discrepancies and their disposition;
- evidence limitations.

Avoid bare “looks good” / “PASS” conclusions.

## Campaign execution during long implementation sessions

When many findings are open:

1. continue active PR/CI checks when results become available;
2. meanwhile analyze other dependency-safe findings deeply;
3. maintain a live disposition/cause map in durable repo tracking/work logs;
4. start independent `READY_FOR_FIX` branches without waiting for unrelated physical checks;
5. do not request new acquisition until existing recordings/canonical evidence have been fully consumed for the relevant question;
6. consolidate compatible physical checks onto the newest applicable build.

The user should not need to remember which items were already analyzed.

## End-of-slice durability

Before stopping substantial work:

- update current truth in `HANDOFF.md`, `TODO.md`, `STATUS.md` and crosswalk where applicable;
- create a new immutable `work-log/*.md` with the analyzed findings/dispositions, exact candidate/CI evidence, open gates and next action;
- ensure every open finding has enough recorded evidence/reasoning for a zero-context agent to continue without conversation memory;
- never leave a causal hypothesis or user-visible parity limitation only in chat.

## Non-goals

This workflow does not:

- reactivate optional M11;
- require replaying the already-completed broad Blitzit forensic corpus;
- allow source analysis to substitute for Narro validation;
- allow automated validation to substitute for physical Windows or source-parity gates;
- justify speculative polish unrelated to an evidenced open item.
