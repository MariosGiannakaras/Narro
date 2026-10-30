# Narro Multi-Agent Workflow

Narro is maintained so different coding AIs can alternate without prior chat context. **The repository is the handoff medium and must be sufficient by itself.**

`AGENTS.md` remains authoritative for durable product/scope/correctness rules. `ENGINEERING_QUALITY.md` is authoritative for implementation quality, error handling, robustness, validation and pre-CI discipline.

## Narro Windows test-data policy — current user decision 2026-10-30

The user confirmed there is **no real Narro personal data to protect**. PA-01–09 uses the **ordinary Windows profile and regular Narro data paths**, treating all Narro-created tasks, sessions, preferences and positions as disposable test data. Agents may create/edit/delete/reset **Narro-only** data when a case needs a clean start (only with Narro stopped), and must retain data for persistence/restart tests. Do not introduce isolated Windows accounts, special temporary databases, prophylactic backups, or consent gates for this Narro-only data. Maintain exact EXE SHA, PID/path provenance and per-case evidence; do not touch unrelated files, registry/OS/hardware or installers outside their actual scenario safeguards. Any older repository references to mandatory isolated profiles/backups for normal PA are historical, not current directions.

## Programming vs physical Windows ownership (2026-10-08 user direction)

- The ChatGPT implementation track owns source/config/tests, source-backed UI/behavior remediation and automated validation through GitHub PR/CI. It may work on dependency-safe `FIX_NOW` items while manual gates remain OPEN; it must never mark those gates PASS from CI.
- The separate Codex physical-Windows track owns real Windows interactions, recordings, native/visual analysis and evidence-backed failure reports. **ChatGPT remains the implementation owner for source/config/tests and corrective PRs**, including corrections motivated by Codex observations, unless the user's latest instruction explicitly reassigns source ownership. Codex may make source fixes **only under that explicit reassignment**, never by inferring coding rights from physical ownership. Reuse accepted evidence; do not presume an unobserved Codex session is running.
- Share only via current `HANDOFF.md`, `TODO.md`, `STATUS.md`, crosswalk and immutable work logs. Before source PR edits/rebases/merge, check the current branch/PR/CI and the other track's ownership; code fixes grounded in physical failures need coordinated handoff. The latest user's explicit ownership direction and current HEAD supersede any historical instruction making a physical session the sole next action.
- An exact-head automated-green slice is normally eligible for guarded integration even if a *purely observational* physical gate remains OPEN. **Exception:** a current, individually justified physical-before-merge hold (documented native FAIL for the same changed compositor/feature, replacement regression risk, and a current active decision/owner) must be obeyed until its listed evidence is met or the hold is expressly retired after a fresh risk review. Current PR389 **and dependent PR419** have independent strict compositor `PHYSICAL_BEFORE_MERGE` holds; this is not a blanket ban on merging unrelated PRs.
- Report user-facing progress for the ChatGPT track as **actual source implementation batches** at their proven state (in progress, CI pending, green, merged); never use accepted roadmap milestone counts as a substitute. Do not invent a stable coding-work denominator.

## Repository state overrides conversational memory

The latest authoritative repository state on `main` always outranks chat history, cached summaries, or a previous agent's remembered checkpoint. Keep **validated application source baseline** distinct from newer documentation/process truth: documentation-only commits may advance `main` without changing the validated source SHA.

On a **genuinely new coding chat without enough current context**, read the bootstrap and relevant current `HANDOFF.md`, active `TODO.md`, relevant `STATUS.md`, newest needed immutable `work-log/*.md` evidence and open PR/CI state **once**. On an **existing chat, interruption or continuation**, do **not** rebootstrap or reread whole trackers: inspect the last actual operation/result, then the narrowest live PR/head/CI/changed-file evidence needed to resume safely. If an interrupted write may have landed, verify its side effects before retrying. Apply `AI_START_HERE.md` → *Resume-in-place fast path*; the latest user instruction, verified GitHub state and relevant current main tracking prevail over remembered/historical checkpoints. Expand reads only for a real conflict or missing dependency.

