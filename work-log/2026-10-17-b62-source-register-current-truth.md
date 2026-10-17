# B62 source-register current truth, 2026-10-17

Documentation only. The current U40 note incorrectly said future-only Today work necessarily made the preview CTA vivid. Actual `src/blitzEntryPresentation.ts::hasActionableTodayPreview` already gates timed work with `(scheduledLocalTime === null || isOverdue)`, as directly read on current main and candidateb11c80bb. The five-blob proof in B62 reuse preserves that implementation. Replace the stale current claim; do not patch the already implemented guard or invent a native future-time PASS. U31 now links the already accepted scoped empty-native/observed-source-intent proof; unknown original click/disabled/race remains EVIDENCE_LIMIT.

No code, tests, build, CI, app input or capture was started by this reconciliation. PR364 exact CI and prepared0/4 native continuation remain unchanged.
