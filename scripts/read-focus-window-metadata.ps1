param(
  [string]$Title = "Narro - Focus"
)

$ErrorActionPreference = "Stop"

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public static class NarroFocusWindowProbe {
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

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll")]
    public static extern int GetWindowTextLength(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [DllImport("user32.dll")]
    public static extern bool GetClientRect(IntPtr hWnd, out RECT lpRect);

    [DllImport("user32.dll")]
    public static extern int GetWindowRgnBox(IntPtr hWnd, out RECT lprc);

    [DllImport("user32.dll")]
    public static extern uint GetDpiForWindow(IntPtr hWnd);
}
"@

$found = [IntPtr]::Zero
$callback = [NarroFocusWindowProbe+EnumWindowsProc]{
  param([IntPtr]$hWnd, [IntPtr]$lParam)
  $length = [NarroFocusWindowProbe]::GetWindowTextLength($hWnd)
  if ($length -le 0) { return $true }
  $builder = New-Object System.Text.StringBuilder ($length + 1)
  [void][NarroFocusWindowProbe]::GetWindowText($hWnd, $builder, $builder.Capacity)
  if ($builder.ToString() -eq $Title) {
    $script:found = $hWnd
    return $false
  }
  return $true
}

[void][NarroFocusWindowProbe]::EnumWindows($callback, [IntPtr]::Zero)
if ($found -eq [IntPtr]::Zero) {
  throw "Could not find a top-level window titled '$Title'."
}

$windowRect = New-Object NarroFocusWindowProbe+RECT
$clientRect = New-Object NarroFocusWindowProbe+RECT
$regionRect = New-Object NarroFocusWindowProbe+RECT
if (-not [NarroFocusWindowProbe]::GetWindowRect($found, [ref]$windowRect)) {
  throw "GetWindowRect failed for '$Title'."
}
if (-not [NarroFocusWindowProbe]::GetClientRect($found, [ref]$clientRect)) {
  throw "GetClientRect failed for '$Title'."
}
$regionKind = [NarroFocusWindowProbe]::GetWindowRgnBox($found, [ref]$regionRect)
$dpi = [NarroFocusWindowProbe]::GetDpiForWindow($found)

[pscustomobject]@{
  title = $Title
  hwnd = ('0x{0:X}' -f $found.ToInt64())
  visible = [NarroFocusWindowProbe]::IsWindowVisible($found)
  dpi = $dpi
  scale = if ($dpi -gt 0) { $dpi / 96.0 } else { 0.0 }
  window = [pscustomobject]@{
    x = $windowRect.Left
    y = $windowRect.Top
    width = $windowRect.Right - $windowRect.Left
    height = $windowRect.Bottom - $windowRect.Top
  }
  client = [pscustomobject]@{
    width = $clientRect.Right - $clientRect.Left
    height = $clientRect.Bottom - $clientRect.Top
  }
  regionKind = $regionKind
  region = if ($regionKind -gt 0) {
    [pscustomobject]@{
      x = $regionRect.Left
      y = $regionRect.Top
      width = $regionRect.Right - $regionRect.Left
      height = $regionRect.Bottom - $regionRect.Top
    }
  } else { $null }
} | ConvertTo-Json -Compress -Depth 5
