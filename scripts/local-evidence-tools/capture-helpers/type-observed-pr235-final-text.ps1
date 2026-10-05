param([Parameter(Mandatory)][long]$WindowId,[Parameter(Mandatory)][string]$FieldName,[Parameter(Mandatory)][string]$Text,[Parameter(Mandatory)][string]$ExpectedSha256)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -TypeDefinition @'
using System;using System.Runtime.InteropServices;
public static class ObservedUnicodeInput {
 [StructLayout(LayoutKind.Sequential)]public struct KEY{public ushort vk,scan;public uint flags,time;public UIntPtr extra;}
 [StructLayout(LayoutKind.Explicit,Size=32)]public struct UNION{[FieldOffset(0)]public KEY key;}
 [StructLayout(LayoutKind.Sequential)]public struct INPUT{public uint type;public UNION data;}
 [DllImport("user32.dll")]public static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 [DllImport("user32.dll",SetLastError=true)]static extern uint SendInput(uint n,INPUT[] inputs,int size);
 public static void Type(string text){var inputs=new INPUT[text.Length*2];for(int i=0;i<text.Length;i++){inputs[i*2].type=1;inputs[i*2].data.key.scan=text[i];inputs[i*2].data.key.flags=4;inputs[i*2+1]=inputs[i*2];inputs[i*2+1].data.key.flags=6;}if(SendInput((uint)inputs.Length,inputs,Marshal.SizeOf(typeof(INPUT)))!=inputs.Length)throw new Exception("Unicode SendInput incomplete");}
}
'@
if($Text.ToCharArray()|Where-Object {[char]::IsControl($_)}){throw 'Use explicit physical key helper for control characters'}
if([ObservedUnicodeInput]::GetForegroundWindow().ToInt64() -ne $WindowId){throw 'Observed text target is not foreground'}
$owner=[uint32]0;[void][ObservedUnicodeInput]::GetWindowThreadProcessId([IntPtr]::new($WindowId),[ref]$owner)
$process=Get-Process -Id $owner
if($process.ProcessName -ne 'narro-m7-validation' -or (Get-FileHash -LiteralPath $process.Path).Hash.ToLowerInvariant() -ne $ExpectedSha256.ToLowerInvariant()){throw 'Exact observed PR233 final owner changed'}
$root=[Windows.Automation.AutomationElement]::FromHandle([IntPtr]::new($WindowId))
$focused=@($root.FindAll([Windows.Automation.TreeScope]::Descendants,[Windows.Automation.PropertyCondition]::new([Windows.Automation.AutomationElement]::NameProperty,$FieldName))|Where-Object {$_.Current.HasKeyboardFocus})
if($focused.Count -ne 1){throw 'Expected one actual focused field with observed name'}
$record=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');action='observed-unicode-SendInput';windowId=$WindowId;pid=$owner;field=$FieldName;text=$Text;controlCharactersAllowed=$false}
$record|ConvertTo-Json -Compress|Tee-Object -FilePath artifacts/m7-pr235-native-20261005/actions.jsonl -Append
[ObservedUnicodeInput]::Type($Text)
Start-Sleep -Milliseconds 500
$value=$focused[0].GetCurrentPropertyValue([Windows.Automation.ValuePattern]::ValueProperty)
$after=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');action='observed-text-value-after-input';windowId=$WindowId;field=$FieldName;value=[string]$value;expectedTextPresent=([string]$value).Contains($Text)}
$after|ConvertTo-Json -Compress|Tee-Object -FilePath artifacts/m7-pr235-native-20261005/actions.jsonl -Append
if($focused[0].Current.ControlType -eq [Windows.Automation.ControlType]::Edit -and -not $after.expectedTextPresent){throw 'Typed text not yet confirmed in actual field; do not submit'}
