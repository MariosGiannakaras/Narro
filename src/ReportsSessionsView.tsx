import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from "react";
import { Menu, MenuItem } from "./overlayPrimitives";
import type { ReportsCalendarMonth } from "./ReportsOverviewView";
import type { ReportDatePreset } from "./reportOverviewPresentation";
import type { SearchPaletteTaskResult } from "./searchPaletteApi";
import "./reportsOverview.css";
import "./reportsSessions.css";

export type ReportsSessionViewRow = {
  id: string;
  taskId: string | null;
  taskTitle: string;
  listTitle: string | null;
  listColor?: string | null;
  kind: "work" | "break";
  ordinalLabel: string | null;
  dateKey: string;
  dateLabel: string;
  startLabel: string;
  endLabel: string;
  endTimeValue: string;
  durationLabel: string;
  updatedAt: string;
  initiallyEditing?: boolean;
};

export type ReportsSessionGroup = {
  dateKey: string;
  label: string;
  rows: ReportsSessionViewRow[];
};

export type ReportsSessionsListOption = {
  id: string | null;
  title: string;
  color?: string | null;
};

export type ReportsSessionsSummaryView = {
  totalTime: string;
  totalTasks: string;
  totalSessions: string;
};

export type ReportsTaskDetailView = {
  taskId: string;
  taskTitle: string;
  listTitle: string;
  listColor?: string | null;
  totalTime: string;
  totalSessions: string;
  rows: ReportsSessionViewRow[];
};

export type ReportsAddSessionDraft = {
  taskId: string;
  dateKey: string;
  startTime: string;
  endTime: string;
  durationLabel: string;
};

