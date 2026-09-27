import { parseEstimateSuffix } from "../src/taskEstimateParser.ts";

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

console.log("EST suffix parser contracts passed.");
