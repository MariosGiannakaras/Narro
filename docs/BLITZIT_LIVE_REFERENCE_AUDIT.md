# Optional Milestone 11 — Live Blitzit Reference Audit

Status: **DORMANT / STRICTLY OPT-IN**.

This protocol defines the optional post-M10 live Blitzit audit. Its purpose is to observe the actual product interactively and capture both the user-visible experience and the **observable client/backend/state contract** that cannot be recovered reliably from curated screenshots, tutorials and recordings.

The audit is deliberately phase-gated:

`PLAN -> CAPTURE EVERYTHING -> FREEZE CORPUS -> ANALYZE -> RECONCILE/PLAN -> IMPLEMENT -> REVALIDATE`

**Do not collapse these phases. In particular, do not discover a difference during capture and immediately analyze or fix Narro.**

## Hard activation gate

**Do not start, prepare, count, schedule, or infer Milestone 11 unless the user gives an explicit instruction to activate M11 after the live Blitzit trial/reference environment is available.**

The following do **not** authorize M11:
- `continue`, `keep going`, `finish the project`, `continue to the end`, or equivalent general continuation language;
- completion of Milestone 10;
- completion of Final Comprehensive Review preparation;
- availability of the Blitzit installer, account, trial, subscription, recordings, screenshots or credentials;
- an agent deciding that more source evidence would be useful.

A valid activation must explicitly refer to Milestone 11 / the live Blitzit audit, for example: `Activate M11`, `Start Milestone 11`, or an unambiguously equivalent instruction.

If M11 is never explicitly activated, it is **skipped by design**, does not count as incomplete work, does not block release, and the normal path is:

`M1–M10 -> Final Comprehensive Review -> release closure`.

If M11 is explicitly activated, the path becomes:

`M1–M10 -> M11 capture campaign -> frozen corpus -> analysis/reconciliation -> Narro remediation/validation -> Final Comprehensive Review -> release closure`.

## Activation bookkeeping

When the user explicitly activates M11:
1. record the activation in `HANDOFF.md`, `STATUS.md` and a new immutable work log;
2. change the roadmap denominator from 10 to 11 for user-facing progress from that point onward;
3. record the exact validated post-M10 Narro source SHA that forms the initial M11 comparison baseline;
4. confirm the live Blitzit reference environment is available;
5. create the M11 capture plan before starting the first substantive live-source session.

While M11 remains dormant, the denominator stays 10 and none of its checklist items affect progress.

# Phase 0 — Reference-environment provenance

Before the capture campaign, record enough provenance to distinguish current live Blitzit behavior from older tutorial/reference evidence:

- Blitzit version/build if observable;
- observation date/time;
- Windows version and relevant display/DPI/monitor environment;
- trial/subscription tier and visible/relevant feature limitations;
- theme, locale, timer/preferences and other settings that materially affect the inspected state;
- whether the live evidence is created by direct Codex interaction, a user-made recording, or another explicitly identified capture path.

Do not silently treat newer live behavior as proof that older canonical evidence was wrong. Version-specific differences remain explicit evidence.

# Phase 1 — Plan the complete capture campaign

Build the capture agenda **before** substantive exploration begins.

