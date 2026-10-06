# Deep analysis → implementation workflow

Status: **BINDING**

Last updated: 2026-10-06

## Purpose

This workflow defines how Narro should analyze a broad set of open implementation, visual, motion, physical and source-parity findings before and during remediation.

The goal is not a shallow audit followed by opportunistic fixes. The goal is an **evidence-complete, causal, dependency-aware analysis campaign** that can continue across zero-context chats while still allowing independent validated implementation to progress in parallel.

This file does not replace the Blitzit Pass-3 corpus or the parity reconciliation workflow. It defines how implementation/reconciliation agents consume those sources and how new Narro evidence is analyzed.

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
