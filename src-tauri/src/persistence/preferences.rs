use crate::domain::preferences::{
    PreferencesPayload, PreferencesRecord, PREFERENCES_SCHEMA_VERSION,
};
use chrono::DateTime;
use rusqlite::{params, Connection, OptionalExtension};
use std::fmt::{Display, Formatter};

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
    InvalidDuration(&'static str, u32),
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
            Self::InvalidDuration(field, seconds) => {
                write!(
                    formatter,
                    "preference duration is invalid for {field}: {seconds}"
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
    validate_optional_token(
        "alerts.task_alert_sound",
        payload.alerts.task_alert_sound.as_deref(),
    )?;
    validate_optional_token(
        "alerts.notification_sound",
        payload.alerts.notification_sound.as_deref(),
    )?;
    validate_optional_token(
        "celebration.success_sound",
        payload.celebration.success_sound.as_deref(),
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
    if schema_version != PREFERENCES_SCHEMA_VERSION {
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
}
