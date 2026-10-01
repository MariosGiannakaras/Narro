# M7 C3 main integration closure — CI #806 process gate

Date: 2026-10-01

## Integrated source/process state

M7 implementation PR #192:
- exact automated-green head: `440b172565d94fadb3e814559bec5f3b47e48012`
- merged main source: `1b68a602d8799ea7e19107ecc60dfd5855d38b4e`

Process-hardening PR #207:
- exact head: `df6e548a059551178972b16b7d9c6e8e0dfb91b2`
- Windows CI #806 / run `36854279514`: **PASS**
- jobs: validation-gate PASS, fast-gate PASS, windows-candidate PASS
- guarded squash merge: `aebc280da2ef7bcb5e4fd1d4d78fa529b63f49b7`

The GitHub integration did not emit a push-triggered Actions run for the merge. Repository CI policy explicitly allows evidence-based main validation in that case.

A blob-level comparison between exact-green PR #207 head and merged main proves **zero non-Markdown differences**. Therefore the merged executable/build/test/workflow tree is byte-identical to the tree validated by CI #806.

This closes M7 closure checkpoint C3 without a dummy source commit or redundant artificial PR.

## Final physical candidate

Use the CI #806 production-config artifact:
- artifact name: `narro-m7-physical-windows-x64`
- artifact id: `11159233418`
- artifact digest: `sha256:33a6dfe8ed418c1466b8a0adbc4005335f5255869af151a974dc2771ae160b91`

Standalone `narro.exe`:
- SHA-256: `a22bb0996f38720abacb6f78c79909bfd52fe295db6593937fa6e35dd2227af9`

The CI806 workflow contains the hardened fast/candidate split and the production physical build/runtimeVisual boundary smoke already validated in the candidate run.

## Remaining M7 closure

- C1 — replacement architecture/behavior automation: PASS
- C2 — artifact validity/automated visual-runtime evidence: PASS
- C3 — main integration: PASS
- C4 — physical Gate 7 continuity/session: OPEN
- C5 — physical Gate 12/platform + tracking closure: OPEN

Do not reopen general M7 implementation from this point. If the physical session fails, create one narrow corrective PR from current main for the evidenced gate only.
