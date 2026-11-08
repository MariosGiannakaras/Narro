# Open M5-M9 deep review - 2026-11-08

Audit complete; source correction remains OPEN. This review supersedes the earlier blanket "no known code task remains before physical checks" statement only for the affected open claims below. Prepared software identity and prior exact-head CI remain valid evidence of their own scope.

## Scope and evidence

Reviewed current main37322dde0799b96c2f9ffe087d3814bd7ff08380 and default437ccdd993ca9808e36f0c23e626dbcc4eea62e9a49. A389606b5671f570e5c2675542661cfae266fb5bc1fa and B4198e0845f89fe2ee21f2c8179364b31ffbe06ffd96 were compared for shared callback and native recovery differences. Upstream431/436 and design418 identities/roles were rechecked. No application source, tests, workflow, dependency, bundled validation doc or milestone checkbox was changed.

The existing59 open criteria (M5-M9:6/13/18/11/11) were reconciled against their owners and required proof. This is targeted cross-boundary source review and fault probing, not59 physically executed scenarios or a claim that every line is correct. Accepted M1-M4 and completed F01-F06 corrections were not restarted; foundation code was inspected only where it directly supports an open claim. M10 entry rules were checked without beginning M10; M11/M12 remain dormant.

## Findings and disposition

| ID | Priority / confidence | Affected open scope | Result |
| --- | --- | --- | --- |
| D01 | P2 / reproduced actual compiled provider with controlled service ordering | M8 Preferences, Quick Preferences and their consumers | Older save or recovery replies overwrite newer committed-event state. |
| D02 | P2 / reproduced actual validator and handlers with delayed valid PNG reads | M5 SS-C01 list-icon upload | Old selection can replace new selection; Save can accept the previous icon while selected upload validation is pending. |
| D03 | P2 / demonstrated default-source recovery branch; native fault execution NOT RUN | M7 protected transition/renderer-loss recovery | Default watchdog abandons expired lease on temporary gate contention. A/B already contain the relevant retry remedy/tests; default does not. |
| D04 | Existing NER-007 PARTIAL / source-verified executor boundary; native UI NOT RUN | M9 Reports/history and related open responsiveness claims | Create is offloaded, but reads and history Edit/Delete still perform blocking SQLite work in synchronous Tauri commands. |
| D05 | P3 / actual local failure and controlled rerun | Validation supporting open M9 read ownership | Reports read-producer test assumes LF and aborts before testing callbacks on a normal CRLF checkout. |

No durable database corruption, new native compositor failure, actual missed Windows input or root cause of the old Timer poison incident is claimed from these probes.

## D01 - preference save/recovery has no freshness owner

