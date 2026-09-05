use chrono::{NaiveDate, NaiveDateTime};
use jiff::Timestamp;
use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::tasks::{NewTaskInput, TaskSchedule};
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::task_metadata::{set_task_schedule, TaskMetadataError};
use narro_lib::persistence::tasks::{create_task, get_task};
use narro_lib::scheduling::{
    effective_planning_lane, effective_planning_lane_at, focus_eligibility_at,
    resolve_schedule_shortcut, FocusEligibility, ScheduleShortcut,
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

fn timestamp(value: &str) -> Timestamp {
    value.parse().unwrap()
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
        effective_planning_lane_at(
            &scheduled,
            timestamp("2026-09-09T08:59:59Z"),
            "Europe/Athens"
        )
        .unwrap(),
        PlanningLane::Today
    );
    assert_eq!(
        focus_eligibility_at(
            &scheduled,
            timestamp("2026-09-09T08:59:59Z"),
            "Europe/Athens"
        )
        .unwrap(),
        FocusEligibility::FutureScheduledTime
    );
    assert_eq!(
        focus_eligibility_at(
            &scheduled,
            timestamp("2026-09-09T09:00:00Z"),
            "Europe/Athens"
        )
        .unwrap(),
        FocusEligibility::Eligible
    );
}

#[test]
fn configured_timezone_change_reprojects_timed_schedule_without_changing_its_instant() {
    let (mut conn, task_id) = fixture();
    let scheduled = set_task_schedule(
        &mut conn,
        task_id,
        TaskSchedule::LocalDateTime {
            local_date: "2026-09-10".into(),
            local_time: "00:30".into(),
            timezone: "Europe/Athens".into(),
        },
        T1,
    )
    .expect("persist timed schedule");
    let now = timestamp("2026-09-09T20:00:00Z");

    assert_eq!(
        effective_planning_lane_at(&scheduled, now, "Europe/Athens").unwrap(),
        PlanningLane::ThisWeek
    );
    assert_eq!(
        effective_planning_lane_at(&scheduled, now, "America/New_York").unwrap(),
        PlanningLane::Today
    );
    assert_eq!(
        focus_eligibility_at(&scheduled, now, "America/New_York").unwrap(),
        FocusEligibility::FutureScheduledTime
    );
    assert_eq!(
        scheduled.schedule_timezone.as_deref(),
        Some("Europe/Athens")
    );
}

#[test]
fn invalid_timezone_and_dst_gap_fold_fail_before_persistence_changes() {
    let (mut conn, task_id) = fixture();

    for (local_date, local_time, timezone, expected) in [
        ("2026-09-09", "12:00", "Europe/Atlantis", "timezone"),
        ("2026-03-08", "02:30", "America/New_York", "ambiguity"),
        ("2026-11-01", "01:30", "America/New_York", "ambiguity"),
    ] {
        let result = set_task_schedule(
            &mut conn,
            task_id,
            TaskSchedule::LocalDateTime {
                local_date: local_date.into(),
                local_time: local_time.into(),
                timezone: timezone.into(),
            },
            T1,
        );
        match expected {
            "timezone" => assert!(matches!(
                result,
                Err(TaskMetadataError::InvalidScheduleTimezone)
            )),
            "ambiguity" => assert!(matches!(
                result,
                Err(TaskMetadataError::AmbiguousScheduleLocalDateTime)
            )),
            _ => unreachable!(),
        }
        let stored = get_task(&conn, task_id).expect("reload unchanged task");
        assert_eq!(stored.id, task_id);
        assert!(stored.scheduled_local_date.is_none());
        assert!(stored.scheduled_local_time.is_none());
        assert!(stored.schedule_timezone.is_none());
    }
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

    let cleared = set_task_schedule(&mut conn, task_id, TaskSchedule::None, T2).unwrap();
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
