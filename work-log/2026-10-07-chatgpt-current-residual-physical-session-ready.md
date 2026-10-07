# Current residual Windows physical session — consolidation and artifact verification

Date: 2026-10-07

Status: **READY_FOR_PHYSICAL_OBSERVATION / USER_ACTION_REQUIRED**

Progress remains `3/10M || 0/3 | 17/18`.

## Why this session exists

Current open M1/M5/M6/M7/M8/M9 physical/manual obligations that are valid on one unchanged production runtime have been consolidated into:

`docs/CURRENT_WINDOWS_RESIDUAL_PHYSICAL_SESSION.md`

This prevents repeated setup and duplicate Windows builds.

The consolidated session includes:
- M5 narrow-title + P3-M5-01/02/03 board acceptance;
- M5 P3-M5-04 retained destructive menu;
- M6 P3-M6-01/04/05/06 residual bundle;
- M7 C4 continuous Focus transitions;
- Finding28 native packaged-WebView post-drag keyboard rail discrepancy;
- Findings29/30 packaged Reports/Add Session;
- Finding33 native large Notes Escape;
- Findings35/36 packaged Focus behavior;
- M9 Overview PDF;
- conditional Finding27 real DPI recovery;
- conditional Finding07 blocked-SQLite responsiveness;
- conditional actual Windows notification delivery.

Historical accepted CI942/944/948/953/C5 evidence is explicitly excluded from repetition unless invalidated.

## Exact reusable artifact

Windows CI1025/run `37630032472`  
Exact head `8f921d7063f78a51ea4e42b0e102c96cfe8ef8e3`  
Artifact id `11486928221`  
Artifact `narro-m7-physical-windows-x64`

Downloaded verification:
- ZIP SHA-256: `ac88a2b01d18597cf5de813f1af1b00cf16a6832d13234613e8b95faf7f91599`
- `narro.exe`: `a7881c6c3984314f6c089865e87cd22c97c292606fe13997b170b3973ac4bfd1`
- NSIS: `b057f098f2bce8da0df327e451f1a7f4bc2ebc799fc69b56615b805aaf6f71e4`
- MSI: `ba5764423bf67a1fef83c11ae363b690a172d5a4f22da276657c1efb0656114f`

All hashes exactly match the repository's pinned identity.

PR245/Finding28 is test-only relative to this production runtime. Later main changes are documentation/process/evidence only. No new runtime build is justified solely for this physical session.

## Boundary

No physical gate is promoted by preparation or artifact verification.

The next dependency is actual Windows observation using the exact artifact and the bounded checklist. Conditional checks remain OPEN when their environmental prerequisites are unavailable; they are not automatic failures.

After user-provided observation:
- record only exercised gates;
- failures reopen only their owning authority;
- advance milestone counters only when the repository's complete closure rules are satisfied.
