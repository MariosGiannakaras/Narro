# Exact A/B Windows acquisition — 2026-10-24

## Scope and counters

User authorized available physical Windows checks, excluding previously deferred operator-only Timer drag, tray Quit, held-pointer Escape and disconnected-monitor scenarios. No source/config/test edits, new CI, merge, installer or optional milestone work occurred.

**16/16 planned current-candidate M7 route executions acquired: A 8/8, B 8/8. These are acquisition counts, not 16 visual acceptance PASS.** The campaign-wide historical A01–A14/B1–B10 register remains **21/24 complete acquisition journeys + 3 partial**; it includes older executable evidence. Do not add the 16 repeated candidate routes to that denominator or call the historical 21 current-build acceptance. A13, A14 and B3 remain partial for explicitly excluded subcases. Other individual missing requirements, including image upload, remain open even within a previously acquired broad journey. There is no verified single denominator for all detailed physical requirements across M1–M10; M10 release-only checks remain behind its hard gate.

Nine original 2560×1080, nominal 60fps desktop MKVs, 16 current-candidate route actions, native traces, full per-candidate Narro-M7-Logs, UIA and screenshots are frozen here. Personal profiles restored, original database hash-identical. No recorder or owned Narro left running. All nine recorder processes ended exit0; all files have positive ffprobe duration. This is not an exhaustive frame-by-frame analysis or a physical-before-merge approval.

## Exact executable provenance and environment

| Candidate | PR/head | CI/artifact | Extracted EXE SHA256 |
|---|---|---|---|
| A control | PR389 / ec9227a2e09a69c380d4605aaf9623bdd9b9c394 | 40084188512 / 12557121043 | 08a7e1d6b306e1469c274938c7e5c907ab962766f1b04b9ae2dce0d04d03985a |
| B v4 | PR419 / 43adb6a9d798dca56dd89c0f4f91c888e1d4fcd9 | 40084666277 / 12556993335 | 8436d89b9d868fbdd7f5e5c76b13412a1360182645810e64b835b9a3ba8f9cd8 |

Both ZIP hashes independently matched GitHub artifact metadata. Both copied validation-name EXEs independently matched the inner `physical.json` EXE hash; see `provenance/`. Renaming was byte-preserving, to enable validation logs. These are draft candidate binaries, not merged-main acceptance. Latest main at preparation was de64dea4; preparation checkpoint 1d2c1cff. No blanket transfer of A/B outcomes to main.

Single attached 2560×1080 display, observed WebView devicePixelRatio 1. The LG is disconnected. OS client-area animations read false. Attempting Windows Settings URI produced an Explorer file-association error; Performance Options was elevated and did not accept input. No successful OS animation-setting change is claimed. Explorer error was subsequently dismissed and its disappearance verified. Performance Options may remain open for the user to close; do not keep probing elevated UI.

Reduced motion was verified by actual `matchMedia` on both Main and Focus pages. Normal motion used loopback CDP **Emulation.setEmulatedMedia**, verified false on both pages; all app interaction stayed physical Computer Use clicks/keys/drag. No domain mutation or DOM input through CDP. Thus normal media-path testing is real native HWND interaction under renderer media override, **not** proof that Windows system animations were enabled. Native traces corroborate A 250ms/B 500ms normal versus 1ms reduced durations.

**Raw-label correction:** `A-normal` was initial setup/route acquisition before the motion condition was established and must not count as normal acceptance. It was superseded by A-normal-verified and A-reduced-verified. `B-motion-normal.json` actually records reduced=true; its filename is historical. Use the values and the later B-normal-config.json, not filenames. Preserve originals.

## Original recordings and navigation

`segments.json` contains exact start/stop receipts, ffprobe metadata and original sizes. `chronology-with-offsets.json` maps each UTC bookmark to approximate recording seconds. The UTC offset is navigation only; original frame PTS is authoritative and **does not provide the missing frame/QPC capture bracket**.

