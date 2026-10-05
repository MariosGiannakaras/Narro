# 2026-10-05 — M11 capture-first visual + observable protocol/state audit design

## Scope

Documentation/process/tracking only. No Narro production source, tests, Rust/React/Tauri configuration, CI workflow, migrations, build logic, active PR #234 source or validation evidence was changed.

The user refined optional M11 with two requirements:

1. while live Blitzit is already being visually exercised/recorded, also collect the observable client/backend/state behavior produced by those same ordinary user actions;
2. do **not** analyze and patch Narro opportunistically during capture. First complete one coherent evidence campaign, then analyze the frozen corpus in a later phase, then plan and implement corrections in another phase.

## M11 phase model

The binding order is now:

`PLAN -> CAPTURE EVERYTHING -> FREEZE CORPUS -> ANALYZE -> RECONCILE/PLAN -> IMPLEMENT -> REVALIDATE`

This is enforced in:
- `docs/BLITZIT_LIVE_REFERENCE_AUDIT.md`;
- `TODO.md`;
- `AGENT_WORKFLOW.md`;
- `AI_START_HERE.md`;
- `AGENTS.md`;
- `HANDOFF.md`;
- `STATUS.md`;
- `docs/EVIDENCE_ROUTING_MAP.md`.

M11 remains **DORMANT / NOT AUTHORIZED**. This redesign does not activate it and does not change the current /10M denominator.

## Dual synchronized evidence streams

If the user explicitly activates M11 in the future, the scripted live Blitzit campaign records both:

### User-visible stream
- continuous screen recording;
- screenshots/keyframes where useful;
- input/window/display context;
- synchronized timestamps/session IDs.

### Observable protocol/state stream
From ordinary authorized use of the user's own trial/account, where legitimately observable without defeating security controls:
- endpoint/path patterns, methods, timing and status;
- redacted request/response payload shapes and semantics;
- realtime/WebSocket/SSE event types/order if observable;
- IDs/revisions/order/timestamps exposed to the client;
- optimistic update vs acknowledgement/reconciliation;
- ordinary UI-triggered retry/conflict/error behavior;
- local storage/IndexedDB/cache/app-data changes;
- materially relevant local process/file/database effects;
- before/after state snapshots for task/list/reorder/timer/session/schedule/report behavior.

This is explicitly an **observable-contract reconstruction**, conceptually similar to a Mimic-style behavioral capture. It does not claim private Blitzit server source, internal database schema or unexposed algorithms.

## Capture-phase analysis embargo

During the acquisition campaign:
- no Narro source/config/test change may be made because of a live observation;
- no parity verdict or crosswalk disposition may be created;
- no deep frame/network analysis may begin;
- no remediation branch may be opened;
- an interesting difference must not interrupt the planned campaign.

Allowed notes are neutral capture metadata only: timestamps, user action labels, session IDs, capture-health notes and reproducibility information.

Unexpected/failing states are preserved rather than overwritten.

## Corpus freeze

After the planned campaign:
- acquisition stops;
- raw files/session chronology are inventoried;
- hashes/integrity are recorded;
- scenario coverage/gaps are recorded;
- sanitization/redaction status is recorded;
- recordings/logs are verified readable.

A missing/corrupt required scenario triggers a capture-completion session and a new freeze. Remediation still does not start.

## Analysis and reconciliation

Only after corpus freeze:
- the entire visual corpus is reviewed;
- the entire observable protocol/state corpus is correlated against the same scripted actions;
- findings are classified as direct observation, strong inference or unknown/unobservable;
- live findings are reconciled against canonical Pass-3/static calibration and version context;
- one complete findings register is created.

Only after full-corpus analysis:
- each finding receives a disposition;
- a dependency-aware remediation plan is frozen.

Only then may Narro implementation begin.

## Security/privacy boundary

The repository must not receive raw credentials, tokens, cookies, payment data or unrelated private account content.

Sensitive raw network/state captures remain local. Repo evidence is limited to sanitized/redacted derivatives, manifests, hashes and structural summaries.

The audit must not bypass authentication, access controls, certificate pinning or similar protections just to gain more evidence; such channels are recorded as unavailable.

Ordinary trial/account observation is not authorization to purchase/renew/upgrade/cancel subscriptions or change billing/account/security settings.

## Current project state unaffected

- M11 is still dormant and explicitly unauthorized.
- General continuation language still cannot activate M11.
- Current progress denominator remains 10.
- Active PR #234 remains the current M1–M9/M7 line.
- No M10/M11 checkbox, validation count or milestone counter changed.
- No CI was required for these Markdown-only `[skip ci]` changes.
