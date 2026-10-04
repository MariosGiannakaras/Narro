import fs from 'node:fs';
import path from 'node:path';
const dir=process.argv[2] ?? 'artifacts/visual-regression';
let count=0;
const scenarios=process.argv.includes('--m7-integration')?['m7-integration']:process.argv.includes('--shortcut-modal')?['shortcut-modal']:process.argv.includes('--board-metrics')?['board-metrics']:['notes-panel-compact','notes-panel-large','notes-timerExpanded-compact','notes-timerExpanded-large','quick-success','quick-error','quick-empty','motion-panel-timerCompact','motion-timerCompact-panel','board-narrow','board-metrics','timer-geometry','shortcut-modal','m7-integration'];
for(const theme of ['light','dark']) for(const scenario of scenarios) for(const reducedMotion of scenario.startsWith('quick-')?[false]:[false,true]){
 const label=`focus-editor-${scenario}-${theme}${reducedMotion?'-reduced':''}`;
 const dom=fs.readFileSync(path.join(dir,label+'.html'),'utf8');
 const match=dom.match(/<script id="focus-editor-contract" type="application\/json">([\s\S]*?)<\/script>/);
 if(!match || !dom.includes('data-focus-editor-fixture-ready="true"'))throw new Error(label+': renderer did not complete semantic assertions');
 const result=JSON.parse(match[1]);
 if(result.error)throw new Error(label+": "+result.error);
 if(result.theme!==theme||result.scenario!==scenario||result.reducedMotion!==reducedMotion)throw new Error(label+': wrong fixture identity or motion preference');
 const required=scenario==='board-narrow'?['readableTitles','stableTitleGeometry','actionRailContained','editInputContained']:scenario==='timer-geometry'?['initialClipAtomic','prepaintHeaderOpaque','finiteRevealRetained','expandedHeadingAboveActions']:scenario.startsWith('motion-')?['soleTargetAtStart','soleTargetDuringMotion','rollbackRestoredOutgoing']:scenario.startsWith('quick-')?['loadingFocusContained','readyFocusContained','escapeClosed','focusRestored']:['titleInputContained','draftPreserved','editorNodePreserved','tooltipTransitionRetained','tooltipOpenedFromKeyboard','tooltipContained','tooltipEscapeClosed'];
 if(scenario==='quick-success')required.push('titleFocused','tabWrapped');
 if(scenario==='shortcut-modal') {
  required.length=0;
  required.push('focusedButtonIsolated','deliveredEventsIsolated','localDialogKeysPreserved',
   'inactiveModalIgnored','postModalAuthorityResumed','mainModalIsolated','pendingMainDeliveryIsolated','bothKeyboardLayouts','modalNativeDefaultsConsumed');
 }
 if(scenario==='board-metrics') {
  required.length=0;
  required.push('metricsContained','metricTargetsDoNotOverlap','metricGeometryStable','metricTextContained','metricEditingHeightStable');
  if(result.metricCases?.length!==11)throw new Error(label+': missing metric cases');
 }
 if(scenario.endsWith('-large'))required.push('resizeBounded','escapeReturnedInline');
 if(scenario.startsWith('notes-'))required.push('presentationWrappedLeft');
 if(scenario==='m7-integration') {
  required.length=0;
  required.push('catalogCommittedCrud','catalogStaleResponsesRejected','catalogEntryReconciled','catalogSelectedRecovery',
   'catalogNoPolling','catalogDisposedResponseIgnored','queueLastRowReachable','queueMenuReachable','queueHeaderStable','queueNoHorizontalOverflow',
   'deleteMenuRetained','deleteCardMetadataStable','deleteCancelAndDismissSafe','deleteFailureRetrySafe','deletePendingExactlyOnce','deleteIndependentIdentityPreserved');
 }
 if(reducedMotion && !['board-narrow','board-metrics','shortcut-modal','m7-integration'].includes(scenario))required.push('reducedMotionRespected');
 for(const key of required)if(result[key]!==true)throw new Error(label+': '+key+' failed');
 if(result.inlineHorizontalOverflow===true)throw new Error(label+': horizontal overflow');
 count++;
 const png=fs.readFileSync(path.join(dir,label+'.png'));
 if(!png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new Error(label+': invalid PNG');
}
console.log(`Focus editor, modal keyboard and transition visibility regressions: PASS (${count} normal/reduced scenarios)`);
