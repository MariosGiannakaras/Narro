/**
 * CDP Page.navigate has a transport acknowledgment distinct from page commit.
 * Under a saturated Windows/Edge fixture runner, its acknowledgment may time
 * out even after the requested HTML has become the current document.
 *
 * This does NOT certify React, JS module load, focus, or keyboard behavior.
 * Every caller must subsequently wait for its real fixture-ready marker and
 * run every original keyboard/DOM assertion. No retries or arbitrary sleeps.
 */
export async function navigateOrConfirmFinding33Document({ send, observe, url }) {
  try {
    const navigation = await send("Page.navigate", { url });
    if (navigation?.errorText) {
      throw new Error(`Finding33 Edge navigation failed: ${navigation.errorText}`);
    }
    return { acknowledged: true };
  } catch (error) {
    if (!/^Error: Finding33 CDP command timed out: Page\.navigate$/.test(String(error))) {
      throw error;
    }

    // Never turn an unknown stalled browser, wrong page, or empty navigation
    // response into success. Only a separately observed URL+HTML commit can
    // permit waiting for *real* fixture and keyboard readiness afterward.
    let state;
    try {
      state = await observe();
    } catch {
      throw error;
    }
    if (state?.url !== url || state.documentPresent !== true
        || !["loading", "interactive", "complete"].includes(state.readyState)) {
      throw error;
    }
    return { acknowledged: false };
  }
}
