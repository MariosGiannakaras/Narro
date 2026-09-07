use crate::domain::ids::{ListId, TaskId};
use crate::domain::model::PlanningLane;
use crate::persistence::lists::{active_lists, ListStoreError};
use crate::persistence::tasks::{active_tasks_in_bucket, TaskStoreError};
use rusqlite::Connection;
use serde::Serialize;
use std::fmt::{Display, Formatter};

const PREVIEW_TASK_LIMIT: usize = 4;
const HOME_LANE_ORDER: [PlanningLane; 3] = [
    PlanningLane::Today,
    PlanningLane::ThisWeek,
    PlanningLane::Backlog,
];

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HomeTaskPreview {
    pub id: TaskId,
    pub title: String,
    pub est_seconds: Option<u32>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HomeListCard {
    pub id: ListId,
    pub title: String,
    pub color: Option<String>,
    pub icon_asset: Option<String>,
    pub preview_tasks: Vec<HomeTaskPreview>,
    pub pending_count: u64,
    pub aggregate_est_seconds: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HomeSnapshot {
    pub lists: Vec<HomeListCard>,
    pub pending_count: u64,
    pub aggregate_est_seconds: u64,
}

#[derive(Debug)]
pub enum HomeSnapshotError {
    Lists(ListStoreError),
    Tasks(TaskStoreError),
    PendingCountOverflow,
    EstimateOverflow,
}

impl Display for HomeSnapshotError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Lists(error) => Display::fmt(error, formatter),
            Self::Tasks(error) => Display::fmt(error, formatter),
            Self::PendingCountOverflow => {
                formatter.write_str("Home pending-task count exceeded the supported range")
            }
            Self::EstimateOverflow => {
                formatter.write_str("Home aggregate estimate exceeded the supported range")
            }
        }
    }
}

impl std::error::Error for HomeSnapshotError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Lists(error) => Some(error),
            Self::Tasks(error) => Some(error),
            Self::PendingCountOverflow | Self::EstimateOverflow => None,
        }
    }
}

impl From<ListStoreError> for HomeSnapshotError {
    fn from(value: ListStoreError) -> Self {
        Self::Lists(value)
    }
}

impl From<TaskStoreError> for HomeSnapshotError {
    fn from(value: TaskStoreError) -> Self {
        Self::Tasks(value)
    }
}

fn checked_task_count(count: usize) -> Result<u64, HomeSnapshotError> {
    u64::try_from(count).map_err(|_| HomeSnapshotError::PendingCountOverflow)
}

fn add_estimate(total: &mut u64, seconds: Option<u32>) -> Result<(), HomeSnapshotError> {
    if let Some(seconds) = seconds {
        *total = total
            .checked_add(u64::from(seconds))
            .ok_or(HomeSnapshotError::EstimateOverflow)?;
    }
    Ok(())
}

