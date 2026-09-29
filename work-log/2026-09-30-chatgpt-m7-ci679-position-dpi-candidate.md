# 2026-09-30 — PR #192 CI #679 position/DPI corrective candidate

**Agent:** ChatGPT  
**Scope:** exact-build correction for CI #674 Gate 7 spatial discontinuity and Gate 12 mixed-DPI recovery failure  
**PR:** #192 / `plan/m7-single-focus`  
**Exact source head:** `c0be4ec0fe94863182bbf0d2e1ba4931ada67d93`  
**Windows CI:** #679 / run `36630411679` — PASS after rerunning the cancelled build-and-test job on the same exact head  
**Runtime artifact:** id `11065275562`, digest `sha256:8b50e089fdaf6e5eaf572dd2b469eac42a521a8ea447c4532161edbc35163400`  
**Visual artifact:** id `11064761303`, digest `sha256:00f25712f57349bb70bbbbaddacc177c220967bbb6bfb9006c7307bbb89f4e7e`

## Evidence basis

The preceding exact #674 physical recording is immutable evidence in
`work-log/2026-09-29-chatgpt-m7-ci674-physical-gates-fail.md`.

That recording proved two independent remaining failure families:

1. Gate 7 no longer exposed the old opaque blank-host tail, but Panel↔Timer still teleported the persistent HWND between Panel edge placement and saved Timer placement.
2. Gate 12 reached correct 125% Timer geometry, but mixed-DPI movement/recovery could resist the drag and the return-to-Panel path could leave a stale WebView viewport with horizontal/vertical browser scrollbars.

The earlier 21:32/21:33 recordings were CI #672 and remain excluded from #674/#679 acceptance evidence.

## Corrective implementation

The same single-`focusSurface` architecture is retained.

### Gate 7 position continuity

- Panel↔Timer mode changes now plan the final native destination before commit.
- A finite native position motion runs concurrently with the existing ~270 ms same-WebView renderer geometry motion.
- Timer→Panel expands the already-prepared transparent host region before movement; the actual Panel is already painted underneath.
- The final native presentation transaction still applies exact target geometry/attributes and retains rollback.
- Ordinary presentation changes still do not create/destroy/hide/show the Focus WebView or use ordinary resize as the transition mechanism.

### Gate 12 mixed-DPI recovery

- `WM_ENTERSIZEMOVE` / `WM_EXITSIZEMOVE` now delimit interactive native movement.
- Display/DPI recovery is marked dirty but deferred while an interactive move is active.
- One recovery is requested after the move exits when relevant geometry/DPI events occurred.
- Programmatic Panel↔Timer native movement also suspends competing display recovery.
- Panel host sizing is computed from the selected target monitor scale, with target-monitor staging before the exceptional physical host-size correction and final full-host region application.
- Timer destination planning uses target-monitor scale rather than the current monitor's stale visible size.

### Regression contracts

Architecture/static/transition contracts now require:
- finite native position motion coordinated with renderer motion;
- no instant production Panel↔Timer teleport path;
- interactive/programmatic display-recovery deferral;
- target-scale Timer planning;
- transparent Focus document canvas;
- single persistent `focusSurface` and explicit rollback.

## CI #679

The first build-and-test attempt was externally cancelled while the Windows visual-regression capture was running. It had already passed Repository Preflight and the Rust test suite and exposed no code failure signature.

The cancelled build-and-test job was rerun on the **same exact head** `c0be4ec0fe94863182bbf0d2e1ba4931ada67d93`. The rerun completed successfully:

- validation gate: PASS;
- Repository Preflight: PASS;
- Windows visual-regression capture/validation: PASS;
- reused frontend-dist verification: PASS;
- Tauri release build: PASS;
- diagnostic runtime artifact upload: PASS.

The downloaded runtime ZIP was independently hashed after download and matched the GitHub artifact digest exactly:
`sha256:8b50e089fdaf6e5eaf572dd2b469eac42a521a8ea447c4532161edbc35163400`.

## Validation state

Automated validation is PASS for the corrected candidate, but neither physical gate is promoted from this evidence.

- Gate 7: **RETEST OPEN** — verify no blank/light host exposure and no spatial teleport/jump through repeated Panel↔Timer cycles.
- Gate 12: **RETEST OPEN** — verify one normal drag reaches the user-confirmed 125% display, compact/expanded geometry remains correct, and return to Panel has no browser scrollbars, clipping or stale viewport.
- task/session identity and elapsed-time continuity must remain intact.

No progress counter advances until the physical batch passes:

`4/10M || 2/5 | 11/19`

## Exact continuation

Use only CI #679 runtime artifact id `11065275562` from exact head
`c0be4ec0fe94863182bbf0d2e1ba4931ada67d93` for the next physical batch.

Do not merge PR #192 before Gate 7 and Gate 12 both receive exact-build physical acceptance.