Never decrement a previously validated user-facing progress counter merely because an older conversational checkpoint was loaded. **Exception:** when current evidence or a replacement implementation invalidates the acceptance basis of previously validated milestone items, reopen exactly that affected scope and reduce the current progress counters to repository truth, preserving the old PASS as historical evidence. The small progress counter may reset only when a genuinely new implementation slice has explicitly begun. When resetting it, state the new slice and denominator in the same update and ensure `HANDOFF.md` records either the latest completed slice progress or the currently active slice progress so another zero-context agent cannot infer an older value.

### Current-truth hygiene

`HANDOFF.md` and the current-state portions of `STATUS.md` are **not append-only history**. Immutable history belongs in `work-log/`.

When a later validated event supersedes a current-state claim:
- rewrite or remove the stale claim in the same reconciliation slice;
- do not leave phrases such as "not started", "open PR", "next action", or "current baseline" active elsewhere when they are no longer true;
- historical checkpoints may remain only when explicitly labeled as historical/at-that-time evidence;
- before closing a reconciliation, search `HANDOFF.md`, `STATUS.md`, `TODO.md` and the audit crosswalk for superseded PR numbers, baselines, counters and next-action text.

A zero-context agent must not need to infer which of two contradictory "current" statements is newer.


## Active work phase checkpoints — truthful repository visibility (binding; 2026-10-16)

`HANDOFF.md` is the **single canonical current-work record**, not a real-time process monitor. Another agent can know only the **last pushed/verified checkpoint** plus live GitHub PR/CI state; no repository-only mechanism can determine whether an unreported local Codex recording, analysis or edit is currently running, stopped or hung. **Never present a stale checkpoint as live activity.** Do not add a competing progress tracker or change historical immutable logs.

At a **safe transition before starting a substantial phase**, record one compact top-of-`HANDOFF.md` active-work entry with:
- named owner/track, exact task and scenario/requirement IDs, phase `PREPARED | CAPTURING | FROZEN | ANALYZING | FIXING | TESTING | CI_WAIT | BLOCKED | DONE` and **last reported UTC timestamp** (meaning "last observed/pushed", *not* guaranteed current activity);
- exact branch/PR/head SHA/validated executable/CI run ID when applicable; for local capture, the owned session/evidence root and safe artifact pointer (no personal paths/secrets beyond already documented permitted context);
- **last completed atomic operation and evidence identity**, bounded progress `x/y` only for the defined active batch, current blocker/uncertainty, protected in-flight resources, and **one next safe operation** if the session stops;
- whether the next operation can be resumed in place or requires first checking local process/OBS status, partial artifacts and source/DB backup/restore state.

After a **meaningful phase boundary or durable completed group**, publish an updated checkpoint when safe; for source work, use the existing PR/CI and HANDOFF identity without unrelated duplicate commits. **Do not inject GitHub commits/checkpoints into a continuous evidence recording, violate the capture-phase analysis embargo, restart a recording, touch unrelated application data or introduce a second session just for status visibility.** During such acquisition keep a local factual timestamp/action journal if already permitted by its capture protocol; publish the result and updated `HANDOFF.md` at the next safe stop/freeze or documented capture boundary. If a task is interrupted between pushes, the repository may be behind reality; the resuming agent must first inspect actual owned local processes, files and evidence safely **before** repeating anything.

Interpret remote observations conservatively: `CI_RUNNING` means GitHub confirms a remote job (not local Codex activity); `CAPTURING` is the **last declared phase** until corroborated by current runtime/evidence; no recent commit or expired timestamp alone establishes `stopped` or `hung`. Label unverified current liveness **UNKNOWN**. This protocol improves recovery, not continuous telemetry and not permission to activate optional M11/M12.

## Resumed-turn continuity and anti-duplication protocol (binding)

