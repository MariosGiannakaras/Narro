use crate::domain::ids::{ReminderId, TaskId};
use crate::domain::reminders::ReminderRecord;
use crate::notifications;
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::reminders::{
    mark_reminder_fired, pending_due_reminders, ReminderStoreError,
};
use crate::persistence::tasks::{get_task, TaskStoreError};
use crate::persistence::{configure_connection, PersistenceError};
use chrono::{SecondsFormat, Utc};
use rusqlite::{Connection, OpenFlags};
use std::fmt::{Display, Formatter};
use std::path::{Path, PathBuf};
use std::time::Duration;

const REMINDER_POLL_INTERVAL: Duration = Duration::from_secs(30);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub struct ReminderDispatchReport {
    pub due_count: usize,
    pub submitted_count: usize,
    pub submission_failed_count: usize,
    pub skipped_inactive_count: usize,
}

#[derive(Debug)]
pub enum ReminderDispatchError {
    Query(ReminderStoreError),
    Task(TaskStoreError),
    List(ListStoreError),
    Acknowledgment(ReminderStoreError),
}

impl Display for ReminderDispatchError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Query(error) => write!(formatter, "reminder due query failed: {error}"),
            Self::Task(error) => write!(formatter, "reminder task lookup failed: {error}"),
            Self::List(error) => write!(formatter, "reminder list lookup failed: {error}"),
            Self::Acknowledgment(error) => {
                write!(
                    formatter,
                    "reminder delivery acknowledgment failed: {error}"
                )
            }
        }
    }
}

impl std::error::Error for ReminderDispatchError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Query(error) => Some(error),
            Self::Task(error) => Some(error),
            Self::List(error) => Some(error),
            Self::Acknowledgment(error) => Some(error),
        }
    }
}

#[derive(Debug)]
pub enum ReminderDeliveryCycleError {
    Sqlite(rusqlite::Error),
    Persistence(PersistenceError),
    Dispatch(ReminderDispatchError),
}

impl Display for ReminderDeliveryCycleError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "open reminder delivery database: {error}"),
            Self::Persistence(error) => Display::fmt(error, formatter),
            Self::Dispatch(error) => Display::fmt(error, formatter),
        }
    }
}

impl std::error::Error for ReminderDeliveryCycleError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Persistence(error) => Some(error),
            Self::Dispatch(error) => Some(error),
        }
    }
}

impl From<rusqlite::Error> for ReminderDeliveryCycleError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<PersistenceError> for ReminderDeliveryCycleError {
    fn from(value: PersistenceError) -> Self {
        Self::Persistence(value)
    }
}

#[derive(Debug)]
pub enum ReminderDeliveryStartError {
    Sqlite(rusqlite::Error),
    Persistence(PersistenceError),
    Thread(std::io::Error),
}

impl Display for ReminderDeliveryStartError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "open reminder delivery database: {error}"),
            Self::Persistence(error) => Display::fmt(error, formatter),
            Self::Thread(error) => write!(formatter, "start reminder delivery thread: {error}"),
        }
    }
}

impl std::error::Error for ReminderDeliveryStartError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Persistence(error) => Some(error),
            Self::Thread(error) => Some(error),
        }
    }
}

impl From<rusqlite::Error> for ReminderDeliveryStartError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<PersistenceError> for ReminderDeliveryStartError {
    fn from(value: PersistenceError) -> Self {
        Self::Persistence(value)
    }
}

fn active_task_title(
    conn: &Connection,
    task_id: TaskId,
) -> Result<Option<String>, ReminderDispatchError> {
    let task = match get_task(conn, task_id) {
        Ok(task) => task,
        Err(TaskStoreError::NotFound(_)) => return Ok(None),
        Err(error) => return Err(ReminderDispatchError::Task(error)),
    };
    if task.completed_at.is_some() || task.archived_at.is_some() {
        return Ok(None);
    }

    let list = get_list(conn, task.list_id).map_err(ReminderDispatchError::List)?;
    if list.archived_at.is_some() {
        return Ok(None);
    }
    Ok(Some(task.title))
}

