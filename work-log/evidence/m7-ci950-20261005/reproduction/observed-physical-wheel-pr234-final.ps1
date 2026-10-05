param([Parameter(Mandatory)][long]$WindowId,[Parameter(Mandatory)][int]$X,[Parameter(Mandatory)][int]$Y,[Parameter(Mandatory)][int]$Delta)
$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @'
using System;using System.Runtime.InteropServices;using System.Threading;
public static class M7Wheel911{
[DllImport("user32.dll")]public static extern IntPtr GetForegroundWindow();
[DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
[DllImport("user32.dll")]static extern IntPtr SetThreadDpiAwarenessContext(IntPtr p);
[DllImport("user32.dll")]static extern bool SetCursorPos(int x,int y);
[DllImport("user32.dll")]static extern void mouse_event(uint f,uint x,uint y,uint d,UIntPtr e);
public static void Scroll(int x,int y,int delta){var old=SetThreadDpiAwarenessContext(new IntPtr(-4));try{if(!SetCursorPos(x,y))throw new Exception("Pointer failed");Thread.Sleep(100);mouse_event(0x800,0,0,unchecked((uint)delta),UIntPtr.Zero);}finally{SetThreadDpiAwarenessContext(old);}}
}
'@
if([M7Wheel911]::GetForegroundWindow().ToInt64() -ne $WindowId){throw 'Observed target is not foreground'}
$owner=[uint32]0;[void][M7Wheel911]::GetWindowThreadProcessId([IntPtr]$WindowId,[ref]$owner)
if((Get-Process -Id $owner).ProcessName -ne 'narro-m7-validation'){throw 'Target is not validation Narro'}
[M7Wheel911]::Scroll($X,$Y,$Delta)
Start-Sleep -Milliseconds 300
[ordered]@{utc=[DateTime]::UtcNow.ToString('o');action='physical-mouse-wheel';windowId=$WindowId;x=$X;y=$Y;delta=$Delta}|ConvertTo-Json -Compress|Tee-Object -FilePath 'artifacts/m7-pr233-final-physical-20261004/run-final/actions.jsonl' -Append

