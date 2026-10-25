//! Explicitly opted-in, local-only Timer first-fault diagnostics.
//! No persistent task identifiers/content, panic payload, database paths or
//! raw command arguments are written. Never acquire the authoritative Timer
//! mutex from the panic hook: it may be the lock being poisoned.
use crate::error::CommandError;
use serde_json::{json, Value};
use std::cell::Cell;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU8, Ordering};
use std::sync::OnceLock;

const DIAGNOSTICS_ENV: &str = "NARRO_TIMER_DIAGNOSTICS_DIR";
const MAX_LOG_BYTES: u64 = 4 * 1024 * 1024;
static LOG_PATH: OnceLock<Option<PathBuf>> = OnceLock::new();
static REPORTED_LOCKS: AtomicU8 = AtomicU8::new(0);

type Context = (&'static str, &'static str);
thread_local! {
    static TIMER_CONTEXT: Cell<Option<Context>> = const { Cell::new(None) };
}

fn utc_now() -> String {
    chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true)
}

fn append(path: &Path, record: &Value) -> Result<(), String> {
    // Bound diagnostics in long-running sessions, including repeated failures.
    // Use no shared mutex, especially from inside the panic hook.
    if fs::metadata(path).is_ok_and(|metadata| metadata.len() >= MAX_LOG_BYTES) {
        return Ok(());
    }
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .map_err(|error| format!("open timer diagnostics: {error}"))?;
    let bytes = serde_json::to_vec(record)
        .map_err(|error| format!("serialize timer diagnostics: {error}"))?;
    file.write_all(&bytes)
        .and_then(|_| file.write_all(b"\n"))
        .and_then(|_| file.flush())
        .map_err(|error| format!("write timer diagnostics: {error}"))
}

fn write(event: &'static str, operation: Option<&'static str>, stage: Option<&'static str>, extra: Value) {
    let Some(Some(path)) = LOG_PATH.get() else {
        return;
    };
    let record = json!({
        "schemaVersion": 1,
        "event": event,
        "timestampUtc": utc_now(),
        "processId": std::process::id(),
        "sourceSha": option_env!("NARRO_VALIDATION_SOURCE_SHA").unwrap_or("unknown"),
        "threadName": std::thread::current().name(),
        "operation": operation,
        "stage": stage,
        "details": extra,
        "privacy": "technical-only-no-task-content-or-panic-payload"
    });
    if let Err(error) = append(path, &record) {
        eprintln!("Timer diagnostics write failed: {error}");
    }
}

fn panic_record(
    location: Option<(&str, u32, u32)>,
    context: Option<Context>,
    backtrace: &str,
) -> Value {
    json!({
        "schemaVersion": 1,
        "event": "timer-diagnostics-rust-panic",
        "timestampUtc": utc_now(),
        "processId": std::process::id(),
        "sourceSha": option_env!("NARRO_VALIDATION_SOURCE_SHA").unwrap_or("unknown"),
        "threadName": std::thread::current().name(),
        "timerOperation": context.map(|value| value.0),
        "timerStage": context.map(|value| value.1),
        "sourceLocation": location.map(|(file, line, column)| json!({
            "file": file, "line": line, "column": column
        })),
        "backtrace": backtrace,
        "privacy": "no-panic-payload-no-task-content"
    })
}

/// Installs before SQLite/Timer recovery and preserves the earlier panic hook.
/// Only explicitly configured, absolute local paths activate these diagnostics.
pub fn initialize() -> Result<(), String> {
    if LOG_PATH.get().is_some() {
        return Ok(());
    }
    let Some(value) = std::env::var_os(DIAGNOSTICS_ENV) else {
        let _ = LOG_PATH.set(None);
        return Ok(());
    };
    let directory = PathBuf::from(value);
    if !directory.is_absolute() {
        return Err("NARRO_TIMER_DIAGNOSTICS_DIR must be an absolute path".to_string());
    }
    fs::create_dir_all(&directory)
        .map_err(|error| format!("create Timer diagnostic directory: {error}"))?;
    let path = directory.join(format!("timer-diagnostics-{}.jsonl", std::process::id()));
    // Verify the target is actually writable before installing the hook.
    OpenOptions::new().create(true).append(true).open(&path)
        .map_err(|error| format!("open Timer diagnostic output: {error}"))?;
    LOG_PATH.set(Some(path.clone()))
        .map_err(|_| "Timer diagnostics initialized concurrently".to_string())?;

    let previous_hook = std::panic::take_hook();
    std::panic::set_hook(Box::new(move |info| {
        let location = info.location().map(|loc| (loc.file(), loc.line(), loc.column()));
        let context = TIMER_CONTEXT.try_with(|value| value.get()).ok().flatten();
        let trace = std::backtrace::Backtrace::force_capture().to_string();
        // Do not stringify info/payload: panics may contain private task text.
        let record = panic_record(location, context, &trace);
        if let Err(error) = append(&path, &record) {
            eprintln!("Timer first-fault diagnostics failed: {error}");
        }
        previous_hook(info);
    }));
    write("timer-diagnostics-start", Some("startup"), Some("before-runtime"), json!({}));
    Ok(())
}

