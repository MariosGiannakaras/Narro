param(
    [string]$OutputDirectory = "artifacts/visual-regression"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$repoRoot = Split-Path -Parent $PSScriptRoot
$outputPath = Join-Path $repoRoot $OutputDirectory
$port = 4175
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
        } catch {
            Start-Sleep -Milliseconds 250
        }
    }
    throw "Vite preview did not become reachable at $Url."
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

    Wait-ForPreview "$baseUrl/floating-timer-fixture.html?theme=dark"

    foreach ($theme in @("light", "dark")) {
        foreach ($state in @("collapsed", "expanded")) {
            $tempRoot = if ($env:RUNNER_TEMP) { $env:RUNNER_TEMP } else { [System.IO.Path]::GetTempPath() }
            $captureId = [guid]::NewGuid().ToString('N')
            $label = if ($state -eq "collapsed") { "floating-timer-$theme" } else { "floating-timer-expanded-$theme" }
            $windowHeight = if ($state -eq "expanded") { 380 } else { 240 }
            $profile = Join-Path $tempRoot "narro-$label-$captureId"
            $stdout = Join-Path $tempRoot "narro-$label-$captureId.stdout.txt"
            $stderr = Join-Path $tempRoot "narro-$label-$captureId.stderr.txt"
            $screenshot = Join-Path $outputPath "$label.png"
            $dom = Join-Path $outputPath "$label.html"
            $url = "$baseUrl/floating-timer-fixture.html?theme=$theme&state=$state"
            New-Item -ItemType Directory -Path $profile -Force | Out-Null

            try {
                $process = Start-Process -FilePath $edge -ArgumentList @(
                    "--headless=new",
                    "--disable-gpu",
                    "--disable-background-networking",
                    "--hide-scrollbars",
                    "--no-first-run",
                    "--force-device-scale-factor=1",
                    "--window-size=420,$windowHeight",
                    "--user-data-dir=`"$profile`"",
                    "--screenshot=`"$screenshot`"",
                    "--dump-dom",
                    "`"$url`""
                ) -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru -Wait

                $stderrText = if (Test-Path $stderr) { [System.IO.File]::ReadAllText($stderr) } else { "" }
                if ($process.ExitCode -ne 0) { throw "Floating Timer Edge capture failed for $state/$theme. $stderrText" }
                if (-not (Test-Path $screenshot)) { throw "Floating Timer screenshot missing for $state/$theme. $stderrText" }
                $domText = if (Test-Path $stdout) { [System.IO.File]::ReadAllText($stdout) } else { "" }
                if ([string]::IsNullOrWhiteSpace($domText)) { throw "Floating Timer DOM capture missing for $state/$theme. $stderrText" }
                [System.IO.File]::WriteAllText($dom, $domText, [System.Text.UTF8Encoding]::new($false))
            } finally {
                Remove-Item -LiteralPath $profile -Recurse -Force -ErrorAction SilentlyContinue
                Remove-Item -LiteralPath $stdout -Force -ErrorAction SilentlyContinue
                Remove-Item -LiteralPath $stderr -Force -ErrorAction SilentlyContinue
            }
        }
    }

    foreach ($lifecycleState in @("cycle", "idle-recovery")) {
    $tempRoot = if ($env:RUNNER_TEMP) { $env:RUNNER_TEMP } else { [System.IO.Path]::GetTempPath() }
    $captureId = [guid]::NewGuid().ToString('N')
    $profile = Join-Path $tempRoot "narro-floating-$lifecycleState-$captureId"
    $stdout = Join-Path $tempRoot "narro-floating-$lifecycleState-$captureId.stdout.txt"
    $stderr = Join-Path $tempRoot "narro-floating-$lifecycleState-$captureId.stderr.txt"
    $dom = Join-Path $outputPath "floating-timer-$lifecycleState.html"
    New-Item -ItemType Directory -Path $profile -Force | Out-Null

    try {
        $process = Start-Process -FilePath $edge -ArgumentList @(
            "--headless=new",
            "--disable-gpu",
            "--disable-background-networking",
            "--no-first-run",
            "--force-device-scale-factor=1",
            "--window-size=420,380",
            "--virtual-time-budget=3000",
            "--user-data-dir=`"$profile`"",
            "--dump-dom",
            "`"$baseUrl/floating-timer-fixture.html?theme=light&state=$lifecycleState`""
        ) -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru -Wait

        $stderrText = if (Test-Path -LiteralPath $stderr) { [System.IO.File]::ReadAllText($stderr) } else { "" }
        if ($process.ExitCode -ne 0) { throw "Floating Timer $lifecycleState capture failed. $stderrText" }
        $domText = if (Test-Path -LiteralPath $stdout) { [System.IO.File]::ReadAllText($stdout) } else { "" }
        $readyAttribute = if ($lifecycleState -eq "cycle") { 'data-floating-timer-cycle-ready="true"' } else { 'data-floating-timer-idle-recovery-ready="true"' }
        if (-not $domText.Contains($readyAttribute)) {
            throw "Floating Timer $lifecycleState capture did not finish. $stderrText"
        }
        [System.IO.File]::WriteAllText($dom, $domText, [System.Text.UTF8Encoding]::new($false))
    } finally {
        $tempRootFull = [System.IO.Path]::GetFullPath($tempRoot).TrimEnd('\') + '\'
        $profileFull = [System.IO.Path]::GetFullPath($profile)
        if (-not $profileFull.StartsWith($tempRootFull, [StringComparison]::OrdinalIgnoreCase)) {
            throw "Floating Timer lifecycle profile escaped the temporary directory"
        }
        Remove-Item -LiteralPath $profileFull -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -LiteralPath $stdout -Force -ErrorAction SilentlyContinue
        Remove-Item -LiteralPath $stderr -Force -ErrorAction SilentlyContinue
    }
    }
} finally {
    if ($preview -and -not $preview.HasExited) {
        & taskkill.exe /PID $preview.Id /T /F 2>$null | Out-Null
    }
    if ($locationPushed) { Pop-Location }
}

Write-Host "Floating Timer visual fixture captures written to $outputPath"
