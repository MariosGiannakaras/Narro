use chrono::NaiveDate;
use jiff::Timestamp;
use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::tasks::{NewTaskInput, TaskSchedule};
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::task_metadata::set_task_schedule;
use narro_lib::persistence::tasks::{create_task, get_task};
use narro_lib::scheduling::{effective_planning_lane, effective_planning_lane_at};
use rusqlite::Connection;

const T0: &str = "2026-09-12T18:00:00Z";
const T1: &str = "2026-09-12T18:01:00Z";

fn date(value: &str) -> NaiveDate {
    NaiveDate::parse_from_str(value, "%Y-%m-%d").expect("parse test date")
}

fn timestamp(value: &str) -> Timestamp {
    value.parse().expect("parse test timestamp")
}

fn fixture() -> (Connection, narro_lib::domain::ids::TaskId) {
    let mut conn = Connection::open_in_memory().expect("open database");
    run_migrations(&mut conn).expect("migrate database");
    let list = create_list(
        &mut conn,
        NewListInput {
            title: "Weekend scheduling".into(),
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
            title: "Sunday task".into(),
            manual_lane: PlanningLane::Backlog,
            est_seconds: None,
        },
        T0,
    )
    .expect("create task");
    (conn, task.id)
}

#[test]
fn persisted_sunday_date_only_schedule_never_gains_a_timezone_or_changes_calendar_date() {
    let (mut conn, task_id) = fixture();
    let scheduled = set_task_schedule(
        &mut conn,
        task_id,
        TaskSchedule::DateOnly {
            local_date: "2026-09-13".into(),
        },
        T1,
    )
    .expect("persist Sunday date-only schedule");

    assert_eq!(scheduled.id, task_id);
    assert_eq!(
        scheduled.scheduled_local_date.as_deref(),
        Some("2026-09-13")
    );
    assert!(scheduled.scheduled_local_time.is_none());
    assert!(scheduled.schedule_timezone.is_none());

    let same_instant = timestamp("2026-09-12T21:30:00Z");
    assert_eq!(
        effective_planning_lane_at(&scheduled, same_instant, "Europe/Athens").unwrap(),
        PlanningLane::Today
    );
    assert_eq!(
        effective_planning_lane_at(&scheduled, same_instant, "America/New_York").unwrap(),
        PlanningLane::ThisWeek
    );

    let stored = get_task(&conn, task_id).expect("reload scheduled task");
    assert_eq!(stored.id, task_id);
    assert_eq!(
        stored.scheduled_local_date.as_deref(),
        Some("2026-09-13")
    );
    assert!(stored.scheduled_local_time.is_none());
    assert!(stored.schedule_timezone.is_none());
}

#[test]
fn monday_rollover_keeps_overdue_weekend_date_today_without_rewriting_identity() {
    let (mut conn, task_id) = fixture();
    let scheduled = set_task_schedule(
        &mut conn,
        task_id,
        TaskSchedule::DateOnly {
            local_date: "2026-09-13".into(),
        },
        T1,
    )
    .expect("persist Sunday date-only schedule");

    assert_eq!(
        effective_planning_lane(&scheduled, date("2026-09-12")).unwrap(),
        PlanningLane::ThisWeek
    );
    assert_eq!(
        effective_planning_lane(&scheduled, date("2026-09-13")).unwrap(),
        PlanningLane::Today
    );
    assert_eq!(
        effective_planning_lane(&scheduled, date("2026-09-14")).unwrap(),
        PlanningLane::Today
    );

    let ids: Vec<String> = conn
        .prepare("SELECT id FROM tasks ORDER BY id")
        .expect("prepare task identity query")
        .query_map([], |row| row.get(0))
        .expect("query task identities")
        .collect::<Result<_, _>>()
        .expect("collect task identities");
    assert_eq!(ids, vec![task_id.to_string()]);
}