**Distinguish a new zero-context takeover from a continuation of an ongoing task.** A user follow-up, "συνέχισε", "κόλλησες" or "ολοκλήρωσες;" does not erase an existing branch/PR/CI task or require the full onboarding discovery again. The latest user request overrides normal repo access: if it explicitly forbids repository inspection, do not query GitHub for that request. The next explicit repo-work request may authorize it again.

**Resumption state machine (minimal live check, then action):**

| Last confirmed state | Next permissible action | Prohibited repeat |
| --- | --- | --- |
| Tool call interrupted or result absent | Read exact target commit/branch/PR/run to determine whether side effects already happened; only retry if absent with current SHA guard | Assuming failure or duplicating a completed write/PR/merge |
| Existing branch/PR + exact CI RUNNING | Record run ID/head/known active gate and do independent non-overlapping work; re-check when a result is needed or substantive time/work has passed | Repeated identical status calls, new branch for same slice, speculative code changes |
| Exact PR-head CI FAIL | Fetch actual first failing job, step and logs; classify root and apply minimal evidence-backed fix to existing PR, add/adjust regression coverage; replacement head gets its own full CI | Guessing, weakening tests, passing historical failed SHA |
| Exact PR-head validation/fast/Windows 3/3 PASS | Reconfirm current head, ownership, mergeability **and any documented per-PR `PHYSICAL_BEFORE_MERGE` hold**. If none, guarded merge and resulting-main validation; if held, arrange its required exact-source native evidence or documented risk retirement while keeping PR unmerged | Automatically merging a high-risk physically failed compositor replacement solely from CI, or needlessly holding ordinary independent green PRs |
| PR merged, resulting-main CI RUNNING | Reconcile current handoff immediately; verify latest run when ready; perform safe independent work meanwhile | Treating PR or prior artifact as latest package acceptance |
| Resulting-main CI 3/3 PASS | Verify actual required package/artifact identities, update tracking/current candidate where required, then move to first unblocked TODO dependency | Ending on CI green alone or silently treating native physical checks as passed |
| All permitted work truly blocked | Say exactly what is blocked by which authorization/evidence and preserve one next action; do not start optional M11/M12 | Endless polling, invented PASS, unnecessary escalation |

On **every resumed turn**, consult last concrete results before broad repository reads; scope GitHub calls to the last known SHA/PR/run and relevant current `main`. If another chat/agent has advanced the same task, use the newer verified state, not earlier chat history. Never overwrite current `HANDOFF.md` tracking with an older feature-branch copy.

**Evidence discipline:** source implementation, exact PR CI, guarded merge, resulting-main CI/artifacts, native Windows PA and confirmed current Blitzit parity are separate claims. Do not change the denominator of a user-facing bounded coding counter without defining a genuinely new scope. Closed milestones require their actual physical gates; M11 remains strictly dormant unless specifically activated.

**Status/reporting discipline:** user-visible updates require a new, supported result or a genuine blocker. Do not write progress messages that just say "checking", "thinking", "inspecting" repeatedly. For "ολοκλήρωσες;" start with ΝΑΙ/ΟΧΙ/ΜΕΡΙΚΩΣ and the exact remaining work; for "κόλλησες" resume the precise last step. Before ending, the topmost `HANDOFF.md` section must be a **single authoritative NOW / NEXT** with exact identifiers and an unambiguous executable operation; stale current sections become historical or are replaced. Never claim monitoring continues after the active tool session ends; future notifications require an expressly scheduled task.

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

## User-choice checkpoint for material product alternatives (2026-10-27)

Before implementing a user request with **two or more viable, materially different user-visible approaches**, follow the binding `AGENTS.md` **Critical product partnership** and `ENGINEERING_QUALITY.md` decision-quality requirements: assess the user's outcome and verified constraints, surface the relevant choices and trade-offs, state your recommendation, then **ask the user to select the product/UX behavior before implementing it**. A recommended default does **not** substitute for that choice. Typical forks include Timer location **current-run vs across restarts vs configurable**, changed failure handling, navigation, visual treatment, and persistence policies. Record an actual selection in the relevant specification/tracking and validate it; do not silently treat agent inference as user approval.

