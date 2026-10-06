//! Bounded native Main-window geometry support for the Board -> Focus entry morph.
//!
//! This module owns no renderer or timer state. It snapshots/restores only the
//! ordinary Main top-level HWND rectangle and applies finite native rect steps.

use crate::error::{CommandError, CommandResult};
use crate::windows::{PhysicalPoint, PhysicalRect, PhysicalSize};

fn morph_error(operation: &str, detail: impl std::fmt::Display) -> CommandError {
    CommandError::new(
        "FOCUS_ENTRY_MORPH_FAILED",
        format!("{operation}: {detail}"),
    )
}

pub fn supported() -> bool {
    cfg!(windows)
}

pub fn safe_restored_state(window: &tauri::WebviewWindow) -> CommandResult<bool> {
    let visible = window
        .is_visible()
        .map_err(|error| morph_error("read Main visibility", error))?;
    let minimized = window
        .is_minimized()
        .map_err(|error| morph_error("read Main minimized state", error))?;
    let maximized = window
        .is_maximized()
        .map_err(|error| morph_error("read Main maximized state", error))?;
    let fullscreen = window
        .is_fullscreen()
        .map_err(|error| morph_error("read Main fullscreen state", error))?;

    Ok(visible && !minimized && !maximized && !fullscreen)
}

pub fn capture_outer_rect(window: &tauri::WebviewWindow) -> CommandResult<PhysicalRect> {
    let position = window
        .outer_position()
        .map_err(|error| morph_error("read Main outer position", error))?;
    let size = window
        .outer_size()
        .map_err(|error| morph_error("read Main outer size", error))?;
    if size.width == 0 || size.height == 0 {
        return Err(morph_error("read Main outer rect", "window size is empty"));
    }
    Ok(PhysicalRect {
        position: PhysicalPoint {
            x: position.x,
            y: position.y,
        },
        size: PhysicalSize {
            width: size.width,
            height: size.height,
        },
    })
}

#[cfg(windows)]
pub fn set_outer_rect(window: &tauri::WebviewWindow, rect: PhysicalRect) -> CommandResult<()> {
    use std::ffi::c_void;

    type Handle = *mut c_void;

    #[link(name = "user32")]
    unsafe extern "system" {
        fn SetWindowPos(
            window: Handle,
            after: Handle,
            x: i32,
            y: i32,
            width: i32,
            height: i32,
            flags: u32,
        ) -> i32;
    }

    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn GetLastError() -> u32;
    }

    #[link(name = "dwmapi")]
    unsafe extern "system" {
        fn DwmFlush() -> i32;
    }

    let width = i32::try_from(rect.size.width)
        .map_err(|_| morph_error("resize Main outer rect", "width exceeds Win32 range"))?;
    let height = i32::try_from(rect.size.height)
        .map_err(|_| morph_error("resize Main outer rect", "height exceeds Win32 range"))?;
    let hwnd = window
        .hwnd()
        .map_err(|error| morph_error("resolve Main HWND", error))?
        .0 as Handle;

    // SWP_NOZORDER | SWP_NOACTIVATE. The user-visible surface remains the same
    // HWND while the finite raster child clips its already-captured WebView.
    if unsafe {
        SetWindowPos(
            hwnd,
            std::ptr::null_mut(),
            rect.position.x,
            rect.position.y,
            width,
            height,
            0x0014,
        )
    } == 0
    {
        return Err(morph_error(
            "apply Main outer rect",
            format!("Win32 {}", unsafe { GetLastError() }),
        ));
    }

    // Bound each native step to a compositor frame so the morph remains finite
    // and observable rather than collapsing into one final SetWindowPos.
    let _ = unsafe { DwmFlush() };
    Ok(())
}

#[cfg(not(windows))]
pub fn set_outer_rect(_window: &tauri::WebviewWindow, _rect: PhysicalRect) -> CommandResult<()> {
    Err(morph_error(
        "apply Main outer rect",
        "native Board-to-Focus morph requires Windows",
    ))
}
