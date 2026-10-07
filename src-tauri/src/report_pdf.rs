use crate::error::{CommandError, CommandResult};

const MAX_REPORT_PDF_BYTES: u64 = 64 * 1024 * 1024;

fn error(message: impl Into<String>) -> CommandError {
    CommandError::new("REPORT_EXPORT_FAILED", message)
}

fn validate_pdf_bytes(bytes: Vec<u8>) -> CommandResult<Vec<u8>> {
    if bytes.len() < 5 || !bytes.starts_with(b"%PDF-") {
        return Err(error(
            "WebView2 report export did not produce a valid PDF header",
        ));
    }
    if bytes.len() as u64 > MAX_REPORT_PDF_BYTES {
        return Err(error(
            "WebView2 report export exceeded the supported PDF size",
        ));
    }
    Ok(bytes)
}

#[cfg(windows)]
pub async fn capture(window: tauri::WebviewWindow) -> CommandResult<Vec<u8>> {
    use std::os::windows::ffi::OsStrExt;
    use std::sync::mpsc;
    use std::time::Duration;
    use webview2_com::{
        Microsoft::Web::WebView2::Win32::{ICoreWebView2PrintSettings, ICoreWebView2_7},
        PrintToPdfCompletedHandler,
    };
    use windows::core::{Interface, PCWSTR};

    let temp_path = std::env::temp_dir().join(format!(
        "narro-overview-export-{}.pdf",
        uuid::Uuid::new_v4()
    ));
    let mut wide_path = temp_path.as_os_str().encode_wide().collect::<Vec<_>>();
    wide_path.push(0);

    let (send, receive) = mpsc::channel::<Result<(), String>>();
    let callback_send = send.clone();
    let callback_temp_path = temp_path.clone();
    window
        .with_webview(move |webview| unsafe {
            let start_result = (|| -> windows::core::Result<()> {
                let core = webview.controller().CoreWebView2()?;
                let printable: ICoreWebView2_7 = core.cast()?;
                let callback =
                    PrintToPdfCompletedHandler::create(Box::new(move |status, succeeded| {
                        let completed =
                            status.map_err(|failure| failure.to_string()).and_then(|_| {
                                if succeeded {
                                    Ok(())
                                } else {
                                    Err("WebView2 reported an unsuccessful PDF export".to_owned())
                                }
                            });
                        if callback_send.send(completed).is_err() {
                            let _ = std::fs::remove_file(&callback_temp_path);
                        }
                        Ok(())
                    }));
                printable.PrintToPdf(
                    PCWSTR::from_raw(wide_path.as_ptr()),
                    None::<&ICoreWebView2PrintSettings>,
                    &callback,
                )
            })();

            if let Err(failure) = start_result {
                let _ = send.send(Err(failure.to_string()));
            }
        })
        .map_err(|failure| error(format!("schedule WebView2 report PDF export: {failure}")))?;

    let completion = tauri::async_runtime::spawn_blocking(move || {
        receive
            .recv_timeout(Duration::from_secs(20))
            .map_err(|failure| format!("WebView2 report PDF completion: {failure}"))?
    })
    .await
    .map_err(|failure| error(format!("wait for WebView2 report PDF worker: {failure}")))?;

    if let Err(failure) = completion {
        let _ = std::fs::remove_file(&temp_path);
        return Err(error(failure));
    }

    let read_result = (|| -> CommandResult<Vec<u8>> {
        let metadata = std::fs::metadata(&temp_path)
            .map_err(|failure| error(format!("inspect generated report PDF: {failure}")))?;
        if metadata.len() == 0 || metadata.len() > MAX_REPORT_PDF_BYTES {
            return Err(error("generated report PDF size is invalid"));
        }
        std::fs::read(&temp_path)
            .map_err(|failure| error(format!("read generated report PDF: {failure}")))
    })();

    if let Err(failure) = std::fs::remove_file(&temp_path) {
        eprintln!(
            "temporary report PDF cleanup failed for {}: {failure}",
            temp_path.display()
        );
    }

    validate_pdf_bytes(read_result?)
}

#[cfg(not(windows))]
pub async fn capture(_window: tauri::WebviewWindow) -> CommandResult<Vec<u8>> {
    Err(error("Overview PDF export requires Windows WebView2"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pdf_validation_requires_pdf_signature_and_supported_size() {
        assert!(validate_pdf_bytes(b"%PDF-1.7\nvalid".to_vec()).is_ok());
        assert_eq!(
            validate_pdf_bytes(b"not-a-pdf".to_vec())
                .expect_err("invalid header must fail")
                .code,
            "REPORT_EXPORT_FAILED"
        );
    }
}