Do **not** seek permission for equivalent internal implementations that satisfy the same already-agreed user-visible result, repeat previously resolved choices without new evidence, or stall safe independent tasks/ongoing CI while awaiting a material decision. Keep the decision question short, concrete and comparative; user scope and explicit prerequisite approvals remain binding.

## Choosing work autonomously

1. If `HANDOFF.md` contains a **USER ACTION REQUIRED** blocker, do not fake that evidence or broaden past the blocker unless the handoff explicitly allows parallel work or the user explicitly instructs continuation.
2. Otherwise execute the first **NEXT AGENT ACTION**.
3. If handoff state is stale, reconcile it with actual code/tests/CI and correct the handoff first.
4. If no actionable handoff exists, take the first open item in the current `TODO.md` milestone whose prerequisites are satisfied.
5. Do not skip to a later milestone because it is easier or more visually rewarding.

The user should never have to relay one agent's explanation to another.

### User-directed autonomy / validation timing

Ordinary source pushes, proportionate CI and safe merges after the required exact-head checks are authorized without renewed user permission. While CI runs, continue useful dependency-safe work. Interpret a request to avoid spending time waiting for CI as a sequencing preference; apply any later explicit user deferral to its stated scope. Do not invent a general CI prohibition from that preference.

Current user direction delegates ordinary implementation and validation sequencing to the agent. Do not stop merely because a routine validation boundary was reached. Batch compatible checks when later work is independent; run targeted automated validation before dependent work when a failure could invalidate the next slice or materially worsen failure isolation. Apply the claim/invalidation protocol in `docs/CI_VALIDATION_STRATEGY.md`: preserve unaffected evidence, batch dependency-safe source fixes before expensive candidate CI/builds, and reuse an unchanged exact-head artifact for compatible deferred manual checks instead of rebuilding by habit. Manual Windows checks may remain open for a later consolidated session when safe.

Do **not** spend the session repeatedly polling the same active build/candidate with no state change. Record the exact head/run once, continue dependency-safe implementation/analysis/documentation, and re-check only after substantive progress, when the CI result is required to choose the next safe action, or when new evidence/user input indicates completion. A long-running build is not a reason to idle.

If user input is genuinely required, state the concrete constraint, viable options, the recommended path, and its rationale. A historical handoff instruction that demanded fresh permission solely to begin ordinary tests/CI is superseded by this policy; destructive/external actions and physical-only observation remain distinct safety/evidence boundaries; The newer 2026-10-27 user decision makes routine PA-01–09 native physical acceptance **ACTIVE**: batch dependency-ready checks with compatible analysis/pre-physical evidence and exact-head CI, without case-by-case permission. Other safe source/CI work can continue while Windows access is pending; invasive personal-profile/OS/hardware actions still require separate safeguards/consent.

## Shared-surface scenario validation and evidence reuse (binding; 2026-10-16)

**One natural user journey may validate several requirements on the same component, across M5–M9 when applicable.** Do not plan one Windows capture, artifact, or manual replay per TODO checkbox by default. This is evidence deduplication, **not** permission to merge acceptance claims or bypass independent validation gates.

