param(
    [Parameter(Mandatory = $true)][string]$Executable,
    [Parameter(Mandatory = $true)][string]$NormalExecutable
)
$ErrorActionPreference = 'Stop'
$exe = (Resolve-Path -LiteralPath $Executable).Path
$normal = (Resolve-Path -LiteralPath $NormalExecutable).Path
$marker = 'narro-physical-trace/v1'
if ([Text.Encoding]::UTF8.GetString([IO.File]::ReadAllBytes($normal)).Contains($marker)) {
    throw 'Normal release contains test-only physical trace marker.'
}
if (-not [Text.Encoding]::UTF8.GetString([IO.File]::ReadAllBytes($exe)).Contains($marker)) {
    throw 'Physical executable does not contain test-only trace feature.'
}
$root = Join-Path (Get-Location) ('artifacts/physical-logging-probe-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $root | Out-Null
if (@(Get-Process -Name narro -ErrorAction SilentlyContinue).Count -gt 0) { throw 'Resolve existing Narro before CI logging probe.' }
$oldRoot = $env:NARRO_PHYSICAL_SESSION_DIR
$oldProbe = $env:NARRO_PHYSICAL_LOGGING_PROBE
$process = $null
try {
    $env:NARRO_PHYSICAL_SESSION_DIR = $root
    $env:NARRO_PHYSICAL_LOGGING_PROBE = '1'
    $process = Start-Process -FilePath $exe -WorkingDirectory (Split-Path $exe) -WindowStyle Hidden -PassThru
    if (-not $process.WaitForExit(45000)) { throw 'Full-stack logging probe failed to Quit normally within45s.' }
    if ($process.ExitCode -ne 0) { throw "Logging probe failed: exit $($process.ExitCode)." }
    $packets = @(Get-ChildItem -LiteralPath $root -Directory)
    if ($packets.Count -ne 1) { throw 'Expected exactly one owned native trace packet.' }
    $packet = $packets[0].FullName
    $identity = Get-Content -LiteralPath (Join-Path $packet 'process.json') -Raw | ConvertFrom-Json
    if ($identity.pid -ne $process.Id) { throw 'Trace PID differs from the owned process.' }
    $health = Get-Content -LiteralPath (Join-Path $packet 'health.json') -Raw | ConvertFrom-Json
    if ($health.state -ne 'CLOSED' -or $health.lost -ne 0 -or $health.produced -ne $health.written) {
        throw 'Logging probe did not close with complete native trace coverage.'
    }
    $rows = @(Get-ChildItem -LiteralPath $packet -Filter 'events-*.jsonl' -File | Sort-Object Name | ForEach-Object {
        Get-Content -LiteralPath $_.FullName | Where-Object { $_.Trim() } | ForEach-Object { $_ | ConvertFrom-Json }
    })
    foreach ($event in @('process-start','backend-dispatch','sqlite-connection','frontend-drained','process-end')) {
        if (-not @($rows | Where-Object { $_.event -eq $event }).Count) { throw "Missing native event: $event" }
    }
    $front = @($rows | Where-Object { $_.event -eq 'frontend' } | ForEach-Object { $_.data.record })
    foreach ($event in @('frontend-start','backend-clock-handshake','ipc-result','logging-probe-complete','page-end')) {
        if (-not @($front | Where-Object { $_.event -eq $event }).Count) { throw "Missing frontend event: $event" }
    }
    if (@($rows | Where-Object { $_.event -like 'frontend-drain-*' }).Count) { throw 'Frontend drain failure.' }
    Write-Host 'Physical full-stack logging lifecycle and ordinary-release exclusion: PASS (CI probe; no product acceptance claim).'
}
finally {
    if ($process -and -not $process.HasExited) {
        # Only this probe's exact owned process; preserve diagnostics on timeout.
        Stop-Process -Id $process.Id -ErrorAction SilentlyContinue
    }
    if ($null -eq $oldRoot) { Remove-Item Env:NARRO_PHYSICAL_SESSION_DIR -ErrorAction SilentlyContinue } else { $env:NARRO_PHYSICAL_SESSION_DIR = $oldRoot }
    if ($null -eq $oldProbe) { Remove-Item Env:NARRO_PHYSICAL_LOGGING_PROBE -ErrorAction SilentlyContinue } else { $env:NARRO_PHYSICAL_LOGGING_PROBE = $oldProbe }
}
