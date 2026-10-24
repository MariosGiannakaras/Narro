# Narro active-documentation hygiene, no source edits — 2026-10-23

## User request and scope
- User explicitly approved correcting redundant/stale repository information after a separate read-only audit.
- Documentation-only edits on authoritative `main`. **No changes to source, tests, scripts, workflow YAML, builds, CI, branch membership, PRs, immutable old logs, original evidence or user Windows/AppData.**
- Goal: one authoritative live action, correctly scoped progress, preserve all ten mandatory milestone checklists verbatim, and mark dated old PR/CI/PA claims historical rather than deleting evidence.

## Safety archives — verified exact original Git blobs before compaction
Original bytes copied to new immutable files and fetched again after creation. **All five archive blobs exactly match their original source Git blob SHA.** Historical archive links inside the verbatim copies are historical text, not an active instruction/navigation contract.

| Original file | Pre-cleanup Git blob SHA | Exact immutable snapshot |
|---|---|---|
| `HANDOFF.md` | `c6d0102d4bafff6d46eaf1316dad53af957a9831` | [HANDOFF snapshot](tracker-archives/2026-10-23-HANDOFF-before-active-documentation-cleanup.md) |
| `STATUS.md` | `97b18cdc92263242b1d01e98e8fb203dc6059cf7` | [STATUS snapshot](tracker-archives/2026-10-23-STATUS-before-active-documentation-cleanup.md) |
| `TODO.md` | `e8dbd069ab787cfd7656d98d020735977b858061` | [TODO snapshot](tracker-archives/2026-10-23-TODO-before-active-documentation-cleanup.md) |
| `docs/PROGRESS_REPORTING.md` | `c9cea8fe461501db0aa3d3364dc0db5d253ff3fe` | [Progress snapshot](tracker-archives/2026-10-23-docs-PROGRESS_REPORTING-before-active-documentation-cleanup.md) |
| `docs/CURRENT_WINDOWS_RESIDUAL_PHYSICAL_SESSION.md` | `d7e35687911b9f254ff73a14096d26125ec5c4bb` | [Physical-session snapshot](tracker-archives/2026-10-23-docs-CURRENT_WINDOWS_RESIDUAL_PHYSICAL_SESSION-before-active-documentation-cleanup.md) |

## Actual main documentation edits (each read after write, content equality PASS)
| Live path | Before → after characters | Main commit | Change |
|---|---:|---|---|
| `TODO.md` | 209815 → 195033 | `9c9a2a4f01fdd815d7304678b69d749a28994ae0` | Retired stale pre-milestone PR/CI/PA checkpoint stack; precise current gate. **Entire `## Milestone 1` through EOF content unchanged byte-for-byte**, **191962 characters**, including all M1–M10, optional M11/M12 and Final Review sections/checkboxes |
| `STATUS.md` | 39651 → 4818 | `fc6b963de70ec95623c8d93db352f92a5e909768` | Condensed verified project/source/CI, physical limits, ownership and protected product constraints, with archival links |
| `HANDOFF.md` | 12077 → 4850 | `3936a82e27ea1d49646463d695a7709a829c952b` | One unambiguous current PR389 head/run/artifact and Codex 8-case physical next action, archived outdated handoffs |
| `README.md` | 9670 → 9986 | `dd9a89e078bba4b566fba0011233a377bccc74dd` | Corrected historical PR343 “latest candidate,” 3/10 milestone, PA-paused claims |
| `AI_START_HERE.md` | 31977 → 28860 | `0dbc1f1e311749fae59353933a9faf89d8607270` | Reconciled competing current progress policies, preserved precisely scoped canonical 41/41, 9/9, 4/10 and no fabricated global code denominator |
| `docs/PROGRESS_REPORTING.md` | 1935 → 2182 | `e2078f806ee4955177ec83486b017e0d40d21516` | Removed outdated active PR357, one reporting source linking to bootstrap and handoff |
| `docs/TRACKER_STATUS_INDEX.md` | 30301 → 31810 | `b76b584ade5980b32539436f6613700223ab32e0` | Current-navigation banner plus reclassified 2026-10-19 “CURRENT” as HISTORICAL; retained dated provenance and branch/evidence inventory |
| `docs/CURRENT_WINDOWS_RESIDUAL_PHYSICAL_SESSION.md` | 1701 → 1553 | `e70ff44bc63b8fbb2e5f27be31fcaa154d6b7aa1` | Kept existing inbound path but made it a historical PA356 pointer to live candidate and exact preserved snapshot |
| `docs/NARRO_PARALLEL_NONPHYSICAL_PLAN_2026-10-22.md` | 10793 → 11402 | `b2e318368ef254c785aee9ff78b7423b51eab5f8` | Dated work-board prominently labeled historical; underlying rows preserved for evidence |

## Independent post-write validation
- All nine live changed files re-fetched from `main` and content matched exact intended edit: **9/9 PASS**.
- All five pre-cleanup snapshots re-fetched, original Git blob identities and text matched: **5/5 PASS**.
- `TODO.md` text from `## Milestone 1` through EOF matched pre-cleanup snapshot **exactly** (191962 characters); all M1–M12 and Final Review headings present. **No acceptance checkbox was modified**.
- Checked 19 unique relevant relative Markdown paths in new/current headings or summaries across changed entry docs; **19/19 resolved by GitHub contents API**. This is a targeted live-entry link check, not a full-repository historical link audit.
- Re-fetched live [PR389](https://github.com/MariosGiannakaras/Narro/pull/389) after edits: still **OPEN/DRAFT/UNMERGED**, unchanged head `15c0649f9c4b9865bec7f74c82cc8cd7373decaa`. Exact-source automated run [39848609179](https://github.com/MariosGiannakaras/Narro/actions/runs/39848609179) **3/3 SUCCESS**, its separately verified package provenance retained. No new application/CI tests run: **NOT RUN (documentation-only)**.

## Exact next action and restrictions
- [HANDOFF](../HANDOFF.md): designated Codex native Windows agent physically test **8/8** normal/reduced Panel/Timer transitions using exact PR389 GitHub artifact **12457776202**, independently verified EXE SHA256 `7aea0da84e6de849fa2f174386b0d8f9833823445cd724a29c49af9b2a79ffcf`.
- Current source physical **0/8 NOT RUN**; do not merge PR389 or close M7/M10 without physical evidence. Maintain M1–M4 **4/10 mandatory accepted**, original 41/41 local coverage and 9/9 accepted gaps, M11/M12 dormant. Respect actual Windows profile/AppData restrictions and locked Spectrum Core Create/Edit List picker, image upload and 218 offline icons.
- No further cleanup of branches, video, screenshots, immutable work logs, script/test gates or Git history authorized or attempted by this slice.