1. **Resume the already-owned operation first.** On a continued/interrupted run, verify the last actual interaction/tool side effect, recording/session state, exact candidate, active PID/profile ownership, current PR/CI and most recent durable checkpoint before doing anything new. Do not restart an existing recording, replay an accepted scenario, create a second process, mutate unrelated application data or create a competing branch. If capture is already running, follow its frozen script and preserve its capture/analysis embargo; apply improved grouping only at a safe planned transition or after capture freeze, never by disrupting the running session.
2. **Group by surface + shared prerequisites + action/state lifecycle**, not by milestone headings or checklist order. Before planning new acquisition or validation, map the *unaccepted* requirement IDs (including compatible M5/M6/M7/M8/M9 claims) to real user journeys. Combine, when reachable with the same authorized build, actor, state, theme/DPI and dataset: resting appearance and source comparison; hover/focus/keyboard/disabled affordances; action and visible feedback; resulting authoritative/persisted state; cancel/reopen/error/recovery; and any relevant cross-surface projection. Preserve independent scenarios for incompatible states, different candidate builds, separately required native environments or higher-risk prerequisites.
3. **Use one evidence session, many separately graded claims.** Create/maintain a small traceability matrix for each grouped journey: scenario/session ID, exact source SHA + executable/artifact, requirement IDs, expected outcome *per claim*, observation type (UI/interaction/state/keyboard/source parity), frame/time/log or test reference, result **PASS / FAIL / OPEN / NOT RUN**, and which next step depends on a failure. A single video, screenshot or log segment may support multiple requirements **only when it directly demonstrates each one**; evidence of a visible button never alone establishes its functional correctness, persisted outcome, native acceptance or Blitzit parity. Leave unobserved subclaims OPEN, even when nearby behavior passed.
4. **Reuse previously accepted evidence before asking for new tests.** Check whether an exact candidate or unchanged affected path already has valid scenario-level proof. Do not recapture valid states, exhaustively replay approved components (Spectrum Core picker, upload, 218 icons) or rerun entire milestone suites merely to satisfy a new grouping. Retest only invalidated dependencies, missing criteria, confirmed failures, and inherently new release-candidate gates; if a shared code change invalidates several claims, record exactly which ones and why.
5. **Analyze and repair by shared cause.** Freeze an in-progress acquisition corpus before substantive analysis when its capture plan requires this. Afterward triage multiple observations together (shared state owner, renderer, CSS, IPC, persistence). Batch compatible, evidence-backed fixes and regression tests through the normal branch/PR/exact-head CI/merge/resulting-main gates; do not batch unrelated risks merely because they were recorded in one session. Reuse the corrected candidate for multiple relevant follow-up acceptance checks. Record every FAIL and its narrow required replay without resetting earlier unrelated PASS.

**Dated M5 example, not a standing active instruction:** the 2026-10-16 G1–G8 grouped native plan in `work-log/2026-10-16-m5-remaining-batched-capture-plan.md` remains historical scenario evidence. Its then-current restrictions are historical, not authority for a new session. Follow live HANDOFF for the next native acceptance stage and reuse prior evidence only where valid; the earlier `USER-PAUSED` override is itself superseded by the user's newer 2026-10-27 **ACTIVE PA-01–09** direction; retain dated evidence, special native holds and independent M10 gate.

## User progress reporting

Use the **active-task-only** progress format and cadence in `AI_START_HERE.md`. Derive a bounded fraction from evidence only if useful and requested; never routinely repeat the completed historical U-item/local-gap totals. Physical Windows gates do not close from compilation or static contracts. Keep detailed evidence in immutable work logs.

**The mandatory roadmap always has 10 milestones**, reported as mandatory acceptance independent of optional stages. M11 (live Blitzit research) and M12 (in-app user QA) each require **separate explicit user activation** and valid prerequisites. If the user expressly asks for an expanded all-activated-stage denominator, count 10 plus only the expressly activated optional stages (11 for exactly one; 12 for both), clearly distinguishing mandatory and optional. Neither activates the other; the required Final Comprehensive Review is a separate gate after M10 plus any activated M11/M12 in dependency order.

### Evidence-limited source visuals vs required parity closure (2026-10-09)

