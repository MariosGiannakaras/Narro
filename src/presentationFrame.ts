export function waitForPresentedFrame(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

/** Resolve after two painted frames, or report an actual elapsed-time timeout.
 * Cancel the outstanding callbacks: hidden WebViews can suspend rAF indefinitely.
 */
export function waitForPresentedFrameWithin(timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let firstFrame = 0;
    let secondFrame = 0;
    let finished = false;
    const complete = (presented: boolean) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      resolve(presented);
    };
    const timeout = window.setTimeout(() => complete(false), Math.max(0, timeoutMs));
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => complete(true));
    });
  });
}

/** Critical Focus/Timer transactions must not wait forever for a suspended WebView. */
export async function waitForPresentedFrameOrThrow(timeoutMs = 1_500): Promise<void> {
  if (!(await waitForPresentedFrameWithin(timeoutMs))) {
    throw new Error("Focus presentation did not paint within the recovery deadline.");
  }
}

/** Prevent CapturePreview from freezing "Loading subtasks…" into a Timer raster.
 * Only expansion needs authoritative subtask hydration; compact recovery does not.
 */
export async function waitForTimerRasterReady(
  target: "timerCompact" | "timerExpanded",
  hasPendingSubtasks: () => boolean,
  presentFrame: (remainingMs: number) => Promise<boolean>,
  now: () => number,
  timeoutMs = 1_500,
): Promise<void> {
  const deadline = now() + timeoutMs;
  const paint = async () => {
    const remainingMs = deadline - now();
    if (remainingMs <= 0 || !(await presentFrame(remainingMs))) {
      throw new Error("Floating Timer subtasks did not finish preparing for raster capture.");
    }
  };
  // Allow React effects and the first asynchronous load state to commit before
  // looking for the loading marker. Never capture an unpainted target.
  await paint();
  if (target === "timerExpanded") {
    while (hasPendingSubtasks()) {
      await paint();
    }
  }
  await paint();
}
