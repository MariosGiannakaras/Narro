import { useEffect, useMemo, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import {
  getListBoardSnapshot,
  type ListBoardRequestTarget,
  type ListBoardTask,
} from "./listBoardApi";
import {
  setPausedTimerEstimate,
  setPausedTimerTimeTaken,
  type TimerSessionPayload,
  type TimerSnapshot,
} from "./timerSessionApi";
import "./focusLiveMetrics.css";

export type FocusMetricKind = "estimate" | "time_taken";

type FocusMetricEditor = {
  metric: FocusMetricKind;
  value: string;
  expectedEstSeconds: number | null;
  expectedTimeTakenSeconds: string;
};

type FocusLiveMetricsProps = {
  task: ListBoardTask;
  target: ListBoardRequestTarget;
  timer: TimerSessionPayload;
  fixtureMode: boolean;
  fixtureEditor?: FocusMetricKind | null;
  interactionBlocked?: boolean;
  onTimerPayload: (payload: TimerSessionPayload) => void;
};

const WHOLE_SECONDS = /^\d+$/;
const DURATION_INPUT = /^(\d+):([0-5]\d):([0-5]\d)$/;
const MAX_EDITABLE_SECONDS = 4_294_967_295n;

function formatDurationSeconds(seconds: bigint): string {
  const hours = seconds / 3_600n;
  const minutes = (seconds % 3_600n) / 60n;
  const remainder = seconds % 60n;
  return `${hours}:${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
}

function estimateDraft(seconds: number | null): string {
  return seconds === null ? "" : formatDurationSeconds(BigInt(seconds));
}

function timeTakenDraft(rawSeconds: string): string {
  return WHOLE_SECONDS.test(rawSeconds) ? formatDurationSeconds(BigInt(rawSeconds)) : "0:00:00";
}

function parseMetricDuration(
  raw: string,
  metric: FocusMetricKind,
): { ok: true; seconds: number | null } | { ok: false; message: string } {
  const value = raw.trim();
  if (metric === "estimate" && value === "") return { ok: true, seconds: null };
  const match = DURATION_INPUT.exec(value);
  if (!match) {
    return {
      ok: false,
      message: metric === "estimate"
        ? "EST must use H:MM:SS, or be left blank to clear it."
        : "Time Taken must use H:MM:SS.",
    };
  }

  const hours = BigInt(match[1]);
  const minutes = BigInt(match[2]);
  const seconds = BigInt(match[3]);
  const total = hours * 3_600n + minutes * 60n + seconds;
  if (total > MAX_EDITABLE_SECONDS) {
    return { ok: false, message: "Duration exceeds Narro's editable range." };
  }
  if (metric === "estimate" && total === 0n) {
    return { ok: false, message: "EST must be greater than zero, or blank to clear it." };
  }
  return { ok: true, seconds: Number(total) };
}

function timerAllowsMetricEditing(timer: TimerSnapshot, taskId: string): boolean {
  return timer.task_id === taskId
    && (timer.state === "paused" || timer.state === "overtime_paused");
}

function editorFor(metric: FocusMetricKind, task: ListBoardTask): FocusMetricEditor {
  return {
    metric,
    value: metric === "estimate" ? estimateDraft(task.estSeconds) : timeTakenDraft(task.timeTakenSeconds),
    expectedEstSeconds: task.estSeconds,
    expectedTimeTakenSeconds: task.timeTakenSeconds,
  };
}

function displayValue(metric: FocusMetricKind, task: ListBoardTask): string {
  return metric === "estimate"
    ? (task.estSeconds === null ? "—" : estimateDraft(task.estSeconds))
    : timeTakenDraft(task.timeTakenSeconds);
}

function metricLabel(metric: FocusMetricKind): string {
  return metric === "estimate" ? "EST" : "Time Taken";
}

export function FocusLiveMetrics({
  task,
  target,
  timer,
  fixtureMode,
  fixtureEditor = null,
  interactionBlocked = false,
  onTimerPayload,
}: FocusLiveMetricsProps) {
  const [projection, setProjection] = useState(task);
  const [editor, setEditor] = useState<FocusMetricEditor | null>(() =>
    fixtureMode && fixtureEditor ? editorFor(fixtureEditor, task) : null,
  );
  const [pending, setPending] = useState(false);
  const [refreshBlocked, setRefreshBlocked] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pausedEditable = timerAllowsMetricEditing(timer.runtime.timer, task.id);
  const canEdit = pausedEditable && !pending && !refreshBlocked && !interactionBlocked;

  useEffect(() => {
    setProjection(task);
    setEditor(fixtureMode && fixtureEditor ? editorFor(fixtureEditor, task) : null);
    setPending(false);
    setRefreshBlocked(false);
    setStatus(null);
    setError(null);
  }, [task.id, fixtureEditor, fixtureMode]);

  useEffect(() => {
    if (!editor && !pending && !refreshBlocked) setProjection(task);
  }, [editor, pending, refreshBlocked, task.estSeconds, task.timeTakenSeconds]);

  useEffect(() => {
    if (!pausedEditable && editor) setEditor(null);
  }, [editor, pausedEditable]);

  const values = useMemo(() => ({
    estimate: displayValue("estimate", projection),
    time_taken: displayValue("time_taken", projection),
  }), [projection]);

  const startEdit = (metric: FocusMetricKind) => {
    if (!canEdit) return;
    setEditor(editorFor(metric, projection));
    setStatus(null);
    setError(null);
  };

  const refreshAfterCommittedMutation = async (
    metric: FocusMetricKind,
    savedSeconds: number | null,
  ) => {
    const board = await getListBoardSnapshot(target);
    const refreshed = board.today.tasks.find((candidate) => candidate.id === task.id);
    if (!refreshed || refreshed.listId !== task.listId) {
      throw new Error("The live task was missing from the authoritative Focus board refresh.");
    }
    if (metric === "estimate" && refreshed.estSeconds !== savedSeconds) {
      throw new Error("Authoritative Focus EST did not reconcile after the saved change.");
    }
    if (metric === "time_taken" && refreshed.timeTakenSeconds !== String(savedSeconds ?? 0)) {
      throw new Error("Authoritative Focus Time Taken did not reconcile after the saved change.");
    }
    setProjection(refreshed);
  };

  const save = async () => {
    if (fixtureMode || !editor || pending || refreshBlocked || interactionBlocked || !pausedEditable) return;
    const parsed = parseMetricDuration(editor.value, editor.metric);
    if (!parsed.ok) {
      setStatus(null);
      setError(parsed.message);
      return;
    }
    if (editor.metric === "time_taken" && parsed.seconds === null) {
      setStatus(null);
      setError("Time Taken must use H:MM:SS.");
      return;
    }

    const metric = editor.metric;
    setPending(true);
    setStatus(null);
    setError(null);
    try {
      const payload = metric === "estimate"
        ? await setPausedTimerEstimate({
            taskId: task.id,
            listId: task.listId,
            expectedEstSeconds: editor.expectedEstSeconds,
            estSeconds: parsed.seconds,
          })
        : await setPausedTimerTimeTaken({
            taskId: task.id,
            expectedTotalSeconds: editor.expectedTimeTakenSeconds,
            totalSeconds: parsed.seconds ?? 0,
          });

      // The timer/session mutation has committed. Publish its monotonic authoritative payload
      // before attempting the secondary board refresh so countdown/runtime rebases are immediate.
      onTimerPayload(payload);
      setEditor(null);

      try {
        await refreshAfterCommittedMutation(metric, parsed.seconds);
        setStatus(`${metricLabel(metric)} saved.`);
      } catch (refreshFailure: unknown) {
        setRefreshBlocked(true);
        setStatus(`${metricLabel(metric)} was saved, but Focus could not refresh the task details.`);
        setError(
          `Metric change was saved, but authoritative Focus details could not refresh. ${formatInvokeError(refreshFailure)} Reopen Focus before editing EST or Time Taken again.`,
        );
      }
    } catch (failure: unknown) {
      setStatus(null);
      setError(formatInvokeError(failure));
    } finally {
      setPending(false);
    }
  };

  return (
    <section
      className="focus-panel__live-metrics"
      data-focus-live-metrics="true"
      data-focus-metrics-editable={pausedEditable ? "true" : "false"}
      data-focus-metrics-refresh-blocked={refreshBlocked ? "true" : "false"}
      aria-label="Live task time details"
    >
      {(["estimate", "time_taken"] as FocusMetricKind[]).map((metric) => {
        const editing = editor?.metric === metric;
        return (
          <div className="focus-panel__metric-row" data-focus-metric={metric} key={metric}>
            <span className="focus-panel__metric-label type-metadata">{metricLabel(metric)}</span>
            {editing && editor ? (
              <>
                <input
                  className="focus-panel__metric-input timer-numerals"
                  data-focus-metric-control="input"
                  aria-label={`${metricLabel(metric)} duration in H:MM:SS`}
                  value={editor.value}
                  disabled={pending || interactionBlocked}
                  autoFocus={!fixtureMode}
                  placeholder={metric === "estimate" ? "H:MM:SS or blank" : "H:MM:SS"}
                  onChange={(event) => setEditor((current) => current ? { ...current, value: event.target.value } : current)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      if (!pending) setEditor(null);
                    } else if (event.key === "Enter") {
                      event.preventDefault();
                      if (!pending) void save();
                    }
                  }}
                />
                <span className="focus-panel__metric-actions">
                  <button
                    type="button"
                    data-focus-metric-control="cancel"
                    aria-label={`Cancel ${metricLabel(metric)} edit`}
                    disabled={pending || interactionBlocked}
                    onClick={() => setEditor(null)}
                  >×</button>
                  <button
                    type="button"
                    data-focus-metric-control="save"
                    aria-label={`Save ${metricLabel(metric)}`}
                    disabled={pending || interactionBlocked}
                    onClick={() => void save()}
                  >✓</button>
                </span>
              </>
            ) : canEdit ? (
              <button
                type="button"
                className="focus-panel__metric-value timer-numerals motion-interactive"
                data-focus-metric-control="open"
                aria-label={`Edit ${metricLabel(metric)}: ${values[metric]}`}
                onClick={() => startEdit(metric)}
              >
                {values[metric]}
              </button>
            ) : (
              <span
                className="focus-panel__metric-value focus-panel__metric-value--readonly timer-numerals"
                data-focus-metric-control="display"
              >
                {values[metric]}
              </span>
            )}
          </div>
        );
      })}

      {status ? <span className="focus-panel__metric-status type-metadata" role="status">{status}</span> : null}
      {error ? <span className="focus-panel__metric-error type-metadata" role="alert">{error}</span> : null}
    </section>
  );
}
