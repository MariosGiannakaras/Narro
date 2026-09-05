use crate::domain::ids::TaskId;
use crate::domain::tasks::SetTaskTimeTakenInput;
use crate::domain::timer_events::{TimerSessionPayload, TIMER_SESSION_EVENT_NAME};
use crate::error::{CommandError, CommandResult};
use crate::persistence::timer_controller::{TimerController, TimerControllerError};
use crate::timer::TimerMode;
use chrono::{SecondsFormat, Utc};
use rusqlite::Connection;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{Emitter, Manager, State};

const BACKGROUND_ADVANCE_INTERVAL: Duration = Duration::from_millis(250);

pub struct TimerService {
    controller: Mutex<TimerController>,
    monotonic_origin: Instant,
}

impl TimerService {
    pub fn recover(connection: Connection) -> Result<Self, TimerControllerError> {
        let monotonic_origin = Instant::now();
        let wall_time = current_wall_time();
        let controller = TimerController::recover(connection, 0, &wall_time)?;
        Ok(Self {
            controller: Mutex::new(controller),
            monotonic_origin,
        })
    }

    pub fn snapshot(&self) -> CommandResult<TimerSessionPayload> {
        let controller = self
            .controller
            .lock()
            .map_err(|_| CommandError::timer_service_lock_poisoned())?;
        Ok(controller.snapshot())
    }

    pub fn advance(&self) -> CommandResult<Option<TimerSessionPayload>> {
        let now_ms = self.now_ms()?;
        let wall_time = current_wall_time();
        let mut controller = self
            .controller
            .lock()
            .map_err(|_| CommandError::timer_service_lock_poisoned())?;
        controller
            .advance(now_ms, &wall_time)
            .map_err(CommandError::timer_operation)
    }

    pub fn start_task(
        &self,
        task_id: TaskId,
        mode: TimerMode,
    ) -> CommandResult<TimerSessionPayload> {
        self.transition(|controller, now_ms, wall_time| {
            controller.start_task(task_id, mode, now_ms, wall_time)
        })
    }

    pub fn pause(&self) -> CommandResult<TimerSessionPayload> {
        self.transition(TimerController::pause)
    }

    pub fn resume(&self) -> CommandResult<TimerSessionPayload> {
        self.transition(TimerController::resume)
    }

    pub fn extend(&self) -> CommandResult<TimerSessionPayload> {
        self.transition(TimerController::extend)
    }

    pub fn start_manual_break(&self, duration_ms: u64) -> CommandResult<TimerSessionPayload> {
        self.transition(|controller, now_ms, wall_time| {
            controller.start_manual_break(duration_ms, now_ms, wall_time)
        })
    }

    pub fn finish_break(&self) -> CommandResult<TimerSessionPayload> {
        self.transition(TimerController::finish_break)
    }

    pub fn skip_break(&self) -> CommandResult<TimerSessionPayload> {
        self.transition(TimerController::skip_break)
    }

    pub fn complete_task(&self) -> CommandResult<TimerSessionPayload> {
        self.transition(TimerController::complete_task)
    }

    pub fn skip_task(&self) -> CommandResult<TimerSessionPayload> {
        self.transition(TimerController::skip_task)
    }

    pub fn switch_task(
        &self,
        task_id: TaskId,
        mode: TimerMode,
    ) -> CommandResult<TimerSessionPayload> {
        self.transition(|controller, now_ms, wall_time| {
            controller.switch_task(task_id, mode, now_ms, wall_time)
        })
    }

    pub fn set_time_taken_while_paused(
        &self,
        total_seconds: u32,
    ) -> CommandResult<TimerSessionPayload> {
        self.transition(|controller, now_ms, wall_time| {
            controller.set_time_taken_while_paused(
                SetTaskTimeTakenInput { total_seconds },
                now_ms,
                wall_time,
            )
        })
    }

    fn transition<F>(&self, transition: F) -> CommandResult<TimerSessionPayload>
    where
        F: FnOnce(
            &mut TimerController,
            u64,
            &str,
        ) -> Result<TimerSessionPayload, TimerControllerError>,
    {
        let now_ms = self.now_ms()?;
        let wall_time = current_wall_time();
        let mut controller = self
            .controller
            .lock()
            .map_err(|_| CommandError::timer_service_lock_poisoned())?;
        transition(&mut controller, now_ms, &wall_time).map_err(CommandError::timer_operation)
    }

