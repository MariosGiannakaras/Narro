import { useEffect, useRef, useState } from "react";
import {
  LOCAL_SOUND_OPTIONS,
  playLocalSoundPreview,
  type LocalSoundId,
} from "./localSoundCatalog";

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
  const [previewError, setPreviewError] = useState<string | null>(null);
  const submittedVolume = useRef(clampVolume(volumePercent));
  const volumeCommitInFlight = useRef(false);

  useEffect(() => {
    const committedVolume = clampVolume(volumePercent);
    submittedVolume.current = committedVolume;
    volumeCommitInFlight.current = false;
    setDraftVolume(committedVolume);
  }, [volumePercent]);

  const commitVolume = async () => {
    const next = clampVolume(draftVolume);
    if (
      next === volumePercent
      || next === submittedVolume.current
      || volumeCommitInFlight.current
    ) return;

    submittedVolume.current = next;
    volumeCommitInFlight.current = true;
    const committed = await onVolumeCommit(next);
    volumeCommitInFlight.current = false;
    if (committed === false) {
      submittedVolume.current = clampVolume(volumePercent);
      setDraftVolume(clampVolume(volumePercent));
    }
  };

  const preview = () => {
    setPreviewError(null);
    void playLocalSoundPreview(selected, draftVolume).catch(() => {
      setPreviewError("Preview unavailable");
    });
  };

  return (
    <div className="preference-settings__sound-control" data-local-sound-control="true">
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
      <button
        type="button"
        className="preference-settings__sound-preview motion-interactive"
        aria-label={`Preview ${LOCAL_SOUND_OPTIONS.find((sound) => sound.id === selected)?.label ?? "sound"}`}
        title="Preview sound"
        disabled={disabled}
        onClick={preview}
      >
        <span aria-hidden="true">▶</span>
      </button>
      <label className="preference-settings__sound-volume">
        <span className="type-metadata">Vol</span>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          aria-label={volumeLabel}
          value={draftVolume}
          disabled={disabled}
          onChange={(event) => setDraftVolume(clampVolume(Number(event.target.value)))}
          onPointerUp={() => void commitVolume()}
          onBlur={() => void commitVolume()}
          onKeyUp={(event) => {
            if (["ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"].includes(event.key)) {
              void commitVolume();
            }
          }}
        />
      </label>
      {previewError ? <span className="preference-settings__sound-error" role="status">{previewError}</span> : null}
    </div>
  );
}
