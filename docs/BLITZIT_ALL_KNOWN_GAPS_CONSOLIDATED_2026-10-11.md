# Blitzit → Narro: consolidated known gaps and evidence limits (2026-10-11)

## CURRENT 2026-10-12 — No M11 prerequisite for Narro completeness

This document is a **historical gap inventory**. The user reiterates M11 is **optional**: Narro should implement safe, coherent, accessible and fully working local-first functionality even when actual current Blitzit source behavior cannot be inspected. Missing original evidence remains a source-parity note, never by itself a functional implementation blocker. U12/U21/U35/U40 historical code gaps were **all corrected** in guarded-merged #334/#338/#336/#335, and latest resulting-main [Windows CI 38231906248](https://github.com/MariosGiannakaras/Narro/actions/runs/38231906248) 3/3 and four actual production file hashes are accepted. See [current 41-item disposition](BLITZIT_UNVERIFIED_AUDIT_CONSOLIDATED_TRIAGE_2026-10-11.md) and [immutable decision](../work-log/2026-10-12-chatgpt-u01-u41-local-first-without-m11-implementation-policy.md). Remaining potential local work: non-destructive U22/U23 Break projection, U06/U09 action/affordance UX and carefully scoped U04 destructive domain policy; analyze all before coding, preserve all existing authoritative timer/task/session/Reports and user-locked List Editor behavior. Physical Codex PA-01–09 USER-PAUSED; source parity OPEN; M11 dormant.


**Status:** ANALYSIS / TRIAGE ONLY. All known findings from the closed **41-question unknown-only repository review**, its **31 separate static screenshot EVIDENCE_LIMIT claims**, and the recorded **native Windows acceptance families** are collated here. **This is not an assertion of 41 Narro defects or of exhaustive knowledge of unseen Blitzit code.** No fix is authorized by inclusion in this report.

