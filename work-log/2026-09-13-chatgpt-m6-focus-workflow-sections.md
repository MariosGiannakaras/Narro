# M6 Focus workflow sections validation

Date: 2026-09-13
Agent: ChatGPT
Milestone: 6 — Blitz Mode / Focus Panel
Slice: item 5/16 — Show remaining/scheduled/done sections matching documented focus workflow

## Outcome

Item 5 is fully validated. The production Focus Panel already contained the source-evidenced Remaining / Scheduled / Done workflow from the earlier hierarchy slice, so this slice deliberately avoided rewriting working production code and instead made the workflow semantics an explicit regression contract.

Validated behavior:

- current live task identity is excluded from non-live queue sections;
- ordinary Today work remains in Remaining;
- overdue scheduled/date work remains actionable in Remaining;
- future-timed non-overdue Today work is shown in Scheduled and is not duplicated in Remaining;
- Done is projected from the authoritative `ListBoardSnapshot.done` lane;
- All Lists keeps list-origin chips while selected-list projection remains identity-stable;
- section order remains active card -> Remaining -> Add Task -> Scheduled -> Done;
- item 5 remains read-only presentation/grouping and adds no break/notes/pause/resume/skip/finish mutations.

## Material changes

PR #104 changed only:

- `scripts/test-ui-focus-panel.mjs` — explicit regression contract for queue partitioning, row markers/count headings, authoritative Done projection and deterministic fixture examples;
- `HANDOFF.md` — in-progress checkpoint state carried on the branch.

No production React/Rust/Tauri source, schema/migration, dependencies, timer/session engine, scheduling policy, UI geometry, Notes behavior, Floating Timer, preferences/shortcuts, Reports or release scope changed.

## Validation evidence

Local preflight: **NOT RUN** — connector-only environment.

PR #104 exact validated head:

`129687c381b84a91e76d008e8163c5b8bade21aa`

Windows PR CI #405:

- run `34747582849`, job `103698237432`: **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression / Focus light-dark capture validation: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**;
- visual artifact `10315220318`, digest `sha256:c07fecca5f209da2c7e7e3c2acdb0e67928a834b7aff0869ae6147e2559247f7`;
- diagnostic artifact `10315415290`, digest `sha256:f170b6fdb5516a8d90bd6ab7ae4d7013b1afdafb51ed5cd40d7bef6a768f1671`.

Final review before merge:

- exact head remained `129687c381b84a91e76d008e8163c5b8bade21aa`;
- PR diff remained limited to the static Focus regression contract and HANDOFF checkpoint text;
- no PR comments, submitted reviews or unresolved review threads required action.

Expected-head guarded squash merge:

`c74985c117aa4ac550ad6ade1442f28c998c5f49`

Source tree:

`8eaf157fdb4d5c4d9db12091c6149e8c4ae1108b`

Windows resulting-main CI #406:

- run `34748317733`, job `103700208950`: **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**;
- visual artifact `10314173991`, digest `sha256:ef8cbf16d39b327d410605371bb81f44c359693fc151b1c68b03123df82f36df`;
- diagnostic artifact `10315251351`, digest `sha256:628a0ad331df9dca01e1588d37ad310a3470859f7dccac727e54a8db4da514a1`.

## Tracking reconciliation

- M6 advances from 4/16 to 5/16 validated top-level items.
- General roadmap remains 5/10 completed milestones.
- `TODO.md`, `STATUS.md`, and `HANDOFF.md` are reconciled after resulting-main validation.
- Latest validated source/test baseline is `c74985c117aa4ac550ad6ade1442f28c998c5f49`; markdown-only tracking descendants do not replace it.

## Exact continuation

Start the next ordered slice: M6 item 6 — `Implement break, notes, pause/resume, skip, finish.` Reconstruct the Focus action contract from current specs/screenshots and existing typed timer/session and notes APIs before source edits. Reuse authoritative M3 timer/session transitions and M5 Notes behavior; do not create renderer-owned session state, auto-open URLs, or absorb item 7 subtasks/progress or later M6 items.