Start from:
- current `TODO.md` and `HANDOFF.md`;
- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`;
- canonical Pass-3 video/screenshot/static-calibration records;
- known `AMBIGUOUS`, `VALIDATION_OPEN`, source-parity and evidence-limit routes;
- the final M10 Narro state.

The plan should cover all material in-scope product surfaces and transitions, not only known gaps. At minimum consider:
- fresh launch and normal navigation;
- list/lane/task create, edit, duplicate, move, reorder, complete, archive and delete;
- hover/focus/pressed/selected/disabled/pending states;
- menus, popovers, dialogs, tooltips and contextual controls;
- scheduling/recurrence/date/time interactions;
- Focus entry, queue, timer lifecycle, breaks, success/finish paths, Notes and subtasks;
- Floating Timer rest/hover/expanded/collapsed/move/resize/edge states;
- Preferences and conditional settings;
- Reports/Overview/Sessions/export flows;
- loading/empty/error/unavailable/recovery/transient states that can be reached through ordinary use;
- representative Windows/DPI/monitor behavior where useful for source observation.

Prefer one comprehensive scripted journey plus explicitly listed branch scenarios over ad-hoc exploration.

## Dual evidence streams

Every planned interaction should, where technically practical, be recorded on a shared timeline through **both** evidence streams.

### A. User-visible stream

Capture:
- continuous screen recording;
- screenshots/keyframes for stable states where useful;
- cursor/keyboard interaction context where observable;
- window bounds/display/DPI context where material;
- timestamps/session identifiers that can be correlated to the protocol/state stream.

### B. Observable protocol/state stream

Capture only what the normal client exposes or causes while using the user's own authorized Blitzit trial/account. The goal is to reconstruct the **observable contract**, not to claim access to Blitzit's private server implementation.

Where available without defeating product security controls, record:
- request endpoint/path pattern, method, timing and status;
- request/response payload **shape and semantics**, with secrets/private values redacted;
- WebSocket/SSE/realtime event types and ordering if observable;
- identifiers, revisions/version fields, ordering fields and timestamps exposed to the client;
- optimistic update vs acknowledgement/reconciliation behavior;
- retry/conflict/error responses reached through ordinary UI use;
- local storage/IndexedDB/cache/app-data changes that correspond to the interaction;
- process/file/database activity observable on the local machine when it materially clarifies state ownership;
- before/after state snapshots sufficient to infer transitions such as create/edit/move/reorder/timer/session/schedule/report behavior.

This is a Mimic-like **behavioral/protocol observation method**, not an attempt to recover private server source code, internal database schema or unexposed algorithms.

## Security/privacy boundary for protocol capture

Do not:
- commit raw authentication tokens, cookies, session secrets, payment data, credentials, personal account data or private unrelated content;
- replay or exfiltrate bearer tokens/secrets outside the user's normal authorized client context;
- fuzz/enumerate undocumented endpoints beyond the actions produced by ordinary product use;
- bypass certificate pinning, authentication, access controls or other security protections merely to obtain more evidence.

If a protocol/state channel cannot be observed without bypassing such a protection, record it as **UNAVAILABLE / NOT OBSERVED** and continue with the evidence that is legitimately available.

Sensitive raw network/state captures should remain local. Repository evidence should use sanitized derivatives, hashes, manifests and redacted structural summaries.

# Phase 2 — Continuous capture campaign: COLLECTION ONLY

This phase has an **analysis embargo**.

Run the planned product journey and branch scenarios while recording the visual and protocol/state streams together.

Rules:
- keep capture continuous for each scripted session; segment files only when technically necessary for reliability/size, while preserving one session ID, chronological ordering and reassembly/integrity metadata;
- do not stop simply because an interesting discrepancy appears;
- do not discard quiet/idle intervals when they may contain delayed state/network activity;
- use synchronized timestamps/bookmarks so visible actions can later be correlated with requests/events/state changes;
- preserve failed/odd states as raw evidence rather than immediately rerunning until they disappear;
- if a scenario must be repeated, record the repeat as a distinct attempt rather than overwriting the first one.

### Strict capture-phase prohibition

During Phase 2:
- **do not modify Narro source/config/tests because of anything observed**;
- **do not create parity verdicts or implementation dispositions**;
- **do not update the audit crosswalk with conclusions**;
- **do not perform deep frame/network analysis while the campaign is still running**;
- **do not branch into unscripted remediation work**.

Allowed during capture:
- factual timestamp bookmarks;
- neutral action labels such as `clicked Delete`, `timer paused`, `request sequence A–C occurred`;
- capture-health checks;
- operational notes needed to preserve reproducibility;
- stopping/redacting a capture if credentials, payment details, private data or another safety/privacy issue appears.

The goal is an intact evidence corpus, not an early verdict.

# Phase 3 — Corpus freeze and integrity inventory

After the planned capture campaign is complete, **stop acquisition before substantive analysis starts**.

Create a frozen M11 evidence inventory:
- session IDs and chronology;
- raw video/screenshot filenames;
- protocol/state capture filenames;
- start/end timestamps;
- SHA-256 or equivalent integrity hashes;
- environment/provenance metadata;
- capture gaps, tool failures and explicitly unobserved channels;
- sanitization/redaction status;
- mapping from planned scenarios to evidence files/time ranges.

Verify that recordings/logs are readable and that the intended coverage was actually captured.

If a required scenario is genuinely missing or corrupt, schedule a **capture-completion session** and then refreeze the corpus. Do not begin remediation because of a partial corpus.

The frozen capture corpus is immutable evidence. Corrections or annotations use new files/records; raw evidence is not overwritten.

# Phase 4 — Full-corpus analysis

Only after Phase 3 is complete may substantive analysis begin.

Analyze the corpus systematically rather than in discovery order.

## Visual/interaction analysis

For every relevant surface/state:
- compare layout, hierarchy, spacing, typography, icons, colors, borders, radii, shadows/elevation and density;
- inspect hover/focus/pressed/disabled/selected/pending/error/success behavior;
- measure meaningful motion/transition sequencing/timing where useful;
- inspect transient states and interaction ordering;
- compare against the canonical older Blitzit evidence and record version-dependent differences.

## Protocol/state analysis

Correlate each scripted action with observable state effects:
- create/edit/delete/move/reorder identity semantics;
- timer start/pause/resume/break/complete accounting;
- session/tracked-time writes and reconciliation;
- scheduling/recurrence representation and transitions;
- report/session aggregation behavior;
- optimistic vs authoritative acknowledgement patterns;
- retries/conflicts/error handling;
- local-vs-remote state ownership where the evidence supports a conclusion.

Do not infer hidden server internals that are not observable. Distinguish:
- **directly observed contract**;
- **strong inference from repeated evidence**;
- **unknown/unobservable implementation detail**.

## Analysis completeness gate

Do not begin Narro remediation merely because the first significant finding is understood.

Phase 4 completes only when the entire frozen capture corpus has been reviewed to the planned coverage level and a single M11 findings register exists.

# Phase 5 — Reconciliation and remediation plan

After full-corpus analysis:
1. reconcile every material live finding against canonical Pass-3/static-calibration evidence;
2. classify version conflicts and source ambiguity explicitly;
3. compare the finding against the final M10 Narro implementation;
4. update the audit crosswalk/findings register;
5. disposition each finding before implementation:
   - no Narro difference / no action;
   - source-version difference only;
   - intentional Narro reliability/accessibility/Windows/local-only deviation;
   - evidence insufficient / accepted ambiguity;
   - Narro correction required;
6. group required corrections into coherent, dependency-aware remediation batches;
7. define the validation required for each batch.

**No Narro implementation begins until this reconciliation/remediation plan is complete.**

A live-source observation does not automatically override:
- documented Narro reliability/data-integrity corrections;
- accessibility or Windows-platform requirements;
- intentional local-only/privacy boundaries;
- stronger version-matched canonical evidence;
- explicit evidence-limit dispositions.

# Phase 6 — Narro remediation

Only after Phase 5 is frozen may M11 change Narro.

Implementation rules:
- use narrow evidence-backed corrections;
- batch compatible findings where validation can remain clear;
- do not rewrite architecture merely to mimic unobservable backend internals;
- preserve Narro's local-only architecture unless an explicit user product decision changes it;
- reproduce **observable semantics**, not Blitzit's cloud implementation for its own sake;
- add regression coverage for material behavior discovered during M11;
- keep source changes and evidence/tracking changes clearly attributable to the relevant M11 finding IDs.

# Phase 7 — Revalidation and M11 closure

Re-run:
- affected automated tests/CI;
- affected Windows physical checks;
- direct live/canonical source comparisons where still meaningful;
- data-integrity/timer/session/reorder/scheduling/report regressions affected by remediation.

M11 is complete only when:
- the planned capture campaign is complete and frozen;
- the entire frozen corpus has been analyzed;
- all material findings are reconciled;
- every selected Narro correction is implemented and validated;
- affected prior parity/physical gates are re-run where necessary;
- a final M11 report records:
  - live Blitzit provenance/version;
  - capture inventory and integrity;
  - visual findings;
  - observable protocol/state findings;
  - unknown/unobservable backend limits;
  - version-specific differences;
  - accepted Narro deviations;
  - remediation summary;
  - exact resulting Narro SHA.

Only then may the required Final Comprehensive Review use the post-M11 Narro candidate as its baseline.

# External-action boundary

M11 authorization is authorization to perform this audit workflow. It is not blanket authorization to:
- purchase, renew, upgrade or cancel a subscription;
- change billing/account/security settings;
- send external communications;
- perform destructive account actions unrelated to the scripted audit.

Such actions still require the approval normally required by repository/tool policy.
