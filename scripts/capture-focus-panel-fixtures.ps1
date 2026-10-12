param(
    [string]$OutputDirectory = "artifacts/visual-regression",
    [switch]$ReducedMotion
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$repoRoot = Split-Path -Parent $PSScriptRoot
$outputPath = Join-Path $repoRoot $OutputDirectory
$port = 4174
$baseUrl = "http://127.0.0.1:$port"

function Resolve-EdgePath {
    foreach ($candidate in @(
        "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
        "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
    )) {
        if ($candidate -and (Test-Path $candidate)) { return $candidate }
    }
    throw "Microsoft Edge executable was not found."
}

function Wait-ForPreview([string]$Url) {
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
            if ($response.StatusCode -eq 200) { return }
        } catch { Start-Sleep -Milliseconds 250 }
    }
    throw "Vite preview did not become reachable at $Url."
}

New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
$edge = Resolve-EdgePath
$preview = $null
$locationPushed = $false
$scenarios = @(
    @{ Name = "running"; Suffix = ""; Query = ""; VirtualTimeBudgetMs = 0 },
    @{ Name = "selector-open"; Suffix = "-selector-open"; Query = "&scenario=selector-open"; VirtualTimeBudgetMs = 800 },
    @{ Name = "paused-metrics"; Suffix = "-paused-metrics"; Query = "&scenario=paused-metrics"; VirtualTimeBudgetMs = 0 },
    @{ Name = "break"; Suffix = "-break"; Query = "&scenario=break"; VirtualTimeBudgetMs = 0 },
    @{ Name = "time-up"; Suffix = "-time-up"; Query = "&scenario=time-up"; VirtualTimeBudgetMs = 0 },
    @{ Name = "overtime"; Suffix = "-overtime"; Query = "&scenario=overtime"; VirtualTimeBudgetMs = 0 },
    @{ Name = "notes-expanded"; Suffix = "-notes-expanded"; Query = "&scenario=notes-expanded"; VirtualTimeBudgetMs = 500 },
    @{ Name = "live-actions-focus"; Suffix = "-live-actions-focus"; Query = "&scenario=live-actions-focus"; VirtualTimeBudgetMs = 2500 },
    @{ Name = "success"; Suffix = "-success"; Query = "&scenario=success"; VirtualTimeBudgetMs = 0 },
    @{ Name = "no-eligible"; Suffix = "-no-eligible"; Query = "&scenario=no-eligible"; VirtualTimeBudgetMs = 0 },
    @{ Name = "empty"; Suffix = "-empty"; Query = "&scenario=empty"; VirtualTimeBudgetMs = 0 }
)

