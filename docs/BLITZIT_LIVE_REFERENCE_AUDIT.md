# Optional Milestone 11 — Live Blitzit Reference Audit

Status: **DORMANT / STRICTLY OPT-IN**.

This protocol defines the optional post-M10 live Blitzit audit. Its purpose is to observe the actual product interactively and capture both the user-visible experience and the **observable client/backend/state contract** that cannot be recovered reliably from curated screenshots, tutorials and recordings.

The audit is deliberately phase-gated:

`PLAN -> CAPTURE EVERYTHING -> FREEZE CORPUS -> ANALYZE -> RECONCILE/PLAN -> IMPLEMENT -> REVALIDATE`

**Do not collapse these phases. In particular, do not discover a difference during capture and immediately analyze or fix Narro.**

**Binding future palette deliverable:** M11 must recover Blitzit's **actual original color values**, rather than choose visually similar alternatives, and use the provenance-verified palette as the primary source for Narro's general semantic color system and affected dark/light UI. This includes surfaces, text, borders, statuses, list presets, states and gradient/alpha specifications. Preserve verified source values, unavailable values, screenshot-derived approximations and justified Narro-specific exceptions as distinct categories. This is a **future opt-in M11 requirement**, not permission to start its audit or recolor Narro now.

## Mandatory deep reverse-engineering protocol (REA + alternative tools)

**Objective:** obtain the maximum reliable, reproducible understanding of the user's authorized Blitzit installation: appearance, behavior, client-side code paths, application state, local persistence, and observable client/server interactions. A superficial UI/video or network-only audit does not satisfy M11 when relevant deeper evidence is obtainable. Do not claim to have recovered unobservable backend source or algorithms.

