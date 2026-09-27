# Blitzit Help Center text + image forensic pass — complete

Date: 2026-09-27  
Agent: ChatGPT  
Scope: official external-source evidence/spec reconciliation only; no Narro application source/config/build changes

## Trigger

The user explicitly requested a detailed pass over every Help Center page, with special emphasis on instructional screenshots/images, to supplement the already completed video UI/UX forensics.

## Repository/source baseline

- branch started from main: `373aa3f5f8911b0effec1673d2eada68dd7951e6`;
- validated application source baseline remains `699b6ac46bcc6ebcabbcded21f929a7b32018b42`;
- open source PR #170 remained separate at head `a22b552623195e40d7f88cf0e23a9b05a1eb0792` and was not modified.

## Coverage

### Visible Help Center navigation

- **34/34** visible legacy-navigation pages inventoried and classified.
- Every page was assigned one of:
  - Narro-relevant product evidence;
  - versioned/newer Blitzit 3.0 context;
  - out-of-scope account/cloud/integration/AI/community/commerce material.

### Deep product review

- **15/15** Narro-relevant Help Center pages reviewed for article text and available official image evidence:
  - Introduction;
  - Lists;
  - Tasks;
  - Blitz mode;
  - Timer modes;
  - Scheduling;
  - Notes;
  - Subtasks;
  - Delete/Archive;
  - Windows shortcuts;
  - Productivity report;
  - Time spent report;
  - Sessions report;
  - Preferences;
  - Troubleshooting.

### Newer 3.0 separation

Nine discoverable newer 3.0 pages were explicitly classified in this pass, including migration and newer integration guides. Multiple 3.0 guides explicitly warn that their features may not be available in the current public v2.6.69 product.

No 3.0 account/cloud/integration UI was promoted into Narro parity requirements.

## Material findings

### Permanent task deletion confirmation — promoted to source-confirmed

The current Deleting and Archiving Help Center article explicitly documents:

- hover task;
- open expanded menu;
- click Delete;
- then **Confirm**.

This resolves the prior video-only ambiguity. VE-006 did not visibly expose the transient confirmation state, but the official current documentation does.

Disposition:
- Narro explicit permanent-delete confirmation remains required;
- this is now source-confirmed behavior, not only a Narro safety improvement;
- permanent deletion remains irreversible and deleted tasks are excluded from Reports.

### Sessions export conflict retained

Current Help Center Sessions prose says `Export PDF`.

The supplied current v2.6.69 screenshot says `Export .csv`.

Evidence precedence remains:
- direct supplied current screenshot > Help Center prose for current visible UI.

Disposition:
- Overview → PDF;
- Sessions → CSV;
- do not invent duplicate export controls.

### Help Center image grammar

Official screenshots independently corroborate:
- compact dark anchored popovers;
- inline task creation/editing;
- bright teal/mint focus borders;
- mint active toggles;
- nested Preferences controls under vertical guides;
- compact selects/inputs;
- warm/red destructive consequence rows for recurrence;
- pink→mint/green high-salience primary CTAs;
- dense Focus and report layouts;
- in-context Notes/Subtasks.

Static screenshots do not establish animation timing/easing.

### Source reliability limitations

Troubleshooting documents:
- server-side delay can make a new task temporarily appear missing;
- second monitor added after launch may require Blitzit restart.

Disposition:
- Narro intentionally does not copy either limitation;
- local persistence-first mutation remains authoritative;
- runtime monitor-topology handling remains event-driven and hotplug-safe.

### Break documentation

Windows shortcut/help material describes normal break flow as pausing current work and returning toward the current task workflow after break completion.

Disposition:
- corroborates existing break/session design;
- does **not** resolve the separate success-screen `Take a Break` post-click semantics, so that ambiguity remains intentionally open.

## Durable repository changes

Added:
- `docs/BLITZIT_HELP_CENTER_EVIDENCE.md`
- `docs/BLITZIT_HELP_CENTER_TRACKER.md`

Reconciled:
- `docs/RESEARCH_EVIDENCE.md`
- `docs/SOURCE_AUDIT.md`
- `docs/UI_UX_SPEC.md`
- `STATUS.md`
- `HANDOFF.md`

## Validation

- visible legacy-navigation inventory: PASS — 34/34;
- Narro-relevant text/image deep review: PASS — 15/15;
- version separation: PASS;
- material contradictions recorded: PASS;
- application source changes: none;
- application build/test/Windows CI: NOT RUN / NOT REQUIRED for evidence-only markdown/spec reconciliation;
- validated application source baseline unchanged;
- M7 deferred physical matrix remains OPEN.

## Exact next action

After this evidence PR merges:
1. re-read live PR #170 head/base/CI;
2. implement the narrow VE-F003 task-menu `Change List` + `Duplicate` correction from latest main;
3. preserve Help Center-confirmed permanent-delete confirmation;
4. resume M8 Preferences/runtime work using the combined video + Help Center evidence.
