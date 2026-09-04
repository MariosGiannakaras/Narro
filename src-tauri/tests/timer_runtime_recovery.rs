use narro_lib::domain::ids::TaskId;
use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::sessions::SessionKind;
use narro_lib::domain::tasks::NewTaskInput;
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::sessions::{
    get_open_session, get_session_runtime_checkpoint, sessions_for_task,
};
use narro_lib::persistence::task_metadata::task_time_taken_seconds;
use narro_lib::persistence::tasks::create_task;
use narro_lib::timer::runtime::TimerRuntime;
use narro_lib::timer::{TimerMode, TimerStateKind};
use rusqlite::Connection;

const T0: &str = "2026-09-04T18:00:00Z";
const T5: &str = "2026-09-04T18:00:05Z";
const T6: &str = "2026-09-04T18:00:06Z";
const RESTART: &str = "2026-09-04T19:00:00Z";
const AFTER_RESTART: &str = "2026-09-04T19:00:02Z";

fn fixture() -> (Connection, TaskId) {
    let mut conn = Connection::open_in_memory().expect("open database");
    run_migrations(&mut conn).expect("migrate database");
    let list = create_list(
        &mut conn,
        NewListInput {
            title: "Inbox".into(),
            color: None,
            icon_asset: None,
        },
        T0,
    )
    .expect("create list");
    let task = create_task(
        &mut conn,
        NewTaskInput {
            list_id: list.id,
            title: "Recoverable".into(),
            manual_lane: PlanningLane::Today,
            est_seconds: Some(1_800),
        },
        T0,
    )
    .expect("create task");
    (conn, task.id)
}

#[test]
fn running_restart_recovers_last_durable_work_paused_with_same_session() {
    let (mut conn, task_id) = fixture();
    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
        .unwrap();
    runtime.pause(&mut conn, 5_000, T5).unwrap();
    runtime.resume(&mut conn, 6_000, T6).unwrap();
    let before_crash = get_open_session(&conn).unwrap().unwrap();
    assert_eq!(before_crash.duration_seconds, 5);
    assert!(get_session_runtime_checkpoint(&conn, before_crash.id)
        .unwrap()
        .is_some());

    runtime
        .advance(&mut conn, 9_000, "2026-09-04T18:00:09Z")
        .unwrap();

    let (mut recovered, snapshot) =
        TimerRuntime::recover_after_restart(&mut conn, 500_000, RESTART)
            .unwrap()
            .expect("recover open runtime");
    assert_eq!(snapshot.timer.state, TimerStateKind::Paused);
    assert_eq!(snapshot.timer.work_elapsed_ms, 5_000);
    assert_eq!(snapshot.open_session_id, Some(before_crash.id));
    assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 5);

    recovered.resume(&mut conn, 500_000, RESTART).unwrap();
    let finished = recovered
        .finish_task(&mut conn, 502_000, AFTER_RESTART)
        .unwrap();
    assert_eq!(finished.timer.work_elapsed_ms, 7_000);
    assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 7);
}

#[test]
fn time_up_checkpoint_recovers_as_time_up_without_counting_downtime() {
    let (mut conn, task_id) = fixture();
    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(
            &mut conn,
            task_id,
            TimerMode::EstCountdown { est_ms: 10_000 },
            0,
            T0,
        )
        .unwrap();
    let time_up = runtime
        .advance(&mut conn, 12_000, "2026-09-04T18:00:12Z")
        .unwrap();
    assert_eq!(time_up.timer.state, TimerStateKind::TimeUp);

    let (recovered, snapshot) = TimerRuntime::recover_after_restart(&mut conn, 900_000, RESTART)
        .unwrap()
        .expect("recover time-up runtime");
    assert_eq!(snapshot.timer.state, TimerStateKind::TimeUp);
    assert_eq!(snapshot.timer.work_elapsed_ms, 10_000);
    assert_eq!(snapshot.timer.countdown_remaining_ms, Some(0));
    assert_eq!(
        recovered.snapshot(1_000_000).unwrap().timer.work_elapsed_ms,
        10_000
    );
}

#[test]
fn break_restart_closes_break_row_and_returns_to_paused_work() {
    let (mut conn, task_id) = fixture();
    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
        .unwrap();
    runtime
        .start_manual_break(&mut conn, 30_000, 5_000, T5)
        .unwrap();
    let break_row = get_open_session(&conn).unwrap().unwrap();
    assert_eq!(break_row.kind, SessionKind::Break);

    let (_recovered, snapshot) = TimerRuntime::recover_after_restart(&mut conn, 500_000, RESTART)
        .unwrap()
        .expect("recover interrupted break");
    assert_eq!(snapshot.timer.state, TimerStateKind::Paused);
    assert_eq!(snapshot.timer.work_elapsed_ms, 5_000);
    let open = get_open_session(&conn).unwrap().unwrap();
    assert_eq!(open.kind, SessionKind::Work);
    assert_ne!(open.id, break_row.id);

    let sessions = sessions_for_task(&conn, task_id).unwrap();
    assert_eq!(sessions.len(), 3);
    assert_eq!(sessions[0].kind, SessionKind::Work);
    assert_eq!(sessions[0].duration_seconds, 5);
    assert_eq!(sessions[1].kind, SessionKind::Break);
    assert_eq!(sessions[1].duration_seconds, 0);
    assert_eq!(sessions[2].kind, SessionKind::Work);
    assert!(sessions[2].is_open());
}

#[test]
fn pomodoro_break_restart_preserves_completed_work_and_resets_next_interval() {
    let (mut conn, task_id) = fixture();
    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(
            &mut conn,
            task_id,
            TimerMode::Pomodoro {
                work_ms: 2_000,
                break_ms: 10_000,
            },
            0,
            T0,
        )
        .unwrap();
    let on_break = runtime
        .advance(&mut conn, 2_500, "2026-09-04T18:00:02.500Z")
        .unwrap();
    assert_eq!(on_break.timer.state, TimerStateKind::Break);

    let (_recovered, snapshot) = TimerRuntime::recover_after_restart(&mut conn, 500_000, RESTART)
        .unwrap()
        .expect("recover Pomodoro break");
    assert_eq!(snapshot.timer.state, TimerStateKind::Paused);
    assert_eq!(snapshot.timer.work_elapsed_ms, 2_000);
    assert_eq!(snapshot.timer.countdown_remaining_ms, Some(2_000));
    assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 2);
}

#[test]
fn open_session_without_checkpoint_is_rejected_explicitly() {
    let (mut conn, task_id) = fixture();
    narro_lib::persistence::sessions::open_focus_work_session(&mut conn, task_id, T0)
        .expect("create legacy open focus row");
    let error = TimerRuntime::recover_after_restart(&mut conn, 500_000, RESTART)
        .expect_err("missing durable checkpoint must be explicit");
    assert!(matches!(
        error,
        narro_lib::timer::runtime::TimerRuntimeError::MissingRuntimeCheckpoint(_)
    ));
}
