$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.Drawing;using System.Drawing.Imaging;using System.Runtime.InteropServices;
public static class M7OwnDcProbe {
 [DllImport("user32.dll")]static extern IntPtr GetDC(IntPtr h);
 [DllImport("user32.dll")]static extern int ReleaseDC(IntPtr h,IntPtr d);
 [DllImport("gdi32.dll")]static extern IntPtr CreateCompatibleDC(IntPtr d);
 [DllImport("gdi32.dll")]static extern IntPtr CreateCompatibleBitmap(IntPtr d,int w,int h);
 [DllImport("gdi32.dll")]static extern IntPtr SelectObject(IntPtr d,IntPtr o);
 [DllImport("gdi32.dll")]static extern bool BitBlt(IntPtr d,int x,int y,int w,int h,IntPtr s,int sx,int sy,uint r);
 [DllImport("gdi32.dll")]static extern bool DeleteObject(IntPtr o);
 [DllImport("gdi32.dll")]static extern bool DeleteDC(IntPtr d);
 [DllImport("dwmapi.dll")]static extern int DwmFlush();
 public static void Capture(long hwnd,string file){var h=new IntPtr(hwnd);DwmFlush();var source=GetDC(h);var dc=CreateCompatibleDC(source);var bitmap=CreateCompatibleBitmap(source,340,110);var previous=SelectObject(dc,bitmap);try{if(!BitBlt(dc,0,0,340,110,source,0,0,0xCC0020))throw new Exception("Capture failed");using(var image=Image.FromHbitmap(bitmap)){image.Save(file,ImageFormat.Png);}}finally{SelectObject(dc,previous);DeleteObject(bitmap);DeleteDC(dc);ReleaseDC(h,source);}}
}
'@
[M7OwnDcProbe]::Capture(26937174,[IO.Path]::GetFullPath('artifacts/m7-ci932-physical-20261004/run-final/observations/own-hwnd-client-dc-probe.png'))
