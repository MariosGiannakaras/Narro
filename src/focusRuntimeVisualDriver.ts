import { invoke } from "@tauri-apps/api/core";
import { applyFocusSurfacePresentation } from "./focusSurfaceModeApi";

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

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
  const unintendedScrollers = [...document.querySelectorAll("html, body, #root, .focus-surface-coordinator")]
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

let started = false;

export function startFocusRuntimeVisualDriver() {
  if (started) return;
  started = true;
  void (async () => {
    await sleep(250);
    await invoke("present_focus_for_blitz");
    await checkpoint("panel", await waitForPresentation("panel"));
    await sleep(500);

    await checkpoint("panel-to-timer-start");
    await sleep(80);
    const compactButton = document.querySelector<HTMLButtonElement>('[data-focus-compact-control="true"]');
    if (!compactButton) throw new Error("Compact view button missing");
    compactButton.click();
    await checkpoint("timer-compact", await waitForPresentation("timerCompact"));
    await sleep(500);

    await applyFocusSurfacePresentation("timerExpanded");
    await checkpoint("timer-expanded", await waitForPresentation("timerExpanded"));
    await sleep(500);

    await applyFocusSurfacePresentation("timerCompact");
    await waitForPresentation("timerCompact");
    await checkpoint("timer-to-panel-start");
    await sleep(80);
    const returnButton = document.querySelector<HTMLButtonElement>('[aria-label="Return to Focus Panel"]');
    if (!returnButton) throw new Error("Return to Focus Panel button missing");
    returnButton.click();
    await checkpoint("panel-returned", await waitForPresentation("panel"));
    await sleep(250);
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
