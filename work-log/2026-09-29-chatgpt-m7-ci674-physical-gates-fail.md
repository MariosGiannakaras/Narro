# 2026-09-29 — PR #192 CI #674 physical Gate 7 / Gate 12 failure

**Agent:** ChatGPT  
**Scope:** exact-build physical continuity + mixed-DPI validation  
**PR:** #192 / `plan/m7-single-focus`  
**Exact source head:** `44119dbe829131d38f56fd35250142ed973b2574`  
**Windows CI:** #674 / run `36609576132` — PASS  
**Runtime artifact:** id `11052303615`, digest `sha256:eca3865bb08d754f7f43a0b9bd436f6a83a45f89b209345a328b66ec8c534bfd`

## Capture provenance

User-supplied recording: `2026-09-29 21-50-58.mp4`

- SHA-256: `281834ac49986549cab0fc3ab7d716ee24c53d5609499f2ae83aaad7ec56642f`
- H.264, 4480×1080
- 60 fps
- duration: 60.183 s
- two Windows displays are captured together;
- user explicitly confirms the alternate display is configured at 125% scaling;
- the same identifiable task `fas` remains active and timer/session time advances across the tested presentation/display changes.

Earlier 21:32/21:33 recordings in the chat were from CI #672 and are **not** evidence for this corrected candidate. They were not committed as #674 evidence.

## Gate 7 — FAIL

The CI #674 focus-document transparency correction successfully removes the prior opaque 340×700 white/blank host tail. However strict Gate 7 still fails because Panel↔Timer is not visually continuous.

Repeated cycles in the exact #674 recording show the same spatial-jump signature:

- Panel→Timer around ~39.1–39.4 s;
- Timer→Panel around ~41.3–41.4 s;
- Panel→Timer around ~42.6–42.8 s;
- Timer→Panel around ~44.3–44.4 s;
- Panel→Timer around ~45.9–46.2 s.

The clearest final Panel→Timer sequence contracts the Panel at the far-right Panel position until only a thin top remnant remains, then the compact Timer appears at its separately restored Timer position. The visible surface does not travel continuously between those positions. The reverse direction similarly replaces the Timer at its floating position with the Panel at the monitor edge.

This is a new exact-build failure signature, distinct from the #672 opaque document-canvas tail.

## Gate 12 — FAIL

The 125% display path is now directly exercised.

Positive evidence:
- compact Timer reaches the 125% display;
- expanded Timer at ~50.0 s measures 425×375 physical px in the captured desktop, matching 340×300 logical px at 125%;
- the same task/session/time remains continuous.

Failure evidence:
1. The user reports that crossing to the other display requires multiple drag attempts rather than one normal drag.
2. After the mixed-DPI move/return path and Panel restoration, the Panel at ~53 s is visibly malformed: content is offset/clipped and browser-level vertical and horizontal scrollbars are exposed.
3. That malformed Panel/scrollbar state persists through the end of the recording rather than self-healing.

The current Win32 display observer treats every `WM_DPICHANGED` as an immediate topology-recovery trigger. During an interactive cross-monitor drag this allows Narro recovery to compete with the user's native move loop. The Panel restoration path also sizes/reclips immediately after a cross-DPI position change, creating a stale-DPI/viewport race.

## Evidence-backed corrective scope

Keep the selected one-`focusSurface` architecture and the CI #674 document transparency fix.

### Mixed-DPI / movement

- defer Narro display recovery while Windows is in an interactive native move/size loop (`WM_ENTERSIZEMOVE` → `WM_EXITSIZEMOVE`);
- coalesce `WM_DPICHANGED` during that drag and run one recovery after the move settles;
- make Panel host sizing/region restoration deterministic against the target monitor scale rather than relying on a potentially stale immediate post-move window scale;
- preserve saved floating placement, visible-region clamping and session authority;
- add regression contracts for one-drag cross-monitor movement and post-DPI Panel recovery invariants.

### Gate 7 continuity

- preserve the transparent document canvas;
- remove the remaining saved-position teleport at Panel↔Timer boundaries by coordinating native position motion with the existing finite ~270 ms same-WebView geometry transition;
- do not reintroduce hide/show/resize as the ordinary presentation mechanism;
- keep rollback explicit and reduced-motion behavior bounded.

## Progress

No validated progress counter advances:

`4/10M || 2/5 | 11/19`

Gate 7 remains FAIL/OPEN. Gate 12 is now FAIL/OPEN rather than NOT RUN.

## Exact continuation

Continue on PR #192. Reconcile current main tracking truth first, then implement only the two evidence-backed failure families above. Run exact-head Windows CI before the next physical retest. The next physical batch must recheck both Gate 7 continuity and Gate 12 one-drag mixed-DPI recovery on the same exact artifact.
