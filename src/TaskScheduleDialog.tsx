import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { formatInvokeError } from "./diagnosticApi";
import {
  getTaskScheduleEditor,
  removeTaskRecurrence,
  resolveTaskScheduleShortcut,
  saveTaskRecurrence,
  updateTaskSchedule,
  type BoardRecurrenceRule,
  type RecurrenceDraft,
  type RecurrenceUnit,
  type ScheduleShortcut,
  type TaskSchedule,
  type TaskScheduleEditorSnapshot,
} from "./taskScheduleApi";

const WEEKDAYS = [
  { label: "M", name: "Monday", bit: 1 },
  { label: "T", name: "Tuesday", bit: 2 },
  { label: "W", name: "Wednesday", bit: 4 },
  { label: "T", name: "Thursday", bit: 8 },
  { label: "F", name: "Friday", bit: 16 },
  { label: "S", name: "Saturday", bit: 32 },
  { label: "S", name: "Sunday", bit: 64 },
] as const;

const WEEKDAY_MASK = 31;

type RecurrencePreset = "daily" | "weekdays" | "weekly" | "monthly" | "custom";
type MonthPattern = "date" | "weekdays";

type Props = {
  taskId: string;
  listId: string;
  taskTitle: string;
  displayTimezone: string;
  onClose: () => void;
  onCommitted: (taskId: string, message: string, warning?: string | null) => Promise<void>;
};

function dateWeekdayBit(localDate: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) return 0;
  const date = new Date(`${localDate}T00:00:00Z`);
  if (!Number.isFinite(date.getTime())) return 0;
  const mondayIndex = (date.getUTCDay() + 6) % 7;
  return 1 << mondayIndex;
}

function dateMonthDay(localDate: string): number | null {
  const match = /^\d{4}-\d{2}-(\d{2})$/.exec(localDate);
  if (!match) return null;
  const value = Number(match[1]);
  return value >= 1 && value <= 31 ? value : null;
}

function scheduleDraft(schedule: TaskSchedule) {
  if (schedule.kind === "none") {
    return { localDate: "", useTime: false, localTime: "", timezone: "" };
  }
  if (schedule.kind === "date_only") {
    return { localDate: schedule.local_date, useTime: false, localTime: "", timezone: "" };
  }
  return {
    localDate: schedule.local_date,
    useTime: true,
    localTime: schedule.local_time,
    timezone: schedule.timezone,
  };
}

function inferPreset(rule: BoardRecurrenceRule): RecurrencePreset {
  if (rule.intervalCount === 1 && rule.unit === "day" && rule.weekdayMask === 0 && rule.monthDay === null) {
    return "daily";
  }
  if (rule.intervalCount === 1 && rule.unit === "week" && rule.weekdayMask === WEEKDAY_MASK) {
    return "weekdays";
  }
  if (
    rule.intervalCount === 1
    && rule.unit === "week"
    && rule.weekdayMask > 0
    && (rule.weekdayMask & (rule.weekdayMask - 1)) === 0
  ) {
    return "weekly";
  }
  if (rule.intervalCount === 1 && rule.unit === "month" && rule.monthDay !== null) {
    return "monthly";
  }
  return "custom";
}

function scheduleFromDraft(
  localDate: string,
  useTime: boolean,
  localTime: string,
  timezone: string,
): TaskSchedule | null {
  if (!localDate) return { kind: "none" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) return null;
  if (!useTime) return { kind: "date_only", local_date: localDate };
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(localTime) || !timezone.trim()) return null;
  return {
    kind: "local_datetime",
    local_date: localDate,
    local_time: localTime,
    timezone,
  };
}

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("hidden"));
}

