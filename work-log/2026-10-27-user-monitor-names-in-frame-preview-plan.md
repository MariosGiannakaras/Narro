# User monitor-selector additions recorded

UTC 2026-10-27T15:36:00.153025+00:00

## Explicit user additions — monitor selector (2026-10-27)

These are explicit Narro product directions, not newly confirmed Blitzit findings, and are PLANNED / NOT IMPLEMENTED / NOT VALIDATED on the current PR431 candidate. The earlier monitor-name usability concern is now an authorized requirement.

- **U-R04 — correct monitor names:** show the actual Windows-reported friendly device/model name for the corresponding physical monitor in the existing card label. Match name, preview and selected/persisted monitor identity to the same device; generic ScreenN or a DISPLAY identifier must not substitute for an available actual name. If Windows supplies no friendly name, preserve a truthful existing fallback rather than inventing a model.
- **U-R05 — actual screen preview inside the existing frame:** replace the schematic monitor interior with an actual snapshot of that monitor's desktop, keeping its aspect ratio and existing frame/card geometry, hierarchy, selection behavior and surrounding controls. Acquire/update automatically for the existing selector lifecycle/topology as needed; continuous live video is not required. An unavailable capture retains the existing neutral frame treatment rather than showing another monitor's image or an old image as current.
- **Strict UI boundary:** add no buttons, Refresh displays action, toggles, badges, explanatory rows or other UI elements for this work. The requested visible changes are only the correct name and the image inside the existing frame. This instruction does not request removing unrelated pre-existing controls.
- **Acceptance:** independently score correct physical-name/device mapping and actual per-monitor image mapping; exercise both attached monitors with distinguishable desktop content, existing 100%/125% scaling, reopen and topology change where available. Verify that frame dimensions/selection/placement behavior remain intact. No source-parity or physical PASS from this plan. Keep the confirmed P431-10 unavailable-monitor fallback defect and its exact-build regression as a separate requirement.
- **Implementation handoff:** ChatGPT source owner incorporates these bounded selector changes with compatible monitor remediation where practical, after normal scoped review/tests. This checkpoint records the plan only; implementation remains assigned to the source owner under the existing workflow.

Tracking updated on main: TODO M8, STATUS, audit crosswalk and current HANDOFF. Documentation only; original evidence unchanged.
