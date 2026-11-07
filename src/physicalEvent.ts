export * from "@tauri-apps/api/event";
import { listen as originalListen, once as originalOnce } from "@tauri-apps/api/event";
import type { EventCallback, EventName, Options, UnlistenFn } from "@tauri-apps/api/event";
import { physicalTrace } from "./physicalInvoke";
export function listen<T>(event: EventName, handler: EventCallback<T>, options?: Options): Promise<UnlistenFn> {
  return originalListen<T>(event, value => {
  physicalTrace().record("event-delivered", { event: value.event, id: value.id, payload: value.payload });
  handler(value);
  }, options);
}
export function once<T>(event: EventName, handler: EventCallback<T>, options?: Options): Promise<UnlistenFn> {
  return originalOnce<T>(event, value => {
  physicalTrace().record("event-delivered-once", { event: value.event, id: value.id, payload: value.payload });
  handler(value);
  }, options);
}
