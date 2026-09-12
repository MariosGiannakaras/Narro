import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { listen } from "@tauri-apps/api/event";
import { formatInvokeError } from "./diagnosticApi";
import {
  getThemePreference,
  isThemePreference,
  setThemePreference,
  THEME_PREFERENCE_CHANGED_EVENT,
  type ThemePreference,
} from "./themeApi";

type ThemeRuntimeValue = {
  theme: ThemePreference;
  pending: boolean;
  error: string | null;
  saveTheme: (theme: ThemePreference) => Promise<void>;
};

const ThemeRuntimeContext = createContext<ThemeRuntimeValue | null>(null);

function rootTheme(): ThemePreference {
  const candidate = document.documentElement.dataset.theme;
  return isThemePreference(candidate) ? candidate : "system";
}

export function applyThemePreference(theme: ThemePreference) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeRuntimeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemePreference>(rootTheme);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let stopListening: (() => void) | undefined;
    let observedEvent = false;

    applyThemePreference(theme);

    const install = async () => {
      try {
        const unlisten = await listen<ThemePreference>(
          THEME_PREFERENCE_CHANGED_EVENT,
          (event) => {
            if (disposed) return;
            if (!isThemePreference(event.payload)) {
              setError("[THEME_PREFERENCE_FAILED] Received an invalid theme preference event.");
              return;
            }
            observedEvent = true;
            applyThemePreference(event.payload);
            setTheme(event.payload);
            setError(null);
          },
        );
        if (disposed) {
          unlisten();
          return;
        }
        stopListening = unlisten;
      } catch (failure: unknown) {
        if (!disposed) {
          setError(formatInvokeError(failure));
        }
      }

      try {
        const persisted = await getThemePreference();
        if (!disposed && !observedEvent) {
          applyThemePreference(persisted);
          setTheme(persisted);
          setError(null);
        }
      } catch (failure: unknown) {
        if (!disposed) {
          setError(formatInvokeError(failure));
        }
      }
    };

    void install();
    return () => {
      disposed = true;
      stopListening?.();
    };
    // The runtime installs once. Later theme changes arrive through saveTheme or the Rust event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveTheme(next: ThemePreference) {
    if (pending || next === theme) return;
    setPending(true);
    setError(null);
    try {
      const committed = await setThemePreference(next);
      applyThemePreference(committed);
      setTheme(committed);
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
      applyThemePreference(theme);
    } finally {
      setPending(false);
    }
  }

  const value = useMemo<ThemeRuntimeValue>(
    () => ({ theme, pending, error, saveTheme }),
    [theme, pending, error],
  );

  return <ThemeRuntimeContext.Provider value={value}>{children}</ThemeRuntimeContext.Provider>;
}

export function useThemeRuntime(): ThemeRuntimeValue {
  const value = useContext(ThemeRuntimeContext);
  if (!value) {
    throw new Error("useThemeRuntime must be used inside ThemeRuntimeProvider");
  }
  return value;
}
