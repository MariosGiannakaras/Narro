# 2026-11-11 — Exact-source A389/B419 CI and archive validation closure

## Work continuation / ownership
Resumed the precise pending action from [Nov11 private evidence / startup-panic diagnosis](2026-11-11-chatgpt-17-session-evidence-panic-compatibility.md). ChatGPT owned source and GitHub CI validation only; **no physical Windows launch, recording, installer or AppData modifications**. Latest user physical STOP at 2026-11-11T12:13:04Z remains binding. All new actual source revisions were already committed to their own held DRAFT branches:
- PR389 `fix/m7-pixel-preserving-composition` HEAD `ae02c7327b58653e9d6a4715d38cbb0c09735d29`;
- PR419 `feature/m7-motion-v4-ab-candidate` HEAD `9c5fbc3aa2278d23b17e772b7090488b76df3e36`.
A/B startup panic root: older strict preference schemas could not decode newer stored `remember_timer_position_on_restart`. Narrow passthrough bool preserves true/false across unrelated mutations; old JSON defaults false; unknown fields remain rejected. Compositor source unchanged. No new PA8/8 granted.

## Exact-source independent CI
[GitHub Actions run43036145389](https://github.com/MariosGiannakaras/Narro/actions/runs/43036145389), triggered by temporary unmerged PR502 at wrapper head `5e3d6bea398aeabf69cbc6d3a693d1e52234262c`, **COMPLETED SUCCESS** at 2026-11-11T14:37:54Z. Jobs:
- validation gate `130575408902`: PASS;
- A389 fast `130575467123`: PASS; A389 Windows candidate `130576051808`: PASS;
- B419 fast `130575467143`: PASS; B419 Windows candidate `130576052836`: PASS.
The temporary matrix explicitly checked out **each candidate's exact recorded source HEAD** and reused that source-era CI workflow, with standard Rustfmt, frontend preflight/build, Rust compiler/Clippy/tests, physical observability lifecycle, fixture and native build/package validation. It does not prove main conflict resolution or source PR mergeability. Initial attempts:
- older `df7d8075...` and `3b60e6a1...` fast Rustfmt FAIL, repaired by separate source commits;
- temp run43035327232 fast PASS but Windows FAIL due wrapper erroneously using modern main `prepare-windows-bundle-tools.py` on historical source branches. Replaced by exact source-era CI without removing any old required steps; only run43036145389 is the successful final proof.

## Independent original candidate bytes
Downloaded actual GitHub Actions ZIPs into the analysis runtime and verified provider ZIP SHA256, ZIP CRC, unique members, provenance `schema/kind/sourceSha/githubRunId=43036145389/githubRunAttempt=1`, exact file-set equality, **every manifest file byte length and SHA256**, observation feature gate, and native MZ EXE presence.

| Candidate | Artifact ZIP id | ZIP SHA256 | Manifest members | Physical / diagnostic EXE SHA256 |
| --- | --- | --- | --- | --- |
| A389 physical | `13865006667` | `d483bd1dc63e40076add580b1e4927964219501477afe1bede99a867a7d86950` | 4/4 PASS | `e47879642a2d35d774a967c0ba1e389e2cadfec596b68e525c9e3c9918092749` |
| B419 physical | `13863713327` | `3ccab72f398be9fedaa48f0ded9e7b8129c3ad7859bc56bb31d1834072f71c44` | 4/4 PASS | `85b82b911e3ebbb56cae60f29e648ab3d72b0d6aea9a3fcb3db362e81ffbe02e` |
| A389 quiet diagnostic | `13864787114` | `ba7415c6ac340c4160655f09d213a5a11270e7fff5f9f7224c1b649ec196d054` | 7/7 PASS | `034f0f71914cd878b6a187ffc19b6a96dfa19e7e85c877082bc0933cb5335f8f` |
| B419 quiet diagnostic | `13864223502` | `5f3fd97c005a9a467c163b85977de7e1b0f87a4685c01d5b41e0108e45c5a83e` | 7/7 PASS | `cc1104fe5a1d57dd34f5001f6c4f5ff5a17ac18f06c4ff0a6241e67630fd3ada` |

Total **22/22 manifest members independently verified** across four actual ZIP archives, source-/run-bound with CRC. The physical packages have `physical-observability`, quiet packages have no observer feature. These are archive-level proofs, not host PID/HWND, motion/scanout, CPU/RAM or actual native acceptance. Prior A/B original source packages remain historical, not valid substitutes for updated binaries.

## PR/integration state and next route
- [DRAFT PR389](https://github.com/MariosGiannakaras/Narro/pull/389), [DRAFT PR419](https://github.com/MariosGiannakaras/Narro/pull/419) descriptions updated with **new heads**, exact successful CI and separately verified physical/quiet executable identities. Still OPEN/UNMERGED, independent strict **8/8 real Windows compositor** physical-before-merge holds OPEN. Original PR conflicts with newer main remain unresolved and are not silently bypassed. Don't merge.
- [Temporary PR502](https://github.com/MariosGiannakaras/Narro/pull/502) safely **CLOSED/UNMERGED** after the complete private transfer, exact-source CI, and original ZIP authentication. Two temporary workflows `.github/workflows/private-evidence-relay-20261111.yml` and `.github/workflows/held-candidate-ci-20261111.yml` were **removed from its unmerged branch**, cleanup commits `e440bc2a2c2c4a7c6c481c12852cd5ce74565db7` and `8d0ae3e61a67823bf77657f5484c3466d5721e45`. Their short-lived encrypted Actions artifacts expire after 1 day; raw source recordings remain private and protected.
- PR499 remains DRAFT/UNMERGED at `7f6d3258ecc227211021abb8a2989b191f1f1e16`, exact prior CI42839644180 3/3 PASS; PR437 held. The 17/17 recovered session ZIPs + one delivery audit verified 625/625 member hashes in the previous immutable report; all 17 session indexes have INCOMPLETE coverage and the 24 recorded compositor events have no strict accepted visual grade.
- **All 59 M5–M9 acceptance rows OPEN (6/13/18/11/11)**; A389 and B419 strict 8/8 each remain NOT RUN for **the revised source binaries**. M10 not approved, M11/M12 not activated. No fake PASS.

**Next permissible action:** source-only follow-up may assess remaining already captured targeted evidence (without resurrecting superseded Narro media) or a new user-authorized engineering task. For strict physical acceptance, wait for explicit user reactivation of Windows recording and then admit **the exact current source/EXE identities above** and execute the required on-host gates. Do not start a new physical session under the explicit STOP.
