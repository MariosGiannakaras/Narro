param([long]$WindowId=1181574,[string]$Output)
$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @'
using System;using System.Runtime.InteropServices;using System.Threading;using System.IO;using System.Text;
public static class M7BoundaryWatch{
 [StructLayout(LayoutKind.Sequential)] public struct R{public int L,T,Ri,B;}
 [DllImport("user32.dll")]static extern IntPtr GetWindowLongPtrW(IntPtr h,int n);
 [DllImport("user32.dll")]static extern bool GetWindowRect(IntPtr h,out R r);
 [DllImport("user32.dll")]static extern bool GetClientRect(IntPtr h,out R r);
 [DllImport("user32.dll")]static extern int GetWindowRgn(IntPtr h,IntPtr r);
 [DllImport("user32.dll")]static extern bool IsWindowVisible(IntPtr h);
 [DllImport("user32.dll")]static extern bool IsHungAppWindow(IntPtr h);
 [DllImport("user32.dll")]static extern IntPtr GhostWindowFromHungWindow(IntPtr h);
 [DllImport("gdi32.dll")]static extern IntPtr CreateRectRgn(int l,int t,int r,int b);
 [DllImport("gdi32.dll")]static extern int GetRgnBox(IntPtr h,out R r);
 [DllImport("gdi32.dll")]static extern bool DeleteObject(IntPtr h);
 static Thread thread; public static void Start(long id,string path){thread=new Thread(()=>{var h=new IntPtr(id);var rg=CreateRectRgn(0,0,0,0);try{using(var w=new StreamWriter(path,false,new UTF8Encoding(false))){w.WriteLine("utc,style,exstyle,x,y,width,height,clientWidth,clientHeight,regionType,regionWidth,regionHeight,visible,hung,ghostHwnd");var clock=System.Diagnostics.Stopwatch.StartNew();while(clock.ElapsedMilliseconds<12500){R a,c,r;GetWindowRect(h,out a);GetClientRect(h,out c);int rt=GetWindowRgn(h,rg);GetRgnBox(rg,out r);w.WriteLine(DateTime.UtcNow.ToString("o")+","+GetWindowLongPtrW(h,-16).ToInt64().ToString("X")+","+GetWindowLongPtrW(h,-20).ToInt64().ToString("X")+","+a.L+","+a.T+","+(a.Ri-a.L)+","+(a.B-a.T)+","+c.Ri+","+c.B+","+rt+","+(r.Ri-r.L)+","+(r.B-r.T)+","+IsWindowVisible(h)+","+IsHungAppWindow(h)+","+GhostWindowFromHungWindow(h).ToInt64());Thread.Sleep(2);}}}finally{DeleteObject(rg);}});thread.Start();} public static void Finish(){thread.Join();}
}
'@
if(-not $Output){throw 'Output required'}
[M7BoundaryWatch]::Start($WindowId,[IO.Path]::GetFullPath($Output))
$log='artifacts/m7-ci932-physical-20261004/run-final/actions.jsonl'
try{
 foreach($i in 1..3){
  & "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId $WindowId -Name 'Expand Floating Timer' -LogFile $log
  Start-Sleep -Milliseconds 350
  & "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId $WindowId -Name 'Collapse Floating Timer' -LogFile $log
  Start-Sleep -Milliseconds 350
 }
}finally{[M7BoundaryWatch]::Finish()}
$rows=Import-Csv -LiteralPath $Output
$rows|Group-Object style,exstyle,clientWidth,clientHeight,regionWidth,regionHeight,visible,hung,ghostHwnd|Select-Object Count,Name|ConvertTo-Json
