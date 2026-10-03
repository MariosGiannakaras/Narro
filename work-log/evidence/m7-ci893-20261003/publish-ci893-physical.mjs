import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=process.cwd(), run=path.join(root,'artifacts/m7-ci893-physical-20261003/run-1947');
const out=path.join(root,'work-log/evidence/m7-ci893-20261003');
fs.mkdirSync(out,{recursive:true});
const bin=path.join(root,'artifacts/ui-validation-tools/ffmpeg-portable/ffmpeg-9.0.2-essentials_build/bin');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function command(exe,args){const r=spawnSync(path.join(bin,exe+'.exe'),args,{maxBuffer:8e6});if(r.status!==0)throw new Error(r.stderr.toString());return r.stdout.toString();}
function probe(p){return JSON.parse(command('ffprobe',['-v','error','-count_packets','-show_entries','format=duration,size:stream=index,codec_name,codec_type,width,height,r_frame_rate,nb_read_packets','-of','json',p]));}
const videos=[];
for(const [i,file] of fs.readdirSync(path.join(run,'video')).filter(x=>x.endsWith('.mkv')).sort().entries()){
 const input=path.join(run,'video',file),target=path.join(out,'video',`recording-${i+1}`);fs.mkdirSync(target,{recursive:true});
 const original=probe(input);
 command('ffmpeg',['-hide_banner','-v','error','-n','-i',input,'-map','0','-c','copy','-f','segment','-segment_time','360','-reset_timestamps','1','-segment_format','mp4','-segment_format_options','movflags=+faststart','-segment_list',path.join(target,'segments.csv'),path.join(target,'part-%03d.mp4')]);
 const parts=fs.readdirSync(target).filter(x=>x.endsWith('.mp4')).sort().map(file=>{const p=path.join(target,file);if(fs.statSync(p).size>=99e6)throw new Error('oversized part '+p);return {file:path.relative(out,p).replaceAll('\\','/'),sha256:sha(p),probe:probe(p)};});
 for(const stream of original.streams){const packets=parts.reduce((n,p)=>n+Number(p.probe.streams.find(s=>s.index===stream.index).nb_read_packets),0);if(packets!==Number(stream.nb_read_packets))throw new Error('packet count changed '+file+' '+stream.index);}
 videos.push({rawFile:file,rawSha256:sha(input),rawProbe:original,parts,allStreamPacketCountsPreserved:true,method:'stream copy all video/audio packets; full recording, including idle gap; no visual PASS inferred'});
 console.log('Complete recording '+(i+1)+' remuxed in '+parts.length+' parts; all packet counts retained');
}
fs.writeFileSync(path.join(out,'video-provenance.json'),JSON.stringify(videos,null,2)+'\n');
fs.cpSync(path.join(root,'artifacts/m7-pr222-ci893/candidate/Narro-M7-Logs'),path.join(out,'Narro-M7-Logs'),{recursive:true,errorOnExist:true});
fs.cpSync(path.join(run,'review/motion'),path.join(out,'motion'),{recursive:true,errorOnExist:true});
fs.cpSync(path.join(run,'performance'),path.join(out,'performance'),{recursive:true,errorOnExist:true});
fs.mkdirSync(path.join(out,'observations'),{recursive:true});
for(const file of fs.readdirSync(path.join(run,'observations')).filter(x=>x.endsWith('.json')))fs.copyFileSync(path.join(run,'observations',file),path.join(out,'observations',file));
for(const file of ['actions.jsonl','recorder-profile.ini','recorder-scene.json'])fs.copyFileSync(path.join(run,file),path.join(out,file));
fs.writeFileSync(path.join(out,'.gitattributes'),'* -text\n');
console.log('Evidence copied to '+out+'; manifest/report still pending');
