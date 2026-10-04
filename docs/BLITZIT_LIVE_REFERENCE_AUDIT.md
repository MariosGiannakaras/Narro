# Optional Milestone 11 — Live Blitzit Reference Audit

Status: **DORMANT / STRICTLY OPT-IN**.

This protocol exists so Narro can optionally inspect the actual live Blitzit product after the mandatory M1–M10 roadmap is complete. It is intended to resolve source-evidence limits that cannot be answered from the existing curated Blitzit screenshots, tutorials and recordings.

## Hard activation gate

**Do not start, prepare, count, schedule, or infer Milestone 11 unless the user gives an explicit instruction to activate M11 after the live Blitzit trial/reference environment is available.**

The following do **not** authorize M11:
- `continue`, `keep going`, `finish the project`, `continue to the end`, or equivalent general continuation language;
- completion of Milestone 10;
- completion of the Final Comprehensive Review preparation;
- availability of the Blitzit installer, account, trial, subscription, recordings, screenshots, or credentials;
- an agent deciding that more source evidence would be useful.

A valid activation must explicitly refer to Milestone 11 / the live Blitzit audit, for example: `Activate M11`, `Start Milestone 11`, or an unambiguously equivalent instruction.

If M11 is never explicitly activated, it is **skipped by design**, does not count as incomplete work, does not block release, and the normal path is:

`M1–M10 -> Final Comprehensive Review -> release closure`.

If M11 is explicitly activated, the path becomes:

`M1–M10 -> M11 Live Blitzit Reference Audit -> affected Narro corrections/validation -> Final Comprehensive Review -> release closure`.

## Activation bookkeeping

When the user explicitly activates M11:
1. record the activation verbatim or unambiguously in `HANDOFF.md`, `STATUS.md` and a new immutable work log;
2. change the roadmap denominator from 10 to 11 for user-facing progress from that point onward;
3. record the exact validated post-M10 Narro source SHA that forms the initial M11 comparison baseline;
4. confirm the live Blitzit reference environment is available before any audit claims are made.

While M11 remains dormant, the denominator stays 10 and none of its checklist items affect progress.

## Reference-environment provenance

Before inspecting the live product, record enough provenance to distinguish current live Blitzit behavior from older tutorial/reference evidence:
- Blitzit version/build if observable;
- observation date/time;
- operating system and relevant display/DPI environment;
- trial/subscription tier and any feature limitations that are visible/relevant;
- theme, locale, timer/preferences, and other settings that materially affect the inspected state;
- whether the evidence came from direct Codex observation, a user-made recording, or another explicitly identified source.

Do not silently treat a newer live behavior as proof that an older canonical recording was wrong. Version-specific differences remain explicit evidence.

## Audit scope

M11 is an **active exploratory reference audit**, not a second broad forensic replay of the existing corpus.

Start from the current canonical evidence and audit crosswalk. Prioritize:
- unresolved `AMBIGUOUS`, `VALIDATION_OPEN`, evidence-limit and source-parity questions;
- hover/focus/pressed/selected/disabled states that were not visible in supplied media;
- menus, popovers, dialogs, tooltips and contextual controls not opened in existing recordings;
- transient/loading/empty/error/success states that were not captured;
- exact interaction sequencing, animation/transition behavior and timing where the existing media is insufficient;
- drag/drop, resize, window placement and other live interaction details that presentation videos did not expose;
- Preferences and conditional settings states not shown in the corpus;
- representative visual-system details needed to resolve an actual Narro implementation decision;
- edge cases that are material to observable parity or reliability and can be exercised through ordinary product use.

Do not spend the trial repeating source questions already answered with sufficient confidence unless a direct live comparison is needed to resolve a conflict in the release candidate.

## Evidence discipline

For every material new live-source finding:
1. capture a reproducible state or recording where practical;
2. record provenance and exact observation conditions;
3. distinguish direct observation from inference;
4. reconcile it against the existing canonical Pass-3/static-calibration evidence;
5. classify version conflicts or ambiguities explicitly;
6. update the implementation crosswalk before changing Narro;
7. implement only evidence-backed corrections in narrow validated slices.

A live-source observation does not automatically override:
- a documented Narro reliability/data-integrity correction;
- an accessibility or Windows-platform requirement;
- an intentional local-only/privacy boundary;
- a stronger version-matched canonical source;
- an explicit evidence-limit disposition.

## Safety and external-action boundary

M11 authorization is authorization to perform the audit, not blanket authorization for unrelated external actions. Do not purchase, renew, upgrade, cancel, or otherwise change a paid subscription; submit external communications; or change account/security settings without the separate approval required by normal repository/tool policy.

Avoid recording credentials, payment details, private account data, or unrelated personal content in evidence artifacts.

## M11 completion

If activated, M11 is complete only when:
- the targeted live-source audit agenda has been exercised or explicitly dispositioned;
- all material new findings are recorded and reconciled;
- every Narro correction chosen from those findings is implemented and validated;
- affected prior parity/physical gates are re-run where necessary;
- a final M11 report records the live Blitzit provenance, findings, version-specific limits, accepted deviations and exact resulting Narro SHA.

Only then may the required Final Comprehensive Review use the post-M11 Narro candidate as its baseline.
