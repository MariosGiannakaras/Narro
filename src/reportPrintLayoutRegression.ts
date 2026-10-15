/** Exercise the real print CSS against real text bounds in the browser fixture.
 * This supplements (never substitutes for) actual native PDF export acceptance. */
export async function validateReportPrintLayout() {
  const printRules: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      if (rule instanceof CSSMediaRule && rule.conditionText === 'print') {
        printRules.push(...Array.from(rule.cssRules, (child) => child.cssText));
      }
    }
  }
  if (!printRules.length) throw new Error('Actual print stylesheet was not loaded.');
  const style = document.createElement('style');
  style.textContent = printRules.join('\n');
  document.head.append(style);
  const originalWidth = document.documentElement.style.width;
  try {
    // Conservative fixed printable content width, independent of screenshot
    // viewport. Keep the original data count and all bars/accessibility names.
    document.documentElement.style.width = '960px';
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const chart = document.querySelector<HTMLElement>('.reports-overview__chart')!;
    const bounds = chart.getBoundingClientRect();
    const visibleLabels = Array.from(chart.querySelectorAll<HTMLElement>('.reports-overview__chart-label'))
      .filter((label) => label.textContent?.trim() && getComputedStyle(label).visibility !== 'hidden');
    let previousRight = -Infinity;
    const measured = visibleLabels.map((label) => {
      const range = document.createRange(); range.selectNodeContents(label);
      const text = range.getBoundingClientRect();
      if (text.left < bounds.left - 1 || text.right > bounds.right + 1 || text.left < previousRight + 2) {
        throw new Error(`Print date text overlaps/clips: ${label.textContent} [${text.left},${text.right}] previous=${previousRight}`);
      }
      previousRight = text.right;
      return { text: label.textContent, left: text.left, right: text.right };
    });
    const days = chart.querySelectorAll('.reports-overview__chart-day');
    if (chart.querySelectorAll('.reports-overview__chart-bars').length !== days.length
      || Array.from(chart.querySelectorAll<HTMLButtonElement>('.reports-overview__chart-hit'))
        .some((hit) => !hit.getAttribute('aria-label') || hit.getBoundingClientRect().width <= 0)) {
      throw new Error('Print thinning removed daily data or accessible day names.');
    }
    if (!measured.length || visibleLabels[0] !== days[0].querySelector('.reports-overview__chart-label')
      || visibleLabels[visibleLabels.length - 1] !== days[days.length - 1].querySelector('.reports-overview__chart-label')) {
      throw new Error('Print labels lost a range endpoint.');
    }
    document.documentElement.dataset.reportsPrintLabelBounds = JSON.stringify(measured);
    document.documentElement.dataset.reportsPrintLayoutPass = 'true';
  } finally {
    document.documentElement.style.width = originalWidth;
    style.remove();
  }
}
