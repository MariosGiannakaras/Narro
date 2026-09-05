use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::preferences::{
    PreferencesPayload, SleepAccountingPolicy, TaskSleepAccountingOverride,
};
use narro_lib::domain::tasks::NewTaskInput;
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::preferences::save_preferences;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::sleep_accounting::{
    session_sleep_accounting_policy, set_task_sleep_accounting_override,
};
use narro_lib::persistence::tasks::create_task;
use narro_lib::timer::runtime::TimerRuntime;
use narro_lib::timer::TimerMode;
use rusqlite::Connection;

const T0: &str = "2026-09-05T14:00:00Z";
const T1: &str = "2026-09-05T14:01:00Z";
const T2: &str = "2026-09-05T14:02:00Z";
const T3: &str = "2026-09-05T14:03:00Z";
const T4: &str = "2026-09-05T14:04:00Z";

fn fixture() -> (
    Connection,
    narro_lib::domain::ids::TaskId,
    narro_lib::domain::ids::TaskId,
) {
    let mut conn = Connection::open_in_memory().expect("open database");
    run_migrations(&mut conn).expect("migrate database");
    let list = create_list(
        &mut conn,
        NewListInput {
            title: "Sleep policy".into(),
            color: None,
            icon_asset: None,
        },
        T0,
    )
    .expect("create list");
    let first = create_task(
        &mut conn,
        NewTaskInput {
            list_id: list.id,
            title: "First".into(),
            manual_lane: PlanningLane::Today,
            est_seconds: None,
        },
        T0,
    )
    .expect("create first task");
    let second = create_task(
        &mut conn,
        NewTaskInput {
            list_id: list.id,
            title: "Second".into(),
            manual_lane: PlanningLane::Today,
            est_seconds: None,
        },
        T0,
    )
    .expect("create second task");
    (conn, first.id, second.id)
}

fn open_policy(conn: &Connection, runtime: &TimerRuntime, now_ms: u64) -> SleepAccountingPolicy {
    let session_id = runtime
        .snapshot(now_ms)
        .expect("snapshot runtime")
        .open_session_id
        .expect("open focus session");
    session_sleep_accounting_policy(conn, session_id).expect("read snapshotted sleep policy")
}

#[test]
fn new_timer_uses_safe_global_exclude_default() {
    let (mut conn, task_id, _) = fixture();
    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
        .expect("start task");

    assert_eq!(
        open_policy(&conn, &runtime, 0),
        SleepAccountingPolicy::Exclude
    );
}

#[test]
fn inherited_global_count_policy_is_snapshotted_when_timer_starts() {
    let (mut conn, task_id, _) = fixture();
    let mut preferences = PreferencesPayload::default();
    preferences.focus.sleep_accounting_policy = SleepAccountingPolicy::Count;
    save_preferences(&mut conn, preferences, T0).expect("save count default");

    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
        .expect("start task");
    assert_eq!(
        open_policy(&conn, &runtime, 0),
        SleepAccountingPolicy::Count
    );
}

#[test]
fn per_task_override_wins_over_global_policy() {
    let (mut conn, task_id, _) = fixture();
    let mut preferences = PreferencesPayload::default();
    preferences.focus.sleep_accounting_policy = SleepAccountingPolicy::Count;
    save_preferences(&mut conn, preferences, T0).unwrap();
    set_task_sleep_accounting_override(
        &mut conn,
        task_id,
        TaskSleepAccountingOverride::Exclude,
        T1,
    )
    .unwrap();

    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T1)
        .unwrap();
    assert_eq!(
        open_policy(&conn, &runtime, 0),
        SleepAccountingPolicy::Exclude
    );
}

#[test]
fn active_session_policy_does_not_change_when_preferences_change_later() {
    let (mut conn, task_id, _) = fixture();
    let mut preferences = PreferencesPayload::default();
    preferences.focus.sleep_accounting_policy = SleepAccountingPolicy::Count;
    save_preferences(&mut conn, preferences, T0).unwrap();

    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
        .unwrap();
    assert_eq!(
        open_policy(&conn, &runtime, 0),
        SleepAccountingPolicy::Count
    );

    let mut changed = PreferencesPayload::default();
    changed.focus.sleep_accounting_policy = SleepAccountingPolicy::Exclude;
    save_preferences(&mut conn, changed, T1).unwrap();
    set_task_sleep_accounting_override(
        &mut conn,
        task_id,
        TaskSleepAccountingOverride::Exclude,
        T2,
    )
    .unwrap();

    assert_eq!(
        open_policy(&conn, &runtime, 5_000),
        SleepAccountingPolicy::Count,
        "an active timer keeps the policy captured when its focus session started"
    );
}

#[test]
fn task_switch_re_resolves_policy_for_target_task() {
    let (mut conn, first, second) = fixture();
    set_task_sleep_accounting_override(&mut conn, first, TaskSleepAccountingOverride::Count, T1)
        .unwrap();
    set_task_sleep_accounting_override(&mut conn, second, TaskSleepAccountingOverride::Exclude, T1)
        .unwrap();

    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(&mut conn, first, TimerMode::CountUp, 0, T1)
        .unwrap();
    assert_eq!(
        open_policy(&conn, &runtime, 0),
        SleepAccountingPolicy::Count
    );

    runtime
        .switch_task(&mut conn, second, TimerMode::CountUp, 10_000, T2)
        .unwrap();
    assert_eq!(
        open_policy(&conn, &runtime, 10_000),
        SleepAccountingPolicy::Exclude
    );
}

#[test]
fn work_break_work_session_replacements_preserve_same_task_policy() {
    let (mut conn, task_id, _) = fixture();
    set_task_sleep_accounting_override(&mut conn, task_id, TaskSleepAccountingOverride::Count, T1)
        .unwrap();

    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T1)
        .unwrap();
    assert_eq!(
        open_policy(&conn, &runtime, 0),
        SleepAccountingPolicy::Count
    );

    runtime
        .start_manual_break(&mut conn, 60_000, 10_000, T2)
        .unwrap();
    assert_eq!(
        open_policy(&conn, &runtime, 10_000),
        SleepAccountingPolicy::Count
    );

    runtime.finish_break(&mut conn, 20_000, T3).unwrap();
    assert_eq!(
        open_policy(&conn, &runtime, 20_000),
        SleepAccountingPolicy::Count
    );

    runtime.pause(&mut conn, 30_000, T4).unwrap();
    assert_eq!(
        open_policy(&conn, &runtime, 30_000),
        SleepAccountingPolicy::Count
    );
}
