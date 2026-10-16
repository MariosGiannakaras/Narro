# Optional Milestone 11 — Live Blitzit Reference Audit

Status: **DORMANT / STRICTLY OPT-IN**.

This protocol defines the optional post-M10 live Blitzit audit. **Its overriding product goal is to make Narro reproduce the real Blitzit as faithfully as evidence permits—visually, interactively and functionally across every in-scope interface, state and transition.** This includes exact user-visible content, layouts, original palette, animation and micro-animation, micro-interactions, modal/menu/message behavior, state changes and persistence, rather than mere screenshot similarity. Where Blitzit's internal source code is unavailable, reconstruct the complete observable behavior through sound Narro-local engineering with meaningful validation.

**Evidence acquisition is a means to that product goal, not a separate objective that displaces it.** Use the user-guided continuous recording, synchronized observable client/protocol/state capture, authentic client assets/theme evidence and proportionate static/dynamic investigation to resolve what the application actually does. Do not require knowledge of hidden server code to reproduce demonstrated behavior. Do not substitute invented Blitzit specifics for missing evidence; record bounded unknowns and defensible Narro-local choices.

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


## Default M11 capture arrangement — Codex technical telemetry + user continuous video

When the user elects to operate the reference UI, **Codex owns the preparation, technical capture, correlation and forensic analysis; the user owns one guided, continuous screen recording of the real Blitzit application**. This is the preferred evidence-acquisition arrangement when automated direct UI control is unavailable or less reliable. Do not substitute a narrated tutorial for the original screen recording or assume that a user video alone proves hidden application logic.

Before the user records, Codex must:
1. Derive a complete, ordered and explicit **user-action guide** from the current product-surface/state matrix, canonical Pass-3, palette requirements and known gaps. Provide actual actions, expected visible checkpoints, deliberate hover/hold/idle intervals, deliberate branch scenarios and a coverage checklist; do not leave interface discovery to the user. Include a recovery/continuation route for any blocked feature without pretending it was observed.
2. Verify which technical capture channels are truly available for the user's authorized installation and environment. Start a **read-only**, privacy-filtered technical logger first, with a unique session ID, local clock/timezone, UTC timestamp and monotonic-time source where available. Verify actual events reach persistent files; an unverified running command, unavailable privileged instrumentation or a disconnected Codex session is **not** a working logger. Preserve start/stop/health/gap metadata.
3. Give the user a clear **recording-ready signal only after verified logging**. Record a distinctive permitted UI synchronization action at the beginning (for example, open/close a particular dialog), and repeat recognizable synchronization anchors midway and at the end where feasible. Record their observed technical timestamps without inventing missing event matches.
4. Have the user capture the **entire unedited journey** with cursor, application window and relevant transient UI visible. Prefer a true 60-fps source recording where available for fine motion (record the actual FPS; 30 fps may miss fast micro-animations). Keep theme, scaling and display conditions known, and avoid exposing credentials/private content. Hold on transitions and hover states long enough to observe them; include idle intervals revealing delayed messages/reconciliation. The video may be technically segmented only with documented contiguous chronology, session mapping and integrity hashes.
5. Stop and verify the technical recording **after** the user's video ends, not when the first action appears. Preserve original media, capture metadata, raw trace hashes and sanitized indexes. If live collection stops or fails, label the exact uncovered interval; do not silently fill gaps.

The actual video and logger do **not** need to share a raw clock or millisecond-perfect event time. In Phase 4, Codex estimates video-to-log offset and any measurable drift from multiple uniquely identifiable anchors, pairs UI actions with their plausible client events/state changes, and records matching confidence. Distinguish action onset, client request time, server response, UI commit and rendered-animation completion. A network request is not automatically the direct cause of the closest video frame; preserve ambiguous, missing, delayed or repeated matches as such.

**The user should not need to annotate every click manually.** Codex creates the per-action timeline, timestamps, coverage disposition and evidence links after the corpus freeze. The user only follows the prepared guide and supplies recordings or unobtainable observations. Scenarios requiring controlled restart, theme changes, multi-monitor behavior or other incompatible setup can use clearly linked auxiliary sessions; a single video is preferred, not a reason to omit such cases.

**This section defines a future execution method only.** It does not start loggers, access the live reference, create a capture campaign or activate dormant M11.

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

## Mandatory exhaustive per-interface forensic matrix (Pass-3+)

M11 must **exceed the completed source-only Pass-3 inspection depth**: cover every discovered in-scope Blitzit interface and reachable state/transition, not just representative screenshots or the 41 previously uncertain items. Use Pass-3's frame-by-frame/dense motion scrutiny, arithmetic/identity tracing and version-aware source discrimination as the **minimum evidence standard**, not its historical asset counters as M11 completion credit.

Create and close one coverage ledger keyed by **surface -> component -> state -> transition -> scenario**. Include the complete actual UI inventory across main board/list/task views, editor flows, focus/panel/timer, settings, reports/sessions, window and OS integrations, search, keyboard interactions, alerts and conditional/rare states. Check all applicable, actually reachable combinations:

