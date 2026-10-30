//! Cached durable display basis; ordinary snapshots do no SQLite work.
use crate::domain::ids::{SessionId, TaskId};
use crate::domain::timer_events::LiveTimeTakenProjection;
use std::sync::{
    atomic::{AtomicU64, Ordering},
    Arc,
};

#[derive(Clone, Default)]
pub struct TimeTakenInvalidation(Arc<AtomicU64>);

impl TimeTakenInvalidation {
    /// Called only after an external history mutation has committed.
    pub fn invalidate(&self) {
        let _ = self
            .0
            .try_update(Ordering::AcqRel, Ordering::Acquire, |n| n.checked_add(1));
    }
    pub fn revision(&self) -> u64 {
        self.0.load(Ordering::Acquire)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) struct BasisKey {
    pub task_id: TaskId,
    pub session_id: Option<SessionId>,
    pub timer_revision: u64,
    pub checkpoint_work_seconds: u64,
    pub history_revision: u64,
}

#[derive(Default)]
pub(crate) struct TimeTakenProjectionCache {
    basis: Option<(BasisKey, Result<u64, &'static str>)>,
}

impl TimeTakenProjectionCache {
    pub fn history_revision(&self) -> Option<u64> {
        self.basis.as_ref().map(|(key, _)| key.history_revision)
    }

    pub fn refresh<F>(&mut self, key: Option<BasisKey>, read: F)
    where
        F: FnOnce() -> Result<u64, &'static str>,
    {
        let Some(key) = key else {
            self.basis = None;
            return;
        };
        if self.basis.as_ref().is_some_and(|(old, _)| *old == key) {
            return;
        }
        let value = if key.history_revision == u64::MAX {
            Err("LIVE_TIME_TAKEN_REVISION_EXHAUSTED")
        } else {
            read()
        };
        self.basis = Some((key, value));
    }

    pub fn project(
        &self,
        key: Option<BasisKey>,
        work_seconds: u64,
    ) -> Option<LiveTimeTakenProjection> {
        let key = key?;
        let result = match self.basis.as_ref() {
            Some((owner, value)) if *owner == key => value.and_then(|total| {
                let delta = work_seconds
                    .checked_sub(key.checkpoint_work_seconds)
                    .ok_or("LIVE_TIME_TAKEN_BASIS_MISMATCH")?;
                total.checked_add(delta).ok_or("LIVE_TIME_TAKEN_OVERFLOW")
            }),
            _ => Err("LIVE_TIME_TAKEN_PENDING"),
        };
        Some(match result {
            Ok(total) => LiveTimeTakenProjection {
                task_id: key.task_id,
                history_revision: key.history_revision.to_string(),
                seconds: Some(total.to_string()),
                error: None,
            },
            Err(code) => LiveTimeTakenProjection {
                task_id: key.task_id,
                history_revision: key.history_revision.to_string(),
                seconds: None,
                error: Some(code.into()),
            },
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cell::Cell;
    fn key() -> BasisKey {
        BasisKey {
            task_id: TaskId::generate(),
            session_id: Some(SessionId::generate()),
            timer_revision: 1,
            checkpoint_work_seconds: 30,
            history_revision: 0,
        }
    }
    fn total(cache: &TimeTakenProjectionCache, k: BasisKey, work: u64) -> String {
        cache.project(Some(k), work).unwrap().seconds.unwrap()
    }
    #[test]
    fn uncheckpointed_delta_and_checkpoint_rebase_are_invariant_without_tick_reads() {
        let mut c = TimeTakenProjectionCache::default();
        let mut k = key();
        let reads = Cell::new(0);
        c.refresh(Some(k), || {
            reads.set(reads.get() + 1);
            Ok(110)
        });
        assert_eq!(total(&c, k, 50), "130");
        for _ in 0..100 {
            c.refresh(Some(k), || panic!("snapshot/tick may not re-read SQLite"));
        }
        assert_eq!(reads.get(), 1);
        k.checkpoint_work_seconds = 50;
        c.refresh(Some(k), || Ok(130));
        assert_eq!(total(&c, k, 50), "130");
        assert_eq!(total(&c, k, 51), "131");
    }
    #[test]
    fn manual_total_below_raw_work_and_history_invalidation_preserve_authority() {
        let mut c = TimeTakenProjectionCache::default();
        let mut k = key();
        k.checkpoint_work_seconds = 50;
        c.refresh(Some(k), || Ok(5));
        assert_eq!(total(&c, k, 51), "6");
        k.history_revision += 1;
        assert!(c.project(Some(k), 51).unwrap().seconds.is_none());
        c.refresh(Some(k), || Ok(95));
        assert_eq!(total(&c, k, 51), "96");
        k.timer_revision += 1;
        c.refresh(Some(k), || Ok(500));
        assert_eq!(total(&c, k, 51), "501");
    }
    #[test]
    fn stale_task_session_and_failed_reads_never_reuse_another_total() {
        let mut c = TimeTakenProjectionCache::default();
        let mut k = key();
        c.refresh(Some(k), || Ok(90));
        k.task_id = TaskId::generate();
        assert!(c.project(Some(k), 31).unwrap().seconds.is_none());
        c.refresh(Some(k), || Err("LIVE_TIME_TAKEN_UNAVAILABLE"));
        assert_eq!(
            c.project(Some(k), 31).unwrap().error.as_deref(),
            Some("LIVE_TIME_TAKEN_UNAVAILABLE")
        );
        c.refresh(Some(k), || {
            panic!("failed basis is not polled every timer tick")
        });
        k.session_id = Some(SessionId::generate());
        c.refresh(Some(k), || Ok(30));
        assert_eq!(total(&c, k, 31), "31");
        c.refresh(None, || panic!("idle must not query"));
        assert!(c.project(None, 0).is_none());
    }
    #[test]
    fn invalid_raw_basis_overflow_and_exhausted_revision_are_explicit_errors() {
        let mut c = TimeTakenProjectionCache::default();
        let mut k = key();
        c.refresh(Some(k), || Ok(u64::MAX));
        assert_eq!(
            c.project(Some(k), 31).unwrap().error.as_deref(),
            Some("LIVE_TIME_TAKEN_OVERFLOW")
        );
        assert_eq!(
            c.project(Some(k), 29).unwrap().error.as_deref(),
            Some("LIVE_TIME_TAKEN_BASIS_MISMATCH")
        );
        k.history_revision = u64::MAX;
        c.refresh(Some(k), || panic!("exhausted revision must fail closed"));
        assert!(c.project(Some(k), 30).unwrap().seconds.is_none());
    }
}
