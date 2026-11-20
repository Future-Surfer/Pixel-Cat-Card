// Media-only choreography. Release helpers own artwork, gait and contact timing.
import {mediaRuntime,mediaElement,releaseSceneAssets} from './media-runtime.mjs';

export function compileScene(recipe){
 if(recipe.schema!==1)throw Error('Unsupported media recipe');
 if(recipe.tracks)return compileTracks(recipe);
 const api=mediaRuntime(),{art,window}=api,frameMs=20;
 const {scale,ground}=recipe;
 const config={idle_frame_ms:250,walk_head_bob:'auto',life_stage:'adult',motion_profiles:{amble:{start:.65,cruise:1,finish:.7,accelerate_until:.15,brake_from:.8}}};
 const polish=window.pixelCatPolishV1;
 const mouthActor={scale,ownerKey:recipe.id,root:{},config,attrs:{},getAttribute(k){return this.attrs[k];}};
 mouthActor.social=new window.pixelCatDecisionsV1(mouthActor,()=>new Map(),()=>art);
 const jumper=Object.assign(Object.create(api.Home.prototype),{scale,config,worldRect:{top:0}});
 const stages=[];let clock=0,gait=0;
 for(const step of recipe.stages){
  if(stages.some(s=>s.id===step.id))throw Error('Duplicate stage '+step.id);
  const actor=step.cat;
  let motion,clip;
  if(['walk','run','sneak'].includes(actor.kind)){
   const cells=Math.abs(actor.to-actor.x)/scale;
   if(!Number.isInteger(cells))throw Error('Walk endpoints must share the native grid');
   motion={fromX:actor.x,fromY:ground,x:actor.to,y:ground,cells,direction:Math.sign(actor.to-actor.x),gaitStart:gait,headStart:gait,headSeed:0,...api.walkTimings(cells,config,actor.pace||'relaxed')};
   if(actor.kind==='run'){
    const fps=actor.fps??18;
    if(!Number.isFinite(fps)||fps<15||fps>30)throw Error('Run frame rate must match the release range');
    motion.fastClip=art.fastWalk;motion.stepMs=1000/fps;motion.cumulativeMs=Array.from({length:cells},(_,i)=>(i+1)*motion.stepMs);motion.duration=cells*motion.stepMs;
   }else if(actor.kind==='sneak'){
    motion.sneakTimeline=polish.sneakTimeline(cells,art,{variant:actor.variant??0});motion.duration=motion.sneakTimeline.at(-1).until;
   }else if(actor.beatMs!==undefined){
    if(!Number.isFinite(actor.beatMs)||actor.beatMs<80||actor.beatMs>400)throw Error('Walk beat must be 80–400 ms');
    // Retain release displacement/head phase; stretch the whole gait clock together.
    const ratio=cells*actor.beatMs/motion.duration;
    motion.cumulativeMs=motion.cumulativeMs.map(t=>t*ratio);motion.duration*=ratio;
   }
   gait+=cells;
  }else if(actor.kind==='pounce'){
   motion={kind:'jump',jumpKind:'across',fromX:actor.x,fromY:ground,x:actor.to,y:ground,direction:Math.sign(actor.to-actor.x)};
   motion.jumpProfile=jumper.planJump(motion,24);
   if(!motion.jumpProfile)throw Error('Media pounce exceeds release physical limits');
   motion.duration=motion.jumpProfile.duration;
  }else if(actor.kind==='bridge'){
   const frames=polish.restBridge(art,actor.from,actor.to,null,config,0);
   if(!frames.length)throw Error('No authored bridge for '+actor.from+' → '+actor.to);
   clip=frames.map((rows,i)=>({rows,facing:actor.facing??1,hold:frames.holds?.[i]??160}));
  }else if(actor.kind==='turn'){
   clip=polish.turnFrames(art,actor.facing??1,[140,160,260,220,160]).map(([rows,facing,hold])=>({rows,facing,hold,...(rows===art.idleSequences.sit.frames[0]?{pose:'sit',frame:0}:rows===art.stand?{sequence:'sequence-stand',frame:0}:{sequence:'transition'})}));
  }else if(actor.kind==='crouch'){
   clip=art.sneak.slice(0,2).map(c=>({rows:c.frames[0],facing:actor.facing??1,hold:220}));
  }else if(actor.kind!=='box'&&(actor.kind!=='pose'||!art.idleSequences[actor.pose]))throw Error('Unknown media action');
  const ms=Math.ceil((motion?.duration??clip?.reduce((sum,f)=>sum+f.hold,0)??step.ms)/frameMs)*frameMs+(motion&&!motion.jumpProfile?frameMs:0);
  if(!Number.isFinite(ms)||ms<=0)throw Error('Invalid stage duration');
  let strikeAt;
  if(step.mouse.kind==='strike'){
   if(actor.pose!=='bat')throw Error('Strike needs the authored batting clip');
   strikeAt=art.idleSequences.bat.durations.slice(0,art.interactionContacts.bat.frame).reduce((sum,_,i)=>sum+window.pixelCatPolishV1.hold('bat',art.idleSequences.bat,i,1),0);
   if(ms<art.idleSequences.bat.durations.reduce((a,b)=>a+b,0))throw Error('Bat stage must include the complete authored clip');
  }
  stages.push({...step,start:clock,ms,motion,clip,strikeAt});clock+=ms;
 }
 if(clock>60000)throw Error('Scene exceeds one minute');
 function sample(time){
  const t=((time%clock)+clock)%clock,stage=stages.find(s=>t<s.start+s.ms),elapsed=t-stage.start;
  const c=stage.cat;let facing=stage.motion?.direction??c.facing??1;
  let rows,x,top,frame,walk,mask,pose=c.pose,sequence;
  if(c.kind==='box'){
   const box=window.pixelCatBoxV1.asset,svg=mediaElement();svg.firstElementChild=mediaElement();
   const actor={svg,scale,lifeStage:'adult',ownerKey:recipe.id,draw(r){this.rows=r;},status(){},setAttribute(k,v){this[k]=v;}};
   const floor={id:'scene:floor',left:recipe.floor.left,right:recipe.floor.right,min:recipe.floor.left,max:recipe.floor.right-24*scale,top:ground};
   const left=c.boxX,right=left+box.width*scale,bottom=ground-1;
   const geometry={floor,node:{},s:scale,cell:scale,left,right,rim:bottom-6*scale,upperEdge:bottom-box.height*scale,centre:(left+right)/2};
   window.pixelCatBoxV1.render(actor,geometry,{phase:c.phase,facing,elapsed:c.atMs??elapsed},t);
   rows=actor.rows;x=actor.x;top=Number(/,([\d.-]+)px/.exec(actor.svg.style.transform)[1]);
   frame=Number(actor['data-frame'].split('-').at(-1))-1;pose=actor['data-pose'];sequence=actor['data-sequence-id'];
   mask={left,right,rim:geometry.rim};
  }else if(stage.motion?.jumpProfile){
   const value=jumper.jumpSample(stage.motion,Math.min(1,elapsed/stage.motion.duration));
   ({rows,x,top,frame}=value);
  }else if(stage.motion){
   walk=api.walkSample(stage.motion,elapsed,scale,art.walk);
   rows=api.walkAppearance(art,stage.motion,walk,config).rows;x=walk.x;top=ground-24*scale;frame=walk.frame;
   sequence=stage.motion.fastClip?.sequenceId||(stage.motion.sneakTimeline?art.sneak[walk.variant].sequenceId:'walk');
  }else if(stage.clip){
   let remaining=elapsed;const value=stage.clip.find((f,i)=>{if(remaining<f.hold||i===stage.clip.length-1)return true;remaining-=f.hold;return false;});
   rows=value.rows;facing=value.facing;pose=value.pose;frame=value.frame;sequence=value.sequence;
   const anchor=api.frameContact(rows,facing,value.anchor||api.idleContact(rows));
   const first=stage.clip[0],startAnchor=api.frameContact(first.rows,first.facing,first.anchor||api.idleContact(first.rows));
   const bearing=c.kind==='turn'?polish.turnFeet(rows,facing):anchor[0];
   const startBearing=c.kind==='turn'?polish.turnFeet(first.rows,first.facing):startAnchor[0];
   x=c.x+(startBearing-bearing)*scale;top=ground-(anchor[1]+1)*scale;
  }else{
   const authored=art.idleSequences[c.pose];
   const cycleStart=c.cycleOnly?authored.roles.reduce((sum,role,i)=>sum+(role==='enter'?polish.hold(c.pose,authored,i):0),0):0;
   const cycleMs=c.cycleOnly?authored.roles.reduce((sum,role,i)=>sum+(role==='cycle'?polish.hold(c.pose,authored,i):0),0):0;
   if(c.cycleOnly&&!cycleMs)throw Error('Pose has no authored cycle');
   const poseTime=c.cycleOnly?cycleStart+(c.atMs??elapsed)%cycleMs:c.atMs??elapsed+(c.offset||0);
   const poseConfig={...config,track_seed:recipe.id,clip_exit_at_ms:c.cycleOnly||c.pose==='sleep'?undefined:stage.ms};
   const value=api.idleSample(art,c.pose,poseTime,poseConfig);
   rows=value.rows;frame=value.frame;
   const anchor=api.frameContact(rows,facing,value.anchor||api.idleContact(rows));
   const first=api.idleSample(art,c.pose,c.cycleOnly?cycleStart:c.atMs??c.offset??0,poseConfig);
   const startAnchor=api.frameContact(first.rows,facing,first.anchor||api.idleContact(first.rows));
   x=c.contactX!==undefined?c.contactX-anchor[0]*scale:c.x+(startAnchor[0]-anchor[0])*scale;top=ground-(anchor[1]+1)*scale;
  }
  sequence??=art.idleSequences[pose]?.sequenceId;
  const cat={id:'cat',rows,x,top,facing,frame,pose,sequence,walk,mask,ground,airborne:!!stage.motion?.jumpProfile&&frame===2,colour:recipe.colour,outline:recipe.outline,outlinePath:recipe.outline?window.pixelCatOutlineV1.path(rows,facing):undefined};
  mouthActor.facing=facing;mouthActor.idle=pose?{pose}:null;mouthActor.motion=stage.motion;
  mouthActor.attrs={'data-frame':`${pose?'idle-'+pose:sequence||'transition'}-${frame+1}`,'data-sequence-id':sequence};
  mouthActor.social.capture(rows,{x,top});
  const mouth=window.pixelCatMouthV1.mouth(mouthActor,rows,{x,top},art);
  const toy=art.dashboardProps.find(p=>p.id==='toy_mouse'),m=stage.mouse;
  if(!['move','held','rest','fall','strike','hidden'].includes(m.kind))throw Error('Unknown mouse action');
  let mx=m.x,my=ground-toy.height*scale;
  const u=Math.min(1,elapsed/(m.ms||stage.ms));
  if(m.kind==='move'||m.kind==='fall'){mx=m.x+(m.to-m.x)*u;if(m.kind==='fall')my+=180*u*u;}
  if(m.kind==='held'){mx=mouth.x-toy.width*scale/2;my=mouth.y-toy.height*scale/2;}
  if(m.kind==='strike'){
   const seconds=Math.max(0,elapsed-stage.strikeAt)/1000;
   mx=m.x+seconds*m.speed;
   const edge=m.speed>0?recipe.floor.right:recipe.floor.left;
   const fallSeconds=Math.max(0,seconds-(edge-m.x-toy.width*scale/2)/m.speed);
   my+=400*scale*fallSeconds*fallSeconds/2;
  }
  if(m.kind==='rest'&&m.fromMouth){
   const p=Math.min(1,elapsed/240);my=mouth.y-toy.height*scale/2+(ground-toy.height*scale-(mouth.y-toy.height*scale/2))*p*p;
  }
  return {id:stage.id,label:stage.label,actors:[cat],props:m.kind==='hidden'?[]:[{asset:'toy_mouse',x:Math.round(mx),top:Math.round(my),facing:m.facing??(m.kind==='held'?facing:1)}],mouth,elapsed};
 }
 const frames=Array.from({length:clock/frameMs},(_,i)=>sample(i*frameMs));
 return {api,recipe,stages,duration:clock,frameMs,sample,payload:{schema:1,recipe,assets:{toy_mouse:art.dashboardProps.find(p=>p.id==='toy_mouse')},duration:clock,frameMs,queue:stages.map(({id,label,start,ms})=>({id,label,start,ms})),frames}};
}

