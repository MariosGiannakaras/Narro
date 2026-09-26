import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import {
  applyNewerShortcutDiagnostics,
  formatInvokeError,
  type ShortcutDiagnostics,
  type ShortcutErrorSnapshot,
} from "./diagnosticApi";
import {
  getGlobalShortcutSettings,
  setGlobalShortcutEnabled,
  type GlobalShortcutKind,
  type GlobalShortcutSettingsSnapshot,
} from "./globalShortcutSettingsApi";
import "./windowsShortcutSettingsPanel.css";

type ShortcutRow = {
  kind: GlobalShortcutKind;
  label: string;
  description: string;
  chord: string;
};

type WindowsShortcutSettingsPanelViewProps = {
  snapshot: GlobalShortcutSettingsSnapshot | null;
  loading?: boolean;
  pendingKind?: GlobalShortcutKind | null;
  error?: string | null;
  onChange: (kind: GlobalShortcutKind, enabled: boolean) => void;
};

const SHORTCUT_ROWS: ShortcutRow[] = [
  {
    kind: "goToNarro",
    label: "Go to Narro",
    description: "Bring the Narro Main window to the front from any Windows app.",
    chord: "Ctrl + Shift + B",
  },
  {
    kind: "toggleFocusMode",
    label: "Alternate Focus Mode",
    description: "Switch the active Focus surface between Panel and Floating Timer.",
    chord: "Ctrl + Shift + T",
  },
  {
    kind: "findFocusTimer",
    label: "Find focus timer",
    description: "Bring attention to the Floating Timer when Focus is active.",
    chord: "Ctrl + Shift + P",
  },
];

function preferenceEnabled(snapshot: GlobalShortcutSettingsSnapshot, kind: GlobalShortcutKind): boolean {
  switch (kind) {
    case "goToNarro":
      return snapshot.goToNarroEnabled;
    case "toggleFocusMode":
      return snapshot.toggleFocusModeEnabled;
    case "findFocusTimer":
      return snapshot.findFocusTimerEnabled;
  }
}

function registered(diagnostics: ShortcutDiagnostics, kind: GlobalShortcutKind): boolean {
  switch (kind) {
    case "goToNarro":
      return diagnostics.registered;
    case "toggleFocusMode":
      return diagnostics.focusToggleRegistered;
    case "findFocusTimer":
      return diagnostics.findTimerRegistered;
  }
}

function lastError(
  diagnostics: ShortcutDiagnostics,
  kind: GlobalShortcutKind,
): ShortcutErrorSnapshot | null {
  switch (kind) {
    case "goToNarro":
      return diagnostics.lastError;
    case "toggleFocusMode":
      return diagnostics.focusToggleLastError;
    case "findFocusTimer":
      return diagnostics.findTimerLastError;
  }
}

function availabilityLabel(
  snapshot: GlobalShortcutSettingsSnapshot,
  kind: GlobalShortcutKind,
): string {
  if (!preferenceEnabled(snapshot, kind)) return "Disabled";
  if (registered(snapshot.diagnostics, kind)) return "Registered";
  const error = lastError(snapshot.diagnostics, kind);
  return error?.code === "SHORTCUT_CONFLICT" ? "Shortcut conflict" : "Unavailable";
}

