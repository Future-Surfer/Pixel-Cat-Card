// Additive metadata: source frames and their provenance are never destructively split.
const trackCheck=(ok,message)=>{if(!ok)throw Error(message);};
export function validateAnimationTracks(project){
 const a=project.animationTracks;if(a===undefined)return;trackCheck(a?.version===1&&Array.isArray(a.tracks)&&a.tracks.length>=1&&a.tracks.length<=6,'Animation tracks need version 1 and 1–6 tracks.');const ids=new Set(),frames=new Map(project.frames.map(f=>[f.id,f])),cells=new Set();
 trackCheck(typeof a.driver==='string'&&a.tracks.some(t=>t.id===a.driver),'Choose one animation/contact driver.');
 for(const t of a.tracks){trackCheck(typeof t.id==='string'&&t.id.length<=100&&!ids.has(t.id),'Track IDs must be unique.');ids.add(t.id);trackCheck(typeof t.name==='string'&&t.name.trim()&&t.name.length<=80,'Name each track (up to 80 characters).');
  if(t.id!==a.driver){trackCheck(Array.isArray(t.mask)&&t.mask.length>0&&t.mask.length<=576&&new Set(t.mask).size===t.mask.length&&t.mask.every(c=>Number.isInteger(c)&&c>=0&&c<576),'Track mask must contain unique cells inside the grid.');for(const c of t.mask){trackCheck(!cells.has(c),'Independent track masks cannot overlap.');cells.add(c);trackCheck(!project.frames.some(f=>['R','F'].includes(f.rows[Math.floor(c/24)][c%24])),'Support and paw markers belong to the contact driver.');}
   trackCheck(Array.isArray(t.frameIds)&&t.frameIds.length>0&&t.frameIds.length<=96&&new Set(t.frameIds).size===t.frameIds.length&&t.frameIds.every(id=>frames.has(id)),'Track references a missing/repeated frame; remove its membership before deleting that frame.');
   if(t.holds)trackCheck(Array.isArray(t.holds)&&t.holds.length===t.frameIds.length&&t.holds.every(v=>Number.isFinite(v)&&v>=50&&v<=5000),'Track holds must match its frames and be 50–5000 ms.');
   for(const k of ['rateMin','rateMax'])if(t[k]!==undefined)trackCheck(Number.isFinite(t[k])&&t[k]>=.5&&t[k]<=2,'Track rates must be 0.5–2.');trackCheck((t.rateMin??1)<=(t.rateMax??1),'Track rate range is reversed.');
  }
  if(t.events){trackCheck(Array.isArray(t.events)&&t.events.length<=32,'Keep at most 32 authored stroke events.');for(const e of t.events){const f=frames.get(e.frameId);trackCheck(t.id===a.driver&&f&&typeof e.name==='string'&&e.name.length<=80&&Number.isInteger(e.x)&&Number.isInteger(e.y)&&e.x>=0&&e.x<24&&e.y>=0&&e.y<24&&f.rows[e.y][e.x]==='F','Stroke events must identify an authored driver forepaw cell.');}}
 }
 const gazeOwner=a.gazeOwner||a.driver;trackCheck(ids.has(gazeOwner),'Gaze owner must be a track.');for(const t of a.tracks)if(t.id!==a.driver&&t.id!==gazeOwner)trackCheck(!project.frames.some(f=>f.gaze&&t.mask.includes(f.gaze.y*24+f.gaze.x)),'A track covering gaze origins must be declared the gaze owner.');
}
export function createAnimationTrack(project,{name='Tail',mask,frameIds,actor='human',id='track-'+Date.now().toString(36),gazeOwner=false}){
 const selected=project.frames.filter(f=>frameIds.includes(f.id));trackCheck(selected.length===frameIds.length&&selected.length>0,'Select source frames for the track.');trackCheck(!selected.some(f=>f.locked),'Unlock the selected keyframes before adding a track.');
 const next=JSON.parse(JSON.stringify(project.animationTracks||{version:1,driver:'body',tracks:[{id:'body',name:'Body / contact driver'}]}));next.tracks.push({id,name,mask:[...mask],frameIds:[...frameIds],rateMin:.85,rateMax:1.15,source:{actor,kind:'selection-track'}});if(gazeOwner)next.gazeOwner=id;const copy={...project,animationTracks:next};validateAnimationTracks(copy);project.animationTracks=next;return next.tracks.at(-1);
}
export function compileAnimationTracks(project){
 validateAnimationTracks(project);if(!project.animationTracks)return null;const byId=new Map(project.frames.map((f,i)=>[f.id,i]));return{frames:project.frames,definition:project.animationTracks,tracks:project.animationTracks.tracks.filter(t=>t.id!==project.animationTracks.driver).map(t=>({...t,indices:t.frameIds.map(id=>byId.get(id)),holds:t.holds||t.frameIds.map(id=>project.frames[byId.get(id)].durationMs)})),cache:new Map()};
}
const trackHash=value=>{let n=2166136261;for(const v of String(value))n=Math.imul(n^v.charCodeAt(0),16777619)>>>0;return n;};
export function sampleAnimationTracks(compiled,frameIndex,elapsed,{seed=0,muted=[],solo=null}={}){
 const f=compiled.frames[frameIndex];if((f.role||'cycle')!=='cycle'||!compiled.tracks.length)return{rows:f.rows,origin:f.origin,sourceRows:f.rows,gaze:f.gaze,sourceIndex:frameIndex,trackFrames:{}};
 const phases=compiled.tracks.map(t=>{const hash=trackHash(seed+':'+t.id),rate=(t.rateMin??1)+((hash>>>8)%1000)/999*((t.rateMax??1)-(t.rateMin??1)),total=t.holds.reduce((a,b)=>a+b,0);let ms=((Math.max(0,elapsed)*rate+hash%total)%total),i=0;while(i<t.holds.length-1&&ms>=t.holds[i])ms-=t.holds[i++];return muted.includes(t.id)||solo&&solo!==t.id?-1:t.indices[i];}),key=frameIndex+':'+phases.join(',')+':'+(solo||'');let result=compiled.cache.get(key);if(result)return result;
 const rows=(solo&&solo!==compiled.definition.driver?Array(24).fill('.'.repeat(24)):f.rows).map(r=>[...r]),origins=new Set([f.origin]),trackFrames={};let gaze=f.gaze;compiled.tracks.forEach((t,i)=>{if(phases[i]<0)return;const source=compiled.frames[phases[i]];origins.add(source.origin);trackFrames[t.id]=phases[i];if(t.id===compiled.definition.gazeOwner)gaze=source.gaze;for(const cell of t.mask)rows[Math.floor(cell/24)][cell%24]=source.rows[Math.floor(cell/24)][cell%24];});
 result={rows:rows.map(r=>r.join('')),origin:origins.has('unknown')?'unknown':origins.size===1?[...origins][0]:'mixed',sourceRows:f.rows,gaze,sourceIndex:frameIndex,trackFrames};compiled.cache.set(key,result);if(compiled.cache.size>128)compiled.cache.delete(compiled.cache.keys().next().value);return result;
}
