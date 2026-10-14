//! Short-lived, pixel-only Board morph across monitors.
//!
//! Main's WebView HWND stays at its restored size. Resizing that HWND clipped
//! its DirectComposition content on real Windows even with a fitted child
//! raster (PA350/PA351). This separate GDI popup owns no WebView, input, or
//! timer state and exists only while the prepared Focus host takes over.

use crate::error::{CommandError, CommandResult};
use crate::windows::PhysicalRect;

#[cfg(windows)]
mod native {
    use super::{CommandError, CommandResult, PhysicalRect};
    use std::{ffi::c_void, ptr, sync::mpsc, time::Duration};

    type Handle = *mut c_void;
    const CLASS: &str = "NarroBoardFocusPixels";
    const WM_PAINT: u32 = 0x000f;
    const WM_ERASEBKGND: u32 = 0x0014;
    const WM_NCHITTEST: u32 = 0x0084;
    const WM_NCDESTROY: u32 = 0x0082;
    const WM_TIMER: u32 = 0x0113;
    const USER_DATA: i32 = -21;

    #[repr(C)]
    #[derive(Default)]
    struct Rect {
        left: i32,
        top: i32,
        right: i32,
        bottom: i32,
    }
    #[repr(C)]
    struct Paint {
        dc: Handle,
        erase: i32,
        rect: Rect,
        restore: i32,
        update: i32,
        reserved: [u8; 32],
    }
    #[repr(C)]
    struct WindowClass {
        style: u32,
        procedure: unsafe extern "system" fn(Handle, u32, usize, isize) -> isize,
        class_extra: i32,
        window_extra: i32,
        instance: Handle,
        icon: Handle,
        cursor: Handle,
        background: Handle,
        menu: *const u16,
        name: *const u16,
    }
    #[repr(C)]
    struct BitmapInfo {
        size: u32,
        width: i32,
        height: i32,
        planes: u16,
        bits: u16,
        compression: u32,
        image_size: u32,
        x_pels: i32,
        y_pels: i32,
        colors_used: u32,
        colors_important: u32,
    }
    struct Pixels {
        bgra: Vec<u8>,
        width: i32,
        height: i32,
        painted: bool,
    }

