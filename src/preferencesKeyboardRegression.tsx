import { flushSync } from "react-dom";

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Preferences keyboard: ${message}`);
}
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** Actual parent + ThemeSettingsPanelView + disabled/async save boundary.
 * Body-targeted keys reproduce native Chromium's lost focused-control path. */
export async function runPreferencesKeyboardRegression(settleSave: (failed: boolean) => void) {
  const dialog = () => document.querySelector<HTMLElement>('[data-preferences-dialog="true"]');
  const close = () => document.querySelector<HTMLButtonElement>('[data-preferences-close="true"]')!;
  const opener = () => document.querySelector<HTMLButtonElement>('[data-preferences-fixture-reopen="true"]')!;
  const key = (value: string, shiftKey = false) => {
    const event = new KeyboardEvent('keydown', { key: value, shiftKey, bubbles: true, cancelable: true });
    flushSync(() => (document.activeElement ?? document.body).dispatchEvent(event));
    return event;
  };
  const reopen = async () => {
    opener().focus();
    flushSync(() => opener().click());
    await frame();
    check(document.activeElement === close(), 'reopen did not focus Close');
  };
  const startSave = async () => {
    const choice = document.querySelector<HTMLButtonElement>('[data-theme-option="dark"][aria-pressed="false"], [data-theme-option="light"][aria-pressed="false"]')!;
    choice.focus();
    flushSync(() => choice.click());
    check(choice.disabled, 'real selected theme control was not disabled while saving');
    choice.blur();
    await frame();
    check(document.activeElement === document.body, 'lost-control path did not reach body');
  };

  close().focus(); key('Escape'); await reopen();
  await startSave(); settleSave(false); await frame();
  check(key('Escape').defaultPrevented && !dialog(), 'Escape after successful save/focus loss did not close');
  check(document.activeElement === opener(), 'successful-save close lost opener focus');
  await reopen(); await startSave();
  check(key('Escape').defaultPrevented && !dialog(), 'pending Escape did not close');
  settleSave(false); await frame();
  check(!dialog(), 'late async completion resurrected closed Preferences');
  await reopen(); await startSave();
  check(key('Tab').defaultPrevented && document.activeElement === close(), 'orphaned Tab escaped modal');
  key('Tab', true);
  check(dialog()!.contains(document.activeElement) && document.activeElement !== close(), 'reverse Tab did not wrap');
  settleSave(true); await frame();
  check(dialog()!.querySelector('[role="alert"]')?.textContent?.includes('Fixture theme save failed'), 'failed save was not visible');
  (document.activeElement as HTMLElement).blur();
  check(key('Escape').defaultPrevented && !dialog(), 'failed-save orphaned Escape did not close');
  await reopen();

  // Existing inner popovers consume Escape before it reaches the modal/window.
  const child = document.createElement('button');
  child.textContent = 'Child escape owner';
  child.addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); } });
  dialog()!.append(child); child.focus(); key('Escape');
  check(dialog(), 'child Escape closed parent'); child.remove();
  const newerModal = document.createElement('div');
  newerModal.setAttribute('role', 'dialog'); newerModal.setAttribute('aria-modal', 'true');
  newerModal.textContent = 'Newer modal owns orphaned keyboard'; document.body.append(newerModal);
  check(!key('Escape').defaultPrevented && dialog(), 'older Preferences stole newer modal Escape');
  newerModal.remove();
  close().focus(); key('Escape');
  opener().blur();
  check(!key('Escape').defaultPrevented, 'unmounted Preferences retained global listener');
  await reopen();
}
