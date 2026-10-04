//! Capture only Narro's prepared WebView pixels, never its stale parent GDI DC.
use crate::error::{CommandError, CommandResult};

#[cfg(windows)]
pub async fn capture(window: tauri::WebviewWindow) -> CommandResult<Vec<u8>> {
    use std::{sync::mpsc, time::Duration};
    use webview2_com::{
        CapturePreviewCompletedHandler,
        Microsoft::Web::WebView2::Win32::COREWEBVIEW2_CAPTURE_PREVIEW_IMAGE_FORMAT_PNG,
    };
    use windows::Win32::{
        System::Com::{STATFLAG_NONAME, STATSTG, STREAM_SEEK_SET},
        UI::Shell::SHCreateMemStream,
    };
    let (send, receive) = mpsc::channel();
    window
        .with_webview(move |webview| unsafe {
            let callback_send = send.clone();
            let started = (|| -> windows::core::Result<()> {
                let stream = SHCreateMemStream(None).ok_or_else(|| {
                    windows::core::Error::from_hresult(windows::core::HRESULT(0x80004005u32 as i32))
                })?;
                let captured_stream = stream.clone();
                let callback = CapturePreviewCompletedHandler::create(Box::new(move |status| {
                    let result = (|| -> CommandResult<Vec<u8>> {
                        status.map_err(|e| error(e.to_string()))?;
                        let mut info = STATSTG::default();
                        captured_stream
                            .Stat(&mut info, STATFLAG_NONAME)
                            .map_err(|e| error(e.to_string()))?;
                        if info.cbSize == 0 || info.cbSize > 1_048_576 {
                            return Err(error("capture size is invalid"));
                        }
                        captured_stream
                            .Seek(0, STREAM_SEEK_SET, None)
                            .map_err(|e| error(e.to_string()))?;
                        let mut bytes = vec![0; info.cbSize as usize];
                        let mut read = 0;
                        captured_stream
                            .Read(
                                bytes.as_mut_ptr().cast(),
                                bytes.len() as u32,
                                Some(&mut read),
                            )
                            .ok()
                            .map_err(|e| error(e.to_string()))?;
                        if read as usize != bytes.len() {
                            return Err(error("capture stream is incomplete"));
                        }
                        Ok(bytes)
                    })();
                    let _ = callback_send.send(result);
                    Ok(())
                }));
                webview.controller().CoreWebView2()?.CapturePreview(
                    COREWEBVIEW2_CAPTURE_PREVIEW_IMAGE_FORMAT_PNG,
                    &stream,
                    &callback,
                )
            })();
            if let Err(e) = started {
                let _ = send.send(Err(error(e.to_string())));
            }
        })
        .map_err(|e| error(e.to_string()))?;
    // The COM callback needs the GUI message loop. Wait only on a worker.
    tauri::async_runtime::spawn_blocking(move || {
        receive
            .recv_timeout(Duration::from_secs(3))
            .map_err(|e| error(format!("WebView capture completion: {e}")))?
    })
    .await
    .map_err(|e| error(e.to_string()))?
}

fn error(message: impl Into<String>) -> CommandError {
    CommandError::new("FOCUS_FRAME_CAPTURE_FAILED", message)
}

#[cfg(not(windows))]
pub async fn capture(_: tauri::WebviewWindow) -> CommandResult<Vec<u8>> {
    Err(error("Focus pixel capture requires Windows WebView2"))
}

#[cfg(windows)]
pub fn compact_bgra(png_bytes: &[u8], width: u32, height: u32) -> CommandResult<Vec<u8>> {
    if png_bytes.is_empty() || png_bytes.len() > 1_048_576 || width == 0 || height == 0 {
        return Err(error("invalid compact capture"));
    }
    let mut decoder = png::Decoder::new(std::io::Cursor::new(png_bytes));
    decoder.set_limits(png::Limits {
        bytes: 16 * 1024 * 1024,
    });
    decoder.set_transformations(png::Transformations::EXPAND | png::Transformations::STRIP_16);
    let mut reader = decoder.read_info().map_err(|e| error(e.to_string()))?;
    let info = reader.info();
    if info.width != width || info.height < height || info.height > 4096 || width > 4096 {
        return Err(error(
            "WebView capture does not match the current native DPI geometry",
        ));
    }
    let mut source = vec![0; reader.output_buffer_size()];
    let info = reader
        .next_frame(&mut source)
        .map_err(|e| error(e.to_string()))?;
    let channels = match info.color_type {
        png::ColorType::Rgb => 3,
        png::ColorType::Rgba => 4,
        png::ColorType::Grayscale => 1,
        png::ColorType::GrayscaleAlpha => 2,
        png::ColorType::Indexed => return Err(error("unexpanded indexed capture")),
    };
    let mut result = Vec::with_capacity(width as usize * height as usize * 4);
    for pixel in source[..width as usize * height as usize * channels].chunks_exact(channels) {
        let (red, green, blue) = if channels <= 2 {
            (pixel[0], pixel[0], pixel[0])
        } else {
            (pixel[0], pixel[1], pixel[2])
        };
        result.extend([blue, green, red, 255]);
    }
    Ok(result)
}

#[cfg(all(test, windows))]
mod tests {
    use super::compact_bgra;
    fn fixture(width: u32, height: u32, bytes: &[u8]) -> Vec<u8> {
        let mut output = Vec::new();
        let mut encoder = png::Encoder::new(&mut output, width, height);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        encoder
            .write_header()
            .unwrap()
            .write_image_data(bytes)
            .unwrap();
        output
    }
    #[test]
    fn crops_target_rows_and_preserves_top_down_bgra_colors() {
        let encoded = fixture(1, 2, &[10, 20, 30, 255, 40, 50, 60, 255]);
        assert_eq!(compact_bgra(&encoded, 1, 1).unwrap(), [30, 20, 10, 255]);
        assert_eq!(
            compact_bgra(&encoded, 1, 2).unwrap(),
            [30, 20, 10, 255, 60, 50, 40, 255]
        );
    }
    #[test]
    fn rejects_corrupt_or_wrong_dpi_capture_before_native_allocation() {
        let encoded = fixture(1, 1, &[10, 20, 30, 255]);
        assert!(compact_bgra(&encoded, 2, 1).is_err());
        assert!(compact_bgra(&encoded, 1, 2).is_err());
        assert!(compact_bgra(b"not a PNG", 1, 1).is_err());
    }
}