    fn now_ms(&self) -> CommandResult<u64> {
        u64::try_from(self.monotonic_origin.elapsed().as_millis())
            .map_err(|_| CommandError::timer_clock_overflow())
    }
}

fn current_wall_time() -> String {
    Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true)
}

fn parse_task_id(value: &str) -> CommandResult<TaskId> {
    TaskId::parse_str(value).map_err(|error| CommandError::invalid_argument("taskId", error))
}

fn report_timer_change(app_handle: &tauri::AppHandle, payload: &TimerSessionPayload) {
    if let Err(error) = app_handle.emit(TIMER_SESSION_EVENT_NAME, payload.clone()) {
        eprintln!(
            "Warning: timer/session revision {} committed, but broadcast failed: {error}",
            payload.revision
        );
    }
}

fn report_command_payload(
    app_handle: &tauri::AppHandle,
    payload: TimerSessionPayload,
) -> TimerSessionPayload {
    report_timer_change(app_handle, &payload);
    payload
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_session_snapshot(
    timer_service: State<'_, TimerService>,
) -> CommandResult<TimerSessionPayload> {
    timer_service.snapshot()
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_start_task(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
    task_id: String,
    mode: TimerMode,
) -> CommandResult<TimerSessionPayload> {
    let task_id = parse_task_id(&task_id)?;
    timer_service
        .start_task(task_id, mode)
        .map(|payload| report_command_payload(&app_handle, payload))
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_pause(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
) -> CommandResult<TimerSessionPayload> {
    timer_service
        .pause()
        .map(|payload| report_command_payload(&app_handle, payload))
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_resume(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
) -> CommandResult<TimerSessionPayload> {
    timer_service
        .resume()
        .map(|payload| report_command_payload(&app_handle, payload))
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_extend(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
) -> CommandResult<TimerSessionPayload> {
    timer_service
        .extend()
        .map(|payload| report_command_payload(&app_handle, payload))
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_start_manual_break(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
    duration_ms: u64,
) -> CommandResult<TimerSessionPayload> {
    timer_service
        .start_manual_break(duration_ms)
        .map(|payload| report_command_payload(&app_handle, payload))
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_finish_break(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
) -> CommandResult<TimerSessionPayload> {
    timer_service
        .finish_break()
        .map(|payload| report_command_payload(&app_handle, payload))
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_skip_break(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
) -> CommandResult<TimerSessionPayload> {
    timer_service
        .skip_break()
        .map(|payload| report_command_payload(&app_handle, payload))
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_complete_task(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
) -> CommandResult<TimerSessionPayload> {
    timer_service
        .complete_task()
        .map(|payload| report_command_payload(&app_handle, payload))
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_skip_task(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
) -> CommandResult<TimerSessionPayload> {
    timer_service
        .skip_task()
        .map(|payload| report_command_payload(&app_handle, payload))
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_switch_task(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
    task_id: String,
    mode: TimerMode,
) -> CommandResult<TimerSessionPayload> {
    let task_id = parse_task_id(&task_id)?;
    timer_service
        .switch_task(task_id, mode)
        .map(|payload| report_command_payload(&app_handle, payload))
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_set_time_taken(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
    total_seconds: u32,
) -> CommandResult<TimerSessionPayload> {
    timer_service
        .set_time_taken_while_paused(total_seconds)
        .map(|payload| report_command_payload(&app_handle, payload))
}

pub fn install_background_advance(app_handle: tauri::AppHandle) {
    if let Err(error) = std::thread::Builder::new()
        .name("narro-timer-runtime".to_owned())
        .spawn(move || loop {
            std::thread::sleep(BACKGROUND_ADVANCE_INTERVAL);
            let timer_service = app_handle.state::<TimerService>();
            match timer_service.advance() {
                Ok(Some(payload)) => report_timer_change(&app_handle, &payload),
                Ok(None) => {}
                Err(error) => eprintln!("Timer background advance failed: {error}"),
            }
        })
    {
        eprintln!("Fatal: failed to start authoritative timer runtime thread: {error}");
        std::process::exit(1);
    }
}
