# Read-only Windows corroboration of actual P09/P11 physical input and HWND motion.
# No input injection, hooks, window movement, focus changes, or Narro data access.
# Requires a fresh isolated Narro test process. NOT a physical acceptance verdict.
[CmdletBinding()]
param(
    [switch]$SelfTest,
    [int]$TargetProcessId,
    [ValidateRange(1, 180)][int]$Seconds = 45,
    [ValidateRange(25, 250)][int]$IntervalMs = 50,
    [string]$Out
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if ($PSVersionTable.PSEdition -eq 'Core' -and -not $IsWindows) {
    throw 'This receipt tool only runs on Windows.'
}

# Deliberately no keyboard hook: poll only shortcut modifiers, F/T and left mouse;
# persist only the exact chord booleans (never individual letter-key state).
# In particular, a virtual-key sample is NOT an OS scan-code/event-delivery proof.
$win32 = @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;

[StructLayout(LayoutKind.Sequential)]
public struct NarroPoint {
    public int X;
    public int Y;
}
[StructLayout(LayoutKind.Sequential)]
public struct NarroRect {
    public int Left;
    public int Top;
    public int Right;
    public int Bottom;
}
[StructLayout(LayoutKind.Sequential)]
public struct NarroGuiThreadInfo {
    public uint cbSize;
    public uint flags;
    public IntPtr hwndActive;
    public IntPtr hwndFocus;
    public IntPtr hwndCapture;
    public IntPtr hwndMenuOwner;
    public IntPtr hwndMoveSize;
    public IntPtr hwndCaret;
    public NarroRect rcCaret;
}
public static class NarroInputWin32 {
    private delegate bool EnumWindowsCallback(IntPtr hwnd, IntPtr context);
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hwnd, out NarroRect rect);
    [DllImport("user32.dll")] public static extern bool GetCursorPos(out NarroPoint point);
    [DllImport("user32.dll")] public static extern short GetAsyncKeyState(int key);
    [DllImport("user32.dll")] public static extern bool GetGUIThreadInfo(uint threadId, ref NarroGuiThreadInfo info);
    [DllImport("user32.dll")] private static extern bool EnumWindows(EnumWindowsCallback callback, IntPtr context);
    [DllImport("user32.dll")] private static extern bool IsWindowVisible(IntPtr hwnd);
    public static IntPtr[] VisibleTopLevelWindows(uint processId) {
        var windows = new List<IntPtr>();
        EnumWindowsCallback callback = delegate(IntPtr hwnd, IntPtr context) {
            uint owner;
            GetWindowThreadProcessId(hwnd, out owner);
            if (owner == processId && IsWindowVisible(hwnd)) windows.Add(hwnd);
            return true;
        };
        if (!EnumWindows(callback, IntPtr.Zero))
            throw new InvalidOperationException("Win32 EnumWindows failed.");
        return windows.ToArray();
    }
}
'@
Add-Type -TypeDefinition $win32

function ConvertTo-NarroHandle([IntPtr]$Handle) {
    if ($Handle -eq [IntPtr]::Zero) { return $null }
    return ('0x{0:x}' -f $Handle.ToInt64())
}
function Get-NarroRect([IntPtr]$Handle) {
    $rect = New-Object NarroRect
    if ($Handle -eq [IntPtr]::Zero -or -not [NarroInputWin32]::GetWindowRect($Handle, [ref]$rect)) {
        return $null
    }
    return @($rect.Left, $rect.Top, $rect.Right, $rect.Bottom)
}
function Test-NarroKey([int]$VirtualKey) {
    return (([int][NarroInputWin32]::GetAsyncKeyState($VirtualKey) -band 0x8000) -ne 0)
}

if ($SelfTest) {
    if ($TargetProcessId -ne 0 -or $Out) { throw 'SelfTest accepts no target or output.' }
    $foreground = [NarroInputWin32]::GetForegroundWindow()
    $null = Get-NarroRect $foreground
    $null = ConvertTo-NarroHandle $foreground
    $null = [NarroInputWin32]::VisibleTopLevelWindows([uint32]0)
    foreach ($key in @(0x11, 0x12, 0x10, 0x46, 0x54, 0x01)) { $null = Test-NarroKey $key }
    Write-Output 'Windows read-only input receipt Win32 interop self-test: PASS (no physical input exercised).'
    return
}

if ($TargetProcessId -le 0) { throw 'Supply -TargetProcessId for the isolated Narro.exe process.' }
if (-not $Out -or -not [IO.Path]::IsPathRooted($Out)) {
    throw 'Supply absolute -Out inside an existing isolated evidence directory.'
}
if (-not [IO.Directory]::Exists([IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($Out)))) {
    throw 'The isolated evidence directory must already exist; refusing to create arbitrary folders.'
}
if ([IO.File]::Exists($Out)) { throw 'Evidence output already exists; refusing to overwrite.' }

