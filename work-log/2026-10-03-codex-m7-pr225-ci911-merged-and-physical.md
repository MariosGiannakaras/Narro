# M7 PR225 / CI911 integration and physical acceptance

## Verified source and candidate

PR [225](https://github.com/MariosGiannakaras/Narro/pull/225) exact head `4f9d03832743f3db90d0c61dc527b27a194886fd` PASSed full Windows [CI911](https://github.com/MariosGiannakaras/Narro/actions/runs/37150284172), including the two-connection Preferences contention regression and38 normal/reduced rendered editor/geometry cases.

Expected-head guarded squash merge produced `cbbaaa25dc94ec756e8bffbc731b99a8be0c4945` at2026-10-03T20:35:45Z. The main checkout fast-forwarded successfully. A comparison to the exact validated head returned only five Markdown paths: HANDOFF, STATUS, TODO, audit crosswalk and the previous checkpoint report. All executable/build/test/workflow files are therefore identical. Duplicate main run `37152106789` was cancelled after this proof; no new full build is needed for the same code.

- Artifact `11284371032`, `narro-m7-validation-windows-x64`.
- ZIP SHA256 `2cea98d19f49057a07b0c2d34068f3aa5ff0abba6b25e4ec113d76aabe0677d6`.
- EXE SHA256 `24b71ba952ff323647537465f4d5ec8026b3e8001f65d3798d0dbf9eef06541a`,15038464bytes; reverified before launch.
- Local candidate: `artifacts/m7-pr225-ci911/candidate/narro-m7-validation.exe`.

## Current physical status

**IN PROGRESS / no new-source physical PASS yet.** The previous CI893 application was normally quit; no Narro validation process was running when resuming. OBS was confirmed stopped and closed normally. Only DISPLAY2 / GSM59C6 was enumerated. The dedicated CI911 recorder profile/collection is a clone and records that available display at native1920x1080/60fps, avoiding the earlier absent-display black area; the original two-display profile and previous recordings are retained.

Next: exact-EXE normal/reduced transitions, large Notes containment/draft/resize/Save, wrapped keyboard tooltip, narrow planning cards and Preferences save/restart; then independent fullscreen topmost and missing topology cases where hardware permits. Keep C4/C5 acceptance OPEN until the relevant continuous video and runtime evidence are reviewed.

## Prior evidence and meaningful negative controls

- [CI893 additional shortcut/completion recording and whole logs](evidence/m7-ci893-followup-20261003/manifest.json).
- [CI911 correction preflight,38 rendered cases and four legacy negative controls](evidence/m7-pr225-preflight-20261003/manifest.json).

The four negative controls reintroduced the old containing-block, narrow-card, initial-clip and fixed-end tooltip behavior in ignored built output. Each rendered acceptance scenario failed for the expected reason; output was restored afterwards. This validates regression sensitivity, not native Windows animation acceptance.
