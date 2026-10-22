//! Transient owned top-level layered raster for Panel/Timer presentation.
//! The older in-parent GDI child cannot guarantee pixel ownership against
//! WebView2/DWM during native region shrink. An independent owned popup has
//! one premultiplied BGRA hierarchy, atomically updated by UpdateLayeredWindow.
//! It does not activate, accept mouse input, own a WebView, or persist at idle.
use crate::error::{CommandError, CommandResult};

#[cfg(windows)]
mod native {
    use super::{CommandError, CommandResult};
    use std::{
        ffi::c_void,
        ptr,
        sync::{
            atomic::{AtomicU64, Ordering},
            mpsc,
        },
        time::{Duration, Instant},
    };

    type Handle = *mut c_void;
    const CLASS: &str = "NarroFocusOwnedLayer";
    const USER_DATA: i32 = -21;
    const WM_TIMER: u32 = 0x0113;
    const WM_NCDESTROY: u32 = 0x0082;
    const WM_NCHITTEST: u32 = 0x0084;
    const WM_MOUSEACTIVATE: u32 = 0x0021;
    const GW_OWNER: u32 = 4;
    const WS_POPUP: u32 = 0x8000_0000;
    const WS_EX_LAYERED: u32 = 0x0008_0000;
    const WS_EX_TRANSPARENT: u32 = 0x0000_0020;
    const WS_EX_NOACTIVATE: u32 = 0x0800_0000;
    const WS_EX_TOOLWINDOW: u32 = 0x0000_0080;
    const ULW_ALPHA: u32 = 2;
    const SRCCOPY_ALPHA: u8 = 1;
    const TIMER_MS: u32 = 50;
    const MAX_LIFETIME: Duration = Duration::from_secs(8);
    static NEXT_TOKEN: AtomicU64 = AtomicU64::new(1);

