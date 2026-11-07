//! Test-build-only observation. Never owns product state or vetoes a SQLite commit.
use serde_json::{json, Value};
use std::cell::RefCell;
use std::collections::BTreeSet;
use std::fs::{self, File, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::{mpsc, Mutex, OnceLock};
use std::thread::JoinHandle;
use std::time::{Duration, Instant};
use tauri::{ipc::Invoke, plugin::TauriPlugin, Manager, Wry};

const QUEUE: usize = 4096;
const CHUNK_BYTES: u64 = 16 * 1024 * 1024;
const SCHEMA: &str = "narro-physical-trace/v1";
static TRACE: OnceLock<Trace> = OnceLock::new();
static NEXT: AtomicU64 = AtomicU64::new(0);
static LOST: AtomicU64 = AtomicU64::new(0);
static CONNECTION: AtomicU64 = AtomicU64::new(0);
static APP_READY: AtomicBool = AtomicBool::new(false);
static DRAINED: OnceLock<Mutex<BTreeSet<String>>> = OnceLock::new();
thread_local! { static CONTEXT: RefCell<Option<String>> = const { RefCell::new(None) }; }

struct Trace {
    id: String,
    started: Instant,
    sender: mpsc::SyncSender<Message>,
    worker: Mutex<Option<JoinHandle<()>>>,
}
enum Message {
    Event(Value),
    Finish,
}

pub struct ContextGuard(Option<String>);
impl Drop for ContextGuard {
    fn drop(&mut self) {
        CONTEXT.with(|value| *value.borrow_mut() = self.0.take());
    }
}
fn context() -> Option<String> {
    CONTEXT.with(|value| value.borrow().clone())
}
fn enter(id: Option<String>) -> ContextGuard {
    ContextGuard(CONTEXT.with(|value| value.replace(id)))
}

/// Do not infer an async worker's caller from the last command on another thread.
/// A None context is explicitly independent/unlinked, not attributed by timing.
pub fn record(event: &str, data: Value) {
    let Some(trace) = TRACE.get() else { return };
    let sequence = NEXT.fetch_add(1, Ordering::Relaxed) + 1;
    let row = json!({"schema":SCHEMA,"runId":trace.id,"pid":std::process::id(),
        "seq":sequence,"utc":chrono::Utc::now().to_rfc3339(),
        "elapsedUs":trace.started.elapsed().as_micros().to_string(),
        "thread":format!("{:?}",std::thread::current().id()),"traceId":context(),
        "event":event,"data":data});
    if trace.sender.try_send(Message::Event(row)).is_err() {
        LOST.fetch_add(1, Ordering::Relaxed);
    }
}

fn write_json(path: &Path, value: &Value) -> std::io::Result<()> {
    let mut file = File::create(path)?;
    serde_json::to_writer(&mut file, value)?;
    file.write_all(b"\n")?;
    file.flush()
}

struct Chunks {
    root: PathBuf,
    file: File,
    number: u32,
    bytes: u64,
}
impl Chunks {
    fn new(root: &Path) -> std::io::Result<Self> {
        fs::create_dir_all(root)?;
        Ok(Self {
            root: root.to_owned(),
            file: Self::open(root, 0)?,
            number: 0,
            bytes: 0,
        })
    }
    fn open(root: &Path, number: u32) -> std::io::Result<File> {
        OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(root.join(format!("events-{number:05}.jsonl")))
    }
    fn append(&mut self, row: &Value) -> std::io::Result<()> {
        let mut bytes = serde_json::to_vec(row)?;
        bytes.push(b'\n');
        if self.bytes > 0 && self.bytes + bytes.len() as u64 > CHUNK_BYTES {
            self.file.flush()?;
            self.number += 1;
            self.file = Self::open(&self.root, self.number)?;
            self.bytes = 0;
        }
        self.file.write_all(&bytes)?;
        self.bytes += bytes.len() as u64;
        Ok(())
    }
}

pub fn initialize() -> Result<(), String> {
    if TRACE.get().is_some() {
        return Ok(());
    }
    let parent = match std::env::var_os("NARRO_PHYSICAL_SESSION_DIR") {
        Some(value) => PathBuf::from(value),
        None => std::env::var_os("LOCALAPPDATA")
            .map(PathBuf::from)
            .unwrap_or_else(std::env::temp_dir)
            .join("Narro-Physical-Sessions"),
    };
    if !parent.is_absolute() {
        return Err("NARRO_PHYSICAL_SESSION_DIR must be absolute".into());
    }
    let id = uuid::Uuid::new_v4().to_string();
    let root = parent.join(format!("process-{}-{id}", std::process::id()));
    fs::create_dir_all(&root).map_err(|e| e.to_string())?;
    let chunks = Chunks::new(&root).map_err(|e| e.to_string())?;
    write_json(&root.join("process.json"), &json!({"schema":SCHEMA,"runId":id,
        "pid":std::process::id(),"sourceSha":option_env!("NARRO_VALIDATION_SOURCE_SHA").unwrap_or("unknown"),
        "startedUtc":chrono::Utc::now().to_rfc3339(),"feature":"physical-observability",
        "exe":std::env::current_exe().ok(),"state":"OPEN",
        "coverage":{"ipc":"request/dispatch/frontend-observed-result", "sqlite":"rowid mutations/commit-request/rollback",
        "frontend":"actions/errors/IPC/events/coalesced DOM projections", "asyncCausality":"unlinked unless explicitly propagated"}}))
        .map_err(|e| e.to_string())?;
    let (sender, receiver) = mpsc::sync_channel(QUEUE);
    let worker_root = root.clone();
    let worker = std::thread::Builder::new()
        .name("physical-trace-writer".into())
        .spawn(move || {
            writer(receiver, chunks, &worker_root);
        })
        .map_err(|e| e.to_string())?;
    TRACE
        .set(Trace {
            id,
            started: Instant::now(),
            sender,
            worker: Mutex::new(Some(worker)),
        })
        .map_err(|_| "physical trace already initialized")?;
    let previous = std::panic::take_hook();
    std::panic::set_hook(Box::new(move |info| {
        // Separate append bypasses the queue and product locks. No panic payload/test text.
        let row = json!({"event":"rust-panic","utc":chrono::Utc::now().to_rfc3339(),
            "pid":std::process::id(),"traceId":context(),"location":info.location().map(|x| x.to_string()),
            "backtrace":std::backtrace::Backtrace::force_capture().to_string()});
        if let Ok(mut file) = OpenOptions::new()
            .create(true)
            .append(true)
            .open(root.join("panic.jsonl"))
        {
            let _ = writeln!(file, "{row}");
            let _ = file.flush();
        }
        previous(info);
    }));
    record("process-start", json!({"coverage":"test-build-only"}));
    Ok(())
}

fn writer(receiver: mpsc::Receiver<Message>, mut chunks: Chunks, root: &Path) {
    let mut written = 0_u64;
    let mut last_seq = 0_u64;
    let mut heartbeat = Instant::now();
    loop {
        let item = receiver.recv_timeout(Duration::from_secs(1));
        let finish = matches!(
            item,
            Ok(Message::Finish) | Err(mpsc::RecvTimeoutError::Disconnected)
        );
        if let Ok(Message::Event(row)) = item {
            if let Err(error) = chunks.append(&row) {
                let _ = write_json(
                    &root.join("health.json"),
                    &json!({"state":"FAILED","error":error.to_string(),
                    "written":written,"lastSeq":last_seq,"lost":LOST.load(Ordering::Relaxed)}),
                );
                eprintln!("Physical trace writer failed: {error}");
                return;
            }
            written += 1;
            last_seq = row["seq"].as_u64().unwrap_or(last_seq);
        }
        if finish || heartbeat.elapsed() >= Duration::from_secs(1) {
            let health = chunks.file.flush().and_then(|_| {
                write_json(
                    &root.join("health.json"),
                    &json!({
                "state":if finish {"CLOSED"} else {"OPEN"}, "utc":chrono::Utc::now().to_rfc3339(),
                "written":written,"lastSeq":last_seq,"produced":NEXT.load(Ordering::Relaxed),
                "lost":LOST.load(Ordering::Relaxed),"chunk":chunks.number}),
                )
            });
            if let Err(error) = health {
                eprintln!("Physical trace health write failed: {error}");
                return;
            }
            heartbeat = Instant::now();
        }
        if finish {
            break;
        }
    }
}

pub fn finish() {
    if let Some(trace) = TRACE.get() {
        record("process-end", json!({"reason":"event-loop-returned"}));
        // Blocking is restricted to final shutdown, never an interactive product path.
        let _ = trace.sender.send(Message::Finish);
        if let Ok(mut worker) = trace.worker.lock() {
            if let Some(worker) = worker.take() {
                let _ = worker.join();
            }
        }
    }
}

pub fn ready() {
    APP_READY.store(true, Ordering::Release);
    record("app-setup-complete", json!({}));
}

pub fn begin_invoke(invoke: &Invoke<Wry>) -> ContextGuard {
    let id = invoke
        .message
        .headers()
        .get("x-narro-trace-id")
        .and_then(|x| x.to_str().ok())
        .filter(|x| x.len() <= 128)
        .map(str::to_owned);
    let guard = enter(id);
    record(
        "backend-dispatch",
        json!({"command":invoke.message.command(),
        "window":invoke.message.webview_ref().label()}),
    );
    guard
}

/// Called on the existing Quit worker BEFORE its final authoritative checkpoint, never on the native loop.
/// A missed acknowledgement is evidence of an incomplete tail, never a product-state veto.
pub fn prepare_exit(app: &tauri::AppHandle) {
    let windows = app.webview_windows();
    let labels: BTreeSet<_> = windows.keys().cloned().collect();
    let drained = DRAINED.get_or_init(|| Mutex::new(BTreeSet::new()));
    if let Ok(mut set) = drained.lock() {
        set.clear();
    }
    for (label, window) in windows {
        if window
            .eval("window.__NARRO_PHYSICAL_TRACE__?.drain().catch(()=>{})")
            .is_err()
        {
            record("frontend-drain-eval-failed", json!({"window":label}));
        }
    }
    let deadline = Instant::now() + Duration::from_secs(3);
    loop {
        if drained.lock().is_ok_and(|set| labels.is_subset(&set)) {
            break;
        }
        if Instant::now() >= deadline {
            record("frontend-drain-timeout", json!({"windows":labels}));
            break;
        }
        std::thread::sleep(Duration::from_millis(10));
    }
}

pub fn resume_after_failed_exit(app: &tauri::AppHandle) {
    record(
        "quit-cancelled-observer-resume",
        json!({"frontendGap":true}),
    );
    for (_, window) in app.webview_windows() {
        let _ = window.eval("window.__NARRO_PHYSICAL_TRACE__?.resume()");
    }
}

pub fn install_sqlite(connection: &rusqlite::Connection) {
    let id = CONNECTION.fetch_add(1, Ordering::Relaxed) + 1;
    record("sqlite-connection", json!({"connection":id}));
    connection.update_hook(Some(move |action, _database: &str, table: &str, rowid| {
        record(
            "sqlite-row-change",
            json!({"connection":id,"action":format!("{action:?}"),
            "table":table,"rowid":rowid,"durability":"tentative"}),
        );
    }));
    connection.commit_hook(Some(move || {
        // SQLite invokes this BEFORE the commit is durable. Never label it committed.
        record("sqlite-commit-request", json!({"connection":id}));
        false
    }));
    connection.rollback_hook(Some(move || {
        record("sqlite-rollback", json!({"connection":id}))
    }));
}

pub fn state_changed(event: &str, payload: &impl serde::Serialize) {
    match serde_json::to_value(payload) {
        Ok(value) => record(event, sanitize(&value, "", 0)),
        Err(_) => record("serialization-gap", json!({"event":event})),
    }
}

fn sanitize(value: &Value, key: &str, depth: usize) -> Value {
    if depth > 12 {
        return json!({"omitted":"depth"});
    }
    let sensitive = [
        "title", "note", "content", "text", "password", "token", "body", "path", "url",
    ]
    .iter()
    .any(|part| key.to_lowercase().contains(part));
    match value {
        Value::String(s) if sensitive || s.len() > 256 => {
            json!({"redactedChars":s.chars().count()})
        }
        Value::Array(items) => {
            json!({"items":items.iter().take(100).map(|v| sanitize(v,"",depth+1)).collect::<Vec<_>>(),
            "total":items.len(),"omitted":items.len().saturating_sub(100)})
        }
        Value::Object(items) => Value::Object(
            items
                .iter()
                .take(100)
                .map(|(k, v)| (k.clone(), sanitize(v, k, depth + 1)))
                .collect(),
        ),
        _ => value.clone(),
    }
}

fn accept_batch(window: &str, batch: &[Value]) -> Result<(), String> {
    if batch.len() > 64 {
        return Err("trace batch exceeds 64 records".into());
    }
    for row in batch {
        if serde_json::to_vec(row).map_err(|e| e.to_string())?.len() > 64 * 1024 {
            return Err("trace record exceeds 64 KiB".into());
        }
        record(
            "frontend",
            json!({"window":window,"record":sanitize(row,"",0)}),
        );
    }
    Ok(())
}

pub fn plugin() -> TauriPlugin<Wry> {
    tauri::plugin::Builder::new("physical-trace")
        .js_init_script(include_str!("physical_trace.js"))
        .invoke_handler(|invoke| {
            match invoke.message.command() {
                "hello" => {
                    let trace = TRACE.get();
                    invoke
                        .resolver
                        .resolve(json!({"schema":SCHEMA,"runId":trace.map(|t|&t.id),
                        "utc":chrono::Utc::now().to_rfc3339(),"pid":std::process::id(),
                        "windowLabel":invoke.message.webview_ref().label(),"ready":APP_READY.load(Ordering::Acquire),
                        "probeMode":std::env::var("NARRO_PHYSICAL_LOGGING_PROBE").as_deref()==Ok("1")}));
                }
                "batch" => {
                    let body = match invoke.message.payload() {
                        tauri::ipc::InvokeBody::Json(body) => body,
                        _ => {
                            invoke.resolver.reject("trace requires JSON");
                            return true;
                        }
                    };
                    let result = body
                        .get("records")
                        .and_then(Value::as_array)
                        .ok_or("missing records".into())
                        .and_then(|rows| accept_batch(invoke.message.webview_ref().label(), rows));
                    match result {
                        Ok(()) => invoke.resolver.resolve(()),
                        Err(error) => invoke.resolver.reject(error),
                    }
                }
                "drained" => {
                    let label = invoke.message.webview_ref().label().to_owned();
                    if let tauri::ipc::InvokeBody::Json(body) = invoke.message.payload() {
                        record("frontend-drained", json!({"window":label,"receipt":body}));
                    }
                    if let Ok(mut set) = DRAINED.get_or_init(|| Mutex::new(BTreeSet::new())).lock()
                    {
                        set.insert(label);
                    }
                    invoke.resolver.resolve(());
                }
                "probe_exit" => {
                    if std::env::var("NARRO_PHYSICAL_LOGGING_PROBE").as_deref() != Ok("1") {
                        invoke.resolver.reject("logging probe is disabled"); return true;
                    }
                    let app = invoke.message.webview_ref().app_handle().clone();
                    invoke.resolver.resolve(());
                    crate::normal_shutdown::request_normal_exit(&app);
                }
                _ => return false,
            }
            true
        })
        .on_event(|_, event| match event {
            tauri::RunEvent::Ready => record("native-ready", json!({})),
            tauri::RunEvent::Exit => record("native-exit", json!({})),
            tauri::RunEvent::ExitRequested { code, .. } => {
                record("native-exit-requested", json!({"code":code}))
            }
            tauri::RunEvent::WindowEvent { label, event, .. } => record(
                "native-window",
                json!({"window":label,"event":format!("{event:?}")}),
            ),
            _ => {}
        })
        .build()
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn nested_context_restores_and_does_not_invent_worker_causality() {
        assert_eq!(context(), None);
        {
            let _a = enter(Some("a".into()));
            {
                let _b = enter(Some("b".into()));
                assert_eq!(context(), Some("b".into()));
            }
            assert_eq!(context(), Some("a".into()));
            assert_eq!(std::thread::spawn(context).join().unwrap(), None);
        }
        assert_eq!(context(), None);
    }
    #[test]
    fn redaction_keeps_numeric_state_without_user_text() {
        let value = sanitize(
            &json!({"title":"secret","seconds":12,"paused":true,"taskId":"id"}),
            "",
            0,
        );
        assert_eq!(value["seconds"], 12);
        assert_eq!(value["taskId"], "id");
        assert!(!value.to_string().contains("secret"));
    }
    #[test]
    fn chunk_rotation_retains_every_record() {
        let dir = std::env::temp_dir().join(format!("narro-trace-test-{}", uuid::Uuid::new_v4()));
        let mut chunks = Chunks::new(&dir).unwrap();
        chunks.bytes = CHUNK_BYTES;
        chunks.append(&json!({"seq":1})).unwrap();
        chunks.file.flush().unwrap();
        drop(chunks);
        assert!(dir.join("events-00000.jsonl").exists());
        assert!(fs::read_to_string(dir.join("events-00001.jsonl"))
            .unwrap()
            .contains("\"seq\":1"));
        fs::remove_dir_all(dir).unwrap();
    }
    #[test]
    fn observation_never_vetoes_commit_or_rollback() {
        let conn = rusqlite::Connection::open_in_memory().unwrap();
        install_sqlite(&conn);
        conn.execute_batch("CREATE TABLE t (v INTEGER); BEGIN; INSERT INTO t VALUES(1); ROLLBACK;")
            .unwrap();
        assert_eq!(
            conn.query_row("SELECT count(*) FROM t", [], |r| r.get::<_, i64>(0))
                .unwrap(),
            0
        );
        conn.execute("INSERT INTO t VALUES(2)", []).unwrap();
        assert_eq!(
            conn.query_row("SELECT v FROM t", [], |r| r.get::<_, i64>(0))
                .unwrap(),
            2
        );
    }
}
