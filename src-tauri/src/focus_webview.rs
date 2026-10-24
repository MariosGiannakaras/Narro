use tauri::WebviewWindow;

/// Moves the persistent Focus host and explicitly informs WebView2 that its
/// parent HWND changed position.
///
/// WebView2 documents NotifyParentWindowPositionChanged for parent/ancestor
/// movement. Keeping this next to every programmatic Focus move avoids relying
/// on eventual monitor/DPI detection alone during finite Panel/Timer motion and
/// placement recovery.
pub(crate) fn set_physical_position(window: &WebviewWindow, x: i32, y: i32) -> Result<(), String> {
    // The owned popup and Focus HWND must not move in two visible desktop
    // steps. When a finite raster exists, use a single DeferWindowPos batch.
    // Ordinary no-raster moves retain Tauri's position path.
    let protected_move = crate::focus_layered_raster::move_owner_and_popup(window, x, y);
    match protected_move {
        Ok(true) => {}
        Ok(false) => {
            window
                .set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }))
                .map_err(|error| format!("set Focus parent position: {error}"))?;
        }
        Err(error) => {
            // EndDeferWindowPos can report failure after sending position
            // notifications. Always refresh WebView2 before native rollback.
            let _ = notify_parent_position_changed(window);
            return Err(format!(
                "atomically move Focus owner and owned raster: {error}"
            ));
        }
    }
    notify_parent_position_changed(window)
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
