import assert from "node:assert/strict";
import { clockTime12, clockTime24 } from "../src/scheduleTime12.ts";
assert.deepEqual(clockTime12("00:00"), {hour:12,minute:0,ampm:"AM"});
assert.deepEqual(clockTime12("12:00"), {hour:12,minute:0,ampm:"PM"});
assert.deepEqual(clockTime12("15:30"), {hour:3,minute:30,ampm:"PM"});
assert.deepEqual(clockTime12("23:59"), {hour:11,minute:59,ampm:"PM"});
assert.deepEqual(clockTime12("invalid"), {hour:9,minute:0,ampm:"AM"});
assert.equal(clockTime24(12,0,"AM"),"00:00");
assert.equal(clockTime24(12,0,"PM"),"12:00");
assert.equal(clockTime24(1,30,"PM"),"13:30");
assert.equal(clockTime24(11,59,"PM"),"23:59");
for (const [hour,minute,ampm] of [[0,0,"AM"],[13,0,"PM"],[1,60,"AM"],[1,-1,"AM"],[1,2,"INVALID"],[1.5,30,"AM"]]) {
  assert.equal(clockTime24(hour,minute,ampm),null);
}
console.log("12h inline clock-to-authoritative 24h conversion: PASS");
