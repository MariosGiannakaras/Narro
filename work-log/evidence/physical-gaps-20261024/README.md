# Supplemental physical requirement gaps — 2026-10-24

**User requested omitted subclaims be individually tracked and physically exercised.** The former21/24 broad journey count is not an exhaustive physical requirement denominator. `matrix.json` now tracks34 gap groups across M5–M9/shared M1 plus deferred M10:29 executable groups, G30 canonical-source comparison analysis, G31–G33 user-deferred input/device cases, G34 M10 dependency-blocked. This matrix is a supplemental gap register, not a new roadmap denominator or proof all TODO requirements are counted exhaustively.

User requested wrap at the usage limit, then said continue while the safe publication checkpoint was being completed. All recorders and owned app were stopped before restoration. **No new source/config/tests/CI/merge.** Exact B candidate43adb6a9d798dca56dd89c0f4f91c888e1d4fcd9, EXE8436d89b9d868fbdd7f5e5c76b13412a1360182645810e64b835b9a3ba8f9cd8; provenance in session-meta.json. Personal Roaming/Local restored with original DB hash identical. Synthetic retained DB quick_check ok,76 tasks. No tray Quit claimed from programmatic cleanup.

## Acquisition disposition

**9/29 groups fully exercised within their defined acquisition scope;8 partial;12 still OPEN.** This corrects the provisional10/29 spoken before the final evidence check: the populated B route cycle happened, but its renderer reduced-motion condition was not independently queried in this supplemental launch, so G25 remains PARTIAL. Executed failure cases are not PASS. No milestone checkbox or physical-before-merge gate is closed.

| Groups | Actual observations | Disposition |
|---|---|---|
| G01 JPEG, G02 SVG | Native file selection, visible named preview; SVG visibly orange/blue circle, JPEG from the earlier fixture | Acquisition complete for selection/rendering only. Do not infer replacement persistence from these |
| G03 invalid PNG | Confirmed native file selection of non-image bytes; red “The selected file is not a valid PNG image.”; previous image retained | Scoped observed rejection PASS; raw screenshot G03-app-result.jpg |
| G04 oversize | Valid PNG bytes plus padding >1MiB; red “Icons must be1MiB or smaller.”; previous image retained | Scoped observed rejection PASS; G04-result.jpg |
| G10 keyboard | Actual Ctrl+Alt+P work resume then pause on B persistent Focus host;03:30→03:29 paused, subtask1/1 retained | Acquisition complete for affected keyboard integration, not every shortcut/state |
| G13 task volume | Controlled synthetic DB write lock; slider70→65 pending, disabled, second key not admitted; explicit locked-database error, rollback70 | Acquired actual deferred/failure path. **Pending-focus discrepancy observed**, rollback/error feedback scoped PASS. Source diagnosis/overall verdict pending |
| G14 notification, G15 success | Same lock method; baseline95/90; pending disabled slider; explicit failure and rollback95/90 | Same independent family evidence; no blanket C44 PASS |
| G16 Shortcuts | Actual modal opened, Tab8, ShiftTab2, Escape back to Preferences; focus receipt and video | Acquisition complete; grade visible keyboard focus from video because UIA focused_element is not reliable enough alone |
| G05 replacement | SVG preview and save attempt | **PARTIAL**: saved replacement/persistence must be checked; no restart occurred. Do not assume the attempt committed |
| G06 recurrence | Reached Update Recurring via task menu after unsuccessful direct Custom/Edit activation attempts; changed pattern, actual “Task recurrence saved.” feedback | **PARTIAL**: changed value/restart persistence not yet verified. Do not label earlier direct-field input failure a diagnosed source bug |
| G07 archive restore | Revealed archived-card actions, clicked actual Unarchive, “No archived lists found” | **PARTIAL**: active list and identity across restart pending; no permanent deletion |
| G08 note | Task note set via supported UIA set_value, Save Note, “Task note saved.” | **PARTIAL**: reopen/restart exact content pending. No URL launched intentionally |
| G09 subtask | Completed existing Physical acceptance first subtask; UIA1/1 and actual struck row | **PARTIAL**: restart persistence pending; no task identity created/deleted |
| G17 timezone | Explicit (GMT+00:00) Africa/Abidjan selected and reflected in recurrence-dialog timezone text | **PARTIAL**: restart persistence pending; Windows OS timezone untouched |
| G18 monitor/edge | Left/Screen1 preference interactions, after waiting for previous save | **PARTIAL**: exact selected state and restart native placement pending; single display only |
| G25 populated B route cycle | Panel→Compact→Expanded→Compact→Panel, actual completed subtask visible; settled final Panel captured | **PARTIAL**: normal/reduced renderer media not independently queried in this supplemental launch. OS animations were previously off but that is not an exact renderer receipt. No new QPC trace flag was set. Do not count as graded normal/reduced acceptance |
| G11,12,19–24,26–29 | No completed new acquisition | **OPEN**: Notes/Panel resize, Home paused/reentry, Sessions create/edit, CSV/PDF, Reports chart/filter, populated normal, quiet performance, topmost/minimize, QPC frame bracket and expired-break edge respectively |
| G30–34 | No new analysis, deferred hardware/input, future M10 | ANALYSIS_ONLY / USER_DEFERRED / DEPENDENCY_BLOCKED as matrix states |

