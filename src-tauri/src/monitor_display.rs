//! Read-only Windows display metadata for the existing Preferences monitor cards.
//! Device keys/placement are deliberately NOT derived from friendly labels.
//! Desktop samples are low-resolution, ephemeral, never persisted or logged.
use crate::windows::{PhysicalPoint, PhysicalSize};

const PREVIEW_WIDTH: u32 = 192;
const PREVIEW_HEIGHT: u32 = 108;

fn human_monitor_name(label: &str) -> Option<String> {
    let label = label.trim();
    if label.is_empty()
        || label.eq_ignore_ascii_case("Generic PnP Monitor")
        || label.eq_ignore_ascii_case("Generic Non-PnP Monitor")
        || label.eq_ignore_ascii_case("Default Monitor")
    {
        return None;
    }
    Some(label.to_owned())
}

fn base64(data: &[u8]) -> String {
    const TABLE: &[u8; 64] =
        b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut output = String::with_capacity(data.len().div_ceil(3) * 4);
    for block in data.chunks(3) {
        let n = (u32::from(block[0]) << 16)
            | (u32::from(*block.get(1).unwrap_or(&0)) << 8)
            | u32::from(*block.get(2).unwrap_or(&0));
        output.push(TABLE[((n >> 18) & 63) as usize] as char);
        output.push(TABLE[((n >> 12) & 63) as usize] as char);
        output.push(if block.len() > 1 {
            TABLE[((n >> 6) & 63) as usize] as char
        } else {
            '='
        });
        output.push(if block.len() > 2 {
            TABLE[(n & 63) as usize] as char
        } else {
            '='
        });
    }
    output
}

pub fn friendly_name(display_name: Option<&str>) -> Option<String> {
    #[cfg(windows)]
    {
        display_name.and_then(native::friendly_name)
    }
    #[cfg(not(windows))]
    {
        let _ = display_name;
        None
    }
}

pub fn desktop_preview_data_url(position: PhysicalPoint, size: PhysicalSize) -> Option<String> {
    #[cfg(windows)]
    {
        let pixels = native::capture_desktop_sample(position, size)?;
        let mut png_bytes = Vec::new();
        {
            let mut encoder = png::Encoder::new(&mut png_bytes, PREVIEW_WIDTH, PREVIEW_HEIGHT);
            encoder.set_color(png::ColorType::Rgba);
            encoder.set_depth(png::BitDepth::Eight);
            let mut writer = encoder.write_header().ok()?;
            writer.write_image_data(&pixels).ok()?;
            writer.finish().ok()?;
        }
        Some(format!("data:image/png;base64,{}", base64(&png_bytes)))
    }
    #[cfg(not(windows))]
    {
        let _ = (position, size);
        None
    }
}

#[cfg(windows)]
mod native {
    use super::{human_monitor_name, PhysicalPoint, PhysicalSize, PREVIEW_HEIGHT, PREVIEW_WIDTH};
    use std::ffi::c_void;
    use std::ptr::{null, null_mut};

    type Handle = *mut c_void;
    const DISPLAY_DEVICE_ACTIVE: u32 = 0x0000_0001;
    const DISPLAY_DEVICE_ATTACHED_TO_DESKTOP: u32 = 0x0000_0001;
    const SRCCOPY: u32 = 0x00CC_0020;
    const HALFTONE: i32 = 4;

    #[repr(C)]
    #[derive(Default)]
    struct DisplayDevice {
        cb: u32,
        device_name: [u16; 32],
        device_string: [u16; 128],
        state_flags: u32,
        device_id: [u16; 128],
        device_key: [u16; 128],
    }

    impl DisplayDevice {
        fn initialized() -> Self {
            Self {
                cb: std::mem::size_of::<Self>() as u32,
                ..Self::default()
            }
        }
    }

    #[repr(C)]
    struct BitmapInfoHeader {
        size: u32,
        width: i32,
        height: i32,
        planes: u16,
        bit_count: u16,
        compression: u32,
        size_image: u32,
        x_pels_per_meter: i32,
        y_pels_per_meter: i32,
        clr_used: u32,
        clr_important: u32,
    }

