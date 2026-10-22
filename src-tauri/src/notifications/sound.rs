//! Ephemeral, bounded delivery to the one persistent sound renderer.
use crate::error::{CommandError, CommandResult};
use serde::Serialize;
use std::{
    collections::VecDeque,
    sync::Mutex,
    time::{Duration, Instant},
};
use tauri::{Emitter, Manager};

const MAX_PENDING: usize = 16;
const MAX_AGE: Duration = Duration::from_secs(30);
const EVENT: &str = "notification-sound-ready";

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct NotificationSoundRequest {
    pub sound_id: String,
    pub volume_percent: u8,
}

#[derive(Default)]
struct SoundQueue(VecDeque<(Instant, NotificationSoundRequest)>);

impl SoundQueue {
    fn push(&mut self, now: Instant, request: NotificationSoundRequest) {
        self.0
            .retain(|(at, _)| now.saturating_duration_since(*at) < MAX_AGE);
        if self.0.len() == MAX_PENDING {
            self.0.pop_front();
        }
        self.0.push_back((now, request));
    }
    fn drain(&mut self, now: Instant) -> Vec<NotificationSoundRequest> {
        self.0
            .drain(..)
            .filter(|(at, _)| now.saturating_duration_since(*at) < MAX_AGE)
            .map(|(_, request)| request)
            .collect()
    }
}

static PENDING: Mutex<SoundQueue> = Mutex::new(SoundQueue(VecDeque::new()));

fn request_from_preferences(
    payload: &crate::domain::preferences::PreferencesPayload,
) -> Option<NotificationSoundRequest> {
    let alerts = &payload.alerts;
    if !alerts.notification_alerts_enabled || alerts.notification_volume_percent == 0 {
        return None;
    }
    Some(NotificationSoundRequest {
        sound_id: alerts
            .notification_sound
            .clone()
            .unwrap_or_else(|| "futuristic-ding".into()),
        volume_percent: alerts.notification_volume_percent,
    })
}

pub fn enqueue(app: &tauri::AppHandle) -> CommandResult<()> {
    // Read committed settings without opening/migrating storage or querying autostart.
    let read_error = |error: String| CommandError::new("NOTIFICATION_SOUND_SETTINGS_FAILED", error);
    let path = app
        .path()
        .app_data_dir()
        .map_err(|e| read_error(e.to_string()))?
        .join("narro.db");
    let conn =
        rusqlite::Connection::open_with_flags(path, rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY)
            .map_err(|e| read_error(e.to_string()))?;
    conn.busy_timeout(Duration::from_millis(250))
        .map_err(|e| read_error(e.to_string()))?;
    let record = crate::persistence::preferences::get_preferences(&conn)
        .map_err(|e| read_error(e.to_string()))?
        .ok_or_else(|| read_error("Notification Preferences are missing.".into()))?;
    let Some(request) = request_from_preferences(&record.payload) else {
        return Ok(());
    };
    drop(conn);
    PENDING
        .lock()
        .map_err(|_| {
            CommandError::new(
                "NOTIFICATION_SOUND_QUEUE_FAILED",
                "Sound queue lock is poisoned.",
            )
        })?
        .push(Instant::now(), request);
    // Wake hint only: startup recovery drains the queue even if this hint is lost.
    app.emit_to("focusSurface", EVENT, ())
        .map_err(|e| CommandError::new("NOTIFICATION_SOUND_WAKE_FAILED", e.to_string()))
}

#[tauri::command]
pub fn drain_notification_sounds(
    window: tauri::WebviewWindow,
) -> CommandResult<Vec<NotificationSoundRequest>> {
    if window.label() != "focusSurface" {
        return Err(CommandError::new(
            "NOTIFICATION_SOUND_OWNER_REQUIRED",
            "Only the persistent Focus renderer may claim sounds.",
        ));
    }
    Ok(PENDING
        .lock()
        .map_err(|_| {
            CommandError::new(
                "NOTIFICATION_SOUND_QUEUE_FAILED",
                "Sound queue lock is poisoned.",
            )
        })?
        .drain(Instant::now()))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn mute_disabled_and_selected_sound_are_applied_at_submission() {
        let mut prefs = crate::domain::preferences::PreferencesPayload::default();
        assert!(request_from_preferences(&prefs).is_none());
        prefs.alerts.notification_alerts_enabled = true;
        prefs.alerts.notification_volume_percent = 100;
        assert_eq!(
            request_from_preferences(&prefs).unwrap().sound_id,
            "futuristic-ding"
        );
        prefs.alerts.notification_sound = Some("quick-chime".into());
        assert_eq!(
            request_from_preferences(&prefs).unwrap(),
            NotificationSoundRequest {
                sound_id: "quick-chime".into(),
                volume_percent: 100
            }
        );
        prefs.alerts.notification_volume_percent = 0;
        assert!(request_from_preferences(&prefs).is_none());
    }
    #[test]
    fn queue_is_bounded_fresh_and_claimed_once() {
        let now = Instant::now();
        let mut queue = SoundQueue::default();
        for index in 0..20 {
            queue.push(
                now,
                NotificationSoundRequest {
                    sound_id: index.to_string(),
                    volume_percent: 100,
                },
            );
        }
        let claimed = queue.drain(now);
        assert_eq!(claimed.len(), MAX_PENDING);
        assert_eq!(claimed[0].sound_id, "4");
        assert!(queue.drain(now).is_empty());
        queue.push(now, claimed[0].clone());
        assert!(queue.drain(now + MAX_AGE).is_empty());
    }
}
