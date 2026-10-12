# 2026-10-12 — U23 PR342 exact-head Windows release/visual original ZIPs independently downloaded and verified

**Immutable provenance:** [PR342](https://github.com/MariosGiannakaras/Narro/pull/342) head `2914317b40aa7efa6c1401dff73e0106378fb43f`, [run38272720744](https://github.com/MariosGiannakaras/Narro/actions/runs/38272720744) validation/fast/windows **3/3 PASS**. Guarded merged `4ce42cd9b41c4c445a1acbf0737c3a7b3063af7a` with 14/14 Git blobs identical; [source proof](2026-10-12-chatgpt-u23-pr342-exact-windows-threejob-guarded-merge-main-ci-pending.md). **This is PR HEAD artifact integrity only**, not yet the separate resulting-main package.

**PR head production original [artifact11758199105](https://github.com/MariosGiannakaras/Narro/actions/runs/38272720744/artifacts/11758199105)** downloaded from GitHub Actions via connector. Independently inspected exact local 15,335,181-byte ZIP: **CRC PASS** (`ZipFile.testzip() is None`), exactly **3** members, full ZIP SHA256 **`0036a752211dd7b245424c9946dcd0a46f346854fb2326c28ba545275d2de401`**, matching the original GitHub digest. Extracted and streamed file SHA256, headers and lengths:

| Member | Bytes | SHA256 | Magic |
| --- | ---: | --- | --- |
| `narro.exe` | 15,906,816 | `581904d16c87bbf38538090eeedb6aa248ebabfa398639b6d2a1f2c697f0ed0a` | MZ/PE |
| `bundle/nsis/Narro_0.1.0_x64-setup.exe` | 4,101,312 | `c33a19939c591eb26ac48146406cf8d5557e6ba8f062b1400ee820d5b204f436` | MZ/PE |
| `bundle/msi/Narro_0.1.0_x64_en-US.msi` | 5,799,936 | `baa617899dfb8950f7f2cb1b28e001cb4a004ecb7ed1b6d53a0bd81acc6d0fbf` | D0CF11E0/CFB |

**Real Windows visual original [artifact11758961707](https://github.com/MariosGiannakaras/Narro/actions/runs/38272720744/artifacts/11758961707)** downloaded. ZIP **5,187,616 bytes**, independent SHA256 **`51c4204371db7bff6bfe97f3b2faeee3ebefd047d5ad74b848f147124953f9b9`** matches GitHub digest; **333 ZIP entries, CRC PASS**. Inspected original Edge DOM files `focus-panel-break-light.html` and `focus-panel-break-dark.html` (both present) and ordinary `focus-panel-light.html`, `focus-panel-dark.html`. Both Break files contain `Est: 2hr 20min` (not `2hr 10min`), `data-focus-break-card="true"` and preserved `1/5 Done`. Both ordinary running files contain `Est: 2hr 10min`. This confirms the actual Windows fixture DOM contracts in both themes, not native user physical PA.

**Required next acceptance:** [merged-main run38277579376](https://github.com/MariosGiannakaras/Narro/actions/runs/38277579376) was **IN PROGRESS** at separate checkpoint on `4ce42cd9b41c4c445a1acbf0737c3a7b3063af7a`; the PR ZIP SHA here is **not** a substitute for that run's actual ZIP/EXE/NSIS/MSI hashes. On full merged-main Windows 3/3 SUCCESS, download original production artifact, CRC and independently hash fresh bytes, repin staging/risk checklists. Physical PA-01–09 USER-PAUSED/NOT RUN; no launch/install/AppData writes. Optional M11 dormant. Approved Spectrum Core UI unchanged.
