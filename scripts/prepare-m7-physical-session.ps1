param(
    [Parameter(Mandatory = $true)]
    [string]$Executable,
    [string]$EvidenceRoot = "artifacts/m7-physical-session",
    [switch]$Launch
)

$ErrorActionPreference = "Stop"

$exe = (Resolve-Path $Executable).Path
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$sessionDir = Join-Path (Resolve-Path ".").Path (Join-Path $EvidenceRoot $stamp)
New-Item -ItemType Directory -Force -Path $sessionDir | Out-Null

$existing = @(Get-Process -Name "narro" -ErrorAction SilentlyContinue)
if ($existing.Count -gt 0) {
    $ids = ($existing | ForEach-Object { $_.Id }) -join ", "
    throw "Quit every existing Narro process before validation. Running PID(s): $ids"
}

$hash = (Get-FileHash -Algorithm SHA256 -Path $exe).Hash.ToLowerInvariant()
$os = Get-CimInstance Win32_OperatingSystem
Add-Type -AssemblyName System.Windows.Forms
$monitors = @(
    [System.Windows.Forms.Screen]::AllScreens | ForEach-Object {
        [ordered]@{
            deviceName = $_.DeviceName
            primary = $_.Primary
            bounds = [ordered]@{
                x = $_.Bounds.X
                y = $_.Bounds.Y
                width = $_.Bounds.Width
                height = $_.Bounds.Height
            }
            workingArea = [ordered]@{
                x = $_.WorkingArea.X
                y = $_.WorkingArea.Y
                width = $_.WorkingArea.Width
                height = $_.WorkingArea.Height
            }
        }
    }
)

$manifest = [ordered]@{
    createdUtc = [DateTime]::UtcNow.ToString("o")
    executable = $exe
    sha256 = $hash
    windows = [ordered]@{
        caption = $os.Caption
        version = $os.Version
        buildNumber = $os.BuildNumber
    }
    monitors = $monitors
    note = "Record actual Windows scaling percentages manually in checklist.md; Screen bounds alone do not prove DPI scale."
}
$manifest | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 (Join-Path $sessionDir "environment.json")

$checklist = @"
# M7 physical closure session

Executable SHA-256: $hash
Evidence directory: $sessionDir

Record monitor scaling before starting:
- Monitor 1:
- Monitor 2:

## C4 — Gate 7 continuity/session
- [ ] one Narro authority/process; second launch does not create competing runtime
- [ ] active task/session established
- [ ] 3x Panel -> Timer -> Panel with Windows animations On
- [ ] 3x compact -> expanded -> compact with Windows animations On
- [ ] 2x each direction/state with Windows animations Off, then restore setting
- [ ] same task/session identity and continuous authoritative time
- [ ] no blank/pale/loading/stale/duplicated frame
- [ ] no horizontal/document scrollbar
- [ ] Timer -> Blitz now -> Panel
- [ ] idle/no-task Ctrl+Shift+T no-op
- [ ] idle/no-task Find Timer no-op
- [ ] Main / Focus / Home reconcile after a task mutation

## C5 — Gate 12/platform
- [ ] move Timer between 100% and 125% displays
- [ ] expand/collapse near edge/taskbar on secondary display
- [ ] disconnect/reconnect or equivalent topology recovery
- [ ] Timer remains topmost over maximized/borderless-fullscreen app
- [ ] drag/save/restart restores safe placement
- [ ] all controls remain reachable and collapse remains usable

For every failure, record timestamp and visible symptom. Do not restart a general M7 audit; only the evidenced gate reopens.
"@
$checklist | Set-Content -Encoding UTF8 (Join-Path $sessionDir "checklist.md")

Write-Host "Prepared M7 physical evidence session:"
Write-Host "  $sessionDir"
Write-Host "Executable SHA-256: $hash"

if ($Launch) {
    $process = Start-Process -FilePath $exe -WorkingDirectory (Split-Path $exe) -PassThru
    Start-Sleep -Seconds 2
    $running = @(Get-Process -Name "narro" -ErrorAction SilentlyContinue)
    if ($running.Count -ne 1) {
        Write-Warning "Expected exactly one Narro process after launch; observed $($running.Count)."
    } else {
        Write-Host "Narro launched as PID $($running[0].Id). Begin the recording and follow checklist.md."
    }
}
