use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::{PlanningLane, RecurrenceUnit};
use narro_lib::domain::recurrence::{NewRecurrenceRuleInput, UpdateRecurrenceRuleInput};
use narro_lib::domain::tasks::NewTaskInput;
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::recurrence::{create_recurrence_rule, get_recurrence_rule};
use narro_lib::persistence::recurrence_replace::{
    replace_existing_tasks, ReplaceExistingError,
};
use narro_lib::persistence::tasks::{complete_task, create_task, get_task};
use narro_lib::persistence::run_migrations;
use narro_lib::recurrence::materialize_recurrence_week;
use rusqlite::{params, Connection};

const T0: &str = "2026-09-07T06:00:00Z";
const T1: &str = "2026-09-08T06:00:00Z";
const T2: &str = "2026-09-08T07:00:00Z";
const CURRENT_LOCAL_DATE: &str = "2026-09-08";

fn fixture() -> (Connection, narro_lib::domain::ids::TaskId, narro_lib::domain::ids::RecurrenceRuleId) {
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
            est_seconds: Some(1800),
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
    (conn, parent.id, rule.id)
}

fn friday_replacement() -> UpdateRecurrenceRuleInput {
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

fn occurrence_count(conn: &Connection, rule_id: narro_lib::domain::ids::RecurrenceRuleId) -> i64 {
    conn.query_row(
        "SELECT COUNT(*) FROM recurrence_occurrences WHERE recurrence_rule_id = ?1",
        [rule_id.to_string()],
        |row| row.get(0),
    )
    .expect("count recurrence occurrences")
}

#[test]
fn replace_removes_pristine_children_resets_cursor_and_rematerializes_new_pattern_once() {
    let (mut conn, _parent_id, rule_id) = fixture();
    let original = materialize_recurrence_week(&mut conn, rule_id, CURRENT_LOCAL_DATE, T1)
        .expect("materialize original pattern");
    assert_eq!(original.created_child_ids.len(), 2);
    assert_eq!(occurrence_count(&conn, rule_id), 2);
    assert_eq!(
        get_recurrence_rule(&conn, rule_id)
            .expect("load materialized rule")
            .last_materialized_local_date
            .as_deref(),
        Some(CURRENT_LOCAL_DATE)
    );

    let replaced = replace_existing_tasks(&mut conn, rule_id, friday_replacement(), T2)
        .expect("replace generated tasks");
    assert_eq!(replaced.removed_child_ids, original.created_child_ids);
    assert!(replaced.detached_modified_child_ids.is_empty());
    assert_eq!(replaced.updated_rule.weekday_mask, 0b0010000);
    assert!(replaced.updated_rule.replace_existing);
    assert!(replaced.updated_rule.last_materialized_local_date.is_none());
    assert_eq!(occurrence_count(&conn, rule_id), 0);
    for child_id in original.created_child_ids {
        assert!(get_task(&conn, child_id).is_err(), "pristine old child must be removed");
    }

    let new_pattern = materialize_recurrence_week(&mut conn, rule_id, CURRENT_LOCAL_DATE, T2)
        .expect("materialize replacement pattern");
    assert_eq!(new_pattern.created_child_ids.len(), 1);
    assert_eq!(new_pattern.evaluated_occurrences.len(), 1);
    assert_eq!(new_pattern.evaluated_occurrences[0].local_date, "2026-09-11");
    assert_eq!(occurrence_count(&conn, rule_id), 1);

    let repeated = materialize_recurrence_week(&mut conn, rule_id, CURRENT_LOCAL_DATE, T2)
        .expect("repeat replacement materialization");
    assert!(repeated.created_child_ids.is_empty());
    assert_eq!(repeated.existing_child_ids, new_pattern.created_child_ids);
    assert_eq!(occurrence_count(&conn, rule_id), 1);
}

#[test]
fn replace_preserves_and_detaches_modified_or_history_bearing_active_child() {
    let (mut conn, _parent_id, rule_id) = fixture();
    let original = materialize_recurrence_week(&mut conn, rule_id, CURRENT_LOCAL_DATE, T1)
        .expect("materialize original pattern");
    let modified_id = original.created_child_ids[0];
    let history_id = original.created_child_ids[1];

    conn.execute(
        "UPDATE tasks SET title = 'User-edited child', updated_at = ?1 WHERE id = ?2",
        params![T2, modified_id.to_string()],
    )
    .expect("edit generated child");
    conn.execute(
        "INSERT INTO sessions (
            id, task_id, kind, started_at, ended_at, duration_seconds, source, created_at, updated_at
         ) VALUES (?1, ?2, 'work', ?3, ?3, 120, 'manual', ?3, ?3)",
        params![uuid::Uuid::new_v4().to_string(), history_id.to_string(), T1],
    )
    .expect("add child history");

    let replaced = replace_existing_tasks(&mut conn, rule_id, friday_replacement(), T2)
        .expect("replace while preserving edited children");
    assert!(replaced.removed_child_ids.is_empty());
    assert_eq!(
        replaced.detached_modified_child_ids,
        vec![modified_id, history_id]
    );
    assert_eq!(occurrence_count(&conn, rule_id), 0);

    let modified = get_task(&conn, modified_id).expect("edited child survives");
    assert_eq!(modified.title, "User-edited child");
    assert!(modified.recurrence_parent_task_id.is_none());
    let history = get_task(&conn, history_id).expect("history-bearing child survives");
    assert!(history.recurrence_parent_task_id.is_none());
    let sessions: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM sessions WHERE task_id = ?1",
            [history_id.to_string()],
            |row| row.get(0),
        )
        .expect("count preserved sessions");
    assert_eq!(sessions, 1);
}

