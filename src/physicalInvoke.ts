// Resolved only by the physical frontend build. Tauri's immutable internals stay intact.
export * from "@tauri-apps/api/core";
import { invoke as original } from "@tauri-apps/api/core";
type Trace = { invoke: typeof original; record: (event: string, data: unknown) => void };
export function physicalTrace(): Trace {
  const trace = (window as unknown as { __NARRO_PHYSICAL_TRACE__?: Trace }).__NARRO_PHYSICAL_TRACE__;
  if (!trace) throw new Error("Physical frontend tracing was not initialized; do not score this session.");
  return trace;
}
export const invoke: typeof original = (command, args, options) => physicalTrace().invoke(command, args, options);
