import fs from "node:fs";
import "./test-reports-add-session-single-flight.mjs";

function invariant(condition, message) {
  if (!condition) throw new Error("Reports Sessions production contract failed: " + message);
}

const workspace = fs.readFileSync("src/ReportsWorkspace.tsx", "utf8");
const overview = fs.readFileSync("src/ReportsOverview.tsx", "utf8");
const sessions = fs.readFileSync("src/ReportsSessions.tsx", "utf8");
const view = fs.readFileSync("src/ReportsSessionsView.tsx", "utf8");
const badges = fs.readFileSync("src/ReportListBadges.tsx", "utf8");
invariant(view.includes('<ReportListBadges options={listOptions} selectedListIds={selectedListIds} />'), "Sessions filter must use saved list-color badges");
invariant(badges.includes('data-report-list-badges="true"'), "Report badge component missing");
invariant(view.includes('className="reports-sessions__break-icon"'), "source Break filter icon missing");
const styles = fs.readFileSync("src/reportsSessions.css", "utf8");
const fixture = fs.readFileSync("src/reportsVisualFixture.tsx", "utf8");
const captureValidator = fs.readFileSync("scripts/validate-reports-captures.mjs", "utf8");
const api = fs.readFileSync("src/reportsApi.ts", "utf8");
const reporting = fs.readFileSync("src-tauri/src/reporting.rs", "utf8");
const commands = fs.readFileSync("src-tauri/src/report_commands.rs", "utf8");
const shell = fs.readFileSync("src/AppShell.tsx", "utf8");
const searchApi = fs.readFileSync("src/searchPaletteApi.ts", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

for (const [haystack, needle, label] of [
  [workspace, '<ReportsSessions', "production Sessions workspace branch"],
  [workspace, '<ReportsOverview', "production Overview workspace branch"],
  [overview, "onOpenSessions={onOpenSessions}", "Overview-to-Sessions tab routing"],
  [shell, '<ReportsWorkspace', "Reports destination workspace routing"],
  [sessions, "getReportSessions(", "authoritative Sessions read"],
  [sessions, "getReportTaskSessions(", "all-history task detail read"],
  [sessions, "createManualReportSession(", "authoritative Add Session mutation"],
  [sessions, "editReportSession(", "authoritative session edit mutation"],
  [sessions, "deleteReportSession(", "authoritative session delete mutation"],
  [sessions, "exportReportSessionsCsv(request)", "local Sessions CSV export invocation"],
  [sessions, "Sessions CSV exported locally to", "local export success feedback"],
  [sessions, "expectedUpdatedAt: raw.updatedAt", "stale-safe edit/delete token use"],
  [sessions, "const refreshes: Array<Promise<unknown>> = [refreshSessions()]", "authoritative Sessions refetch after mutation"],
  [sessions, "refreshes.push(refreshDetail(detailTaskId))", "authoritative detail refetch after mutation"],
  [sessions, "Promise.allSettled(refreshes)", "committed mutation versus refresh-failure distinction"],
  [sessions, "usePreferenceSettingsProjection()", "Preferences timezone projection"],
  [sessions, "zonedReportDateTimeIso(", "timezone-correct local session mutation"],
  [sessions, "getSearchPaletteData()", "reuse of authoritative task picker data"],
  [searchApi, 'getListBoardSnapshot({ kind: "all" })', "existing All Lists task index reuse"],
  [searchApi, "listColor: task.listColor", "persisted list-color projection for Recent Tasks badges"],
  [view, 'data-session-task-list-badge="true"', "Recent Tasks list badge UI"],
  [view, "HEX_COLOR.test(task.listColor)", "validated list-color UI treatment"],
  [styles, ".reports-sessions__task-picker-list i", "compact source list color marker"],
  [fixture, 'listColor: "#55c2d0"', "list-badge fixture grounded persisted-color shape"],
  [view, ">Sessions <span>Beta</span>", "Sessions Beta tab"],
  [view, "Export .csv", "current Sessions export label"],
  [view, "disabled={exportPending || !onExport}", "CSV export pending/unwired guard"],
  [view, "onClick={onExport}", "CSV export action wiring"],
  [view, "Hide Break sessions", "break visibility filter"],
  [view, 'placeholder="Select tasks..."', "Add Session task search"],
  [view, 'data-report-task-selector-trigger="true"', "collapsed Add Session task picker trigger"],
  [view, 'aria-expanded={pickerOpen}', "accessible popup disclosure"],
  [view, 'data-report-task-picker-open="true"', "Recent Tasks list is conditional on picker state"],
  [view, "if (pickerOpen && !pending) closePicker()", "Escape first closes the task picker"],
  [view, "onDraftChange({ ...draft, taskId })", "selector preserves authoritative task binding"],
  [fixture, 'pickerTrigger!.click();', "keyboard scenario exercises picker-open search focus"],
  [fixture, 'Picker Escape dismissed the whole Add Session modal.', "nested popup Escape must not dismiss parent"],
  [view, ">Recent Tasks<", "Add Session recent task heading"],
  [view, "searchInputRef.current?.focus()", "Add Session initial-focus ownership"],
  [view, 'event.key === "Escape"', "Add Session Escape handling"],
  [view, 'event.key !== "Tab"', "Add Session Tab containment"],
  [view, "openerRef.current?.focus()", "Add Session focus restoration"],
  [view, "if (!pending) onClose()", "Add Session pending dismissal guard"],
  [view, "dialogRef.current?.focus()", "Add Session pending focus ownership"],
  [view, "setPickerOpen(false);", "pending mutation closes nested selector before modal focus"],
  [styles, "overflow-x: hidden;", "Recent Tasks horizontal overflow suppression"],
  [styles, "text-overflow: ellipsis;", "Recent Tasks bounded one-line title treatment"],
  [fixture, '"sessions-add-keyboard"', "rendered Add Session keyboard fixture"],
  [fixture, "reportsAddKeyboardPass", "rendered Add Session keyboard assertions"],
  [fixture, "picker.scrollWidth > picker.clientWidth + 1", "rendered Recent Tasks overflow assertion"],
  [captureValidator, 'data-reports-add-keyboard-pass="true"', "captured Add Session keyboard validation"],
  [captureValidator, 'data-reports-task-picker-bounded="true"', "captured Recent Tasks containment validation"],
  [sessions, "row.taskSessionOrdinal", "task-relative session presentation"],
  [view, 'type="time"', "inline time editing"],
  [view, 'aria-label="Save session end time"', "explicit green-check commit affordance"],
  [view, "ReportTaskSessionsDialog", "task session-detail overlay"],
  [view, 'data-report-session-detail-dialog="true"', "detail dialog has a semantic modal owner"],
  [view, "closeButtonRef.current?.focus()", "detail initial keyboard focus"],
  [view, "returnFocusTarget?.isConnected", "detail return focus"],
  [sessions, "returnFocusTarget={detailOpenerRef.current}", "detail focus scope"],
  [view, "onKeyDown={handleDetailKeyDown}", "detail keyboard containment and dismissal"],
  [view, "export function focusableDialogElements(", "shared actual tabbable collection"],
  [view, "element.getClientRects().length === 0", "exclude CSS-hidden tab endpoints"],
  [view, "element.tabIndex < 0", "exclude nonkeyboard reachable tab endpoints"],
  [fixture, "focusableDialogElements(detail!)", "fixture uses production tabbable collector"],
  [fixture, "Last detail tab stop could not receive actual focus.", "fixture verifies real browser focusability"],
  [view, "if (!pending) onClose()", "detail Escape guard while mutation is in flight"],
  [view, "if (pending) dialogRef.current?.focus()", "pending detail focus ownership"],
  [sessions, "detailView && !addOpen", "only one nested Reports modal is mounted"],
  [fixture, '"sessions-detail-keyboard"', "detail transfer and keyboard fixture entry"],
  [fixture, "document.documentElement.dataset.reportsDetailKeyboardPass", "rendered detail modal keyboard test"],
  [fixture, "document.documentElement.dataset.reportsDetailKeyboardVisualReady", "reopen dialog after keyboard Escape for screenshot"],
  [captureValidator, 'data-reports-detail-keyboard-visual-ready="true"', "captured visible keyboard modal after lifecycle acceptance"],
  [captureValidator, 'data-reports-detail-keyboard-pass="true"', "captured modal lifecycle acceptance"],
  [reporting, "pub updated_at: String", "read-model session version token"],
  [reporting, "s.updated_at", "SQLite session version projection"],
  [commands, "updated_at: value.updated_at", "version token Tauri serialization"],
  [api, "updatedAt: string;", "typed version token"],
]) {
  invariant(haystack.includes(needle), label);
}

invariant(
  !sessions.includes("setInterval("),
  "Sessions must not poll or become a second report authority",
);
invariant(
  !sessions.includes("totalFocusSeconds +") && !sessions.includes("totalSessions +"),
  "Sessions totals must be refetched rather than client-mutated",
);
invariant(
  view.includes('row.ordinalLabel ?? (row.kind === "break" ? "Break" : "—")'),
  "break rows must not invent a task-session ordinal",
);
invariant(
  pkg.scripts["test:ui-reports-sessions"] === "node scripts/test-ui-reports-sessions.mjs",
  "Sessions test script registration differs",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:ui-reports-sessions"),
  "frontend preflight must include production Sessions contracts",
);

console.log("Reports Sessions production contracts: PASS");
