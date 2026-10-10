/**
 * Synchronous, per-mounted-live-card mutation ownership.
 *
 * React's setState does not synchronously change an event-handler closure:
 * keyboard and pointer actions can both arrive before a re-render publishes
 * pendingAction. This gate prevents a second request in that interval, while
 * the authoritative Rust timer/session transaction remains the final arbiter.
 */
export type FocusMutationAction = "break" | "pause_resume" | "skip" | "done" | "extend";

export function createFocusActionGate() {
  let active: FocusMutationAction | null = null;
  return {
    tryBegin(action: FocusMutationAction): boolean {
      if (active !== null) return false;
      active = action;
      return true;
    },
    finish(action: FocusMutationAction): void {
      if (active === action) active = null;
    },
    current(): FocusMutationAction | null {
      return active;
    },
  };
}
