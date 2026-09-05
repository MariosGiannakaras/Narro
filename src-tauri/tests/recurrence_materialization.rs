use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::{PlanningLane, RecurrenceUnit, ScheduleKind};
use narro_lib::domain::recurrence::NewRecurrenceRuleInput;
use narro_lib::domain::tasks::{NewTaskInput, TaskSchedule};
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::recurrence::{create_recurrence_rule, get_recurrence_rule};
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::task_metadata::set_task_schedule;
use narro_lib::persistence::tasks::{create_task, get_task};
use narro_lib::recurrence::materialize_recurrence_week;
use rusqlite::Connection;

const T1: &str = "2026-09-07T06:00:00Z";
const T2: &str = "2026-09-07T06:01:00Z";
const T3: &str = "2026-09-09T06:00:00Z";

fn migrated() -> Connection {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    conn
}

#[test]
fn materialization_normalizes_parent_and_is_idempotent_for_the_due_week() {
    let mut conn = migrated();
    let list = create_list(
        &mut conn,
        NewListInput {
            title: "Inbox".into(),
            color: None,
            icon_asset: None,
        },
        T1,
    )
    .expect("create list");
    let parent = create_task(
        &mut conn,
        NewTaskInput {
            list_id: list.id,
            title: "Recurring review".into(),
            manual_lane: PlanningLane::Today,
            est_seconds: Some(1800),
        },
        T1,
    )
    .expect("create recurrence parent");
    set_task_schedule(
        &mut conn,
        parent.id,
        TaskSchedule::DateOnly {
            local_date: "2026-09-07".into(),
        },
        T1,
    )
    .expect("give parent a pre-recurrence schedule");

    let rule = create_recurrence_rule(
        &mut conn,
        NewRecurrenceRuleInput {
            parent_task_id: parent.id,
            interval_count: 1,
            unit: RecurrenceUnit::Week,
            weekday_mask: 0b0010001,
            month_day: None,
            starts_local_date: "2026-09-07".into(),
            local_time: None,
            timezone: None,
            replace_existing: false,
        },
        T2,
    )
    .expect("create weekly recurrence rule");

    let first = materialize_recurrence_week(&mut conn, rule.id, "2026-09-07", T2)
        .expect("materialize Monday due week");
    assert_eq!(first.evaluated_occurrences.len(), 2);
    assert_eq!(first.created_child_ids.len(), 2);
    assert!(first.existing_child_ids.is_empty());

    let normalized_parent = get_task(&conn, parent.id).expect("load normalized parent");
    assert_eq!(normalized_parent.manual_lane, PlanningLane::Backlog);
    assert_eq!(normalized_parent.schedule_kind, ScheduleKind::None);
    assert!(normalized_parent.scheduled_local_date.is_none());
    assert!(normalized_parent.scheduled_local_time.is_none());
    assert!(normalized_parent.schedule_timezone.is_none());
    assert_eq!(normalized_parent.recurrence_rule_id, Some(rule.id));

    let mut child_dates = Vec::new();
    for child_id in &first.created_child_ids {
        let child = get_task(&conn, *child_id).expect("load materialized child");
        assert_eq!(child.list_id, parent.list_id);
        assert_eq!(child.title, parent.title);
        assert_eq!(child.est_seconds, parent.est_seconds);
        assert_eq!(child.manual_lane, PlanningLane::Backlog);
        assert_eq!(child.schedule_kind, ScheduleKind::DateOnly);
        assert_eq!(child.recurrence_parent_task_id, Some(parent.id));
        assert!(child.recurrence_rule_id.is_none());
        child_dates.push(
            child
                .scheduled_local_date
                .expect("child should have scheduled local date"),
        );
    }
    child_dates.sort();
    assert_eq!(child_dates, vec!["2026-09-07", "2026-09-11"]);

    let occurrence_rows: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM recurrence_occurrences WHERE recurrence_rule_id = ?1",
            [rule.id.to_string()],
            |row| row.get(0),
        )
        .expect("count occurrence rows");
    assert_eq!(occurrence_rows, 2);

    let second = materialize_recurrence_week(&mut conn, rule.id, "2026-09-09", T3)
        .expect("repeat materialization later in same week");
    assert!(second.created_child_ids.is_empty());
    assert_eq!(second.existing_child_ids.len(), 2);

    let occurrence_rows_after_repeat: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM recurrence_occurrences WHERE recurrence_rule_id = ?1",
            [rule.id.to_string()],
            |row| row.get(0),
        )
        .expect("count occurrence rows after repeat");
    assert_eq!(occurrence_rows_after_repeat, 2);

    let linked_children: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM tasks WHERE recurrence_parent_task_id = ?1",
            [parent.id.to_string()],
            |row| row.get(0),
        )
        .expect("count linked child tasks");
    assert_eq!(linked_children, 2);

    let checkpoint = get_recurrence_rule(&conn, rule.id).expect("load materialization checkpoint");
    assert_eq!(
        checkpoint.last_materialized_local_date.as_deref(),
        Some("2026-09-09")
    );
}

#[test]
fn inactive_rule_does_not_create_children_or_normalize_parent() {
    use narro_lib::persistence::recurrence::set_recurrence_rule_active;

    let mut conn = migrated();
    let list = create_list(
        &mut conn,
        NewListInput {
            title: "Inbox".into(),
            color: None,
            icon_asset: None,
        },
        T1,
    )
    .expect("create list");
    let parent = create_task(
        &mut conn,
        NewTaskInput {
            list_id: list.id,
            title: "Inactive recurring task".into(),
            manual_lane: PlanningLane::ThisWeek,
            est_seconds: None,
        },
        T1,
    )
    .expect("create parent");
    let rule = create_recurrence_rule(
        &mut conn,
        NewRecurrenceRuleInput {
            parent_task_id: parent.id,
            interval_count: 1,
            unit: RecurrenceUnit::Day,
            weekday_mask: 0,
            month_day: None,
            starts_local_date: "2026-09-07".into(),
            local_time: None,
            timezone: None,
            replace_existing: false,
        },
        T2,
    )
    .expect("create rule");
    set_recurrence_rule_active(&mut conn, rule.id, false, T2).expect("disable rule");

    let report = materialize_recurrence_week(&mut conn, rule.id, "2026-09-07", T2)
        .expect("inactive materialization is a no-op");
    assert!(report.evaluated_occurrences.is_empty());
    assert!(report.created_child_ids.is_empty());
    assert!(report.existing_child_ids.is_empty());

    let unchanged_parent = get_task(&conn, parent.id).expect("reload parent");
    assert_eq!(unchanged_parent.manual_lane, PlanningLane::ThisWeek);
}
