use crate::domain::ids::TaskId;
use crate::domain::tasks::SetTaskTimeTakenInput;
use crate::domain::timer_events::{TimerSessionPayload, TIMER_SESSION_EVENT_NAME};
use crate::error::{CommandError, CommandResult};
use crate::persistence::timer_controller::{TimerController, TimerControllerError};
use crate::timer::{TimerMode, TimerSnapshot, TimerStateKind};
use chrono::{DateTime, Duration as ChronoDuration, SecondsFormat, Utc};
use rusqlite::Connection;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{Emitter, Manager, State};

const BACKGROUND_ADVANCE_INTERVAL: Duration = Duration::from_millis(250);

struct TimerServiceState {
    controller: TimerController,
    observed_ms: u64,
}

pub struct TimerService {
    state: Mutex<TimerServiceState>,
    monotonic_origin: Instant,
}

impl TimerService {
    pub fn recover(connection: Connection) -> Result<Self, TimerControllerError> {
        let monotonic_origin = Instant::now();
        let wall_time = current_wall_time();
        let controller = TimerController::recover(connection, 0, &wall_time)?;
        Ok(Self {
            state: Mutex::new(TimerServiceState {
                controller,
                observed_ms: 0,
            }),
            monotonic_origin,
        })
    }

    pub fn snapshot(&self) -> CommandResult<TimerSessionPayload> {
        let state = self
            .state
            .lock()
            .map_err(|_| CommandError::timer_service_lock_poisoned())?;
        Ok(state.controller.snapshot())
    }

    pub fn advance_and_report(&self, app_handle: &tauri::AppHandle) -> CommandResult<()> {
        let now_ms = self.now_ms()?;
        let wall_time = current_wall_time();
        let mut state = self
            .state
            .lock()
            .map_err(|_| CommandError::timer_service_lock_poisoned())?;
        let TimerServiceState {
            controller,
            observed_ms,
        } = &mut *state;
        advance_controller_to(controller, observed_ms, now_ms, &wall_time, |payload| {
            report_timer_change(app_handle, payload)
        })
    }

    pub fn start_task(
        &self,
        app_handle: &tauri::AppHandle,
        task_id: TaskId,
        mode: TimerMode,
    ) -> CommandResult<TimerSessionPayload> {
        self.transition(app_handle, |controller, now_ms, wall_time| {
            controller.start_task(task_id, mode, now_ms, wall_time)
        })
    }

    pub fn pause(&self, app_handle: &tauri::AppHandle) -> CommandResult<TimerSessionPayload> {
        self.transition(app_handle, TimerController::pause)
    }

    pub fn resume(&self, app_handle: &tauri::AppHandle) -> CommandResult<TimerSessionPayload> {
        self.transition(app_handle, TimerController::resume)
    }

    pub fn extend(&self, app_handle: &tauri::AppHandle) -> CommandResult<TimerSessionPayload> {
        self.transition(app_handle, TimerController::extend)
    }

    pub fn start_manual_break(
        &self,
        app_handle: &tauri::AppHandle,
        duration_ms: u64,
    ) -> CommandResult<TimerSessionPayload> {
        self.transition(app_handle, |controller, now_ms, wall_time| {
            controller.start_manual_break(duration_ms, now_ms, wall_time)
        })
    }

    pub fn finish_break(
        &self,
        app_handle: &tauri::AppHandle,
    ) -> CommandResult<TimerSessionPayload> {
        self.transition(app_handle, TimerController::finish_break)
    }

    pub fn skip_break(&self, app_handle: &tauri::AppHandle) -> CommandResult<TimerSessionPayload> {
        self.transition(app_handle, TimerController::skip_break)
    }

    pub fn complete_task(
        &self,
        app_handle: &tauri::AppHandle,
    ) -> CommandResult<TimerSessionPayload> {
        self.transition(app_handle, TimerController::complete_task)
    }

