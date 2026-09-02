use std::sync::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
pub struct AppStatePayload {
    pub active_task: Option<String>,
    pub is_running: bool,
    pub counter: i32,
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
                counter: 0,
            }),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_state_mutation() {
        let state = AppState::new();
        
        {
            let mut data = state.data.lock().unwrap();
            assert_eq!(data.is_running, false);
            assert_eq!(data.active_task, None);
            
            data.is_running = true;
            data.active_task = Some("Test Task".into());
        }
        
        {
            let data = state.data.lock().unwrap();
            assert_eq!(data.is_running, true);
            assert_eq!(data.active_task.as_deref(), Some("Test Task"));
        }
    }
}
