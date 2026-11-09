import {loopbackOrigin,forwardLocalRequest} from './loopback-http.mjs';
import {handleClimbDraftApi} from './climb-storage.mjs';
import {handleTreeWorkspaceApi} from './tree-storage.mjs';
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {LocalBucket} from '../frame-studio/scripts/local-bucket.mjs';
import {validateProject} from '../frame-studio/dist/model.js';
import {latestProjects} from './latest-studio-assets.mjs';
const root=path.resolve(import.meta.dirname,'..'),bucket=new LocalBucket(path.join(root,'.studio-data'));
const files=new Set(['prototype/release-showcase.html','dist/pixel-cat-card.js','prototype/vertical-transfer-playback.mjs','prototype/vertical-surface-model.mjs','prototype/vertical-surface-dom.mjs','prototype/vertical-surfaces-lab.html','prototype/vertical-surfaces-lab.css','prototype/vertical-surfaces-lab.mjs','prototype/settling-lab.html','frame-studio/user-sequences/centred-climb-2026-10-20/front.json','prototype/climb-centred.mjs','prototype/climb-contact-particles.mjs','prototype/climb-rotation.mjs','prototype/climb-depth.mjs','prototype/climb-draft-safety.mjs','frame-studio/dist/frame-canvas.js','frame-studio/dist/model.js','frame-studio/dist/behaviour-policy.js','frame-studio/dist/animation-tracks.js','frame-studio/dist/prop-reference-model.js','prototype/climb-lab.html','prototype/climb-lab.css','prototype/climb-lab.mjs','prototype/climb-model.mjs','prototype/life-stage-preview-lab.html','prototype/world-authority-lab.html','prototype/initial-load-lab.html','prototype/lifecycle-lab.html','prototype/carry-lab.html','prototype/route-quality-lab.html','prototype/endurance-lab.html','prototype/endurance-metrics.mjs','prototype/refinement-lab.html','frame-studio/dist/lab-nav.js','frame-studio/dist/workshop-tools.js','prototype/index.html','prototype/leisure-lab.html','prototype/bed-visits.html','prototype/behaviour-refinements.html','prototype/post-rest.html','prototype/playground.html','prototype/multi-cat.html','prototype/standard-cards.html','prototype/card-lab-builtins.js','prototype/card-lab-preview.css','prototype/inspection-debug.js','prototype/default-card-configs.json','prototype/social-lab.html','prototype/social-lab.js','prototype/gaze-lab.html','prototype/gaze-lab.js','prototype/gaze-lab.css','prototype/gaze-perception.js','prototype/playground-card.js','pixel-cat-roaming.js','pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-affordances.js','pixel-cat-behaviours.js','pixel-cat-climbing.js','prototype/climb-runtime-lab.html']);
for(const file of ['prototype/command-controls-lab.html','prototype/kitten-climb-stress-lab.html','prototype/kitten-climb-stress-lab.mjs','prototype/kitten-climb-metrics.mjs'])files.add(file);
for(const file of ['prototype/test-cat-tree-lab.html','prototype/tree-lab.html','prototype/tree-lab.css','prototype/tree-lab.mjs','prototype/tree-components.mjs','prototype/tree-code.mjs','prototype/tree-model.mjs','prototype/tree-workspace-client.mjs'])files.add(file);
export async function labAssets(source=bucket){
 const records=new Map([...latestProjects].map(([id,r])=>[id,{project:r.project,savedAt:r.savedAt,source:'bundled snapshot'}]));
 let cursor;do{const page=await source.list({prefix:'projects/',limit:100,...(cursor?{cursor}:{})});for(const item of page.objects){const r=await (await source.get(item.key)).json();records.set(r.projectId,{project:r.project,savedAt:r.savedAt,source:'local saved workspace'});}cursor=page.truncated?page.cursor:null;}while(cursor);
 const projects=[];for(const r of records.values()){const p=r.project;if(p.deletedAt||p.archived||/^(QA|Drawing check|Across jump Â· horizontal flight)/.test(p.name))continue;validateProject(p);projects.push({projectId:p.projectId,name:p.name,wip:!!p.wip||['pose-vertical-up','pose-vertical-down','proposal-behaviour-knead'].includes(p.projectId),savedAt:r.savedAt,source:r.source,hash:crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex'),frames:p.frames.map(f=>({id:f.id,name:f.name,rows:f.rows,gaze:f.gaze,anchor:f.anchor,role:f.role||'cycle',durationMs:f.durationMs,origin:f.origin}))});}
 return {loadedAt:new Date().toISOString(),projects};
}
export function createLabServer({storage=bucket,port=8769}={}){return http.createServer(async(req,res)=>{try{
 const origin=loopbackOrigin(req.headers.host,port);if(!origin){res.writeHead(403);res.end('Use the loopback lab hostname.');return;}
 const workspace=[['/api/tree-workspaces/',handleTreeWorkspaceApi,'tree-qa'],['/api/climb-drafts/',handleClimbDraftApi,'climb-qa']].find(([prefix])=>req.url.startsWith(prefix));
 if(workspace){const [prefix,handle,qaFolder]=workspace,qa=req.url.startsWith(prefix+'qa-');await forwardLocalRequest(req,res,origin,500000,request=>handle(request,qa?new LocalBucket(path.join(root,'.studio-data',qaFolder)):storage));return;}
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end('Read-only lab');return;}
 const url=new URL(req.url,origin);
 if(url.pathname==='/api/assets'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(req.method==='HEAD'?null:JSON.stringify(await labAssets(storage)));return;}
 const release=/^\/releases\/([A-Za-z0-9][A-Za-z0-9._-]{0,63})\/(pixel-cat(?:-roaming(?:-art|-extras)?|-affordances|-behaviours|-climbing)?\.js|manifest\.json|sources\.json|preview\.html)$/.exec(url.pathname);
 if(release){const file=path.join(root,'.release',release[1],release[2]);if(!fs.existsSync(file)){res.writeHead(404);res.end('Release not found');return;}res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html':file.endsWith('.json')?'application/json':'text/javascript','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?null:fs.readFileSync(file));return;}
 const file=url.pathname==='/'?'prototype/gaze-lab.html':url.pathname.slice(1);
 if(!files.has(file)){res.writeHead(404);res.end('Not found');return;}
 const mime=file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':'text/javascript';res.writeHead(200,{'Content-Type':mime+'; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?null:fs.readFileSync(path.join(root,file)));
 }catch(error){res.writeHead(500);res.end('Lab could not load saved assets: '+error.message);}});}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename)){
 const port=Number(process.env.PIXEL_CAT_LAB_PORT||8769);
 if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid workshop port');
 createLabServer({port}).listen(port,'127.0.0.1',()=>console.log('Testing workshop: http://127.0.0.1:'+port+'/'));
}
