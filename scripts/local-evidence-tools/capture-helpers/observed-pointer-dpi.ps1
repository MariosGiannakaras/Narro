param([ValidateSet('hover','click')][string]$Action='click',[Parameter(Mandatory)][int]$X,[Parameter(Mandatory)][int]$Y,[ValidateSet('left','right')][string]$Button='left')
$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @"
using System; using System.Threading; using System.Runtime.InteropServices;
public static class M7ObservedPointer {
 [StructLayout(LayoutKind.Sequential)] public struct POINT {public int X,Y;}
 [DllImport("user32.dll")] static extern IntPtr SetThreadDpiAwarenessContext(IntPtr v);
 [DllImport("user32.dll")] static extern bool SetCursorPos(int x,int y);
 [DllImport("user32.dll")] static extern bool GetPhysicalCursorPos(out POINT p);
 [DllImport("user32.dll")] static extern void mouse_event(uint flags,uint x,uint y,uint data,UIntPtr extra);
 public static string Act(string action,int x,int y,bool right) {IntPtr old=SetThreadDpiAwarenessContext(new IntPtr(-4));try {
  if(!SetCursorPos(x,y)) throw new Exception("SetCursorPos failed");Thread.Sleep(350);
  if(action=="click") {mouse_event(right?8u:2u,0,0,0,UIntPtr.Zero);Thread.Sleep(100);mouse_event(right?16u:4u,0,0,0,UIntPtr.Zero);Thread.Sleep(250);}
  POINT p;GetPhysicalCursorPos(out p);return "physicalCursor="+p.X+","+p.Y;
 }finally{SetThreadDpiAwarenessContext(old);}}
}
"@
[M7ObservedPointer]::Act($Action,$X,$Y,($Button -eq 'right'))
