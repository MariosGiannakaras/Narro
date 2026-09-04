use narro_lib::domain::ids::{ListId, TaskId};
use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::sessions::SessionKind;
use narro_lib::domain::tasks::NewTaskInput;
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::sessions::{get_open_session, sessions_for_task, SessionStoreError};
use narro_lib::persistence::task_metadata::task_time_taken_seconds;
use narro_lib::persistence::tasks::{complete_task, create_task};
use narro_lib::timer::runtime::{TimerRuntime, TimerRuntimeError};
use narro_lib::timer::{TimerMode, TimerStateKind};
use rusqlite::Connection;

const T0: &str = "2026-09-04T10:00:00Z";
const T1: &str = "2026-09-04T10:00:01Z";
const T1_5: &str = "2026-09-04T10:00:01.500Z";
const T2: &str = "2026-09-04T10:00:02Z";
const T2_5: &str = "2026-09-04T10:00:02.500Z";
const T3: &str = "2026-09-04T10:00:03Z";
const T4_2: &str = "2026-09-04T10:00:04.200Z";
const T5: &str = "2026-09-04T10:00:05.500Z";
const T6: &str = "2026-09-04T10:00:06Z";
const T6_7: &str = "2026-09-04T10:00:06.700Z";

fn fixture() -> (Connection, ListId) {
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
    (conn, list.id)
}

fn task(conn: &mut Connection, list_id: ListId, title: &str) -> TaskId {
    create_task(
        conn,
        NewTaskInput {
            list_id,
            title: title.into(),
            manual_lane: PlanningLane::Today,
            est_seconds: Some(1_800),
        },
        T0,
    )
    .expect("create task")
    .id
}

#[test]
fn running_ticks_do_not_write_per_second_but_pause_resume_and_finish_checkpoint_work() {
    let (mut conn, list_id) = fixture();
    let task_id = task(&mut conn, list_id, "Focused");
    let mut runtime = TimerRuntime::new();

    runtime
        .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
        .expect("start runtime");
    let opened = get_open_session(&conn).unwrap().expect("open work session");
    assert_eq!(opened.duration_seconds, 0);
    assert_eq!(opened.updated_at, T0);

    let running = runtime
        .advance(&mut conn, 1_000, T1)
        .expect("advance without persistence tick");
    assert_eq!(running.timer.state, TimerStateKind::Running);
    let unchanged = get_open_session(&conn).unwrap().expect("same open session");
    assert_eq!(unchanged.id, opened.id);
    assert_eq!(unchanged.duration_seconds, 0);
    assert_eq!(unchanged.updated_at, T0);

    let paused = runtime
        .pause(&mut conn, 2_500, T2_5)
        .expect("pause and checkpoint");
    assert_eq!(paused.timer.state, TimerStateKind::Paused);
    let paused_row = get_open_session(&conn).unwrap().expect("paused open session");
    assert_eq!(paused_row.id, opened.id);
    assert_eq!(paused_row.duration_seconds, 2);
    assert_eq!(paused_row.updated_at, T2_5);

    runtime
        .resume(&mut conn, 3_000, T3)
        .expect("resume and checkpoint transition");
    let resumed_row = get_open_session(&conn).unwrap().expect("resumed work session");
    assert_eq!(resumed_row.id, opened.id);
    assert_eq!(resumed_row.duration_seconds, 2);
    assert_eq!(resumed_row.updated_at, T3);

    let finished = runtime
        .finish_task(&mut conn, 5_500, T5)
        .expect("finish runtime");
    assert_eq!(finished.timer.work_elapsed_ms, 5_000);
    assert_eq!(finished.closed_session.id, opened.id);
    assert_eq!(finished.closed_session.duration_seconds, 5);
    assert_eq!(finished.closed_session.ended_at.as_deref(), Some(T5));
    assert!(get_open_session(&conn).unwrap().is_none());
    assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 5);
}

#[test]
fn manual_break_splits_rows_without_losing_fractional_work_across_segments() {
    let (mut conn, list_id) = fixture();
    let task_id = task(&mut conn, list_id, "Break task");
    let mut runtime = TimerRuntime::new();

    runtime
        .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
        .unwrap();
    let on_break = runtime
        .start_manual_break(&mut conn, 2_700, 1_500, T1_5)
        .expect("start manual break");
    assert_eq!(on_break.timer.state, TimerStateKind::Break);

    let during_break = sessions_for_task(&conn, task_id).unwrap();
    assert_eq!(during_break.len(), 2);
    assert_eq!(during_break[0].kind, SessionKind::Work);
    assert_eq!(during_break[0].duration_seconds, 1);
    assert!(!during_break[0].is_open());
    assert_eq!(during_break[1].kind, SessionKind::Break);
    assert!(during_break[1].is_open());

    let resumed = runtime
        .advance(&mut conn, 4_200, T4_2)
        .expect("naturally finish manual break");
    assert_eq!(resumed.timer.state, TimerStateKind::Running);

    let finished = runtime
        .finish_task(&mut conn, 6_700, T6_7)
        .expect("finish after resumed work");
    assert_eq!(finished.timer.work_elapsed_ms, 4_000);

    let sessions = sessions_for_task(&conn, task_id).unwrap();
    assert_eq!(sessions.len(), 3);
    assert_eq!(
        sessions
            .iter()
            .map(|session| (session.kind, session.duration_seconds))
            .collect::<Vec<_>>(),
        vec![
            (SessionKind::Work, 1),
            (SessionKind::Break, 2),
            (SessionKind::Work, 3),
        ]
    );
    assert!(sessions.iter().all(|session| !session.is_open()));
    assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 4);
}

