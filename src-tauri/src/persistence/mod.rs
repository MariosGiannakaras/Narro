use rusqlite::Connection;
use rusqlite_migration::{Migrations, M};
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum PersistenceError {
    Sqlite(rusqlite::Error),
    Migration(rusqlite_migration::Error),
}

impl Display for PersistenceError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "SQLite configuration failed: {error}"),
            Self::Migration(error) => write!(formatter, "database migration failed: {error}"),
        }
    }
}

impl std::error::Error for PersistenceError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Migration(error) => Some(error),
        }
    }
}

impl From<rusqlite::Error> for PersistenceError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<rusqlite_migration::Error> for PersistenceError {
    fn from(value: rusqlite_migration::Error) -> Self {
        Self::Migration(value)
    }
}

fn migrations() -> Migrations<'static> {
    Migrations::new(vec![
        M::up(include_str!("../../migrations/0001_initial.sql")),
        M::up(include_str!("../../migrations/0002_domain_foundation.sql")),
    ])
}

pub fn configure_connection(conn: &Connection) -> Result<(), PersistenceError> {
    conn.pragma_update(None, "foreign_keys", "ON")?;
    Ok(())
}

pub fn run_migrations(conn: &mut Connection) -> Result<(), PersistenceError> {
    configure_connection(conn)?;
    migrations().to_latest(conn)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::params;

    const NOW: &str = "2026-09-03T10:00:00Z";

    fn table_exists(conn: &Connection, table_name: &str) -> bool {
        conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type='table' AND name=?1)",
            [table_name],
            |row| row.get::<_, i64>(0),
        )
        .expect("query table existence")
            == 1
    }

    fn insert_list(conn: &Connection, id: &str) {
        conn.execute(
            "INSERT INTO lists (id, title, sort_rank, created_at, updated_at) VALUES (?1, 'Inbox', 0, ?2, ?2)",
            params![id, NOW],
        )
        .expect("insert list fixture");
    }

    fn insert_task(conn: &Connection, id: &str, list_id: &str) {
        conn.execute(
            "INSERT INTO tasks (id, list_id, title, manual_lane, sort_rank, created_at, updated_at) VALUES (?1, ?2, 'Task', 'backlog', 0, ?3, ?3)",
            params![id, list_id, NOW],
        )
        .expect("insert task fixture");
    }

    #[test]
    fn migrations_fresh_and_repeated_create_domain_schema() {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");

        run_migrations(&mut conn).expect("fresh migration should succeed");

        for table in [
            "_diagnostic_startup",
            "lists",
            "tasks",
            "subtasks",
            "task_notes",
            "recurrence_rules",
            "recurrence_occurrences",
            "reminders",
            "sessions",
            "preferences",
        ] {
            assert!(
                table_exists(&conn, table),
                "{table} should exist after migration"
            );
        }

        let foreign_keys: i64 = conn
            .query_row("PRAGMA foreign_keys", [], |row| row.get(0))
            .expect("query foreign key pragma");
        assert_eq!(foreign_keys, 1, "foreign-key enforcement must be enabled");

        run_migrations(&mut conn).expect("repeated migration should succeed without errors");
    }

    #[test]
    fn existing_v1_database_upgrades_to_domain_schema() {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");
        let legacy = Migrations::new(vec![M::up(include_str!(
            "../../migrations/0001_initial.sql"
        ))]);
        legacy
            .to_latest(&mut conn)
            .expect("create legacy v1 database");

        assert!(table_exists(&conn, "_diagnostic_startup"));
        assert!(!table_exists(&conn, "tasks"));

        run_migrations(&mut conn).expect("upgrade v1 database to latest");
        assert!(table_exists(&conn, "tasks"));
        assert!(table_exists(&conn, "sessions"));
    }

    #[test]
    fn schedule_shape_constraint_rejects_mixed_date_only_state() {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");
        run_migrations(&mut conn).expect("migrate database");
        insert_list(&conn, "list-1");

        let result = conn.execute(
            "INSERT INTO tasks (
                id, list_id, title, manual_lane, sort_rank,
                schedule_kind, scheduled_local_date, scheduled_local_time,
                created_at, updated_at
            ) VALUES (?1, ?2, 'Bad schedule', 'today', 0, 'date_only', '2026-09-04', '09:00', ?3, ?3)",
            params!["task-bad-schedule", "list-1", NOW],
        );

        assert!(
            result.is_err(),
            "date-only task must not carry a local time"
        );
    }

    #[test]
    fn permanent_task_delete_cascades_task_owned_rows() {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");
        run_migrations(&mut conn).expect("migrate database");
        insert_list(&conn, "list-1");
        insert_task(&conn, "task-1", "list-1");

        conn.execute(
            "INSERT INTO subtasks (id, task_id, title, sort_rank, created_at, updated_at) VALUES ('subtask-1', 'task-1', 'Subtask', 0, ?1, ?1)",
            [NOW],
        )
        .expect("insert subtask");
        conn.execute(
            "INSERT INTO task_notes (task_id, editor_format_version, content, updated_at) VALUES ('task-1', 1, '{}', ?1)",
            [NOW],
        )
        .expect("insert note");
        conn.execute(
            "INSERT INTO reminders (id, task_id, remind_local_date, remind_local_time, timezone, created_at, updated_at) VALUES ('reminder-1', 'task-1', '2026-09-04', '09:00', 'Europe/Athens', ?1, ?1)",
            [NOW],
        )
        .expect("insert reminder");
        conn.execute(
            "INSERT INTO sessions (id, task_id, kind, started_at, ended_at, duration_seconds, source, created_at, updated_at) VALUES ('session-1', 'task-1', 'work', ?1, ?1, 60, 'focus', ?1, ?1)",
            [NOW],
        )
        .expect("insert session");

        conn.execute("DELETE FROM tasks WHERE id = 'task-1'", [])
            .expect("delete task");

        for table in ["subtasks", "task_notes", "reminders", "sessions"] {
            let count: i64 = conn
                .query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |row| {
                    row.get(0)
                })
                .expect("count task-owned rows");
            assert_eq!(
                count, 0,
                "{table} rows should cascade with permanent task delete"
            );
        }
    }

    #[test]
    fn date_only_recurrence_occurrence_identity_is_unique() {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");
        run_migrations(&mut conn).expect("migrate database");
        insert_list(&conn, "list-1");
        insert_task(&conn, "parent-task", "list-1");
        insert_task(&conn, "child-1", "list-1");
        insert_task(&conn, "child-2", "list-1");

        conn.execute(
            "INSERT INTO recurrence_rules (
                id, parent_task_id, interval_count, unit, starts_local_date, created_at, updated_at
            ) VALUES ('rule-1', 'parent-task', 1, 'week', '2026-09-01', ?1, ?1)",
            [NOW],
        )
        .expect("insert recurrence rule");

        conn.execute(
            "INSERT INTO recurrence_occurrences (
                child_task_id, recurrence_rule_id, occurrence_local_date, occurrence_local_time, created_at
            ) VALUES ('child-1', 'rule-1', '2026-09-07', NULL, ?1)",
            [NOW],
        )
        .expect("insert first occurrence");

        let duplicate = conn.execute(
            "INSERT INTO recurrence_occurrences (
                child_task_id, recurrence_rule_id, occurrence_local_date, occurrence_local_time, created_at
            ) VALUES ('child-2', 'rule-1', '2026-09-07', NULL, ?1)",
            [NOW],
        );

        assert!(
            duplicate.is_err(),
            "same date-only occurrence must be idempotency-protected"
        );
    }
}
