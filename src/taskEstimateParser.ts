const ESTIMATE_SUFFIX = /(?:^|\s)(?:(\d+)\s*(?:h|hr|hrs|hour|hours)(?:\s*(\d+)\s*(?:m|min|mins|minute|minutes))?|(\d+)\s*(?:m|min|mins|minute|minutes))\s*$/i;

export type ParsedEstimateSuffix = {
  seconds: number;
  matchedText: string;
  titleWithoutSuffix: string;
};

export function parseEstimateSuffix(title: string): ParsedEstimateSuffix | null {
  const trimmedTitle = title.trim();
  const match = ESTIMATE_SUFFIX.exec(trimmedTitle);
  if (!match) return null;

  const hours = match[1] ? Number(match[1]) : 0;
  const combinedMinutes = match[2] ? Number(match[2]) : 0;
  const minutesOnly = match[3] ? Number(match[3]) : 0;
  const totalSeconds = hours * 3_600 + (hours > 0 ? combinedMinutes : minutesOnly) * 60;

  if (!Number.isSafeInteger(totalSeconds) || totalSeconds <= 0 || totalSeconds > 4_294_967_295) {
    return null;
  }

  const titleWithoutSuffix = trimmedTitle.slice(0, match.index).trimEnd();
  if (!titleWithoutSuffix) return null;

  return {
    seconds: totalSeconds,
    matchedText: match[0].trim(),
    titleWithoutSuffix,
  };
}

/**
 * Display-only EST suffix projection. Never mutate an explicitly edited EST
 * draft or bypass existing commit-time parsing and title normalization.
 */
export function inlineEstimateSuffixPreview(
  title: string,
  manualEstimateDraft: string,
  autoParseEnabled: boolean,
): string | null {
  if (!autoParseEnabled || manualEstimateDraft.trim().length > 0) return null;
  const parsed = parseEstimateSuffix(title);
  if (!parsed) return null;
  const totalMinutes = parsed.seconds / 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
