from pathlib import Path

path = Path("src/App.tsx")
text = path.read_text(encoding="utf-8")
old = '''  async function setAutostartEnabled(enabled: boolean) {
    try {
      const result = await invoke<AutostartStatus>(
        enabled ? "autostart_enable" : "autostart_disable",
      );
      setAutostartStatus(result);
      setError(null);
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
      await refreshAutostartStatus();
    }
  }
'''
new = '''  async function setAutostartEnabled(enabled: boolean) {
    try {
      const result = await invoke<AutostartStatus>(
        enabled ? "autostart_enable" : "autostart_disable",
      );
      setAutostartStatus(result);
      setError(null);
    } catch (failure: unknown) {
      const primaryFailure = formatInvokeError(failure);
      try {
        const refreshed = await invoke<AutostartStatus>("autostart_status");
        setAutostartStatus(refreshed);
        setError(primaryFailure);
      } catch (refreshFailure: unknown) {
        setError(
          `${primaryFailure} | Autostart status refresh also failed: ${formatInvokeError(refreshFailure)}`,
        );
      }
    }
  }
'''
if text.count(old) != 1:
    raise SystemExit("expected exactly one autostart setter block")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
