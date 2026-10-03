# Audit → implementation crosswalk

Status: **ACTIVE / authoritative implementation-routing companion**

Created: 2026-09-28

This register exists so Narro does not keep implementing against superseded assumptions after stronger parity, video, Help Center, UI/UX or reliability evidence is found.

It does **not** add an eleventh milestone. `TODO.md` remains the ordered 10-milestone roadmap.

## Fidelity interpretation — user direction 2026-09-28

For all in-scope personal/local functionality, the default disposition is **maximum observable Blitzit parity** from the strongest available evidence. Confirmed source behavior/visuals are not optional inspiration and must not be replaced by discretionary redesign.

An `INTENTIONAL_DEVIATION` or `EXCLUDED` disposition is valid only when supported by one of these reasons:
- explicit local-only/personal-use scope removes a cloud/account/subscription/AI/integration dependency;
- reproducing the source behavior would reintroduce a documented reliability/data-integrity defect;
- accessibility or Windows-platform correctness requires a different treatment;
- the source evidence is genuinely ambiguous or technically impossible to reproduce safely.

Every other unexplained visual or functional mismatch is a parity finding to fix or route, including small interaction/state/copy/layout/motion discrepancies when evidence exists.

## Binding routing rule

Before changing any surface:

1. inspect the relevant rows here;
2. use the newest evidence/specification, not an older implementation assumption;
3. if a known finding for an already-built/current surface is `FIX_NOW`, correct and validate it before unrelated forward feature work;
4. if the finding belongs to a genuinely later milestone, keep it routed there and ensure that milestone's TODO contains it;
5. if evidence is ambiguous, exhaust the relevant evidence and keep the uncertainty explicit; when the exact source detail remains unknowable, use the strongest available evidence plus established professional UX/engineering practice, Narro's existing design language, Windows conventions and accessibility to choose the most coherent implementation, then record the inferred decision rather than presenting it as confirmed Blitzit behavior;
6. if Narro intentionally improves on a source limitation/bug, retain the improvement as `INTENTIONAL_DEVIATION`;
7. no material finding may exist only in an evidence document without one explicit disposition here.

Disposition values:
- **VALIDATED**
- **FIX_NOW**
- **ROUTED_Mx**
- **VALIDATION_OPEN**
- **AMBIGUOUS** — exact Blitzit behavior is not established; this preserves evidence uncertainty, but does not automatically block implementation. After relevant research is exhausted, a professional evidence-consistent Narro decision may be implemented and recorded without pretending it is confirmed source behavior.
- **INTENTIONAL_DEVIATION**
- **EXCLUDED**

## Canonical source-analysis consumption

Use `docs/BLITZIT_PARITY_RECONCILIATION_WORKFLOW.md` for the binding source-analysis -> implementation handoff.

`SOURCE_COMPLETE` forensic records are the normal implementation input; implementation agents do not repeat the raw screenshot/video analysis by default. For stable screenshot-backed states, the measurable visual layer is `docs/BLITZIT_VISUAL_CALIBRATION_TRACKER.md`. New material findings are reconciled here against current code before the affected user-visible surface is considered parity-complete. A completed source record may therefore still be `RECONCILIATION_PENDING`, and screenshot source inspection may still be `VISUAL_CALIBRATION_OPEN`. M10/final review directly rechecks original references, but that is release-candidate verification rather than the first implementation comparison.

## 1. Parity/code audit findings