The user directs **unknown, unobserved Blitzit visuals** to the separate optional live-source M11, if explicitly activated later. A source-visual question classified `EVIDENCE_LIMIT / M11_DEFERRED` with no available canonical evidence is **not** a missing in-scope source code implementation or reason to keep the consolidated Narro Windows physical run blocked. It can remain visibly unresolved for future M11 without a false `SOURCE_PARITY_PASS` claim. **This exemption does not cover any known, evidenced visual/interaction mismatch, real functional defect, or required Narro native/manual acceptance gate**: those retain normal M1–M9 correction and M10 entry requirements. Document each disposition in the crosswalk and register, never silently downgrade a supported `FIX_NOW`. Keep M11 strictly dormant until explicit user activation.

### Hard Milestone 10 release-candidate entry gate

Milestone 10 is a **hard sequential release-candidate gate**. Do not begin, count, or mark any M10 validation while any required Milestone 1–9 work remains open on authoritative `main`, including:
- reopened milestone items whose acceptance basis was invalidated by replacement code;
- any unresolved `FIX_NOW` implementation route for M1–M9;
- required physical/manual Windows acceptance for M1–M9;
- required milestone-level source-parity correction or direct comparison gate for M1–M9;
- an active earlier-milestone source/config/test PR whose result can still change the release-candidate application.

Before the first M10 validation is allowed, reconcile `TODO.md`, `HANDOFF.md`, `STATUS.md`, the audit crosswalk, live PR/CI state and resulting `main` and record that every required M1–M9 gate is closed. Preparatory M10 tooling/tests may be authored earlier only when genuinely independent, but that preparation is **not M10 validation**, must not advance an M10 checkbox/counter, and must not be used to freeze a release candidate.

**M10 evidence-reuse / no blanket replay (2026-10-16 user decision):** After the hard entry gate closes, use M10 to reconcile the complete M1–M9 evidence against the exact release candidate, **not** to repeat every earlier accepted test. For each M10 acceptance claim, record the original evidence identity (source SHA, validated executable/artifact, CI run, native observation, environment and relevant canonical source comparison), its affected dependencies and whether subsequent changes invalidate it. Classify each claim as **valid evidence reused**, **new validation required**, or **accepted explicitly bounded limitation**; do not convert missing, incomplete or invalidated evidence into PASS. Re-run only missing/invalidated checks and checks inherently specific to the final release candidate or its install/upgrade/packaging/sign-in environment. A changed shared foundation invalidates the earlier claims it actually affects, **not** all prior milestones. Preserve mandatory exact-head/release-candidate automated gates, relevant integrated smoke, necessary real-Windows observations and final source/visual acceptance; deduplication must not weaken them. Keep each M10 TODO item open until their complete evidence-backed dispositions are recorded. Follow `docs/CI_VALIDATION_STRATEGY.md`.

**User approval remains an independent M10 hold (2026-10-26):** Closing the M1–M9 technical entry gate is **necessary but not sufficient**. Stop for the user's personal review of the exact M1–M9 candidate, full accepted PASS/FAIL/OPEN evidence and manual Windows instructions; do not commence M10 work or validation until the user explicitly approves the M10 transition. Continue legitimate M1–M9 remediation; generic `continue` or CI completion cannot waive approval. The documented M10 reuse/forensic commitments below do **not** activate M10.

**All accepted evidence is in scope for reuse, not just selected milestone examples (2026-10-26):** Before commissioning a new M10 test, inspect the complete accepted M1–M9 claim inventory and actual dependency impact. An accepted second HDMI hotplug test, for example, must **not** be run again merely because M10 lists monitor recovery. Carry forward its scoped physical PASS with identity and explicit `REUSED_VALID` disposition unless an affected monitor/lifecycle/packaging path, new regression or missing necessary claim warrants a precisely scoped rerun. A changed SHA does not automatically invalidate unrelated physical evidence; source/build changes that really alter a claim do. Final packaging/installation, upgrade and sign-in claims inherently absent from the original evidence still require their own actual acceptance. Preserve every accepted PASS independently and label its provenance.

