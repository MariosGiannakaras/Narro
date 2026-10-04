param(
    [switch]$SelfTest,
    [switch]$SelfTestNative,
    [int]$NarroPid = 0,
    [string]$OutputPath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Assert-Condition {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
}

function Assert-Throws {
    param([scriptblock]$Action, [string]$Message)
    $threw = $false
    try { & $Action | Out-Null } catch { $threw = $true }
    Assert-Condition $threw $Message
}

function Resolve-NarroRootPid {
    param([int]$RequestedPid)

    $rows = @(Get-CimInstance Win32_Process | Where-Object { $_.Name -ieq "narro.exe" })
    if ($RequestedPid -gt 0) {
        $match = @($rows | Where-Object { [int]$_.ProcessId -eq $RequestedPid })
        if ($match.Count -ne 1) { throw "PID $RequestedPid is not a running narro.exe process" }
        return $RequestedPid
    }

    if ($rows.Count -eq 0) { throw "no running narro.exe process was found" }
    if ($rows.Count -gt 1) {
        $pids = ($rows | ForEach-Object { [string]$_.ProcessId }) -join ", "
        throw "multiple narro.exe processes are running ($pids); fully quit production Narro and leave only the diagnostic build running"
    }
    return [int]$rows[0].ProcessId
}

function Get-ExpectedCompactRegion {
    param([int]$OuterWidth, [int]$OuterHeight, [uint32]$Dpi)

    if ($OuterWidth -le 0 -or $OuterHeight -le 0) { throw "Focus outer window size must be positive" }
    if ($Dpi -eq 0) { throw "Focus window DPI must be positive" }

    $scale = [double]$Dpi / 96.0
    $width = [int][Math]::Round(340.0 * $scale, [MidpointRounding]::AwayFromZero)
    $height = [int][Math]::Round(110.0 * $scale, [MidpointRounding]::AwayFromZero)
    return [pscustomobject]@{
        width = [Math]::Min($OuterWidth, [Math]::Max(1, $width))
        height = [Math]::Min($OuterHeight, [Math]::Max(1, $height))
    }
}

function Assert-ScenarioSnapshot {
    param([int]$RootPid, [object[]]$Windows)

    $owned = @($Windows | Where-Object { [int]$_.pid -eq $RootPid })
    $main = @($owned | Where-Object { [string]$_.title -eq "Narro" })
    $focus = @($owned | Where-Object { [string]$_.title -eq "Narro - Focus" })

    Assert-Condition ($main.Count -eq 0) "Main HWND still exists; use Destroy Main, not Hide Main, before measuring"
    Assert-Condition ($focus.Count -eq 1) "expected exactly one Narro - Focus top-level HWND for the diagnostic process"

    $focusWindow = $focus[0]
    Assert-Condition ([bool]$focusWindow.visible) "Narro - Focus is not visible"
    Assert-Condition ([uint32]$focusWindow.dpi -gt 0) "Narro - Focus reported invalid DPI"
    Assert-Condition ([int]$focusWindow.window.width -gt 0 -and [int]$focusWindow.window.height -gt 0) "Narro - Focus outer size is invalid"
    Assert-Condition ([int]$focusWindow.regionKind -gt 0 -and $null -ne $focusWindow.region) "Narro - Focus has no explicit native visible region"

    $expected = Get-ExpectedCompactRegion -OuterWidth ([int]$focusWindow.window.width) -OuterHeight ([int]$focusWindow.window.height) -Dpi ([uint32]$focusWindow.dpi)

    Assert-Condition ([int]$focusWindow.region.x -eq 0 -and [int]$focusWindow.region.y -eq 0) "Focus native region is not anchored at the host origin"
    Assert-Condition ([int]$focusWindow.region.width -eq [int]$expected.width) "Focus native region width does not match compact Timer width at current DPI"
    Assert-Condition ([int]$focusWindow.region.height -eq [int]$expected.height) "Focus native region height does not match compact Timer 110px height at current DPI"

    return [pscustomobject]@{
        mainWindowCount = $main.Count
        focusWindowCount = $focus.Count
        focus = $focusWindow
        expectedCompactRegion = $expected
    }
}

function Invoke-SelfTest {
    $expected100 = Get-ExpectedCompactRegion -OuterWidth 340 -OuterHeight 700 -Dpi 96
    Assert-Condition ($expected100.width -eq 340 -and $expected100.height -eq 110) "100% compact region expectation failed"

    $expected125 = Get-ExpectedCompactRegion -OuterWidth 425 -OuterHeight 875 -Dpi 120
    Assert-Condition ($expected125.width -eq 425 -and $expected125.height -eq 138) "125% compact region expectation failed"

    $validFocus = [pscustomobject]@{
        pid = 42
        title = "Narro - Focus"
        visible = $true
        dpi = 120
        hwnd = "0x100"
        window = [pscustomobject]@{ x = 100; y = 50; width = 425; height = 875 }
        regionKind = 2
        region = [pscustomobject]@{ x = 0; y = 0; width = 425; height = 138 }
    }
    $result = Assert-ScenarioSnapshot -RootPid 42 -Windows @($validFocus)
    Assert-Condition ($result.mainWindowCount -eq 0 -and $result.focusWindowCount -eq 1) "valid scenario snapshot failed"

    $hiddenMain = [pscustomobject]@{
        pid = 42
        title = "Narro"
        visible = $false
        dpi = 120
        hwnd = "0x101"
        window = [pscustomobject]@{ x = 0; y = 0; width = 1000; height = 700 }
        regionKind = 0
        region = $null
    }
    Assert-Throws -Action { Assert-ScenarioSnapshot -RootPid 42 -Windows @($validFocus, $hiddenMain) } -Message "hidden Main HWND was incorrectly accepted as destroyed"

    $expandedFocus = [pscustomobject]@{
        pid = 42
        title = "Narro - Focus"
        visible = $true
        dpi = 120
        hwnd = "0x102"
        window = [pscustomobject]@{ x = 100; y = 50; width = 425; height = 875 }
        regionKind = 2
        region = [pscustomobject]@{ x = 0; y = 0; width = 425; height = 375 }
    }
    Assert-Throws -Action { Assert-ScenarioSnapshot -RootPid 42 -Windows @($expandedFocus) } -Message "expanded Timer region was incorrectly accepted as compact"

    $hiddenFocus = [pscustomobject]@{
        pid = 42
        title = "Narro - Focus"
        visible = $false
        dpi = 120
        hwnd = "0x103"
        window = [pscustomobject]@{ x = 100; y = 50; width = 425; height = 875 }
        regionKind = 2
        region = [pscustomobject]@{ x = 0; y = 0; width = 425; height = 138 }
    }
    Assert-Throws -Action { Assert-ScenarioSnapshot -RootPid 42 -Windows @($hiddenFocus) } -Message "hidden Focus window was incorrectly accepted"

    Write-Host "M1 floating performance scenario self-test: PASS"
}

if ($SelfTest) {
    Invoke-SelfTest
    exit 0
}

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public static class NarroM1ScenarioProbe {
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }

    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll")]
    public static extern int GetWindowTextLength(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [DllImport("user32.dll")]
    public static extern int GetWindowRgnBox(IntPtr hWnd, out RECT lprc);

    [DllImport("user32.dll")]
    public static extern uint GetDpiForWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
}
"@

function Get-OwnedWindowSnapshots {
    param([int]$OwnerRootPid)
    $captured = [System.Collections.Generic.List[object]]::new()
    $callback = [NarroM1ScenarioProbe+EnumWindowsProc]{
        param([IntPtr]$hWnd, [IntPtr]$lParam)

        [uint32]$windowOwnerProcessId = 0
        [void][NarroM1ScenarioProbe]::GetWindowThreadProcessId($hWnd, [ref]$windowOwnerProcessId)
        if ([int]$windowOwnerProcessId -ne $OwnerRootPid) { return $true }

        $length = [NarroM1ScenarioProbe]::GetWindowTextLength($hWnd)
        $builder = New-Object System.Text.StringBuilder ([Math]::Max(1, $length + 1))
        [void][NarroM1ScenarioProbe]::GetWindowText($hWnd, $builder, $builder.Capacity)

        $windowRect = New-Object NarroM1ScenarioProbe+RECT
        if (-not [NarroM1ScenarioProbe]::GetWindowRect($hWnd, [ref]$windowRect)) {
            throw "GetWindowRect failed for a Narro top-level HWND"
        }

        $regionRect = New-Object NarroM1ScenarioProbe+RECT
        $regionKind = [NarroM1ScenarioProbe]::GetWindowRgnBox($hWnd, [ref]$regionRect)
        $dpi = [NarroM1ScenarioProbe]::GetDpiForWindow($hWnd)

        $captured.Add([pscustomobject]@{
            pid = [int]$windowOwnerProcessId
            title = $builder.ToString()
            visible = [NarroM1ScenarioProbe]::IsWindowVisible($hWnd)
            dpi = [uint32]$dpi
            hwnd = ('0x{0:X}' -f $hWnd.ToInt64())
            window = [pscustomobject]@{
                x = $windowRect.Left
                y = $windowRect.Top
                width = $windowRect.Right - $windowRect.Left
                height = $windowRect.Bottom - $windowRect.Top
            }
            regionKind = $regionKind
            region = if ($regionKind -gt 0) {
                [pscustomobject]@{
                    x = $regionRect.Left
                    y = $regionRect.Top
                    width = $regionRect.Right - $regionRect.Left
                    height = $regionRect.Bottom - $regionRect.Top
                }
            } else {
                $null
            }
        })
        return $true
    }

    $previousDpiContext = [NarroM1ScenarioProbe]::SetThreadDpiAwarenessContext([IntPtr](-4))
    try {
        Assert-Condition ([NarroM1ScenarioProbe]::EnumWindows($callback, [IntPtr]::Zero)) "native window enumeration failed"
    } finally {
        [void][NarroM1ScenarioProbe]::SetThreadDpiAwarenessContext($previousDpiContext)
    }
    return $captured.ToArray()
}

if ($SelfTestNative) {
    Add-Type -AssemblyName System.Windows.Forms
    $probeForm = [System.Windows.Forms.Form]::new()
    try {
        $probeForm.Text = "Narro M1 native enumeration regression"
        $probeHandle = $probeForm.Handle
        $nativeRows = @(Get-OwnedWindowSnapshots -OwnerRootPid $PID)
        $observed = @($nativeRows | Where-Object { $_.hwnd -eq ('0x{0:X}' -f $probeHandle.ToInt64()) })
        Assert-Condition ($observed.Count -eq 1) "native callback did not capture the actual test HWND"
        Assert-Condition ($observed[0].pid -eq $PID -and $observed[0].title -eq $probeForm.Text) "native callback owner/title mismatch"
        Assert-Condition ($observed[0].window.width -gt 0 -and $observed[0].dpi -gt 0) "native callback geometry/DPI missing"
        Assert-Condition (@(Get-OwnedWindowSnapshots -OwnerRootPid 0).Count -eq 0) "native callback did not filter other owners"
        Write-Host "M1 floating native window enumeration self-test: PASS"
    } finally {
        $probeForm.Dispose()
    }
    exit 0
}

$rootPid = Resolve-NarroRootPid -RequestedPid $NarroPid
$rootProcess = Get-Process -Id $rootPid -ErrorAction Stop
$captured = @(Get-OwnedWindowSnapshots -OwnerRootPid $rootPid)
$validated = Assert-ScenarioSnapshot -RootPid $rootPid -Windows $captured
$summary = [pscustomobject]@{
    schemaVersion = 1
    scenario = "floating-only-main-destroyed"
    pass = $true
    rootPid = $rootPid
    rootExecutable = $rootProcess.Path
    ownedTopLevelWindowCount = @($captured).Count
    mainWindowCount = $validated.mainWindowCount
    focusWindowCount = $validated.focusWindowCount
    focus = $validated.focus
    expectedCompactRegion = $validated.expectedCompactRegion
    capturedAtUtc = [DateTime]::UtcNow.ToString("o")
}

if (-not [string]::IsNullOrWhiteSpace($OutputPath)) {
    $resolved = [System.IO.Path]::GetFullPath($OutputPath)
    $parent = Split-Path -Parent $resolved
    if (-not [string]::IsNullOrWhiteSpace($parent)) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    }
    $summary | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 -Path $resolved
    Write-Host "Scenario preflight: $resolved"
}

Write-Host ("M1 floating scenario PASS: PID {0}; Focus {1}; DPI {2}; compact region {3}x{4}; Main HWND count 0." -f $rootPid, $validated.focus.hwnd, $validated.focus.dpi, $validated.focus.region.width, $validated.focus.region.height)
