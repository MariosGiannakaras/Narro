use narro_lib::domain::ids::{ListId, SessionId, TaskId};
use narro_lib::domain::lists::ListRecord;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::tasks::TaskRecord;
use narro_lib::persistence::lists::get_list;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::tasks::get_task;
use rusqlite::{params, Connection};
use uuid::Uuid;

pub const CREATED_AT: &str = "2026-09-03T21:00:00Z";
pub const MUTATED_AT: &str = "2026-09-03T21:01:00Z";
pub const MUTATED_AGAIN_AT: &str = "2026-09-03T21:02:00Z";

const LIST_NAMESPACE: u128 = 0x1000_0000_0000_0000_0000_0000_0000_0000;
const TASK_NAMESPACE: u128 = 0x2000_0000_0000_0000_0000_0000_0000_0000;
const SESSION_NAMESPACE: u128 = 0x3000_0000_0000_0000_0000_0000_0000_0000;

fn fixture_uuid(namespace: u128, slot: u64) -> Uuid {
    Uuid::from_u128(namespace | u128::from(slot))
}

pub fn list_id(slot: u64) -> ListId {
    ListId::from_uuid(fixture_uuid(LIST_NAMESPACE, slot))
}

pub fn task_id(slot: u64) -> TaskId {
    TaskId::from_uuid(fixture_uuid(TASK_NAMESPACE, slot))
}

pub fn session_id(slot: u64) -> SessionId {
    SessionId::from_uuid(fixture_uuid(SESSION_NAMESPACE, slot))
}

pub fn migrated() -> Connection {
    let mut conn = Connection::open_in_memory().expect("open deterministic fixture database");
    run_migrations(&mut conn).expect("migrate deterministic fixture database");
    conn
}

#[derive(Debug, Clone)]
pub struct ListFixture {
    pub id: ListId,
    pub title: String,
    pub sort_rank: u32,
    pub archived_at: Option<String>,
}

impl ListFixture {
    pub fn new(slot: u64, title: impl Into<String>) -> Self {
        Self {
            id: list_id(slot),
            title: title.into(),
            sort_rank: u32::try_from(slot).expect("fixture list slot fits u32"),
            archived_at: None,
        }
    }

    pub fn archived(mut self, at: &str) -> Self {
        self.archived_at = Some(at.to_owned());
        self
    }

    pub fn insert(&self, conn: &Connection) -> ListRecord {
        conn.execute(
            "INSERT INTO lists (
                id, title, sort_rank, archived_at, created_at, updated_at
             ) VALUES (?1, ?2, ?3, ?4, ?5, ?5)",
            params![
                self.id.to_string(),
                self.title,
                i64::from(self.sort_rank),
                self.archived_at,
                CREATED_AT
            ],
        )
        .expect("insert deterministic list fixture");
        get_list(conn, self.id).expect("decode deterministic list fixture")
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum FixtureSchedule {
    None,
    DateOnly {
        local_date: String,
    },
    LocalDateTime {
        local_date: String,
        local_time: String,
        timezone: String,
    },
}

impl FixtureSchedule {
    fn columns(&self) -> (&'static str, Option<&str>, Option<&str>, Option<&str>) {
        match self {
            Self::None => ("none", None, None, None),
            Self::DateOnly { local_date } => ("date_only", Some(local_date), None, None),
            Self::LocalDateTime {
                local_date,
                local_time,
                timezone,
            } => (
                "local_datetime",
                Some(local_date),
                Some(local_time),
                Some(timezone),
            ),
        }
    }
}

#[derive(Debug, Clone)]
pub struct TaskFixture {
    pub id: TaskId,
    pub list_id: ListId,
    pub title: String,
    pub lane: PlanningLane,
    pub sort_rank: u32,
    pub est_seconds: Option<u32>,
    pub schedule: FixtureSchedule,
    pub completed_at: Option<String>,
    pub archived_at: Option<String>,
}

impl TaskFixture {
    pub fn new(
        slot: u64,
        list_id: ListId,
        title: impl Into<String>,
        lane: PlanningLane,
    ) -> Self {
        Self {
            id: task_id(slot),
            list_id,
            title: title.into(),
            lane,
            sort_rank: u32::try_from(slot).expect("fixture task slot fits u32"),
            est_seconds: Some(900),
            schedule: FixtureSchedule::None,
            completed_at: None,
            archived_at: None,
        }
    }

    pub fn rank(mut self, rank: u32) -> Self {
        self.sort_rank = rank;
        self
    }

    pub fn date_only(mut self, local_date: &str) -> Self {
        self.schedule = FixtureSchedule::DateOnly {
            local_date: local_date.to_owned(),
        };
        self
    }

    pub fn local_datetime(mut self, local_date: &str, local_time: &str, timezone: &str) -> Self {
        self.schedule = FixtureSchedule::LocalDateTime {
            local_date: local_date.to_owned(),
            local_time: local_time.to_owned(),
            timezone: timezone.to_owned(),
        };
        self
    }

    pub fn completed(mut self, at: &str) -> Self {
        self.completed_at = Some(at.to_owned());
        self
    }

    pub fn archived(mut self, at: &str) -> Self {
        self.archived_at = Some(at.to_owned());
        self
    }

    pub fn insert(&self, conn: &Connection) -> TaskRecord {
        let (schedule_kind, local_date, local_time, timezone) = self.schedule.columns();
        conn.execute(
            "INSERT INTO tasks (
                id, list_id, title, manual_lane, sort_rank, est_seconds,
                schedule_kind, scheduled_local_date, scheduled_local_time, schedule_timezone,
                completed_at, archived_at, created_at, updated_at
             ) VALUES (
                ?1, ?2, ?3, ?4, ?5, ?6,
                ?7, ?8, ?9, ?10,
                ?11, ?12, ?13, ?13
             )",
            params![
                self.id.to_string(),
                self.list_id.to_string(),
                self.title,
                self.lane.as_str(),
                i64::from(self.sort_rank),
                self.est_seconds.map(i64::from),
                schedule_kind,
                local_date,
                local_time,
                timezone,
                self.completed_at,
                self.archived_at,
                CREATED_AT
            ],
        )
        .expect("insert deterministic task fixture");
        get_task(conn, self.id).expect("decode deterministic task fixture")
    }
}

pub fn insert_work_session(conn: &Connection, slot: u64, task_id: TaskId, seconds: u32) {
    conn.execute(
        "INSERT INTO sessions (
            id, task_id, kind, started_at, ended_at, duration_seconds,
            source, created_at, updated_at
         ) VALUES (?1, ?2, 'work', ?3, ?4, ?5, 'focus', ?3, ?4)",
        params![
            session_id(slot).to_string(),
            task_id.to_string(),
            CREATED_AT,
            MUTATED_AT,
            i64::from(seconds)
        ],
    )
    .expect("insert deterministic work-session fixture");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fixture_ids_are_stable_and_namespaced() {
        assert_eq!(
            list_id(1).to_string(),
            "10000000-0000-0000-0000-000000000001"
        );
        assert_eq!(
            task_id(1).to_string(),
            "20000000-0000-0000-0000-000000000001"
        );
        assert_eq!(
            session_id(1).to_string(),
            "30000000-0000-0000-0000-000000000001"
        );
    }
}
