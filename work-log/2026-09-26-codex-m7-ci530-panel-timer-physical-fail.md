# M7 CI #530 physical transition check — 2026-09-26

## Build and setup

- Tested the exact Windows runtime artifact `10902390320` from successful resulting-main CI #530 (source `449eb5d1fda4a8d26832e803433209025a6dec38`, tree `51b27ba7a867dcea79a49927cb1ed4e0ee7bda6b`). Artifact digest: `sha256:726991f5a92eadda25eaa833d0a7443c21531896eb56e462609a0db6988cc6de`. Extracted `narro.exe` SHA-256: `9B535A2DF974C1C7BC70DE052D0C0546B20CA34266A463C0A7E83ECE3684BE1E`.
- Windows 10 build 19045; `MinAnimate=1` (Windows animations On). Active task `fas` remained paused with displayed value `07:40` in the observed frames. The existing user profile was backed up before launch and restored after quitting the exact test process; restored database SHA-256 `957920F31B5507D2E7A461E1F4954DA424485A69D9E3F4EFFACAD02A32770211`.
- A 25-second continuous desktop capture produced 656 frames during three Panel→Timer→Panel shortcut cycles. The settled accessibility state after each Ctrl+Shift+T request alternated as expected, using one Focus window. This does not establish the visual continuity criterion.

## Gate 7 result: FAIL

The third observed Panel→Timer passage visibly exposed empty and desktop frames before the Timer appeared. The checked sequence is retained in `work-log/evidence/m7-ci530-transition/`:

| Frame | Observation |
| --- | --- |
| [389](evidence/m7-ci530-transition/frame-389.png) | Panel with paused task `fas` |
| [391](evidence/m7-ci530-transition/frame-391.png) | nearly uniform pale focus window, no Panel or Timer content |
| [394](evidence/m7-ci530-transition/frame-394.png) | desktop visible in the former Panel area; focus window absent there |
| [395](evidence/m7-ci530-transition/frame-395.png) | Timer with `fas` and `07:40` appears |

The frame classifier also flagged frames 390–393; direct inspection of 391–394 confirms a real visual discontinuity. This fails the explicit no-blank/no-pale/no-staging criterion of `docs/M7_FLOATING_RUNTIME_VALIDATION.md`. The continuous capture was below the preferred 60 fps but is sufficient to prove the failure because it caught several successive affected frames. No claim is made about the precise duration of the gap.

Code inspection after the failure identifies a plausible path, not a proven sole cause: `FocusSurfaceTransition` fades the outgoing content to opacity zero before the same native focus window is hidden for geometry change. `prewarm_focus_surface` later shows it at transparent host opacity until reveal. That sequence permits blank/desktop exposure even when target projection readiness is correct. A correction must be validated on a new exact build with physical continuous capture; static contracts and CI alone cannot close Gate 7.

## Other gates

- Gate 7 Expand/Collapse and animations Off: **NOT RUN** on #530.
- Gates 8–12: **NOT RUN** on #530. Earlier scoped evidence remains as recorded; do not infer complete acceptance from it.
- M7 stays active at 8/14; M8 must not begin. Next work is a coherent transition correction with executable state/failure tests, local preflight, exact-head CI, guarded merge, and a consolidated physical re-test of remaining gates on the new build.
