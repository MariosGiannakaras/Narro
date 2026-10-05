param([Parameter(Mandatory)][long]$WindowId,[Parameter(Mandatory)][string]$Name,[string]$LogFile='',[ValidateSet('narro-m7-validation','narro','obs64')][string]$AllowedProcess='narro-m7-validation',[int]$ObservedOrdinal=0,[int]$ExpectedMatchCount=1)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public static class M7UiaOwner { [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p); [DllImport("user32.dll")] public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr c); [DllImport("user32.dll")] static extern bool SetCursorPos(int x,int y); [DllImport("user32.dll")] static extern void mouse_event(uint f,uint x,uint y,uint d,UIntPtr e); public static void Click(int x,int y){IntPtr c=SetThreadDpiAwarenessContext(new IntPtr(-4));try{if(!SetCursorPos(x,y))throw new Exception("Pointer failed");System.Threading.Thread.Sleep(100);mouse_event(2,0,0,0,UIntPtr.Zero);System.Threading.Thread.Sleep(80);mouse_event(4,0,0,0,UIntPtr.Zero);}finally{SetThreadDpiAwarenessContext(c);}} }'
$previousDpi = [M7UiaOwner]::SetThreadDpiAwarenessContext([IntPtr]::new(-4))
try {
$owner=[uint32]0; [void][M7UiaOwner]::GetWindowThreadProcessId([IntPtr]$WindowId,[ref]$owner)
$process=Get-Process -Id $owner
if($process.ProcessName -ne $AllowedProcess){throw 'Observed window is not owned by the validation EXE'}
$root=[Windows.Automation.AutomationElement]::FromHandle([IntPtr]$WindowId)
$nameCondition=[Windows.Automation.PropertyCondition]::new([Windows.Automation.AutomationElement]::NameProperty,$Name)
$typeCondition=[Windows.Automation.PropertyCondition]::new([Windows.Automation.AutomationElement]::ControlTypeProperty,[Windows.Automation.ControlType]::Button)
$condition=[Windows.Automation.AndCondition]::new($nameCondition,$typeCondition)
$buttons=$root.FindAll([Windows.Automation.TreeScope]::Descendants,$condition)
$chosen=if($ObservedOrdinal -gt 0){$ObservedOrdinal-1}else{0}; if($buttons.Count -ne $ExpectedMatchCount -or $chosen -lt 0 -or $chosen -ge $buttons.Count){throw "Observed button multiplicity changed"}
$button=$buttons.Item($chosen)
if(-not $button.Current.IsEnabled){throw 'Observed button is disabled'}
if($button.Current.IsOffscreen){
 $scroll=$null
 if($button.TryGetCurrentPattern([Windows.Automation.ScrollItemPattern]::Pattern,[ref]$scroll)){$scroll.ScrollIntoView();Start-Sleep -Milliseconds 250}
}
$record=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');action='native-uia-invoke';button=$Name;observedOrdinal=$ObservedOrdinal;expectedMatches=$ExpectedMatchCount;windowId=$WindowId;processId=$owner;offscreen=$button.Current.IsOffscreen;bounds=$button.Current.BoundingRectangle.ToString();authorization='User authorized native fallback for real Windows testing'}
$pattern=$null
if($button.TryGetCurrentPattern([Windows.Automation.InvokePattern]::Pattern,[ref]$pattern)){$pattern.Invoke()}
else{
 if($button.Current.IsOffscreen){throw 'Observed fallback button is off-screen'}
 $b=$button.Current.BoundingRectangle
 if($b.Width -le 0 -or $b.Height -le 0){throw 'No observed bounds'}
 [M7UiaOwner]::Click([int]($b.Left+$b.Width/2),[int]($b.Top+$b.Height/2))
 $record.action='native-uia-observed-pointer-click'
}
Start-Sleep -Milliseconds 250
$record | ConvertTo-Json -Compress
if($LogFile){$record|ConvertTo-Json -Compress|Add-Content -LiteralPath $LogFile -Encoding utf8}



} finally { [void][M7UiaOwner]::SetThreadDpiAwarenessContext($previousDpi) }
