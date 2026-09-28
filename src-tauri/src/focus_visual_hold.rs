//! A short-lived native copy of the outgoing Focus window. The one WebView must
//! be hidden while its geometry changes; keeping its last visible pixels in a
//! native (non-WebView) window prevents the desktop/blank host from being shown.

use crate::{CommandError, CommandResult};
use std::ffi::c_void;
use std::sync::Mutex;

type Handle = *mut c_void;

#[derive(Clone, Copy)]
#[repr(C)]
struct Rect {
    left: i32,
    top: i32,
    right: i32,
    bottom: i32,
}

const WS_POPUP: u32 = 0x8000_0000;
const SS_BITMAP: u32 = 0x000e;
const WS_EX_TOPMOST: u32 = 0x0000_0008;
const WS_EX_TOOLWINDOW: u32 = 0x0000_0080;
const WS_EX_NOACTIVATE: u32 = 0x0800_0000;
const HWND_TOPMOST: Handle = -1_isize as Handle;
const SWP_NOSIZE: u32 = 0x0001;
const SWP_NOMOVE: u32 = 0x0002;
const SWP_NOACTIVATE: u32 = 0x0010;
const SWP_SHOWWINDOW: u32 = 0x0040;
const DWMWA_TRANSITIONS_FORCEDISABLED: u32 = 3;
const STM_SETIMAGE: u32 = 0x0172;
const IMAGE_BITMAP: usize = 0;
const SRCCOPY: u32 = 0x00cc_0020;
const CAPTUREBLT: u32 = 0x4000_0000;
const SW_SHOWNOACTIVATE: i32 = 4;

#[link(name = "user32")]
extern "system" {
    fn GetWindowRect(hwnd: Handle, rect: *mut Rect) -> i32;
    fn GetDC(hwnd: Handle) -> Handle;
    fn ReleaseDC(hwnd: Handle, dc: Handle) -> i32;
    fn CreateWindowExW(
        ex_style: u32,
        class_name: *const u16,
        title: *const u16,
        style: u32,
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        parent: Handle,
        menu: Handle,
        instance: Handle,
        parameter: Handle,
    ) -> Handle;
    fn SendMessageW(hwnd: Handle, message: u32, w_param: usize, l_param: isize) -> isize;
    fn ShowWindow(hwnd: Handle, command: i32) -> i32;
    fn SetWindowPos(
        hwnd: Handle,
        insert_after: Handle,
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        flags: u32,
    ) -> i32;
    fn UpdateWindow(hwnd: Handle) -> i32;
    fn IsWindowVisible(hwnd: Handle) -> i32;
    fn DestroyWindow(hwnd: Handle) -> i32;
}

#[link(name = "gdi32")]
extern "system" {
    fn CreateCompatibleDC(dc: Handle) -> Handle;
    fn DeleteDC(dc: Handle) -> i32;
    fn CreateCompatibleBitmap(dc: Handle, width: i32, height: i32) -> Handle;
    fn SelectObject(dc: Handle, object: Handle) -> Handle;
    fn DeleteObject(object: Handle) -> i32;
    fn BitBlt(
        destination: Handle,
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        source: Handle,
        source_x: i32,
        source_y: i32,
        operation: u32,
    ) -> i32;
}

#[link(name = "dwmapi")]
extern "system" {
    fn DwmFlush() -> i32;
    fn DwmSetWindowAttribute(hwnd: Handle, attribute: u32, value: *const c_void, size: u32) -> i32;
}

#[derive(Clone, Copy)]
struct VisualHold {
    window: isize,
    bitmap: isize,
}

static ACTIVE: Mutex<Option<VisualHold>> = Mutex::new(None);

fn failure(operation: &str) -> CommandError {
    CommandError::new(
        "FOCUS_VISUAL_HOLD_FAILED",
        format!("{operation} failed: {}", std::io::Error::last_os_error()),
    )
}

fn capture_bitmap(rect: Rect) -> CommandResult<Handle> {
    let width = rect
        .right
        .checked_sub(rect.left)
        .filter(|value| *value > 0)
        .ok_or_else(|| CommandError::new("FOCUS_VISUAL_HOLD_FAILED", "invalid capture width"))?;
    let height = rect
        .bottom
        .checked_sub(rect.top)
        .filter(|value| *value > 0)
        .ok_or_else(|| CommandError::new("FOCUS_VISUAL_HOLD_FAILED", "invalid capture height"))?;

    let screen = unsafe { GetDC(std::ptr::null_mut()) };
    if screen.is_null() {
        return Err(failure("GetDC"));
    }
    let memory = unsafe { CreateCompatibleDC(screen) };
    if memory.is_null() {
        unsafe { ReleaseDC(std::ptr::null_mut(), screen) };
        return Err(failure("CreateCompatibleDC"));
    }
    let bitmap = unsafe { CreateCompatibleBitmap(screen, width, height) };
    if bitmap.is_null() {
        unsafe {
            DeleteDC(memory);
            ReleaseDC(std::ptr::null_mut(), screen)
        };
        return Err(failure("CreateCompatibleBitmap"));
    }
    let previous = unsafe { SelectObject(memory, bitmap) };
    let selected = !previous.is_null() && previous as isize != -1;
    let captured = selected
        && unsafe {
            BitBlt(
                memory,
                0,
                0,
                width,
                height,
                screen,
                rect.left,
                rect.top,
                SRCCOPY | CAPTUREBLT,
            )
        } != 0;
    if selected {
        unsafe { SelectObject(memory, previous) };
    }
    unsafe {
        DeleteDC(memory);
        ReleaseDC(std::ptr::null_mut(), screen)
    };
    if !captured {
        unsafe { DeleteObject(bitmap) };
        return Err(failure("BitBlt"));
    }
    Ok(bitmap)
}

