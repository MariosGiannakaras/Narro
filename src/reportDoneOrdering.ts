import type { ReportDoneTaskInsight } from "./reportsApi";

// This ordering belongs to the Done presentation only. The authoritative
// history sequence is shared by other reporting calculations and must not
// be reordered or mutated to match the UI.
export function orderReportDoneTasks(
  tasks: readonly ReportDoneTaskInsight[],
): ReportDoneTaskInsight[] {
  return [...tasks].sort((left, right) => {
    const leftAt = Date.parse(left.task.completedAt);
    const rightAt = Date.parse(right.task.completedAt);
    const leftValid = Number.isFinite(leftAt);
    const rightValid = Number.isFinite(rightAt);
    if (leftValid && rightValid && leftAt !== rightAt) return rightAt - leftAt;
    if (leftValid !== rightValid) return leftValid ? -1 : 1;
    return left.task.taskId < right.task.taskId
      ? -1
      : left.task.taskId > right.task.taskId ? 1 : 0;
  });
}
