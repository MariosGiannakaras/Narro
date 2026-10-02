use crate::error::{CommandError, CommandResult};
use serde::Serialize;
use serde_json::Value;
use std::fs::{self, File};
use std::io::{BufWriter, Write};
use std::path::PathBuf;
use std::sync::mpsc::{self, Sender};
use std::sync::Mutex;
use std::thread::JoinHandle;
use std::time::Instant;

const DIAGNOSTIC_IDENTIFIER: &str = "com.mariosg.Narro.M1Diagnostic";
const MAX_MARKER_LEN: usize = 80;

static TRACE_SESSION: Mutex<Option<TraceSession>> = Mutex::new(None);

struct TraceSession {
    run_id: String,
    directory: PathBuf,
    trace_path: PathBuf,
    started: Instant,
    next_sequence: u64,
    sender: Sender<String>,
    writer: Option<JoinHandle<()>>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticTraceStatus {
    pub enabled: bool,
    pub run_id: Option<String>,
    pub directory: Option<String>,
    pub trace_path: Option<String>,
}

fn trace_error(operation: &str, source: impl std::fmt::Display) -> CommandError {
    CommandError::new(
        "DIAGNOSTIC_TRACE_FAILED",
        format!("failed to {operation}: {source}"),
    )
}

fn is_diagnostic_identifier(identifier: &str) -> bool {
    identifier == DIAGNOSTIC_IDENTIFIER
}

fn validate_marker(label: &str) -> CommandResult<String> {
    let trimmed = label.trim();
    if trimmed.is_empty() {
        return Err(CommandError::invalid_argument("label", "must be non-empty"));
    }
    if trimmed.len() > MAX_MARKER_LEN {
        return Err(CommandError::invalid_argument(
            "label",
            format!("must be at most {MAX_MARKER_LEN} bytes"),
        ));
    }
    if !trimmed
        .chars()
        .all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, ' ' | '_' | '-' | '.' | ':' | '/'))
    {
        return Err(CommandError::invalid_argument(
            "label",
            "contains unsupported characters",
        ));
    }
    Ok(trimmed.to_owned())
}

fn status_from_session(session: Option<&TraceSession>) -> DiagnosticTraceStatus {
    match session {
        Some(session) => DiagnosticTraceStatus {
            enabled: true,
            run_id: Some(session.run_id.clone()),
            directory: Some(session.directory.to_string_lossy().into_owned()),
            trace_path: Some(session.trace_path.to_string_lossy().into_owned()),
        },
        None => DiagnosticTraceStatus {
            enabled: false,
            run_id: None,
            directory: None,
            trace_path: None,
        },
    }
}

fn enqueue_locked(session: &mut TraceSession, kind: &str, data: Value) {
    session.next_sequence = session.next_sequence.saturating_add(1);
    let line = serde_json::json!({
        "schemaVersion": 1,
        "runId": session.run_id,
        "sequence": session.next_sequence,
        "utc": chrono::Utc::now().to_rfc3339(),
        "elapsedMs": session.started.elapsed().as_secs_f64() * 1000.0,
        "kind": kind,
        "data": data,
    })
    .to_string();

    if let Err(error) = session.sender.send(line) {
        eprintln!("Diagnostic trace writer is unavailable: {error}");
    }
}

