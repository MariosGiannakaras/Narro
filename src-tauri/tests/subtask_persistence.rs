use narro_lib::domain::ids::{ListId, SubtaskId, TaskId};
use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::subtasks::{NewSubtaskInput, UpdateSubtaskInput};
use narro_lib::domain::tasks::NewTaskInput;
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::subtasks::{
    complete_subtask, create_subtask, delete_subtask, get_subtask, reopen_subtask,
    reorder_subtasks, subtasks_for_task, update_subtask, SubtaskStoreError,
};
use narro_lib::persistence::tasks::{archive_task, complete_task, create_task};
use rusqlite::Connection;
use std::collections::HashSet;
use std::fs;
use uuid::Uuid;

const T1: &str = "2026-09-03T18:00:00Z";
const T2: &str = "2026-09-03T18:01:00Z";
const T3: &str = "2026-09-03T18:02:00Z";
const T4: &str = "2026-09-03T18:03:00Z";

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

fn create_test_task(conn: &mut Connection, list_id: ListId, title: &str) -> TaskId {
    create_task(
        conn,
        NewTaskInput {
            list_id,
            title: title.into(),
            manual_lane: PlanningLane::Today,
            est_seconds: Some(1800),
        },
        T1,
    )
    .expect("create task")
    .id
}

fn ids(task_id: TaskId, conn: &Connection) -> Vec<SubtaskId> {
    subtasks_for_task(conn, task_id)
        .expect("load subtasks")
        .into_iter()
        .map(|subtask| subtask.id)
        .collect()
}

#[test]
fn subtask_crud_completion_reorder_and_delete_preserve_stable_identities() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    let list_id = create_test_list(&mut conn);
    let task_id = create_test_task(&mut conn, list_id, "Parent");

    let first = create_subtask(
        &mut conn,
        NewSubtaskInput {
            task_id,
            title: " First ".into(),
        },
        T1,
    )
    .expect("create first subtask");
    let second = create_subtask(
        &mut conn,
        NewSubtaskInput {
            task_id,
            title: "Second".into(),
        },
        T1,
    )
    .expect("create second subtask");
    let third = create_subtask(
        &mut conn,
        NewSubtaskInput {
            task_id,
            title: "Third".into(),
        },
        T1,
    )
    .expect("create third subtask");

    assert_eq!(first.title, "First");
    assert_eq!(ids(task_id, &conn), vec![first.id, second.id, third.id]);

    let completed = complete_subtask(&mut conn, second.id, T2).expect("complete subtask");
    assert_eq!(completed.id, second.id);
    assert_eq!(completed.completed_at.as_deref(), Some(T2));
    assert_eq!(ids(task_id, &conn), vec![first.id, second.id, third.id]);

    let reordered = reorder_subtasks(
        &mut conn,
        task_id,
        &[third.id, second.id, first.id],
        T3,
    )
    .expect("reorder subtasks");
    assert_eq!(
        reordered.iter().map(|subtask| subtask.id).collect::<Vec<_>>(),
        vec![third.id, second.id, first.id]
    );
    assert_eq!(
        reordered
            .iter()
            .map(|subtask| subtask.sort_rank)
            .collect::<Vec<_>>(),
        vec![0, 1, 2]
    );
    assert!(reordered[1].completed_at.is_some());

    let updated = update_subtask(
        &mut conn,
        first.id,
        UpdateSubtaskInput {
            title: "First updated".into(),
        },
        T3,
    )
    .expect("update subtask");
    assert_eq!(updated.id, first.id);
    assert_eq!(updated.title, "First updated");

    let reopened = reopen_subtask(&mut conn, second.id, T4).expect("reopen subtask");
    assert_eq!(reopened.id, second.id);
    assert!(reopened.completed_at.is_none());

    delete_subtask(&mut conn, second.id, T4).expect("delete middle subtask");
    let remaining = subtasks_for_task(&conn, task_id).expect("load remaining subtasks");
    assert_eq!(
        remaining.iter().map(|subtask| subtask.id).collect::<Vec<_>>(),
        vec![third.id, first.id]
    );
    assert_eq!(
        remaining
            .iter()
            .map(|subtask| subtask.sort_rank)
            .collect::<Vec<_>>(),
        vec![0, 1]
    );

    let identity_set: HashSet<SubtaskId> = remaining.iter().map(|subtask| subtask.id).collect();
    assert_eq!(identity_set, [third.id, first.id].into_iter().collect());
}

