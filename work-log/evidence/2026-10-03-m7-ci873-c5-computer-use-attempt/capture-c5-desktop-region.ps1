param(
  [Parameter(Mandatory=$true)][string]$OutputDirectory,
  [int]$X = 1800,
  [int]$Y = 700,
  [int]$Width = 760,
  [int]$Height = 380,
  [int]$DurationSeconds = 12,
  [int]$IntervalMs = 100
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
$captureStarted = (Get-Date).ToUniversalTime().ToString('o')
$captureClock = [Diagnostics.Stopwatch]::StartNew()
$frames = [Collections.Generic.List[object]]::new()
$index = 0
while ($captureClock.Elapsed.TotalSeconds -lt $DurationSeconds) {
  $image = [Drawing.Bitmap]::new($Width, $Height)
  $graphics = [Drawing.Graphics]::FromImage($image)
  try {
    $graphics.CopyFromScreen($X,$Y,0,0,$image.Size)
    $file = 'frame-{0:D4}.png' -f $index
    $image.Save((Join-Path $OutputDirectory $file),[Drawing.Imaging.ImageFormat]::Png)
    $frames.Add([pscustomobject]@{file=$file;elapsedMs=$captureClock.ElapsedMilliseconds;utc=(Get-Date).ToUniversalTime().ToString('o')})
  } finally {
    $graphics.Dispose()
    $image.Dispose()
  }
  $index++
  Start-Sleep -Milliseconds $IntervalMs
}
[ordered]@{capture='physical desktop pixels via CopyFromScreen; no input injection';startedUtc=$captureStarted;region=@{x=$X;y=$Y;width=$Width;height=$Height};requestedIntervalMs=$IntervalMs;durationMs=$captureClock.ElapsedMilliseconds;frames=$frames.ToArray()} | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $OutputDirectory 'sequence.json') -Encoding UTF8
Write-Output "Captured $index physical frames."
