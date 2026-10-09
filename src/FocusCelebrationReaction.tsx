import { focusReactionVariant } from "./focusReactionVariant";

// Narro-owned vector reaction, not a copied Blitzit GIF and not remote content.
// Finite CSS motion is disabled for reduced-motion preferences.
export function FocusCelebrationReaction({ taskId }: { taskId: string }) {
  const variant = focusReactionVariant(taskId);
  return (
    <div className="focus-completion-success__reaction"
      data-focus-success-reaction="true" data-focus-reaction-variant={variant}
      aria-hidden="true">
      <svg viewBox="0 0 160 104" fill="none" aria-hidden="true" focusable="false">
        <circle className="focus-completion-success__reaction-halo" cx="80" cy="52" r="33" />
        <circle className="focus-completion-success__reaction-seal" cx="80" cy="52" r="24" />
        {variant === "ribbon" ? (
          <>
            <path className="focus-completion-success__reaction-ribbon" d="m65 74-7 18 18-7 4-10M95 74l7 18-18-7-4-10" />
            <path className="focus-completion-success__reaction-symbol" d="m68 52 9 9 17-20" />
          </>
        ) : variant === "confetti" ? (
          <>
            <path className="focus-completion-success__reaction-symbol" d="m68 52 9 9 17-20" />
            <path className="focus-completion-success__reaction-spark--a" d="M31 29v10m-5-5h10M129 61v10m-5-5h10" />
            <circle className="focus-completion-success__reaction-spark--b" cx="117" cy="23" r="4" />
            <circle className="focus-completion-success__reaction-spark--c" cx="40" cy="78" r="4" />
          </>
        ) : (
          <>
            <path className="focus-completion-success__reaction-symbol" d="m68 52 9 9 17-20" />
            <path className="focus-completion-success__reaction-spark--a" d="m30 52 11-2m7-30 8 8m68-7-8 8m17 23-11-2m-65 31-8 9m66-9 8 9" />
            <path className="focus-completion-success__reaction-spark--b" d="m80 2 2 11m-2 78 2 11" />
          </>
        )}
      </svg>
    </div>
  );
}
