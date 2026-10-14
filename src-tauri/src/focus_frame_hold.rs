//! A finite raster child protects the persistent Focus HWND's region boundary.
//!
//! CI932 proved that SetWindowRgn can replace otherwise-ready WebView pixels
//! with native caption frames. This child belongs to the same HWND and contains
//! only its prepared client pixels. It is never a WebView or timer authority.
//! Its one-shot expiry runs on the window thread; domain commits never wait for
//! the raster's lifetime, and idle Focus has no capture loop or retained bitmap.

use crate::error::{CommandError, CommandResult};

#[cfg(windows)]
mod native {
    use super::{CommandError, CommandResult};
    use std::{ffi::c_void, ptr, sync::mpsc, time::Duration};

    type Handle = *mut c_void;
    const CLASS: &str = "NarroFocusRegionFrame";
    const HOLD_MS: u32 = 500;
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
        color: u32,
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
            parent: Handle,
            menu: Handle,
            instance: Handle,
            parameter: Handle,
        ) -> Handle;
        fn DestroyWindow(window: Handle) -> i32;
        fn DefWindowProcW(window: Handle, message: u32, w: usize, l: isize) -> isize;
        fn SetWindowLongPtrW(window: Handle, index: i32, value: isize) -> isize;
        fn GetWindowLongPtrW(window: Handle, index: i32) -> isize;
        fn SetWindowPos(
            window: Handle,
            after: Handle,
            x: i32,
            y: i32,
            width: i32,
            height: i32,
            flags: u32,
        ) -> i32;
        fn SetWindowRgn(window: Handle, region: Handle, redraw: i32) -> i32;
        fn SetTimer(window: Handle, id: usize, ms: u32, callback: Handle) -> usize;
        fn KillTimer(window: Handle, id: usize) -> i32;
        fn BeginPaint(window: Handle, paint: *mut Paint) -> Handle;
        fn EndPaint(window: Handle, paint: *const Paint) -> i32;
        fn UpdateWindow(window: Handle) -> i32;
        fn InvalidateRect(window: Handle, rect: *const Rect, erase: i32) -> i32;
        fn FindWindowExW(
            parent: Handle,
            after: Handle,
            class: *const u16,
            title: *const u16,
        ) -> Handle;
        fn GetWindowThreadProcessId(window: Handle, pid: *mut u32) -> u32;
        fn GetClientRect(window: Handle, rect: *mut Rect) -> i32;
        fn GetDpiForWindow(window: Handle) -> u32;
    }
    #[link(name = "gdi32")]
    unsafe extern "system" {
        fn CreateCompatibleDC(dc: Handle) -> Handle;
        fn CreateDIBSection(
            dc: Handle,
            info: *const BitmapInfo,
            usage: u32,
            bits: *mut Handle,
            section: Handle,
            offset: u32,
        ) -> Handle;
        fn SelectObject(dc: Handle, object: Handle) -> Handle;
        fn BitBlt(
            target: Handle,
            x: i32,
            y: i32,
            width: i32,
            height: i32,
            source: Handle,
            sx: i32,
            sy: i32,
            operation: u32,
        ) -> i32;
        fn StretchBlt(
            target: Handle,
            x: i32,
            y: i32,
            width: i32,
            height: i32,
            source: Handle,
            sx: i32,
            sy: i32,
            sw: i32,
            sh: i32,
            operation: u32,
        ) -> i32;
        fn CreateRoundRectRgn(
            left: i32,
            top: i32,
            right: i32,
            bottom: i32,
            ellipse_width: i32,
            ellipse_height: i32,
        ) -> Handle;
        fn DeleteObject(object: Handle) -> i32;
        fn DeleteDC(dc: Handle) -> i32;
    }
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn GetModuleHandleW(name: *const u16) -> Handle;
        fn GetCurrentThreadId() -> u32;
        fn GetLastError() -> u32;
    }
    #[link(name = "dwmapi")]
    unsafe extern "system" {
        fn DwmFlush() -> i32;
    }

    fn wide(value: &str) -> Vec<u16> {
        value.encode_utf16().chain(Some(0)).collect()
    }
    fn failure(operation: &str) -> CommandError {
        CommandError::new(
            "FOCUS_FRAME_HOLD_FAILED",
            format!("{operation}: Win32 {}", unsafe { GetLastError() }),
        )
    }

    struct Pixels {
        dc: Handle,
        bitmap: Handle,
        original: Handle,
        width: i32,
        height: i32,
        fit_client: bool,
    }
    impl Drop for Pixels {
        fn drop(&mut self) {
            unsafe {
                if !self.original.is_null() {
                    SelectObject(self.dc, self.original);
                }
                if !self.bitmap.is_null() {
                    DeleteObject(self.bitmap);
                }
                if !self.dc.is_null() {
                    DeleteDC(self.dc);
                }
            }
        }
    }

    unsafe extern "system" fn procedure(hwnd: Handle, message: u32, w: usize, l: isize) -> isize {
        let pixels = GetWindowLongPtrW(hwnd, USER_DATA) as *mut Pixels;
        match message {
            WM_ERASEBKGND => 1,
            // This raster is purely visual; the actual React controls retain
            // pointer/keyboard ownership on the same parent/UI thread.
            WM_NCHITTEST => -1,
            WM_PAINT if !pixels.is_null() => {
                let mut paint: Paint = std::mem::zeroed();
                let dc = BeginPaint(hwnd, &mut paint);
                let image = &*pixels;
                if image.fit_client {
                    let mut rect = Rect::default();
                    if GetClientRect(hwnd, &mut rect) != 0 {
                        StretchBlt(
                            dc,
                            0,
                            0,
                            rect.right,
                            rect.bottom,
                            image.dc,
                            0,
                            0,
                            image.width,
                            image.height,
                            0x00cc0020,
                        );
                    }
                } else {
                    BitBlt(
                        dc,
                        0,
                        0,
                        image.width,
                        image.height,
                        image.dc,
                        0,
                        0,
                        0x00cc0020,
                    );
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
                if !pixels.is_null() {
                    drop(Box::from_raw(pixels));
                }
                DefWindowProcW(hwnd, message, w, l)
            }
            _ => DefWindowProcW(hwnd, message, w, l),
        }
    }

    fn on_window_thread<T: Send + 'static>(
        window: &tauri::WebviewWindow,
        operation: impl FnOnce(usize) -> CommandResult<T> + Send + 'static,
    ) -> CommandResult<T> {
        let parent = window
            .hwnd()
            .map_err(|e| CommandError::new("FOCUS_FRAME_HOLD_FAILED", e.to_string()))?
            .0 as usize;
        if unsafe {
            GetWindowThreadProcessId(parent as Handle, ptr::null_mut()) == GetCurrentThreadId()
        } {
            return operation(parent);
        }
        let (send, receive) = mpsc::sync_channel(1);
        window
            .run_on_main_thread(move || {
                let _ = send.send(operation(parent));
            })
            .map_err(|e| CommandError::new("FOCUS_FRAME_HOLD_FAILED", e.to_string()))?;
        receive.recv_timeout(Duration::from_secs(2)).map_err(|e| {
            CommandError::new(
                "FOCUS_FRAME_HOLD_FAILED",
                format!("window-thread dispatch: {e}"),
            )
        })?
    }

    // Main alone changes its HWND size during entry. Its frozen Board must fit
    // the current client, rather than clip away all tasks as the HWND narrows.
    // Ordinary Focus region/raster transitions retain their original paint path.
    pub(crate) fn fit_main_client(window: &tauri::WebviewWindow) -> CommandResult<()> {
        if window.label() != "main" {
            return Err(failure("fit requires Main"));
        }
        on_window_thread(window, move |parent| {
            let parent = parent as Handle;
            let name = wide(CLASS);
            let child =
                unsafe { FindWindowExW(parent, ptr::null_mut(), name.as_ptr(), ptr::null()) };
            if child.is_null() {
                return Ok(());
            } // Also used by rollback after expiry.
            let pixels = unsafe { GetWindowLongPtrW(child, USER_DATA) as *mut Pixels };
            if pixels.is_null() {
                return Err(failure("Main raster has no pixels"));
            }
            let mut rect = Rect::default();
            if unsafe { GetClientRect(parent, &mut rect) } == 0
                || rect.right <= 0
                || rect.bottom <= 0
            {
                return Err(failure("read Main client"));
            }
            unsafe {
                (*pixels).fit_client = true;
            }
            let diameter = (32.0 * unsafe { GetDpiForWindow(parent) } as f64 / 96.0).round() as i32;
            let region = unsafe {
                CreateRoundRectRgn(0, 0, rect.right + 1, rect.bottom + 1, diameter, diameter)
            };
            if region.is_null() {
                return Err(failure("create Main fit region"));
            }
            if unsafe { SetWindowRgn(child, region, 0) } == 0 {
                unsafe {
                    DeleteObject(region);
                }
                return Err(failure("apply Main fit region"));
            }
            if unsafe { SetWindowPos(child, ptr::null_mut(), 0, 0, rect.right, rect.bottom, 0x50) }
                == 0
            {
                return Err(failure("fit Main raster"));
            }
            unsafe {
                InvalidateRect(child, ptr::null(), 0);
                UpdateWindow(child);
            }
            Ok(())
        })
    }

    pub fn clear(window: &tauri::WebviewWindow) -> CommandResult<()> {
        on_window_thread(window, |parent| {
            let name = wide(CLASS);
            loop {
                let child = unsafe {
                    FindWindowExW(
                        parent as Handle,
                        ptr::null_mut(),
                        name.as_ptr(),
                        ptr::null(),
                    )
                };
                if child.is_null() {
                    break;
                }
                if unsafe { DestroyWindow(child) } == 0 {
                    return Err(failure("destroy superseded raster"));
                }
            }
            Ok(())
        })
    }

    pub struct Hold {
        window: tauri::WebviewWindow,
        child: usize,
        armed: bool,
    }
    impl Hold {
        pub(crate) fn release(&mut self) -> CommandResult<()> {
            let owned = self.child;
            on_window_thread(&self.window, move |parent| {
                let name = wide(CLASS);
                let child = unsafe {
                    FindWindowExW(
                        parent as Handle,
                        ptr::null_mut(),
                        name.as_ptr(),
                        ptr::null(),
                    )
                };
                if !child.is_null()
                    && child as usize == owned
                    && unsafe { DestroyWindow(child) } == 0
                {
                    return Err(failure("release owned raster"));
                }
                Ok(())
            })?;
            self.armed = false;
            Ok(())
        }
        pub(crate) fn replace_transition_frame(
            &self,
            visible: tauri::PhysicalSize<u32>,
            bytes: Vec<u8>,
        ) -> CommandResult<()> {
            if visible.width == 0
                || visible.height == 0
                || visible.width > 4096
                || visible.height > 4096
                || bytes.len() != visible.width as usize * visible.height as usize * 4
            {
                return Err(failure("invalid transition frame"));
            }
            let width = visible.width as i32;
            let height = visible.height as i32;
            let child_id = self.child;
            let scale = self
                .window
                .scale_factor()
                .map_err(|e| CommandError::new("FOCUS_FRAME_HOLD_FAILED", e.to_string()))?;
            let diameter = (32.0 * scale).round() as i32;
            on_window_thread(&self.window, move |parent| {
                let name = wide(CLASS);
                let child = unsafe {
                    FindWindowExW(
                        parent as Handle,
                        ptr::null_mut(),
                        name.as_ptr(),
                        ptr::null(),
                    )
                };
                if child.is_null() || child as usize != child_id {
                    return Err(failure("transition raster expired or superseded"));
                }
                let pixels = unsafe { GetWindowLongPtrW(child, USER_DATA) as *mut Pixels };
                if pixels.is_null() {
                    return Err(failure("transition raster has no pixels"));
                }
                let image = unsafe { &mut *pixels };
                let info = BitmapInfo {
                    size: 40,
                    width,
                    height: -height,
                    planes: 1,
                    bits: 32,
                    compression: 0,
                    image_size: bytes.len() as u32,
                    x_pels: 0,
                    y_pels: 0,
                    colors_used: 0,
                    colors_important: 0,
                    color: 0,
                };
                let mut bits = ptr::null_mut();
                let bitmap =
                    unsafe { CreateDIBSection(image.dc, &info, 0, &mut bits, ptr::null_mut(), 0) };
                if bitmap.is_null() || bits.is_null() {
                    if !bitmap.is_null() {
                        unsafe {
                            DeleteObject(bitmap);
                        }
                    }
                    return Err(failure("allocate transition bitmap"));
                }
                unsafe {
                    ptr::copy_nonoverlapping(bytes.as_ptr(), bits.cast(), bytes.len());
                }
                let old = unsafe { SelectObject(image.dc, bitmap) };
                if old.is_null() || old as isize == -1 {
                    unsafe {
                        DeleteObject(bitmap);
                    }
                    return Err(failure("select transition bitmap"));
                }
                unsafe {
                    DeleteObject(image.bitmap);
                }
                image.bitmap = bitmap;
                image.width = width;
                image.height = height;
                let region =
                    unsafe { CreateRoundRectRgn(0, 0, width + 1, height + 1, diameter, diameter) };
                if region.is_null() {
                    return Err(failure("create transition child envelope"));
                }
                if unsafe { SetWindowRgn(child, region, 0) } == 0 {
                    unsafe {
                        DeleteObject(region);
                    }
                    return Err(failure("apply transition child envelope"));
                }
                // Install the complete bitmap and child geometry BEFORE exposing
                // the matching parent region, all on the same window thread.
                if unsafe { SetWindowPos(child, ptr::null_mut(), 0, 0, width, height, 0x50) } == 0 {
                    return Err(failure("resize transition raster envelope"));
                }
                crate::timer_region::apply_native_rect(parent, visible, false)?;
                unsafe {
                    InvalidateRect(child, ptr::null(), 0);
                    UpdateWindow(child);
                    DwmFlush();
                }
                Ok(())
            })
        }
        // The one-shot native timer now owns cleanup. No GUI-thread sleep,
        // renderer authority, domain-state delay or continuous polling.
        pub fn commit(mut self) {
            self.armed = false;
        }
    }
    impl Drop for Hold {
        fn drop(&mut self) {
            if self.armed {
                if let Err(error) = self.release() {
                    eprintln!("Could not clean up rolled-back Focus raster: {error}");
                }
            }
        }
    }

    pub fn begin(
        window: &tauri::WebviewWindow,
        visible: tauri::PhysicalSize<u32>,
        png: &[u8],
    ) -> CommandResult<Hold> {
        begin_with_lifetime(window, visible, png, HOLD_MS)
    }

    pub(crate) fn begin_mode_transition(
        window: &tauri::WebviewWindow,
        visible: tauri::PhysicalSize<u32>,
        png: &[u8],
    ) -> CommandResult<Hold> {
        // Explicit renderer acknowledgement normally releases this lease.
        // A bounded watchdog handles renderer loss without an idle capture loop.
        begin_with_lifetime(window, visible, png, 8_000)
    }

    fn begin_with_lifetime(
        window: &tauri::WebviewWindow,
        visible: tauri::PhysicalSize<u32>,
        png: &[u8],
        lifetime_ms: u32,
    ) -> CommandResult<Hold> {
        let bytes = crate::focus_frame_capture::compact_bgra(png, visible.width, visible.height)?;
        let width = i32::try_from(visible.width).map_err(|_| failure("invalid raster width"))?;
        let height = i32::try_from(visible.height).map_err(|_| failure("invalid raster height"))?;
        let scale = window
            .scale_factor()
            .map_err(|e| CommandError::new("FOCUS_FRAME_HOLD_FAILED", e.to_string()))?;
        let diameter = (32.0 * scale).round() as i32;
        let child = on_window_thread(window, move |parent| {
            let name = wide(CLASS);
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
                name: name.as_ptr(),
            };
            if unsafe { RegisterClassW(&class) } == 0 && unsafe { GetLastError() } != 1410 {
                return Err(failure("register raster class"));
            }
            // The parent GDI DC contains stale native caption pixels. CapturePreview
            // supplies the actual prepared WebView pixels, independently of occlusion.
            let mut pixels = Pixels {
                dc: unsafe { CreateCompatibleDC(ptr::null_mut()) },
                bitmap: ptr::null_mut(),
                original: ptr::null_mut(),
                width,
                height,
                fit_client: false,
            };
            if pixels.dc.is_null() {
                return Err(failure("create raster DC"));
            }
            let info = BitmapInfo {
                size: 40,
                width,
                height: -height,
                planes: 1,
                bits: 32,
                compression: 0,
                image_size: bytes.len() as u32,
                x_pels: 0,
                y_pels: 0,
                colors_used: 0,
                colors_important: 0,
                color: 0,
            };
            let mut bitmap_bytes = ptr::null_mut();
            pixels.bitmap = unsafe {
                CreateDIBSection(pixels.dc, &info, 0, &mut bitmap_bytes, ptr::null_mut(), 0)
            };
            if pixels.bitmap.is_null() || bitmap_bytes.is_null() {
                return Err(failure("create raster bitmap"));
            }
            unsafe {
                ptr::copy_nonoverlapping(bytes.as_ptr(), bitmap_bytes.cast(), bytes.len());
            }
            pixels.original = unsafe { SelectObject(pixels.dc, pixels.bitmap) };
            if pixels.original.is_null() || pixels.original as isize == -1 {
                pixels.original = ptr::null_mut();
                return Err(failure("select raster bitmap"));
            }
            let child = unsafe {
                CreateWindowExW(
                    4,
                    name.as_ptr(),
                    name.as_ptr(),
                    0x44000000,
                    0,
                    0,
                    width,
                    height,
                    parent as Handle,
                    ptr::null_mut(),
                    instance,
                    ptr::null_mut(),
                )
            };
            if child.is_null() {
                return Err(failure("create raster child"));
            }
            unsafe {
                SetWindowLongPtrW(child, USER_DATA, Box::into_raw(Box::new(pixels)) as isize);
            }
            let installed = (|| {
                let region =
                    unsafe { CreateRoundRectRgn(0, 0, width + 1, height + 1, diameter, diameter) };
                if region.is_null() {
                    return Err(failure("create raster clipping"));
                }
                if unsafe { SetWindowRgn(child, region, 0) } == 0 {
                    unsafe {
                        DeleteObject(region);
                    }
                    return Err(failure("clip raster child"));
                }
                if unsafe { SetTimer(child, 1, lifetime_ms, ptr::null_mut()) } == 0 {
                    return Err(failure("arm finite raster expiry"));
                }
                if unsafe { SetWindowPos(child, ptr::null_mut(), 0, 0, width, height, 0x50) } == 0 {
                    return Err(failure("present raster child"));
                }
                unsafe {
                    UpdateWindow(child);
                    DwmFlush();
                }
                Ok(child as usize)
            })();
            if installed.is_err() {
                unsafe {
                    DestroyWindow(child);
                }
            }
            installed
        })?;
        Ok(Hold {
            window: window.clone(),
            child,
            armed: true,
        })
    }
}

#[cfg(not(windows))]
mod native {
    use super::CommandResult;
    pub struct Hold;
    impl Hold {
        pub fn commit(self) {}
        pub(crate) fn release(&mut self) -> CommandResult<()> {
            Ok(())
        }
        pub(crate) fn replace_transition_frame(
            &self,
            _: tauri::PhysicalSize<u32>,
            _: Vec<u8>,
        ) -> CommandResult<()> {
            Ok(())
        }
    }
    pub fn clear(_: &tauri::WebviewWindow) -> CommandResult<()> {
        Ok(())
    }
    pub(crate) fn fit_main_client(_: &tauri::WebviewWindow) -> CommandResult<()> {
        Ok(())
    }
    pub fn begin(
        _: &tauri::WebviewWindow,
        _: tauri::PhysicalSize<u32>,
        _: &[u8],
    ) -> CommandResult<Hold> {
        Ok(Hold)
    }
    pub(crate) fn begin_mode_transition(
        window: &tauri::WebviewWindow,
        visible: tauri::PhysicalSize<u32>,
        png: &[u8],
    ) -> CommandResult<Hold> {
        begin(window, visible, png)
    }
}

pub use native::{begin, clear};
pub(crate) use native::{begin_mode_transition, fit_main_client, Hold};
