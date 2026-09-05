use crate::domain::preferences::SleepAccountingPolicy;
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum TimerLogicalClockError {
    RawClockMovedBackwards { previous_ms: u64, now_ms: u64 },
    PowerTickMovedBackwards { suspend_ms: u64, resume_ms: u64 },
    Overflow,
}

impl Display for TimerLogicalClockError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::RawClockMovedBackwards {
                previous_ms,
                now_ms,
            } => write!(
                formatter,
                "raw timer clock moved backwards: previous={previous_ms}ms now={now_ms}ms"
            ),
            Self::PowerTickMovedBackwards {
                suspend_ms,
                resume_ms,
            } => write!(
                formatter,
                "Windows power tick moved backwards: suspend={suspend_ms}ms resume={resume_ms}ms"
            ),
            Self::Overflow => formatter.write_str("logical timer clock overflow"),
        }
    }
}

impl std::error::Error for TimerLogicalClockError {}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct SuspendedClock {
    logical_ms: u64,
    power_tick_ms: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) struct TimerLogicalClock {
    raw_anchor_ms: u64,
    logical_anchor_ms: u64,
    suspended: Option<SuspendedClock>,
}

impl TimerLogicalClock {
    pub(crate) const fn new(raw_ms: u64) -> Self {
        Self {
            raw_anchor_ms: raw_ms,
            logical_anchor_ms: 0,
            suspended: None,
        }
    }

    pub(crate) fn is_suspended(&self) -> bool {
        self.suspended.is_some()
    }

    pub(crate) fn now(&self, raw_ms: u64) -> Result<u64, TimerLogicalClockError> {
        if let Some(suspended) = self.suspended {
            return Ok(suspended.logical_ms);
        }
        let delta = raw_ms.checked_sub(self.raw_anchor_ms).ok_or(
            TimerLogicalClockError::RawClockMovedBackwards {
                previous_ms: self.raw_anchor_ms,
                now_ms: raw_ms,
            },
        )?;
        self.logical_anchor_ms
            .checked_add(delta)
            .ok_or(TimerLogicalClockError::Overflow)
    }

    pub(crate) fn begin_suspend(
        &mut self,
        raw_ms: u64,
        power_tick_ms: u64,
    ) -> Result<u64, TimerLogicalClockError> {
        if let Some(suspended) = self.suspended {
            return Ok(suspended.logical_ms);
        }
        let logical_ms = self.now(raw_ms)?;
        self.suspended = Some(SuspendedClock {
            logical_ms,
            power_tick_ms,
        });
        Ok(logical_ms)
    }

    pub(crate) fn resume(
        &mut self,
        raw_ms: u64,
        power_tick_ms: u64,
        policy: SleepAccountingPolicy,
    ) -> Result<u64, TimerLogicalClockError> {
        let Some(suspended) = self.suspended else {
            return self.now(raw_ms);
        };
        let slept_ms = power_tick_ms.checked_sub(suspended.power_tick_ms).ok_or(
            TimerLogicalClockError::PowerTickMovedBackwards {
                suspend_ms: suspended.power_tick_ms,
                resume_ms: power_tick_ms,
            },
        )?;
        let logical_ms = match policy {
            SleepAccountingPolicy::Exclude => suspended.logical_ms,
            SleepAccountingPolicy::Count => suspended
                .logical_ms
                .checked_add(slept_ms)
                .ok_or(TimerLogicalClockError::Overflow)?,
        };

        self.raw_anchor_ms = raw_ms;
        self.logical_anchor_ms = logical_ms;
        self.suspended = None;
        Ok(logical_ms)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn exclude_policy_freezes_logical_time_across_sleep() {
        let mut clock = TimerLogicalClock::new(1_000);
        assert_eq!(clock.now(6_000).unwrap(), 5_000);
        assert_eq!(clock.begin_suspend(6_000, 100_000).unwrap(), 5_000);
        assert_eq!(clock.now(66_000).unwrap(), 5_000);
        assert_eq!(
            clock
                .resume(66_000, 160_000, SleepAccountingPolicy::Exclude)
                .unwrap(),
            5_000
        );
        assert_eq!(clock.now(67_500).unwrap(), 6_500);
    }

    #[test]
    fn count_policy_adds_windows_sleep_tick_exactly_once() {
        let mut clock = TimerLogicalClock::new(1_000);
        clock.begin_suspend(6_000, 100_000).unwrap();
        assert_eq!(
            clock
                .resume(6_100, 160_000, SleepAccountingPolicy::Count)
                .unwrap(),
            65_000
        );
        assert_eq!(clock.now(7_100).unwrap(), 66_000);
    }

    #[test]
    fn sleep_result_is_independent_of_whether_raw_clock_includes_suspend() {
        let mut raw_includes_sleep = TimerLogicalClock::new(0);
        raw_includes_sleep.begin_suspend(10_000, 50_000).unwrap();
        let includes = raw_includes_sleep
            .resume(70_000, 110_000, SleepAccountingPolicy::Exclude)
            .unwrap();

        let mut raw_excludes_sleep = TimerLogicalClock::new(0);
        raw_excludes_sleep.begin_suspend(10_000, 50_000).unwrap();
        let excludes = raw_excludes_sleep
            .resume(10_100, 110_000, SleepAccountingPolicy::Exclude)
            .unwrap();

        assert_eq!(includes, 10_000);
        assert_eq!(excludes, 10_000);
    }

    #[test]
    fn duplicate_suspend_and_resume_notifications_are_idempotent() {
        let mut clock = TimerLogicalClock::new(0);
        assert_eq!(clock.begin_suspend(2_000, 10_000).unwrap(), 2_000);
        assert_eq!(clock.begin_suspend(2_100, 10_100).unwrap(), 2_000);
        assert_eq!(
            clock
                .resume(2_200, 15_000, SleepAccountingPolicy::Count)
                .unwrap(),
            7_000
        );
        assert_eq!(
            clock
                .resume(2_300, 15_100, SleepAccountingPolicy::Count)
                .unwrap(),
            7_100
        );
    }

    #[test]
    fn backwards_power_tick_is_rejected_without_clearing_suspend_marker() {
        let mut clock = TimerLogicalClock::new(0);
        clock.begin_suspend(1_000, 50_000).unwrap();
        assert!(matches!(
            clock.resume(1_100, 49_999, SleepAccountingPolicy::Count),
            Err(TimerLogicalClockError::PowerTickMovedBackwards { .. })
        ));
        assert!(clock.is_suspended());
        assert_eq!(clock.now(2_000).unwrap(), 1_000);
    }

    #[test]
    fn count_policy_overflow_is_atomic() {
        let mut clock = TimerLogicalClock {
            raw_anchor_ms: 0,
            logical_anchor_ms: u64::MAX - 5,
            suspended: None,
        };
        clock.begin_suspend(0, 10).unwrap();
        assert_eq!(
            clock.resume(0, 20, SleepAccountingPolicy::Count),
            Err(TimerLogicalClockError::Overflow)
        );
        assert!(clock.is_suspended());
    }
}
