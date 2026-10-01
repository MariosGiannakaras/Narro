param(
    [Parameter(Mandatory = $true)]
    [string]$Executable
)

$ErrorActionPreference = "Stop"

$exe = (Resolve-Path $Executable).Path
$root = Join-Path (Get-Location) "artifacts/physical-validation-smoke"
$roaming = Join-Path $root "Roaming"
$local = Join-Path $root "Local"

if (Test-Path $root) {
    Remove-Item $root -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $roaming, $local | Out-Null

$oldAppData = $env:APPDATA
$oldLocalAppData = $env:LOCALAPPDATA
$oldCapture = $env:NARRO_FOCUS_CAPTURE_DIR
$process = $null

try {
    $env:APPDATA = $roaming
    $env:LOCALAPPDATA = $local
    Remove-Item Env:NARRO_FOCUS_CAPTURE_DIR -ErrorAction SilentlyContinue

    $process = Start-Process -FilePath $exe -WorkingDirectory (Split-Path $exe) -PassThru

    $deadline = [DateTime]::UtcNow.AddSeconds(15)
    $database = $null
    while ([DateTime]::UtcNow -lt $deadline) {
        if ($process.HasExited) {
            throw "Physical validation build exited before creating its isolated profile. Exit code: $($process.ExitCode)"
        }
        $database = Get-ChildItem -Path $root -Filter "narro.db" -File -Recurse -ErrorAction SilentlyContinue |
            Select-Object -First 1
        if ($database) {
            break
        }
        Start-Sleep -Milliseconds 200
    }

    if (-not $database) {
        throw "Physical validation build did not create narro.db in the isolated APPDATA/LOCALAPPDATA profile."
    }

    # Give any accidentally activated renderer fixture enough time to persist its
    # list/task before inspecting the SQLite bytes.
    Start-Sleep -Seconds 2

    $databaseBytes = [System.IO.File]::ReadAllBytes($database.FullName)
    $databaseText = [System.Text.Encoding]::UTF8.GetString($databaseBytes)
    foreach ($forbidden in @("CI Focus Runtime", "Packaged runtime focus task")) {
        if ($databaseText.Contains($forbidden)) {
            throw "Physical validation build activated CI fixture data: '$forbidden'."
        }
    }

    Write-Host "Physical validation build profile is clean: $($database.FullName)"
}
finally {
    if ($process -and -not $process.HasExited) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        try { $process.WaitForExit(5000) | Out-Null } catch {}
    }

    if ($null -eq $oldAppData) { Remove-Item Env:APPDATA -ErrorAction SilentlyContinue }
    else { $env:APPDATA = $oldAppData }

    if ($null -eq $oldLocalAppData) { Remove-Item Env:LOCALAPPDATA -ErrorAction SilentlyContinue }
    else { $env:LOCALAPPDATA = $oldLocalAppData }

    if ($null -eq $oldCapture) { Remove-Item Env:NARRO_FOCUS_CAPTURE_DIR -ErrorAction SilentlyContinue }
    else { $env:NARRO_FOCUS_CAPTURE_DIR = $oldCapture }
}
