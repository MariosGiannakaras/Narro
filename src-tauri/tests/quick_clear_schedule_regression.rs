mod support;

use narro_lib::domain::model::{PlanningLane, RecurrenceUnit, ScheduleKind};
use narro_lib::domain::preferences::PreferencesPayload;
use narro_lib::domain::recurrence::NewRecurrenceRuleInput;
use narro_lib::domain::tasks::{TaskRecord, TaskSchedule};
use narro_lib::persistence::preferences::save_preferences;
use narro_lib::persistence::recurrence::create_recurrence_rule;
use narro_lib::persistence::task_schedule_edit::{
    quick_clear_task_schedule_if_expected as clear, update_task_schedule_if_expected,
    QuickClearTaskScheduleRequest, TaskScheduleEditError,
};
use narro_lib::persistence::tasks::{active_tasks_in_bucket, get_task, TaskStoreError};
use narro_lib::recurrence::materialize_recurrence_week;
use narro_lib::scheduling::effective_planning_lane_at;
use rusqlite::{params, Connection};
use support::{insert_work_session, migrated, ListFixture, TaskFixture, CREATED_AT, MUTATED_AT};

fn request(task: &TaskRecord) -> QuickClearTaskScheduleRequest {
    let schedule = match task.schedule_kind {
        ScheduleKind::None => TaskSchedule::None,
        ScheduleKind::DateOnly => TaskSchedule::DateOnly {
            local_date: task.scheduled_local_date.clone().unwrap(),
        },
        ScheduleKind::LocalDateTime => TaskSchedule::LocalDateTime {
            local_date: task.scheduled_local_date.clone().unwrap(),
            local_time: task.scheduled_local_time.clone().unwrap(),
            timezone: task.schedule_timezone.clone().unwrap(),
        },
    };
    QuickClearTaskScheduleRequest {
        task_id: task.id,
        list_id: task.list_id,
        expected_schedule: schedule,
        expected_updated_at: task.updated_at.clone(),
        expected_recurrence_parent_task_id: task.recurrence_parent_task_id,
        fallback_display_timezone: "UTC".into(),
    }
}

fn future_fixture(conn: &Connection) -> TaskRecord {
    let list = ListFixture::new(1, "Work").insert(conn);
    TaskFixture::new(1, list.id, "Call with Pete", PlanningLane::ThisWeek)
        .rank(0)
        .date_only("2026-09-18")
        .insert(conn)
}

#[test]
fn future_this_week_quick_clear_appends_to_backlog_and_survives_reopen_without_data_loss() {
    let path =
        std::env::temp_dir().join(format!("narro-quick-clear-{}.sqlite", uuid::Uuid::new_v4()));
    let mut conn = Connection::open(&path).unwrap();
    narro_lib::persistence::run_migrations(&mut conn).unwrap();
    let target = future_fixture(&conn);
    let backlog = TaskFixture::new(
        2,
        target.list_id,
        "Find new copywriter",
        PlanningLane::Backlog,
    )
    .rank(0)
    .insert(&conn);
    let week = TaskFixture::new(
        3,
        target.list_id,
        "Keep weekly order",
        PlanningLane::ThisWeek,
    )
    .rank(1)
    .insert(&conn);
    insert_work_session(&conn, 1, target.id, 123);
    conn.execute("INSERT INTO task_notes(task_id,editor_format_version,content,updated_at) VALUES(?1,1,'retained notes',?2)",params![target.id.to_string(),CREATED_AT]).unwrap();
    let updated = clear(&mut conn, request(&target), MUTATED_AT).unwrap();
    assert_eq!(updated.manual_lane, PlanningLane::Backlog);
    assert_eq!(updated.sort_rank, 1);
    assert_eq!(updated.id, target.id);
    assert_eq!(updated.title, target.title);
    assert_eq!(updated.est_seconds, target.est_seconds);
    assert_eq!(
        updated.manual_time_adjustment_seconds,
        target.manual_time_adjustment_seconds
    );
    assert_eq!(updated.created_at, target.created_at);
    assert_eq!(updated.schedule_kind, ScheduleKind::None);
    assert_eq!(get_task(&conn, week.id).unwrap().sort_rank, 0);
    let ids: Vec<_> = active_tasks_in_bucket(&conn, target.list_id, PlanningLane::Backlog)
        .unwrap()
        .into_iter()
        .map(|t| t.id)
        .collect();
    assert_eq!(ids, vec![backlog.id, target.id]);
    drop(conn);
    let conn = Connection::open(&path).unwrap();
    assert_eq!(get_task(&conn, target.id).unwrap(), updated);
    let sessions: i64 = conn
        .query_row(
            "SELECT SUM(duration_seconds) FROM sessions WHERE task_id=?1",
            [target.id.to_string()],
            |r| r.get(0),
        )
        .unwrap();
    let notes: String = conn
        .query_row(
            "SELECT content FROM task_notes WHERE task_id=?1",
            [target.id.to_string()],
            |r| r.get(0),
        )
        .unwrap();
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM tasks", [], |r| r.get(0))
        .unwrap();
    assert_eq!((sessions, notes, count), (123, "retained notes".into(), 3));
    drop(conn);
    std::fs::remove_file(path).unwrap();
}

