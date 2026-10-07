# Narro Multi-Agent Workflow

Narro is maintained so different coding AIs can alternate without prior chat context. **The repository is the handoff medium and must be sufficient by itself.**

`AGENTS.md` remains authoritative for durable product/scope/correctness rules. `ENGINEERING_QUALITY.md` is authoritative for implementation quality, error handling, robustness, validation and pre-CI discipline.

## Repository state overrides conversational memory

The latest authoritative repository state on `main` always outranks chat history, cached summaries, or a previous agent's remembered checkpoint. Keep **validated application source baseline** distinct from newer documentation/process truth: documentation-only commits may advance `main` without changing the validated source SHA.

Before emitting a substantive progress/status update after a new chat, interruption, resumed session, or apparent context loss, the agent must re-read current `HANDOFF.md`, the active `TODO.md` milestone, relevant `STATUS.md`, the newest relevant immutable `work-log/*.md` entry, and any open/recent PR/CI state referenced there. If conversation state conflicts with repository evidence, correct the conversation and follow the repository.

Never decrement a previously validated user-facing progress counter merely because an older conversational checkpoint was loaded. **Exception:** when current evidence or a replacement implementation invalidates the acceptance basis of previously validated milestone items, reopen exactly that affected scope and reduce the current progress counters to repository truth, preserving the old PASS as historical evidence. The small progress counter may reset only when a genuinely new implementation slice has explicitly begun. When resetting it, state the new slice and denominator in the same update and ensure `HANDOFF.md` records either the latest completed slice progress or the currently active slice progress so another zero-context agent cannot infer an older value.

### Current-truth hygiene

`HANDOFF.md` and the current-state portions of `STATUS.md` are **not append-only history**. Immutable history belongs in `work-log/`.

When a later validated event supersedes a current-state claim:
- rewrite or remove the stale claim in the same reconciliation slice;
- do not leave phrases such as "not started", "open PR", "next action", or "current baseline" active elsewhere when they are no longer true;
- historical checkpoints may remain only when explicitly labeled as historical/at-that-time evidence;
- before closing a reconciliation, search `HANDOFF.md`, `STATUS.md`, `TODO.md` and the audit crosswalk for superseded PR numbers, baselines, counters and next-action text.

A zero-context agent must not need to infer which of two contradictory "current" statements is newer.


## Start of every zero-context session

1. Synchronize with latest `main` and inspect recent commits/current Git state.
2. Read `AI_START_HERE.md`.
3. Read `AGENTS.md`.
4. Read `ENGINEERING_QUALITY.md`.
5. Read `HANDOFF.md` completely.
6. Read the active milestone in `TODO.md`.
7. Read `STATUS.md`.
8. Inspect the implementation/tests/CI referenced by the handoff.
9. Read only the relevant specs/evidence.
10. Read the newest relevant files under `work-log/` when recent rationale/evidence is needed; use root `WORK_LOG.md` only for older legacy history.
11. Continue the highest-priority unblocked action in `HANDOFF.md`.

Do not ask the user for a kickoff prompt or previous-chat summary when repository state already answers what to do. Ask only for genuine unresolved product decisions, required permissions, destructive approval, or physical Windows evidence that cannot be automated.

## Canonical files

- `AI_START_HERE.md` — universal zero-context bootstrap.
- `AGENTS.md` — durable engineering/product rules.
- `ENGINEERING_QUALITY.md` — mandatory quality/preflight/error-model standard.
- `HANDOFF.md` — exact current continuation state.
- `TODO.md` — ordered executable work; `[x]` means implemented and validated.
- `STATUS.md` — concise project-level truth and durable capability/architecture state.
- `work-log/*.md` — preferred immutable per-slice logs for all new work.
- `WORK_LOG.md` — legacy historical archive; preserve it and do not truncate/rewrite it.
- `docs/*` — specs, evidence and validation procedures.
- `prompts/*` — historical/slice-specific aids only; not required onboarding unless `HANDOFF.md` explicitly references one.

## Choosing work autonomously