## Original evidence and tool recovery

Five original 2560×1080 nominal60fps MKVs, exit0 and positive ffprobe durations, are under `recordings/`; full metadata in segments.json. Actions and approximate recording offsets are in chronology.json. **Some snapshots/actions fall outside a recorder interval after the hard300s cap.** Only attribute video evidence when chronology lists a covering segment; outside-window screenshots/UIA remain their own physical evidence. There is substantial technical setup/recovery in the first two clips; do not treat every recorded second as product testing. Full original files are preserved for provenance, not trimmed/reencoded.

Tool-specific setup is not a Narro failure: clipboard-based type_text delivered unrelated existing clipboard text into the native selector, so that method was stopped. Direct key delivery worked, but the user's Greek layout first produced Greek path text; switched to English for literal path entry, then restored with reverse Alt+Shift at cleanup. The colon keysym produced a semicolon until explicit Shift+semicolon; the native path-not-found dialog was a fixture input error, not application rejection. After that dialog, the native File name edit became exposed in the parent accessibility tree, and **sky.set_value** selected the exact controlled paths reliably. No native helper patch, alternate input backend, CDP file assignment or shell-driven GUI operation was used.

Several UIA-click bounds did not hit the visibly intended controls; fresh screenshots and actual revealed coordinates were used instead. An unintended Time Taken editor was canceled unchanged before continuing. Initial direct Custom/Edit activations did not prove a recurrence bug; explicit task-menu Update Recurring loaded normally after its loading state settled. These recovery steps are retained, with no invented PASS from a label or an attempted click.

## Controlled write-failure protocol

`method/lock-test-profile.py.txt` is archived **evidence-method text, not repository executable tooling**. It asserts OWNED_PROFILE_ACTIVE and the owned-profile marker, opens only that synthetic SQLite DB, holds BEGIN IMMEDIATE30s, then rolls back without writing data. This blocks preference writers while allowing reads. Start/end UTC receipts bound the injected failure. The initial G13 short-lock probe and earlier G14 attempt outside the lock are superseded by G13-failure and G14-G15-failure receipts. Both locks were released before the profile was restored.

All three popup baselines returned after real PREFERENCE_SETTINGS_FAILED/database-is-locked feedback. The pending sliders were exposed disabled and later keys did not change the in-flight draft. **This is a concrete candidate interaction observation to reconcile against C44 requirements; no source root cause, fix or final source-parity verdict was established during capture.**

## Safe continuation

Original local root: E:/SystemFiles/Desktop/Narro-Workspace/Narro-Physical-20261024-Gaps. Its consumed ledger is ORIGINAL_PROFILES_RESTORED. Do not replay isolation scripts. The owned synthetic retained namespace contains the partially exercised changes; its path is in the **private local ledger**, not the repository. For continuation, protect personal profiles into a new owned session and seed from that retained fixture; do not redo completed image/error/failure acquisition by default.

**Next acquisition:** finish G05/06/07/08/09/17/18 with one verified same-EXE synthetic-profile relaunch and real Home/Board/Notes/Preferences observations, establish actual media condition for G25, then grouped Reports/Sessions/export and remaining native observations. Narrowly acquire remaining evidence for the existing16 A/B routes/QPC hold; do not repeat old completed analyses. User-deferred Quit/Timer drag/held Escape/second-display cases remain excluded until the user changes that scope. M10 stays gated, M11/M12 dormant. Analyze new immutable originals and correct only confirmed problems through the normal source-owner workflow.

Private databases/backups/ledger, app EXEs and caches excluded. Raw text originals ZIP protects against checkout newline normalization. Earlier `.png` screenshots may contain JPEG bytes returned by Computer Use; decode by signature. Whole Narro-M7-Logs includes earlier B sessions plus this session; use session identity, not folder presence, for attribution.
