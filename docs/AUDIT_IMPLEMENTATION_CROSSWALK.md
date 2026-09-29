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
| VE-F007 | Panel→Floating transformation ≈0.27 s; continuous-window character | M7 physical/fidelity gate | **VALIDATION_OPEN** — PR #192 head `b506fd01...` now contains unvalidated finite ~270 ms same-WebView Panel↔Timer and compact↔expanded Timer clip/reveal implementation; physical Gate 7 evidence is still required |
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
| PREF-R01 | Timed alerts during live task using persisted interval + authoritative timer/session state | **VALIDATED** — PR #184 exact head `fc61ed5926fdb1c605de8ce1e1a9fb28ea0dfd7e`, CI #624, guarded merge `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`; merged source verified identical to validated PR source for all changed blobs |
| PREF-R02 | Finite animated timer flash; reduced-motion safe | **OPEN M8** |
| PREF-R03 | Notification Alerts gating without duplicating authoritative M3 effects | **OPEN M8** |
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
| M7-PHYS-01 | Panel↔Timer transitions expose blank/light host pixels; earlier implementations also exposed pure-white resize frames and stale expanded surfaces | M7 visual continuity | **FIX_NOW / STRICT GATE FAIL** — PR #192 exact head `73d10ab6a21d731ca363e9932b4ccaf13a000b43` passed Windows CI #672 but the exact artifact physically failed Gate 7 with Windows animations On. The 60 fps recording repeatedly shows ~0.23–0.25 s blank/light 340×700 host exposure on Panel→Timer and shorter reverse-boundary exposure. Compact↔expanded cycles did not show the same full-height tail. Evidence-backed cause: `focusSurface` is transparent natively, but `App.css` paints an opaque `:root`/`body` canvas while renderer clipping and Win32 region temporarily differ. Keep the single-host architecture; correct the focus-document background transparency and revalidate the exact new head. See `work-log/2026-09-29-chatgpt-m7-ci672-physical-fail.md`. |
| M7-PHYS-02 | Moving visible compact Timer to 125% secondary monitor shrinks its outer size and clips controls with both scrollbars; mode reapply restores size | M7 topology/DPI | **FIX_NOW / PHYSICAL VALIDATION OPEN** — PR #192 exact head `73d10ab6...` passed Windows CI #672 including Rust topology/DPI/work-area tests and release build. The mixed-DPI physical retest on a visible secondary display is still required; CI does not close Gate 12. |

Both findings concern already-built M7 surfaces. The closed PR #191 is historical evidence, not validation of the replacement. PR #192 passed exact-head CI on `73d10ab6...`, but Gate 7 then physically failed on that exact artifact; M7-PHYS-01 therefore remains an active evidence-backed corrective defect. Gate 12 remains physically untested on the replacement. The 2026-09-29 corrective audit also hardened PR #192 against stale async Focus board refreshes by requiring current target, timer revision, live-task id and open-session id before publishing a refreshed board; this is implementation hardening, not a new physical PASS. Because the replacement changes the implementation basis of earlier/later integration points, `TODO.md` also reopens the materially affected M1 Gate A items, M6 Gate F integration items, M7 host-dependent items, and M8 Focus-shortcut items. PREF-R01 and unaffected M8 settings/persistence work remain validated.

## 8. No-orphan gate

Before a milestone or substantial slice continues:
- every new material finding is added here;
- findings contradicting an already-built/current surface are evaluated before forward work;
- `FIX_NOW` findings are fixed+validated or reclassified with evidence;
- future findings appear here and in their milestone TODO;
- intentional deviations stay protected by tests/specs where material;
- ambiguity is not permission to guess;
- M10/final review rechecks all `ROUTED_M10`, `VALIDATION_OPEN` and remaining `AMBIGUOUS` rows.