    #[repr(C)]
    struct BitmapInfo {
        header: BitmapInfoHeader,
        colors: [u32; 3],
    }

    #[link(name = "user32")]
    unsafe extern "system" {
        fn EnumDisplayDevicesW(
            device_name: *const u16,
            device_index: u32,
            device: *mut DisplayDevice,
            flags: u32,
        ) -> i32;
        fn GetDC(window: Handle) -> Handle;
        fn ReleaseDC(window: Handle, dc: Handle) -> i32;
    }

    #[link(name = "gdi32")]
    unsafe extern "system" {
        fn CreateCompatibleDC(dc: Handle) -> Handle;
        fn DeleteDC(dc: Handle) -> i32;
        fn CreateDIBSection(
            dc: Handle,
            info: *const BitmapInfo,
            usage: u32,
            pixels: *mut Handle,
            section: Handle,
            offset: u32,
        ) -> Handle;
        fn SelectObject(dc: Handle, object: Handle) -> Handle;
        fn DeleteObject(object: Handle) -> i32;
        fn SetStretchBltMode(dc: Handle, mode: i32) -> i32;
        fn StretchBlt(
            target: Handle,
            x: i32,
            y: i32,
            width: i32,
            height: i32,
            source: Handle,
            source_x: i32,
            source_y: i32,
            source_width: i32,
            source_height: i32,
            operation: u32,
        ) -> i32;
    }

    fn utf16_string(value: &[u16]) -> String {
        let len = value.iter().position(|&character| character == 0).unwrap_or(value.len());
        String::from_utf16_lossy(&value[..len])
    }

    pub fn friendly_name(display_name: &str) -> Option<String> {
        // Match the SAME adapter name used by Tauri (e.g. \\.\DISPLAY2).
        // Never map by enumeration index, screen position or a guessed model.
        for adapter_index in 0..32 {
            let mut adapter = DisplayDevice::initialized();
            if unsafe { EnumDisplayDevicesW(null(), adapter_index, &mut adapter, 0) } == 0 {
                break;
            }
            if adapter.state_flags & DISPLAY_DEVICE_ATTACHED_TO_DESKTOP == 0
                || !utf16_string(&adapter.device_name).eq_ignore_ascii_case(display_name)
            {
                continue;
            }
            let mut first_non_generic = None;
            for child_index in 0..16 {
                let mut child = DisplayDevice::initialized();
                if unsafe {
                    EnumDisplayDevicesW(adapter.device_name.as_ptr(), child_index, &mut child, 0)
                } == 0
                {
                    break;
                }
                let name = human_monitor_name(&utf16_string(&child.device_string));
                if child.state_flags & DISPLAY_DEVICE_ACTIVE != 0 && name.is_some() {
                    return name;
                }
                if first_non_generic.is_none() {
                    first_non_generic = name;
                }
            }
            return first_non_generic;
        }
        None
    }

