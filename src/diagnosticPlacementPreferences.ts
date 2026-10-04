export type DiagnosticPlacementPreference = {
  selectedMonitorKey: string | null;
  focusPanelSide: "left" | "right";
};

export type DiagnosticPlacementPatch = {
  selectedMonitorKey: string;
  focusPanelSide: "left" | "right";
};

export type DiagnosticPlacementPreferences = {
  read: () => Promise<DiagnosticPlacementPreference>;
  write: (patch: DiagnosticPlacementPatch) => Promise<unknown>;
};

// DPI recovery and diagnostic positioning must read the same placement
// authority. Only these two settings are restored; unrelated writes survive.
export async function withDiagnosticPlacementPreferences<T>(
  preferences: DiagnosticPlacementPreferences,
  run: (select: (patch: DiagnosticPlacementPatch) => Promise<void>) => Promise<T>,
): Promise<T> {
  const original = await preferences.read();
  let primaryFailure: { value: unknown } | null = null;
  try {
    return await run(async (patch) => {
      await preferences.write(patch);
    });
  } catch (error: unknown) {
    primaryFailure = { value: error };
    throw error;
  } finally {
    try {
      await preferences.write({
        selectedMonitorKey: original.selectedMonitorKey ?? "",
        focusPanelSide: original.focusPanelSide,
      });
    } catch (restoration: unknown) {
      const detail = restoration instanceof Error ? restoration.message : String(restoration);
      if (primaryFailure) {
        const failure = primaryFailure.value;
        const primary = failure instanceof Error ? failure.message : String(failure);
        throw Object.assign(new Error(
          `Diagnostic placement failed: ${primary}; restoring placement preferences also failed: ${detail}`,
        ), { errors: [failure, restoration] });
      }
      throw Object.assign(new Error(
        `Diagnostic placement succeeded, but restoring placement preferences failed: ${detail}`,
      ), { errors: [restoration] });
    }
  }
}
