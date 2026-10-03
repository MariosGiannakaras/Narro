# M7 resulting-main CI #873 validated; physical C5 artifact ready

Date: 2026-10-03

## Validated source baseline

Merged M7 source commit:
`1423bb8a71deedac2fa17edf6c2fae1f98e2cbb0`

PR #219 final exact head:
`b62375ec0a1a9d68edec4c872dd56a3e864aa5b1`

PR exact-head Windows CI #872 / run `37101133903`: **PASS**

Resulting-main Windows CI #873 / run `37105088285`: **PASS**

The later main HEAD may include markdown-only `[skip ci]` tracking commits. Those do not replace the validated source baseline above.

## Final M7 C5 validation artifact

Artifact:
- name: `narro-m7-validation-windows-x64`
- id: `11268220111`
- source run: resulting-main CI #873
- source SHA: `1423bb8a71deedac2fa17edf6c2fae1f98e2cbb0`
- ZIP SHA-256:
  `e17532df1f1eab86022d93616fb4d217ff09d6378ee94bf5af90522950286e44`
- contained `narro-m7-validation.exe` SHA-256:
  `4fde3778720505705ac9c7f9b05a30cb70c26b02c09c6dec442775bc5c66637c`
- EXE size:
  `14874624` bytes
- CI executable fingerprint:
  `fnv1a64:ccb7e96a5db9d324:bytes:14874624`

The downloaded artifact contained exactly:
- `narro-m7-validation.exe`
- `README-M7-VALIDATION.md`

The locally calculated artifact ZIP SHA-256 matched the GitHub artifact digest exactly.

## CI runtime evidence

Resulting-main #873 PASSed:
- fast frontend/contracts;
- Rust check;
- Clippy;
- Rust tests;
- performance harness;
- visual regression;
- release build;
- packaged Focus runtime capture;
- physical validation build/verification;
- M7 automatic validation executable preparation;
- M7 automatic validation logging smoke;
- artifact upload;
- M1 diagnostic build/storage isolation.

Exact smoke evidence:
`M7 automatic validation logging smoke: PASS`

Initial evaluator state:
`PENDING`

## Remaining physical M7 C5 action

Use the exact resulting-main validation artifact above on the real Windows machine:

1. sync local repository files from main;
2. download/extract artifact `11268220111`;
3. run `narro-m7-validation.exe`;
4. use a real active task and compact Timer;
5. drag Timer at least 64 physical px to an obvious safe non-default location;
6. tray Quit Narro;
7. relaunch the same validation EXE;
8. show/reopen Timer;
9. preserve/upload the **entire** `Narro-M7-Logs` folder;
10. return the visual/manual observation as well.

Only a real physical PASS can close M7 C5. No counter advances yet.

Progress remains:
`4/10M || 4/5 | 14/19`.