    pub fn capture_desktop_sample(
        position: PhysicalPoint,
        size: PhysicalSize,
    ) -> Option<Vec<u8>> {
        // Limit source dimensions and all coordinate conversions before GDI.
        if size.width == 0 || size.height == 0
            || size.width > 16_384 || size.height > 16_384
        {
            return None;
        }
        let source_width = i32::try_from(size.width).ok()?;
        let source_height = i32::try_from(size.height).ok()?;
        position.x.checked_add(source_width)?;
        position.y.checked_add(source_height)?;

        let desktop_dc = unsafe { GetDC(null_mut()) };
        if desktop_dc.is_null() {
            return None;
        }
        let memory_dc = unsafe { CreateCompatibleDC(desktop_dc) };
        if memory_dc.is_null() {
            unsafe { ReleaseDC(null_mut(), desktop_dc) };
            return None;
        }
        let info = BitmapInfo {
            header: BitmapInfoHeader {
                size: std::mem::size_of::<BitmapInfoHeader>() as u32,
                width: PREVIEW_WIDTH as i32,
                height: -(PREVIEW_HEIGHT as i32),
                planes: 1,
                bit_count: 32,
                compression: 0, // BI_RGB, top-down BGRA
                size_image: PREVIEW_WIDTH * PREVIEW_HEIGHT * 4,
                x_pels_per_meter: 0,
                y_pels_per_meter: 0,
                clr_used: 0,
                clr_important: 0,
            },
            colors: [0; 3],
        };
        let mut bits: Handle = null_mut();
        let bitmap = unsafe {
            CreateDIBSection(desktop_dc, &info, 0, &mut bits, null_mut(), 0)
        };
        let result = if bitmap.is_null() || bits.is_null() {
            None
        } else {
            let len = (PREVIEW_WIDTH * PREVIEW_HEIGHT * 4) as usize;
            // Opaque black letterboxing, preserving physical monitor aspect ratio.
            unsafe { std::slice::from_raw_parts_mut(bits.cast::<u8>(), len) }.fill(0);
            let (dest_width, dest_height) = if u64::from(size.width) * u64::from(PREVIEW_HEIGHT)
                > u64::from(size.height) * u64::from(PREVIEW_WIDTH)
            {
                (
                    PREVIEW_WIDTH,
                    (u64::from(size.height) * u64::from(PREVIEW_WIDTH)
                        / u64::from(size.width)).max(1) as u32,
                )
            } else {
                (
                    (u64::from(size.width) * u64::from(PREVIEW_HEIGHT)
                        / u64::from(size.height)).max(1) as u32,
                    PREVIEW_HEIGHT,
                )
            };
            let dest_x = (PREVIEW_WIDTH - dest_width) / 2;
            let dest_y = (PREVIEW_HEIGHT - dest_height) / 2;
            let previous = unsafe { SelectObject(memory_dc, bitmap) };
            let result = if previous.is_null() || previous as isize == -1 {
                None
            } else {
                unsafe { SetStretchBltMode(memory_dc, HALFTONE) };
                if unsafe {
                    StretchBlt(
                        memory_dc, dest_x as i32, dest_y as i32,
                        dest_width as i32, dest_height as i32,
                        desktop_dc, position.x, position.y, source_width, source_height, SRCCOPY,
                    )
                } == 0
                {
                    None
                } else {
                    // Bitmap is still selected and allocated for the duration of this copy.
                    let bgra = unsafe { std::slice::from_raw_parts(bits.cast::<u8>(), len) };
                    let mut rgba = Vec::with_capacity(len);
                    for pixel in bgra.chunks_exact(4) {
                        rgba.extend_from_slice(&[pixel[2], pixel[1], pixel[0], 255]);
                    }
                    Some(rgba)
                }
            };
            if !previous.is_null() && previous as isize != -1 {
                unsafe { SelectObject(memory_dc, previous) };
            }
            result
        };
        if !bitmap.is_null() {
            unsafe { DeleteObject(bitmap) };
        }
        unsafe {
            DeleteDC(memory_dc);
            ReleaseDC(null_mut(), desktop_dc);
        }
        result
    }
}

#[cfg(test)]
mod tests {
    use super::{base64, human_monitor_name};

    #[test]
    fn stable_data_uri_encoding_handles_all_padding_lengths() {
        assert_eq!(base64(b""), "");
        assert_eq!(base64(b"f"), "Zg==");
        assert_eq!(base64(b"fo"), "Zm8=");
        assert_eq!(base64(b"foo"), "Zm9v");
        assert_eq!(base64(&[0, 255, 127]), "AP9/");
    }

    #[test]
    fn name_is_real_hardware_description_or_truthfully_absent() {
        for fallback in ["", "  ", "Generic PnP Monitor", "generic non-pnp monitor", "Default Monitor"] {
            assert_eq!(human_monitor_name(fallback), None);
        }
        assert_eq!(human_monitor_name(" LG UltraFine 27U "), Some("LG UltraFine 27U".to_owned()));
    }
}