| Original segment | Useful scope / approximate original seconds |
|---|---|
| A-normal | Initial Main/Focus setup and four routes; mislabeled motion condition, excluded from the verified 16-route set |
| A-functional | N28 actual filter/Escape at 104–106s; filter→date at 105–106s; Sessions/Add Session about 106–122s; early volume choreography attempts do not establish a defect |
| B-reduced | Four routes at ~21.1,22.3,23.4,24.6s |
| B-normal | Four routes at ~9.6,11.1,12.5,14.0s; verified renderer no-preference |
| A-reduced-verified | Four routes at ~12.7,13.8,15.0,16.2s |
| A-normal-verified | Four routes at ~28.2,29.7,31.1,32.6s; one populated subtask row |
| A-functional-completion | Correct three volume-family keyboard interactions ~51–82s; Shortcuts ~82s; upload dialog ~153s onward |
| A-board-residual | Actual B→Today pointer drop ~23.5s; recurrence save ~255.6s, reopen ~269.2s; archive ~270.4s. **Exclude idle ~25–255s from useful-interaction review.** The recording was bounded and stopped; do not describe this idle interval as testing |
| A-panel-residual | Successful revealed Open/Focus entry ~84s; break start ~99s; shortcut attempt ~114s; visible Resume action ~125s; Notes ~157s, larger editor ~166s, Home ~194.6s. Earlier Open attempts did not navigate and are operator setup |

The recorder capped every segment at 300s. All original MKVs are unchanged. Screen-capture indicator/desktop/Codex/background windows are present in the full originals. No audio track: no audible-sound PASS.

## Requirement-specific observations and honest dispositions

| Requirement / milestone | New physical evidence | Disposition and limit |
|---|---|---|
| PA01 / M7 four routes normal+reduced, separately A/B | 16 real clicks and resulting UIA states; 4 verified segments; native QPC traces for both candidates | **ACQUIRED 16/16; visual acceptance OPEN.** Need dense original-frame review for title duplication, ghosting, clipping, flicker and ownership. No static screenshot or green CI substitutes for this. No A/B merge authorized from this packet |
| M7 populated expanded rows | A-normal-verified has one actual subtask; other verified sets have zero | **PARTIAL** for a broad populated-row/state regression. Only one subtask was created, not two. No claim all populated combinations passed |
| A02 QPC diagnosis | Buffered native traces with source SHA/process/QPC/UTC and desktop MKVs | **PARTIAL**: no QPC-bracketed screenshot sequence. Approximate UTC alignment cannot prove first inconsistent pixel versus DWM phase. Preserve strict physical hold |
| N28 / M9 Escape/exclusivity | `N28-actual-escape.uia.txt`, `N28-actual-exclusivity.uia.txt`; A-functional ~104–106s | **Scoped observed PASS**: actual list popover dismissed with Escape; opening date dialog replaced list popover. No entire Reports/source-parity acceptance |
| C44 / M8 three volume families | `C44-task-direct-arrows.uia.txt` 70; notification direct 95; success direct 90; corrected Escape receipt; A-functional-completion | **Scoped happy-path keyboard PASS**: popup retained while arrows changed values, Escape dismissed popup while Preferences remained; outside click dismissed. Early Tab-after-autofocus attempts moved focus away and are not app failures. Deliberately deferred-save, native failure/rollback and restart persistence **NOT RUN** |
| C38 / M8 Shortcuts | `C38-shortcuts-verified.jpg`/UIA, all ten rows; Escape back to Preferences | **ACQUIRED**, modal content/open/close only. Actual global registration conflicts/lifecycle and exhaustive focus loop not newly tested. Prior user shortcut attestation is preserved separately |
| M9 Sessions / Add Session | A-functional, Sessions tab, task chooser and disabled submit until task selection; Tab/Escape | **PARTIAL**: dialog/keyboard acquisition; no new session create/edit/export/restart proof |
| N10/B3 / M5 pointer B→Today | A-board-residual ~23.5s, `N10-B-Today-after.jpg`/UIA; unchanged synthetic task-ID set | **Scoped observed PASS** for actual This Week→Today drop. Duplicate title in Backlog existed in seed as a distinct ID; two B titles are not newly cloned tasks. Whole B3 remains PARTIAL because held-pointer Escape is excluded |
| M5 recurring parent | Existing Every Tuesday parent saved unchanged, success toast and reopened editor; `recurrence-saved`/`recurrence-reopened` | **Scoped observed PASS** for unchanged save/reopen in-process. Pattern-change, Replace Existing, restart persistence **NOT RUN**; do not close broad recurrence acceptance |
| M5 archive preview / Home trailing times | `archive-list-preview.jpg`/UIA; `panel-home.jpg` | **ACQUIRED**, no canonical Blitzit comparison or restart. No source-parity PASS |
| M5 image upload | `M5-upload-dialog-blocker.jpg`; A-functional-completion native Open dialog | **NOT RUN beyond opening selector**. Native modal was not exposed as a targetable window; parent-target input was rejected because the point belonged to msedgewebview2. One activation/recovery attempted, then Escape restored app. No image selected/saved, no upload/list-image PASS |
| N36 / M6 Break Skip feedback | A-functional and A-panel-residual; `N36-resume-button-result` UIA; returned paused work 03:30 / 0:01:30 and toast “Break skipped. Work paused.” | **PARTIAL**: returning from a running break to paused work observed. Paused-break and already-expired edge were not established. Initial journal labels “paused” were premature; classify by actual state/video |
| M6 break visible countdown | `N36-break-start-state.png`; original A-panel-residual ~113s; derived `review/N36-desktop.png` | **Visual discrepancy observed / root cause UNCERTAIN**: UIA reports changing Break countdown, but sampled actual pixels show no countdown text in the card. Visible play/Resume returns to paused work. Requires bounded review of this exact segment and current candidate code before attributing a code defect. No corrective edit performed |
| M6 Notes/Home | A-panel-residual ~157–196s; inline notes, larger editor, Escape and paused Home return receipts | **ACQUIRED**, no content save/restart/native resize proof. Keep broad keyboard/resize/return gates open |
| M1/M3/M4 invariants reused | Synthetic fixture, stable paused POMO and Time Taken; 76→76 task identities; SQLite quick_check ok; protected personal profile | **Scoped evidence only**, not floating-only quiet CPU/memory or full persistence/session/timezone acceptance. No personal data loss |
| A13, A14 / M7 & M8 / M10 deferred | No new tray Quit, Timer HWND drag, held-pointer cancel, 125% DPI, dual monitor/hotplug | **NOT RUN by explicit user exclusion/device/tool limits**. Programmatic process stop below is cleanup, never tray Quit PASS |
| M10 / optional extensions | No release installer/autostart or live Blitzit | **BLOCKED / NOT RUN**, M10 hard gate unchanged; M11/M12 dormant |