| ID | Finding | Route | Disposition |
| --- | --- | --- | --- |
| A1 | List Duplicate missing from production wiring | M5 reconciliation | **VALIDATED** |
| A2 | Persisted local list icons not rendered consistently | M5 reconciliation | **VALIDATED** |
| A3 | Top-of-lane add must create highest-priority atomically | M5 reconciliation | **VALIDATED** |
| A4 | Normal task create needs EST | M5 reconciliation | **VALIDATED** |
| A5 | Main board completion/permanent delete missing | M5 reconciliation | **VALIDATED** |
| A6 | Pointer/keyboard completion into Done | M5 reconciliation | **VALIDATED** |
| A7 | Safe per-task edits in All Lists | M5 reconciliation | **VALIDATED**; aggregate reorder remains disabled |
| A8 | Search matched-substring highlighting | M5 reconciliation | **VALIDATED** |
| A9 | Diagnostic JSON leaked into normal Main | M5 reconciliation | **VALIDATED** |
| A10 | Ordinary Focus rows lacked actions | M6 reconciliation | **VALIDATED** |
| A11 | Rocket/Make Live missing | M6 reconciliation | **VALIDATED** |
| A12 | Focus queue reorder missing | M6 reconciliation | **VALIDATED** |
| A13 | Focus row Notes/schedule/delete/complete missing | M6 reconciliation | **VALIDATED** |
| A14 | Focus Add Task disabled | M6 reconciliation | **VALIDATED** |
| A15 | Focus Home disabled | M6 reconciliation | **VALIDATED** |
| A16 | Live title editing unavailable through Notes | M6 reconciliation | **VALIDATED** |
| A17 | Time's Up Extend missing | M6 reconciliation | **VALIDATED** |
| A18 | Floating Timer subtask title editing missing | M7 reconciliation | **VALIDATED** |
| A19 | Done lane missing local-month completion count | M5 reconciliation | **VALIDATED** |
| B1 | Task Change List / Duplicate uncertain/missing | VE-F003 | **VALIDATED** — PR #177 |
| B2 | Exact Blitz-now placement fidelity | M10 final visual parity | **ROUTED_M10** |
| B3 | Exact swatch/palette fidelity | M10 final visual parity | **ROUTED_M10** |
| B4 | Done auto-start-next behavior | M8 success flow | **PARTIAL / AMBIGUOUS** — success-screen-enabled path validated; disabled path unproven |
| B5 | `Blitz now` must enter/open Focus Panel; PR #192 previously preserved an already-visible Floating Timer instead | M7 corrective semantics | **VALIDATED** — automated Focus-entry semantics are retained; CI #809 physical recording `2026-10-01 19-03-32.mp4` visibly activates Main `Blitz now` at ~5.2–5.4 s and the existing Focus surface presents the Focus Panel. See `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`. |
| B6 | An idle/no-task Floating Timer can still be exposed through stale Timer presentation / Find-Timer paths | M7 corrective semantics | **VALIDATED** — automated active-state gating remains green; CI #809 ends in visible `All Clear` and the operator-context idle T / Find-Timer sequence surfaces no placeholder/stale Timer or attention pulse. See `work-log/2026-10-02-chatgpt-m7-ci809-c4-closure.md`. |

Audit section-C intentional Narro deviations remain binding unless newer explicit evidence/user direction supersedes them.

## 2. Video findings

