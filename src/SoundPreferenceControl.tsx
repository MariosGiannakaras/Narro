import { useEffect, useId, useRef, useState } from "react";
import { LOCAL_SOUND_OPTIONS, playLocalSoundPreview, type LocalSoundId } from "./localSoundCatalog";

type SoundPreferenceControlProps = {
  selectedSound: LocalSoundId | null;
  defaultSound: LocalSoundId;
  volumePercent: number;
  disabled: boolean;
  soundLabel: string;
  volumeLabel: string;
  onSoundChange: (sound: LocalSoundId) => void | Promise<boolean>;
  onVolumeCommit: (volumePercent: number) => void | Promise<boolean>;
};

function clampVolume(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function SoundPreferenceControl({
  selectedSound,
  defaultSound,
  volumePercent,
  disabled,
  soundLabel,
  volumeLabel,
  onSoundChange,
  onVolumeCommit,
}: SoundPreferenceControlProps) {
  const selected = selectedSound ?? defaultSound;
  const [draftVolume, setDraftVolume] = useState(clampVolume(volumePercent));
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const volumeTriggerRef = useRef<HTMLButtonElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const popoverId = useId();
  const submittedVolume = useRef(clampVolume(volumePercent));
  const volumeCommitInFlight = useRef(false);

  useEffect(() => {
    const committedVolume = clampVolume(volumePercent);
    submittedVolume.current = committedVolume;
    volumeCommitInFlight.current = false;
    setDraftVolume(committedVolume);
  }, [volumePercent]);

  useEffect(() => {
    if (disabled) setVolumeOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (!volumeOpen || disabled) return;
    rangeRef.current?.focus();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setVolumeOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [volumeOpen, disabled]);

  const commitVolume = async () => {
    const next = clampVolume(draftVolume);
    if (disabled || next === volumePercent || next === submittedVolume.current || volumeCommitInFlight.current) return;
    submittedVolume.current = next;
    volumeCommitInFlight.current = true;
    try {
      const committed = await onVolumeCommit(next);
      if (committed === false) {
        submittedVolume.current = clampVolume(volumePercent);
        setDraftVolume(clampVolume(volumePercent));
      }
    } catch {
      submittedVolume.current = clampVolume(volumePercent);
      setDraftVolume(clampVolume(volumePercent));
      setPreviewError("Volume change unavailable");
    } finally {
      volumeCommitInFlight.current = false;
    }
  };

  const preview = () => {
    setPreviewError(null);
    void playLocalSoundPreview(selected, draftVolume).catch(() => {
      setPreviewError("Preview unavailable");
    });
  };

  const closeVolume = () => {
    setVolumeOpen(false);
    volumeTriggerRef.current?.focus();
  };

  return (
    <div className="preference-settings__sound-control" data-local-sound-control="true" ref={rootRef}>
      <div className="preference-settings__sound-volume-owner">
        <button
          type="button"
          ref={volumeTriggerRef}
          className="preference-settings__sound-volume-trigger motion-interactive"
          data-sound-volume-trigger="true"
          aria-label={"Adjust " + volumeLabel}
          aria-controls={popoverId}
          aria-expanded={volumeOpen}
          aria-haspopup="dialog"
          disabled={disabled}
          onClick={() => setVolumeOpen((current) => !current)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && volumeOpen) {
              event.preventDefault();
              closeVolume();
            }
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
          </svg>
        </button>
        {volumeOpen && !disabled ? (
          <div
            id={popoverId}
            className="preference-settings__sound-volume-popover"
            role="dialog"
            aria-label={volumeLabel + " adjustment"}
            data-sound-volume-popover="true"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                closeVolume();
              }
            }}
          >
            <label className="preference-settings__sound-volume">
              <span className="type-metadata">{draftVolume}%</span>
              <input
                ref={rangeRef}
                type="range"
                min="0"
                max="100"
                step="5"
                orient="vertical"
                aria-label={volumeLabel}
                value={draftVolume}
                disabled={disabled}
                onChange={(event) => setDraftVolume(clampVolume(Number(event.target.value)))}
                onPointerUp={() => void commitVolume()}
                onBlur={() => void commitVolume()}
                onKeyUp={(event) => {
                  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) {
                    void commitVolume();
                  }
                }}
              />
            </label>
          </div>
        ) : null}
      </div>
      <button
        type="button"
        className="preference-settings__sound-preview motion-interactive"
        aria-label={"Preview " + (LOCAL_SOUND_OPTIONS.find((sound) => sound.id === selected)?.label ?? "sound")}
        title="Preview sound"
        disabled={disabled}
        onClick={preview}
      >
        <span aria-hidden="true">▶</span>
      </button>
      <select
        aria-label={soundLabel}
        value={selected}
        disabled={disabled}
        onChange={(event) => {
          setPreviewError(null);
          void onSoundChange(event.target.value as LocalSoundId);
        }}
      >
        {LOCAL_SOUND_OPTIONS.map((sound) => (
          <option key={sound.id} value={sound.id}>{sound.label}</option>
        ))}
      </select>
      {previewError ? <span className="preference-settings__sound-error" role="status">{previewError}</span> : null}
    </div>
  );
}
