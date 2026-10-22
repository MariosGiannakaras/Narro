# PR389 exact-source Windows PASS and independently downloaded binary provenance — 2026-10-22

**Immutable acceptance checkpoint (code / automated validation only; physical NOT RUN).**

## Source and exact gate identity

- Owner: ChatGPT, same existing [PR389](https://github.com/MariosGiannakaras/Narro/pull/389), branch `fix/m7-pixel-preserving-composition`.
- Final candidate head: `ffaa512ef629b15739fa47664537b338bb981eec`, existing unchanged code at this checkpoint.
- Exact [Windows CI 39802187561](https://github.com/MariosGiannakaras/Narro/actions/runs/39802187561): **attempt 1** validation/fast PASS and Windows candidate FAIL caused by Preferences SQLite test `persistence::preferences::tests::preference_patch_waits_for_writer_and_preserves_its_latest_fields` -> `DatabaseBusy` (424/425 tests passed). That attempt remains historical FAIL. Source `mutate_preferences` had already used `TransactionBehavior::Immediate` and the same suite passed in separate accepted-main PR344 resulting run. We retried only failed Windows job on SAME SHA without any test changes; **attempt 2** `validation-gate` SUCCESS, `fast-gate` SUCCESS, `windows-candidate` SUCCESS. **3/3 latest exact-head gates PASS**.
- Functional change: replace insufficient in-parent GDI-child mode transition raster with finite independent Focus-HWND-owned nonactivating transparent Win32 layered popup `UpdateLayeredWindow`; preserve legacy small GDI clipping path, authoritative session/geometry and rollback. Build/CI proof alone does not confirm physical compositor.

## Independent artifact downloads and hashes

Downloaded the actual GitHub Actions artifacts and inspected ZIP internal CRC, package files and CI-generated manifest `sourceSha`, `githubRunId`, `githubRunAttempt`. All download ZIP hashes MATCH GitHub-reported digest, all ZIP CRC valid:

| Artifact ID | ZIP SHA256 | Contents |
|---|---|---|
| 12439471434 `narro-m7-validation-windows-x64` | `b45cd2f6312545db0f889ba7c9e757e43ca584bdde20e04435cf4022dd93dcb1` | `m7-validation/narro-m7-validation.exe`, README, manifest `ci-provenance/validation.json` |
| 12440365024 `narro-m7-physical-windows-x64` | `cf5a923989b92243b0b209bfd6ff5b6d22fb3705d27b16bf0bb165176ae77791` | `narro.exe`, NSIS installer, MSI installer, manifest `artifacts/ci-provenance/physical.json` |
| 12439230472 `narro-m5-visual-regression` | `e8bd1eb9cb464ec531f1b6f050938968a62bb906e505270ff651bdd9952458a7` | 417 actual Windows CI visual/HTML fixture entries |

**Binary provenance with independent SHA256** — 4 readouts (validation EXE, production EXE, NSIS, MSI) and corresponding CI manifest files:
- Validation `narro-m7-validation.exe` SHA256 `55ee0bb1f5f93ef7943777fa153cbbe26c5485aacde2b9a017ca456558a10299`.
- Production `src-tauri/target-physical/release/narro.exe` **same** SHA256 `55ee0bb1f5f93ef7943777fa153cbbe26c5485aacde2b9a017ca456558a10299`.
- NSIS `Narro_0.1.0_x64-setup.exe` SHA256 `9f9cb3abda8e6c585368633a38e0930140fe3f9ad91badd8e2de217d1e93e640`.
- MSI `Narro_0.1.0_x64_en-US.msi` SHA256 `c58118b28d423c7d305ccaf7f4aee4a9000e9d01a17bfabd7eb95bb5b21a4b9f`.
- Both embedded manifests state `sourceSha = ffaa512ef629b15739fa47664537b338bb981eec`, `githubRunId = 39802187561`, `githubRunAttempt = 2`; all hash/byte receipts MATCH.
- Other GitHub original artifacts `narro-m7-focus-runtime-visual`, `narro-m1-diagnostic-windows-x64`, `narro-fast-frontend-dist` have same-source sha/digest metadata, but were NOT independently downloaded in this checkpoint.

## Static image inspection / evidence limits

Directly opened `floating-timer-dark.png`, `floating-timer-expanded-dark.png`, and `focus-panel-notes-expanded-dark.png` from the actual candidate's 417-entry Windows visual archive. Compact timer task/timer/subtask summary, expanded visible actions/subtask rows, and Focus Panel expanded notes/editor show up as intended in snapshot. Compared conceptually to retained canonical `reference/original-blitzit-screenshots/current-v2.6.69-floating-timer-collapsed.png` and `...-floating-timer-expanded-subtasks.png`. Original expanded v2.6.69 still lacks the prominently visible title/timer row that Narro includes. Narro's explicit validated UI contract currently retains heading in expanded mode (`scripts/test-ui-floating-expanded.mjs`), and the two screenshots differ in dataset/crop/source vintage. Record exact current-original pixel parity as INCONCLUSIVE / visible presentation difference, not a proven bug or a rationale to destabilize current native candidate without evidence. Static snapshot is NOT native motion continuity proof.

## Boundaries and next action

Old PR389 candidate (`77a6b139...`) physical native 8-case replay: **4 PASS / 4 FAIL** at both motion variants, failed shrinking paths. Corrected **new `ffaa512ef629b15739fa47664537b338bb981eec` candidate: 0/8 physically executed, so native acceptance PENDING**. PR389 stays OPEN/NOT MERGED. **Next action:** Codex actual Windows candidate physical re-run 8/8 normal/reduced with reliable video/frame logs and profile backup/restoration, based on exact released binary hashes above. If new failure, ChatGPT fixes same PR389; if 8/8 genuinely PASS, guard merge exact PR head then verify resulting-main CI and original artifacts. User has explicitly UNPAUSED PA-01–09; actual cases individually OPEN. Mandatory milestones 4/10, M10 entry hard blocked, optional M11/M12 dormant, protected Spectrum Core picker/upload/218 offline icons unchanged.
