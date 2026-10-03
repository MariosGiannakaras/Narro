# M7 PR #219 merged; resulting-main CI #873 active

Date: 2026-10-03

## Exact-head validation

PR #219 final exact head:
`b62375ec0a1a9d68edec4c872dd56a3e864aa5b1`

Windows CI #872 / run `37101133903`: **PASS**

The dedicated validation artifact was verified after download:
- name: `narro-m7-validation-windows-x64`
- artifact id: `11266587277`
- artifact ZIP SHA-256:
  `925995634e4862e17da604f3f40566e0488738fb0caa9fed4c8f364b9cc99e28`
- contained `narro-m7-validation.exe` SHA-256:
  `a016ceeb570a8c0f32042d71a4fa9658d4f146117b9ab05f130dc9ef897a9548`
- executable size: `14874624` bytes
- executable fingerprint:
  `fnv1a64:b8709c61031dee55:bytes:14874624`

The CI runtime smoke reported:
`M7 automatic validation logging smoke: PASS`
with initial evaluator state `PENDING`.

## Merge

PR #219 was expected-head guarded squash-merged as:
`1423bb8a71deedac2fa17edf6c2fae1f98e2cbb0`

Current main is that exact merge commit.

## Resulting-main validation

Windows CI #873 / run `37105088285` started automatically on the resulting main commit.

At checkpoint:
- validation-gate: PASS
- fast-gate: in progress

## Next action

Check CI #873 first.
- On PASS: verify resulting-main validation artifact identity, reconcile tracking, then hand the user the compact Codex prompt for the final physical M7 C5 test.
- On FAIL: inspect only the exact failing evidence.

The final physical test still requires the real Windows restart flow and upload of the entire `Narro-M7-Logs` folder plus visual observations.

Progress remains:
`4/10M || 4/5 | 14/19`.