**Authoritative sources:** `docs/BLITZIT_UNVERIFIED_BEHAVIOR_REGISTER.md` (U01–U41, detailed evidence + dispositions; 42/42 review actions, 41/41 findings reviewed), `docs/BLITZIT_CONTROL_STATE_AUDIT_MATRIX.md` (31 EVIDENCE_LIMIT claims across 250 static mapped claims), `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, `docs/BLITZIT_FORENSIC_PASS3_VIDEOS.md`, `docs/BLITZIT_FORENSIC_PASS3_SCREENSHOTS.md`, `docs/BLITZIT_HELP_CENTER_EVIDENCE.md`, `docs/EVIDENCE_ROUTING_MAP.md`, `docs/PRE_CODEX_RISK_AUDIT_2026-10-11.md`, 10 immutable Blitzit review batches and final correction.

**Source boundary:** Historical source MP4s/Help/screenshots often establish a particular *older* Blitzit result but not its current v2.6.69 algorithm. No live current Blitzit capture was performed; optional M11 requires a specific future user opt-in and is not activated by this inventory. No new source MP4 pass or screenshot parity comparison, code/config/test modification, CI invocation or physical Windows interaction was done to create this document. Existing source+CI PASS is **not** native or original-source equivalence PASS.

**Repo baseline when consolidated:** `main` at `f858a79deee4cb35344c8c72f609046a18cd4953` (subsequent Markdown may advance main); latest executable-source merge #333 `ef22a7e434bea6cc4849282aa46c4786d9d90663` with exact PR-head validation 3/3 and 5/5 matched blobs. Resulting-main Windows [run 38173126053](https://github.com/MariosGiannakaras/Narro/actions/runs/38173126053) was **IN PROGRESS, NOT ACCEPTED** when queried; new ZIP/exe/NSIS/MSI identities were not yet final. Current physical Codex session **USER-PAUSED**. See live `HANDOFF.md`, `TODO.md`, and `STATUS.md` before any future implementation; the historical Q12 binary does not certify the replacement.

## How to interpret the gap classes

- **LOCKED** — user-approved local-only departure, not a defect or parity-work item. **U01/U02 List Editor Spectrum Core, uploaded image and 218-icon picker must not be modified** merely to match source.
- **GAP-CODE / UNAVAILABLE** — demonstrable absent, limited or internally inconsistent local behavior; original source semantics may still be unknown. Needs an evidence-backed *product/domain decision* before risky changes, not speculative patching.
- **HISTORICAL-DIFFERENCE** — observable old Blitzit output differs from Narro today; may be version-dependent and must not automatically override safer persisted Narro invariants.
- **INFERRED / SOURCE-UNKNOWN** — a deterministic Narro implementation exists, but original event sequence/algorithm is not directly witnessed. Tests validate Narro's own contract, not parity.
- **NATIVE / VISUAL OPEN** — current code may be integrated and automated accepted, but real Windows geometry/IO and current Blitzit pixels/motion are separate gates.
- These labels **overlap**. Each U-item below appears **once**. Supporting screenshots 31 and independent physical gates are listed separately and are **not additional independent U-numbers**.

## Immediate gap triage (not a new implementation roadmap)

| Candidate | Evidence-backed distinction | Safe next step / hard gate |
| --- | --- | --- |
| U04 Archived Done row delete | Per-row trash visible in original evidence; in Narro intentionally **unavailable** because historical source does not establish permanent deletion / confirmation / history side effects | Destructive domain policy + preservation of task/session/report invariants; no inferred hard delete |
| U12 backend timezone validation | Current UI offers IANA selection, but direct Rust prefs patch/storage validates a token shape, not authoritative valid IANA membership | Independent regression-first Rust backend analysis, fail-closed migration/error tests; avoid guessing Blitzit DST policy |
| U06 Reports calendar double-arrow and U09 chart-ellipsis | Source controls visible but click outcomes unknown; Narro's double-arrow semantics not invented and chart-options button safely disabled | Current-source action capture or explicit Narro-only display contract, keeping report ledger untouched |
| U21–U23 Focus Break presentation | Old Blitzit shows **Break active card**, Break row in Focus Done (not in task completion fraction), and temporary +break duration in header EST; Narro keeps work title live, omits Break in Focus Done and static EST | Source-version confirmation before view-only Focus projections; **never** change persisted work/break/session or task progress to satisfy historic visuals |
| U35 Sessions `Recent Tasks` | Local picker label says `Recent` but data order is Backlog→This Week→Today→Done, not timestamp-recent | Define recency semantics/source samples before resorting or adding persistence metadata |
| U40 Today Blitz CTA preview | Future-*timed* task in Today can make CTA vivid while backend legitimately says no eligible task | Optional view-only UX reconciliation; authoritative Rust eligibility must not be duplicated as separate unsafe start rule |
| U24/U25/U36 historical domain differences | Older source week includes Today, bottom Add Task displays newest above, unschedule returns Backlog; Narro uses independent This Week, bottom append/explicit Top, preserved manual lane | Modern source/explicit product decision only; do not rewrite rank, saved manual lanes or completion ledger based on one old video |
| U07/U28/U39 copy; U13 metric | Some exact wording differs; Home row trailing time is implemented as EST but source metric meaning unknown | Source exact text/metric reconciliation; avoid elevating copy difference to missing function |
| U37 and PA-01–PA-09 native gates | Source/CI changes are integrated, but live Windows WebView2/multimonitor/OS IO acceptance is outstanding | Resume *user-paused* Codex physical only by explicit user instruction, using final hashed executable; M11 remains distinct opt-in |

No arbitrary severity assertion is assigned to unknown original source features. The actual implementation priority remains `TODO.md`; this is a **gap/evidence worklist**, not an instruction to start parallel coding PRs.

## A. Lists, Board, task creation, planning and empty states — 14 unique items

| ID / class | Exactly what is missing or different | Current Narro state / boundary |
| --- | --- | --- |
| **U01 LOCKED** | Original list color preset RGB/HEX, picker popup draft/cancel/apply, keyboard and exact visual selection unobserved | **User-approved Spectrum Core** color picker is deliberate local-only design; merged, **not to be replaced**. Source may be observed for information only. |
| **U02 LOCKED** | No original 218-icon chooser/catalog/categories, icon IDs, image/letter precedence or duplicate/archive rule documented | **User-approved local 218 icons + uploaded image/letter fallback** already implemented and protected. No parity-driven edits. |
| **U05 INFERRED** | Exact source subtasks repeat Enter, draft clearing/X, pending/focus behavior in Board and Focus unknown | Existing +/inline create/reset/atomic persistence integrated (#270); source keyboard/native agreement unverified. |
| **U13 SOURCE-UNKNOWN** | Home list task-row trailing duration could be EST, actual Taken, remaining or context-specific; originals show location, not meaning | Narro displays saved **EST only** with list footer aggregate, without inventing tracked-time field in Home. Correct parity unknown. |
| **U21 HISTORICAL-DIFFERENCE / GAP-VIEW** | Old source manual/Pomodoro Break **replaces active task card/title** and moves work task into remaining queue | Narro holds work task as live during Break, excludes it from queue; Rust Break/timer identity is authoritative and should not be rewritten to force UI match. |
| **U22 HISTORICAL-DIFFERENCE / GAP-VIEW** | Old Focus Done lists a **Break history row** while task fraction stays 0/7, showing visual history ≠ completed tasks | Narro Focus Done displays only completed tasks; Break sessions **are** saved and visible in Sessions/Reports, not projected as a Focus Done row. |
| **U23 HISTORICAL-DIFFERENCE / GAP-VIEW** | Old Break temporarily adds e.g. +10 min to Focus header EST then restores it; modern rendering unknown | **POMO badge already exists**, but header EST remains static; a future change is display-only, never persist an extra task estimate or task completion. |
| **U24 HISTORICAL-DIFFERENCE** | Old This Week total/EST includes Today as a superset; moving an item Today left older Week total unchanged | Narro implements separate ISO-week/current-effective This Week and Today lanes with automated tests; current-version Blitzit denominator unknown. |
| **U25 HISTORICAL-DIFFERENCE** | Old bottom Today `ADD TASK` added second new task **above** first | Narro bottom `ADD TASK` appends; dedicated `ADD TO TOP` prepends. Order is deliberate and safe, not a duplicate/race defect. |
| **U28 COPY / SOURCE-UNKNOWN** | Old inline editor title label `Title` vs Narro `Task`; exact current input grammar/keyboard/motion unknown | Inline create anatomy, HH:MM, repeated input, guarded SQLite commit implemented (#289); **no missing title input**. |
| **U31 SOURCE-UNKNOWN / VISUAL** | Empty Today Blitz CTA is muted in old video, **but never clicked**: disabled, focusable, no-op, popup unknown | Narro visually dims but delegates actual start/no-task status to Rust and does not disable solely on stale visual preview. |
| **U36 HISTORICAL-DIFFERENCE / DOMAIN-DECISION** | Old This Week → next-week scheduled Backlog → remove schedule left task in **Backlog** | Narro atomically clears schedule and returns **preserved manual This Week**. Concrete old-version divergence; new contract needs contemporary evidence/product decision, not silent destructive lane rewrite. |
| **U39 COPY / HISTORICAL-DIFFERENCE** | Old completely empty board shows `All Clear` even for **Done**; current version exact Done copy unknown | Narro **already says `All Clear` in Backlog/This Week/Today**; only empty Done says `No tasks`. Minor precise copy delta, not missing pending empty states. |
| **U40 INFERRED / ADVISORY EDGE** | Source click behavior unknown for empty Today, future-timed Today, linked recurring parent, moved/completed tasks and racing start | Narro `+ ADD TASK` is independent from Focus eligibility. `hasActionableTodayPreview` can be vivid for a future-time Today task while Rust `FutureScheduledTime` denies start, safely. Single-flight + typed no-eligible behavior exists. **Do not turn preview into authority.** |

## B. Focus, completion, timer and surface ownership — 9 unique items

| ID / class | Exactly what is missing or different | Current Narro state / boundary |
| --- | --- | --- |
| **U08 SOURCE-UNKNOWN** | When switching Focus All Lists/specific list during live session: timer scope, queue, deleted-list fallback, keyboard and restart persistence | Scoped board switching/stale-load guard and fallback integrated; selected Focus scope lives in React state, restart persistence not established; single authoritative timer retained. |
| **U20 SOURCE-UNKNOWN / NATIVE** | Full Main Preferences versus Focus Quick Preferences entry/back/transition animation and effect on running timer | Distinct shells already implemented, not a missing Preferences view; current source motion/natively preserved focus unverified. |
| **U26 SOURCE-UNKNOWN / NATIVE** | Exact Focus/Floating hover-pill geometry, action labels, contextual Extend during Time's Up and native focus/keyboard | Five real Break/Notes/Pause-or-Extend/Skip/Done actions integrated with one authoritative timer; exact visual/motion still OPEN. |
| **U32 INFERRED / MEDIA** | Source rotating GIF files, selection algorithm, delivery/rights, animation, fallback, native success geometry and transient header count semantics | Inline success + explicit Next gate integrated; Narro deliberately uses three deterministic **offline SVG** reactions, not original GIFs. Do not copy unknown media or reproduce source's transient count anomaly as correctness. |
| **U33 SOURCE-EDGE** | Current source early/late/on-time rounding, invalid EST/Taken, break/Pomodoro and modified time not controlled | Typed, view-only BigInt EST−Taken projection **already implemented**, including exact source `525 minutes early` test; general exact source copy OPEN. |
| **U34 SOURCE-VISUAL / NATIVE** | Current source signed overtime paused/zero/hour-overflow color/geometry across both Focus and Floating | `-HH:MM:SS` renderer integrated and accepted against old VE-016 `-00:01:01`/02; durable overtime ledger stays nonnegative. Native/style equivalence unverified. |
| **U37 NATIVE PHYSICAL-ONLY / SOURCE-LIMIT** | No canonical Blitzit *Floating* Time's Up frame; previous real native CI1046 lacked visible status | #302 added separate visible compact+expanded Floating `Time's Up`; automated Windows/Edge accepted, **real replacement native expiry retest NOT RUN**. |
| **U38 INFERRED / SOURCE-UNKNOWN** | Original click result of **post-Done** `Take a Break` (timed vs untimed, session rows, queue, next task) never captured; normal live-task Break is distinct | Narro intentionally dismisses success into **untimed rest**, only if authoritative timer idle, with no phantom Break session; source equivalence unknown. |
| **U41 INFERRED / SOURCE-UNKNOWN** | Blitzit Done next-task policy with parent **Show success screen OFF** unobserved. `Fun GIF OFF` while success ON does not answer it | Narro commits Done first, then auto-starts next eligible task if success OFF; ON gates behind explicit Next; secondary start failure never undoes Done. Source OFF-path parity OPEN. |

