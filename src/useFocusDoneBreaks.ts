import { useEffect, useState } from "react";
import { listenForBoardInvalidation } from "./boardInvalidation";
import {
  focusDoneBreakDayRange,
  getFocusDoneBreaks,
  type FocusDoneBreak,
} from "./focusDoneBreaks";
import { formatInvokeError } from "./diagnosticApi";

type FocusDoneBreakState = {
  identity: string;
  rows: FocusDoneBreak[];
  error: string | null;
};

/**
 * Read-only, target-scoped Focus Done history. An async answer from a previous
 * saved list/date/refresh can never become the current list's Break history.
 * Timer revision refreshes only on a committed change, never a 1s tick.
 */
export function useFocusDoneBreaks({
  enabled,
  targetKey,
  listId,
  timeZone,
  dayKey,
  refreshKey,
  changeRevision,
}: {
  enabled: boolean;
  targetKey: string;
  listId: string | null;
  timeZone: string | null;
  dayKey: string | null;
  refreshKey: number;
  changeRevision: number | null;
}): { rows: FocusDoneBreak[]; error: string | null } {
  const [state, setState] = useState<FocusDoneBreakState | null>(null);
  const identity = JSON.stringify([targetKey, timeZone, dayKey, refreshKey]);

  useEffect(() => {
    if (!enabled || !timeZone || !dayKey) return;
    let disposed = false;
    let readRevision = 0;
    let stopListening: (() => void) | undefined;

    const refresh = () => {
      const expectedRevision = ++readRevision;
      let range: ReturnType<typeof focusDoneBreakDayRange>;
      try {
        // Calendar boundaries are computed from the board timezone, not a
        // fixed 24-hour offset (which fails during DST transitions).
        range = focusDoneBreakDayRange(new Date(`${dayKey}T12:00:00Z`), timeZone);
        // For UTC+/- zones the noon instant can select an adjacent day.
        // The caller-provided day key is authoritative for the visible Today.
        if (range.dayKey !== dayKey) {
          throw new Error("Focus Break date changed during calendar projection.");
        }
      } catch (failure: unknown) {
        if (!disposed && expectedRevision === readRevision) {
          setState({ identity, rows: [], error: formatInvokeError(failure) });
        }
        return;
      }
      void getFocusDoneBreaks(range, listId)
        .then((rows) => {
          if (!disposed && expectedRevision === readRevision) {
            setState({ identity, rows, error: null });
          }
        })
        .catch((failure: unknown) => {
          if (!disposed && expectedRevision === readRevision) {
            setState({ identity, rows: [], error: formatInvokeError(failure) });
          }
        });
    };

    refresh();
    void listenForBoardInvalidation(refresh)
      .then((unlisten) => {
        if (disposed) unlisten();
        else stopListening = unlisten;
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setState((current) => current?.identity === identity
            ? { ...current, error: `Break history refresh unavailable: ${formatInvokeError(failure)}` }
            : { identity, rows: [], error: formatInvokeError(failure) });
        }
      });

    return () => {
      disposed = true;
      readRevision += 1;
      stopListening?.();
    };
  }, [enabled, targetKey, listId, timeZone, dayKey, refreshKey, changeRevision, identity]);

  return enabled && state?.identity === identity
    ? { rows: state.rows, error: state.error }
    : { rows: [], error: null };
}
