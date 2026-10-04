param([long]$WindowId=1247064)
$ErrorActionPreference='Stop'
$run='E:\SystemFiles\Desktop\NarroUpload\artifacts\m7-ci936-physical-20261004\run-final'
$names=@('Start break','Notes','Resume','Skip task','Complete task','Return to Focus Panel')
foreach($name in $names){
 $path="$run/observations/hover-before-$($names.IndexOf($name)).json"
 $o=& "$PSScriptRoot/observe-ci893-windows.ps1" -WindowId $WindowId -Output $path|ConvertFrom-Json
 $buttons=@($o.elements|Where-Object {$_.name -eq $name -and $_.type -eq 'ControlType.Button'})
 if($buttons.Count -ne 1){throw "Unique fresh hover target missing: $name"}
 $b=$buttons[0].bounds.Split(';')|ForEach-Object {[double]::Parse($_,[Globalization.CultureInfo]::InvariantCulture)}
 $x=[int]($b[0]+$b[2]/2);$y=[int]($b[1]+$b[3]/2)
 $a=[ordered]@{utc=[DateTime]::UtcNow.ToString('o');action='observed physical hover';name=$name;x=$x;y=$y;windowId=$WindowId}
 [IO.File]::AppendAllText("$run/actions.jsonl",($a|ConvertTo-Json -Compress)+[Environment]::NewLine,[Text.UTF8Encoding]::new($false))
 & "$PSScriptRoot/observed-pointer-dpi.ps1" -Action hover -X $x -Y $y
 & "$PSScriptRoot/observe-ci893-windows.ps1" -WindowId $WindowId -Output "$run/observations/hover-after-$($names.IndexOf($name)).json"|Out-Null
 $a|ConvertTo-Json -Compress
}
