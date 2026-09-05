use crate::domain::ids::TaskId;
use crate::domain::tasks::SetTaskTimeTakenInput;
use crate::domain::timer_events::{TimerSessionPayload, TIMER_SESSION_EVENT_NAME};
use crate::error::{CommandError, CommandResult};
use crate::notifications;
use crate::persistence::pomodoro_effects::{
    awaiting_resume_for_current_open_work_session, awaiting_resume_for_open_work_session,
    claim_pending_notifications, ensure_boundary_decision, PomodoroBoundaryEffect,
    PomodoroBoundaryEffectError, PomodoroBoundaryEffectKind,
};
use crate::persistence::timer_controller::{TimerController, TimerControllerError};
use crate::persistence::{configure_connection, PersistenceError};
use crate::timer::{BreakKind, TimerMode, TimerSnapshot, TimerStateKind};
use chrono::{DateTime, Duration as ChronoDuration, SecondsFormat, Utc};
use rusqlite::Connection;
use std::fmt::{Display, Formatter};
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{Emitter, Manager, State};

const BACKGROUND_ADVANCE_INTERVAL: Duration = Duration::from_millis(250);

#[derive(Debug)]
pub enum TimerServiceRecoverError {
    Controller(TimerControllerError),
    DatabasePathUnavailable,
    EffectsConnection(rusqlite::Error),
    EffectsConfiguration(PersistenceError),
    EffectsRecovery(PomodoroBoundaryEffectError),
}

impl Display for TimerServiceRecoverError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Controller(error) => Display::fmt(error, formatter),
            Self::DatabasePathUnavailable => formatter.write_str(
                "authoritative timer database path is unavailable for Pomodoro effect persistence",
            ),
            Self::EffectsConnection(error) => {
                write!(
                    formatter,
                    "failed to open Pomodoro effect database connection: {error}"
                )
            }
            Self::EffectsConfiguration(error) => Display::fmt(error, formatter),
            Self::EffectsRecovery(error) => Display::fmt(error, formatter),
        }
    }
}

impl std::error::Error for TimerServiceRecoverError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Controller(error) => Some(error),
            Self::EffectsConnection(error) => Some(error),
            Self::EffectsConfiguration(error) => Some(error),
            Self::EffectsRecovery(error) => Some(error),
            Self::DatabasePathUnavailable => None,
        }
    }
}

impl From<TimerControllerError> for TimerServiceRecoverError {
    fn from(value: TimerControllerError) -> Self {
        Self::Controller(value)
    }
}

struct TimerServiceState {
    controller: TimerController,
    effects_connection: Connection,
    observed_ms: u64,
    recovered_awaiting_resume: bool,
}

pub struct TimerService {
    state: Mutex<TimerServiceState>,
    monotonic_origin: Instant,
}

impl TimerService {
    pub fn recover(connection: Connection) -> Result<Self, TimerServiceRecoverError> {
        let wall_time = current_wall_time();
        Self::recover_at(connection, &wall_time)
    }

    fn recover_at(
        connection: Connection,
        wall_time: &str,
    ) -> Result<Self, TimerServiceRecoverError> {
        let database_path = connection
            .path()
            .filter(|path| !path.is_empty())
            .map(str::to_owned)
            .ok_or(TimerServiceRecoverError::DatabasePathUnavailable)?;
        let effects_connection =
            Connection::open(database_path).map_err(TimerServiceRecoverError::EffectsConnection)?;
        configure_connection(&effects_connection)
            .map_err(TimerServiceRecoverError::EffectsConfiguration)?;
        let recovered_awaiting_resume =
            awaiting_resume_for_current_open_work_session(&effects_connection)
                .map_err(TimerServiceRecoverError::EffectsRecovery)?;

        let monotonic_origin = Instant::now();
        let controller = TimerController::recover(connection, 0, wall_time)?;
        Ok(Self {
            state: Mutex::new(TimerServiceState {
                controller,
                effects_connection,
                observed_ms: 0,
                recovered_awaiting_resume,
            }),
            monotonic_origin,
        })
    }

    pub fn snapshot(&self) -> CommandResult<TimerSessionPayload> {
        let state = self
            .state
            .lock()
            .map_err(|_| CommandError::timer_service_lock_poisoned())?;
        decorate_timer_payload(
            &state.effects_connection,
            state.controller.snapshot(),
            state.recovered_awaiting_resume,
        )
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
            effects_connection,
            observed_ms,
            ..
        } = &mut *state;

