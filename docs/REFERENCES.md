# External References

Last reviewed: 2026-08-15

This file is a compact navigation index for Codex or any future implementation agent that wants to inspect the underlying sources directly. It is intentionally not another product specification.

## How to use these references

The repository documentation is an evidence-based implementation baseline, not an infallible transcript of Blitzit and not a mandate to copy every source behavior literally.

Treat sources and project documents as follows:

- **User requirements and project invariants are authoritative.** Local-only, Windows-only scope, data-integrity guarantees, no telemetry/cloud/auth, and explicit user decisions must be preserved unless the user changes them.
- **Current screenshots and official Blitzit material are fidelity evidence.** They are useful for understanding workflows and visible states, but Blitzit itself may contain bugs, obsolete behavior, undocumented behavior, or implementation compromises that MyBlitzit should not reproduce blindly.
- **Roadmap, bug reports, reviews, and feature requests are diagnostic evidence.** Use them to identify friction, reliability failures, and ideas. They do not automatically become requirements.
- **Architecture, UI measurements, animation timings, library choices, schema sketches, and implementation mechanics in this repository are current best proposals.** Codex may replace them with a demonstrably better approach when it preserves the intended behavior, scope, reliability, performance, and visual character.
- **Do not re-research everything by default.** Open the original references when a requirement is ambiguous, a source conflict matters to the current milestone, the implementation exposes a better alternative, or current platform/framework documentation may have changed.
- **When deviating from a recorded proposal, preserve intent and evidence.** Record a materially different durable decision in `STATUS.md` with the reason and validation evidence. Do not silently rewrite confirmed product behavior merely for implementation convenience.

The detailed source synthesis lives in:

- `docs/RESEARCH_EVIDENCE.md` — screenshot inventory and visible-state evidence.
- `docs/SOURCE_AUDIT.md` — exhaustive Help Center/page-by-page audit, official video inventory, roadmap/bugs, reviews, and feedback synthesis.

## Blitzit official product references

Primary entry points:

- Help Center: https://www.blitzit.app/help-center
- Help Center Home: https://www.blitzit.app/help-center/home
- Introduction: https://www.blitzit.app/help-center/introduction-to-blitzit
- Lists: https://www.blitzit.app/help-center/lists
- Tasks: https://www.blitzit.app/help-center/tasks
- Blitz / Focus Mode: https://www.blitzit.app/help-center/blitz-mode-%28focus-sessions%29
- Timer Modes: https://www.blitzit.app/help-center/timer-modes
- Scheduling / Reminders: https://www.blitzit.app/help-center/scheduling-task-reminders
- Task Notes: https://www.blitzit.app/help-center/task-notes
- Subtasks: https://www.blitzit.app/help-center/subtasks
- Deleting / Archiving: https://www.blitzit.app/help-center/deleting-and-archiving-tasks-and-lists
- Windows Shortcuts: https://www.blitzit.app/help-center/key-shortcuts-for-windows
- Preferences: https://www.blitzit.app/help-center/preferences
- Productivity Report: https://www.blitzit.app/help-center/productivity-report
- Time Spent Report: https://www.blitzit.app/help-center/time-spent
- Sessions Report: use the current Sessions entry linked from https://www.blitzit.app/help-center if the direct slug has changed.

Official engineering/product direction:

- Building a cross-platform productivity app: https://www.blitzit.app/blog/building-a-cross-platform-productivity-app

The full Help Center navigation, integration pages, support pages, and what each page contributes to the product model are recorded in `docs/SOURCE_AUDIT.md`.

## Blitzit official/public feedback references

These are useful for identifying source-product bugs and UX friction, not for defining MyBlitzit behavior by themselves:

- Blitzit roadmap / feature board: https://blitzit.frill.co/roadmap
- Feature/bug board root: https://blitzit.frill.co/
- Product Hunt reviews: https://www.producthunt.com/products/blitzit-2/reviews
- G2 reviews: https://www.g2.com/products/blitzit/reviews
- Tom's Guide hands-on review: https://www.tomsguide.com/computing/i-bought-this-productivity-app-from-instagram-and-its-now-an-essential-part-of-my-toolset

Individual Frill reports and their implementation relevance are indexed in `docs/SOURCE_AUDIT.md`. Prefer that synthesis first; open individual reports only when the relevant milestone needs the original wording/context.

## Official embedded videos

Blitzit's Help Center embeds official YouTube demonstrations across several articles. Known IDs found during research include:

- `FoPur53wBSY`
- `-svimZDrVUk`
- `dRuYw4jWlps`
- `JnWLP96Kv8M`
- `JuMwx-9OgVc`

The research environment could identify embedded video IDs/context but could not reliably retrieve transcripts for every video. Therefore:

- do not infer spoken claims from an ID alone;
- use the accompanying official Help Center article as the behavioral source unless a transcript/video can actually be inspected;
- if Codex has direct browser/video access in a later session, it may inspect the videos to refine interaction details, but must distinguish newly observed details from existing confirmed requirements.

## Supplied screenshot source

Original supplied archive:

- filename: `blitzit Ss.rar`
- SHA-256: `18ab981eebbdf8327976c09bf732f62857d501dae08e6057dfc743c7378b5fab`
- extracted screenshots reviewed: 30 PNG files
- current direct captures visibly include Blitzit `v2.6.69`

The images themselves are not committed to this repository. Their screenshot-by-screenshot observations are preserved in `docs/RESEARCH_EVIDENCE.md` and `docs/UI_UX_SPEC.md`. If a future Codex session is given the original archive/screenshots, it may re-open the exact relevant image for visual validation instead of treating our measurements as exact source values.

## MyBlitzit technical references

These should be consulted when implementation details or APIs may have changed since this research pass:

- Tauri 2 documentation: https://v2.tauri.app/
- Tauri JavaScript API reference: https://v2.tauri.app/reference/javascript/api/
- Tauri global shortcut plugin: https://v2.tauri.app/plugin/global-shortcut/
- Tauri autostart plugin: https://v2.tauri.app/plugin/autostart/
- Tauri notification plugin: https://v2.tauri.app/plugin/notification/
- Tauri SQL plugin: https://v2.tauri.app/plugin/sql/
- Microsoft WebView2 documentation: https://learn.microsoft.com/en-us/microsoft-edge/webview2/
- Microsoft Windows App SDK / windowing documentation: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/windowing/windowing-overview

Tauri is the selected starting stack, not an untouchable conclusion. If the Milestone 1 capability/performance spike reveals a concrete blocker or clearly inferior behavior for this Windows-only use case, Codex may evaluate a better implementation path. Any stack-level change must be evidence-driven, preserve the local-only product requirements, and be recorded in `STATUS.md` before broad implementation proceeds.

## Interpretation rule

When deciding whether to copy, improve, or replace a behavior, prefer this order:

1. preserve the user's explicit goal and scope;
2. preserve the core workflow and recognizable product experience;
3. preserve correctness, data integrity, accessibility, and performance;
4. use current official/source evidence to understand intent;
5. improve source-product bugs or avoidable friction when the improvement does not undermine parity;
6. choose the simplest maintainable implementation that satisfies the above.

The objective is not to reproduce Blitzit's bugs or historical implementation constraints. The objective is to build the best local Windows version of the same core experience, with traceable reasons for deliberate differences.
