# PR248 merge validation and physical-candidate repin

Date: 2026-10-08
Agent: ChatGPT
Scope: bounded post-correction programming review of PR236–247-era corrections and directly related M6/M7/M9 deltas.

## Final source result

PR248 — `Harden recent corrective slices against stale-state races`

- exact validated PR head: `515b0f9a9df5cdf1a67e2b879047ee6551ae6dec`
- authoritative Windows CI: CI1046 / run `37677630228`
- fast gate: PASS
- Windows `cargo check`: PASS
- Clippy: PASS
- Rust tests: PASS on the successful windows-candidate attempt
- performance harness: PASS
- visual regression capture: PASS
- Tauri release: PASS
- packaged Focus runtime capture: PASS
- physical-validation build: PASS
- M7 automatic-validation executable/logging: PASS
- M1 diagnostic-validation build/storage isolation: PASS

The first CI1046 windows-candidate attempt had one unrelated timeout in
`persistence::task_writer_contention::task_mutations_wait_for_competing_writer_and_preserve_latest_state_and_identity`
after release of the competing writer. That test file was byte-identical to current `main`
(`a742148539d79843d074a2725e456599fd355264`) and PR248 changed no persistence/task writer path.
The failed assertion was only the harness's 2 s post-release receiver timeout. A rerun of the same
windows-candidate job on the exact same source SHA passed all Rust tests and the rest of the Windows
candidate pipeline. This is therefore recorded as transient harness timing under NER-004, not a
product regression and not a reason to modify unrelated persistence source.

## Integrated hardening families

PR248 integrates six evidence-backed hardening families:

1. renderer/native monitor-key compatibility validation parity, including native max key length and numeric i32/u32 bounds;
2. Add Session pending -> interactive focus-trap ownership;
3. Reports Overview PDF stale-request/export transaction locking and whole-Main interaction freeze during WebView2 capture;
4. generation-bound and serialized Focus Home pause/reveal provenance;
5. cleanup of late WebView2 PDF temp output and partial final report export files;
6. rollback of partial Board -> Focus native reveal failures.

Validation-only brittle source-string contracts were narrowed/updated only where required by these changes.

## Merge proof

- expected-head-guarded squash merge: `c389148b9edc56dd616e6c95a32b31d52cf79639`
- PR head at merge: `515b0f9a9df5cdf1a67e2b879047ee6551ae6dec`
- PR248 changed 18 source/test files and no protected current-truth Markdown.
- Newer `main` commits between the PR base and merge were documentation/tracking/work-log only and were preserved.
- No resulting-main push CI was emitted.
- All 18 changed source/test blobs on resulting `main` were verified byte-identical to the exact green PR head.
- Resulting-main validation is therefore satisfied by exact-head CI1046 plus 18/18 blob identity under `docs/CI_VALIDATION_STRATEGY.md`.

## Repinned physical candidate

Use CI1046's exact physical artifact for PR248-affected and compatible remaining Windows observations:

- workflow: CI1046 / run `37677630228`
- exact workflow head: `515b0f9a9df5cdf1a67e2b879047ee6551ae6dec`
- merged runtime/test source: `c389148b9edc56dd616e6c95a32b31d52cf79639`
- artifact: `narro-m7-physical-windows-x64`
- artifact id: `11508639865`
- ZIP SHA-256: `57f19035ee842e3479bde946a4a82348b1dfc9ea3045d600f18707c4d38b0411`
- `narro.exe` SHA-256: `59beeb8271d08fd60adab4d41840bb65ed956d753410d8f2985daf4efe6a9275`
- NSIS SHA-256: `714c3c3d99ea9d820a572c64f3df05d108854d31043801111848c1918b997a56`
- MSI SHA-256: `851f57b27dffb9aa194fc9176696f4a93d35be0ee2b3871e0f85313321886af1`
- GitHub artifact digest: `sha256:57f19035ee842e3479bde946a4a82348b1dfc9ea3045d600f18707c4d38b0411`

The ZIP was downloaded from the exact CI1046 artifact and the ZIP plus all three binaries were independently SHA-256 hashed before repinning.

## Acceptance impact

No roadmap or physical-acceptance counter advances from CI/merge alone.

Current compact progress remains:

`3/10M || 0/3 | 17/18`

Historical unaffected physical/source evidence remains valid. PR248 invalidates only claims that depend on its changed surfaces/candidate identity. The consolidated physical checklist already includes the affected monitor/DPI, Focus Home, Board->Focus, Reports Add Session and Overview PDF observations and should now run against the repinned CI1046 artifact.

## Exact next action

Run the bounded current Windows residual physical session against the CI1046 candidate in
`docs/CURRENT_WINDOWS_RESIDUAL_PHYSICAL_SESSION.md`, using
`docs/M6_CURRENT_RESIDUAL_PHYSICAL_CHECKLIST.md` for its M6/M1 subset.

Do not rerun historical accepted gates without new invalidating evidence. Update only gates actually observed.
