async (page) => {
  await page.setViewportSize({width:1280,height:1080});
  const results=[];
  for (const theme of ['dark','light']) for(const reduced of [false,true]) {
    await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
    await page.goto(`http://127.0.0.1:4173/focus-editor-fixture.html?theme=${theme}&scenario=m7-integration&motion=${reduced}`);
    await page.waitForFunction(()=>document.documentElement.dataset.focusEditorFixtureReady==='true');
    const receipt=JSON.parse(await page.locator('#focus-editor-contract').textContent());
    if(receipt.error || receipt.result?.quickClearNativeCommandAndRefresh===false)throw Error(JSON.stringify(receipt));
    const payload=receipt.result ?? receipt;
    if(payload.quickClearNativeCommandAndRefresh!==true)throw Error('Missing quick-clear actual React assertion: '+JSON.stringify(receipt));
    await page.screenshot({path:`runtime-${theme}-${reduced}.png`,animations:'disabled'});
    results.push({theme,reduced,receipt});
  }
  return results;
}
