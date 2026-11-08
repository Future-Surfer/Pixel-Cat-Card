import {framePlacement} from './climb-model.mjs';
// Scrubbable lab adapter: semantic catch events, shared recipe, no actor/world loop.
// Precompute once per route; sampling costs at most 32 particles, including rewind.
export function climbContactEvents(plan){
 if(!plan?.ok||!plan.scene.face.grippy)return [];
 const out=[],s=plan.scene.scale;
 for(let i=0;i<plan.segments.length;i++){
  const seg=plan.segments[i],prior=plan.segments[i-1];
  if(seg.kind!=='climb'||!['front','both'].includes(seg.frame.contact)||!prior||!['free','hind'].includes(prior.frame?.contact))continue;
  const frame=seg.frame,p=framePlacement(frame,seg.from,s);
  for(const [paw,point]of frame.paws.entries()){
   if(frame.rows[point.y]?.[point.x]==='.')continue;
   const face=plan.scene.face,x=p.x+(point.x+.5)*s,y=p.top+(point.y+.5)*s;
   out.push({at:seg.start,x,y,localX:x-face.x,localY:y-face.top,surfaceId:face.id,paw,frameId:frame.id,material:face.material,colour:face.materialColour,depth:frame.depth?.[point.y]?.[point.x]==='F'?'behind':'foreground',ground:plan.scene.floor.top,scale:s});
  }
 }
 return out;
}
// Contrast follows the actual surface, never the actor colour. Relative luminance
// keeps dark blue/green surfaces legible as well as near-black surfaces.
export function scratchColour(hex){
 const rgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16)),linear=rgb.map(v=>{const n=v/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;}),lighten=linear.reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0)<.12;
 return '#'+rgb.map(v=>Math.round(lighten?v+(255-v)*.32:v*.68).toString(16).padStart(2,'0')).join('');
}
export function scratchStyle(scale,deep=false){return {life:18000,alpha:.85,width:Math.max(.5,scale*(deep?.8:.55)),length:scale*(deep?3:2),claws:scale<1.5?2:3,spread:.75*scale};}
export function sampleClimbDecals(events,time,face,{reducedMotion=false}={}){
 if(reducedMotion||face.material!=='wallpaper')return [];
 const out=[],colour=scratchColour(face.surfaceColour);
 for(let i=events.length-1;i>=0&&out.length<960;i--){
  const e=events[i],age=time-e.at;
  if(age<0||age>=18000||e.surfaceId!==face.id||e.depth!=='foreground'||e.localX<0||e.localX>face.right-face.x||e.localY<0||e.localY>face.bottom-face.top)continue;
  out.push({...e,x:face.x+e.localX,y:face.top+e.localY,colour,...scratchStyle(e.scale,e.scrape),alpha:.85*Math.min(1,(18000-age)/6000)});
 }
 return out;
}
export function sampleClimbParticles(events,time,recipe){
 const r=recipe||{life:1300,gravity:70,drift:2,size:.46},out=[];
 for(let i=events.length-1;i>=0&&out.length<32;i--){
  const e=events[i],ms=time-e.at;if(ms<0||ms>r.life)continue;
  const t=ms/1000,sign=e.paw?1:-1,y=e.y-2*e.scale*t+.5*r.gravity*e.scale*t*t;
  // Fade at the support as well as at end-of-life. Colour belongs to material.
  const landing=Math.sqrt(2*Math.max(0,e.ground-e.y)/(r.gravity*e.scale)),fade=y>=e.ground?Math.max(0,1-(t-landing)/.26):Math.min(1,(r.life-ms)/180);
  if(fade>0)out.push({...e,x:e.x+sign*r.drift*e.scale*t,y:Math.min(e.ground,y),size:Math.max(1,r.size*e.scale),alpha:fade});
 }
 return out;
}