    pub fn skip_task(&self, app_handle: &tauri::AppHandle) -> CommandResult<TimerSessionPayload> {
        self.transition(app_handle, TimerController::skip_task)
    }

    pub fn switch_task(
        &self,
        app_handle: &tauri::AppHandle,
        task_id: TaskId,
        mode: TimerMode,
    ) -> CommandResult<TimerSessionPayload> {
        self.transition(app_handle, |controller, now_ms, wall_time| {
            controller.switch_task(task_id, mode, now_ms, wall_time)
        })
    }

    pub fn set_time_taken_while_paused(
        &self,
        app_handle: &tauri::AppHandle,
        total_seconds: u32,
    ) -> CommandResult<TimerSessionPayload> {
        self.transition(app_handle, |controller, now_ms, wall_time| {
            controller.set_time_taken_while_paused(
                SetTaskTimeTakenInput { total_seconds },
                now_ms,
                wall_time,
            )
        })
    }

    fn transition<F>(
        &self,
        app_handle: &tauri::AppHandle,
        transition: F,
    ) -> CommandResult<TimerSessionPayload>
    where
        F: FnOnce(
            &mut TimerController,
            u64,
            &str,
        ) -> Result<TimerSessionPayload, TimerControllerError>,
    {
        let now_ms = self.now_ms()?;
        let wall_time = current_wall_time();
        let mut state = self
            .state
            .lock()
            .map_err(|_| CommandError::timer_service_lock_poisoned())?;
        let TimerServiceState {
            controller,
            observed_ms,
        } = &mut *state;

        // Catch up every automatic boundary first. Each committed boundary is reported immediately,
        // so a later explicit command failure cannot hide an already-persisted transition.
        advance_controller_to(controller, observed_ms, now_ms, &wall_time, |payload| {
            report_timer_change(app_handle, payload)
        })?;

        let payload =
            transition(controller, now_ms, &wall_time).map_err(CommandError::timer_operation)?;
        *observed_ms = now_ms;
        if payload.change.is_some() {
            report_timer_change(app_handle, &payload);
        }
        Ok(payload)
    }

    fn now_ms(&self) -> CommandResult<u64> {
        u64::try_from(self.monotonic_origin.elapsed().as_millis())
            .map_err(|_| CommandError::timer_clock_overflow())
    }
}

fn current_wall_time() -> String {
    Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true)
}

fn automatic_boundary_ms(snapshot: &TimerSnapshot, observed_ms: u64) -> CommandResult<Option<u64>> {
    let remaining_ms = match snapshot.state {
        TimerStateKind::Running => snapshot.countdown_remaining_ms,
        TimerStateKind::Break => snapshot.break_remaining_ms,
        TimerStateKind::Idle
        | TimerStateKind::Paused
        | TimerStateKind::TimeUp
        | TimerStateKind::OvertimeRunning
        | TimerStateKind::OvertimePaused => None,
    };

    remaining_ms
        .map(|remaining| {
            observed_ms
                .checked_add(remaining)
                .ok_or_else(CommandError::timer_clock_overflow)
        })
        .transpose()
}

fn wall_time_at_monotonic(
    observed_wall_time: &str,
    observed_now_ms: u64,
    target_ms: u64,
) -> CommandResult<String> {
    let delta_ms = observed_now_ms
        .checked_sub(target_ms)
        .ok_or_else(CommandError::timer_clock_overflow)?;
    let delta_ms = i64::try_from(delta_ms).map_err(|_| CommandError::timer_clock_overflow())?;
    let observed = DateTime::parse_from_rfc3339(observed_wall_time).map_err(|error| {
        CommandError::new(
            "TIMER_WALL_TIME_INVALID",
            format!("authoritative wall clock is not RFC 3339: {error}"),
        )
    })?;
    let boundary = observed
        .checked_sub_signed(ChronoDuration::milliseconds(delta_ms))
        .ok_or_else(CommandError::timer_clock_overflow)?;
    Ok(boundary
        .with_timezone(&Utc)
        .to_rfc3339_opts(SecondsFormat::Millis, true))
}

