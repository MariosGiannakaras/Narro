# HANDOFF — corrected PR437 native retest frozen

**Last reported: 2026-10-29; owner Codex Windows; phase DONE (acquisition and bounded analysis).** User explicitly resumed the remaining work. Native phase is no longer paused for this authorized session. No owned Narro/recorders run; original personal profiles restored hash-identically, original dual-display layout and client-area animation setting restored. No source/config/test changes, new CI or merge.

## Exact candidate and independent results

PR437 `integration/m7-v4-current-timer-20261027` remains OPEN/DRAFT/UNMERGED, head `41e8ff8ad8584b74821f3185401ed0c9740fc991`; exact CI40677357491 3/3 SUCCESS. Physical ZIP12812013589 digest `8342835987274ad6e0893306ab7ad14ef6f90b66359669ef4305d58f4651356f`, EXE `3c14067a28aea1a594546b888e9dbc688ed4374d0f698cef2c6c5986abbdc002` independently verified on Windows before launch. [All recordings, frame evidence, PTS, HWND and outcomes](work-log/evidence/pr437-corrected-native-20261029/README.md).

- **3/3 corrected feature scenarios exercised; 2 scoped PASS, 1 FAIL.** These are scenario counts, not milestone completion or complete acceptance of all variants.
- **J01 PASS scoped:** full and Quick Preferences show actual LG ULTRAGEAR / 2D FHD LG TV models, matching Windows hardware identity and retaining in-frame desktop previews. Ambiguous/absent-metadata/error/retry variants NOT RUN.
- **U-R03 PASS scoped:** same visible Timer HWND22939828 starts on secondary125% rect[-445,20,-20,895], software `/internal` fallback to primary100%, then `/clone`→`/extend` returns it to identical LG rect. Separate actual supported drag during fallback snaps it to primary[16,16]; it stays there after LG returns, respecting user move. Actual displacement[16,-4] is not ≥64px drag acceptance. Physical HDMI J03/J04 and changed-selection variant NOT RUN on this candidate.
- **J05 FAIL:** reduced-motion Panel→compact still renders the same title/time in both presentations at once on primary100% and LG125%, observed independently in original GDI and DDA videos. Exact examples: primary GDI PTS9.211 / DDA9.150; secondary GDI10.236 / DDA10.183. Endpoint task/paused06:01 and HWND retained; no general motion/parity PASS. Normal-motion, all reverse/expansion and other variants remain separately open. Folder named `secondary-normal` actually probed reduced=true and must not be treated as normal-motion evidence.
- Source triage: current source fixes only the missing-cleanplate fallback; measured v4 composition remains. Which path rendered the duplicates is unproven. Do not speculate another fallback-only fix; trace actual lease/plate/layout path at first bad frame.

## NEXT AGENT ACTION — ChatGPT source owner

1. Diagnose J05 on existing PR437 using the new exact-build originals and frame PTS; trace whether measured plate/sprite composition or another native presentation boundary paints duplicate semantic content. Reconcile prior failed-build history with the repeated-failure escalation rule; do not count two recording APIs as two corrected builds.
2. Implement only the evidenced causal correction with meaningful dependency/regression coverage and scoped prephysical review. Preserve J01 model mapping, U-R03 successful return/user-move override and approved UI. Batch source preflight and exact-head CI; then recapture only impacted native requirements. Do not merge protected PR437/PR431/PR436 stack on source/CI alone.
3. Keep separate running Time Taken source-supported stale-display issue distinct from data loss and J05. Consume prior scoped results rather than replaying them.

## Remaining independent gates / user action

- Normal motion: Windows native client-area setting changed but actual WebView media remained reduced=true; debugging media emulation was rejected before execution, Windows Settings did not expose a targetable window. No normal-motion PASS. Original setting restored.
- Physical HDMI remains NOT RUN on current candidate; requires actual hardware action if still needed after software evidence reconciliation. No immediate user action requested while J05 needs source repair.
- Strict A/PR389 and B/PR419 eight-case compositor acceptance, dependent snapping/stack and remaining deduplicated M5/M6/M8/M9 gates remain independent. Formal M1–M4 accepted **4/10**, M5–M9 OPEN; M10 hard entry/user approval and M11/M12 inactive unchanged.
- Old 2fc7881c FAILs remain historical. Earlier J02/J06 and first-paint scoped PASS remain valid where unchanged. Source/config/test corrective ownership remains ChatGPT under AGENT_WORKFLOW; this Windows run did not take over source implementation.

Previous complete handoff is immutable at [eabda294](https://github.com/MariosGiannakaras/Narro/blob/eabda294/HANDOFF.md). Detailed experiment history and tool/capture limitations are in the new evidence README.