pub fn start(app_handle: &tauri::AppHandle) -> CommandResult<DiagnosticTraceStatus> {
    let identifier = app_handle.config().identifier.as_str();
    if !is_diagnostic_identifier(identifier) {
        return Err(CommandError::new(
            "DIAGNOSTIC_TRACE_DISABLED",
            "diagnostic event tracing is available only in the isolated M1 diagnostic build",
        ));
    }

    let mut guard = TRACE_SESSION
        .lock()
        .map_err(|_| trace_error("lock diagnostic trace state", "trace mutex is poisoned"))?;
    if guard.is_some() {
        return Ok(status_from_session(guard.as_ref()));
    }

    let run_id = format!(
        "{}-{}",
        chrono::Utc::now().format("%Y%m%d-%H%M%SZ"),
        uuid::Uuid::new_v4()
    );
    let directory = std::env::temp_dir()
        .join("Narro-M1-Diagnostic")
        .join(&run_id);
    fs::create_dir_all(&directory)
        .map_err(|error| trace_error("create diagnostic trace directory", error))?;
    let trace_path = directory.join("events.jsonl");
    let file = File::create(&trace_path)
        .map_err(|error| trace_error("create diagnostic trace file", error))?;
    let (sender, receiver) = mpsc::channel::<String>();
    let writer = std::thread::Builder::new()
        .name("narro-diagnostic-trace".to_owned())
        .spawn(move || {
            let mut writer = BufWriter::new(file);
            for line in receiver {
                if writeln!(writer, "{line}").is_err() {
                    break;
                }
                if writer.flush().is_err() {
                    break;
                }
            }
            let _ = writer.flush();
        })
        .map_err(|error| trace_error("start diagnostic trace writer", error))?;

    let mut session = TraceSession {
        run_id,
        directory,
        trace_path,
        started: Instant::now(),
        next_sequence: 0,
        sender,
        writer: Some(writer),
    };
    enqueue_locked(
        &mut session,
        "trace_started",
        serde_json::json!({
            "identifier": identifier,
            "appVersion": app_handle.package_info().version.to_string(),
            "processId": std::process::id(),
        }),
    );
    let status = status_from_session(Some(&session));
    *guard = Some(session);
    Ok(status)
}

pub fn status() -> CommandResult<DiagnosticTraceStatus> {
    let guard = TRACE_SESSION
        .lock()
        .map_err(|_| trace_error("lock diagnostic trace state", "trace mutex is poisoned"))?;
    Ok(status_from_session(guard.as_ref()))
}

pub fn record(kind: &'static str, data: Value) {
    let Ok(mut guard) = TRACE_SESSION.lock() else {
        eprintln!("Diagnostic trace state mutex is poisoned");
        return;
    };
    if let Some(session) = guard.as_mut() {
        enqueue_locked(session, kind, data);
    }
}

pub fn mark(label: &str) -> CommandResult<()> {
    let label = validate_marker(label)?;
    let mut guard = TRACE_SESSION
        .lock()
        .map_err(|_| trace_error("lock diagnostic trace state", "trace mutex is poisoned"))?;
    let Some(session) = guard.as_mut() else {
        return Err(CommandError::new(
            "DIAGNOSTIC_TRACE_NOT_STARTED",
            "start the diagnostic trace before adding a marker",
        ));
    };
    enqueue_locked(session, "operator_marker", serde_json::json!({ "label": label }));
    Ok(())
}

pub fn stop() -> CommandResult<DiagnosticTraceStatus> {
    let mut guard = TRACE_SESSION
        .lock()
        .map_err(|_| trace_error("lock diagnostic trace state", "trace mutex is poisoned"))?;
    let Some(mut session) = guard.take() else {
        return Ok(status_from_session(None));
    };

    enqueue_locked(&mut session, "trace_stopped", serde_json::json!({}));
    drop(session.sender);
    if let Some(writer) = session.writer.take() {
        writer
            .join()
            .map_err(|_| trace_error("join diagnostic trace writer", "writer thread panicked"))?;
    }

    Ok(DiagnosticTraceStatus {
        enabled: false,
        run_id: Some(session.run_id),
        directory: Some(session.directory.to_string_lossy().into_owned()),
        trace_path: Some(session.trace_path.to_string_lossy().into_owned()),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trace_is_gated_to_the_isolated_diagnostic_identifier() {
        assert!(is_diagnostic_identifier(DIAGNOSTIC_IDENTIFIER));
        assert!(!is_diagnostic_identifier("com.mariosg.Narro"));
        assert!(!is_diagnostic_identifier("com.mariosg.Narro.Other"));
    }

    #[test]
    fn markers_are_short_and_machine_safe() {
        assert_eq!(
            validate_marker("before-monitor-reconnect").expect("valid marker"),
            "before-monitor-reconnect"
        );
        assert!(validate_marker("").is_err());
        assert!(validate_marker(&"x".repeat(MAX_MARKER_LEN + 1)).is_err());
        assert!(validate_marker("task=private\nvalue").is_err());
    }
}