1. If `HANDOFF.md` contains a **USER ACTION REQUIRED** blocker, do not fake that evidence or broaden past the blocker unless the handoff explicitly allows parallel work or the user explicitly instructs continuation.
2. Otherwise execute the first **NEXT AGENT ACTION**.
3. If handoff state is stale, reconcile it with actual code/tests/CI and correct the handoff first.
4. If no actionable handoff exists, take the first open item in the current `TODO.md` milestone whose prerequisites are satisfied.
5. Do not skip to a later milestone because it is easier or more visually rewarding.

The user should never have to relay one agent's explanation to another.

### User-directed autonomy / validation timing

Current user direction delegates ordinary implementation and validation sequencing to the agent. Do not stop merely because a routine validation boundary was reached. Batch compatible checks when later work is independent; run targeted automated validation before dependent work when a failure could invalidate the next slice or materially worsen failure isolation. Apply the claim/invalidation protocol in `docs/CI_VALIDATION_STRATEGY.md`: preserve unaffected evidence, batch dependency-safe source fixes before expensive candidate CI/builds, and reuse an unchanged exact-head artifact for compatible deferred manual checks instead of rebuilding by habit. Manual Windows checks may remain open for a later consolidated session when safe.

Do **not** spend the session repeatedly polling the same active build/candidate with no state change. Record the exact head/run once, continue dependency-safe implementation/analysis/documentation, and re-check only after substantive progress, when the CI result is required to choose the next safe action, or when new evidence/user input indicates completion. A long-running build is not a reason to idle.

If user input is genuinely required, state the concrete constraint, viable options, the recommended path, and its rationale. A historical handoff instruction that demanded fresh permission solely to begin ordinary tests/CI is superseded by this policy; destructive/external actions and physical-only evidence remain separate approval/observation boundaries.

## User progress reporting

Use the compact progress format, counter semantics, and reporting cadence in `AI_START_HERE.md`. Derive all counters from current `TODO.md` and `HANDOFF.md`; physical gates do not close from compilation or static contracts. Keep detailed evidence in immutable work logs instead of repeating it in progress messages.

The mandatory roadmap milestone denominator remains **10** while optional Milestone 11 is dormant or skipped. **Milestone 11 exists but is strictly opt-in and is excluded from progress until the user explicitly activates it.** On explicit M11 activation, record that activation durably and change the progress denominator to **11** from that point onward. The required Final Comprehensive Review Stage is separate from the milestone denominator: it runs after Milestone 10 when M11 is dormant/skipped, or after completed M11 when M11 was explicitly activated.

### Hard Milestone 10 release-candidate entry gate

Milestone 10 is a **hard sequential release-candidate gate**. Do not begin, count, or mark any M10 validation while any required Milestone 1–9 work remains open on authoritative `main`, including:
- reopened milestone items whose acceptance basis was invalidated by replacement code;
- any unresolved `FIX_NOW` implementation route for M1–M9;
- required physical/manual Windows acceptance for M1–M9;
- required milestone-level source-parity correction or direct comparison gate for M1–M9;
- an active earlier-milestone source/config/test PR whose result can still change the release-candidate application.

Before the first M10 validation is allowed, reconcile `TODO.md`, `HANDOFF.md`, `STATUS.md`, the audit crosswalk, live PR/CI state and resulting `main` and record that every required M1–M9 gate is closed. Preparatory M10 tooling/tests may be authored earlier only when genuinely independent, but that preparation is **not M10 validation**, must not advance an M10 checkbox/counter, and must not be used to freeze a release candidate.

### Optional Milestone 11 hard opt-in gate

Milestone 11 is the optional **Live Blitzit Reference Audit** defined in `docs/BLITZIT_LIVE_REFERENCE_AUDIT.md`.

**M11 MUST NOT START, be prepared, be counted, or be inferred from general continuation instructions unless the user explicitly activates M11.** Commands such as `continue`, `keep going`, `finish the project`, or equivalent do not authorize it. Completion of M10 also does not authorize it.

While M11 is dormant:
- its TODO checkboxes do not represent open required work;
- it does not block release or the Final Comprehensive Review;
- the progress denominator remains 10;
- the normal continuation after validated M10 is the Final Comprehensive Review.