## C. Reports, Sessions, filters, calendar, aggregates — 10 unique items

| ID / class | Exactly what is missing or different | Current Narro state / boundary |
| --- | --- | --- |
| **U06 UNAVAILABLE / SOURCE-UNKNOWN** | Calendar `<<`/`>>`-style double-chevron exact navigation step, boundaries, Apply/keyboard not captured | Safe single-month navigation exists; **no guessed double-step action**. This is a visible source affordance with unimplemented/unknown behavior. |
| **U07 COPY** | Small Reports labels/strings differ in some current reference states | Core reports functions remain; exact copy inventory/native comparison OPEN, not a domain defect. |
| **U09 UNAVAILABLE / SOURCE-UNKNOWN** | Reports chart ellipsis menu items, click/keyboard, series options and failure paths never shown | Ellipsis is deliberately **disabled/unavailable** (`Chart options unavailable`); series legend works. This is a missing/unknown source action, not an inferred report ledger change. |
| **U14 SOURCE-EDGE** | Source multi-list filter selections/clear-last/keyboard/restart persistence and menu close policy beyond observed working live totals | Core multi-select and resulting metrics source-confirmed; Narro uses separately scoped typed Overview/Sessions report queries. Exact UX edges not verified. |
| **U16 INFERRED FORMULA** | Report Early/Late/On Time/No Est exact ratio denominator, 0-Taken/multiple-session/archive/list-date effects | Narro derives time-weighted positive EST–Taken variance and excludes zero/No Est; controlled source underlying data not recoverable, so no Blitzit-formula PASS. |
| **U18 SOURCE-EDGE / NATIVE** | Charts over 60/90 days, zero-session-day rendering, legend hover, DST, tooltip, PDF printing/render | Narro already fills zero dates without fake sessions and offers adaptive long-range UI/PDF; native/current-source details OPEN. |
| **U19 SOURCE-KEYBOARD / NATIVE** | Detail→Add Session nested dialog Tab/Escape/return-focus, pending/slow mutation/error and modal-containment source behavior | Existing keyboard/modal flow and same-render mutation guard integrated; real Windows native pending focus and original sequence OPEN. |
| **U27 SOURCE-NUMERIC** | Exact Break filter pressed-state, task/time/session totals and CSV export under list/date/mixed/Break-only data | Icon + show/hide filter + Rust report and CSV integrated; stored Work and task count preserved, original precise numeric/export rule unverified. |
| **U29 INFERRED DOMAIN FORMULA** | Source `Total Tasks` eligibility, date key, Work-only versus Done-only, moved/archived/deleted/Break-only tasks | Current source proves 2 tasks/0 sessions can happen; Narro totals distinct **completed or worked** TaskIds with separate visible sessions, a well-defined *local* formula. |
| **U35 GAP-NAMING / SOURCE-SORT** | `Recent Tasks` dropdown actual source ranking/scope/selection lifecycle unknown | Narro **calls it Recent but actually uses lane order** Backlog→This Week→Today→Done from global Search palette; no timestamp-sort metadata; search/selection/focus work locally. Do not invent recency sort definition. |

