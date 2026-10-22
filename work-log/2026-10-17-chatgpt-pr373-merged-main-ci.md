# 2026-10-17 — PR373 M5/B45 recurrence Remove Recurring final merged-main acceptance

**Owner:** ChatGPT implementation. **Task:** narrow production safeguard and deterministic handler/API regression for recurring parent Remove Recurring, retaining existing children. **Scope:** two source/test files, no Rust, DB, UI restyling, PA/OBS/AppData operation or live original Blitzit access.

## Actual cause and change
`src/ListBoard.tsx` previously forwarded fresh `current.recurrence.updatedAt` to the native compare-and-set even if missing/blank. It now rejects `!current.recurrence.updatedAt?.trim()` before a native mutation, after existing authoritative identity, list, child-parent and matching-rule verification. Existing `deleteExistingTasks: false`, in-flight lock, stale-data failure, notification ambiguity block and refresh on confirmed commit remain unchanged.

Existing `scripts/test-task-schedule-quick-remove.mjs` now also extracts and executes the real production `handleRemoveRecurring` and typed API: one native writer despite double-click, valid expectedRuleId and expectedRuleUpdatedAt, protected generated occurrences, blocked completed/live/child/stale/missing/blank-version parent, authoritative read failure, native CAS rejection, ambiguous postcommit notification and invalidation only after successful IPC. Preexisting quick schedule remove regressions preserved.

## Exact head / Windows CI / merged-main identity
- [PR373](https://github.com/MariosGiannakaras/Narro/pull/373) head `3ff3972e2872dd69c07efe883428239eb06dd366`, [CI 39066811125](https://github.com/MariosGiannakaras/Narro/actions/runs/39066811125) **validation, fast, windows-candidate SUCCESS 3/3**.
- Guarded squash merge `355d9a6feb774b89845532de7f028a0ee7ead3d4`; two source/test blobs **2/2 exact head/main identical**: `src/ListBoard.tsx` `9dc5176aa64c87ad7d02166a1bf04c8322a7ff1f`, `scripts/test-task-schedule-quick-remove.mjs` `6a452a729552631a794e5ebb9a0aeb4fe61929c9`.
- [Resulting-main run 39071099958](https://github.com/MariosGiannakaras/Narro/actions/runs/39071099958), **push event at exact merge SHA `355d9a6feb774b89845532de7f028a0ee7ead3d4`**, completed **validation-gate SUCCESS, fast-gate SUCCESS, windows-candidate SUCCESS**. Rust tests/performance, Windows visual captures, Tauri release, packaged Focus runtime, M7 physical-build/M7 validation, M1 diagnostic storage isolation completed in automated CI.
- Artifacts reported on this exact run: `narro-m5-visual-regression` 12114504796, `narro-m7-focus-runtime-visual` 12115147936, `narro-fast-frontend-dist` 12115302244, `narro-m7-physical-windows-x64` 12115835813, `narro-m7-validation-windows-x64` 12116140110, `narro-m1-diagnostic-windows-x64` 12116170732. GitHub reported artifact existence; ZIP/EXE SHA256 and personal native installation/interaction NOT RUN.

**Disposition:** scoped code/automated validation PASS; B45 exact Blitzit original interaction/motion and real personal Windows clicked menu acceptance OPEN, M5 not closed, mandatory milestones 4/10, U01–U41 Narro local 41/41, original nine fixed 9/9. All PA-01–09 USER-PAUSED; no M10 or optional M11/M12.

**Next:** bounded M5 B43 date-label/narrow width investigation using existing fixtures and current CSS/formatter; implement only an actual unowned defect. PR344 belongs to another agent.
