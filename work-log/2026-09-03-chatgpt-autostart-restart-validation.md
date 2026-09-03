# 2026-09-03 — Windows autostart restart validation

## Observation

The user performed a real Windows restart after enabling Narro autostart. After Windows restarted and the user returned to the desktop, the Narro `main` window was already open normally.

## Result

**PASS — actual Narro autostart process launch after Windows restart/sign-in was physically observed.**

This supersedes the earlier residual `NOT RUN` note that existed because `Win+L` only locks/unlocks the current session and was not valid fresh-login evidence.

Previously established autostart evidence remains valid:

- Narro autostart enable/disable controls operate locally;
- post-operation state verification succeeds;
- enabled Narro appears in Windows Task Manager Startup apps;
- the official `tauri-plugin-autostart` path passed Windows CI #65 / run `33725057607`.

No further M1 autostart validation is required. Future Milestone 10 lifecycle/release validation may still retest restart behavior as part of the broader release scenario, but it is no longer an unresolved capability proof.
