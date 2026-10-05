param([Parameter(Mandatory)][long]$WindowId,[Parameter(Mandatory)][string]$Name,[int]$ObservedOrdinal=1,[int]$ExpectedMatchCount=1)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;public static class ObservedSelect234{[DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);}'
$owner=[uint32]0; [void][ObservedSelect234]::GetWindowThreadProcessId([IntPtr]$WindowId,[ref]$owner)
if((Get-Process -Id $owner).ProcessName -ne 'narro-m7-validation'){throw 'Owner changed'}
$root=[Windows.Automation.AutomationElement]::FromHandle([IntPtr]$WindowId)
$condition=[Windows.Automation.AndCondition]::new([Windows.Automation.PropertyCondition]::new([Windows.Automation.AutomationElement]::NameProperty,$Name),[Windows.Automation.PropertyCondition]::new([Windows.Automation.AutomationElement]::ControlTypeProperty,[Windows.Automation.ControlType]::ListItem))
$found=$root.FindAll([Windows.Automation.TreeScope]::Descendants,$condition)
if($found.Count -ne $ExpectedMatchCount -or $ObservedOrdinal -lt 1 -or $ObservedOrdinal -gt $found.Count){throw 'Observed list item multiplicity changed'}
$item=$found.Item($ObservedOrdinal-1); if($item.Current.IsOffscreen -or -not $item.Current.IsEnabled){throw 'List item unavailable'}
$pattern=$null; if(-not $item.TryGetCurrentPattern([Windows.Automation.SelectionItemPattern]::Pattern,[ref]$pattern)){throw 'No SelectionItemPattern'}
$pattern.Select(); Start-Sleep -Milliseconds 250
$r=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');action='native-uia-selection';windowId=$WindowId;name=$Name;observedOrdinal=$ObservedOrdinal;expectedMatches=$ExpectedMatchCount}
$r|ConvertTo-Json -Compress|Tee-Object -Append -FilePath artifacts/m7-pr235-native-20261005/actions.jsonl
