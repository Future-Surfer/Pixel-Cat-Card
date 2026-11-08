import {validateBehaviourPolicy} from './behaviour-policy.js';
import {validateAnimationTracks} from './animation-tracks.js';
import {validatePropReference} from './prop-reference-model.js';
export const SIZE=24, TOKENS=['.','#','R','F','B'], ORIGINS=['human','ai','mixed','unknown'];
export const clone=value=>JSON.parse(JSON.stringify(value));
export const pixelVolume=rows=>rows.reduce((count,row)=>count+[...row].filter(v=>v!=='.').length,0);
export const frameRole=frame=>frame.role||'cycle';
export const blankRows=()=>Array(SIZE).fill('.'.repeat(SIZE));
export const id=()=>globalThis.crypto?.randomUUID?.() || 'f-'+Date.now()+'-'+Math.random().toString(36).slice(2);
const check=(condition,message)=>{if(!condition)throw Error(message);};
export function validateRows(rows){check(Array.isArray(rows)&&rows.length===SIZE,'A frame must have exactly 24 rows.');for(const row of rows)check(typeof row==='string'&&row.length===SIZE&&[...row].every(v=>TOKENS.includes(v)),'Every row needs exactly 24 cells using . # R F B.');return rows;}
export function validateProject(project){
  validateBehaviourPolicy(project);
  validatePropReference(project?.propReference);
  check(project?.schemaVersion===1,'Unsupported project version.');check(project.width===SIZE&&project.height===SIZE,'This studio uses a fixed 24 × 24 grid.');
  check(typeof project.name==='string'&&project.name.length<=120,'Project name must be at most 120 characters.');
  check(Array.isArray(project.frames)&&project.frames.length>0&&project.frames.length<=96,'A project needs 1–96 frames.');
  if(project.preferredNeighbours!==undefined){const n=project.preferredNeighbours;check(n&&typeof n==='object'&&!Array.isArray(n),'Invalid neighbour preferences.');for(const side of ['before','after'])check(Array.isArray(n[side])&&n[side].length<=32&&new Set(n[side]).size===n[side].length&&n[side].every(v=>typeof v==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(v)&&v!==project.projectId),'Invalid neighbouring sequence IDs.');}
  const ids=new Set();
  for(const f of project.frames)if(f.poi!=null)check(Number.isInteger(f.poi.x)&&Number.isInteger(f.poi.y)&&f.poi.x>=0&&f.poi.x<24&&f.poi.y>=0&&f.poi.y<24,'POI marker must be within the grid.');
  for(const f of project.frames){check(typeof f.id==='string'&&!ids.has(f.id),'Frame IDs must be unique.');ids.add(f.id);validateRows(f.rows);if(f.gaze!=null)check(Number.isInteger(f.gaze.x)&&Number.isInteger(f.gaze.y)&&f.gaze.x>=0&&f.gaze.x<24&&f.gaze.y>=0&&f.gaze.y<24&&Number.isFinite(f.gaze.angle)&&f.gaze.angle>=-180&&f.gaze.angle<=180&&Number.isFinite(f.gaze.fov)&&f.gaze.fov>=10&&f.gaze.fov<=360&&(f.gaze.canSee===undefined||typeof f.gaze.canSee==='boolean'),'Invalid gaze marker.');check(typeof f.name==='string'&&f.name.length<=120,'Invalid frame name.');check(ORIGINS.includes(f.origin),'Invalid artwork origin.');check(['candidate','accepted','rejected'].includes(f.review),'Invalid review status.');check(Number.isFinite(f.durationMs)&&f.durationMs>=50&&f.durationMs<=5000,'Frame holds must be 50–5000 ms.');check(typeof f.locked==='boolean','Invalid keyframe lock.');if(f.anchor!==null)check(Number.isInteger(f.anchor?.x)&&Number.isInteger(f.anchor?.y)&&f.anchor.x>=0&&f.anchor.x<SIZE&&f.anchor.y>=0&&f.anchor.y<SIZE,'Contact anchor must be within the grid.');}
  const meta=m=>{if(m===undefined)return;check(m&&typeof m==='object'&&['idle','walk','jump','interaction','care','transition','other'].includes(m.category),'Invalid category.');check(typeof m.description==='string'&&m.description.length<=2000,'Invalid description.');check(Array.isArray(m.tags)&&m.tags.length<=20&&m.tags.every(t=>typeof t==='string'&&t.length>0&&t.length<=40),'Invalid tags.');};
  for(const f of project.frames){meta(f.metadata);check(f.role===undefined||['enter','cycle','exit'].includes(f.role),'Invalid frame phase.');}
  if(project.groups!==undefined){check(Array.isArray(project.groups)&&project.groups.length<=96,'Maximum 96 animation groups.');const gids=new Set();for(const g of project.groups){check(typeof g.id==='string'&&!gids.has(g.id),'Invalid group ID.');gids.add(g.id);check(typeof g.name==='string'&&g.name.length>0&&g.name.length<=120,'Invalid animation name.');check(Array.isArray(g.frameIds)&&g.frameIds.length>0&&g.frameIds.length<=96&&g.frameIds.every(fid=>typeof fid==='string')&&new Set(g.frameIds).size===g.frameIds.length,'Invalid animation membership.');meta(g);}}
  if(project.submissions!==undefined){check(Array.isArray(project.submissions)&&project.submissions.length<=96,'Maximum 96 saved submissions.');const sids=new Set();for(const s of project.submissions){check(typeof s.id==='string'&&!sids.has(s.id),'Invalid submission ID.');sids.add(s.id);check(['submitted','confirmed','changes-requested','rejected'].includes(s.status),'Invalid submission status.');check(typeof s.notes==='string'&&s.notes.length<=2000,'Invalid submission notes.');check(s.snapshot?.group&&Array.isArray(s.snapshot.frames),'Invalid submission snapshot.');validateProject({schemaVersion:1,width:24,height:24,name:s.snapshot.group.name,frames:s.snapshot.frames});meta(s.snapshot.group);}}
  validateAnimationTracks(project);return project;
}
export function newFrame(name='New frame',rows=blankRows(),origin='human'){validateRows(rows);return {id:id(),name,rows:clone(rows),durationMs:150,anchor:null,origin,review:'candidate',locked:false,source:null,operations:[]};}
export function projectFromGroup(group){return validateProject({schemaVersion:1,width:24,height:24,name:group.name,frames:group.frames.map(f=>({...clone(f),id:id(),locked:false,operations:clone(f.operations||[])}))});}
export function getFrame(project,frameId){const f=project.frames.find(f=>f.id===frameId);check(f,'Frame not found.');return f;}
export function editable(frame){check(!frame.locked,'This keyframe is locked. Duplicate it or unlock it to edit.');}
function audit(frame,actor,kind,details){frame.operations=frame.operations||[];frame.operations.push({actor,kind,at:new Date().toISOString(),...details});}
function recordPixelEdit(frame,actor,before,kind){
  if(JSON.stringify(before)===JSON.stringify(frame.rows))return;
  const empty=before.every(row=>/^\.+$/.test(row));
  if(empty)frame.origin=actor;
  else if(frame.origin!==actor)frame.origin=frame.origin==='unknown'?'unknown':'mixed';
  frame.review='candidate';audit(frame,actor,kind,{});
}
export function applyPixels(project,frameId,pixels,actor='human'){
  check(['human','ai'].includes(actor),'Invalid author.');check(Array.isArray(pixels)&&pixels.length<=576,'Supply at most 576 pixel edits.');
  const f=getFrame(project,frameId);editable(f);const before=clone(f.rows),rows=f.rows.map(row=>[...row]);
  // Validate the entire batch before applying any cell.
  for(const p of pixels)check(Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.x<SIZE&&p.y>=0&&p.y<SIZE&&TOKENS.includes(p.token),'Pixel edits must be inside the grid and use an allowed token.');
  for(const p of pixels)rows[p.y][p.x]=p.token;f.rows=rows.map(row=>row.join(''));recordPixelEdit(f,actor,before,'pixels');return f;
}
export function transform(project,frameId,operation,actor='human'){
  check(!project.animationTracks,'Use Mirror whole sequence with tracks, or remove track metadata before a frame-only transform.');
  const f=getFrame(project,frameId);editable(f);const old=clone(f.rows);let rows;
  if(operation==='flip-x')rows=old.map(row=>[...row].reverse().join(''));
  else if(operation==='flip-y')rows=[...old].reverse();
  else {const moves={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]};check(moves[operation],'Unknown transform.');const [dx,dy]=moves[operation];rows=blankRows().map((row,y)=>[...row].map((_,x)=>old[y-dy]?.[x-dx] || '.').join(''));}
  f.rows=rows;
  // Geometric transforms retain origin, but a clipped shift loses pixels.
  const count=r=>r.join('').replace(/\./g,'').length;
  if(count(old)!==count(rows))recordPixelEdit(f,actor,old,'clipped-shift');
  else if(JSON.stringify(old)!==JSON.stringify(rows)){f.review='candidate';audit(f,actor,operation,{});}
  if(f.gaze){let {x,y,angle,fov}=f.gaze;if(operation==='flip-x'){x=23-x;angle=angle>0?180-angle:-180-angle;}else if(operation==='flip-y'){y=23-y;angle=-angle;}else {const [dx,dy]={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[operation];x+=dx;y+=dy;}f.gaze=x>=0&&x<24&&y>=0&&y<24?{...f.gaze,x,y,angle,fov}:null;}
  for(const marker of ['anchor','poi'])if(f[marker]){let {x,y}=f[marker];if(operation==='flip-x')x=23-x;else if(operation==='flip-y')y=23-y;else {const [dx,dy]={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[operation];x+=dx;y+=dy;}f[marker]=x>=0&&x<24&&y>=0&&y<24?{x,y}:null;}return f;
}
export function transformTrackedSequence(project,operation,actor='human'){
 const copy=clone(project),tracks=copy.animationTracks;for(const f of copy.frames)editable(f);delete copy.animationTracks;
 const map=(x,y)=>operation==='flip-x'?[23-x,y]:operation==='flip-y'?[x,23-y]:[x+({left:-1,right:1}[operation]||0),y+({up:-1,down:1}[operation]||0)];
 if(tracks)for(const t of tracks.tracks){if(t.mask)t.mask=t.mask.map(c=>{const [x,y]=map(c%24,Math.floor(c/24));check(x>=0&&x<24&&y>=0&&y<24,'Track mask would leave the grid; nothing changed.');return y*24+x;});if(t.events)for(const e of t.events)[e.x,e.y]=map(e.x,e.y);}
 for(const f of copy.frames)transform(copy,f.id,operation,actor);if(tracks)copy.animationTracks=tracks;validateProject(copy);project.frames=copy.frames;if(tracks)project.animationTracks=tracks;return project;
}
export function duplicateFrame(project,frameId){check(project.frames.length<96,'Maximum 96 frames.');const f=getFrame(project,frameId),copy=clone(f);copy.id=id();copy.name=f.name+' copy';copy.locked=false;copy.review='candidate';copy.parentId=f.id;copy.operations=[...(copy.operations||[]),{actor:'human',kind:'duplicate',at:new Date().toISOString()}];project.frames.splice(project.frames.indexOf(f)+1,0,copy);return copy;}
export function insertCandidate(project,{afterId,rows,name='AI candidate',durationMs=150,parentId=null}){
  validateRows(rows);check(project.frames.length<96,'Maximum 96 frames.');check(Number.isFinite(durationMs)&&durationMs>=50&&durationMs<=5000,'Invalid hold duration.');
  const f=newFrame(name,rows,'ai');check(typeof name==='string'&&name.length<=120,'Invalid candidate name.');f.durationMs=durationMs;f.parentId=parentId;f.operations=[{actor:'ai',kind:'candidate',at:new Date().toISOString()}];
  const after=afterId?getFrame(project,afterId):project.frames.at(-1);project.frames.splice(project.frames.indexOf(after)+1,0,f);return f;
}
export function lineCells(a,b){const result=[];let x=a.x,y=a.y,dx=Math.abs(b.x-x),dy=-Math.abs(b.y-y),sx=x<b.x?1:-1,sy=y<b.y?1:-1,err=dx+dy;for(;;){result.push({x,y});if(x===b.x&&y===b.y)break;const e=2*err;if(e>=dy){err+=dy;x+=sx;}if(e<=dx){err+=dx;y+=sy;}}return result;}
export function fillCells(rows,start,token){const old=rows[start.y][start.x];if(old===token)return [];const queue=[start],seen=new Set(),result=[];while(queue.length){const p=queue.pop(),key=p.x+','+p.y;if(p.x<0||p.y<0||p.y>=rows.length||p.x>=rows[p.y].length||seen.has(key)||rows[p.y][p.x]!==old)continue;seen.add(key);result.push({...p,token});queue.push({x:p.x-1,y:p.y},{x:p.x+1,y:p.y},{x:p.x,y:p.y-1},{x:p.x,y:p.y+1});}return result;}
export function diffCells(a,b){validateRows(a);validateRows(b);return a.flatMap((row,y)=>[...row].flatMap((v,x)=>v===b[y][x]?[]:[{x,y,from:v,to:b[y][x]}]));}

// Sequence exports are full project snapshots so additive track/anchor metadata survives.
export function exportSequenceProject(project){validateProject(project);return clone(project);}
