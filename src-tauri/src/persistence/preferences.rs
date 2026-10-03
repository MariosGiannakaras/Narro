use crate::domain::preferences::{
    is_local_sound_id, PreferencesPayload, PreferencesRecord, PREFERENCES_SCHEMA_VERSION,
};
use chrono::DateTime;
use rusqlite::{params, Connection, OptionalExtension, TransactionBehavior};
use std::fmt::{Display, Formatter};

const MIN_SUPPORTED_PREFERENCES_SCHEMA_VERSION: u32 = 1;
const MAX_TOKEN_BYTES: usize = 256;
const MAX_DURATION_SECONDS: u32 = 24 * 60 * 60;
const MAX_REMINDER_LEAD_SECONDS: u32 = 7 * 24 * 60 * 60;

#[derive(Debug)]
pub enum PreferenceStoreError {
    Sqlite(rusqlite::Error),
    Json(serde_json::Error),
    InvalidTimestamp,
    InvalidStoredSchemaVersion(i64),
    UnsupportedSchemaVersion(u32),
    InvalidToken(&'static str),
    InvalidSoundId(&'static str),
    InvalidDuration(&'static str, u32),
    InvalidVolume(&'static str, u8),
    FunGifRequiresSuccessScreen,
    MissingAfterWrite,
}

impl Display for PreferenceStoreError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "preference persistence failed: {error}"),
            Self::Json(error) => write!(formatter, "preference payload JSON is invalid: {error}"),
            Self::InvalidTimestamp => {
                formatter.write_str("preference mutation timestamp must be RFC 3339")
            }
            Self::InvalidStoredSchemaVersion(version) => {
                write!(
                    formatter,
                    "stored preference schema version is invalid: {version}"
                )
            }
            Self::UnsupportedSchemaVersion(version) => {
                write!(
                    formatter,
                    "unsupported preference schema version: {version}"
                )
            }
            Self::InvalidToken(field) => {
                write!(
                    formatter,
                    "preference field contains an invalid token: {field}"
                )
            }
            Self::InvalidSoundId(field) => {
                write!(
                    formatter,
                    "preference sound is not in the local Narro catalog: {field}"
                )
            }
            Self::InvalidDuration(field, seconds) => {
                write!(
                    formatter,
                    "preference duration is invalid for {field}: {seconds}"
                )
            }
            Self::InvalidVolume(field, percent) => {
                write!(
                    formatter,
                    "preference volume is invalid for {field}: {percent}"
                )
            }
            Self::FunGifRequiresSuccessScreen => {
                formatter.write_str("fun GIF preference requires the success screen to be enabled")
            }
            Self::MissingAfterWrite => {
                formatter.write_str("preferences disappeared after persistence write")
            }
        }
    }
}

impl std::error::Error for PreferenceStoreError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Json(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for PreferenceStoreError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<serde_json::Error> for PreferenceStoreError {
    fn from(value: serde_json::Error) -> Self {
        Self::Json(value)
    }
}

fn validate_timestamp(value: &str) -> Result<(), PreferenceStoreError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| PreferenceStoreError::InvalidTimestamp)
}

fn validate_optional_token(
    field: &'static str,
    value: Option<&str>,
) -> Result<(), PreferenceStoreError> {
    let Some(value) = value else {
        return Ok(());
    };
    if value.trim().is_empty()
        || value.len() > MAX_TOKEN_BYTES
        || value.chars().any(char::is_control)
    {
        return Err(PreferenceStoreError::InvalidToken(field));
    }
    Ok(())
}

fn validate_optional_sound(
    field: &'static str,
    value: Option<&str>,
) -> Result<(), PreferenceStoreError> {
    validate_optional_token(field, value)?;
    if let Some(value) = value {
        if !is_local_sound_id(value) {
            return Err(PreferenceStoreError::InvalidSoundId(field));
        }
    }
    Ok(())
}

fn validate_volume(field: &'static str, value: u8) -> Result<(), PreferenceStoreError> {
    if value > 100 {
        return Err(PreferenceStoreError::InvalidVolume(field, value));
    }
    Ok(())
}

fn validate_duration(field: &'static str, value: u32) -> Result<(), PreferenceStoreError> {
    if value == 0 || value > MAX_DURATION_SECONDS {
        return Err(PreferenceStoreError::InvalidDuration(field, value));
    }
    Ok(())
}

