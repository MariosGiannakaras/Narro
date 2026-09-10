use crate::domain::ids::{ListId, RecurrenceRuleId, TaskId};
use crate::domain::model::{PlanningLane, ScheduleKind};
use crate::domain::tasks::TaskRecord;
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::lists::{active_lists, ListStoreError};
use crate::persistence::preferences::{get_preferences, PreferenceStoreError};
use crate::persistence::task_metadata::{task_time_taken_seconds, TaskMetadataError};
use crate::persistence::tasks::{active_tasks_in_bucket, get_task, TaskStoreError};
use crate::scheduling::{self, FocusEligibility, SchedulingError};
use jiff::{tz::TimeZone, Timestamp};
use rusqlite::{params, Connection};
use serde::Serialize;
use std::collections::HashSet;
use std::fmt::{Display, Formatter};
use std::path::PathBuf;
use tauri::Manager;

const ACTIVE_MANUAL_LANES: [PlanningLane; 3] = [
    PlanningLane::Backlog,
    PlanningLane::ThisWeek,
    PlanningLane::Today,
];

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ListBoardTargetKind {
    List,
    AllLists,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListBoardTarget {
    pub kind: ListBoardTargetKind,
    pub id: Option<ListId>,
    pub title: String,
    pub color: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListBoardTask {
    pub id: TaskId,
    pub list_id: ListId,
    pub list_title: String,
    pub list_color: Option<String>,
    pub title: String,
    pub est_seconds: Option<u32>,
    pub time_taken_seconds: String,
    pub scheduled_local_date: Option<String>,
    pub scheduled_local_time: Option<String>,
    pub recurrence_rule_id: Option<RecurrenceRuleId>,
    pub recurrence_parent_task_id: Option<TaskId>,
    pub is_overdue: bool,
    pub completed_at: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListBoardLane {
    pub tasks: Vec<ListBoardTask>,
    pub count: u64,
    pub aggregate_est_seconds: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListBoardSnapshot {
    pub target: ListBoardTarget,
    pub display_timezone: String,
    pub backlog: ListBoardLane,
    pub this_week: ListBoardLane,
    pub today: ListBoardLane,
    pub done: ListBoardLane,
}

#[derive(Debug)]
pub enum ListBoardError {
    Lists(ListStoreError),
    Tasks(TaskStoreError),
    TaskMetadata(TaskMetadataError),
    Preferences(PreferenceStoreError),
    Scheduling(SchedulingError),
    Sqlite(rusqlite::Error),
    InvalidStoredTaskId,
    TargetListNotFound(ListId),
    DuplicateTaskProjection(TaskId),
    CountOverflow,
    EstimateOverflow,
}

impl Display for ListBoardError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Lists(error) => Display::fmt(error, formatter),
            Self::Tasks(error) => Display::fmt(error, formatter),
            Self::TaskMetadata(error) => Display::fmt(error, formatter),
            Self::Preferences(error) => Display::fmt(error, formatter),
            Self::Scheduling(error) => Display::fmt(error, formatter),
            Self::Sqlite(error) => write!(formatter, "list-board read failed: {error}"),
            Self::InvalidStoredTaskId => {
                formatter.write_str("stored completed task identity is invalid")
            }
            Self::TargetListNotFound(id) => {
                write!(formatter, "active list-board target not found: {id}")
            }
            Self::DuplicateTaskProjection(id) => {
                write!(
                    formatter,
                    "list-board projection contained duplicate task identity: {id}"
                )
            }
            Self::CountOverflow => {
                formatter.write_str("list-board task count exceeded the supported range")
            }
            Self::EstimateOverflow => {
                formatter.write_str("list-board aggregate estimate exceeded the supported range")
            }
        }
    }
}

impl std::error::Error for ListBoardError {}

impl From<ListStoreError> for ListBoardError {
    fn from(value: ListStoreError) -> Self {
        Self::Lists(value)
    }
}

impl From<TaskStoreError> for ListBoardError {
    fn from(value: TaskStoreError) -> Self {
        Self::Tasks(value)
    }
}

impl From<TaskMetadataError> for ListBoardError {
    fn from(value: TaskMetadataError) -> Self {
        Self::TaskMetadata(value)
    }
}

impl From<PreferenceStoreError> for ListBoardError {
    fn from(value: PreferenceStoreError) -> Self {
        Self::Preferences(value)
    }
}

impl From<SchedulingError> for ListBoardError {
    fn from(value: SchedulingError) -> Self {
        Self::Scheduling(value)
    }
}

impl From<rusqlite::Error> for ListBoardError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

#[derive(Debug)]
struct ProjectedTask {
    list_rank: u32,
    task: TaskRecord,
    list_title: String,
    list_color: Option<String>,
    time_taken_seconds: String,
    is_overdue: bool,
}

#[derive(Default)]
struct LaneAccumulator {
    tasks: Vec<ProjectedTask>,
}

impl LaneAccumulator {
    fn push(&mut self, task: ProjectedTask) {
        self.tasks.push(task);
    }

    fn finish(mut self) -> Result<ListBoardLane, ListBoardError> {
        self.tasks.sort_by(|left, right| {
            left.list_rank
                .cmp(&right.list_rank)
                .then_with(|| left.task.sort_rank.cmp(&right.task.sort_rank))
                .then_with(|| left.task.id.to_string().cmp(&right.task.id.to_string()))
        });

        let count = u64::try_from(self.tasks.len()).map_err(|_| ListBoardError::CountOverflow)?;
        let mut aggregate_est_seconds = 0_u64;
        let mut tasks = Vec::with_capacity(self.tasks.len());
        for projected in self.tasks {
            if let Some(seconds) = projected.task.est_seconds {
                aggregate_est_seconds = aggregate_est_seconds
                    .checked_add(u64::from(seconds))
                    .ok_or(ListBoardError::EstimateOverflow)?;
            }
            tasks.push(ListBoardTask {
                id: projected.task.id,
                list_id: projected.task.list_id,
                list_title: projected.list_title,
                list_color: projected.list_color,
                title: projected.task.title,
                est_seconds: projected.task.est_seconds,
                time_taken_seconds: projected.time_taken_seconds,
                scheduled_local_date: projected.task.scheduled_local_date,
                scheduled_local_time: projected.task.scheduled_local_time,
                recurrence_rule_id: projected.task.recurrence_rule_id,
                recurrence_parent_task_id: projected.task.recurrence_parent_task_id,
                is_overdue: projected.is_overdue,
                completed_at: projected.task.completed_at,
            });
        }

        Ok(ListBoardLane {
            tasks,
            count,
            aggregate_est_seconds,
        })
    }
}

fn completed_tasks_for_list(
    conn: &Connection,
    list_id: ListId,
) -> Result<Vec<TaskRecord>, ListBoardError> {
    let mut statement = conn.prepare(
        "SELECT id
         FROM tasks
         WHERE list_id = ?1
           AND completed_at IS NOT NULL
           AND archived_at IS NULL
         ORDER BY completed_at DESC, id",
    )?;
    let rows = statement.query_map(params![list_id.to_string()], |row| row.get::<_, String>(0))?;
    let mut tasks = Vec::new();
    for row in rows {
        let raw_id = row?;
        let id = TaskId::parse_str(&raw_id).map_err(|_| ListBoardError::InvalidStoredTaskId)?;
        tasks.push(get_task(conn, id)?);
    }
    Ok(tasks)
}

fn selected_timezone(conn: &Connection, fallback: &str) -> Result<String, ListBoardError> {
    let persisted = get_preferences(conn)?
        .and_then(|record| record.payload.general.timezone)
        .filter(|value| !value.trim().is_empty());
    let candidate = persisted.as_deref().unwrap_or(fallback);
    Ok(scheduling::validate_timezone_identifier(candidate)?)
}

fn display_local_date(now: Timestamp, display_timezone: &str) -> Result<String, ListBoardError> {
    let timezone = TimeZone::get(display_timezone)
        .map_err(|_| SchedulingError::InvalidTimezone(display_timezone.to_owned()))?;
    Ok(timezone.to_datetime(now).date().to_string())
}

fn task_is_overdue_at(
    task: &TaskRecord,
    now: Timestamp,
    display_timezone: &str,
) -> Result<bool, ListBoardError> {
    if task.completed_at.is_some() {
        return Ok(false);
    }

    match task.schedule_kind {
        ScheduleKind::None => Ok(false),
        ScheduleKind::DateOnly => {
            scheduling::effective_planning_lane_at(task, now, display_timezone)?;
            let Some(scheduled_date) = task.scheduled_local_date.as_deref() else {
                return Err(
                    SchedulingError::InconsistentStoredSchedule(ScheduleKind::DateOnly).into(),
                );
            };
            Ok(scheduled_date < display_local_date(now, display_timezone)?.as_str())
        }
        ScheduleKind::LocalDateTime => Ok(matches!(
            scheduling::focus_eligibility_at(task, now, display_timezone)?,
            FocusEligibility::Eligible
        )),
    }
}

fn project_task(
    conn: &Connection,
    list_rank: u32,
    task: TaskRecord,
    list_title: String,
    list_color: Option<String>,
    now: Timestamp,
    display_timezone: &str,
) -> Result<ProjectedTask, ListBoardError> {
    let time_taken_seconds = task_time_taken_seconds(conn, task.id)?.to_string();
    let is_overdue = task_is_overdue_at(&task, now, display_timezone)?;
    Ok(ProjectedTask {
        list_rank,
        task,
        list_title,
        list_color,
        time_taken_seconds,
        is_overdue,
    })
}

pub fn load_at(
    conn: &Connection,
    list_id: Option<ListId>,
    now: Timestamp,
    fallback_display_timezone: &str,
) -> Result<ListBoardSnapshot, ListBoardError> {
    let lists = active_lists(conn)?;
    let selected_lists = match list_id {
        Some(id) => vec![lists
            .iter()
            .find(|list| list.id == id)
            .cloned()
            .ok_or(ListBoardError::TargetListNotFound(id))?],
        None => lists,
    };

    let target = match list_id {
        Some(id) => {
            let list = selected_lists
                .first()
                .ok_or(ListBoardError::TargetListNotFound(id))?;
            ListBoardTarget {
                kind: ListBoardTargetKind::List,
                id: Some(list.id),
                title: list.title.clone(),
                color: list.color.clone(),
            }
        }
        None => ListBoardTarget {
            kind: ListBoardTargetKind::AllLists,
            id: None,
            title: "All Lists".to_owned(),
            color: None,
        },
    };

    let display_timezone = selected_timezone(conn, fallback_display_timezone)?;
    let mut seen = HashSet::new();
    let mut backlog = LaneAccumulator::default();
    let mut this_week = LaneAccumulator::default();
    let mut today = LaneAccumulator::default();
    let mut done = LaneAccumulator::default();

    for list in selected_lists {
        for manual_lane in ACTIVE_MANUAL_LANES {
            for task in active_tasks_in_bucket(conn, list.id, manual_lane)? {
                if !seen.insert(task.id) {
                    return Err(ListBoardError::DuplicateTaskProjection(task.id));
                }
                let effective_lane =
                    scheduling::effective_planning_lane_at(&task, now, &display_timezone)?;
                let projected = project_task(
                    conn,
                    list.sort_rank,
                    task,
                    list.title.clone(),
                    list.color.clone(),
                    now,
                    &display_timezone,
                )?;
                match effective_lane {
                    PlanningLane::Backlog => backlog.push(projected),
                    PlanningLane::ThisWeek => this_week.push(projected),
                    PlanningLane::Today => today.push(projected),
                }
            }
        }

        for task in completed_tasks_for_list(conn, list.id)? {
            if !seen.insert(task.id) {
                return Err(ListBoardError::DuplicateTaskProjection(task.id));
            }
            done.push(project_task(
                conn,
                list.sort_rank,
                task,
                list.title.clone(),
                list.color.clone(),
                now,
                &display_timezone,
            )?);
        }
    }

    Ok(ListBoardSnapshot {
        target,
        display_timezone,
        backlog: backlog.finish()?,
        this_week: this_week.finish()?,
        today: today.finish()?,
        done: done.finish()?,
    })
}

fn app_database(app_handle: &tauri::AppHandle) -> CommandResult<Connection> {
    let app_dir: PathBuf = app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "LIST_BOARD_FAILED",
            format!("failed to resolve Narro app-data directory for list board: {error}"),
        )
    })?;
    let connection = Connection::open(app_dir.join("narro.db")).map_err(|error| {
        CommandError::new(
            "LIST_BOARD_FAILED",
            format!("failed to open the Narro database for list board: {error}"),
        )
    })?;
    persistence::configure_connection(&connection).map_err(|error| {
        CommandError::new(
            "LIST_BOARD_FAILED",
            format!("failed to configure the Narro database for list board: {error}"),
        )
    })?;
    Ok(connection)
}

