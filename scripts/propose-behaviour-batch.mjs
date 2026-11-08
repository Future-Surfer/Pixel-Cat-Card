import fs from 'node:fs';
import {latestProjects} from './latest-studio-assets.mjs';
import {newFrame,validateProject,pixelVolume} from '../frame-studio/dist/model.js';
import {ensureQueue} from '../frame-studio/dist/queue.js';

// Initial code-native pixel proposals. Source grids are copied, never edited.
// Do not regenerate over exported drafts or later human refinements.
const folder='frame-studio/user-sequences/behaviour-drafts-2026-10-15';
const ethogram='https://doi.org/10.3390/pets1030021';
const refs={stand:'sequence-stand',sit:'46edfa22-baf5-45b3-a8a6-26fc004059de',loaf:'sequence-loaf'};
const source=(kind)=>{const project=latestProjects.get(refs[kind]).project;return {project,frame:project.frames[kind==='loaf'?1:0]};};
const ink=rows=>rows.map(r=>[...r]);
function tools(grid){
 const put=(x,y,v='#')=>{if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>23||y<0||y>23)throw Error(`Draft clips at ${x},${y}`);grid[y][x]=v;};
 const clear=(x,y,w,h)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)put(i,j,'.');};
 const line=(points,width=1)=>{for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]));for(let k=0;k<=n;k++){const x=Math.round(a[0]+(b[0]-a[0])*k/(n||1)),y=Math.round(a[1]+(b[1]-a[1])*k/(n||1));put(x,y);if(width===2&&x>0)put(x-1,y);}}};
 const move=(original,box,dx,dy)=>{clear(...box);for(let y=box[1];y<box[1]+box[3];y++)for(let x=box[0];x<box[0]+box[2];x++)if(original[y][x]!=='.')put(x+dx,y+dy,original[y][x]);};
 const ellipse=(cx,cy,rx,ry)=>{for(let y=Math.ceil(cy-ry);y<=Math.floor(cy+ry);y++)for(let x=Math.ceil(cx-rx);x<=Math.floor(cx+rx);x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)put(x,y);};
 return {put,clear,line,move,ellipse};
}
const batch=[];
function proposal(key,name,kind,category,posture,brief,frames,extra={}){
 const {project:parent,frame:base}=source(kind),markers=base.rows.flatMap((r,y)=>[...r].flatMap((v,x)=>v==='R'&&y===23?[{x,y}]:[])),anchor=markers[0];
 if(!anchor)throw Error('Missing source bearing');
 const project={schemaVersion:1,width:24,height:24,projectId:'proposal-behaviour-'+key,name:name+' · draft',category,idlePosture:posture,wip:true,oneShot:!!extra.oneShot,description:brief+' AI pixel proposal based on saved human artwork; review before runtime use. Research and authoring plan: CAT_BEHAVIOURS.md.',variantOf:{projectId:parent.projectId,name:parent.name},preferredNeighbours:{before:extra.before||[parent.projectId],after:extra.after||[parent.projectId]},behaviour:{batch:'2026-10-15-everyday',status:'draft',runtimeEnabled:false,research:[ethogram],intent:extra.intent||key,entryPosture:posture,exitPosture:posture,optional:true,contactReview:'proposed-bearing-only',...extra.behaviour},frames:[]};
 project.frames=frames.map((spec,i)=>{
  const g=ink(base.rows);if(spec.draw)spec.draw(tools(g),base.rows);
  // Keep an explicit bearing marker, not a procedural translation of the cat.
  g[anchor.y][anchor.x]='R';const rows=g.map(r=>r.join('')),changed=rows.join('')!==base.rows.join('');
  const f=newFrame(spec.name,rows,changed?'mixed':base.origin);f.id=project.projectId+'-f'+String(i+1).padStart(2,'0');f.role=spec.role;f.durationMs=spec.ms;f.anchor={...anchor};f.review='candidate';f.locked=false;f.source={projectId:parent.projectId,frameId:base.id};f.parentId=base.id;
  f.source.savedAt=latestProjects.get(parent.projectId).savedAt;f.source.contentHash=latestProjects.get(parent.projectId).contentHash;
  f.operations=[{actor:'ai',kind:changed?'behaviour-pixel-proposal':'reference-copy',at:'2026-10-15T00:00:00.000Z',sourceProjectId:parent.projectId,sourceFrameId:base.id}];f.metadata={category,tags:[key,'draft',spec.role],description:spec.note||spec.name};return f;
 });
 ensureQueue(project);project.workQueue.tasks=[];project.workQueue.selectedId='';validateProject(project);batch.push(project);return project;
}
const step=(name,role,ms,draw,note)=>({name,role,ms,draw,note});
const standingHead=(t,original,dx,dy)=>{t.move(original,[16,9,8,8],dx,dy);if(dy)t.line([[15,17],[17,17+dy]],2);};
const sittingHead=(t,original,dx,dy)=>{t.move(original,[10,6,7,8],dx,dy);t.line([[12,13+dy],[12,16]],2);};