export function TaskScheduleDialog({
  taskId,
  listId,
  taskTitle,
  displayTimezone,
  onClose,
  onCommitted,
}: Props) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [snapshot, setSnapshot] = useState<TaskScheduleEditorSnapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [scheduleLocalDate, setScheduleLocalDate] = useState("");
  const [scheduleUseTime, setScheduleUseTime] = useState(false);
  const [scheduleLocalTime, setScheduleLocalTime] = useState("");
  const [scheduleTimezone, setScheduleTimezone] = useState(displayTimezone);
  const [preset, setPreset] = useState<RecurrencePreset>("weekly");
  const [startsLocalDate, setStartsLocalDate] = useState("");
  const [recurrenceUseTime, setRecurrenceUseTime] = useState(false);
  const [recurrenceLocalTime, setRecurrenceLocalTime] = useState("");
  const [recurrenceTimezone, setRecurrenceTimezone] = useState(displayTimezone);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [customInterval, setCustomInterval] = useState(1);
  const [customUnit, setCustomUnit] = useState<RecurrenceUnit>("week");
  const [customWeekdayMask, setCustomWeekdayMask] = useState(1);
  const [customMonthPattern, setCustomMonthPattern] = useState<MonthPattern>("date");
  const [customMonthDay, setCustomMonthDay] = useState(1);

  useEffect(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    return () => openerRef.current?.focus();
  }, []);

  useEffect(() => {
    let disposed = false;
    setSnapshot(null);
    setLoadError(null);
    setMutationError(null);
    void getTaskScheduleEditor(taskId, listId)
      .then((value) => {
        if (disposed) return;
        setSnapshot(value);
        const draft = scheduleDraft(value.schedule);
        setScheduleLocalDate(draft.localDate);
        setScheduleUseTime(draft.useTime);
        setScheduleLocalTime(draft.localTime);
        setScheduleTimezone(draft.timezone || displayTimezone);

        if (value.recurrence) {
          const rule = value.recurrence;
          setPreset(inferPreset(rule));
          setStartsLocalDate(rule.startsLocalDate);
          setRecurrenceUseTime(rule.localTime !== null);
          setRecurrenceLocalTime(rule.localTime ?? "");
          setRecurrenceTimezone(rule.timezone ?? displayTimezone);
          setReplaceExisting(rule.replaceExisting);
          setCustomInterval(rule.intervalCount);
          setCustomUnit(rule.unit);
          setCustomWeekdayMask(rule.weekdayMask || 1);
          setCustomMonthPattern(rule.monthDay === null ? "weekdays" : "date");
          setCustomMonthDay(rule.monthDay ?? dateMonthDay(rule.startsLocalDate) ?? 1);
        } else {
          setStartsLocalDate(draft.localDate);
          setRecurrenceTimezone(displayTimezone);
          setReplaceExisting(false);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) setLoadError(formatInvokeError(failure));
      });
    return () => {
      disposed = true;
    };
  }, [displayTimezone, listId, taskId]);

  const generatedOccurrence = snapshot?.recurrenceParentTaskId !== null && snapshot?.recurrenceParentTaskId !== undefined;
  const existingRule = snapshot?.recurrence ?? null;
  const recurrenceEnabled = !generatedOccurrence;

  const scheduleDescription = useMemo(() => {
    if (!scheduleLocalDate) return "Unscheduled";
    if (!scheduleUseTime) return scheduleLocalDate;
    return `${scheduleLocalDate} at ${scheduleLocalTime || "—"} · ${scheduleTimezone}`;
  }, [scheduleLocalDate, scheduleLocalTime, scheduleTimezone, scheduleUseTime]);

  const applyShortcut = async (shortcut: ScheduleShortcut) => {
    if (pending) return;
    setPending(true);
    setMutationError(null);
    try {
      const schedule = await resolveTaskScheduleShortcut(shortcut, displayTimezone);
      const draft = scheduleDraft(schedule);
      setScheduleLocalDate(draft.localDate);
      setScheduleUseTime(draft.useTime);
      setScheduleLocalTime(draft.localTime);
      setScheduleTimezone(draft.timezone || displayTimezone);
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
    } finally {
      setPending(false);
    }
  };

  const saveSchedule = async () => {
    if (!snapshot || pending) return;
    const schedule = scheduleFromDraft(
      scheduleLocalDate.trim(),
      scheduleUseTime,
      scheduleLocalTime.trim(),
      scheduleTimezone,
    );
    if (!schedule) {
      setMutationError("Choose a valid local date and optional 24-hour local time.");
      return;
    }
    setPending(true);
    setMutationError(null);
    try {
      await updateTaskSchedule({
        taskId,
        listId,
        expectedSchedule: snapshot.schedule,
        schedule,
      });
      await onCommitted(taskId, schedule.kind === "none" ? "Task schedule cleared." : "Task schedule saved.");
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
      setPending(false);
    }
  };

  const ensureRecurrenceStartDate = async (): Promise<string | null> => {
    if (startsLocalDate) return startsLocalDate;
    try {
      const today = await resolveTaskScheduleShortcut({ kind: "today" }, displayTimezone);
      if (today.kind !== "date_only") return null;
      setStartsLocalDate(today.local_date);
      return today.local_date;
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
      return null;
    }
  };

  const recurrenceDraft = (startDate: string): RecurrenceDraft | null => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return null;
    const timed = recurrenceUseTime;
    if (timed && !/^([01]\d|2[0-3]):[0-5]\d$/.test(recurrenceLocalTime)) return null;
    const timeFields = timed
      ? { localTime: recurrenceLocalTime, timezone: recurrenceTimezone }
      : { localTime: null, timezone: null };

    if (preset === "daily") {
      return { intervalCount: 1, unit: "day", weekdayMask: 0, monthDay: null, startsLocalDate: startDate, replaceExisting: existingRule ? replaceExisting : false, ...timeFields };
    }
    if (preset === "weekdays") {
      return { intervalCount: 1, unit: "week", weekdayMask: WEEKDAY_MASK, monthDay: null, startsLocalDate: startDate, replaceExisting: existingRule ? replaceExisting : false, ...timeFields };
    }
    if (preset === "weekly") {
      const weekdayMask = dateWeekdayBit(startDate);
      if (!weekdayMask) return null;
      return { intervalCount: 1, unit: "week", weekdayMask, monthDay: null, startsLocalDate: startDate, replaceExisting: existingRule ? replaceExisting : false, ...timeFields };
    }
    if (preset === "monthly") {
      const monthDay = dateMonthDay(startDate);
      if (!monthDay) return null;
      return { intervalCount: 1, unit: "month", weekdayMask: 0, monthDay, startsLocalDate: startDate, replaceExisting: existingRule ? replaceExisting : false, ...timeFields };
    }

    const intervalCount = Math.max(1, Math.floor(customInterval));
    if (customUnit === "week") {
      if (customWeekdayMask < 1 || customWeekdayMask > 127) return null;
      return { intervalCount, unit: "week", weekdayMask: customWeekdayMask, monthDay: null, startsLocalDate: startDate, replaceExisting: existingRule ? replaceExisting : false, ...timeFields };
    }
    if (customUnit === "month") {
      if (customMonthPattern === "weekdays") {
        if (customWeekdayMask < 1 || customWeekdayMask > 127) return null;
        return { intervalCount, unit: "month", weekdayMask: customWeekdayMask, monthDay: null, startsLocalDate: startDate, replaceExisting: existingRule ? replaceExisting : false, ...timeFields };
      }
      if (customMonthDay < 1 || customMonthDay > 31) return null;
      return { intervalCount, unit: "month", weekdayMask: 0, monthDay: customMonthDay, startsLocalDate: startDate, replaceExisting: existingRule ? replaceExisting : false, ...timeFields };
    }
    return { intervalCount, unit: customUnit, weekdayMask: 0, monthDay: null, startsLocalDate: startDate, replaceExisting: existingRule ? replaceExisting : false, ...timeFields };
  };

  const saveRecurrence = async () => {
    if (!snapshot || pending || !recurrenceEnabled) return;
    setPending(true);
    setMutationError(null);
    const startDate = await ensureRecurrenceStartDate();
    if (!startDate) {
      setPending(false);
      setMutationError((current) => current ?? "Choose a recurrence start date.");
      return;
    }
    const recurrence = recurrenceDraft(startDate);
    if (!recurrence) {
      setPending(false);
      setMutationError("Choose a valid recurrence interval, pattern, start date and optional local time.");
      return;
    }
    try {
      const result = await saveTaskRecurrence({
        taskId,
        listId,
        expectedRuleId: existingRule?.id ?? null,
        expectedRuleUpdatedAt: existingRule?.updatedAt ?? null,
        recurrence,
      });
      await onCommitted(
        taskId,
        existingRule ? "Task recurrence saved." : "Task recurrence created.",
        result.materializationWarning,
      );
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
      setPending(false);
    }
  };

  const removeRecurrence = async () => {
    if (!snapshot || !existingRule || pending) return;
    setPending(true);
    setMutationError(null);
    try {
      await removeTaskRecurrence({
        taskId,
        listId,
        expectedRuleId: existingRule.id,
        expectedRuleUpdatedAt: existingRule.updatedAt,
      });
      await onCommitted(taskId, "Task recurrence removed; existing occurrences remain independent.");
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
      setPending(false);
    }
  };

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      if (!pending) {
        event.preventDefault();
        onClose();
      }
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;

    const focusable = focusableElements(dialogRef.current);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="task-schedule-dialog__backdrop"
      data-task-schedule-dialog="true"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="task-schedule-dialog motion-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-schedule-dialog-title"
        data-task-schedule-state={snapshot ? "ready" : loadError ? "error" : "loading"}
        onKeyDown={handleDialogKeyDown}
      >
        <header className="task-schedule-dialog__header">
          <div>
            <p className="type-metadata">Schedule / Repeat</p>
            <h2 id="task-schedule-dialog-title" className="type-section-title">{taskTitle}</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="task-schedule-dialog__close motion-interactive"
            aria-label="Close scheduling editor"
            data-task-schedule-control="close"
            disabled={pending}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {loadError ? <div className="task-schedule-dialog__error type-metadata" role="alert">{loadError}</div> : null}
        {!snapshot && !loadError ? <div className="task-schedule-dialog__loading type-metadata">Loading authoritative schedule…</div> : null}

        {snapshot ? (
          <div className="task-schedule-dialog__content">
            {mutationError ? <div className="task-schedule-dialog__error type-metadata" role="alert">{mutationError}</div> : null}

            <section className="task-schedule-dialog__section" aria-labelledby="task-schedule-section-title">
              <div className="task-schedule-dialog__section-heading">
                <div>
                  <h3 id="task-schedule-section-title">Schedule</h3>
                  <p className="type-metadata">{scheduleDescription}</p>
                </div>
                <button
                  type="button"
                  className="task-schedule-dialog__text-action motion-interactive"
                  data-task-schedule-control="clear"
                  disabled={pending}
                  onClick={() => {
                    setScheduleLocalDate("");
                    setScheduleUseTime(false);
                    setScheduleLocalTime("");
                  }}
                >
                  Unscheduled
                </button>
              </div>

              <div className="task-schedule-dialog__shortcuts" aria-label="Schedule shortcuts">
                {([
                  [{ kind: "today" }, "Today"],
                  [{ kind: "later_today" }, "Later today"],
                  [{ kind: "tomorrow" }, "Tomorrow"],
                  [{ kind: "next_week" }, "Next week"],
                ] as Array<[ScheduleShortcut, string]>).map(([shortcut, label]) => (
                  <button
                    key={shortcut.kind}
                    type="button"
                    className="task-schedule-dialog__shortcut motion-interactive"
                    data-task-schedule-shortcut={shortcut.kind}
                    disabled={pending}
                    onClick={() => void applyShortcut(shortcut)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="task-schedule-dialog__form-grid">
                <label>
                  <span className="type-metadata">Local date</span>
                  <input
                    type="date"
                    value={scheduleLocalDate}
                    disabled={pending}
                    data-task-schedule-control="date"
                    onChange={(event) => setScheduleLocalDate(event.target.value)}
                    autoFocus
                  />
                </label>
                <label className="task-schedule-dialog__check">
                  <input
                    type="checkbox"
                    checked={scheduleUseTime}
                    disabled={pending || !scheduleLocalDate}
                    data-task-schedule-control="time-toggle"
                    onChange={(event) => setScheduleUseTime(event.target.checked)}
                  />
                  <span>Add a specific time</span>
                </label>
                {scheduleUseTime ? (
                  <label>
                    <span className="type-metadata">Local time</span>
                    <input
                      type="time"
                      value={scheduleLocalTime}
                      disabled={pending}
                      data-task-schedule-control="time"
                      onChange={(event) => setScheduleLocalTime(event.target.value)}
                    />
                  </label>
                ) : null}
                <p className="task-schedule-dialog__timezone type-metadata">
                  Timed schedules use {scheduleTimezone || displayTimezone}. Date-only schedules never round-trip through UTC.
                </p>
              </div>

              <div className="task-schedule-dialog__section-actions">
                <button
                  type="button"
                  className="task-schedule-dialog__primary motion-interactive"
                  data-task-schedule-control="save-schedule"
                  disabled={pending}
                  onClick={() => void saveSchedule()}
                >
                  Save schedule
                </button>
              </div>
            </section>

            <section className="task-schedule-dialog__section" aria-labelledby="task-recurrence-section-title">
              <div className="task-schedule-dialog__section-heading">
                <div>
                  <h3 id="task-recurrence-section-title">Repeat</h3>
                  <p className="type-metadata">
                    {generatedOccurrence
                      ? "This is a generated recurrence occurrence. Edit its individual schedule without creating a nested rule."
                      : existingRule
                        ? "Edit the recurring parent rule. Historical/modified children remain protected."
                        : "Create a recurring parent. Due children are materialized by the authoritative recurrence engine."}
                  </p>
                </div>
              </div>

              {!generatedOccurrence ? (
                <div className="task-schedule-dialog__recurrence-form">
                  <label>
                    <span className="type-metadata">Pattern</span>
                    <select
                      value={preset}
                      disabled={pending}
                      data-task-recurrence-control="preset"
                      onChange={(event) => setPreset(event.target.value as RecurrencePreset)}
                    >
                      <option value="daily">Every day</option>
                      <option value="weekdays">Every weekday</option>
                      <option value="weekly">Weekly on start weekday</option>
                      <option value="monthly">Monthly on start date</option>
                      <option value="custom">Custom</option>
                    </select>
                  </label>
                  <label>
                    <span className="type-metadata">Starts</span>
                    <input
                      type="date"
                      value={startsLocalDate}
                      disabled={pending}
                      data-task-recurrence-control="start-date"
                      onChange={(event) => setStartsLocalDate(event.target.value)}
                    />
                  </label>

                  {preset === "custom" ? (
                    <div className="task-schedule-dialog__custom-rule">
                      <label>
                        <span className="type-metadata">Every</span>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={customInterval}
                          disabled={pending}
                          data-task-recurrence-control="interval"
                          onChange={(event) => setCustomInterval(Number(event.target.value))}
                        />
                      </label>
                      <label>
                        <span className="type-metadata">Unit</span>
                        <select
                          value={customUnit}
                          disabled={pending}
                          data-task-recurrence-control="unit"
                          onChange={(event) => setCustomUnit(event.target.value as RecurrenceUnit)}
                        >
                          <option value="day">Day(s)</option>
                          <option value="week">Week(s)</option>
                          <option value="month">Month(s)</option>
                          <option value="year">Year(s)</option>
                        </select>
                      </label>

                      {customUnit === "month" ? (
                        <label>
                          <span className="type-metadata">Monthly selector</span>
                          <select
                            value={customMonthPattern}
                            disabled={pending}
                            data-task-recurrence-control="month-pattern"
                            onChange={(event) => setCustomMonthPattern(event.target.value as MonthPattern)}
                          >
                            <option value="date">Calendar date</option>
                            <option value="weekdays">Selected weekdays</option>
                          </select>
                        </label>
                      ) : null}

                      {customUnit === "month" && customMonthPattern === "date" ? (
                        <label>
                          <span className="type-metadata">Day of month</span>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={customMonthDay}
                            disabled={pending}
                            data-task-recurrence-control="month-day"
                            onChange={(event) => setCustomMonthDay(Number(event.target.value))}
                          />
                        </label>
                      ) : null}

                      {(customUnit === "week" || (customUnit === "month" && customMonthPattern === "weekdays")) ? (
                        <fieldset className="task-schedule-dialog__weekdays">
                          <legend className="type-metadata">Weekdays</legend>
                          {WEEKDAYS.map((weekday) => (
                            <label key={weekday.name} title={weekday.name}>
                              <input
                                type="checkbox"
                                checked={(customWeekdayMask & weekday.bit) !== 0}
                                disabled={pending}
                                data-task-recurrence-weekday={weekday.name.toLowerCase()}
                                onChange={(event) => {
                                  setCustomWeekdayMask((current) => event.target.checked
                                    ? current | weekday.bit
                                    : current & ~weekday.bit);
                                }}
                              />
                              <span>{weekday.label}</span>
                            </label>
                          ))}
                        </fieldset>
                      ) : null}
                    </div>
                  ) : null}

                  <label className="task-schedule-dialog__check">
                    <input
                      type="checkbox"
                      checked={recurrenceUseTime}
                      disabled={pending}
                      data-task-recurrence-control="time-toggle"
                      onChange={(event) => setRecurrenceUseTime(event.target.checked)}
                    />
                    <span>Use a local occurrence time</span>
                  </label>
                  {recurrenceUseTime ? (
                    <label>
                      <span className="type-metadata">Occurrence time</span>
                      <input
                        type="time"
                        value={recurrenceLocalTime}
                        disabled={pending}
                        data-task-recurrence-control="time"
                        onChange={(event) => setRecurrenceLocalTime(event.target.value)}
                      />
                    </label>
                  ) : null}
                  <p className="task-schedule-dialog__timezone type-metadata">
                    {recurrenceUseTime
                      ? `Timed occurrences use ${recurrenceTimezone}.`
                      : "Date-only occurrences retain their local calendar date."}
                  </p>

                  {existingRule ? (
                    <label className="task-schedule-dialog__check task-schedule-dialog__check--warning">
                      <input
                        type="checkbox"
                        checked={replaceExisting}
                        disabled={pending}
                        data-task-recurrence-control="replace-existing"
                        onChange={(event) => setReplaceExisting(event.target.checked)}
                      />
                      <span>Replace Existing Tasks — pristine generated children may be regenerated; modified/history-bearing children remain independent.</span>
                    </label>
                  ) : null}

                  <div className="task-schedule-dialog__section-actions">
                    {existingRule ? (
                      <button
                        type="button"
                        className="task-schedule-dialog__danger motion-interactive"
                        data-task-recurrence-control="remove"
                        disabled={pending}
                        onClick={() => void removeRecurrence()}
                      >
                        Remove recurrence
                      </button>
                    ) : <span />}
                    <button
                      type="button"
                      className="task-schedule-dialog__primary motion-interactive"
                      data-task-recurrence-control="save"
                      disabled={pending}
                      onClick={() => void saveRecurrence()}
                    >
                      {existingRule ? "Save recurrence" : "Create recurrence"}
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        ) : null}

        <footer className="task-schedule-dialog__footer">
          <button
            type="button"
            className="task-schedule-dialog__cancel motion-interactive"
            disabled={pending}
            onClick={onClose}
          >
            Cancel
          </button>
        </footer>
      </section>
    </div>
  );
}
