param([long]$WindowId,[int]$X,[int]$Y,[int]$ToX,[int]$ToY,[string]$ExpectedSha256)
$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @'
using System;using System.Runtime.InteropServices;using System.Threading;using System.ComponentModel;
public static class ObservedInput234 {
 [StructLayout(LayoutKind.Sequential)]struct MOUSE{public int x,y;public uint data,flags,time;public UIntPtr extra;}
 [StructLayout(LayoutKind.Explicit,Size=32)]struct UNION{[FieldOffset(0)]public MOUSE mouse;}
 [StructLayout(LayoutKind.Sequential)]struct INPUT{public uint type;public UNION data;}
 [DllImport("user32.dll",SetLastError=true)]static extern uint SendInput(uint n,INPUT[] input,int size);
 [DllImport("user32.dll")]static extern int GetSystemMetrics(int index);
 [DllImport("user32.dll")]public static extern short GetAsyncKeyState(int key);
 [DllImport("user32.dll")]public static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 [DllImport("user32.dll")]static extern IntPtr SetThreadDpiAwarenessContext(IntPtr c);
 static void Send(int x,int y,uint flags){var e=new INPUT();e.data.mouse.x=(int)Math.Round((x-GetSystemMetrics(76))*65535.0/(GetSystemMetrics(78)-1));e.data.mouse.y=(int)Math.Round((y-GetSystemMetrics(77))*65535.0/(GetSystemMetrics(79)-1));e.data.mouse.flags=0xc001u|flags;if(SendInput(1,new[]{e},Marshal.SizeOf(typeof(INPUT)))!=1)throw new Win32Exception(Marshal.GetLastWin32Error());}
 public static void Drag(int x,int y,int tx,int ty){var old=SetThreadDpiAwarenessContext(new IntPtr(-4));try{if(GetAsyncKeyState(1)<0)throw new Exception("Left button already held");Send(x,y,0);Thread.Sleep(250);Send(x,y,2);try{Thread.Sleep(350);if(GetAsyncKeyState(1)>=0)throw new Exception("Actual left-down state absent");for(int i=1;i<=60;i++){Send((int)Math.Round(x+(tx-x)*i/60.0),(int)Math.Round(y+(ty-y)*i/60.0),0);Thread.Sleep(25);}Thread.Sleep(350);}finally{Send(tx,ty,4);}Thread.Sleep(350);}finally{SetThreadDpiAwarenessContext(old);}}
}
'@
if([ObservedInput234]::GetForegroundWindow().ToInt64() -ne $WindowId){throw 'Target not foreground'}
$owner=[uint32]0;[void][ObservedInput234]::GetWindowThreadProcessId([IntPtr]$WindowId,[ref]$owner)
$process=Get-Process -Id $owner
if($process.ProcessName -ne 'narro-m7-validation' -or (Get-FileHash -LiteralPath $process.Path).Hash.ToLowerInvariant() -ne $ExpectedSha256){throw 'Exact executable identity changed'}
$record=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');action='SendInput actual virtual-desktop drag';windowId=$WindowId;from=@($X,$Y);to=@($ToX,$ToY);exeSha256=$ExpectedSha256}
$record|ConvertTo-Json -Compress|Tee-Object -Append -FilePath artifacts/m7-pr235-native-20261005/actions.jsonl
[ObservedInput234]::Drag($X,$Y,$ToX,$ToY)
Write-Output 'SendInput complete; physical button state verified during hold'