| ID | Finding | Consequence | Disposition |
| --- | --- | --- | --- |
| VE-F001 | Terminal EST suffix becomes EST and is removed from saved title | M8 task-create consumers | **VALIDATED** |
| VE-F002 | Success-screen-enabled Done waits for explicit Next Task | M8 completion | **VALIDATED** |
| VE-F003 | Task overflow includes Change List + Duplicate | M5 corrective slice | **VALIDATED** |
| VE-F004 | Source auto-opens note URLs on live transition | Require explicit activation | **INTENTIONAL_DEVIATION** |
| VE-F005 | Recurrence detachment can leave independent old children | Preserve customizations and idempotence | **VALIDATED reliability model**; UI gap tracked below |
| VE-F006 | Reports/Sessions derive from session history and support editing | M9 | **ROUTED_M9** |
| VE-F007 | Panel→Floating transformation ≈0.27 s; continuous-window character | M7 physical/fidelity gate | **VALIDATION_OPEN** — PR #192 head `b506fd01...` now contains unvalidated finite ~270 ms same-WebView Panel↔Timer and compact↔expanded Timer clip/reveal implementation; physical Gate 7 evidence is still required |
| VE-F008 | Preferences children stay in place; hidden times disclose on hover | M8 | **VALIDATED** |
| VE-F009 | Historical first-subtask-live limitation | Do not regress Narro | **INTENTIONAL_DEVIATION** |
| VE-F010 | Planning-board cross-lane drag supports pointer-position insertion, not append-only movement | M5 board parity correction | **VALIDATED** — PR #213 exact head `54697ca5f242a4007c5eb1e7e58c6eb4552ab3db`, Windows CI #836 PASS, merged as `7ebe7f8a31b2eb37b1113ae7ceb50b92ec66ff31`; persisted `beforeTaskId` now supports positional cross-lane insertion. Full drag lift/reflow/settle visual fidelity remains separately open under UX-F016. |
| VE-F011 | Lane headline time is live remaining work, not raw initial EST sum | M5 board read-model correction | **VALIDATED** — PR #213 exact head `54697ca5f242a4007c5eb1e7e58c6eb4552ab3db`, Windows CI #836 PASS, merged as `7ebe7f8a31b2eb37b1113ae7ceb50b92ec66ff31`; board projection now separates nominal and saturating remaining EST and pending lane headers consume remaining work. |
| VE-F012 | Today shows completion progress `done/total Done` and highlighted lane treatment | M5/M10 board parity | **PARTIAL / FIX_NOW** — PR #213 validated stronger Today emphasis/CTA structure; `done/total Done` semantics remain open. Exact visual calibration remains M10/review. |
| VE-F013 | Task ordinal is visible at rest and remains attached to moved cards during demonstrated planning sequence | M5 task-card parity | **FIX_NOW** as session-stable visible ordinal; persistence beyond the demonstrated interaction remains unclaimed |
| VE-F014 | Planning hover grammar is ordinal→completion at left plus Notes/lane-left/lane-right/overflow at right | M5 task-card interaction parity | **FIX_NOW** |
| VE-F015 | Today owns anchored gradient `Blitz now`; activation fades board ~250 ms before Focus | M6 entry / M10 motion parity | **PARTIAL / FIX_NOW** — PR #213 validated Today-owned anchored CTA composition. Board fade before Focus remains open; exact visual/motion calibration remains M10/review. |

Unresolved video ambiguities remain explicit:
- success-screen-disabled Done progression;
- success-screen `Take a Break` post-click semantics;
- exact easing/timing for edited tutorial interactions.

## 3. Help Center / image findings

| ID | Finding | Consequence | Disposition |
| --- | --- | --- | --- |
| HC-F001 | Permanent task delete is `Delete → Confirm` | Keep explicit confirmation/report exclusion | **VALIDATED** |
| HC-F002 | Sessions prose says PDF but current screenshot says CSV | Overview PDF / Sessions CSV | **ROUTED_M9** |
| HC-F003 | Recurrence edit: No Repeat conditionally shows warm/red `Delete existing tasks(n)` | Source-evidenced No Repeat flow with safe generated-child cleanup | **VALIDATED** — PR #182 / CI #617 / main #618 |
| HC-F004 | Source may require restart after monitor hotplug | Narro must recover dynamically | **VALIDATION_OPEN M7/M10** |
| HC-F005 | Done tasks older than 60 days auto-archive | Existing strict-60-day sweep | **VALIDATED** |
| HC-F006 | Today / Later today +2h / Tomorrow / Next week +7d | M4 schedule shortcuts | **VALIDATED** |
| HC-F007 | Schedule reminder enable + lead time | M8 background reminder runtime | **VALIDATED** — PR #180 |
| HC-F008 | Preferences Alerts/Celebration nested hierarchy | M8 | **VALIDATED UI**, remaining runtime below |
| HC-F009 | Source can lag due to server processing | Do not copy cloud delay | **INTENTIONAL_DEVIATION** |
| HC-F010 | Voice/cloud transcription | Out of local-only scope | **EXCLUDED** |
| HC-F011 | Blitzit 3.0 account/cloud/integration material | Must not override v2/current target | **EXCLUDED** |

