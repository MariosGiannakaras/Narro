# HANDOFF — PA01–08 Windows acceptance

## Current operation

PA356 acquisition **2/2**, review **2/2**, targeted acceptance **2/2 PASS scoped**. Reports/PDF **PASS**, M9export **12/12**; narrow M8 actualtheme-save/Tab/Escape gate closed after same-EXE neutral-input diagnostic, actualLG dark/light and externalviewer return. [Current report](docs/WINDOWS_PA356_NATIVE_REPORT_2026-10-15.md), [workflow review/actions](work-log/2026-10-15-pa356-workflow-review.md). No new product patch/build/CI for diagnostic. Mandatory milestones **3/10**, M10blocked; HDMI user-deferred manualNOTRUN, PA09/M11excluded.

**NEXT:** this candidate's two confirmed residual fixes are accepted2/2. Continue only independently outstanding PA01–08 gates in the report (quietperformance, conditionalOSdenial/listenerfailure, clean-machine/older-schema/trueboot), preserving exactaccepted evidence. HDMI is user-deferred manualNOTRUN. Sourceparity/PA09 and M11 are outside this native slice; mandatory3/10/M10blocked, no wholemilestonecompletion. User-requested workflow review is complete/applied. No unresolved newNarro bug was proved by the excluded08:38 attempt; do not reopen Preferences merely from that historical episode.

Keyboard workflow now checks expectedmodifiers, ownedforeground/nativefocus-root, actualselected/persisted state and positivevisiblepostcondition; initialmissingUIA/occlusion must abort orrecover before keys. In the diagnostic LeftAlt was actually down and released, originunknown; original08:38state remainsunproved. Neutral actualLG dark/light save/Tab/Escape and realexternalviewer-return allPASS without newcode/CI.

## Exact accepted candidate and safe state

PR356 sourcef7456738b8b8498387d4d9637409c4a384f95ba3; CI38688646540 all3SUCCESS; mergee0e7c3b3c9dd7352d5514bddd98457e8a457b93d; source/build/test/config539/539 equal, workflow unchanged. Duplicate resultingmain38706169738 CANCELLED under strategy7. EXE b2d51e4e8b97f2feb5ae8235f91222126eca498c3615722e68531f912ec50293 at `E:\SystemFiles\Desktop\Narro-PA356-native-20261015\analysis\validation\narro-m7-validation.exe`.

Raw whole395.5s OBS4480×1080/60fps/two ordered binary parts, fourPDFs, nativeUIA/actions/screens/system and complete7logs published; review includes12 renderedPDFpages and video frame sequence. Personal originalDB SHA13185e54bc0ea08f3b368ccc48a8ede429683e1d58a60b15b8f7491a06d2224d restored; motion0/false restored, DISPLAY1primary100 andLG125/nonprimary unchanged. No Narro/recording/viewer active. New launch requires fresh ownedprofile protection, never replay isolate-profile.py against an already-restored ledger.

**USER ACTION:** none now. PA05 actual HDMI unplug/replug explicitly deferred manualNOTRUN; do not re-ask. Quiet performance, OSdenial/listenerfailure, clean-machine/older-schema/trueboot and sourceparity remain distinct OPEN/NOTRUN. Prior accepted scopes and sourceowner work retained. SpectrumCore/imageupload/218icons locked; PA09/M11excluded, mandatory3/10/M10blocked.

## Workspace

Main `C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload`; source checkout `E:\SystemFiles\Desktop\Narro-PA352`. Preserve dirty original NarroUpload and unrelated generatedicons. Authoritative Markdown/evidence directly onmain `[skip ci]`; source/config/tests use coherentPR/exactCI. [Prior handoff snapshot](work-log/2026-10-15-pa356-superseded-handoff-snapshot.md) is historical.
