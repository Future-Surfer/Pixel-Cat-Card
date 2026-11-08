import {latestProjects,latestProps} from './latest-studio-assets.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
export function applyLatestStudioArt(art){
 const get=id=>latestProjects.get(id)?.project,clip=(id,loop=true)=>{const p=get(id);return p&&{sequenceId:id,frames:p.frames.map(f=>f.rows),durations:p.frames.map(f=>f.durationMs),roles:p.frames.map(f=>f.role||'cycle'),origins:p.frames.map(f=>f.origin),anchors:p.frames.map(f=>f.anchor?[f.anchor.x,f.anchor.y]:null),loop};};
 const active=[['sit','46edfa22-baf5-45b3-a8a6-26fc004059de'],['sithead','4b73f410-1bfc-4ea3-ba1d-7d6c737a6a63'],['perch','0d9340b1-6255-4d69-93b6-28d5077987e6'],['look','sequence-look-up'],['lookdown','pose-look-down'],['loaf','sequence-loaf'],['clean','sequence-clean'],['stretch','sequence-stretch'],['glance','pose-sitting-glance']];
 for(const [pose,id]of active){const c=clip(id,!['glance','stretch'].includes(pose));if(c){if(pose==='lookdown')c.anchors=c.frames.map(rows=>{const xs=[...rows[17]].flatMap((v,x)=>v==='R'?[x]:[]);if(!xs.length)throw Error('Look-down missing rear ledge bearing marker.');return [Math.min(...xs),17];});art.idleSequences[pose]=c;}}
 const leap=get('sequence-across');if(leap){const flight=leap.frames.filter(f=>f.role==='cycle');art.acrossFlight={frames:flight.map(f=>f.rows),durations:flight.map(f=>f.durationMs),origins:flight.map(f=>f.origin),sequenceId:leap.projectId};art.across=[leap.frames[0].rows,leap.frames[1].rows,flight[0].rows,leap.frames.at(-1).rows];art.frameProvenance.across=[leap.frames[0].origin,leap.frames[1].origin,flight[0].origin,leap.frames.at(-1).origin];}
 art.sneak=['a92e1bba-462f-4d89-92e7-d1e7d9142eda','c45528cf-168a-4dc1-ab61-96ac62816e59','dd149c2d-9d62-4f57-bf12-d1cb9924d469'].map(id=>clip(id));
 // These eight-frame clips share exact leg pixels; zero-distance beats retain
 // both grounded paws instead of sliding the body to keep a constant FPS.
 art.sneakAdvances=[0,1,1,0,0,1,1,1];
 art.freefallSequence=clip('sequence-freefall-candidate');art.propCatalogue=latestProps.assets.filter(a=>!a.id.startsWith('original-')).map(a=>({id:a.id,name:a.name,width:a.width,height:a.height,pixels:a.pixels,origin:a.origin,revision:a.revision}));
 art.assetManifest=[...latestProjects.values()].map(r=>({sequenceId:r.projectId,name:r.name,savedAt:r.savedAt,contentHash:r.contentHash,frames:r.frames,origin:[...new Set(r.project.frames.map(f=>f.origin))],runtime:active.some(a=>a[1]===r.projectId)||r.projectId==='sequence-across'?'active':'catalogued'}));
 for(const entry of art.assetManifest)if(art.sneak.some(c=>c?.sequenceId===entry.sequenceId)||entry.sequenceId==='sequence-freefall-candidate')entry.runtime='active';
 art.integratedSnapshots=art.assetManifest.filter(r=>r.runtime==='active');
 const additional={};
 for(const [pose,id,loop] of [['sniff','proposal-behaviour-sniff',false],['scratch','proposal-behaviour-ear-scratch',true],['yawn','proposal-behaviour-yawn',false],['sleep','proposal-behaviour-curl-sleep',true],['rub','proposal-behaviour-cheek-rub',false],['bat','proposal-behaviour-paw-bat',false]]){
  const c=clip(id,loop);if(!c)continue;
  if(pose==='scratch')c.anchors=c.frames.map(()=>[10,23]); // saved front anchor moved into ink; retain the unchanged seated bearing
  if(pose==='yawn')c.roles=['enter','enter','cycle','cycle','exit']; // wide-open frame is an authored exit in the source; hold it for a yawn
  if(!c.frames.every((rows,i)=>!c.anchors[i]||rows[c.anchors[i][1]][c.anchors[i][0]]==='R'))throw Error('Refined idle anchor is not a support marker: '+pose);
  additional[pose]=c;
 }
 const voice=get('proposal-behaviour-yawn');
 if(voice){for(const [pose,indices,holds] of [['meow',[0,1,2,3,2,1,0],[200,100,80,160,80,100,200]],['chatter',[0,1,2,3,2,3,2,1,0],[180,90,70,60,70,60,70,90,180]]]){
  additional[pose]={sequenceId:voice.projectId,frames:indices.map(i=>voice.frames[i].rows),durations:holds,roles:indices.map((_,i)=>i<2?'enter':i>=indices.length-2?'exit':'cycle'),origins:indices.map(i=>voice.frames[i].origin),anchors:indices.map(i=>[10,23]),sourceFrames:indices,loop:false};
 }}
 const descent=get('sequence-descend');if(descent){art.descend=descent.frames.map(f=>f.rows);art.frameProvenance.descend=descent.frames.map(f=>f.origin);}
 const fast=clip('proposal-fast-walk-front-offset'),gallop=clip('0d6931c8-a2ff-404e-ad47-aef258c0d898');
 if(gallop){gallop.fps=25;gallop.advances=[0,2,2,5,3,3,3,0];gallop.grounded=[true,true,true,true,false,false,true,true];gallop.strideCells=18;}
 // Approved borrowed-frame assembly; preserve exact pixels, holds and gaze.
 const startleRecord=JSON.parse(fs.readFileSync(new URL('../frame-studio/user-sequences/startle-hop-2026-10-15/project.json',import.meta.url),'utf8')),startleProject=startleRecord.project;
 art.assetManifest.push({sequenceId:startleProject.projectId,name:startleProject.name,savedAt:startleRecord.savedAt,contentHash:crypto.createHash('sha256').update(JSON.stringify(startleProject)).digest('hex'),frames:startleProject.frames.length,origin:[...new Set(startleProject.frames.map(f=>f.origin))],runtime:'active',trigger:'explicit-disturbance-only'});
 const startle={sequenceId:startleProject.projectId,frames:startleProject.frames.map(f=>f.rows),durations:startleProject.frames.map(f=>f.durationMs),roles:startleProject.frames.map(f=>f.role),origins:startleProject.frames.map(f=>f.origin),gazes:startleProject.frames.map(f=>f.gaze),anchors:startleProject.frames.map(f=>f.anchor?[f.anchor.x,f.anchor.y]:null),loop:false};
 art.runtimeAdditions={idleSequences:additional,startle,fastWalk:fast,gallop,gallopPreview:gallop,interactionContacts:{bat:{frame:3,point:[20,20]},rub:{frame:2,point:[22,15]}}};
 for(const e of art.assetManifest){if(Object.values(additional).some(c=>c.sequenceId===e.sequenceId)||['proposal-fast-walk-front-offset',gallop?.sequenceId,'sequence-descend'].includes(e.sequenceId))e.runtime='active';if(get(e.sequenceId)?.archived)e.runtime='archived';if(get(e.sequenceId)?.deletedAt)e.runtime='deleted';}
 art.integratedSnapshots=art.assetManifest.filter(r=>r.runtime==='active');
 return art;
}