## 4. UI/UX forensic findings

| ID | Finding | Consequence | Disposition |
| --- | --- | --- | --- |
| UX-F001 | Interaction grammar is inline/contextual | Surface architecture rule | **BINDING / ongoing** |
| UX-F002 | Gradient = high-salience primary; mint=selected/success; red/warm=destructive | Shared tokens/fixtures | **VALIDATED foundation**, M10 parity |
| UX-F003 | Dark/light preserve hierarchy/density | Themes | **VALIDATED**, M10 parity |
| UX-F004 | Panel→Floating ≈0.27 s; clipping/blank is source artifact | M7 continuity gate | **VALIDATION_OPEN** — same-WebView Panel↔Timer and compact↔expanded geometry motion is implementation-complete on unvalidated PR #192 head `b506fd01...`; do not promote this to fidelity PASS without exact-head CI and physical capture |
| UX-F005 | Generic hover/menu/modal/chart timings are not source-measured | Treat tokens as Narro calibration | **VALIDATED documentation rule** |
| UX-F006 | No Repeat replaces neutral Replace row with destructive Delete Existing row | Source-evidenced recurrence consequence hierarchy | **VALIDATED** — PR #182 visual fixtures / CI #617 |
| UX-F007 | Task hover keeps geometry; completion left/actions right; anchored overflow | M5 task geometry | **VALIDATED** |
| UX-F008 | Success hierarchy: completed title/context, dominant Next Task, EST/Taken, queue | M8 success UI | **VALIDATED** |
| UX-F009 | Preferences nested controls stay in place | M8 | **VALIDATED** |
| UX-F010 | Floating Timer expands vertically for subtasks | M7 | **VALIDATED source**, physical continuity open |
| UX-F011 | Schedule/recurrence footer uses secondary Cancel + primary gradient action | Narro combined Schedule/Repeat dialog preserves the secondary Cancel + gradient primary hierarchy without splitting state authority | **VALIDATED NARRO ADAPTATION** — PR #182 visual fixtures / CI #617 |
| UX-F012 | Reports hierarchy: four metrics → main chart → secondary panels | M9 | **ROUTED_M9** |
| UX-F013 | Sessions inline edit + Add Session dialog remain contextual | M9 | **ROUTED_M9** |
| UX-F014 | Main first paint exposes blank/washed/dark staging before Home settles | M10 final quality pass | **ROUTED_M10** — visible in the 2026-09-30 CI #744 physical recording; not established as an M7 source regression |
| UX-F015 | Global shortcut registration failures render as large persistent error cards inside ordinary Home content | M8 shortcut UX / M10 final review | **ROUTED_M8** — conflict must remain visible/retryable, but presentation should be contextual rather than diagnostic-like application content |
| UX-F016 | Cross-lane drag shows floating card, live source reflow, positional destination insertion and settle | M5 board motion/interaction | **FIX_NOW**; exact drag duration remains unmeasured |
| UX-F017 | Today lane has persistent cyan→green accent outline and anchored gradient Blitz CTA | M5/M10 board composition | **VALIDATED STRUCTURE / ROUTED_M10 FIDELITY** — PR #213 validated stronger Today boundary plus anchored CTA structure; exact gradient/border pixel calibration remains M10/review. |
| UX-F018 | Today progress is a done/total progress treatment, corroborated by current help-v2.x screenshot | M5 board semantics | **FIX_NOW** |
| UX-F019 | Resting task-left affordance is ordinal; completion replaces/reveals on hover without geometry shift | M5 task-card geometry | **FIX_NOW** |
| UX-F020 | Blitz entry fades the board before Focus presentation (~250 ms in supplied planning clip) | M6/M10 transition fidelity | **FIX_NOW** with reduced-motion-safe implementation |

