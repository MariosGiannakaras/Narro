# 2026-10-12 — U04 merged exact PR production Windows ZIP independently CRC+SHA256 verified; main candidate still running

**Bounded source provenance:** [PR343](https://github.com/MariosGiannakaras/Narro/pull/343) original green exact source head `7ee33aa873cc4025a996efb8f02ec32969842d15`, [CI38284568221](https://github.com/MariosGiannakaras/Narro/actions/runs/38284568221) **3/3 PASS** validation/fast/windows; guarded merge `ec7673c921e08c83de11c986bd25fbb3600475ce`, **13/13 source/test/fixture blob identities exact MATCH**, [corresponding immutable proof](2026-10-12-chatgpt-u04-pr343-guarded-merge-13blobs-visual-verified-main-ci-pending.md).

**Original PR Windows production binary:** downloaded the actual [artifact11763526476](https://github.com/MariosGiannakaras/Narro/actions/runs/38284568221/artifacts/11763526476) `narro-m7-physical-windows-x64`. Original ZIP size **15,334,324 bytes**, independently calculated full SHA256 **`4e80881223415728bbb66e79aa600fbd08b8a189d6bc3cd11711aa5815aa8c3b`** exactly matches provider artifact digest, **CRC PASS**, exactly 3 member binaries (ZIP `testzip() is None`). Extracted byte-for-byte original binaries with actual correct PE/CFB signatures:

| Real archive entry | Bytes | SHA256 |
| --- | ---: | --- |
| `narro.exe` | 15,919,104 | `d6e51d6b5a2b9b129d813586d8132c30825093265335e45d67b95d89d27ad854` |
| `bundle/msi/Narro_0.1.0_x64_en-US.msi` | 5,795,840 | `2b3a6864c7f2f6e5ff8d62179e957783dbd145b55f83c2af1faac98fe1f46fb5` |
| `bundle/nsis/Narro_0.1.0_x64-setup.exe` | 4,106,190 | `b43b59f18db4cacb258591663c711f2df73d40ab77de87b22b5cb7a666efa49d` |

[Original PR visual artifact11763915384](https://github.com/MariosGiannakaras/Narro/actions/runs/38284568221/artifacts/11763915384) previously downloaded: ZIP 5,283,045 bytes, SHA256 `ab8b2d7f9963ebadf75ff9577a3c8e5ae1d3dc604e955466838544f8abfd806b` (provider exact), **337 entries CRC PASS**. Actual light/dark `archive-done-delete-confirm` Edge PNG inspected: centered Narro-theme coherent modal with selected task name, red destructive warning, Cancel, Delete task permanently, accessible DOM semantics.

**Critical distinction:** PR Windows production artifact is a provenance-verified *PR candidate*, NOT the not-yet-validated merged-main candidate. [Resulting-main CI38287299890](https://github.com/MariosGiannakaras/Narro/actions/runs/38287299890) at exact `ec7673c921e08c83de11c986bd25fbb3600475ce` validation/fast PASS, Windows job114939592934 IN PROGRESS at last check. Never use PR SHA256 as merged-main binary identity. Wait for real main CI 3/3, download its separate production ZIP, CRC/hash its own three binary entries, repin docs physical session checklist and immutable final log.

**Counts still constrained:** U01–U41 Narro-local release **40/41** (U04 source merged, main production pending), specifically confirmed local code gaps **8/9**, native physical accepted milestones **3/10**, **7 remain**, native PA-01–09 USER-PAUSED/NOT RUN; optional M11 dormant. No personal Windows installer launch/data deletion performed. Spectrum Core picker/image/218 offline icons locked.
