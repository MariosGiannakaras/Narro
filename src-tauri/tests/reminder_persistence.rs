use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::reminders::NewReminderInput;
use narro_lib::domain::tasks::NewTaskInput;
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::reminders::{
    create_reminder, dismiss_reminder, get_reminder, list_task_reminders, mark_reminder_fired,
    pending_due_reminders, ReminderStoreError,
};
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::tasks::{complete_task, create_task};
use rusqlite::{params, Connection};

const T0: &str = "2026-09-05T18:30:00Z";
const T1: &str = "2026-09-05T18:31:00Z";
const T2: &str = "2026-09-05T18:32:00Z";

fn migrated() -> Connection {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    conn
}

fn task_fixture(conn: &mut Connection, title: &str) -> narro_lib::domain::tasks::TaskRecord {
    let list = create_list(
        conn,
        NewListInput {
            title: "Inbox".into(),
            color: None,
            icon_asset: None,
        },
        T0,
    )
    .expect("create list");
    create_task(
        conn,
        NewTaskInput {
            list_id: list.id,
            title: title.into(),
            manual_lane: PlanningLane::Backlog,
            est_seconds: None,
        },
        T0,
    )
    .expect("create task")
}

fn pending_input(task_id: narro_lib::domain::ids::TaskId) -> NewReminderInput {
    NewReminderInput {
        task_id,
        remind_local_date: "2026-09-06".into(),
        remind_local_time: "10:00".into(),
        timezone: "Europe/Athens".into(),
    }
}

#[test]
fn reminder_round_trips_and_becomes_due_at_resolved_timezone_instant() {
    let mut conn = migrated();
    let task = task_fixture(&mut conn, "Athens reminder");
    let reminder = create_reminder(
        &mut conn,
        NewReminderInput {
            task_id: task.id,
            remind_local_date: "2026-09-07".into(),
            remind_local_time: "09:00".into(),
            timezone: "Europe/Athens".into(),
        },
        T1,
    )
    .expect("create reminder");

    assert_eq!(reminder.remind_local_date, "2026-09-07");
    assert_eq!(reminder.remind_local_time, "09:00");
    assert_eq!(reminder.timezone, "Europe/Athens");
    assert!(reminder.fired_at.is_none());
    assert!(reminder.dismissed_at.is_none());
    assert_eq!(get_reminder(&conn, reminder.id).unwrap(), reminder);
    assert_eq!(
        list_task_reminders(&conn, task.id).unwrap(),
        vec![reminder.clone()]
    );

    assert!(pending_due_reminders(&conn, "2026-09-07T05:59:59Z")
        .expect("query before due")
        .is_empty());
    let due = pending_due_reminders(&conn, "2026-09-07T06:00:00Z")
        .expect("query at due instant");
    assert_eq!(due, vec![reminder]);
}

#[test]
fn due_query_orders_by_resolved_instant_not_local_clock_text() {
    let mut conn = migrated();
    let first_task = task_fixture(&mut conn, "New York reminder");
    let second_task = task_fixture(&mut conn, "Athens reminder");

    let new_york = create_reminder(
        &mut conn,
        NewReminderInput {
            task_id: first_task.id,
            remind_local_date: "2026-09-07".into(),
            remind_local_time: "08:00".into(),
            timezone: "America/New_York".into(),
        },
        T1,
    )
    .unwrap();
    let athens = create_reminder(
        &mut conn,
        NewReminderInput {
            task_id: second_task.id,
            remind_local_date: "2026-09-07".into(),
            remind_local_time: "12:00".into(),
            timezone: "Europe/Athens".into(),
        },
        T1,
    )
    .unwrap();

    let due = pending_due_reminders(&conn, "2026-09-07T12:00:00Z").unwrap();
    assert_eq!(due.len(), 2);
    assert_eq!(due[0].id, athens.id, "09:00Z Athens instant is earlier");
    assert_eq!(due[1].id, new_york.id, "12:00Z New York instant is later");
}

#[test]
fn invalid_timezone_and_dst_gap_or_fold_are_rejected_before_insert() {
    let mut conn = migrated();
    let task = task_fixture(&mut conn, "Strict reminder");

    for (date, time, timezone) in [
        ("2026-09-07", "09:00", "Not/A_Zone"),
        ("2026-03-08", "02:30", "America/New_York"),
        ("2026-11-01", "01:30", "America/New_York"),
    ] {
        assert!(create_reminder(
            &mut conn,
            NewReminderInput {
                task_id: task.id,
                remind_local_date: date.into(),
                remind_local_time: time.into(),
                timezone: timezone.into(),
            },
            T1,
        )
        .is_err());
    }

    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM reminders", [], |row| row.get(0))
        .unwrap();
    assert_eq!(count, 0);
}

