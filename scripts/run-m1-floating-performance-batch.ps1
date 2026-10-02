param(
    [switch]$SelfTest,
    [int]$NarroPid = 0,
    [int]$RunCount = 3,
    [int]$WarmupSeconds = 30,
    [int]$SampleSeconds = 60,
    [double]$IntervalSeconds = 1.0,
    [string]$OutputDirectory = "",
    [string]$ExpectedExecutableSha256 = ""
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

function Assert-Throws {
    param(
        [scriptblock]$Action,
        [string]$Message
    )

    $threw = $false
    try {
        & $Action | Out-Null
    }
    catch {
        $threw = $true
    }

    Assert-Condition $threw $Message
}

function Get-Median {
    param([double[]]$Values)

    if ($Values.Count -eq 0) {
        throw "cannot compute a median from an empty value set"
    }

    $sorted = @($Values | Sort-Object)
    $middle = [int][Math]::Floor($sorted.Count / 2)

    if (($sorted.Count % 2) -eq 1) {
        return [double]$sorted[$middle]
    }

    return ([double]$sorted[$middle - 1] + [double]$sorted[$middle]) / 2.0
}

function Normalize-Sha256 {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return ""
    }

    $normalized = $Value.Trim().ToLowerInvariant()
    if ($normalized -notmatch '^[0-9a-f]{64}$') {
        throw "ExpectedExecutableSha256 must contain exactly 64 hexadecimal characters"
    }

    return $normalized
}

function Assert-ValidSummary {
    param([object]$Summary)

    Assert-Condition ($null -ne $Summary) "measurement summary is missing"
    Assert-Condition ([int]$Summary.schemaVersion -eq 1) "unexpected measurement summary schemaVersion"
    Assert-Condition ([string]$Summary.scenario -eq "floating-only-main-destroyed") "measurement scenario is not floating-only-main-destroyed"
    Assert-Condition ([bool]$Summary.steadyStateValid) "measurement summary is not valid steady-state evidence"
    Assert-Condition ([int]$Summary.churnIntervalCount -eq 0) "measurement summary reports process-tree churn"
    Assert-Condition ([int]$Summary.stableCpuIntervalCount -gt 0) "measurement summary contains no stable CPU intervals"

    foreach ($metricName in @(
        "cpuPercentOneCore",
        "cpuPercentTotalCapacity",
        "workingSetBytes",
        "privateBytes"
    )) {
        $metric = $Summary.$metricName
        Assert-Condition ($null -ne $metric) "measurement summary is missing $metricName"
        foreach ($field in @("min", "max", "average")) {
            Assert-Condition ($null -ne $metric.$field) "measurement summary is missing $metricName.$field"
            $value = [double]$metric.$field
            Assert-Condition (-not [double]::IsNaN($value) -and -not [double]::IsInfinity($value)) "measurement summary contains non-finite $metricName.$field"
        }
    }

    Assert-Condition (-not [string]::IsNullOrWhiteSpace([string]$Summary.rootExecutable)) "measurement summary is missing rootExecutable"
}

function Assert-ConsistentRunContext {
    param(
        [object]$ReferenceRun,
        [object]$Summary
    )

    Assert-Condition ([int]$Summary.rootPid -eq [int]$ReferenceRun.rootPid) "Narro root PID changed between batch runs"
    Assert-Condition ([string]$Summary.rootExecutable -eq [string]$ReferenceRun.rootExecutable) "Narro root executable changed between batch runs"
    Assert-Condition ([int]$Summary.logicalProcessorCount -eq [int]$ReferenceRun.logicalProcessorCount) "logical processor count changed between batch runs"
}

