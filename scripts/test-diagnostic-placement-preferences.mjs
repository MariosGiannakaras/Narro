import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { withDiagnosticPlacementPreferences } from "../src/diagnosticPlacementPreferences.ts";

function fixture(original = { selectedMonitorKey: null, focusPanelSide: "right" }) {
  const settings = { ...original, unrelatedTheme: "dark" };
  const writes = [];
  return { settings, writes, preferences: {
    read: async () => ({ ...settings }),
    write: async (patch) => {
      writes.push({ ...patch });
      assert.deepEqual(Object.keys(patch).sort(), ["focusPanelSide", "selectedMonitorKey"]);
      Object.assign(settings, patch, { selectedMonitorKey: patch.selectedMonitorKey || null });
    },
  } };
}

for (const originalKey of [null, "saved-secondary"]) {
  const f = fixture({ selectedMonitorKey: originalKey, focusPanelSide: "left" });
  const result = await withDiagnosticPlacementPreferences(f.preferences, async (select) => {
    let count = 0;
    for (const monitorKey of ["primary-100", "secondary-125"]) {
      for (const side of ["left", "right"]) {
        await select({ selectedMonitorKey: monitorKey, focusPanelSide: side });
        // Model actual asynchronous DPI recovery reading the persistent
        // preference during the diagnostic step's settled interval.
        await Promise.resolve();
        assert.equal(f.settings.selectedMonitorKey, monitorKey);
        assert.equal(f.settings.focusPanelSide, side);
        count++;
      }
    }
    f.settings.unrelatedTheme = "light";
    return count;
  });
  assert.equal(result, 4);
  assert.deepEqual(f.settings, { selectedMonitorKey: originalKey, focusPanelSide: "left", unrelatedTheme: "light" });
  assert.equal(f.writes.length, 5);
}

{
  const f = fixture();
  const primary = new Error("monitor disappeared during placement probe");
  await assert.rejects(withDiagnosticPlacementPreferences(f.preferences, async (select) => {
    await select({ selectedMonitorKey: "secondary", focusPanelSide: "left" });
    throw primary;
  }), (error) => error === primary);
  assert.equal(f.settings.selectedMonitorKey, null);
  assert.equal(f.settings.focusPanelSide, "right");
}

{
  const f = fixture();
  const nativeWrite = f.preferences.write;
  f.preferences.write = async (patch) => {
    await nativeWrite(patch);
    if (patch.selectedMonitorKey === "secondary") throw new Error("write committed before event delivery failed");
  };
  await assert.rejects(withDiagnosticPlacementPreferences(f.preferences, async (select) => {
    await select({ selectedMonitorKey: "secondary", focusPanelSide: "left" });
  }), /event delivery failed/);
  assert.equal(f.settings.selectedMonitorKey, null);
}

for (const failsDuringRun of [false, true]) {
  const primary = new Error("probe failure");
  const restoration = new Error("restore failure");
  const preferences = { read: async () => ({ selectedMonitorKey: null, focusPanelSide: "right" }), write: async () => { throw restoration; } };
  await assert.rejects(withDiagnosticPlacementPreferences(preferences, async () => {
    if (failsDuringRun) throw primary;
    return 4;
  }), (error) => {
    assert.match(error.message, /restoring placement preferences.*restore failure/);
    assert.deepEqual(error.errors, failsDuringRun ? [primary, restoration] : [restoration]);
    return true;
  });
}

{
  let wrote = false;
  await assert.rejects(withDiagnosticPlacementPreferences({ read: async () => { throw new Error("read failure"); }, write: async () => { wrote = true; } }, async () => {}), /read failure/);
  assert.equal(wrote, false);
}

const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
for (const functionName of ["positionFocusPanel", "runFocusPanelPlacementMatrix"]) {
  const start = app.indexOf(`async function ${functionName}(`);
  const end = app.indexOf("\n  }", start);
  const flow = app.slice(start, end);
  assert.match(flow, /placementBusy\.current/);
  assert.match(flow, /withDiagnosticPlacementPreferences/);
  assert(flow.indexOf("await select(") < flow.indexOf('await invoke<void>("position_focus_panel"'));
  assert(flow.indexOf('await invoke<void>("position_focus_panel"') < flow.indexOf("window.setTimeout(resolve, 750)"));
  assert(flow.indexOf("window.setTimeout(resolve, 750)") < flow.indexOf('invoke<FocusPanelPlacementProbe>("focus_panel_placement_probe"'));
}
console.log("Diagnostic placement preference/DPI recovery/restore regression: PASS");