## D. Preferences, sound, monitor, timezone, shortcuts — 7 unique items

| ID / class | Exactly what is missing or different | Current Narro state / boundary |
| --- | --- | --- |
| **U03 SOURCE-AUDIO / PHYSICAL** | Original success/notification sound enable/preview/volume popover, preview timing, per-event and persistence semantics not fully seen | Local sound selection and playback exist; native audible sound/OS policy and source exact UI still OPEN. |
| **U10 SOURCE-SAVE / DISABLED-HIERARCHY** | Alert parent OFF/ON retention, nested settings, failed saves, Focus/Main synchronization and keyboard/scroll | Conditional settings and typed persisted rules exist; local Fun GIF clears on parent success OFF while other child choices persist. Source rule not guaranteed. |
| **U11 SOURCE-PLATFORM / NATIVE** | Original selected monitor/side identity under unplug/replug/mixed DPI, stale target/restart policy | Narro implemented deterministic Windows monitor matching/Refresh/Automatic recovery; deliberately avoids blind fallback. Native 125%→100% two-monitor trial OPEN. |
| **U12 GAP-BACKEND / SOURCE-TZ** | Blitzit timezone picker options/auto/DST/schedule interpretation unknown **and** independent Narro Rust preference-patch guard validates token syntax but not full known-IANA membership | UI IANA selector/custom validation implemented; **real source-level backend validation gap** remains. Distinguish robust Narro backend bug-risk from unproven Blitzit DST policy. |
| **U15 SOURCE-COMMIT** | Original per-control immediate save versus global Apply/Cancel, Escape/close dirty rollback/restart behavior not tested | Narro patches SQLite preference values individually, pending/error feedback; no global cancel. Deliberate local rule. **Not** B26 Notes. |
| **U17 SOURCE-SHORTCUT / NATIVE** | Source 3 global + 7 in-app shortcuts presentation known, but activation/conflicts/editor/modal conditions and focus return unknown | Modal with fixed/registered keybindings implemented; native Windows activation/global conflict acceptance OPEN. |
| **U30 SOURCE-INFO-HOVER** | Exact per-label info `i` mapping, hover/click tooltip text, keyboard and current pixels unknown | Circled decorative info glyphs and exact `Blitz mode settings`/`Celebrate task completion` group titles **already present**; do not duplicate or invent unseen tooltips. |

