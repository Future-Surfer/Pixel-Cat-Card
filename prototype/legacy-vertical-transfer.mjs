// Retained for comparison in the original vertical-surfaces lab.
import {flightFits,valid} from './vertical-surface-model.mjs';
const contains=(r,x,y)=>x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
export function planVerticalTransfer({face,from,target,startX,world,scale,frame,probe,framePlacement,climbFrames,maxChecks=48,generation=face?.generation,mode='either',side='centre-front',clear=()=>true}){
 const stats={checks:0,entries:0,releases:0},reject=reason=>({ok:false,reason,stats});
 if(!face||!valid(world)||!Number.isFinite(scale)||scale<=0||!from||!target||target.connected===false||from.connected===false||target.max<target.min||from.max<from.min)return reject('Fresh face, origin and landing required');
 if(target.top<world.top+24*scale||target.top>world.bottom||target.min<world.left||target.max+24*scale>world.right)return reject('Landing stance or headroom lies outside the world');
 if(face.generation!==generation||target.generation!==undefined&&target.generation!==generation)return reject('Stale geometry generation');
 const g=face.grips,x=Math.max(g.left,Math.min(g.right,(Math.max(target.min,Math.min(target.max,startX))+12*scale))),stance=Math.max(from.min,Math.min(from.max,x-12*scale));
 if(!clear(from,stance)||!clear(target,Math.max(target.min,Math.min(target.max,x-12*scale))))return reject('Entry stance or landing is occupied');
 const walkStart=Math.max(from.min,Math.min(from.max,startX)),approach=Math.abs(walkStart-stance)>scale?probe.approach?.('meander',walkStart,from,stance,1):null;
 if(Math.abs(walkStart-stance)>scale&&!approach)return reject('No grounded approach to entry stance');
 const clamp=y=>Math.max(g.top,Math.min(g.bottom,y)),entries=[target.top-12*scale,from.top-64*scale,from.top-32*scale,from.top-16*scale,...mode.startsWith('card-')?[from.top+24*scale,from.top+40*scale]:[],g.bottom].map(clamp),exits=[target.top-12*scale,target.top-24*scale,target.top-36*scale,g.top,g.bottom].map(clamp),seen=new Set(),routes=[];
 const check=fn=>{if(stats.checks>=maxChecks)return null;stats.checks++;return fn();};
 for(const entryY of entries){
  const root={x,y:entryY},key=String(entryY);if(seen.has(key))continue;seen.add(key);
  const enter=check(()=>probe.attach(stance,from,root,frame,mode.startsWith('card-')?'jump':'jump-up'));stats.entries++;
  if(!flightFits(enter,world,scale,framePlacement))continue;
  for(const exitY of new Set([entryY,...exits])){
   if(mode.endsWith('wall-jump')&&Math.abs(exitY-entryY)>.01||mode==='climb'&&Math.abs(exitY-entryY)<=.01||mode.endsWith('ascent')&&entryY-exitY<4*scale)continue;
   // One exposed patch owns the whole grip path; never climb across a visual gap.
   if(!contains(g,x,exitY))continue;
   const releaseRoot={x,y:exitY},exit=check(()=>probe.release(releaseRoot,frame,{...target,source:target},{side}));stats.releases++;
   if(!flightFits(exit,world,scale,framePlacement)||!clear(target,exit.landingX))continue;
   const distance=Math.abs(exitY-entryY),kind=distance<.01?'wall-jump':'climb-and-leap',cost=(approach?.duration||0)+enter.duration+exit.duration+distance/scale*35+150;
   routes.push({kind,cost,faceId:face.id,panelId:face.panelId,stance,entryRoot:root,releaseRoot,approach,enter,exit,distanceCells:distance/scale,frame,climbFrames,passThrough:true});
  }
 }
 routes.sort((a,b)=>a.cost-b.cost);
 return routes.length?{ok:true,route:routes[0],alternatives:routes.length,stats}:reject(stats.checks>=maxChecks?'Bounded flight budget exhausted':'No checked entry and exit through this face');
}
