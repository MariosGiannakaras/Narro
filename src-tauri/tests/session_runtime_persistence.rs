#[allow(dead_code)]
mod support;

use narro_lib::domain::ids::SessionId;
use narro_lib::domain::model::{PlanningLane, SessionKind};
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::sessions::{
    active_focus_session, checkpoint_focus_runtime, load_focus_recovery,
    persist_focus_transition, recover_interrupted_focus, sessions_for_task, CloseFocusSession,
    OpenFocusSession,
};
use narro_lib::persistence::task_metadata::task_time_taken_seconds;
use narro_lib::timer::{TimerEngine, TimerMode, TimerStateKind};
use rusqlite::{params, Connection};
use std::fs;
use support::{migrated, ListFixture, TaskFixture};
use uuid::Uuid;

const STARTED_AT: &str = "2026-09-04T08:00:00Z";
const CHECKPOINT_AT: &str = "2026-09-04T08:00:05Z";
const PAUSED_AT: &str = "2026-09-04T08:00:07Z";
const RESUMED_AT: &str = "2026-09-04T08:00:10Z";
const BREAK_AT: &str = "2026-09-04T08:00:13Z";
const BREAK_CHECKPOINT_AT: &str = "2026-09-04T08:00:15Z";
const BREAK_SKIPPED_AT: &str = "2026-09-04T08:00:16Z";
const RESTARTED_AT: &str = "2026-09-04T08:05:00Z";

fn task_fixture(conn: &Connection, slot: u64) -> narro_lib::domain::tasks::TaskRecord {
    let list = ListFixture::new(slot, format!("List {slot}")).insert(conn);
    TaskFixture::new(slot, list.id, format!("Task {slot}"), PlanningLane::Today)
        .rank(0)
        .insert(conn)
}

#[test]
fn work_pause_resume_and_manual_break_persist_distinct_reconcilable_segments() {
    let mut conn = migrated();
    let task = task_fixture(&conn, 40);
    let mut engine = TimerEngine::new();
    engine
        .start_task(task.id, TimerMode::CountUp, 0)
        .expect("start authoritative timer");

    let running = engine
        .recovery_state(0)
        .expect("export initial recovery")
        .expect("active recovery");
    let first = persist_focus_transition(
        &mut conn,
        None,
        Some(OpenFocusSession {
            task_id: task.id,
            kind: SessionKind::Work,
        }),
        &running,
        STARTED_AT,
    )
    .expect("persist first work segment")
    .opened_session
    .expect("first work session");

    let checkpoint = engine
        .recovery_state(5_000)
        .expect("export work checkpoint")
        .expect("active work recovery");
    let checkpointed = checkpoint_focus_runtime(
        &mut conn,
        first.id,
        &checkpoint,
        CHECKPOINT_AT,
    )
    .expect("checkpoint work segment");
    assert_eq!(checkpointed.duration_seconds, 5);
    assert!(checkpointed.ended_at.is_none());

    engine.pause(7_000).expect("pause timer");
    let paused = engine
        .recovery_state(7_000)
        .expect("export paused recovery")
        .expect("paused recovery");
    let paused_transition = persist_focus_transition(
        &mut conn,
        Some(CloseFocusSession {
            id: first.id,
            duration_ms: 7_000,
        }),
        None,
        &paused,
        PAUSED_AT,
    )
    .expect("persist pause transition");
    assert_eq!(
        paused_transition
            .closed_session
            .expect("closed first work segment")
            .duration_seconds,
        7
    );
    assert!(active_focus_session(&conn)
        .expect("query session after pause")
        .is_none());

    engine.resume(10_000).expect("resume timer");
    let resumed = engine
        .recovery_state(10_000)
        .expect("export resumed recovery")
        .expect("resumed recovery");
    let second = persist_focus_transition(
        &mut conn,
        None,
        Some(OpenFocusSession {
            task_id: task.id,
            kind: SessionKind::Work,
        }),
        &resumed,
        RESUMED_AT,
    )
    .expect("persist second work segment")
    .opened_session
    .expect("second work session");

    engine
        .start_manual_break(10_000, 13_000)
        .expect("start manual break");
    let break_recovery = engine
        .recovery_state(13_000)
        .expect("export break recovery")
        .expect("break recovery");
    let break_transition = persist_focus_transition(
        &mut conn,
        Some(CloseFocusSession {
            id: second.id,
            duration_ms: 3_000,
        }),
        Some(OpenFocusSession {
            task_id: task.id,
            kind: SessionKind::Break,
        }),
        &break_recovery,
        BREAK_AT,
    )
    .expect("persist work to break transition");
    assert_eq!(
        break_transition
            .closed_session
            .expect("closed second work segment")
            .duration_seconds,
        3
    );
    let break_session = break_transition
        .opened_session
        .expect("opened break session");

    let break_checkpoint = engine
        .recovery_state(15_000)
        .expect("export break checkpoint")
        .expect("break checkpoint recovery");
    let checkpointed_break = checkpoint_focus_runtime(
        &mut conn,
        break_session.id,
        &break_checkpoint,
        BREAK_CHECKPOINT_AT,
    )
    .expect("checkpoint break session");
    assert_eq!(checkpointed_break.duration_seconds, 2);

    engine.skip_break(16_000).expect("skip manual break");
    let after_break = engine
        .recovery_state(16_000)
        .expect("export post-break recovery")
        .expect("post-break recovery");
    assert_eq!(after_break.state, TimerStateKind::Paused);
    persist_focus_transition(
        &mut conn,
        Some(CloseFocusSession {
            id: break_session.id,
            duration_ms: 3_000,
        }),
        None,
        &after_break,
        BREAK_SKIPPED_AT,
    )
    .expect("persist break skip transition");

    let sessions = sessions_for_task(&conn, task.id).expect("load persisted focus history");
    assert_eq!(sessions.len(), 3);
    assert_eq!(sessions[0].kind, SessionKind::Work);
    assert_eq!(sessions[0].duration_seconds, 7);
    assert_eq!(sessions[1].kind, SessionKind::Work);
    assert_eq!(sessions[1].duration_seconds, 3);
    assert_eq!(sessions[2].kind, SessionKind::Break);
    assert_eq!(sessions[2].duration_seconds, 3);
    assert!(sessions.iter().all(|session| session.ended_at.is_some()));
    assert_eq!(
        task_time_taken_seconds(&conn, task.id).expect("reconcile Time Taken from work rows"),
        10
    );
    assert!(active_focus_session(&conn)
        .expect("query session after break")
        .is_none());

    let recovery = load_focus_recovery(&conn)
        .expect("load paused recovery")
        .expect("recovery row");
    assert_eq!(recovery.timer.state, TimerStateKind::Paused);
    assert_eq!(recovery.timer.work_elapsed_ms, 10_000);
    assert_eq!(recovery.timer.total_break_ms, 3_000);
    assert!(recovery.active_session_id.is_none());
}