proposal('sniff','Investigate · ground sniff','stand','idle','standing',
 'Lower the head toward an interesting point, make small nose probes, pause, then withdraw. Keep all ground contacts still; no target object is baked into the frame.',
 [step('Notice', 'enter',350),step('Lower nose','enter',180,(t,r)=>standingHead(t,r,0,1)),step('Approach scent','enter',180,(t,r)=>standingHead(t,r,0,2)),step('Sniff forward','cycle',240,(t,r)=>standingHead(t,r,1,3)),step('Hold and sample','cycle',450,(t,r)=>standingHead(t,r,0,3)),step('Small second probe','cycle',200,(t,r)=>standingHead(t,r,1,2)),step('Lift away','exit',220,(t,r)=>standingHead(t,r,0,1)),step('Resume standing','exit',350)],
 {after:['sequence-stand','proposal-behaviour-cheek-rub'],behaviour:{requires:'interesting-point-near-nose',repeatRange:[1,2],mayAbort:true}});

const knead=(near,far,ny=23,fy=23)=>(t,r)=>{standingHead(t,r,0,2);t.clear(11,20,9,4);t.line([[14,19],[13,21],[near,ny]],2);t.line([[17,19],[17,21],[far,fy]]);t.put(near,ny,'R');t.put(far,fy,'R');};
proposal('knead','Comfort · alternating knead','stand','interaction','standing',
 'Alternate the two front paws against a soft bed or mat. Keep the rear bearing fixed; front paw markers are local moving contacts, not both planted at once.',
 [step('Stand at soft surface','enter',400),step('Lower shoulders','enter',220,(t,r)=>standingHead(t,r,0,2)),step('Near paw lifts','cycle',220,knead(16,12,22,23)),step('Near paw presses','cycle',300,knead(15,12)),step('Far paw lifts','cycle',220,knead(15,13,23,22)),step('Far paw presses','cycle',300,knead(15,12)),step('Pause over paws','exit',300,(t,r)=>standingHead(t,r,0,2)),step('Release','exit',300)],
 {after:['sequence-loaf','proposal-behaviour-curl-sleep'],behaviour:{requires:'soft-prop',repeatRange:[2,4],targetContact:'front-paws',mayAbort:true}});

const wash=(x,y,dy=1)=>(t,r)=>{sittingHead(t,r,0,dy);t.clear(13,15,3,8);t.line([[12,21],[15,18],[x,y]],2);t.put(x,y,'R');};
proposal('face-wash','Groom · paw wash and face wipe','sit','idle','sitting',
 'Lift a front paw toward the mouth, then stroke it over the cheek and ear before lowering it. Review the paw/head overlap at native size; retain the seated bearing.',
 [step('Sit before washing','enter',450),step('Lift paw','enter',180,wash(16,16,0)),step('Paw toward mouth','cycle',260,wash(16,13)),step('Small lick pause','cycle',350,wash(15,13)),step('Wipe cheek','cycle',220,wash(16,10)),step('Wipe over ear','cycle',220,wash(15,7,0)),step('Bring paw down','exit',200,wash(16,16)),step('Sit after washing','exit',450)],
 {after:['sequence-clean',refs.sit,'sequence-loaf'],behaviour:{repeatRange:[1,3],mayAbort:true}});

const scratch=(x,y)=>(t,r)=>{sittingHead(t,r,-1,0);t.clear(7,17,3,6);t.line([[9,21],[6,17],[x,y]],2);t.put(x,y,'R');};
proposal('ear-scratch','Groom · hind-paw ear scratch','sit','idle','sitting',
 'Raise a hind foot behind the ear, perform a short scratch burst, then put it down. The raised foot marker must never be used as a ground anchor.',
 [step('Sit','enter',450),step('Raise hind foot','enter',180,scratch(9,13)),step('Scratch behind ear','cycle',100,scratch(10,9)),step('Retract slightly','cycle',100,scratch(9,11)),step('Second scratch beat','cycle',100,scratch(10,10)),step('Lower hind foot','exit',180,scratch(9,15)),step('Resettle','exit',450)],
 {behaviour:{repeatRange:[2,3],mayAbort:true,frequencyHint:'occasional-self-care'}});

const yawn=amount=>(t,r)=>{sittingHead(t,r,0,-1);if(amount){t.line([[14,11],[17,12],[16,12+amount],[13,12+amount]],2);t.clear(14,11,2,Math.max(1,amount));t.put(16,11);}};
proposal('yawn','Rest · seated yawn','sit','idle','sitting',
 'A brief head lift and widening jaw silhouette, held at the widest point, then a slower close. The transparent mouth opening is deliberate; no new palette is required.',
 [step('Quiet sitting','enter',600),step('Lift chin','enter',200,yawn(0)),step('Mouth starts opening','cycle',180,yawn(1)),step('Open jaw','cycle',220,yawn(2)),step('Wide yawn hold','cycle',600,yawn(3)),step('Jaw closes','exit',250,yawn(1)),step('Relax chin','exit',200,yawn(0)),step('Quiet sitting again','exit',500)],
 {oneShot:true,after:['sequence-loaf','proposal-behaviour-curl-sleep','sequence-stretch'],behaviour:{repeatRange:[1,1],frequencyHint:'rest-transition'}});

