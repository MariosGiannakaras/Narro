# PR431 Preferences freshness ordering — exact Windows green artifact (2026-10-27)

**Implementation owner:** ChatGPT. **Source PR:** [#431](https://github.com/MariosGiannakaras/Narro/pull/431), branch `fix/user-reported-visual-topology-20261026`, **exact tested head `3e45b9986e4f6afed5ff07f33b922f71eea878f3`**. Previous PR431 head `ead9a0c1` remains historically 3/3 green, but its EXE is superseded for new-source C1 native evidence.

## Scoped change and invariant

- `src/PreferenceSettingsRuntime.tsx`: added monotonic `snapshotRevisionRef` updated on `PREFERENCES_CHANGED_EVENT`. Initial asynchronous `Promise.all(getPreferenceSettings(), listPreferenceMonitors())` may only publish its settings snapshot when no newer event arrived since it began; monitor data, error lifecycle, retry admission and loading completion still proceed. This prevents a late initial Preferences fetch from overwriting a later committed cross-window preference snapshot (e.g. live Panel side/monitor updates). No product behavior/appearance/SQLite schema/Window-host change intended.
- `scripts/test-settings-initial-read-retry.mjs`: extracts and executes the real React provider load-effect callback in a test VM and resolves initial read/event in **both orders**, verifying newer committed side wins and monitor enumeration/loading/retry release remain intact; existing retry tests preserved.
- Source commits `bc31c60232b66d6bb2f410a8f7a1114ce696b30c` and `3e45b9986e4f6afed5ff07f33b922f71eea878f3`. GitHub compare `ead9a0c1...3e45b998` changed **only two files**. Local full preflight/build **NOT RUN**; corresponding exact PR CI is the validation evidence.

## Validated CI and binary provenance

- [Windows CI run40470719965](https://github.com/MariosGiannakaras/Narro/actions/runs/40470719965), exact head `3e45b9986e4f6afed5ff07f33b922f71eea878f3`: **validation-gate PASS, fast-gate PASS, windows-candidate PASS = 3/3 COMPLETED SUCCESS**. This includes Windows Rust/Clippy/tests, visual fixtures and candidate packaging as recorded by the run.
- GitHub Actions artifact `12719686973`, `narro-m7-physical-windows-x64`: downloaded exact ZIP **15,794,197 bytes**, archive SHA256 `be798d3cd502d89175fd4c9742ef2a6b4fb2cf3cd6ea1587dc4b9e5f001ea2f7`, matching GitHub artifact reported digest.
- Independently opened `artifacts/ci-provenance/physical.json`: `sourceSha=3e45b9986e4f6afed5ff07f33b922f71eea878f3`, `githubRunId=40470719965`, `githubRunAttempt=1`. Each ZIP member matches manifest by size and sha256: `narro.exe` **16,346,112 bytes**, `261bfe17324718510e1debf711110645eb514fee87b94315328a7344827f3362`; NSIS **4,232,246 bytes**, `f5bd4dcfe5be31312b2eef3534f2c1942daf85ba0ac6187e3ad06e54db1f6858`; MSI **5,959,680 bytes**, `1124c55c977665831b8110a368de7f21c9282215d8ecdf2bbff6ce994200c01a`.
- Extracted, independently hashed `/mnt/data/Narro-PR431-3e45b998-Windows-x64.exe` in this coding environment. This is a verified release *file*, **not** proof the user/Codex is executing this PID/exact image.

## Strict limitations, dependencies, next owner action

- **PR431 OPEN/UNMERGED**. Scoped C1-01–10 real Windows/interaction checks on this exact EXE **NOT RUN**. Historical older-source HDMI/drag Escape evidence remains accepted only in its previously supported scope.
- **PR389 A** head `ec9227a2` and **PR419 B** head `43adb6a9` are separately 3/3 source green with A8/8+B8/8 native route acquisitions/reviews, but **neither strict eight-route compositor gate is certified PASS**; both remain draft/unmerged. No validated combined PR431+A+B binary and no justification to merge compositor untested.
- The physical PA-01–09 suite remains **USER-PAUSED** per governing project instruction until explicit reactivation; physical Codex operator has not been invoked in this chat. Protect user profiles, AppData, native window state, original recordings and Spectrum Core Create/Edit List picker/image/218 icons. Do not activate M10/M11/M12.
- Formal mandatory milestone status remains M1–M4 **4/10** accepted, M5–M9 OPEN. User-requested readiness tracker: **3/5 packages**, **8/13 bounded subtasks**: code2/2, prephysical prep3/3, CI3/3, strict native0/3, integrated candidate0/2. These are not milestone counters.

**Next dependency:** Codex physical owner, when suite is explicitly reauthorized and an isolated interactive Windows operator is available, reads updated [C1/A/B recording packet](../docs/CODEX_M5_M9_RECORDING_PACKET_2026-10-27.md), verifies actual running PID/path/PE SHA, reuses frozen native A/B originals, adjudicates remaining strict motion gaps and captures only PR431 source-invalidated native C1 cases. A confirmed defect returns to ChatGPT for exact owner-branch fix/new CI. Physical acceptance precedes PR389/419 compositor integration/guarded merges. There is no source-only evidence justifying a speculative compositor patch.