pub fn validate_preferences(payload: &PreferencesPayload) -> Result<(), PreferenceStoreError> {
    validate_optional_token(
        "general.selected_monitor_key",
        payload.general.selected_monitor_key.as_deref(),
    )?;
    validate_optional_token("general.timezone", payload.general.timezone.as_deref())?;
    validate_duration(
        "focus.pomodoro_work_seconds",
        payload.focus.pomodoro_work_seconds,
    )?;
    validate_duration(
        "focus.pomodoro_break_seconds",
        payload.focus.pomodoro_break_seconds,
    )?;
    validate_duration(
        "focus.default_break_seconds",
        payload.focus.default_break_seconds,
    )?;
    validate_duration(
        "alerts.task_alert_interval_seconds",
        payload.alerts.task_alert_interval_seconds,
    )?;
    if payload.alerts.reminder_lead_seconds == 0
        || payload.alerts.reminder_lead_seconds > MAX_REMINDER_LEAD_SECONDS
    {
        return Err(PreferenceStoreError::InvalidDuration(
            "alerts.reminder_lead_seconds",
            payload.alerts.reminder_lead_seconds,
        ));
    }
    validate_optional_sound(
        "alerts.task_alert_sound",
        payload.alerts.task_alert_sound.as_deref(),
    )?;
    validate_volume(
        "alerts.task_alert_volume_percent",
        payload.alerts.task_alert_volume_percent,
    )?;
    validate_optional_sound(
        "alerts.notification_sound",
        payload.alerts.notification_sound.as_deref(),
    )?;
    validate_volume(
        "alerts.notification_volume_percent",
        payload.alerts.notification_volume_percent,
    )?;
    validate_optional_sound(
        "celebration.success_sound",
        payload.celebration.success_sound.as_deref(),
    )?;
    validate_volume(
        "celebration.success_sound_volume_percent",
        payload.celebration.success_sound_volume_percent,
    )?;
    if payload.celebration.fun_gif && !payload.celebration.show_success_screen {
        return Err(PreferenceStoreError::FunGifRequiresSuccessScreen);
    }
    Ok(())
}

fn decode_preferences(
    schema_version: i64,
    payload_json: String,
    updated_at: String,
) -> Result<PreferencesRecord, PreferenceStoreError> {
    let schema_version = u32::try_from(schema_version)
        .map_err(|_| PreferenceStoreError::InvalidStoredSchemaVersion(schema_version))?;
    if !(MIN_SUPPORTED_PREFERENCES_SCHEMA_VERSION..=PREFERENCES_SCHEMA_VERSION)
        .contains(&schema_version)
    {
        return Err(PreferenceStoreError::UnsupportedSchemaVersion(
            schema_version,
        ));
    }
    let payload: PreferencesPayload = serde_json::from_str(&payload_json)?;
    validate_preferences(&payload)?;
    Ok(PreferencesRecord {
        schema_version,
        payload,
        updated_at,
    })
}

pub fn get_preferences(
    conn: &Connection,
) -> Result<Option<PreferencesRecord>, PreferenceStoreError> {
    let raw: Option<(i64, String, String)> = conn
        .query_row(
            "SELECT schema_version, payload_json, updated_at
             FROM preferences
             WHERE id = 1",
            [],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .optional()?;
    raw.map(|(version, payload, updated_at)| decode_preferences(version, payload, updated_at))
        .transpose()
}

pub fn initialize_preferences(
    conn: &mut Connection,
    now: &str,
) -> Result<PreferencesRecord, PreferenceStoreError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    if let Some(existing) = get_preferences(&tx)? {
        tx.commit()?;
        return Ok(existing);
    }

    let payload = PreferencesPayload::default();
    validate_preferences(&payload)?;
    let payload_json = serde_json::to_string(&payload)?;
    tx.execute(
        "INSERT INTO preferences (id, schema_version, payload_json, updated_at)
         VALUES (1, ?1, ?2, ?3)",
        params![i64::from(PREFERENCES_SCHEMA_VERSION), payload_json, now],
    )?;
    let created = get_preferences(&tx)?.ok_or(PreferenceStoreError::MissingAfterWrite)?;
    tx.commit()?;
    Ok(created)
}

