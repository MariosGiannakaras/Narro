$ErrorActionPreference = 'Stop'
$null = [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
$taskNotifierFacts = foreach ($taskAppId in @('com.mariosg.Narro', 'com.mariosg.Narro.M1Diagnostic')) {
    try {
        $taskNotifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($taskAppId)
        [pscustomobject]@{ AppId = $taskAppId; Setting = [string]$taskNotifier.Setting; Error = $null }
    } catch {
        [pscustomobject]@{ AppId = $taskAppId; Setting = $null; Error = $_.Exception.Message }
    }
}
$taskNotifierFacts | ConvertTo-Json -Depth 4