fn acknowledge_fired(
    conn: &mut Connection,
    reminder_id: ReminderId,
    now: &str,
) -> Result<(), ReminderStoreError> {
    mark_reminder_fired(conn, reminder_id, now).map(|_| ())
}

fn dispatch_due_with<Submit, Acknowledge>(
    conn: &mut Connection,
    now: &str,
    mut submit: Submit,
    mut acknowledge: Acknowledge,
) -> Result<ReminderDispatchReport, ReminderDispatchError>
where
    Submit: FnMut(&ReminderRecord, &str) -> bool,
    Acknowledge: FnMut(&mut Connection, ReminderId, &str) -> Result<(), ReminderStoreError>,
{
    let due = pending_due_reminders(conn, now).map_err(ReminderDispatchError::Query)?;
    let mut report = ReminderDispatchReport {
        due_count: due.len(),
        ..ReminderDispatchReport::default()
    };

    for reminder in due {
        let Some(task_title) = active_task_title(conn, reminder.task_id)? else {
            report.skipped_inactive_count += 1;
            continue;
        };

        if !submit(&reminder, &task_title) {
            report.submission_failed_count += 1;
            continue;
        }

        acknowledge(conn, reminder.id, now).map_err(ReminderDispatchError::Acknowledgment)?;
        report.submitted_count += 1;
    }

    Ok(report)
}

fn open_delivery_connection(
    database_path: &Path,
) -> Result<Connection, ReminderDeliveryCycleError> {
    let connection = Connection::open_with_flags(database_path, OpenFlags::SQLITE_OPEN_READ_WRITE)?;
    configure_connection(&connection)?;
    Ok(connection)
}

fn dispatch_due_from_path_with<Submit, Acknowledge>(
    database_path: &Path,
    now: &str,
    submit: Submit,
    acknowledge: Acknowledge,
) -> Result<ReminderDispatchReport, ReminderDeliveryCycleError>
where
    Submit: FnMut(&ReminderRecord, &str) -> bool,
    Acknowledge: FnMut(&mut Connection, ReminderId, &str) -> Result<(), ReminderStoreError>,
{
    let mut connection = open_delivery_connection(database_path)?;
    dispatch_due_with(&mut connection, now, submit, acknowledge)
        .map_err(ReminderDeliveryCycleError::Dispatch)
}

fn dispatch_due_from_path(
    database_path: &Path,
    app_handle: &tauri::AppHandle,
    now: &str,
) -> Result<ReminderDispatchReport, ReminderDeliveryCycleError> {
    dispatch_due_from_path_with(
        database_path,
        now,
        |reminder, task_title| match notifications::send_task_reminder(app_handle, task_title) {
            Ok(()) => true,
            Err(error) => {
                eprintln!(
                    "Reminder {} is due, but Windows notification submission failed; it remains pending for retry: {error}",
                    reminder.id
                );
                false
            }
        },
        acknowledge_fired,
    )
}

