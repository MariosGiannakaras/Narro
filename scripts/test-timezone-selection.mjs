import {
  isValidIanaTimezone,
  systemTimezone,
  timezoneOffset,
  timezoneOptionLabel,
  timezoneOptions,
} from "../src/timezoneSelection.ts";
import { readFileSync } from "node:fs";

function assert(condition, message) {
  if (!condition) throw new Error("Timezone selector regression: " + message);
}

const summer = new Date("2026-07-15T12:00:00.000Z");
const winter = new Date("2026-01-15T12:00:00.000Z");
assert(isValidIanaTimezone("Europe/Athens"), "IANA Athens is accepted");
assert(!isValidIanaTimezone("Not/AZone"), "invalid IANA zones are rejected");
assert(timezoneOffset("Europe/Athens", summer) === "GMT+03:00", "Athens summer DST offset");
assert(timezoneOffset("Europe/Athens", winter) === "GMT+02:00", "Athens winter offset");
assert(timezoneOptionLabel("Europe/Athens", summer) === "(GMT+03:00) Europe/Athens",
  "offset-qualified source label");
assert(timezoneOffset("UTC", winter) === "GMT+00:00", "UTC zero offset");
assert(timezoneOffset("Asia/Kathmandu", winter) === "GMT+05:45", "fractional-offset zone");
assert(timezoneOffset("Not/AZone", summer) === null, "invalid zone cannot invent an offset");
assert(timezoneOffset("Europe/Athens", new Date(Number.NaN)) === null, "invalid instant rejected");

const local = systemTimezone();
assert(isValidIanaTimezone(local), "local Windows/WebView zone resolves to valid IANA");
const choices = timezoneOptions("Europe/Athens", local);
assert(choices.includes("Europe/Athens") && choices.includes("UTC") && choices.includes(local),
  "saved, UTC and system zones are always represented");
assert(new Set(choices).size === choices.length, "no duplicate timezone options");
assert(timezoneOptions("Not/AZone", local).every((zone) => zone !== "Not/AZone"),
  "invalid saved zones are not advertised as selectable valid options");

const root = new URL("../", import.meta.url);
const read = (name) => readFileSync(new URL(name, root), "utf8");
const sections = read("src/PreferenceSettingsSections.tsx");
const picker = read("src/TimezonePreferenceSelector.tsx");
const styles = read("src/timezonePreferenceSelector.css");
assert(sections.includes("<TimezonePreferenceSelector"), "Preferences uses dropdown component");
assert(!sections.includes('defaultValue={snapshot.general.timezone ?? ""}'),
  "legacy freeform-only timezone input replaced");
for (const needle of [
  'value={editingCustom ? OTHER_TIMEZONE : (timezone ?? "")}',
  'value={zone}',
  'value=""',
  'onChange(selected)',
  'onChange(trimmed)',
  'disabled={disabled || !validDraft}',
  'event.stopPropagation();',
  'setEditingCustom(false)',
]) {
  assert(picker.includes(needle), "selector contract missing " + needle);
}
assert(styles.includes("var(--color-accent-solid)") && styles.includes("var(--radius-control)"),
  "picker reuses the calibrated Preferences visual tokens");
console.log("Timezone offset, DST, validated selection and user-preserved custom IANA contracts passed.");
