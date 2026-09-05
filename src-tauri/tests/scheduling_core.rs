use chrono::{NaiveDate, NaiveDateTime};
use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::tasks::NewTaskInput;
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::task_metadata::set_task_schedule;
use narro_lib::persistence::tasks::{create_task, get_task};
use narro_lib::scheduling::{
    effective_planning_lane, focus_eligibility, resolve_schedule_shortcut, FocusEligibility,
    ScheduleShortcut,
};
use rusqlite::Connection;

const T0: &str = "2026-09-09T07:00:00Z";
const T1: &str = "2026-09-09T07:01:00Z";
const T2: &str = "2026-09-09T07:02:00Z";

fn date(value: &str) -> NaiveDate {
    NaiveDate::parse_from_str(value, "%Y-%m-%d").unwrap()
}

fn datetime(value: &str) -> NaiveDateTime {
    NaiveDateTime::parse_from_str(value, "%Y-%m-%d %H:%M:%S").unwrap()
}

fn fixture() -> (Connection, narro_lib::domain::ids::TaskId) {
    let mut conn = Connection::open_in_memory().expect("open database");
    run_migrations(&mut conn).expect("migrate database");
    let list = create_list(
        &mut conn,
        NewListInput {
            title: "Scheduling".into(),
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
            title: "Scheduled task".into(),
            manual_lane: PlanningLane::Backlog,
            est_seconds: None,
        },
        T0,
    )
    .expect("create task");
    (conn, task.id)
}

#[test]
fn persisted_schedule_changes_effective_lane_without_rewriting_identity_or_manual_lane() {
    let (mut conn, task_id) = fixture();
    let schedule = resolve_schedule_shortcut(
        ScheduleShortcut::CustomDate {
            local_date: "2026-09-11".into(),
        },
        datetime("2026-09-09 10:00:00"),
        "Europe/Athens",
    )
    .expect("resolve custom date");
    let scheduled = set_task_schedule(&mut conn, task_id, schedule, T1).expect("persist schedule");

    assert_eq!(scheduled.id, task_id);
    assert_eq!(scheduled.manual_lane, PlanningLane::Backlog);
    assert_eq!(
        effective_planning_lane(&scheduled, date("2026-09-09")).unwrap(),
        PlanningLane::ThisWeek
    );
    assert_eq!(
        effective_planning_lane(&scheduled, date("2026-09-11")).unwrap(),
        PlanningLane::Today
    );

    let stored = get_task(&conn, task_id).expect("reload task");
    assert_eq!(stored.id, task_id);
    assert_eq!(stored.manual_lane, PlanningLane::Backlog);
    let task_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM tasks", [], |row| row.get(0))
        .expect("count tasks");
    assert_eq!(task_count, 1);
}

#[test]
fn later_today_persists_as_local_datetime_and_gates_focus_until_due() {
    let (mut conn, task_id) = fixture();
    let schedule = resolve_schedule_shortcut(
        ScheduleShortcut::LaterToday,
        datetime("2026-09-09 10:00:00"),
        "Europe/Athens",
    )
    .expect("resolve later today");
    let scheduled = set_task_schedule(&mut conn, task_id, schedule, T1).expect("persist schedule");

    assert_eq!(
        scheduled.scheduled_local_date.as_deref(),
        Some("2026-09-09")
    );
    assert_eq!(scheduled.scheduled_local_time.as_deref(), Some("12:00"));
    assert_eq!(
        scheduled.schedule_timezone.as_deref(),
        Some("Europe/Athens")
    );
    assert_eq!(
        effective_planning_lane(&scheduled, date("2026-09-09")).unwrap(),
        PlanningLane::Today
    );
    assert_eq!(
        focus_eligibility(&scheduled, datetime("2026-09-09 11:59:59")).unwrap(),
        FocusEligibility::FutureScheduledTime
    );
    assert_eq!(
        focus_eligibility(&scheduled, datetime("2026-09-09 12:00:00")).unwrap(),
        FocusEligibility::Eligible
    );
}

#[test]
fn changing_schedule_reuses_same_task_and_clearing_restores_manual_lane_projection() {
    let (mut conn, task_id) = fixture();
    let today = resolve_schedule_shortcut(
        ScheduleShortcut::Today,
        datetime("2026-09-09 10:00:00"),
        "Europe/Athens",
    )
    .unwrap();
    let first = set_task_schedule(&mut conn, task_id, today, T1).unwrap();
    assert_eq!(
        effective_planning_lane(&first, date("2026-09-09")).unwrap(),
        PlanningLane::Today
    );

    let next_week = resolve_schedule_shortcut(
        ScheduleShortcut::NextWeek,
        datetime("2026-09-09 10:00:00"),
        "Europe/Athens",
    )
    .unwrap();
    let second = set_task_schedule(&mut conn, task_id, next_week, T2).unwrap();
    assert_eq!(second.id, task_id);
    assert_eq!(
        effective_planning_lane(&second, date("2026-09-09")).unwrap(),
        PlanningLane::Backlog
    );

    let cleared = set_task_schedule(
        &mut conn,
        task_id,
        narro_lib::domain::tasks::TaskSchedule::None,
        T2,
    )
    .unwrap();
    assert_eq!(cleared.id, task_id);
    assert_eq!(cleared.manual_lane, PlanningLane::Backlog);
    assert_eq!(
        effective_planning_lane(&cleared, date("2026-09-09")).unwrap(),
        PlanningLane::Backlog
    );

    let ids: Vec<String> = conn
        .prepare("SELECT id FROM tasks ORDER BY id")
        .unwrap()
        .query_map([], |row| row.get(0))
        .unwrap()
        .collect::<Result<_, _>>()
        .unwrap();
    assert_eq!(ids, vec![task_id.to_string()]);
}