#[test]
fn same_manual_and_visible_lane_keeps_existing_rank_and_siblings_untouched() {
    let mut conn = migrated();
    let list = ListFixture::new(1, "Work").insert(&conn);
    let sibling = TaskFixture::new(1, list.id, "First", PlanningLane::Backlog)
        .rank(0)
        .insert(&conn);
    let target = TaskFixture::new(2, list.id, "Scheduled", PlanningLane::Backlog)
        .rank(1)
        .date_only("2026-09-18")
        .insert(&conn);
    let updated = clear(&mut conn, request(&target), MUTATED_AT).unwrap();
    assert_eq!(updated.sort_rank, 1);
    assert_eq!(get_task(&conn, sibling.id).unwrap(), sibling);
    assert!(matches!(
        clear(&mut conn, request(&target), MUTATED_AT),
        Err(TaskScheduleEditError::ExpectedScheduleMismatch(_))
    ));
    assert_eq!(get_task(&conn, target.id).unwrap(), updated);
}

#[test]
fn date_time_timezone_and_monday_boundaries_use_authoritative_projection() {
    for (date, time, zone, now, expected) in [
        ("2026-09-02", None, "UTC", MUTATED_AT, PlanningLane::Today),
        ("2026-09-03", None, "UTC", MUTATED_AT, PlanningLane::Today),
        (
            "2026-09-04",
            None,
            "UTC",
            MUTATED_AT,
            PlanningLane::ThisWeek,
        ),
        ("2026-09-07", None, "UTC", MUTATED_AT, PlanningLane::Backlog),
        (
            "2026-09-04",
            Some("00:30"),
            "Europe/Athens",
            MUTATED_AT,
            PlanningLane::Today,
        ),
        (
            "2026-09-07",
            None,
            "UTC",
            "2026-09-06T23:59:00Z",
            PlanningLane::Backlog,
        ),
        (
            "2026-09-07",
            None,
            "UTC",
            "2026-09-07T00:00:00Z",
            PlanningLane::Today,
        ),
        (
            "2026-10-25",
            Some("02:30"),
            "Europe/Athens",
            "2026-10-25T03:30:00Z",
            PlanningLane::Today,
        ),
    ] {
        let mut conn = migrated();
        let list = ListFixture::new(1, "Work").insert(&conn);
        let fixture = TaskFixture::new(1, list.id, "Date case", PlanningLane::ThisWeek).rank(0);
        let task = if let Some(time) = time {
            fixture.local_datetime(date, time, zone)
        } else {
            fixture.date_only(date)
        }
        .insert(&conn);
        let updated = clear(&mut conn, request(&task), now).unwrap();
        assert_eq!(updated.manual_lane, expected, "{date}/{time:?}/{now}");
        assert_eq!(
            effective_planning_lane_at(&updated, now.parse().unwrap(), "UTC").unwrap(),
            expected
        );
    }
}

#[test]
fn current_persisted_display_timezone_overrides_automatic_fallback() {
    let mut conn = migrated();
    let list = ListFixture::new(1, "Work").insert(&conn);
    let task = TaskFixture::new(
        1,
        list.id,
        "Tomorrow in UTC, today in Athens",
        PlanningLane::Backlog,
    )
    .date_only("2026-09-04")
    .insert(&conn);
    let mut prefs = PreferencesPayload::default();
    prefs.general.timezone = Some("Europe/Athens".into());
    save_preferences(&mut conn, prefs, CREATED_AT).unwrap();
    let updated = clear(&mut conn, request(&task), "2026-09-03T22:00:00Z").unwrap();
    assert_eq!(updated.manual_lane, PlanningLane::Today);
}

#[test]
fn stale_schedule_list_version_or_child_link_cannot_mutate_any_task() {
    for case in ["schedule", "list", "version", "child"] {
        let mut conn = migrated();
        let task = future_fixture(&conn);
        let mut req = request(&task);
        match case {
            "schedule" => {
                req.expected_schedule = TaskSchedule::DateOnly {
                    local_date: "2026-09-19".into(),
                }
            }
            "list" => req.list_id = support::list_id(99),
            "version" => req.expected_updated_at = "stale".into(),
            "child" => req.expected_recurrence_parent_task_id = Some(support::task_id(99)),
            _ => unreachable!(),
        }
        assert!(clear(&mut conn, req, MUTATED_AT).is_err(), "{case}");
        assert_eq!(get_task(&conn, task.id).unwrap(), task, "{case}");
    }
}

