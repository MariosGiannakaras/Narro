use crate::domain::ids::TaskId;
use crate::domain::model::PlanningLane;
use crate::domain::preferences::PreferencesPayload;
use crate::domain::tasks::TaskRecord;
use crate::domain::timer_events::TimerSessionPayload;
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::lists::{active_lists, ListStoreError};
use crate::persistence::preferences::{get_preferences, PreferenceStoreError};
use crate::persistence::tasks::{active_tasks_in_bucket, TaskStoreError};
use crate::scheduling::{self, FocusEligibility, SchedulingError};
use crate::timer::{TimerMode, TimerStateKind};
use crate::timer_service::TimerService;
use jiff::Timestamp;
use rusqlite::Connection;
use serde::Serialize;
use std::collections::HashSet;
use std::fmt::{Display, Formatter};
use std::path::PathBuf;
use tauri::{Manager, State};

const ACTIVE_MANUAL_LANES: [PlanningLane; 3] = [
    PlanningLane::Backlog,
    PlanningLane::ThisWeek,
    PlanningLane::Today,
];

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FocusStartPlan {
    pub task_id: TaskId,
    pub mode: TimerMode,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(tag = "status", rename_all = "snake_case")]
pub enum StartBlitzOutcome {
    Started {
        #[serde(rename = "taskId")]
        task_id: TaskId,
        timer: TimerSessionPayload,
    },
    AlreadyActive {
        #[serde(rename = "taskId")]
        task_id: TaskId,
        timer: TimerSessionPayload,
    },
    NoEligibleTodayTasks,
}

#[derive(Debug)]
pub enum FocusEntryError {
    Lists(ListStoreError),
    Tasks(TaskStoreError),
    Preferences(PreferenceStoreError),
    Scheduling(SchedulingError),
    Sqlite(rusqlite::Error),
    DuplicateTaskProjection(TaskId),
    DurationOverflow,
    RuntimeProjectionInconsistent,
}

impl Display for FocusEntryError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Lists(error) => Display::fmt(error, formatter),
            Self::Tasks(error) => Display::fmt(error, formatter),
            Self::Preferences(error) => Display::fmt(error, formatter),
            Self::Scheduling(error) => Display::fmt(error, formatter),
            Self::Sqlite(error) => write!(formatter, "Focus entry database read failed: {error}"),
            Self::DuplicateTaskProjection(id) => write!(
                formatter,
                "Focus entry encountered duplicate active task identity: {id}"
            ),
            Self::DurationOverflow => {
                formatter.write_str("Focus timer duration exceeded the supported millisecond range")
            }
            Self::RuntimeProjectionInconsistent => formatter
                .write_str("authoritative timer projection has inconsistent active-session state"),
        }
    }
}

impl std::error::Error for FocusEntryError {}

impl From<ListStoreError> for FocusEntryError {
    fn from(value: ListStoreError) -> Self {
        Self::Lists(value)
    }
}

impl From<TaskStoreError> for FocusEntryError {
    fn from(value: TaskStoreError) -> Self {
        Self::Tasks(value)
    }
}

impl From<PreferenceStoreError> for FocusEntryError {
    fn from(value: PreferenceStoreError) -> Self {
        Self::Preferences(value)
    }
}

impl From<SchedulingError> for FocusEntryError {
    fn from(value: SchedulingError) -> Self {
        Self::Scheduling(value)
    }
}

impl From<rusqlite::Error> for FocusEntryError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

#[derive(Debug)]
struct RankedTask {
    list_rank: u32,
    task: TaskRecord,
}

fn selected_timezone(conn: &Connection, fallback: &str) -> Result<String, FocusEntryError> {
    let persisted = get_preferences(conn)?
        .and_then(|record| record.payload.general.timezone)
        .filter(|value| !value.trim().is_empty());
    let candidate = persisted.as_deref().unwrap_or(fallback);
    Ok(scheduling::validate_timezone_identifier(candidate)?)
}

