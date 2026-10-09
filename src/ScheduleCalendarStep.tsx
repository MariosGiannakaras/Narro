import { useEffect, useState } from "react";
import { formatVisibleDate } from "./dateTimeFormat";
import { calendarMonthDays, calendarMonthLabel, shiftCalendarMonth, validCalendarDate } from "./scheduleCalendar";

type Props = {
  selectedDate: string;
  todayDate: string | null;
  disabled: boolean;
  onSelect: (date: string) => void;
};

const MONDAY_FIRST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ScheduleCalendarStep({ selectedDate, todayDate, disabled, onSelect }: Props) {
  const anchor = validCalendarDate(selectedDate) ? selectedDate
    : todayDate && validCalendarDate(todayDate) ? todayDate
      : new Date().toISOString().slice(0, 10);
  const [month, setMonth] = useState(anchor.slice(0, 7));
  useEffect(() => setMonth(anchor.slice(0, 7)), [anchor]);
  const cells = calendarMonthDays(month);
  return (
    <div className="task-schedule-dialog__calendar" data-task-schedule-calendar="true">
      <div className="task-schedule-dialog__calendar-navigation">
        <button
          type="button"
          aria-label="Previous calendar month"
          disabled={disabled || month === "0001-01"}
          onClick={() => setMonth((current) => shiftCalendarMonth(current, -1))}
        >‹</button>
        <h3 className="type-section-title">{calendarMonthLabel(month)}</h3>
        <button
          type="button"
          aria-label="Next calendar month"
          disabled={disabled || month === "9999-12"}
          onClick={() => setMonth((current) => shiftCalendarMonth(current, 1))}
        >›</button>
      </div>
      <div className="task-schedule-dialog__calendar-grid" role="group" aria-label="Choose schedule date">
        {MONDAY_FIRST.map((day) => (
          <span key={day} className="task-schedule-dialog__calendar-weekday type-metadata" aria-hidden="true">{day}</span>
        ))}
        {cells.map((cell) => (
          <button
            key={cell.date}
            type="button"
            className="task-schedule-dialog__calendar-day motion-interactive"
            data-calendar-day={cell.date}
            data-calendar-selected={selectedDate === cell.date ? "true" : "false"}
            data-calendar-today={todayDate === cell.date ? "true" : "false"}
            data-calendar-outside-month={!cell.isCurrentMonth ? "true" : "false"}
            aria-label={formatVisibleDate(cell.date)}
            aria-pressed={selectedDate === cell.date}
            disabled={disabled}
            onClick={() => onSelect(cell.date)}
          >
            {cell.day}
          </button>
        ))}
      </div>
    </div>
  );
}