**Distinct mandatory M10 deep-risk investigation (2026-10-26):** Supplement release-candidate functional checks with a final-production architecture/invariant coverage map, then forensic causal review of **relevant** Narro defect history, Git changes/PRs, recurrent CI first-failure logs, NER and Blitzit risk families, user-reported incidents and runtime/SQLite evidence. Trace high-impact code/state owners and failure paths, ask **how the defect could evade existing PASS**, and examine lifecycle, error/recovery, races/locks/poison/panics, IPC, transactionality, callbacks, stale state and local privacy/security. Exercise only justified isolated fault/negative/restart/concurrency/data-integrity probes. Record exact risk/evidence/result and nonproven causes; do not interpret historical green tests as proof of absence. Fix evidence-backed material issues through normal PR/CI/physical dependency gates; explicitly disposition unresolved high-impact risks. Reuse this M10 audit in the subsequent Final Comprehensive Review; only revisit invalidated findings. Consult `TODO.md` and `docs/CI_VALIDATION_STRATEGY.md` for the executable protocol.

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

## Corrective implementation cycle and mandatory deep pre-physical gate (2026-10-27)

For affected features requiring physical Windows acceptance, enforce **record → analyze → cause-led correction + regression → scoped deep pre-physical closure → exact-head automated validation → authorized physical acceptance → feedback into the risk register**. Iteration on a proven failure returns to causal analysis; do not apply another symptom patch or promote compilation/CI to physical PASS. Use the concrete five-part acceptance standard in `ENGINEERING_QUALITY.md` and the finding/disposition/evidence model in `docs/DEEP_ANALYSIS_IMPLEMENTATION_WORKFLOW.md`.

This is **deep inspection of the affected behavior and dependency fan-out**, including relevant error, concurrency, restart, native, visual and accessibility states; it is neither a blanket audit of the entire application nor the separate user-opt-in dedicated candidate-wide audit. Record the exact SHA, inspected versus uncovered states, related previous failures, regression results, pending physical probes and cross-milestone invalidations; reuse still-valid evidence. An agent assigned **workflow-only** changes may edit these authoritative process documents without taking ownership of another agent's source PR, source tests, current HANDOFF or milestone counts. Follow `docs/TRACKER_STATUS_INDEX.md` and coordinate only actual conflicts.

PA-01–09 are **ACTIVE in dependency-ordered M1–M9**. Pair the deep affected-surface analysis/pre-physical/relevant CI with compatible actual native acceptance in one Windows session when an exact candidate and operator are ready; independently grade each scenario. A physically blocking acceptance must be obtained before dependent changes/merge, while unrelated safe work may advance. No repeat case-by-case permission for ordinary isolated tests; unrelated AppData/OS/hardware changes retain separate protections; normal Narro AppData tests are expressly authorized. Preserve PR389/PR419 `PHYSICAL_BEFORE_MERGE` holds and M10's post-M9 user review/approval.

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

When a coherent implementation PR is exact-head automated-green and remaining physical/manual work is purely observational, **normally** merge with an expected-head guard and leave physical/milestone acceptance OPEN. **Do not automatically merge individually held candidates:** PR389's native compositor replacement is scoped `PHYSICAL_BEFORE_MERGE` after a prior exact-green build of the same surface **failed 4/8 native cases**, and its new implementation still lacks strict 8/8 replacement acceptance. Dependent PR419 has its **own independent strict 8/8 A/B comparator hold**, not transferred by PR389's CI or acceptance. Consult live HANDOFF/PR state for each exact head, cases and exit conditions. Remove each exceptional hold only on independently sufficient native evidence or a separately documented fresh risk decision; CI alone cannot retire them. Unrelated PRs retain the ordinary automated-green integration policy.

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

Use automated Windows CI for reproducible compilation/tests. When a behavior genuinely requires an interactive Windows desktop, routine PA-01–09 is already authorized once its exact candidate/dependency/CI prerequisites and operator are ready; protect unrelated AppData/OS/hardware and other separately consent-gated operations; ordinary Narro test data is authorized:

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
