# M8 B22 timezone selector — 2026-10-09

Source SS-C07 establishes a timezone selector whose choice labels include GMT offset plus IANA name. Original menu mechanics remain unknown (U12). Existing GeneralPreferenceRows previously used freeform text only.

Implementation submitted on branch `implementation/m8-b22-timezone-qualified-selector-20261009` at `000e7d50d34a2e7a4c04f581582f717f9d46ddc2`, review #298. Six source/test files implement dropdown choices from Intl supported IANA zones, offset-qualified labels at the current instant, saved Windows automatic option, safe fallback for valid custom aliases, invalid-input guard and DST regression tests. Existing PreferenceSettingsRuntime persistence and Rust timezone logic remain unchanged. Native dropdown and custom input are Narro inferred interactions, not confirmed Blitzit menu parity.

An isolated locally copied helper passed 11 Node timezone/offset checks and standalone TypeScript typecheck. Whole repo/Windows CI NOT RUN/NOT CHECKED; physical/native and source parity OPEN. No validated implementation counter advances. Shared component with other open M8 monitor/section-heading code and package.json test wiring has soft overlap; reconcile latest main and preserve their work before guarded integration. Continue unrelated safe work while CI is pending.