pub fn begin(focus: &tauri::WebviewWindow) -> CommandResult<()> {
    let mut active = ACTIVE
        .lock()
        .map_err(|_| CommandError::new("FOCUS_VISUAL_HOLD_FAILED", "visual hold lock poisoned"))?;
    if active.is_some() {
        return Err(CommandError::new(
            "FOCUS_VISUAL_HOLD_BUSY",
            "a Focus visual hold is already active",
        ));
    }

    let hwnd = focus.hwnd().map_err(|error| {
        CommandError::new(
            "FOCUS_VISUAL_HOLD_FAILED",
            format!("focus HWND unavailable: {error}"),
        )
    })?;
    let hwnd = hwnd.0 as isize as Handle;
    // The native snapshot, rather than the outgoing WebView's CSS fade, must
    // own the visible transition. Windows' own show/hide animation can expose
    // the blank host even when the snapshot has already been created.
    let disable_transitions: i32 = 1;
    let transition_result = unsafe {
        DwmSetWindowAttribute(
            hwnd,
            DWMWA_TRANSITIONS_FORCEDISABLED,
            &disable_transitions as *const i32 as *const c_void,
            std::mem::size_of::<i32>() as u32,
        )
    };
    if transition_result < 0 {
        return Err(CommandError::new(
            "FOCUS_VISUAL_HOLD_FAILED",
            format!("disable Focus DWM transitions failed: HRESULT {transition_result:#x}"),
        ));
    }
    let mut rect = Rect {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    };
    if unsafe { GetWindowRect(hwnd, &mut rect) } == 0 {
        return Err(failure("GetWindowRect"));
    }
    let width = rect
        .right
        .checked_sub(rect.left)
        .filter(|value| *value > 0)
        .ok_or_else(|| CommandError::new("FOCUS_VISUAL_HOLD_FAILED", "invalid Focus width"))?;
    let height = rect
        .bottom
        .checked_sub(rect.top)
        .filter(|value| *value > 0)
        .ok_or_else(|| CommandError::new("FOCUS_VISUAL_HOLD_FAILED", "invalid Focus height"))?;

    let bitmap = capture_bitmap(rect)?;

    let class: Vec<u16> = "STATIC\0".encode_utf16().collect();
    let overlay = unsafe {
        CreateWindowExW(
            WS_EX_TOPMOST | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE,
            class.as_ptr(),
            class.as_ptr(),
            WS_POPUP | SS_BITMAP,
            rect.left,
            rect.top,
            width,
            height,
            std::ptr::null_mut(),
            std::ptr::null_mut(),
            std::ptr::null_mut(),
            std::ptr::null_mut(),
        )
    };
    if overlay.is_null() {
        unsafe { DeleteObject(bitmap) };
        return Err(failure("CreateWindowExW"));
    }
    let overlay_transition_result = unsafe {
        DwmSetWindowAttribute(
            overlay,
            DWMWA_TRANSITIONS_FORCEDISABLED,
            &disable_transitions as *const i32 as *const c_void,
            std::mem::size_of::<i32>() as u32,
        )
    };
    if overlay_transition_result < 0 {
        unsafe {
            DestroyWindow(overlay);
            DeleteObject(bitmap)
        };
        return Err(CommandError::new(
            "FOCUS_VISUAL_HOLD_FAILED",
            format!(
                "disable snapshot DWM transitions failed: HRESULT {overlay_transition_result:#x}"
            ),
        ));
    }
    unsafe {
        SendMessageW(overlay, STM_SETIMAGE, IMAGE_BITMAP, bitmap as isize);
        ShowWindow(overlay, SW_SHOWNOACTIVATE);
        UpdateWindow(overlay);
    }
    // Both windows are topmost. Explicitly raise the opaque bitmap above the
    // outgoing WebView before React starts its exit transition.
    if unsafe {
        SetWindowPos(
            overlay,
            HWND_TOPMOST,
            0,
            0,
            0,
            0,
            SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_SHOWWINDOW,
        )
    } == 0
    {
        unsafe {
            DestroyWindow(overlay);
            DeleteObject(bitmap)
        };
        return Err(failure("SetWindowPos"));
    }
    if unsafe { IsWindowVisible(overlay) } == 0 || unsafe { DwmFlush() } < 0 {
        unsafe {
            DestroyWindow(overlay);
            DeleteObject(bitmap)
        };
        return Err(CommandError::new(
            "FOCUS_VISUAL_HOLD_FAILED",
            "native copy could not be presented before the Focus transition",
        ));
    }
    *active = Some(VisualHold {
        window: overlay as isize,
        bitmap: bitmap as isize,
    });
    Ok(())
}

