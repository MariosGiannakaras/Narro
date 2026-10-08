/**
 * Presentation-only EST–Taken delta. Persisted timer/session durations remain
 * authoritative; missing or malformed values do not produce invented praise.
 * BigInt avoids losing precision for duration strings beyond Number.MAX_SAFE_INTEGER.
 */
export function successTimingCopy(estSeconds: number | null, timeTakenSeconds: string | null): string | null {
  if (estSeconds === null || !Number.isSafeInteger(estSeconds) || estSeconds < 0) return null;
  if (timeTakenSeconds === null || !/^(0|[1-9]\d*)$/.test(timeTakenSeconds)) return null;
  const delta = BigInt(estSeconds) - BigInt(timeTakenSeconds);
  if (delta === 0n) return "Right on time";
  const absolute = delta < 0n ? -delta : delta;
  const direction = delta > 0n ? "early" : "late";
  if (absolute < 60n) return `Less than a minute ${direction}`;
  const minutes = (absolute + 30n) / 60n;
  return `${minutes} ${minutes === 1n ? "minute" : "minutes"} ${direction}`;
}
