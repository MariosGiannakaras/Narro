import { invoke } from "@tauri-apps/api/core";
import { applyFocusSurfacePresentation } from "./focusSurfaceModeApi";
import type { HomeSnapshot } from "./HomeDashboard";
import { createListBoardTask } from "./listBoardApi";
import { createListFromEditor } from "./listEditorApi";
import { startTimerTask } from "./timerSessionApi";

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

async function seedActiveRuntimeFocus(): Promise<void> {
  const listTitle = "CI Focus Runtime";
  await createListFromEditor({
    title: listTitle,
    color: "#48d6c5",
    iconUpload: null,
  });
  const home = await invoke<HomeSnapshot>("get_home_snapshot");
  const list = [...home.lists].reverse().find((candidate) => candidate.title === listTitle);
  if (!list) throw new Error("Packaged runtime capture could not resolve its Focus fixture list.");

  const taskId = await createListBoardTask({
    listId: list.id,
    lane: "today",
    title: "Packaged runtime focus task",
    estSeconds: 3_600,
    insertAtTop: true,
  });
  await startTimerTask(taskId, { kind: "est_countdown", est_ms: 3_600_000 });
}


function runtimeSnapshot() {
  const metrics = (element: Element | null) => {
    if (!(element instanceof HTMLElement)) return null;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      clientWidth: element.clientWidth, clientHeight: element.clientHeight,
      scrollWidth: element.scrollWidth, scrollHeight: element.scrollHeight,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      overflowX: style.overflowX, overflowY: style.overflowY,
      visibility: style.visibility, display: style.display, opacity: style.opacity,
    };
  };
  const coordinator = document.querySelector(".focus-surface-coordinator");
  const active = document.querySelector('.focus-surface-coordinator__presentation[data-focus-visibility="active"]');
  const unintendedScrollers = [...document.querySelectorAll("html, body, #root")]
    .filter((element) => element instanceof HTMLElement
      && (element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight))
    .map((element) => ({
      tag: element.tagName, id: element.id, className: element.className, metrics: metrics(element),
    }));
  return {
    now: performance.now(),
    viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
    documentElement: metrics(document.documentElement), body: metrics(document.body),
    root: metrics(document.getElementById("root")), coordinator: metrics(coordinator), active: metrics(active),
    activePresentation: active?.getAttribute("data-focus-presentation") ?? null,
    presentation: coordinator?.getAttribute("data-focus-presentation") ?? null,
    hydrated: coordinator?.getAttribute("data-focus-presentation-hydrated") ?? null,
    transitionPending: coordinator?.getAttribute("data-focus-transition-pending") ?? null,
    geometryMotion: {
      from: coordinator?.getAttribute("data-focus-geometry-motion-from") ?? null,
      to: coordinator?.getAttribute("data-focus-geometry-motion-to") ?? null,
      phase: coordinator?.getAttribute("data-focus-geometry-motion-phase") ?? null,
    },
    floatingExpanded: document.querySelector(".floating-timer-foundation")?.getAttribute("data-floating-expanded") ?? null,
    floatingRegionExpanded: document.querySelector(".floating-timer-foundation")?.getAttribute("data-floating-region-expanded") ?? null,
    visibleTextLength: (document.body?.innerText ?? "").trim().length,
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    unintendedScrollers,
  };
}

async function waitForPresentation(presentation: "panel" | "timerCompact" | "timerExpanded") {
  const deadline = performance.now() + 8_000;
  const activePresentation = presentation === "panel" ? "panel" : "timer";
  while (performance.now() < deadline) {
    const snapshot = runtimeSnapshot();
    if (snapshot.hydrated === "true" && snapshot.presentation === presentation
      && snapshot.activePresentation === activePresentation) return snapshot;
    await sleep(25);
  }
  throw new Error(`Focus presentation ${presentation} did not settle for packaged runtime capture`);
}

async function checkpoint(phase: string, snapshot = runtimeSnapshot()) {
  await invoke("focus_runtime_capture_checkpoint", {
    phase,
    snapshot: JSON.stringify({ phase, snapshot }, null, 2),
  });
}

async function waitForCaptureAck(phase: string) {
  const deadline = performance.now() + 30_000;
  while (performance.now() < deadline) {
    if (await invoke<boolean>("focus_runtime_capture_acknowledged", { phase })) return;
    await sleep(25);
  }
  throw new Error(`Packaged runtime capture did not acknowledge ${phase}`);
}

let started = false;

export function startFocusRuntimeVisualDriver() {
  if (started) return;
  started = true;
  void (async () => {
    await sleep(250);
    await seedActiveRuntimeFocus();
    await sleep(100);
    await invoke("main_window_hide");
    await sleep(100);
    await invoke("present_focus_for_blitz", { reducedMotion: false });
    await waitForPresentation("panel");

    // A clean CI profile has no saved Timer placement, so production correctly
    // plans the first Timer at the current Panel position. Seed one distinct,
    // safe placement through the production persistence path before capturing
    // motion, then return to Panel and begin the formal sequence.
    await applyFocusSurfacePresentation("timerCompact");
    await waitForPresentation("timerCompact");
    await invoke("focus_runtime_capture_seed_timer_placement");
    await applyFocusSurfacePresentation("panel");
    await checkpoint("panel", await waitForPresentation("panel"));
    await waitForCaptureAck("panel");

    await checkpoint("panel-to-timer-start");
    await waitForCaptureAck("panel-to-timer-start");
    const compactButton = document.querySelector<HTMLButtonElement>('[data-focus-compact-control="true"]');
    if (!compactButton) throw new Error("Compact view button missing");
    compactButton.click();
    await checkpoint("timer-compact", await waitForPresentation("timerCompact"));
    await waitForCaptureAck("timer-compact");

    await applyFocusSurfacePresentation("timerExpanded");
    await checkpoint("timer-expanded", await waitForPresentation("timerExpanded"));
    await waitForCaptureAck("timer-expanded");

    await applyFocusSurfacePresentation("timerCompact");
    await waitForPresentation("timerCompact");
    await checkpoint("timer-to-panel-start");
    await waitForCaptureAck("timer-to-panel-start");
    const returnButton = document.querySelector<HTMLButtonElement>('[aria-label="Return to Focus Panel"]');
    if (!returnButton) throw new Error("Return to Focus Panel button missing");
    returnButton.click();
    await checkpoint("panel-returned", await waitForPresentation("panel"));
    await waitForCaptureAck("panel-returned");
    await checkpoint("complete");
  })().catch(async (error: unknown) => {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    try {
      await invoke("focus_runtime_capture_checkpoint", {
        phase: "complete",
        snapshot: JSON.stringify({ phase: "complete", error: message }, null, 2),
      });
    } catch {}
  });
}