If the user explicitly activates M11:
- record the activation in current-truth tracking before starting;
- change the roadmap denominator to 11;
- require a validated M10 baseline first;
- follow the phase order in `docs/BLITZIT_LIVE_REFERENCE_AUDIT.md`: **PLAN -> CAPTURE EVERYTHING -> FREEZE CORPUS -> ANALYZE -> RECONCILE/PLAN -> IMPLEMENT -> REVALIDATE**;
- capture user-visible evidence and the observable client/backend/state contract on a synchronized timeline where legitimately available from ordinary authorized use;
- enforce a strict capture-phase analysis embargo: no Narro source/config/test changes, parity verdicts, crosswalk dispositions or remediation branches while the planned live-source campaign is still being acquired;
- complete/freeze the evidence corpus before substantive analysis; complete the full-corpus findings register and remediation plan before changing Narro;
- complete and validate any chosen M11 corrections before freezing the Final Comprehensive Review baseline.

The Final Comprehensive Review remains separately blocked until Milestone 10 is fully validated and its exact candidate SHA is frozen; when M11 is explicitly activated, Final Review is additionally blocked until M11 is complete and the post-M11 candidate SHA is frozen.

For every milestone completion report, include the milestone's **total source diff** in the exact compact form `+A/-B` lines. Compute it from the milestone's validated starting source SHA to its final validated source SHA. Documentation/tracking-only commits do not replace the validated source baseline and are excluded from this source-diff figure. Record the compared SHAs with the completion evidence so another agent can reproduce the count.

## Evidence and TODO discipline

Use precise levels:

- **implemented** — code exists;
- **compiled** — relevant build/check passes;
- **automated validated** — relevant tests/CI pass;
- **manual Windows validated** — behavior was physically observed on Windows when required.

`[x]` is allowed only when the item's **current** required evidence exists. Keep partially complete parent tasks open and use nested checkboxes only for sub-parts that remain valid for the current implementation. When a replacement reopens an item, superseded PASS evidence must move to immutable work logs or explicit `Historical evidence:` prose; do not leave old `[x]` children underneath a reopened acceptance item if they no longer validate the replacement.

Compilation does not prove taskbar, monitor, tray, shortcut, notification or other interactive Windows behavior.

## Evidence discovery

For any user-visible, source-parity, Blitzit-evidence, physical visual-validation, or broad multi-finding corrective task, read `docs/EVIDENCE_ROUTING_MAP.md` before choosing which evidence/spec files to trust, then apply `docs/DEEP_ANALYSIS_IMPLEMENTATION_WORKFLOW.md`. Older 19/19 trackers are historical prior-pass coverage; `docs/BLITZIT_FORENSIC_PASS3_TRACKER.md` is the only current exhaustive-source counter.

For broad corrective campaigns, do not alternate mechanically between one shallow finding and one immediate patch. Analyze the dependency-safe finding set to a durable disposition/cause map first, while allowing already-evidenced independent branches/CI to progress in parallel. Motion-dependent findings require actual video review at the needed continuous interval; static probes/transcripts/action manifests do not establish motion parity. Visual review must cover the relevant state/composition/geometry hierarchy rather than a general aesthetic glance.


A physical/native validation agent (including Codex) must not promote a Windows PASS into a Blitzit visual-parity PASS unless the check explicitly consumed the relevant canonical Pass-3/calibration evidence.

## Blitzit source-analysis handoff

The forensic/source-analysis track and the implementation track remain separate. Their mandatory handoff is defined in `docs/BLITZIT_PARITY_RECONCILIATION_WORKFLOW.md`.

Key synchronization rules:

- a forensic agent records source truth and does not patch implementation;
- an implementation agent consumes canonical `SOURCE_COMPLETE` findings rather than repeating raw-media analysis;
- a reconciliation step updates the audit crosswalk and affected roadmap/tracking before an evidenced discrepancy is implemented or a user-visible milestone is closed;
- new high-confidence contradictions to an already-built surface are reconciled immediately rather than waiting for 19/19 Pass-3 completion;
- if materially relevant source videos for a surface are still OPEN, nonvisual/domain/API work may continue, but final visual/interaction parity for that surface remains open;
- M10/final review re-verifies original references and accepted parity; it is not the first parity comparison.

