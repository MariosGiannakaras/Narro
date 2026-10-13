# Actual display-settings access recovered — 2026-10-13

Microsoft-signed SystemSettings.exe and existing windows.immersivecontrolpanel package verified. Supported current-user Appx re-registration succeeded; ms-settings URI itself still reports no association. Launching the package's actual AppUserModelID through the standard shell AppsFolder opened the real Settings app:

`explorer.exe shell:AppsFolder\windows.immersivecontrolpanel_cw5n1h2txyewy!microsoft.windows.immersivecontrolpanel`

Actual returned window HWND790236/Settings, ApplicationFrameHost PID63924/SystemSettings PID18044. Sky returned no accessibility provider and coordinate input was unavailable; fresh native COM UIA uniquely invoked System then Display. The real Display page exposes Display1 and Display2, selected UltraGear100%, Extend these displays. No monitor/DPI/resolution/primary change was made. The exact PA05 DPI125→100 branch is still NOT RUN, but its genuine Windows UI is now available for the next exact-binary owned-profile capture. Do not use custom ms-settings registry commands or a security bypass.

Recorder health separately verified and published; no Narro processes running and original user DB SHA remains3b98e19d94ebcc75bd5d10f8fda0d17038a2aac6086782b44d76509f0e0636c4. Current correction PR349 replacement d32a500e/CI38381266484 pending; corrected native acceptance0/3.