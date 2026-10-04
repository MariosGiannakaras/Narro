# CI942 physical checkpoint and evidence reuse

Source `c2821e6f998c6cd7424d5aed8673f5c9a3ff9e9d`, full Windows CI942/run37191346390 PASS, guarded PR231 merge `416ff40ecd6c50b660ecfef9c9c0b57c2dc7dd92`; zero non-Markdown differences between accepted head and merge. Production artifact11299369259 EXE SHA256 `3e836e942b45f3586e71bda15208f60b8b8cc901449146fdef76b8999b5b61ea`; isolated diagnostic artifact11299363071 SHA256 `89b2c7c6799743e891a8c602c0e969aab8d0ecdd6b64a809c453f44e567af648`.

Continuous OBS capture started09:45:40.777Z and stopped10:31:04.202Z at4480×1080/60fps. OBS reports202 rendering-lag frames (0.1%) and32 encoding-skipped frames; motion review must account for this rather than assuming every encoded frame represents a unique physical refresh. The original MKV, complete `Narro-M7-Logs`, observations and performance data are retained locally in `artifacts/m7-ci942-physical-20261004/run-final`; final frame review/publication is pending. Whole immutable CI936 evidence is already on main at19194b2f.

## Exercised results

- Corrected diagnostic B: four monitor/side probes PASS at100%/125%, repeated4/4 after reconnect. Native build identity/storage-isolation PASS. Initial stale Windows monitor selection is retained as a failed precondition; select a currently active display before the formal matrix. The physically restored baseline is secondary/right, not unobserved automatic/null.
- C: software2→1→2 topology recovery with Main present and absent PASS; same diagnostic PID86292/Focus HWND3081490 remains visible/safe, returning to primary96DPI after secondary removal. Duplicate→Extend restores both displays. Physical cable removal and actual display sleep/wake were not exercised.
- C5: real accepted max2392px cross-monitor drag, normal tray Quit of PID17624, same-EXE relaunch PID135708, explicit Ctrl+Shift+T Timer restore at(1330,613). Native evaluator PASS; same owned task recovers paused05:08. Final normal Quit preserves paused checkpoint; no production DB restoration or direct database mutation occurred.
- Notes: seven current source-order controls exercised, http(s) recognized as a hyperlink, save/restart persistence, large editor324×284 inside340×300 at100% reduced motion. Live title/Notes edits retain the owned task/session; completed integrated task retains464 work seconds and companion27. Dedicated integrated risk regressions remain separate.
- English/Greek physical scancode chords T/B/P/S/F/N and Main Ctrl+F were exercised, with actual focused-WebView layout recorded. Normal break skip returns paused, as the existing policy requires. Success-enabled Finish from compact correctly transitions to the full Panel before rendering the success screen. The source-ambiguous disabled Take a Break remains the documented existing disposition, not a new clipping failure.
- M8 affected Preferences: dark/success-on values durably save and survive Quit/relaunch; original light/success-off values restored. This complements the already validated two-connection regression; it is not a claim of physically forcing a lock.
- D protocol: all three quiet30s warm-up/60s sample runs completed on fresh diagnostic PID25528 with Main destroyed, compact340×110, OBS closed; each native preflight/hash PASS, zero process churn. Median one-core CPU0.025896%, summed working set399.420MiB, private committed333.006MiB. The unmodified canonical collector is now physically exercised; this closes finding16, not an unconditional memory-regression verdict.
- D interpretation: a separate matched cold CI936 launch (PID126160, same isolated storage/display setup, Main destroyed, same30s/60s protocol) averages0.025999% one-core CPU,399.266MiB working set and324.727MiB private committed. The difference from CI942 is approximately8.279MiB private memory (2.55%); endpoint attribution is to WebView2, with native Narro private memory lower (62.711 versus63.566MiB). The older warm936 median310.789MiB is not a matched startup comparison. CPU/working-set observations are stable; private-memory interpretation remains OPEN rather than claiming no unexplained regression. Both diagnostics were normally quit after sampling; no production data was modified. Raw comparison is under `performance-cold-baseline-ci936` and the three-run data under `performance`.

## New finding before further implementation

`M7-OBS-20261004-17` — **FAIL / FIX_NOW**, scoped M6/M7/M8 shortcut integration: after Focus Ctrl+Alt+T opens the modal Add task dialog, its Add button receives focus during explicit missing-list/lane validation. Ctrl+Alt+B starts a break behind that dialog (10:14:54Z), Ctrl+Alt+P changes the background work/break state and Ctrl+Alt+N opens background Notes while the dialog remains present. The window-level handler ignores editable targets only; a focused modal button is not editable. Preserve real evidence in `english-b-break.json`, `english-p-resume-created-companion.json`, `english-n-notes.json` and the continuous recording.

Reconcile one bounded correction: shared active-modal shortcut guard for Main/coordinator/committed Focus action listeners, including cross-window delivered Focus events. Ignore hidden/inert preparation content; preserve dialog-local Enter/Escape, ordinary shortcuts after closure, and the single authoritative timer coordinator. Add an actual rendered regression exercising focused modal buttons and attempted domain commands. This is a new keyboard-routing defect, not recurrence of the earlier native Collapse acceptance failure. No new rendering architecture or unrelated milestone implementation is justified.

## M1–M9 inventory consumed for this session

The user's cross-gate consumption instruction arrived during this already-running capture. Current TODO/HANDOFF/crosswalk were inspected before the remaining production phase and will be inspected again after final review. Do not describe that as a pre-start inventory for the earlier diagnostic phase.

| Milestone | Relevant open acceptance and evidence disposition |
| --- | --- |
| M1 | B/C exercised as above; D collection3/3 valid and matched cold baseline recorded, private-memory interpretation OPEN. No revalidation claim for autostart/notifications not exercised here. |
| M2 | No reopened domain checkbox; actual UI creation and durable owned identities provide reusable corroboration, not an exhaustive domain rerun. |
| M3 | Owned live metadata/recovery/completion464s evidence reusable; dedicated fresh-start/running-edit integrated regressions remain open, no M10 count. |
| M4 | Scheduling/recurrence source visual comparison not exercised; remain open where routed. No reminder/DST/recurrence PASS from this run. |
| M5 | Narrow board and Today progress are visible; title editing/hover stability and source ordinal/action/drag/delete/archive comparisons need sufficient direct review. Drag/delete/archive were not exercised here and remain open. |
| M6 | Shared placement/topology covered; latest entry/Notes/live-glow states captured, direct canonical comparison pending. Complete replacement integration remains open with finding17. Do not infer every row action/state from this limited session. |
| M7 | Native C5 PASS; latest changed paths captured; final motion/canonical review and finding17 closure pending. CI936 earlier accepted paths remain immutable/scoped evidence. |
| M8 | Affected preference save/restart and both-language chord behavior exercised; modal isolation FAIL. Preferences screenshots alone do not establish whole source parity. |
| M9 | Reports/Sessions/PDF/CSV were not exercised; source/physical gates remain open, Overview PDF remains its existing FIX_NOW implementation item. |

M10 gains reusable evidence only. Its hard entry gate remains closed; no M10 checkbox/counter advances. Explicitly announce completion of all required M1–M9 gates before proceeding to M10.
