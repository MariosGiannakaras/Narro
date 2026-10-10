# 2026-10-11 — PR324 physical Windows CI artifact actual ZIP/EXE/installer byte hashes (pre-final candidate only)

**Purpose:** verify that the GitHub connector can actually materialize/download Windows production candidate bytes and that hashes can be computed independently in the container, before Q12 needs a fully combined latest source candidate. **This is NOT Q12 completion, not native desktop/physical PASS**, and no new CI was started for this inspection.

- Accepted [PR #324](https://github.com/MariosGiannakaras/Narro/pull/324) exact head `1eab9361049e5cb15177a892385c0f1056756189`, run [38093211469](https://github.com/MariosGiannakaras/Narro/actions/runs/38093211469) all validation/fast/windows-candidate SUCCESS; actual guarded merge `7e6e8ecdd51a374a884e3d96c79ec41e761372a9`, three source/test Git blobs identical on head/merge/main.
- `narro-m7-physical-windows-x64` artifact ID **11685557049**, GitHub reported size 15,330,834 bytes. Downloaded ZIP from the real GitHub connector into the container; verified existence, size and SHA-256; used Python standard library zipfile streaming decompression and SHA-256 on *actual binary payload*, not logged metadata or an imagined URL.
- **ZIP** `narro-pr324-physical-windows-x64.zip`: **15,330,834 bytes**, SHA-256 **`b5f4d0a10b14c7b20b2a6c63632dbd3f8cf66c0b913f62ff3607af0d9820ca64`**.
- Unpacked `narro.exe`: **15,879,168 bytes**, SHA-256 **`9a8ef89d328d19533041f3936c9520f2fdeb2c31e7a76f4084b6c896927a238a`**.
- Unpacked `bundle/nsis/Narro_0.1.0_x64-setup.exe`: **4,104,352 bytes**, SHA-256 **`7a13d5228a3315e84c8188f3c446b32725d1536fe81b0db50381b56d0b649f43`**.
- Unpacked `bundle/msi/Narro_0.1.0_x64_en-US.msi`: **5,795,840 bytes**, SHA-256 **`afa85ecd7486b1afecf3588ff6d08f10df6bc1839a924da90964b43263f5d809`**.

**Crucial source-version limitation:** This Windows archive was compiled from the **PR324 head**, which lacks the still unmerged Q01 B49 #321 capture/test corrections and Q03 keyboard regression #326. The final combined source tree must include already merged #319/#320/#322/#323/#324 AND #321/#326 once accepted, plus no unvalidated newer source modifications. Therefore **Q12 current fully integrated Windows candidate still OPEN**, with new exact merged-main/head CI, ZIP/exe/installers hashes NOT RUN for the final union. Do not offer this PR324 binary as the latest authoritative user-test Narro.

**Next:** wait for exact #326 and #321 required three Windows gates, guarded merges/main hashes; then use the same reproducible real GitHub artifact download + streaming byte hash method for a package built with *all accepted final source*. Manual C4/M6/F35/F29/F27/M8 USER-PAUSED and original Blitzit source/visual parity remain separate.