    #[repr(C)]
    #[derive(Default, Clone, Copy)]
    struct Point {
        x: i32,
        y: i32,
    }
    #[repr(C)]
    #[derive(Default, Clone, Copy)]
    struct Size {
        cx: i32,
        cy: i32,
    }
    #[repr(C)]
    #[derive(Default, Clone, Copy)]
    struct Rect {
        left: i32,
        top: i32,
        right: i32,
        bottom: i32,
    }
    #[repr(C)]
    struct Blend {
        operation: u8,
        flags: u8,
        constant_alpha: u8,
        alpha_format: u8,
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
            owner: Handle,
            menu: Handle,
            instance: Handle,
            parameter: Handle,
        ) -> Handle;
        fn DestroyWindow(window: Handle) -> i32;
        fn DefWindowProcW(window: Handle, message: u32, w: usize, l: isize) -> isize;
        fn SetWindowLongPtrW(window: Handle, index: i32, value: isize) -> isize;
        fn GetWindowLongPtrW(window: Handle, index: i32) -> isize;
        fn FindWindowW(class: *const u16, title: *const u16) -> Handle;
        fn GetWindow(window: Handle, command: u32) -> Handle;
        fn IsWindow(window: Handle) -> i32;
        fn IsWindowVisible(window: Handle) -> i32;
        fn IsIconic(window: Handle) -> i32;
        fn GetWindowRect(window: Handle, rect: *mut Rect) -> i32;
        fn SetWindowPos(
            window: Handle,
            after: Handle,
            x: i32,
            y: i32,
            width: i32,
            height: i32,
            flags: u32,
        ) -> i32;
        fn UpdateLayeredWindow(
            window: Handle,
            target: Handle,
            position: *const Point,
            size: *const Size,
            source: Handle,
            offset: *const Point,
            color_key: u32,
            blend: *const Blend,
            flags: u32,
        ) -> i32;
        fn ShowWindow(window: Handle, command: i32) -> i32;
        fn SetTimer(window: Handle, id: usize, ms: u32, callback: Handle) -> usize;
        fn KillTimer(window: Handle, id: usize) -> i32;
        fn GetWindowThreadProcessId(window: Handle, pid: *mut u32) -> u32;
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
        fn DeleteObject(object: Handle) -> i32;
        fn DeleteDC(dc: Handle) -> i32;
    }
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn GetModuleHandleW(name: *const u16) -> Handle;
        fn GetCurrentThreadId() -> u32;
        fn GetLastError() -> u32;
    }
    fn wide(s: &str) -> Vec<u16> {
        s.encode_utf16().chain(Some(0)).collect()
    }
    fn failed(stage: &str) -> CommandError {
        CommandError::new(
            "FOCUS_LAYERED_RASTER_FAILED",
            format!("{stage}: Win32 {}", unsafe { GetLastError() }),
        )
    }
    fn invalid(stage: &str) -> CommandError {
        CommandError::new("FOCUS_LAYERED_RASTER_FAILED", stage)
    }

    struct State {
        token: u64,
        started: Instant,
        width: i32,
        height: i32,
    }
    unsafe extern "system" fn procedure(hwnd: Handle, msg: u32, w: usize, l: isize) -> isize {
        match msg {
            WM_NCHITTEST => -1,    // HTTRANSPARENT; real WebView owns hit testing
            WM_MOUSEACTIVATE => 3, // MA_NOACTIVATE
            WM_TIMER if w == 1 => {
                let state = GetWindowLongPtrW(hwnd, USER_DATA) as *mut State;
                let owner = GetWindow(hwnd, GW_OWNER);
                if state.is_null()
                    || owner.is_null()
                    || IsWindow(owner) == 0
                    || IsWindowVisible(owner) == 0
                    || IsIconic(owner) != 0
                    || (*state).started.elapsed() >= MAX_LIFETIME
                {
                    DestroyWindow(hwnd);
                } else {
                    // The overlay is outside the clipped parent hierarchy.
                    // It follows owner moves while the bounded lease is alive.
                    let mut origin = Rect::default();
                    let mut popup = Rect::default();
                    if GetWindowRect(owner, &mut origin) != 0
                        && GetWindowRect(hwnd, &mut popup) != 0
                        && (origin.left != popup.left || origin.top != popup.top)
                    {
                        SetWindowPos(
                            hwnd,
                            ptr::null_mut(),
                            origin.left,
                            origin.top,
                            0,
                            0,
                            0x0001 | 0x0004 | 0x0010,
                        );
                    }
                }
                0
            }
            WM_NCDESTROY => {
                KillTimer(hwnd, 1);
                let data = SetWindowLongPtrW(hwnd, USER_DATA, 0) as *mut State;
                if !data.is_null() {
                    drop(Box::from_raw(data));
                }
                DefWindowProcW(hwnd, msg, w, l)
            }
            _ => DefWindowProcW(hwnd, msg, w, l),
        }
    }
    fn owner_origin(owner: Handle) -> CommandResult<Point> {
        let mut rect = Rect::default();
        if unsafe { GetWindowRect(owner, &mut rect) } == 0 {
            return Err(failed("read owner origin"));
        }
        Ok(Point {
            x: rect.left,
            y: rect.top,
        })
    }
    fn valid_bytes(visible: tauri::PhysicalSize<u32>, bytes: &[u8]) -> CommandResult<()> {
        if visible.width == 0
            || visible.height == 0
            || visible.width > 4096
            || visible.height > 4096
            || bytes.len() != visible.width as usize * visible.height as usize * 4
        {
            return Err(invalid("invalid layered raster dimensions or pixel count"));
        }
        Ok(())
    }
    // Copy each source pixel exactly; only the established 32-logical-pixel
    // round-rect corners become transparent, with pre-multiplied zero RGB.
    fn rounded_premultiplied(bytes: &mut [u8], w: u32, h: u32, diameter: u32) {
        let radius = (diameter / 2).min(w / 2).min(h / 2);
        if radius == 0 {
            return;
        }
        let r = f64::from(radius);
        for y in 0..h {
            for x in 0..w {
                let xx = if x < radius {
                    Some(f64::from(radius - x) - 0.5)
                } else if x >= w - radius {
                    Some(f64::from(x - (w - radius)) + 0.5)
                } else {
                    None
                };
                let yy = if y < radius {
                    Some(f64::from(radius - y) - 0.5)
                } else if y >= h - radius {
                    Some(f64::from(y - (h - radius)) + 0.5)
                } else {
                    None
                };
                if let (Some(dx), Some(dy)) = (xx, yy) {
                    if dx * dx + dy * dy > r * r {
                        let i = (y as usize * w as usize + x as usize) * 4;
                        bytes[i..i + 4].fill(0);
                    }
                }
            }
        }
    }

    struct Dib {
        dc: Handle,
        bitmap: Handle,
        original: Handle,
    }
    impl Drop for Dib {
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
    fn draw(
        owner: Handle,
        popup: Handle,
        visible: tauri::PhysicalSize<u32>,
        mut bytes: Vec<u8>,
        diameter: u32,
    ) -> CommandResult<()> {
        valid_bytes(visible, &bytes)?;
        if unsafe { IsWindow(owner) } == 0
            || unsafe { IsWindowVisible(owner) } == 0
            || unsafe { IsIconic(owner) } != 0
        {
            return Err(invalid(
                "Focus owner hidden or minimized during raster transaction",
            ));
        }
        rounded_premultiplied(&mut bytes, visible.width, visible.height, diameter);
        let width = visible.width as i32;
        let height = visible.height as i32;
        let mut dib = Dib {
            dc: unsafe { CreateCompatibleDC(ptr::null_mut()) },
            bitmap: ptr::null_mut(),
            original: ptr::null_mut(),
        };
        if dib.dc.is_null() {
            return Err(failed("create layered source DC"));
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
        let mut bits = ptr::null_mut();
        dib.bitmap = unsafe { CreateDIBSection(dib.dc, &info, 0, &mut bits, ptr::null_mut(), 0) };
        if dib.bitmap.is_null() || bits.is_null() {
            return Err(failed("allocate layered bitmap"));
        }
        unsafe {
            ptr::copy_nonoverlapping(bytes.as_ptr(), bits.cast(), bytes.len());
        }
        dib.original = unsafe { SelectObject(dib.dc, dib.bitmap) };
        if dib.original.is_null() || dib.original as isize == -1 {
            dib.original = ptr::null_mut();
            return Err(failed("select layered bitmap"));
        }
        let at = owner_origin(owner)?;
        let size = Size {
            cx: width,
            cy: height,
        };
        let source = Point::default();
        let blend = Blend {
            operation: 0,
            flags: 0,
            constant_alpha: 255,
            alpha_format: SRCCOPY_ALPHA,
        };
        if unsafe {
            UpdateLayeredWindow(
                popup,
                ptr::null_mut(),
                &at,
                &size,
                dib.dc,
                &source,
                0,
                &blend,
                ULW_ALPHA,
            )
        } == 0
        {
            return Err(failed("atomic owned layered bitmap/geometry commit"));
        }
        Ok(())
    }

    fn on_window_thread<T: Send + 'static>(
        window: &tauri::WebviewWindow,
        operation: impl FnOnce(usize) -> CommandResult<T> + Send + 'static,
    ) -> CommandResult<T> {
        let owner = window
            .hwnd()
            .map_err(|e| invalid(&format!("resolve Focus HWND: {e}")))?
            .0 as usize;
        if unsafe {
            GetWindowThreadProcessId(owner as Handle, ptr::null_mut()) == GetCurrentThreadId()
        } {
            return operation(owner);
        }
        let (tx, rx) = mpsc::sync_channel(1);
        window
            .run_on_main_thread(move || {
                let _ = tx.send(operation(owner));
            })
            .map_err(|e| invalid(&format!("Focus HWND thread dispatch: {e}")))?;
        rx.recv_timeout(Duration::from_secs(2))
            .map_err(|e| invalid(&format!("Focus HWND dispatch timeout: {e}")))?
    }
    fn existing(owner: Handle) -> Handle {
        let class = wide(CLASS);
        let popup = unsafe { FindWindowW(class.as_ptr(), ptr::null()) };
        if !popup.is_null() && unsafe { GetWindow(popup, GW_OWNER) } == owner {
            popup
        } else {
            ptr::null_mut()
        }
    }
    pub fn clear(window: &tauri::WebviewWindow) -> CommandResult<()> {
        on_window_thread(window, |owner| {
            let popup = existing(owner as Handle);
            if !popup.is_null() && unsafe { DestroyWindow(popup) } == 0 {
                return Err(failed("destroy previous layered Focus popup"));
            }
            Ok(())
        })
    }
    pub struct Hold {
        window: tauri::WebviewWindow,
        popup: usize,
        token: u64,
        armed: bool,
    }
    impl Hold {
        pub(crate) fn replace_transition_frame(
            &self,
            visible: tauri::PhysicalSize<u32>,
            bytes: Vec<u8>,
        ) -> CommandResult<()> {
            valid_bytes(visible, &bytes)?;
            let popup_id = self.popup;
            let token = self.token;
            let scale = self
                .window
                .scale_factor()
                .map_err(|e| invalid(&format!("read owned-layer DPI: {e}")))?;
            let diameter = (32.0 * scale).round() as u32;
            on_window_thread(&self.window, move |owner| {
                let popup = popup_id as Handle;
                if unsafe { IsWindow(popup) } == 0
                    || unsafe { GetWindow(popup, GW_OWNER) } != owner as Handle
                {
                    return Err(invalid("owned raster no longer exists"));
                }
                let data = unsafe { GetWindowLongPtrW(popup, USER_DATA) as *mut State };
                if data.is_null() || unsafe { (*data).token } != token {
                    return Err(invalid("stale layered raster token"));
                }
                let shrinking = visible.height < unsafe { (*data).height as u32 };
                if shrinking {
                    // Clip the parent *before* shrinking the independent cover.
                    // Old overlay pixels still conceal the disappearing parent rows.
                    crate::timer_region::apply_native_rect(owner, visible, false)?;
                }
                draw(owner as Handle, popup, visible, bytes, diameter)?;
                if !shrinking {
                    // When growing, cover new rows before revealing parent pixels.
                    crate::timer_region::apply_native_rect(owner, visible, false)?;
                }
                unsafe {
                    (*data).width = visible.width as i32;
                    (*data).height = visible.height as i32;
                }
                Ok(())
            })
        }
        pub(crate) fn release(&mut self) -> CommandResult<()> {
            let popup_id = self.popup;
            let token = self.token;
            on_window_thread(&self.window, move |owner| {
                let popup = popup_id as Handle;
                if unsafe { IsWindow(popup) } != 0
                    && unsafe { GetWindow(popup, GW_OWNER) } == owner as Handle
                {
                    let data = unsafe { GetWindowLongPtrW(popup, USER_DATA) as *mut State };
                    if !data.is_null()
                        && unsafe { (*data).token } == token
                        && unsafe { DestroyWindow(popup) } == 0
                    {
                        return Err(failed("release owned layered raster"));
                    }
                }
                Ok(())
            })?;
            self.armed = false;
            Ok(())
        }
    }
    impl Drop for Hold {
        fn drop(&mut self) {
            if self.armed {
                if let Err(error) = self.release() {
                    eprintln!("Could not clean up Focus layered raster: {error}");
                }
            }
        }
    }
    pub(crate) fn begin_mode_transition(
        window: &tauri::WebviewWindow,
        visible: tauri::PhysicalSize<u32>,
        png: &[u8],
    ) -> CommandResult<Hold> {
        let bytes = crate::focus_frame_capture::compact_bgra(png, visible.width, visible.height)?;
        valid_bytes(visible, &bytes)?;
        let diameter = (32.0
            * window
                .scale_factor()
                .map_err(|e| invalid(&format!("read Focus DPI: {e}")))?)
        .round() as u32;
        let token = NEXT_TOKEN.fetch_add(1, Ordering::Relaxed);
        let popup = on_window_thread(window, move |owner| {
            let owner = owner as Handle;
            let previous = existing(owner);
            if !previous.is_null() && unsafe { DestroyWindow(previous) } == 0 {
                return Err(failed("destroy superseded owned raster"));
            }
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
                return Err(failed("register owned raster class"));
            }
            let popup = unsafe {
                CreateWindowExW(
                    WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_NOACTIVATE | WS_EX_TOOLWINDOW,
                    class_name.as_ptr(),
                    class_name.as_ptr(),
                    WS_POPUP,
                    0,
                    0,
                    visible.width as i32,
                    visible.height as i32,
                    owner,
                    ptr::null_mut(),
                    instance,
                    ptr::null_mut(),
                )
            };
            if popup.is_null() {
                return Err(failed("create Focus-owned layered popup"));
            }
            let state = Box::new(State {
                token,
                started: Instant::now(),
                width: visible.width as i32,
                height: visible.height as i32,
            });
            unsafe {
                SetWindowLongPtrW(popup, USER_DATA, Box::into_raw(state) as isize);
            }
            if let Err(error) = draw(owner, popup, visible, bytes, diameter) {
                unsafe {
                    DestroyWindow(popup);
                }
                return Err(error);
            }
            if unsafe { SetTimer(popup, 1, TIMER_MS, ptr::null_mut()) } == 0 {
                let error = failed("arm layered raster expiry/owner-hide watchdog");
                unsafe {
                    DestroyWindow(popup);
                }
                return Err(error);
            }
            unsafe {
                ShowWindow(popup, 4);
            } // SW_SHOWNOACTIVATE
            Ok(popup as usize)
        })?;
        Ok(Hold {
            window: window.clone(),
            popup,
            token,
            armed: true,
        })
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        #[test]
        fn rounded_alpha_preserves_opaque_interior_and_zeros_corner_rgb() {
            let mut pixels = [12, 22, 32, 255].repeat(16);
            rounded_premultiplied(&mut pixels, 4, 4, 4);
            assert_eq!(&pixels[..4], &[0, 0, 0, 0]);
            assert_eq!(
                &pixels[(1 * 4 + 1) * 4..(1 * 4 + 2) * 4],
                &[12, 22, 32, 255]
            );
            assert_eq!(&pixels[(3 * 4 + 3) * 4..], &[0, 0, 0, 0]);
        }
        #[test]
        fn invalid_pixel_count_and_geometry_fail_before_native_use() {
            assert!(valid_bytes(tauri::PhysicalSize::new(0, 1), &[]).is_err());
            assert!(valid_bytes(tauri::PhysicalSize::new(1, 1), &[]).is_err());
            assert!(valid_bytes(tauri::PhysicalSize::new(1, 1), &[0, 0, 0, 255]).is_ok());
        }
    }
}

#[cfg(not(windows))]
mod native {
    use super::CommandResult;
    pub struct Hold(crate::focus_frame_hold::Hold);
    impl Hold {
        pub(crate) fn release(&mut self) -> CommandResult<()> {
            self.0.release()
        }
        pub(crate) fn replace_transition_frame(
            &self,
            size: tauri::PhysicalSize<u32>,
            bytes: Vec<u8>,
        ) -> CommandResult<()> {
            self.0.replace_transition_frame(size, bytes)
        }
    }
    pub(crate) fn begin_mode_transition(
        window: &tauri::WebviewWindow,
        size: tauri::PhysicalSize<u32>,
        png: &[u8],
    ) -> CommandResult<Hold> {
        Ok(Hold(crate::focus_frame_hold::begin_mode_transition(
            window, size, png,
        )?))
    }
    pub(crate) fn clear(_: &tauri::WebviewWindow) -> CommandResult<()> {
        Ok(())
    }
}
pub(crate) use native::{begin_mode_transition, clear, Hold};