#[test]
fn database_rejects_a_second_unfinished_session_even_outside_service_layer() {
    let mut conn = migrated();
    let task = task_fixture(&conn, 41);
    let mut engine = TimerEngine::new();
    engine
        .start_task(task.id, TimerMode::CountUp, 0)
        .expect("start timer");
    let recovery = engine
        .recovery_state(0)
        .expect("export recovery")
        .expect("active recovery");
    persist_focus_transition(
        &mut conn,
        None,
        Some(OpenFocusSession {
            task_id: task.id,
            kind: SessionKind::Work,
        }),
        &recovery,
        STARTED_AT,
    )
    .expect("persist first unfinished session");

    let duplicate = conn.execute(
        "INSERT INTO sessions (
            id, task_id, kind, started_at, ended_at, duration_seconds,
            source, created_at, updated_at
         ) VALUES (?1, ?2, 'work', ?3, NULL, 0, 'focus', ?3, ?3)",
        params![
            SessionId::generate().to_string(),
            task.id.to_string(),
            CHECKPOINT_AT
        ],
    );
    assert!(duplicate.is_err(), "database must enforce one unfinished session");

    let open_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM sessions WHERE ended_at IS NULL",
            [],
            |row| row.get(0),
        )
        .expect("count unfinished sessions");
    assert_eq!(open_count, 1);
}

#[test]
fn database_reopen_restores_interrupted_work_paused_at_last_safe_checkpoint() {
    let path = std::env::temp_dir().join(format!(
        "narro-m3-session-recovery-{}.db",
        Uuid::new_v4()
    ));
    let task_id;
    let session_id;

    {
        let mut conn = Connection::open(&path).expect("open recovery database");
        run_migrations(&mut conn).expect("migrate recovery database");
        let task = task_fixture(&conn, 42);
        task_id = task.id;

        let mut engine = TimerEngine::new();
        engine
            .start_task(task.id, TimerMode::CountUp, 0)
            .expect("start interrupted timer");
        let initial = engine
            .recovery_state(0)
            .expect("export initial recovery")
            .expect("active recovery");
        session_id = persist_focus_transition(
            &mut conn,
            None,
            Some(OpenFocusSession {
                task_id: task.id,
                kind: SessionKind::Work,
            }),
            &initial,
            STARTED_AT,
        )
        .expect("persist interrupted work start")
        .opened_session
        .expect("open interrupted work session")
        .id;

        let checkpoint = engine
            .recovery_state(4_500)
            .expect("export crash checkpoint")
            .expect("checkpoint recovery");
        let persisted = checkpoint_focus_runtime(
            &mut conn,
            session_id,
            &checkpoint,
            CHECKPOINT_AT,
        )
        .expect("persist crash-safe checkpoint");
        assert_eq!(persisted.duration_seconds, 4);
        assert!(persisted.ended_at.is_none());
    }

    {
        let mut reopened = Connection::open(&path).expect("reopen recovery database");
        run_migrations(&mut reopened).expect("re-run migrations after crash");
        let recovered = recover_interrupted_focus(&mut reopened, RESTARTED_AT)
            .expect("recover interrupted focus")
            .expect("interrupted runtime should exist");

        let snapshot = recovered
            .engine
            .snapshot(500_000)
            .expect("snapshot recovered paused runtime");
        assert_eq!(snapshot.state, TimerStateKind::Paused);
        assert_eq!(snapshot.task_id, Some(task_id));
        assert_eq!(snapshot.work_elapsed_ms, 4_500);
        assert_eq!(recovered.last_safe_checkpoint_at, CHECKPOINT_AT);

        let sessions = sessions_for_task(&reopened, task_id).expect("load interrupted history");
        assert_eq!(sessions.len(), 1);
        assert_eq!(sessions[0].id, session_id);
        assert_eq!(sessions[0].duration_seconds, 4);
        assert_eq!(sessions[0].ended_at.as_deref(), Some(CHECKPOINT_AT));
        assert_ne!(sessions[0].ended_at.as_deref(), Some(RESTARTED_AT));
        assert!(active_focus_session(&reopened)
            .expect("query active session after recovery")
            .is_none());

        let recovery = load_focus_recovery(&reopened)
            .expect("load normalized recovery")
            .expect("normalized recovery row");
        assert_eq!(recovery.timer.state, TimerStateKind::Paused);
        assert_eq!(recovery.timer.work_elapsed_ms, 4_500);
        assert!(recovery.active_session_id.is_none());
        assert_eq!(recovery.updated_at, RESTARTED_AT);
    }

    fs::remove_file(path).expect("remove recovery database");
}
