# Focused Windows input causality and recovered video regions — 2026-10-26

## Scope and provenance

Codex physical/native-analysis track resumed from main65f23139 and merged PR429/PR430 diagnostic scripts. The app source paths src/src-tauri have **no differences from efe6cadd**. The same verified diagnostic EXE SHA256 9371b97cfc7a74566b0e220c5c3dd8ea6521839b52511eaa874e8dd966509241 / artifact12615157025 / CI40235080133 was used. No Narro runtime/source/config/test behavior was changed. The existing 20/20 bounded P-family review was consumed rather than repeated.

**This batch: 2/2 targeted P11/P09 causal acquisitions performed, neither a full physical acceptance; 2/2 previously off-target P06/P07 video regions recovered without another app run.** Five short native desktop originals include a stopped preparation attempt and an invalid layout control. Their start/stop receipts distinguish these from valid scenarios. Derived lossless crops are review aids; the original videos in commit799fd3db remain authoritative. Approved picker/image/icons and all existing A/B functional acceptance/strict compositor holds are unchanged.

Fresh owned child input-causal-02 used a COPY of retained synthetic Roaming/Local profiles with a new protection ledger and SQLite backup quick_check=ok. Original profiles were restored after the run; original DB SHA256 13185e54bc0ea08f3b368ccc48a8ede429683e1d58a60b15b8f7491a06d2224d is unchanged (original-profile-restoration-proof.json). All owned Narro/recording/collector processes stopped. Local-only CDP9234 belonged to WebView2 PID30500, parent verified Narro PID93400, listening on127.0.0.1; it ended with the process. Final foreground Focus thread keyboard layout was0x4080408 (Greek), matching initial Greek key metadata. Private ledgers/backups/DBs are excluded.

## P11 — clean input cause narrowed

The Main Home was noneditable and modal-free. Computer Use Ctrl+F visibly opened native WebView2 Find; after Escape and clean focus, Ctrl+Alt+T did not open quick-create. See P11-clean-02/native-original.mkv, named P11-clean screenshots/UIA, P11-main-dom.json and P11-main-win32.json. The repository DOM probe logged no recognized chords because it filters on event.code KeyF/KeyT. The25ms OS sampler also captured no chord state; brief keypresses may be missed, so this is not proof that Windows received no key.

A separate **read-only, narrowly scoped** copy of the observer accepted only the same Ctrl+F / Ctrl+Alt+T combinations identified by keyCode70/84 or their code/key, and retained key/code/keyCode/isTrusted. It neither sends input nor changes app state. Its source is published inert as input-key-metadata-probe.mjs.txt; the original repository script was untouched.

P11-key-metadata.json contains actual delivered events:

| UTC | Delivered input | Context/outcome |
| --- | --- | --- |
| 17:50:40.556Z | ctrl=true, alt=true, keyCode84, key=Greek tau, **code=""**, isTrusted=true | targetEditable=false, activeEditable=false, modal=false, documentFocused=true, defaultPrevented=false; no quick-create |
| 17:50:45.706Z | ctrl=true, alt=false, keyCode70, key=Greek phi, **code=""**, isTrusted=true | same clean context at capture, defaultPrevented=false; native Find opens and document loses focus |

Current src/inAppShortcuts.ts resolves physical code KeyX first, then semantic key.toLowerCase() when code is missing. These synthetic Greek-letter/empty-code events therefore return null. **Confirmed confounder of the tested Computer Use input shape**, not proof that an ordinary physical Greek keyboard produces the same data, and not justification for a production shortcut patch. Real keyboard scan-code/KeyF/KeyT acceptance is still OPEN. A pure current-source resolver corroboration matched6/6 expected cases: Greek empty-code chords return null; the same Greek keys with KeyT/KeyF and Latin semantic empty-code keys resolve correctly. See shortcut-resolver-corroboration.json; this is not a physical PASS.

P11-english-control is **INVALID CASE**: after Alt+Shift the DOM receipt had0 focused samples and no matching events. Its filename records the attempted control, not proof of English layout or a successful test. A second Alt+Shift was issued; the final native layout receipt confirms Greek. Do not count this failed control as PASS or product FAIL.

The first Win32 collector refused the verified filename narro-m7-validation.exe because its guard only accepts Narro.exe. P11-clean was stopped immediately before input. The external copy changed only that name guard and added an exact executable SHA256 check. It remains read-only; see capture-verified-diagnostic-input.ps1.txt. This is an operator-helper compatibility issue, not a Narro runtime defect or a silent source fix.

