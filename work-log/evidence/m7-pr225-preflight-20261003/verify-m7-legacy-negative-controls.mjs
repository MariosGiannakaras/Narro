import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
const root=process.cwd(),dist=path.join(root,'dist'),html=path.join(dist,'focus-editor-fixture.html');
const original=fs.readFileSync(html,'utf8');
const out=path.join(root,'artifacts/m7-legacy-negative-controls');fs.mkdirSync(out,{recursive:true});
const edge=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
if(!edge)throw Error('Edge unavailable');
const server=http.createServer((req,res)=>{
 const file=path.resolve(dist,'.'+decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname));
 if(!file.startsWith(dist+path.sep)){res.writeHead(403);res.end();return;}
 try{const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css'};res.setHeader('Content-Type',mime[path.extname(file)]??'application/octet-stream');res.end(fs.readFileSync(file));}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(4175,'127.0.0.1',r));
const results=[];
try {
 for(const [name,scenario,css] of [
  ['nested-fixed-notes','notes-timerExpanded-large','.floating-timer-foundation__content{transform:translateY(0)!important}'],
  ['collapsed-card-title','board-narrow','.list-board-task{container-type:normal!important}'],
  ['non-atomic-initial-clip','timer-geometry','.floating-timer-foundation[data-floating-resize-phase="prepainting"]{transition:clip-path 270ms ease!important}'],
  ['wrapped-tooltip-left','notes-panel-compact','.task-notes__toolbar .overlay-tooltip[data-align="end"]{inset-inline-start:auto!important;inset-inline-end:0!important;--tooltip-translate-x:0px!important}']
 ]){
  fs.writeFileSync(html,original.replace('</head>',`<style>${css}</style></head>`));
  const profile=path.join(out,'profile-'+name);fs.mkdirSync(profile,{recursive:true});
  const args=['--headless=new','--disable-gpu','--disable-background-networking','--no-first-run','--force-device-scale-factor=1','--force-prefers-no-reduced-motion','--window-size=1280,720','--virtual-time-budget=3000',`--user-data-dir=${profile}`,`--screenshot=${path.join(out,name+'.png')}`,'--dump-dom',`http://127.0.0.1:4175/focus-editor-fixture.html?theme=light&scenario=${scenario}&motion=false`];
  const chunks=[]; const errors=[];
  await new Promise((resolve,reject)=>{const child=spawn(edge,args,{windowsHide:true});child.stdout.on('data',b=>chunks.push(b));child.stderr.on('data',b=>errors.push(b));child.on('error',reject);child.on('close',code=>code===0?resolve():reject(Error(Buffer.concat(errors).toString())));});
  const dom=Buffer.concat(chunks).toString();fs.writeFileSync(path.join(out,name+'.html'),dom);
  const match=dom.match(/<script id="focus-editor-contract" type="application\/json">([\s\S]*?)<\/script>/);
  if(!match)throw Error(name+' did not finish');
  const contract=JSON.parse(match[1]);if(!contract.error)throw Error(name+' unexpectedly passed its old defect');
  results.push({name,scenario,restoredLegacyBehavior:css,expectedFail:true,error:contract.error});
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results));
} finally {fs.writeFileSync(html,original);await new Promise(r=>server.close(r));}
