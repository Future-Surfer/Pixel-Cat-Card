import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {loopbackOrigin} from './loopback-http.mjs';
import {buildReadmePlayback} from './readme-playback.mjs';
import {readmeRuntime} from './readme-assets.mjs';
const root=path.resolve(import.meta.dirname,'..'),port=Number(process.env.PORT||8770);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid preview port');
const routes=new Map([['/','prototype/release-showcase.html'],['/prototype/release-showcase.html','prototype/release-showcase.html'],['/dist/pixel-cat-card.js','dist/pixel-cat-card.js']]);
routes.set('/routine','prototype/readme-routine.html');routes.set('/prototype/readme-routine.mjs','prototype/readme-routine.mjs');
routes.set('/turnaround','prototype/turnaround-lab.html');
routes.set('/shadow','prototype/shadow-lab.html');
const playback=JSON.stringify(buildReadmePlayback().payload);
const {art,window,walkSample,walkAppearance}=readmeRuntime(),polish=window.pixelCatPolishV1;
const cells=21,motion={fromX:0,direction:1,cells,stepMs:160,gaitStart:0,headSeed:0};
const pose=rows=>({rows,feet:polish.turnFeet(rows,1)});
const walk=Array.from({length:cells+1},(_,i)=>{
 const sample=walkSample(motion,i*motion.stepMs,1,art.walk);
 return {...pose(walkAppearance(art,motion,sample).rows),offset:sample.x};
});
const turnaround=JSON.stringify({walk,stand:pose(art.stand),bridge:art.bridges.walkToSit.map(pose),sit:pose(art.idleSequences.sit.frames[0])});
const shadow=JSON.stringify(Object.fromEntries(['sit','walk','scratch','clean','yawn','postScratch'].map(name=>[name,name==='walk'?{frames:art.walk,durations:art.walk.map(()=>160)}:art.idleSequences[name]])));
const data=new Map([['/readme-playback.json',playback],['/turnaround-art.json',turnaround],['/shadow-art.json',shadow]]);
http.createServer((req,res)=>{
 if(!loopbackOrigin(req.headers.host,port)){res.writeHead(403);res.end('Use the loopback demonstration hostname.');return;}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const pathname=new URL(req.url,'http://127.0.0.1:'+port).pathname;
 if(data.has(pathname)){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?null:data.get(pathname));return;}
 const file=routes.get(pathname);if(!file){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':(/\.m?js$/.test(file)?'text/javascript':'text/html')+'; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?null:fs.readFileSync(path.join(root,file)));
}).listen(port,'127.0.0.1',()=>console.log('Release demonstration: http://127.0.0.1:'+port+'/'));