#[test]
fn active_paused_open_session_completed_archived_and_archived_list_are_rejected() {
    for case in ["open-session", "completed", "archived", "archived-list"] {
        let mut conn = migrated();
        let task = future_fixture(&conn);
        match case {
            "open-session" => {
                insert_work_session(&conn, 1, task.id, 0);
                conn.execute(
                    "UPDATE sessions SET ended_at=NULL WHERE task_id=?1",
                    [task.id.to_string()],
                )
                .unwrap();
            }
            "completed" => {
                conn.execute(
                    "UPDATE tasks SET completed_at=?1 WHERE id=?2",
                    params![CREATED_AT, task.id.to_string()],
                )
                .unwrap();
            }
            "archived" => {
                conn.execute(
                    "UPDATE tasks SET archived_at=?1 WHERE id=?2",
                    params![CREATED_AT, task.id.to_string()],
                )
                .unwrap();
            }
            "archived-list" => {
                conn.execute(
                    "UPDATE lists SET archived_at=?1 WHERE id=?2",
                    params![CREATED_AT, task.list_id.to_string()],
                )
                .unwrap();
            }
            _ => unreachable!(),
        }
        let before = get_task(&conn, task.id).unwrap();
        let result = clear(&mut conn, request(&before), MUTATED_AT);
        if case == "open-session" {
            assert!(matches!(
                result,
                Err(TaskScheduleEditError::Task(TaskStoreError::ActiveSession(
                    _
                )))
            ));
        } else {
            assert!(result.is_err());
        }
        assert_eq!(get_task(&conn, task.id).unwrap(), before);
    }
}

#[test]
fn running_paused_and_break_runtime_all_protect_the_live_task_and_checkpoint() {
    use narro_lib::timer::{runtime::TimerRuntime, TimerMode};
    for state in ["running", "paused", "break"] {
        let mut conn = migrated();
        let task = future_fixture(&conn);
        let mut runtime = TimerRuntime::recover(&mut conn, 0, CREATED_AT).unwrap();
        runtime
            .start_task(&mut conn, task.id, TimerMode::CountUp, 0, CREATED_AT)
            .unwrap();
        if state == "paused" {
            runtime.pause(&mut conn, 1000, MUTATED_AT).unwrap();
        }
        if state == "break" {
            runtime
                .start_manual_break(&mut conn, 60_000, 1000, MUTATED_AT)
                .unwrap();
        }
        let before: String = conn
            .query_row(
                "SELECT payload_json FROM timer_runtime_checkpoint",
                [],
                |r| r.get(0),
            )
            .unwrap();
        assert!(
            matches!(
                clear(&mut conn, request(&task), MUTATED_AT),
                Err(TaskScheduleEditError::Task(TaskStoreError::ActiveSession(
                    _
                )))
            ),
            "{state}"
        );
        assert_eq!(get_task(&conn, task.id).unwrap(), task);
        assert_eq!(
            conn.query_row(
                "SELECT payload_json FROM timer_runtime_checkpoint",
                [],
                |r| r.get::<_, String>(0)
            )
            .unwrap(),
            before
        );
    }
}

#[test]
fn rank_overflow_and_mid_transaction_sql_failure_roll_back_schedule_lane_and_siblings() {
    for fail in ["overflow", "trigger"] {
        let mut conn = migrated();
        let task = future_fixture(&conn);
        let destination = TaskFixture::new(2, task.list_id, "Destination", PlanningLane::Backlog)
            .rank(if fail == "overflow" { u32::MAX } else { 0 })
            .insert(&conn);
        let sibling = TaskFixture::new(3, task.list_id, "Old sibling", PlanningLane::ThisWeek)
            .rank(1)
            .insert(&conn);
        if fail == "trigger" {
            conn.execute_batch("CREATE TRIGGER reject_compaction BEFORE UPDATE OF sort_rank ON tasks WHEN OLD.title='Old sibling' BEGIN SELECT RAISE(ABORT,'forced compaction failure'); END;").unwrap();
        }
        assert!(
            clear(&mut conn, request(&task), MUTATED_AT).is_err(),
            "{fail}"
        );
        assert_eq!(get_task(&conn, task.id).unwrap(), task);
        assert_eq!(get_task(&conn, destination.id).unwrap(), destination);
        assert_eq!(get_task(&conn, sibling.id).unwrap(), sibling);
    }
}

