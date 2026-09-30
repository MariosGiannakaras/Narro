param(
  [string]$Title = "Narro - Focus",
  [Parameter(Mandatory = $true)][string]$Output,
  [Parameter(Mandatory = $true)][int]$OutputWidth,
  [Parameter(Mandatory = $true)][int]$OutputHeight,
  [switch]$HostHeight
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public static class NarroFocusCapture {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int max);
  [DllImport("user32.dll")] public static extern int GetWindowTextLength(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
  [DllImport("user32.dll")] public static extern int GetWindowRgnBox(IntPtr hWnd, out RECT rect);
}
"@

$found = [IntPtr]::Zero
$callback = [NarroFocusCapture+EnumWindowsProc]{
  param([IntPtr]$hWnd, [IntPtr]$lParam)
  $length = [NarroFocusCapture]::GetWindowTextLength($hWnd)
  if ($length -le 0) { return $true }
  $builder = New-Object System.Text.StringBuilder ($length + 1)
  [void][NarroFocusCapture]::GetWindowText($hWnd, $builder, $builder.Capacity)
  if ($builder.ToString() -eq $Title) { $script:found = $hWnd; return $false }
  return $true
}
[void][NarroFocusCapture]::EnumWindows($callback, [IntPtr]::Zero)
if ($found -eq [IntPtr]::Zero) { throw "Could not find '$Title'." }

$window = New-Object NarroFocusCapture+RECT
$region = New-Object NarroFocusCapture+RECT
if (-not [NarroFocusCapture]::GetWindowRect($found, [ref]$window)) { throw "GetWindowRect failed." }
$regionKind = [NarroFocusCapture]::GetWindowRgnBox($found, [ref]$region)
$sourceWidth = $window.Right - $window.Left
$sourceHeight = $window.Bottom - $window.Top
if (-not $HostHeight -and $regionKind -gt 0) {
  $sourceWidth = $region.Right - $region.Left
  $sourceHeight = $region.Bottom - $region.Top
}
if ($sourceWidth -le 0 -or $sourceHeight -le 0) { throw "Invalid Focus capture dimensions." }

$source = New-Object System.Drawing.Bitmap $sourceWidth, $sourceHeight
$sourceGraphics = [System.Drawing.Graphics]::FromImage($source)
$sourceGraphics.CopyFromScreen($window.Left, $window.Top, 0, 0, $source.Size)
$sourceGraphics.Dispose()

$target = New-Object System.Drawing.Bitmap $OutputWidth, $OutputHeight
$targetGraphics = [System.Drawing.Graphics]::FromImage($target)
$targetGraphics.DrawImage($source, 0, 0, $OutputWidth, $OutputHeight)
$targetGraphics.Dispose()
$source.Dispose()

$directory = Split-Path -Parent $Output
if ($directory) { New-Item -ItemType Directory -Force -Path $directory | Out-Null }
$target.Save($Output, [System.Drawing.Imaging.ImageFormat]::Png)
$target.Dispose()
