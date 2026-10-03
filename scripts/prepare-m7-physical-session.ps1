param(
    [Parameter(Mandatory = $true)]
    [string]$Executable,
    [string]$ExpectedSha256 = "",
    [string]$EvidenceRoot = "artifacts/m7-physical-session",
    [switch]$Launch
)

$ErrorActionPreference = "Stop"

$exe = (Resolve-Path $Executable).Path
$repoRoot = (Resolve-Path ".").Path
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$sessionDir = Join-Path $repoRoot (Join-Path $EvidenceRoot $stamp)
New-Item -ItemType Directory -Force -Path $sessionDir | Out-Null

$existing = @(Get-Process -Name "narro" -ErrorAction SilentlyContinue)
if ($existing.Count -gt 0) {
    $ids = ($existing | ForEach-Object { $_.Id }) -join ", "
    throw "Quit every existing Narro process before validation. Running PID(s): $ids"
}

$hash = (Get-FileHash -Algorithm SHA256 -Path $exe).Hash.ToLowerInvariant()
if (-not [string]::IsNullOrWhiteSpace($ExpectedSha256)) {
    $expected = $ExpectedSha256.Trim().ToLowerInvariant()
    if ($expected -notmatch '^[0-9a-f]{64}$') {
        throw "ExpectedSha256 must contain exactly 64 hexadecimal characters."
    }
    if ($hash -ne $expected) {
        throw "Executable SHA-256 mismatch. Expected $expected but found $hash."
    }
}

$roamingRoot = [Environment]::GetFolderPath([Environment+SpecialFolder]::ApplicationData)
if ([string]::IsNullOrWhiteSpace($roamingRoot)) {
    throw "Windows did not resolve the Roaming AppData directory."
}
$productionAppDataDir = Join-Path $roamingRoot "com.mariosg.Narro"
$backupDir = Join-Path $sessionDir "production-appdata-backup"
$backupFiles = @()

if (Test-Path $productionAppDataDir -PathType Container) {
    Copy-Item -LiteralPath $productionAppDataDir -Destination $backupDir -Recurse -Force
    $backupFiles = @(
        Get-ChildItem -LiteralPath $productionAppDataDir -File -Recurse -Force |
            Sort-Object FullName |
            ForEach-Object {
                $relative = $_.FullName.Substring($productionAppDataDir.Length).TrimStart([char[]]"\\/")
                [ordered]@{
                    relativePath = $relative
                    length = $_.Length
                    sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash.ToLowerInvariant()
                }
            }
    )
}

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
    expectedSha256 = if ([string]::IsNullOrWhiteSpace($ExpectedSha256)) { $null } else { $ExpectedSha256.Trim().ToLowerInvariant() }
    windows = [ordered]@{
        caption = $os.Caption
        version = $os.Version
        buildNumber = $os.BuildNumber
    }
    monitors = $monitors
    productionData = [ordered]@{
        identifier = "com.mariosg.Narro"
        appDataDir = $productionAppDataDir
        existedBeforeSession = (Test-Path $productionAppDataDir -PathType Container)
        backupDirectory = if (Test-Path $backupDir -PathType Container) { $backupDir } else { $null }
        fileCount = $backupFiles.Count
        files = $backupFiles
    }
    note = "Production Roaming AppData was snapshotted while Narro was not running. Keep this backup until the physical session is accepted. Do not restore it over a running Narro process."
}
$manifest | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 (Join-Path $sessionDir "environment.json")

$backupStatus = if (Test-Path $backupDir -PathType Container) {
    "Created production AppData safety backup: $backupDir ($($backupFiles.Count) file(s))."
} else {
    "No pre-existing production AppData directory was present; no data backup was needed."
}

$checklist = @"
# M7 final physical closure session

Executable SHA-256: $hash
Evidence directory: $sessionDir
Production AppData: $productionAppDataDir
$backupStatus

This session covers ONLY the remaining C5 saved-placement observation.
Do not repeat already accepted M7 compositor, shortcut, DPI, topology-removal,
topmost, Blitz-now or continuity tests.

## C5 — saved Timer placement across normal restart

- [ ] Start/keep one real active task and show compact Floating Timer.
- [ ] Drag Timer to an obvious safe non-default position.
- [ ] Wait until the drag is visually settled.
- [ ] Quit Narro normally through tray **Quit Narro**.
- [ ] Relaunch this exact executable.
- [ ] Reopen/show Timer for the recovered/live task as applicable.
- [ ] PASS only if Timer returns to a safe visible saved placement and is not stranded/off-screen.
- [ ] Record one continuous video and the approximate restart/restore timestamp.

If anything unexpected modifies or damages production data:
1. quit Narro completely;
2. preserve the failed-session evidence;
3. restore the snapshotted production AppData only while Narro is stopped.

Do not restore the backup merely because the placement test passes; normal test-created
state may be intentionally retained.
"@
$checklist | Set-Content -Encoding UTF8 (Join-Path $sessionDir "checklist.md")

Write-Host "Prepared M7 final physical evidence session:"
Write-Host "  $sessionDir"
Write-Host "Executable SHA-256: $hash"
Write-Host $backupStatus

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
