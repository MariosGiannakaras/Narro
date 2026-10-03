import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd(), run=path.join(root,'artifacts/m7-ci893-physical-20261003/run-1947');
const ff=path.join(root,'artifacts/ui-validation-tools/ffmpeg-portable/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe');
const out=path.join(run,'review/motion');fs.mkdirSync(out,{recursive:true});
const files={dual:'2026-10-03 19-53-25.mkv',single:'2026-10-03 21-46-42.mkv'};
const cases=[
 ['normal-panel-compact-dual','dual',401.62],['normal-expand-dual','dual',461.6],
 ['normal-collapse','single',158.1],['normal-compact-panel','single',161.35],
 ['normal-panel-compact','single',203.84],['reduced-compact-panel','single',207.11],
 ['reduced-panel-compact','single',265.54],['reduced-expand','single',268.63],['reduced-collapse','single',271.65]
];
const index=[];
function exec(args){const r=spawnSync(ff,['-hide_banner','-v','error','-n',...args],{maxBuffer:2e6});if(r.status!==0)throw new Error(r.stderr.toString());}
for(const [name,file,time] of cases){const input=path.join(run,'video',files[file]);const start=time-.35;const width=file==='dual'?4480:1920;
 exec(['-ss',String(start),'-i',input,'-t','2','-an','-vf',`crop=${width}:1080:0:0`,'-c:v','libx264','-crf','18','-preset','veryfast',path.join(out,name+'.mp4')]);
 for(let part=0;part<3;part++){const filter=`crop=${width}:1080:0:0,scale=${file==='dual'?640:384}:-1,drawtext=text='frame %{n}':x=3:y=3:fontsize=15:fontcolor=red:box=1:boxcolor=white,tile=5x6`;
  exec(['-ss',String(start+.5*part),'-i',input,'-vf',filter,'-frames:v','1',path.join(out,`${name}-${part}.png`)]);
 }
 index.push({name,input:files[file],actionApproxSeconds:time,clipStartSeconds:start,durationSeconds:2,sheets:3,framesPerSheet:30,sheetIntervalSeconds:.5,sequence:'row-major at original 60 fps; preview scales; inspect native PNG for exact defect'});
}
fs.writeFileSync(path.join(out,'index.json'),JSON.stringify(index,null,2)+'\n');console.log('9 clips, 27 consecutive-frame sheets, 810 frames prepared; no PASS inferred by extraction.');
