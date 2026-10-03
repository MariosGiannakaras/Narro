param(
    [Parameter(Mandatory = $true)]
    [string]$Executable
)

$ErrorActionPreference = "Stop"

$exe = (Resolve-Path $Executable).Path
$root = Join-Path (Get-Location) "artifacts/physical-validation-smoke"
$captureDir = Join-Path $root "capture"

if (Test-Path $root) {
    Remove-Item $root -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $captureDir | Out-Null

$oldCapture = $env:NARRO_FOCUS_CAPTURE_DIR
$process = $null

try {
    # Deliberately enable the native capture checkpoint transport. A correct
    # production-config physical build still loads focus.html (no runtimeVisual
    # query), so the renderer driver must remain dormant and write no checkpoint.
    # An accidentally instrumented build will activate the visual driver and
    # expose itself by writing checkpoint-*.json into this directory.
    $env:NARRO_FOCUS_CAPTURE_DIR = $captureDir

    $process = Start-Process -FilePath $exe -WorkingDirectory (Split-Path $exe) -PassThru

    $deadline = [DateTime]::UtcNow.AddSeconds(8)
    while ([DateTime]::UtcNow -lt $deadline) {
        if ($process.HasExited) {
            throw "Physical validation build exited during production-config smoke. Exit code: $($process.ExitCode)"
        }

        $checkpoint = Get-ChildItem -Path $captureDir -Filter "checkpoint-*.json" -File -ErrorAction SilentlyContinue |
            Select-Object -First 1
        if ($checkpoint) {
            throw "Physical validation build activated CI runtimeVisual instrumentation: $($checkpoint.Name)"
        }

        Start-Sleep -Milliseconds 200
    }

    $checkpoint = Get-ChildItem -Path $captureDir -Filter "checkpoint-*.json" -File -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($checkpoint) {
        throw "Physical validation build activated CI runtimeVisual instrumentation: $($checkpoint.Name)"
    }

    Write-Host "Physical validation build stayed free of CI runtimeVisual checkpoints."
}
finally {
    if ($process -and -not $process.HasExited) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        try { $process.WaitForExit(5000) | Out-Null } catch {}
    }

    if ($null -eq $oldCapture) { Remove-Item Env:NARRO_FOCUS_CAPTURE_DIR -ErrorAction SilentlyContinue }
    else { $env:NARRO_FOCUS_CAPTURE_DIR = $oldCapture }
}
