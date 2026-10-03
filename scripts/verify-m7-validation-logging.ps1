param(
    [Parameter(Mandatory = $true)]
    [string]$Executable
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$exe = (Resolve-Path $Executable).Path
$stem = [System.IO.Path]::GetFileNameWithoutExtension($exe)
if ($stem -ine "narro-m7-validation") {
    throw "M7 validation logging must be verified through narro-m7-validation.exe, found: $stem"
}

$existing = @(Get-Process -Name "narro-m7-validation" -ErrorAction SilentlyContinue)
if ($existing.Count -gt 0) {
    throw "M7 validation logging smoke requires no existing narro-m7-validation process."
}

$parent = Split-Path $exe
$logRoot = Join-Path $parent "Narro-M7-Logs"
if (Test-Path $logRoot -PathType Container) {
    Remove-Item -LiteralPath $logRoot -Recurse -Force
}

$process = $null
try {
    $process = Start-Process -FilePath $exe -WorkingDirectory $parent -PassThru
    $deadline = [DateTime]::UtcNow.AddSeconds(20)
    $latest = Join-Path $logRoot "LATEST.txt"

    while ([DateTime]::UtcNow -lt $deadline) {
        $process.Refresh()
        if ($process.HasExited) {
            throw "M7 validation executable exited before creating validation logs. Exit code: $($process.ExitCode)"
        }
        if (Test-Path $latest -PathType Leaf) {
            break
        }
        Start-Sleep -Milliseconds 200
    }

    if (-not (Test-Path $latest -PathType Leaf)) {
        throw "M7 validation executable did not create $latest within 20 seconds."
    }

    $sessionName = (Get-Content -LiteralPath $latest -TotalCount 1).Trim()
    if ([string]::IsNullOrWhiteSpace($sessionName) -or $sessionName -notlike "session-*") {
        throw "LATEST.txt did not identify a validation session directory."
    }

    $sessionDir = Join-Path $logRoot $sessionName
    $eventsPath = Join-Path $sessionDir "events.jsonl"
    $sessionPath = Join-Path $sessionDir "session.json"
    $resultPath = Join-Path $sessionDir "m7-c5-result.json"
    foreach ($required in @($eventsPath, $sessionPath, $resultPath, (Join-Path $logRoot "README.txt"))) {
        if (-not (Test-Path $required -PathType Leaf)) {
            throw "M7 validation logging smoke is missing required file: $required"
        }
    }

    $events = Get-Content -LiteralPath $eventsPath -Raw
    if ($events -notmatch '"event":"validation-start"') {
        throw "events.jsonl is missing the validation-start event."
    }

    $session = Get-Content -LiteralPath $sessionPath -Raw | ConvertFrom-Json
    if ($session.executableName -ine "narro-m7-validation.exe") {
        throw "session.json recorded the wrong executable name: $($session.executableName)"
    }
    if (
        [string]::IsNullOrWhiteSpace($session.executableFingerprint) -or
        $session.executableFingerprint -notmatch '^fnv1a64:[0-9a-f]{16}:bytes:[0-9]+$'
    ) {
        throw "session.json is missing the byte-level validation executable fingerprint."
    }
    if ($session.privacy.localOnly -ne $true -or $session.privacy.uploadsAutomatically -ne $false) {
        throw "session.json does not preserve the local-only/no-upload validation contract."
    }
    if (
        $session.privacy.recordsTaskContent -ne $false -or
        $session.privacy.recordsNotes -ne $false -or
        $session.privacy.recordsListNames -ne $false
    ) {
        throw "session.json privacy contract permits user-content capture."
    }

    $result = Get-Content -LiteralPath $resultPath -Raw | ConvertFrom-Json
    if ($result.test -ne "M7-C5-saved-placement-restart" -or $result.status -ne "PENDING") {
        throw "Initial M7 C5 evaluator result is not the expected PENDING state."
    }

    Write-Host "M7 automatic validation logging smoke: PASS"
    Write-Host "  executable: $exe"
    Write-Host "  session: $sessionName"
    Write-Host "  executable fingerprint: $($session.executableFingerprint)"
    Write-Host "  initial evaluator status: $($result.status)"
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
            Write-Warning "Could not fully stop M7 validation smoke process: $($_.Exception.Message)"
        }
    }
}
