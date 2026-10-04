$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @'
using System;using System.Collections.Generic;using System.Runtime.InteropServices;
public static class DisplayModeRead936 {
 [StructLayout(LayoutKind.Sequential,CharSet=CharSet.Unicode)] public struct Device {public int cb;[MarshalAs(UnmanagedType.ByValTStr,SizeConst=32)]public string name;[MarshalAs(UnmanagedType.ByValTStr,SizeConst=128)]public string description;public uint flags;[MarshalAs(UnmanagedType.ByValTStr,SizeConst=128)]public string id;[MarshalAs(UnmanagedType.ByValTStr,SizeConst=128)]public string key;}
 [DllImport("user32.dll",CharSet=CharSet.Unicode)]static extern bool EnumDisplayDevices(string name,uint n,ref Device device,uint flags);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)]static extern bool EnumDisplaySettings(string name,int mode,IntPtr data);
 public static object[] Read(){var a=new List<object>();for(uint i=0;i<20;i++){var d=new Device{cb=Marshal.SizeOf(typeof(Device))};if(!EnumDisplayDevices(null,i,ref d,0))break;var monitors=new List<object>();for(uint j=0;j<10;j++){var mon=new Device{cb=Marshal.SizeOf(typeof(Device))};if(!EnumDisplayDevices(d.name,j,ref mon,0))break;monitors.Add(new {mon.name,mon.description,mon.flags});}var modes=new List<object>();IntPtr dm=Marshal.AllocHGlobal(220);try{foreach(int m in new int[]{-1,-2,0}){Marshal.Copy(new byte[220],0,dm,220);Marshal.WriteInt16(dm,68,220);bool ok=EnumDisplaySettings(d.name,m,dm);modes.Add(new {mode=m,ok,x=Marshal.ReadInt32(dm,76),y=Marshal.ReadInt32(dm,80),w=Marshal.ReadInt32(dm,172),h=Marshal.ReadInt32(dm,176),hz=Marshal.ReadInt32(dm,184),bits=Marshal.ReadInt32(dm,168),fields=Marshal.ReadInt32(dm,72)});}}finally{Marshal.FreeHGlobal(dm);}a.Add(new {d.name,d.description,d.flags,monitors,modes});}return a.ToArray();}
}
'@
$result=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');devices=[DisplayModeRead936]::Read()}
$json=$result|ConvertTo-Json -Depth 8
[IO.File]::WriteAllText((Join-Path (Get-Location) 'artifacts/m7-ci936-physical-20261004/run-final/observations/display-device-modes-now.json'),$json,[Text.UTF8Encoding]::new($false))
$json
