# B9/B17 evidence-to-code reconciliation — 2026-10-09

Documentation-only correction; no executable implementation and no local/native tests run.

- B9 Success sound effect already has an independent saved successSoundEnabled switch, own pending key, persisted Rust field and post-commit Focus completion playback gate. Older FIX_NOW text falsely claimed the toggle absent; current test-ui-preferences has static regression checks. Source/native audio parity OPEN.
- B17 conditionally rendered Preferences children are already implemented: Pomodoro, Timed Alerts, Notification, Reminder and Fun GIF. PR258 exact head 2ea3f31226c61a54cdf670b4dcd29c2324571225 full Windows CI 37827228218 SUCCESS (validation/fast/Windows), merged to 017b32eaa6f183ef1084f2eca8da18530383fa3a. Source rendered/physical parity OPEN.
- Updated TODO, audit crosswalk, future review U03/U10 and HANDOFF. Preserve independent PR280, PR285, PR286 and PR287. No new product code or new implementation progress counted; 34/38 remains.
- User-approved Spectrum Core/icon design remains separate from direct Blitzit evidence. Optional live M11 dormant.
