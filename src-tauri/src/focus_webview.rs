use tauri::WebviewWindow;

/// Moves the persistent Focus host and explicitly informs WebView2 that its
/// parent HWND changed position.
///
/// WebView2 documents NotifyParentWindowPositionChanged for parent/ancestor
/// movement. Keeping this next to every programmatic Focus move avoids relying
/// on eventual monitor/DPI detection alone during finite Panel/Timer motion and
/// placement recovery.
pub(crate) fn set_physical_position(window: &WebviewWindow, x: i32, y: i32) -> Result<(), String> {
    window
        .set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }))
        .map_err(|error| format!("set Focus parent position: {error}"))?;

    // The owner already moved even if its transient popup cannot follow.
    // Always notify WebView2, but propagate the native failure so the raster
    // transition can recover rather than silently presenting a displaced cover.
    let popup_sync = crate::focus_layered_raster::sync_owner_position(window)
        .map_err(|error| format!("sync Focus owned raster position: {error}"));
    let webview_notification = notify_parent_position_changed(window);
    popup_sync?;
    webview_notification
}

#[cfg(windows)]
fn notify_parent_position_changed(window: &WebviewWindow) -> Result<(), String> {
    let label = window.label().to_string();
    let callback_label = label.clone();

    window
        .with_webview(move |webview| unsafe {
            if let Err(error) = webview.controller().NotifyParentWindowPositionChanged() {
                eprintln!(
                    "WebView2 parent-position notification failed for {callback_label}: {error}"
                );
            }
        })
        .map_err(|error| {
            format!("schedule WebView2 parent-position notification for {label}: {error}")
        })
}

#[cfg(not(windows))]
fn notify_parent_position_changed(_window: &WebviewWindow) -> Result<(), String> {
    Ok(())
}