        advance_controller_to(
            controller,
            effects_connection,
            observed_ms,
            now_ms,
            &wall_time,
            |payload| report_timer_change(app_handle, payload),
        )?;
        let pending = claim_notifications_best_effort(effects_connection, &wall_time);
        drop(state);
        submit_claimed_notifications(app_handle, pending);
        Ok(())
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
            effects_connection,
            observed_ms,
            recovered_awaiting_resume,
        } = &mut *state;

        // Catch up every automatic boundary first. Decisions are persisted before each due boundary,
        // while events are reported only after the timer/session transition commits.
        advance_controller_to(
            controller,
            effects_connection,
            observed_ms,
            now_ms,
            &wall_time,
            |payload| report_timer_change(app_handle, payload),
        )?;

        let payload =
            transition(controller, now_ms, &wall_time).map_err(CommandError::timer_operation)?;
        *observed_ms = now_ms;
        *recovered_awaiting_resume &= is_paused_pomodoro_projection(&payload);
        let payload =
            decorate_timer_payload(effects_connection, payload, *recovered_awaiting_resume)?;
        let pending = claim_notifications_best_effort(effects_connection, &wall_time);
        drop(state);

        if payload.change.is_some() {
            report_timer_change(app_handle, &payload);
        }
        submit_claimed_notifications(app_handle, pending);
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

