import fs from 'node:fs';
import path from 'node:path';
const dir=process.argv[2] ?? 'artifacts/visual-regression';
for(const theme of ['light','dark']) for(const scenario of ['notes-panel-compact','notes-panel-large','notes-timerExpanded-compact','notes-timerExpanded-large','quick-success','quick-error','quick-empty']){
 const label=`focus-editor-${scenario}-${theme}`;
 const dom=fs.readFileSync(path.join(dir,label+'.html'),'utf8');
 const match=dom.match(/<script id="focus-editor-contract" type="application\/json">([\s\S]*?)<\/script>/);
 if(!match || !dom.includes('data-focus-editor-fixture-ready="true"'))throw new Error(label+': renderer did not complete semantic assertions');
 const result=JSON.parse(match[1]);
 if(result.error)throw new Error(label+": "+result.error);
 if(result.theme!==theme||result.scenario!==scenario)throw new Error(label+': wrong fixture identity');
 const required=scenario.startsWith('quick-')?['loadingFocusContained','readyFocusContained','escapeClosed','focusRestored']:['titleInputContained','draftPreserved','editorNodePreserved'];
 if(scenario==='quick-success')required.push('titleFocused','tabWrapped');
 if(scenario.endsWith('-large'))required.push('resizeBounded','escapeReturnedInline');
 for(const key of required)if(result[key]!==true)throw new Error(label+': '+key+' failed');
 if(result.inlineHorizontalOverflow===true)throw new Error(label+': horizontal overflow');
 const png=fs.readFileSync(path.join(dir,label+'.png'));
 if(!png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new Error(label+': invalid PNG');
}
console.log('Focus editor rendered geometry, draft and delayed-modal keyboard regressions: PASS (14 scenarios)');
