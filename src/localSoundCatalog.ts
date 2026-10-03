export const LOCAL_SOUND_OPTIONS = [
  { id: "futuristic-ding", label: "Futuristic Ding" },
  { id: "melodic-bell", label: "Melodic Bell" },
  { id: "quick-chime", label: "Quick Chime" },
  { id: "victory-bell", label: "Victory Bell" },
] as const;

export type LocalSoundId = (typeof LOCAL_SOUND_OPTIONS)[number]["id"];

export const DEFAULT_TASK_ALERT_SOUND: LocalSoundId = "melodic-bell";
export const DEFAULT_NOTIFICATION_SOUND: LocalSoundId = "futuristic-ding";
export const DEFAULT_SUCCESS_SOUND: LocalSoundId = "victory-bell";
export const DEFAULT_SOUND_VOLUME_PERCENT = 100;

type ToneStep = {
  frequencyHz: number;
  endFrequencyHz?: number;
  startMs: number;
  durationMs: number;
  gain: number;
  oscillator: OscillatorType;
};

const SOUND_RECIPES: Record<LocalSoundId, readonly ToneStep[]> = {
  "futuristic-ding": [
    { frequencyHz: 720, endFrequencyHz: 1280, startMs: 0, durationMs: 170, gain: 0.36, oscillator: "sine" },
    { frequencyHz: 1440, endFrequencyHz: 920, startMs: 35, durationMs: 150, gain: 0.18, oscillator: "triangle" },
  ],
  "melodic-bell": [
    { frequencyHz: 659.25, startMs: 0, durationMs: 260, gain: 0.28, oscillator: "sine" },
    { frequencyHz: 987.77, startMs: 90, durationMs: 320, gain: 0.24, oscillator: "sine" },
    { frequencyHz: 1318.51, startMs: 170, durationMs: 360, gain: 0.12, oscillator: "sine" },
  ],
  "quick-chime": [
    { frequencyHz: 1046.5, startMs: 0, durationMs: 120, gain: 0.3, oscillator: "triangle" },
    { frequencyHz: 1567.98, startMs: 70, durationMs: 150, gain: 0.24, oscillator: "sine" },
  ],
  "victory-bell": [
    { frequencyHz: 523.25, startMs: 0, durationMs: 300, gain: 0.22, oscillator: "sine" },
    { frequencyHz: 659.25, startMs: 70, durationMs: 340, gain: 0.22, oscillator: "sine" },
    { frequencyHz: 783.99, startMs: 140, durationMs: 420, gain: 0.24, oscillator: "sine" },
    { frequencyHz: 1046.5, startMs: 220, durationMs: 430, gain: 0.12, oscillator: "triangle" },
  ],
};

type WebkitAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let activePreviewContext: AudioContext | null = null;
let cleanupTimer: number | null = null;
let previewGeneration = 0;

export function isLocalSoundId(value: string): value is LocalSoundId {
  return LOCAL_SOUND_OPTIONS.some((option) => option.id === value);
}

function closeContext(context: AudioContext): void {
  if (context.state !== "closed") {
    void context.close().catch(() => undefined);
  }
}

export function stopLocalSoundPreview(): void {
  previewGeneration += 1;
  if (cleanupTimer !== null) {
    globalThis.clearTimeout(cleanupTimer);
    cleanupTimer = null;
  }
  const context = activePreviewContext;
  activePreviewContext = null;
  if (context) closeContext(context);
}

export async function playLocalSoundPreview(
  soundId: LocalSoundId,
  volumePercent: number,
): Promise<void> {
  const recipe = SOUND_RECIPES[soundId];
  if (!recipe) throw new Error("Unknown local Narro sound.");

  stopLocalSoundPreview();
  const AudioContextConstructor = window.AudioContext
    ?? (window as WebkitAudioWindow).webkitAudioContext;
  if (!AudioContextConstructor) {
    throw new Error("Audio preview is unavailable in this WebView.");
  }

  const context = new AudioContextConstructor();
  activePreviewContext = context;
  const generation = previewGeneration;

  try {
    await context.resume();
  } catch (error) {
    if (activePreviewContext === context) activePreviewContext = null;
    closeContext(context);
    throw error;
  }

  if (activePreviewContext !== context || generation !== previewGeneration) {
    closeContext(context);
    return;
  }

  const startAt = context.currentTime + 0.01;
  const master = context.createGain();
  const normalizedVolume = Math.max(0, Math.min(100, volumePercent)) / 100;
  master.gain.setValueAtTime(normalizedVolume, startAt);
  master.connect(context.destination);

  let finalEndMs = 0;
  for (const step of recipe) {
    const stepStart = startAt + step.startMs / 1000;
    const stepEnd = stepStart + step.durationMs / 1000;
    finalEndMs = Math.max(finalEndMs, step.startMs + step.durationMs);

    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = step.oscillator;
    oscillator.frequency.setValueAtTime(step.frequencyHz, stepStart);
    if (step.endFrequencyHz) {
      oscillator.frequency.exponentialRampToValueAtTime(step.endFrequencyHz, stepEnd);
    }

    envelope.gain.setValueAtTime(0.0001, stepStart);
    envelope.gain.linearRampToValueAtTime(step.gain, stepStart + Math.min(0.018, step.durationMs / 4000));
    envelope.gain.exponentialRampToValueAtTime(0.0001, stepEnd);

    oscillator.connect(envelope);
    envelope.connect(master);
    oscillator.start(stepStart);
    oscillator.stop(stepEnd + 0.02);
  }

  cleanupTimer = globalThis.setTimeout(() => {
    cleanupTimer = null;
    if (activePreviewContext === context && generation === previewGeneration) {
      activePreviewContext = null;
      closeContext(context);
    }
  }, finalEndMs + 120);
}
