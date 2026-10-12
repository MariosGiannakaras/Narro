# User-facing implementation progress

## CURRENT 2026-10-12 — binding user-requested order (see AI_START_HERE.md)

Always distinguish **Narro-local U01–U41 functional coverage**, the **nine specifically evidenced implementation gaps**, and the **ten mandatory milestones requiring independent Windows physical acceptance**. These are *three different denominators*, not interchangeable percentages.

1. **Γενική υλοποίηση U01–U41: 41/41** functionally covered under the fixed [41-ID ledger](U01_U41_LOCAL_IMPLEMENTATION_PROGRESS_2026-10-12.md), **0/41 unimplemented tracked concerns**. The original 41 are uncertainty cases, **not** 41 code defects, all product features or proof of exact modern Blitzit source parity. Includes deliberately safe Narro-local behavior and documented source-version deviations.
2. **Επιμέρους τεκμηριωμένα λειτουργικά κενά: 9/9** source-implemented, guarded merged and resulting-main Windows CI/release artifact accepted, **0/9 remaining**. Fixed gap IDs `U04,U06,U09,U12,U21,U22,U23,U35,U40`. Latest U04 [resulting-main 3/3 Windows PASS](https://github.com/MariosGiannakaras/Narro/actions/runs/38287299890).
3. **Υποχρεωτικά milestones: 3/10** with full physical acceptance, **7/10 remain**. Native Windows PA-01–09 **USER-PAUSED / NOT RUN** pending explicit user permission. The optional M11 current-live Blitzit audit is **not** included or implicitly activated, and Narro must function fully without it.
4. When work actually starts or completes, report exact PR/branch/head SHA/CI status; NEVER infer PASS from a merge or an active CI. Do not recalculate 41 or 9 by counting Git commits or issues.

**Historical reporting format (superseded):** `{completed milestones}/{10}M || {current checkpoints}/{slice total} | {active milestone items}/{total}`. This older checkpoint-first format and its `4/10M || 1/5 | 25/28` example are recorded for audit only. They no longer replace the user's explicit general-41-first instruction. Never silently mutate denominators. Historical PASS remains historical, physical acceptance remains separately OPEN.

Canonical routing: [AI_START_HERE](../AI_START_HERE.md) → [HANDOFF](../HANDOFF.md) → [TODO roadmap](../TODO.md) → [STATUS](../STATUS.md). Full prior tracker checkpoint archives are linked from those three current documents.
