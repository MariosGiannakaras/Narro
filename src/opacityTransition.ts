function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function isOpacityTransition(animation: Animation): animation is CSSTransition {
  return "transitionProperty" in animation
    && (animation as CSSTransition).transitionProperty === "opacity";
}

/** Wait for the actual opacity transition, including the no-transition case. */
export async function waitForOpacityTransition(
  element: HTMLElement,
  expectedOpacity: 0 | 1,
): Promise<void> {
  // React must first publish the phase class before getAnimations can observe it.
  await nextFrame();
  const transitions = element.getAnimations().filter(isOpacityTransition);
  await Promise.allSettled(transitions.map((animation) => animation.finished));

  // A cancelled transition is acceptable only if the published phase still
  // leaves the hierarchy at the required boundary.
  const opacity = Number(getComputedStyle(element).opacity);
  if (!Number.isFinite(opacity) || Math.abs(opacity - expectedOpacity) > 0.001) {
    throw new Error(`Focus surface opacity did not reach ${expectedOpacity}`);
  }
}