export function WindowsShortcutSettingsPanelView({
  snapshot,
  loading = false,
  pendingKind = null,
  error = null,
  onChange,
}: WindowsShortcutSettingsPanelViewProps) {
  if (loading) {
    return (
      <section className="theme-settings__section windows-shortcuts" aria-labelledby="windows-shortcuts-title">
        <div className="theme-settings__section-heading">
          <div>
            <p className="theme-settings__section-kicker type-metadata">Windows</p>
            <h2 id="windows-shortcuts-title" className="type-section-title">Shortcuts</h2>
          </div>
          <span className="theme-settings__saving" role="status">Loading…</span>
        </div>
      </section>
    );
  }

  return (
    <section
      className="theme-settings__section windows-shortcuts"
      data-windows-shortcut-settings="true"
      aria-labelledby="windows-shortcuts-title"
    >
      <div className="theme-settings__section-heading">
        <div>
          <p className="theme-settings__section-kicker type-metadata">Windows</p>
          <h2 id="windows-shortcuts-title" className="type-section-title">Shortcuts</h2>
        </div>
        {pendingKind ? <span className="theme-settings__saving" role="status">Saving…</span> : null}
      </div>

      <p className="windows-shortcuts__intro type-metadata">
        Global shortcuts work both inside and outside Narro. Disable any chord you do not want Narro to register.
      </p>

      {snapshot ? (
        <div className="windows-shortcuts__rows">
          {SHORTCUT_ROWS.map((row) => {
            const enabled = preferenceEnabled(snapshot, row.kind);
            const isRegistered = registered(snapshot.diagnostics, row.kind);
            const rowError = lastError(snapshot.diagnostics, row.kind);
            const pending = pendingKind === row.kind;
            return (
              <div
                key={row.kind}
                className="windows-shortcuts__row"
                data-global-shortcut-kind={row.kind}
                data-global-shortcut-enabled={enabled ? "true" : "false"}
                data-global-shortcut-registered={isRegistered ? "true" : "false"}
              >
                <div className="windows-shortcuts__copy">
                  <strong>{row.label}</strong>
                  <span className="type-metadata">{row.description}</span>
                  <span
                    className={"windows-shortcuts__status type-metadata" + (enabled && !isRegistered ? " windows-shortcuts__status--error" : "")}
                    role={enabled && !isRegistered ? "alert" : "status"}
                  >
                    {availabilityLabel(snapshot, row.kind)}
                    {enabled && !isRegistered && rowError ? " — " + rowError.message : ""}
                  </span>
                </div>

                <div className="windows-shortcuts__controls">
                  <kbd className="windows-shortcuts__keycap">{row.chord}</kbd>
                  <label className="windows-shortcuts__toggle">
                    <span className="sr-only">Enable {row.label}</span>
                    <input
                      type="checkbox"
                      checked={enabled}
                      disabled={pendingKind !== null}
                      aria-busy={pending || undefined}
                      onChange={(event) => onChange(row.kind, event.currentTarget.checked)}
                    />
                    <span aria-hidden="true" />
                  </label>
                  {enabled && !isRegistered ? (
                    <button
                      type="button"
                      className="windows-shortcuts__retry motion-interactive"
                      disabled={pendingKind !== null}
                      onClick={() => onChange(row.kind, true)}
                    >
                      Retry
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="windows-shortcuts__unavailable" role="alert">
          Shortcut settings are unavailable. Retry after the settings state can be read.
        </div>
      )}

      {error ? <div className="theme-settings__error" role="alert">{error}</div> : null}
    </section>
  );
}

export function WindowsShortcutSettingsPanel() {
  const [snapshot, setSnapshot] = useState<GlobalShortcutSettingsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingKind, setPendingKind] = useState<GlobalShortcutKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const latest = await getGlobalShortcutSettings();
    setSnapshot(latest);
    return latest;
  }

  useEffect(() => {
    let disposed = false;
    let stopListening: (() => void) | undefined;

    void getGlobalShortcutSettings()
      .then((latest) => {
        if (!disposed) {
          setSnapshot(latest);
          setError(null);
          setLoading(false);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setError(formatInvokeError(failure));
          setLoading(false);
        }
      });

    void listen<ShortcutDiagnostics>("shortcut-diagnostic-changed", (event) => {
      if (disposed) return;
      setSnapshot((current) => current
        ? {
            ...current,
            diagnostics: applyNewerShortcutDiagnostics(current.diagnostics, event.payload),
          }
        : current);
    })
      .then((unlisten) => {
        if (disposed) unlisten();
        else stopListening = unlisten;
      })
      .catch((failure: unknown) => {
        if (!disposed) setError(formatInvokeError(failure));
      });

    return () => {
      disposed = true;
      stopListening?.();
    };
  }, []);

  async function change(kind: GlobalShortcutKind, enabled: boolean) {
    if (pendingKind) return;
    setPendingKind(kind);
    setError(null);
    try {
      const latest = await setGlobalShortcutEnabled(kind, enabled);
      setSnapshot(latest);
    } catch (failure: unknown) {
      const primary = formatInvokeError(failure);
      try {
        await refresh();
        setError(primary);
      } catch (refreshFailure: unknown) {
        setError(primary + " | Shortcut status refresh failed: " + formatInvokeError(refreshFailure));
      }
    } finally {
      setPendingKind(null);
    }
  }

  return (
    <WindowsShortcutSettingsPanelView
      snapshot={snapshot}
      loading={loading}
      pendingKind={pendingKind}
      error={error}
      onChange={(kind, enabled) => void change(kind, enabled)}
    />
  );
}