/// Last known Timer operation/stage is held in thread-local memory and can be
/// read by the panic hook before unwinding. Nested scopes restore their parent.
pub struct Scope {
    previous: Option<Context>,
    active: bool,
}

impl Scope {
    pub fn enter(operation: &'static str) -> Self {
        let active = LOG_PATH.get().is_some_and(Option::is_some);
        let previous = if active {
            TIMER_CONTEXT.try_with(|value| {
                let old = value.get();
                value.set(Some((operation, "entered")));
                old
            }).ok().flatten()
        } else {
            None
        };
        Self { previous, active }
    }

    pub fn stage(&self, stage: &'static str) {
        if self.active {
            let _ = TIMER_CONTEXT.try_with(|value| {
                if let Some((operation, _)) = value.get() {
                    value.set(Some((operation, stage)));
                }
            });
        }
    }
}

impl Drop for Scope {
    fn drop(&mut self) {
        if self.active {
            let _ = TIMER_CONTEXT.try_with(|value| value.set(self.previous));
        }
    }
}

fn lock_bit(lock: &str) -> u8 {
    match lock {
        "state" => 1,
        "focus_home_pause_gate" => 2,
        "focus_home_pause_lease" => 4,
        _ => 8,
    }
}

/// Diagnostic detail is written once per lock category per process to avoid
/// a background 250ms tick flood. Preserve the existing fail-closed error.
pub fn poisoned(lock: &'static str, operation: &'static str) -> CommandError {
    let bit = lock_bit(lock);
    if REPORTED_LOCKS.fetch_or(bit, Ordering::Relaxed) & bit == 0 {
        write("timer-lock-poisoned", Some(operation), Some("lock-acquisition"), json!({
            "lock": lock,
            "code": "TIMER_SERVICE_LOCK_POISONED"
        }));
        eprintln!("TimerService first poisoned lock: lock={lock} operation={operation}");
    }
    CommandError::timer_service_lock_poisoned()
}

pub fn milestone(event: &'static str, operation: &'static str, stage: &'static str) {
    write(event, Some(operation), Some(stage), json!({}));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn panic_record_never_copies_panic_payload_or_task_data() {
        let record = panic_record(
            Some(("src-tauri/src/timer_service.rs", 62, 3)),
            Some(("advance_and_report", "persist-boundary")),
            "timer_service::advance_controller_to",
        );
        assert_eq!(record["timerOperation"], "advance_and_report");
        assert_eq!(record["timerStage"], "persist-boundary");
        assert_eq!(record["sourceLocation"]["line"], 62);
        assert!(record["backtrace"].as_str().unwrap().contains("advance_controller_to"));
        assert!(record.get("panicPayload").is_none());
        assert!(record.get("taskId").is_none());
        assert!(record.get("databasePath").is_none());
        let absent = panic_record(None, None, "unknown");
        assert!(absent["sourceLocation"].is_null());
        assert!(absent["timerOperation"].is_null());
    }

    #[test]
    fn distinct_authoritative_mutexes_have_stable_poison_diagnostic_categories() {
        assert_eq!(lock_bit("state"), 1);
        assert_eq!(lock_bit("focus_home_pause_gate"), 2);
        assert_eq!(lock_bit("focus_home_pause_lease"), 4);
        assert_ne!(lock_bit("state"), lock_bit("focus_home_pause_gate"));
    }

    #[test]
    fn nested_scope_without_opt_in_leaves_no_thread_local_residue() {
        // The test runner does not set the opt-in environment variable.
        // Scope semantics must never require logging I/O for normal operation.
        let _scope = Scope::enter("snapshot");
        let nested = Scope::enter("advance_and_report");
        nested.stage("persist-boundary");
        drop(nested);
    }
}
