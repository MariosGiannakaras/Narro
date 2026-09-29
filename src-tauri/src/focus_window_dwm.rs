use super::{CommandError, CommandResult};
use std::ffi::c_void;

const DWMWA_TRANSITIONS_FORCEDISABLED: u32 = 3;

#[link(name = "dwmapi")]
extern "system" {
    fn DwmSetWindowAttribute(
        hwnd: *mut c_void,
        attribute: u32,
        value: *const c_void,
        size: u32,
    ) -> i32;
}

pub fn disable_transitions(window: &tauri::WebviewWindow) -> CommandResult<()> {
    let hwnd = window.hwnd().map_err(|error| {
        CommandError::new(
            "FOCUS_WINDOW_DWM_FAILED",
            format!("{} HWND unavailable: {error}", window.label()),
        )
    })?;
    let disabled: i32 = 1;
    let result = unsafe {
        DwmSetWindowAttribute(
            hwnd.0 as isize as *mut c_void,
            DWMWA_TRANSITIONS_FORCEDISABLED,
            &disabled as *const i32 as *const c_void,
            std::mem::size_of::<i32>() as u32,
        )
    };
    if result < 0 {
        return Err(CommandError::new(
            "FOCUS_WINDOW_DWM_FAILED",
            format!(
                "disable {} DWM transitions failed: HRESULT {result:#x}",
                window.label()
            ),
        ));
    }
    Ok(())
}