## Freeze, integrity and continuation

- Raw originals and sidecars: `recordings/`. Input UTC chronology, original screenshot/UIA and media-condition receipts: `observations/`. Whole validation logs: `Narro-M7-Logs/A` and `/B`; QPC: `native-trace/A` and `/B`. `review/` is a small **non-exhaustive capture-health/sample observation**, not full analysis.
- Screenshot filenames ending `.png` from the early Computer Use helper actually contain returned JPEG bytes; originals are intentionally preserved. Decode by magic bytes. Later `.jpg` files are correctly named. Do not diagnose screenshot corruption from the suffix.
- `synthetic-identity-proof.json`: 76 seed and 76 after task IDs, identical identity set; two same-title B identities already present in seed. No raw DB uploaded.
- `observations/original-profile-restoration-proof.json`: ORIGINAL_PROFILES_RESTORED, personal DB hash identical. Owned process stopped after path/PID verification for restoration only. Private backup/profile ledger/retained test DB remain local under central Narro workspace/AppData and are excluded. Do not replay consumed isolation scripts.
- `SHA256SUMS.json` identifies frozen bytes; Git attributes must preserve byte hashes for evidence. No binaries, installer archives, caches or personal backups published.

**Next owner:** review only the new exact A/B four verified segments and functional deltas; do not redo completed old 13+8+2 analyses or the 9/9 prephysical source audit. First grade each of the 16 transitions, then reconcile the observed Break pixels. Missing QPC bracket/populated states require only narrow supplemental capture if needed. Image selection requires a targetable native file dialog or later assisted action. User excluded tray Quit/Timer drag/held cancel/second display for this run. Keep remaining unchecked requirement scope explicit, regardless of broad journey acquisition counts. Correct only confirmed problems through current source workflow, regression and exact-head CI; do not patch protected Spectrum Core/image/icon behavior or merge either native candidate from this ungraded packet. Mandatory milestones remain 4/10 accepted, M5–M10 OPEN.
