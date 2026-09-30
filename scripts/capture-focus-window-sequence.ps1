param(
  [string]$Title = "Narro - Focus",
  [Parameter(Mandatory = $true)][string]$OutputDirectory,
  [int]$FrameCount = 20,
  [int]$IntervalMs = 15
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
$frames = @()
$started = [System.Diagnostics.Stopwatch]::StartNew()
for ($index = 0; $index -lt $FrameCount; $index++) {
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
  Start-Sleep -Milliseconds $IntervalMs
}
$frames | ConvertTo-Json -Compress -Depth 6
