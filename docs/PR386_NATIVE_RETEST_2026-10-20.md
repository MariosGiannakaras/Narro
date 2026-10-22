# PR386 native review — 2026-10-20

**9/9 core cases reviewed: 7 scoped PASS, 2 visual FAIL**, sharing one residual SuccessON next-row omission. RA01 four changed moves PASS, RA02 OFF two completions PASS, ON final-last PASS. Additional untimed-rest/status and persistence scoped PASS. This does not close whole milestones or source parity.

## Executable and acquisition

PR386 head `0ad2fdcfa47b68f51244c680cf755c8b63406402`, [PR CI39363026526](https://github.com/MariosGiannakaras/Narro/actions/runs/39363026526) **3/3 SUCCESS**, guarded merge `476d95ea8053ec1b83158e26dd8317f6891a486f`. All runtime/build/test/workflow inputs equivalent by [merge proof](../work-log/2026-10-20-pr386-merged-ci-native-prepared.md). Physical artifact12239187254 ZIP SHA256 `a95e627ade440eb77f4682ed215425f3fbd0e4c66b296f634d2bb4d7988c5dd0`; EXE SHA256 `7f10f66ae828fd5dccaf4213b4f1c0e74cc3b6f641526b292e6db8845287fd82`. Automatic main CI39365199465 still running at analysis checkpoint; PR green is not main package acceptance.

Actual Windows desktop, single primary2560×1080/144Hz RadeonRX570, dark theme. Board normal and actual OS reduced motion exercised and original setting restored. Main HWND17435472 and persistent Focus HWND658094. Fresh GDI screenshots grounded real Sky window-relative XY and keyboard inputs. WGC/index-click acquisition failed; direct XY worked. OBS stayed stopped. DXGI acquisition ceiling240 with dup_frames=0, VFR passthrough; actual ~144frames/s, no synthesized240fps. Focus uses source encoder timebase1:1000000. The failed -1 timebase attempt performed no test input and produced no useful recording.

[Evidence packet](../work-log/evidence/pr386-native-20261020/README.md): all three unchanged original owned-ROI videos, full PTS, cadence statistics, action UTCs, UIA, screenshots, synthetic DB receipts and consecutive boundary strips. Profiles were backed up and isolated; original profiles restored hash-identically and original OS motion restored. No owned app/recorder remains active. Private backups/ledger and pre-existing startup diagnostics excluded. Never replay the completed isolation ledger.

## Core dispositions

Zero-based decoded indices and original PTS are authoritative; action UTC alignment is approximate. Human review covers the enumerated consecutive strips and before/after screenshots/UIA/DB, not a claim of all22935 frames scrutinized individually.

| Case | Actual action / stream | Boundary frames | Verdict |
|---|---|---|---|
| RA01 N2 | Normal WeekSecond before WeekAnchor / RA01-original |2364–2399; preview2384→row2385|PASS: genuine changed order, continuous replacement, no missing card/old-order repaint observed.|
| RA01 N1 | Normal Alpha Backlog→ThisWeek before Second |3640–3675; preview3660→row3661|PASS: source removed during lift, continuous destination replacement and correct1/3 lane counts.|
| RA01 R1 | Reduced Beta Backlog→ThisWeek before Alpha |6416–6451; preview6430→row6431|PASS: Backlog0/Week4, no preview-row gap or old-lane bounce observed.|
| RA01 R2 | Reduced Alpha before Beta |7436–7471; preview7455→row7456|PASS: actual rank1→0, not no-op; final Alpha/Beta/Second/Anchor.|
| RA02 OFF next | CompleteFirst→NextEligible / RA02-OFF-sourceTB |1860–1877; pending12.982→Running13.058s|PASS: explicit completing/starting, no generic idle/completed row re-offer; coherent1/2+Done1 at Running, exactly one next-start.|
| RA02 OFF last | CompleteNextEligible / OFF |2683–2690; pending18.693→AllClear18.721s|PASS: honest no-work,2/2Done, no phantom live.|
| RA02 ON first | OnlyEligible→success / RA02-ON-sourceTB |2234–2235 at15.537–15.543, corrected2236/15.550s|**FAIL visual continuity**: first success retains Updating Today progress and omits eligible ONNext, although ONThird remains. Fresh Done1 correct; ONNext appears13ms later and Done region jumps.|
| RA02 ON next | ONNext→success / ON |7010–7011 at48.730–48.737, corrected7012/48.744s|**FAIL same omission**: eligible ONThird absent at first success, reappears14ms later with coherent2/3 summary.|
| RA02 ON last | ONThird→success / ON |9650–9665; firstsuccess9656/67.133s|PASS: first success3/3Done, no remaining/completed pending row, no old2/3. Replaces PR385's different-executable107.967s failure.|

Consecutive Board strips are `analysis/board-*.png`; Focus strips plus full-size offending PNGs are in `analysis/`. The new FAIL is **not** stale completed-task re-offer: PR386 corrected that earlier defect. It is brief omission of the legitimate next row while success is already visible.

## Additional exercised claims and capture limits

Explicit SuccessON Next twice starts ONNext and ONThird (5263→5267 and7999→8002), functional scoped PASS, one session each. Second Next has a25ms preceding gap and a samePTS cursor update, so no arbitrary subframe absence claim. TakeaBreak disables controls then AllClear at11157/77.581s; >8seconds later no old now-live feedback returns. RA02-B untimed-rest/status scoped PASS;0timedbreak/0checkpoint.

All9 task IDs unchanged/unique;5 completed tasks,5 closed work sessions70/5/23/12/11seconds; no duplicate next-start. Final Board order Alpha/Beta/Second/Anchor. See persistence-receipts and filtered before/after DB snapshots.

RA01:7504frames/52.167s, maxgap29ms,19nonincreasing/duplicatePTS. OFF:2889/20.135s,maxgap20ms,0duplicates. ON:12542/87.214s,maxgap27ms,2duplicates. Completion boundary windows have no >20ms gaps/duplicatePTS. RA01 duplicate cursor-update PTS are retained in decoded order; reviewed preview→row boundaries remain continuous. No-frame-absence claims are bounded to acquired frames/~144Hz desktop cadence, never arbitrary subframe guarantees. Originals unchanged, no retiming/interpolation to hide anomalies.

Escape cancellation NOT RUN again; previous unchanged accepted N3/R3 plus mounted tests remain separate reused evidence. No fresh light-theme native, source-pixel/easing comparison, timer floating transitions, physical topology or other unexercised milestone PASS.

## Root cause and correction plan

FocusPanel flushSync adopts fresh board+success but completionIntentRef is cleared later by onAutomaticAdvance(null). The first synchronous render has idle timer plus old completing intent, so automaticAdvance still marks summary pending and remainingCandidates filters out nextTaskId. A later refresh renders the cleared ref, revealing the row. This accounts for both native failures without persistence corruption.

Existing deferred-read tests poll after success and miss the first commit. Add a production-component **first success DOM-commit** observation with independent parent read held: ready summary, exact remaining IDs and Done membership must already agree. Cover successful, stale/failed read fail-closed, last-task, explicit Next, targetABA and rejected completion/retained drafts under the existing light/dark×normal/reduced matrix. Clear obsolete intent/state inside the same guarded success publication. Preserve fail-closed behavior if committed board unavailable.

This completes the previously selected authoritative-projection alternativeA. The [repeated-failure reassessment](../work-log/2026-10-20-focus-success-projection-reassessment.md) remains applicable; no new window mechanism or redesign. Native evidence establishes a distinct residual next-row omission, not identical recurrence of old stale-completed-row paint. Regression-first RED/GREEN, exact CI and narrow affected ON native verification required. Preserve unaffected RA01/OFF/rest acceptance unless changed runtime invalidates it.

RA01-A scoped native CLOSED4/4. RA02-B scoped PASS. RA02-A old idle/stale row/count symptoms absent but overall coherent ON remains **OPEN/FAIL** for the new omission. Mandatory M1–M4=4/10; M5–M10/source parity separate, M10 hard gate, M11/M12 dormant, PR344 other-owner, protected picker/upload/218icons unchanged.
