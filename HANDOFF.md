# HANDOFF — final audit corrections / exact-head Windows validation

## NOW — Codex / 2026-11-08 / CI_AND_PACKAGE_REFRESH

The five final-audit defects are implemented, with actual-callback/finalizer and negative lifecycle/panic/recovery regressions. Main correction [PR496](https://github.com/MariosGiannakaras/Narro/pull/496), head `681b165f41f834b5cbcc1bf14bfabbab7dc5bc8c`, [CI42462082195](https://github.com/MariosGiannakaras/Narro/actions/runs/42462082195). Source owner remains this active Codex chat and the owned temporary `C:\Users\MariosG\.codex\worktrees\narro-final-audit-20261108` wrapper. All four full frontend preflight/builds, Rust formatting and meaningful source/lifecycle fault tests PASS; full npm audits show zero findings. Synthetic six-frame black-video packet and owned synthetic FFmpeg stop PASS; no Narro/desktop/profile action. Local Rust compile NOT RUN (MSVC linker unavailable); Windows CI is the authoritative automated native gate.

| Held candidate | Corrected exact head | Required CI |
| --- | --- | --- |
| PR437 | `9cee16f8136a707efa37112548ba41b2393589b3` | [42462332844](https://github.com/MariosGiannakaras/Narro/actions/runs/42462332844) |
| PR389 | `606b5671f570e5c2675542661cfae266fb5bc1fa` | [42462337268](https://github.com/MariosGiannakaras/Narro/actions/runs/42462337268) |
| PR419 | `8e0845f89fe2ee21f2c8179364b31ffbe06ffd96` | [42462338050](https://github.com/MariosGiannakaras/Narro/actions/runs/42462338050) |

Main PR496 is merged at `bfda1c083a4def15bd175eb59de935c76b6e316b` after CI42462082195 **3/3 SUCCESS**. Direct comparison to validated head differs only in nonbundled HANDOFF.md; all source/build/test/workflow inputs are byte-identical. Duplicate resulting-main CI42463486604 was intentionally cancelled after this proof. A389 CI42462337268 and B419 CI42462338050 are independently **3/3 SUCCESS**; A physical/quiet packages are verified and B physical/quiet packages are also verified.

**Active dependency: PR437 CI42462332844, attempt3, unchanged source `9cee16f8136a707efa37112548ba41b2393589b3`.** Attempt1 stopped at task-scheduling-dark readiness without a reported product assertion; the legacy CLI discarded failed HTML, so original timing/renderer cause is unknown. Attempt2 then passed every visual fixture and compiled the native release, but MSI packaging stopped downloading the pinned WiX archive with HTTP504. Direct fresh download returned HTTP200, ZIP CRC PASS, 41,297,555 bytes / SHA2566ac824e1642d6f7277d0ed7ea09411a508f6116ba6fae0aa5f2c7daa2ff43d31. A new failed-job-only retry addresses this separate upstream network failure; no application, assertion, timeout, workflow or source change. Scheduling fixture/dialog/CSS/capture Git blobs match all four sources; main/A/B passed them. Do not blindly repeat again; inspect any new first causal error. Local direct Edge diagnostic returned no DOM and is not a fixture/native PASS. Resume the existing run, not a new branch or source push.

All Rust/native compositor/accounting files and original Blitzit are unchanged by each candidate's narrow eight-file correction; A/B QPC and B harness fixes remain. **Do not acquire from superseded cached packages.** Next: complete this exact437 retry, verify/cache remaining replacements, promote the three-entry register, refresh kit/docs, then recycle superseded packages and this owned wrapper. Existing packages stay protected until replacement verification. PR437/389/419 stay draft/unmerged with their own native gates. Physical acceptance remains NOT RUN; M10 review hold and inactive M11/M12 remain. Local durable checkpoint/validation/source/merge receipts: `PhysicalChecks/verification/20261108-final-repository-audit/`.

## Previous preparation checkpoint — superseded by audit remediation

# HANDOFF — all three physical candidates prepared

## NOW — Codex / 2026-11-08 / PREPARED

The user requested that only actual physical acquisition/checks remain. Preparation is complete for default437 and independent A389/B419: each exact head has validation/fast/Windows **3/3 SUCCESS**, locally verified observer-enabled physical and observer-free quiet packages. No CI wait, observer port, package download, dependency build or temporary-checkout cleanup remains for these three sources. Actual native capture/input/logging admission and product acceptance remain part of the physical session, **NOT RUN**.

| Candidate | Exact source | Green CI | Physical artifact | Quiet artifact |
| --- | --- | --- | --- | --- |
| PR437 default | `9aea395bde3802f27468de667921f65d9f6cc6a2` | [42393556625, attempt2](https://github.com/MariosGiannakaras/Narro/actions/runs/42393556625) **3/3** | [13583368714](https://github.com/MariosGiannakaras/Narro/actions/runs/42393556625/artifacts/13583368714) | [13583742919](https://github.com/MariosGiannakaras/Narro/actions/runs/42393556625/artifacts/13583742919) |
| PR389 A control | `797c30ed1ec53c28a4ef078adcb828a430a7f4b0` | [42423129558, attempt1](https://github.com/MariosGiannakaras/Narro/actions/runs/42423129558) **3/3** | [13594522994](https://github.com/MariosGiannakaras/Narro/actions/runs/42423129558/artifacts/13594522994) | [13594913448](https://github.com/MariosGiannakaras/Narro/actions/runs/42423129558/artifacts/13594913448) |
| PR419 B comparator | `0bcbbd95083dc7554033251a99f1b43096ea3bc8` | [42426782541, attempt1](https://github.com/MariosGiannakaras/Narro/actions/runs/42426782541) **3/3** | [13596024633](https://github.com/MariosGiannakaras/Narro/actions/runs/42426782541/artifacts/13596024633) | [13596820478](https://github.com/MariosGiannakaras/Narro/actions/runs/42426782541/artifacts/13596820478) |

All6 ZIPs: published digest/size/CRC, exact source/run/attempt/feature and all33 manifest members (12 physical +21 quiet) PASS. Physical EXE/controller identity admission PASS without launch; each packaged controller matches its Git source text (CI CRLF checkout accounted for). Quiet EXEs have no general-observer schema marker. Current register: `E:\SystemFiles\Desktop\Narro Project\PhysicalCandidates\20261108\VERIFIED_CANDIDATES.json`; each entry records its own `controllerPath`, `exePath`, `manifestPath` and separate `quietPackage`.

Observer PR495 is merged at e70800b31da0a5f5d6a5af56c9163ce97f8b1915 after CI42390609215 3/3; resulting-main CI42393274239 independently3/3 SUCCESS. A/B merge current validated observer/workflow forward while retaining critical compositor byte identities (A8/B12 checked inputs). Their automatic supervisor additionally captures buffered native QPC into per-launch packet folders and source/PID-validated timeline records. New general observation is test-only; final/default builds exclude it.

## NEXT — actual physical chat

Start locally at `PhysicalChecks/START_HERE.md`, recheck live selected PR head against the register, and follow [the fresh protocol](docs/PHYSICAL_ACCEPTANCE_NEW_RECORDING_BASELINE_2026-11-06.md). Use the selected package's **own controller from its register entry** for start/mark/launch/finish/recover/collect. The copied kit controller is a source reference, not an interchangeable acquisition version. The old helper prepares only; direct -Launch is retired.

The supervisor starts video before Narro, verifies actual PID/path/hash/source/feature/logging, preserves one recording across normal Quit/relaunch and automatically collects index/brief/timeline/video/PTS/raw logs. The executing/resuming chat reads EVIDENCE_INDEX.json and ANALYSIS_BRIEF.md, then inspects matching original video intervals and logs together. Preserve explicit gaps; SQLite precommit is not durability, unlinked async observations are not causality, and native QPC/UTC is not exact DWM scanout. Quiet CPU/RAM uses that source's separate quietPackage and measurement scripts without observer or recorder.

Begin default437 with actual nonzero movement/capture/trace health and repaired PP44-F01 accounting before dependent long batches. Run A/B strict8/8 on their own exact EXEs under the protocol; never substitute437 or transfer another source's verdict. The B diagnostic harness now uses actual ready UI prewarm, distinguishes loaded Timer content from intentionally inert hover/focus actions, and reveals Return through the normal keyboard-focus path. Its formerly failing packaged runtime and final physical logging lifecycle passed on the exact final head.

## Protected inputs and completed local cleanup

All86 canonical Blitzit files rehashed MATCH; original subtree8fee0c8f4f7946d6253f03100d8ec8fde2b4948f preserved in A/B, and zero old tracked work-log/evidence files restored. All protected source/reference copies, approved branding, unpublished-source recovery, current packages/tools and in-flight physical evidence remain outside cleanup targets.

The obsolete20261107 software cache and the owned `C:\Users\MariosG\.codex\worktrees\narro-ab-observer-20261108` wrapper were sent to Windows Recycle Bin after replacement verification. Original paths absent; metadata/payload file counts and bytes verified. Old A was separately retired after its earlier verified replacement. Bin not emptied; no disk-space gain claimed. No cleanup blocker remains and no OS/security/permission settings changed. Local receipts: `PhysicalChecks/verification/20261108-ab-observer/`. The earlier21-root cleanup and previous observer-wrapper retirement remain complete.

## Acceptance and stage boundaries

M1–M4 retain scoped acceptance; M5–M9 remain OPEN. [The M0–M9 closure map](docs/M0_M9_IMPLEMENTATION_CLOSURE_AUDIT_2026-11-07.md) owns all59 documentary open rows; these are not59 unimplemented features. Held431/436 remain ancestors of437. Fresh native/source-rendered evidence, first-fault diagnosis, actual movement/SNAP, accounting/restart and hardware clauses are not closed by CI.

PR437/389/419 remain DRAFT/UNMERGED until their own native/source requirements close; A/B strict8/8 and source independence remain binding. M10 still needs post-M9 user review/explicit approval; M11/M12 remain inactive. No local Narro/installer/desktop recording ran during this preparation.

[All-candidate completion receipt](work-log/2026-11-08-codex-all-physical-candidates-prepared.md), [session contract](docs/PHYSICAL_SESSION_OBSERVABILITY.md), [retention policy](docs/EVIDENCE_RETENTION_POLICY.md). Historical pending/blocked/isolated-harness snapshots are dated evidence, not current startup instructions.
