use crate::domain::ids::TaskId;
use crate::scheduling::{resolve_local_datetime_strict, SchedulingError};
use chrono::{DateTime, Duration as ChronoDuration, NaiveDate, NaiveTime};
use rusqlite::{params, Connection};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SchedulePreferenceReminderCandidate {
    pub task_id: TaskId,
    pub task_title: String,
    pub scheduled_local_date: String,
    pub scheduled_local_time: String,
    pub timezone: String,
    pub reminder_lead_seconds: u32,
}

#[derive(Debug)]
pub enum SchedulePreferenceReminderError {
    Sqlite(rusqlite::Error),
    Scheduling(SchedulingError),
    InvalidNow,
    InvalidLeadSeconds(u32),
    InvalidStoredTaskIdentity,
    InvalidStoredLocalDate,
    InvalidStoredLocalTime,
    InvalidResolvedTimestamp,
}

impl Display for SchedulePreferenceReminderError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "schedule-reminder effect persistence failed: {error}"),
            Self::Scheduling(error) => Display::fmt(error, formatter),
            Self::InvalidNow => formatter.write_str("schedule-reminder observation timestamp must be RFC 3339"),
            Self::InvalidLeadSeconds(seconds) => write!(formatter, "schedule-reminder lead must be positive: {seconds}"),
            Self::InvalidStoredTaskIdentity => formatter.write_str("scheduled task identity is not a valid UUID"),
            Self::InvalidStoredLocalDate => formatter.write_str("scheduled local date is invalid"),
            Self::InvalidStoredLocalTime => formatter.write_str("scheduled local time is invalid"),
            Self::InvalidResolvedTimestamp => formatter.write_str("resolved scheduled timestamp is invalid"),
        }
    }
}

impl std::error::Error for SchedulePreferenceReminderError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Scheduling(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for SchedulePreferenceReminderError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<SchedulingError> for SchedulePreferenceReminderError {
    fn from(value: SchedulingError) -> Self {
        Self::Scheduling(value)
    }
}

fn parse_now(value: &str) -> Result<DateTime<chrono::FixedOffset>, SchedulePreferenceReminderError> {
    DateTime::parse_from_rfc3339(value).map_err(|_| SchedulePreferenceReminderError::InvalidNow)
}

fn scheduled_instant(
    local_date: &str,
    local_time: &str,
    timezone: &str,
) -> Result<DateTime<chrono::FixedOffset>, SchedulePreferenceReminderError> {
    let date = NaiveDate::parse_from_str(local_date, "%Y-%m-%d")
        .map_err(|_| SchedulePreferenceReminderError::InvalidStoredLocalDate)?;
    let time = NaiveTime::parse_from_str(local_time, "%H:%M")
        .map_err(|_| SchedulePreferenceReminderError::InvalidStoredLocalTime)?;
    let timestamp = resolve_local_datetime_strict(date, time, timezone)?;
    DateTime::parse_from_rfc3339(&timestamp.to_string())
        .map_err(|_| SchedulePreferenceReminderError::InvalidResolvedTimestamp)
}

pub fn cleanup_stale_schedule_preference_effects(
    conn: &Connection,
) -> Result<usize, SchedulePreferenceReminderError> {
    conn.execute(
        "DELETE FROM schedule_preference_reminder_effects AS e
         WHERE NOT EXISTS (
             SELECT 1
             FROM tasks t
             WHERE t.id = e.task_id
               AND t.schedule_kind = 'local_datetime'
               AND t.scheduled_local_date = e.scheduled_local_date
               AND t.scheduled_local_time = e.scheduled_local_time
               AND t.schedule_timezone = e.timezone
         )",
        [],
    )
    .map_err(Into::into)
}

pub fn pending_schedule_preference_reminders(
    conn: &Connection,
    now: &str,
    reminder_lead_seconds: u32,
) -> Result<Vec<SchedulePreferenceReminderCandidate>, SchedulePreferenceReminderError> {
    if reminder_lead_seconds == 0 {
        return Err(SchedulePreferenceReminderError::InvalidLeadSeconds(reminder_lead_seconds));
    }
    let now = parse_now(now)?;

    let mut statement = conn.prepare(
        "SELECT t.id, t.title, t.scheduled_local_date, t.scheduled_local_time, t.schedule_timezone
         FROM tasks t
         JOIN lists l ON l.id = t.list_id
         WHERE t.schedule_kind = 'local_datetime'
           AND t.scheduled_local_date IS NOT NULL
           AND t.scheduled_local_time IS NOT NULL
           AND t.schedule_timezone IS NOT NULL
           AND t.completed_at IS NULL
           AND t.archived_at IS NULL
           AND l.archived_at IS NULL
           AND NOT EXISTS (
               SELECT 1
               FROM schedule_preference_reminder_effects e
               WHERE e.task_id = t.id
                 AND e.scheduled_local_date = t.scheduled_local_date
                 AND e.scheduled_local_time = t.scheduled_local_time
                 AND e.timezone = t.schedule_timezone
           )",
    )?;

    let rows = statement.query_map([], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, String>(3)?,
            row.get::<_, String>(4)?,
        ))
    })?;

    let mut due = Vec::new();
    for row in rows {
        let (task_id, task_title, local_date, local_time, timezone) = row?;
        let task_id = TaskId::parse_str(&task_id)
            .map_err(|_| SchedulePreferenceReminderError::InvalidStoredTaskIdentity)?;
        let scheduled = scheduled_instant(&local_date, &local_time, &timezone)?;
        let reminder_at = scheduled
            .checked_sub_signed(ChronoDuration::seconds(i64::from(reminder_lead_seconds)))
            .ok_or(SchedulePreferenceReminderError::InvalidResolvedTimestamp)?;
        if reminder_at <= now {
            due.push((
                scheduled,
                SchedulePreferenceReminderCandidate {
                    task_id,
                    task_title,
                    scheduled_local_date: local_date,
                    scheduled_local_time: local_time,
                    timezone,
                    reminder_lead_seconds,
                },
            ));
        }
    }

    due.sort_by(|(left_time, left), (right_time, right)| {
        left_time
            .cmp(right_time)
            .then_with(|| left.task_id.to_string().cmp(&right.task_id.to_string()))
    });
    Ok(due.into_iter().map(|(_, candidate)| candidate).collect())
}

