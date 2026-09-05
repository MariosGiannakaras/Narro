use crate::domain::ids::{SessionId, TaskId};
use crate::domain::preferences::{
    PreferencesPayload, SleepAccountingPolicy, TaskSleepAccountingOverride,
};
use crate::persistence::preferences::{get_preferences, PreferenceStoreError};
use chrono::DateTime;
use rusqlite::{params, Connection, OptionalExtension};
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum SleepAccountingStoreError {
    Sqlite(rusqlite::Error),
    Preferences(PreferenceStoreError),
    InvalidTimestamp,
    TaskNotFound(TaskId),
    SessionNotFound(SessionId),
    InvalidStoredPolicy(String),
}

impl Display for SleepAccountingStoreError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => {
                write!(formatter, "sleep accounting persistence failed: {error}")
            }
            Self::Preferences(error) => Display::fmt(error, formatter),
            Self::InvalidTimestamp => {
                formatter.write_str("sleep accounting mutation timestamp must be RFC 3339")
            }
            Self::TaskNotFound(id) => write!(formatter, "sleep accounting task not found: {id}"),
            Self::SessionNotFound(id) => {
                write!(formatter, "sleep accounting session not found: {id}")
            }
            Self::InvalidStoredPolicy(value) => {
                write!(
                    formatter,
                    "stored sleep accounting policy is invalid: {value}"
                )
            }
        }
    }
}

impl std::error::Error for SleepAccountingStoreError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Preferences(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for SleepAccountingStoreError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<PreferenceStoreError> for SleepAccountingStoreError {
    fn from(value: PreferenceStoreError) -> Self {
        Self::Preferences(value)
    }
}

fn validate_timestamp(value: &str) -> Result<(), SleepAccountingStoreError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| SleepAccountingStoreError::InvalidTimestamp)
}

pub const fn policy_token(policy: SleepAccountingPolicy) -> &'static str {
    match policy {
        SleepAccountingPolicy::Exclude => "exclude",
        SleepAccountingPolicy::Count => "count",
    }
}

fn parse_policy(value: String) -> Result<SleepAccountingPolicy, SleepAccountingStoreError> {
    match value.as_str() {
        "exclude" => Ok(SleepAccountingPolicy::Exclude),
        "count" => Ok(SleepAccountingPolicy::Count),
        _ => Err(SleepAccountingStoreError::InvalidStoredPolicy(value)),
    }
}

pub fn get_task_sleep_accounting_override(
    conn: &Connection,
    task_id: TaskId,
) -> Result<TaskSleepAccountingOverride, SleepAccountingStoreError> {
    let raw: Option<Option<String>> = conn
        .query_row(
            "SELECT task_timer_preferences.sleep_accounting_override
             FROM tasks
             LEFT JOIN task_timer_preferences
               ON task_timer_preferences.task_id = tasks.id
             WHERE tasks.id = ?1",
            [task_id.to_string()],
            |row| row.get(0),
        )
        .optional()?;

    match raw {
        None => Err(SleepAccountingStoreError::TaskNotFound(task_id)),
        Some(None) => Ok(TaskSleepAccountingOverride::Inherit),
        Some(Some(value)) => match parse_policy(value)? {
            SleepAccountingPolicy::Exclude => Ok(TaskSleepAccountingOverride::Exclude),
            SleepAccountingPolicy::Count => Ok(TaskSleepAccountingOverride::Count),
        },
    }
}

pub fn set_task_sleep_accounting_override(
    conn: &mut Connection,
    task_id: TaskId,
    value: TaskSleepAccountingOverride,
    now: &str,
) -> Result<TaskSleepAccountingOverride, SleepAccountingStoreError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    let exists: bool = tx.query_row(
        "SELECT EXISTS(SELECT 1 FROM tasks WHERE id = ?1)",
        [task_id.to_string()],
        |row| row.get(0),
    )?;
    if !exists {
        return Err(SleepAccountingStoreError::TaskNotFound(task_id));
    }

    match value {
        TaskSleepAccountingOverride::Inherit => {
            tx.execute(
                "DELETE FROM task_timer_preferences WHERE task_id = ?1",
                [task_id.to_string()],
            )?;
        }
        TaskSleepAccountingOverride::Exclude | TaskSleepAccountingOverride::Count => {
            let policy = match value {
                TaskSleepAccountingOverride::Exclude => SleepAccountingPolicy::Exclude,
                TaskSleepAccountingOverride::Count => SleepAccountingPolicy::Count,
                TaskSleepAccountingOverride::Inherit => unreachable!(),
            };
            tx.execute(
                "INSERT INTO task_timer_preferences (
                    task_id, sleep_accounting_override, updated_at
                 ) VALUES (?1, ?2, ?3)
                 ON CONFLICT(task_id) DO UPDATE SET
                    sleep_accounting_override = excluded.sleep_accounting_override,
                    updated_at = excluded.updated_at",
                params![task_id.to_string(), policy_token(policy), now],
            )?;
        }
    }

    tx.execute(
        "UPDATE tasks SET updated_at = ?1 WHERE id = ?2",
        params![now, task_id.to_string()],
    )?;
    tx.commit()?;
    Ok(value)
}

