export type InAppShortcut =
  | "create-task"
  | "start-break"
  | "pause-resume"
  | "skip-task"
  | "finish-task"
  | "notes"
  | "search";

export type ShortcutChord = {
  key: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  repeat?: boolean;
};

export function resolveInAppShortcut(chord: ShortcutChord): InAppShortcut | null {
  if (chord.repeat || chord.metaKey || chord.shiftKey || !chord.ctrlKey) return null;

  const key = chord.key.toLowerCase();
  if (!chord.altKey) return key === "f" ? "search" : null;

  switch (key) {
    case "t":
      return "create-task";
    case "b":
      return "start-break";
    case "p":
      return "pause-resume";
    case "s":
      return "skip-task";
    case "f":
      return "finish-task";
    case "n":
      return "notes";
    default:
      return null;
  }
}

export function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']"));
}