function New-RunRecord {
    param(
        [int]$RunNumber,
        [string]$ScenarioPreflightRelativePath,
        [string]$SummaryRelativePath,
        [object]$Summary,
        [string]$ExecutableSha256
    )

    return [pscustomobject]@{
        runNumber = $RunNumber
        scenarioPreflightPath = $ScenarioPreflightRelativePath
        scenarioPreflightValidated = $true
        summaryPath = $SummaryRelativePath
        rootPid = [int]$Summary.rootPid
        rootExecutable = [string]$Summary.rootExecutable
        executableSha256 = $ExecutableSha256
        logicalProcessorCount = [int]$Summary.logicalProcessorCount
        actualSampleSeconds = [double]$Summary.actualSampleSeconds
        sampleCount = [int]$Summary.sampleCount
        stableCpuIntervalCount = [int]$Summary.stableCpuIntervalCount
        churnIntervalCount = [int]$Summary.churnIntervalCount
        cpuPercentOneCore = [pscustomobject]@{
            min = [double]$Summary.cpuPercentOneCore.min
            max = [double]$Summary.cpuPercentOneCore.max
            average = [double]$Summary.cpuPercentOneCore.average
        }
        cpuPercentTotalCapacity = [pscustomobject]@{
            min = [double]$Summary.cpuPercentTotalCapacity.min
            max = [double]$Summary.cpuPercentTotalCapacity.max
            average = [double]$Summary.cpuPercentTotalCapacity.average
        }
        workingSetMiB = [pscustomobject]@{
            min = [double]$Summary.workingSetBytes.min / 1MB
            max = [double]$Summary.workingSetBytes.max / 1MB
            average = [double]$Summary.workingSetBytes.average / 1MB
        }
        privateBytesMiB = [pscustomobject]@{
            min = [double]$Summary.privateBytes.min / 1MB
            max = [double]$Summary.privateBytes.max / 1MB
            average = [double]$Summary.privateBytes.average / 1MB
        }
        lastProcessBreakdown = @($Summary.lastProcessBreakdown)
        generatedAtUtc = [string]$Summary.generatedAtUtc
    }
}

function Invoke-SelfTest {
    Assert-Condition ([Math]::Abs((Get-Median -Values @(1.0, 5.0, 3.0)) - 3.0) -lt 0.0001) "odd median calculation failed"
    Assert-Condition ([Math]::Abs((Get-Median -Values @(1.0, 5.0, 3.0, 7.0)) - 4.0) -lt 0.0001) "even median calculation failed"
    Assert-Condition ((Normalize-Sha256 -Value ("A" * 64)) -eq ("a" * 64)) "SHA-256 normalization failed"
    Assert-Throws -Action { Normalize-Sha256 -Value "not-a-hash" } -Message "invalid SHA-256 input was accepted"

    $validSummary = [pscustomobject]@{
        schemaVersion = 1
        scenario = "floating-only-main-destroyed"
        rootPid = 123
        rootExecutable = "C:\test\narro.exe"
        logicalProcessorCount = 8
        actualSampleSeconds = 60.0
        sampleCount = 61
        stableCpuIntervalCount = 60
        churnIntervalCount = 0
        steadyStateValid = $true
        cpuPercentOneCore = [pscustomobject]@{ min = 1.0; max = 3.0; average = 2.0 }
        cpuPercentTotalCapacity = [pscustomobject]@{ min = 0.1; max = 0.3; average = 0.2 }
        workingSetBytes = [pscustomobject]@{ min = 90MB; max = 110MB; average = 100MB }
        privateBytes = [pscustomobject]@{ min = 70MB; max = 90MB; average = 80MB }
        lastProcessBreakdown = @()
        generatedAtUtc = "2026-10-02T00:00:00Z"
    }

    Assert-ValidSummary -Summary $validSummary
    $record = New-RunRecord -RunNumber 1 -ScenarioPreflightRelativePath "run-01/scenario-preflight.json" -SummaryRelativePath "run-01/summary.json" -Summary $validSummary -ExecutableSha256 ("b" * 64)
    Assert-Condition ([Math]::Abs($record.workingSetMiB.average - 100.0) -lt 0.0001) "working-set MiB conversion failed"
    Assert-Condition ([Math]::Abs($record.privateBytesMiB.average - 80.0) -lt 0.0001) "private-byte MiB conversion failed"
    Assert-ConsistentRunContext -ReferenceRun $record -Summary $validSummary

    $changedPidSummary = [pscustomobject]@{
        rootPid = 124
        rootExecutable = "C:\\test\\narro.exe"
        logicalProcessorCount = 8
    }
    Assert-Throws -Action {
        Assert-ConsistentRunContext -ReferenceRun $record -Summary $changedPidSummary
    } -Message "batch accepted a changed Narro root PID"

    $invalidSummary = [pscustomobject]@{
        schemaVersion = 1
        scenario = "floating-only-main-destroyed"
        rootPid = 123
        rootExecutable = "C:\test\narro.exe"
        logicalProcessorCount = 8
        actualSampleSeconds = 60.0
        sampleCount = 61
        stableCpuIntervalCount = 59
        churnIntervalCount = 1
        steadyStateValid = $false
        cpuPercentOneCore = [pscustomobject]@{ min = 1.0; max = 3.0; average = 2.0 }
        cpuPercentTotalCapacity = [pscustomobject]@{ min = 0.1; max = 0.3; average = 0.2 }
        workingSetBytes = [pscustomobject]@{ min = 90MB; max = 110MB; average = 100MB }
        privateBytes = [pscustomobject]@{ min = 70MB; max = 90MB; average = 80MB }
        lastProcessBreakdown = @()
        generatedAtUtc = "2026-10-02T00:00:00Z"
    }
    Assert-Throws -Action { Assert-ValidSummary -Summary $invalidSummary } -Message "churning measurement summary was accepted"

    Write-Host "Floating performance batch runner self-test: PASS"
}