pub fn load(conn: &Connection) -> Result<HomeSnapshot, HomeSnapshotError> {
    let mut cards = Vec::new();
    let mut home_pending_count = 0_u64;
    let mut home_estimate = 0_u64;

    for list in active_lists(conn)? {
        let mut preview_tasks = Vec::with_capacity(PREVIEW_TASK_LIMIT);
        let mut pending_count = 0_u64;
        let mut aggregate_est_seconds = 0_u64;

        for lane in HOME_LANE_ORDER {
            let tasks = active_tasks_in_bucket(conn, list.id, lane)?;
            pending_count = pending_count
                .checked_add(checked_task_count(tasks.len())?)
                .ok_or(HomeSnapshotError::PendingCountOverflow)?;

            for task in tasks {
                add_estimate(&mut aggregate_est_seconds, task.est_seconds)?;
                if preview_tasks.len() < PREVIEW_TASK_LIMIT {
                    preview_tasks.push(HomeTaskPreview {
                        id: task.id,
                        title: task.title,
                        est_seconds: task.est_seconds,
                    });
                }
            }
        }

        home_pending_count = home_pending_count
            .checked_add(pending_count)
            .ok_or(HomeSnapshotError::PendingCountOverflow)?;
        home_estimate = home_estimate
            .checked_add(aggregate_est_seconds)
            .ok_or(HomeSnapshotError::EstimateOverflow)?;

        cards.push(HomeListCard {
            id: list.id,
            title: list.title,
            color: list.color,
            icon_asset: list.icon_asset,
            preview_tasks,
            pending_count,
            aggregate_est_seconds,
        });
    }

    Ok(HomeSnapshot {
        lists: cards,
        pending_count: home_pending_count,
        aggregate_est_seconds: home_estimate,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::{archive_list, create_list};
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::{complete_task, create_task};

    const T0: &str = "2026-09-07T10:00:00Z";
    const T1: &str = "2026-09-07T10:01:00Z";

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

    #[test]
    fn empty_database_returns_empty_home_snapshot() {
        let conn = setup();
        let snapshot = load(&conn).expect("load empty Home snapshot");
        assert!(snapshot.lists.is_empty());
        assert_eq!(snapshot.pending_count, 0);
        assert_eq!(snapshot.aggregate_est_seconds, 0);
    }

    #[test]
    fn snapshot_uses_active_lists_and_caps_preview_without_losing_totals() {
        let mut conn = setup();
        let work = create_named_list(&mut conn, "Work", Some("#39d6c7"));
        let personal = create_named_list(&mut conn, "Personal", None);
        let archived = create_named_list(&mut conn, "Archived", None);
        archive_list(&mut conn, archived, T1).expect("archive list");

        add_task(&mut conn, work, "Today one", PlanningLane::Today, Some(600));
        add_task(
            &mut conn,
            work,
            "Today two",
            PlanningLane::Today,
            Some(1200),
        );
        add_task(
            &mut conn,
            work,
            "This week one",
            PlanningLane::ThisWeek,
            Some(1800),
        );
        add_task(
            &mut conn,
            work,
            "This week two",
            PlanningLane::ThisWeek,
            Some(2400),
        );
        add_task(
            &mut conn,
            work,
            "Backlog one",
            PlanningLane::Backlog,
            Some(3000),
        );
        let completed = add_task(
            &mut conn,
            work,
            "Completed",
            PlanningLane::Today,
            Some(9999),
        );
        complete_task(&mut conn, completed, T1).expect("complete task");

        add_task(
            &mut conn,
            personal,
            "Personal backlog",
            PlanningLane::Backlog,
            None,
        );
        create_task(
            &mut conn,
            NewTaskInput {
                list_id: archived,
                title: "Archived task".to_owned(),
                manual_lane: PlanningLane::Today,
                est_seconds: Some(1234),
            },
            T0,
        )
        .expect_err("tasks cannot be created in archived lists");

        let snapshot = load(&conn).expect("load Home snapshot");
        assert_eq!(snapshot.lists.len(), 2);
        assert_eq!(snapshot.pending_count, 6);
        assert_eq!(snapshot.aggregate_est_seconds, 9000);

        let work_card = &snapshot.lists[0];
        assert_eq!(work_card.id, work);
        assert_eq!(work_card.title, "Work");
        assert_eq!(work_card.color.as_deref(), Some("#39d6c7"));
        assert_eq!(work_card.pending_count, 5);
        assert_eq!(work_card.aggregate_est_seconds, 9000);
        assert_eq!(work_card.preview_tasks.len(), 4);
        assert_eq!(
            work_card
                .preview_tasks
                .iter()
                .map(|task| task.title.as_str())
                .collect::<Vec<_>>(),
            vec!["Today one", "Today two", "This week one", "This week two"]
        );

        let personal_card = &snapshot.lists[1];
        assert_eq!(personal_card.id, personal);
        assert_eq!(personal_card.pending_count, 1);
        assert_eq!(personal_card.aggregate_est_seconds, 0);
        assert_eq!(personal_card.preview_tasks[0].title, "Personal backlog");
    }
}