fn seconds_to_ms(seconds: u32) -> Result<u64, FocusEntryError> {
    u64::from(seconds)
        .checked_mul(1_000)
        .ok_or(FocusEntryError::DurationOverflow)
}

fn timer_mode_for_task(
    task: &TaskRecord,
    preferences: &PreferencesPayload,
) -> Result<TimerMode, FocusEntryError> {
    if preferences.focus.pomodoro_enabled {
        return Ok(TimerMode::Pomodoro {
            work_ms: seconds_to_ms(preferences.focus.pomodoro_work_seconds)?,
            break_ms: seconds_to_ms(preferences.focus.pomodoro_break_seconds)?,
        });
    }

    match task.est_seconds {
        Some(seconds) => Ok(TimerMode::EstCountdown {
            est_ms: seconds_to_ms(seconds)?,
        }),
        None => Ok(TimerMode::CountUp),
    }
}

pub fn select_start_plan_at(
    conn: &Connection,
    now: Timestamp,
    fallback_display_timezone: &str,
) -> Result<Option<FocusStartPlan>, FocusEntryError> {
    let display_timezone = selected_timezone(conn, fallback_display_timezone)?;
    let preferences = get_preferences(conn)?
        .map(|record| record.payload)
        .unwrap_or_default();
    let mut seen = HashSet::new();
    let mut candidates = Vec::new();

    for list in active_lists(conn)? {
        for manual_lane in ACTIVE_MANUAL_LANES {
            for task in active_tasks_in_bucket(conn, list.id, manual_lane)? {
                if !seen.insert(task.id) {
                    return Err(FocusEntryError::DuplicateTaskProjection(task.id));
                }
                candidates.push(RankedTask {
                    list_rank: list.sort_rank,
                    task,
                });
            }
        }
    }

    candidates.sort_by(|left, right| {
        left.list_rank
            .cmp(&right.list_rank)
            .then_with(|| left.task.sort_rank.cmp(&right.task.sort_rank))
            .then_with(|| left.task.id.to_string().cmp(&right.task.id.to_string()))
    });

    for candidate in candidates {
        if scheduling::focus_eligibility_at(&candidate.task, now, &display_timezone)?
            != FocusEligibility::Eligible
        {
            continue;
        }
        return Ok(Some(FocusStartPlan {
            task_id: candidate.task.id,
            mode: timer_mode_for_task(&candidate.task, &preferences)?,
        }));
    }

    Ok(None)
}

fn active_task_id(payload: &TimerSessionPayload) -> Result<Option<TaskId>, FocusEntryError> {
    let active_state = payload.runtime.timer.state != TimerStateKind::Idle;
    match (
        active_state,
        payload.runtime.open_session_id,
        payload.runtime.timer.task_id,
    ) {
        (false, None, None) => Ok(None),
        (true, Some(_), Some(task_id)) => Ok(Some(task_id)),
        _ => Err(FocusEntryError::RuntimeProjectionInconsistent),
    }
}

fn app_database(app_handle: &tauri::AppHandle) -> CommandResult<Connection> {
    let app_dir: PathBuf = app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "BLITZ_START_FAILED",
            format!("failed to resolve Narro app-data directory for Focus entry: {error}"),
        )
    })?;
    let connection = Connection::open(app_dir.join("narro.db")).map_err(|error| {
        CommandError::new(
            "BLITZ_START_FAILED",
            format!("failed to open the Narro database for Focus entry: {error}"),
        )
    })?;
    persistence::configure_connection(&connection).map_err(|error| {
        CommandError::new(
            "BLITZ_START_FAILED",
            format!("failed to configure the Narro database for Focus entry: {error}"),
        )
    })?;
    Ok(connection)
}

fn focus_entry_error(error: FocusEntryError) -> CommandError {
    CommandError::new("BLITZ_START_FAILED", error.to_string())
}

