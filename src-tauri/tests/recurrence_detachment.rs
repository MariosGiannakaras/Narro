use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::{PlanningLane, RecurrenceUnit};
use narro_lib::domain::recurrence::NewRecurrenceRuleInput;
use narro_lib::domain::tasks::NewTaskInput;
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::recurrence::{
    create_recurrence_rule, delete_recurrence_rule, get_recurrence_rule, RecurrenceStoreError,
};
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::tasks::{complete_task, create_task, get_task};
use narro_lib::recurrence::materialize_recurrence_week;
use rusqlite::{params, Connection};

const T0: &str = "2026-09-07T06:00:00Z";
const T1: &str = "2026-09-08T06:00:00Z";
const T2: &str = "2026-09-08T07:00:00Z";
const T3: &str = "2026-09-08T08:00:00Z";
const CURRENT_LOCAL_DATE: &str = "2026-09-08";

fn fixture() -> (
    Connection,
    narro_lib::domain::ids::TaskId,
    narro_lib::domain::ids::RecurrenceRuleId,
) {
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
            title: "Recurring parent".into(),
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
            weekday_mask: 0b0001111,
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

fn occurrence_count(
    conn: &Connection,
    rule_id: narro_lib::domain::ids::RecurrenceRuleId,
) -> i64 {
    conn.query_row(
        "SELECT COUNT(*) FROM recurrence_occurrences WHERE recurrence_rule_id = ?1",
        [rule_id.to_string()],
        |row| row.get(0),
    )
    .expect("count recurrence occurrences")
}

#[test]
fn detach_preserves_child_identities_states_and_owned_history() {
    let (mut conn, parent_id, rule_id) = fixture();
    let materialized = materialize_recurrence_week(&mut conn, rule_id, CURRENT_LOCAL_DATE, T1)
        .expect("materialize recurrence children");
    assert_eq!(materialized.created_child_ids.len(), 4);

    let edited_id = materialized.created_child_ids[0];
    let completed_id = materialized.created_child_ids[1];
    let archived_id = materialized.created_child_ids[2];
    let already_detached_id = materialized.created_child_ids[3];

    conn.execute(
        "UPDATE tasks SET title = 'Edited generated child', updated_at = ?1 WHERE id = ?2",
        params![T2, edited_id.to_string()],
    )
    .expect("edit generated child");
    conn.execute(
        "INSERT INTO task_notes (task_id, editor_format_version, content, updated_at)
         VALUES (?1, 1, '{\"type\":\"doc\",\"content\":[]}', ?2)",
        params![edited_id.to_string(), T2],
    )
    .expect("add note history");
    conn.execute(
        "INSERT INTO subtasks (id, task_id, title, sort_rank, created_at, updated_at)
         VALUES (?1, ?2, 'Preserved subtask', 0, ?3, ?3)",
        params![
            uuid::Uuid::new_v4().to_string(),
            edited_id.to_string(),
            T2
        ],
    )
    .expect("add subtask history");
    conn.execute(
        "INSERT INTO reminders (
            id, task_id, remind_local_date, remind_local_time, timezone, created_at, updated_at
         ) VALUES (?1, ?2, '2026-09-08', '12:00', 'Europe/Athens', ?3, ?3)",
        params![
            uuid::Uuid::new_v4().to_string(),
            edited_id.to_string(),
            T2
        ],
    )
    .expect("add reminder history");
    conn.execute(
        "INSERT INTO sessions (
            id, task_id, kind, started_at, ended_at, duration_seconds, source, created_at, updated_at
         ) VALUES (?1, ?2, 'work', ?3, ?3, 120, 'manual', ?3, ?3)",
        params![
            uuid::Uuid::new_v4().to_string(),
            edited_id.to_string(),
            T2
        ],
    )
    .expect("add session history");

    complete_task(&mut conn, completed_id, T2).expect("complete generated child");
    conn.execute(
        "UPDATE tasks SET archived_at = ?1, updated_at = ?1 WHERE id = ?2",
        params![T2, archived_id.to_string()],
    )
    .expect("archive generated child");
    conn.execute(
        "UPDATE tasks
         SET recurrence_parent_task_id = NULL, title = 'Already independent', updated_at = ?1
         WHERE id = ?2",
        params![T2, already_detached_id.to_string()],
    )
    .expect("pre-detach independent child");

    assert_eq!(occurrence_count(&conn, rule_id), 4);
    delete_recurrence_rule(&mut conn, rule_id, T3).expect("detach recurrence");

    let parent = get_task(&conn, parent_id).expect("parent survives recurrence removal");
    assert!(parent.recurrence_rule_id.is_none());
    assert!(get_recurrence_rule(&conn, rule_id).is_err());
    assert_eq!(occurrence_count(&conn, rule_id), 0);

    let edited = get_task(&conn, edited_id).expect("edited child survives");
    assert_eq!(edited.title, "Edited generated child");
    assert!(edited.recurrence_parent_task_id.is_none());

    let completed = get_task(&conn, completed_id).expect("completed child survives");
    assert!(completed.completed_at.is_some());
    assert!(completed.recurrence_parent_task_id.is_none());

    let archived = get_task(&conn, archived_id).expect("archived child survives");
    assert!(archived.archived_at.is_some());
    assert!(archived.recurrence_parent_task_id.is_none());

    let already_detached = get_task(&conn, already_detached_id).expect("independent child survives");
    assert_eq!(already_detached.title, "Already independent");
    assert_eq!(already_detached.updated_at, T2);
    assert!(already_detached.recurrence_parent_task_id.is_none());

    for table in ["task_notes", "subtasks", "reminders", "sessions"] {
        let sql = format!("SELECT COUNT(*) FROM {table} WHERE task_id = ?1");
        let count: i64 = conn
            .query_row(&sql, [edited_id.to_string()], |row| row.get(0))
            .expect("count preserved child history");
        assert_eq!(count, 1, "{table} history must survive detachment");
    }

    assert!(
        materialize_recurrence_week(&mut conn, rule_id, CURRENT_LOCAL_DATE, T3).is_err(),
        "a removed recurrence rule cannot materialize future children"
    );
}

