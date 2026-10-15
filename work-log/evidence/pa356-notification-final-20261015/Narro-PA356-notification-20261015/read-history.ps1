$ErrorActionPreference = 'Stop'
$null = [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
$taskHistory = [Windows.UI.Notifications.ToastNotificationManager]::History.GetHistory('com.mariosg.Narro')
$taskHistory | ForEach-Object { [pscustomobject]@{Xml = $_.Content.GetXml(); Tag = $_.Tag; Group = $_.Group} } | ConvertTo-Json -Depth 5
