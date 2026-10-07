# Finding36 — VE-003 scoped source-behavior acceptance

Date: 2026-10-07

Status: **INTEGRATED / SCOPED_SOURCE_BEHAVIOR_PASS / PHYSICAL_OPEN**

No application source changed in this slice.

## Canonical source contract

Canonical Pass-3 source: VE-003, SOURCE_COMPLETE.

The directly observed sequence is:
- Focus queue contains `Refine Portfolio`, `Analyze Instagram metrics`, and other queued tasks;
- after queue manipulation, `Analyze Instagram metrics` is the next queued task in the demonstrated Focus context;
- completing `Refine Portfolio` produces the success surface;
- the source does not auto-start another task before user choice;
- after explicit `Next Task`, `Analyze Instagram metrics` becomes live.

Therefore the demonstrated behavioral invariant is direct, not inferred:

**Success → Next Task advances within the current Focus queue/context order rather than selecting an unrelated task from a global pool.**

## Exact Narro implementation evidence

PR239 final exact head:
`955a6e124130ae9abae9be3fff242f881abadfc5`

Windows CI976/run:
`37450668638` — PASS

Merge:
`88cd58e0357f9ab368716eb4504711aaf5cb0687`

All five changed source/test blobs are identical on resulting main.

The exact renderer regression proves:
1. a concrete selected list is committed through the controlled Focus target;
2. that target survives Panel subtree unmount/remount;
3. invalid/deleted selected scope falls back to All through the coordinator owner;
4. Floating Done uses the selected Focus target for authoritative queue reads;
5. completion success publishes the selected-list next task;
6. it explicitly rejects selecting the older global task that reproduced CI953 Finding36.

Implementation refinement is preserved: Floating live-task **display projection** may remain All Lists so an active task outside the selected Focus list cannot disappear. The persistent Focus target governs queue-changing semantics, not live-task visibility.

## Reconciliation

The exact implementation matches the source invariant relevant to Finding36. This is a **SCOPED_SOURCE_BEHAVIOR_PASS**.

It is not a blanket Focus parity claim and does not close:
- packaged-Windows physical observation of selected-scope continuity;
- success animation/visual fidelity;
- unrelated Focus/Floating visual or motion gates.

## Remaining physical check

On a compatible packaged Windows candidate:
- select a concrete Focus list;
- cross Panel/Floating or another remount boundary;
- complete the current task with success enabled;
- choose Next Task;
- verify the intended next task in that selected Focus queue becomes live and the selector context persists.

Progress counters do not advance from this source-behavior acceptance.