pub fn mutate_preferences(
    conn: &mut Connection,
    now: &str,
    mutate: impl FnOnce(&mut PreferencesPayload),
) -> Result<PreferencesRecord, PreferenceStoreError> {
    validate_timestamp(now)?;
    // Acquire the writer reservation before reading the current JSON. A deferred
    // read-to-write upgrade can deadlock with a timer/background writer and
    // return SQLITE_BUSY immediately instead of honoring the busy timeout.
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let mut payload = get_preferences(&tx)?
        .map(|record| record.payload)
        .unwrap_or_default();
    mutate(&mut payload);
    validate_preferences(&payload)?;
    let payload_json = serde_json::to_string(&payload)?;
    tx.execute(
        "INSERT INTO preferences (id, schema_version, payload_json, updated_at)
         VALUES (1, ?1, ?2, ?3)
         ON CONFLICT(id) DO UPDATE SET
            schema_version = excluded.schema_version,
            payload_json = excluded.payload_json,
            updated_at = excluded.updated_at",
        params![i64::from(PREFERENCES_SCHEMA_VERSION), payload_json, now],
    )?;
    let saved = get_preferences(&tx)?.ok_or(PreferenceStoreError::MissingAfterWrite)?;
    tx.commit()?;
    Ok(saved)
}

