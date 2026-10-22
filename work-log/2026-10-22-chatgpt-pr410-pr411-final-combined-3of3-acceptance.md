# ChatGPT PR410+PR411 final combined resulting-main acceptance — 2026-10-22

## Immutable source and PR evidence
- PR410 final source head `6fd8748721932bec9171eb4251222f95afe3f708` exact head CI `39768224869`: **validation / fast / Windows candidate 3/3 SUCCESS**; expected-head guarded merge `b9526a246ef48e5597545b1f72d5a6cff24caec7`; **8/8** production/test blob SHA equal to final combined source main.
- PR411 final head `47b9f3e62629d102585451f6d4b58d908d8ce72e`, CI `39769632922` 3/3 SUCCESS; expected-head guarded merge `17d6aab8998b0c3108f70d6c5ce636df49f817c3`; **5/5** production/test blob SHA equal final main.
- Combined final executable source SHA `17d6aab8998b0c3108f70d6c5ce636df49f817c3`, [Windows CI 39783598136](https://github.com/MariosGiannakaras/Narro/actions/runs/39783598136) **validation SUCCESS, fast SUCCESS, Windows candidate SUCCESS (3/3)**, independently verified by actual workflow jobs after run completion. Older intermediate `b9526a2` main run `39783544905` correctly CANCELLED after PR411 push; not PASS.
- **Six actual original GitHub Actions artifacts**, all `workflow_run.head_sha=17d6aab8998b0c3108f70d6c5ce636df49f817c3`, not a docs-advanced SHA:
  - `narro-m1-diagnostic-windows-x64` id12430140357 digest `sha256:0aa193a2705c37fbb31ff46f53cd0fc62d1999e132cb52332c8d8ab9dfa5cdcb`;
  - `narro-m5-visual-regression` id12429461538 digest `sha256:92aa8c931ea6ede0a1a55d7c98b0599665b1cab08b1aef1e9270fb22e12bbd33`;
  - `narro-m7-validation-windows-x64` id12428694189 digest `sha256:8ac82c64afc9f4235237279c47588c5955634b454ca3a48826797c077407214e`;
  - `narro-m7-focus-runtime-visual` id12428617441 digest `sha256:1ad82b731afc735c3d3eac516ecd09662d0c996007ad6e1a4b085f3c27f14f3e`;
  - `narro-m7-physical-windows-x64` id12428374894 digest `sha256:e424a6cd3ab72300c161c112f2108535851a641294a03efc69113652f0cdcaa6`;
  - `narro-fast-frontend-dist` id12427901415 digest `sha256:acbdfd75e48279192e49fbc85d115f43c80e1b151805da7ff011973475cddc18`.
- Artifact digests are GitHub-reported for ZIP archives, **not independent downloaded CRC / unpacked EXE/MSI/NSIS identity validation**. That is NOT RUN; physical Windows acceptance NOT RUN. Full local npm preflight NOT RUN; exact PR CI + resulting-main CI PASS are separately validated.

## Verified remaining-source boundary
- Five code groups **5/5 technical acceptance** for this bounded campaign; none remain open in PR410/PR411.
- Formal mandatory milestone acceptance **4/10**, 6 pending; Narro-local U ledger **41/41**, original classified gaps **9/9**. Latest TODO count for checkboxes M1=1 optional deferred, M5=6, M6=13, M7=18, M8=9, M9=11, M10=16 = **74 unchecked across M1–M10**. **57 M5–M9 items are not necessarily missing code**; source-current/pixel/physical comparability often OPEN after accepted implementation.
- Native [PR389](https://github.com/MariosGiannakaras/Narro/pull/389) **4/8 physical transitions FAIL** and other-owned, unmerged. PR344 checklist is other-owned. PA-01–09 USER-PAUSED. M10 HARD ENTRY GATE closed to autonomous start. M11/M12 opt-in dormant. Approved Spectrum Core picker/image upload/offline 218 icons unchanged.
- **Next safe action:** first independently confirmed and unowned nonphysical M5–M9 defect or evidence-only validation; no speculative source parity edits, no additional CI solely to fill time.
