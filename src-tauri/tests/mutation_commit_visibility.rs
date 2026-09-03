use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::tasks::{NewTaskInput, TaskDestination, UpdateTaskInput};
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::tasks::{create_task, get_task, move_task, update_task};
use rusqlite::Connection;
use std::fs;
use uuid::Uuid;

const T1: &str = "2026-09-03T21:10:00Z";
const T2: &str = "2026-09-03T21:11:00Z";
const T3: &str = "2026-09-03T21:12:00Z";

#[test]
fn successful_task_mutations_are_committed_before_the_api_reports_success() {
    let path = std::env::temp_dir().join(format!("narro-commit-visibility-{}.db", Uuid::new_v4()));
    let mut writer = Connection::open(&path).expect("open writer database connection");
    run_migrations(&mut writer).expect("migrate writer database");
    let observer = Connection::open(&path).expect("open independent observer connection");

    let list = create_list(
        &mut writer,
        NewListInput {
            title: "Inbox".into(),
            color: None,
            icon_asset: None,
        },
        T1,
    )
    .expect("create list before task mutation checks");

    let created = create_task(
        &mut writer,
        NewTaskInput {
            list_id: list.id,
            title: "Created".into(),
            manual_lane: PlanningLane::Backlog,
            est_seconds: Some(900),
        },
        T1,
    )
    .expect("create task");
    let observed_created = get_task(&observer, created.id)
        .expect("independent connection must observe task after create returned");
    assert_eq!(observed_created, created);

    let updated = update_task(
        &mut writer,
        created.id,
        UpdateTaskInput {
            title: "Edited".into(),
            est_seconds: Some(1800),
        },
        T2,
    )
    .expect("edit task");
    let observed_updated = get_task(&observer, created.id)
        .expect("independent connection must observe edit after update returned");
    assert_eq!(observed_updated, updated);
    assert_eq!(observed_updated.title, "Edited");

    let moved = move_task(
        &mut writer,
        created.id,
        TaskDestination {
            list_id: list.id,
            manual_lane: PlanningLane::Today,
        },
        T3,
    )
    .expect("move task");
    let observed_moved = get_task(&observer, created.id)
        .expect("independent connection must observe lane move after move returned");
    assert_eq!(observed_moved, moved);
    assert_eq!(observed_moved.manual_lane, PlanningLane::Today);

    drop(observer);
    drop(writer);
    fs::remove_file(path).expect("remove commit-visibility database");
}