#[tauri::command(rename_all = "camelCase")]
pub fn start_blitz(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
    display_timezone: String,
) -> CommandResult<StartBlitzOutcome> {
    scheduling::validate_timezone_identifier(&display_timezone)
        .map_err(|error| CommandError::invalid_argument("displayTimezone", error))?;

    let before = timer_service.snapshot()?;
    if let Some(task_id) = active_task_id(&before).map_err(focus_entry_error)? {
        return Ok(StartBlitzOutcome::AlreadyActive {
            task_id,
            timer: before,
        });
    }

    let connection = app_database(&app_handle)?;
    let now = Timestamp::now();
    let Some(plan) =
        select_start_plan_at(&connection, now, &display_timezone).map_err(focus_entry_error)?
    else {
        return Ok(StartBlitzOutcome::NoEligibleTodayTasks);
    };
    drop(connection);

    match timer_service.start_task(&app_handle, plan.task_id, plan.mode) {
        Ok(timer) => Ok(StartBlitzOutcome::Started {
            task_id: plan.task_id,
            timer,
        }),
        Err(start_error) => {
            // Two explicit Start Blitz requests can race after both observe idle. Never turn that
            // race into a second session or an unsafe retry if the first request already committed.
            let after = timer_service.snapshot()?;
            if let Some(task_id) = active_task_id(&after).map_err(focus_entry_error)? {
                Ok(StartBlitzOutcome::AlreadyActive {
                    task_id,
                    timer: after,
                })
            } else {
                Err(start_error)
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::preferences::{initialize_preferences, save_preferences};
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::create_task;

    const T0: &str = "2026-09-08T08:00:00Z";

    fn setup() -> Connection {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");
        run_migrations(&mut conn).expect("run migrations");
        conn
    }

    fn add_list(conn: &mut Connection, title: &str) -> crate::domain::ids::ListId {
        create_list(
            conn,
            NewListInput {
                title: title.to_owned(),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .expect("create list")
        .id
    }

    fn add_task(
        conn: &mut Connection,
        list_id: crate::domain::ids::ListId,
        title: &str,
        lane: PlanningLane,
        est_seconds: Option<u32>,
    ) -> TaskId {
        create_task(
            conn,
            NewTaskInput {
                list_id,
                title: title.to_owned(),
                manual_lane: lane,
                est_seconds,
            },
            T0,
        )
        .expect("create task")
        .id
    }

    fn now() -> Timestamp {
        "2026-09-08T10:00:00Z"
            .parse()
            .expect("parse deterministic timestamp")
    }

    #[test]
    fn top_future_timed_today_is_skipped_for_next_eligible_task() {
        let mut conn = setup();
        let list = add_list(&mut conn, "Work");
        let future = add_task(&mut conn, list, "Later", PlanningLane::Today, Some(900));
        let eligible = add_task(&mut conn, list, "Ready", PlanningLane::Today, Some(1200));
        conn.execute(
            "UPDATE tasks
             SET schedule_kind = 'local_datetime',
                 scheduled_local_date = '2026-09-08',
                 scheduled_local_time = '15:00',
                 schedule_timezone = 'Europe/Athens'
             WHERE id = ?1",
            [future.to_string()],
        )
        .expect("schedule future task");

        let plan = select_start_plan_at(&conn, now(), "Europe/Athens")
            .expect("select Focus task")
            .expect("eligible task");
        assert_eq!(plan.task_id, eligible);
        assert_eq!(plan.mode, TimerMode::EstCountdown { est_ms: 1_200_000 });
    }

    #[test]
    fn scheduled_backlog_task_that_projects_today_can_start() {
        let mut conn = setup();
        let list = add_list(&mut conn, "Scheduled");
        let task_id = add_task(&mut conn, list, "Due today", PlanningLane::Backlog, None);
        conn.execute(
            "UPDATE tasks
             SET schedule_kind = 'date_only', scheduled_local_date = '2026-09-08'
             WHERE id = ?1",
            [task_id.to_string()],
        )
        .expect("schedule date-only task");

        let plan = select_start_plan_at(&conn, now(), "Europe/Athens")
            .expect("select Focus task")
            .expect("eligible task");
        assert_eq!(plan.task_id, task_id);
        assert_eq!(plan.mode, TimerMode::CountUp);
    }

    #[test]
    fn all_future_timed_today_tasks_return_no_start_plan() {
        let mut conn = setup();
        let list = add_list(&mut conn, "Work");
        let task_id = add_task(&mut conn, list, "Later", PlanningLane::Today, None);
        conn.execute(
            "UPDATE tasks
             SET schedule_kind = 'local_datetime',
                 scheduled_local_date = '2026-09-08',
                 scheduled_local_time = '15:00',
                 schedule_timezone = 'Europe/Athens'
             WHERE id = ?1",
            [task_id.to_string()],
        )
        .expect("schedule future task");

        assert!(select_start_plan_at(&conn, now(), "Europe/Athens")
            .expect("evaluate Focus entry")
            .is_none());
    }

    #[test]
    fn list_priority_precedes_task_priority_across_all_lists() {
        let mut conn = setup();
        let first_list = add_list(&mut conn, "First");
        let second_list = add_list(&mut conn, "Second");
        let expected = add_task(
            &mut conn,
            first_list,
            "First list",
            PlanningLane::Today,
            None,
        );
        add_task(
            &mut conn,
            second_list,
            "Second list",
            PlanningLane::Today,
            None,
        );

        let plan = select_start_plan_at(&conn, now(), "Europe/Athens")
            .expect("select Focus task")
            .expect("eligible task");
        assert_eq!(plan.task_id, expected);
    }

    #[test]
    fn pomodoro_preference_overrides_task_estimate() {
        let mut conn = setup();
        let list = add_list(&mut conn, "Work");
        let task_id = add_task(
            &mut conn,
            list,
            "Estimated",
            PlanningLane::Today,
            Some(1_800),
        );
        let mut preferences = initialize_preferences(&mut conn, T0)
            .expect("initialize preferences")
            .payload;
        preferences.focus.pomodoro_enabled = true;
        preferences.focus.pomodoro_work_seconds = 1_500;
        preferences.focus.pomodoro_break_seconds = 300;
        save_preferences(&mut conn, preferences, "2026-09-08T08:01:00Z").expect("save preferences");

        let plan = select_start_plan_at(&conn, now(), "Europe/Athens")
            .expect("select Focus task")
            .expect("eligible task");
        assert_eq!(plan.task_id, task_id);
        assert_eq!(
            plan.mode,
            TimerMode::Pomodoro {
                work_ms: 1_500_000,
                break_ms: 300_000,
            }
        );
    }

    #[test]
    fn persisted_timezone_overrides_renderer_fallback_for_today_eligibility() {
        let mut conn = setup();
        let list = add_list(&mut conn, "Work");
        let task_id = add_task(&mut conn, list, "Athens today", PlanningLane::Backlog, None);
        conn.execute(
            "UPDATE tasks
             SET schedule_kind = 'date_only', scheduled_local_date = '2026-09-08'
             WHERE id = ?1",
            [task_id.to_string()],
        )
        .expect("schedule date-only task");
        let mut preferences = initialize_preferences(&mut conn, T0)
            .expect("initialize preferences")
            .payload;
        preferences.general.timezone = Some("Europe/Athens".into());
        save_preferences(&mut conn, preferences, "2026-09-08T08:01:00Z").expect("save timezone");

        let plan = select_start_plan_at(&conn, now(), "America/Los_Angeles")
            .expect("select using persisted timezone")
            .expect("eligible task");
        assert_eq!(plan.task_id, task_id);
    }
}
