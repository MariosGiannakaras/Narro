# PP44-F01 correction — exact-head Windows CI and artifact identity closure (2026-10-30)

Scope: resume existing [draft PR437](https://github.com/MariosGiannakaras/Narro/pull/437) at `integration/m7-v4-current-timer-20261027`. Audited failure [PP44-F01 reproduction](evidence/pr437-prephysical-audit-20261030/README.md) was the pre-existing M5/M9 signed manual Time Taken adjustment falling below zero after a valid historical closed-work edit/delete. No prior accepted unrelated milestone was invalidated by this scoped finding.

## Source and correction

- Initial replacement `0e8b960b9eb3a6f7fbefd9be85151985921573fe`: one source/test path `src-tauri/src/persistence/sessions.rs`. After successful closed-work edit/delete CAS but before the same SQLite transaction commits, recompute the effective aggregate. If it would be negative, update `manual_time_adjustment_seconds` to the negative of the remaining persisted work, saturating effective Time Taken to zero. Work session rows, raw timer, Break rows, IDs and CAS semantics remain unchanged; SQL/read errors roll back the transaction. This protects the reader and its Board and live metric consumers without a renderer-only clamp or a schema migration.
- Tests added in that file: (1) lowered90→5 then edit90→1/delete90 with zero-effective postcondition; (2) desired90/100 controls and stale expected-updatedAt CAS unchanged; (3) Break-history independence and newly checkpointed work accruing after saturation. These exercise actual migrated SQLite and Rust persistence functions, not a mocked SQL reproduction.
- First replacement run [41034895148](https://github.com/MariosGiannakaras/Narro/actions/runs/41034895148): validation **PASS**, fast **FAIL** at Rust formatting, Windows **SKIPPED**. Exact formatter diff was applied in commit `632345026d9c693613a3a0b3e9a8105740fcc6af` with no behavior or assertion change. Failed source is historically FAIL.
- Current exact [run 41035287020](https://github.com/MariosGiannakaras/Narro/actions/runs/41035287020) on **632345026d9c693613a3a0b3e9a8105740fcc6af**: **validation-gate SUCCESS**, **fast-gate SUCCESS**, **windows-candidate SUCCESS**. Windows Check Rust, Clippy, Rust Tests, performance harness, visual regression fixtures, Tauri release, physical build verification, M7 logging and M1 diagnostic isolation all concluded SUCCESS. Actual Rust library tests: **483 passed /0 failed**; three new PP44-F01 tests explicitly logged `ok`. Additional Rust integration test binaries also passed. This is source/automation validation, not a native user session or Blitzit source parity.

## Independent GitHub artifact byte verification

Artifacts from this exact run were downloaded and inspected as ZIPs. Local ZIP SHA256 matches the digest emitted by its GitHub upload step. Every ZIP passed CRC verification. Every declared manifest member was compared against its actual extracted bytes, size and SHA256. All three manifest `sourceSha`, `githubRunId`, `githubRunAttempt` verified as **632345026d9c693613a3a0b3e9a8105740fcc6af**, **41035287020**, **1**.

| Artifact | GitHub ID | ZIP bytes | ZIP SHA256 | Manifest members |
| --- | --- | ---: | --- | ---: |
| Physical Windows |12968772574|16070026|`36a6a1cd69e87cb64d824a32acb90399bf53ab035ddeddbec3706f056ce813c8`|3/3|
| M7 validation |12968099306|5936783|`1e6d2a6925e45e80043d9896139878427c47a45d94b2c2d79598895d5a5fec75`|2/2|
| M1 diagnostic |12969565831|5956327|`f634f61501bc6639a17cba48bdc3f5a95c501755fe20fe78f73034f2aba16842`|7/7|

- Physical ZIP contains4 files; M7 validation3 files; M1 diagnostic8 files; each ZIP has1 manifest not counted as its own manifest member.
- Physical EXE SHA256 = **`1f2d90241259dd0ae0216ab000455d8140b7e55406370f9d5948417f2096e878`** (16,592,384 bytes). M7 validation EXE has identical size and digest; this is independently verified byte identity.
- M1 diagnostic EXE digest **`bb7e315bbeab5b466b346b48e89d8412f60084ff1f43c73afb7f59cfe1e16210`** (16,592,384 bytes), expected to differ due to its diagnostic build flags.
- GitHub URLs: [physical](https://github.com/MariosGiannakaras/Narro/actions/runs/41035287020/artifacts/12968772574), [validation](https://github.com/MariosGiannakaras/Narro/actions/runs/41035287020/artifacts/12968099306), [diagnostic](https://github.com/MariosGiannakaras/Narro/actions/runs/41035287020/artifacts/12969565831).

## Acceptance boundaries and next action

- **PP44-F01 source/automated correction VERIFIED** for tested contracts. It must not be reported as physically verified, nor equated to all M5/M9 acceptance.
- No Windows desktop process, installer, interactive UI, profile, AppData, physical/diagnostic session or hardware action was launched by this chat. Physical PA-01–09 remain USER-PAUSED pending explicit reactivation. No code source merge or tag was performed.
- PR437 remains DRAFT/UNMERGED. Native actual Timer displacement/move tracing, different Panel/Timer placements, SNAP, HDMI/hardware and independent strict A/B PR389/PR419 gates remain OPEN; code-only CI cannot waive them. The prior bd86a7ad J05 4/4 physical result remains historical scoped evidence for its unaffected compositor path, not proof of new candidate complete acceptance.
- Mandatory M1–M4 accepted **4/10**, M5–M9 OPEN, M10 approval gate not entered, M11/M12 not activated. The next executable native step after authorized physical reactivation is source/executable-matched, protected, bounded movement trace and impacted Taken/Reports verification; capture only uncovered claims, respecting personal profile and OS restrictions. Independently authorized source work should follow the first evidence-backed TODO, not invent speculative movement repairs.
