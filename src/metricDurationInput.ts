export type MetricInputKind = "estimate" | "time_taken";
export const MAX_EDITABLE_SECONDS = 4_294_967_295n;

/** Accept HH:MM (source) and H:MM:SS (existing), never infer MM:SS from two fields. */
const DURATION_INPUT = /^(\\d+):([0-5]\\d)(?::([0-5]\\d))?$/;

export function parseMetricDuration(
  raw: string,
  metric: MetricInputKind,
): { ok: true; seconds: number | null } | { ok: false; message: string } {
  const value = raw.trim();
  if (metric === "estimate" && value === "") return { ok: true, seconds: null };
  const match = DURATION_INPUT.exec(value);
  if (!match) {
    return {
      ok: false,
      message: metric === "estimate"
        ? "EST must use H:MM or H:MM:SS, or be left blank to clear it."
        : "Time Taken must use H:MM or H:MM:SS.",
    };
  }

  const hours = BigInt(match[1]);
  const minutes = BigInt(match[2]);
  const seconds = BigInt(match[3] ?? "0");
  const total = hours * 3_600n + minutes * 60n + seconds;
  if (total > MAX_EDITABLE_SECONDS) {
    return { ok: false, message: "Duration exceeds Narro's editable range." };
  }
  if (metric === "estimate" && total === 0n) {
    return { ok: false, message: "EST must be greater than zero, or blank to clear it." };
  }
  return { ok: true, seconds: Number(total) };
}
