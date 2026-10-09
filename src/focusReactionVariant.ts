// Stable offline reaction choice; never use randomness, network media or a timer.
// The task identity is already locally persisted and is not exposed remotely.
export type FocusReactionVariant = "spark" | "confetti" | "ribbon";

export function focusReactionVariant(taskId: string): FocusReactionVariant {
  let hash = 2166136261;
  for (let index = 0; index < taskId.length; index += 1) {
    hash ^= taskId.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const variants: readonly FocusReactionVariant[] = ["spark", "confetti", "ribbon"];
  return variants[(hash >>> 0) % variants.length];
}