[Default production provider](https://github.com/MariosGiannakaras/Narro/blob/ccdd993ca9808e36f0c23e626dbcc4eea62e9a49/src/PreferenceSettingsRuntime.tsx#L131): successful save unconditionally calls setSnapshot(committed); failed-save recovery unconditionally applies a later getPreferenceSettings response. Neither path uses the revision guard that protects default's initial read.

Witness: start a save; deliver a newer committed Preferences event; then resolve the older save response. The UI snapshot regresses to the older timezone/volume. Repeat after save rejection with a delayed recovery read: the newer event is again replaced. All six actual compiled-provider cases reproduced across default/A/B. This proves the callback logic under that service ordering; the exact native transport timing was not physically reproduced and its frequency is unknown.

Negative control: default's initial-read guard preserves the newer event. A/B's older provider lacks that initial guard and the same control regresses there; do not transfer default's broader Settings acceptance to comparator sources. That differential is not a request to restart default's already-corrected initial-load work.

Required remedy: one coherent freshness/committed-revision policy across initial reads, saves, recovery reads and events, while retaining single-flight writes and true commit/error semantics. A naive "ignore every reply if any event occurred" fix must also be tested against an event preceding a genuinely newer own commit or a failed broadcast. Cover both reply orders, own/other-window events, failed saves, stale failed reads, retry and disposal. No preference schema/product behavior change is justified by this finding.

## D02 - icon file validation is outside the draft/save owner

[Actual handlers](https://github.com/MariosGiannakaras/Narro/blob/ccdd993ca9808e36f0c23e626dbcc4eea62e9a49/src/ListEditorModal.tsx#L212) await file validation without a request generation, mounted owner or validation-pending admission flag. The Save guard covers saving only.

Two actual-handler witnesses, using a valid repository PNG:
- Select first.png, then newest.png; resolve newest first and first last. The final draft is first.png, although newest.png was the last selection.
- Select an upload and click Save before its read/validation resolves. The actual submit accepts keep-original; when the read resolves, savingRef makes the newly chosen upload disappear from that attempt.

Required remedy: assign the current draft/validation a synchronous owner; obsolete selection, builtin-icon changes and disposal must invalidate old work. Save must not commit an unvalidated/outdated selection. Preserve selected-file errors/draft on retry and release blob URLs with their actual owner. Add real callback/deferred-file regressions, including newest-invalid/older-valid, Save during validation and close during read. Keep approved Spectrum Core, upload presentation,218 builtin icons, file types and branding unchanged.

## D03 - default is missing already-authored watchdog contention recovery

[Default watchdog](https://github.com/MariosGiannakaras/Narro/blob/ccdd993ca9808e36f0c23e626dbcc4eea62e9a49/src-tauri/src/lib.rs#L128) expires the owned token, then calls presentation_guard once. The guard uses try_lock. On FOCUS_PRESENTATION_BUSY, the watchdog returns before taking/dropping the lease, without another wake/retry. If the renderer has disappeared, the sole cleanup worker can therefore abandon the Rust lease and its placement/display suspensions. Destruction of the native bitmap window by its separate timer does not drop that Rust owner.

A/B already use retry_busy_focus_recovery off the UI thread and have transient-contention/nonbusy-error regressions, e.g. [A's existing implementation/tests](https://github.com/MariosGiannakaras/Narro/blob/606b5671f570e5c2675542661cfae266fb5bc1fa/src-tauri/src/lib.rs#L117). Their prior exact-head green CI is reused, not repeated. This is a missing default integration, not a new reason to rewrite the accepted A/B helper or infer physical failure.

Required remedy: port/reconcile the existing ownership-aware recovery into default and validate busy-at-expiry, subsequent release, replaced token, no current lease and nonbusy/poisoned failure. Do not replace try_lock with a blocking UI-thread wait. Native renderer-loss/slow-owner recovery remains NOT RUN; frontend's21 passing protected-resize cases do not exercise this Rust worker.

The native dispatch wrappers also bound receiver waiting without cancelling the queued GUI operation: operation executes before sending its result. A delayed closure may therefore outlive the caller's timeout. This is a source-identified recovery risk to include in the same targeted fault test, not an observed late native mutation. See the [default wrapper](https://github.com/MariosGiannakaras/Narro/blob/ccdd993ca9808e36f0c23e626dbcc4eea62e9a49/src-tauri/src/focus_frame_hold.rs#L290) and the [Rust receiver contract](https://doc.rust-lang.org/std/sync/mpsc/struct.Receiver.html#method.recv_timeout).

## D04 - remaining Reports executor boundary

[Create](https://github.com/MariosGiannakaras/Narro/blob/ccdd993ca9808e36f0c23e626dbcc4eea62e9a49/src-tauri/src/report_commands.rs#L857) already uses an async command plus spawn_blocking. [Edit/Delete](https://github.com/MariosGiannakaras/Narro/blob/ccdd993ca9808e36f0c23e626dbcc4eea62e9a49/src-tauri/src/report_commands.rs#L900) and report reads remain synchronous and open/query/write SQLite directly. Edit/Delete begin immediate transactions. Synchronous commands occupy the main thread under [Tauri's documented executor model](https://v2.tauri.app/develop/calling-rust/#async-commands).

An isolated SQLite two-connection probe confirmed that the writer boundary waits under contention; it is a supporting library probe, not execution of the Rust handler or a measured Narro freeze. A busy timeout bounds eventual failure, not native input responsiveness. Existing NER-007 remains PARTIAL; do not reopen completed domain accounting, duplicate PP44-F01's correct transaction repair, or claim persisted corruption.

Before closing the affected responsiveness claim, use the existing offload pattern for the remaining blocking path or produce sufficiently bounded real evidence for an alternative. Retain transaction/CAS/error/invalidation ordering and use a real-lock command-level regression. Capture actual keyboard/window response separately where required.

## D05 - CRLF sensitivity hides the semantic test

[The test's source-slice marker](https://github.com/MariosGiannakaras/Narro/blob/ccdd993ca9808e36f0c23e626dbcc4eea62e9a49/scripts/test-reports-read-producers.mjs#L6) assumes an LF newline. It failed locally before reaching the production callbacks. Rerunning with exact Git-blob bytes, without a semantic source change, passed the actual stale-filter/post-mutation/closed-detail cases.

Normalize line endings or use a syntax-aware extractor; preserve assertions and add a small CRLF input control in the next source/test correction batch. This is a validation portability issue, not a Reports runtime failure or evidence that prior CI failed.

## What the review preserves

| Open family | Inspected ownership / remaining boundary |
| --- | --- |
| M5 six rows | Home/Board grouping and ordering, archived composition, recurring-parent request identity and approved List editor. D02 needs correction; source appearance/persistence cases remain independent. |
| M6 thirteen rows | Focus task/target/read ownership, action admission and committed-success handoff, work/Break/overdue presentation, metric and subtask owners. Subtask child keys and projection generations reject superseded owners; original celebration media/source ambiguities remain explicit limits. |
| M7 eighteen rows | Coordinator -> prepared/painted renderer -> token-owned native raster/geometry -> publication/release/rollback; placement persistence, SNAP/topology and comparator differences. D03 remains a default recovery gap. Native pixels, real movement, DPI, topology and quiet footprint remain unexecuted. |
| M8 eleven rows | Shared preference producer/event/save paths, full/Quick loading and live placement, friendly-name/preview association and conditional/sound consumers. D01 needs correction; device-name ambiguity falls back rather than guessing. Real preview/input/sound remains unexecuted. |
| M9 eleven rows | Request-keyed Overview, generation-owned Sessions/detail/commit reads, history CAS/zero-floor transaction, date/filter/export consumers. Semantic read guards pass after LF input normalization; D04/D05 remain. Native/PDF/source claims stay separately open. |
| M10-M12 | Existing ordering, evidence-reuse and independent activation gates checked only. No M10 work, optional activation or new feature backlog started. |

Locally executed: Preferences write-admission PASS; protected Timer resize21/21 PASS; live Time Taken renderer/reducer PASS; Motion v4 pure choreography/geometry PASS; list-editor contract PASS; Reports actual read producers PASS on exact Git text, with the original CRLF harness failure retained. These existing successes do not cover the new D01/D02 counterexamples or native D03 fault.

No local Rust compilation was represented as performed: an MSVC linker was unavailable. No local Narro, installer, desktop recording, profile mutation, physical input, full closed-foundation test campaign or unnecessary Windows CI run was performed. Existing exact-head CI is reused only for unchanged claims.

## Next source slice and closure

First remedy D01/D02 and reconcile the already-authored D03 recovery into the existing source owner/default. Keep the necessary D05 test portability fix in that coherent validation batch; resolve NER-007 for the affected M9 scope with evidence rather than a speculative rewrite. Batch only dependency-safe changes and run their meaningful negative regressions before exact-head CI. Preserve independent A/B compositor and M10/M11/M12 holds.

Current packages remain source-verified diagnostic candidates. They cannot inherit future corrections without new exact-source validation/artifacts, and should not be called a blanket all-clear for D01-D03's affected claims. Unaffected dependency-ready physical cases may still proceed under the existing protocol; this audit does not impose a new campaign-wide permission ban.

Compact source-bound witnesses and the59-row scope manifest are in the prepared machine's PhysicalChecks/verification/20261108-open-scope-deep-audit/. Their named consumer is the corrective slice and its regressions; retire superseded probe inputs under the normal retention policy once that consumer closes. Original Blitzit, approved assets, verified software and unpublished-source recovery remain protected. No milestone checkbox changes.