#[test]
fn duplicate_or_stale_reorder_is_rejected_without_partial_write() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    let list_id = create_test_list(&mut conn);
    let task_id = create_test_task(&mut conn, list_id, "Parent");
    let first = create_subtask(
        &mut conn,
        NewSubtaskInput {
            task_id,
            title: "First".into(),
        },
        T1,
    )
    .expect("create first");
    let second = create_subtask(
        &mut conn,
        NewSubtaskInput {
            task_id,
            title: "Second".into(),
        },
        T1,
    )
    .expect("create second");
    let third = create_subtask(
        &mut conn,
        NewSubtaskInput {
            task_id,
            title: "Third".into(),
        },
        T1,
    )
    .expect("create third");
    let original = ids(task_id, &conn);

    let duplicate = reorder_subtasks(
        &mut conn,
        task_id,
        &[first.id, first.id, third.id],
        T2,
    );
    assert!(matches!(
        duplicate,
        Err(SubtaskStoreError::DuplicateReorderId)
    ));
    assert_eq!(ids(task_id, &conn), original);

    let stale = reorder_subtasks(
        &mut conn,
        task_id,
        &[third.id, second.id, SubtaskId::generate()],
        T2,
    );
    assert!(matches!(stale, Err(SubtaskStoreError::ReorderSetMismatch)));
    assert_eq!(ids(task_id, &conn), original);
}

#[test]
fn parent_completion_or_archive_blocks_subtask_mutation_but_keeps_history_readable() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    let list_id = create_test_list(&mut conn);

    let completed_parent = create_test_task(&mut conn, list_id, "Completed parent");
    let completed_child = create_subtask(
        &mut conn,
        NewSubtaskInput {
            task_id: completed_parent,
            title: "Historical child".into(),
        },
        T1,
    )
    .expect("create completed-parent child");
    complete_task(&mut conn, completed_parent, T2).expect("complete parent task");
    let completed_edit = update_subtask(
        &mut conn,
        completed_child.id,
        UpdateSubtaskInput {
            title: "Should fail".into(),
        },
        T3,
    );
    assert!(matches!(
        completed_edit,
        Err(SubtaskStoreError::ParentTaskCompleted(id)) if id == completed_parent
    ));
    assert_eq!(
        get_subtask(&conn, completed_child.id)
            .expect("read completed-parent subtask")
            .title,
        "Historical child"
    );

    let archived_parent = create_test_task(&mut conn, list_id, "Archived parent");
    let archived_child = create_subtask(
        &mut conn,
        NewSubtaskInput {
            task_id: archived_parent,
            title: "Archived child".into(),
        },
        T1,
    )
    .expect("create archived-parent child");
    archive_task(&mut conn, archived_parent, T2).expect("archive parent task");
    let archived_completion = complete_subtask(&mut conn, archived_child.id, T3);
    assert!(matches!(
        archived_completion,
        Err(SubtaskStoreError::ParentTaskArchived(id)) if id == archived_parent
    ));
    assert_eq!(
        subtasks_for_task(&conn, archived_parent)
            .expect("read archived-parent subtasks")
            .len(),
        1
    );
}

#[test]
fn subtask_order_and_completion_survive_database_reopen() {
    let path = std::env::temp_dir().join(format!("narro-subtasks-{}.db", Uuid::new_v4()));
    let task_id;
    let first_id;
    let second_id;

    {
        let mut conn = Connection::open(&path).expect("open temporary database");
        run_migrations(&mut conn).expect("migrate temporary database");
        let list_id = create_test_list(&mut conn);
        task_id = create_test_task(&mut conn, list_id, "Persistent parent");
        let first = create_subtask(
            &mut conn,
            NewSubtaskInput {
                task_id,
                title: "First".into(),
            },
            T1,
        )
        .expect("create first");
        let second = create_subtask(
            &mut conn,
            NewSubtaskInput {
                task_id,
                title: "Second".into(),
            },
            T1,
        )
        .expect("create second");
        first_id = first.id;
        second_id = second.id;
        complete_subtask(&mut conn, first.id, T2).expect("complete first");
        reorder_subtasks(&mut conn, task_id, &[second.id, first.id], T3)
            .expect("persist reorder");
    }

    {
        let mut reopened = Connection::open(&path).expect("reopen temporary database");
        run_migrations(&mut reopened).expect("re-run migrations after reopen");
        let persisted = subtasks_for_task(&reopened, task_id).expect("load persisted subtasks");
        assert_eq!(
            persisted.iter().map(|subtask| subtask.id).collect::<Vec<_>>(),
            vec![second_id, first_id]
        );
        assert_eq!(persisted[0].sort_rank, 0);
        assert_eq!(persisted[1].sort_rank, 1);
        assert!(persisted[0].completed_at.is_none());
        assert_eq!(persisted[1].completed_at.as_deref(), Some(T2));
    }

    fs::remove_file(path).expect("remove temporary database");
}