## E. Archive / destructive safety — 1 unique item

| ID / class | Exactly what is missing or different | Current Narro state / boundary |
| --- | --- | --- |
| **U04 GAP-FUNCTION / DESTRUCTIVE SOURCE-UNKNOWN** | Archived Done **per-row** trash is source-visible but **no original click outcome** shows confirmation, permanent deletion, resurrection, retained Notes/subtasks/Work sessions/Reports or undo | `ArchivedDoneTasksPanel` deliberately renders deletion **unavailable** to avoid guessing destructive business rules. Generic task/list delete is not a substitute. Preserve persisted records until a product/domain decision and tests. |

**Coverage check:** Groups A–E above include **14 + 9 + 10 + 7 + 1 = 41 unique U IDs** exactly once; the full canonical row detail and prior accepted CI links are retained in the register, not duplicated verbatim here.

## Appendix: all 31 separate screenshot EVIDENCE_LIMIT subclaims

These are **not 31 additional missing features** and many refer to the same U-family; they record what a single current/Help screenshot **cannot** establish. The 250-claim static matrix was captured on an **older repository state** and may include now-stale `GAP_B...` statuses: **do not** interpret old matrix code classifications as current app defects; use these **31 exact EVIDENCE_LIMIT claims** plus live code to assess uncertainty. Identifiers retained for exact source routing.