$target = Get-Process -Id $TargetProcessId -ErrorAction Stop
if ($target.ProcessName -ne 'Narro') {
    throw "Target process must be Narro.exe, got '$($target.ProcessName)'."
}
# Does not read task data or probe the user's personal Narro profile.
$started = [DateTimeOffset]::UtcNow.ToString('o')
$samples = [System.Collections.Generic.List[object]]::new()
$timer = [Diagnostics.Stopwatch]::StartNew()
$completed = $false
try {
    while ($timer.Elapsed.TotalSeconds -lt $Seconds) {
        $fg = [NarroInputWin32]::GetForegroundWindow()
        [uint32]$foregroundPid = 0
        if ($fg -ne [IntPtr]::Zero) {
            $null = [NarroInputWin32]::GetWindowThreadProcessId($fg, [ref]$foregroundPid)
        }

        $info = New-Object NarroGuiThreadInfo
        $info.cbSize = [uint32][Runtime.InteropServices.Marshal]::SizeOf([type][NarroGuiThreadInfo])
        $guiAvailable = [NarroInputWin32]::GetGUIThreadInfo([uint32]0, [ref]$info)
        [uint32]$focusPid = 0
        if ($guiAvailable -and $info.hwndFocus -ne [IntPtr]::Zero) {
            $null = [NarroInputWin32]::GetWindowThreadProcessId($info.hwndFocus, [ref]$focusPid)
        }

        $cursor = New-Object NarroPoint
        $cursorAvailable = [NarroInputWin32]::GetCursorPos([ref]$cursor)
        $windows = @(
            foreach ($hwnd in [NarroInputWin32]::VisibleTopLevelWindows([uint32]$TargetProcessId)) {
                [pscustomobject]@{
                    hwnd = ConvertTo-NarroHandle $hwnd
                    rect = Get-NarroRect $hwnd
                }
            }
        )
        $ctrlHeld = Test-NarroKey 0x11
        $altHeld = Test-NarroKey 0x12
        $shiftHeld = Test-NarroKey 0x10
        $ctrlFChord = $ctrlHeld -and -not $altHeld -and -not $shiftHeld -and (Test-NarroKey 0x46)
        $ctrlAltTChord = $ctrlHeld -and $altHeld -and -not $shiftHeld -and (Test-NarroKey 0x54)
        $samples.Add([pscustomobject]@{
            elapsedMs = [int][Math]::Round($timer.Elapsed.TotalMilliseconds)
            targetForeground = ($foregroundPid -eq [uint32]$TargetProcessId)
            foregroundPid = $foregroundPid
            foregroundHwnd = ConvertTo-NarroHandle $fg
            focusedHwnd = if ($guiAvailable) { ConvertTo-NarroHandle $info.hwndFocus } else { $null }
            focusedPid = $focusPid
            hwnds = $windows
            cursor = if ($cursorAvailable) { @($cursor.X, $cursor.Y) } else { $null }
            keys = [pscustomobject]@{
                ctrl = $ctrlHeld
                alt = $altHeld
                shift = $shiftHeld
                ctrlF = $ctrlFChord
                ctrlAltT = $ctrlAltTChord
                leftMouse = Test-NarroKey 0x01
            }
        })
        Start-Sleep -Milliseconds $IntervalMs
    }
    $completed = $true
}
finally {
    $timer.Stop()
    $focusedSamples = @($samples | Where-Object { $_.targetForeground }).Count
    $evidence = [ordered]@{
        kind = 'narro-p09-p11-readonly-win32-input'
        captureStatus = if ($completed) { 'CAPTURED_NOT_VALIDATED' } else { 'INCOMPLETE_NOT_VALIDATED' }
        startedUtc = $started
        finishedUtc = [DateTimeOffset]::UtcNow.ToString('o')
        targetProcessId = $TargetProcessId
        requestedSeconds = $Seconds
        intervalMs = $IntervalMs
        sampleCount = $samples.Count
        targetForegroundSamples = $focusedSamples
        limitations = @(
            'Virtual-key state polling cannot prove keyboard scan codes, event dispatch or physical keyboard origin.'
            'Samples can miss a quick press/release; a missing sample never means the operator did not press the key.'
            'Focused HWND, top-level Narro HWND rectangles and mouse-button samples do not prove a native WM_ENTERSIZEMOVE loop.'
            'This output alone cannot mark P09, P11 or any Windows physical case PASS.'
        )
        samples = @($samples.ToArray())
    }
    # CreateNew is atomic even when a second operator creates the same path while recording.
    $stream = [IO.File]::Open($Out, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
    try {
        $writer = [IO.StreamWriter]::new($stream, [Text.UTF8Encoding]::new($false))
        try { $writer.Write(($evidence | ConvertTo-Json -Depth 12)) }
        finally { $writer.Dispose() }
    }
    finally { $stream.Dispose() }
}
Write-Output "Win32 P09/P11 read-only corroboration saved ($($evidence.captureStatus)); no physical PASS assigned."