pub fn mark_schedule_preference_reminder_submitted(
    conn: &Connection,
    candidate: &SchedulePreferenceReminderCandidate,
    now: &str,
) -> Result<bool, SchedulePreferenceReminderError> {
    parse_now(now)?;
    let changed = conn.execute(
        "INSERT INTO schedule_preference_reminder_effects (
            task_id, scheduled_local_date, scheduled_local_time, timezone,
            reminder_lead_seconds, submitted_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(task_id, scheduled_local_date, scheduled_local_time, timezone) DO NOTHING",
        params![
            candidate.task_id.to_string(),
            candidate.scheduled_local_date,
            candidate.scheduled_local_time,
            candidate.timezone,
            i64::from(candidate.reminder_lead_seconds),
            now,
        ],
    )?;
    Ok(changed == 1)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::create_task;

    const T0: &str = "2026-09-05T06:00:00Z";

    fn fixture() -> (Connection, TaskId) {
        let mut conn = Connection::open_in_memory().expect("open database");
        run_migrations(&mut conn).expect("migrate database");
        let list = create_list(
            &mut conn,
            NewListInput { title: "Work".into(), color: None, icon_asset: None },
            T0,
        ).expect("create list");
        let task = create_task(
            &mut conn,
            NewTaskInput {
                list_id: list.id,
                title: "Scheduled focus".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: None,
            },
            T0,
        ).expect("create task");
        conn.execute(
            "UPDATE tasks
             SET schedule_kind = 'local_datetime',
                 scheduled_local_date = '2026-09-05',
                 scheduled_local_time = '15:10',
                 schedule_timezone = 'Europe/Athens'
             WHERE id = ?1",
            [task.id.to_string()],
        ).expect("schedule task");
        (conn, task.id)
    }

    #[test]
    fn lead_window_produces_one_due_candidate_and_submission_is_idempotent() {
        let (conn, task_id) = fixture();
        let before = pending_schedule_preference_reminders(
            &conn,
            "2026-09-05T11:59:59Z",
            600,
        ).unwrap();
        assert!(before.is_empty());

        let due = pending_schedule_preference_reminders(
            &conn,
            "2026-09-05T12:00:00Z",
            600,
        ).unwrap();
        assert_eq!(due.len(), 1);
        assert_eq!(due[0].task_id, task_id);
        assert!(mark_schedule_preference_reminder_submitted(
            &conn,
            &due[0],
            "2026-09-05T12:00:01Z",
        ).unwrap());

        assert!(pending_schedule_preference_reminders(
            &conn,
            "2026-09-05T12:05:00Z",
            1_200,
        ).unwrap().is_empty());
    }

    #[test]
    fn schedule_change_cleanup_allows_a_new_schedule_effect() {
        let (conn, task_id) = fixture();
        let due = pending_schedule_preference_reminders(
            &conn,
            "2026-09-05T12:00:00Z",
            600,
        ).unwrap();
        mark_schedule_preference_reminder_submitted(
            &conn,
            &due[0],
            "2026-09-05T12:00:01Z",
        ).unwrap();

        conn.execute(
            "UPDATE tasks
             SET scheduled_local_time = '16:10'
             WHERE id = ?1",
            [task_id.to_string()],
        ).unwrap();
        assert_eq!(cleanup_stale_schedule_preference_effects(&conn).unwrap(), 1);

        let next = pending_schedule_preference_reminders(
            &conn,
            "2026-09-05T13:00:00Z",
            600,
        ).unwrap();
        assert_eq!(next.len(), 1);
        assert_eq!(next[0].scheduled_local_time, "16:10");
    }
}
