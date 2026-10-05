param([Parameter(Mandatory)][string]$Output)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
public static class M7PhysicalDesktop {
 [DllImport("user32.dll")] static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
 [DllImport("user32.dll")] static extern int GetSystemMetrics(int index);
 public static string Capture(string path) {
  IntPtr old=SetThreadDpiAwarenessContext(new IntPtr(-4));
  try { int x=GetSystemMetrics(76),y=GetSystemMetrics(77),w=GetSystemMetrics(78),h=GetSystemMetrics(79);
   using(Bitmap b=new Bitmap(w,h)) using(Graphics g=Graphics.FromImage(b)) {g.CopyFromScreen(x,y,0,0,b.Size);b.Save(path,ImageFormat.Png);}
   return "x="+x+",y="+y+",width="+w+",height="+h;
  } finally {SetThreadDpiAwarenessContext(old);}
 }
}
"@
[M7PhysicalDesktop]::Capture([IO.Path]::GetFullPath($Output))