try {
    Push-Location $repoRoot
    $locationPushed = $true
    $preview = Start-Process -FilePath "npm.cmd" -ArgumentList @(
        "run", "preview", "--", "--host", "127.0.0.1", "--port", "$port", "--strictPort"
    ) -PassThru -WindowStyle Hidden

    Wait-ForPreview "$baseUrl/focus-panel-fixture.html?theme=dark"

    foreach ($theme in @("light", "dark")) {
        foreach ($scenario in $scenarios) {
            $tempRoot = if ($env:RUNNER_TEMP) { $env:RUNNER_TEMP } else { [System.IO.Path]::GetTempPath() }
            $captureId = [guid]::NewGuid().ToString('N')
            $profile = Join-Path $tempRoot "narro-focus-panel-$theme-$($scenario.Name)-$captureId"
            $stdout = Join-Path $tempRoot "narro-focus-panel-$theme-$($scenario.Name)-$captureId.stdout.txt"
            $stderr = Join-Path $tempRoot "narro-focus-panel-$theme-$($scenario.Name)-$captureId.stderr.txt"
            $screenshot = Join-Path $outputPath "focus-panel$($scenario.Suffix)-$theme.png"
            $dom = Join-Path $outputPath "focus-panel$($scenario.Suffix)-$theme.html"
            $url = "$baseUrl/focus-panel-fixture.html?theme=$theme$($scenario.Query)"
            New-Item -ItemType Directory -Path $profile -Force | Out-Null

            try {
                # B49 must compare painted baseline versus keyboard focus at
                # the SAME actual 420x720 CDP viewport. Legacy --window-size
                # yields a 492x628 inner viewport on Windows Edge even though
                # its screenshot is 420x720. Keep every other scenario unchanged.
                if ($scenario.Name -eq "running" -or $scenario.Name -eq "live-actions-focus") {
                    $reducedValue = if ($ReducedMotion) { "true" } else { "false" }
                    $mode = if ($scenario.Name -eq "running") { "running" } else { "focused" }
                    & node "scripts/capture-focus-action-cdp.mjs" "--edge=$edge" "--url=$url" "--profile=$profile" "--png=$screenshot" "--html=$dom" "--reducedMotion=$reducedValue" "--mode=$mode"
                    if ($LASTEXITCODE -ne 0) {
                        throw "B49 same-viewport Edge CDP capture failed for $theme/$($scenario.Name), exit code $LASTEXITCODE"
                    }
                    continue
                }
                $edgeArguments = @(
                    "--headless=new",
                    "--disable-gpu",
                    "--disable-background-networking",
                    "--hide-scrollbars",
                    "--no-first-run",
                    "--force-device-scale-factor=1",
                    "--window-size=420,720",
                    "--user-data-dir=$profile",
                    "--screenshot=$screenshot",
                    "--dump-dom",
                    $url
                )
                $edgeArguments = @($(if ($ReducedMotion) { "--force-prefers-reduced-motion" } else { "--force-prefers-no-reduced-motion" })) + $edgeArguments
                $edgeArguments = @("--virtual-time-budget=$([Math]::Max(800, [int]$scenario.VirtualTimeBudgetMs))") + $edgeArguments

                # CI 38222942950 captured an empty React root and a 2353-byte PNG.
                # Retain all 420x720 visual assertions; retry only objectively
                # unfinished browser bootstrap/paint, never a rendered product error.
                $maxAttempts = 5
                for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
                    Remove-Item -LiteralPath $screenshot -Force -ErrorAction SilentlyContinue
                    Remove-Item -LiteralPath $dom -Force -ErrorAction SilentlyContinue
                    Remove-Item -LiteralPath $stdout -Force -ErrorAction SilentlyContinue
                    Remove-Item -LiteralPath $stderr -Force -ErrorAction SilentlyContinue
                    $process = Start-Process -FilePath $edge -ArgumentList $edgeArguments -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru -Wait -WindowStyle Hidden
                    $stderrText = if (Test-Path $stderr) { [System.IO.File]::ReadAllText($stderr) } else { "" }
                    if ($process.ExitCode -ne 0) {
                        throw "Focus Panel Edge capture failed for $theme/$($scenario.Name) on attempt $attempt. $stderrText"
                    }
                    $domText = if (Test-Path $stdout) { [System.IO.File]::ReadAllText($stdout) } else { "" }
                    [System.IO.File]::WriteAllText($dom, $domText, [System.Text.UTF8Encoding]::new($false))
                    & node "scripts/focus-panel-capture-readiness.mjs" $dom $screenshot $theme $scenario.Name
                    $gateStatus = $LASTEXITCODE
                    if ($gateStatus -eq 0) { break }
                    if ($gateStatus -ne 75) {
                        throw "Focus Panel $theme/$($scenario.Name) has an actual invalid/error-state capture; no retry. $stderrText"
                    }
                    if ($attempt -eq $maxAttempts) {
                        throw "Focus Panel $theme/$($scenario.Name) did not render/paint a ready fixture after $maxAttempts bounded attempts. The last DOM and PNG remain in artifacts for diagnosis. $stderrText"
                    }
                    Write-Warning "Focus Panel $theme/$($scenario.Name) not rendered/painted on attempt $attempt/$maxAttempts; retrying bounded capture."
                    Start-Sleep -Milliseconds (250 * $attempt)
                }
            } finally {
                Remove-Item -LiteralPath $profile -Recurse -Force -ErrorAction SilentlyContinue
                Remove-Item -LiteralPath $stdout -Force -ErrorAction SilentlyContinue
                Remove-Item -LiteralPath $stderr -Force -ErrorAction SilentlyContinue
            }
        }
    }
} finally {
    if ($preview -and -not $preview.HasExited) { & taskkill.exe /PID $preview.Id /T /F 2>$null | Out-Null }
    if ($locationPushed) { Pop-Location }
}

Write-Host "Focus Panel visual fixture captures written to $outputPath"