const rub=(dy,press)=>(t,r)=>{standingHead(t,r,press?1:0,dy);if(press)t.line([[21,14+dy],[22,14+dy],[22,16+dy]]);};
proposal('cheek-rub','Interact · cheek rub at an edge','stand','interaction','standing',
 'Lean the cheek into a vertical prop/card edge, rub slightly upward and withdraw. Suggested external contact is x=22, y≈15; the edge itself is intentionally absent.',
 [step('Approach edge','enter',350),step('Lean toward edge','enter',220,rub(0,true)),step('Cheek presses','cycle',350,rub(1,true)),step('Rub upward','cycle',260,rub(-1,true)),step('Ease downward','cycle',350,rub(0,true)),step('Pull away','exit',220,rub(0,false)),step('Resume','exit',350)],
 {after:['sequence-stand','proposal-behaviour-sniff'],behaviour:{requires:'vertical-contact-target',targetContact:{x:22,y:15},repeatRange:[1,2],mayAbort:true}});

const bat=(x,y)=>(t)=>{t.clear(13,15,3,8);t.line([[12,21],[14,18],[x,y]],2);t.put(x,y,'R');};
proposal('paw-bat','Play · inspect and bat','sit','interaction','sitting',
 'Lift a front paw, reach toward an external toy or detail, tap down and recoil. Keep toy motion separate so the same cat clip can investigate, miss, or nudge different props.',
 [step('Watch object','enter',500),step('Lift front paw','enter',220,bat(16,17)),step('Reach slowly','cycle',280,bat(19,17)),step('Tap outward','cycle',100,bat(22,20)),step('Paw recoils','cycle',180,bat(17,16)),step('Watch result','cycle',500,bat(16,19)),step('Put paw down','exit',220),step('Lose interest or re-engage','exit',600)],
 {before:[refs.sit,'proposal-behaviour-sniff'],after:[refs.sit,'proposal-behaviour-sniff'],behaviour:{requires:'reachable-object-or-detail',targetContact:{x:22,y:20},repeatRange:[1,2],mayAbort:true,objectMotion:'separate-runtime-channel'}});

const curl=(amount,breathe=false)=>(t,r)=>{t.ellipse(10,21,6,2);if(breathe)t.line([[7,18],[10,17],[13,18]],2);t.move(r,[11,14,7,5],-amount,amount);t.line([[16,22],[17,23],[13,23],[9,22]],2);};
proposal('curl-sleep','Rest · curl into sleep','loaf','idle','loafing',
 'Lower the head into the body, wrap the tail and hold a compact sleeping silhouette. Only the two sleeping cycle poses breathe; the enter/exit poses should not repeat as a sleep loop.',
 [step('Alert loaf','enter',700),step('Head lowers','enter',350,curl(1)),step('Tuck head','enter',400,curl(2)),step('Curled sleep · exhale','cycle',1700,curl(3)),step('Curled sleep · inhale','cycle',1500,curl(3,true)),step('Uncurl slightly','exit',450,curl(2)),step('Head lifts','exit',400,curl(1)),step('Alert loaf again','exit',650)],
 {after:['sequence-stretch','sequence-loaf'],behaviour:{requires:'wide-resting-place',repeatRange:[3,8],mayAbort:true,frequencyHint:'longer-rest'}});

// The ear scratch needs the front bearing, since its hind foot is lifted.
for(const p of batch)if(p.projectId.endsWith('ear-scratch'))for(const f of p.frames){f.anchor={x:13,y:23};if(f.rows[23][13]!=='R')throw Error('Front scratch bearing missing');}
fs.mkdirSync(folder,{recursive:true});
for(const p of batch)if(fs.existsSync(folder+'/'+p.projectId+'.json'))throw Error('Preserve existing draft/refinements: '+p.projectId);
for(const p of batch)fs.writeFileSync(folder+'/'+p.projectId+'.json',JSON.stringify(p,null,2)+'\n');
const manifest={batchId:'everyday-behaviours-2026-10-15',source:'CAT_BEHAVIOURS.md',runtimeEnabled:false,projects:batch.map(p=>({projectId:p.projectId,name:p.name,file:p.projectId+'.json',frames:p.frames.length,origins:[...new Set(p.frames.map(f=>f.origin))],volume:[Math.min(...p.frames.map(f=>pixelVolume(f.rows))),Math.max(...p.frames.map(f=>pixelVolume(f.rows)))]}))};
fs.writeFileSync(folder+'/manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest,null,2));