Do not change milestone denominators merely to represent an evidence gate. Add a non-counting acceptance/gate note unless a genuinely new executable top-level milestone item is intentionally added and the denominator is explicitly reconciled.

## Parallel implementation overlap preflight

Before starting or continuing more than one implementation branch concurrently:

- compare the expected changed-file sets and shared authorities for the active branches;
- classify overlap as **none**, **soft/mechanical** (for example shared module/command registration with independently reasoned semantics), or **hard/semantic** (shared state authority, algorithm, schema, high-risk helper, or behavior whose correctness depends on merge order);
- **none** may proceed normally in parallel;
- **soft/mechanical overlap** may proceed in parallel only when the merge order is recorded, the later branch is explicitly expected to reconcile onto the resulting `main`, and exact-head validation is run only after that reconciliation;
- **hard/semantic overlap** remains sequential unless the repository records a stronger evidence-backed reason that makes the interaction safe;
- do not describe branches with any shared source file as fully independent without recording why the overlap is mechanically safe;
- a required rebase/reconciliation caused solely by an earlier planned merge is a coordination event, not an implementation failure. Record it separately from compile/test/CI failures.

This preflight supplements dependency analysis; it does not prohibit useful parallelism merely because two branches touch a common registration or glue file.

## Pre-CI discipline

Before every source/config push that will trigger Windows CI:

1. review the actual candidate diff;
2. run the strongest meaningful local checks available in the environment;
3. prefer `npm run preflight` when Node dependencies and Rust toolchain are available;
4. otherwise run the valid subset (`check:config`, frontend build/type check, Rust fmt/check/clippy/tests where possible) and record unavailable checks as `NOT RUN`;
5. fix known local failures before pushing;
6. prefer building/reviewing a coherent slice off `main`, then advance `main` once so one source slice causes one Windows CI run;
7. before opening that CI, look ahead within the active milestone for other **independently evidenced, compatible, unblocked** changes that can safely share the same validation run; implement those in the same branch/PR with their tests instead of creating a sequence of micro-PRs;
8. do not enlarge a batch merely to increase line count: exclude unrelated milestones, speculative cleanup, architecture changes without evidence, and any work whose correct implementation depends on the pending CI/manual result;
9. never use CI as a blind syntax/formatting probe when the equivalent local tool is available.

Windows CI is the reproducible second gate. Inspect the real failing step/log before changing code or rerunning. Do not retry a deterministic failure without a corrective change.

### Short-lived integration and manual gates

Follow `docs/CI_VALIDATION_STRATEGY.md`.

When a coherent implementation PR is exact-head automated-green and the only remaining requirement is physical/manual observation, merge it with an expected-head guard instead of keeping a long-lived integration branch open. Keep the affected TODO/milestone gate OPEN until physical evidence exists.

If physical validation later fails, branch narrowly from current `main`, fix the evidenced defect, validate/merge that corrective slice, and rerun the affected manual gate. Do not rebuild the entire milestone branch or replay unrelated validated work.

A branch that has already accumulated a validated source generation must not become the container for successive future generations merely because the milestone is still open.

After an expected-head guarded merge, compare the validated PR-head Git tree with the resulting main tree. If they are identical, the exact-head CI validates that source tree; do not manually dispatch another equivalent CI run. An automatically triggered duplicate main run may be cancelled after identity is proven when the validated PR artifact is suitable for any pending Windows test. Record that cancellation, and identify the PR artifact precisely. If the trees differ, validate the resulting main before claiming its source is covered. Physical Windows behavior still requires observation.

### Documentation/process changes go directly to main

Authoritative implementation instructions and tracking must not remain stranded on a feature branch.

