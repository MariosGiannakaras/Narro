pub mod lists;
pub mod live_completion;
pub mod live_estimate_error_conversions;
pub mod live_time_taken;
pub mod notes;
pub mod pomodoro_effects;
pub mod preferences;
pub mod recurrence;
pub mod recurrence_replace;
pub mod reminders;
pub mod sessions;
pub mod sleep_accounting;
pub mod subtask_board;
pub mod subtasks;
pub mod task_estimate_edit;
pub mod task_identity;
pub mod task_metadata;
pub mod task_schedule_edit;
pub mod task_time_taken_edit;
pub mod task_title_edit;
pub mod tasks;
pub mod timer_controller;
pub mod timer_runtime;

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
        M::up(include_str!("../../migrations/0003_session_runtime.sql")),
        M::up(include_str!(
            "../../migrations/0004_timer_runtime_checkpoint.sql"
        )),
        M::up(include_str!(
            "../../migrations/0005_pomodoro_boundary_effects.sql"
        )),
        M::up(include_str!(
            "../../migrations/0006_sleep_accounting_policy.sql"
        )),
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