#[test]
fn fired_and_dismissed_transitions_are_idempotent_and_exclude_due_rows() {
    let mut conn = migrated();
    let fired_task = task_fixture(&mut conn, "Fired reminder");
    let dismissed_task = task_fixture(&mut conn, "Dismissed reminder");

    let fired = create_reminder(
        &mut conn,
        NewReminderInput {
            task_id: fired_task.id,
            remind_local_date: "2026-09-05".into(),
            remind_local_time: "10:00".into(),
            timezone: "Europe/Athens".into(),
        },
        T1,
    )
    .unwrap();
    let dismissed = create_reminder(
        &mut conn,
        NewReminderInput {
            task_id: dismissed_task.id,
            remind_local_date: "2026-09-05".into(),
            remind_local_time: "10:00".into(),
            timezone: "Europe/Athens".into(),
        },
        T1,
    )
    .unwrap();

    let fired_once = mark_reminder_fired(&mut conn, fired.id, T2).unwrap();
    let fired_twice = mark_reminder_fired(&mut conn, fired.id, "2026-09-05T18:40:00Z").unwrap();
    assert_eq!(fired_once.fired_at.as_deref(), Some(T2));
    assert_eq!(fired_twice.fired_at.as_deref(), Some(T2));

    let dismissed_once = dismiss_reminder(&mut conn, dismissed.id, T2).unwrap();
    let dismissed_twice =
        dismiss_reminder(&mut conn, dismissed.id, "2026-09-05T18:40:00Z").unwrap();
    assert_eq!(dismissed_once.dismissed_at.as_deref(), Some(T2));
    assert_eq!(dismissed_twice.dismissed_at.as_deref(), Some(T2));

    assert!(pending_due_reminders(&conn, "2026-09-05T20:00:00Z")
        .unwrap()
        .is_empty());
    assert!(matches!(
        dismiss_reminder(&mut conn, fired.id, T2),
        Err(ReminderStoreError::Terminal(id)) if id == fired.id
    ));
    assert!(matches!(
        mark_reminder_fired(&mut conn, dismissed.id, T2),
        Err(ReminderStoreError::Terminal(id)) if id == dismissed.id
    ));
}

#[test]
fn completed_or_archived_task_context_cannot_produce_pending_delivery() {
    let mut conn = migrated();
    let completed_task = task_fixture(&mut conn, "Completed task");
    let archived_task = task_fixture(&mut conn, "Archived task");
    let archived_list_task = task_fixture(&mut conn, "Archived list task");

    let completed_reminder = create_reminder(
        &mut conn,
        NewReminderInput {
            task_id: completed_task.id,
            remind_local_date: "2026-09-05".into(),
            remind_local_time: "10:00".into(),
            timezone: "Europe/Athens".into(),
        },
        T1,
    )
    .unwrap();
    let archived_reminder = create_reminder(
        &mut conn,
        NewReminderInput {
            task_id: archived_task.id,
            remind_local_date: "2026-09-05".into(),
            remind_local_time: "10:00".into(),
            timezone: "Europe/Athens".into(),
        },
        T1,
    )
    .unwrap();
    let archived_list_reminder = create_reminder(
        &mut conn,
        NewReminderInput {
            task_id: archived_list_task.id,
            remind_local_date: "2026-09-05".into(),
            remind_local_time: "10:00".into(),
            timezone: "Europe/Athens".into(),
        },
        T1,
    )
    .unwrap();

    complete_task(&mut conn, completed_task.id, T2).expect("complete task");
    conn.execute(
        "UPDATE tasks SET archived_at = ?1, updated_at = ?1 WHERE id = ?2",
        params![T2, archived_task.id.to_string()],
    )
    .expect("archive task fixture");
    conn.execute(
        "UPDATE lists SET archived_at = ?1, updated_at = ?1 WHERE id = (SELECT list_id FROM tasks WHERE id = ?2)",
        params![T2, archived_list_task.id.to_string()],
    )
    .expect("archive list fixture");

    let due = pending_due_reminders(&conn, "2026-09-05T20:00:00Z").unwrap();
    assert!(due.is_empty());
    assert!(get_reminder(&conn, completed_reminder.id).is_ok());
    assert!(get_reminder(&conn, archived_reminder.id).is_ok());
    assert!(get_reminder(&conn, archived_list_reminder.id).is_ok());

    assert!(matches!(
        create_reminder(&mut conn, pending_input(completed_task.id), T2),
        Err(ReminderStoreError::TaskCompleted(id)) if id == completed_task.id
    ));
    assert!(matches!(
        create_reminder(&mut conn, pending_input(archived_task.id), T2),
        Err(ReminderStoreError::TaskArchived(id)) if id == archived_task.id
    ));
    assert!(matches!(
        create_reminder(&mut conn, pending_input(archived_list_task.id), T2),
        Err(ReminderStoreError::TaskListArchived)
    ));
}