| Static evidence ID | Still-unproved behavior/state |
| --- | --- |
| SS-C02-07 | Reports range calendar chevrons, keyboard transition, disabled Apply |
| SS-C04-05 | Home tile hover and press motion |
| SS-C05-06 | Home list-card hover easing and press |
| SS-C06-05 | Global search results, no-result copy and fuzzy ranking |
| SS-C06-06 | Global search keyboard selection, Escape and focus return |
| SS-C15-05 | Filter exact numeric result and menu policy after selection (older VE has partial live proof) |
| SS-C16-06 | Light theme color calibration and hover motion |
| SS-C07-10 | Preferences info-icon label coverage and tooltip |
| SS-C09-07 | Success preference parent OFF disabled children, commit/cancel sequence |
| SS-C17-06 | Shortcut modal Escape/focus and per-key option behavior |
| SS-C10-07 | Archived lists populated actions not seen in empty state |
| SS-C11-07 | Archived Done search/list filter results and keyboard |
| SS-C12-10 | Reports 8 work days despite source 0 tasks/0 tracked time |
| SS-C13-05 | Reports empty Done Tasks body's exact source copy or absence |
| SS-C01-09 | Create List picker intermediate open/apply/cancel/upload (informational only; Narro UI is user-locked) |
| SS-C18-08 | Expanded Floating native animation/size without clipping |
| SS-C19-11 | Resting Focus snapshot timer mode/hover transitions |
| SS-C20-05 | Collapsed Floating cross-window morph and hover timing in WebView2 |
| SS-C21-06 | Notes close on dirty edit: autosave/cancel |
| SS-C22-07 | Inline edit keyboard/save/cancel |
| SS-H02-07 | Older Help Today click/hover implication |
| SS-H03-03 | Native Windows Focus dock bounds, monitor DPI and stale state (Help is macOS) |
| SS-H04-05 | List picker after-selection filter and persistence |
| SS-H05-07 | Multi-DPI live monitor selection |
| SS-H07-04 | Small purple calendar date dots and meaning |
| SS-H08-05 | Recurrence No Repeat unchecked commit result |
| SS-H09-04 | Focus hover pill expansion, contour and timing |
| SS-H10-04 | Notes dirty-close semantics |
| SS-H14-04 | Archive restore and deletion committed outcomes |
| SS-H15-05 | Archived Done trash click/confirmation |
| SS-H17-05 | Sessions Recent Tasks source chronological ordering |

**Coverage:** 31/31 subordinate evidence limits explicitly included; overlap with U01/U04/U08/U11/U15/U17/U19/U26/U30/U35/U37 etc. **never doubles** U counts.

## Native Windows and remaining final delivery gates (separate from Blitzit source-unknown audit)

These are **not additional U items** and **not completed** by static analysis or Windows CI.

| Gate | Exact physical result still required |
| --- | --- |
| PA-01 / C4 | Continuous **same HWND** Focus Panel ↔ Floating transition, native WebView2 parent, no clipped/blank/stale frame in compact/expanded |
| PA-02 / Board→Focus | Initial Blitz/Board→Focus morph, first-frame readiness, no visible flash and correct ownership |
| PA-03 / F35 | Actual countdown→Time's Up while native Floating compact/expanded; visible label/actions, clipping and restart |
| PA-04 / F29 | Reports Add Session during pending mutation: real focus/Tab/Escape/modal owner, no duplicate writes |
| PA-05 / F27 | Named non-primary selected monitor at 125%→100% DPI, stale/unplugged target fallback, placement after restart |
| PA-06 / M8 | Real Windows toast delivery, foreground/background, native audio volume/mute, actual subscription recovery, reduced motion |
| PA-07 | Normal quit/relaunch persistence of timer/data/settings/placement, no ghost session |
| PA-08 | Installation/launch smoke of exact **new** ZIP/exe/NSIS/MSI hashes, AppData preservation |
| PA-09 | **Original Blitzit visual/motion parity** on canonical scenes; independent from functional native Windows PASS and subject to source evidence limits; optional M11 still **hard opt-in** |

**Candidate gate:** The post-#333 resulting-main Windows run `38173126053` must actually succeed 3/3 and its fresh production artifacts must be downloaded/hashed before the user-paused physical run; historical Q12 pre-#333 hashes are not replacement-proof. Do not infer native failure or source parity from an unexecuted check.

## Closure / transfer rule

- **Unknown-only review complete:** 42/42 actions, 41/41 question dispositions; **41 source gaps are reviewed but not all resolved**.
- **More source evidence needed** before calling exact Blitzit behavior proven; screenshots and transcripts alone cannot prove click outcomes, keyboard paths, persistence semantics, session accounting, window animation or backend internals.
- **Narro local-first may remain correct** where source is unknowable; bounded, deterministic, transactional, non-destructive implementation is allowed by existing project decision, but document material deviations as *Narro*, not Blitzit.
- **No unauthorized implementation:** maintain user-locked Create/Edit List picker/icon design. Source-only discoveries and physical Windows checks are distinct gates. No optional M11 without a request specifically activating that program.
- **Next live implementation action** belongs to fresh `main` + `HANDOFF.md` (CI/artifact and physical scheduling). This document is a **single reference index**, not a new ordered roadmap or consent to do destructive/archive work.
