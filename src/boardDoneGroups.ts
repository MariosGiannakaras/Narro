import type { ListBoardTask } from "./listBoardApi";

type CompletedTask = Pick<ListBoardTask, "completedAt">;

export type DoneDateGroup<T> = {
  dayKey: string;
  label: string;
  tasks: T[];
};

/**
 * Group Done rows by their actual completion instant in the snapshot's
 * authoritative display timezone. Keep all original task identities and
 * existing per-day row order; only the order of date groups changes.
 */
export function groupCompletedBoardTasks<T extends CompletedTask>(
  tasks: readonly T[],
  displayTimezone: string,
): DoneDateGroup<T>[] {
  if (tasks.length === 0) return [];

  // Formatting year/month/day parts avoids UTC slicing and host-local
  // conversion, both incorrect for completions around a timezone midnight.
  const keyFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: displayTimezone,
    calendar: "gregory",
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const headingFormatter = new Intl.DateTimeFormat(undefined, {
    timeZone: displayTimezone,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const groups = new Map<string, DoneDateGroup<T>>();
  for (const task of tasks) {
    // Rust validates persisted completion timestamps on Board read. Fixtures
    // and caller regressions must also fail closed, not invent a fallback date.
    if (!task.completedAt) throw new RangeError("Done task has no completion timestamp");
    const instant = new Date(task.completedAt);
    if (!Number.isFinite(instant.getTime())) {
      throw new RangeError("Done task has an invalid completion timestamp");
    }
    const parts = keyFormatter.formatToParts(instant);
    const value = (type: "year" | "month" | "day") =>
      parts.find((part) => part.type === type)?.value;
    const year = value("year");
    const month = value("month");
    const day = value("day");
    if (!year || !month || !day) throw new RangeError("Unable to project local completion date");
    const dayKey = `${year.padStart(4, "0")}-${month}-${day}`;
    const current = groups.get(dayKey);
    if (current) {
      current.tasks.push(task);
    } else {
      groups.set(dayKey, {
        dayKey,
        label: headingFormatter.format(instant),
        tasks: [task],
      });
    }
  }
  return [...groups.values()].sort((left, right) =>
    right.dayKey.localeCompare(left.dayKey));
}
