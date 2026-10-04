param([string]$Prefix,[long]$WindowId=1181574)
$ErrorActionPreference='Stop'
$run='artifacts/m7-ci936-physical-20261004/run-final'
foreach($i in 1..2){
 foreach($button in @('Expand Floating Timer','Collapse Floating Timer')){
  & "$PSScriptRoot/invoke-observed-validation-button-dpi.ps1" -WindowId $WindowId -Name $button -LogFile "$run/actions.jsonl"
  $suffix=if($button.StartsWith('Expand')){'expand'}else{'collapse'}
  $state=& "$PSScriptRoot/observe-ci893-windows.ps1" -WindowId $WindowId -Output "$run/observations/$Prefix-$suffix-$i.json" | ConvertFrom-Json
  $state.windows|Where-Object hwnd -eq $WindowId|Select-Object hwnd,dpi,outer,client|ConvertTo-Json -Compress
 }
}
foreach($i in 1..3){
 & "$PSScriptRoot/observed-physical-key-ci936-final.ps1" -WindowId $WindowId -Chord 'Ctrl+Shift+T'
 $panel=& "$PSScriptRoot/observe-ci893-windows.ps1" -WindowId $WindowId -Output "$run/observations/$Prefix-panel-$i.json" | ConvertFrom-Json
 $panel.windows|Where-Object hwnd -eq $WindowId|Select-Object hwnd,dpi,outer|ConvertTo-Json -Compress
 & "$PSScriptRoot/observed-physical-key-ci936-final.ps1" -WindowId $WindowId -Chord 'Ctrl+Shift+T'
 $timer=& "$PSScriptRoot/observe-ci893-windows.ps1" -WindowId $WindowId -Output "$run/observations/$Prefix-restore-$i.json" | ConvertFrom-Json
 $timer.windows|Where-Object hwnd -eq $WindowId|Select-Object hwnd,dpi,outer|ConvertTo-Json -Compress
}
