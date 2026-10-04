param([long]$WindowId=26937174)
$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @'
using System;using System.Runtime.InteropServices;
public static class M7DwmProbe{
 [DllImport("dwmapi.dll")] public static extern int DwmSetWindowAttribute(IntPtr h,uint a,ref int v,uint n);
 [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr h,uint a,out int v,uint n);
 [DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 public static void Set(long id,uint a,int v){int hr=DwmSetWindowAttribute(new IntPtr(id),a,ref v,4);if(hr<0)throw new Exception("DwmSetWindowAttribute "+a+" failed: "+hr.ToString("X"));}
 public static int Enabled(long id){int v;int hr=DwmGetWindowAttribute(new IntPtr(id),1,out v,4);if(hr<0)throw new Exception("DwmGetWindowAttribute failed");return v;}
}
'@
$owner=0u;[void][M7DwmProbe]::GetWindowThreadProcessId([IntPtr]$WindowId,[ref]$owner)
if((Get-Process -Id $owner).ProcessName -ne 'narro-m7-validation'){throw 'Target is not validation Narro'}
$run='artifacts/m7-ci932-physical-20261004/run-final'
$before=[M7DwmProbe]::Enabled($WindowId)
& "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId 3409860 -Name 'Start Recording' -AllowedProcess obs64 -LogFile "$run/actions.jsonl"
try{
 foreach($case in @(@{name='dwm-control';transitions=0;nc=0},@{name='dwm-no-transitions';transitions=1;nc=0},@{name='dwm-no-nc';transitions=0;nc=1},@{name='dwm-both';transitions=1;nc=1})){
  [M7DwmProbe]::Set($WindowId,3,$case.transitions)
  [M7DwmProbe]::Set($WindowId,2,$case.nc)
  @{utc=[DateTime]::UtcNow.ToString('o');action='EXPERIMENTAL-dwm-policy';case=$case.name;windowId=$WindowId;transitionsDisabled=$case.transitions;ncPolicy=$case.nc;ncEnabled=[M7DwmProbe]::Enabled($WindowId);notOfficialAcceptance=$true}|ConvertTo-Json -Compress|Tee-Object -FilePath "$run/actions.jsonl" -Append
  $null=& "$PSScriptRoot/observe-ci893-windows.ps1" -WindowId $WindowId -Output "$run/observations/experiment-$($case.name)-start.json"
  foreach($i in 1..3){
   & "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId $WindowId -Name 'Expand Floating Timer' -LogFile "$run/actions.jsonl"
   Start-Sleep -Milliseconds 650
   & "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId $WindowId -Name 'Collapse Floating Timer' -LogFile "$run/actions.jsonl"
   Start-Sleep -Milliseconds 650
  }
 }
}finally{
 [M7DwmProbe]::Set($WindowId,3,0)
 [M7DwmProbe]::Set($WindowId,2,0)
 @{utc=[DateTime]::UtcNow.ToString('o');action='EXPERIMENTAL-dwm-defaults-restored';beforeNcEnabled=$before;afterNcEnabled=[M7DwmProbe]::Enabled($WindowId)}|ConvertTo-Json -Compress|Tee-Object -FilePath "$run/actions.jsonl" -Append
 & "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId 3409860 -Name 'Stop Recording' -AllowedProcess obs64 -LogFile "$run/actions.jsonl"
}