#[test]
fn pomodoro_boundaries_replace_session_rows_only_when_authoritative_state_changes() {
    let (mut conn, list_id) = fixture();
    let task_id = task(&mut conn, list_id, "Pomodoro task");
    let mut runtime = TimerRuntime::new();

    runtime
        .start_task(
            &mut conn,
            task_id,
            TimerMode::Pomodoro {
                work_ms: 2_000,
                break_ms: 3_000,
            },
            0,
            T0,
        )
        .unwrap();
    let first_id = runtime.open_session_id().expect("initial work row");

    runtime.advance(&mut conn, 1_000, T1).unwrap();
    let still_work = get_open_session(&conn).unwrap().unwrap();
    assert_eq!(still_work.id, first_id);
    assert_eq!(still_work.updated_at, T0);

    let on_break = runtime.advance(&mut conn, 2_500, T2_5).unwrap();
    assert_eq!(on_break.timer.state, TimerStateKind::Break);
    let break_row = get_open_session(&conn).unwrap().unwrap();
    assert_ne!(break_row.id, first_id);
    assert_eq!(break_row.kind, SessionKind::Break);
    assert_eq!(sessions_for_task(&conn, task_id).unwrap()[0].duration_seconds, 2);

    let awaiting_resume = runtime.advance(&mut conn, 6_000, T6).unwrap();
    assert_eq!(awaiting_resume.timer.state, TimerStateKind::Paused);
    let paused_work = get_open_session(&conn).unwrap().unwrap();
    assert_eq!(paused_work.kind, SessionKind::Work);
    assert_ne!(paused_work.id, break_row.id);

    let sessions = sessions_for_task(&conn, task_id).unwrap();
    assert_eq!(sessions.len(), 3);
    assert_eq!(sessions[0].duration_seconds, 2);
    assert_eq!(sessions[1].kind, SessionKind::Break);
    assert_eq!(sessions[1].duration_seconds, 3);
    assert_eq!(sessions[2].kind, SessionKind::Work);
    assert!(sessions[2].is_open());
    assert_eq!(sessions[2].duration_seconds, 0);
}

#[test]
fn failed_switch_rolls_back_database_transition_and_leaves_engine_on_original_task() {
    let (mut conn, list_id) = fixture();
    let first = task(&mut conn, list_id, "First");
    let completed_target = task(&mut conn, list_id, "Completed target");
    complete_task(&mut conn, completed_target, T1).expect("complete switch target");
    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(&mut conn, first, TimerMode::CountUp, 0, T0)
        .unwrap();
    let original_session = runtime.open_session_id().unwrap();

    let error = runtime
        .switch_task(&mut conn, completed_target, TimerMode::CountUp, 2_000, T2)
        .expect_err("completed target must reject switch persistence");
    assert!(matches!(
        error,
        TimerRuntimeError::Session(SessionStoreError::TaskNotActive(id)) if id == completed_target
    ));

    let snapshot = runtime.snapshot(2_000).unwrap();
    assert_eq!(snapshot.timer.state, TimerStateKind::Running);
    assert_eq!(snapshot.timer.task_id, Some(first));
    assert_eq!(snapshot.timer.work_elapsed_ms, 2_000);
    assert_eq!(snapshot.open_session_id, Some(original_session));

    let open = get_open_session(&conn).unwrap().expect("original session remains open");
    assert_eq!(open.id, original_session);
    assert_eq!(open.task_id, Some(first));
    assert!(open.is_open());
    assert!(sessions_for_task(&conn, completed_target).unwrap().is_empty());
}

#[test]
fn successful_switch_atomically_closes_previous_row_and_opens_target_row() {
    let (mut conn, list_id) = fixture();
    let first = task(&mut conn, list_id, "First");
    let second = task(&mut conn, list_id, "Second");
    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(&mut conn, first, TimerMode::CountUp, 0, T0)
        .unwrap();

    let switched = runtime
        .switch_task(&mut conn, second, TimerMode::CountUp, 2_500, T2_5)
        .expect("switch task");
    assert_eq!(switched.timer.previous.task_id, first);
    assert_eq!(switched.timer.previous.work_elapsed_ms, 2_500);
    assert_eq!(switched.previous_session.duration_seconds, 2);
    assert!(!switched.previous_session.is_open());
    assert_eq!(switched.current_session.task_id, Some(second));
    assert!(switched.current_session.is_open());
    assert_eq!(get_open_session(&conn).unwrap().unwrap().id, switched.current_session.id);

    let finished = runtime
        .finish_task(&mut conn, 5_500, T5)
        .expect("finish switched target");
    assert_eq!(finished.timer.task_id, second);
    assert_eq!(finished.closed_session.duration_seconds, 3);
    assert_eq!(task_time_taken_seconds(&conn, first).unwrap(), 2);
    assert_eq!(task_time_taken_seconds(&conn, second).unwrap(), 3);
}
