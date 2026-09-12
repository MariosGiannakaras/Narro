param(
    [string]$OutputDirectory = "artifacts/visual-regression"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
$outputPath = Join-Path $repoRoot $OutputDirectory
$port = 4173
$baseUrl = "http://127.0.0.1:$port"

function Resolve-EdgePath {
    $candidates = @(
        "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
        "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
    )
    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path $candidate)) { return $candidate }
    }
    throw "Microsoft Edge executable was not found in the standard Windows installation paths."
}

function Wait-ForPreview {
    param([string]$Url)
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
            if ($response.StatusCode -eq 200) { return }
        } catch {
            Start-Sleep -Milliseconds 250
        }
    }
    throw "Vite preview did not become reachable at $Url."
}

function Capture-ArchiveState {
    param(
        [string]$EdgePath,
        [string]$Label,
        [string]$Url,
        [string]$ScreenshotPath,
        [string]$DomPath
    )

    $tempRoot = if ($env:RUNNER_TEMP) { $env:RUNNER_TEMP } else { [System.IO.Path]::GetTempPath() }
    $captureId = [guid]::NewGuid().ToString('N')
    $profilePath = Join-Path $tempRoot "narro-archive-$captureId"
    $stdoutPath = Join-Path $tempRoot "narro-archive-$captureId.stdout.txt"
    $stderrPath = Join-Path $tempRoot "narro-archive-$captureId.stderr.txt"
    New-Item -ItemType Directory -Path $profilePath -Force | Out-Null

    try {
        $process = Start-Process `
            -FilePath $EdgePath `
            -ArgumentList @(
                "--headless=new",
                "--disable-gpu",
                "--disable-background-networking",
                "--hide-scrollbars",
                "--no-first-run",
                "--force-device-scale-factor=1",
                "--window-size=1280,720",
                "--virtual-time-budget=900",
                "--user-data-dir=$profilePath",
                "--screenshot=$ScreenshotPath",
                "--dump-dom",
                $Url
            ) `
            -RedirectStandardOutput $stdoutPath `
            -RedirectStandardError $stderrPath `
            -PassThru `
            -Wait

        $stderrText = if (Test-Path $stderrPath) { [System.IO.File]::ReadAllText($stderrPath) } else { "" }
        if ($process.ExitCode -ne 0) {
            throw "Edge archive capture failed for '$Label' with exit code $($process.ExitCode). $stderrText"
        }
        if (-not (Test-Path $ScreenshotPath)) {
            throw "Edge did not create archive screenshot '$Label'. $stderrText"
        }
        $domText = if (Test-Path $stdoutPath) { [System.IO.File]::ReadAllText($stdoutPath) } else { "" }
        if ([string]::IsNullOrWhiteSpace($domText)) {
            throw "Edge did not return archive DOM for '$Label'. $stderrText"
        }
        [System.IO.File]::WriteAllText($DomPath, $domText, [System.Text.UTF8Encoding]::new($false))
    } finally {
        Remove-Item -LiteralPath $profilePath -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -LiteralPath $stdoutPath -Force -ErrorAction SilentlyContinue
        Remove-Item -LiteralPath $stderrPath -Force -ErrorAction SilentlyContinue
    }
}

New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
$edge = Resolve-EdgePath
$preview = $null
$locationPushed = $false

try {
    Push-Location $repoRoot
    $locationPushed = $true
    $preview = Start-Process -FilePath "npm.cmd" -ArgumentList @(
        "run", "preview", "--", "--host", "127.0.0.1", "--port", "$port", "--strictPort"
    ) -PassThru -WindowStyle Hidden

    Wait-ForPreview -Url "$baseUrl/archive-fixture.html?theme=light&mode=lists-empty"

    foreach ($theme in @("light", "dark")) {
        foreach ($archiveMode in @("lists-empty", "done-empty", "done-filter", "done-results")) {
            $label = "archive-$archiveMode-$theme"
            $url = "$baseUrl/archive-fixture.html?theme=$theme&mode=$archiveMode"
            Capture-ArchiveState `
                -EdgePath $edge `
                -Label $label `
                -Url $url `
                -ScreenshotPath (Join-Path $outputPath "$label.png") `
                -DomPath (Join-Path $outputPath "$label.html")
        }
    }
} finally {
    if ($preview -and -not $preview.HasExited) {
        & taskkill.exe /PID $preview.Id /T /F 2>$null | Out-Null
    }
    if ($locationPushed) { Pop-Location }
}

Write-Host "Archive fixture captures written to $outputPath"
