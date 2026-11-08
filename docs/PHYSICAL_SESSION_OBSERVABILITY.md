# Automatic physical-session observation (test infrastructure only)

User decision,2026-11-07: acquire logs automatically from process start through exit during physical checks, collect them with original video and provenance, and require the executing/resuming chat to analyze the packet together. This is **not final-product logging**, cloud telemetry or automatic access to other chats.

**Implementation status: ALL THREE CANDIDATES PREPARED.** Observer PR495 CI42390609215 and resulting-main CI42393274239 independently3/3 SUCCESS. Default437/CI42393556625 attempt2, A389/CI42423129558 and B419/CI42426782541 independently3/3 SUCCESS; all3 source-specific physical +3 quiet packages are cached and verified (33 manifest members). Actual supervisor/capture/input health and product acceptance remain native session work. Current HANDOFF/register supplies exact source identities; old software is retired.

## Architecture and scope

- Cargo feature `physical-observability` is absent from defaults and enabled only by the physical Tauri overlay. The ordinary release excludes its Rust module, plugin, hook installation and embedded observer script.
- The physical frontend is built into separate `dist-physical`; Vite resolves core IPC/event imports through test-only adapters. Ordinary `dist` remains uninstrumented. Tauri's immutable internals, command payloads/results and production window URLs are preserved.
- A document-start observer records meaningful UI actions, IPC inputs/results/errors, event delivery, JS errors, coalesced DOM changes and heartbeat/sequence health. This is not every React render/paint or an unlimited dump of user text.
- Backend dispatch carries the IPC trace ID. App/Timer publications, backend error construction, native window/lifecycle events and configured SQLite connections/row changes/commit requests/rollbacks are observed. SQLite's precommit hook is **not durable-commit proof**; persisted reads/native acceptance remain independent.
- Synchronous dispatch has explicit causal context. Async/background observations without propagated context remain **unlinked**; never attribute them to the last click/command merely because times/threads are close.
- Per-process JSONL rotates at16 MiB without retiring earlier chunks inside the live session. A bounded nonblocking queue protects the product thread; dropped records/write failures mark coverage incomplete. There is no promise of infinite disk space or lossless forced termination.
- A normal tray Quit drains available frontend queues/acknowledgements before the final authoritative timer checkpoint, with a bounded3-second diagnostic wait. It never vetoes a product commit or silently cancels/restarts a case. Missing tail/drain acknowledgements remain explicit gaps; a cancelled Quit resumes observation and marks its brief frontend gap.

## One owned campaign, automatic acquisition

Use the selected manifest-verified package's own `controllerPath` from `PhysicalCandidates/20261108/VERIFIED_CANDIDATES.json` for every command, Node, and the already prepared FFmpeg/FFprobe tools. The preparation helper is preparation-only; its old direct -Launch path is retired. The supervisor validates EXE bytes against the artifact's `physical.json` (including the observation feature), refuses duplicate Narro processes, starts loss-resistant MKV desktop video **before** launching Narro, assigns a fresh persistent session root and sets process log directories. It verifies the actual PID/path/hash, embedded source/feature and frontend/backend logging handshake.

```powershell
$physicalKitRoot = "E:\SystemFiles\Desktop\Narro Project"
$physicalRegister = Get-Content -Raw "$physicalKitRoot\PhysicalCandidates\20261108\VERIFIED_CANDIDATES.json" | ConvertFrom-Json
$physicalCandidate = $physicalRegister.candidates | Where-Object { $_.pr -eq 437 } # select389/419 for its own suite
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

Recovery checks owned-process/supervisor state and produces an explicitly incomplete interrupted-session packet. Inspect it before repeating any acquisition. Hardware/input/tool dependencies and independent per-PR holds still apply.

## Packet and mandatory chat consumption

The session root contains source/run/EXE admission, process identities and log chunks, original desktop video, recorder diagnostics, acknowledged operator actions, probe output, `TIMELINE.jsonl`, `EVIDENCE_INDEX.json` and `ANALYSIS_BRIEF.md`. Collection records size/SHA256 of raw inputs and detects missing chunks/sequences/pages/tails, drops, source mismatches and recorder/probe failures. Packet integrity is separate from a product verdict.

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