function compileTracks(recipe){
 if(!recipe.tracks.length||recipe.tracks.length>8)throw Error('Scene needs 1–8 actor tracks');
 if(new Set(recipe.tracks.map(t=>t.id)).size!==recipe.tracks.length)throw Error('Duplicate actor ID');
 const duration=recipe.durationMs,frameMs=20;
 const tracks=[];
 for(const track of recipe.tracks){
  const base={...recipe,tracks:undefined,id:recipe.id+':'+track.id,ground:track.ground??recipe.ground,colour:track.colour,outline:track.outline},stages=[];
  for(const source of track.stages){
   const step={...source,mouse:{kind:'hidden'}};
   if(step.until){
    const start=stages.length?compileScene({...base,stages}).duration:0;
    let end;
    if(step.until.sceneEndOffsetMs!==undefined)end=duration+step.until.sceneEndOffsetMs;
    else{
     const reference=tracks.find(t=>t.id===step.until.track)?.playback.stages.find(s=>s.id===step.until.stage);
     if(!reference)throw Error('Media cue must reference a stage in an earlier actor track');
     end=reference.start+(step.until.offsetMs??0);
    }
    step.ms=end-start;
    if(!Number.isFinite(step.ms)||step.ms<=0)throw Error('Media cue must end after the current stage starts');
   }
   stages.push(step);
  }
  tracks.push({id:track.id,playback:compileScene({...base,stages})});
 }
 if(!Number.isInteger(duration/frameMs)||duration<=0||duration>60000||tracks.some(t=>duration%t.playback.duration!==0))throw Error('Actor tracks must loop exactly within the scene duration');
 const api=tracks[0].playback.api,assets=releaseSceneAssets(api),markers=new Map();
 for(const track of tracks)for(let offset=0;offset<duration;offset+=track.playback.duration)for(const stage of track.playback.stages){
  const start=offset+stage.start;
  markers.set(start,[...(markers.get(start)||[]),track.id+': '+stage.label]);
 }
 const queue=[...markers].sort(([a],[b])=>a-b).map(([start,labels],i,list)=>({id:'cue-'+start,start,ms:(list[i+1]?.[0]??duration)-start,label:labels.join(' · ')}));
 function sample(time){
  const t=((time%duration)+duration)%duration,cue=queue.find(q=>t<q.start+q.ms);
  return {id:cue.id,label:cue.label,actors:tracks.flatMap(track=>track.playback.sample(t).actors.map(a=>({...a,id:track.id}))),props:[],elapsed:t-cue.start};
 }
 const frames=Array.from({length:duration/frameMs},(_,i)=>sample(i*frameMs));
 return {api,recipe,tracks,stages:queue,duration,frameMs,sample,payload:{schema:1,recipe,assets,duration,frameMs,queue,frames}};
}