## 5. Reliability/history findings

| ID | Risk | Required anti-regression | Disposition |
| --- | --- | --- | --- |
| RISK-F001 | Tracked-time loss / Done 00:00 / pause divergence | Session ledger, completion transaction, paused edit rebasing | **VALIDATED M3**, rerun M10 |
| RISK-F002 | Reorder/move duplicate corruption | Stable IDs, exact-set reorder, transactional move, independent duplicate | **VALIDATED M2/M5**, rerun M10 |
| RISK-F003 | Wrong-day/timezone scheduling | Date-only/local-datetime split, DST/week tests, locale presentation | **M4 correctness validated**; display locale still open |
| RISK-F004 | Renderer/navigation/sleep timer corruption | Authoritative Rust runtime | **VALIDATED M3/M6**, M7 physical open |
| RISK-F005 | Backend outage blocked source product | Local SQLite authority | **VALIDATED architecture** |
| RISK-F006 | Monitor hotplug source restart requirement | Event-driven topology recovery | **IMPLEMENTED**, physical M7/M10 open |
| RISK-F007 | Surprise implicit timer start on fresh app launch | Fresh startup must not create/start a focus session without explicit user action; recovery may only restore an existing durable checkpoint under the validated M3 recovery policy | **VALIDATION_OPEN** — current startup/Focus/shortcut contracts expose no intended implicit-start path, but no dedicated fresh-start regression was located; close before final M10 reliability acceptance |
| RISK-F008 | Live-task Notes/title metadata edit disturbs timer/session | Opening, editing and saving Notes/title must preserve live task/session identity and authoritative elapsed/accounting; EST/Time Taken edits remain restricted to the validated paused-runtime boundaries | **VALIDATION_OPEN** — functional Notes/title editing and paused metric safety are validated, but no dedicated integrated running-session continuity regression was located; close before final M10 reliability acceptance |
| RISK-F009 | Multiple Narro processes can coexist against the same local SQLite/background runtime and contend for global shortcuts | M1/M7 runtime foundation | **AUTOMATED_VALIDATED / PHYSICAL_RECHECK_PENDING** — official Tauri single-instance boundary is registered before persistence/background/shortcut authority; PR #206 exact head `ab1e89fc...` passed #784, guarded merge `4f489419...` passed resulting-main #785. Fresh M7 physical artifact must confirm one-process ownership during the final Gate 7/12 matrix |

## 6. Active M8 audited runtime tasks

| ID | Runtime effect | Status |
| --- | --- | --- |
| PREF-R01 | Timed alerts during live task using persisted interval + authoritative timer/session state | **VALIDATED** — PR #184 exact head `fc61ed5926fdb1c605de8ce1e1a9fb28ea0dfd7e`, CI #624, guarded merge `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`; merged source verified identical to validated PR source for all changed blobs |
| PREF-R02 | Finite animated timer flash; reduced-motion safe | **VALIDATED** — PR #193 exact head `2413de4f0e02daf829ffc753ca70b48a1e11712e`, Windows CI #714 / run `36694484904`, merged source `f1277a91f25068f4ec4818c0c14b27d2d3ca46fa`; all eight changed source/test blobs verified identical to validated PR head |
| PREF-R03 | Notification Alerts gating without duplicating authoritative M3 effects | **VALIDATED** — PR #195 reconciled exact head `c3a09e3780871cea70d008ac540f8d62cb684be7`, Windows CI #722 / run `36704515416`, guarded squash merge `1c9f2c7dc670fddcbf8cf687ca5b1945588eb01c`, resulting-main CI #723 / run `36705536633`; disabled alerts consume durable boundary effects without backfill, enabled alerts preserve the existing at-most-once M3 notification path, and Preferences-read failures leave effects pending |
| PREF-R04 | Schedule reminders enable + lead integrated with durable/idempotent delivery | **VALIDATED** — PR #180 exact head `0309c879998f43ff8c6e39e65f02c44669fa48b8`, CI #607, merge `643528ca223b29fd8fbd215db5b1b525c912c6fc`, main CI #608 |
| PREF-R05 | Sound selector/preview from validated Narro-owned or user-local assets only | **OPEN M8** |
| PREF-R06 | Windows locale/system 12/24-hour presentation | **OPEN M8** |