fn advance_controller_to<F>(
    controller: &mut TimerController,
    observed_ms: &mut u64,
    now_ms: u64,
    wall_time: &str,
    mut report: F,
) -> CommandResult<()>
where
    F: FnMut(&TimerSessionPayload),
{
    if now_ms < *observed_ms {
        return Err(CommandError::new(
            "TIMER_CLOCK_MOVED_BACKWARDS",
            format!(
                "authoritative timer clock moved backwards: previous={}ms now={}ms",
                *observed_ms, now_ms
            ),
        ));
    }

    loop {
        let projection = controller.snapshot();
        let Some(boundary_ms) = automatic_boundary_ms(&projection.runtime.timer, *observed_ms)?
        else {
            break;
        };
        if boundary_ms > now_ms {
            break;
        }

        let boundary_wall_time = wall_time_at_monotonic(wall_time, now_ms, boundary_ms)?;
        if let Some(payload) = controller
            .advance(boundary_ms, &boundary_wall_time)
            .map_err(CommandError::timer_operation)?
        {
            report(&payload);
        }
        *observed_ms = boundary_ms;
    }

    if *observed_ms < now_ms {
        if let Some(payload) = controller
            .advance(now_ms, wall_time)
            .map_err(CommandError::timer_operation)?
        {
            report(&payload);
        }
        *observed_ms = now_ms;
    }

    Ok(())
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
    timer_service.start_task(&app_handle, task_id, mode)
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_pause(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
) -> CommandResult<TimerSessionPayload> {
    timer_service.pause(&app_handle)
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_resume(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
) -> CommandResult<TimerSessionPayload> {
    timer_service.resume(&app_handle)
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_extend(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
) -> CommandResult<TimerSessionPayload> {
    timer_service.extend(&app_handle)
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_start_manual_break(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
    duration_ms: u64,
) -> CommandResult<TimerSessionPayload> {
    timer_service.start_manual_break(&app_handle, duration_ms)
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_finish_break(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
) -> CommandResult<TimerSessionPayload> {
    timer_service.finish_break(&app_handle)
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_skip_break(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
) -> CommandResult<TimerSessionPayload> {
    timer_service.skip_break(&app_handle)
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_complete_task(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
) -> CommandResult<TimerSessionPayload> {
    timer_service.complete_task(&app_handle)
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_skip_task(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
) -> CommandResult<TimerSessionPayload> {
    timer_service.skip_task(&app_handle)
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_switch_task(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
    task_id: String,
    mode: TimerMode,
) -> CommandResult<TimerSessionPayload> {
    let task_id = parse_task_id(&task_id)?;
    timer_service.switch_task(&app_handle, task_id, mode)
}

#[tauri::command(rename_all = "camelCase")]
pub fn timer_set_time_taken(
    timer_service: State<'_, TimerService>,
    app_handle: tauri::AppHandle,
    total_seconds: u32,
) -> CommandResult<TimerSessionPayload> {
    timer_service.set_time_taken_while_paused(&app_handle, total_seconds)
}

pub fn install_background_advance(app_handle: tauri::AppHandle) {
    if let Err(error) = std::thread::Builder::new()
        .name("narro-timer-runtime".to_owned())
        .spawn(move || loop {
            std::thread::sleep(BACKGROUND_ADVANCE_INTERVAL);
            let timer_service = app_handle.state::<TimerService>();
            if let Err(error) = timer_service.advance_and_report(&app_handle) {
                eprintln!("Timer background advance failed: {error}");
            }
        })
    {
        eprintln!("Fatal: failed to start authoritative timer runtime thread: {error}");
        std::process::exit(1);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::sessions::SessionKind;
    use crate::domain::tasks::NewTaskInput;
    use crate::domain::timer_events::TimerSessionChange;
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::sessions::sessions_for_task;
    use crate::persistence::tasks::create_task;
    use rusqlite::Connection;
    use std::fs;
    use std::path::PathBuf;
    use uuid::Uuid;

    const T0: &str = "2026-09-05T12:00:00Z";
    const T6: &str = "2026-09-05T12:00:06Z";

    fn fixture() -> (TimerController, TaskId, PathBuf) {
        let path =
            std::env::temp_dir().join(format!("narro-pomodoro-boundary-{}.db", Uuid::new_v4()));
        let mut connection = Connection::open(&path).expect("open test database");
        run_migrations(&mut connection).expect("migrate test database");
        let list = create_list(
            &mut connection,
            NewListInput {
                title: "Inbox".into(),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .expect("create list");
        let task = create_task(
            &mut connection,
            NewTaskInput {
                list_id: list.id,
                title: "Late Pomodoro".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: None,
            },
            T0,
        )
        .expect("create task");
        let controller = TimerController::recover(connection, 0, T0).expect("recover controller");
        (controller, task.id, path)
    }

    #[test]
    fn late_pomodoro_observation_persists_and_reports_each_crossed_boundary() {
        let (mut controller, task_id, path) = fixture();
        controller
            .start_task(
                task_id,
                TimerMode::Pomodoro {
                    work_ms: 2_000,
                    break_ms: 3_000,
                },
                0,
                T0,
            )
            .expect("start Pomodoro");
        let first_work_session = controller.snapshot().runtime.open_session_id.unwrap();
        let mut observed_ms = 0;
        let mut events = Vec::new();

        advance_controller_to(&mut controller, &mut observed_ms, 6_000, T6, |payload| {
            events.push(payload.clone())
        })
        .expect("advance through late Pomodoro boundaries");

        assert_eq!(observed_ms, 6_000);
        assert_eq!(events.len(), 2);
        assert_eq!(events[0].revision, 2);
        assert_eq!(events[1].revision, 3);
        assert!(matches!(
            events[0].change,
            Some(TimerSessionChange::AutomaticBoundary {
                previous_state: TimerStateKind::Running,
                current_state: TimerStateKind::Break,
                closed_session_id: Some(closed),
                opened_session_id: Some(_),
            }) if closed == first_work_session
        ));
        assert!(matches!(
            events[1].change,
            Some(TimerSessionChange::AutomaticBoundary {
                previous_state: TimerStateKind::Break,
                current_state: TimerStateKind::Paused,
                closed_session_id: Some(_),
                opened_session_id: Some(_),
            })
        ));
        assert_eq!(
            controller.snapshot().runtime.timer.state,
            TimerStateKind::Paused
        );

        let inspection = Connection::open(&path).expect("reopen test database");
        let sessions = sessions_for_task(&inspection, task_id).expect("load sessions");
        assert_eq!(sessions.len(), 3);
        assert_eq!(
            sessions
                .iter()
                .map(|session| (session.kind, session.duration_seconds, session.is_open()))
                .collect::<Vec<_>>(),
            vec![
                (SessionKind::Work, 2, false),
                (SessionKind::Break, 3, false),
                (SessionKind::Work, 0, true),
            ]
        );
        assert_eq!(
            sessions[0].ended_at.as_deref(),
            Some("2026-09-05T12:00:02.000Z")
        );
        assert_eq!(sessions[1].started_at, "2026-09-05T12:00:02.000Z");
        assert_eq!(
            sessions[1].ended_at.as_deref(),
            Some("2026-09-05T12:00:05.000Z")
        );
        assert_eq!(sessions[2].started_at, "2026-09-05T12:00:05.000Z");

        drop(inspection);
        drop(controller);
        fs::remove_file(path).expect("remove test database");
    }

    #[test]
    fn boundary_wall_time_is_interpolated_from_authoritative_observation() {
        assert_eq!(
            wall_time_at_monotonic("2026-09-05T12:00:06Z", 6_000, 2_000).unwrap(),
            "2026-09-05T12:00:02.000Z"
        );
    }
}