When a change is **documentation/process/evidence-only** and does not alter runtime, build, test, packaging, dependency or CI semantics:
- write it directly to `main` with a normal forward commit; do not create a documentation-only feature branch or PR;
- Markdown is already ignored by Windows CI through `paths-ignore`. For non-Markdown evidence-only artifacts (for example sanitized `work-log/evidence/**` captures), use a direct-main commit message containing `[skip ci]` so the push does not start Windows CI;
- update `HANDOFF.md`, `TODO.md`, `STATUS.md`, `AGENTS.md`, `AGENT_WORKFLOW.md`, `AI_START_HERE.md`, relevant `docs/*.md`, and new immutable `work-log/*.md` entries on `main` as soon as that truth is established;
- do **not** run Windows CI for the documentation-only commit;
- do not change the validated application source baseline because of that commit;
- if an implementation branch is active, treat `main`'s process/spec/tracking files as authoritative and sync/reconcile the branch before source work continues rather than letting the branch become a second source of process truth.

A change is **not documentation/evidence-only** merely because it is not application code. These remain source/validation-affecting and use the normal branch/PR/preflight/CI discipline:
- `.github/workflows/**`;
- `scripts/**` and executable test harnesses;
- `package.json`, lockfiles, Cargo manifests/toolchain files;
- Tauri/app/capability/runtime configuration;
- migrations, schemas, generated manifests;
- fixtures/assets consumed by build, tests, packaging or runtime;
- any file whose content is parsed or enforced by build/test/CI/runtime tooling.

If repository permissions ever block direct commits to `main`, use the narrowest documentation-only PR as a fallback and merge it promptly without Windows CI; record that branch-protection exception.

Documentation-only commits should not consume Windows CI unless they affect build/test semantics.

## Work-log protocol

For every new coherent implementation/validation slice, create one **new immutable** Markdown file under `work-log/` following `work-log/README.md`.

Suggested name:

`YYYY-MM-DD-HHMM-agent-short-slice.md`

Each entry records:

- agent/tool;
- milestone/slice;
- reachable commit SHA(s);
- material changes;
- decisions/reasoning;
- exact local preflight/build/CI/manual evidence with PASS/FAIL/NOT RUN;
- measurements when relevant;
- TODO/STATUS/HANDOFF changes;
- blockers;
- exact continuation point.

Never overwrite another work-log entry. Corrections get a new file. Root `WORK_LOG.md` is legacy history and must not be truncated or replaced.

## HANDOFF.md protocol

Keep `HANDOFF.md` short and operational. It must clearly contain:

- current milestone/slice;
- current compact user-facing progress line (or the authoritative source values needed to derive it), including active milestone/roadmap size, active small-slice progress, and active-milestone top-level TODO progress;
- verified baseline/artifact/commits when relevant;
- what is proven vs merely implemented;
- `NEXT AGENT ACTION`;
- `USER ACTION REQUIRED` or `None`;
- blockers/NOT RUN evidence;
- important files;
- temporary diagnostic warnings where relevant.

When a user test is pending, include exact artifact/run/build identity so an old binary cannot be confused with a new one.

## CI and Windows user testing

Use automated Windows CI for reproducible compilation/tests. When a behavior genuinely requires an interactive Windows desktop:

1. implement the narrowest testable path or coherent batch whose members are independently safe;
2. run local preflight before pushing;
3. keep CI green;
4. produce a clearly identified downloadable artifact when practical;
5. document a short exact manual procedure;
6. ask the user only for observations automation cannot provide;
7. record returned PASS/FAIL evidence in the repository;
8. fix failures before broadening work when the physical result is needed to determine the next safe implementation.

### Manual-test batching

A pending physical Windows gate is not automatically a stop condition.

For interactive Windows validation, choose the evidence method that best fits the scenario; OBS/video is optional, not mandatory. Prepare compatible checks before a substantial session and prefer related/paired observations close together when useful. During continuous capture, avoid unnecessary long source-reading/debugging gaps when they add no evidence, but allow intermediate probes, tool changes, state inspection or adaptive diagnostics whenever they materially improve evidence quality or are required for the next safe step. Analyze completed capture segments and batch compatible fixes where practical. This is an efficiency guideline, not a prohibition on evidence-driven adaptation. M11 remains stricter and follows its dedicated whole-corpus phase separation.

