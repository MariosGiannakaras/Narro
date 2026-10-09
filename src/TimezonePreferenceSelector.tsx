import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import {
  isValidIanaTimezone,
  systemTimezone,
  timezoneOptionLabel,
  timezoneOptions,
} from "./timezoneSelection";
import "./timezonePreferenceSelector.css";

const OTHER_TIMEZONE = "__other_iana_timezone__";

type TimezonePreferenceSelectorProps = {
  timezone: string | null;
  disabled: boolean;
  onChange: (timezone: string) => void | Promise<boolean>;
};

export function TimezonePreferenceSelector({
  timezone,
  disabled,
  onChange,
}: TimezonePreferenceSelectorProps) {
  const localTimezone = systemTimezone();
  const referenceInstant = useMemo(() => new Date(), []);
  const choices = useMemo(
    () => timezoneOptions(timezone, localTimezone),
    [timezone, localTimezone],
  );
  const [editingCustom, setEditingCustom] = useState(false);
  const [draft, setDraft] = useState(timezone ?? "");

  useEffect(() => {
    if (!editingCustom) setDraft(timezone ?? "");
  }, [editingCustom, timezone]);

  const trimmed = draft.trim();
  const validDraft = trimmed.length > 0 && isValidIanaTimezone(trimmed);
  const unavailableSaved = timezone && !choices.includes(timezone) ? timezone : null;

  const closeCustom = () => {
    setEditingCustom(false);
    setDraft(timezone ?? "");
  };

  const saveCustom = () => {
    if (!validDraft || disabled) return;
    // Keep explicit saved identifiers, including valid aliases that are not
    // listed by supportedValuesOf. Never persist a displayed GMT offset.
    if (trimmed !== (timezone ?? "")) onChange(trimmed);
    setEditingCustom(false);
  };

  const onCustomKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeCustom();
    } else if (event.key === "Enter") {
      event.preventDefault();
      saveCustom();
    }
  };

  return (
    <div className="preference-timezone" data-preference-timezone-selector="true">
      <select
        aria-label="Display timezone"
        value={editingCustom ? OTHER_TIMEZONE : (timezone ?? "")}
        disabled={disabled}
        onChange={(event) => {
          const selected = event.currentTarget.value;
          if (selected === OTHER_TIMEZONE) {
            setDraft(timezone ?? "");
            setEditingCustom(true);
          } else {
            setEditingCustom(false);
            if (selected !== (timezone ?? "")) onChange(selected);
          }
        }}
      >
        <option value="">
          Automatic (Windows: {timezoneOptionLabel(localTimezone, referenceInstant)})
        </option>
        {unavailableSaved ? (
          <option value={unavailableSaved}>
            {unavailableSaved} (saved timezone unavailable)
          </option>
        ) : null}
        {choices.map((zone) => (
          <option key={zone} value={zone}>
            {timezoneOptionLabel(zone, referenceInstant)}
          </option>
        ))}
        <option value={OTHER_TIMEZONE}>Other IANA timezone…</option>
      </select>
      {editingCustom ? (
        <div className="preference-timezone__custom" data-preference-timezone-custom="true">
          <label className="type-metadata" htmlFor="preference-timezone-custom-input">
            Custom IANA timezone
          </label>
          <input
            id="preference-timezone-custom-input"
            type="text"
            className="preference-settings__text-input"
            aria-label="Custom IANA timezone"
            aria-invalid={!validDraft}
            value={draft}
            placeholder="Europe/Athens"
            disabled={disabled}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onKeyDown={onCustomKeyDown}
          />
          {!validDraft && trimmed.length > 0 ? (
            <span className="preference-timezone__error type-metadata" role="status">
              Enter a valid IANA timezone (for example Europe/Athens).
            </span>
          ) : null}
          <div className="preference-timezone__actions">
            <button type="button" className="motion-interactive" disabled={disabled}
              onClick={closeCustom}>Cancel</button>
            <button type="button" className="motion-interactive"
              disabled={disabled || !validDraft}
              onClick={saveCustom}>Use timezone</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