## 7. Immediate correction queue

### CORR-01 — recurrence update / No Repeat flow

Evidence: VE-017, HC-F003, UX-F006, `help-v2x-recurrence-no-repeat-delete-existing-tasks.jpg`.

**Status: VALIDATED / CLOSED.**

Validation:
- PR #182 exact head: `72ab6c77d5e5f5e50c7f3f7e6a0c11b98c7c606c`;
- Windows CI #617 / run `36354972305`: PASS;
- visual artifact `narro-m5-visual-regression`, id `10943374010`, digest `sha256:4d9b5005e53d842c1c8eb9774b6f29e9b950c0447a651914243d84c9f7b776b6`;
- runtime artifact `narro-m1-runtime-harness-windows-x64`, id `10943557612`, digest `sha256:1a9325c54af943de7ba05cf375ab313447f3a10b004e81a6f85a858a91a02ee6`;
- guarded squash merge: `50006f29b0329037aecfdab772104db8670768b0`;
- resulting-main Windows CI #618 / run `36355523089`: PASS via the repository validation gate.

Validated behavior:
1. existing recurrence exposes `No Repeat` inside the recurrence flow;
2. normal updates keep a neutral `Replace existing tasks(n)` consequence row;
3. No Repeat swaps that row for warm/red `Delete existing tasks(n)`;
4. unchecked No Repeat removes the rule and detaches existing linked children as independent tasks;
5. checked Delete Existing deletes only pristine active generated children;
6. customized, history-bearing, completed, archived, or legacy-linked children are preserved and detached;
7. stale rule/version guards, parent identity, persistence-first publication and recurrence idempotence remain intact;
8. Repeat + No Repeat states are captured/validated in light and dark themes.

### M7-PHYS — exact-build physical corrections

CI #624 physical Windows evidence is in `work-log/2026-09-28-codex-m7-ci624-physical-batch.md`.