pub fn save_preferences(
    conn: &mut Connection,
    payload: PreferencesPayload,
    now: &str,
) -> Result<PreferencesRecord, PreferenceStoreError> {
    validate_timestamp(now)?;
    validate_preferences(&payload)?;
    let payload_json = serde_json::to_string(&payload)?;
    let tx = conn.transaction()?;
    tx.execute(
        "INSERT INTO preferences (id, schema_version, payload_json, updated_at)
         VALUES (1, ?1, ?2, ?3)
         ON CONFLICT(id) DO UPDATE SET
            schema_version = excluded.schema_version,
            payload_json = excluded.payload_json,
            updated_at = excluded.updated_at",
        params![i64::from(PREFERENCES_SCHEMA_VERSION), payload_json, now],
    )?;
    let saved = get_preferences(&tx)?.ok_or(PreferenceStoreError::MissingAfterWrite)?;
    tx.commit()?;
    Ok(saved)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::preferences::SleepAccountingPolicy;
    use crate::persistence::run_migrations;

    const NOW: &str = "2026-09-05T14:00:00Z";

    #[test]
    fn invalid_nested_celebration_state_is_rejected() {
        let mut payload = PreferencesPayload::default();
        payload.celebration.fun_gif = true;
        assert!(matches!(
            validate_preferences(&payload),
            Err(PreferenceStoreError::FunGifRequiresSuccessScreen)
        ));
    }

    #[test]
    fn invalid_duration_and_control_token_are_rejected() {
        let mut duration = PreferencesPayload::default();
        duration.focus.default_break_seconds = 0;
        assert!(matches!(
            validate_preferences(&duration),
            Err(PreferenceStoreError::InvalidDuration(
                "focus.default_break_seconds",
                0
            ))
        ));

        let mut token = PreferencesPayload::default();
        token.general.timezone = Some("Europe/Athens\n".into());
        assert!(matches!(
            validate_preferences(&token),
            Err(PreferenceStoreError::InvalidToken("general.timezone"))
        ));
    }

    #[test]
    fn invalid_sound_id_and_volume_are_rejected() {
        let mut sound = PreferencesPayload::default();
        sound.alerts.task_alert_sound = Some("https://example.com/remote.wav".into());
        assert!(matches!(
            validate_preferences(&sound),
            Err(PreferenceStoreError::InvalidSoundId(
                "alerts.task_alert_sound"
            ))
        ));

        let mut volume = PreferencesPayload::default();
        volume.alerts.notification_volume_percent = 101;
        assert!(matches!(
            validate_preferences(&volume),
            Err(PreferenceStoreError::InvalidVolume(
                "alerts.notification_volume_percent",
                101
            ))
        ));
    }

    #[test]
    fn legacy_v1_payload_without_sleep_policy_loads_with_safe_exclude_default() {
        let mut conn = Connection::open_in_memory().expect("open database");
        run_migrations(&mut conn).expect("migrate database");
        let mut value = serde_json::to_value(PreferencesPayload::default()).unwrap();
        value["focus"]
            .as_object_mut()
            .unwrap()
            .remove("sleep_accounting_policy");
        conn.execute(
            "INSERT INTO preferences (id, schema_version, payload_json, updated_at)
             VALUES (1, 1, ?1, ?2)",
            params![value.to_string(), NOW],
        )
        .unwrap();

        let loaded = get_preferences(&conn).unwrap().unwrap();
        assert_eq!(loaded.schema_version, 1);
        assert_eq!(
            loaded.payload.focus.sleep_accounting_policy,
            SleepAccountingPolicy::Exclude
        );
    }

    #[test]
    fn atomic_mutation_preserves_unrelated_latest_fields() {
        let mut conn = Connection::open_in_memory().expect("open database");
        run_migrations(&mut conn).expect("migrate database");
        mutate_preferences(&mut conn, NOW, |payload| {
            payload.general.open_on_login = true;
        })
        .expect("save first field");
        mutate_preferences(&mut conn, "2026-09-05T14:01:00Z", |payload| {
            payload.shortcuts.find_focus_timer_enabled = false;
        })
        .expect("save shortcut field");

        let saved = get_preferences(&conn).unwrap().unwrap();
        assert!(saved.payload.general.open_on_login);
        assert!(!saved.payload.shortcuts.find_focus_timer_enabled);
    }

    #[test]
    fn preference_patch_waits_for_writer_and_preserves_its_latest_fields() {
        use std::sync::mpsc;
        use std::time::Duration;

        let path = std::env::temp_dir().join(format!(
            "narro-preference-contention-{}.sqlite",
            uuid::Uuid::new_v4()
        ));
        let mut writer = Connection::open(&path).expect("open writer database");
        run_migrations(&mut writer).expect("migrate database");
        mutate_preferences(&mut writer, NOW, |payload| {
            payload.celebration.show_success_screen = false;
        })
        .expect("seed disabled success screen");
        let mut payload = get_preferences(&writer).unwrap().unwrap().payload;
        payload.general.hide_task_times = true;
        let writer_tx = writer
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .expect("hold competing writer");
        writer_tx
            .execute(
                "UPDATE preferences SET payload_json = ?1 WHERE id = 1",
                params![serde_json::to_string(&payload).unwrap()],
            )
            .expect("write unrelated field before commit");

        let (started_tx, started_rx) = mpsc::channel();
        let (read_tx, read_rx) = mpsc::channel();
        let patch_path = path.clone();
        let patch = std::thread::spawn(move || {
            let mut conn = Connection::open(patch_path).expect("open patch database");
            conn.busy_timeout(Duration::from_secs(2))
                .expect("bounded writer wait");
            started_tx.send(()).unwrap();
            mutate_preferences(&mut conn, NOW, |payload| {
                read_tx.send(()).unwrap();
                payload.celebration.show_success_screen = true;
            })
        });
        started_rx.recv().expect("patch worker started");
        let read_while_writer_held = read_rx.recv_timeout(Duration::from_millis(100));
        writer_tx.commit().expect("release competing writer");
        let patched = patch.join().expect("patch worker finished");
        let saved = get_preferences(&writer).unwrap().unwrap();
        drop(writer);
        std::fs::remove_file(path).expect("remove isolated test database");

        assert!(matches!(
            read_while_writer_held,
            Err(mpsc::RecvTimeoutError::Timeout)
        ));
        patched.expect("patch waits instead of failing a read-to-write lock upgrade");
        assert!(saved.payload.celebration.show_success_screen);
        assert!(saved.payload.general.hide_task_times);
    }

    #[test]
    fn legacy_v2_payload_without_shortcut_preferences_defaults_enabled() {
        let mut conn = Connection::open_in_memory().expect("open database");
        run_migrations(&mut conn).expect("migrate database");
        let mut value = serde_json::to_value(PreferencesPayload::default()).unwrap();
        value
            .as_object_mut()
            .expect("preferences object")
            .remove("shortcuts");
        conn.execute(
            "INSERT INTO preferences (id, schema_version, payload_json, updated_at)
             VALUES (1, 2, ?1, ?2)",
            params![value.to_string(), NOW],
        )
        .unwrap();

        let loaded = get_preferences(&conn).unwrap().unwrap();
        assert_eq!(loaded.schema_version, 2);
        assert!(loaded.payload.shortcuts.go_to_narro_enabled);
        assert!(loaded.payload.shortcuts.toggle_focus_mode_enabled);
        assert!(loaded.payload.shortcuts.find_focus_timer_enabled);
    }

    #[test]
    fn save_writes_current_schema_and_round_trips_count_sleep_policy() {
        let mut conn = Connection::open_in_memory().expect("open database");
        run_migrations(&mut conn).expect("migrate database");
        let mut payload = PreferencesPayload::default();
        payload.focus.sleep_accounting_policy = SleepAccountingPolicy::Count;

        let saved = save_preferences(&mut conn, payload.clone(), NOW).unwrap();
        assert_eq!(saved.schema_version, PREFERENCES_SCHEMA_VERSION);
        assert_eq!(saved.payload, payload);
        assert_eq!(get_preferences(&conn).unwrap().unwrap(), saved);
    }
}
