param([long]$WindowId=26937174,[string]$Tag='baseline',[int]$HoldAfterBoundaryMs=180)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing,UIAutomationClient,UIAutomationTypes
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.Drawing;using System.Drawing.Imaging;using System.Runtime.InteropServices;using System.Threading;using System.Diagnostics;
public static class M7ChildHoldProbe {
 [StructLayout(LayoutKind.Sequential)] public struct R{public int L,T,Ri,B;}
 [DllImport("user32.dll")]static extern IntPtr SetThreadDpiAwarenessContext(IntPtr c);
 [DllImport("user32.dll")]static extern bool GetWindowRect(IntPtr h,out R r);
 [DllImport("user32.dll")]static extern uint GetDpiForWindow(IntPtr h);
 [DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 [DllImport("user32.dll")]static extern bool SetCursorPos(int x,int y);
 [DllImport("user32.dll")]static extern void mouse_event(uint f,uint x,uint y,uint d,UIntPtr e);
 [DllImport("user32.dll",CharSet=CharSet.Unicode,SetLastError=true)]static extern IntPtr CreateWindowExW(uint ex,string cls,string title,uint style,int x,int y,int w,int h,IntPtr parent,IntPtr menu,IntPtr instance,IntPtr param);
 [DllImport("user32.dll")]static extern IntPtr SendMessageW(IntPtr h,uint m,IntPtr w,IntPtr l);
 [DllImport("user32.dll")]static extern bool SetWindowPos(IntPtr h,IntPtr after,int x,int y,int w,int z,uint f);
 [DllImport("user32.dll")]static extern bool UpdateWindow(IntPtr h);
 [DllImport("user32.dll")]static extern bool DestroyWindow(IntPtr h);
 [DllImport("user32.dll")]static extern int GetWindowRgn(IntPtr h,IntPtr r);
 [DllImport("user32.dll")]static extern int SetWindowRgn(IntPtr h,IntPtr r,bool redraw);
 [DllImport("gdi32.dll")]static extern IntPtr CreateRectRgn(int l,int t,int r,int b);
 [DllImport("gdi32.dll")]static extern IntPtr CreateRoundRectRgn(int l,int t,int r,int b,int ew,int eh);
 [DllImport("gdi32.dll")]static extern int GetRgnBox(IntPtr r,out R b);
 [DllImport("gdi32.dll")]static extern bool DeleteObject(IntPtr r);
 [DllImport("dwmapi.dll")]static extern int DwmFlush();
 public static string Click(long id,int x,int y,bool hold,string capture,int holdAfterBoundaryMs){
  IntPtr old=SetThreadDpiAwarenessContext(new IntPtr(-4));var parent=new IntPtr(id);IntPtr child=IntPtr.Zero,bmp=IntPtr.Zero,region=IntPtr.Zero;bool changed=false;int delay=-1;long childId=0;
  try{
   R outer;GetWindowRect(parent,out outer);int width=outer.Ri-outer.L,height=(int)Math.Round(110.0*GetDpiForWindow(parent)/96.0);
   if(hold){using(var image=new Bitmap(width,height,PixelFormat.Format24bppRgb))using(var graphics=Graphics.FromImage(image)){graphics.CopyFromScreen(outer.L,outer.T,0,0,image.Size);image.Save(capture,ImageFormat.Png);bmp=image.GetHbitmap();}}
   SetCursorPos(x,y);Thread.Sleep(100);mouse_event(2,0,0,0,UIntPtr.Zero);Thread.Sleep(80);mouse_event(4,0,0,0,UIntPtr.Zero);
   var clock=Stopwatch.StartNew();
   if(hold){
    Thread.Sleep(5);
    child=CreateWindowExW(4,"STATIC","M7 experimental child raster",0x40000000|0x04000000|0x0000000E,0,0,width,height,parent,IntPtr.Zero,IntPtr.Zero,IntPtr.Zero);
    if(child==IntPtr.Zero)throw new Exception("Child CreateWindowEx failed "+Marshal.GetLastWin32Error());
    childId=child.ToInt64();SendMessageW(child,0x172,IntPtr.Zero,bmp);
    int diameter=(int)Math.Round(32.0*GetDpiForWindow(parent)/96.0);
    var rounded=CreateRoundRectRgn(0,0,width+1,height+1,diameter,diameter);if(SetWindowRgn(child,rounded,false)==0)DeleteObject(rounded);
    SetWindowPos(child,IntPtr.Zero,0,0,width,height,0x50);UpdateWindow(child);DwmFlush();
   }
   region=CreateRectRgn(0,0,0,0);R box;
   while(clock.ElapsedMilliseconds<1800){GetWindowRgn(parent,region);GetRgnBox(region,out box);if(box.B==height){changed=true;delay=(int)clock.ElapsedMilliseconds;break;}Thread.Sleep(2);}
   if(hold)Thread.Sleep(holdAfterBoundaryMs);else Thread.Sleep(250);
   return "child="+childId+",nativeCompactObserved="+changed+",boundaryDelayMs="+delay;
  } finally {
   if(child!=IntPtr.Zero){var actual=SendMessageW(child,0x172,IntPtr.Zero,IntPtr.Zero);DestroyWindow(child);if(actual!=IntPtr.Zero&&actual!=bmp)DeleteObject(actual);}
   if(bmp!=IntPtr.Zero)DeleteObject(bmp);if(region!=IntPtr.Zero)DeleteObject(region);SetThreadDpiAwarenessContext(old);
  }
 }
}
'@
$owner=[uint32]0;[void][M7ChildHoldProbe]::GetWindowThreadProcessId([IntPtr]$WindowId,[ref]$owner)
if((Get-Process -Id $owner).ProcessName -ne 'narro-m7-validation'){throw 'Target is not the exact validation process'}
$run='artifacts/m7-ci932-physical-20261004/run-final'
& "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId 3409860 -Name 'Start Recording' -AllowedProcess obs64 -LogFile "$run/actions.jsonl"
try {
 foreach($case in @("child-$Tag-control","child-$Tag-raster-hold")){
  @{utc=[DateTime]::UtcNow.ToString('o');action='EXPERIMENTAL-child-hold';case=$case;windowId=$WindowId;notOfficialAcceptance=$true;temporaryNativeChildNotWebview=$true}|ConvertTo-Json -Compress|Tee-Object -FilePath "$run/actions.jsonl" -Append
  $null=& "$PSScriptRoot/observe-ci893-windows.ps1" -WindowId $WindowId -Output "$run/observations/experiment-$case-start.json"
  foreach($i in 1..3){
   & "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId $WindowId -Name 'Expand Floating Timer' -LogFile "$run/actions.jsonl"
   Start-Sleep -Milliseconds 650
   $prior=[M7ChildHoldProbe]::GetWindowThreadProcessId([IntPtr]$WindowId,[ref]$owner)
   $ui=[Windows.Automation.AutomationElement]::FromHandle([IntPtr]$WindowId)
   $button=$ui.FindFirst([Windows.Automation.TreeScope]::Descendants,[Windows.Automation.PropertyCondition]::new([Windows.Automation.AutomationElement]::NameProperty,'Collapse Floating Timer'))
   if(-not $button -or -not $button.Current.IsEnabled -or $button.Current.IsOffscreen){throw 'No enabled visible Collapse control'}
   $bounds=$button.Current.BoundingRectangle
   $action=@{utc=[DateTime]::UtcNow.ToString('o');action='EXPERIMENTAL-observed-pointer-click';button='Collapse Floating Timer';windowId=$WindowId;bounds=$bounds.ToString();case=$case;cycle=$i}
   $action|ConvertTo-Json -Compress|Tee-Object -FilePath "$run/actions.jsonl" -Append
   $result=[M7ChildHoldProbe]::Click($WindowId,[int]($bounds.Left+$bounds.Width/2),[int]($bounds.Top+$bounds.Height/2),$case.EndsWith('raster-hold'),[IO.Path]::GetFullPath("$run/observations/experiment-$case-$i-raster.png"),$HoldAfterBoundaryMs)
   @{utc=[DateTime]::UtcNow.ToString('o');action='EXPERIMENTAL-child-hold-completed';case=$case;cycle=$i;result=$result;childDestroyedInFinally=$true;fixedDelayIsDiagnosticOnly=$true}|ConvertTo-Json -Compress|Tee-Object -FilePath "$run/actions.jsonl" -Append
   Start-Sleep -Milliseconds 650
  }
 }
} finally {
 & "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId 3409860 -Name 'Stop Recording' -AllowedProcess obs64 -LogFile "$run/actions.jsonl"
}
