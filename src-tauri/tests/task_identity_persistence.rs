use narro_lib::domain::ids::ListId;
use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::tasks::NewTaskInput;
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::task_identity::reorder_active_bucket;
use narro_lib::persistence::tasks::{active_tasks_in_bucket, create_task};
use rusqlite::Connection;
use std::fs;
use uuid::Uuid;

const T1: &str = "2026-09-03T14:00:00Z";
const T2: &str = "2026-09-03T14:01:00Z";

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

#[test]
fn reordered_task_bucket_survives_database_reopen() {
    let path = std::env::temp_dir().join(format!("narro-task-order-{}.db", Uuid::new_v4()));
    let list_id;
    let expected_order;

    {
        let mut conn = Connection::open(&path).expect("open temporary database");
        run_migrations(&mut conn).expect("migrate temporary database");
        list_id = create_test_list(&mut conn);
        let first = create_task(
            &mut conn,
            NewTaskInput {
                list_id,
                title: "First".into(),
                manual_lane: PlanningLane::ThisWeek,
                est_seconds: None,
            },
            T1,
        )
        .expect("create first task");
        let second = create_task(
            &mut conn,
            NewTaskInput {
                list_id,
                title: "Second".into(),
                manual_lane: PlanningLane::ThisWeek,
                est_seconds: None,
            },
            T1,
        )
        .expect("create second task");
        let third = create_task(
            &mut conn,
            NewTaskInput {
                list_id,
                title: "Third".into(),
                manual_lane: PlanningLane::ThisWeek,
                est_seconds: None,
            },
            T1,
        )
        .expect("create third task");

        expected_order = vec![third.id, first.id, second.id];
        let reordered = reorder_active_bucket(
            &mut conn,
            list_id,
            PlanningLane::ThisWeek,
            &expected_order,
            T2,
        )
        .expect("reorder task bucket");
        assert_eq!(
            reordered.iter().map(|task| task.id).collect::<Vec<_>>(),
            expected_order
        );
    }

    {
        let mut reopened = Connection::open(&path).expect("reopen temporary database");
        run_migrations(&mut reopened).expect("re-run migrations after reopen");
        let persisted = active_tasks_in_bucket(&reopened, list_id, PlanningLane::ThisWeek)
            .expect("load persisted order");
        assert_eq!(
            persisted.iter().map(|task| task.id).collect::<Vec<_>>(),
            expected_order
        );
        assert_eq!(
            persisted
                .iter()
                .map(|task| task.sort_rank)
                .collect::<Vec<_>>(),
            vec![0, 1, 2]
        );
    }

    fs::remove_file(path).expect("remove temporary database");
}