- If the manual result would determine the next implementation, could invalidate dependent work, or protects a correctness/safety boundary, stop at that gate and obtain the evidence before continuing.
- If later work is independently evidenced and safe regardless of the pending observation, continue implementing it while keeping the manual gate explicitly OPEN.
- Batch compatible physical checks into one consolidated Windows session on the latest relevant artifact when that avoids redundant user testing.
- If a later source change supersedes an earlier physical candidate, prefer testing the latest build against the combined still-relevant acceptance matrix rather than asking the user to repeat obsolete intermediate builds.
- Automated CI, static contracts, screenshots, or inference never convert a deferred physical gate into PASS.
- Do not end an implementation session merely because one CI run or merge finished when another unblocked repository-recorded action is available; continue and send concise progress updates instead.

The user's Windows PC is primarily a **test bench**, not where ordinary code must be written.

## Git discipline

- synchronize with latest `main`;
- make coherent forward commits;
- preserve unrelated/concurrent user work;
- do not amend/rebase/force-push published `main` during normal handoff work;
- verify actual CI results before claiming success;
- keep referenced SHAs reachable.

Before stopping:

1. commit/push intended changes;
2. run/record available validation;
3. update evidence-backed TODO checkboxes;
4. create a new `work-log/*.md` entry;
5. update `STATUS.md` if project-level truth changed;
6. rewrite `HANDOFF.md`;
7. ensure no required continuation context exists only in chat/local files.

### Authoritative-main merge preservation

Implementation branches may be older than current documentation/process truth on `main`. Before merging any implementation PR:

1. fetch current `main` and list the PR's changed filenames;
2. if the PR does **not** change authoritative current-truth/evidence Markdown, a normal merge does not replace those newer `main` files; do not rebase merely to copy documentation into a code-only branch;
3. if the PR **does** change any authoritative current-truth/evidence file, compare that patch against current `main` and reconcile it before merge — never accept an older branch copy merely because the PR head passed CI;
4. preserve the intentional branch contribution while retaining all newer unrelated `main` truth; if reconciliation changes executable/test/config files, repeat the required exact-head validation;
5. after merge, re-read the affected authoritative files from resulting `main` and confirm no current continuation/evidence state regressed.

Protected current-truth families include at minimum:
- `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, `STATUS.md`;
- `docs/EVIDENCE_ROUTING_MAP.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, `docs/UI_UX_SPEC.md`;
- current `docs/BLITZIT_FORENSIC_*`, `docs/BLITZIT_PARITY_*`, `docs/BLITZIT_VISUAL_*` evidence/coordination files.

An expected-head merge guard protects the validated PR head from an unvalidated branch update; it does **not** replace this semantic stale-document check.

### Branch and tracking hygiene

- Do not create tracking-only PRs under normal conditions. Authoritative documentation/tracking changes go directly to `main` under the rule above.
- If branch protection forces a documentation-only PR fallback, keep it narrow and merge it promptly; do not let multiple tracking-only PRs accumulate.
- After a PR is merged or an abandoned line is conclusively superseded, delete its remote feature branch when it has no open PR and no unique unmerged work that must remain reachable.
- Temporary `noop`, `tmp-*`, CI-probe and superseded experiment branches must not accumulate indefinitely.
- Never delete `main`, an open-PR branch, a branch containing intentionally preserved unique work, or a branch whose status has not been verified.
- If the available GitHub tooling cannot delete refs, record that limitation plus the verified cleanup procedure for the user instead of pretending branch cleanup occurred.

A handoff is complete only when a different AI with repository access alone can continue correctly.

## Decisions and deviations

Specs and architecture docs include proposals, not infallible commands. A better implementation may replace a proposal when it preserves product/correctness intent and is supported by evidence.

For material deviations, record reasoning/evidence in the work log, update `STATUS.md` if it becomes durable truth, and update affected specs/TODO when the old direction would mislead future agents.

Never silently change explicit user decisions, local-only scope, data-integrity invariants or confirmed product semantics.

## Milestone 1 rule

Milestone 1 validates Windows/Tauri/WebView2 capability and performance; it is not polished product UI. Temporary diagnostic controls are acceptable. Do not start polished UI or Milestone 2 while a blocking M1 validation remains in `HANDOFF.md`.
