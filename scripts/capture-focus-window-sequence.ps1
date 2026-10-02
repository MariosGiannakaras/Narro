param(
  [string]$Title = "Narro - Focus",
  [Parameter(Mandatory = $true)][string]$OutputDirectory,
  [string]$ReadyFile = "",
  [string]$StopFile = "",
  [int]$FrameCount = 30,
  [int]$IntervalMs = 15,
  [int]$MaxDurationMs = 30000
)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public static class NarroFocusSequence {
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
$callback = [NarroFocusSequence+EnumWindowsProc]{
  param([IntPtr]$hWnd, [IntPtr]$lParam)
  $length = [NarroFocusSequence]::GetWindowTextLength($hWnd)
  if ($length -le 0) { return $true }
  $builder = New-Object System.Text.StringBuilder ($length + 1)
  [void][NarroFocusSequence]::GetWindowText($hWnd, $builder, $builder.Capacity)
  if ($builder.ToString() -eq $Title) { $script:found = $hWnd; return $false }
  return $true
}
[void][NarroFocusSequence]::EnumWindows($callback, [IntPtr]::Zero)
if ($found -eq [IntPtr]::Zero) { throw "Could not find '$Title'." }
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
if ($ReadyFile) {
  $readyDirectory = Split-Path -Parent $ReadyFile
  if ($readyDirectory) { New-Item -ItemType Directory -Force -Path $readyDirectory | Out-Null }
  Set-Content -Path $ReadyFile -Value "ready" -NoNewline
}
if ($FrameCount -lt 1) { throw "FrameCount must be at least 1." }
if ($IntervalMs -lt 0) { throw "IntervalMs must be zero or greater." }
if ($MaxDurationMs -lt 1000) { throw "MaxDurationMs must be at least 1000ms." }

$frames = @()
$started = [System.Diagnostics.Stopwatch]::StartNew()
$index = 0
while ($true) {
  $rect = New-Object NarroFocusSequence+RECT
  if (-not [NarroFocusSequence]::GetWindowRect($found, [ref]$rect)) { throw "GetWindowRect failed." }
  $width = $rect.Right - $rect.Left
  $height = $rect.Bottom - $rect.Top
  $source = New-Object System.Drawing.Bitmap $width, $height
  $graphics = [System.Drawing.Graphics]::FromImage($source)
  $graphics.CopyFromScreen($rect.Left, $rect.Top, 0, 0, $source.Size)
  $graphics.Dispose()
  $target = New-Object System.Drawing.Bitmap 340, 700
  $targetGraphics = [System.Drawing.Graphics]::FromImage($target)
  $targetGraphics.DrawImage($source, 0, 0, 340, 700)
  $targetGraphics.Dispose()
  $source.Dispose()
  $fileName = ('frame-{0:D3}.png' -f $index)
  $target.Save((Join-Path $OutputDirectory $fileName), [System.Drawing.Imaging.ImageFormat]::Png)
  $target.Dispose()
  $frames += [pscustomobject]@{
    index = $index
    elapsedMs = $started.ElapsedMilliseconds
    fileName = $fileName
    native = [pscustomobject]@{
      visible = [NarroFocusSequence]::IsWindowVisible($found)
      dpi = [NarroFocusSequence]::GetDpiForWindow($found)
      window = [pscustomobject]@{ x = $rect.Left; y = $rect.Top; width = $width; height = $height }
    }
  }
  $index += 1

  $minimumCaptured = $index -ge $FrameCount
  $stopObserved = -not [string]::IsNullOrWhiteSpace($StopFile) -and (Test-Path $StopFile -PathType Leaf)
  if ($minimumCaptured -and ([string]::IsNullOrWhiteSpace($StopFile) -or $stopObserved)) {
    break
  }
  if ($started.ElapsedMilliseconds -ge $MaxDurationMs) {
    throw ("Native sequence capture exceeded {0}ms before the transition stop signal." -f $MaxDurationMs)
  }
  if ($IntervalMs -gt 0) { Start-Sleep -Milliseconds $IntervalMs }
}
$frames | ConvertTo-Json -Compress -Depth 6
