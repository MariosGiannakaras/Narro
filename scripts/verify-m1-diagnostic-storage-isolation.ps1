param(
    [Parameter(Mandatory = $true)]
    [string]$Executable,
    [switch]$ResetDiagnosticData
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-DirectoryFingerprint {
    param([string]$Directory)

    if (-not (Test-Path $Directory -PathType Container)) {
        return "<missing>"
    }

    $entries = @("<present>")
    $entries += @(
        Get-ChildItem -LiteralPath $Directory -Recurse -Force |
            Sort-Object FullName |
            ForEach-Object {
                $relative = $_.FullName.Substring($Directory.Length).TrimStart([char[]]"\/")
                if ($_.PSIsContainer) {
                    "D|{0}" -f $relative
                } else {
                    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash.ToLowerInvariant()
                    "F|{0}|{1}|{2}" -f $relative, $_.Length, $hash
                }
            }
    )
    return [string]::Join("`n", $entries)
}

$exe = (Resolve-Path $Executable).Path
$existing = @(Get-Process -Name "narro" -ErrorAction SilentlyContinue)
if ($existing.Count -gt 0) {
    $ids = ($existing | ForEach-Object { $_.Id }) -join ", "
    throw "Diagnostic storage smoke requires no running Narro process. Running PID(s): $ids"
}

$roamingRoot = [Environment]::GetFolderPath([Environment+SpecialFolder]::ApplicationData)
$localRoot = [Environment]::GetFolderPath([Environment+SpecialFolder]::LocalApplicationData)
if ([string]::IsNullOrWhiteSpace($roamingRoot) -or [string]::IsNullOrWhiteSpace($localRoot)) {
    throw "Windows did not resolve Roaming and Local AppData directories."
}

$productionRoaming = Join-Path $roamingRoot "com.mariosg.Narro"
$productionLocal = Join-Path $localRoot "com.mariosg.Narro"
$diagnosticRoaming = Join-Path $roamingRoot "com.mariosg.Narro.M1Diagnostic"
$diagnosticLocal = Join-Path $localRoot "com.mariosg.Narro.M1Diagnostic"
$diagnosticDb = Join-Path $diagnosticRoaming "narro.db"

foreach ($pair in @(@($productionRoaming, $diagnosticRoaming), @($productionLocal, $diagnosticLocal))) {
    $left = [System.IO.Path]::GetFullPath($pair[0]).TrimEnd([char[]]"\/")
    $right = [System.IO.Path]::GetFullPath($pair[1]).TrimEnd([char[]]"\/")
    if ($left -ieq $right) {
        throw "Production and diagnostic storage unexpectedly resolve to the same path: $left"
    }
}

foreach ($directory in @($diagnosticRoaming, $diagnosticLocal)) {
    if (Test-Path $directory -PathType Container) {
        if (-not $ResetDiagnosticData) {
            throw "Diagnostic data already exists at $directory. Pass -ResetDiagnosticData only in an isolated validation environment."
        }
        Remove-Item -LiteralPath $directory -Recurse -Force
    }
}

$productionRoamingBefore = Get-DirectoryFingerprint -Directory $productionRoaming
$productionLocalBefore = Get-DirectoryFingerprint -Directory $productionLocal
$process = $null

try {
    $process = Start-Process -FilePath $exe -WorkingDirectory (Split-Path $exe) -PassThru
    $deadline = [DateTime]::UtcNow.AddSeconds(20)

    while ([DateTime]::UtcNow -lt $deadline) {
        $process.Refresh()
        if ($process.HasExited) {
            throw "Diagnostic Narro exited before creating its isolated database. Exit code: $($process.ExitCode)"
        }
        if (Test-Path $diagnosticDb -PathType Leaf) {
            break
        }
        Start-Sleep -Milliseconds 250
    }

    if (-not (Test-Path $diagnosticDb -PathType Leaf)) {
        throw "Diagnostic Narro did not create $diagnosticDb within 20 seconds."
    }

    $productionRoamingDuring = Get-DirectoryFingerprint -Directory $productionRoaming
    $productionLocalDuring = Get-DirectoryFingerprint -Directory $productionLocal
    if ($productionRoamingDuring -ne $productionRoamingBefore) {
        throw "Production Roaming AppData changed while launching the diagnostic build."
    }
    if ($productionLocalDuring -ne $productionLocalBefore) {
        throw "Production Local AppData changed while launching the diagnostic build."
    }
}
finally {
    if ($null -ne $process) {
        try {
            $process.Refresh()
            if (-not $process.HasExited) {
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                Wait-Process -Id $process.Id -Timeout 10 -ErrorAction SilentlyContinue
            }
        }
        catch {
            Write-Warning "Could not fully stop diagnostic Narro after storage smoke: $($_.Exception.Message)"
        }
    }
}

if (-not (Test-Path $diagnosticDb -PathType Leaf)) {
    throw "Diagnostic database disappeared after the diagnostic process stopped: $diagnosticDb"
}
$databaseHash = $null
$hashDeadline = [DateTime]::UtcNow.AddSeconds(10)
do {
    try {
        $databaseHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $diagnosticDb -ErrorAction Stop).Hash.ToLowerInvariant()
        break
    }
    catch {
        if ([DateTime]::UtcNow -ge $hashDeadline) {
            throw
        }
        Start-Sleep -Milliseconds 100
    }
} while ($true)

$productionRoamingAfter = Get-DirectoryFingerprint -Directory $productionRoaming
$productionLocalAfter = Get-DirectoryFingerprint -Directory $productionLocal
if ($productionRoamingAfter -ne $productionRoamingBefore) {
    throw "Production Roaming AppData changed during diagnostic storage isolation smoke."
}
if ($productionLocalAfter -ne $productionLocalBefore) {
    throw "Production Local AppData changed during diagnostic storage isolation smoke."
}

Write-Host "M1 diagnostic storage isolation runtime smoke: PASS"
Write-Host "  executable: $exe"
Write-Host "  diagnostic database: $diagnosticDb"
Write-Host "  diagnostic database SHA-256: $databaseHash"
Write-Host "  production Roaming unchanged: $productionRoaming"
Write-Host "  production Local unchanged: $productionLocal"
