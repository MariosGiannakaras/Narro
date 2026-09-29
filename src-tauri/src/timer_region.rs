//! Native visible-region clipping for the single persistent Focus WebView.
//!
//! The underlying focusSurface HWND/WebView stays at the maximum Focus host
//! geometry. Panel, compact Timer and expanded Timer change only the visible
//! native region during ordinary presentation switches.

use crate::error::{CommandError, CommandResult};

pub const FOCUS_HOST_WIDTH_LOGICAL: f64 = 340.0;
pub const FOCUS_HOST_HEIGHT_LOGICAL: f64 = 700.0;
pub const TIMER_COMPACT_HEIGHT_LOGICAL: f64 = 110.0;
pub const TIMER_EXPANDED_HEIGHT_LOGICAL: f64 = 300.0;

pub fn host_logical_size() -> tauri::LogicalSize<f64> {
    tauri::LogicalSize {
        width: FOCUS_HOST_WIDTH_LOGICAL,
        height: FOCUS_HOST_HEIGHT_LOGICAL,
    }
}

pub fn panel_logical_size() -> tauri::LogicalSize<f64> {
    host_logical_size()
}

pub fn timer_logical_size(expanded: bool) -> tauri::LogicalSize<f64> {
    tauri::LogicalSize {
        width: FOCUS_HOST_WIDTH_LOGICAL,
        height: if expanded {
            TIMER_EXPANDED_HEIGHT_LOGICAL
        } else {
            TIMER_COMPACT_HEIGHT_LOGICAL
        },
    }
}

fn clipped_axis(outer: u32, logical: f64, scale: f64) -> Option<u32> {
    if !scale.is_finite() || scale <= 0.0 || !logical.is_finite() || logical <= 0.0 {
        return None;
    }
    Some(((logical * scale).round().max(1.0) as u32).min(outer))
}

fn clipped_size(
    outer: tauri::PhysicalSize<u32>,
    scale: f64,
    logical: tauri::LogicalSize<f64>,
) -> Option<tauri::PhysicalSize<u32>> {
    Some(tauri::PhysicalSize {
        width: clipped_axis(outer.width, logical.width, scale)?,
        height: clipped_axis(outer.height, logical.height, scale)?,
    })
}

#[cfg(windows)]
mod native {
    use super::{clipped_size, CommandError, CommandResult};
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
        logical: tauri::LogicalSize<f64>,
    ) -> CommandResult<tauri::PhysicalSize<u32>> {
        let outer = window.outer_size().map_err(|error| {
            CommandError::new(
                "FOCUS_REGION_FAILED",
                format!("read focusSurface outer size: {error}"),
            )
        })?;
        let scale = window.scale_factor().map_err(|error| {
            CommandError::new(
                "FOCUS_REGION_FAILED",
                format!("read focusSurface DPI scale: {error}"),
            )
        })?;
        clipped_size(outer, scale, logical).ok_or_else(|| {
            CommandError::new(
                "FOCUS_REGION_FAILED",
                "focusSurface logical region or DPI scale is invalid",
            )
        })
    }

    fn apply_physical(
        window: &tauri::WebviewWindow,
        visible: tauri::PhysicalSize<u32>,
    ) -> CommandResult<()> {
        let hwnd = window.hwnd().map_err(|error| {
            CommandError::new(
                "FOCUS_REGION_FAILED",
                format!("resolve focusSurface HWND: {error}"),
            )
        })?;
        let width = i32::try_from(visible.width).map_err(|_| {
            CommandError::new(
                "FOCUS_REGION_FAILED",
                "focusSurface region width exceeds Win32 limits",
            )
        })?;
        let height = i32::try_from(visible.height).map_err(|_| {
            CommandError::new(
                "FOCUS_REGION_FAILED",
                "focusSurface region height exceeds Win32 limits",
            )
        })?;

        // On success SetWindowRgn owns the HRGN. If SetWindowRgn fails, Narro
        // retains ownership and must delete the region.
        let region = unsafe { CreateRectRgn(0, 0, width, height) };
        if region.is_null() {
            return Err(CommandError::new(
                "FOCUS_REGION_FAILED",
                format!("CreateRectRgn failed: {}", unsafe { GetLastError() }),
            ));
        }

        if unsafe { SetWindowRgn(hwnd.0 as isize as *mut c_void, region, 1) } == 0 {
            let error = unsafe { GetLastError() };
            unsafe { DeleteObject(region) };
            return Err(CommandError::new(
                "FOCUS_REGION_FAILED",
                format!("SetWindowRgn failed: {error}"),
            ));
        }
        Ok(())
    }

    pub fn apply(
        window: &tauri::WebviewWindow,
        logical: tauri::LogicalSize<f64>,
    ) -> CommandResult<()> {
        apply_physical(window, visible_size(window, logical)?)
    }

    pub fn apply_full_host(window: &tauri::WebviewWindow) -> CommandResult<()> {
        let outer = window.outer_size().map_err(|error| {
            CommandError::new(
                "FOCUS_REGION_FAILED",
                format!("read focusSurface outer size for full-host region: {error}"),
            )
        })?;
        apply_physical(window, outer)
    }
}

#[cfg(not(windows))]
mod native {
    use super::{clipped_size, CommandResult};

    pub fn visible_size(
        window: &tauri::WebviewWindow,
        logical: tauri::LogicalSize<f64>,
    ) -> CommandResult<tauri::PhysicalSize<u32>> {
        let outer = window.outer_size().map_err(|error| {
            crate::error::CommandError::new("FOCUS_REGION_FAILED", error.to_string())
        })?;
        Ok(clipped_size(outer, 1.0, logical).unwrap_or(outer))
    }

    pub fn apply(
        _window: &tauri::WebviewWindow,
        _logical: tauri::LogicalSize<f64>,
    ) -> CommandResult<()> {
        Ok(())
    }

    pub fn apply_full_host(_window: &tauri::WebviewWindow) -> CommandResult<()> {
        Ok(())
    }
}

pub use native::{apply, apply_full_host, visible_size};

#[cfg(test)]
mod tests {
    use super::{clipped_size, host_logical_size, panel_logical_size, timer_logical_size};

    #[test]
    fn product_presentations_share_validated_340px_width() {
        assert_eq!(host_logical_size().width, 340.0);
        assert_eq!(panel_logical_size().width, 340.0);
        assert_eq!(timer_logical_size(false).width, 340.0);
        assert_eq!(timer_logical_size(true).width, 340.0);
    }

    #[test]
    fn timer_region_tracks_dpi_without_resizing_focus_host() {
        let outer = tauri::PhysicalSize {
            width: 425,
            height: 875,
        };
        assert_eq!(
            clipped_size(outer, 1.25, timer_logical_size(false)),
            Some(tauri::PhysicalSize {
                width: 425,
                height: 138,
            }),
        );
        assert_eq!(
            clipped_size(outer, 1.25, timer_logical_size(true)),
            Some(tauri::PhysicalSize {
                width: 425,
                height: 375,
            }),
        );
        assert_eq!(clipped_size(outer, 1.25, panel_logical_size()), Some(outer),);
    }

    #[test]
    fn constrained_host_clamps_region_to_actual_outer_size() {
        let outer = tauri::PhysicalSize {
            width: 250,
            height: 200,
        };
        assert_eq!(
            clipped_size(outer, 1.5, timer_logical_size(true)),
            Some(outer),
        );
        assert_eq!(clipped_size(outer, 0.0, timer_logical_size(false)), None);
    }
}