if ($SelfTest) {
    Invoke-SelfTest
    exit 0
}

if ($RunCount -lt 3 -or $RunCount -gt 10) {
    throw "RunCount must be between 3 and 10"
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

$expectedHash = Normalize-Sha256 -Value $ExpectedExecutableSha256
$measureScript = Join-Path $PSScriptRoot "measure-floating.ps1"
if (-not (Test-Path $measureScript -PathType Leaf)) {
    throw "measurement harness not found: $measureScript"
}

$scenarioScript = Join-Path $PSScriptRoot "verify-m1-floating-performance-scenario.ps1"
if (-not (Test-Path $scenarioScript -PathType Leaf)) {
    throw "scenario preflight not found: $scenarioScript"
}

if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
    $stamp = [DateTime]::UtcNow.ToString("yyyyMMdd-HHmmssZ")
    $OutputDirectory = Join-Path (Join-Path $PSScriptRoot "..") ("performance/m1-floating-batch/{0}" -f $stamp)
}

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Force -Path $resolvedOutput | Out-Null

$powerShell = (Get-Command powershell.exe -ErrorAction Stop).Source
$runRecords = @()

for ($runNumber = 1; $runNumber -le $RunCount; $runNumber += 1) {
    $runName = "run-{0:D2}" -f $runNumber
    $runDirectory = Join-Path $resolvedOutput $runName
    New-Item -ItemType Directory -Force -Path $runDirectory | Out-Null

    Write-Host ""
    Write-Host "=== Floating performance $runName of $RunCount ==="

    $scenarioPath = Join-Path $runDirectory "scenario-preflight.json"
    $scenarioArguments = @(
        "-NoLogo",
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-File", $scenarioScript,
        "-OutputPath", $scenarioPath
    )
    if ($NarroPid -gt 0) {
        $scenarioArguments += @("-NarroPid", [string]$NarroPid)
    }

    & $powerShell @scenarioArguments
    $scenarioExitCode = $LASTEXITCODE
    if ($scenarioExitCode -ne 0) {
        throw "scenario preflight for $runName failed with exit code $scenarioExitCode; fix the physical setup before measuring"
    }
    if (-not (Test-Path $scenarioPath -PathType Leaf)) {
        throw "scenario preflight for $runName did not produce scenario-preflight.json"
    }

    $scenario = Get-Content -Raw -Path $scenarioPath | ConvertFrom-Json
    Assert-Condition ([bool]$scenario.pass) "scenario preflight for $runName did not report PASS"
    Assert-Condition ([string]$scenario.scenario -eq "floating-only-main-destroyed") "scenario preflight for $runName reported the wrong scenario"

    $intervalArgument = $IntervalSeconds.ToString([Globalization.CultureInfo]::InvariantCulture)
    $arguments = @(
        "-NoLogo",
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-File", $measureScript,
        "-WarmupSeconds", [string]$WarmupSeconds,
        "-SampleSeconds", [string]$SampleSeconds,
        "-IntervalSeconds", $intervalArgument,
        "-OutputDirectory", $runDirectory
    )
    if ($NarroPid -gt 0) {
        $arguments += @("-NarroPid", [string]$NarroPid)
    }

    & $powerShell @arguments
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
        throw "measurement $runName failed with exit code $exitCode; inspect $runDirectory for preserved raw evidence"
    }

    $summaryPath = Join-Path $runDirectory "summary.json"
    if (-not (Test-Path $summaryPath -PathType Leaf)) {
        throw "measurement $runName did not produce summary.json"
    }

    $summary = Get-Content -Raw -Path $summaryPath | ConvertFrom-Json
    Assert-ValidSummary -Summary $summary
    if ($runRecords.Count -gt 0) {
        Assert-ConsistentRunContext -ReferenceRun $runRecords[0] -Summary $summary
    }

    $actualHash = ""
    if (-not [string]::IsNullOrWhiteSpace($expectedHash)) {
        $executablePath = [string]$summary.rootExecutable
        if (-not (Test-Path $executablePath -PathType Leaf)) {
            throw "measurement $runName sampled executable is no longer readable: $executablePath"
        }
        $actualHash = (Get-FileHash -Algorithm SHA256 -Path $executablePath).Hash.ToLowerInvariant()
        if ($actualHash -ne $expectedHash) {
            throw "measurement $runName sampled executable SHA-256 $actualHash does not match expected $expectedHash"
        }
    }

    $relativeScenario = "$runName/scenario-preflight.json"
    $relativeSummary = "$runName/summary.json"
    $recordParams = @{
        RunNumber = $runNumber
        ScenarioPreflightRelativePath = $relativeScenario
        SummaryRelativePath = $relativeSummary
        Summary = $summary
        ExecutableSha256 = $actualHash
    }
    $runRecords += New-RunRecord @recordParams
}

