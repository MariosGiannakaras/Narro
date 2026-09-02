# Antigravity kickoff prompt — Narro Milestone 1

Copy the prompt below into Antigravity to begin implementation.

---

You are taking over implementation of the private repository **MariosGiannakaras/Narro**.

This project will be alternated between multiple coding agents (especially Antigravity and Codex), so **the repository itself is the only durable handoff medium**. Do not rely on this chat being visible to the next agent.

## Mandatory startup procedure

Before changing anything:

1. Synchronize/fetch the latest `main` and inspect recent commits/current Git state.
2. Read completely:
   - `AGENTS.md`
   - `AGENT_WORKFLOW.md`
   - `HANDOFF.md`
   - `STATUS.md`
   - `TODO.md` — focus on Milestone 1 only
   - `docs/ARCHITECTURE.md`
3. Read other specs only when relevant to the implementation question you are currently solving. Do not repeat the Blitzit product research by default.
4. Inspect the repository implementation/tests as they actually exist. If `HANDOFF.md` conflicts with repository reality, correct the handoff first.

## Your scope for this session

Begin **Milestone 1 — Windows desktop scaffold, capability and performance spike** from `TODO.md`.

Do **not** implement the polished Blitzit/Narro product UI yet. Temporary diagnostic UI is allowed only to prove native/window capabilities.

The current architecture — Tauri 2 + React + TypeScript + Rust + SQLite, with `main` plus one `focusSurface` that morphs between Focus Panel and Floating Timer — is the current best proposal, **not an untouchable truth**.

Use it as the starting hypothesis. If you find a materially better Windows-specific approach, you may propose/adopt it only when you can explain concrete benefits/tradeoffs and validate it against the same requirements. Do not change durable architecture silently.

## Milestone 1 priorities

Work in small coherent, testable slices. The target capabilities are those listed in `TODO.md`, including:

- minimal Tauri 2 + React + TypeScript Windows scaffold;
- Rust module boundaries for app state, persistence, timers, scheduling and window coordination without prematurely implementing later milestones;
- SQLite migration harness and minimal migration `0001`;
- only the proposed `main` and `focusSurface` webview windows initially;
- authoritative Rust state visible from both windows;
- `main` create/show/hide/destroy/recreate without losing Rust/domain state;
- temporary Focus Panel and Floating Timer modes on the same `focusSurface`;
- mode switching by native window resize/reposition/restyle rather than parallel focus webviews;
- always-on-top / skip-taskbar behavior;
- monitor enumeration and Focus Panel left/right positioning;
- display topology recovery/clamping after monitor changes;
- global shortcut registration and conflict handling;
- tray/background lifecycle and explicit Quit;
- local Windows notification;
- autostart toggle;
- a separate/minimal `focusSurface` frontend bundle that does not pull dashboard/reports/settings/editor code;
- floating-only CPU/RAM measurement with main closed/destroyed and no decorative animation;
- minimal Rust command/event smoke tests.

Do not jump to Milestone 2+ unless a tiny piece is genuinely required to unblock Milestone 1.

## Critical checkbox rule

`TODO.md` checkboxes are evidence-based:

- `[ ]` = not fully implemented and validated.
- `[x]` = implemented **and** relevant validation has actually passed.

Never mark a task complete merely because code exists or compilation succeeds.

For partial progress, keep the parent `[ ]` and add nested checkboxes if useful.

If your environment cannot perform a required Windows/manual scenario, leave that checkbox open and record exactly what remains unverified.

## Multi-agent repository discipline

Every meaningful change required by the next agent must be committed/pushed to the repository before handoff.

For every coherent slice:

- use clear commits;
- preserve unrelated changes;
- add/update tests where appropriate;
- run the narrowest useful validation;
- do not claim commands/tests were run if they were not.

Before you stop this session, you MUST:

1. commit/push all intended changes;
2. update `TODO.md` checkboxes only where validation justifies it;
3. append a detailed coherent entry to `WORK_LOG.md` containing:
   - agent = Antigravity;
   - milestone/slice;
   - commit SHA(s);
   - important files/components changed;
   - decisions and reasoning;
   - exact commands/tests/manual checks and PASS/FAIL;
   - performance measurements with context when relevant;
   - blockers/unverified Windows checks;
   - exact next continuation point;
4. update `STATUS.md` when project-level truth changed (architecture decision, benchmark result, capability gate, important known limitation);
5. rewrite `HANDOFF.md` so the next Codex/Antigravity session can continue without this chat;
6. ensure required work is not left only as uncommitted local files.

## Correctness and product constraints

Do not add accounts, cloud sync/backend, subscriptions, telemetry, collaboration, AI integrations or other excluded remote features.

Do not copy Blitzit branding; Narro's canonical logo is `assets/branding/narro-logo-master.png`.

Original Blitzit screenshots are available under `reference/original-blitzit-screenshots/` as visual evidence, not assets and not infallible behavior truth.

Timer/session correctness, stable task identities, date-only vs datetime semantics and local-only persistence are durable requirements, but Milestone 1 should only establish the minimum boundaries/harnesses needed for the spike rather than fully implementing later engines.

## Technical research rule

For current Tauri/WebView2/Windows APIs, check up-to-date official technical documentation when needed rather than trusting potentially stale assumptions in the repo. However, do not redo the already-completed Blitzit feature research unless a concrete ambiguity requires it.

## Performance rule

Do not guess whether WebView2/Tauri is “lightweight enough”. Measure it on Windows.

Record methodology and context for CPU/RAM measurements. Avoid arbitrary pass/fail thresholds invented before a baseline exists. If the floating-only profile or required native behavior is clearly problematic, stop broad UI implementation and document/evaluate a native Win32/WinUI or other better alternative before proceeding.

## Expected outcome of this session

Advance Milestone 1 as far as your actual environment can validate, preferably through several coherent committed slices. Do not pretend Windows-specific manual checks passed if you cannot execute them.

At the end, leave the repo in a state where the next agent can open `HANDOFF.md` + `WORK_LOG.md` and know exactly:

- what is implemented;
- what is verified;
- what failed or is blocked;
- what commits contain the work;
- what should be done next.
