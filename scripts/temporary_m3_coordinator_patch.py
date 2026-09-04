from pathlib import Path


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one patch target, found {count}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


timer = Path("src-tauri/src/timer/mod.rs")
replace_once(
    timer,
    "mod lifecycle;\npub use lifecycle::{TaskExitReason, TimerExit, TimerSwitchResult};\n",
    "mod lifecycle;\npub mod runtime;\npub use lifecycle::{TaskExitReason, TimerExit, TimerSwitchResult};\n",
)

sessions = Path("src-tauri/src/persistence/sessions.rs")
needle = "pub fn sessions_for_task(\n"
insert = r'''pub fn replace_open_focus_session(
    conn: &mut Connection,
    current_id: SessionId,
    current_duration_seconds: u64,
    next_kind: SessionKind,
    next_task_id: Option<TaskId>,
    transitioned_at: &str,
) -> Result<(SessionRecord, SessionRecord), SessionStoreError> {
    validate_mutation_timestamp(transitioned_at)?;
    if next_kind == SessionKind::Work && next_task_id.is_none() {
        return Err(SessionStoreError::InvalidSessionShape);
    }
    let duration_sql = duration_for_sql(current_duration_seconds)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let current = load_session(&tx, current_id)?;
    if !current.is_open() {
        return Err(SessionStoreError::AlreadyClosed(current_id));
    }
    ensure_not_before_start(&current.started_at, transitioned_at)?;
    ensure_not_before_previous_update(&current.updated_at, transitioned_at)?;
    if current_duration_seconds < current.duration_seconds {
        return Err(SessionStoreError::DurationDecreased {
            stored_seconds: current.duration_seconds,
            attempted_seconds: current_duration_seconds,
        });
    }
    if let Some(task_id) = next_task_id {
        validate_focus_task(&tx, task_id)?;
    }

    let changed = tx.execute(
        "UPDATE sessions
         SET ended_at = ?1, duration_seconds = ?2, updated_at = ?1
         WHERE id = ?3 AND ended_at IS NULL",
        params![transitioned_at, duration_sql, current_id.to_string()],
    )?;
    if changed != 1 {
        return Err(SessionStoreError::AlreadyClosed(current_id));
    }

    let next_id = SessionId::generate();
    tx.execute(
        "INSERT INTO sessions (
            id, task_id, kind, started_at, ended_at, duration_seconds,
            source, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, NULL, 0, 'focus', ?4, ?4)",
        params![
            next_id.to_string(),
            next_task_id.map(|value| value.to_string()),
            next_kind.as_str(),
            transitioned_at
        ],
    )?;

    let closed = load_session(&tx, current_id)?;
    let opened = load_session(&tx, next_id)?;
    tx.commit()?;
    Ok((closed, opened))
}

'''
text = sessions.read_text(encoding="utf-8")
count = text.count(needle)
if count != 1:
    raise SystemExit(f"{sessions}: expected exactly one insertion target, found {count}")
sessions.write_text(text.replace(needle, insert + needle, 1), encoding="utf-8")
