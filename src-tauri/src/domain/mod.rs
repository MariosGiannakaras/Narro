use std::sync::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
pub struct AppStatePayload {
    pub active_task: Option<String>,
    pub is_running: bool,
}

pub struct AppState {
    pub data: Mutex<AppStatePayload>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            data: Mutex::new(AppStatePayload {
                active_task: None,
                is_running: false,
            }),
        }
    }
}