#[tauri::command(rename_all = "camelCase")]
pub fn get_list_board_snapshot(
    app_handle: tauri::AppHandle,
    list_id: Option<String>,
    display_timezone: String,
) -> CommandResult<ListBoardSnapshot> {
    let parsed_list_id = list_id
        .as_deref()
        .map(ListId::parse_str)
        .transpose()
        .map_err(|_| CommandError::invalid_argument("listId", "must be a valid UUID"))?;
    let connection = app_database(&app_handle)?;
    load_at(
        &connection,
        parsed_list_id,
        Timestamp::now(),
        &display_timezone,
    )
    .map_err(|error| CommandError::new("LIST_BOARD_FAILED", error.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::tasks::{NewTaskInput, SetTaskTimeTakenInput};
    use crate::persistence::lists::{archive_list, create_list};
    use crate::persistence::run_migrations;
    use crate::persistence::task_metadata::set_task_time_taken;
    use crate::persistence::tasks::{complete_task, create_task};

    const T0: &str = "2026-09-08T08:00:00Z";
    const T1: &str = "2026-09-08T09:00:00Z";

    fn setup() -> Connection {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");
        run_migrations(&mut conn).expect("run migrations");
        conn
    }

    fn create_named_list(conn: &mut Connection, title: &str, color: Option<&str>) -> ListId {
        create_list(
            conn,
            NewListInput {
                title: title.to_owned(),
                color: color.map(str::to_owned),
                icon_asset: None,
            },
            T0,
        )
        .expect("create list")
        .id
    }

    fn add_task(
        conn: &mut Connection,
        list_id: ListId,
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
    fn empty_all_lists_board_has_four_empty_lanes() {
        let conn = setup();
        let board = load_at(&conn, None, now(), "Europe/Athens").expect("load board");
        assert_eq!(board.target.kind, ListBoardTargetKind::AllLists);
        assert_eq!(board.target.title, "All Lists");
        assert_eq!(board.backlog.count, 0);
        assert_eq!(board.this_week.count, 0);
        assert_eq!(board.today.count, 0);
        assert_eq!(board.done.count, 0);
    }

    #[test]
    fn individual_board_projects_active_and_completed_tasks_without_identity_duplication() {
        let mut conn = setup();
        let list_id = create_named_list(&mut conn, "Work", Some("#48d6c5"));
        let backlog = add_task(
            &mut conn,
            list_id,
            "Backlog",
            PlanningLane::Backlog,
            Some(600),
        );
        let week = add_task(
            &mut conn,
            list_id,
            "Week",
            PlanningLane::ThisWeek,
            Some(1200),
        );
        let today = add_task(&mut conn, list_id, "Today", PlanningLane::Today, Some(1800));
        let done = add_task(&mut conn, list_id, "Done", PlanningLane::Today, Some(2400));
        complete_task(&mut conn, done, T1).expect("complete task");

        let board = load_at(&conn, Some(list_id), now(), "Europe/Athens").expect("load board");
        assert_eq!(board.target.id, Some(list_id));
        assert_eq!(board.backlog.tasks[0].id, backlog);
        assert_eq!(board.this_week.tasks[0].id, week);
        assert_eq!(board.today.tasks[0].id, today);
        assert_eq!(board.done.tasks[0].id, done);
        assert_eq!(board.today.aggregate_est_seconds, 1800);
        assert_eq!(board.done.aggregate_est_seconds, 2400);
        assert_eq!(board.today.tasks[0].time_taken_seconds, "0");
        assert!(board.today.tasks[0].recurrence_rule_id.is_none());
        assert!(board.today.tasks[0].recurrence_parent_task_id.is_none());
        assert!(!board.today.tasks[0].is_overdue);
        assert!(!board.done.tasks[0].is_overdue);

        let projected: HashSet<TaskId> = board
            .backlog
            .tasks
            .iter()
            .chain(board.this_week.tasks.iter())
            .chain(board.today.tasks.iter())
            .chain(board.done.tasks.iter())
            .map(|task| task.id)
            .collect();
        assert_eq!(projected.len(), 4);
    }

    #[test]
    fn scheduled_task_uses_m4_effective_lane_without_mutating_manual_lane() {
        let mut conn = setup();
        let list_id = create_named_list(&mut conn, "Scheduled", None);
        let task_id = add_task(
            &mut conn,
            list_id,
            "Scheduled today",
            PlanningLane::Backlog,
            Some(900),
        );
        conn.execute(
            "UPDATE tasks
             SET schedule_kind = 'date_only', scheduled_local_date = '2026-09-08'
             WHERE id = ?1",
            [task_id.to_string()],
        )
        .expect("schedule task in deterministic fixture");

        let board = load_at(&conn, Some(list_id), now(), "Europe/Athens").expect("load board");
        assert!(board.backlog.tasks.is_empty());
        assert_eq!(board.today.tasks.len(), 1);
        assert_eq!(board.today.tasks[0].id, task_id);
        assert_eq!(
            board.today.tasks[0].scheduled_local_date.as_deref(),
            Some("2026-09-08")
        );
        assert!(board.today.tasks[0].scheduled_local_time.is_none());
        assert!(!board.today.tasks[0].is_overdue);
        assert_eq!(
            get_task(&conn, task_id).expect("reload task").manual_lane,
            PlanningLane::Backlog
        );
    }

    #[test]
    fn overdue_and_time_taken_are_authoritative_read_metadata() {
        let mut conn = setup();
        let list_id = create_named_list(&mut conn, "Work", None);
        let task_id = add_task(
            &mut conn,
            list_id,
            "Past due",
            PlanningLane::Backlog,
            Some(900),
        );
        conn.execute(
            "UPDATE tasks
             SET schedule_kind = 'date_only', scheduled_local_date = '2026-09-07'
             WHERE id = ?1",
            [task_id.to_string()],
        )
        .expect("schedule overdue task");
        set_task_time_taken(
            &mut conn,
            task_id,
            SetTaskTimeTakenInput { total_seconds: 375 },
            T1,
        )
        .expect("set durable Time Taken");

        let board = load_at(&conn, Some(list_id), now(), "Europe/Athens").expect("load board");
        assert_eq!(board.today.tasks.len(), 1);
        let projected = &board.today.tasks[0];
        assert_eq!(projected.id, task_id);
        assert_eq!(projected.time_taken_seconds, "375");
        assert_eq!(
            projected.scheduled_local_date.as_deref(),
            Some("2026-09-07")
        );
        assert!(projected.is_overdue);
    }

    #[test]
    fn future_timed_today_is_scheduled_but_not_overdue() {
        let mut conn = setup();
        let list_id = create_named_list(&mut conn, "Work", None);
        let task_id = add_task(
            &mut conn,
            list_id,
            "Later today",
            PlanningLane::Backlog,
            None,
        );
        conn.execute(
            "UPDATE tasks
             SET schedule_kind = 'local_datetime',
                 scheduled_local_date = '2026-09-08',
                 scheduled_local_time = '15:00',
                 schedule_timezone = 'Europe/Athens'
             WHERE id = ?1",
            [task_id.to_string()],
        )
        .expect("schedule future timed task");

        let board = load_at(&conn, Some(list_id), now(), "Europe/Athens").expect("load board");
        let projected = &board.today.tasks[0];
        assert_eq!(projected.scheduled_local_time.as_deref(), Some("15:00"));
        assert!(!projected.is_overdue);
    }

    #[test]
    fn all_lists_is_aggregate_view_over_active_lists_only() {
        let mut conn = setup();
        let work = create_named_list(&mut conn, "Work", Some("#48d6c5"));
        let personal = create_named_list(&mut conn, "Personal", Some("#b7d96d"));
        let archived = create_named_list(&mut conn, "Archived", None);
        archive_list(&mut conn, archived, T1).expect("archive list");

        let work_task = add_task(
            &mut conn,
            work,
            "Work today",
            PlanningLane::Today,
            Some(600),
        );
        let personal_task = add_task(
            &mut conn,
            personal,
            "Personal today",
            PlanningLane::Today,
            Some(1200),
        );

        let board = load_at(&conn, None, now(), "Europe/Athens").expect("load aggregate board");
        assert_eq!(board.today.count, 2);
        assert_eq!(board.today.aggregate_est_seconds, 1800);
        assert_eq!(board.today.tasks[0].id, work_task);
        assert_eq!(board.today.tasks[0].list_title, "Work");
        assert_eq!(board.today.tasks[1].id, personal_task);
        assert_eq!(board.today.tasks[1].list_title, "Personal");
    }

    #[test]
    fn inactive_target_and_invalid_timezone_fail_closed() {
        let mut conn = setup();
        let archived = create_named_list(&mut conn, "Archived", None);
        archive_list(&mut conn, archived, T1).expect("archive list");

        let missing = load_at(&conn, Some(archived), now(), "Europe/Athens")
            .expect_err("archived target must fail");
        assert!(matches!(missing, ListBoardError::TargetListNotFound(id) if id == archived));

        let timezone = load_at(&conn, None, now(), "not/a-zone")
            .expect_err("invalid display timezone must fail");
        assert!(matches!(
            timezone,
            ListBoardError::Scheduling(SchedulingError::InvalidTimezone(_))
        ));
    }
}