pub fn resolve_task_sleep_accounting_policy(
    conn: &Connection,
    task_id: TaskId,
) -> Result<SleepAccountingPolicy, SleepAccountingStoreError> {
    let task_override = get_task_sleep_accounting_override(conn, task_id)?;
    let global = get_preferences(conn)?
        .map(|record| record.payload.focus.sleep_accounting_policy)
        .unwrap_or_else(|| PreferencesPayload::default().focus.sleep_accounting_policy);
    Ok(task_override.resolve(global))
}

pub fn session_sleep_accounting_policy(
    conn: &Connection,
    session_id: SessionId,
) -> Result<SleepAccountingPolicy, SleepAccountingStoreError> {
    let raw: Option<String> = conn
        .query_row(
            "SELECT sleep_accounting_policy FROM sessions WHERE id = ?1",
            [session_id.to_string()],
            |row| row.get(0),
        )
        .optional()?;
    parse_policy(raw.ok_or(SleepAccountingStoreError::SessionNotFound(session_id))?)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::preferences::save_preferences;
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::create_task;

    const T0: &str = "2026-09-05T14:00:00Z";
    const T1: &str = "2026-09-05T14:01:00Z";

    fn fixture() -> (Connection, TaskId) {
        let mut conn = Connection::open_in_memory().expect("open database");
        run_migrations(&mut conn).expect("migrate database");
        let list = create_list(
            &mut conn,
            NewListInput {
                title: "Sleep policy".into(),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .expect("create list");
        let task = create_task(
            &mut conn,
            NewTaskInput {
                list_id: list.id,
                title: "Task".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: None,
            },
            T0,
        )
        .expect("create task");
        (conn, task.id)
    }

    #[test]
    fn default_is_exclude_when_preferences_and_override_are_absent() {
        let (conn, task_id) = fixture();
        assert_eq!(
            get_task_sleep_accounting_override(&conn, task_id).unwrap(),
            TaskSleepAccountingOverride::Inherit
        );
        assert_eq!(
            resolve_task_sleep_accounting_policy(&conn, task_id).unwrap(),
            SleepAccountingPolicy::Exclude
        );
    }

    #[test]
    fn task_override_wins_and_inherit_returns_to_global_policy() {
        let (mut conn, task_id) = fixture();
        let mut preferences = PreferencesPayload::default();
        preferences.focus.sleep_accounting_policy = SleepAccountingPolicy::Count;
        save_preferences(&mut conn, preferences, T0).unwrap();
        assert_eq!(
            resolve_task_sleep_accounting_policy(&conn, task_id).unwrap(),
            SleepAccountingPolicy::Count
        );

        set_task_sleep_accounting_override(
            &mut conn,
            task_id,
            TaskSleepAccountingOverride::Exclude,
            T1,
        )
        .unwrap();
        assert_eq!(
            resolve_task_sleep_accounting_policy(&conn, task_id).unwrap(),
            SleepAccountingPolicy::Exclude
        );

        set_task_sleep_accounting_override(
            &mut conn,
            task_id,
            TaskSleepAccountingOverride::Inherit,
            T1,
        )
        .unwrap();
        assert_eq!(
            resolve_task_sleep_accounting_policy(&conn, task_id).unwrap(),
            SleepAccountingPolicy::Count
        );
    }

    #[test]
    fn explicit_count_override_can_enable_sleep_when_global_default_excludes_it() {
        let (mut conn, task_id) = fixture();
        set_task_sleep_accounting_override(
            &mut conn,
            task_id,
            TaskSleepAccountingOverride::Count,
            T1,
        )
        .unwrap();
        assert_eq!(
            resolve_task_sleep_accounting_policy(&conn, task_id).unwrap(),
            SleepAccountingPolicy::Count
        );
    }
}