pub fn install_background_delivery(
    app_handle: tauri::AppHandle,
    database_path: PathBuf,
) -> Result<(), ReminderDeliveryStartError> {
    let validation_connection =
        Connection::open_with_flags(&database_path, OpenFlags::SQLITE_OPEN_READ_WRITE)?;
    configure_connection(&validation_connection)?;
    drop(validation_connection);

    std::thread::Builder::new()
        .name("narro-reminder-delivery".to_owned())
        .spawn(move || loop {
            let now = Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true);
            match dispatch_due_from_path(&database_path, &app_handle, &now) {
                Ok(report) if report.submission_failed_count > 0 => {
                    eprintln!(
                        "Reminder delivery cycle completed with {} submission failure(s); pending rows will retry",
                        report.submission_failed_count
                    );
                }
                Ok(_) => {}
                Err(error) => {
                    eprintln!("Reminder delivery cycle failed; pending rows remain durable: {error}");
                }
            }
            std::thread::sleep(REMINDER_POLL_INTERVAL);
        })
        .map(|_| ())
        .map_err(ReminderDeliveryStartError::Thread)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::reminders::NewReminderInput;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::reminders::{create_reminder, get_reminder};
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::{complete_task, create_task};

    const T0: &str = "2026-09-05T06:00:00Z";
    const T1: &str = "2026-09-05T12:00:00Z";

    fn fixture() -> Connection {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");
        run_migrations(&mut conn).expect("migrate database");
        conn
    }

    fn create_task_fixture(conn: &mut Connection, title: &str) -> crate::domain::tasks::TaskRecord {
        let list = create_list(
            conn,
            NewListInput {
                title: format!("List for {title}"),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .expect("create list");
        create_task(
            conn,
            NewTaskInput {
                list_id: list.id,
                title: title.into(),
                manual_lane: PlanningLane::Today,
                est_seconds: None,
            },
            T0,
        )
        .expect("create task")
    }

    fn create_due_reminder(
        conn: &mut Connection,
        task_id: TaskId,
        date: &str,
        time: &str,
        timezone: &str,
    ) -> ReminderRecord {
        create_reminder(
            conn,
            NewReminderInput {
                task_id,
                remind_local_date: date.into(),
                remind_local_time: time.into(),
                timezone: timezone.into(),
            },
            T0,
        )
        .expect("create reminder")
    }

    #[test]
    fn successful_submission_is_acknowledged_once_and_not_resubmitted() {
        let mut conn = fixture();
        let task = create_task_fixture(&mut conn, "Write report");
        let reminder =
            create_due_reminder(&mut conn, task.id, "2026-09-05", "10:00", "Europe/Athens");
        let mut submissions = Vec::new();

        let first = dispatch_due_with(
            &mut conn,
            T1,
            |_, title| {
                submissions.push(title.to_owned());
                true
            },
            acknowledge_fired,
        )
        .expect("first dispatch");
        assert_eq!(first.due_count, 1);
        assert_eq!(first.submitted_count, 1);
        assert_eq!(submissions, vec!["Write report"]);
        assert_eq!(
            get_reminder(&conn, reminder.id)
                .unwrap()
                .fired_at
                .as_deref(),
            Some(T1)
        );

        let second = dispatch_due_with(
            &mut conn,
            T1,
            |_, title| {
                submissions.push(title.to_owned());
                true
            },
            acknowledge_fired,
        )
        .expect("second dispatch");
        assert_eq!(second.due_count, 0);
        assert_eq!(submissions, vec!["Write report"]);
    }

    #[test]
    fn failed_submission_stays_pending_and_retries_later() {
        let mut conn = fixture();
        let task = create_task_fixture(&mut conn, "Retry me");
        let reminder =
            create_due_reminder(&mut conn, task.id, "2026-09-05", "10:00", "Europe/Athens");

        let failed = dispatch_due_with(&mut conn, T1, |_, _| false, acknowledge_fired)
            .expect("failed delivery cycle remains valid");
        assert_eq!(failed.submission_failed_count, 1);
        assert!(get_reminder(&conn, reminder.id).unwrap().fired_at.is_none());

        let retried = dispatch_due_with(&mut conn, T1, |_, _| true, acknowledge_fired)
            .expect("retry delivery");
        assert_eq!(retried.submitted_count, 1);
        assert_eq!(
            get_reminder(&conn, reminder.id)
                .unwrap()
                .fired_at
                .as_deref(),
            Some(T1)
        );
    }

    #[test]
    fn multiple_due_reminders_submit_in_resolved_instant_order() {
        let mut conn = fixture();
        let new_york = create_task_fixture(&mut conn, "New York later");
        let athens = create_task_fixture(&mut conn, "Athens earlier");
        create_due_reminder(
            &mut conn,
            new_york.id,
            "2026-09-05",
            "08:00",
            "America/New_York",
        );
        create_due_reminder(&mut conn, athens.id, "2026-09-05", "12:00", "Europe/Athens");
        let mut titles = Vec::new();

        let report = dispatch_due_with(
            &mut conn,
            T1,
            |_, title| {
                titles.push(title.to_owned());
                true
            },
            acknowledge_fired,
        )
        .expect("dispatch due reminders");

        assert_eq!(report.submitted_count, 2);
        assert_eq!(titles, vec!["Athens earlier", "New York later"]);
    }

    #[test]
    fn completed_task_reminder_is_not_submitted() {
        let mut conn = fixture();
        let task = create_task_fixture(&mut conn, "Completed");
        create_due_reminder(&mut conn, task.id, "2026-09-05", "10:00", "Europe/Athens");
        complete_task(&mut conn, task.id, T1).expect("complete task");
        let mut called = false;

        let report = dispatch_due_with(
            &mut conn,
            T1,
            |_, _| {
                called = true;
                true
            },
            acknowledge_fired,
        )
        .expect("dispatch after completion");

        assert_eq!(report.due_count, 0);
        assert!(!called);
    }

    #[test]
    fn acknowledgment_failure_is_explicit_after_successful_submission() {
        let mut conn = fixture();
        let task = create_task_fixture(&mut conn, "Ack failure");
        let reminder =
            create_due_reminder(&mut conn, task.id, "2026-09-05", "10:00", "Europe/Athens");
        let mut submitted = 0;

        let error = dispatch_due_with(
            &mut conn,
            T1,
            |_, _| {
                submitted += 1;
                true
            },
            |_, id, _| Err(ReminderStoreError::NotFound(id)),
        )
        .expect_err("ack failure must be surfaced");

        assert_eq!(submitted, 1);
        assert!(matches!(error, ReminderDispatchError::Acknowledgment(_)));
        assert!(get_reminder(&conn, reminder.id).unwrap().fired_at.is_none());
    }

    #[test]
    fn fresh_cycle_connection_observes_reminder_inserted_after_empty_cycle() {
        let database_path = std::env::temp_dir().join(format!(
            "narro-reminder-cycle-{}.db",
            uuid::Uuid::new_v4()
        ));

        {
            let mut setup = Connection::open(&database_path).expect("create file-backed database");
            run_migrations(&mut setup).expect("migrate file-backed database");
        }

        let first = dispatch_due_from_path_with(
            &database_path,
            T0,
            |_, _| true,
            acknowledge_fired,
        )
        .expect("empty first reminder cycle");
        assert_eq!(first.due_count, 0);

        let reminder_id = {
            let mut writer = Connection::open_with_flags(
                &database_path,
                OpenFlags::SQLITE_OPEN_READ_WRITE,
            )
            .expect("open independent writer");
            configure_connection(&writer).expect("configure writer");
            let task = create_task_fixture(&mut writer, "Inserted after first cycle");
            create_due_reminder(
                &mut writer,
                task.id,
                "2026-09-05",
                "10:00",
                "Europe/Athens",
            )
            .id
        };

        let mut submissions = Vec::new();
        let second = dispatch_due_from_path_with(
            &database_path,
            T1,
            |reminder, title| {
                submissions.push((reminder.id, title.to_owned()));
                true
            },
            acknowledge_fired,
        )
        .expect("later cycle must see independent committed reminder");

        assert_eq!(second.due_count, 1);
        assert_eq!(second.submitted_count, 1);
        assert_eq!(
            submissions,
            vec![(reminder_id, "Inserted after first cycle".to_owned())]
        );

        let verification = Connection::open_with_flags(
            &database_path,
            OpenFlags::SQLITE_OPEN_READ_WRITE,
        )
        .expect("open verification connection");
        assert_eq!(
            get_reminder(&verification, reminder_id)
                .expect("read delivered reminder")
                .fired_at
                .as_deref(),
            Some(T1)
        );

        drop(verification);
        std::fs::remove_file(&database_path).expect("remove file-backed reminder database");
    }
}
