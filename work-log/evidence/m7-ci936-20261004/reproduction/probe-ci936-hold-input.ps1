param([long]$WindowId=1247064,[ValidateSet('key','pointer')][string]$Action='key',[int]$X=1144,[int]$Y=553)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -TypeDefinition @'
using System;using System.Text;using System.Collections.Generic;using System.Runtime.InteropServices;using System.Threading;
public static class M7HoldProbe {
 public delegate bool EnumProc(IntPtr h,IntPtr p);
 [DllImport("user32.dll")]static extern bool EnumChildWindows(IntPtr h,EnumProc f,IntPtr p);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)]static extern int GetClassName(IntPtr h,StringBuilder s,int n);
 [DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 [DllImport("user32.dll")]static extern bool SetForegroundWindow(IntPtr h);
 [DllImport("user32.dll")]static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")]public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr h);
 [DllImport("user32.dll")]static extern bool SetCursorPos(int x,int y);
 [DllImport("user32.dll")]static extern void mouse_event(uint f,uint x,uint y,uint d,UIntPtr e);
 [DllImport("user32.dll")]static extern void keybd_event(byte b,byte s,uint f,UIntPtr e);
 [DllImport("user32.dll")]public static extern uint GetGuiResources(IntPtr h,uint f);
 public static long Find(IntPtr h){long found=0;EnumChildWindows(h,(c,p)=>{var s=new StringBuilder(200);GetClassName(c,s,200);if(s.ToString()=="NarroFocusRegionFrame")found=c.ToInt64();return true;},IntPtr.Zero);return found;}
 public static void Key(IntPtr h){SetForegroundWindow(h);if(GetForegroundWindow()!=h)throw new Exception("Focus foreground rejected");keybd_event(0,0x1d,8,UIntPtr.Zero);keybd_event(0,0x38,8,UIntPtr.Zero);keybd_event(0,0x19,8,UIntPtr.Zero);Thread.Sleep(40);keybd_event(0,0x19,10,UIntPtr.Zero);keybd_event(0,0x38,10,UIntPtr.Zero);keybd_event(0,0x1d,10,UIntPtr.Zero);}
 public static void Click(int x,int y){if(!SetCursorPos(x,y))throw new Exception("Pointer rejected");mouse_event(2,0,0,0,UIntPtr.Zero);Thread.Sleep(40);mouse_event(4,0,0,0,UIntPtr.Zero);}
 public static void Hover(int x,int y){if(!SetCursorPos(x,y))throw new Exception("Pointer rejected");}
}
'@
$owner=[uint32]0;[void][M7HoldProbe]::GetWindowThreadProcessId([IntPtr]$WindowId,[ref]$owner)
$p=Get-Process -Id $owner
if($p.ProcessName -ne 'narro-m7-validation'){throw 'Unexpected target owner'}
[void][M7HoldProbe]::SetThreadDpiAwarenessContext([IntPtr]::new(-4))
$root=[Windows.Automation.AutomationElement]::FromHandle([IntPtr]$WindowId)
$condition=[Windows.Automation.PropertyCondition]::new([Windows.Automation.AutomationElement]::NameProperty,'Collapse Floating Timer')
$b=$root.FindAll([Windows.Automation.TreeScope]::Descendants,$condition)
if($b.Count -ne 1 -or -not $b[0].Current.IsEnabled){throw 'Fresh unique Collapse missing'}
$bounds=$b[0].Current.BoundingRectangle
$record=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');action="Collapse and physical $Action during observed native pixel child";pid=$owner;hwnd=$WindowId;gdiBefore=[M7HoldProbe]::GetGuiResources($p.Handle,0);userBefore=[M7HoldProbe]::GetGuiResources($p.Handle,1);samples=@();keySent=$false}
[M7HoldProbe]::Click([int]($bounds.Left+$bounds.Width/2),[int]($bounds.Top+$bounds.Height/2));$clock=[Diagnostics.Stopwatch]::StartNew();$sent=$false;$samples=[Collections.Generic.List[object]]::new()
while($clock.ElapsedMilliseconds -lt 1800){
 $child=[M7HoldProbe]::Find([IntPtr]$WindowId)
 $samples.Add([ordered]@{ms=$clock.ElapsedMilliseconds;child=$child})
 if($child -ne 0 -and -not $sent){
  if($Action -eq 'key'){Start-Sleep -Milliseconds 80;[M7HoldProbe]::Key([IntPtr]$WindowId)}
  else{[M7HoldProbe]::Hover($X,$Y);Start-Sleep -Milliseconds 150;[M7HoldProbe]::Click($X,$Y)}
  $record.keyMs=$clock.ElapsedMilliseconds;$sent=$true
 }
 Start-Sleep -Milliseconds 10
}
$record.samples=$samples.ToArray();$record.keySent=$sent;$record.gdiAfter=[M7HoldProbe]::GetGuiResources($p.Handle,0);$record.userAfter=[M7HoldProbe]::GetGuiResources($p.Handle,1)
$path="E:\SystemFiles\Desktop\NarroUpload\artifacts\m7-ci936-physical-20261004\run-final\hold-input-$Action-probe.json"
[IO.File]::WriteAllText($path,($record|ConvertTo-Json -Depth 6),[Text.UTF8Encoding]::new($false))
$summary=[ordered]@{};foreach($k in $record.Keys){if($k -ne 'samples'){$summary[$k]=$record[$k]}};$summary|ConvertTo-Json -Compress
[IO.File]::AppendAllText('E:\SystemFiles\Desktop\NarroUpload\artifacts\m7-ci936-physical-20261004\run-final\actions.jsonl',($summary|ConvertTo-Json -Compress)+[Environment]::NewLine,[Text.UTF8Encoding]::new($false))
if(-not $sent){throw 'Native hold child never observed; input test not performed'}