type DateRangePickerProps = {
  months: ReportsCalendarMonth[];
  onSelectPreset: (preset: ReportDatePreset) => void;
  onSelectDay: (dateKey: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onCancel: () => void;
  onApply: () => void;
};

function DateRangePicker({
  months,
  onSelectPreset,
  onSelectDay,
  onPreviousMonth,
  onNextMonth,
  onCancel,
  onApply,
}: DateRangePickerProps) {
  return (
    <div
      className="reports-overview__date-popover"
      role="dialog"
      aria-label="Choose report date range"
      data-report-date-picker="true"
    >
      <div className="reports-overview__date-presets">
        {(["Today", "Yesterday", "This week", "Last 30 days", "Last 60 days", "Last 90 days"] as const).map((preset) => (
          <button type="button" key={preset} onClick={() => onSelectPreset(preset)}>{preset}</button>
        ))}
      </div>
      <div className="reports-overview__calendars">
        {months.map((month, monthIndex) => (
          <section className="reports-overview__calendar" key={month.label}>
            <header>
              <button
                type="button"
                aria-label="Previous month"
                onClick={onPreviousMonth}
                disabled={monthIndex !== 0}
              >‹</button>
              <strong>{month.label}</strong>
              <button
                type="button"
                aria-label="Next month"
                onClick={onNextMonth}
                disabled={monthIndex !== months.length - 1}
              >›</button>
            </header>
            <div className="reports-overview__weekdays" aria-hidden="true">
              {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>
            <div className="reports-overview__calendar-days">
              {month.weeks.flat().map((day) => (
                <button
                  type="button"
                  key={day.key}
                  className={[
                    day.muted ? "is-muted" : "",
                    day.selected ? "is-selected" : "",
                    day.edge === "start" ? "is-start" : "",
                    day.edge === "end" ? "is-end" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => day.dateKey && onSelectDay(day.dateKey)}
                  disabled={!day.dateKey}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="reports-overview__date-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="button" className="reports-overview__date-apply" onClick={onApply}>Apply</button>
      </div>
    </div>
  );
}

function SessionRow({
  row,
  pending,
  onCommitEndTime,
  onOpenDetail,
  onDelete,
  showDetailAction = true,
}: {
  row: ReportsSessionViewRow;
  pending: boolean;
  onCommitEndTime: (row: ReportsSessionViewRow, endTime: string) => Promise<boolean>;
  onOpenDetail: (taskId: string) => void;
  onDelete: (row: ReportsSessionViewRow) => void;
  showDetailAction?: boolean;
}) {
  const [editing, setEditing] = useState(Boolean(row.initiallyEditing));
  const [endTime, setEndTime] = useState(row.endTimeValue);

  const commit = async () => {
    if (endTime === row.endTimeValue) {
      setEditing(false);
      return;
    }
    const ok = await onCommitEndTime(row, endTime);
    if (ok) setEditing(false);
  };

  return (
    <article
      className="reports-sessions__row"
      data-report-session-row={row.id}
      data-session-kind={row.kind}
    >
      <div className="reports-sessions__identity">
        <strong>{row.taskTitle}</strong>
        <span className="reports-sessions__list-chip">
          <i style={{ backgroundColor: row.listColor ?? "var(--color-accent-solid)" }} aria-hidden="true" />
          {row.listTitle ?? (row.kind === "break" ? "Break" : "Unknown list")}
        </span>
      </div>
      <span className="reports-sessions__ordinal">
        {row.ordinalLabel ?? (row.kind === "break" ? "Break" : "—")}
      </span>
      <span className="reports-sessions__date">{row.dateLabel}</span>
      <span className="reports-sessions__time">{row.startLabel}</span>
      <span className="reports-sessions__arrow" aria-hidden="true">→</span>
      <span className="reports-sessions__time reports-sessions__time--end">
        {editing ? (
          <span className="reports-sessions__inline-editor">
            <input
              type="time"
              aria-label={`End time for ${row.taskTitle}`}
              value={endTime}
              disabled={pending}
              onChange={(event) => setEndTime(event.target.value)}
            />
            <button
              type="button"
              className="reports-sessions__inline-confirm"
              aria-label="Save session end time"
              disabled={pending}
              onClick={() => void commit()}
            >✓</button>
          </span>
        ) : (
          <button
            type="button"
            className="reports-sessions__editable-time"
            onClick={() => {
              setEndTime(row.endTimeValue);
              setEditing(true);
            }}
            disabled={pending}
          >
            {row.endLabel}
          </button>
        )}
      </span>
      <strong className="reports-sessions__duration">{row.durationLabel}</strong>
      <Menu
        triggerLabel={`Session actions for ${row.taskTitle}`}
        align="end"
        trigger={<span aria-hidden="true">•••</span>}
      >
        {showDetailAction ? (
          <MenuItem
            disabled={pending || row.taskId === null}
            onSelect={() => row.taskId && onOpenDetail(row.taskId)}
          >
            Edit
          </MenuItem>
        ) : null}
        <MenuItem destructive disabled={pending} onSelect={() => onDelete(row)}>
          Delete
        </MenuItem>
      </Menu>
    </article>
  );
}

export function ReportTaskSessionsDialog({
  detail,
  pendingSessionId,
  onClose,
  onAddSession,
  onCommitEndTime,
  onDelete,
}: {
  detail: ReportsTaskDetailView;
  pendingSessionId: string | null;
  onClose: () => void;
  onAddSession: (taskId: string) => void;
  onCommitEndTime: (row: ReportsSessionViewRow, endTime: string) => Promise<boolean>;
  onDelete: (row: ReportsSessionViewRow) => void;
}) {
  return (
    <div className="reports-sessions__backdrop" role="presentation" data-report-session-detail="true">
      <section className="reports-sessions__detail" role="dialog" aria-modal="true" aria-labelledby="report-task-sessions-title">
        <header className="reports-sessions__detail-header">
          <div>
            <h2 id="report-task-sessions-title">{detail.taskTitle}</h2>
            <span className="reports-sessions__list-chip">
              <i style={{ backgroundColor: detail.listColor ?? "var(--color-accent-solid)" }} aria-hidden="true" />
              {detail.listTitle}
            </span>
          </div>
          <div className="reports-sessions__detail-summary">
            <strong>{detail.totalSessions} Sessions</strong>
            <span>{detail.totalTime}</span>
          </div>
          <button type="button" aria-label="Close task session detail" onClick={onClose}>×</button>
        </header>
        <div className="reports-sessions__detail-actions">
          <button type="button" className="reports-sessions__primary" onClick={() => onAddSession(detail.taskId)}>
            + Add Session
          </button>
        </div>
        <div className="reports-sessions__detail-list">
          {detail.rows.map((row) => (
            <SessionRow
              key={row.id}
              row={row}
              pending={pendingSessionId === row.id}
              onCommitEndTime={onCommitEndTime}
              onOpenDetail={() => undefined}
              onDelete={onDelete}
              showDetailAction={false}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function focusableDialogElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("hidden"));
}

export function ReportAddSessionDialog({
  tasks,
  draft,
  pending,
  error,
  onDraftChange,
  onClose,
  onCommit,
}: {
  tasks: SearchPaletteTaskResult[];
  draft: ReportsAddSessionDraft;
  pending: boolean;
  error: string | null;
  onDraftChange: (next: ReportsAddSessionDraft) => void;
  onClose: () => void;
  onCommit: () => void;
}) {
  const [query, setQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const filtered = tasks.filter((task) => task.title.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = tasks.find((task) => task.id === draft.taskId) ?? null;

  const dialogRef = useRef<HTMLElement>(null);
  const pickerAnchorRef = useRef<HTMLDivElement>(null);
  const pickerTriggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    pickerTriggerRef.current?.focus();
    return () => openerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (pending) {
      setPickerOpen(false);
      dialogRef.current?.focus();
    }
  }, [pending]);

  useEffect(() => {
    if (!pickerOpen || pending) return;
    searchInputRef.current?.focus();
    const onOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !pickerAnchorRef.current?.contains(event.target)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  }, [pickerOpen, pending]);

  function closePicker() {
    setPickerOpen(false);
    pickerTriggerRef.current?.focus();
  }

  function chooseTask(taskId: string) {
    if (pending) return;
    onDraftChange({ ...draft, taskId });
    setQuery("");
    closePicker();
  }

  function requestClose() {
    if (!pending) onClose();
  }

  function handleAddSessionKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (pickerOpen && !pending) closePicker();
      else requestClose();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;

    const focusable = focusableDialogElements(dialogRef.current);
    if (focusable.length === 0) {
      event.preventDefault();
      dialogRef.current.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (!dialogRef.current.contains(active) || active === dialogRef.current) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="reports-sessions__backdrop" role="presentation" data-report-add-session="true">
      <section
        ref={dialogRef}
        className="reports-sessions__add-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-add-session-title"
        tabIndex={-1}
        onKeyDown={handleAddSessionKeyDown}
      >
        <header>
          <h2 id="report-add-session-title">Add Session</h2>
          <button type="button" aria-label="Close Add Session" disabled={pending} onClick={requestClose}>×</button>
        </header>

        <div className="reports-sessions__field reports-sessions__task-selector" ref={pickerAnchorRef}>
          <span>Task</span>
          <button
            ref={pickerTriggerRef}
            type="button"
            className="reports-sessions__task-selector-trigger motion-interactive"
            data-report-task-selector-trigger="true"
            aria-label="Select task for session"
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
            disabled={pending}
            onClick={() => setPickerOpen((current) => !current)}
          >
            <span>{selected?.title ?? "Select tasks..."}</span>
            <span aria-hidden="true">⌄</span>
          </button>
          {pickerOpen && !pending ? (
            <div className="reports-sessions__task-selector-popover" data-report-task-picker-open="true">
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Select tasks..."
                aria-label="Search recent tasks"
                value={query}
                disabled={pending}
                onChange={(event) => setQuery(event.target.value)}
              />
              <div className="reports-sessions__task-picker" role="listbox" aria-label="Recent Tasks">
                <strong>Recent Tasks</strong>
                {filtered.slice(0, 12).map((task) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={draft.taskId === task.id}
                    key={task.id}
                    disabled={pending}
                    onClick={() => chooseTask(task.id)}
                  >
                    <span>{task.title}</span>
                    <small>{task.listTitle}</small>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {selected ? (
          <div className="reports-sessions__add-fields">
            <p className="reports-sessions__selected-task">
              <strong>{selected.title}</strong>
              <span>{selected.listTitle}</span>
            </p>
            <label className="reports-sessions__field">
              <span>Date</span>
              <input
                type="date"
                value={draft.dateKey}
                disabled={pending}
                onChange={(event) => onDraftChange({ ...draft, dateKey: event.target.value })}
              />
            </label>
            <label className="reports-sessions__field">
              <span>Start</span>
              <input
                type="time"
                value={draft.startTime}
                disabled={pending}
                onChange={(event) => onDraftChange({ ...draft, startTime: event.target.value })}
              />
            </label>
            <label className="reports-sessions__field">
              <span>End</span>
              <input
                type="time"
                value={draft.endTime}
                disabled={pending}
                onChange={(event) => onDraftChange({ ...draft, endTime: event.target.value })}
              />
            </label>
            <p className="reports-sessions__computed-duration">Duration <strong>{draft.durationLabel}</strong></p>
          </div>
        ) : null}

        {error ? <p className="reports-sessions__error" role="alert">{error}</p> : null}
        <footer>
          <button type="button" disabled={pending} onClick={requestClose}>Cancel</button>
          <button
            type="button"
            className="reports-sessions__primary"
            disabled={pending || !draft.taskId}
            onClick={onCommit}
          >
            {pending ? "Adding…" : "Add Session"}
          </button>
        </footer>
      </section>
    </div>
  );
}

export type ReportsSessionsViewProps = {
  summary: ReportsSessionsSummaryView;
  groups: ReportsSessionGroup[];
  listLabel: string;
  selectedListIds: string[];
  listOptions: ReportsSessionsListOption[];
  rangeLabel: string;
  calendarMonths: ReportsCalendarMonth[];
  showBreakSessions: boolean;
  listFilterOpen: boolean;
  datePickerOpen: boolean;
  pendingSessionId: string | null;
  exportPending?: boolean;
  onBack?: () => void;
  onOpenOverview: () => void;
  onOpenAddSession: () => void;
  onExport?: () => void;
  onToggleBreakSessions: () => void;
  onToggleListFilter: () => void;
  onToggleListSelection: (listId: string | null) => void;
  onToggleDatePicker: () => void;
  onSelectDatePreset: (preset: ReportDatePreset) => void;
  onSelectCalendarDay: (dateKey: string) => void;
  onPreviousCalendarMonth: () => void;
  onNextCalendarMonth: () => void;
  onCancelDateRange: () => void;
  onApplyDateRange: () => void;
  onCommitEndTime: (row: ReportsSessionViewRow, endTime: string) => Promise<boolean>;
  onOpenDetail: (taskId: string) => void;
  onDelete: (row: ReportsSessionViewRow) => void;
};

export function ReportsSessionsView({
  summary,
  groups,
  listLabel,
  selectedListIds,
  listOptions,
  rangeLabel,
  calendarMonths,
  showBreakSessions,
  listFilterOpen,
  datePickerOpen,
  pendingSessionId,
  exportPending = false,
  onBack,
  onOpenOverview,
  onOpenAddSession,
  onExport,
  onToggleBreakSessions,
  onToggleListFilter,
  onToggleListSelection,
  onToggleDatePicker,
  onSelectDatePreset,
  onSelectCalendarDay,
  onPreviousCalendarMonth,
  onNextCalendarMonth,
  onCancelDateRange,
  onApplyDateRange,
  onCommitEndTime,
  onOpenDetail,
  onDelete,
}: ReportsSessionsViewProps) {
  return (
    <section className="reports-overview reports-sessions" data-reports-sessions="true">
      <header className="reports-overview__header">
        <div className="reports-overview__title-row">
          <button type="button" className="reports-overview__back" onClick={onBack}>← Back</button>
          <h1>Reports</h1>
        </div>
        <div className="reports-sessions__top-actions">
          <button type="button" className="reports-sessions__primary" onClick={onOpenAddSession}>+ Add Session</button>
          <button
            type="button"
            className="reports-overview__export"
            onClick={onExport}
            disabled={exportPending || !onExport}
            aria-busy={exportPending}
          >
            Export .csv
          </button>
        </div>
      </header>

      <div className="reports-overview__tabs" role="tablist" aria-label="Reports">
        <button type="button" role="tab" aria-selected="false" onClick={onOpenOverview}>Overview</button>
        <button type="button" role="tab" aria-selected="true">Sessions <span>Beta</span></button>
      </div>

      <div className="reports-sessions__filters">
        <div className="reports-overview__filter-anchor">
          <button
            type="button"
            className="reports-overview__filter-button"
            aria-haspopup="listbox"
            aria-expanded={listFilterOpen}
            onClick={onToggleListFilter}
            data-report-session-list-filter="true"
          >
            <span className="reports-overview__list-glyph" aria-hidden="true">N</span>
            {listLabel}
            <span aria-hidden="true">⌄</span>
          </button>
          {listFilterOpen ? (
            <div
              className="reports-overview__list-menu"
              role="listbox"
              aria-multiselectable="true"
              aria-label="Filter Sessions by list"
            >
              {listOptions.map((option) => {
                const selected = option.id === null
                  ? selectedListIds.length === 0
                  : selectedListIds.includes(option.id);
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    key={option.id ?? "all"}
                    onClick={() => onToggleListSelection(option.id)}
                  >
                    <span className="reports-overview__list-check" aria-hidden="true">{selected ? "✓" : ""}</span>
                    <i style={{ backgroundColor: option.color ?? "var(--color-accent-solid)" }} aria-hidden="true" />
                    {option.title}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="reports-sessions__break-filter"
          aria-pressed={!showBreakSessions}
          onClick={onToggleBreakSessions}
        >
          <span aria-hidden="true">◉</span>
          {showBreakSessions ? "Hide Break sessions" : "Show Break sessions"}
        </button>

        <div className="reports-overview__date-anchor">
          <button
            type="button"
            className="reports-overview__range-button"
            aria-haspopup="dialog"
            aria-expanded={datePickerOpen}
            onClick={onToggleDatePicker}
            data-report-session-date-range="true"
          >
            <span aria-hidden="true">▣</span>
            {rangeLabel}
          </button>
          {datePickerOpen ? (
            <DateRangePicker
              months={calendarMonths}
              onSelectPreset={onSelectDatePreset}
              onSelectDay={onSelectCalendarDay}
              onPreviousMonth={onPreviousCalendarMonth}
              onNextMonth={onNextCalendarMonth}
              onCancel={onCancelDateRange}
              onApply={onApplyDateRange}
            />
          ) : null}
        </div>
      </div>

      <div className="reports-sessions__summary" data-report-sessions-summary="true">
        {[
          ["Total Time", summary.totalTime],
          ["Total Tasks", summary.totalTasks],
          ["Total Sessions", summary.totalSessions],
        ].map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="reports-sessions__groups" data-report-session-groups="true">
        {groups.map((group) => (
          <section className="reports-sessions__group" key={group.dateKey}>
            <header><strong>{group.label}</strong><span>{group.rows.length} {group.rows.length === 1 ? "session" : "sessions"}</span></header>
            {group.rows.map((row) => (
              <SessionRow
                key={row.id}
                row={row}
                pending={pendingSessionId === row.id}
                onCommitEndTime={onCommitEndTime}
                onOpenDetail={onOpenDetail}
                onDelete={onDelete}
              />
            ))}
          </section>
        ))}
      </div>
    </section>
  );
}
