import { inlineEstimateSuffixPreview, parseEstimateSuffix } from "../src/taskEstimateParser.ts";

function invariant(condition, message) {
  if (!condition) throw new Error(`EST suffix parser contract failed: ${message}`);
}

for (const [title, seconds, normalizedTitle] of [
  ["Write launch notes 25m", 1500, "Write launch notes"],
  ["Write launch notes 25 min", 1500, "Write launch notes"],
  ["Write launch notes 2h", 7200, "Write launch notes"],
  ["Write launch notes 2 hours", 7200, "Write launch notes"],
  ["Write launch notes 1h 30m", 5400, "Write launch notes"],
  ["Write launch notes 1 HR 15 MIN", 4500, "Write launch notes"],
]) {
  const parsed = parseEstimateSuffix(title);
  invariant(parsed?.seconds === seconds, `${title} must parse to ${seconds}`);
  invariant(parsed?.titleWithoutSuffix === normalizedTitle, `${title} must normalize to ${normalizedTitle}`);
}

for (const title of [
  "Write launch notes",
  "25m write launch notes",
  "25m",
  "Write launch notes 0m",
  "Write launch notes tomorrow",
]) {
  invariant(parseEstimateSuffix(title) === null, `${title} must not parse`);
}

// VE-002 B66: visible estimate changes before confirmation but remains a
// display-only projection. Existing saved-title/EST parser semantics are intact.
for (const [title, expected] of [
  ["Prepare slides 28 m", "00:28"],
  ["Write blog post 1 HR", "01:00"],
  ["Email campaign 2 HR 15 m", "02:15"],
  ["Write launch notes 25m", "00:25"],
]) {
  invariant(inlineEstimateSuffixPreview(title, "", true) === expected, title + " live suggestion");
  invariant(inlineEstimateSuffixPreview(title, "  ", true) === expected, title + " blank manual draft");
  invariant(inlineEstimateSuffixPreview(title, "", false) === null, title + " preference off");
  invariant(inlineEstimateSuffixPreview(title, "0:30", true) === null, title + " manual HH:MM precedence");
  invariant(inlineEstimateSuffixPreview(title, "0:30:00", true) === null, title + " manual H:MM:SS precedence");
}
for (const title of ["Prepare slides", "Prepare slides 0m", "28m", "Prepare slides 99999999999999999h"]) {
  invariant(inlineEstimateSuffixPreview(title, "", true) === null, title + " invalid/absent suffix");
}
invariant(parseEstimateSuffix("Prepare slides 28 m")?.titleWithoutSuffix === "Prepare slides", "commit-time title normalization preserved");
console.log("EST suffix parser and live-preview contracts passed.");