**REA is the preferred first candidate, not a compulsory single point of failure.** At activation, assess [Reverse Engineer Anything (REA)](https://github.com/morluto/rea): actual released/installed version, Node/MCP/CLI readiness, compatible host, providers, supported target formats and limits. Verify that the tool genuinely works before relying on its output. REA can analyze Electron/JavaScript/ASAR structures, static .NET metadata/CIL, native binaries with a compatible Hopper/Ghidra/IDA provider, and saved browser/network evidence. Its Windows Ghidra support is experimental and limited; never assume general native Windows coverage. Use other appropriate tools when more informative: Windows process/module/file/registry/ETW monitors, debuggers/profilers, PE/.NET/ASAR inspectors, DevTools and available HAR/state/database views.

**Investigative method:**
1. Identify the exact client version, packaging/framework (Electron, .NET, native PE or otherwise), installed components, available source maps and artifact hashes. Use only copies/artifacts obtainable from the authorized installation.
2. Plan a feature-to-evidence matrix before capturing: each scripted action identifies relevant UI state, binary/module candidates, data/persistence changes, timing, network/state messages and restart/error paths.
3. In capture (Phase 2), collect all three synchronized streams: visible interaction; observable network/state protocol; hash-identified installed artifacts and factual runtime/process/file/registry/database/ETW/debug traces where available. Preserve the evidence without semantic code analysis or Narro changes.
4. Freeze all raw evidence, artifact hashes, tool versions, provider limitations, timestamps, scenario mappings and sanitized manifests (Phase 3). Analyze the frozen material only afterward.
5. During Phase 4, use REA and/or suitable alternatives for targeted static reconstruction (modules, imports, IPC, functions, references, serialization, persistence, call/data flow). Correlate it with dynamic execution traces, before/after/restart state and client network events. Test competing hypotheses where feasible.
6. Before marking a material function **UNKNOWN/UNOBSERVABLE**, document the actual static, dynamic, network and persisted-state approaches attempted and why they failed or were inapplicable; consider a compatible offline analysis host or alternate provider rather than stopping after one failed REA operation. Do not exhaustively disassemble unrelated code.
7. Each finding must have a traceability row: scenario ID, exact Blitzit artifact/build hash, visual and protocol/state observations, file/symbol/offset or REA evidence, runtime evidence, confidence (direct / strong inference / unknown), gaps and the corresponding Narro behavior.
8. Only after whole-corpus analysis and findings reconciliation may Narro be corrected. Implement the minimum evidence-backed change with tests and CI, preserving local-only architecture, reliability, accessibility and the approved Spectrum Core Create/Edit List picker, image upload and 218 offline icons unless the user explicitly changes that design.

**Scope boundary:** maximal investigative effort does not automatically authorize bypassing authentication, subscriptions, DRM, certificate pinning or access controls, extracting or replaying credentials, probing unrelated services, or using commercial tooling without a valid license. Use ordinary authorized instrumentation and lawful static/dynamic alternatives, documenting concrete unavailable channels rather than inventing results. Keep raw proprietary binaries and sensitive traces local, and put only sanitized summaries/manifests/hashes in the repository. Separate approval remains required for invasive OS changes, billing/account/security changes or other unrelated destructive actions. This policy does not activate M11 or resume paused native tests.

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
- whether the live evidence is created by direct Codex interaction, a user-made recording, or another explicitly identified capture path;
- source installer/client package format, SHA-256 identities, module architecture and exact available artifact copies;
- REA and alternate-analysis tool versions, provider-readiness results, host/tool constraints and an available offline analysis machine if needed.

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
- representative Windows/DPI/monitor behavior where useful for source observation;
- an explicit **palette coverage matrix** for dark/light/system themes and representative default, hover, focus, selected, pressed, disabled, error and success states, spanning neutral surfaces, text, dividers/borders, accent/CTA, list presets, status colors, gradients/stops and alpha overlays. Plan evidence retrieval from accessible original client resources (bundled CSS/styles, theme constants/variables, SVG/assets, runtime computed styles or equivalent), with state/selector/surface identifiers and exact client version. Screen pixels are a separate measurement channel, not proof of byte-exact original color tokens.

Prefer one comprehensive scripted journey plus explicitly listed branch scenarios over ad-hoc exploration.

## Three complementary evidence streams

Every planned interaction should, where technically practical, be recorded on a shared timeline through **all applicable** evidence streams. Document any unavailable stream explicitly.

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

This is a Mimic-like **behavioral/protocol observation method**, not evidence of private server source code, internal database schema or unexposed algorithms.

### C. Local client artifacts and runtime execution

Record hash-identified read-only inventories of available installer/executables/DLLs, ASAR resources, source maps, .NET assemblies and other client files, plus factual process/module starts, normal filesystem/registry/cache/database changes, ETW/debugger/profiler observations and state snapshots where appropriate. Correlate timestamps with the same scripted UI actions and preserve before/after/restart results. Collection is factual only: REA static analysis, decompilation, code-path inference and parity conclusions belong exclusively to Phase 4 after the capture corpus is frozen.

**Color-source acquisition:** preserve read-only, hash-identified copies or factual exports of accessible color-bearing style/theme/client/asset resources (including raw CSS variable declarations or runtime computed-style values where available), paired with screenshots and theme/state/selector/monitor/DPI/color-profile metadata. Record timestamps, artifact identity and gaps. Do not interpret the palette, classify token equivalence or modify Narro during acquisition. If exact source values are not exposed, preserve screenshot samples as raw measurements for later qualified analysis.

## Security/privacy boundary for protocol capture

Do not:
- commit raw authentication tokens, cookies, session secrets, payment data, credentials, personal account data or private unrelated content;
- replay or exfiltrate bearer tokens/secrets outside the user's normal authorized client context;
- fuzz/enumerate undocumented endpoints beyond the actions produced by ordinary product use;
- bypass certificate pinning, authentication, access controls or other security protections merely to obtain more evidence.

If a protocol/state channel cannot be observed without bypassing such a protection, record **that channel** as **UNAVAILABLE / NOT OBSERVED** and pursue other appropriate lawful static, runtime and state-observation methods. Do not infer that the entire feature is unknowable from one blocked channel.

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
- installer/client artifact inventories, hashes and local evidence provenance;
- process/module/ETW/debug/file/registry/state snapshot filenames where available;
- REA/provider/tool versions, capabilities, unsupported channels and fallback results;
- start/end timestamps;
- SHA-256 or equivalent integrity hashes;
- environment/provenance metadata;
- capture gaps, tool failures and explicitly unobserved channels;
- sanitization/redaction status;
- mapping from planned scenarios to evidence files/time ranges;
- mapping from palette/theme/state capture scenarios to original color-bearing resources, computed-style snapshots, visual samples, relevant display/color-management context and unavailable exact-source channels.

Verify that recordings/logs are readable and that the intended coverage was actually captured.

If a required scenario is genuinely missing or corrupt, schedule a **capture-completion session** and then refreeze the corpus. Do not begin remediation because of a partial corpus.

The frozen capture corpus is immutable evidence. Corrections or annotations use new files/records; raw evidence is not overwritten.

# Phase 4 — Full-corpus analysis

Only after Phase 3 is complete may substantive analysis begin.

Analyze the corpus systematically rather than in discovery order. Apply the mandatory REA/alternative-tool static, dynamic, protocol and state evidence ladder above to material uncertain flows, produce the reverse-engineering traceability matrix, and distinguish recovered client behavior from inferred or inaccessible backend details.

## Visual/interaction analysis

For every relevant surface/state:
- compare layout, hierarchy, spacing, typography, icons, colors, borders, radii, shadows/elevation and density;
- inspect hover/focus/pressed/disabled/selected/pending/error/success behavior;
- measure meaningful motion/transition sequencing/timing where useful;
- inspect transient states and interaction ordering;
- compare against the canonical older Blitzit evidence and record version-dependent differences.

## Authentic palette extraction and color-system analysis

From the **frozen** authorized original client/style/theme/assets and rendered-state evidence, produce a version-identified **Blitzit palette inventory**. For each material color record its semantic role, UI surface/component/state, theme, exact source HEX/RGB(A)/HSL value where recovered, gradients with stops/positions/direction, alpha and compositing backgrounds, extraction method, artifact hash or selector/property reference, corroborating frame/time and evidence-confidence tier. Prefer verifiable packaged theme/CSS/asset values or actual computed runtime styles; where values are generated dynamically, trace the original client logic if accessible. Avoid claiming byte-exact source values solely from screenshot pixels, which may differ because of compression, antialiasing, opacity, DPI, ICC/color management or capture pipelines.

Keep **VERIFIED ORIGINAL VALUE**, **RENDERED PIXEL MEASUREMENT**, **INFERRED APPROXIMATION** and **UNAVAILABLE** clearly separate. Compare the source palette with Narro's current semantic tokens and usage (including color hierarchy, light/dark mapping, disabled/selected/focus states and signature gradients). Measure representative actual foreground/background contrast against applicable WCAG 2.2 AA criteria (normal text 4.5:1; large text and meaningful non-text UI 3:1 where applicable), reporting violations or justified deviations rather than silently 'correcting' or misrepresenting original Blitzit colors.

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

Phase 4 completes only when the entire frozen capture corpus has been reviewed, all material uncertain flows have either undergone the applicable static/dynamic/protocol/state investigation or have documented limits, the reverse-engineering traceability matrix is complete and a single M11 findings register exists.

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
7. define the validation required for each batch;
8. freeze a **source-to-Narro palette crosswalk** mapping every verified Blitzit semantic color/gradient/theme/state to Narro's existing or required centralized design tokens and affected UI consumers. The intended outcome is a Narro theme **grounded in the actual Blitzit palette**, not arbitrary similar shades. Flag unverified entries and differences required by accessibility/Windows/local-only constraints; preserve the explicitly approved Spectrum Core Create/Edit List picker, upload and 218-icon library appearance/behavior without interpreting this palette request as approval to restyle that locked component.

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
- keep source changes and evidence/tracking changes clearly attributable to the relevant M11 finding IDs;
- apply the frozen original-to-Narro palette mapping primarily through shared `src/theme.css` semantic tokens and coherent affected component state/gradient usage, not scattered hardcoded replacements. Retain user-configurable list colors and the locked approved Spectrum Core design; add dark/light and representative contrast/regression coverage. Where actual original values cannot be verified, keep evidence-limited fallbacks explicitly labeled rather than claiming exact source parity.

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
  - **Blitzit authentic palette inventory with per-value provenance/confidence, theme/state, exact-vs-estimated status, measured contrast, source-to-Narro token crosswalk, validated Narro palette changes and exceptions**;
  - observable protocol/state findings;
  - installed artifact/static/REA/runtime evidence, tool versions, confidence and provider limits;
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

This documentation-only revision **does not activate M11**, modify the mandatory 10-milestone denominator, resume the user-paused PA-01–09 physical tests, change active code/CI ownership or change any approved Spectrum Core visuals or behavior.
