param([long]$WindowId=26937174)
$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @'
using System;using System.Runtime.InteropServices;
public static class M7CompositionProbe {
 [DllImport("user32.dll")] public static extern IntPtr GetWindowLongPtrW(IntPtr h,int n);
 [DllImport("user32.dll")] public static extern UIntPtr GetClassLongPtrW(IntPtr h,int n);
 [DllImport("user32.dll",SetLastError=true)] static extern IntPtr SetWindowLongPtrW(IntPtr h,int n,IntPtr v);
 [DllImport("user32.dll",SetLastError=true)] static extern bool SetWindowPos(IntPtr h,IntPtr a,int x,int y,int w,int z,uint f);
 [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 public static void Write(long id,long style){var h=new IntPtr(id);SetWindowLongPtrW(h,-20,new IntPtr(style));if(!SetWindowPos(h,IntPtr.Zero,0,0,0,0,0x37))throw new Exception("FRAMECHANGED failed");if(GetWindowLongPtrW(h,-20).ToInt64()!=style)throw new Exception("Exstyle readback differs");}
}
'@
$owner=0u;[void][M7CompositionProbe]::GetWindowThreadProcessId([IntPtr]$WindowId,[ref]$owner)
if((Get-Process -Id $owner).ProcessName -ne 'narro-m7-validation'){throw 'Target is not validation Narro'}
$original=[M7CompositionProbe]::GetWindowLongPtrW([IntPtr]$WindowId,-20).ToInt64()
$classStyle=[M7CompositionProbe]::GetClassLongPtrW([IntPtr]$WindowId,-26).ToUInt64()
$cases=@(@{name='composition-control';extra=0},@{name='no-redirection';extra=0x200000})
# Never set WS_EX_COMPOSITED on Tao's CS_OWNDC class. The Microsoft API
# explicitly forbids this combination; record that exclusion instead.
if(($classStyle -band 0xE0) -eq 0){$cases+=@(@{name='composited';extra=0x2000000},@{name='composition-both';extra=0x2200000})}
$run='artifacts/m7-ci932-physical-20261004/run-final'
& "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId 3409860 -Name 'Start Recording' -AllowedProcess obs64 -LogFile "$run/actions.jsonl"
try {
 foreach($case in $cases){
  [M7CompositionProbe]::Write($WindowId,($original -bor $case.extra))
  @{utc=[DateTime]::UtcNow.ToString('o');action='EXPERIMENTAL-composition';case=$case.name;windowId=$WindowId;classStyle=$classStyle.ToString('X');originalExstyle=$original.ToString('X');actualExstyle=[M7CompositionProbe]::GetWindowLongPtrW([IntPtr]$WindowId,-20).ToInt64().ToString('X');notOfficialAcceptance=$true}|ConvertTo-Json -Compress|Tee-Object -FilePath "$run/actions.jsonl" -Append
  $null=& "$PSScriptRoot/observe-ci893-windows.ps1" -WindowId $WindowId -Output "$run/observations/experiment-$($case.name)-start.json"
  foreach($i in 1..3){
   & "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId $WindowId -Name 'Expand Floating Timer' -LogFile "$run/actions.jsonl"
   Start-Sleep -Milliseconds 650
   & "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId $WindowId -Name 'Collapse Floating Timer' -LogFile "$run/actions.jsonl"
   Start-Sleep -Milliseconds 650
  }
 }
} finally {
 [M7CompositionProbe]::Write($WindowId,$original)
 @{utc=[DateTime]::UtcNow.ToString('o');action='EXPERIMENTAL-exstyle-restored';exstyle=[M7CompositionProbe]::GetWindowLongPtrW([IntPtr]$WindowId,-20).ToInt64().ToString('X')}|ConvertTo-Json -Compress|Tee-Object -FilePath "$run/actions.jsonl" -Append
 & "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId 3409860 -Name 'Stop Recording' -AllowedProcess obs64 -LogFile "$run/actions.jsonl"
}