/// Keep the outgoing pixels above a resized/revealed WebView until the new
/// renderer frame is ready. A show/focus call can otherwise raise that WebView
/// over the hold even though the hold was topmost when it was created.
pub fn raise() -> CommandResult<()> {
    let active = ACTIVE
        .lock()
        .map_err(|_| CommandError::new("FOCUS_VISUAL_HOLD_FAILED", "visual hold lock poisoned"))?;
    let Some(hold) = *active else {
        return Ok(());
    };
    if unsafe {
        SetWindowPos(
            hold.window as Handle,
            HWND_TOPMOST,
            0,
            0,
            0,
            0,
            SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_SHOWWINDOW,
        )
    } == 0
    {
        return Err(failure("raise visual hold"));
    }
    if unsafe { DwmFlush() } < 0 {
        return Err(CommandError::new(
            "FOCUS_VISUAL_HOLD_FAILED",
            "raised visual hold could not be composed",
        ));
    }
    Ok(())
}

/// Before showing a resized Timer, cover both its old and new rectangles with
/// one frozen desktop image. This prevents the newly exposed area on expand
/// from appearing as an empty WebView surface before the atomic reveal.
pub fn cover_resized_timer(focus: &tauri::WebviewWindow) -> CommandResult<()> {
    let mut active = ACTIVE
        .lock()
        .map_err(|_| CommandError::new("FOCUS_VISUAL_HOLD_FAILED", "visual hold lock poisoned"))?;
    let Some(hold) = active.as_mut() else {
        return Ok(());
    };
    let hwnd = focus.hwnd().map_err(|error| {
        CommandError::new(
            "FOCUS_VISUAL_HOLD_FAILED",
            format!("focus HWND unavailable: {error}"),
        )
    })?;
    let mut old = Rect {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    };
    let mut target = old;
    if unsafe { GetWindowRect(hold.window as Handle, &mut old) } == 0
        || unsafe { GetWindowRect(hwnd.0 as isize as Handle, &mut target) } == 0
    {
        return Err(failure("GetWindowRect for resized Timer"));
    }
    let union = Rect {
        left: old.left.min(target.left),
        top: old.top.min(target.top),
        right: old.right.max(target.right),
        bottom: old.bottom.max(target.bottom),
    };
    if union.left == old.left
        && union.top == old.top
        && union.right == old.right
        && union.bottom == old.bottom
    {
        return Ok(());
    }
    let bitmap = capture_bitmap(union)?;
    unsafe {
        SendMessageW(
            hold.window as Handle,
            STM_SETIMAGE,
            IMAGE_BITMAP,
            bitmap as isize,
        )
    };
    if unsafe {
        SetWindowPos(
            hold.window as Handle,
            HWND_TOPMOST,
            union.left,
            union.top,
            union.right - union.left,
            union.bottom - union.top,
            SWP_NOACTIVATE | SWP_SHOWWINDOW,
        )
    } == 0
    {
        unsafe {
            SendMessageW(
                hold.window as Handle,
                STM_SETIMAGE,
                IMAGE_BITMAP,
                hold.bitmap as isize,
            );
            DeleteObject(bitmap);
        }
        return Err(failure("cover resized Timer"));
    }
    unsafe {
        DeleteObject(hold.bitmap as Handle);
        UpdateWindow(hold.window as Handle);
    }
    hold.bitmap = bitmap as isize;
    if unsafe { DwmFlush() } < 0 {
        return Err(CommandError::new(
            "FOCUS_VISUAL_HOLD_FAILED",
            "resized Timer visual hold could not be composed",
        ));
    }
    Ok(())
}

pub fn end() -> CommandResult<()> {
    let mut active = ACTIVE
        .lock()
        .map_err(|_| CommandError::new("FOCUS_VISUAL_HOLD_FAILED", "visual hold lock poisoned"))?;
    let Some(hold) = *active else {
        return Ok(());
    };
    // The target WebView is already visible and painted under this native copy.
    // Wait for a real desktop composition before uncovering it.
    let composition = unsafe { DwmFlush() };
    if unsafe { DestroyWindow(hold.window as Handle) } == 0 {
        return Err(failure("DestroyWindow"));
    }
    *active = None;
    if unsafe { DeleteObject(hold.bitmap as Handle) } == 0 {
        return Err(failure("DeleteObject"));
    }
    if composition < 0 {
        return Err(CommandError::new(
            "FOCUS_VISUAL_HOLD_FAILED",
            format!("DwmFlush failed: HRESULT {composition:#x}"),
        ));
    }
    Ok(())
}
