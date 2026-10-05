# RAW_UNREVIEWED special Windows acquisition

## Current — three special acquisition groups exercised, media unreviewed (2026-10-05)

[Raw recordings, actions, whole logs and Windows power events](work-log/evidence/m7-ci953-special-20261005/README.md). 733.316s total in two recordings; 122 chronological actions. No video/image review or new PASS/FAIL. Exact unchanged CI953 EXE, newly launched PID22948/Main1444846/Focus6619566.

Acquisition: global B/T/P from OBS with both true/false preference snapshots, three checkbox Space toggles and final all true; real owned F timer10m with timed alert300s and notification alerts enabled, recorded through300s boundary; owned G scheduled Oct5 18:15 local, reminder lead300s, continuous capture spans18:10 reminder boundary. Notification delivery/rendering/audio outcome remains OPEN for media/log reviewer. Snapshot names all-shortcuts-disabled and all-shortcuts-restored are reversed relative to actual contents (true then false): raw values and timestamps are authoritative; final snapshot is all true. Do not infer key behavior from the filenames.

Topology: internal-only -> clone -> extend using actual Windows DisplaySwitch, native before/after snapshots. First sleep request with OBS open entered Away Mode; recorder normally stopped and OBS process closed; second request produced real S3 Windows events42/107 and firmware130/131 (18:12:35 sleep,18:12:43 resume). Wake timer was45s, actual wake reason/duration must be read from events rather than assumed. Physical HDMI unplug/replug was NOT performed. Sleep itself is an intentional recording gap; power events/raw app logs support it, no continuous video claim during powered-down interval.

Recorder recovery: Computer Use WGC FrameArrived timeout/geometry unavailable, native fallback authorized; after sleep OBS GPU video initialization failed, preserved error/logs, switched to CPU GDI20fps for restoration segment. Post-wake GDI stdin unavailable, process stopped then original MKV successfully remuxed; preserve limitation for motion reviewer. Entire original media and stream-copy MP4s uploaded, no extracted frames/screenshots. F/G retained owned fixtures; original95a returnedpaused/compact, legitimate new short restore segment, no silent time reset. Alerts/reminders false,interval/lead600, allshortcuts true restored. No Narro source/tests/build/CI/merge. M1–M9 existing gates unchanged; M10 blocked/M11 dormant.

User observation: yesterday browser Ctrl+Shift+T showed Narro Timer instead of reopening closed tab. Explicit global binding conflict to reconcile in later analysis/remediation, no source change during capture. Continuation: another chat reviews whole media/logs and maps exact exercised requirements; physical cable removal/reconnect remains manual/OPEN. Do not call actual Windows notification delivery PASS merely because its configured boundary elapsed.


[Pre-sleep full MP4](video/pre-sleep-full.mp4) · [Post-wake full MP4](video/post-wake-full.mp4) · [Chronological actions](chronological-actions.csv) · [Whole logs ZIP](Narro-M7-Logs.zip) · [Power events](inventory/power-events-final.json) · [Hashes](sha256-manifest.json)
