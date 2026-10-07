# Finding28 — CI1029 rendered post-drag action-rail result

Date: 2026-10-07

Status: **RENDERED BROWSER-DOM CONTRACT PASS / NO PRODUCTION FIX / NATIVE TAURI-WEBVIEW-UIA DISCREPANCY OPEN**

Progress remains `3/10M || 0/3 | 17/18`.

## Exact candidate

PR245 / `test/finding28-post-drag-action-rail-regression`  
Exact head: `a2dcd17e6742993756bbeda77f3adcf37b55a462`  
Windows CI1029/run: `37641360794`

At the time of this record the workflow is still completing later packaging/diagnostic steps, but the full Windows visual-regression step has already completed **PASS** and uploaded artifact `narro-m5-visual-regression` id `11491934666`.

Artifact digest: `sha256:af200c312b64f43be7dd66e93c78d22164f34fe71fffbd2b6e3a3c5dc360a0a2`.

Rendered result file: `finding28-post-drag-action-rail.json`.

## Harness boundary

CI1023 proved that headless Edge/CDP `Input.dispatchMouseEvent(mousePressed)` emits `mousedown` but not `pointerdown` in this transport, while Narro starts production drag from React `onPointerDown`.

The final regression therefore discloses and bounds one synthetic layer:
- drag start/move/up use deterministic synthetic `PointerEvent` transport;
- drag start targets the production reorderable shell directly;
- pointer id `41` is reserved for that synthetic stream;
- the event is explicitly recorded as `isTrusted=false`;
- the event enters the real React `onPointerDown` path and the real production window drag listeners;
- the resulting reorder goes through the production board mutation/refresh path in the fixture.

The Finding28 decision probes remain real browser input:
- Tab / Shift+Tab are Edge CDP key events;
- hover is actual Edge pointer movement.

No production source/CSS behavior is changed by PR245.

## Exact rendered observations

The regression committed exactly one same-lane reorder:
- initial order: task1, task2, task3;
- final order: task2, task1, task3;
- `mutationCount=1`;
- title editor remained closed.

### Post-drag neutral state

- active element: document body;
- card `:focus-within=false`;
- shell `:focus-visible=false`;
- card `:hover=false`;
- rail: `opacity=0`, `visibility=hidden`, `pointer-events=none`.

### Focused title

The production title button is focused:
- `activeKind=title`;
- active task is task1;
- card `:focus-within=true`;
- shell `:focus-visible=false`;
- card `:hover=false`;
- rail: `opacity=1`, `visibility=visible`, `pointer-events=auto`.

This directly proves the current CSS child-focus reveal contract in the rendered production DOM.

### Real Edge Tab / Shift+Tab

After real Edge Tab:
- focus moves to the task Subtasks action;
- card `:focus-within=true`;
- rail remains visible/interactable.

After real Edge Shift+Tab:
- focus returns to the title;
- card `:focus-within=true`;
- rail remains visible/interactable.

No second mutation occurs.

### Real Edge hover

After focus is removed and the pointer is away:
- rail returns to hidden/inert baseline.

After actual Edge pointer movement over the task card:
- card `:hover=true`;
- rail becomes visible/interactable.

## Disposition

The exact CI953 native observation remains valid evidence:
- UI Automation reported `HasKeyboardFocus=true` on the Alpha title;
- the rail UIA action controls were absent;
- actual pointer hover then exposed the rail.

However CI1029 proves that the current production rendered browser DOM/CSS authority behaves correctly for the same focus/hover contract:
- focused title establishes `:focus-within`;
- focus reveals the rail;
- keyboard traversal enters the rail;
- pointer hover reveals the rail.

Therefore:

**NO PRODUCTION CSS / TaskCard / focus workaround is justified from Finding28.**

The unresolved contradiction is now routed to the native Tauri/WebView/UIA observation boundary: UIA focus/action exposure, native WebView projection, or another physical-only authority outside the deterministic browser-DOM contract.

Do not add broader CSS selectors, force the rail persistently visible, or reassign focus merely to make CI953's UIA snapshot agree with the rendered DOM.

## PR245 merge boundary

PR245 is useful durable regression coverage and may be merged only after exact-head CI1029 completes fully green.

Before merge:
- re-check exact PR head;
- use expected-head guard;
- protect current authoritative Markdown on `main` from the older branch;
- PR245 must not restore stale HANDOFF/TODO/STATUS/evidence truth.

After merge:
- validate resulting main as required by repository workflow;
- keep the native Finding28 discrepancy OPEN unless a physical/current-candidate observation resolves it.