| ID | Physical finding | Route | Disposition |
| --- | --- | --- | --- |
| M7-PHYS-01 | Panel↔Timer visual continuity: old opaque/transparent host-tail defects are fixed, but #684 cross-monitor motion remained visually drag-like | M7 visual continuity | **VALIDATED** — automated single-host motion contracts remain green; CI #809 physical re-audit confirms repeated populated presentation transitions with no blank/pale/stale/duplicate host frame, and PR #208's former expanded→compact white-L boundary no longer reproduces. See `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`. |
| M7-PHYS-02 | Mixed-DPI movement/recovery: #684 compact Timer visible-region DPI could lag the renderer during manual crossing | M7 topology/DPI | **VALIDATED** — CI #809 physical re-audit observes the compact Timer crossing the 1920-wide display at ~425 physical px to the 2560×1080 display at ~340 physical px; Windows settings explicitly show the latter at 100%, matching the 125%→100% 1.25 ratio. Timer remains usable through the crossing. See `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`. |
| M7-PHYS-03 | Settled compact/expanded Timer exposed a browser scrollbar and crowded right-edge controls in #684 | M7 layout/overflow | **VALIDATED** — CI #809 physical compact/expanded endpoints and edge-constrained expansion show no document/root scrollbar or unusable clipping; component-local content behavior remains intact. See `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`. |
| M7-PHYS-04 | CI #744 physical run could not establish exact-candidate Focus ownership because both Narro T/P global chords were already owned elsewhere | M1/M7 runtime validity | **VALIDATED** — PR #206 single-instance ownership is automated-validated, and CI #809 physically shows Main + active Timer already alive around 38 s before a later `narro.exe` activation at ~39.25–40.75 s; the same runtime state persists with no competing Narro UI/reset/conflict afterward. See `work-log/2026-10-02-chatgpt-m7-ci809-c4-closure.md`. |
| M7-PHYS-05 | Expanded active Floating Timer removes the current task title and live time | M7 Floating Timer parity | **VALIDATED** — accepted automated captures retain task title/live time, and CI #809 physical expanded Timer repetitions visibly retain the same active task/time through standard-motion presentation changes. See `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`. |
| M7-PHYS-06 | Main All Lists remains stale after Focus quick-create/start mutates the same authoritative board | M6/M7 cross-window projection correctness | **VALIDATED** — automated board invalidation/re-read remains green; CI #809 physical recording visibly reconciles Focus completion to Main Done while both surfaces remain live against the same authoritative state. See `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`. |
| M7-PHYS-07 | Physical validation artifact was the CI-instrumented `runtimeVisual=1` executable and mutated the user's SQLite with capture fixtures | M7 artifact validity / acceptance chain | **AUTOMATED_VALIDATED / PHYSICAL_RETEST** — recording SHA-256 `80b05a2410c752c8e56d68be37db9b4d92db3cd767b666a909cc60c6f2e20fb5`; commits `907d1f97...` + `5bda5851...` split production physical build and add isolated-profile no-fixture runtime smoke; CI #803 production physical artifact passes zero-checkpoint runtime smoke; rerun physical matrix only on exact production artifact |
| M7-PHYS-08 | Same-DPI Timer→Panel native animation reached the client-width edge then reversed 16 px to the decorated HWND edge | M7 visual continuity / native geometry | **FIX_IMPLEMENTED / CI_PENDING** — CI #801 artifact `11149609321` sampled `(388,80) → (684,0) → (668,0)`; commit `5c8f4c4e...` plans same-DPI Panel animation from actual outer HWND size while preserving cross-DPI target-scale planning and strict monotonic validation |
| M7-PHYS-09 | CI #806 active-session expanded→compact briefly exposed a white L/outline while the native Timer region changed | M7 visual continuity / Timer native-region swap | **FIX_IMPLEMENTED / AUTOMATED_VALIDATED / PHYSICAL_RETEST** — recording SHA-256 `86e51a5dcc6cc8bd5cb6af41971daa3c23016a97768c7f8469f567d4f232710b` shows the defect at ~81.50 s after clean task `Test` is active. PR #208 exact head `d885a577...` presents the contracted compact React frame before clipping and suppresses only the forced `SetWindowRgn` redraw for prepainted Timer↔Timer swaps; CI #809 PASS, merge `2767b382...` has the identical validated tree, main CI #810 PASS. Production artifact `11163439039` passes zero-`runtimeVisual` smoke; standard-motion physical retest remains required. |

The #684 reassessment remains historical defect evidence; the later CI #809 physical dispositions above supersede its open-retest state. CI #873 now physically passes the saved-placement restart criterion as recorded below. Separate M1 replacement/performance gates and formal M7 reconciliation remain open. No architecture reset or second Timer WebView is justified by the observations alone. Unaffected validated Preferences/persistence work remains preserved.

### CI #873 continuation — 2026-10-03 physical evidence

