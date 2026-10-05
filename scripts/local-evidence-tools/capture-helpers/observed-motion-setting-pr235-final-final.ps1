param([ValidateSet('read','normal','reduced')][string]$Mode='read')
$ErrorActionPreference='Stop'
Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;public static class M7MotionSetting{[DllImport("user32.dll",EntryPoint="SystemParametersInfoW",SetLastError=true)] public static extern bool Get(uint a,uint p,out int v,uint f);[DllImport("user32.dll",EntryPoint="SystemParametersInfoW",SetLastError=true)] public static extern bool Set(uint a,uint p,IntPtr v,uint f);}'
$before=0;if(-not [M7MotionSetting]::Get(0x1042,0,[ref]$before,0)){throw 'Motion setting read failed'}
if($Mode -ne 'read'){$value=if($Mode -eq 'normal'){1}else{0};if(-not [M7MotionSetting]::Set(0x1043,0,[IntPtr]$value,3)){throw 'Motion setting change failed'}}
$after=0;[void][M7MotionSetting]::Get(0x1042,0,[ref]$after,0)
$r=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');action='os-client-area-animation';request=$Mode;before=$before;after=$after}
$r|ConvertTo-Json -Compress;$r|ConvertTo-Json -Compress|Add-Content artifacts/m7-pr235-native-20261005/actions.jsonl

