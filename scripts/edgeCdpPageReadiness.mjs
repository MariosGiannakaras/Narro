/** DevTools can publish its port before the initial owned blank page exists.
 * Wait for exactly one target; never select an unrelated/ambiguous page. */
export async function waitForOwnedBlankPage({ listPages, isAlive, now, sleep, deadline }) {
  let lastTransient = null;
  while (now() < deadline) {
    if (!isAlive()) throw new Error("Owned Edge exited before its blank target was ready");
    try {
      const pages = await listPages();
      const matches = pages.filter((page) => page.type === "page" && page.url === "about:blank");
      if (matches.length > 1) throw new Error("Owned Edge exposed ambiguous blank targets");
      if (matches.length === 1 && matches[0].webSocketDebuggerUrl) return matches[0].webSocketDebuggerUrl;
    } catch (error) {
      if (error?.cause?.code !== "ECONNREFUSED" && error?.name !== "TimeoutError") throw error;
      lastTransient = String(error);
    }
    await sleep(50);
  }
  throw new Error(`Owned blank Edge target readiness deadline${lastTransient ? `: ${lastTransient}` : ""}`);
}
