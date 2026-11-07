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
if ($Launch -and [string]::IsNullOrWhiteSpace($ExpectedSha256)) {
    throw "Launching a physical candidate requires -ExpectedSha256 from its exact verified CI artifact."
}
if (-not [string]::IsNullOrWhiteSpace($ExpectedSha256)) {
    $expected = $ExpectedSha256.Trim().ToLowerInvariant()
    if ($expected -notmatch '^[0-9a-f]{64}$') {
        throw "ExpectedSha256 must contain exactly 64 hexadecimal characters."
    }
    if ($hash -ne $expected) {
        throw "Executable SHA-256 mismatch. Expected $expected but found $hash."
    }
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
    dataPolicy = "User-authorized disposable Narro test data in the normal Windows profile; no automatic backup or reset"

}
$manifest | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 (Join-Path $sessionDir "environment.json")

$checklist = @"
# Fresh Narro Windows physical session - PA-01..PA-09

Executable SHA-256: $hash
Evidence directory: $sessionDir
Narro test data: normal Windows profile; no backup, alternate profile or automatic reset.

STATUS: PA-01..PA-09 ACTIVE; every new case starts NOT RUN.
Current controller: docs/PHYSICAL_ACCEPTANCE_NEW_RECORDING_BASELINE_2026-11-06.md
Read current main HANDOFF and admit the exact source/CI/artifact before execution.
This helper records environment and optional launch identity; it is NOT the full source admission.
Copy source SHA, CI run/attempt, artifact ID/ZIP digest and EXE path/hash into this session's admission record.
Recheck that the selected live PR head matches its verified manifest before launching.
Use -ExpectedSha256 from the admitted artifact, never filename/version or merely the latest main build.
App launch is opt-in (-Launch); generating this checklist is not physical PASS.

The ordinary Windows account and normal Narro data paths are disposable Narro test data.
Reset only Narro data with Narro stopped if a case needs clean state; retain it for restart/persistence cases.
Do not change unrelated files, global OS settings, hardware or installers outside the actual case authority.
Physical agents acquire and report native evidence; application fixes remain with the assigned source owner
unless the latest user instruction explicitly reassigns source work.

## Candidate and tool admission
- [ ] Exact selected source/CI/artifact/EXE SHA recorded and live head/hash rechecked.
- [ ] Real process/recorder/partial-session state checked; no duplicate active capture or wrong executable.
- [ ] Capture/input health, actual monitor/work-area/DPI, theme and renderer normal/reduced motion recorded.
- [ ] Fresh ignored session root and compatible case batch prepared using ordinary Narro UI/test data.

## Fresh case matrix - use the canonical protocol for complete assertions
- [ ] PA-01: Panel/compact/expanded/return, same HWND/task, normal/reduced at available 100%/125%, continuous first/settled frames.
- [ ] PA-02: real Main-to-Focus entry, geometry, committed identity and actually exercised retry/error path.
- [ ] PA-03: real expiry/Time's Up/Extend/Pause/Break transitions; do not substitute a synthetic fixture.
- [ ] PA-04: PP44-F01 Taken/history edit/delete zero/nonnegative persistence; Settings/Reports/dialog/notes/focus.
- [ ] PA-05: measured nonzero HWND displacement from real drag, differing positions, SNAP, monitor naming/fallback/reconnect; unavailable hardware NOT RUN.
- [ ] PA-06: real notifications and audible sound/volume/mute/foreground/background observations.
- [ ] PA-07: actual tray Quit/process exit and same-EXE restart; OFF/ON placement and task/session recovery.
- [ ] PA-08: exact installer identity and only actually scheduled/authorized MSI/NSIS native installation cases.
- [ ] PA-09: NEW Narro screenshots/continuous intervals versus authentic original Blitzit sources only.
- [ ] A/PR389 and B/PR419: independent eight-case compositor suites on their own exact binaries; never score from PR437.

## Evidence, analysis and checkpoint
- [ ] Continuous original video/actual PTS for motion; fresh exact-build screenshots are sufficient only for static claims.
- [ ] HWND/UIA/log/chronology receipts corroborate actual actions; zero drag displacement is not movement coverage.
- [ ] Quiet performance measurements use their separate non-recording protocol.
- [ ] Record independent PASS/FAIL/INCONCLUSIVE/NOT RUN per requirement, source, environment and exercised state.
- [ ] Freeze useful segments, analyze the full relevant intervals and hand confirmed failures to the source owner.
- [ ] Publish a safe-boundary HANDOFF checkpoint; do not interrupt useful capture for Git updates.
- [ ] Keep generated raw evidence outside tracked Git; keep all original Blitzit media untouched.
- [ ] Retired Narro films, old USER-PAUSED/profile requirements and dated packet candidates are historical.
- [ ] Strict per-PR native holds remain; preparation/CI does not close them or activate M10/M11/M12.
"@
$checklist | Set-Content -Encoding UTF8 (Join-Path $sessionDir "checklist.md")

Write-Host "Prepared M7 final physical evidence session:"
Write-Host "  $sessionDir"
Write-Host "Executable SHA-256: $hash"

if ($Launch) {
    $process = Start-Process -FilePath $exe -WorkingDirectory (Split-Path $exe) -PassThru
    Start-Sleep -Seconds 2
    $running = @(Get-Process -Name "narro" -ErrorAction SilentlyContinue)
    if ($running.Count -ne 1 -or $running[0].Id -ne $process.Id) {
        throw "Narro launch identity mismatch: started PID $($process.Id), observed $($running.Count) Narro process(es). Do not score native acceptance."
    }
    $actual = (Get-Process -Id $process.Id -ErrorAction Stop).Path
    if ([string]::IsNullOrWhiteSpace($actual) -or
        -not [string]::Equals([IO.Path]::GetFullPath($actual), [IO.Path]::GetFullPath($exe), [StringComparison]::OrdinalIgnoreCase)) {
        throw "Running Narro executable path does not match the verified candidate. Do not score native acceptance."
    }
    $runningHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $actual).Hash.ToLowerInvariant()
    if ($runningHash -ne $hash) {
        throw "Running Narro executable hash does not match verified candidate. Do not score native acceptance."
    }
    Write-Host "Verified running Narro PID $($process.Id) at $actual, SHA-256: $runningHash"
    Write-Host "Begin recording and follow checklist.md."
}