#[test]
fn replace_keeps_completed_archived_and_already_independent_children() {
    let (mut conn, _parent_id, rule_id) = fixture();
    let original = materialize_recurrence_week(&mut conn, rule_id, CURRENT_LOCAL_DATE, T1)
        .expect("materialize original pattern");
    let completed_id = original.created_child_ids[0];
    let archived_id = original.created_child_ids[1];

    complete_task(&mut conn, completed_id, T2).expect("complete generated child");
    conn.execute(
        "UPDATE tasks SET archived_at = ?1, updated_at = ?1 WHERE id = ?2",
        params![T2, archived_id.to_string()],
    )
    .expect("archive generated child");

    let independent = create_task(
        &mut conn,
        NewTaskInput {
            list_id: get_task(&conn, completed_id).expect("load completed child").list_id,
            title: "Independent child".into(),
            manual_lane: PlanningLane::Backlog,
            est_seconds: None,
        },
        T1,
    )
    .expect("create independent task");
    conn.execute(
        "UPDATE tasks SET recurrence_parent_task_id = NULL WHERE id = ?1",
        [independent.id.to_string()],
    )
    .expect("keep independent task detached");

    let replaced = replace_existing_tasks(&mut conn, rule_id, friday_replacement(), T2)
        .expect("replace without touching history");
    assert!(replaced.removed_child_ids.is_empty());
    assert!(replaced.detached_modified_child_ids.is_empty());
    assert!(get_task(&conn, completed_id).is_ok());
    assert!(get_task(&conn, archived_id).is_ok());
    assert!(get_task(&conn, independent.id).is_ok());
    assert_eq!(occurrence_count(&conn, rule_id), 2);
}

#[test]
fn replace_is_atomic_when_rule_update_fails_after_child_selection() {
    let (mut conn, _parent_id, rule_id) = fixture();
    let original = materialize_recurrence_week(&mut conn, rule_id, CURRENT_LOCAL_DATE, T1)
        .expect("materialize original pattern");
    let old_rule = get_recurrence_rule(&conn, rule_id).expect("load old rule");
    conn.execute_batch(
        "CREATE TRIGGER fail_recurrence_replace
         BEFORE UPDATE ON recurrence_rules
         BEGIN
             SELECT RAISE(ABORT, 'forced replacement failure');
         END;",
    )
    .expect("install failure trigger");

    let error = replace_existing_tasks(&mut conn, rule_id, friday_replacement(), T2)
        .expect_err("replacement must fail atomically");
    assert!(matches!(error, ReplaceExistingError::Sqlite(_)));

    let still_old = get_recurrence_rule(&conn, rule_id).expect("old rule survives rollback");
    assert_eq!(still_old.weekday_mask, old_rule.weekday_mask);
    assert_eq!(
        still_old.last_materialized_local_date,
        old_rule.last_materialized_local_date
    );
    assert_eq!(occurrence_count(&conn, rule_id), 2);
    for child_id in original.created_child_ids {
        assert!(get_task(&conn, child_id).is_ok(), "child deletion must roll back");
    }
}

#[test]
fn replace_requires_explicit_replace_flag_before_any_write() {
    let (mut conn, _parent_id, rule_id) = fixture();
    let original = materialize_recurrence_week(&mut conn, rule_id, CURRENT_LOCAL_DATE, T1)
        .expect("materialize original pattern");
    let mut input = friday_replacement();
    input.replace_existing = false;

    let error = replace_existing_tasks(&mut conn, rule_id, input, T2)
        .expect_err("implicit replacement must be rejected");
    assert!(matches!(error, ReplaceExistingError::ReplaceFlagRequired));
    assert_eq!(occurrence_count(&conn, rule_id), 2);
    for child_id in original.created_child_ids {
        assert!(get_task(&conn, child_id).is_ok());
    }
}
