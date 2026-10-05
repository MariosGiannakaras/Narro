param([Parameter(Mandatory)][long]$WindowId,[Parameter(Mandatory)][string]$Chord)
$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @'
using System;using System.Runtime.InteropServices;using System.Threading;
public static class M7RealKey {
 [DllImport("user32.dll")]public static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 [DllImport("user32.dll")]static extern void keybd_event(byte v,byte s,uint f,UIntPtr e);
 public static void Send(byte[] scans){try{foreach(byte s in scans){keybd_event(0,s,s==0x4f?9u:8u,UIntPtr.Zero);Thread.Sleep(35);}Thread.Sleep(90);}finally{for(int i=scans.Length-1;i>=0;i--){keybd_event(0,scans[i],scans[i]==0x4f?11u:10u,UIntPtr.Zero);Thread.Sleep(35);}}}
}
'@
if([M7RealKey]::GetForegroundWindow().ToInt64() -ne $WindowId){throw 'Observed target is not foreground'}
$owner=[uint32]0;[void][M7RealKey]::GetWindowThreadProcessId([IntPtr]$WindowId,[ref]$owner)
if((Get-Process -Id $owner).ProcessName -ne 'narro-m7-validation'){throw 'Target is not validation Narro'}
$map=@{Ctrl=0x1d;Alt=0x38;Shift=0x2a;T=0x14;P=0x19;B=0x30;S=0x1f;F=0x21;N=0x31;Escape=0x01;Tab=0x0f;Enter=0x1c;A=0x1e;End=0x4f}
$scans=[byte[]]@($Chord.Split('+')|ForEach-Object{if(-not $map.ContainsKey($_)){throw "Unsupported physical key $_"};$map[$_]})
$r=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');action='physical-scancode-chord';windowId=$WindowId;pid=$owner;chord=$Chord;scancodes=@($scans);injection='keybd_event KEYEVENTF_SCANCODE; normal Windows input path'}
[M7RealKey]::Send($scans)
Start-Sleep -Milliseconds 200
$taskRecord=$r|ConvertTo-Json -Compress; Write-Output $taskRecord; [IO.File]::AppendAllText('E:\SystemFiles\Desktop\NarroUpload\artifacts\m7-pr234-native-20261005\actions.jsonl',$taskRecord+[Environment]::NewLine,[Text.UTF8Encoding]::new($false))