#[test]
fn detach_rolls_back_child_and_parent_links_when_rule_delete_fails() {
    let (mut conn, parent_id, rule_id) = fixture();
    let materialized = materialize_recurrence_week(&mut conn, rule_id, CURRENT_LOCAL_DATE, T1)
        .expect("materialize recurrence children");
    assert_eq!(occurrence_count(&conn, rule_id), 4);

    conn.execute_batch(
        "CREATE TRIGGER fail_recurrence_detach
         BEFORE DELETE ON recurrence_rules
         BEGIN
             SELECT RAISE(ABORT, 'forced recurrence detach failure');
         END;",
    )
    .expect("install detach failure trigger");

    let error = delete_recurrence_rule(&mut conn, rule_id, T2)
        .expect_err("detach must fail atomically");
    assert!(matches!(error, RecurrenceStoreError::Sqlite(_)));

    let parent = get_task(&conn, parent_id).expect("parent survives rollback");
    assert_eq!(parent.recurrence_rule_id, Some(rule_id));
    assert!(get_recurrence_rule(&conn, rule_id).is_ok());
    assert_eq!(occurrence_count(&conn, rule_id), 4);

    for child_id in materialized.created_child_ids {
        let child = get_task(&conn, child_id).expect("child survives rollback");
        assert_eq!(child.recurrence_parent_task_id, Some(parent_id));
    }
}

#[test]
fn repeated_detach_returns_not_found_without_mutating_preserved_tasks() {
    let (mut conn, parent_id, rule_id) = fixture();
    let materialized = materialize_recurrence_week(&mut conn, rule_id, CURRENT_LOCAL_DATE, T1)
        .expect("materialize recurrence children");
    let child_id = materialized.created_child_ids[0];

    delete_recurrence_rule(&mut conn, rule_id, T2).expect("first detach succeeds");
    let child_after_first = get_task(&conn, child_id).expect("child survives first detach");
    assert!(child_after_first.recurrence_parent_task_id.is_none());
    assert_eq!(
        get_task(&conn, parent_id)
            .expect("parent survives first detach")
            .recurrence_rule_id,
        None
    );

    let error = delete_recurrence_rule(&mut conn, rule_id, T3)
        .expect_err("second detach must report missing rule");
    assert!(matches!(error, RecurrenceStoreError::NotFound(id) if id == rule_id));

    let child_after_second = get_task(&conn, child_id).expect("child survives repeated detach");
    assert_eq!(child_after_second.id, child_after_first.id);
    assert_eq!(child_after_second.title, child_after_first.title);
    assert_eq!(child_after_second.updated_at, child_after_first.updated_at);
}
