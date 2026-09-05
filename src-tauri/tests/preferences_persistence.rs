use narro_lib::domain::preferences::{
    FocusPanelSide, PreferencesPayload, ThemePreference, PREFERENCES_SCHEMA_VERSION,
};
use narro_lib::persistence::preferences::{
    get_preferences, initialize_preferences, save_preferences, PreferenceStoreError,
};
use narro_lib::persistence::run_migrations;
use rusqlite::{params, Connection};
use std::fs;
use uuid::Uuid;

const T1: &str = "2026-09-03T19:00:00Z";
const T2: &str = "2026-09-03T19:01:00Z";
const T3: &str = "2026-09-03T19:02:00Z";

#[test]
fn initialize_preferences_is_idempotent_and_creates_exactly_one_default_row() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");

    assert!(get_preferences(&conn)
        .expect("read empty preference store")
        .is_none());

    let created = initialize_preferences(&mut conn, T1).expect("initialize defaults");
    assert_eq!(created.schema_version, PREFERENCES_SCHEMA_VERSION);
    assert_eq!(created.payload, PreferencesPayload::default());
    assert_eq!(created.updated_at, T1);

    let repeated = initialize_preferences(&mut conn, T2).expect("repeat initialization");
    assert_eq!(repeated, created);

    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM preferences", [], |row| row.get(0))
        .expect("count preference rows");
    assert_eq!(count, 1);
}

#[test]
fn saved_preferences_survive_database_reopen_with_typed_values() {
    let path = std::env::temp_dir().join(format!("narro-preferences-{}.db", Uuid::new_v4()));
    let mut expected = PreferencesPayload::default();
    expected.general.selected_monitor_key = Some("monitor-primary".into());
    expected.general.focus_panel_side = FocusPanelSide::Left;
    expected.general.open_on_login = true;
    expected.general.hide_task_times = true;
    expected.general.auto_parse_est_from_title = true;
    expected.general.theme = ThemePreference::Dark;
    expected.general.timezone = Some("Europe/Athens".into());
    expected.focus.pomodoro_enabled = true;
    expected.focus.pomodoro_work_seconds = 30 * 60;
    expected.focus.pomodoro_break_seconds = 7 * 60;
    expected.focus.default_break_seconds = 12 * 60;
    expected.focus.scrolling_title = true;
    expected.alerts.timed_alerts_enabled = true;
    expected.alerts.task_alert_interval_seconds = 15 * 60;
    expected.alerts.task_alert_sound = Some("melodic-1".into());
    expected.alerts.animated_timer_flash = true;
    expected.alerts.notification_alerts_enabled = true;
    expected.alerts.notification_sound = Some("futuristic-1".into());
    expected.alerts.schedule_reminders_enabled = true;
    expected.alerts.reminder_lead_seconds = 20 * 60;
    expected.celebration.show_success_screen = true;
    expected.celebration.fun_gif = true;
    expected.celebration.success_sound = Some("victory-1".into());

    {
        let mut conn = Connection::open(&path).expect("open temporary database");
        run_migrations(&mut conn).expect("migrate temporary database");
        initialize_preferences(&mut conn, T1).expect("initialize preferences");
        let saved = save_preferences(&mut conn, expected.clone(), T2).expect("save preferences");
        assert_eq!(saved.payload, expected);
        assert_eq!(saved.updated_at, T2);
    }

    {
        let mut reopened = Connection::open(&path).expect("reopen temporary database");
        run_migrations(&mut reopened).expect("re-run migrations after reopen");
        let persisted = get_preferences(&reopened)
            .expect("load persisted preferences")
            .expect("preferences row exists");
        assert_eq!(persisted.schema_version, PREFERENCES_SCHEMA_VERSION);
        assert_eq!(persisted.payload, expected);
        assert_eq!(persisted.updated_at, T2);
    }

    fs::remove_file(path).expect("remove temporary database");
}

#[test]
fn invalid_update_is_rejected_before_existing_preferences_are_replaced() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    let original = initialize_preferences(&mut conn, T1).expect("initialize preferences");

    let mut invalid = original.payload.clone();
    invalid.celebration.fun_gif = true;
    invalid.celebration.show_success_screen = false;
    assert!(matches!(
        save_preferences(&mut conn, invalid, T2),
        Err(PreferenceStoreError::FunGifRequiresSuccessScreen)
    ));

    let persisted = get_preferences(&conn)
        .expect("load preferences after rejected update")
        .expect("preferences still exist");
    assert_eq!(persisted, original);
}

#[test]
fn unsupported_stored_schema_version_is_explicitly_rejected() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    let payload_json =
        serde_json::to_string(&PreferencesPayload::default()).expect("serialize default payload");
    let future_version = PREFERENCES_SCHEMA_VERSION + 1;
    conn.execute(
        "INSERT INTO preferences (id, schema_version, payload_json, updated_at)
         VALUES (1, ?1, ?2, ?3)",
        params![i64::from(future_version), payload_json, T1],
    )
    .expect("insert future schema fixture");

    assert!(matches!(
        get_preferences(&conn),
        Err(PreferenceStoreError::UnsupportedSchemaVersion(version)) if version == future_version
    ));
}

#[test]
fn singleton_schema_rejects_noncanonical_preference_row_ids() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    let payload_json =
        serde_json::to_string(&PreferencesPayload::default()).expect("serialize default payload");
    let result = conn.execute(
        "INSERT INTO preferences (id, schema_version, payload_json, updated_at)
         VALUES (2, ?1, ?2, ?3)",
        params![i64::from(PREFERENCES_SCHEMA_VERSION), payload_json, T3],
    );
    assert!(
        result.is_err(),
        "preferences table must remain singleton id=1"
    );
}