| ID | Direct observation | Route | Disposition |
| --- | --- | --- | --- |
| M7-C5-20261003 | Active compact Timer drag → normal tray Quit → same exact EXE relaunch → saved visible Timer at `(1640,780)`; same title/time recovered paused | C5 saved-position physical acceptance | **PHYSICAL_PASS** — native two-session evaluator PASS (328 px qualifying movement) and continuous two-monitor 60 fps video. [Completed run](../work-log/2026-10-03-codex-m7-ci873-c5-completed.md). Formal milestone reconciliation remains separate. |
| M7-OBS-20261003-01 | CI #873 expanded→Panel overlays outgoing/incoming content; CI #884 Panel→compact still shows compact target above outgoing Panel for one normal and two reduced-motion recorded frames | M7 narrow motion-content review | **FIX_NOW / PHYSICAL_FAIL** — PR #221's prepaint promotion alone does not hide the taller outgoing hierarchy before native clipping. [CI #884 dense review](../work-log/2026-10-03-codex-m7-ci884-physical-batch-evidence.md) preserves exact frames. PR #222 adds sole target paint ownership and immediate rollback restoration alongside the host/editor batch. Exact final EXE normal/reduced-motion testing remains OPEN. No claim of white-L recurrence or universal motion/source-parity PASS. |
| M7-OBS-20261003-02 | CI #873 settled 100% DPI Panel displays `Res...` and disabled `Exte...` action labels | M7 narrow layout/accessibility review | **IMPLEMENTED / VALIDATION_PENDING** — PR #221 reserves stable six-slot widths for complete labels. Sixteen rendered normal/paused/theme captures and CI #884 physical 125% labels PASS; native 100% DPI observation on the final changed host remains required. |

## 8. No-orphan gate

Before a milestone or substantial slice continues:
- every new material finding is added here;
- findings contradicting an already-built/current surface are evaluated before forward work;
- `FIX_NOW` findings are fixed+validated or reclassified with evidence;
- future findings appear here and in their milestone TODO;
- intentional deviations stay protected by tests/specs where material;
- ambiguity is not permission to guess;
- M10/final review rechecks all `ROUTED_M10`, `VALIDATION_OPEN` and remaining `AMBIGUOUS` rows.

### M7 CI #884 runtime findings — 2026-10-03

All findings use the exact CI #884 validation EXE and real Windows 125% capture in [the batched findings](../work-log/2026-10-03-codex-m7-ci884-batched-findings.md). Reconcile against that evidence; do not call the native frame strip a recurrence of an older transient symptom.

| ID | Finding | Scope | Disposition |
|---|---|---|---|
| M7-OBS-20261003-03 | Frameless Focus shadow insets expose native frame and offset client from outer-origin region | M7 Windows host / region | **FIX_NOW / IMPLEMENTED_PENDING_VALIDATION** — PR #222 removes native shadow/resize frame consistently in all build configs; retest exact EXE at 100%/125%, movement, transitions, saved-position restart |
| M7-OBS-20261003-04 | Expanded inline Notes shows unnecessary horizontal scrollbar | M7 editor / layout | **FIX_NOW / IMPLEMENTED_PENDING_VALIDATION** — PR #222 bounds box sizing and horizontal content, collapses closed tooltip geometry while preserving its opacity/transform opening state, and aligns the edge tooltip inward. Real rendered keyboard-open/transition/Escape and reduced-motion regressions PASS; preserve intentional vertical editor scroll. Exact-EXE retest remains OPEN |
| M7-OBS-20261003-05 | Larger Notes uses full-host vh and loses footer below expanded 300px region | M7 editor reachability | **FIX_NOW / IMPLEMENTED_PENDING_VALIDATION** — PR #222 binds to visible height, bounds grid columns/Save and resize, and retains editor node/draft. Explicit Narro Windows decision; VE-010 inline flow is preserved |
| M7-OBS-20261003-06 | In-app shortcuts depend on translated key and fail in Greek layout | Shared shortcut boundary, exercised M7 | **FIX_NOW / IMPLEMENTED_PENDING_VALIDATION** — PR #222 uses physical letter code with semantic fallback and controlled regressions; real Greek/English check remains OPEN |
| M7-OBS-20261003-07 | Quick-create loading race leaves focus outside modal so Escape/trap does not run | Focus Create modal accessibility | **FIX_NOW / IMPLEMENTED_PENDING_VALIDATION** — PR #222 owns loading shell and ready title focus; rendered delayed success/error/empty, Tab/Escape and focus restore are covered; physical retest remains OPEN |

