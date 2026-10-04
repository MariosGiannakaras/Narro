param([Parameter(Mandatory)][long]$WindowId,[Parameter(Mandatory)][int]$X,[Parameter(Mandatory)][int]$Y,[Parameter(Mandatory)][int]$ToX,[Parameter(Mandatory)][int]$ToY,[Parameter(Mandatory)][string]$ExpectedSha256)
$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @'
using System;using System.Runtime.InteropServices;using System.Threading;
public static class M7FinalDrag{
 [DllImport("user32.dll")]static extern IntPtr SetThreadDpiAwarenessContext(IntPtr p);
 [DllImport("user32.dll")]static extern bool SetCursorPos(int x,int y);
 [DllImport("user32.dll")]static extern void mouse_event(uint f,uint x,uint y,uint d,UIntPtr e);
 [DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 [DllImport("user32.dll")]public static extern IntPtr GetForegroundWindow();
 public static void Drag(int x,int y,int tx,int ty){var old=SetThreadDpiAwarenessContext(new IntPtr(-4));try{if(!SetCursorPos(x,y))throw new Exception("Pointer failed");Thread.Sleep(250);mouse_event(2,0,0,0,UIntPtr.Zero);try{Thread.Sleep(350);for(int i=1;i<=40;i++){SetCursorPos((int)Math.Round(x+(tx-x)*i/40.0),(int)Math.Round(y+(ty-y)*i/40.0));Thread.Sleep(20);}Thread.Sleep(150);}finally{mouse_event(4,0,0,0,UIntPtr.Zero);}}finally{SetThreadDpiAwarenessContext(old);}}
}
'@
$windowOwner=[uint32]0;[void][M7FinalDrag]::GetWindowThreadProcessId([IntPtr]$WindowId,[ref]$windowOwner)
$root=Get-Process -Id $windowOwner
if($root.ProcessName -notin @('narro','narro-m7-validation') -or (Get-FileHash -LiteralPath $root.Path -Algorithm SHA256).Hash.ToLowerInvariant() -ne $ExpectedSha256){throw 'Observed executable identity changed'}
if([M7FinalDrag]::GetForegroundWindow().ToInt64() -ne $WindowId){throw 'Observed drag target is not foreground'}
$r=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');action='DPI-aware actual pointer drag';windowId=$WindowId;pid=$windowOwner;exeSha256=$ExpectedSha256;from=@{x=$X;y=$Y};to=@{x=$ToX;y=$ToY}}
[IO.File]::AppendAllText('E:\SystemFiles\Desktop\NarroUpload\artifacts\m7-ci942-physical-20261004\run-final\actions.jsonl',($r|ConvertTo-Json -Compress)+[Environment]::NewLine,[Text.UTF8Encoding]::new($false))
[M7FinalDrag]::Drag($X,$Y,$ToX,$ToY)
$r | ConvertTo-Json -Compress
