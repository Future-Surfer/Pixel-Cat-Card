// Experimental, DOM-free perception. Raw authored markers remain unchanged.
export function worldGaze(gaze,placement,scale,facing=1,range=180){
 if(!gaze)return {known:false,canSee:false,reason:'unknown'};
 const angle=gaze.angle*Math.PI/180;
 return {known:true,canSee:gaze.canSee!==false,reason:gaze.canSee===false?'blind':'enabled',
  x:placement.x+(facing<0?24-gaze.x-.5:gaze.x+.5)*scale,y:placement.top+(gaze.y+.5)*scale,
  dx:Math.cos(angle)*(facing<0?-1:1),dy:Math.sin(angle),fov:gaze.fov,range};
}
export function targetVisibility(eye,target){
 if(!eye.known||!eye.canSee)return {visible:false,reason:eye.reason};
 const w=target.width||0,h=target.height||0;
 const points=[[target.x,target.y],[target.x-w/2,target.y-h/2],[target.x+w/2,target.y-h/2],[target.x-w/2,target.y+h/2],[target.x+w/2,target.y+h/2],
  [Math.max(target.x-w/2,Math.min(target.x+w/2,eye.x)),Math.max(target.y-h/2,Math.min(target.y+h/2,eye.y))]];
 let inRange=false;const threshold=Math.cos(eye.fov*Math.PI/360);
 for(const [x,y]of points){const dx=x-eye.x,dy=y-eye.y,d=Math.hypot(dx,dy);if(d>eye.range)continue;inRange=true;
  if(d===0||eye.fov===360||(dx*eye.dx+dy*eye.dy)/d>=threshold-1e-9)return {visible:true,reason:'in field'};
 }
 return {visible:false,reason:inRange?'outside field':'out of range'};
}
export class Awareness {
 constructor(){this.reset();}
 reset(){this.targets=new Map();}
 update(eye,targets,now,{dwell=220,motionDwell=100,memory=2500,cooldown=5000}={}){
  const notices=[],states=[];const present=new Set(targets.map(t=>t.id));
  for(const id of this.targets.keys())if(!present.has(id))this.targets.delete(id);
  for(const target of targets){let state=this.targets.get(target.id);if(!state){state={visibleSince:null,lastSeen:null,lastNotice:-Infinity,recognized:false,wasMoving:false};this.targets.set(target.id,state);}
   const result=targetVisibility(eye,target),moving=!!target.moving;if(state.lastSeen!==null&&now-state.lastSeen>memory)state.recognized=false;
   if(result.visible){state.visibleSince??=now;state.lastSeen=now;
    if(now-state.visibleSince>=(moving?motionDwell:dwell)&&now-state.lastNotice>=cooldown&&(!state.recognized||moving&&!state.wasMoving)){state.lastNotice=now;state.recognized=true;notices.push({id:target.id,label:target.label,moving,x:target.x,y:target.y,at:now});}
   }else state.visibleSince=null;
   state.wasMoving=moving;const noticed=state.recognized,remembered=noticed&&state.lastSeen!==null&&now-state.lastSeen<=memory;
   states.push({id:target.id,label:target.label,...result,moving,aware:remembered,status:result.visible?(remembered?'noticed':'acquiring'):remembered?'remembered':result.reason});
  }
  return {notices,states};
 }
}
export class LabMetrics {
 constructor(){this.reset();}
 reset(){this.samples=[];}
 add(sample){this.samples.push(sample);if(this.samples.length>600)this.samples.shift();}
 summary(){const stats=key=>{const values=this.samples.map(s=>s[key]).filter(Number.isFinite).sort((a,b)=>a-b);return {mean:values.length?values.reduce((a,b)=>a+b,0)/values.length:0,p95:values[Math.max(0,Math.ceil(values.length*.95)-1)]||0};};
  const frame=stats('frame');return {samples:this.samples.length,fps:frame.mean?1000/frame.mean:0,frame,controller:stats('controller'),perception:stats('perception'),overlay:stats('overlay'),over33:this.samples.filter(s=>s.frame>33.34).length};
 }
}
