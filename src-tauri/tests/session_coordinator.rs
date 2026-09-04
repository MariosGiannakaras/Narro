use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::tasks::{NewTaskInput, TaskRecord};
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::sessions::{get_open_session, get_session};
use narro_lib::persistence::task_metadata::task_time_taken_seconds;
use narro_lib::persistence::tasks::create_task;
use narro_lib::timer::{SessionCoordinator, TimerMode, TimerStateKind};
use rusqlite::Connection;
use std::fs;
use uuid::Uuid;

const CREATED_AT: &str = "2026-09-04T14:00:00Z";
const MUTATED_AT: &str = "2026-09-04T14:01:00Z";
const MUTATED_AGAIN_AT: &str = "2026-09-04T14:02:00Z";

fn migrated() -> Connection {
    let mut conn = Connection::open_in_memory().expect("open session coordinator database");
    run_migrations(&mut conn).expect("migrate session coordinator database");
    conn
}

fn task_fixture(conn: &mut Connection, list_title: &str, task_title: &str) -> TaskRecord {
    let list = create_list(
        conn,
        NewListInput {
            title: list_title.to_owned(),
            color: None,
            icon_asset: None,
        },
        CREATED_AT,
    )
    .expect("create coordinator list fixture");
    create_task(
        conn,
        NewTaskInput {
            list_id: list.id,
            title: task_title.to_owned(),
            manual_lane: PlanningLane::Today,
            est_seconds: Some(900),
        },
        CREATED_AT,
    )
    .expect("create coordinator task fixture")
}

#[test]
fn checkpointed_open_work_recovers_paused_without_counting_process_downtime() {
    let path = std::env::temp_dir().join(format!("narro-session-recovery-{}.db", Uuid::new_v4()));
    let task_id;
    let session_id;

    {
        let mut conn = Connection::open(&path).expect("open recovery fixture database");
        run_migrations(&mut conn).expect("migrate recovery fixture database");
        let task = task_fixture(&mut conn, "Inbox", "Recovered work");
        task_id = task.id;

        let mut coordinator = SessionCoordinator::new();
        coordinator
            .start_task(&mut conn, task.id, TimerMode::CountUp, 0, CREATED_AT)
            .expect("start persisted task");
        session_id = coordinator
            .open_work_session_id()
            .expect("open work session identity");
        let checkpoint = coordinator
            .checkpoint(&mut conn, 7_500, MUTATED_AT)
            .expect("checkpoint running work");
        assert_eq!(checkpoint.work_elapsed_ms, 7_500);
        assert_eq!(get_session(&conn, session_id).unwrap().duration_seconds, 7);
    }

    {
        let mut conn = Connection::open(&path).expect("reopen recovery fixture database");
        run_migrations(&mut conn).expect("re-run migrations after process restart");
        let (mut coordinator, recovered) = SessionCoordinator::recover_open_work_paused(
            &conn,
            TimerMode::CountUp,
            100_000,
        )
        .expect("recover open work")
        .expect("open work exists");

        assert_eq!(coordinator.open_work_session_id(), Some(session_id));
        assert_eq!(recovered.state, TimerStateKind::Paused);
        assert_eq!(recovered.work_elapsed_ms, 7_000);
        assert_eq!(
            coordinator.snapshot(200_000).unwrap().work_elapsed_ms,
            7_000,
            "process downtime must not accrue as work"
        );

        coordinator.resume(200_000).expect("resume recovered work");
        let exit = coordinator
            .finish_task(&mut conn, 203_500, MUTATED_AGAIN_AT)
            .expect("finish recovered work");
        assert_eq!(exit.timer.work_elapsed_ms, 10_500);
        assert_eq!(exit.session.id, session_id);
        assert_eq!(exit.session.duration_seconds, 10);
        assert!(exit.session.ended_at.is_some());
        assert!(get_open_session(&conn).unwrap().is_none());
        assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 10);
    }

    fs::remove_file(path).expect("remove recovery fixture database");
}

#[test]
fn est_time_up_extend_and_completion_keep_one_persisted_work_session_and_time_taken() {
    let mut conn = migrated();
    let task = task_fixture(&mut conn, "Focus", "Estimate");
    let mut coordinator = SessionCoordinator::new();

    coordinator
        .start_task(
            &mut conn,
            task.id,
            TimerMode::EstCountdown { est_ms: 5_000 },
            0,
            CREATED_AT,
        )
        .expect("start EST work");
    let session_id = coordinator.open_work_session_id().unwrap();

    let time_up = coordinator
        .checkpoint(&mut conn, 8_000, MUTATED_AT)
        .expect("checkpoint across EST boundary");
    assert_eq!(time_up.state, TimerStateKind::TimeUp);
    assert_eq!(time_up.work_elapsed_ms, 5_000);
    assert_eq!(get_session(&conn, session_id).unwrap().duration_seconds, 5);

    let extended = coordinator.extend(10_000).expect("extend same work runtime");
    assert_eq!(extended.state, TimerStateKind::OvertimeRunning);
    assert_eq!(coordinator.open_work_session_id(), Some(session_id));

    let exit = coordinator
        .finish_task(&mut conn, 13_000, MUTATED_AGAIN_AT)
        .expect("finish overtime work");
    assert_eq!(exit.timer.work_elapsed_ms, 8_000);
    assert_eq!(exit.session.id, session_id);
    assert_eq!(exit.session.duration_seconds, 8);
    assert_eq!(task_time_taken_seconds(&conn, task.id).unwrap(), 8);
}

#[test]
fn failed_second_start_leaves_candidate_engine_idle_when_database_rejects_duplicate_open_session() {
    let mut conn = migrated();
    let first = task_fixture(&mut conn, "First list", "First");
    let second = task_fixture(&mut conn, "Second list", "Second");

    let mut owner = SessionCoordinator::new();
    owner
        .start_task(&mut conn, first.id, TimerMode::CountUp, 0, CREATED_AT)
        .expect("open first persisted session");

    let mut rejected = SessionCoordinator::new();
    assert!(rejected
        .start_task(&mut conn, second.id, TimerMode::CountUp, 0, MUTATED_AT)
        .is_err());
    assert_eq!(rejected.snapshot(0).unwrap().state, TimerStateKind::Idle);
    assert_eq!(rejected.open_work_session_id(), None);
    assert_eq!(get_open_session(&conn).unwrap().unwrap().task_id, Some(first.id));
}
