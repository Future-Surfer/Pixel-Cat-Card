import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {pathToFileURL} from 'node:url';
import {validateProject} from '../frame-studio/dist/model.js';import {ensureQueue,validateQueue} from '../frame-studio/dist/queue.js';
export const STARTLE_ID='proposal-startle-hop';
export function buildStartleHop(records,at=new Date().toISOString()){
 const byId=new Map(records.map(r=>[r.project.projectId,r]));
 const recipe=[['sequence-stand',1,60,'enter','Notice / brace',0],['sequence-descend',3,50,'enter','Quick compression',0],['sequence-freefall-candidate',0,60,'cycle','Startled lift',-4],['sequence-freefall-candidate',2,80,'cycle','Airborne apex',-8],['sequence-freefall-candidate',3,60,'cycle','Drop toward landing',-4],['sequence-descend',3,90,'exit','Landing crouch',0],['sequence-stand',1,100,'exit','Regain footing',0]];
 const sources=[];const frames=recipe.map(([projectId,index,durationMs,role,name,offset],i)=>{
  const record=byId.get(projectId);if(!record)throw Error('Missing saved source: '+projectId);validateProject(record.project);const original=record.project.frames[index];if(!original)throw Error('Missing source frame');
  const sourceHash=crypto.createHash('sha256').update(JSON.stringify(record.project)).digest('hex');
  const f=structuredClone(original);f.id=STARTLE_ID+'-f'+String(i+1).padStart(2,'0');f.parentId=original.id;f.name=name;f.durationMs=durationMs;f.role=role;f.locked=false;f.review='candidate';
  f.anchor=role==='cycle'?null:{x:17,y:23};
  if(f.anchor&&f.rows[23][17]!=='R')throw Error('Borrowed grounded frame no longer has the expected front support');
  f.source={...original.source,savedProjectId:projectId,savedFrameId:original.id,savedAt:record.savedAt,versionHash:sourceHash};
  f.operations.push({actor:'ai',kind:'assemble-reused-frame',at,details:'Exact saved pixels and artwork origin retained; timing, role and contact metadata set for startle draft.'});
  sources.push({frameId:f.id,projectId,sourceFrameId:original.id,sourceFrameIndex:index,sourceHash,previewOffsetY:offset});return f;
 });
 const project={schemaVersion:1,width:24,height:24,projectId:STARTLE_ID,name:'Startle · small hop · borrowed frames draft',category:'jump',wip:true,oneShot:true,
  description:'500 ms startle-hop proposal assembled from exact saved human frames. Quick brace/compression → three freefall poses → landing crouch → recovery. No new pixels. Motion is external: render a small vertical ballistic bounce, with fixed facing and a reserved landing footprint. Studio shows the pose sequence; the accompanying GIF demonstrates suggested lift. After landing choose retreat, counter-pounce, watch or settle using context/mood weights; no forced follow-up. Review before runtime integration.',
  preferredNeighbours:{before:['sequence-stand','sequence-sit','sequence-loaf'],after:['sequence-stand','sequence-walk','proposal-fast-walk-front-offset','sequence-across']},
  assembly:{actor:'ai',kind:'existing-frame-arrangement',createdAt:at,sourceFrames:sources,runtimeStatus:'review-only',motionBrief:{kind:'vertical-hop',suggestedRiseCells:8,verticalMotionBakedIntoPixels:false}},frames};
 ensureQueue(project);validateProject(project);validateQueue(project);return project;
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){
 const folder='frame-studio/user-sequences/startle-hop-2026-10-15',ids=['sequence-stand','sequence-descend','sequence-freefall-candidate'],records=[];
 for(const id of ids){const res=await fetch('http://127.0.0.1:8767/api/projects/'+id);if(!res.ok)throw Error('Cannot read saved source '+id);records.push(await res.json());}
 const project=buildStartleHop(records);fs.mkdirSync(folder,{recursive:true});
 // New proposal only: never replace a user's revised copy on a rerun.
 const result=await fetch('http://127.0.0.1:8767/api/projects/'+STARTLE_ID,{method:'PUT',headers:{'Content-Type':'application/json','If-None-Match':'*'},body:JSON.stringify(project)});
 if(!result.ok)throw Error('Proposal was not replaced: '+result.status+' '+await result.text());
 const record=await(await fetch('http://127.0.0.1:8767/api/projects/'+STARTLE_ID)).json();
 fs.writeFileSync(folder+'/sources.json',JSON.stringify(records,null,2));fs.writeFileSync(folder+'/project.json',JSON.stringify(record,null,2));
 fs.writeFileSync(folder+'/manifest.json',JSON.stringify({projectId:STARTLE_ID,savedAt:record.savedAt,status:'draft-review',artwork:'exact borrowed pixels; original frame origins retained',assemblyActor:'ai',runtimeIntegrated:false,sources:project.assembly.sourceFrames},null,2));
 console.log('Saved new startle proposal: '+STARTLE_ID+'; 7 borrowed frames / 500 ms; existing projects untouched.');
}
