//! Bounded native Main-window geometry support for the Board -> Focus entry morph.
//!
//! This module owns no renderer or timer state. It snapshots/restores only the
//! ordinary Main top-level HWND rectangle and prepares the opaque Focus reveal.

use crate::error::{CommandError, CommandResult};
use crate::windows::{PhysicalPoint, PhysicalRect, PhysicalSize};

fn morph_error(operation: &str, detail: impl std::fmt::Display) -> CommandError {
    CommandError::new("FOCUS_ENTRY_MORPH_FAILED", format!("{operation}: {detail}"))
}

pub(crate) fn next_frame_deadline(elapsed: u64, duration: u64, step: u64) -> u64 {
    if elapsed >= duration {
        return duration;
    }
    ((elapsed / step.max(1)).saturating_add(1))
        .saturating_mul(step.max(1))
        .min(duration)
}

#[cfg(windows)]
pub(crate) fn reveal_opaque(window: &tauri::WebviewWindow) -> CommandResult<()> {
    use std::{sync::mpsc, time::Duration};
    #[link(name = "user32")]
    unsafe extern "system" {
        fn GetWindowThreadProcessId(hwnd: *mut std::ffi::c_void, pid: *mut u32) -> u32;
    }
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn GetCurrentThreadId() -> u32;
    }
    let hwnd = window
        .hwnd()
        .map_err(|e| morph_error("resolve reveal HWND", e))?
        .0;
    if unsafe { GetWindowThreadProcessId(hwnd, std::ptr::null_mut()) == GetCurrentThreadId() } {
        return reveal_opaque_on_window_thread(window);
    }
    let target = window.clone();
    let (send, receive) = mpsc::sync_channel(1);
    window
        .run_on_main_thread(move || {
            let _ = send.send(reveal_opaque_on_window_thread(&target));
        })
        .map_err(|e| morph_error("dispatch opaque reveal", e))?;
    receive
        .recv_timeout(Duration::from_secs(2))
        .map_err(|e| morph_error("wait for opaque reveal", e))?
}

#[cfg(windows)]
fn reveal_opaque_on_window_thread(window: &tauri::WebviewWindow) -> CommandResult<()> {
    use std::ffi::c_void;
    #[link(name = "dwmapi")]
    unsafe extern "system" {
        fn DwmSetWindowAttribute(
            hwnd: *mut c_void,
            attribute: u32,
            value: *const c_void,
            size: u32,
        ) -> i32;
        fn DwmFlush() -> i32;
    }
    let hwnd = window
        .hwnd()
        .map_err(|e| morph_error("resolve reveal HWND", e))?
        .0;
    // Narro owns this transient property. Preserve its ordinary default after
    // the explicit native entry frame, without changing system motion settings.
    let disabled = 1_i32;
    let result = unsafe { DwmSetWindowAttribute(hwnd, 3, (&disabled as *const i32).cast(), 4) };
    if result < 0 {
        return Err(morph_error("disable native entry fade", result));
    }
    let shown = crate::show_and_focus(window);
    let painted = unsafe { DwmFlush() };
    let enabled = 0_i32;
    let restored = unsafe { DwmSetWindowAttribute(hwnd, 3, (&enabled as *const i32).cast(), 4) };
    shown?;
    if painted < 0 || restored < 0 {
        return Err(morph_error(
            "commit opaque entry frame",
            format!("{painted}/{restored}"),
        ));
    }
    Ok(())
}

#[cfg(not(windows))]
pub(crate) fn reveal_opaque(window: &tauri::WebviewWindow) -> CommandResult<()> {
    crate::show_and_focus(window)
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

#[cfg(test)]
mod tests {
    use super::next_frame_deadline;
    #[test]
    fn compositor_latency_skips_missed_frames_instead_of_adding_fixed_waits() {
        assert_eq!(next_frame_deadline(0, 220, 16), 16);
        assert_eq!(next_frame_deadline(65, 220, 16), 80);
        assert_eq!(next_frame_deadline(219, 220, 16), 220);
        assert_eq!(next_frame_deadline(700, 220, 16), 220);
    }
    #[test]
    fn frame_deadline_is_bounded_monotonic_and_safe_at_zero_step() {
        let values: Vec<_> = (0..=240).map(|t| next_frame_deadline(t, 220, 16)).collect();
        assert!(values.windows(2).all(|v| v[0] <= v[1]));
        assert!(values.iter().all(|v| *v <= 220));
        assert_eq!(next_frame_deadline(0, 0, 0), 0);
        assert_eq!(next_frame_deadline(1, 220, 0), 2);
    }
}
