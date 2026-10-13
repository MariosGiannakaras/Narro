//! Normal Quit must finish the authoritative timer write, not rely on its periodic crash checkpoint.
use crate::error::{CommandError, CommandResult};
use crate::{floating_placement, timer_service::TimerService, validation_log};
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::Manager;

static EXIT_PENDING: AtomicBool = AtomicBool::new(false);

struct ExitLease;
impl Drop for ExitLease {
    fn drop(&mut self) {
        EXIT_PENDING.store(false, Ordering::Release);
    }
}

pub(crate) fn complete_after_checkpoint(
    checkpoint: impl FnOnce() -> CommandResult<()>,
    exit: impl FnOnce(),
) -> CommandResult<()> {
    checkpoint()?;
    exit();
    Ok(())
}

pub(crate) fn request_normal_exit(app: &tauri::AppHandle) {
    if EXIT_PENDING.swap(true, Ordering::AcqRel) {
        return;
    }
    validation_log::record_tray_quit_requested(app);
    let app = app.clone();
    // SQLite contention must not stall the desktop message loop/focus provider.
    std::mem::drop(tauri::async_runtime::spawn_blocking(move || {
        let _lease = ExitLease;
        let save_result = floating_placement::save_if_timer_visible(&app);
        let (placement_saved, save_error) = match &save_result {
            Ok(saved) => (*saved, None),
            Err(error) => (false, Some(error.to_string())),
        };
        if let Err(error) = &save_result {
            eprintln!("Could not save Floating Timer position before exit: {error}");
        }
        // Flush last, after potentially blocking placement work, immediately before exit.
        let result = complete_after_checkpoint(
            || {
                let service = app.try_state::<TimerService>().ok_or_else(|| {
                    CommandError::new(
                        "TIMER_SERVICE_UNAVAILABLE",
                        "Timer service is not ready to quit safely.",
                    )
                })?;
                let snapshot = service.checkpoint_before_normal_exit(&app)?;
                validation_log::record_exit_timer_checkpoint(&app, &snapshot);
                Ok(())
            },
            || {
                validation_log::record_tray_quit_completed(
                    &app,
                    placement_saved,
                    save_error.as_deref(),
                );
                app.exit(0);
            },
        );
        if let Err(error) = result {
            show_failed_exit(&app, &error);
        }
    }));
}

fn show_failed_exit(app: &tauri::AppHandle, error: &CommandError) {
    eprintln!("Normal Quit cancelled: authoritative timer checkpoint failed: {error}");
    #[cfg(windows)]
    {
        use std::ffi::c_void;
        #[link(name = "user32")]
        unsafe extern "system" {
            fn MessageBoxW(
                parent: *mut c_void,
                text: *const u16,
                title: *const u16,
                flags: u32,
            ) -> i32;
        }
        let parent = app
            .get_webview_window("main")
            .and_then(|window| window.hwnd().ok())
            .map(|handle| handle.0)
            .unwrap_or(std::ptr::null_mut());
        let text: Vec<u16> = format!(
            "Narro could not save the current timer safely, so Quit was cancelled. Your session is still open.\n\n{error}\n\nPlease try Quit again."
        ).encode_utf16().chain(Some(0)).collect();
        let title: Vec<u16> = "Narro could not quit"
            .encode_utf16()
            .chain(Some(0))
            .collect();
        unsafe {
            MessageBoxW(parent, text.as_ptr(), title.as_ptr(), 0x0001_0010);
        }
    }
    #[cfg(not(windows))]
    let _ = app;
}