- **Structure and visual styling:** geometry, alignment, dimensions, layout/reflow, spacing, typography/font weight/line-height, icon sizes/strokes/placement, backgrounds, borders/radii, shadows/elevation, translucency, gradients, precise theme tokens, text/non-text contrast, visual hierarchy, light/dark/system themes and DPI/layout variants.
- **Complete interaction-state sets:** initial/rest, hover (including hover-exposed controls), mouse-down/pressed, keyboard focus and focus-visible, selected/active, expanded/collapsed, enabled/disabled, loading/pending, success, empty, validation/error, warning, destructive/confirmation, dismissal, cancel, outside-click, Escape, retry, interruption and restart/recovery where meaningful. Capture exact strings, labels, notifications, tooltips, toasts, banners and every modal/popover/menu's placement and dismissal behavior.
- **Animation and micro-animation:** reveal/hide, fade, scale, slide, translation, bounce, hover and focus transitions, shadows, gradients, icon morphs, drag lift/reorder/drop/settle, counter/progress changes, scroll and board-to-focus/window transitions. Record real media FPS, start/end frames/timecodes, observed duration, sequencing/overlap, opacity/transform/geometry checkpoints, interruption/cancellation and perceptible easing **only to the precision supported by actual frames**. Do not infer implementation easing curves or millisecond precision from low-FPS footage.
- **Micro-interactions and behavior:** click/press-and-hold, hover delays, keyboard shortcuts, tab/focus order, Enter/Escape, pointer targeting, drag/drop threshold/insertion/reflow, scroll/focus retention, conditional controls, input edits/validation, saved-versus-optimistic UI feedback, async waits, repeated actions, navigation away/back and window focus changes.
- **Semantic correctness:** exact task identity, order, date/time, recurrence, timer/sessions and counters/aggregates before/after actions; persistence/restart; error/retry/duplicate/timeout paths only when safe and legitimately testable, with observable protocol/local-state correlation where available.

Each inspected scenario must produce a traceable evidence row: interface/component/state, intended action, actual before/action/after, video start/end timecodes plus relevant frame references, technical log event(s) and time offset/confidence (or **NOT OBSERVED**), Blitzit version/theme/display context, source-derived styling/motion/behavior measurements, corresponding Narro state, confidence, mismatch classification and test/remediation disposition. **Document each uncovered/missing state explicitly; a recorded walkthrough is not evidence of exhaustive coverage merely because it is continuous.** The capture matrix must be coverage-audited before the frozen corpus is analyzed, and the per-interface ledger reconciled before any Narro code corrections.

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

## Reconstruct observable behavior, not hidden source code

**Black-box functional reconstruction is a first-class M11 outcome, even when the original application's implementation is inaccessible.** The Codex agent must synthesize the actual user-facing behavior established by the synchronized video, accessible client events, observable state and controlled repeat/restart trials into a complete, robust Narro-local implementation. Not knowing Blitzit's private functions, server database or framework does **not** justify leaving a demonstrated feature missing, inert, generic, superficially animated or behaviorally incorrect.

For each interaction reconstruct the observable contract: triggering input; exact visible before/pending/confirmation/success/cancel/error states; message wording; positioning; animation and timing; affected UI entities and reflow; permitted dismissal paths; navigation/focus effects; state mutation and persistence; relevant interdependencies; and safe failure/retry/re-entrancy semantics. Separate **directly demonstrated effects**, **strongly inferred behavior**, **unobserved branches** and **Narro-local engineering choices**. Video proves only what appears in its frames; use accessible logs, state snapshots, ordinary UI probes and restart tests to investigate persistent or hidden effects, never claim them from pixels alone.

**Deletion reference scenario:** capture opening the relevant delete control; whether/how a confirmation modal appears, its precise copy, position, style and entrance/exit animation; confirm versus cancel, Escape and outside-click; whether a toast/banner appears; element disappearance, sibling reflow, counters and selection/focus changes; and post-navigation/restart state where observable. Apply the same depth to every other destructive, reversible and non-destructive action. When some branch was not observed despite proportionate attempts, implement a deterministic and safe Narro-local path consistent with established evidence, label it as such, and test it; do not fabricate a Blitzit-specific modal, message, timing, backend guarantee or source-code match.

**Acceptance is functional + visual + state parity against evidence, not internal implementation parity.** Deliver working interaction paths with regression tests; never accept merely screenshot-similar UI with disabled controls or unproven persistence. Preserve Narro's existing data-integrity safeguards and explicitly approved design exceptions.


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
- the per-interface/component/state/transition coverage ledger accounts for all planned and discovered in-scope scenarios, with source evidence or an explicit unavailable/not-observed disposition rather than assumed coverage;
- all material findings are reconciled;
- every selected Narro correction is implemented and validated;
- the corrected Narro surfaces and interactions have **source-to-Narro side-by-side visual/motion/behavior acceptance evidence** at relevant before/action/transient/after states, with measured differences where the source permits and explicitly documented exceptions. Validate real outcomes and persistence where applicable, not merely visual resemblance;
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
