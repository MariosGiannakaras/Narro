# M1 physical Windows capability results — 2026-09-03

## Context

The user completed the consolidated Milestone 1 physical Windows capability pass on the installed diagnostic Narro build after the floating-only performance baseline had already been captured and committed.

## User-observed physical results

Observed PASS on the real Windows target:

- exact authoritative Rust state survives `main` destroy/background mutation/recreate and is visible in the recreated `main`;
- tray/background recovery and explicit tray Quit;
- selected-monitor Focus Panel left/right positioning;
- display disconnect/reconnect recovery without restarting Narro;
- global shortcut physical behavior;
- visible Windows notification delivery from the installed build.

## Autostart evidence

Observed PASS:

- Narro autostart enable/disable controls operate locally;
- enabled registration is visible in Windows Task Manager Startup apps.

Not physically proven:

- automatic Narro process launch on a genuinely new Windows sign-in session.

The user intentionally declined reboot/session termination solely for this test. The attempted `Win+L` + PIN cycle is lock/unlock, not Windows sign-out/sign-in, so it is not valid evidence for a new-session autostart launch. Windows Startup apps are expected to run on sign-in, not on ordinary lock/unlock.

Treat the residual as **NOT RUN**, not FAIL. Do not infer a launch PASS from Task Manager registration alone, but do not block the M1 architecture decision on this residual because registration/toggle behavior is physically proven, the official Tauri autostart path is automated-validated, and no architecture risk depends on reboot behavior.

## M1 Gate A conclusion

Gate A is sufficiently validated to proceed with the current architecture:

- Tauri 2 + WebView2 shell remains the selected Windows architecture;
- `main` + one reused `focusSurface` remains the window composition;
- the floating performance baseline supports this choice;
- no native Win32/WinUI overlay rewrite is warranted now;
- the one residual autostart fresh-logon launch check should remain documented and can be revisited opportunistically during later restart/release validation rather than forcing a reboot/sign-out now.

No product claim should state that next-logon autostart launch was physically observed until it actually is.
