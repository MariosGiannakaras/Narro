param([Parameter(Mandatory)][long]$WindowId,[ValidateSet('obs64','narro-m7-validation')][string]$AllowedProcess='narro-m7-validation',[switch]$Maximize)
$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @'
using System;using System.Runtime.InteropServices;
public static class ObservedActivation {
 [DllImport("user32.dll")]public static extern bool IsWindow(IntPtr h);
 [DllImport("user32.dll")]public static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 [DllImport("kernel32.dll")]public static extern uint GetCurrentThreadId();
 [DllImport("user32.dll")]public static extern bool AttachThreadInput(uint a,uint b,bool x);
 [DllImport("user32.dll")]public static extern bool SetForegroundWindow(IntPtr h);
 [DllImport("user32.dll")]public static extern bool BringWindowToTop(IntPtr h);
 [DllImport("user32.dll")]public static extern bool ShowWindow(IntPtr h,int cmd);
}
'@
$h=[IntPtr]::new($WindowId)
if(-not [ObservedActivation]::IsWindow($h)){throw 'Observed handle no longer exists'}
$owner=[uint32]0;[void][ObservedActivation]::GetWindowThreadProcessId($h,[ref]$owner)
if((Get-Process -Id $owner).ProcessName -ne $AllowedProcess){throw 'Observed target owner changed'}
$before=[ObservedActivation]::GetForegroundWindow();$frontOwner=[uint32]0;$frontThread=[ObservedActivation]::GetWindowThreadProcessId($before,[ref]$frontOwner)
$currentThread=[ObservedActivation]::GetCurrentThreadId()
$attached=$frontThread -ne 0 -and $frontThread -ne $currentThread -and [ObservedActivation]::AttachThreadInput($currentThread,$frontThread,$true)
try{
 if($Maximize){[void][ObservedActivation]::ShowWindow($h,3)}
 [void][ObservedActivation]::BringWindowToTop($h)
 [void][ObservedActivation]::SetForegroundWindow($h)
}finally{if($attached){[void][ObservedActivation]::AttachThreadInput($currentThread,$frontThread,$false)}}
Start-Sleep -Milliseconds 250
$after=[ObservedActivation]::GetForegroundWindow()
$record=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');action='activate-observed-native-window';windowId=$WindowId;pid=$owner;allowedProcess=$AllowedProcess;before=$before.ToInt64();after=$after.ToInt64();foregroundConfirmed=$after -eq $h}
$record|ConvertTo-Json -Compress|Tee-Object -FilePath artifacts/m7-pr234-native-20261005/actions.jsonl -Append
if($after -ne $h){throw 'Observed foreground activation was rejected'}
