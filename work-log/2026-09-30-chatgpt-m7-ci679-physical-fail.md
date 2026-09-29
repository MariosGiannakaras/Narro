# 2026-09-30 — PR #192 CI #679 physical Gate 7 / Gate 12 failure

**Agent:** ChatGPT  
**PR:** #192 / `plan/m7-single-focus`  
**Exact tested source:** `c0be4ec0fe94863182bbf0d2e1ba4931ada67d93`  
**Windows CI:** #679 / run `36630411679` — PASS  
**Runtime artifact:** id `11065275562`, digest `sha256:8b50e089fdaf6e5eaf572dd2b469eac42a521a8ea447c4532161edbc35163400`

## Physical capture

User-supplied exact-build recording: `2026-09-30 01-11-12.mp4`

- SHA-256: `e128d5fb08392f08312d237a9dab2a6d0d75a50611ac34331aa7454077a69642`
- H.264, 4480×1080, 60 fps
- duration: 58.483 s
- both Windows displays are visible;
- the alternate display remains user-confirmed at 125%;
- Windows animations are visibly On in Settings;
- identifiable task `fas` remains the same and elapsed time advances through the test.

## Gate 7 — FAIL, with position continuity improved

The #679 native position correction removes the previous saved-position teleport: Panel↔Timer now visibly travels between positions rather than disappearing at one position and reappearing at another.

However strict visual continuity still fails. During Panel→Timer, the native visible region remains full Panel height while the HWND is moving. Because the Focus document is intentionally transparent, this exposes the otherwise invisible lower 340×700 host as a tall transparent/black rectangle with bright vertical outline below the shrinking Timer content.

Clear evidence:
- around 40.70–40.90 s, the compact Timer top moves continuously while a full-height transparent outlined host remains exposed below it for multiple 60 fps frames;
- the same signature repeats around the later Panel→Timer transition near 47.4–47.8 s;
- no return of the older opaque white #672 tail is observed.

Evidence-backed cause in exact #679 source:
`animate_focus_surface_presentation_internal` animates native position before reducing the Panel native region to the Timer target. The document transparency fix therefore converts the former opaque host exposure into a transparent outlined host exposure rather than eliminating the region mismatch.

Required correction:
- for Panel→Timer only, apply the prepared target Timer native region before finite HWND position motion begins;
- preserve the same HWND/WebView, saved target position, rollback and renderer motion;
- do not restore hide/show/resize transition mechanisms.

## Gate 12 — FAIL, with drag behavior substantially improved

Positive evidence:
- one ordinary continuous drag moves the Timer from the right display onto the 125% display without the prior repeated-push/snap-back behavior;
- compact geometry reaches approximately 425×138 physical px, matching 340×110 logical at 125%;
- expanded geometry reaches approximately 425×375 physical px, matching 340×300 logical at 125%;
- compact/expanded state changes there remain usable;
- task/session/time continuity survives.

Remaining strict failure:
- Timer→Panel return from the 125% display still reveals a transient stale WebView viewport during target-DPI host correction;
- around 53.50–53.60 s, the returning Panel first appears as a very narrow clipped strip, then as a full Panel with browser scrollbar exposure before settling to the correct viewport;
- an earlier return around 21.9–22.1 s shows the same short-lived scrollbar/stale-viewport family.

Evidence-backed cause:
- the animated Timer→Panel path exposes the full Panel region before/while the host adopts target-monitor physical DPI geometry;
- the native host size updates before WebView2's logical viewport has fully settled, so the full Panel briefly exposes the stale viewport.

Required correction:
- on cross-DPI Timer→Panel only, keep the previous Timer region clipped while the target host physical size/position settles;
- then reveal the full Panel after a bounded viewport-settlement interval;
- preserve same-DPI continuous Timer→Panel reveal.

## Current corrective candidate

The same PR now contains the narrow sequencing correction:

`8a60e92e47ae407098a1f3170ae4170848d262eb`

Changes:
- Panel→Timer clips to the target Timer region before native position animation;
- cross-DPI Timer→Panel keeps the previous Timer region through target-size correction, waits a bounded 50 ms viewport-settlement interval, then exposes the full Panel;
- same-DPI Timer→Panel retains the existing continuous full-Panel reveal;
- architecture/static contracts enforce both sequencing rules.

Windows CI #682 / run `36639559040` is pending for that exact head at the time of this immutable entry.

## Progress

No physical checkpoint advances:

`4/10M || 2/5 | 11/19`

PR #192 must remain open. After exact-head CI succeeds, one more combined Gate 7 + Gate 12 physical recording is required.
