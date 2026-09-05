use crate::domain::model::{PlanningLane, ScheduleKind};
use crate::domain::tasks::{TaskRecord, TaskSchedule};
use chrono::{Datelike, Duration, NaiveDate, NaiveDateTime, NaiveTime};
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

const MAX_TIMEZONE_BYTES: usize = 128;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SchedulingError {
    InvalidLocalDate(String),
    InvalidLocalTime(String),
    InvalidTimezone,
    InconsistentStoredSchedule(ScheduleKind),
    DateArithmeticOverflow,
}

impl Display for SchedulingError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidLocalDate(value) => {
                write!(formatter, "scheduled local date is invalid: {value}")
            }
            Self::InvalidLocalTime(value) => {
                write!(formatter, "scheduled local time is invalid: {value}")
            }
            Self::InvalidTimezone => formatter
                .write_str("scheduling timezone must be a non-empty local timezone identifier"),
            Self::InconsistentStoredSchedule(kind) => {
                write!(
                    formatter,
                    "stored schedule fields do not match kind: {kind}"
                )
            }
            Self::DateArithmeticOverflow => {
                formatter.write_str("scheduling date/time arithmetic overflow")
            }
        }
    }
}

impl std::error::Error for SchedulingError {}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum ScheduleShortcut {
    Today,
    LaterToday,
    Tomorrow,
    NextWeek,
    CustomDate { local_date: String },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FocusEligibility {
    Eligible,
    Archived,
    Completed,
    NotToday,
    FutureScheduledTime,
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum ParsedTaskSchedule {
    None,
    DateOnly {
        local_date: NaiveDate,
    },
    LocalDateTime {
        local_date: NaiveDate,
        local_time: NaiveTime,
    },
}

fn parse_local_date(value: &str) -> Result<NaiveDate, SchedulingError> {
    NaiveDate::parse_from_str(value.trim(), "%Y-%m-%d")
        .map_err(|_| SchedulingError::InvalidLocalDate(value.to_owned()))
}

fn parse_local_time(value: &str) -> Result<NaiveTime, SchedulingError> {
    NaiveTime::parse_from_str(value.trim(), "%H:%M")
        .map_err(|_| SchedulingError::InvalidLocalTime(value.to_owned()))
}

fn validate_timezone(value: &str) -> Result<&str, SchedulingError> {
    let value = value.trim();
    if value.is_empty() || value.len() > MAX_TIMEZONE_BYTES || value.chars().any(char::is_control) {
        return Err(SchedulingError::InvalidTimezone);
    }
    Ok(value)
}

fn checked_add(value: NaiveDateTime, duration: Duration) -> Result<NaiveDateTime, SchedulingError> {
    value
        .checked_add_signed(duration)
        .ok_or(SchedulingError::DateArithmeticOverflow)
}

fn checked_add_days(value: NaiveDate, days: i64) -> Result<NaiveDate, SchedulingError> {
    value
        .checked_add_signed(Duration::days(days))
        .ok_or(SchedulingError::DateArithmeticOverflow)
}

fn parsed_task_schedule(task: &TaskRecord) -> Result<ParsedTaskSchedule, SchedulingError> {
    match task.schedule_kind {
        ScheduleKind::None => {
            if task.scheduled_local_date.is_some()
                || task.scheduled_local_time.is_some()
                || task.schedule_timezone.is_some()
            {
                return Err(SchedulingError::InconsistentStoredSchedule(
                    ScheduleKind::None,
                ));
            }
            Ok(ParsedTaskSchedule::None)
        }
        ScheduleKind::DateOnly => {
            let Some(local_date) = task.scheduled_local_date.as_deref() else {
                return Err(SchedulingError::InconsistentStoredSchedule(
                    ScheduleKind::DateOnly,
                ));
            };
            if task.scheduled_local_time.is_some() || task.schedule_timezone.is_some() {
                return Err(SchedulingError::InconsistentStoredSchedule(
                    ScheduleKind::DateOnly,
                ));
            }
            Ok(ParsedTaskSchedule::DateOnly {
                local_date: parse_local_date(local_date)?,
            })
        }
        ScheduleKind::LocalDateTime => {
            let (Some(local_date), Some(local_time), Some(timezone)) = (
                task.scheduled_local_date.as_deref(),
                task.scheduled_local_time.as_deref(),
                task.schedule_timezone.as_deref(),
            ) else {
                return Err(SchedulingError::InconsistentStoredSchedule(
                    ScheduleKind::LocalDateTime,
                ));
            };
            validate_timezone(timezone)?;
            Ok(ParsedTaskSchedule::LocalDateTime {
                local_date: parse_local_date(local_date)?,
                local_time: parse_local_time(local_time)?,
            })
        }
    }
}

pub fn monday_of_week(local_date: NaiveDate) -> Result<NaiveDate, SchedulingError> {
    let days_from_monday = i64::from(local_date.weekday().num_days_from_monday());
    local_date
        .checked_sub_signed(Duration::days(days_from_monday))
        .ok_or(SchedulingError::DateArithmeticOverflow)
}

pub fn classify_scheduled_date(
    scheduled_local_date: NaiveDate,
    today_local: NaiveDate,
) -> Result<PlanningLane, SchedulingError> {
    if scheduled_local_date <= today_local {
        return Ok(PlanningLane::Today);
    }

    let week_start = monday_of_week(today_local)?;
    let week_end = checked_add_days(week_start, 6)?;
    if scheduled_local_date <= week_end {
        Ok(PlanningLane::ThisWeek)
    } else {
        Ok(PlanningLane::Backlog)
    }
}

pub fn effective_planning_lane(
    task: &TaskRecord,
    today_local: NaiveDate,
) -> Result<PlanningLane, SchedulingError> {
    match parsed_task_schedule(task)? {
        ParsedTaskSchedule::None => Ok(task.manual_lane),
        ParsedTaskSchedule::DateOnly { local_date }
        | ParsedTaskSchedule::LocalDateTime { local_date, .. } => {
            classify_scheduled_date(local_date, today_local)
        }
    }
}

pub fn focus_eligibility(
    task: &TaskRecord,
    now_local: NaiveDateTime,
) -> Result<FocusEligibility, SchedulingError> {
    if task.archived_at.is_some() {
        return Ok(FocusEligibility::Archived);
    }
    if task.completed_at.is_some() {
        return Ok(FocusEligibility::Completed);
    }
    if effective_planning_lane(task, now_local.date())? != PlanningLane::Today {
        return Ok(FocusEligibility::NotToday);
    }

    if let ParsedTaskSchedule::LocalDateTime {
        local_date,
        local_time,
    } = parsed_task_schedule(task)?
    {
        if local_date == now_local.date() && local_time > now_local.time() {
            return Ok(FocusEligibility::FutureScheduledTime);
        }
    }

    Ok(FocusEligibility::Eligible)
}

pub fn is_focus_eligible(
    task: &TaskRecord,
    now_local: NaiveDateTime,
) -> Result<bool, SchedulingError> {
    Ok(focus_eligibility(task, now_local)? == FocusEligibility::Eligible)
}

pub fn resolve_schedule_shortcut(
    shortcut: ScheduleShortcut,
    now_local: NaiveDateTime,
    timezone: &str,
) -> Result<TaskSchedule, SchedulingError> {
    match shortcut {
        ScheduleShortcut::Today => Ok(TaskSchedule::DateOnly {
            local_date: now_local.date().format("%Y-%m-%d").to_string(),
        }),
        ScheduleShortcut::LaterToday => {
            let timezone = validate_timezone(timezone)?;
            let due = checked_add(now_local, Duration::hours(2))?;
            Ok(TaskSchedule::LocalDateTime {
                local_date: due.date().format("%Y-%m-%d").to_string(),
                local_time: due.time().format("%H:%M").to_string(),
                timezone: timezone.to_owned(),
            })
        }
        ScheduleShortcut::Tomorrow => Ok(TaskSchedule::DateOnly {
            local_date: checked_add_days(now_local.date(), 1)?
                .format("%Y-%m-%d")
                .to_string(),
        }),
        ScheduleShortcut::NextWeek => Ok(TaskSchedule::DateOnly {
            local_date: checked_add_days(now_local.date(), 7)?
                .format("%Y-%m-%d")
                .to_string(),
        }),
        ScheduleShortcut::CustomDate { local_date } => Ok(TaskSchedule::DateOnly {
            local_date: parse_local_date(&local_date)?
                .format("%Y-%m-%d")
                .to_string(),
        }),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::ids::{ListId, TaskId};

    fn date(value: &str) -> NaiveDate {
        NaiveDate::parse_from_str(value, "%Y-%m-%d").unwrap()
    }

    fn datetime(value: &str) -> NaiveDateTime {
        NaiveDateTime::parse_from_str(value, "%Y-%m-%d %H:%M:%S").unwrap()
    }

    fn task(manual_lane: PlanningLane) -> TaskRecord {
        TaskRecord {
            id: TaskId::generate(),
            list_id: ListId::generate(),
            title: "Scheduled task".into(),
            manual_lane,
            sort_rank: 0,
            est_seconds: None,
            manual_time_adjustment_seconds: 0,
            schedule_kind: ScheduleKind::None,
            scheduled_local_date: None,
            scheduled_local_time: None,
            schedule_timezone: None,
            recurrence_rule_id: None,
            recurrence_parent_task_id: None,
            completed_at: None,
            archived_at: None,
            created_at: "2026-09-05T00:00:00Z".into(),
            updated_at: "2026-09-05T00:00:00Z".into(),
        }
    }

    fn date_only(mut task: TaskRecord, local_date: &str) -> TaskRecord {
        task.schedule_kind = ScheduleKind::DateOnly;
        task.scheduled_local_date = Some(local_date.into());
        task
    }

    fn local_datetime(mut task: TaskRecord, local_date: &str, local_time: &str) -> TaskRecord {
        task.schedule_kind = ScheduleKind::LocalDateTime;
        task.scheduled_local_date = Some(local_date.into());
        task.scheduled_local_time = Some(local_time.into());
        task.schedule_timezone = Some("Europe/Athens".into());
        task
    }

    #[test]
    fn monday_of_week_is_stable_across_all_weekdays() {
        for day in [
            "2026-09-07",
            "2026-09-08",
            "2026-09-09",
            "2026-09-10",
            "2026-09-11",
            "2026-09-12",
            "2026-09-13",
        ] {
            assert_eq!(monday_of_week(date(day)).unwrap(), date("2026-09-07"));
        }
        assert_eq!(
            monday_of_week(date("2026-09-14")).unwrap(),
            date("2026-09-14")
        );
    }

    #[test]
    fn scheduled_dates_project_to_today_this_week_or_backlog() {
        let today = date("2026-09-09");
        assert_eq!(
            classify_scheduled_date(date("2026-09-01"), today).unwrap(),
            PlanningLane::Today
        );
        assert_eq!(
            classify_scheduled_date(date("2026-09-09"), today).unwrap(),
            PlanningLane::Today
        );
        assert_eq!(
            classify_scheduled_date(date("2026-09-10"), today).unwrap(),
            PlanningLane::ThisWeek
        );
        assert_eq!(
            classify_scheduled_date(date("2026-09-13"), today).unwrap(),
            PlanningLane::ThisWeek
        );
        assert_eq!(
            classify_scheduled_date(date("2026-09-14"), today).unwrap(),
            PlanningLane::Backlog
        );
    }

    #[test]
    fn sunday_to_monday_rollover_reclassifies_without_mutating_manual_lane() {
        let scheduled = date_only(task(PlanningLane::Backlog), "2026-09-14");
        assert_eq!(
            effective_planning_lane(&scheduled, date("2026-09-13")).unwrap(),
            PlanningLane::Backlog
        );
        assert_eq!(
            effective_planning_lane(&scheduled, date("2026-09-14")).unwrap(),
            PlanningLane::Today
        );
        assert_eq!(scheduled.manual_lane, PlanningLane::Backlog);
    }

    #[test]
    fn unscheduled_task_keeps_manual_lane() {
        let unscheduled = task(PlanningLane::ThisWeek);
        assert_eq!(
            effective_planning_lane(&unscheduled, date("2026-09-09")).unwrap(),
            PlanningLane::ThisWeek
        );
    }

    #[test]
    fn future_timed_today_task_is_visible_today_but_not_focus_eligible() {
        let scheduled = local_datetime(task(PlanningLane::Backlog), "2026-09-09", "15:00");
        let before = datetime("2026-09-09 14:59:59");
        assert_eq!(
            effective_planning_lane(&scheduled, before.date()).unwrap(),
            PlanningLane::Today
        );
        assert_eq!(
            focus_eligibility(&scheduled, before).unwrap(),
            FocusEligibility::FutureScheduledTime
        );
        assert!(!is_focus_eligible(&scheduled, before).unwrap());

        let due = datetime("2026-09-09 15:00:00");
        assert_eq!(
            focus_eligibility(&scheduled, due).unwrap(),
            FocusEligibility::Eligible
        );
        assert!(is_focus_eligible(&scheduled, due).unwrap());
    }

    #[test]
    fn overdue_timed_task_is_focus_eligible_even_when_stored_time_is_later_in_day() {
        let scheduled = local_datetime(task(PlanningLane::Backlog), "2026-09-08", "23:59");
        assert_eq!(
            focus_eligibility(&scheduled, datetime("2026-09-09 08:00:00")).unwrap(),
            FocusEligibility::Eligible
        );
    }

    #[test]
    fn completed_archived_and_non_today_tasks_are_not_focus_eligible() {
        let mut completed = task(PlanningLane::Today);
        completed.completed_at = Some("2026-09-09T07:00:00Z".into());
        assert_eq!(
            focus_eligibility(&completed, datetime("2026-09-09 08:00:00")).unwrap(),
            FocusEligibility::Completed
        );

        let mut archived = task(PlanningLane::Today);
        archived.archived_at = Some("2026-09-09T07:00:00Z".into());
        assert_eq!(
            focus_eligibility(&archived, datetime("2026-09-09 08:00:00")).unwrap(),
            FocusEligibility::Archived
        );

        assert_eq!(
            focus_eligibility(
                &task(PlanningLane::ThisWeek),
                datetime("2026-09-09 08:00:00")
            )
            .unwrap(),
            FocusEligibility::NotToday
        );
    }

    #[test]
    fn date_only_schedule_never_requires_or_derives_a_timezone() {
        let scheduled = date_only(task(PlanningLane::Backlog), "2026-09-09");
        assert!(scheduled.schedule_timezone.is_none());
        assert_eq!(
            effective_planning_lane(&scheduled, date("2026-09-09")).unwrap(),
            PlanningLane::Today
        );
        assert_eq!(
            focus_eligibility(&scheduled, datetime("2026-09-09 00:00:00")).unwrap(),
            FocusEligibility::Eligible
        );
    }

    #[test]
    fn shortcuts_preserve_date_only_semantics_except_later_today() {
        let now = datetime("2026-09-09 10:15:00");
        assert_eq!(
            resolve_schedule_shortcut(ScheduleShortcut::Today, now, "Europe/Athens").unwrap(),
            TaskSchedule::DateOnly {
                local_date: "2026-09-09".into()
            }
        );
        assert_eq!(
            resolve_schedule_shortcut(ScheduleShortcut::Tomorrow, now, "Europe/Athens").unwrap(),
            TaskSchedule::DateOnly {
                local_date: "2026-09-10".into()
            }
        );
        assert_eq!(
            resolve_schedule_shortcut(ScheduleShortcut::NextWeek, now, "Europe/Athens").unwrap(),
            TaskSchedule::DateOnly {
                local_date: "2026-09-16".into()
            }
        );
        assert_eq!(
            resolve_schedule_shortcut(
                ScheduleShortcut::CustomDate {
                    local_date: " 2026-10-01 ".into()
                },
                now,
                "Europe/Athens"
            )
            .unwrap(),
            TaskSchedule::DateOnly {
                local_date: "2026-10-01".into()
            }
        );
    }

    #[test]
    fn later_today_is_two_hours_from_local_now_and_can_cross_midnight() {
        assert_eq!(
            resolve_schedule_shortcut(
                ScheduleShortcut::LaterToday,
                datetime("2026-09-09 10:15:00"),
                "Europe/Athens"
            )
            .unwrap(),
            TaskSchedule::LocalDateTime {
                local_date: "2026-09-09".into(),
                local_time: "12:15".into(),
                timezone: "Europe/Athens".into()
            }
        );
        assert_eq!(
            resolve_schedule_shortcut(
                ScheduleShortcut::LaterToday,
                datetime("2026-09-09 23:30:00"),
                "Europe/Athens"
            )
            .unwrap(),
            TaskSchedule::LocalDateTime {
                local_date: "2026-09-10".into(),
                local_time: "01:30".into(),
                timezone: "Europe/Athens".into()
            }
        );
    }

    #[test]
    fn invalid_shortcut_date_timezone_and_corrupt_stored_schedule_fail_closed() {
        assert!(matches!(
            resolve_schedule_shortcut(
                ScheduleShortcut::CustomDate {
                    local_date: "2026-02-30".into()
                },
                datetime("2026-09-09 10:15:00"),
                "Europe/Athens"
            ),
            Err(SchedulingError::InvalidLocalDate(_))
        ));
        assert!(matches!(
            resolve_schedule_shortcut(
                ScheduleShortcut::LaterToday,
                datetime("2026-09-09 10:15:00"),
                "  "
            ),
            Err(SchedulingError::InvalidTimezone)
        ));

        let mut corrupt = task(PlanningLane::Today);
        corrupt.schedule_kind = ScheduleKind::DateOnly;
        corrupt.scheduled_local_time = Some("09:00".into());
        assert!(matches!(
            effective_planning_lane(&corrupt, date("2026-09-09")),
            Err(SchedulingError::InconsistentStoredSchedule(
                ScheduleKind::DateOnly
            ))
        ));
    }
}
