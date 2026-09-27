# Audit → implementation crosswalk

Status: **ACTIVE / authoritative implementation-routing companion**

Created: 2026-09-28

This register exists so Narro does not keep implementing against superseded assumptions after stronger parity, video, Help Center, UI/UX or reliability evidence is found.

It does **not** add an eleventh milestone. `TODO.md` remains the ordered 10-milestone roadmap.

## Binding routing rule

Before changing any surface:

1. inspect the relevant rows here;
2. use the newest evidence/specification, not an older implementation assumption;
3. if a known finding for an already-built/current surface is `FIX_NOW`, correct and validate it before unrelated forward feature work;
4. if the finding belongs to a genuinely later milestone, keep it routed there and ensure that milestone's TODO contains it;
5. if evidence is ambiguous, do not invent behavior;
6. if Narro intentionally improves on a source limitation/bug, retain the improvement as `INTENTIONAL_DEVIATION`;
7. no material finding may exist only in an evidence document without one explicit disposition here.

Disposition values:
- **VALIDATED**
- **FIX_NOW**
- **ROUTED_Mx**
- **VALIDATION_OPEN**
- **AMBIGUOUS**
- **INTENTIONAL_DEVIATION**
- **EXCLUDED**

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
| VE-F007 | Panel→Floating transformation ≈0.27 s; continuous-window character | M7 physical/fidelity gate | **VALIDATION_OPEN** |
| VE-F008 | Preferences children stay in place; hidden times disclose on hover | M8 | **VALIDATED** |
| VE-F009 | Historical first-subtask-live limitation | Do not regress Narro | **INTENTIONAL_DEVIATION** |

Unresolved video ambiguities remain explicit:
- success-screen-disabled Done progression;
- success-screen `Take a Break` post-click semantics;
- exact easing/timing for edited tutorial interactions.

## 3. Help Center / image findings

| ID | Finding | Consequence | Disposition |
| --- | --- | --- | --- |
| HC-F001 | Permanent task delete is `Delete → Confirm` | Keep explicit confirmation/report exclusion | **VALIDATED** |
| HC-F002 | Sessions prose says PDF but current screenshot says CSV | Overview PDF / Sessions CSV | **ROUTED_M9** |
| HC-F003 | Recurrence edit: No Repeat conditionally shows warm/red `Delete existing tasks(n)` | Current scheduling UI does not match | **FIX_NOW** |
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
| UX-F004 | Panel→Floating ≈0.27 s; clipping/blank is source artifact | M7 continuity gate | **VALIDATION_OPEN** |
| UX-F005 | Generic hover/menu/modal/chart timings are not source-measured | Treat tokens as Narro calibration | **VALIDATED documentation rule** |
| UX-F006 | No Repeat replaces neutral Replace row with destructive Delete Existing row | Same gap as HC-F003 | **FIX_NOW** |
| UX-F007 | Task hover keeps geometry; completion left/actions right; anchored overflow | M5 task geometry | **VALIDATED** |
| UX-F008 | Success hierarchy: completed title/context, dominant Next Task, EST/Taken, queue | M8 success UI | **VALIDATED** |
| UX-F009 | Preferences nested controls stay in place | M8 | **VALIDATED** |
| UX-F010 | Floating Timer expands vertically for subtasks | M7 | **VALIDATED source**, physical continuity open |
| UX-F011 | Schedule/recurrence footer uses secondary Cancel + primary gradient action | Scheduling fidelity | **CHECK WITH CORR-01** |
| UX-F012 | Reports hierarchy: four metrics → main chart → secondary panels | M9 | **ROUTED_M9** |
| UX-F013 | Sessions inline edit + Add Session dialog remain contextual | M9 | **ROUTED_M9** |

## 5. Reliability/history findings

| ID | Risk | Required anti-regression | Disposition |
| --- | --- | --- | --- |
| RISK-F001 | Tracked-time loss / Done 00:00 / pause divergence | Session ledger, completion transaction, paused edit rebasing | **VALIDATED M3**, rerun M10 |
| RISK-F002 | Reorder/move duplicate corruption | Stable IDs, exact-set reorder, transactional move, independent duplicate | **VALIDATED M2/M5**, rerun M10 |
| RISK-F003 | Wrong-day/timezone scheduling | Date-only/local-datetime split, DST/week tests, locale presentation | **M4 correctness validated**; display locale still open |
| RISK-F004 | Renderer/navigation/sleep timer corruption | Authoritative Rust runtime | **VALIDATED M3/M6**, M7 physical open |
| RISK-F005 | Backend outage blocked source product | Local SQLite authority | **VALIDATED architecture** |
| RISK-F006 | Monitor hotplug source restart requirement | Event-driven topology recovery | **IMPLEMENTED**, physical M7/M10 open |

## 6. Active M8 audited runtime tasks

| ID | Runtime effect | Status |
| --- | --- | --- |
| PREF-R01 | Timed alerts during live task using persisted interval + authoritative timer/session state | **OPEN M8** |
| PREF-R02 | Finite animated timer flash; reduced-motion safe | **OPEN M8** |
| PREF-R03 | Notification Alerts gating without duplicating authoritative M3 effects | **OPEN M8** |
| PREF-R04 | Schedule reminders enable + lead integrated with durable/idempotent delivery | **VALIDATED** — PR #180 exact head `0309c879998f43ff8c6e39e65f02c44669fa48b8`, CI #607, merge `643528ca223b29fd8fbd215db5b1b525c912c6fc`, main CI #608 |
| PREF-R05 | Sound selector/preview from validated Narro-owned or user-local assets only | **OPEN M8** |
| PREF-R06 | Windows locale/system 12/24-hour presentation | **OPEN M8** |

## 7. Immediate correction queue

### CORR-01 — recurrence update / No Repeat flow

Evidence: VE-017, HC-F003, UX-F006, `help-v2x-recurrence-no-repeat-delete-existing-tasks.jpg`.

Current mismatch:
- Narro always shows warning-styled `Replace Existing Tasks` for an existing recurrence;
- Narro uses a separate `Remove recurrence` button;
- source evidence shows `No Repeat` inside the recurrence flow;
- selecting No Repeat conditionally exposes `Delete existing tasks(n)` in a destructive warm/red row;
- unchecked No Repeat detaches existing children as independent tasks;
- checked Delete Existing removes existing generated scheduled children and leaves the parent as one non-recurring item.

Required correction:
1. expose No Repeat for existing recurrence;
2. replace the normal Replace row with destructive Delete Existing when No Repeat is chosen;
3. preserve expected-version/stale guards and parent identity;
4. unchecked behavior detaches children;
5. checked deletion uses one authoritative transaction;
6. do not silently destroy historical/session-bearing user work — define/test eligible-child deletion rule before mutation;
7. preserve Cancel + primary gradient action hierarchy;
8. add Rust/frontend/visual regressions.

**Status: FIX_NOW. Unrelated M8 forward work is paused until this validates.**

After CORR-01: PREF-R01 → PREF-R02 → PREF-R03 → PREF-R05 → PREF-R06 → M9.

## 8. No-orphan gate

Before a milestone or substantial slice continues:
- every new material finding is added here;
- findings contradicting an already-built/current surface are evaluated before forward work;
- `FIX_NOW` findings are fixed+validated or reclassified with evidence;
- future findings appear here and in their milestone TODO;
- intentional deviations stay protected by tests/specs where material;
- ambiguity is not permission to guess;
- M10/final review rechecks all `ROUTED_M10`, `VALIDATION_OPEN` and remaining `AMBIGUOUS` rows.
