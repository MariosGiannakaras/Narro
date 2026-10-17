# 2026-10-17 — C3 final-lanes visual follow-up (immutable)

**Owner:** ChatGPT independent review. **New evidence inspected after the initial screenshot-only review:** `work-log/evidence/pr364-native-20261017/C3-037-final-lanes-main.png` **and** its matching `observations/C3-037-final-lanes-state.json` UIA snapshot, plus `observations/C3-037-final-lanes-owned-db.json`.

## Important clarification to earlier review

The earlier review of intermediate `C3-025-week-scheduled-main.png` and `C3-032-backlog-scheduled-main.png` correctly identified that those **two particular images** center on the scrolled Today subgroup and **do not** visually prove the Backlog/This Week groups. **However, the same frozen published C3 batch already includes `C3-037-final-lanes-main.png` which DOES directly show both target groups in their respective columns**:

- **Backlog:** visible label **`1 Scheduled task in backlog`**, existing task **`M5WeekdayCheck`**, date **Oct 24, 2026**.
- **This Week:** visible label **`1 Scheduled task this week`**, `M5WeekdayCheck`, date **Oct 18, 2026**.
- **Today:** total **10 tasks** and clear lane header; the scrolled intermediate capture showed Today's scheduled subgroup count **4→3**.
- **Done:** visible two separate date headings **Oct 17, 2026 — 2 tasks** and **Oct 16, 2026 — 1 task**, consistent with C1.
- **UIA corroboration:** `C3-037-final-lanes-state.json` contains **offscreen:false** controls for `This Week`, `1 Scheduled task this week`, `Backlog`, `1 Scheduled task in backlog` and corresponding task names/dates; the paired captured PNG establishes real visible rendering, not labels alone.
- **Persistence:** before/after owned DB shows stable two existing task IDs and reschedule `Oct 12→Oct 18` and `Oct 13→Oct 24`, without synthetic identity duplication.

## Correct disposition

**Narro physical: final C3 Backlog + This Week scheduled headers/cards are OBSERVED / VISUALLY PRESENT, source parity / full transient motion NOT VERIFIED.** The earlier wording **'header-specific claims OPEN'** applies **only to the two intermediate screenshots**; it is superseded **for presence of those headers** by the later frozen final-lanes frame. **Do not request a new recording just to establish the existence of either header.**

This is an evidence clarification, **not** a new UI bug, source change, Windows installation or activation of paused acceptance. Remaining targeted source parity/animation questions need a comparable original Blitzit state or motion evidence, and should be tracked separately.
