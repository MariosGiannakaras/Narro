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
# Narro consolidated Windows physical acceptance — PA-01–PA-08

Executable SHA-256: $hash
Evidence directory: $sessionDir
Narro test data: normal Windows profile; no backup, alternate profile or automatic reset.

STATUS: PA-01–PA-09 ACTIVE by the newer user decision on 2026-10-27; individual cases remain OPEN/NOT RUN until evidenced.
ChatGPT owns static source-vs-Narro screenshot/icon/layout checks and all implementation. Codex
owns only actual native Windows interactions, continuous motion/video, OS state and packaging
acceptance after ChatGPT's corrected candidate passes exact source Windows CI. This script
prepares a case manifest; actual app launch is still opt-in (-Launch).
Use -ExpectedSha256 to verify the exact CI candidate (merged or unmerged) before any physical session.
The user explicitly authorized using the normal Windows profile and treating Narro app data as test data.
No separate profile, temporary DB, automatic backups or test-data protection workflow is required.
A clean-state test may reset only Narro app data while Narro is stopped; preserve it for persistence/restart tests.
Never modify unrelated personal files, OS settings or hardware outside the separately approved test scope.
Record monitor identity, DPI, Windows build, theme and motion.
For PA-01 and PA-02 native transitions, timer expiry/action timing and other motion,
Codex captures continuous time-stamped video with aligned HWND/UIA, screenshots and logs.
For static icons, colors, card geometry, single-frame state and source screenshot parity,
ChatGPT compares existing exact-build Windows screenshots; DO NOT demand video solely
for a static claim. Mark unavoidable restart/installer segment boundaries.
PASS requires direct evidence from this exact binary; CI/fixtures are not a physical PASS.

## PA-01 — continuous Focus Panel and Floating Timer host identity (C4)
- [ ] Capture Panel -> compact Timer -> expanded Timer -> Panel with the same HWND/WebView.
- [ ] Check no blank/stale/clipped frames, proper focus and normal/reduced motion.

## PA-02 — initial Board to Focus transition (M6)
- [ ] Capture first Board-to-Focus morph, timing, main geometry restoration, stable task/session owner.

## PA-03 — real timer expiry and Time's Up (F35)
- [ ] Observe real expiry at compact 340x110 and expanded 340x300.
- [ ] Verify zero clock, visible unclipped Time's Up and contextual Extend; no synthetic fixture shortcut.

## PA-04 — pending Reports Add Session and Escape (F29)
- [ ] Capture foreground/UIA focus, trigger a delayed real mutation and press Escape while pending.
- [ ] Verify retained modal owner, no duplicate insertion and focus restored after resolution.

## PA-05 — named secondary monitor / DPI (F27)
- [ ] Select a nonprimary monitor at 125%, change that same screen to 100% without app restart.
- [ ] Check no offscreen/wrong-display placement, stale device handling and saved Timer position.
- [ ] If physical hardware is unavailable, record NOT RUN rather than PASS.

## PA-06 — real OS notifications and audible sound (M8)
- [ ] Observe Windows toast, WebView2/local sound, volume/mute, foreground/background.
- [ ] Test notifications-disabled behavior and safe listener recovery where feasible.

## PA-07 — normal quit/restart, persistence and Timer position
- [ ] Quit via tray, relaunch this exact executable, verify timer/session/data recovery.
- [ ] Confirm Timer restores to a safe visible placement with persisted Narro test data.

## PA-08 — genuine NSIS/MSI installation
- [ ] When the milestone requires it, smoke-test the real installers with Narro test data; follow separate OS/install safeguards.
- [ ] Verify installer/release identity and safe launch/uninstall behavior; otherwise NOT RUN.

## PA-09 — separate existing-evidence Blitzit comparison, NOT a PA-01–PA-08 PASS
- [ ] ChatGPT compares static screenshot/icon/color/layout states directly against matching
      original retained Blitzit evidence with exact build and frame identity.
- [ ] Codex later validates source motion/animations only when continuous native video is needed.
- [ ] Preserve SOURCE_PARITY_OPEN for unobserved or version-dependent details.
- [ ] Optional live Blitzit M11 remains inactive without separate explicit authorization.

## Results and safeguards
- [ ] For each PA record PASS/FAIL/INCONCLUSIVE/NOT RUN with timestamps and evidence links.
- [ ] For clean-state tests, reset only Narro test data while the app is stopped; for persistence tests retain it across restart.
- [ ] Never infer physical PASS from a successful build or visual fixture.
- [ ] Do not reset any data or mark a case PASS merely because the test passed CI.
- [ ] Follow docs/CODEX_M5_M9_RECORDING_PACKET_2026-10-27.md for the current
      exact-head native candidate and case scope; older checklists are historical.
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
