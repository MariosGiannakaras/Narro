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

        & $edge --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1280,720 --screenshot="$screenshot" $url | Out-Null
        if ($LASTEXITCODE -ne 0 -or -not (Test-Path $screenshot)) {
            throw "Edge screenshot capture failed for theme '$theme'."
        }

        $dump = & $edge --headless=new --disable-gpu --force-device-scale-factor=1 --window-size=1280,720 --dump-dom $url
        if ($LASTEXITCODE -ne 0) {
            throw "Edge DOM capture failed for theme '$theme'."
        }
        $dump | Set-Content -Path $dom -Encoding utf8
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
