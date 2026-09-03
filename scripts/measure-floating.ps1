param(
    [switch]$SelfTest,
    [int]$NarroPid = 0,
    [int]$WarmupSeconds = 15,
    [int]$SampleSeconds = 60,
    [double]$IntervalSeconds = 1.0,
    [string]$OutputDirectory = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Assert-Condition {
    param(
        [bool]$Condition,
        [string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Get-DescendantPidSet {
    param(
        [object[]]$ProcessRows,
        [int]$RootPid
    )

    $known = @{}
    foreach ($row in $ProcessRows) {
        $known[[int]$row.ProcessId] = $row
    }

    if (-not $known.ContainsKey($RootPid)) {
        throw "root process PID $RootPid is not present in the current process snapshot"
    }

    $selected = @($RootPid)
    $changed = $true
    while ($changed) {
        $changed = $false
        foreach ($row in $ProcessRows) {
            $pid = [int]$row.ProcessId
            $parentPid = [int]$row.ParentProcessId
            if (($selected -contains $parentPid) -and -not ($selected -contains $pid)) {
                $selected += $pid
                $changed = $true
            }
        }
    }

    return @($selected | Sort-Object -Unique)
}

function Get-ByteStats {
    param([double[]]$Values)

    if ($Values.Count -eq 0) {
        throw "cannot summarize an empty value set"
    }

    $measure = $Values | Measure-Object -Minimum -Maximum -Average
    return [pscustomobject]@{
        min = [double]$measure.Minimum
        max = [double]$measure.Maximum
        average = [double]$measure.Average
    }
}

function Get-CpuInterval {
    param(
        [object]$Previous,
        [object]$Current,
        [int]$LogicalProcessorCount
    )

    if ($LogicalProcessorCount -le 0) {
        throw "logical processor count must be positive"
    }

    $previousFingerprint = @($Previous.processFingerprint)
    $currentFingerprint = @($Current.processFingerprint)
    $stable = ($previousFingerprint.Count -eq $currentFingerprint.Count) -and
        (-not (Compare-Object -ReferenceObject $previousFingerprint -DifferenceObject $currentFingerprint))

    $elapsedSeconds = [double]$Current.elapsedSeconds - [double]$Previous.elapsedSeconds
    if ($elapsedSeconds -le 0) {
        throw "sample interval elapsed time must be positive"
    }

    if (-not $stable) {
        return [pscustomobject]@{
            stable = $false
            elapsedSeconds = $elapsedSeconds
            cpuSeconds = $null
            cpuPercentOneCore = $null
            cpuPercentTotalCapacity = $null
        }
    }

    $cpuSeconds = [double]$Current.totalCpuSeconds - [double]$Previous.totalCpuSeconds
    if ($cpuSeconds -lt -0.000001) {
        throw "aggregate process CPU time moved backwards"
    }
    if ($cpuSeconds -lt 0) {
        $cpuSeconds = 0
    }

    return [pscustomobject]@{
        stable = $true
        elapsedSeconds = $elapsedSeconds
        cpuSeconds = $cpuSeconds
        cpuPercentOneCore = ($cpuSeconds / $elapsedSeconds) * 100.0
        cpuPercentTotalCapacity = ($cpuSeconds / $elapsedSeconds / $LogicalProcessorCount) * 100.0
    }
}

function Resolve-NarroRootPid {
    param([int]$RequestedPid)

    $rows = @(Get-CimInstance Win32_Process | Where-Object { $_.Name -ieq "narro.exe" })

    if ($RequestedPid -gt 0) {
        $match = @($rows | Where-Object { [int]$_.ProcessId -eq $RequestedPid })
        if ($match.Count -ne 1) {
            throw "PID $RequestedPid is not a running narro.exe process"
        }
        return $RequestedPid
    }

    if ($rows.Count -eq 0) {
        throw "no running narro.exe process was found"
    }
    if ($rows.Count -gt 1) {
        $pids = ($rows | ForEach-Object { [string]$_.ProcessId }) -join ", "
        throw "multiple narro.exe processes are running ($pids); pass -NarroPid explicitly after resolving the unexpected duplicate instance"
    }

    return [int]$rows[0].ProcessId
}

function Get-TreeMetricSnapshot {
    param(
        [int]$RootPid,
        [double]$ElapsedSeconds,
        [int]$SampleIndex
    )

    $processRows = @(Get-CimInstance Win32_Process)
    $treePids = @(Get-DescendantPidSet -ProcessRows $processRows -RootPid $RootPid)
    $rowsByPid = @{}
    foreach ($row in $processRows) {
        $rowsByPid[[int]$row.ProcessId] = $row
    }

    $processMetrics = @()
    foreach ($pid in $treePids) {
        if (-not $rowsByPid.ContainsKey($pid)) {
            throw "process PID $pid disappeared while the process tree snapshot was being assembled"
        }

        try {
            $process = Get-Process -Id $pid -ErrorAction Stop
        }
        catch {
            throw "process PID $pid disappeared while metrics were being read: $($_.Exception.Message)"
        }

        $cpuSeconds = if ($null -eq $process.CPU) { 0.0 } else { [double]$process.CPU }
        $startTicks = $process.StartTime.ToUniversalTime().Ticks
        $cim = $rowsByPid[$pid]
        $processMetrics += [pscustomobject]@{
            pid = [int]$pid
            parentPid = [int]$cim.ParentProcessId
            name = [string]$cim.Name
            startTimeUtcTicks = [long]$startTicks
            cpuSeconds = $cpuSeconds
            workingSetBytes = [long]$process.WorkingSet64
            privateBytes = [long]$process.PrivateMemorySize64
        }
    }

    $fingerprint = @(
        $processMetrics |
            Sort-Object pid |
            ForEach-Object { "{0}:{1}" -f $_.pid, $_.startTimeUtcTicks }
    )

    return [pscustomobject]@{
        sampleIndex = $SampleIndex
        capturedAtUtc = [DateTime]::UtcNow.ToString("o")
        elapsedSeconds = $ElapsedSeconds
        processFingerprint = $fingerprint
        processCount = $processMetrics.Count
        totalCpuSeconds = [double](($processMetrics | Measure-Object -Property cpuSeconds -Sum).Sum)
        workingSetBytes = [long](($processMetrics | Measure-Object -Property workingSetBytes -Sum).Sum)
        privateBytes = [long](($processMetrics | Measure-Object -Property privateBytes -Sum).Sum)
        processes = $processMetrics
    }
}

function Get-ProcessBreakdown {
    param([object]$Snapshot)

    $result = @()
    foreach ($group in ($Snapshot.processes | Group-Object name | Sort-Object Name)) {
        $members = @($group.Group)
        $result += [pscustomobject]@{
            name = [string]$group.Name
            processCount = $members.Count
            workingSetBytes = [long](($members | Measure-Object -Property workingSetBytes -Sum).Sum)
            privateBytes = [long](($members | Measure-Object -Property privateBytes -Sum).Sum)
            cumulativeCpuSeconds = [double](($members | Measure-Object -Property cpuSeconds -Sum).Sum)
        }
    }
    return $result
}

function Invoke-SelfTest {
    $syntheticRows = @(
        [pscustomobject]@{ ProcessId = 100; ParentProcessId = 1 },
        [pscustomobject]@{ ProcessId = 101; ParentProcessId = 100 },
        [pscustomobject]@{ ProcessId = 102; ParentProcessId = 101 },
        [pscustomobject]@{ ProcessId = 200; ParentProcessId = 1 }
    )
    $tree = @(Get-DescendantPidSet -ProcessRows $syntheticRows -RootPid 100)
    Assert-Condition (($tree -join ",") -eq "100,101,102") "descendant process-tree selection failed"

    $stats = Get-ByteStats -Values @(100.0, 200.0, 300.0)
    Assert-Condition ([Math]::Abs($stats.min - 100.0) -lt 0.0001) "byte stats minimum failed"
    Assert-Condition ([Math]::Abs($stats.max - 300.0) -lt 0.0001) "byte stats maximum failed"
    Assert-Condition ([Math]::Abs($stats.average - 200.0) -lt 0.0001) "byte stats average failed"

    $previous = [pscustomobject]@{
        processFingerprint = @("100:1", "101:2")
        elapsedSeconds = 0.0
        totalCpuSeconds = 10.0
    }
    $current = [pscustomobject]@{
        processFingerprint = @("100:1", "101:2")
        elapsedSeconds = 2.0
        totalCpuSeconds = 10.8
    }
    $interval = Get-CpuInterval -Previous $previous -Current $current -LogicalProcessorCount 4
    Assert-Condition $interval.stable "stable process tree was incorrectly marked unstable"
    Assert-Condition ([Math]::Abs($interval.cpuSeconds - 0.8) -lt 0.0001) "CPU delta failed"
    Assert-Condition ([Math]::Abs($interval.cpuPercentOneCore - 40.0) -lt 0.0001) "one-core CPU percentage failed"
    Assert-Condition ([Math]::Abs($interval.cpuPercentTotalCapacity - 10.0) -lt 0.0001) "total-capacity CPU percentage failed"

    $changed = [pscustomobject]@{
        processFingerprint = @("100:1", "103:3")
        elapsedSeconds = 4.0
        totalCpuSeconds = 11.0
    }
    $unstable = Get-CpuInterval -Previous $current -Current $changed -LogicalProcessorCount 4
    Assert-Condition (-not $unstable.stable) "process churn was not detected"
    Assert-Condition ($null -eq $unstable.cpuSeconds) "CPU should not be inferred across process churn"

    Write-Host "Floating performance harness self-test: PASS"
}

if ($SelfTest) {
    Invoke-SelfTest
    exit 0
}

if ($WarmupSeconds -lt 0) {
    throw "WarmupSeconds must be zero or greater"
}
if ($SampleSeconds -lt 2) {
    throw "SampleSeconds must be at least 2 seconds"
}
if ($IntervalSeconds -lt 0.25 -or $IntervalSeconds -gt 10.0) {
    throw "IntervalSeconds must be between 0.25 and 10 seconds"
}

$rootPid = Resolve-NarroRootPid -RequestedPid $NarroPid
$logicalProcessorCount = [Environment]::ProcessorCount
if ($logicalProcessorCount -le 0) {
    throw "Windows reported an invalid logical processor count"
}

$rootProcess = Get-Process -Id $rootPid -ErrorAction Stop
Write-Host "Narro root PID: $rootPid"
Write-Host "Executable: $($rootProcess.Path)"
Write-Host "Logical processors: $logicalProcessorCount"
Write-Host "Warm-up: $WarmupSeconds s; sample window: $SampleSeconds s; interval: $IntervalSeconds s"

if ($WarmupSeconds -gt 0) {
    Start-Sleep -Seconds $WarmupSeconds
}

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$samples = @()
$sampleIndex = 0
$samples += Get-TreeMetricSnapshot -RootPid $rootPid -ElapsedSeconds $stopwatch.Elapsed.TotalSeconds -SampleIndex $sampleIndex

while ($stopwatch.Elapsed.TotalSeconds -lt $SampleSeconds) {
    Start-Sleep -Milliseconds ([int][Math]::Round($IntervalSeconds * 1000.0))
    $sampleIndex += 1
    $samples += Get-TreeMetricSnapshot -RootPid $rootPid -ElapsedSeconds $stopwatch.Elapsed.TotalSeconds -SampleIndex $sampleIndex
}
$stopwatch.Stop()

$cpuIntervals = @()
$churnIntervals = 0
for ($index = 1; $index -lt $samples.Count; $index += 1) {
    $interval = Get-CpuInterval -Previous $samples[$index - 1] -Current $samples[$index] -LogicalProcessorCount $logicalProcessorCount
    if (-not $interval.stable) {
        $churnIntervals += 1
    }
    $cpuIntervals += [pscustomobject]@{
        intervalIndex = $index
        fromSample = $samples[$index - 1].sampleIndex
        toSample = $samples[$index].sampleIndex
        stable = $interval.stable
        elapsedSeconds = $interval.elapsedSeconds
        cpuSeconds = $interval.cpuSeconds
        cpuPercentOneCore = $interval.cpuPercentOneCore
        cpuPercentTotalCapacity = $interval.cpuPercentTotalCapacity
    }
}

$stableCpuIntervals = @($cpuIntervals | Where-Object { $_.stable })
if ($stableCpuIntervals.Count -eq 0) {
    throw "no stable CPU intervals were captured"
}

$workingSetStats = Get-ByteStats -Values @($samples | ForEach-Object { [double]$_.workingSetBytes })
$privateStats = Get-ByteStats -Values @($samples | ForEach-Object { [double]$_.privateBytes })
$cpuOneCoreStats = Get-ByteStats -Values @($stableCpuIntervals | ForEach-Object { [double]$_.cpuPercentOneCore })
$cpuCapacityStats = Get-ByteStats -Values @($stableCpuIntervals | ForEach-Object { [double]$_.cpuPercentTotalCapacity })
$lastSnapshot = $samples[$samples.Count - 1]

if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
    $stamp = [DateTime]::UtcNow.ToString("yyyyMMdd-HHmmssZ")
    $OutputDirectory = Join-Path (Join-Path $PSScriptRoot "..") ("performance/m1-floating/{0}" -f $stamp)
}
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Force -Path $resolvedOutput | Out-Null

$summary = [pscustomobject]@{
    schemaVersion = 1
    scenario = "floating-only-main-destroyed"
    rootPid = $rootPid
    rootExecutable = $rootProcess.Path
    logicalProcessorCount = $logicalProcessorCount
    warmupSeconds = $WarmupSeconds
    requestedSampleSeconds = $SampleSeconds
    actualSampleSeconds = $stopwatch.Elapsed.TotalSeconds
    intervalSeconds = $IntervalSeconds
    sampleCount = $samples.Count
    stableCpuIntervalCount = $stableCpuIntervals.Count
    churnIntervalCount = $churnIntervals
    steadyStateValid = ($churnIntervals -eq 0)
    cpuPercentOneCore = $cpuOneCoreStats
    cpuPercentTotalCapacity = $cpuCapacityStats
    workingSetBytes = $workingSetStats
    privateBytes = $privateStats
    lastProcessBreakdown = @(Get-ProcessBreakdown -Snapshot $lastSnapshot)
    generatedAtUtc = [DateTime]::UtcNow.ToString("o")
}

$summaryPath = Join-Path $resolvedOutput "summary.json"
$samplesPath = Join-Path $resolvedOutput "samples.csv"
$intervalsPath = Join-Path $resolvedOutput "cpu-intervals.csv"

$summary | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 -Path $summaryPath

$flatSamples = foreach ($sample in $samples) {
    foreach ($process in $sample.processes) {
        [pscustomobject]@{
            sampleIndex = $sample.sampleIndex
            capturedAtUtc = $sample.capturedAtUtc
            elapsedSeconds = $sample.elapsedSeconds
            processCount = $sample.processCount
            treeWorkingSetBytes = $sample.workingSetBytes
            treePrivateBytes = $sample.privateBytes
            pid = $process.pid
            parentPid = $process.parentPid
            name = $process.name
            startTimeUtcTicks = $process.startTimeUtcTicks
            processCpuSeconds = $process.cpuSeconds
            processWorkingSetBytes = $process.workingSetBytes
            processPrivateBytes = $process.privateBytes
        }
    }
}
$flatSamples | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $samplesPath
$cpuIntervals | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $intervalsPath

Write-Host "Summary: $summaryPath"
Write-Host "Raw process samples: $samplesPath"
Write-Host "CPU intervals: $intervalsPath"
Write-Host ("Average CPU: {0:N3}% of one core / {1:N3}% total capacity" -f $cpuOneCoreStats.average, $cpuCapacityStats.average)
Write-Host ("Average working set: {0:N1} MiB" -f ($workingSetStats.average / 1MB))
Write-Host ("Average private bytes: {0:N1} MiB" -f ($privateStats.average / 1MB))

if ($churnIntervals -gt 0) {
    Write-Error "process-tree churn occurred in $churnIntervals interval(s); raw data was saved, but this run is not valid steady-state evidence"
    exit 2
}

Write-Host "Floating-only steady-state sampling completed without process-tree churn."
