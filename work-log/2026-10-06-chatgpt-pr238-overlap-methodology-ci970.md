# PR238 overlap classification + CI970 formatting correction — 2026-10-06

## Scope

Reconcile current repository truth after PR237 merged while the M9 Overview PDF line was being developed concurrently, correct the first exact-head CI failure for PR238, and harden the repository concurrency method so a planned branch reconciliation is not confused with an implementation failure.

## Exact state

- PR237 exact head `74658f9c47bf808f8bf23c1726125c8a8b5cbb8f` passed full Windows CI967/run `37434273074` and squash-merged as `535e0a8c7c92143dd6bd7feac2c680a85e672cff`.
- PR238 was reconciled onto that resulting `main`. PR237 and PR238 both modify `src-tauri/src/lib.rs`; the overlap is mechanical module/command registration rather than shared domain authority.
- PR238 initial reconciled head `1c3f342a21ff3e3752d439230a19d66a1eafa03a` ran Windows CI970/run `37438169965`.
- CI970: validation gate PASS; frontend/contracts fast step PASS; Rust formatting FAIL; Windows candidate skipped because the fast gate failed.
- The CI rustfmt diff affected only formatting in `src-tauri/src/report_commands.rs` and `src-tauri/src/report_pdf.rs`.
- Local Rust/rustfmt was unavailable in the chat execution environment, so local Rust formatting was **NOT RUN** before CI970; no local PASS is claimed.
- The exact CI-provided rustfmt delta was applied without logic changes in commit `e584b5d5d40623a9e14b7180ecb5b117ad73ae03`.
- Windows CI971/run `37439099811` is queued for that corrected exact head at the time of this record.

## Methodology decision

Parallel implementation remains desirable when dependency-safe. The previous wording was too coarse because it called the M7 and M9 lines independent even though they shared a source registration file.

Repository workflow now requires an overlap preflight:

- **none** — ordinary parallel implementation;
- **soft/mechanical overlap** — parallel work is allowed only with an explicit merge order and mandatory reconciliation of the later branch onto resulting `main` before exact-head validation/merge;
- **hard/semantic overlap** — keep sequential unless stronger evidence proves the interaction safe.

A planned reconcile/rebase caused by the earlier branch merging is a **coordination event**, not an implementation/product failure. Compile/test/CI/physical failures remain separate evidence categories.

This preserves useful parallelism without pretending overlapping branches are fully disjoint.

## Tracking reconciliation

Updated current truth in:

- `AGENT_WORKFLOW.md`
- `docs/DEEP_ANALYSIS_IMPLEMENTATION_WORKFLOW.md`
- `HANDOFF.md`
- `TODO.md`
- `STATUS.md`

No milestone/TODO checkbox or acceptance counter is advanced by this process correction or by the formatting-only commit.

## Exact continuation

1. Inspect CI971 on exact head `e584b5d5d40623a9e14b7180ecb5b117ad73ae03`.
2. Fix only evidence-backed failures.
3. If fully green, record exact-head evidence and integrate PR238 with an expected-head guard; verify resulting-main identity.
4. Keep physical Windows Overview PDF creation/rendering acceptance OPEN until actually observed.
5. Continue dependency-safe deep-analysis work in parallel under the revised overlap classification.
