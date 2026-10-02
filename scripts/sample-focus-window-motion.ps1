param(
  [string]$Title = "Narro - Focus",
  [string]$ReadyFile = "",
  [string]$StopFile = "",
  [int]$SampleCount = 160,
  [int]$IntervalMs = 8,
  [int]$MaxDurationMs = 30000
)
$ErrorActionPreference = "Stop"
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public static class NarroFocusMotionSample {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int max);
  [DllImport("user32.dll")] public static extern int GetWindowTextLength(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr hWnd);
}
"@
$found = [IntPtr]::Zero
$callback = [NarroFocusMotionSample+EnumWindowsProc]{
  param([IntPtr]$hWnd, [IntPtr]$lParam)
  $length = [NarroFocusMotionSample]::GetWindowTextLength($hWnd)
  if ($length -le 0) { return $true }
  $builder = New-Object System.Text.StringBuilder ($length + 1)
  [void][NarroFocusMotionSample]::GetWindowText($hWnd, $builder, $builder.Capacity)
  if ($builder.ToString() -eq $Title) { $script:found = $hWnd; return $false }
  return $true
}
[void][NarroFocusMotionSample]::EnumWindows($callback, [IntPtr]::Zero)
if ($found -eq [IntPtr]::Zero) { throw "Could not find '$Title'." }
if ($ReadyFile) {
  $readyDirectory = Split-Path -Parent $ReadyFile
  if ($readyDirectory) { New-Item -ItemType Directory -Force -Path $readyDirectory | Out-Null }
  Set-Content -Path $ReadyFile -Value "ready" -NoNewline
}
if ($SampleCount -lt 1) { throw "SampleCount must be at least 1." }
if ($IntervalMs -lt 0) { throw "IntervalMs must be zero or greater." }
if ($MaxDurationMs -lt 1000) { throw "MaxDurationMs must be at least 1000ms." }

$samples = @()
$started = [System.Diagnostics.Stopwatch]::StartNew()
$index = 0
while ($true) {
  $rect = New-Object NarroFocusMotionSample+RECT
  if (-not [NarroFocusMotionSample]::GetWindowRect($found, [ref]$rect)) { throw "GetWindowRect failed." }
  $samples += [pscustomobject]@{
    index = $index
    elapsedMs = $started.ElapsedMilliseconds
    visible = [NarroFocusMotionSample]::IsWindowVisible($found)
    dpi = [NarroFocusMotionSample]::GetDpiForWindow($found)
    window = [pscustomobject]@{
      x = $rect.Left
      y = $rect.Top
      width = $rect.Right - $rect.Left
      height = $rect.Bottom - $rect.Top
    }
  }
  $index += 1

  $minimumCaptured = $index -ge $SampleCount
  $stopObserved = -not [string]::IsNullOrWhiteSpace($StopFile) -and (Test-Path $StopFile -PathType Leaf)
  if ($minimumCaptured -and ([string]::IsNullOrWhiteSpace($StopFile) -or $stopObserved)) {
    break
  }
  if ($started.ElapsedMilliseconds -ge $MaxDurationMs) {
    throw ("Native motion sampler exceeded {0}ms before the transition stop signal." -f $MaxDurationMs)
  }
  if ($IntervalMs -gt 0) { Start-Sleep -Milliseconds $IntervalMs }
}
$samples | ConvertTo-Json -Compress -Depth 5
