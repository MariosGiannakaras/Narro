# Narro approved standalone UI designs

## List Editor — Spectrum Core / searchable icon library (2026-10-09)

- **Canonical user-approved HTML:** [2026-10-09-spectrum-core-large-icon-library.html](2026-10-09-spectrum-core-large-icon-library.html).
- This is the **original unmodified 2026-10-09 user-supplied design file**, not generated Narro code, not proof of original Blitzit picker appearance or interaction, and not executable app authority.
- The user explicitly calls this the **final desired UI** for the Create/Edit List color picker and icon library. Implementation must stay visually and interactively as close to the HTML as possible, except where native React/Rust persistence, accessibility, safety, Windows integration and app design-system contracts require adaptation. Do not replace this approval with an earlier generic picker design.
- Required interaction contract and persistence caveats are documented in the HTML header, including real icon-ID storage, file/letter/builtin precedence, 184px HSV slice, cancel/escape/outside behavior, upload-circle-only activation, category/search 200+ offline icons and single modal focus ownership.
- **Implementation status when archived:** PR #282 open; earlier exact-head CI `37905929081` FAILED fast frontend excluded-control assertion, corrected PR head `40875bf2b5d1850ef8a35165d9c90c385bd9e7f4` CI `37906733914` IN PROGRESS/NOT PASS. No Windows rendered/source-pixel or physical keyboard acceptance yet. Do not claim identical appearance/functionality without those checks.
- **Ownership:** Original uploaded reference is immutable. Modify production implementation on its existing PR/branch; preserve file unchanged. The broader audit of unsupported Blitzit behavior follows the user's requested **after current implementation and CI corrections** gate, using `docs/EVIDENCE_ROUTING_MAP.md` and `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`. Unknown behavior is UNKNOWN, not a tacit PASS.

Storage provenance: exact user upload `narro-spectrum-core-large-icon-library.html` (188,022 UTF-8 bytes reported by project attachment), 964 lines. File is archived here under a date-stable basename so it survives chat loss.
