param([Parameter(Mandatory)][long]$WindowId,[Parameter(Mandatory)][string]$Name)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;public static class M7ControlFocus{[DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);[DllImport("user32.dll")]public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr c);}'
$owner=0u;[void][M7ControlFocus]::GetWindowThreadProcessId([IntPtr]$WindowId,[ref]$owner)
if((Get-Process -Id $owner).ProcessName -ne 'narro-m7-validation'){throw 'Validation window owner changed'}
$old=[M7ControlFocus]::SetThreadDpiAwarenessContext([IntPtr]::new(-4))
try {
 $root=[Windows.Automation.AutomationElement]::FromHandle([IntPtr]$WindowId)
 $all=$root.FindAll([Windows.Automation.TreeScope]::Descendants,[Windows.Automation.PropertyCondition]::new([Windows.Automation.AutomationElement]::NameProperty,$Name))
 $matches=@($all | Where-Object {$_.Current.IsEnabled -and $_.Current.IsKeyboardFocusable})
 if($matches.Count -ne 1){throw "Expected one focusable '$Name', found $($matches.Count)"}
 $target=$matches[0];$target.SetFocus();Start-Sleep -Milliseconds 300
 [ordered]@{utc=[DateTime]::UtcNow.ToString('o');action='native-uia-setfocus';windowId=$WindowId;name=$Name;bounds=$target.Current.BoundingRectangle.ToString()} | ConvertTo-Json -Compress | Tee-Object -Append -FilePath 'E:\SystemFiles\Desktop\NarroUpload\artifacts\m7-pr234-native-20261005\actions.jsonl'
}finally{[void][M7ControlFocus]::SetThreadDpiAwarenessContext($old)}

