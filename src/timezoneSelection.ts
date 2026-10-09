/**
 * Display-only IANA timezone choice helpers.
 *
 * A timezone preference persists the bare IANA identifier; GMT offsets are
 * projections of the selected instant, never persisted or assumed fixed.
 */
type TimezoneIntl = typeof Intl & {
  supportedValuesOf?: (key: "timeZone") => string[];
};

export function isValidIanaTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

export function systemTimezone(): string {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return timezone && isValidIanaTimezone(timezone) ? timezone : "UTC";
}

export function timezoneOptions(savedTimezone: string | null, localTimezone: string): string[] {
  const zones = new Set<string>(["UTC"]);
  const supported = (Intl as TimezoneIntl).supportedValuesOf;
  if (typeof supported === "function") {
    for (const zone of supported("timeZone")) zones.add(zone);
  }
  for (const candidate of [savedTimezone, localTimezone]) {
    if (candidate && isValidIanaTimezone(candidate)) zones.add(candidate);
  }
  return [...zones].sort((left, right) => left.localeCompare(right, "en"));
}

export function timezoneOffset(timezone: string, at: Date): string | null {
  if (!isValidIanaTimezone(timezone) || !Number.isFinite(at.getTime())) return null;
  try {
    // WebView2 supports longOffset. Use the zone offset at the chosen instant:
    // Athens must not stay GMT+03:00 in winter.
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "longOffset" as Intl.DateTimeFormatOptions["timeZoneName"],
    });
    const raw = formatter.formatToParts(at).find((part) => part.type === "timeZoneName")?.value;
    if (raw === "GMT" || raw === "UTC") return "GMT+00:00";
    const matched = raw?.match(/^(?:GMT|UTC)([+-])(\d{1,2}):(\d{2})$/);
    if (!matched) return null;
    return "GMT" + matched[1] + matched[2].padStart(2, "0") + ":" + matched[3];
  } catch {
    return null;
  }
}

export function timezoneOptionLabel(timezone: string, at: Date): string {
  const offset = timezoneOffset(timezone, at);
  return offset ? "(" + offset + ") " + timezone : timezone;
}
