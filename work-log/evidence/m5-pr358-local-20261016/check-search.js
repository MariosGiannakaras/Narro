async (page) => {
  const rows=[];
  for(const theme of ['dark','light']) for(const width of [1280,480]) for(const mode of ['empty','results']) {
    await page.setViewportSize({width,height:1080});
    await page.goto(`http://127.0.0.1:4173/search-palette-fixture.html?theme=${theme}&mode=${mode}`);
    await page.waitForFunction(()=>document.documentElement.dataset.searchPaletteFixtureReady==='true');
    const receipt=JSON.parse(await page.locator('#search-palette-contract').textContent());
    if(receipt.layoutPass!==true)throw Error(JSON.stringify(receipt));
    await page.screenshot({path:`search-${theme}-${width}-${mode}.png`,animations:'disabled'});
    rows.push(receipt);
  }
  return rows;
}
