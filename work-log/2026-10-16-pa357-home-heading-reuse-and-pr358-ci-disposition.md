# Additional PA357 reuse and first PR358 CI diagnosis

## B55 — scoped Home heading geometry closes without another capture

Direct final comparison of canonical SS-C03 `current-v2.6.69-home-dark.png` and SS-C16 `current-v2.6.69-home-light-list-hover.png` with exact PR357 CI38796243985 `home-dark.png`/`home-light.png`, plus the actual native populated Home `05-created-list.png` and `observations/05-created-list-uia.json` in the published PA357 packet, confirms the **Your Lists left / contextual helper right / same heading row** target.

Native100% text rectangles: Your Lists `[266,257,335,278]`, helper `[793,254,1010,276]`. Their vertical extents overlap and the helper ends at the section's right edge1010; it is not below the title. The native window was the ordinary1016px-wide Main, so this also exercises the compact desktop layout. Current exact PR358 HomeDashboard.tsx/homeDashboard.css blobs are unchanged from accepted a56571d2.

**B55 SOURCE_STATIC_GEOMETRY_PASS / SCOPED_NATIVE_PASS**. This closes that one specific heading/helper finding and its TODO item. It is not whole Home pixel/motion/hover, greeting, tile, preview, icon,125% Home or allM5 acceptance. CI theme screenshots do not become native light-theme evidence. Sources and native original images are retained; this final verification is not a repeated forensic research pass. This is one additional reused static claim, beyond the four originally scoped PR357 fixes, with no new app launch/build/recording.

B46 ordinary repeated-title interaction has scoped native evidence from the same recording (cleared/refocused same form, stable independent identities); nonempty EST-reset and broader capture-duration claims are not newly exercised. B62's subdued empty CTA rendering is visible, but UIA says its button remains enabled and it was not clicked while empty. Keep its empty-click/source-behavior boundary OPEN; do not mislabel enabled state as a failure or claim unperformed activation.

## PR358 first CI — actual root cause, no speculative product patch

Exact head17d8ad043e8b1851ade32ea8d1795841854257c1/run38825996083: validation-gate/fast-gate SUCCESS; Windows **Check Rust SUCCESS**, then **Run Clippy FAIL** before Rust tests. Diagnostics name only dead-code from importing the shared integration support module into a new binary: `MUTATED_AGAIN_AT`, `ListFixture::archived`, `TaskFixture::completed/archived` unused in that target. The later missing runtime-artifact upload is downstream because Clippy prevented capture/build, not a second product defect.

Narrow correction uses the existing archived/completed fixture builders in the actual protected-state regression cases and the second mutation timestamp for the post-state-clear attempt. It removes equivalent direct SQL setup; no product source change, warning suppression, relaxed CI/test, helper deletion or test-count inflation. Exact new head **6a6079465fab293b973258083550192d640f4884**. Rustfmt/check diffPASS; frontend12-scenario receipts/aggregate remain valid because only Rust test setup changed. New exact-head full CI is required. Local Rust execution still unavailable due missing link.exe.

The original failed run/log remains immutable. Product/native acceptance0/2 staysOPEN, original PR3574/4 staysaccepted. WholeM5 remainsOPEN; M1–M4=4/10; M10entry blocked.
