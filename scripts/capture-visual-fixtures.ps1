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
        if ($candidate -and (Test-Path $candidate)) {
            return $candidate
        }
    }

    throw "Microsoft Edge executable was not found in the standard Windows installation paths."
}

function Wait-ForPreview {
    param([string]$Url)

    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                return
            }
        } catch {
            Start-Sleep -Milliseconds 250
        }
    }

    throw "Vite preview did not become reachable at $Url."
}

function Capture-Theme {
    param(
        [string]$EdgePath,
        [string]$Theme,
        [string]$Url,
        [string]$ScreenshotPath,
        [string]$DomPath
    )

    $tempRoot = if ($env:RUNNER_TEMP) { $env:RUNNER_TEMP } else { [System.IO.Path]::GetTempPath() }
    $captureId = [guid]::NewGuid().ToString('N')
    $profilePath = Join-Path $tempRoot "narro-edge-$Theme-$captureId"
    $stdoutPath = Join-Path $tempRoot "narro-edge-$Theme-$captureId.stdout.txt"
    $stderrPath = Join-Path $tempRoot "narro-edge-$Theme-$captureId.stderr.txt"
    New-Item -ItemType Directory -Path $profilePath -Force | Out-Null

    try {
        $arguments = @(
            "--headless=new",
            "--disable-gpu",
            "--disable-background-networking",
            "--hide-scrollbars",
            "--no-first-run",
            "--force-device-scale-factor=1",
            "--window-size=1280,720",
            "--user-data-dir=$profilePath",
            "--screenshot=$ScreenshotPath",
            "--dump-dom",
            $Url
        )

        $edgeProcess = Start-Process `
            -FilePath $EdgePath `
            -ArgumentList $arguments `
            -RedirectStandardOutput $stdoutPath `
            -RedirectStandardError $stderrPath `
            -PassThru `
            -Wait

        $stderrText = if (Test-Path $stderrPath) {
            [System.IO.File]::ReadAllText($stderrPath)
        } else {
            ""
        }

        if ($edgeProcess.ExitCode -ne 0) {
            throw "Edge visual capture failed for theme '$Theme' with exit code $($edgeProcess.ExitCode). $stderrText"
        }
        if (-not (Test-Path $ScreenshotPath)) {
            throw "Edge did not create the screenshot for theme '$Theme'. $stderrText"
        }

        $domText = if (Test-Path $stdoutPath) {
            [System.IO.File]::ReadAllText($stdoutPath)
        } else {
            ""
        }
        if ([string]::IsNullOrWhiteSpace($domText)) {
            throw "Edge did not return captured DOM for theme '$Theme'. $stderrText"
        }

        [System.IO.File]::WriteAllText(
            $DomPath,
            $domText,
            [System.Text.UTF8Encoding]::new($false)
        )

        if (-not (Test-Path $DomPath) -or (Get-Item $DomPath).Length -eq 0) {
            throw "Captured DOM file is missing or empty for theme '$Theme'."
        }
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

    Wait-ForPreview -Url "$baseUrl/visual-fixtures.html?theme=light"

    foreach ($theme in @("light", "dark")) {
        $url = "$baseUrl/visual-fixtures.html?theme=$theme"
        $screenshot = Join-Path $outputPath "$theme.png"
        $dom = Join-Path $outputPath "$theme.html"
        Capture-Theme -EdgePath $edge -Theme $theme -Url $url -ScreenshotPath $screenshot -DomPath $dom

        $fixtures = @(
            "app-shell",
            "home",
            "list-card-states",
            "list-editor-create",
            "list-editor-edit",
            "list-board",
            "list-board-all",
            "task-card-states"
        )

        foreach ($fixture in $fixtures) {
            $fixtureUrl = "$baseUrl/visual-fixtures.html?theme=$theme&fixture=$fixture"
            $fixtureLabel = "$fixture-$theme"
            $fixtureScreenshot = Join-Path $outputPath "$fixtureLabel.png"
            $fixtureDom = Join-Path $outputPath "$fixtureLabel.html"
            Capture-Theme `
                -EdgePath $edge `
                -Theme $fixtureLabel `
                -Url $fixtureUrl `
                -ScreenshotPath $fixtureScreenshot `
                -DomPath $fixtureDom
        }

        $reorderLabel = "task-reorder-$theme"
        $reorderUrl = "$baseUrl/task-reorder-fixture.html?theme=$theme"
        $reorderScreenshot = Join-Path $outputPath "$reorderLabel.png"
        $reorderDom = Join-Path $outputPath "$reorderLabel.html"
        Capture-Theme `
            -EdgePath $edge `
            -Theme $reorderLabel `
            -Url $reorderUrl `
            -ScreenshotPath $reorderScreenshot `
            -DomPath $reorderDom

        $metricLabel = "task-metrics-$theme"
        $metricUrl = "$baseUrl/task-metric-fixture.html?theme=$theme"
        $metricScreenshot = Join-Path $outputPath "$metricLabel.png"
        $metricDom = Join-Path $outputPath "$metricLabel.html"
        Capture-Theme `
            -EdgePath $edge `
            -Theme $metricLabel `
            -Url $metricUrl `
            -ScreenshotPath $metricScreenshot `
            -DomPath $metricDom

        $scheduleLabel = "task-scheduling-$theme"
        $scheduleUrl = "$baseUrl/task-schedule-fixture.html?theme=$theme"
        $scheduleScreenshot = Join-Path $outputPath "$scheduleLabel.png"
        $scheduleDom = Join-Path $outputPath "$scheduleLabel.html"
        Capture-Theme `
            -EdgePath $edge `
            -Theme $scheduleLabel `
            -Url $scheduleUrl `
            -ScreenshotPath $scheduleScreenshot `
            -DomPath $scheduleDom
    }
} finally {
    if ($preview -and -not $preview.HasExited) {
        & taskkill.exe /PID $preview.Id /T /F 2>$null | Out-Null
    }
    if ($locationPushed) {
        Pop-Location
    }
}

Write-Host "Visual fixture captures written to $outputPath"
