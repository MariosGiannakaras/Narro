# 2026-11-10 — Private draft release: additional verification bundles and replaced index

## Verified repository/release state

Read-only GitHub connector assessment by ChatGPT during continuation of the PR499 physical evidence dependency. Repository main before this receipt: `2b73ba34850e323b29ebf3763b47aa6b142d1a85`. PR500 is MERGED and technical resulting-main CI is 3/3 PASS, as already closed in [PR500 final integration receipt](2026-11-10-chatgpt-pr500-resulting-main-3gate-artifact-closure.md). Held [PR499](https://github.com/MariosGiannakaras/Narro/pull/499) is still **DRAFT/OPEN/UNMERGED** with unchanged candidate source `ae0447c4bebd49215f0c49eb8cd9acf0db8fc80c`, exact-head CI42632330444 3/3 PASS. That proves only source/build readiness, not physical PA.

Private draft GitHub release **ID439408831** (tag `physical-evidence-20261109`) now exposes **12 uploaded assets**: the same **nine** prior session/campaign ZIPs totaling **684,870,152 bytes**, **two additional verification-named ZIPs**, and **one replacement EVIDENCE_UPLOAD_INDEX.json**. The original nine ZIP GitHub asset IDs, lengths and provider digests match those recorded in [the previous inventory receipt](2026-11-09-chatgpt-new-physical-release-metadata-access-check.md). New/replaced assets, as individually returned by the authenticated GitHub release metadata endpoint:

| GitHub asset ID | Asset name | Bytes | Provider SHA256 | Created UTC |
| ---: | --- | ---: | --- | --- |
| 728482363 | `private-verification-20261109-b5586691d6dcdaaa.zip` | 7,874 | `b5586691d6dcdaaaf73b00f71079ed57ce992a44431fef16505673faa58f7aa5` | 2026-11-09 18:17:11 |
| 728485364 | `private-verification-20261109-ba707f509b7ef672.zip` | 8,643 | `ba707f509b7ef672ea3a8d541359c9ea0a80d24f0587dd55768dc22b905c774a` | 2026-11-09 18:18:27 |
| 728485482 | `EVIDENCE_UPLOAD_INDEX.json` | 3,272 | `1bbb97cc8ad1504769ca1e46adbdb4ae1f34c37d4c306f41d3956991deaa6573` | 2026-11-09 18:18:29 |

The older index asset ID `728297537`, length 2,854 and SHA `2c7f...`, is no longer in the release's asset collection. This confirms a **replacement index version**, not additional physical capture. All twelve current asset records report state `uploaded`; hashes above are **GitHub-reported asset digests**, not an independent authenticated download/re-hash of their private contents.

## Evidence and action boundary

The connected GitHub `fetch` action can read draft release metadata but explicitly does **not support binary downloads**. The relevant authorized release-asset retrieval endpoint returns metadata rather than ZIP bytes, while draft release browser links cannot be fetched as generic public URLs. The current conversation and Library file search did not reveal mounted copies of the new verification ZIPs or index. This reviewer **has not opened the new ZIPs or replacement JSON**, and cannot establish their case counts, source SHA, hardware, exact command execution, video PTS, screenshot content, log completeness or actual acceptance result. Filename `private-verification` alone does not certify native source testing or production behavior. No new PR499 physical admission, per-case PASS or Blitzit parity is implied.

**Next action belongs to the authorized Windows physical/evidence operator:** securely provide the bytes of the existing private draft index and relevant immutable ZIPs to the reviewing environment, checking their exact remote SHA-256 before use; inspect candidate manifest/admission and original video PTS with correlated native logs and any verification reports. The application candidate to admit is specifically PR499 artifact `13683936109`, **not** the newer PR500 resulting-main physical artifact; user-approved ordinary Windows acceptance remains a distinct execution workflow. Do not release private desktop video publicly, do not run Codex-initiated USER-PAUSED PA, do not merge held PR499/PR437/A389/B419 without their actual physical gates.

**Effect on trackers:** nine prior physical session/campaign ZIPs unchanged; two verification-named additions and replaced index identified; M5–M9's **59 documentary acceptance rows remain OPEN** (6/13/18/11/11). This operation modified only documentary tracking, not source, CI, artifacts, retention or physical host state.