    #[link(name = "user32")]
    unsafe extern "system" {
        fn RegisterClassW(class: *const WindowClass) -> u16;
        fn CreateWindowExW(
            ex: u32,
            class: *const u16,
            title: *const u16,
            style: u32,
            x: i32,
            y: i32,
            width: i32,
            height: i32,
            owner: Handle,
            menu: Handle,
            instance: Handle,
            parameter: Handle,
        ) -> Handle;
        fn DefWindowProcW(hwnd: Handle, message: u32, w: usize, l: isize) -> isize;
        fn DestroyWindow(hwnd: Handle) -> i32;
        fn IsWindow(hwnd: Handle) -> i32;
        fn SetWindowLongPtrW(hwnd: Handle, index: i32, value: isize) -> isize;
        fn GetWindowLongPtrW(hwnd: Handle, index: i32) -> isize;
        fn SetWindowPos(
            hwnd: Handle,
            after: Handle,
            x: i32,
            y: i32,
            width: i32,
            height: i32,
            flags: u32,
        ) -> i32;
        fn SetTimer(hwnd: Handle, id: usize, ms: u32, callback: Handle) -> usize;
        fn KillTimer(hwnd: Handle, id: usize) -> i32;
        fn BeginPaint(hwnd: Handle, paint: *mut Paint) -> Handle;
        fn EndPaint(hwnd: Handle, paint: *const Paint) -> i32;
        fn InvalidateRect(hwnd: Handle, rect: *const Rect, erase: i32) -> i32;
        fn UpdateWindow(hwnd: Handle) -> i32;
    }
    #[link(name = "gdi32")]
    unsafe extern "system" {
        fn StretchDIBits(
            dc: Handle,
            x: i32,
            y: i32,
            width: i32,
            height: i32,
            sx: i32,
            sy: i32,
            source_width: i32,
            source_height: i32,
            bits: *const c_void,
            info: *const BitmapInfo,
            usage: u32,
            rop: u32,
        ) -> i32;
    }
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn GetModuleHandleW(name: *const u16) -> Handle;
        fn GetCurrentThreadId() -> u32;
        fn GetLastError() -> u32;
    }
    #[link(name = "user32")]
    unsafe extern "system" {
        fn GetWindowThreadProcessId(hwnd: Handle, pid: *mut u32) -> u32;
        fn GetClientRect(hwnd: Handle, rect: *mut Rect) -> i32;
    }
    #[link(name = "dwmapi")]
    unsafe extern "system" {
        fn DwmFlush() -> i32;
    }

    fn wide(value: &str) -> Vec<u16> {
        value.encode_utf16().chain(Some(0)).collect()
    }
    fn failure(action: &str) -> CommandError {
        CommandError::new(
            "FOCUS_ENTRY_RASTER_FAILED",
            format!("{action}: Win32 {}", unsafe { GetLastError() }),
        )
    }
    fn dimensions(rect: PhysicalRect) -> CommandResult<(i32, i32)> {
        let width = i32::try_from(rect.size.width)
            .map_err(|_| CommandError::new("FOCUS_ENTRY_RASTER_FAILED", "raster width overflow"))?;
        let height = i32::try_from(rect.size.height).map_err(|_| {
            CommandError::new("FOCUS_ENTRY_RASTER_FAILED", "raster height overflow")
        })?;
        if width <= 0 || height <= 0 {
            return Err(CommandError::new(
                "FOCUS_ENTRY_RASTER_FAILED",
                "empty raster rect",
            ));
        }
        Ok((width, height))
    }

    unsafe extern "system" fn procedure(hwnd: Handle, message: u32, w: usize, l: isize) -> isize {
        let pointer = GetWindowLongPtrW(hwnd, USER_DATA) as *mut Pixels;
        match message {
            WM_ERASEBKGND => 1,
            WM_NCHITTEST => -1, // input passes through to the real desktop
            WM_PAINT if !pointer.is_null() => {
                let mut paint: Paint = std::mem::zeroed();
                let dc = BeginPaint(hwnd, &mut paint);
                let mut area = Rect::default();
                if !dc.is_null() && GetClientRect(hwnd, &mut area) != 0 {
                    let pixels = &mut *pointer;
                    let info = BitmapInfo {
                        size: 40,
                        width: pixels.width,
                        height: -pixels.height,
                        planes: 1,
                        bits: 32,
                        compression: 0,
                        image_size: pixels.bgra.len() as u32,
                        x_pels: 0,
                        y_pels: 0,
                        colors_used: 0,
                        colors_important: 0,
                    };
                    let copied = StretchDIBits(
                        dc,
                        0,
                        0,
                        area.right,
                        area.bottom,
                        0,
                        0,
                        pixels.width,
                        pixels.height,
                        pixels.bgra.as_ptr().cast(),
                        &info,
                        0,
                        0x00cc0020,
                    );
                    pixels.painted = copied > 0;
                }
                EndPaint(hwnd, &paint);
                0
            }
            WM_TIMER if w == 1 => {
                KillTimer(hwnd, 1);
                DestroyWindow(hwnd);
                0
            }
            WM_NCDESTROY => {
                SetWindowLongPtrW(hwnd, USER_DATA, 0);
                if !pointer.is_null() {
                    drop(Box::from_raw(pointer));
                }
                DefWindowProcW(hwnd, message, w, l)
            }
            _ => DefWindowProcW(hwnd, message, w, l),
        }
    }

    fn on_window_thread<T: Send + 'static>(
        owner: &tauri::WebviewWindow,
        operation: impl FnOnce() -> CommandResult<T> + Send + 'static,
    ) -> CommandResult<T> {
        let parent = owner
            .hwnd()
            .map_err(|e| CommandError::new("FOCUS_ENTRY_RASTER_FAILED", e.to_string()))?
            .0;
        if unsafe { GetWindowThreadProcessId(parent, ptr::null_mut()) == GetCurrentThreadId() } {
            return operation();
        }
        let (send, receive) = mpsc::sync_channel(1);
        owner
            .run_on_main_thread(move || {
                let _ = send.send(operation());
            })
            .map_err(|e| CommandError::new("FOCUS_ENTRY_RASTER_FAILED", e.to_string()))?;
        receive.recv_timeout(Duration::from_secs(2)).map_err(|e| {
            CommandError::new("FOCUS_ENTRY_RASTER_FAILED", format!("window thread: {e}"))
        })?
    }

    pub(crate) struct Raster {
        owner: tauri::WebviewWindow,
        hwnd: usize,
        armed: bool,
    }
    impl Raster {
        pub(crate) fn begin(
            owner: &tauri::WebviewWindow,
            rect: PhysicalRect,
            visible: tauri::PhysicalSize<u32>,
            png: &[u8],
        ) -> CommandResult<Self> {
            let (width, height) = dimensions(rect)?;
            let bgra =
                crate::focus_frame_capture::compact_bgra(png, visible.width, visible.height)?;
            let source_width = visible.width as i32;
            let source_height = visible.height as i32;
            let hwnd = on_window_thread(owner, move || {
                let class_name = wide(CLASS);
                let instance = unsafe { GetModuleHandleW(ptr::null()) };
                let class = WindowClass {
                    style: 0,
                    procedure,
                    class_extra: 0,
                    window_extra: 0,
                    instance,
                    icon: ptr::null_mut(),
                    cursor: ptr::null_mut(),
                    background: ptr::null_mut(),
                    menu: ptr::null(),
                    name: class_name.as_ptr(),
                };
                if unsafe { RegisterClassW(&class) } == 0 && unsafe { GetLastError() } != 1410 {
                    return Err(failure("register pixel popup"));
                }
                // Unowned WS_POPUP: hiding Main must not implicitly hide the
                // raster while it moves onto another display.
                let hwnd = unsafe {
                    CreateWindowExW(
                        0x08000080,
                        class_name.as_ptr(),
                        class_name.as_ptr(),
                        0x80000000,
                        rect.position.x,
                        rect.position.y,
                        width,
                        height,
                        ptr::null_mut(),
                        ptr::null_mut(),
                        instance,
                        ptr::null_mut(),
                    )
                };
                if hwnd.is_null() {
                    return Err(failure("create pixel popup"));
                }
                let pixels = Box::into_raw(Box::new(Pixels {
                    bgra,
                    width: source_width,
                    height: source_height,
                    painted: false,
                }));
                unsafe { SetWindowLongPtrW(hwnd, USER_DATA, pixels as isize) };
                if unsafe { GetWindowLongPtrW(hwnd, USER_DATA) } != pixels as isize {
                    unsafe {
                        DestroyWindow(hwnd);
                        drop(Box::from_raw(pixels));
                    }
                    return Err(failure("attach pixel popup frame"));
                }
                let prepared = (|| {
                    if unsafe { SetTimer(hwnd, 1, 8_000, ptr::null_mut()) } == 0 {
                        return Err(failure("arm raster watchdog"));
                    }
                    if unsafe {
                        SetWindowPos(
                            hwnd,
                            ptr::null_mut(),
                            rect.position.x,
                            rect.position.y,
                            width,
                            height,
                            0x50,
                        )
                    } == 0
                    {
                        return Err(failure("show pixel popup"));
                    }
                    unsafe {
                        InvalidateRect(hwnd, ptr::null(), 0);
                        UpdateWindow(hwnd);
                        DwmFlush();
                    }
                    if !unsafe { (&*(GetWindowLongPtrW(hwnd, USER_DATA) as *const Pixels)).painted }
                    {
                        return Err(CommandError::new(
                            "FOCUS_ENTRY_RASTER_FAILED",
                            "initial pixel popup frame did not paint",
                        ));
                    }
                    Ok(hwnd as usize)
                })();
                if prepared.is_err() {
                    unsafe {
                        DestroyWindow(hwnd);
                    }
                }
                prepared
            })?;
            Ok(Self {
                owner: owner.clone(),
                hwnd,
                armed: true,
            })
        }
        pub(crate) fn set_rect(&self, rect: PhysicalRect) -> CommandResult<()> {
            let (width, height) = dimensions(rect)?;
            let id = self.hwnd;
            on_window_thread(&self.owner, move || {
                let hwnd = id as Handle;
                if unsafe { IsWindow(hwnd) } == 0 {
                    return Err(failure("raster expired"));
                }
                if unsafe {
                    SetWindowPos(
                        hwnd,
                        ptr::null_mut(),
                        rect.position.x,
                        rect.position.y,
                        width,
                        height,
                        0x10,
                    )
                } == 0
                {
                    return Err(failure("move pixel popup"));
                }
                unsafe {
                    (*(GetWindowLongPtrW(hwnd, USER_DATA) as *mut Pixels)).painted = false;
                    InvalidateRect(hwnd, ptr::null(), 0);
                    UpdateWindow(hwnd);
                    DwmFlush();
                }
                if !unsafe { (&*(GetWindowLongPtrW(hwnd, USER_DATA) as *const Pixels)).painted } {
                    return Err(CommandError::new(
                        "FOCUS_ENTRY_RASTER_FAILED",
                        "moved pixel popup frame did not paint",
                    ));
                }
                Ok(())
            })
        }
        pub(crate) fn release(&mut self) -> CommandResult<()> {
            if !self.armed {
                return Ok(());
            }
            let id = self.hwnd;
            on_window_thread(&self.owner, move || {
                let hwnd = id as Handle;
                if unsafe { IsWindow(hwnd) } != 0 && unsafe { DestroyWindow(hwnd) } == 0 {
                    return Err(failure("release pixel popup"));
                }
                Ok(())
            })?;
            self.armed = false;
            Ok(())
        }
    }
    impl Drop for Raster {
        fn drop(&mut self) {
            if let Err(error) = self.release() {
                eprintln!("Could not release Board raster: {error}");
            }
        }
    }
}

#[cfg(not(windows))]
mod native {
    use super::{CommandError, CommandResult, PhysicalRect};
    pub(crate) struct Raster;
    impl Raster {
        pub(crate) fn begin(
            _: &tauri::WebviewWindow,
            _: PhysicalRect,
            _: tauri::PhysicalSize<u32>,
            _: &[u8],
        ) -> CommandResult<Self> {
            Err(CommandError::new(
                "FOCUS_ENTRY_RASTER_FAILED",
                "Windows pixel popup required",
            ))
        }
        pub(crate) fn set_rect(&self, _: PhysicalRect) -> CommandResult<()> {
            Ok(())
        }
        pub(crate) fn release(&mut self) -> CommandResult<()> {
            Ok(())
        }
    }
}

pub(crate) use native::Raster;
