import {readmeAssets,readmeRuntime} from './readme-assets.mjs';
import {scene,size,frameMs} from '../prototype/readme-routine.mjs';

export function buildReadmePlayback(){
 const api=readmeRuntime(),{art,window}=api,assets=readmeAssets(api),{scale,ground,postX,bowlX}=scene;
 const config={idle_frame_ms:250,walk_head_bob:'auto',life_stage:'adult'};
 const surface={id:'scene:floor',el:{},left:0,right:size.width,min:0,max:size.width-24*scale,top:ground};
 const post={id:'post',asset:assets.post,scale,surfaceEl:surface.el,surfaceSuffix:':floor',u:postX/(size.width-assets.post.width*scale),cooldownUntil:0};
 const actor={config,scale,x:40,facing:1,surfaces:[surface],attrs:{},getAttribute(k){return this.attrs[k];}};
 const layer={actor,scene:{enabled:true,props:[post],time:0},world:{clock:0}};
 actor.propScene=layer.scene;
 const face=window.pixelCatVerticalScratchV1.faces(layer,false,true).find(f=>f.direction===1);
 if(!face)throw Error('Release post contact face unavailable');
 const mouth=window.pixelCatMouthV1,target={s:surface,x:bowlX+assets.bowl.width*scale/2,y:ground};
 const stages=[];let clock=0,gait=0,oldIdle=null,currentX=40,currentFacing=1;
 function add(step,ms,sampler){const duration=Math.ceil(ms/frameMs)*frameMs;stages.push({...step,start:clock,ms:duration,sampler});clock+=duration;}
 function hidden(id,label){add({id,label},800,()=>({id,label,hidden:true}));}
 function walk(id,label,to,mask=false){
  const facing=to>=currentX?1:-1;
  let from=currentX;
  const first=art.walk[(gait+1)%art.walk.length],front=api.groundedFront(first,facing);
  if(oldIdle){const bearing=oldIdle.placement.x+api.frameContact(oldIdle.rows,facing,api.idleContact(oldIdle.rows))[0]*scale;from=Math.round((bearing-front*scale)/scale)*scale;}
  const cells=Math.round(Math.abs(to-from)/scale),timings=api.walkTimings(cells,config,'interested');
  const motion={fromX:from,fromY:ground,x:to,y:ground,kind:'walk',direction:facing,cells,gaitStart:gait,headStart:gait,headSeed:0,...timings,start:0};
  window.pixelCatPolishV1.prelude(actor,motion,oldIdle,art,front);
  const departure=motion.departure;
  const sample=time=>{
   if(departure&&time<motion.start){const frame=window.pixelCatPolishV1.bridgeSample(departure.frames,time,departure.beat).frame,rows=departure.frames[frame],p=api.frameContact(rows,facing,departure.anchors?.[frame]||api.idleContact(rows));return {id,label,rows,x:departure.bearing-p[0]*scale,top:ground-(p[1]+1)*scale,facing,mask,departure:true};}
   const beat=api.walkSample(motion,Math.min(motion.duration,Math.max(0,time-motion.start)),scale,art.walk),appearance=api.walkAppearance(art,motion,beat,config);
   return {id,label,rows:appearance.rows,x:beat.x,top:ground-24*scale,facing,mask,walk:{step:beat.step,frame:beat.frame,fromX:motion.fromX,gaitStart:motion.gaitStart,direction:facing}};
  };
  add({id,label,motion},motion.start+motion.duration,sample);
  gait+=cells;currentX=to;currentFacing=facing;oldIdle=null;
 }
 function pose(id,label,name,ms,plan=null){
  actor.x=currentX;actor.facing=plan?.facing??currentFacing;
  const facing=actor.facing,x=plan?.x??currentX,previousFacing=currentFacing,first=api.idleSample(art,name,0,config);
  const contactX=name==='postScratch'?face.bearing:api.idleTransitionContact(oldIdle,name,first,facing,scale,x,previousFacing);
  function sample(time){
   const value=api.idleSample(art,name,time,{...config,track_seed:'readme-miso',clip_exit_at_ms:ms}),p=api.frameContact(value.rows,facing,value.anchor||api.idleContact(value.rows));
   const placement={x:contactX-p[0]*scale,top:ground-(p[1]+1)*scale};
   let mouthPoint;
   if(name==='eat'){actor.idle={pose:name};actor.facing=facing;actor.attrs['data-frame']='idle-eat-'+(value.frame+1);actor.attrs['data-sequence-id']=art.idleSequences.eat.sequenceId;mouthPoint=mouth.mouth(actor,value.rows,placement,art);}
   return {id,label,pose:name,rows:value.rows,x:placement.x,top:placement.top,facing,frame:value.frame,anchor:value.anchor,contactX,mouthPoint};
  }
  add({id,label,pose:name},ms,sample);
  const last=sample(ms-.001);oldIdle={pose:name,rows:last.rows,placement:{x:last.x,top:last.top},anchor:last.anchor,contactX,facing};currentX=last.x;currentFacing=facing;
 }
 hidden('rest','At home');walk('emerge','Out of bed',184,true);walk('approach','Over to the post',face.origin);
 pose('post','Scratch the post','postScratch',6200);
 actor.x=currentX;const foodPlan=mouth.plan(actor,target,'eat',art);if(!foodPlan)throw Error('Release eating plan unavailable');
 walk('food','Over to the bowl',foodPlan.x);pose('eat','A little food','eat',3000,foodPlan);
 pose('groom','An ear scratch','scratch',2200);walk('return','Back home',184);walk('enter','Into bed',40,true);hidden('sleep','At home');
 function sample(time){const t=((time%clock)+clock)%clock,step=stages.find(s=>t<s.start+s.ms);return step.sampler(t-step.start);}
 const sprites=[],indices=new Map(),frames=[];
 for(let time=0;time<clock;time+=frameMs){const state=sample(time),key=state.rows?.join('\n');let sprite;if(key!==undefined){if(!indices.has(key)){indices.set(key,sprites.length);sprites.push(state.rows);}sprite=indices.get(key);}const {rows,walk,anchor,mouthPoint,...small}=state;frames.push({...small,sprite});}
 return {api,assets,stages,duration:clock,sample,target,face,payload:{assets,sprites,frames,duration:clock,frameMs,queue:stages.map(({id,label,ms})=>({id,label,ms}))}};
}
