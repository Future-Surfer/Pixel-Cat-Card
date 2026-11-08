// Geometry-only opportunities. Discovery never makes a surface solid or starts a cat.
const intersect=(a,b)=>({left:Math.max(a.left,b.left),right:Math.min(a.right,b.right),top:Math.max(a.top,b.top),bottom:Math.min(a.bottom,b.bottom)});
const valid=r=>r&&['left','right','top','bottom'].every(k=>Number.isFinite(r[k]))&&r.right>r.left&&r.bottom>r.top;
const contains=(r,x,y)=>x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
function subtract(r,b){
 const q=intersect(r,b);if(!valid(q))return [r];
 return [{...r,bottom:q.top},{...r,top:q.bottom},{left:r.left,right:q.left,top:q.top,bottom:q.bottom},{left:q.right,right:r.right,top:q.top,bottom:q.bottom}].filter(valid);
}
const inkCache=new WeakMap();
export function frameBounds(frame){
 if(inkCache.has(frame.rows))return inkCache.get(frame.rows);
 const xs=[],ys=[];frame.rows.forEach((r,y)=>[...r].forEach((v,x)=>{if(v!=='.'){xs.push(x);ys.push(y);}}));
 if(!xs.length)throw Error('A grip needs visible artwork');
 const bounds={left:Math.min(...xs),right:Math.max(...xs)+1,top:Math.min(...ys),bottom:Math.max(...ys)+1};inkCache.set(frame.rows,bounds);return bounds;
}
export function discoverVerticalSurfaces({panels,supports,world,scale=1,frame,frames=[frame],generation=0}){
 if(!valid(world)||!Number.isFinite(scale)||scale<=0)throw Error('Finite world bounds and positive scale required');
 const envelope=frames.map(f=>{const b=frameBounds(f);return {left:f.anchor.x-b.left,right:b.right-f.anchor.x,top:f.anchor.y-b.top,bottom:b.bottom-f.anchor.y};}),reach={};for(const k of ['left','right','top','bottom'])reach[k]=Math.max(...envelope.map(b=>b[k]));
 const ids=new Set();for(const p of panels){if(typeof p.id!=='string'||!p.id||ids.has(p.id))throw Error('Unique stable panel IDs required');ids.add(p.id);}
 const faces=[],tops=[],rejected=[],stats={panels:panels.length,patches:0};
 for(const p of panels){
  const reject=reason=>rejected.push({id:p.id,label:p.label,reason});
  if(!valid(p.rect)||p.visible===false||p.connected===false){reject('Hidden, detached or zero-size panel');continue;}
  if(p.permissionReason){reject(p.permissionReason);continue;}
  if(p.unsupported){reject(p.unsupported);continue;}
  if(p.climb==='off'){reject('Climbing explicitly disabled');continue;}
  if(!p.painted&&p.climb!=='on'){reject('Transparent wrapper: no visible climbable material');continue;}
  const visible=intersect(intersect(p.rect,p.clip||world),world);
  if(!valid(visible)){reject('Outside the visible world or clipped away');continue;}
  // A top needs a full clear stance, independently of whether its face fits.
  const radius=Math.max(0,p.radius||0),top=(supports||[]).find(s=>s.ownerId===p.id&&s.connected!==false&&Math.abs(s.top-p.rect.top)<=.5&&s.max>=s.min&&s.top>=world.top+24*scale&&s.top<=world.bottom);
  let topId;
  if(top&&visible.top<=p.rect.top+.5&&p.topExposed!==false){
   let spans=[{left:Math.max(top.left,visible.left,p.rect.left+radius),right:Math.min(top.right,visible.right,p.rect.right-radius)}];
   for(const b of p.blockers||[])if(b.top<top.top+.5&&b.bottom>top.top-24*scale)spans=spans.flatMap(r=>b.right<=r.left||b.left>=r.right?[r]:[{left:r.left,right:Math.min(r.right,b.left)},{left:Math.max(r.left,b.right),right:r.right}]).filter(r=>r.right>r.left);
   for(const [i,r] of spans.entries()){const min=Math.max(top.min,r.left),max=Math.min(top.max,r.right-24*scale);if(max<min)continue;const id=spans.length>1?top.id+':exposed:'+i:top.id;topId??=id;tops.push({...top,...r,id,sourceId:top.id,min,max,panelId:p.id,generation});}
  }
  const inner=intersect(visible,{left:p.rect.left+radius,right:p.rect.right-radius,top:p.rect.top+radius,bottom:p.rect.bottom-radius});
  let patches=valid(inner)?[inner]:[];
  for(const blocker of p.blockers||[])patches=patches.flatMap(r=>subtract(r,blocker));
  let count=0;
  for(const r of patches){
   const grips={left:r.left+reach.left*scale,right:r.right-reach.right*scale,top:r.top+reach.top*scale,bottom:r.bottom-reach.bottom*scale};
   if(grips.right<grips.left||grips.bottom<=grips.top)continue;
   faces.push({id:p.id+':face:'+count++,panelId:p.id,label:p.label,rect:r,grips,colour:p.colour,kind:p.kind||'plane',passThrough:true,topId,generation,confidence:p.climb==='on'?'declared':'visible panel'});
  }
  if(!count)reject('No exposed patch fits this cat and grip pose');
  stats.patches+=count;
 }
 return {faces,tops,rejected,stats};
}
function flightFits(flight,world,scale,framePlacement){
 if(!flight||!Number.isFinite(flight.duration)||flight.duration<=0)return false;
 for(let i=0;i<=32;i++){
  const sample=flight.sample(flight.duration*i/32),rows=sample.rows||sample.frame?.rows;
  if(!rows)return false;
  const p=sample.rows?{x:sample.x,top:sample.top}:framePlacement(sample.frame,sample.root,scale),b=frameBounds({rows});
  const left=sample.facing<0?24-b.right:b.left,right=sample.facing<0?24-b.left:b.right;
  if(p.x+left*scale<world.left-.01||p.x+right*scale>world.right+.01||p.top+b.top*scale<world.top-.01||p.top+b.bottom*scale>world.bottom+.01)return false;
 }
 return true;
}
export function planVerticalTransfer({face,from,target,startX,world,scale,frame,probe,framePlacement,climbFrames,maxChecks=48,generation=face?.generation,mode='either',clear=()=>true}){
 const stats={checks:0,entries:0,releases:0},reject=reason=>({ok:false,reason,stats});
 if(!face||!valid(world)||!Number.isFinite(scale)||scale<=0||!from||!target||target.connected===false||from.connected===false||target.max<target.min||from.max<from.min)return reject('Fresh face, origin and landing required');
 if(target.top<world.top+24*scale||target.top>world.bottom||target.min<world.left||target.max+24*scale>world.right)return reject('Landing stance or headroom lies outside the world');
 if(face.generation!==generation||target.generation!==undefined&&target.generation!==generation)return reject('Stale geometry generation');
 const g=face.grips,x=Math.max(g.left,Math.min(g.right,(Math.max(target.min,Math.min(target.max,startX))+12*scale))),stance=Math.max(from.min,Math.min(from.max,x-12*scale));
 if(!clear(from,stance)||!clear(target,Math.max(target.min,Math.min(target.max,x-12*scale))))return reject('Entry stance or landing is occupied');
 const walkStart=Math.max(from.min,Math.min(from.max,startX)),approach=Math.abs(walkStart-stance)>scale?probe.approach?.('meander',walkStart,from,stance,1):null;
 if(Math.abs(walkStart-stance)>scale&&!approach)return reject('No grounded approach to entry stance');
 const clamp=y=>Math.max(g.top,Math.min(g.bottom,y)),entries=[target.top-12*scale,from.top-64*scale,from.top-32*scale,from.top-16*scale,g.bottom].map(clamp),exits=[target.top-12*scale,target.top-24*scale,target.top-36*scale,g.top,g.bottom].map(clamp),seen=new Set(),routes=[];
 const check=fn=>{if(stats.checks>=maxChecks)return null;stats.checks++;return fn();};
 for(const entryY of entries){
  const root={x,y:entryY},key=String(entryY);if(seen.has(key))continue;seen.add(key);
  const enter=check(()=>probe.attach(stance,from,root,frame,'jump-up'));stats.entries++;
  if(!flightFits(enter,world,scale,framePlacement))continue;
  for(const exitY of new Set([entryY,...exits])){
   if(mode==='wall-jump'&&Math.abs(exitY-entryY)>.01||mode==='climb'&&exitY<=entryY+.01&&exitY>=entryY-.01)continue;
   // One exposed patch owns the whole grip path; never climb across a visual gap.
   if(!contains(g,x,exitY))continue;
   const releaseRoot={x,y:exitY},exit=check(()=>probe.release(releaseRoot,frame,{...target,source:target},{side:'centre-front'}));stats.releases++;
   if(!flightFits(exit,world,scale,framePlacement)||!clear(target,exit.landingX))continue;
   const distance=Math.abs(exitY-entryY),kind=distance<.01?'wall-jump':'climb-and-leap',cost=(approach?.duration||0)+enter.duration+exit.duration+distance/scale*35+150;
   routes.push({kind,cost,faceId:face.id,panelId:face.panelId,stance,entryRoot:root,releaseRoot,approach,enter,exit,distanceCells:distance/scale,frame,climbFrames,passThrough:true});
  }
 }
 routes.sort((a,b)=>a.cost-b.cost);
 return routes.length?{ok:true,route:routes[0],alternatives:routes.length,stats}:reject(stats.checks>=maxChecks?'Bounded flight budget exhausted':'No checked entry and exit through this face');
}
