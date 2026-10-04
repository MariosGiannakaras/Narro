param([long]$WindowId=26937174)
$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @'
using System;using System.Runtime.InteropServices;
public static class M7StyleExperiment{
 [DllImport("user32.dll",SetLastError=true)] public static extern IntPtr GetWindowLongPtrW(IntPtr h,int n);
 [DllImport("user32.dll",SetLastError=true)] static extern IntPtr SetWindowLongPtrW(IntPtr h,int n,IntPtr v);
 [DllImport("user32.dll",SetLastError=true)] static extern bool SetWindowPos(IntPtr h,IntPtr a,int x,int y,int w,int z,uint f);
 [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 public static void Write(long id,long style){var h=new IntPtr(id);SetWindowLongPtrW(h,-16,new IntPtr(style));if(!SetWindowPos(h,IntPtr.Zero,0,0,0,0,0x37))throw new Exception("SetWindowPos FRAMECHANGED failed");if(GetWindowLongPtrW(h,-16).ToInt64()!=style)throw new Exception("Style readback differs");}
}
'@
$owner=0u;[void][M7StyleExperiment]::GetWindowThreadProcessId([IntPtr]$WindowId,[ref]$owner)
if((Get-Process -Id $owner).ProcessName -ne 'narro-m7-validation'){throw 'Experimental target is not the validation process'}
$original=[M7StyleExperiment]::GetWindowLongPtrW([IntPtr]$WindowId,-16).ToInt64()
$run='artifacts/m7-ci932-physical-20261004/run-final'
$cases=@(
 @{name='captionless';style=$original -band (-bnot 0x00c00000)},
 @{name='clipchildren';style=$original -bor 0x02000000},
 @{name='both';style=($original -band (-bnot 0x00c00000)) -bor 0x02000000},
 @{name='restored-control';style=$original}
)
try{
 foreach($case in $cases){
  $r=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');action='EXPERIMENTAL-native-style';case=$case.name;windowId=$WindowId;originalStyle=$original.ToString('X');targetStyle=$case.style.ToString('X');notOfficialAcceptance=$true}
  $r|ConvertTo-Json -Compress|Tee-Object -FilePath "$run/actions.jsonl" -Append
  [M7StyleExperiment]::Write($WindowId,$case.style)
  $null=& "$PSScriptRoot/observe-ci893-windows.ps1" -WindowId $WindowId -Output "$run/observations/experiment-$($case.name)-start.json"
  foreach($i in 1..3){
   & "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId $WindowId -Name 'Expand Floating Timer' -LogFile "$run/actions.jsonl"
   Start-Sleep -Milliseconds 300
   & "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId $WindowId -Name 'Collapse Floating Timer' -LogFile "$run/actions.jsonl"
   Start-Sleep -Milliseconds 300
  }
  $r=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');action='EXPERIMENTAL-native-style-readback';case=$case.name;style=[M7StyleExperiment]::GetWindowLongPtrW([IntPtr]$WindowId,-16).ToInt64().ToString('X')}
  $r|ConvertTo-Json -Compress|Tee-Object -FilePath "$run/actions.jsonl" -Append
 }
}finally{
 [M7StyleExperiment]::Write($WindowId,$original)
 @{utc=[DateTime]::UtcNow.ToString('o');action='EXPERIMENT-original-style-restored';style=$original.ToString('X')}|ConvertTo-Json -Compress|Tee-Object -FilePath "$run/actions.jsonl" -Append
}
