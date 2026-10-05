param([Parameter(Mandatory)][long]$WindowId,[ValidateSet('read','english','greek')][string]$Layout='read')
$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @"
using System;using System.Runtime.InteropServices;
public static class M7FocusedLayout {
[StructLayout(LayoutKind.Sequential)] public struct RECT{public int L,T,R,B;}
[StructLayout(LayoutKind.Sequential)] public struct INFO{public uint cbSize,flags;public IntPtr active,focus,capture,menuOwner,moveSize,caret;public RECT rect;}
[DllImport("user32.dll")] public static extern bool GetGUIThreadInfo(uint t,ref INFO i);
[DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
[DllImport("user32.dll")] public static extern IntPtr GetKeyboardLayout(uint t);
[DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h,uint m,IntPtr w,IntPtr l);
}
"@
$i=[M7FocusedLayout+INFO]::new();$i.cbSize=[Runtime.InteropServices.Marshal]::SizeOf($i);if(-not [M7FocusedLayout]::GetGUIThreadInfo(0,[ref]$i)){throw 'No focused OS input thread'}
if($i.active.ToInt64() -ne $WindowId){throw 'Observed Narro window is not active'}
$p=0u;$t=[M7FocusedLayout]::GetWindowThreadProcessId($i.focus,[ref]$p)
$before=[M7FocusedLayout]::GetKeyboardLayout($t).ToInt64().ToString('x')
if($Layout -ne 'read'){
$target=if($Layout -eq 'english'){[IntPtr]0x4090409}else{[IntPtr]0x4080408}
if(-not [M7FocusedLayout]::PostMessage($i.focus,0x50,[IntPtr]::Zero,$target)){throw 'Layout request failed'}
Start-Sleep -Milliseconds 500
}
$afterInfo=[M7FocusedLayout+INFO]::new();$afterInfo.cbSize=[Runtime.InteropServices.Marshal]::SizeOf($afterInfo);if(-not [M7FocusedLayout]::GetGUIThreadInfo(0,[ref]$afterInfo)){throw 'No current focused OS input thread after layout request'}
$afterOwner=[uint32]0;$afterThread=[M7FocusedLayout]::GetWindowThreadProcessId($afterInfo.focus,[ref]$afterOwner)
$r=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');action='focused-webview-keyboard-layout';request=$Layout;focus=$afterInfo.focus.ToInt64();active=$afterInfo.active.ToInt64();pid=$afterOwner;before=$before;after=[M7FocusedLayout]::GetKeyboardLayout($afterThread).ToInt64().ToString('x');originalFocus=$i.focus.ToInt64();originalThread=$t;currentThread=$afterThread}
$r|ConvertTo-Json -Compress
$r|ConvertTo-Json -Compress|Add-Content artifacts/m7-pr235-native-20261005/actions.jsonl

