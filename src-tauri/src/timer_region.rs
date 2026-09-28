//! Window-region clipping for the persistent, fixed-size Timer WebView.
//!
//! The HWND remains at expanded geometry. Compact mode changes only the native
//! visible region, so WebView2 never receives a resize during the transition.

use crate::error::{CommandError, CommandResult};

fn clipped_height(outer_height: u32, scale: f64, expanded: bool) -> Option<u32> {
    if !scale.is_finite() || scale <= 0.0 {
        return None;
    }
    let compact_height = (110.0 * scale).round().max(1.0) as u32;
    Some(if expanded {
        outer_height
    } else {
        compact_height.min(outer_height)
    })
}

#[cfg(windows)]
mod native {
    use super::{clipped_height, CommandError, CommandResult};
    use std::ffi::c_void;

    #[link(name = "gdi32")]
    unsafe extern "system" {
        fn CreateRectRgn(left: i32, top: i32, right: i32, bottom: i32) -> *mut c_void;
        fn DeleteObject(object: *mut c_void) -> i32;
    }

    #[link(name = "user32")]
    unsafe extern "system" {
        fn SetWindowRgn(hwnd: *mut c_void, region: *mut c_void, redraw: i32) -> i32;
    }

    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn GetLastError() -> u32;
    }

    pub fn visible_size(
        window: &tauri::WebviewWindow,
        expanded: bool,
    ) -> CommandResult<tauri::PhysicalSize<u32>> {
        let outer = window.outer_size().map_err(|error| {
            CommandError::new(
                "TIMER_REGION_FAILED",
                format!("read Timer outer size: {error}"),
            )
        })?;
        let scale = window.scale_factor().map_err(|error| {
            CommandError::new(
                "TIMER_REGION_FAILED",
                format!("read Timer DPI scale: {error}"),
            )
        })?;
        let height = clipped_height(outer.height, scale, expanded).ok_or_else(|| {
            CommandError::new("TIMER_REGION_FAILED", "Timer DPI scale is invalid")
        })?;
        Ok(tauri::PhysicalSize {
            width: outer.width,
            height,
        })
    }

    pub fn apply(window: &tauri::WebviewWindow, expanded: bool) -> CommandResult<()> {
        let visible = visible_size(window, expanded)?;
        let hwnd = window.hwnd().map_err(|error| {
            CommandError::new(
                "TIMER_REGION_FAILED",
                format!("resolve Timer HWND: {error}"),
            )
        })?;
        let width = i32::try_from(visible.width).map_err(|_| {
            CommandError::new("TIMER_REGION_FAILED", "Timer width exceeds Win32 limits")
        })?;
        let height = i32::try_from(visible.height).map_err(|_| {
            CommandError::new("TIMER_REGION_FAILED", "Timer height exceeds Win32 limits")
        })?;
        // On success SetWindowRgn owns the HRGN; on failure we must delete it.
        let region = unsafe { CreateRectRgn(0, 0, width, height) };
        if region.is_null() {
            return Err(CommandError::new(
                "TIMER_REGION_FAILED",
                format!("CreateRectRgn failed: {}", unsafe { GetLastError() }),
            ));
        }
        if unsafe { SetWindowRgn(hwnd.0 as isize as *mut c_void, region, 1) } == 0 {
            let error = unsafe { GetLastError() };
            unsafe { DeleteObject(region) };
            return Err(CommandError::new(
                "TIMER_REGION_FAILED",
                format!("SetWindowRgn failed: {error}"),
            ));
        }
        Ok(())
    }
}

#[cfg(not(windows))]
mod native {
    use super::{clipped_height, CommandResult};

    pub fn visible_size(
        window: &tauri::WebviewWindow,
        expanded: bool,
    ) -> CommandResult<tauri::PhysicalSize<u32>> {
        let outer = window.outer_size().map_err(|error| {
            crate::error::CommandError::new("TIMER_REGION_FAILED", error.to_string())
        })?;
        Ok(tauri::PhysicalSize {
            width: outer.width,
            height: clipped_height(outer.height, 1.0, expanded).unwrap_or(outer.height),
        })
    }

    pub fn apply(_window: &tauri::WebviewWindow, _expanded: bool) -> CommandResult<()> {
        Ok(())
    }
}

pub use native::{apply, visible_size};

#[cfg(test)]
mod tests {
    use super::clipped_height;

    #[test]
    fn compact_region_tracks_dpi_without_resizing_expanded_host() {
        assert_eq!(clipped_height(300, 1.0, false), Some(110));
        assert_eq!(clipped_height(375, 1.25, false), Some(138));
        assert_eq!(clipped_height(600, 2.0, false), Some(220));
        assert_eq!(clipped_height(375, 1.25, true), Some(375));
    }

    #[test]
    fn compact_region_never_exceeds_constrained_host() {
        assert_eq!(clipped_height(92, 1.25, false), Some(92));
        assert_eq!(clipped_height(300, 0.0, false), None);
    }
}
