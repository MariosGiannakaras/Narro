$ErrorActionPreference = 'Stop'
$root='E:\SystemFiles\Desktop\Narro-PA353-msi-20261014'
$code='{B4A66C52-16A9-44AF-9EE4-3A8C8C956690}'
$key=Get-ItemProperty -LiteralPath ('HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\'+$code)
if ($key.InstallLocation.TrimEnd('\') -ne 'E:\SystemFiles\Desktop\Narro-PA-postfix-20261013\installed-nsis') { throw 'Unexpected MSI target; preserve installation.' }
if (Get-Process narro,narro-m7-validation -ErrorAction SilentlyContinue) { throw 'Close owned application normally before removal.' }
$p=Start-Process msiexec.exe -WindowStyle Hidden -ArgumentList ('/x '+$code+' /qn /norestart /L*v "'+(Join-Path $root 'msi-uninstall.log')+'"') -PassThru -Wait
@{utc=[DateTime]::UtcNow.ToString('o');exitCode=$p.ExitCode;productCode=$code;purpose='Remove only this owned MSI test registration'} | ConvertTo-Json | Set-Content (Join-Path $root 'msi-uninstall-result.json') -Encoding UTF8
