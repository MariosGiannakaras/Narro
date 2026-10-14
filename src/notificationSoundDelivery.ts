import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { isLocalSoundId, playLocalSound } from "./localSoundCatalog";

type SoundRequest = { soundId: string; volumePercent: number };

/** One Focus owner, native claim-once backlog and finite bridge recovery. No polling. */
export function connectNotificationSounds(): () => void {
  let disposed = false;
  let unlisten: (() => void) | null = null;
  let draining = false;
  let wakePending = false;
  let retry: ReturnType<typeof setTimeout> | null = null;
  let attempts = 0;
  const drain = async () => {
    if (disposed) return;
    wakePending = true;
    if (draining) return;
    draining = true;
    try {
      while (wakePending && !disposed) {
        wakePending = false;
        const requests = await invoke<SoundRequest[]>("drain_notification_sounds");
        for (const request of requests) {
          if (disposed) break;
          if (!isLocalSoundId(request.soundId) || !Number.isInteger(request.volumePercent)
            || request.volumePercent < 0 || request.volumePercent > 100) {
            console.warn("Invalid native notification sound request.");
            continue;
          }
          if (request.volumePercent === 0) continue;
          try { await playLocalSound(request.soundId, request.volumePercent); }
          catch (error: unknown) { console.warn("Notification sound could not play.", error); }
        }
      }
    } catch (error: unknown) {
      console.warn("Notification sounds could not be claimed.", error);
    } finally { draining = false; }
  };
  const attach = () => {
    void listen("notification-sound-ready", () => { void drain(); }).then((stop) => {
      if (disposed) { stop(); return; }
      unlisten = stop;
      void drain(); // Recover fresh effects submitted before renderer/listener startup.
    }).catch((error: unknown) => {
      if (disposed) return;
      const delay = [250, 750][attempts++];
      if (delay === undefined) { console.warn("Notification sound listener unavailable.", error); return; }
      retry = globalThis.setTimeout(() => { retry = null; attach(); }, delay);
    });
  };
  attach();
  return () => {
    if (disposed) return;
    disposed = true;
    if (retry !== null) globalThis.clearTimeout(retry);
    unlisten?.();
    unlisten = null;
  };
}
