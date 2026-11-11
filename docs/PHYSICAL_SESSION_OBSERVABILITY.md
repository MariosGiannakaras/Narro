# Automatic physical-session observation (test infrastructure only)

**CURRENT 2026-11-11 STOP AND SOURCE OVERRIDE:** The explicit user STOP at `2026-11-11T12:13:04Z` forbids any new Windows app/installer launch, recorder or AppData mutation until explicit reactivation. Once reactivated, **Codex** owns one coordinated, *source-isolated* M1–M9 physical campaign with immediate privately verified upload per frozen session, not a separate user request for each milestone. Candidate identities must be read from live `HANDOFF.md` and the [updated exact-source bulk register](M5_M9_BULK_PHYSICAL_CAPTURE_HANDOFF_2026-11-10.md): PR499 `7f6d3258...` (physical artifact `13777945506`), PR437 `ccdd993c...` (`13613239808`), **revised A389 `ae02c732...` (`13865006667`) and revised B419 `9c5fbc3a...` (`13863713327`)**. All package members were independently verified, but the *new A/B binaries* have **not** been installed/admitted or physically executed on the host. The `PhysicalCandidates/20261108/VERIFIED_CANDIDATES.json` source entries for A/B are historical and **must not be used for the new A/B gates**. Re-admit the actual source-specific executable/manifest/controller before each capture; A/B strict independent 8/8 remains OPEN. Upload automatically to a private **draft** release after safe freeze and verify remote receipt before another recording. Never infer physical PASS from package tests or incomplete trace indexes.

**Historical 2026-11-10 note (superseded):** Read [source-isolated bulk capture handoff](M5_M9_BULK_PHYSICAL_CAPTURE_HANDOFF_2026-11-10.md) and current [HANDOFF](../HANDOFF.md) before selecting a physical controller. The older PR499 SHA and artifact in the dated note below are **not current** after the live Timer drag fix and bundled uploader provenance correction. Default PR437 and A389/B419 physical+quiet packages passed independent **33/33 manifest member checks**, but on-machine PID/path/control/video logging admission remains NOT RUN. Current PR499 latest-source run must pass 3/3 and manifest must include all **5** EXE/MSI/NSIS/supervisor/uploader files. Old controllers remain immutable; perform standalone immediate private upload after freeze for pre-uploader packages. No Codex-initiated PA without separate reactivation.

**User override2026-11-09:** collection must immediately upload the complete frozen packet, including incomplete/failure packets, before analysis/another recording. Require verified remote size/SHA256 and a receipt; failures remain UPLOAD_PENDING. [Workflow](PHYSICAL_EVIDENCE_UPLOAD.md). Older local-only/no-auto-upload directions are superseded by this explicit authorization. No new recording is authorized by the current transfer-only task.

User decision,2026-11-07: acquire logs automatically from process start through exit during physical checks, collect them with original video and provenance, and require the executing/resuming chat to analyze the packet together. This is **not final-product logging**, cloud telemetry or automatic access to other chats.

