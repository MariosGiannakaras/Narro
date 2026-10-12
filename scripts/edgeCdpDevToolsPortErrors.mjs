// Only these Windows Edge DevToolsActivePort read outcomes are transient:
// startup file absent, temporary access denial, and observed exclusive file lock.
// The caller's existing 25-second deadline bounds retries. Unexpected IO errors
// must retain their original cause rather than being silently reclassified.
export function isRetryableDevToolsPortReadError(error) {
  if (!error || typeof error !== "object") return false;
  return error.code === "ENOENT" || error.code === "EACCES" || error.code === "EBUSY";
}
