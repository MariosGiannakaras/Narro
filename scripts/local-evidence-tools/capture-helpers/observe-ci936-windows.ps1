param([long]$WindowId=0,[string]$Output='')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -TypeDefinition @'
using System;using System.Runtime.InteropServices;using System.Text;
public static class M7NativeObserve{
 public delegate bool E(IntPtr h,IntPtr p);
 [StructLayout(LayoutKind.Sequential)] public struct R{public int L,T,Ri,B;}
 [StructLayout(LayoutKind.Sequential)] public struct P{public int X,Y;}
 [DllImport("user32.dll")]public static extern bool EnumWindows(E e,IntPtr p);
 [DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)]public static extern int GetWindowText(IntPtr h,StringBuilder b,int n);
 [DllImport("user32.dll")]public static extern bool IsWindowVisible(IntPtr h);
 [DllImport("user32.dll")]public static extern bool GetWindowRect(IntPtr h,out R r);
 [DllImport("user32.dll")]public static extern bool GetClientRect(IntPtr h,out R r);
 [DllImport("user32.dll")]public static extern bool ClientToScreen(IntPtr h,ref P p);
 [DllImport("user32.dll")]public static extern uint GetDpiForWindow(IntPtr h);
 [DllImport("user32.dll")]public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr p);
}
'@
$prev=[M7NativeObserve]::SetThreadDpiAwarenessContext([IntPtr](-4))
try{
$rows=[Collections.Generic.List[object]]::new()
$callback=[M7NativeObserve+E]{param($h,$unused)
 $procid=[uint32]0;[void][M7NativeObserve]::GetWindowThreadProcessId($h,[ref]$procid)
 $p=Get-Process -Id $procid -ErrorAction SilentlyContinue
 if($p.ProcessName -in @('narro-m7-validation','narro','obs64')){
 $b=[Text.StringBuilder]::new(512);[void][M7NativeObserve]::GetWindowText($h,$b,512)
 $r=[M7NativeObserve+R]::new();$c=[M7NativeObserve+R]::new();$pt=[M7NativeObserve+P]::new()
 [void][M7NativeObserve]::GetWindowRect($h,[ref]$r);[void][M7NativeObserve]::GetClientRect($h,[ref]$c);[void][M7NativeObserve]::ClientToScreen($h,[ref]$pt)
 $rows.Add([pscustomobject]@{hwnd=$h.ToInt64();pid=$procid;process=$p.ProcessName;title=$b.ToString();visible=[M7NativeObserve]::IsWindowVisible($h);dpi=[M7NativeObserve]::GetDpiForWindow($h);outer=@{x=$r.L;y=$r.T;width=$r.Ri-$r.L;height=$r.B-$r.T};client=@{x=$pt.X;y=$pt.Y;width=$c.Ri;height=$c.B}})
 };return $true
}
[void][M7NativeObserve]::EnumWindows($callback,[IntPtr]::Zero)
$elements=@()
if($WindowId){
$root=[Windows.Automation.AutomationElement]::FromHandle([IntPtr]$WindowId)
$all=$root.FindAll([Windows.Automation.TreeScope]::Descendants,[Windows.Automation.Condition]::TrueCondition)
$elements=@(foreach($e in $all){$v=$e.Current;if($v.Name -or $v.ControlType -eq [Windows.Automation.ControlType]::Edit){[ordered]@{name=$v.Name;type=$v.ControlType.ProgrammaticName;offscreen=$v.IsOffscreen;focus=$v.HasKeyboardFocus;enabled=$v.IsEnabled;bounds=$v.BoundingRectangle.ToString()}}})
}
$result=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');windows=@($rows);elements=$elements}
$json=$result|ConvertTo-Json -Depth 8
if($Output){[IO.File]::WriteAllText([IO.Path]::GetFullPath($Output),$json,[Text.UTF8Encoding]::new($false))}
$json
}finally{[void][M7NativeObserve]::SetThreadDpiAwarenessContext($prev)}
