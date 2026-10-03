# M7 single-instance merge and reconciled #192 candidate checkpoint

Date: 2026-10-01

## PR #206 — exact-head validated and merged

PR #206 `fix/runtime-single-instance` exact head:
`ab1e89fcabc7b8385016a738603d41002f9c3b14`

Windows CI #784 / run `36780624064`: **PASS**

Artifacts:
- visual: id `11128630619`, digest `sha256:a37be050152e27a4f34b941fa544decfa160fc2aa9df1878274da4cd0a584e5e`
- runtime harness: id `11128561273`, digest `sha256:f7394abc31a3ed6c42dfe755fbd7fab044cc79ff19deb3bf8f1387984bb24728`

Guarded squash merge used expected head `ab1e89fc...`.

Resulting main source SHA:
`4f48941939fa5114e100992280b9ea96540f0df8`

Resulting-main Windows CI:
- #785 / run `36782620879`
- **IN PROGRESS** at checkpoint creation.

RISK-F009 is not promoted to fully validated until #785 passes.

## #192 reconciliation candidate prepared but branch untouched

Old #192 head remains:
`0ef808445b567a4a3194296ed1dccb5a6a58b03e`

A complete reconciliation tree was built on top of merged main `4f489419...`:
`2cf5055191a81ca7ce9fb3a13198c515de524f7c`

A normal unreferenced two-parent merge commit was created:
`1a53848c05100b7f3cb63cc9e7123d727bee3dcf`

Parents:
1. old #192 head `0ef808445b...`
2. merged main `4f489419...`

No branch/ref has been moved yet.

The candidate:
- retains #206 Cargo.lock exactly;
- retains #206 single-instance regression + plugin-first runtime boundary;
- retains M9 reporting/session modules and report API preflight;
- retains current repository tracking/work-log state from main;
- reapplies all #192 single-focus source/harness deltas;
- preserves validated main four-attempt/backoff visual readiness while retaining the #192 task-schedule fixture budget;
- includes B5 `Blitz now -> Focus Panel` correction through a coordinator target-Panel request for already-visible Focus host;
- includes B6 native Ctrl+Shift+T gate using authoritative `TimerService::snapshot()`, requiring non-Idle + task binding before show/emit;
- adds defensive coordinator idle/no-task rejection and B5/B6 static/Rust regressions.

Static inspection confirmed expected combined paths and contracts. Compare against merged main shows the expected M7 replacement delta only; compare against old #192 shows the current main/M9/single-instance/tracking additions plus B5/B6 corrections.

Do not move `plan/m7-single-focus` until #785 passes. On #785 PASS, fast-forward that branch from old #192 head to `1a53848c...`, then require a fresh exact-head PR #192 Windows CI before issuing any physical artifact.

No roadmap/milestone counter advances at this checkpoint.
