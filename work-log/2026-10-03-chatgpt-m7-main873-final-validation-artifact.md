# M7 resulting-main CI #873 PASS and final validation artifact

Date: 2026-10-03

## Resulting-main source

Merged source commit:
`1423bb8a71deedac2fa17edf6c2fae1f98e2cbb0`

Windows CI #873 / run `37105088285`:
**PASS**

All required gates passed, including:
- fast frontend/contracts;
- Rust check/Clippy/tests;
- performance harness;
- visual regression;
- release build;
- packaged Focus runtime capture;
- physical validation build and verification;
- M7 automatic validation logging smoke;
- M1 diagnostic build and storage-isolation smoke;
- required artifact uploads.

## Final M7 physical-validation artifact

Artifact:
`narro-m7-validation-windows-x64`

Artifact id:
`11268220111`

ZIP SHA-256:
`e17532df1f1eab86022d93616fb4d217ff09d6378ee94bf5af90522950286e44`

Contained executable:
`narro-m7-validation.exe`

Executable SHA-256:
`4fde3778720505705ac9c7f9b05a30cb70c26b02c09c6dec442775bc5c66637c`

Executable size:
`14874624` bytes

Executable fingerprint:
`fnv1a64:ccb7e96a5db9d324:bytes:14874624`

The locally downloaded artifact matched the GitHub ZIP digest exactly and contained only:
- `narro-m7-validation.exe`
- `README-M7-VALIDATION.md`

CI runtime smoke reported:
`M7 automatic validation logging smoke: PASS`
and the same executable fingerprint, with initial evaluator state `PENDING`.

## Remaining physical action

Run this exact resulting-main validation executable on the real Windows machine:
1. normal launch;
2. active task + compact Timer;
3. drag Timer >=64 physical px to an obvious safe non-default location;
4. tray Quit Narro;
5. relaunch the same validation EXE;
6. show the Timer;
7. capture the visual result and preserve/upload the entire `Narro-M7-Logs` folder.

Do not use the older PR-head artifact for final closure.

M7 C5 remains open until this real physical evidence is reviewed and tracking is reconciled.

Progress remains:
`4/10M || 4/5 | 14/19`.