## P09 — exact hit established, sustained native drag still unproven

P09-focus-dom.json captures pointerdown at(170,7) on **MAIN with exactDragMarker=true**, insideTimer=true, documentFocused=true, resizePending=false; pointermove ends at(70,7), buttons=1, also exactDragMarker=true. The two DOM timestamps differ by approximately4.2ms. This removes the earlier wrong-hit/hover-action ambiguity for this attempt.

P09-focus-win32.json independently records Focus activation around elapsed20572ms, cursor(2390,7) then(2290,7), but the Focus HWND0x131556 stays at[2220,0,2560,700] throughout. The native25ms sampler recorded **no left-button-held sample while Focus was foreground**; its37 held samples were on Main at other times and MUST NOT be attributed to this drag. The collector does not persist a Win32 move-loop event. A4.2ms DOM gesture can fall between native polls, so missing held samples do not prove absence of native button-down.

**Observed movement outcome still FAIL for this attempted100px operation; causal owner UNKNOWN.** Correct direct DOM target and actual cursor displacement are established. Genuine sustained native hold/move-loop and resulting window displacement remain unproven. No additional atomic retries or guessed Tauri/CSS patch were made. P20 held Escape was not attempted.

## P06/P07 — reuse original footage with the correct region

Previous ChatGPT review used an off-target region for these observations. No new physical execution was needed. The following extracted PNGs were visually inspected; cropped MKVs preserve source decoded pixels with x264 CRF0, no interpolation, and are linked to original seek intervals.

| Source original | Correct crop and inspected samples | Bounded disposition |
| --- | --- | --- |
| all-remaining/main-focus/native-original.mkv | panel crop340×700 at(0,0); source98s full frame shows list selector,106s filtered queue/action bar,130/137s expanded Notes,144s closed Notes/paused task with Time Taken1:39 | **Scoped video PASS** for visible selector/filter/Notes-open/closed paused endpoints. Replaces NO TARGET VIDEO for these specific states; does not certify every entry-animation frame or Blitzit parity. Lossless crop covers90–145s. |
| all-remaining/resume-01/timer-boundaries/native-original.mkv | Panel crop425×875 at(1495,0), source280s: red Time's Up00:00/EST1:00/Taken1:00;293s: Overtime and extension toast with Taken1:00;309s: Well done, EST1min/Taken1min, Next Task/Take a Break/Close | **Scoped video PASS** for legible Panel Time's Up→Extend→Done endpoints and tracked-time preservation, corroborating named UIA. Replaces the unreadable crop for this sequence; no universal motion/GIF/audio/source-parity PASS. Lossless crop270–315s. |
| same timer-boundaries original | Compact crop340×110 at(4140,0), source235/249s | Hover toolbar obscures title/numerals; Pause changes to Extend icon. Full Compact Time's Up text remains not legibly proven by these samples. Crop230–270s retained for bounded review; do not infer a visual numeral PASS. |

Original full-frame PNGs are included to prove crop location. Originals were not edited. Per-frame composition/DWM ownership, A/PR389 and B/PR419 acceptance remain independent.

## Resulting-main CI resolved without another run

The GitHub Actions REST API exposes the previously unverified PR430 resulting-main push:
[CI40357351759](https://github.com/MariosGiannakaras/Narro/actions/runs/40357351759), exact merge068a9d1b03f52b59825b1f6962bf1051e4c34d96, event=push, completed/success. **validation-gate, fast-gate and windows-candidate3/3 SUCCESS on that exact SHA**. Raw run/jobs receipts are included. No CI was started or rerun.

## Next boundary

No confirmed new runtime source defect was established here. Implementation owner should consume the empty-code Greek synthetic-input finding before proposing a shortcut patch. Only a genuine physical keyboard event with valid KeyF/KeyT and a sustained native drag/move-loop can settle the remaining P11/P09 product acceptance. P18 actual tray Quit, P19 real HDMI unplug/replug and P20 held-drag Escape remain human-owned NOT RUN; no atomic proxy. P03 source-scroll ownership remains separately OPEN. M1–M4 formally4/10 accepted, M5–M9 OPEN, M10 gated, optional M11/M12 inactive. Do not repeat accepted A/B16 routes or the20-family review.
