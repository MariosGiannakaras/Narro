param([long]$WindowId=26937174)
$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @'
using System;using System.Runtime.InteropServices;using System.Threading;using System.IO;using System.Text;using System.Diagnostics;
public static class M7RepaintProbe{
 [StructLayout(LayoutKind.Sequential)]public struct R{public int L,T,Ri,B;}
 [DllImport("gdi32.dll")]static extern IntPtr CreateRectRgn(int l,int t,int r,int b);
 [DllImport("gdi32.dll")]static extern bool DeleteObject(IntPtr r);
 [DllImport("gdi32.dll")]static extern int GetRgnBox(IntPtr r,out R b);
 [DllImport("user32.dll")]static extern int GetWindowRgn(IntPtr h,IntPtr r);
 [DllImport("user32.dll")]static extern int SetWindowRgn(IntPtr h,IntPtr r,bool redraw);
 [DllImport("user32.dll")]static extern bool RedrawWindow(IntPtr h,IntPtr rect,IntPtr region,uint flags);
 [DllImport("winmm.dll")]static extern uint timeBeginPeriod(uint p);
 [DllImport("winmm.dll")]static extern uint timeEndPeriod(uint p);
 static Thread worker;
 public static void Start(long id,string mode,string path){worker=new Thread(()=>{var h=new IntPtr(id);var region=CreateRectRgn(0,0,0,0);timeBeginPeriod(1);try{using(var w=new StreamWriter(path,false,new UTF8Encoding(false))){w.WriteLine("utc,mode,beforeHeight,afterHeight,operationSuccess");GetWindowRgn(h,region);R box;GetRgnBox(region,out box);int previous=box.B;var clock=Stopwatch.StartNew();while(clock.ElapsedMilliseconds<13000){GetWindowRgn(h,region);GetRgnBox(region,out box);if(previous==300&&box.B==110){bool ok=true;if(mode=="region-redraw"){var copy=CreateRectRgn(box.L,box.T,box.Ri,box.B);ok=SetWindowRgn(h,copy,true)!=0;if(!ok)DeleteObject(copy);}else if(mode=="validate-parent"){ok=RedrawWindow(h,IntPtr.Zero,IntPtr.Zero,0x868);}else if(mode=="redraw-children"){ok=RedrawWindow(h,IntPtr.Zero,IntPtr.Zero,0x1A1);}w.WriteLine(DateTime.UtcNow.ToString("o")+","+mode+","+previous+","+box.B+","+ok);w.Flush();}previous=box.B;Thread.Sleep(1);}}}finally{timeEndPeriod(1);DeleteObject(region);}});worker.Start();}
 public static void Finish(){worker.Join();}
}
'@
$run='artifacts/m7-ci932-physical-20261004/run-final'
& "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId 3409860 -Name 'Start Recording' -AllowedProcess obs64 -LogFile "$run/actions.jsonl"
try{
 foreach($mode in @('validate-parent','redraw-children')){
  @{utc=[DateTime]::UtcNow.ToString('o');action='EXPERIMENTAL-repaint-boundary';case=$mode;windowId=$WindowId;notOfficialAcceptance=$true}|ConvertTo-Json -Compress|Tee-Object -FilePath "$run/actions.jsonl" -Append
  $null=& "$PSScriptRoot/observe-ci893-windows.ps1" -WindowId $WindowId -Output "$run/observations/experiment-repaint-$mode-start.json"
  [M7RepaintProbe]::Start($WindowId,$mode,[IO.Path]::GetFullPath("$run/observations/experiment-repaint-$mode.csv"))
  try{
   foreach($i in 1..3){
    & "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId $WindowId -Name 'Expand Floating Timer' -LogFile "$run/actions.jsonl"
    Start-Sleep -Milliseconds 1300
    & "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId $WindowId -Name 'Collapse Floating Timer' -LogFile "$run/actions.jsonl"
    Start-Sleep -Milliseconds 1300
   }
  }finally{[M7RepaintProbe]::Finish()}
  Get-Content "$run/observations/experiment-repaint-$mode.csv"
 }
}finally{
 & "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId 3409860 -Name 'Stop Recording' -AllowedProcess obs64 -LogFile "$run/actions.jsonl"
}