#[test]
fn invalid_time_timezone_and_ambiguous_dst_schedule_do_not_clear_the_date() {
    for case in ["timestamp", "timezone", "dst"] {
        let mut conn = migrated();
        let task = future_fixture(&conn);
        let mut req = request(&task);
        if case == "timezone" {
            req.fallback_display_timezone = "Not/AZone".into();
        }
        if case == "dst" {
            req.expected_schedule = TaskSchedule::LocalDateTime {
                local_date: "2026-10-25".into(),
                local_time: "03:30".into(),
                timezone: "Europe/Athens".into(),
            };
        }
        assert!(clear(
            &mut conn,
            req,
            if case == "timestamp" {
                "bad timestamp"
            } else {
                MUTATED_AT
            }
        )
        .is_err());
        assert_eq!(get_task(&conn, task.id).unwrap(), task);
    }
}

#[test]
fn linked_child_retains_occurrence_identity_and_repeated_materialization_cannot_duplicate_it() {
    let mut conn = migrated();
    let parent = future_fixture(&conn);
    let rule = create_recurrence_rule(
        &mut conn,
        NewRecurrenceRuleInput {
            parent_task_id: parent.id,
            interval_count: 1,
            unit: RecurrenceUnit::Day,
            weekday_mask: 0,
            month_day: None,
            month_weekday_ordinal: None,
            starts_local_date: "2026-09-03".into(),
            local_time: None,
            timezone: None,
            replace_existing: false,
        },
        CREATED_AT,
    )
    .unwrap();
    materialize_recurrence_week(&mut conn, rule.id, "2026-09-03", CREATED_AT).unwrap();
    let parent = get_task(&conn, parent.id).unwrap();
    assert!(clear(&mut conn, request(&parent), MUTATED_AT).is_err());
    let child_id:String=conn.query_row("SELECT child_task_id FROM recurrence_occurrences WHERE recurrence_rule_id=?1 ORDER BY occurrence_local_date LIMIT 1",[rule.id.to_string()],|r|r.get(0)).unwrap();
    let child = get_task(
        &conn,
        narro_lib::domain::ids::TaskId::parse_str(&child_id).unwrap(),
    )
    .unwrap();
    let before: i64 = conn
        .query_row("SELECT COUNT(*) FROM tasks", [], |r| r.get(0))
        .unwrap();
    let updated = clear(&mut conn, request(&child), MUTATED_AT).unwrap();
    assert_eq!(
        updated.recurrence_parent_task_id,
        child.recurrence_parent_task_id
    );
    assert_eq!(updated.id, child.id);
    for _ in 0..3 {
        materialize_recurrence_week(&mut conn, rule.id, "2026-09-03", MUTATED_AT).unwrap();
    }
    assert_eq!(
        conn.query_row("SELECT COUNT(*) FROM tasks", [], |r| r.get::<_, i64>(0))
            .unwrap(),
        before
    );
    assert_eq!(get_task(&conn, child.id).unwrap(), updated);
}

#[test]
fn generic_schedule_editor_retains_its_original_manual_lane_contract() {
    let mut conn = migrated();
    let task = future_fixture(&conn);
    let updated = update_task_schedule_if_expected(
        &mut conn,
        task.id,
        task.list_id,
        request(&task).expected_schedule,
        TaskSchedule::None,
        MUTATED_AT,
    )
    .unwrap();
    assert_eq!(updated.manual_lane, PlanningLane::ThisWeek);
}

#[test]
fn competing_writer_and_stale_read_never_partially_clear_or_move_the_task() {
    let path = std::env::temp_dir().join(format!(
        "narro-quick-clear-writer-{}.sqlite",
        uuid::Uuid::new_v4()
    ));
    let mut first = Connection::open(&path).unwrap();
    narro_lib::persistence::run_migrations(&mut first).unwrap();
    let task = future_fixture(&first);
    let mut second = Connection::open(&path).unwrap();
    second.busy_timeout(std::time::Duration::ZERO).unwrap();
    let writer = first
        .transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)
        .unwrap();
    assert!(matches!(
        clear(&mut second, request(&task), MUTATED_AT),
        Err(TaskScheduleEditError::Sqlite(_))
    ));
    assert_eq!(get_task(&writer, task.id).unwrap(), task);
    writer
        .execute(
            "UPDATE tasks SET scheduled_local_date='2026-09-19',updated_at=?1 WHERE id=?2",
            params![MUTATED_AT, task.id.to_string()],
        )
        .unwrap();
    writer.commit().unwrap();
    let concurrent = get_task(&first, task.id).unwrap();
    assert!(clear(&mut second, request(&task), MUTATED_AT).is_err());
    assert_eq!(get_task(&second, task.id).unwrap(), concurrent);
    drop(first);
    drop(second);
    std::fs::remove_file(path).unwrap();
}