**Current observer/software status (2026-11-11):** PR499 corrected exact source `7f6d3258ecc227211021abb8a2989b191f1f1e16`, verified physical artifact `13777945506` and diagnostic `13777316895`; PR437 exact source `ccdd993ca9808e36f0c23e626dbcc4eea62e9a49` retains artifact `13613239808`. Original 2026-11-08 A389/B419 packages are **superseded** by corrected source A389 `ae02c7327b58653e9d6a4715d38cbb0c09735d29` physical `13865006667` / quiet `13864787114` and B419 `9c5fbc3aa2278d23b17e772b7090488b76df3e36` physical `13863713327` / quiet `13864223502`; their current four ZIPs have 22/22 independently verified manifest members. No source-specific replacement package has been admitted and tested on the physical host after the STOP. The prior PR499 `ae0447c4...` receipt and previous A/B binaries are historical only. Main PR496/497 observer infrastructure remains its own validated implementation; original Blitzit is protected. See current [HANDOFF](../HANDOFF.md), [candidate register](M5_M9_BULK_PHYSICAL_CAPTURE_HANDOFF_2026-11-10.md), and [PR499 physical delta](PHYSICAL_ACCEPTANCE_NEW_RECORDING_BASELINE_2026-11-06.md#pr499-d01d05-corrected-source-physical-acceptance-delta).

## Architecture and scope

- Cargo feature `physical-observability` is absent from defaults and enabled only by the physical Tauri overlay. The ordinary release excludes its Rust module, plugin, hook installation and embedded observer script.
- The physical frontend is built into separate `dist-physical`; Vite resolves core IPC/event imports through test-only adapters. Ordinary `dist` remains uninstrumented. Tauri's immutable internals, command payloads/results and production window URLs are preserved.
- A document-start observer records meaningful UI actions, IPC inputs/results/errors, event delivery, JS errors, coalesced DOM changes and heartbeat/sequence health. This is not every React render/paint or an unlimited dump of user text.
- Backend dispatch carries the IPC trace ID. App/Timer publications, backend error construction, native window/lifecycle events and configured SQLite connections/row changes/commit requests/rollbacks are observed. SQLite's precommit hook is **not durable-commit proof**; persisted reads/native acceptance remain independent.
- Synchronous dispatch has explicit causal context. Async/background observations without propagated context remain **unlinked**; never attribute them to the last click/command merely because times/threads are close.
- Per-process JSONL rotates at16 MiB without retiring earlier chunks inside the live session. A bounded nonblocking queue protects the product thread; dropped records/write failures mark coverage incomplete. There is no promise of infinite disk space or lossless forced termination.
- A normal tray Quit drains available frontend queues/acknowledgements before the final authoritative timer checkpoint, with a bounded3-second diagnostic wait. It never vetoes a product commit or silently cancels/restarts a case. Missing tail/drain acknowledgements remain explicit gaps; a cancelled Quit resumes observation and marks its brief frontend gap.

## One owned campaign, automatic acquisition

After the user explicitly lifts STOP, use **only the currently admitted** candidate-specific `controllerPath`, `exePath` and `manifestPath` obtained from a fresh hash-verified register for each chosen source. The `PhysicalCandidates/20261108/VERIFIED_CANDIDATES.json` is **not a current A/B admission source** and does not include PR499. For PR437, even a historically matching entry requires current local source/EXE/controller confirmation before launch. Never use another branch's controller, EXE or manifest. Run the selected controller with Node and the already prepared FFmpeg/FFprobe tools. The preparation helper is preparation-only; its old direct -Launch path is retired. The supervisor validates EXE bytes against the artifact's `physical.json` (including the observation feature), refuses duplicate Narro processes, starts loss-resistant MKV desktop video **before** launching Narro, assigns a fresh persistent session root and sets process log directories. It verifies the actual PID/path/hash, embedded source/feature and frontend/backend logging handshake.

```powershell
# Only AFTER explicit user reactivation and fresh on-host source/package admission.
# Populate these three variables from the exact SHA-verified CURRENT candidate;
# never reuse the historical 20261108 A/B register for corrected versions.
$physicalKitRoot = "E:\\SystemFiles\\Desktop\\Narro Project"
if (-not $physicalCandidate -or -not $physicalCandidate.controllerPath -or -not $physicalCandidate.exePath -or -not $physicalCandidate.manifestPath) {
  throw "No current source-verified physical candidate has been admitted"
}
node $physicalCandidate.controllerPath start --exe $physicalCandidate.exePath --manifest $physicalCandidate.manifestPath --ffmpeg "$physicalKitRoot\Tools\ffmpeg\ffmpeg-9.0.2-essentials_build\bin\ffmpeg.exe" --root "$physicalKitRoot\PhysicalEvidence"
```

The start command is a foreground owned supervisor: retain its live tool/process handle in the physical chat. No capture is launched by reading this document or preparing the kit. Never start this supervisor solely to test setup in an implementation-only session.

After `SESSION_ROOT=...` and actual admission, use another command/tool call to mark cases, perform normal tray Quit and relaunch the **same admitted binary**, or finish the campaign. Commands wait for their supervisor acknowledgement; rejection is not completion.

```powershell
node $physicalCandidate.controllerPath mark --root '<SESSION_ROOT>' --label 'PA-04: edit historical Work session'
node $physicalCandidate.controllerPath launch --root '<SESSION_ROOT>'
node $physicalCandidate.controllerPath finish --root '<SESSION_ROOT>'
```

`launch` requires the prior process to have exited. `finish` requires normal Narro exit, keeps the recorder alive through the exit, stops/finalizes it and automatically collects the packet. Keep this one recorder across Quit/relaunch persistence cases. No implicit AppData reset, installer run, OS modification or unsolicited process termination is part of the supervisor.

During capture it checks writer health; on failure it freezes the recorder and preserves diagnostics. If the owned Narro is still live, preserve its files and Quit normally, then recover. Never collect/retire live writer files. A stale CAPTURING entry alone does not prove liveness.

```powershell
node $physicalCandidate.controllerPath recover --root '<SESSION_ROOT>' --ffprobe '<ffprobe.exe>'
node $physicalCandidate.controllerPath collect --root '<FROZEN_SESSION_ROOT>' --ffprobe '<ffprobe.exe>'
```

Recovery/collection proves supervisor, recorder and all launched Narro PIDs exited before mutating packet files; stale heartbeat alone is insufficient. Unknown/denied ownership or a reused live PID fails closed; never manually clear state/PID flags to bypass it. Recorder shutdown always attempts bounded q/close/owned-recorder termination even after diagnostic write failure, with early PID persistence and explicit incomplete state. Narro is never killed to finish a persistence case. Recovery produces an explicitly incomplete interrupted-session packet. Inspect it before repeating any acquisition. Hardware/input/tool dependencies and independent per-PR holds still apply.

## Packet and mandatory chat consumption

The session root contains source/run/EXE admission, process identities and log chunks, original desktop video, recorder diagnostics, acknowledged operator actions, probe output, `TIMELINE.jsonl`, `EVIDENCE_INDEX.json` and `ANALYSIS_BRIEF.md`. Collection records size/SHA256 of raw inputs and detects missing chunks/sequences/pages/tails, drops, source mismatches and recorder/probe failures. Packet integrity is separate from a product verdict. Valid source/PID-bound panic sidecars join the timeline and brief even when ordinary trace parsing fails; malformed rows remain explicit gaps. The current index.applicationFailures summary contains observed Rust panics; IPC/JS/frontend errors remain in the joint timeline as well. A zero panic count or COMPLETE packet does not mean an error-free application.

The physical/resuming chat must:
1. Read current HANDOFF and inspect actual owned process/recorder/partial-file state.
2. After a safe freeze, read the packet's index/brief and identify coverage gaps.
3. Analyze each relevant original video interval/actual PTS together with its actions, IPC/state/SQLite/native records; follow explicit trace IDs rather than assumed causality.
4. Publish compact per-claim PASS/FAIL/INCONCLUSIVE/NOT RUN and references to needed input files; preserve failure context before source fixes.
5. Update the existing HANDOFF with packet path, owner, consumer, protected in-flight state and retirement condition. Do not create a competing progress tracker.
6. Retire verified superseded/unneeded Narro packets under the existing retention policy. Preserve original Blitzit and pending software/unpublished source.

Another chat with access to this machine can read the same stable local packet. A repository-only/other-machine chat needs the relevant explicitly transferred packet; GitHub cannot read local files and an ended chat does not monitor or upload them automatically. Do not commit raw packets or auto-send messages to other chats/services.

## Clock, performance and validation limits

Use same-machine UTC plus per-process/page/supervisor monotonic values. Frame-zero UTC lies between recorder start and observed first frame; this is a bounded anchor, **not frame-exact UTC synchronization**. Use actual PTS for motion timing; record clock uncertainty when correlating layers. Video-only symptoms may require optical/frame analysis even when state logs agree.

No audio is captured by this video command: sound/notification acceptance needs its actual independent observation. Coalesced DOM/log state is not paint proof. Quiet CPU/memory work uses an uninstrumented exact-source release with its own identity and disclosure; do not grade idle performance from a recording/logging build.

Validation includes frontend/collector semantic tests, physical-versus-normal frontend separation, Rust formatting/feature tests/Clippy, and an exact-build Windows lifecycle probe for actual JS/IPC/SQLite/Quit drain and ordinary-release exclusion. Local missing MSVC is NOT RUN, not compiler PASS. Full recorder/start/Quit/relaunch/collection behavior still needs the available native physical bench; CI logging health cannot close the ordinary PA or source-parity gates.

## Prepared A/B supplement and quiet measurement

A/B controllers automatically set a per-launch native QPC folder, retain its raw records in the packet inventory and merge source/PID-validated stages into TIMELINE.jsonl. Malformed/unmatched records become gaps; these clocks do not prove DWM scanout. The old specialized screenshot-bracket harness is only a narrower follow-up if actual evidence warrants it. Offline source-specific guides/analyzer are in PhysicalChecks/candidate-guides/pr389 and pr419, with separate source/blob receipts.

Quiet CPU/RAM must use the selected register entry's quietPackage and its dedicated measurement scripts/docs without observer or recorder. Those three diagnostic ZIPs and their7 members each are verified; a quiet EXE is intentionally rejected by physical-session admission. Do not score instrumented/video overhead as product idle cost.
