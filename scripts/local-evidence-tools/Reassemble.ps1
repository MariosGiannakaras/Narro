param([string]$MediaDirectory='C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload\work-log\evidence\m7-ci953-continuous-20261005\video')
$ErrorActionPreference='Stop'
foreach ($m in (Get-Content -Raw -LiteralPath (Join-Path $MediaDirectory 'media-reassembly.json') | ConvertFrom-Json)) {
 $target=Join-Path $MediaDirectory $m.file
 if (Test-Path -LiteralPath $target) { throw ('Output already exists: '+$target) }
 $out=[IO.File]::Create($target)
 try { foreach ($part in $m.parts) { $in=[IO.File]::OpenRead((Join-Path $MediaDirectory $part)); try { $in.CopyTo($out) } finally { $in.Dispose() } } } finally { $out.Dispose() }
 if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLower() -ne $m.sha256) { throw 'Media hash mismatch' }
 Write-Host ('Reassembled and verified: '+$target)
}

