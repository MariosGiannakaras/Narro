# M7 CI #514 physical failure and transparent host prewarm — 2026-09-25

## Scope

This immutable entry records the user-provided 60 fps physical Windows evidence against CI #514, the evidence-backed PR #147 correction, exact-head/resulting-main CI validation, and the next required physical retest. M7 item 7 remains open.

## CI #514 physical recording

Input recording: 2560×1080 H.264 at 60 fps, approximately 43.184 s, captured from the CI #514 runtime build for validated source `c875b4894e90cc75c04c9ff9508ef1dc1a176ad5`.

Frame inspection found two related failure classes.

### Normal Windows animations

During Panel→Timer around ~14.7–15.0 s, the outgoing Panel fades, then the Timer target briefly presents intermediate renderer states such as no-active/loading task before the authoritative task projection is settled. This is visible staging and does not satisfy the continuous transition criterion.

### Actual Windows animations Off

The recording opens Windows 10 Settings → Ease of Access → Display and visibly switches `Show animations in Windows` from On to Off at approximately 27 s.

With that real OS setting Off, transitions around ~32.8 s and ~34.3 s expose blank white target-host frames before Panel content appears. In the first inspected sequence, multiple consecutive 60 fps frames are blank/white before the target hierarchy becomes visible. The failure therefore persists independently of nonessential CSS/OS translation.

Scoped result for CI #514 item-7 continuous visual criterion: **FAIL**.

## Diagnosis

PR #145 had corrected renderer/native ownership order to:
hidden native target prepare → synchronous target React publish → two-requestAnimationFrame barrier → native show/reveal.

The physical result demonstrates the remaining flaw: the presented-frame barrier runs while the native WebView host is hidden. WebView2 is not guaranteed to produce a composited frame suitable for immediate reveal while the HWND remains hidden. Showing the host can therefore expose its default/blank surface before WebView2's first composed target frame.

## PR #147 correction

PR #147, `Fix M7 focus host prewarm before reveal`, exact head:
`8f173cd37fc8d1506ec546feb2248e92db81cebe`

Tree:
`ab122091235c2f3720df74ede84152238020cfd9`

The narrow correction preserves hidden geometry preparation and target React publication, then:
- resolves the real `focusSurface` HWND;
- temporarily adds `WS_EX_LAYERED` only when Narro does not already own that style;
- sets layered alpha to 0;
- shows the real host fully transparent;
- waits the existing finite two-requestAnimationFrame barrier while WebView2 is actually visible/painting;
- reveal restores alpha 255, removes the Narro-added layered style, focuses Panel when appropriate, and only then records native presentation authority;
- cleanup/recovery explicitly uncloaks the host and the coordinator recovers the previous mode through the same transparent-prewarm path.

No second focus webview, fixed-delay workaround, renderer timer/session ownership, continuous animation or high-frequency geometry loop was added.

A broader parallel PR #146 existed for the same physical failure. Once #147 supplied the narrower host-boundary correction and merged, #146 was commented as superseded and closed to preserve a single implementation line.

## Validation

PR #147 Windows CI #516 / run `36186563007`: **PASS** on exact head.
- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- runtime artifact `10886772181`, digest `sha256:14491b38fd6a6d2144856353c46964fe6e24fa0d9b02d81219f2e801c5f58585`;
- visual artifact `10887286466`, digest `sha256:a4e9b442382d86e5d6be437d20a59ded4543c2b5c88aad8f13cbba3adc595f11`.

Expected-head guarded squash merge:
`f59e4d16a49659832ea562c3718cc5ba748b74fb`

The resulting-main tree is `ab122091235c2f3720df74ede84152238020cfd9`, identical to the validated PR-head tree.

Resulting-main Windows CI #517 / run `36188196900` / job `108246665399`: **PASS**.
- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- runtime artifact `10886794088`, digest `sha256:644ca2135ec313334da862778869a7d1cd5771b62840bc43fbd4aeadaa67dbb5`;
- visual artifact `10887670005`, digest `sha256:6a553510abc8ee15100e419d89378b86c441365cef8dd2b6bce6d8d57d3e6982`.

## Physical status

The new #147/#517 source has **not yet been physically retested**. Automated success cannot prove desktop compositor continuity.

Exact next physical action:
1. use CI #517 runtime artifact `10886794088`;
2. record Panel→Timer→Panel and Timer expand/collapse at 60 fps with normal Windows animations;
3. switch actual `Show animations in Windows` Off and repeat Panel→Timer→Panel;
4. restore the Windows setting;
5. inspect for any blank/pale/staging/loading target frame, abrupt return flicker, horizontal scrollbar, stale expanded pixels, or session discontinuity.

M8 remains blocked until M7 acceptance is complete.
