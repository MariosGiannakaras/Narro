$ErrorActionPreference = 'Stop'
$root = 'E:\SystemFiles\Desktop\Narro-PA353-msi-20261014'
$msi = Join-Path $root 'analysis\physical\bundle\msi\Narro_0.1.0_x64_en-US.msi'
$ledger = Get-Content (Join-Path $root 'profile-protection-private.json') -Raw | ConvertFrom-Json
if ($ledger.state -ne 'OWNED_PROFILE_ACTIVE') { throw 'Personal profile must be protected before install.' }
if ((Get-FileHash -LiteralPath $msi -Algorithm SHA256).Hash -ne '0AFA160F4770DD82632797173E94F0714FB7C8628E4F990F789E8E769A3F87F5') { throw 'MSI hash mismatch.' }
if (Test-Path -LiteralPath 'C:\Program Files\Narro') { throw 'Preserve an existing installation; do not overwrite it.' }
$principal = [Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Expected elevated installer process.' }
$started = [DateTime]::UtcNow.ToString('o')
$install = Start-Process msiexec.exe -WindowStyle Hidden -ArgumentList ('/i "' + $msi + '" /qn /norestart /L*v "' + (Join-Path $root 'msi-install.log') + '"') -PassThru -Wait
@{startedUtc=$started;endedUtc=[DateTime]::UtcNow.ToString('o');exitCode=$install.ExitCode;administrator=$true;mode='Default MSI per-machine, quiet; no ALLUSERS override'} | ConvertTo-Json | Set-Content (Join-Path $root 'msi-install-result.json') -Encoding UTF8
