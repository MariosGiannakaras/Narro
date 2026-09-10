use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::{PlanningLane, RecurrenceUnit};
use narro_lib::domain::recurrence::{NewRecurrenceRuleInput, UpdateRecurrenceRuleInput};
use narro_lib::domain::tasks::NewTaskInput;
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::recurrence::{
    create_recurrence_rule, get_recurrence_rule, RecurrenceStoreError,
};
use narro_lib::persistence::recurrence_replace::{
    replace_existing_tasks_if_expected, ReplaceExistingError,
};
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::tasks::{create_task, get_task};
use narro_lib::recurrence::materialize_recurrence_week;
use rusqlite::Connection;

const T0: &str = "2026-09-09T16:00:00Z";
const T1: &str = "2026-09-09T16:01:00Z";
const T2: &str = "2026-09-09T16:02:00Z";

fn replacement() -> UpdateRecurrenceRuleInput {
    UpdateRecurrenceRuleInput {
        interval_count: 1,
        unit: RecurrenceUnit::Week,
        weekday_mask: 0b0010000,
        month_day: None,
        starts_local_date: "2026-09-07".into(),
        local_time: None,
        timezone: None,
        replace_existing: true,
    }
}

#[test]
fn stale_replace_existing_rejects_before_child_mutation() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    let list = create_list(
        &mut conn,
        NewListInput {
            title: "Recurring".into(),
            color: None,
            icon_asset: None,
        },
        T0,
    )
    .expect("create list");
    let parent = create_task(
        &mut conn,
        NewTaskInput {
            list_id: list.id,
            title: "Weekly review".into(),
            manual_lane: PlanningLane::Backlog,
            est_seconds: None,
        },
        T0,
    )
    .expect("create parent");
    let rule = create_recurrence_rule(
        &mut conn,
        NewRecurrenceRuleInput {
            parent_task_id: parent.id,
            interval_count: 1,
            unit: RecurrenceUnit::Week,
            weekday_mask: 0b0000101,
            month_day: None,
            starts_local_date: "2026-09-07".into(),
            local_time: None,
            timezone: None,
            replace_existing: false,
        },
        T0,
    )
    .expect("create recurrence rule");
    let materialized = materialize_recurrence_week(&mut conn, rule.id, "2026-09-09", T1)
        .expect("materialize children");
    assert!(!materialized.created_child_ids.is_empty());

    let before = get_recurrence_rule(&conn, rule.id).expect("load rule before stale replacement");
    let error = replace_existing_tasks_if_expected(
        &mut conn,
        rule.id,
        "2026-09-09T15:59:00Z",
        replacement(),
        T2,
    )
    .expect_err("stale replacement must fail before child mutation");
    assert!(matches!(
        error,
        ReplaceExistingError::Store(RecurrenceStoreError::ExpectedVersionMismatch(id)) if id == rule.id
    ));

    let after = get_recurrence_rule(&conn, rule.id).expect("rule survives stale replacement");
    assert_eq!(after.weekday_mask, before.weekday_mask);
    assert_eq!(after.updated_at, before.updated_at);
    for child_id in materialized.created_child_ids {
        let child = get_task(&conn, child_id).expect("child survives stale replacement");
        assert_eq!(child.recurrence_parent_task_id, Some(parent.id));
    }
}