fn effect_error(error: impl Display) -> CommandError {
    CommandError::new(
        "POMODORO_EFFECT_FAILED",
        format!("authoritative Pomodoro boundary effect failed: {error}"),
    )
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

fn automatic_pomodoro_effect(snapshot: &TimerSnapshot) -> Option<PomodoroBoundaryEffectKind> {
    match snapshot.state {
        TimerStateKind::Running if matches!(snapshot.mode, Some(TimerMode::Pomodoro { .. })) => {
            Some(PomodoroBoundaryEffectKind::BreakStarted)
        }
        TimerStateKind::Break if snapshot.break_kind == Some(BreakKind::Pomodoro) => {
            Some(PomodoroBoundaryEffectKind::BreakFinished)
        }
        _ => None,
    }
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

fn is_paused_pomodoro_projection(payload: &TimerSessionPayload) -> bool {
    payload.runtime.timer.state == TimerStateKind::Paused
        && matches!(payload.runtime.timer.mode, Some(TimerMode::Pomodoro { .. }))
}

fn decorate_timer_payload(
    effects_connection: &Connection,
    mut payload: TimerSessionPayload,
    recovered_awaiting_resume: bool,
) -> CommandResult<TimerSessionPayload> {
    payload.awaiting_resume = if is_paused_pomodoro_projection(&payload) {
        if recovered_awaiting_resume {
            true
        } else {
            match payload.runtime.open_session_id {
                Some(session_id) => {
                    awaiting_resume_for_open_work_session(effects_connection, session_id)
                        .map_err(effect_error)?
                }
                None => false,
            }
        }
    } else {
        false
    };
    Ok(payload)
}

fn advance_controller_to<F>(
    controller: &mut TimerController,
    effects_connection: &mut Connection,
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
        if let Some(kind) = automatic_pomodoro_effect(&projection.runtime.timer) {
            let session_id = projection.runtime.open_session_id.ok_or_else(|| {
                CommandError::new(
                    "POMODORO_EFFECT_BINDING_MISSING",
                    "automatic Pomodoro boundary has no persisted source session",
                )
            })?;
            ensure_boundary_decision(effects_connection, session_id, kind, &boundary_wall_time)
                .map_err(effect_error)?;
        }

        let changed = controller
            .advance(boundary_ms, &boundary_wall_time)
            .map_err(CommandError::timer_operation)?;
        *observed_ms = boundary_ms;
        if let Some(payload) = changed {
            let payload = decorate_timer_payload(effects_connection, payload, false)?;
            report(&payload);
        }
    }

    if *observed_ms < now_ms {
        if let Some(payload) = controller
            .advance(now_ms, wall_time)
            .map_err(CommandError::timer_operation)?
        {
            let payload = decorate_timer_payload(effects_connection, payload, false)?;
            report(&payload);
        }
        *observed_ms = now_ms;
    }

    Ok(())
}

fn claim_notifications_best_effort(
    effects_connection: &mut Connection,
    wall_time: &str,
) -> Vec<PomodoroBoundaryEffect> {
    match claim_pending_notifications(effects_connection, wall_time) {
        Ok(pending) => pending,
        Err(error) => {
            eprintln!("Pomodoro notification claim failed; will retry: {error}");
            Vec::new()
        }
    }
}

fn submit_claimed_notifications(
    app_handle: &tauri::AppHandle,
    effects: Vec<PomodoroBoundaryEffect>,
) {
    for effect in effects {
        let result = match effect.kind {
            PomodoroBoundaryEffectKind::BreakStarted => {
                notifications::send_pomodoro_break_started(app_handle)
            }
            PomodoroBoundaryEffectKind::BreakFinished => {
                notifications::send_pomodoro_break_finished(app_handle)
            }
        };
        if let Err(error) = result {
            eprintln!(
                "Pomodoro {:?} decision for session {} was claimed, but Windows notification submission failed: {error}",
                effect.kind, effect.session_id
            );
        }
    }
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
    use crate::persistence::pomodoro_effects::claim_pending_notifications;
    use crate::persistence::run_migrations;
    use crate::persistence::sessions::sessions_for_task;
    use crate::persistence::tasks::create_task;
    use rusqlite::Connection;
    use std::fs;
    use std::path::PathBuf;
    use uuid::Uuid;

    const T0: &str = "2026-09-05T12:00:00Z";
    const T6: &str = "2026-09-05T12:00:06Z";

    fn fixture() -> (TimerController, Connection, TaskId, PathBuf) {
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
        let effects_connection = Connection::open(&path).expect("open effects database");
        configure_connection(&effects_connection).expect("configure effects database");
        let controller = TimerController::recover(connection, 0, T0).expect("recover controller");
        (controller, effects_connection, task.id, path)
    }

    #[test]
    fn late_pomodoro_observation_persists_reports_and_claims_each_boundary_once() {
        let (mut controller, mut effects, task_id, path) = fixture();
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

        advance_controller_to(
            &mut controller,
            &mut effects,
            &mut observed_ms,
            6_000,
            T6,
            |payload| events.push(payload.clone()),
        )
        .expect("advance through late Pomodoro boundaries");

        assert_eq!(observed_ms, 6_000);
        assert_eq!(events.len(), 2);
        assert_eq!(events[0].revision, 2);
        assert_eq!(events[1].revision, 3);
        assert!(!events[0].awaiting_resume);
        assert!(events[1].awaiting_resume);
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

        let pending = claim_pending_notifications(&mut effects, T6).expect("claim notifications");
        assert_eq!(
            pending.iter().map(|effect| effect.kind).collect::<Vec<_>>(),
            vec![
                PomodoroBoundaryEffectKind::BreakStarted,
                PomodoroBoundaryEffectKind::BreakFinished,
            ]
        );
        assert!(claim_pending_notifications(&mut effects, T6)
            .expect("second claim")
            .is_empty());

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
        drop(effects);
        drop(controller);
        fs::remove_file(path).expect("remove test database");
    }

    #[test]
    fn awaiting_resume_survives_service_recovery() {
        let (mut controller, mut effects, task_id, path) = fixture();
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
            .unwrap();
        let mut observed_ms = 0;
        advance_controller_to(
            &mut controller,
            &mut effects,
            &mut observed_ms,
            5_000,
            "2026-09-05T12:00:05Z",
            |_| {},
        )
        .unwrap();
        let live = decorate_timer_payload(&effects, controller.snapshot(), false).unwrap();
        assert!(live.awaiting_resume);

        drop(controller);
        drop(effects);
        let connection = Connection::open(&path).unwrap();
        let service = TimerService::recover_at(connection, "2026-09-05T12:01:00Z")
            .expect("recover awaiting resume service");
        let recovered_payload = service.snapshot().unwrap();
        assert!(recovered_payload.awaiting_resume);
        assert_eq!(
            recovered_payload.runtime.timer.state,
            TimerStateKind::Paused
        );

        drop(service);
        fs::remove_file(path).expect("remove test database");
    }

    #[test]
    fn recovered_awaiting_resume_fallback_clears_after_running_projection() {
        let (mut controller, mut effects, task_id, path) = fixture();
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
            .unwrap();
        let mut observed_ms = 0;
        advance_controller_to(
            &mut controller,
            &mut effects,
            &mut observed_ms,
            5_000,
            "2026-09-05T12:00:05Z",
            |_| {},
        )
        .unwrap();

        let resumed = controller
            .resume(6_000, "2026-09-05T12:00:06Z")
            .expect("resume after prompt");
        assert!(!is_paused_pomodoro_projection(&resumed));
        let resumed = decorate_timer_payload(&effects, resumed, true).unwrap();
        assert!(!resumed.awaiting_resume);

        drop(effects);
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
