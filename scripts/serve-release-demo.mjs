import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {loopbackOrigin} from './loopback-http.mjs';
import {buildReadmePlayback} from './readme-playback.mjs';
import {readmeRuntime} from './readme-assets.mjs';
import {contactRow} from '../prototype/contact-shadow.mjs';
const root=path.resolve(import.meta.dirname,'..'),port=Number(process.env.PORT||8770);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid preview port');
const routes=new Map([['/','prototype/release-showcase.html'],['/prototype/release-showcase.html','prototype/release-showcase.html'],['/dist/pixel-cat-card.js','dist/pixel-cat-card.js']]);
routes.set('/routine','prototype/readme-routine.html');routes.set('/prototype/readme-routine.mjs','prototype/readme-routine.mjs');
routes.set('/turnaround','prototype/turnaround-lab.html');
routes.set('/shadow','prototype/shadow-lab.html');
routes.set('/shadow-v2','prototype/contact-shadow-lab.html');
routes.set('/prototype/contact-shadow.mjs','prototype/contact-shadow.mjs');
const playback=JSON.stringify(buildReadmePlayback().payload);
const {Home,art,window,walkSample,walkAppearance,travelSpeed}=readmeRuntime(),polish=window.pixelCatPolishV1;
const cells=21,motion={fromX:0,direction:1,cells,stepMs:160,gaitStart:0,headSeed:0};
const pose=rows=>({rows,feet:polish.turnFeet(rows,1)});
const walk=Array.from({length:cells+1},(_,i)=>{
 const sample=walkSample(motion,i*motion.stepMs,1,art.walk);
 return {...pose(walkAppearance(art,motion,sample).rows),offset:sample.x};
});
const turnaround=JSON.stringify({walk,stand:pose(art.stand),bridge:art.bridges.walkToSit.map(pose),sit:pose(art.idleSequences.sit.frames[0])});
const shadow=JSON.stringify({
 clips:Object.fromEntries(['sit','walk','scratch','clean','yawn','postScratch'].map(name=>[name,name==='walk'?{frames:art.walk,durations:art.walk.map(()=>160)}:art.idleSequences[name]])),
 props:[...art.dashboardProps,art.homeProps.bowl]
});
const data=new Map([['/readme-playback.json',playback],['/turnaround-art.json',turnaround],['/shadow-art.json',shadow]]);
const shadowScale=6;
const left={id:'Left ledge',left:105,right:360,top:285};
const right={id:'Right ledge',left:445,right:710,top:225};
const floor={id:'Floor',left:0,right:800,top:376};
const jumpActor=Object.assign(Object.create(Home.prototype),{scale:shadowScale,config:{},worldRect:{top:0}});
function shadowJump(kind,from,to,fromX,x){
 const direction=Math.sign(x-fromX),motion={kind:'jump',jumpKind:kind,fromX,fromY:from.top,x,y:to.top,direction};
 motion.jumpProfile=jumpActor.planJump(motion,0);
 if(!motion.jumpProfile)throw Error('Invalid contact-shadow lab jump: '+kind);
 const {duration}=motion.jumpProfile,count=Math.ceil(duration/20);
 const frames=Array.from({length:count+1},(_,i)=>{
  const pose=jumpActor.jumpSample(motion,i/count);
  const feet=pose.frame<2?from.top:pose.frame>2?to.top:pose.top+(contactRow(pose.rows)+1)*shadowScale;
  return {rows:pose.rows,x:pose.x,top:pose.top,feet,facing:direction,airborne:pose.frame===2};
 });
 return {surfaces:[from,to,floor],frames,duration};
}
const inPlace=(frames,fps,grounded)=>({frames,durations:frames.map(()=>1000/fps),inPlace:true,grounded});
const strollRate=travelSpeed({},'relaxed');
data.set('/contact-shadow-art.json',JSON.stringify({
 scale:shadowScale,
 poses:{
  ...Object.fromEntries(['sit','lookdown','perch','scratch','clean','yawn'].map(name=>[name,art.idleSequences[name]])),
  stroll:inPlace(art.walk,strollRate),
  meander:inPlace(art.walk,travelSpeed({},'casual')),
  walkHigh:inPlace(art.walkHigh,strollRate),
  walkLow:inPlace(art.walkLow,strollRate),
  trot:inPlace(art.fastWalk.frames,art.fastWalk.fps),
  gallop:inPlace(art.gallop.frames,art.gallop.fps,art.gallop.grounded),
  ...Object.fromEntries(art.sneak.map((clip,i)=>['sneak'+i,inPlace(clip.frames,8*[8,5,3][i]/5)]))
 },
 jumps:{
  across:shadowJump('across',left,{...right,top:left.top},198,468),
  up:shadowJump('ascend',left,right,198,468),
  down:shadowJump('descend',right,left,474,186)
 }
}));
http.createServer((req,res)=>{
 if(!loopbackOrigin(req.headers.host,port)){res.writeHead(403);res.end('Use the loopback demonstration hostname.');return;}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const pathname=new URL(req.url,'http://127.0.0.1:'+port).pathname;
 if(data.has(pathname)){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?null:data.get(pathname));return;}
 const file=routes.get(pathname);if(!file){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':(/\.m?js$/.test(file)?'text/javascript':'text/html')+'; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?null:fs.readFileSync(path.join(root,file)));
}).listen(port,'127.0.0.1',()=>console.log('Release demonstration: http://127.0.0.1:'+port+'/'));
