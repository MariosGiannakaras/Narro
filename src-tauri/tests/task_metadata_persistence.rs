use narro_lib::domain::ids::{ListId, SessionId, TaskId};
use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::{PlanningLane, ScheduleKind};
use narro_lib::domain::tasks::{NewTaskInput, SetTaskTimeTakenInput, TaskSchedule};
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::task_metadata::{
    set_task_schedule, set_task_time_taken, task_time_taken_seconds,
};
use narro_lib::persistence::tasks::{create_task, get_task};
use rusqlite::{params, Connection};
use std::fs;
use uuid::Uuid;

const T1: &str = "2026-09-03T15:00:00Z";
const T2: &str = "2026-09-03T15:01:00Z";
const T3: &str = "2026-09-03T15:02:00Z";

fn create_test_list(conn: &mut Connection) -> ListId {
    create_list(
        conn,
        NewListInput {
            title: "Inbox".into(),
            color: None,
            icon_asset: None,
        },
        T1,
    )
    .expect("create list")
    .id
}

fn insert_work_session(conn: &Connection, task_id: TaskId, seconds: i64) {
    conn.execute(
        "INSERT INTO sessions (
            id, task_id, kind, started_at, ended_at,
            duration_seconds, source, created_at, updated_at
         ) VALUES (?1, ?2, 'work', ?3, ?3, ?4, 'focus', ?3, ?3)",
        params![
            SessionId::generate().to_string(),
            task_id.to_string(),
            T1,
            seconds
        ],
    )
    .expect("insert work session");
}

#[test]
fn task_schedule_and_time_taken_adjustment_survive_database_reopen() {
    let path = std::env::temp_dir().join(format!("narro-task-metadata-{}.db", Uuid::new_v4()));
    let task_id;

    {
        let mut conn = Connection::open(&path).expect("open temporary database");
        run_migrations(&mut conn).expect("migrate temporary database");
        let list_id = create_test_list(&mut conn);
        task_id = create_task(
            &mut conn,
            NewTaskInput {
                list_id,
                title: "Persist metadata".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: Some(1800),
            },
            T1,
        )
        .expect("create task")
        .id;

        insert_work_session(&conn, task_id, 300);
        set_task_time_taken(
            &mut conn,
            task_id,
            SetTaskTimeTakenInput { total_seconds: 240 },
            T2,
        )
        .expect("set Time Taken");
        set_task_schedule(
            &mut conn,
            task_id,
            TaskSchedule::LocalDateTime {
                local_date: "2026-09-05".into(),
                local_time: "09:30".into(),
                timezone: "Europe/Athens".into(),
            },
            T3,
        )
        .expect("set schedule");
    }

    {
        let mut reopened = Connection::open(&path).expect("reopen temporary database");
        run_migrations(&mut reopened).expect("re-run migrations after reopen");
        let persisted = get_task(&reopened, task_id).expect("load persisted task");
        assert_eq!(persisted.manual_time_adjustment_seconds, -60);
        assert_eq!(
            task_time_taken_seconds(&reopened, task_id).expect("load Time Taken"),
            240
        );
        assert_eq!(persisted.schedule_kind, ScheduleKind::LocalDateTime);
        assert_eq!(persisted.scheduled_local_date.as_deref(), Some("2026-09-05"));
        assert_eq!(persisted.scheduled_local_time.as_deref(), Some("09:30"));
        assert_eq!(persisted.schedule_timezone.as_deref(), Some("Europe/Athens"));
    }

    fs::remove_file(path).expect("remove temporary database");
}
