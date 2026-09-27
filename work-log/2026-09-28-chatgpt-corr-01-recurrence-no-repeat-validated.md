# CORR-01 recurrence No Repeat correction — validated

Date: 2026-09-28
Agent: ChatGPT
Scope: audit-driven correction of the already-built recurrence editor before unrelated M8 forward work.

## Evidence and reason

VE-017, current Help Center imagery/text and the completed UI/UX forensic pass establish a recurrence-edit state that the prior Narro implementation did not reproduce: `No Repeat` is part of the recurrence selector and conditionally exposes a destructive `Delete existing tasks(n)` consequence instead of using a separate Remove recurrence action.

The correction preserved Narro's stronger reliability rule: user-modified or history-bearing generated tasks must not be silently destroyed merely to mimic source UI.

## Source history

- validated application source before the correction: `643528ca223b29fd8fbd215db5b1b525c912c6fc`
- tracking/audit-gate main before the source branch: `20226edc516a997bb24173cacbe5452460eb8c6e`
- branch: `fix/corr-01-recurrence-no-repeat-delete-existing`
- PR #182 final exact head: `72ab6c77d5e5f5e50c7f3f7e6a0c11b98c7c606c`

## Implemented behavior

- existing recurrence exposes `No Repeat` inside the recurrence editor;
- normal recurrence edits show neutral `Replace existing tasks(n)`;
- No Repeat swaps that consequence for warm/red `Delete existing tasks(n)`;
- unchecked No Repeat removes the rule and detaches linked generated children as independent tasks;
- checked Delete Existing deletes only pristine active generated children;
- customized, history-bearing, completed, archived and legacy-linked children survive and detach;
- unmatched legacy/corrupt parent linkage without an occurrence row is fail-safe treated as protected rather than left dangling;
- stale expected-version guards, parent identity, recurrence idempotence and persistence-first UI publication remain intact;
- repeat/no-repeat light+dark visual states are captured and validated.

## Validation

An intermediate CI #614 failed only on `cargo fmt --check`. Only formatter-required deltas were applied; no behavior changed in response.

- final PR Windows CI #617 / run `36354972305`: PASS
- visual artifact `narro-m5-visual-regression`, id `10943374010`, digest `sha256:4d9b5005e53d842c1c8eb9774b6f29e9b950c0447a651914243d84c9f7b776b6`
- runtime artifact `narro-m1-runtime-harness-windows-x64`, id `10943557612`, digest `sha256:1a9325c54af943de7ba05cf375ab313447f3a10b004e81a6f85a858a91a02ee6`
- expected-head guarded squash merge: `50006f29b0329037aecfdab772104db8670768b0`
- resulting-main Windows CI #618 / run `36355523089`: PASS

The validated application source baseline is now `50006f29b0329037aecfdab772104db8670768b0`. Tracking-only descendants do not replace it.

## Progress and continuation

- roadmap: **6/10 milestones complete**
- M8: **6/8 top-level items validated**
- CORR-01 slice: **4/4 checkpoints complete**
- current audit `FIX_NOW` queue: **clear**
- M7 physical/manual closure: **OPEN**
- next source task: **PREF-R01 timed task alerts**