$cpuOneCoreAverages = @($runRecords | ForEach-Object { [double]$_.cpuPercentOneCore.average })
$cpuCapacityAverages = @($runRecords | ForEach-Object { [double]$_.cpuPercentTotalCapacity.average })
$workingSetAverages = @($runRecords | ForEach-Object { [double]$_.workingSetMiB.average })
$privateByteAverages = @($runRecords | ForEach-Object { [double]$_.privateBytesMiB.average })

$operatingSystem = Get-CimInstance Win32_OperatingSystem
$processorNames = @(
    Get-CimInstance Win32_Processor |
        ForEach-Object { [string]$_.Name } |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
        Sort-Object -Unique
)

$batchSummary = [pscustomobject]@{
    schemaVersion = 1
    scenario = "floating-only-main-destroyed"
    runCount = $RunCount
    allRunsValid = $true
    scenarioPreflightValidatedForEveryRun = $true
    expectedExecutableSha256 = $expectedHash
    warmupSeconds = $WarmupSeconds
    requestedSampleSeconds = $SampleSeconds
    intervalSeconds = $IntervalSeconds
    runs = $runRecords
    medianRunAverage = [pscustomobject]@{
        cpuPercentOneCore = (Get-Median -Values $cpuOneCoreAverages)
        cpuPercentTotalCapacity = (Get-Median -Values $cpuCapacityAverages)
        workingSetMiB = (Get-Median -Values $workingSetAverages)
        privateBytesMiB = (Get-Median -Values $privateByteAverages)
    }
    environment = [pscustomobject]@{
        windowsCaption = [string]$operatingSystem.Caption
        windowsVersion = [string]$operatingSystem.Version
        windowsBuildNumber = [string]$operatingSystem.BuildNumber
        processorNames = $processorNames
        logicalProcessorCount = [int]$runRecords[0].logicalProcessorCount
    }
    generatedAtUtc = [DateTime]::UtcNow.ToString("o")
}

$batchSummaryPath = Join-Path $resolvedOutput "batch-summary.json"
$batchSummary | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path $batchSummaryPath

Write-Host ""
Write-Host "All $RunCount floating-only runs are valid steady-state evidence."
Write-Host "Batch summary: $batchSummaryPath"
Write-Host ("Median run-average CPU: {0:N3}% of one core / {1:N3}% total capacity" -f $batchSummary.medianRunAverage.cpuPercentOneCore, $batchSummary.medianRunAverage.cpuPercentTotalCapacity)
Write-Host ("Median run-average working set: {0:N1} MiB" -f $batchSummary.medianRunAverage.workingSetMiB)
Write-Host ("Median run-average private bytes: {0:N1} MiB" -f $batchSummary.medianRunAverage.privateBytesMiB)
