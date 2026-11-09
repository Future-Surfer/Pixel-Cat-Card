// Experimental dashboard adapter. No service calls or foreign-card mutations.
// HA may load module resources concurrently. Resolve artwork at playback time.
// Resolve individual clips lazily; enumeration still exposes the merged catalogue.
const catSequenceSources=()=>[window.pixelCatRoamingArtV2?.idleSequences,window.pixelCatRoamingExtrasV1?.idleSequences,window.pixelCatRoamingExtensionsV1?.idleSequences];
const catSequenceDescriptor=key=>{const sources=catSequenceSources();for(let i=sources.length-1;i>=0;i--){const d=sources[i]&&Object.getOwnPropertyDescriptor(sources[i],key);if(d?.enumerable)return {...d,configurable:true};}};
const catSequences=new Proxy({},{has:(target,key)=>!!catSequenceDescriptor(key)||Reflect.has(target,key),get:(target,key)=>{const d=catSequenceDescriptor(key);return d?'value'in d?d.value:d.get?.call(catSequenceSources().findLast(s=>s&&Object.prototype.propertyIsEnumerable.call(s,key))):Reflect.get(target,key);},ownKeys:()=>[...new Set(catSequenceSources().flatMap(s=>s?Reflect.ownKeys(s).filter(k=>Object.prototype.propertyIsEnumerable.call(s,k)):[]))],getOwnPropertyDescriptor:(_,key)=>catSequenceDescriptor(key)});
let catPropSources=[],catPropValues=[];
const catProps=()=>{const a=window.pixelCatRoamingExtrasV1?.dashboardProps||[],b=window.pixelCatRoamingExtensionsV1?.dashboardProps||[];if(catPropSources[0]!==a||catPropSources[1]!==b||catPropValues.length!==a.length+b.length||a.some((p,i)=>p!==catPropValues[i])||b.some((p,i)=>p!==catPropValues[a.length+i])){catPropSources=[a,b];catPropValues=[...a,...b];}return catPropValues;};
const CAT_ART = new Proxy({}, {get:(_,key)=>key==='idleSequences'?catSequences:key==='dashboardProps'?catProps():window.pixelCatRoamingExtrasV1?.[key]??window.pixelCatRoamingArtV2?.[key]});
const cellSnap = (value,scale) => Math.round(value/scale)*scale;
const travelSpeed = (config={},urgency='relaxed') => Math.max(1,Math.min(60,Number(config[urgency==='casual'?'casual_speed':urgency==='prompted'?'prompted_speed':urgency==='interested'?'interested_speed':'relaxed_speed'])||(urgency==='casual'?0:Number(config.walk_speed))||(urgency==='casual'?6:urgency==='prompted'?32:urgency==='interested'?24:9)));
const restDuration = (config={},home=false,actor) => {const ms=Math.max(1000,Number(config[home?'home_rest_ms':'rest_ms'])||10000);return actor?(window.pixelCatBehaviourV1?.restWindow(actor,ms)??ms):ms;};
const headDivisor = (config,rate) => config.walk_head_bob==='step'?1:config.walk_head_bob==='half'?2:rate>=(Number(config.head_bob_half_speed)||18)?2:1;
const walkTimings = (cells,config={},urgency='relaxed') => window.pixelCatPolishV1.walkTimings(cells,config,urgency,travelSpeed(config,urgency),headDivisor);
const surfaceFromDefinition = (def,r,size) => {
  if(!def||typeof def.id!=='string'||!['percent','pixels'].includes(def.units||'percent'))return null;
  const values=[def.x1,def.x2,def.y];if(!values.every(Number.isFinite))return null;
  const percent=(def.units||'percent')==='percent';if(values.some(v=>v<0)||def.x2<=def.x1||(percent&&values.some(v=>v>100)))return null;
  const left=r.left+(percent?r.width*def.x1/100:def.x1),right=r.left+(percent?r.width*def.x2/100:def.x2),top=r.top+(percent?r.height*def.y/100:def.y);
  if(right>r.right||top>r.bottom||right-left<size/2)return null;
  return {left,right,top,label:String(def.label||def.id).slice(0,100),internal:true,interest:!!def.interest,poses:Array.isArray(def.poses)?def.poses.filter(p=>['sit','stand','loaf','look','lookdown','clean','stretch'].includes(p)):null};
};
const cardOwnerFor = el => {let host=el;while(host){const c=host.config||host._config;if(c&&typeof c==='object'&&typeof c.type==='string')return host;host=host.parentElement||host.getRootNode()?.host;}return el;};
const cardConfigFor = el => {const owner=cardOwnerFor(el);return owner.config||owner._config||{};};
// Sideways short drops include the 14-cell igloo roof. Keep tall drops,
// steeper hops and rises above 12 cells on their dedicated pose families.
const jumpKindFor = (fromY,toY,scale,dx=0) => {const dy=Math.abs(toY-fromY);return dy<=4*scale||dy<=(toY>fromY?16:12)*scale&&Math.abs(dx)>=2*dy?'across':toY>fromY?'descend':'ascend';};
const JUMP_HOLDS = {ascend:[1,3,1,1,1],descend:[1,1,1,3],across:[1,2,2,2]};
const CENTRES=new WeakMap();
const bodyCentre = (rows,facing=1) => {let c=CENTRES.get(rows);if(!c){let x=0,y=0,n=0;rows.forEach((row,py)=>[...row].forEach((v,px)=>{if(v==='#'){x+=px+.5;y+=py+.5;n++;}}));c={x:n?x/n:12,y:n?y/n:12};CENTRES.set(rows,c);}return {x:facing<0?24-c.x:c.x,y:c.y};};
const ballistic = (start,end,scale,config={}) => {
  const gravity=Math.max(100,Math.min(1000,Number(config.jump_gravity)||400))*scale,maxSpeed=Math.max(40,Math.min(240,Number(config.jump_speed)||140))*scale,maxRise=Math.max(12,Math.min(100,Number(config.jump_max_rise)||90))*scale;
  const dx=end.x-start.x,dy=end.y-start.y,clearance=Number.isFinite(config.jump_clearance)?Math.max(0,Math.min(16,config.jump_clearance))*scale:dy>4*scale?0:6*scale,apex=Math.min(start.y,end.y)-clearance;
  let seconds=(Math.sqrt(2*gravity*(start.y-apex))+Math.sqrt(2*gravity*(end.y-apex)))/gravity;
  seconds=Math.max(.18,seconds,Math.abs(dx)/maxSpeed);const vx=dx/seconds,vy=(dy-.5*gravity*seconds*seconds)/seconds,apexTime=Math.max(0,Math.min(seconds,-vy/gravity)),apexY=start.y+vy*apexTime+.5*gravity*apexTime*apexTime;
  if(start.y-apexY>maxRise||seconds>(config.climbFallSeconds||1.5)||dy>(config.climbFallCells||110)*scale)return null;
  return {start,end,seconds,flightMs:seconds*1000,vx,vy,gravity,apexY};
};
const flightPoint = (flight,q) => {const t=Math.max(0,Math.min(1,q))*flight.seconds;return {x:flight.start.x+flight.vx*t,y:flight.start.y+flight.vy*t+.5*flight.gravity*t*t};};
// A detected disturbance supplies its position. Facing remains unchanged: a
// frontal disturbance sends the body backwards, a rear disturbance forwards.
const startlePlan = (x,surface,facing,sourceX,scale,clip,ceiling=64,config={}) => {
 if(!clip||!surface||surface.narrow||![x,sourceX,scale,surface.left,surface.right,surface.top].every(Number.isFinite)||scale<=0)return null;
 const centre=x+12*scale,away=Math.sign(centre-sourceX);if(!away)return null;
 const low=Math.ceil(surface.left/scale)*scale,high=Math.floor((surface.right-24*scale)/scale)*scale;
 if(x<low||x>high)return null;
 const destination=Math.max(low,Math.min(high,x+away*24*scale));if(away*(destination-x)<4*scale)return null;
 const top=surface.top-24*scale,height=Math.min(8*scale,top-ceiling-scale);if(height<2*scale)return null;
 const gravity=Math.max(100,Math.min(1000,Number(config.jump_gravity)||400))*scale,seconds=2*Math.sqrt(2*height/gravity);
 const enter=clip.durations.slice(0,2).reduce((a,b)=>a+b,0),exit=clip.durations.slice(5).reduce((a,b)=>a+b,0);
 return {fromX:x,fromY:surface.top,x:destination,y:surface.top,target:surface,kind:'startle',direction:facing,away,enter,flightMs:seconds*1000,duration:enter+seconds*1000+exit,flight:{start:{x,y:top},end:{x:destination,y:top},seconds,vx:(destination-x)/seconds,vy:-gravity*seconds/2,gravity}};
};
const startleSample = (m,progress,clip,scale) => {
 const elapsed=Math.max(0,Math.min(1,progress))*m.duration,airEnd=m.enter+m.flightMs;let frame,x=m.fromX,top=m.fromY-24*scale;
 if(elapsed<m.enter)frame=elapsed<clip.durations[0]?0:1;
 else if(elapsed<airEnd){const q=(elapsed-m.enter)/m.flightMs,holds=clip.durations.slice(2,5),total=holds.reduce((a,b)=>a+b,0);let time=q*total;frame=2;while(frame<4&&time>=holds[frame-2]){time-=holds[frame-2];frame++;}({x,y:top}=flightPoint(m.flight,q));}
 else {x=m.x;frame=elapsed-airEnd<clip.durations[5]?5:6;}
 return {x,top,rows:clip.frames[frame],origin:clip.origins[frame],gaze:clip.gazes[frame],sequenceId:clip.sequenceId,kind:'startle',frame,assetFrame:frame};
};
const jumpGeometry = (m,art,scale) => {
  const kind=m.jumpKind,clip=art[kind],anchors=art.leapAnchors[kind],facing=m.direction;
  const placed=(rows,point,wx,wy)=>{const p=frameContact(rows,facing,point);return {rows,x:wx-p[0]*scale,top:wy-(p[1]+1)*scale};};
  const landingX=m.x+frameContact(clip.at(-1),facing,anchors.at(-1).point)[0]*scale;
  let departure;
  if(kind==='descend'){const edge=art.descentEdges[1],worldEdge=facing>0?m.fromX+24*scale:m.fromX;departure={rows:clip[1],x:worldEdge-(facing<0?23-edge.edgeX:edge.edgeX)*scale,top:m.fromY-(edge.support[1]+1)*scale};}
  else {const takeoffX=m.fromX+frameContact(clip[0],facing,anchors[0].point)[0]*scale;departure=placed(clip[1],anchors[1].point,takeoffX,m.fromY);}
  const arrival=placed(clip[3],anchors[3].point,landingX+(kind==='ascend'?(anchors[3].edgeOffset-7)*facing*scale:0),m.y);
  const centre=pose=>{const c=bodyCentre(pose.rows,facing);return {x:pose.x+c.x*scale,y:pose.top+c.y*scale};};return {departure,arrival,start:centre(departure),end:centre(arrival)};
};
const buildJumpPlan = (m,art,scale,config={},minimumTop=64) => {
  const geometry=jumpGeometry(m,art,scale),flight=ballistic(geometry.start,geometry.end,scale,m.jumpKind==='ascend'?{...config,jump_clearance:Number.isFinite(config.jump_up_clearance)?config.jump_up_clearance:8}:config);if(!flight)return null;
  const air=art[m.jumpKind][2],c=bodyCentre(air,m.direction),top=flight.apexY-(c.y-catBounds(air).top)*scale;if(top<minimumTop)return null;
  const beat=Math.max(60,Math.min(250,Number(config.jump_frame_ms)||100)),durations=JUMP_HOLDS[m.jumpKind].map((hold,i)=>i===2?flight.flightMs:hold*beat);
  if(m.jumpKind==='descend')durations[1]+=m.hesitationMs||0;
  return {...geometry,flight,durations,duration:durations.reduce((a,b)=>a+b,0)};
};
const jumpBeat = (plan,p) => {let elapsed=Math.max(0,Math.min(1,p))*plan.duration;for(let frame=0;frame<plan.durations.length;frame++){const ms=plan.durations[frame];if(elapsed<ms||frame===plan.durations.length-1)return {frame,phase:Math.min(1,elapsed/ms)};elapsed-=ms;}};
const frameContact = (rows,facing,point) => [facing<0?23-point[0]:point[0],point[1]];
const groundedFront = (rows,facing) => {
  const paws=rows.flatMap((row,y)=>[...row].flatMap((v,x)=>v==='R'?[[facing<0?23-x:x,y]]:[]));
  const bottom=Math.max(...paws.map(p=>p[1]));
  const planted=paws.filter(p=>p[1]===bottom);
  return (facing<0?Math.min:Math.max)(...planted.map(p=>p[0]));
};
const gallopRate = (clip,config={}) => Math.max(15,Math.min(30,Number(config.gallop_fps)||clip?.fps||25));
const gallopTimeline = (cells,art,config={},clip=art.gallop) => {
 const rate=gallopRate(clip,config),stride=clip.strideCells,cycles=Math.floor(cells/stride),timeline=[];let offset=0,time=0;
 for(let cycle=0;cycle<cycles;cycle++)for(let frame=0;frame<clip.frames.length;frame++){offset+=clip.advances[frame];time+=1000/rate;timeline.push({offset,frame,rows:clip.frames[frame],origin:clip.origins[frame],sequenceId:clip.sequenceId,grounded:clip.grounded[frame],until:time});}
 // Finish any fractional stride with the normal head-high walk, rather than
 // shortening a planted gallop step or overshooting the requested destination.
 for(let step=0;offset<cells;step++){offset++;const frame=step%art.walk.length,rows=art.walkHigh?.[frame]||art.walk[frame];time+=1000/12;timeline.push({offset,frame,rows,origin:art.walkHeadProvenance?.[frame]?.[0]?.origin||'human',sequenceId:'sequence-walk-high',grounded:true,until:time});}
 return timeline;
};
const walkSample = (motion,elapsed,scale,frames) => {
  if(motion.gallopTimeline){const list=motion.gallopTimeline;let i=0;while(i<list.length-1&&elapsed>=list[i].until)i++;const beat=list[i];return {x:motion.fromX+motion.direction*beat.offset*scale,step:i,frame:beat.frame,beat};}
  if(motion.fastClip)frames=motion.fastClip.frames;
  if(motion.sneakTimeline){const list=motion.sneakTimeline;let i=0;while(i<list.length-1&&elapsed>=list[i].until)i++;const beat=list[i];return {x:motion.fromX+motion.direction*beat.offset*scale,step:i,frame:beat.frame,variant:beat.variant};}
  let steps;if(motion.cumulativeMs){let low=0,high=motion.cumulativeMs.length;while(low<high){const mid=(low+high)>>1;if(motion.cumulativeMs[mid]<=elapsed)low=mid+1;else high=mid;}steps=low;}else steps=Math.min(motion.cells,Math.max(0,Math.floor(elapsed/motion.stepMs)));
  return {x:motion.fromX+motion.direction*steps*scale,step:steps,frame:(motion.gaitStart+steps+1)%frames.length};
};
const walkAppearance = (art,motion,sample,config={}) => {
 if(motion.gallopTimeline)return {...sample.beat,head:'gallop-authored'};
 if(motion.fastClip)return {rows:motion.fastClip.frames[sample.frame],head:'fast-authored',origin:motion.fastClip.origins[sample.frame]};
 if(motion.sneakTimeline){const clip=art.sneak[sample.variant];return {rows:clip.frames[sample.frame],origin:clip.origins[sample.frame],head:['sneak-high','sneak-mid','sneak-low'][sample.variant]};}
 const mode=config.walk_head_bob||'auto';
 if(mode==='step'||!art.walkHeadVariants)return {rows:art.walk[sample.frame],head:null,origin:'human'};
 let head;
 if(mode==='high'||mode==='low')head=mode==='high'?0:1;
 else if(mode==='cycle')head=Math.floor((motion.gaitStart+sample.step+1)/4)%2;
 else if(mode==='auto'){
  // Hold a chosen head for complete gait cycles. Different runs of one to three
  // cycles create relaxed variation without coupling the head to paw placement.
  const cycle=Math.floor((motion.gaitStart+sample.step+1)/4),pattern=[0,0,1,0,1,1,1,0,0,0,1,1];
  head=pattern[((cycle+(motion.headSeed||0))%pattern.length+pattern.length)%pattern.length];
 }else {const offset=motion.headOffsets?.[sample.step]??sample.step,phase=Math.floor((motion.headStart??motion.gaitStart??0)+offset+1)%4;head=phase===0||phase===3?0:1;}
 return {rows:art.walkHeadVariants[sample.frame][head],head,origin:art.walkHeadProvenance[sample.frame][head].origin};
};
const freefallProgress = (m,phase,scale,config={}) => {
 if((config.test_freefall_pose??config.freefall_enabled??true)===false||m.jumpKind!=='descend'||m.y-m.fromY<36*scale)return null;
 const f=m.jumpProfile?.flight;if(!f)return phase>=.55?(phase-.55)/.45:null;
 // Enter only after actually falling twelve cells; a long lateral descent
 // qualifies too. Preserve the ballistic centre and landing contacts.
 const distance=12*scale,entry=(-f.vy+Math.sqrt(f.vy*f.vy+2*f.gravity*distance))/f.gravity,time=phase*f.seconds;
 return time>=entry&&f.vy+f.gravity*time>0?Math.min(1,(time-entry)/Math.max(.001,f.seconds-entry)):null;
};
const airborneSample = (art,m,phase,scale,config={}) => {
 if(m.jumpKind==='across'&&art.acrossFlight){const c=art.acrossFlight,i=sequenceFrame(phase,c.durations).frame;return {rows:c.frames[i],origin:c.origins[i],sequenceId:c.sequenceId,assetFrame:i};}
 const apex=window.pixelCatBehaviourRefinementsV1?.apex(art,m,phase,config);if(apex)return apex;
 const progress=freefallProgress(m,phase,scale,config),c=art.freefallSequence;
 if(progress!==null&&c){const i=sequenceFrame(progress,c.durations).frame;return {rows:c.frames[i],origin:c.origins[i],sequenceId:c.sequenceId,assetFrame:i};}
 return {rows:art[m.jumpKind][2],origin:'human',sequenceId:m.jumpKind,assetFrame:2};
};
const airborneRows = (...args) => airborneSample(...args).rows;
const sneakTimeline = (cells,art,start) => window.pixelCatPolishV1.sneakTimeline(cells,art,start);
const movementFacing = (fromX,toX,scale,current,kind) => Math.abs(toX-fromX)<(kind==='jump'?6:1)*scale?(current||1):toX>fromX?1:-1;
const sequenceFrame = (progress,holds) => {
  const total=holds.reduce((a,b)=>a+b,0), beat=Math.min(total-1e-6,Math.max(0,progress)*total);
  let start=0;
  for(let frame=0;frame<holds.length;frame++) {if(beat<start+holds[frame]) return {frame,phase:(beat-start)/holds[frame]};start+=holds[frame];}
};
const batRecipe=(value=Math.random())=>value<.3?['pat']:value<.5?['pat','pat']:value<.7?['bat']:value<.9?['pat','bat']:['pat','pat','bat'];
const GENTLE_BAT_CLIPS=new WeakMap();
const batClipFor=(art,config={})=>{const clip=art.idleSequences?.bat;if(!clip||config.bat_stroke!=='pat')return clip;if(!GENTLE_BAT_CLIPS.has(clip)){const indices=[0,1,2,3,2,1,0];GENTLE_BAT_CLIPS.set(clip,{...clip,frames:indices.map(i=>clip.frames[i]),anchors:indices.map(i=>clip.anchors[i]),origins:indices.map(i=>clip.origins[i]),durations:[200,160,180,160,140,120,180],roles:['enter','enter','cycle','cycle','exit','exit','exit'],loop:false});}return GENTLE_BAT_CLIPS.get(clip);};
// Shared authored idle clocks; no procedural body or tail pixels.
const idleSample = (art,pose,elapsed,config={}) => {
  const authored=pose==='bat'?batClipFor(art,config):art.idleSequences?.[pose];if(window.pixelCatBehaviourV1?.allowed(config,authored)===false)return {rows:art.stand,frame:0};if(authored){
   const rate=Math.max(80,Number(config.idle_frame_ms)||250)/250,roles=authored.roles||authored.frames.map(()=> 'cycle'),indices=role=>roles.flatMap((r,i)=>r===role?[i]:[]),enter=indices('enter'),cycle=indices('cycle'),exit=indices('exit'),hold=i=>window.pixelCatPolishV1?.hold(pose,authored,i,rate)??authored.durations[i]*rate,duration=indices=>indices.reduce((n,i)=>n+hold(i),0);let list=enter,remaining=Math.max(0,elapsed),entryMs=duration(enter);
   const exitAt=Number(config.clip_exit_at_ms),exitStart=exitAt-duration(exit);
   if(exit.length&&Number.isFinite(exitAt)&&remaining>=exitStart){list=exit;remaining=Math.max(0,remaining-exitStart);}else if(remaining>=entryMs){list=cycle.length?cycle:enter.length?enter:exit;remaining=Math.max(0,remaining-entryMs);const total=duration(list);remaining=authored.loop&&cycle.length?remaining%total:Math.min(remaining,Math.max(0,total-.001));}
   if(!list.length)list=authored.frames.map((_,i)=>i);let frame=list[0];for(const i of list){frame=i;if(remaining<hold(i))break;remaining-=hold(i);}return window.pixelCatTrackRuntimeV1?.sample(authored,frame,elapsed,config)||{rows:authored.frames[frame],frame,anchor:authored.anchors[frame],origin:authored.origins[frame]};
  }
  const clips=art.idle;if(!clips)return {rows:pose==='loaf'?art.loaf:art.sit,frame:0};
  const ms=Math.max(80,Number(config.idle_frame_ms)||250),tick=Math.floor(Math.max(0,elapsed)/ms);
  const steps=(key,fallback)=>Math.max(1,Math.round(Number(config[key])||fallback));
  let rows,frame;
  if(pose==='sit'||pose==='stand') {const prefix=pose==='sit'?'sit':'stand_pause',body=Math.floor(tick/steps(prefix+'_breath_steps',4))%2,tail=Math.floor(tick/steps(prefix+'_tail_steps',3))%2;rows=clips[pose][body][tail];frame=body*2+tail;}
  else if(pose==='loaf'){const low=steps('loaf_low_head_steps',12),alert=steps('loaf_alert_steps',1);frame=tick%(low+alert)<low?0:1;rows=clips.loaf[frame];}
  else if(pose==='stretch'){const total=clips.stretchHolds.reduce((a,b)=>a+b,0);if(tick>total)return idleSample(art,'stand',elapsed-(total+1)*ms,config);frame=sequenceFrame(Math.min(1,tick/total),clips.stretchHolds).frame;rows=clips.stretch[frame];}
  else {const frames=clips[pose]||clips.sit.flat();frame=Math.floor(tick/(pose==='perch'?3:1))%frames.length;rows=frames[frame];}
  return {rows,frame};
};
const idleContact = rows => {
  const paws=rows.flatMap((row,y)=>[...row].flatMap((v,x)=>v==='R'?[[x,y]]:[]));
  const bottom=paws.length?Math.max(...paws.map(p=>p[1])):catBounds(rows).bottom-1;
  const planted=paws.filter(p=>p[1]===bottom);
  return [planted.length?Math.max(...planted.map(p=>p[0])):catBounds(rows).right-1,bottom];
};
// Look-down leans over an edge on its rear bearing. Rebase contact semantics
// at sequence boundaries; carrying a front-paw coordinate into a rear anchor
// translates identical entry/exit artwork by three native cells.
const rearContact=rows=>{const y=idleContact(rows)[1],xs=[...rows[y]].flatMap((v,x)=>v==='R'?[x]:[]);return [xs.length?Math.min(...xs):idleContact(rows)[0],y];};
const idleTransitionContact=(old,pose,first,facing,scale,x,previousFacing=facing)=>{
 const anchor=frameContact(first.rows,facing,first.anchor||idleContact(first.rows));
 if(old?.rows&&old.placement&&(['lookdown','bat'].includes(old.pose)||['lookdown','bat'].includes(pose))){
  const rear=frameContact(old.rows,old.facing??previousFacing,rearContact(old.rows)),nextRear=frameContact(first.rows,facing,rearContact(first.rows));
  return old.placement.x+rear[0]*scale+(anchor[0]-nextRear[0])*scale;
 }
 if(old?.rows&&old.placement&&(old.anchor||first.anchor)){const before=frameContact(old.rows,old.facing??previousFacing,idleContact(old.rows)),after=frameContact(first.rows,facing,idleContact(first.rows));return old.placement.x+(before[0]+anchor[0]-after[0])*scale;}
 return old?.contactX??x+anchor[0]*scale;
};
const narrowIdleContact=(surface,rows,point,facing,scale,contactX,pose)=>{
 const xs=pose==='lookdown'?[point[0]]:[...rows[point[1]]].flatMap((v,x)=>v==='R'?[facing<0?23-x:x]:[]),lo=Math.min(...xs),hi=Math.max(...xs),low=Math.ceil(surface.left/scale+point[0]-lo)*scale,high=Math.floor(surface.right/scale-hi+point[0]-1)*scale;
 return Math.max(low,Math.min(high,contactX));
};
const CAT_OWNERS = new Map();
const CAT_KEYS = new WeakMap();
const claimCatOwner = (cat,requested,root) => {const base=String(requested||'cat').replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,80)||'cat',previous=CAT_KEYS.get(cat),used=new Set([...CAT_OWNERS.values()].map(v=>v.key));let key=previous?.base===base&&!used.has(previous.key)?previous.key:base;let suffix=2;while(used.has(key))key=base+'-'+suffix++;CAT_KEYS.set(cat,{base,key});CAT_OWNERS.set(cat,{key,root});return key;};
const homeCardFor = el => {while(el){if(el.localName==='pixel-cat-home')return el;el=el.parentElement||el.getRootNode?.()?.host;}return null;};
const sharedHomeSurfaceAllowed=(el,config)=>{for(let p=el;p;p=p.parentElement||p.getRootNode?.()?.host)if(p.localName==='pixel-cat-monitor')return false;const owner=homeCardFor(el);return !owner||!!(config.shared_home_surfaces&&owner.config?.shared_home_surfaces&&owner.config?.show_home!==false&&owner.active&&el===owner.shadowRoot?.querySelector('ha-card'));};
const editorPreviewFor = el => {while(el){if(['hui-card-preview','hui-card-picker','hui-dialog-edit-card','hui-dialog-edit-dashboard','hui-card-element-editor'].includes(el.localName))return true;el=el.parentElement||el.getRootNode?.()?.host;}return false;};
const attentionWinner = (candidates,x,y) => candidates.filter(c=>c.active&&!c.userHeld&&!c.paused&&c.config.click_attention!==false).map(cat=>({cat,distance:Math.hypot(x-cat.x-12*cat.scale,y-cat.y)})).sort((a,b)=>a.distance-b.distance)[0]?.cat;
// Visits affect leisure destinations only; the routing graph remains available for Home.
const visitWeight = (visits,id,now) => {const v=visits?.get(id);return v?Math.max(.025,1-Math.exp(-Math.max(0,now-v.at)/60000))/(1+v.count*.15):1;};
const weightedPick = (items,weight,random=Math.random) => {const weights=items.map(weight),total=weights.reduce((a,b)=>a+b,0);let p=random()*total;return items.find((_,i)=>(p-=weights[i])<0)||items.at(-1);};
// Peeking is a ledge action: never turn an ordinary interior floor into an edge.
const lookDownFacing=(surface,x,scale,facing=1)=>{if(!surface||surface.home||surface.internal&&!surface.poses?.includes('lookdown'))return null;const left=Math.abs(x-surface.left),right=Math.abs(surface.right-(x+24*scale));if(!surface.narrow&&Math.min(left,right)>8*scale)return null;return Math.abs(left-right)<scale?facing:left<right?-1:1;};
const idlePoseWeight=(pose,history,peek)=>{const recent=Array.isArray(history)?history:history?[history]:[],distance=[...recent].reverse().findIndex(p=>p.pose===pose);return (distance===0?.05:distance===1?.35:distance===2?.65:1)*(pose==='lookdown'?(peek===null?0:3):({backRoll:.15,alertLying:.6,sleep:.5,yawn:.5,meow:.12,chatter:.08,scratch:.85}[pose]||1));};
const restingPoints = surface => {const {min,max}=surface;if(surface.home)return [{id:'bed',x:Math.min(max,min+20*(surface.scale||2)),weight:1}];const base=max-min<12?[{id:'perch',x:(min+max)/2,weight:1}]:[{id:'left',x:min,weight:2},{id:'right',x:max,weight:2},{id:'middle',x:(min+max)/2,weight:1}];return [...base,...surface.roamPoints||[],...surface.propPoints||[],...surface.inspectionPoints||[]];};
const loafBridge = (art,from,to,...context) => window.pixelCatPolishV1?.restBridge?.(art,from,to,...context)??(to==='loaf'&&from!=='loaf'?(['sit','sithead','clean','scratch','yawn','meow','chatter'].includes(from)?[...art.bridges.sitToLoaf]:[...art.bridges.walkToSit,art.sit,...art.bridges.sitToLoaf]):from==='loaf'&&to!=='loaf'?(to==='alertLying'?[art.idleSequences.loaf.frames.at(-1)]:[...art.bridges.sitToLoaf].reverse()):[]);
const deepElements = (root, predicate) => {
  const result = [];
  const visit = node => {
    for (const el of node.children || []) {
      if (predicate(el)) result.push(el);
      if (el.shadowRoot) visit(el.shadowRoot);
      visit(el);
    }
  };
  visit(root);
  if(root.shadowRoot) visit(root.shadowRoot);
  return result;
};
// Content attracts attention but never blocks the foreground cat or creates a ledge.
const cardInspectionTargets = (card,config={}) => {
  const r=card.getBoundingClientRect(),targets=[],seen=new Set();
  const add=(id,x,y,label,source)=>{if(!Number.isFinite(x)||!Number.isFinite(y)||x<r.left||x>r.right||y<r.top||y>r.bottom)return;const key=[Math.round(x/12),Math.round(y/12)].join(':');if(seen.has(key))return;seen.add(key);targets.push({id,x,y,label:String(label||'Interesting detail').slice(0,80),source});};
  for(const p of Array.isArray(config.cat_pois)?config.cat_pois:[]){if(!p||typeof p.id!=='string'||![p.x,p.y].every(Number.isFinite)||p.x<0||p.y<0||p.units&&!['pixels','percent'].includes(p.units))continue;const percent=p.units!=='pixels';if(percent&&(p.x>100||p.y>100))continue;add(p.id,r.left+p.x*(percent?r.width/100:1),r.top+p.y*(percent?r.height/100:1),p.label||p.id,'declared-interest');}
  const details=deepElements(card,el=>el.matches?.('ha-icon,ha-state-icon,h1,h2,h3,.name,.value,.primary,.header,.card-header,.lab-card-title,.lab-icon,.lab-state,.lab-entity-name'));
  for(const [i,el] of details.entries()){const d=el.getBoundingClientRect();if(d.width<=0||d.height<=0||d.width>r.width||d.height>r.height*.6)continue;add('detail-'+i,d.left+d.width/2,d.top+d.height/2,el.getAttribute?.('aria-label')||el.textContent?.trim()||'Card icon','rendered-content');if(targets.length>=6)break;}
  if(['sensor','history-graph','statistics-graph','gauge'].includes(config.type))add('display',r.left+r.width*.55,r.top+r.height*.48,config.type==='gauge'?'Gauge reading':'Graph activity','layout-interest');
  return targets.slice(0,8);
};
const inspectionPointsFor = (surface,targets,scale) => surface.home||surface.narrow?[]:targets.filter(p=>p.y<=surface.top-4*scale&&p.y>=surface.top-70*scale&&p.x>=surface.left-12*scale&&p.x<=surface.right+12*scale).slice(0,3).map(p=>({id:'inspect-'+p.id,x:cellSnap(Math.max(surface.min,Math.min(surface.max,p.x-12*scale)),scale),weight:1.5,pose:'look',lookAt:p,label:'Inspect '+p.label}));
const clickDestination = (surfaces,x,y,scale,canReach=()=>true) => {
  const options=[];for(const s of surfaces){if(!canReach(s))continue;const origin=cellSnap(Math.max(s.min,Math.min(s.max,x-12*scale)),scale);options.push({surface:s,id:s.id+'::click',point:{id:'click',x:origin,weight:1},distance:Math.hypot(x-origin-12*scale,y-s.top)});for(const p of restingPoints(s)){const target=p.lookAt||{x:p.x+12*scale,y:s.top};options.push({surface:s,id:s.id+'::'+p.id,distance:Math.hypot(x-target.x,y-target.y)});}}options.sort((a,b)=>a.distance-b.distance);return options[0]||null;
};
const standardCardSurfaces = (card,config,size) => {
  const type=config.type;if(!['entities','markdown','glance','sensor','history-graph','statistics-graph','tile','button','gauge'].includes(type))return [];
  const r=card.getBoundingClientRect(),result=[];
  if(type==='entities'||type==='markdown'){
    const lines=deepElements(card,node=>type==='entities'?node.localName==='hui-divider-row':node.localName==='hr');
    lines.forEach((node,index)=>{const line=node.localName==='hui-divider-row'?(node.shadowRoot?.querySelector('div')||node):node,rect=line.getBoundingClientRect();if(rect.width<size||rect.height>12||rect.bottom<=r.top||rect.top>=r.bottom)return;
      result.push({id:`native-divider-${index}`,label:'Rendered '+(type==='entities'?'row divider':'horizontal rule'),x1:rect.left-r.left,x2:rect.right-r.left,y:rect.top-r.top,units:'pixels',source:'rendered-divider',poses:['sit','look','lookdown','clean']});});
  }
  result.push({id:'native-content-floor',label:'Foreground floor · unverified candidate',x1:16,x2:r.width-16,y:r.height-16,units:'pixels',candidate:true,source:'layout-candidate',poses:['loaf','sit','clean','look']});
  return result;
};
const cardBottomDefinition=r=>({id:'card-bottom',label:'Bottom border candidate',x1:10,x2:r.width-10,y:r.height,units:'pixels',candidate:true,source:'card-bottom'});
const CAT_BOUNDS=new WeakMap();
const catBounds = rows => {
  if(CAT_BOUNDS.has(rows))return CAT_BOUNDS.get(rows);
  let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
  rows.forEach((row,y)=>{for(let x=0;x<row.length;x++)if(row[x]!=='.'){left=Math.min(left,x);right=Math.max(right,x+1);top=Math.min(top,y);bottom=Math.max(bottom,y+1);}});
  const bounds={left,right,top,bottom};CAT_BOUNDS.set(rows,bounds);return bounds;
};
class PixelCatHome extends HTMLElement {
  static getStubConfig(){return {type:'custom:pixel-cat-home',life_stage:'adult',name:window.pixelCatPolishV1?.name(),color:window.pixelCatPolishV1?.colour(),primary_home:window.pixelCatPrimaryV1?.defaultPrimary()??true,bed_style:Math.random()<.5?'igloo':'simple',arrival:'igloo',show_controls:false,debug_labels:false,mood_behaviour:true,social_behaviour:true,interaction_behaviour:true,dashboard_props:true,prop_reactions:true,landing_reactions:true,startle_followups:true};}
  static async getConfigElement(){await customElements.whenDefined('pixel-cat-home-editor');return document.createElement('pixel-cat-home-editor');}
  constructor() { super(); this.attachShadow({mode:'open'}); this.config = {}; this.facing=1;this.onLayout = e => {window.pixelCatLayoutV1?.notify(this,e);window.pixelCatScrollV1?.mark(this,e);this.invalidate();}; this.onCardClick=event=>this.attractToClick(event); }
  setConfig(config) {
    this.creationColour||=window.pixelCatPolishV1?.colour()||'#222';this.config = {...config,color:config.color||this.creationColour,show_controls:config.show_controls??config.show_home!==false,use_surface_candidates:config.use_surface_candidates!==false}; this.worldScale = Math.max(1,Math.min(6,Math.round(config.cell_size || 2)));this.lifeStage=['kitten','adult','senior'].includes(config.life_stage)?config.life_stage:'adult';this.scale=this.worldScale*(this.lifeStage==='kitten'?.5:1);
    if (this.isConnected) { this.disconnectedCallback(); this.connectedCallback(); }
  }
  set hass(value) { this._hass = value;if(this.monitorCard)this.monitorCard.hass=value; }
  getCardSize() { return this.config.mode==='monitor'?4:this.config.show_home===false&&this.config.show_controls!==true?0:2; }
  getGridOptions() { return {columns:this.config.mode==='monitor'||(this.worldScale||this.scale)>3?12:6,rows:'auto',min_columns:3}; }
  paintHome() {
    this.primaryFlag=null;this.primaryAt=0;this.debugOrganized=false;this.homeArtReady=false;
    this.shadowRoot.innerHTML = window.pixelCatHomeMarkupV1(this);
    window.pixelCatCommandsV1.bind(this,()=>CAT_OWNERS);
    this.debug={verticalSurfaces:!!this.config.debug_vertical_surfaces,surfaces:!!this.config.debug_surfaces,paths:!!this.config.debug_paths,pois:!!this.config.debug_pois};
    const candidateLabel=document.createElement('label');candidateLabel.innerHTML='<input type="checkbox"> Try interior candidates';const candidateInput=candidateLabel.firstElementChild;candidateInput.checked=!!this.config.use_surface_candidates;candidateInput.onchange=()=>{this.config.use_surface_candidates=candidateInput.checked;this.invalidate();};this.shadowRoot.querySelector('details').append(candidateLabel);
    if(this.config.name){const name=document.createElement('strong');name.textContent=String(this.config.name).slice(0,100);this.shadowRoot.querySelector('ha-card').prepend(name);}
    const headLabel=document.createElement('label');headLabel.textContent='Walk head bob ';const headSelect=document.createElement('select');headSelect.setAttribute('aria-label','Walk head bob');for(const [value,label]of [['auto','Natural variation'],['step','Original head bob'],['high','Head high'],['low','Head low'],['cycle','Bob each complete cycle'],['half','Half time']]){const option=document.createElement('option');option.value=value;option.textContent=label;headSelect.append(option);}headSelect.value=this.config.walk_head_bob||'auto';headSelect.onchange=()=>{this.config.walk_head_bob=headSelect.value;const m=this.motion;if(m?.kind==='walk'&&!m.sneakTimeline&&m.cumulativeMs){const step=walkSample(m,performance.now()-m.start,this.scale,CAT_ART.walk).step;m.headOffsets||=Array.from({length:m.cells+1},(_,i)=>i);for(let i=step;i<m.cells;i++){const ms=m.cumulativeMs[i]-(i?m.cumulativeMs[i-1]:0);m.headOffsets[i+1]=m.headOffsets[i]+1/headDivisor(this.config,1000/ms);}}};headLabel.append(headSelect);this.shadowRoot.querySelector('details').append(headLabel);
    const fallLabel=document.createElement('label'),fallToggle=document.createElement('input');fallToggle.type='checkbox';fallToggle.checked=this.config.test_freefall_pose??this.config.freefall_enabled??true;fallToggle.onchange=()=>this.config.test_freefall_pose=fallToggle.checked;fallLabel.append(fallToggle,document.createTextNode('Long-drop freefall'));this.shadowRoot.querySelector('details').append(fallLabel);
    const playButton=document.createElement('button');playButton.textContent='Try playful pounce';playButton.dataset.action='play';playButton.onclick=()=>{if(!this.motion&&!this.route?.length)this.startPlay(performance.now(),true);else {this.playRequested=true;this.status('Pounce queued after this route');}};this.shadowRoot.querySelector('details').append(playButton);
    const dropButton=document.createElement('button');dropButton.textContent='Try long drop';dropButton.dataset.action='drop';dropButton.onclick=()=>this.tryLongDrop();this.shadowRoot.querySelector('details').append(dropButton);
    const actions=document.createElement('select');actions.setAttribute('aria-label','Preview refined action');for(const [value,label]of [['alertLying','Lying alert'],['lookdown','Sit and look down'],['sniff','Ground sniff'],['scratch','Ear scratch'],['yawn','Held yawn'],['meow','Meow'],['chatter','Chatter'],['sleep','Curled sleep'],['rub','Cheek rub - contact preview'],['bat','Bat - contact preview'],['wiggle','Pre-pounce butt wiggle'],['postScratch','Scratching post - contact preview'],['gallop','Gallop - stationary asset review'],['startle-front','Startle from in front'],['startle-behind','Startle from behind']]){const o=document.createElement('option');o.value=value;o.textContent=label;actions.append(o);}const preview=document.createElement('button');preview.textContent='Preview action';preview.onclick=()=>this.requestAction(actions.value);this.shadowRoot.querySelector('details').append(actions,preview);const reviewCanvas=document.createElement('canvas');reviewCanvas.className='gallop-preview';reviewCanvas.width=reviewCanvas.height=96;reviewCanvas.hidden=true;reviewCanvas.setAttribute('aria-label','Refined gallop asset preview');reviewCanvas.style.imageRendering='pixelated';this.shadowRoot.querySelector('details').append(reviewCanvas);
    const report=document.createElement('details');report.innerHTML='<summary>Surface report</summary><pre class="surface-report" style="font-size:10px;white-space:pre-wrap;max-height:220px;overflow:auto"></pre>';this.shadowRoot.querySelector('details').append(report);
    this.installPropControls();this.installMoodControls();
    this.renderHomeProp();
    this.shadowRoot.querySelectorAll('[data-debug]').forEach(input=>{input.checked=this.debug[input.dataset.debug];input.onchange=()=>{this.debug[input.dataset.debug]=input.checked;if(input.dataset.debug==='verticalSurfaces')this.invalidate();this.renderDebug();};});
    this.shadowRoot.querySelector('[data-action="explore"]').onclick = () => this.requestVisit(null,'prompted');
    this.shadowRoot.querySelector('[data-action="home"]').onclick = () => this.requestVisit('home','prompted');
    this.shadowRoot.querySelector('[data-action="visit"]').onclick = () => this.requestVisit(this.shadowRoot.querySelector('.visit').value,'interested');
    this.shadowRoot.querySelector('[data-action="reset"]').onclick = () => {this.social?.finish('reset');this.cancelPlay();this.toyHuntRequested=false;this.support=null;this.motion=null;this.route=[];this.idle=null;this.goal=null;this.invalidate();};
    this.shadowRoot.querySelector('[data-action="pause"]').onclick = () => {
      this.social?.finish('pause');this.paused = !this.paused; this.shadowRoot.querySelector('[data-action="pause"]').textContent = this.paused ? 'Resume' : 'Pause';
    };
  }
  connectedCallback() {
    if(this.active) return;
    if(this.config.mode==='monitor'){customElements.whenDefined('pixel-cat-monitor').then(()=>{if(this.isConnected&&this.config.mode==='monitor'&&!this.monitorCard)window.pixelCatSetupV1?.connect(this);});return;}
    this.bedEntryManaged=true;this.waitingForSurface=false;this.surfaceRetryAt=0;
    this.home=null;this.scale ||= 2; this.paintHome();this.style.display=this.config.show_home===false&&!this.config.show_controls&&!editorPreviewFor(this)?'none':''; this.root=this.worldRoot();
    this.href = location.pathname;
    if(!this.root||editorPreviewFor(this)){this.active=false;this.status('Dashboard preview');for(const button of this.shadowRoot.querySelectorAll('button'))button.disabled=true;return;}
    if(!window.pixelCatWorldV1&&['world_id','world_owner','world_settings'].some(k=>this.config[k]!==undefined)){this.active=false;this.worldReadyHandler??=()=>{this.worldReadyHandler=null;if(this.isConnected)this.connectedCallback();};window.addEventListener('pixel-cat-world-ready',this.worldReadyHandler,{once:true});return;}
    if(window.pixelCatWorldV1&&!window.pixelCatWorldV1.attach(this)){this.active=false;return;}this.active=true;
    window.pixelCatLayoutV1?.join(this);this.ownerKey=claimCatOwner(this,this.config.cat_id,this.root);this.setAttribute('data-cat-id',this.ownerKey);window.pixelCatPrimaryV1?.join(this);
    this.postRest=null;this.signature=null; this.support=null; this.motion=null; this.route=[]; this.paused=!!this.config.start_paused; this.shadowRoot.querySelector('[data-action="pause"]').textContent=this.paused?'Resume':'Pause';this.suspended=false; this.walkSteps=0;this.idle=null;this.play=null;this.nextPlayAt=performance.now()+60000+Math.random()*60000;
    this.layer = document.createElement('div');
    this.layer.dataset.pixelCatOverlay = this.ownerKey;
    this.layer.setAttribute('aria-hidden','true');
    this.layer.style.cssText = 'position:fixed;inset:0;z-index:10;pointer-events:none;overflow:hidden;';
    this.layer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${24*this.scale}" height="${24*this.scale}" viewBox="0 0 24 24" style="position:absolute;pointer-events:none;shape-rendering:crispEdges;overflow:visible"><g></g></svg>`;
    this.layer.style.visibility='hidden';document.body.append(this.layer); this.svg = this.layer.firstElementChild;
    this.debugSvg=document.createElementNS('http://www.w3.org/2000/svg','svg');this.debugSvg.style.cssText='position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none';this.layer.prepend(this.debugSvg);
    if(this.config.dashboard_props===true||DASHBOARD_PROP_SCENES.has(this.root))this.ensurePropScene();
    this.surfaceIds ||= new WeakMap();this.nextSurfaceId ||= 0;
    this.observer = new ResizeObserver(this.onLayout); this.observer.observe(this);
    document.addEventListener('scroll',this.onLayout,true); window.addEventListener('resize',this.onLayout);
    document.addEventListener('visibilitychange',this.onLayout); window.addEventListener('popstate',this.onLayout);
    document.addEventListener('click',this.onCardClick,true);
    this.invalidAt = performance.now(); this.needsMeasure = true; this.deadline = 0; this.lastTick = performance.now();
    this.checkAt = 0;
    // Cached HA views may reconnect before the router commits the new pathname.
    this.raf = requestAnimationFrame(t => {this.href=location.pathname;this.tick(t);});
  }
  disconnectedCallback() {
    if(this.worldReadyHandler){window.removeEventListener('pixel-cat-world-ready',this.worldReadyHandler);this.worldReadyHandler=null;}
    window.pixelCatClimbV1?.cancel(this,'removed',false);window.pixelCatWorldV1?.leave(this);
    window.pixelCatLayoutV1?.leave(this);window.pixelCatPrimaryV1?.leave(this);window.pixelCatDragV1?.uninstall(this);window.pixelCatSetupV1?.disconnect(this);
    if(!this.active) return;
    this.social?.dispose();this.social=null;
    this.active = false;window.pixelCatScrollOverlayV1?.unmount(this.layer);this.scrollCamera=null; cancelAnimationFrame(this.raf); this.layer?.remove();this.moodHalo=null;this.moodDebugAt=0;this.moodAccumulator=0; this.observer?.disconnect();
    document.removeEventListener('scroll',this.onLayout,true); window.removeEventListener('resize',this.onLayout);
    document.removeEventListener('visibilitychange',this.onLayout); window.removeEventListener('popstate',this.onLayout);
    document.removeEventListener('click',this.onCardClick,true);
    this.propScene?.leave(this);this.propScene=null;this.toyHunt=null;
    CAT_OWNERS.delete(this);
  }
  ensurePropScene(){let scene=DASHBOARD_PROP_SCENES.get(this.root);if(!scene){scene=new DashboardPropScene(this.root);DASHBOARD_PROP_SCENES.set(this.root,scene);}for(const [cat,info]of CAT_OWNERS)if(info.root===this.root&&cat.active){cat.propScene=scene;scene.join(cat);}return scene;}
  installPropControls(){
    const box=document.createElement('div');box.className='dashboard-prop-controls';const label=document.createElement('label'),toggle=document.createElement('input');toggle.type='checkbox';toggle.dataset.propsToggle='';toggle.checked=!!this.config.dashboard_props;toggle.onchange=()=>{this.ensurePropScene().setEnabled(toggle.checked);this.invalidate();};label.append(toggle,document.createTextNode('Dashboard props'));box.append(label);
    const moving=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.dataset.propsMoving='';input.checked=true;input.onchange=()=>{const scene=this.ensurePropScene();scene.movingMice=input.checked;for(const p of scene.props)if(p.asset.id==='toy_mouse')p.moving=input.checked;};moving.append(input,document.createTextNode('Moving mice'));box.append(moving);
    for(const [name,action]of [['Spawn post',()=>this.spawnDashboardProp('scratching_post')],['Spawn mouse',()=>this.spawnDashboardProp('toy_mouse')],['Spawn ball',()=>this.spawnDashboardProp('ball')],['Bat a ball',()=>{this.toyAssetRequest='ball';this.toyHuntRequested=true;this.paused=false;this.shadowRoot.querySelector('[data-action="pause"]').textContent='Pause';if(!this.propScene?.props.some(p=>p.asset.id==='ball'))this.spawnDashboardProp('ball');}],['Hunt a toy',()=>{this.toyAssetRequest=null;this.toyHuntRequested=true;this.paused=false;this.shadowRoot.querySelector('[data-action="pause"]').textContent='Pause';if(!this.propScene?.props.length)this.spawnDashboardProp('toy_mouse');}],['Clear props',()=>{const scene=this.propScene;if(!scene)return;scene.clear();for(const cat of scene.members){if(cat.play?.toyId)cat.cancelPlay();else cat.cancelToyHunt();cat.invalidate();}}]]){const b=document.createElement('button');b.textContent=name;b.onclick=action;box.append(b);}const status=document.createElement('small');status.className='prop-scene-status';status.style.display='block';box.append(status);this.shadowRoot.querySelector('details').append(box);
  }
  spawnDashboardProp(id){const result=this.ensurePropScene().spawn(this,id);if(!result)this.status('No suitable reachable surface, or eight-prop limit reached');for(const cat of this.propScene.members)cat.invalidate();return result;}
  cancelToyHunt(t=performance.now()){if(this.toyHunt){this.propScene?.release(this.ownerKey,this.toyHunt.completed?45000:8000);this.toyHunt=null;this.nextToyAt=t+20000;this.removeAttribute?.('data-toy-target');this.removeAttribute?.('data-toy-hunt-wait');}}
  observedToyPoint(toy,surface,forced=false){const point=surface&&propPosition(toy,surface);return this.social?.toyPoint?this.social.toyPoint(toy,surface,point,forced):point;}
  toyPaw(direction){const clip=CAT_ART.across,last=clip.length-1;return frameContact(clip[last],direction,CAT_ART.leapAnchors.across[last].point)[0];}
  toyApproachFor(toy,surface,x){const contact=CAT_ART.interactionContacts?.bat,anchor=CAT_ART.idleSequences?.bat?.anchors[contact?.frame];if(toy.asset.id==='ball'&&(!anchor||(anchor[1]+.5-contact.point[1])*this.scale>toy.asset.height*toy.scale))return null;return toy.asset.id==='ball'?CAT_ART.idleSequences?.bat&&ballBatApproach(surface,x,this.x,this.scale,CAT_ART.interactionContacts.bat.point[0]):toyApproach(surface,x,this.x,this.scale,d=>this.toyPaw(d));}
  startToyBat(t,toy,plan){if(!CAT_ART.idleSequences?.bat||this.motion||this.route?.length)return false;this.facing=plan.direction;if(plan.reactive){this.idle.poseUntil=t;}else this.idle=null;this.play={toyId:toy.id,stage:'bat',pose:'bat',direction:plan.direction,forced:true,supportId:this.support.id,waitUntil:Infinity,struck:false,reactive:!!plan.reactive,strokes:this.config.toy_bat_variation===false?['bat']:batRecipe(),strokeIndex:0};this.setAttribute('data-bat-recipe',this.play.strokes.join(','));this.playHistory=['bat'];this.setAttribute('data-play-stage','bat');this.setAttribute('data-last-play-stages','bat');this.deadline=t+10000;return true;}
  tryIdleMouseBat(t){
    const scene=this.propScene,clip=CAT_ART.idleSequences?.bat,c=CAT_ART.interactionContacts?.bat;
    if(this.social?.episode||!scene?.enabled||!clip||!c||this.config.toy_hunting===false||this.paused||this.motion||this.route?.length||this.play||this.toyHunt||this.goal||this.command||this.previewPose||this.toyHuntRequested||this.playRequested||t<(this.nextReactiveMouseAt||0)||!this.idle||t-this.idle.start<750||!['sit','sithead','perch','look','lookdown','glance'].includes(this.idle.pose)||this.support?.home||this.support?.narrow)return false;
    const anchor=frameContact(clip.frames[c.frame],this.facing,clip.anchors[c.frame]),paw=frameContact(clip.frames[c.frame],this.facing,c.point),x=cellSnap(this.idle.contactX-anchor[0]*this.scale,this.scale),top=cellSnap(this.support.top-(anchor[1]+1)*this.scale,this.scale),contact={x:x+(paw[0]+.5)*this.scale,y:top+(paw[1]+.5)*this.scale};
    if(!Number.isFinite(x)||x<this.support.min||x>this.support.max)return false;
    const toy=scene.props.filter(p=>p.asset.id==='toy_mouse'&&!p.claimedBy&&p.cooldownUntil<=scene.time).find(p=>{const s=propSurfaceFor(this,p);if(s?.id!==this.support.id)return false;const point=propPosition(p,s);return Math.abs(point.x-contact.x)<=p.asset.width*p.scale/2+2*this.scale&&contact.y+this.scale/2>=point.y-p.asset.height*p.scale&&contact.y-this.scale/2<=point.y;});
    if(!toy)return false;
    // Reuse the seated support and facing: no approach, turn or repositioning.
    toy.claimedBy=this.ownerKey;this.toyHunt={id:toy.id,started:t,forced:false,stage:'play',reactive:true};
    if(!this.startToyBat(t,toy,{direction:this.facing,reactive:true})){scene.release(this.ownerKey);this.toyHunt=null;return false;}
    this.nextReactiveMouseAt=t+12000+Math.random()*8000;this.setAttribute('data-toy-target',toy.id);this.setAttribute('data-last-reactive-mouse-bat',toy.id);return true;
  }
  handleToyBatContact(sample,placement,bridging){const p=this.play,c=CAT_ART.interactionContacts?.bat;if(!p||p.stage!=='bat'||p.struck||bridging||this.idle?.pose!=='bat'||!c||sample.frame<c.frame)return false;
    const point=frameContact(sample.rows,this.facing,c.point),contact={x:placement.x+(point[0]+.5)*this.scale,y:placement.top+(point[1]+.5)*this.scale};p.struck=true;const toy=this.propScene?.props.find(toy=>toy.id===p.toyId),mouse=toy?.asset.id==='toy_mouse',hit=mouse?this.propScene.touchMouse(p.toyId,this.ownerKey,contact,this.scale):this.propScene?.strikeBall(p.toyId,this.ownerKey,contact,p.direction,p.strokes?.[p.strokeIndex]==='pat'?.14:1);if(mouse)this.setAttribute('data-last-mouse-bat-result',hit?'contact':'miss');if(hit){this.toyHunt.completed=true;this.setAttribute(mouse?'data-last-mouse-bat':'data-last-ball-bat',p.toyId);this.setAttribute(mouse?'data-last-mouse-contact':'data-last-ball-contact',JSON.stringify({...contact,frame:c.frame}));}return !!hit;
  }
  toyLanding(id,direction){const toy=this.propScene?.props.find(p=>p.id===id),s=toy&&propSurfaceFor(this,toy);return s?cellSnap((this.observedToyPoint(toy,s,this.toyHunt?.forced)?.x??NaN)-this.toyPaw(direction)*this.scale,this.scale):NaN;}
  beginToyHunt(t,forced=false,invitedToy=null){
    const scene=this.propScene;if(!scene?.enabled||this.motion||this.route?.length||this.play||this.goal||this.command||!CAT_ART.sneak?.every(Boolean))return false;
    const options=scene.props.filter(p=>(!invitedToy||p===invitedToy)&&p.asset.affordance!=='scratch'&&!p.claimedBy&&!p.carrier&&!p.ballMotion&&!p.releaseFall&&(forced||p.cooldownUntil<=scene.time)&&(!this.toyAssetRequest||p.asset.id===this.toyAssetRequest)).map(toy=>{const surface=propSurfaceFor(this,toy),point=this.observedToyPoint(toy,surface,forced),approach=point&&this.toyApproachFor(toy,surface,point.x);return {toy,surface,approach};}).filter(p=>p.approach&&this.pathTo(p.surface)&&this.pathTo(this.home,p.surface));if(!options.length){this.setAttribute('data-toy-hunt-wait','No available toy with safe approach and return');return false;}
    this.removeAttribute?.('data-toy-hunt-wait');const option=weightedPick(options,p=>1/(1+p.approach.cost/200)),{toy,surface,approach}=option;this.cancelPlay(t);toy.claimedBy=this.ownerKey;this.toyAssetRequest=null;this.toyHunt={id:toy.id,started:t,forced,stage:'approach'};this.toyHuntRequested=false;this.setAttribute('data-toy-target',toy.id);this.route=[...this.pathTo(surface),{settle:true,surface,x:approach.approach}];this.destinationId=surface.id;this.destinationPoint=toy.id;this.urgency='interested';this.deadline=0;return true;
  }
  updateToyHunt(t){
    if(this.carriedToy||this.mouthAction)return;
    if(!this.propScene?.enabled){if(this.toyHunt)this.cancelPlay(t);return;}
    const hunt=this.toyHunt;
    if(hunt){const toy=this.propScene.props.find(p=>p.id===hunt.id),surface=toy&&propSurfaceFor(this,toy);if(!toy||!surface||toy.claimedBy!==this.ownerKey&&!this.play?.released||t-hunt.started>45000){this.cancelPlay(t);return;}if(hunt.stage==='approach'&&!this.motion&&!this.route?.length){const observed=this.observedToyPoint(toy,surface,hunt.forced),plan=observed&&this.toyApproachFor(toy,surface,observed.x);if(!plan||this.support.id!==surface.id){this.cancelPlay(t);return;}
      // The mouse keeps its own schedule. Arrive at the chosen lookout instead
      // of chasing its changing position back and forth before every attempt.
      if(toy.asset.id==='ball'&&Math.abs(this.x-plan.approach)>.5*this.scale){this.moveTo(plan.approach,surface.top,0,'walk',surface,t);return;}
      hunt.stage='play';if(!(toy.asset.id==='ball'?this.startToyBat(t,toy,plan):this.startPlay(t,hunt.forced,{id:toy.id,direction:plan.direction})))this.cancelPlay(t);}return;}
    if(this.social?.episode||this.previewPose||this.play||this.motion||this.route?.length||this.goal||this.command||this.config.toy_hunting===false&&!this.toyHuntRequested)return;
    this.nextToyAt??=t+12000;if(!this.toyHuntRequested&&t<this.nextToyAt)return;this.nextToyAt=t+12000;
    if(this.toyHuntRequested||Math.random()<(this.config.mood_behaviour?.15+.7*this.ensureMood().values.playfulness*(1-.6*this.ensureMood().values.sleepiness):.6)){if(t<(this.nextToyAttemptAt||0))return;this.nextToyAttemptAt=t+2000;this.beginToyHunt(t,this.toyHuntRequested);}
  }
  decisionLayer(){if(!this.config.mood_behaviour&&!this.config.social_behaviour&&!this.config.interaction_behaviour)return this.social;if(!this.social&&window.pixelCatDecisionsV1)this.social=new window.pixelCatDecisionsV1(this,()=>CAT_OWNERS,()=>CAT_ART);return this.social;}
  ensureMood(){return this.mood ||= new CatMood(this.ownerKey||this.config.cat_id||'cat',{...this.config.mood,seed:this.config.mood_seed});}
  installMoodControls(){
    const box=document.createElement('details');box.className='mood-controls';box.innerHTML='<summary>Mood & landing debug</summary><label><input type="checkbox" data-mood-glow> Mood glow</label><label><input type="checkbox" data-landing-reactions> React to nearby high landings</label><div class="mood-readout"></div>';
    const glow=box.querySelector('[data-mood-glow]'),reactions=box.querySelector('[data-landing-reactions]');glow.checked=!!this.config.debug_mood;reactions.checked=!!this.config.landing_reactions;
    glow.onchange=()=>{this.config.debug_mood=glow.checked;this.renderMoodDebug(performance.now());};reactions.onchange=()=>{this.config.landing_reactions=reactions.checked;};
    for(const [key,title]of [['mood_behaviour','Mood-driven exploration'],['social_behaviour','Nearby loafing & bounded chase'],['prop_reactions','Moving prop contact reactions'],['startle_followups','Varied recovery after a startle'],['interaction_behaviour','Gaze, invitations & shared play']]){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.dataset.behaviour=key;input.checked=!!this.config[key];input.onchange=()=>{this.config[key]=input.checked;this.decisionLayer();if(!input.checked&&key==='social_behaviour')this.social?.finish('disabled');};label.append(input,document.createTextNode(title));box.append(label);}
    const decisions=document.createElement('pre');decisions.className='decision-readout';decisions.style.cssText='font-size:10px;white-space:pre-wrap;max-height:150px;overflow:auto';box.append(decisions);
    for(const key of CatMood.keys){const label=document.createElement('label');label.style.display='block';label.textContent=key+' ';const input=document.createElement('input');input.type='range';input.min=0;input.max=1;input.step=.01;input.value=this.config.mood?.baseline?.[key]??({playfulness:.4,sleepiness:.35,alertness:.25}[key]);input.dataset.mood=key;input.setAttribute('aria-label',key);input.oninput=()=>{this.config.mood_enabled=true;this.ensureMood().set(key,Number(input.value));this.moodDebugAt=0;this.renderMoodDebug(performance.now());};label.append(input);box.append(label);}
    for(const [title,action]of [['Hold values',()=>{this.ensureMood().held=true;}],['Resume natural drift',()=>{this.ensureMood().held=false;}],['Reset mood',()=>{this.ensureMood().reset();}],['Test nearby landing',()=>{this.receiveLanding({id:'debug-landing-'+(this.moodTestSerial=(this.moodTestSerial||0)+1),kind:'Nearby high landing',x:this.x+(12+this.facing*18)*this.scale,y:this.support?.top,intensity:.8},performance.now(),true);}]]){const button=document.createElement('button');button.textContent=title;button.onclick=()=>{this.config.mood_enabled=true;action();this.moodDebugAt=0;this.renderMoodDebug(performance.now());};box.append(button);}
    const help=document.createElement('p');help.textContent='Session-local values; sliders hold the blend. Landing reactions are opt-in physical cues, independent of gaze. Test injects a cue, not a forced hop.';help.style.fontSize='10px';box.append(help);this.shadowRoot.querySelector('details').append(box);
  }
  updateMoodState(ms,resting=['loaf','sleep'].includes(this.idle?.pose)){
    if(this.paused||this.suspended||this.stranded)return;
    if(!this.config.mood_enabled&&!this.config.debug_mood&&!this.config.landing_reactions&&!this.config.prop_reactions&&!this.config.mood_behaviour&&!this.config.social_behaviour)return;
    if(typeof document!=='undefined'&&document.hidden)return;
    this.moodAccumulator=(this.moodAccumulator||0)+Math.max(0,Math.min(250,ms||0));if(this.moodAccumulator<200)return;
    this.ensureMood().step(this.moodAccumulator/1000,resting);this.moodAccumulator=0;
  }
  renderMoodDebug(t){window.pixelCatLabelsV1?.render.call(this,t);}
  receiveLanding(cue,t=performance.now(),debug=false){
    return this.receiveDisturbance(cue,t,debug,'landing');
  }
  receiveDisturbance(cue,t=performance.now(),debug=false,type='prop'){return window.pixelCatReactionsV1?.receive(this,cue,t,debug,type)||false;}
  publishLanding(m,t){
    if(m.kind!=='jump'||m.y-m.fromY<16*this.scale)return;
    const id=this.ownerKey+'/landing/'+(this.landingSerial=(this.landingSerial||0)+1);
    for(const [cat,entry]of CAT_OWNERS){if(cat===this||entry.root!==this.root||!cat.active||!cat.config.landing_reactions)continue;const cue=landingCue(this,m,cat,id);if(cue)cat.receiveLanding(cue,t);}
  }
  runStartleFollowup(t){
    window.pixelCatReactionsV1?.resume(this,t);
    const f=this.startleAfter;if(!f)return;this.startleAfter=null;
    if(!this.config.startle_followups||this.paused||this.motion||this.route?.length||this.goal||this.command||this.previewPose||this.play||this.recallPending||this.support?.el!==f.el||this.support.narrow)return;
    const s=this.support,source=s.left+f.sourceOffset,direction=Math.sign(source-(this.x+12*this.scale))||this.facing;
    const kind=f.kind,away=kind==='retreat'?-direction:direction,limit=kind==='retreat'?32:24;
    const cells=kind==='counter'?Math.min(limit,Math.abs(source-(this.x+12*this.scale))/this.scale-6):limit;
    const x=cellSnap(Math.max(s.min,Math.min(s.max,this.x+away*cells*this.scale)),this.scale);
    const clear=[...CAT_OWNERS].every(([b,e])=>b===this||e.root!==this.root||!b.active||b.support?.el!==s.el||Math.abs(b.support.top-s.top)>2||Math.max(this.x,x)+24*this.scale+4*Math.max(this.scale,b.scale)<=Math.min(b.x,b.motion?.x??b.x)||Math.min(this.x,x)>=Math.max(b.x,b.motion?.x??b.x)+28*b.scale);
    let result='settle';
    if(kind!=='settle'&&cells>=6&&Math.abs(x-this.x)>=6*this.scale&&clear){this.urgency='interested';if(this.moveTo(x,s.top,0,kind==='counter'?'jump':'walk',s,t)!==false){result=kind;this.deadline=t+(this.motion?.duration||0)+2000;}}
    if(result==='settle'){this.deadline=t+2000;if(this.idle)this.idle.poseUntil=t;}
    this.setAttribute('data-startle-followup',result);this.social?.log('startle follow-up',{requested:kind,result});
  }
  status(text) { const el=this.shadowRoot.querySelector('.status');if(!el)return;const action=el.firstElementChild,count=el.lastElementChild;if(!action||action===count){if(el.textContent!==text)el.textContent=text;return;}const value=String(text).replace(/\s*·\s*\d+ surfaces$/,'');if(action.textContent!==value){action.textContent=value;action.title=value;}const surfaces=this.surfaces?Math.max(0,this.surfaces.length-1)+' surfaces':'— surfaces';if(count.textContent!==surfaces)count.textContent=surfaces; }
  cancelPlay(t=performance.now()){window.pixelCatMouthV1?.cancel?.(this);this.startleAfter=null;this.pendingStartle=null;this.cancelToyHunt(t);this.play=null;this.previewPose=null;this.actionTarget=null;this.playRequested=false;this.nextPlayAt=t+45000+Math.random()*45000;this.removeAttribute?.('data-play-stage');}
  requestStartle(stimulus,t=performance.now()) {
    if(this.userHeld||this.paused||this.suspended||this.stranded||this.motion&&this.motion.kind!=='walk'||window.pixelCatReactionsV1?.airborne(this,t)||t<(this.nextStartleAt||0)||!Number.isFinite(stimulus?.x))return false;
    const clip=CAT_ART.startle;if(!clip)return false;
    const anchor=clip.anchors[0],bearing=this.facing<0?23-anchor[0]:anchor[0],x=this.motion?.kind==='walk'?walkSample(this.motion,t-this.motion.start,this.scale,CAT_ART.walk).x:this.idle?cellSnap(this.idle.contactX-bearing*this.scale,this.scale):this.x;
    const startleSupport=this.support.bed?{...this.home,top:this.support.top}:this.support;
    const plan=startlePlan(x,startleSupport,this.facing,stimulus.x,this.scale,clip,Math.max(64,this.worldRect?.top||0),this.config);
    if(plan&&this.support.bed){plan.target=this.home;plan.y=this.home.top;plan.flight.end.y+=this.home.top-this.support.top;const f=plan.flight;f.vy=(f.end.y-f.start.y-.5*f.gravity*f.seconds*f.seconds)/f.seconds;}
    if(!plan||this.social?.corridor?.(plan.target,plan.x)===false){this.status('No safe landing away from disturbance');return false;}
    window.pixelCatPostRestV1?.interrupt(this);window.pixelCatMouthV1?.startled?.(this,t);this.social?.finish('startle');
    this.cancelPlay(t);this.toyHuntRequested=false;this.toyAssetRequest=null;this.requestedPoint=null;this.recallPending=false;this.casualWander=false;this.pendingStartle=null;if(this.social)this.social.pendingImpact=null;this.previewPose=null;this.actionTarget=null;this.idle=null;this.route=[];this.goal=null;this.command=null;this.finishing=false;
    this.x=x;this.y=plan.fromY;this.motion={...plan,start:t};this.deadline=t+plan.duration+1000;this.nextStartleAt=t+plan.duration+2500;
    this.setAttribute('data-startle-direction',plan.away===this.facing?'forward':'backward');this.setAttribute('data-startle-source-x',String(stimulus.x));return true;
  }
  prepareActionPreview(pose,now) {
    window.pixelCatPostRestV1?.interrupt(this);
    this.social?.finish('preview');
    if(this.needsMeasure||!this.support)this.measure();
    const ceiling=Math.max(64,this.worldRect?.top||0),bottom=typeof innerHeight==='number'?innerHeight:Infinity,s=this.scale;
    const visible=surface=>surface&&!surface.narrow&&surface.right-surface.left>=24*s&&surface.top>=ceiling+24*s&&surface.top<=bottom;
    const candidates=[this.support,this.home,...this.surfaces||[]].filter(visible),startle=pose.startsWith('startle-'),facing=this.facing||1;
    let surface,x;
    for(const candidate of candidates){
      const low=Math.ceil(candidate.left/s)*s,high=Math.floor((candidate.right-24*s)/s)*s;
      const current=candidate.id===this.support?.id?this.x:(low+high)/2,clamped=cellSnap(Math.max(low,Math.min(high,current)),s);
      const positions=startle?[clamped,cellSnap((low+high)/2,s)]:[clamped];
      for(const point of positions){const source=point+(12+(pose==='startle-front'?1:-1)*facing*30)*s;if(!startle||startlePlan(point,candidate,facing,source,s,CAT_ART.startle,ceiling,this.config)){surface=candidate;x=point;break;}}
      if(surface)break;
    }
    if(!surface){this.status('Preview unavailable: no visible surface with safe space');return false;}
    this.cancelPlay(now);this.motion=null;this.route=[];this.idle=null;this.goal=null;this.command=null;this.requestedPoint=null;this.destinationPoint=null;this.inspectionPending=null;
    this.toyHuntRequested=false;this.toyAssetRequest=null;this.playRequested=false;this.recallPending=false;this.finishing=false;this.paused=false;this.stranded=false;this.noPathMessage='';
    this.support=surface;this.x=x;this.y=surface.top;this.facing=facing;this.nextStartleAt=0;this.forcedIdleUntil=0;this.gallopReviewAt=undefined;
    const canvas=this.shadowRoot.querySelector('.gallop-preview');if(canvas)canvas.hidden=true;
    const pause=this.shadowRoot.querySelector('[data-action="pause"]');if(pause)pause.textContent='Pause';
    return true;
  }
  requestAction(pose){
    const startle=pose==='startle-front'||pose==='startle-behind',gallop=pose==='gallop',canvas=this.shadowRoot.querySelector('.gallop-preview');
    if(window.pixelCatBehaviourV1?.allowed(this,CAT_ART.idleSequences?.[pose])===false)return false;
    if(startle?!CAT_ART.startle:gallop?(!canvas||!CAT_ART.gallopPreview):!CAT_ART.idleSequences?.[pose]){this.status('Preview unavailable: artwork not loaded');return false;}
    const now=performance.now();if(!this.prepareActionPreview(pose,now))return false;
    if(startle)return this.requestStartle({x:this.x+(12+(pose==='startle-front'?1:-1)*this.facing*30)*this.scale},now);
    this.previewPose=gallop?'stand':pose;this.forcedIdleUntil=now+(gallop?8000:pose==='sleep'?9500:3300);this.deadline=this.forcedIdleUntil;
    if(gallop){canvas.hidden=false;this.gallopReviewAt=now;}
    this.setAttribute('data-preview-action',pose);this.status('Previewing '+pose);return true;
  }
  tryLongDrop(){
    if(this.motion||this.route?.length){this.status('Finish the current route, then try a drop');return false;}
    const options=this.surfaces.filter(s=>s.id!==this.support?.id&&s.top-this.support.top>=36*this.scale&&this.reachable(this.support,s)&&this.pathTo(this.home,s));
    const target=options.sort((a,b)=>Math.abs(a.min-this.x)-Math.abs(b.min-this.x))[0];
    if(!target){this.status('Visit a higher surface with a safe return, then try a drop');return false;}
    this.cancelPlay();this.route=[target,{settle:true,surface:target,x:Math.max(target.min,Math.min(target.max,this.x))}];this.urgency='interested';this.deadline=0;this.paused=false;return true;
  }
  startPlay(t,forced=false,toy=null){
    this.social?.finish('play');
    if(this.motion||this.route?.length||!this.support||!CAT_ART.sneak?.every(Boolean))return false;
    const s=this.scale,surface=this.support,left=this.x-surface.min,right=surface.max-this.x,available=Math.max(left,right)/s;
    if(surface.narrow||!toy&&available<45){this.nextPlayAt=t+20000;this.status('Pounce needs a wider surface');return false;}
    const direction=toy?toy.direction:right===left?(this.facing||1):right>left?1:-1,stalk=toy?15:available>=60&&Math.random()<.5?20:15,pounce=toy?18:18+Math.floor(Math.random()*9);
    this.noPathMessage='';this.playRequested=false;this.playHistory=['sit'];this.setAttribute('data-last-play-stages','sit');this.play={toyId:toy?.id,stage:'sit',direction,supportId:surface.id,stalk,pounce,forced,waitUntil:t+1000+Math.random()*1200,pose:'sit'};
    this.paused=false;this.deadline=this.play.waitUntil+1000;if(this.idle)this.idle.poseUntil=t;if(toy){this.play.stage='watch';this.play.waitUntil=t;this.playHistory=['watch'];this.setAttribute('data-last-play-stages','watch');}this.setAttribute('data-play-stage',this.play.stage);return true;
  }
  advancePlay(t){
    const p=this.play;if(!p)return;
    const mouse=p.toyId&&this.propScene?.props.find(toy=>toy.id===p.toyId&&toy.asset.id==='toy_mouse');
    if(mouse&&['sit','notice','sneak','watch'].includes(p.stage)){
      const surface=propSurfaceFor(this,mouse),point=this.observedToyPoint(mouse,surface,p.forced),opening=point&&(this.social?.toyOpening?.(mouse,this.x,point.x,this.scale,mouseOpening(mouse,this.x,point.x,this.scale))??mouseOpening(mouse,this.x,point.x,this.scale));
      if(!opening||p.stage==='watch'){
        if(this.motion?.sneakTimeline){const m=this.motion,step=walkSample(m,t-m.start,this.scale,CAT_ART.walk).step,beat=m.sneakTimeline[step];m.sneakTimeline=m.sneakTimeline.slice(0,step+1);m.duration=beat.until;m.x=m.fromX+m.direction*beat.offset*this.scale;}
        if(p.stage!=='watch'){if(this.idle)this.idle.poseUntil=t;this.playHistory?.push('watch');this.setAttribute('data-last-play-stages',this.playHistory?.join(',')||'watch');}p.stage='watch';p.pose='sit';p.waitUntil=t;this.deadline=t+2000;this.setAttribute('data-play-stage','watch');this.setAttribute('data-toy-hunt-wait',opening?'Opening available':'Watching for a paused mouse facing away');
        if(this.motion||!opening)return;
        const landing=this.toyLanding(mouse.id,mouse.direction),distance=(landing-this.x)*mouse.direction/this.scale;
        if(!Number.isFinite(distance)||distance<6||landing<this.support.min||landing>this.support.max)return;
        p.direction=mouse.direction;p.stalk=Math.max(0,Math.min(15,Math.floor(distance-12)));p.stage='sit';p.waitUntil=t;this.removeAttribute?.('data-toy-hunt-wait');
      }
    }
    if(this.motion||t<p.waitUntil)return;
    if(p.toyId&&!p.released&&!this.propScene?.props.some(toy=>toy.id===p.toyId&&toy.claimedBy===this.ownerKey)){this.cancelPlay(t);return;}
    if(this.support?.id!==p.supportId||this.goal||this.command){this.cancelPlay(t);return;}
    const wait=(stage,pose,ms)=>{p.stage=stage;p.pose=pose;p.waitUntil=t+ms;this.deadline=p.waitUntil+1000;if(this.idle)this.idle.poseUntil=t;};
    if(window.pixelCatBehaviourRefinementsV1?.wiggle(this,p,t,CAT_ART))return;
    if(p.stage==='bat'){if(p.strokes&&p.strokeIndex<p.strokes.length-1)wait('bat-pause','sit',350+Math.random()*900);else wait('settle','sit',800+Math.random()*600);}
    else if(p.stage==='bat-pause'){
      const toy=this.propScene?.props.find(toy=>toy.id===p.toyId),surface=toy&&propSurfaceFor(this,toy),point=surface&&propPosition(toy,surface),tap=CAT_ART.interactionContacts.bat.point,pawX=this.x+((p.direction>0?tap[0]:23-tap[0])+.5)*this.scale;
      if(!point||toy.ballMotion||Math.abs(point.x-pawX)>toy.asset.width*toy.scale/2+this.scale){wait('settle','sit',900);}
      else {p.strokeIndex++;p.struck=false;p.stage='bat';p.pose='bat';p.waitUntil=Infinity;if(this.idle)this.idle.poseUntil=t;this.setAttribute('data-bat-stroke',p.strokes[p.strokeIndex]);}
    }
    else if(p.stage==='sit'){this.facing=p.direction;wait('notice',Math.random()<.5?'glance':'look',700+Math.random()*900);}
    else if(p.stage==='notice'){
      p.stage='sneak';p.pose=null;p.waitUntil=Infinity;
      if(p.toyId&&p.stalk===0){p.waitUntil=t;return;}
      const end=this.x+p.direction*p.stalk*this.scale;
      if(end<this.support.min||end>this.support.max){this.cancelPlay(t);return;}
      this.moveTo(end,this.y,0,'walk',this.support,t,'sneak');
    }else if(p.stage==='sneak'){
      // Sometimes interest fades; a playful episode need not always pounce.
      if(!p.forced&&Math.random()<.18){wait('settle','sit',1500);}
      else {p.stage='pounce';p.waitUntil=Infinity;const end=p.toyId?this.toyLanding(p.toyId,p.direction):this.x+p.direction*p.pounce*this.scale;
        if(!Number.isFinite(end)||p.toyId&&(end-this.x)*p.direction<6*this.scale||end<this.support.min||end>this.support.max||this.moveTo(end,this.y,0,'jump',this.support,t)===false){wait('settle','sit',1500);}}
    }else if(p.stage==='pounce'){if(p.toyId){this.toyHunt.completed=true;this.setAttribute('data-last-toy-pounce',p.toyId);const target=this.toyLanding(p.toyId,p.direction);this.setAttribute('data-last-toy-pounce-result',Math.abs(target-(p.landingX??this.x))<=4*this.scale?'contact':'miss');}wait('settle','sit',1000+Math.random()*1800);}
    else if(p.stage==='settle'){if(p.forced||Math.random()<.8)wait('groom','clean',2000+Math.random()*2000);else {this.cancelPlay(t);this.deadline=t+3000;}}
    else {this.cancelPlay(t);this.deadline=t+3000+Math.random()*3000;}
    if(this.play){this.setAttribute('data-play-stage',p.stage);if(this.playHistory?.at(-1)!==p.stage){this.playHistory.push(p.stage);this.setAttribute('data-last-play-stages',this.playHistory.join(','));}}
  }
  requestVisit(id,urgency='prompted',point=null) {this.manualStartle=this.manualWallJump=null;window.pixelCatSettlingV1?.wake(this,performance.now());window.pixelCatPolishV1?.cancelDeparture(this);window.pixelCatPostRestV1?.interrupt(this);this.social?.finish('user command');this.cancelPlay();this.toyHuntRequested=false;this.toyAssetRequest=null;this.requestedPoint=point;this.paused=false;this.finishing=false;this.noPathMessage='';this.urgency=urgency;this.goal=id;this.command=id==='home'?'home':'explore';if(this.motion){this.recallPending=true;const m=this.motion;if(m.gallopTimeline){let i=walkSample(m,performance.now()-m.start,this.scale,CAT_ART.walk).step;while(i<m.gallopTimeline.length-1&&!m.gallopTimeline[i].grounded)i++;m.gallopTimeline=m.gallopTimeline.slice(0,i+1);m.cells=m.gallopTimeline.at(-1).offset;m.x=m.fromX+m.direction*m.cells*this.scale;m.duration=m.gallopTimeline.at(-1).until;}if(m.kind==='walk'&&!m.sneakTimeline&&!m.gallopTimeline&&m.cumulativeMs){const cells=Math.min(m.cells,walkSample(m,performance.now()-m.start,this.scale,CAT_ART.walk).step+1);m.cells=cells;m.x=m.fromX+m.direction*cells*this.scale;m.cumulativeMs=m.cumulativeMs.slice(0,cells);m.headOffsets=m.headOffsets?.slice(0,cells+1);m.duration=m.cumulativeMs.at(-1)||0;}}else this.route=[];this.deadline=0;this.shadowRoot.querySelector('[data-action="pause"]').textContent='Pause';}
  attractToClick(event){return window.pixelCatCardAttentionV1?.call(this,event,{cardOwnerFor,clickDestination,attentionWinner,CAT_OWNERS});}
  surfaceId(el,suffix='top'){const owner=cardOwnerFor(el);if(!this.surfaceIds.has(owner))this.surfaceIds.set(owner,`card-${++this.nextSurfaceId}`);return `${this.surfaceIds.get(owner)}:${suffix}`;}
  invalidate() { this.needsMeasure = true;window.pixelCatSurfaceWorldV1?.invalidate(this); }
  worldRoot() {
    let el = this;
    while(el) {
      if(el.matches?.('[data-cat-world],hui-sections-view,hui-masonry-view')) return el;
      el = el.parentElement || el.getRootNode()?.host;
    }
    return null;
  }
  measure() {
    if(window.pixelCatScrollV1?.shift(this))return;
    const oldSupport=this.support,oldSurfaces=this.surfaces||[],oldById=new Map(oldSurfaces.map(s=>[s.id,s]));
    this.root = this.worldRoot();
    const d = this.shadowRoot.querySelector('.dock').getBoundingClientRect(), s = this.scale;
    if(!this.support&&this.config.show_home!==false&&(!(d.width>0)||!(d.height>0))){this.waitingForPlacement=true;this.needsMeasure=true;this.layer.style.visibility='hidden';return;}this.waitingForPlacement=false;
    this.home = {id:'home',label:'Bed & bowl',el:this,rectNode:this.shadowRoot.querySelector('.dock'),left:d.left+4,right:d.right-4,top:d.bottom,home:true,scale:this.worldScale||s,rectSnapshot:{left:d.left,top:d.top,width:d.width,height:d.height}};
    this.size = 24*s;
    const rootRect = this.root?.getBoundingClientRect();
    this.worldRect = rootRect || d;
    const candidates = this.root ? window.pixelCatSurfaceWorldV1.cards(this.root,()=>deepElements(this.root,el => el.localName === 'ha-card' || el.hasAttribute('data-cat-surface'))) : [];
    const isBlankSpacer = el => {
      let host=el;
      while(host) {
        if(host.localName==='hui-markdown-card') {
          const content=host.config?.content ?? host._config?.content;
          return typeof content==='string' && content.trim()==='';
        }
        host=host.parentElement || host.getRootNode()?.host;
        if(host===this.root) break;
      }
      return false;
    };
    this.cardPanelElements=candidates;
    const rects = candidates.filter(el => sharedHomeSurfaceAllowed(el,this.config)&&!isBlankSpacer(el)).map(el=>({el,r:window.pixelCatSurfaceWorldV1.rect(this.root,el)}))
      .filter(({el,r})=>el.isConnected && r.width>=this.size/2+20 && r.height>=30);
    this.verticalCardRects=rects;const seen = new Set();
    this.rejected=[];this.surfaceCandidates=[];this.surfaceAudit=[];this.matchedRules=0;
    this.surfaces = this.config.show_home===false?[]:[this.home];
    // Required home supports precede shared, uncapped discovery.
    window.pixelCatSetupV1?.surfaces?.(this);
    for(const {el,r} of rects) {
      const key = el;
      if(seen.has(key)) continue; seen.add(key);
      const top = r.top, left=r.left+10, right=r.right-10;
      const cfg=cardConfigFor(el),label=String(cfg.name||cfg.title||cfg.type||el.localName).slice(0,100),rectSnapshot={left:r.left,top:r.top,width:r.width,height:r.height};
      if(right-left<this.size/2) continue;
      const inspectionTargets=cardInspectionTargets(el,cfg);
      this.surfaces.push({id:this.surfaceId(el),el,left,right,top,label:label+' · top',rectSnapshot,inspectionTargets});
      const native=this.config.standard_surfaces===false?[]:standardCardSurfaces(el,cfg,this.size),definitions=Array.isArray(cfg.cat_surfaces)?[...cfg.cat_surfaces]:[];
      definitions.unshift(cardBottomDefinition(r));
      definitions.push(...native);const audit={card:label,type:cfg.type||el.localName,dividers:native.filter(d=>!d.candidate).length,candidates:1+native.filter(d=>d.candidate).length,accepted:[]};this.surfaceAudit.push(audit);
      for(const rule of this.config.surface_rules||[])if(rule.match&&Object.keys(rule.match).length&&Object.entries(rule.match).every(([key,value])=>cfg[key]===value)){this.matchedRules++;if(Array.isArray(rule.surfaces))definitions.push(...rule.surfaces);}
      const ids=new Set();for(const def of definitions){const surface=surfaceFromDefinition(def,r,this.size);if(!surface||ids.has(def.id)){const factor=def?.units==='pixels'?1:.01;this.rejected.push({left:Number.isFinite(def?.x1)?r.left+def.x1*(factor===1?1:r.width*factor):left,right:Number.isFinite(def?.x2)?r.left+def.x2*(factor===1?1:r.width*factor):right,top:Number.isFinite(def?.y)?r.top+def.y*(factor===1?1:r.height*factor):r.top,label:label+' · rejected '+String(def?.id||'definition')});continue;}ids.add(def.id);
        if(surface.right-surface.left<this.size/2)continue;
        surface.source=def.source||'declared';surface.candidate=!!def.candidate;
        const measured={...surface,id:this.surfaceId(el,def.id),el,rectSnapshot,inspectionTargets,label:label+' · '+surface.label};
        if(def.candidate&&!this.config.use_surface_candidates){this.surfaceCandidates.push(measured);continue;}
        this.surfaces.push(measured);audit.accepted.push({id:measured.id,source:surface.source});
      }
    }
    window.pixelCatMouthV1?.surfaces?.(this);
    for(const surface of this.surfaces) {surface.narrow=surface.right-surface.left<this.size;surface.min=Math.ceil((surface.left-(surface.narrow?6*s:0))/s)*s;surface.max=Math.floor((surface.right-(surface.narrow?18*s:this.size))/s)*s;if(surface.narrow)surface.poses=['perch','lookdown'];const previous=oldById.get(surface.id);surface.roamFractions=previous?.roamFractions||[.1+Math.random()*.8,.1+Math.random()*.8,.1+Math.random()*.8];surface.roamPoints=surface.home||surface.narrow||surface.max-surface.min<12*s?[]:surface.roamFractions.map((u,i)=>({id:'roam-'+i,x:cellSnap(surface.min+(surface.max-surface.min)*u,s),weight:1,label:'Wander '+(i+1)}));surface.propPoints=previous?.propPoints||[];surface.inspectionPoints=inspectionPointsFor(surface,surface.inspectionTargets||[],s);if(surface.bed){surface.narrow=false;surface.min=surface.max=cellSnap((surface.left+surface.right-this.size)/2,s);surface.poses=['alertLying','sit','sithead','loaf','sleep','clean','scratch','yawn'];}surface.points=restingPoints(surface);}
    window.pixelCatHomeLifeV1?.fitRoofs(this,CAT_ART);this.surfaces=this.surfaces.filter(s=>s.max>=s.min);if(!this.surfaces.includes(this.bedSurface))this.bedSurface=null;this.surfaceCounts={eligible:this.surfaces.length,candidates:this.surfaceCandidates.length,rejected:this.rejected.length};window.pixelCatVerticalScratchV1?.reconcile(this);
    if(this.config.show_home===false){this.home=null;this.waitingForSurface=true;window.pixelCatHiddenHomeV1?.select(this);}
    this.needsMeasure = false;
    if(this.root)this.observer?.observe(this.root);for(const {el}of rects)this.observer?.observe(el);
    this.reconcileLayout(oldSupport,oldSurfaces,performance.now());window.pixelCatExplorationV1?.observe(this,performance.now());
    window.pixelCatSurfaceWorldV1.destinations(this,this.shadowRoot.querySelector('.visit'));
    this.renderDebug();
    this.setAttribute('data-ledges',String(this.surfaces.length-(this.config.show_home===false?0:1)));
  }
  reconcileLayout(oldSupport,oldSurfaces,now,uniformScroll=false) {
    if(window.pixelCatLayoutV1?.repair(this,oldSupport,now))return;
    if(this.config?.show_home===false&&!this.home){this.stranded=true;this.noPathMessage='Waiting for a suitable dashboard surface';return;}
    if(!oldSupport){this.support=this.home;this.x=Math.min(this.home.max,this.home.min+20*(this.home.scale||this.scale));this.y=this.home.top;this.motion=null;this.route=[];this.finishing=false;this.idle=null;this.deadline=now+restDuration(this.config,true,this);this.stranded=false;return;}
    const next=this.surfaces.find(s=>s.id===oldSupport.id),target=this.motion&&this.surfaces.find(s=>s.id===this.motion.target.id);
    this.stranded=!next||!!(this.motion&&!target);if(this.stranded){this.noPathMessage='Surface unavailable · waiting for layout or Reset home';return;}
    const dx=next.left-oldSupport.left,dy=next.top-oldSupport.top;this.support=next;this.x+=dx;this.y+=dy;
    if(this.idle){this.idle.contactX+=dx;if(this.idle.placement){this.idle.placement.x+=dx;this.idle.placement.top+=dy;}}
    if(this.motion){const m=this.motion,tx=target.left-m.target.left,ty=target.top-m.target.top,progress=Math.max(0,Math.min(1,(now-m.start)/m.duration));m.fromX+=dx;m.fromY+=dy;if(m.departure)m.departure.bearing+=dx;m.x+=tx;m.y=target.top;m.target=target;if(m.kind==='startle'){const low=target.left,high=target.right-24*this.scale;if(!uniformScroll&&(m.fromX<low||m.fromX>high||m.x<low||m.x>high)){this.stranded=true;this.noPathMessage='Startle landing changed · waiting for layout';return;}m.flight.start.x+=dx;m.flight.start.y+=dy;m.flight.end.x+=tx;m.flight.end.y+=ty;}if(m.jumpProfile){if(Math.abs(tx-dx)<.01&&Math.abs(ty-dy)<.01){const p=m.jumpProfile;for(const point of [p.start,p.end]){point.x+=dx;point.y+=dy;}for(const pose of [p.departure,p.arrival]){pose.x+=dx;pose.top+=dy;}p.flight.apexY+=dy;}else{const plan=this.planJump(m);if(!plan){this.stranded=true;this.noPathMessage='Jump space changed · waiting for layout';return;}m.jumpProfile=plan;m.duration=plan.duration;m.start=now-progress*m.duration;}}}
    else {this.x=Math.max(next.min,Math.min(next.max,this.x));this.y=next.top;}
    const route=[];for(const stop of this.route||[]){const old=stop.settle?stop.surface:stop,updated=this.surfaces.find(s=>s.id===old.id);if(!updated){this.route=[];if(!this.command)this.goal=this.destinationId;if(this.motion)this.recallPending=true;this.deadline=0;return;}route.push(stop.pointRoute?window.pixelCatPointRoutesV1.reconcile(this,stop,updated):stop.settle?{...stop,surface:updated,x:Math.max(updated.min,Math.min(updated.max,stop.x+updated.left-old.left))}:updated);}this.route=route;this.noPathMessage='';window.pixelCatEffectsV1?.reconcile(this);
  }
  reachable(a,b) {
    if(window.pixelCatShallowV1?.edge(this,a,b))return true;
    const gap = Math.max(0,a.min-b.max,b.min-a.max), dy = Math.abs(a.top-b.top);
    if(gap>150*this.scale||dy>90*this.scale)return false;
    const fromX=Math.max(a.min,Math.min(a.max,b.min)),x=Math.max(b.min,Math.min(b.max,fromX)),direction=x>=fromX?1:-1;
    return !!buildJumpPlan({fromX,fromY:a.top,x,y:b.top,direction,jumpKind:jumpKindFor(a.top,b.top,this.scale,x-fromX)},CAT_ART,this.scale,this.config,Math.max(64,this.worldRect?.top||0));
  }
  routeSpeed(){return travelSpeed(this.config,this.urgency);}
  routeJump(from,to,fromX,x){const direction=movementFacing(fromX,x,this.scale,this.facing,'jump');return this.planJump({fromX,fromY:from.top,x,y:to.top,direction,jumpKind:jumpKindFor(from.top,to.top,this.scale,x-fromX)});}
  pathTo(target,origin=this.support){return window.pixelCatSurfaceWorldV1.route(this,target,origin)??window.pixelCatClimbV1?.fallback(this,target,origin)??null;}
  plan() {
    const requested=!!this.command||!!this.goal;this.casualWander=false;
    const now=performance.now();if(!requested&&window.pixelCatClimbV1?.offer(this,now))return;this.visits||=new Map();if(window.pixelCatPostRestV1?.beforePlan(this,now,requested))return;
    if(!requested&&(this.config.mood_behaviour||this.config.social_behaviour)&&this.decisionLayer()?.decide(now))return;
    const leisure={points:restingPoints,weight:visitWeight,pick:weightedPick};if(!requested&&window.pixelCatExplorationV1?.plan(this,now,leisure))return;
    const [goalSurface,goalPoint]=String(this.goal||'').split('::');
    let target;
    if(this.command==='home'||this.goal==='home') target=this.home;
    else if(this.goal)target=this.surfaces.find(s=>s.id===goalSurface);
    else {
      const options=this.surfaces.filter(s=>!s.iglooRoof&&s.id!==this.support.id && this.pathTo(s) && this.pathTo(this.home,s));
      target=weightedPick(options,s=>visitWeight(this.visits,s.id,now)*(s.interest?1.2:1)*(this.social?.surfaceWeight?.(s)||1));if(!target&&window.pixelCatExplorationV1?.plan(this,now,leisure,true))return;if(!requested){this.urgency=target?.interest?'interested':'relaxed';if(this.config.mood_behaviour){const v=this.ensureMood().values;this.urgency=this.ensureMood().random()<(.15+.5*v.playfulness+.15*v.alertness)*(1-.8*v.sleepiness)?'interested':'relaxed';}}
    }
    if(target?.id==='home')target=this.bedSurface||target;const points=target&&restingPoints(target),point=points&&(points.find(p=>p.id===goalPoint)||(goalPoint==='click'?this.requestedPoint:null)||weightedPick(points,p=>p.weight*visitWeight(this.visits,target.id+'/'+p.id,now)));const path=target&&(window.pixelCatPointRoutesV1?.plan(this,target,point.x)??this.pathTo(target));if(!path){this.route=[];this.noPathMessage=target?'No route to '+target.label:'Chilling · no reachable destination';this.deadline=performance.now()+30000;this.renderDebug();return;}
    this.command=null;this.goal=null;this.destinationId=target.id;this.noPathMessage=''; this.route=path;
    this.destinationPoint=point.id;this.requestedPoint=null;
    this.route.push({settle:true,surface:target,x:point.x});window.pixelCatReactionsV1?.wander(this,requested);
    this.renderDebug();
  }
  recordVisit(t) {this.inspectionPending=this.support.inspectionPoints?.find(p=>p.id===this.destinationPoint)||null;this.visits||=new Map();for(const id of [this.support.id,this.support.id+'/'+(this.destinationPoint||'arrival')]){const previous=this.visits.get(id);this.visits.delete(id);this.visits.set(id,{at:t,count:Math.min(8,(previous?.count||0)+1)});}while(this.visits.size>128)this.visits.delete(this.visits.keys().next().value);}
  moveTo(x,y,duration,kind,target,t,gait=null) {
    if(kind==='jump'&&window.pixelCatHomeLifeV1?.launchChanged(this,target))return false;
    window.pixelCatBedEntryV1?.moving(this);window.pixelCatPostRestV1?.departure(this,kind,gait);
    if(kind==='walk'&&!gait&&this.casualWander&&this.urgency==='relaxed'&&!this.play&&!this.toyHunt&&!this.social?.episode)this.urgency='casual';
    const oldIdle=this.idle,oldX=this.x;
    const {gallop,fast}=window.pixelCatMotionOptionsV1?.select(this,kind,gait,target,x,CAT_ART,travelSpeed(this.config,this.urgency))||{};
    const desiredFacing=movementFacing(this.x,x,this.scale,this.facing,kind),intentDx=x-this.x,jumpKind=jumpKindFor(this.y,y,this.scale,intentDx);
    const continuation=gait==='sneak'&&oldIdle?.sneakExit&&this.sneakState?.direction===desiredFacing?this.sneakState:null;
    if(this.idle&&!continuation) {
      const direction=desiredFacing,next=gallop?gallop.frames[0]:gait==='sneak'?CAT_ART.sneak[0].frames[0]:fast?fast.frames[(this.walkSteps+1)%fast.frames.length]:CAT_ART.walk[(this.walkSteps+1)%CAT_ART.walk.length];
      const anchor=kind==='walk'?groundedFront(next,direction):jumpKind==='descend'?null:frameContact(CAT_ART[jumpKind][0],direction,CAT_ART.leapAnchors[jumpKind][0].point)[0];
      if(anchor!==null){const bearing=kind==='walk'&&oldIdle.rows&&oldIdle.placement?oldIdle.placement.x+frameContact(oldIdle.rows,oldIdle.facing??this.facing,(window.pixelCatPolishV1?.departureAnchor(oldIdle,CAT_ART)||idleContact(oldIdle.rows)))[0]*this.scale:oldIdle.contactX;this.x=bearing-anchor*this.scale;}
    }
    this.idle=null;
    this.x=cellSnap(this.x,this.scale); x=cellSnap(x,this.scale);
    this.facing = desiredFacing;
    if(kind==='jump'&&target.narrow){const clip=CAT_ART[jumpKind],last=clip.at(-1),bottom=idleContact(last)[1],feet=[...last[bottom]].flatMap((v,px)=>v==='R'?[desiredFacing<0?23-px:px]:[]);if(feet.length){const low=Math.ceil(target.left/this.scale-Math.min(...feet))*this.scale,high=Math.floor(target.right/this.scale-Math.max(...feet)-1)*this.scale;x=Math.max(low,Math.min(high,x));}}
    this.motion={fromX:this.x,fromY:this.y,x,y,duration,kind,target,start:t,direction:this.facing};
    window.pixelCatExertionV1?.launch(this,this.motion);
    if(kind==='walk') {
      const cells=Math.round(Math.abs(x-this.x)/this.scale);
      const speed=travelSpeed(this.config,this.urgency); // same cell clock controls stride and displacement
      Object.assign(this.motion,{cells,stepMs:1000/speed,...walkTimings(cells,this.config,this.urgency),gaitStart:this.walkSteps,headStart:this.walkHeadPhase??this.walkSteps,headSeed:this.headSeed??=Math.floor(Math.random()*12)});
      if(fast){const rate=Math.max(15,Math.min(30,Number(this.config.fast_walk_fps)||fast.fps||21));this.motion.fastClip=fast;this.motion.stepMs=1000/rate;this.motion.cumulativeMs=Array.from({length:cells},(_,i)=>(i+1)*1000/rate);this.motion.duration=cells*1000/rate;}
      if(gallop){this.motion.gallopTimeline=gallopTimeline(cells,CAT_ART,this.config,gallop);this.motion.duration=this.motion.gallopTimeline.at(-1).until;this.setAttribute?.('data-gait','gallop');}else this.setAttribute?.('data-gait',fast?'trot':gait==='sneak'?'sneak':this.urgency==='casual'?'casual':'walk');
      if(gait==='sneak'){this.motion.sneakTimeline=sneakTimeline(cells,CAT_ART,continuation||undefined);this.motion.duration=this.motion.sneakTimeline.at(-1).until;}
      window.pixelCatBehaviourV1?.movement(this,this.motion,(gallop||fast||gait==='sneak'&&CAT_ART.sneak[0])?.behaviourPolicy||CAT_ART.walkBehaviour);window.pixelCatPolishV1?.prelude(this,this.motion,oldIdle,CAT_ART,groundedFront(walkAppearance(CAT_ART,this.motion,walkSample(this.motion,0,this.scale,CAT_ART.walk),this.config).rows,this.facing));
    } else {
      this.motion.jumpKind=jumpKind;
      this.flightAssets=new Set();
      if(!this.plannedRouteJump&&this.motion.jumpKind==='descend'&&Math.abs(intentDx)<6*this.scale&&!target.narrow){const g=jumpGeometry(this.motion,CAT_ART,this.scale),aligned=this.motion.x+g.start.x-g.end.x;this.motion.x=cellSnap(Math.max(target.min??-Infinity,Math.min(target.max??Infinity,aligned)),this.scale);}
      this.motion.holds=JUMP_HOLDS[this.motion.jumpKind];
      this.motion.hesitationMs=window.pixelCatMotionOptionsV1?.hesitation(this.motion,this.scale)||0;
      this.motion.jumpProfile=buildJumpPlan(this.motion,CAT_ART,this.scale,this.config,Math.max(64,this.worldRect?.top||0));
      if(!this.motion.jumpProfile){this.motion=null;this.idle=oldIdle;this.x=oldX;this.route=[];this.noPathMessage='Jump rejected · speed, height or headroom limit';this.deadline=t+10000;return false;}
      this.motion.duration=this.motion.jumpProfile.duration;
      this.motion.takeoffX=this.x;
    }
  }
  renderHomeProp(){window.pixelCatSetupV1?.renderHome(this,CAT_ART);}

  planJump(m,ceiling=Math.max(64,this.worldRect?.top||0)){return buildJumpPlan(m,CAT_ART,this.scale,this.config,ceiling);}
  jumpSample(m,p) {
    if(m.kind==='startle')return startleSample(m,p,CAT_ART.startle,this.scale);
    const s=this.scale,facing=m.direction,kind=m.jumpKind,plan=m.jumpProfile||buildJumpPlan(m,CAT_ART,s,this.config,Math.max(64,this.worldRect?.top||0));
    if(!plan)throw Error('Jump exceeds physical limits or headroom.');
    const {frame,phase}=jumpBeat(plan,p),air=frame===2?airborneSample(CAT_ART,m,phase,s,this.config):null,rows=air?air.rows:CAT_ART[kind][frame];let originX,originY;
    const place=(point,wx,wy)=>{const [px,py]=frameContact(rows,facing,point);originX=wx-px*s;originY=wy-(py+1)*s;};
    if(frame===2){const centre=bodyCentre(rows,facing),world=flightPoint(plan.flight,phase);originX=world.x-centre.x*s;originY=world.y-centre.y*s;}
    else if(kind==='descend'&&frame<2){const anchor=CAT_ART.descentEdges[frame],edge=facing>0?m.fromX+this.size:m.fromX;originX=edge-(facing<0?23-anchor.edgeX:anchor.edgeX)*s;originY=m.fromY-(anchor.support[1]+1)*s;}
    else {const anchors=CAT_ART.leapAnchors[kind],last=CAT_ART[kind].length-1;
      const takeoff=frame<2?m.fromX+frameContact(CAT_ART[kind][0],facing,anchors[0].point)[0]*s:0,landing=m.x+frameContact(CAT_ART[kind][last],facing,anchors[last].point)[0]*s;
      place(anchors[frame].point,frame<2?takeoff:landing+(kind==='ascend'?(anchors[frame].edgeOffset-7)*facing*s:0),frame<2?m.fromY:m.y);
    }
    const origin=air?.origin||(kind==='across'?CAT_ART.frameProvenance.across[frame]:'human');
    return {rows,x:m.fromX+cellSnap(originX-m.fromX,s),top:m.fromY+cellSnap(originY-m.fromY,s),frame,kind,origin,sequenceId:air?.sequenceId,assetFrame:air?.assetFrame,flightSeconds:plan.flight.seconds};
  }
  advance(t) {
    const next=this.route[0]; if(!next) return;
    if(window.pixelCatClimbV1?.routeStep(this,next,t)||window.pixelCatSetupV1?.stepOff?.(this,next,t)||window.pixelCatPointRoutesV1?.advance(this,t)||window.pixelCatShallowV1?.step(this,next,t))return;
    if(next.settle) {
      if((this.support.narrow||Math.abs(next.x-this.x)<=2*this.scale)&&this.support.id===next.surface.id){this.route.shift();this.finishing=false;this.recordVisit(t);this.deadline=t+restDuration(this.config,this.support.home,this);this.urgency='relaxed';return;}
      this.route.shift(); this.moveTo(next.x,next.surface.top,Math.max(150,Math.abs(next.x-this.x)*25), 'walk',next.surface,t); this.finishing=true; return;
    }
    const launch=Math.max(this.support.min,Math.min(this.support.max,Math.max(next.min,Math.min(next.max,this.x))));
    if(!this.support.narrow&&Math.abs(launch-this.x)>this.scale) {this.moveTo(launch,this.support.top,Math.abs(launch-this.x)*25,'walk',this.support,t);return;}
    this.route.shift(); const landing=Math.max(next.min,Math.min(next.max,this.x));
    this.moveTo(landing,next.top,Math.max(600,Math.min(1200,Math.hypot(landing-this.x,next.top-this.y)*4)),'jump',next,t);
  }
  blocked() {
    if(document.hidden || location.pathname!==this.href || !this.isConnected) return true;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    if(this.root?.editMode||this.root?.lovelace?.editMode) return true;
    return deepElements(document,el => el.hasAttribute('role') && el.getAttribute('role')==='dialog' || ['dialog','ha-dialog','ha-more-info-dialog','hui-dialog-edit-card','hui-dialog-edit-dashboard','ha-drawer'].includes(el.localName))
      .some(el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0&&getComputedStyle(el).visibility!=='hidden' && (el.hasAttribute('open') || el.getAttribute('role')==='dialog' || el.localName.startsWith('hui-dialog')); });
  }
  freezeClocks(gap){gap=Math.max(0,gap);if(this.climb)this.climb.last+=gap;if(this.explorationResidence)this.explorationResidence.since+=gap;if(this.nextLandingReactionAt)this.nextLandingReactionAt+=gap;if(this.nextStartleAt)this.nextStartleAt+=gap;if(this.motion)this.motion.start+=gap;if(this.idle){this.idle.start+=gap;this.idle.poseUntil+=gap;}if(this.play&&Number.isFinite(this.play.waitUntil))this.play.waitUntil+=gap;if(this.toyHunt)this.toyHunt.started+=gap;if(this.nextReactiveMouseAt)this.nextReactiveMouseAt+=gap;if(this.nextToyAttemptAt)this.nextToyAttemptAt+=gap;if(this.nextToyAt)this.nextToyAt+=gap;if(this.nextPlayAt)this.nextPlayAt+=gap;if(this.forcedIdleUntil)this.forcedIdleUntil+=gap;if(this.deadline>0)this.deadline+=gap;}
  renderDebug(){window.pixelCatSurfaceDebugV1?.render.call(this,{restingPoints,flightPoint,propSurfaceFor,propPosition,travelSpeed});}
  draw(rows) {
    const s=this.scale, signature=rows.join('')+this.facing;
    if(signature!==this.signature) {
      this.signature=signature;this.drawnRows=rows;this.drawnFacing=this.facing;
      this.svg.style.color = this.config.color || '#222';
      this.svg.firstElementChild.innerHTML = rows.map((row,y)=>[...row].map((v,x)=>v==='.'?'':`<rect x="${this.facing<0?23-x:x}" y="${y}" width="1" height="1" fill="currentColor"/>`).join('')).join('');
    }
    const bounds=catBounds(rows); const x=this.x, y=this.y-bounds.bottom*s;
    this.svg.style.transform=`translate(${x}px,${y}px)`;
    this.setAttribute('data-activity',this.motion?.kind || (this.support?.home?'home':'perch'));
  }
  tick(t) {
    window.pixelCatClimbV1?.sync(this);
    if(!this.active) return;
    this.raf=requestAnimationFrame(time=>this.tick(time));
    if(!CAT_ART.walk) {this.status('Loading artwork');return;}
    if(window.pixelCatLayoutV1?.gate(this,t)||window.pixelCatHomeLifeV1?.auditFlight(this,t))return;window.pixelCatEffectsV1?.tick(this,t);
    window.pixelCatScrollOverlayV1?.sync(this,t);window.pixelCatDragV1?.install(this,CAT_ART);window.pixelCatPrimaryV1?.tick(this,t);
    this.sequence ||= 0;
    if(!this.debugOrganized&&window.pixelCatDebugV1)this.debugOrganized=window.pixelCatDebugV1(this,()=>CAT_OWNERS);
    if(this.gallopReviewAt!==undefined){const canvas=this.shadowRoot.querySelector('.gallop-preview'),clip=CAT_ART.gallopPreview;if(canvas&&clip){if(t-this.gallopReviewAt>8000){canvas.hidden=true;this.gallopReviewAt=undefined;}else {const holds=clip.frames.map(()=>1000/gallopRate(clip,this.config)),total=holds.reduce((a,b)=>a+b,0),frame=sequenceFrame(((t-this.gallopReviewAt)%total)/total,holds).frame,c=canvas.getContext('2d');c.clearRect(0,0,96,96);c.fillStyle=this.config.color||'#222';clip.frames[frame].forEach((r,y)=>[...r].forEach((v,x)=>{if(v!=='.')c.fillRect(x*4,y*4,4,4);}));}}}
    const gap=t-this.lastTick; this.lastTick=t;
    if(gap>1000) {if(!this.paused)this.freezeClocks(gap);this.invalidate();}
    if(this.waitingForSurface&&t>=(this.surfaceRetryAt||0)){this.surfaceRetryAt=t+1000;this.needsMeasure=true;}
    if(this.needsMeasure){this.measure();if(this.waitingForPlacement)return;if(this.layoutRecovery?.local&&window.pixelCatLayoutV1.gate(this,t))return;}
    window.pixelCatDepthV1?.cat(this,t);if(window.pixelCatDragV1?.tick(this,t,CAT_ART))return;
    if(this.waitingForSurface){this.layer.style.visibility='hidden';this.freezeClocks(gap);this.status(this.noPathMessage);return;}
    if(!this.homeArtReady)this.renderHomeProp();
    if(this.paused) {this.layer.style.visibility='visible';if(!this.signature)this.draw(CAT_ART.stand);this.propScene?.tick(t,this);this.freezeClocks(gap);if(this.motion){const m=this.motion;if(m.kind==='jump'||m.kind==='startle'){const p=this.jumpSample(m,Math.min(1,(t-m.start)/m.duration));this.draw(p.rows);this.svg.style.transform=`translate(${p.x}px,${p.top}px)`;}else{const p=walkSample(m,t-m.start,this.scale,CAT_ART.walk);this.x=p.x;this.y=window.pixelCatSetupV1?.walkHeight?.(this,m,p)??m.fromY;this.draw(walkAppearance(CAT_ART,m,p,this.config).rows);if(m.gallopTimeline)this.svg.style.transform=`translate(${p.x}px,${m.fromY-24*this.scale}px)`;}}else if(this.idle?.placement)this.svg.style.transform=`translate(${this.idle.placement.x}px,${this.idle.placement.top}px)`;this.renderMoodDebug(t);this.status('Paused');return;}
    if(t>this.checkAt) {
      const wasSuspended=this.suspended;this.suspended=this.blocked(t);
      // Geometry changes trigger a batched reset before stale landing coordinates can be used.
      const moved=window.pixelCatLayoutV1?.changed(this);
      this.checkAt=t+700;if(wasSuspended&&!this.suspended){this.needsMeasure=true;return;} if(moved) {this.invalidate();return;}
    }
    if(this.suspended||this.stranded) {this.propScene?.tick(t,this);this.layer.style.visibility='hidden';this.freezeClocks(gap);this.status(this.stranded?this.noPathMessage:'Paused for dashboard overlay');return;}
    this.layer.style.visibility='visible';this.updateMoodState(gap>1000?0:gap);window.pixelCatPostRestV1?.step(this,gap);
    window.pixelCatSetupV1?.clearRestMask(this);
    if(window.pixelCatSetupV1?.arrival(this,t,CAT_ART,walkSample,walkAppearance,idleSample,frameContact,idleContact))return;
    window.pixelCatCommandsV1?.tick(this,t);
    if(!window.pixelCatSettlingV1?.holding(this,t)){
    const decisionAt=this.config.debug_performance?performance.now():0;this.decisionLayer()?.step(gap>1000?0:gap,t);if(this.config.debug_performance)this.decisionCost=performance.now()-decisionAt;
    if(window.pixelCatClimbV1?.tick(this,t,CAT_ART))return;
    window.pixelCatMouthV1?.step?.(this,t,CAT_ART);window.pixelCatHomeLifeV1?.tick(this,t);
    this.runStartleFollowup(t);this.propScene?.tick(t,this);this.tryIdleMouseBat(t);this.updateToyHunt(t);
    if(this.previewPose&&t>=this.forcedIdleUntil){this.previewPose=null;this.actionTarget=null;}
    if(!this.previewPose&&this.playRequested&&!this.motion&&!this.route?.length){this.playRequested=false;this.startPlay(t,true);}
    if(this.play)this.advancePlay(t);
    else if(!this.social?.episode&&!this.previewPose&&this.config.playful_pounces!==false&&!this.motion&&!this.route?.length&&!this.goal&&!this.command&&this.idle&&t-this.idle.start>1000&&t>(this.nextPlayAt||Infinity)){this.nextPlayAt=t+60000+Math.random()*60000;if(Math.random()<(window.pixelCatPostRestV1?.choiceWeight(this,'ambush')??1)*(this.config.mood_behaviour?.025+.12*this.ensureMood().values.playfulness*(1-.7*this.ensureMood().values.sleepiness):.08))this.startPlay(t);}
    window.pixelCatSetupV1?.restSupport?.(this,t);
    if(window.pixelCatPolishV1?.departure(this,t,frameContact,idleContact))return;
    }
    let rows=this.idle?.rows||(this.support?.home?CAT_ART.loaf:CAT_ART.sit), placement=this.motion?null:this.idle?.placement||null;
    if(this.motion) {
      const m=this.motion, p=m.duration?Math.min(1,(t-m.start)/m.duration):1;
      if(m.kind==='walk') {
        const sample=walkSample(m,t-m.start,this.scale,CAT_ART.walk);
        const appearance=walkAppearance(CAT_ART,m,sample,this.config);this.x=sample.x;this.y=window.pixelCatSetupV1?.walkHeight?.(this,m,sample)??m.fromY;rows=appearance.rows;if(m.gallopTimeline)placement={x:sample.x,top:m.fromY-24*this.scale};this.setAttribute('data-head-phase',String(appearance.head??'authored'));this.setAttribute('data-frame-origin',appearance.origin);
        this.setAttribute('data-walk-step',String(sample.step));this.setAttribute('data-frame',`${m.sneakTimeline?'sneak':'walk'}-${sample.frame+1}`);this.setAttribute('data-sequence-id',appearance.sequenceId||(m.sneakTimeline?CAT_ART.sneak[sample.variant].sequenceId:m.fastClip?.sequenceId||'walk'));
      } else {
        placement=this.jumpSample(m,p);rows=placement.rows;
        this.setAttribute('data-frame-origin',placement.origin||'human');
        this.setAttribute('data-sequence-id',placement.sequenceId||placement.kind);this.setAttribute('data-asset-frame',String(placement.assetFrame??placement.frame));
        if(placement.frame===2){this.flightAssets?.add(placement.sequenceId||placement.kind);this.setAttribute('data-last-flight-assets',[...this.flightAssets||[]].join(','));}
        this.x=placement.x;this.y=placement.top+catBounds(rows).bottom*this.scale;
        this.setAttribute('data-frame',`${placement.kind}-${placement.frame+1}`);
      }
      if(p===1) {
        if(m.kind==='walk'&&!m.sneakTimeline) {this.walkSteps=m.gaitStart+m.cells;this.walkHeadPhase=(m.headStart??m.gaitStart)+(m.headOffsets?.at(-1)??m.cells);}
        this.support=m.target;this.x=m.x;this.y=m.y;this.motion=null;window.pixelCatExplorationV1?.observe(this,t);if(m.kind==='jump')this.publishLanding(m,t);if(this.play?.stage==='pounce')this.play.landingX=m.x;
        if(m.kind==='startle'&&m.followup)this.startleAfter=m.followup;
        if(m.kind==='startle'||m.sneakTimeline||m.fastClip||m.gallopTimeline)this.idle={contactX:this.x+groundedFront(rows,this.facing)*this.scale,pose:'stand',support:this.support.id,start:t,poseUntil:t};
        window.pixelCatPolishV1?.travelEnd(this,m);window.pixelCatBedEntryV1?.travelEnd(this,m);
        if(this.play&&['sneak','pounce'].includes(this.play.stage))this.play.waitUntil=t;
        if(m.kind==='jump') {
          const point=CAT_ART.leapAnchors[m.jumpKind].at(-1).point;
          const landedPaw=frameContact(rows,this.facing,point)[0];
          const nextWalk=CAT_ART.walk[(this.walkSteps+1)%CAT_ART.walk.length];
          this.x+=(landedPaw-groundedFront(nextWalk,this.facing))*this.scale;
        }
        if(this.recallPending) {this.recallPending=false;this.route=[];this.deadline=0;}
        else if(this.finishing) {this.finishing=false;this.recordVisit(t);this.deadline=t+restDuration(this.config,this.support.home,this);this.urgency='relaxed';}
      }
    } else if(this.route?.length) this.advance(t);
    else if(!this.play&&!this.social?.episode&&t>this.deadline) {this.plan();}
    else {
      if(!this.idle||this.idle.support!==this.support.id||t>=this.idle.poseUntil||this.inspectionPending){
        const oldIdle=this.idle,previousFacing=this.facing,oldPose=this.idle?.pose||'walk';
        const base=this.support.poses?.length?this.support.poses:this.support.home||this.support.internal?['alertLying','loaf','sit','sithead','clean','look','stretch','stand','sniff','scratch','yawn','sleep','meow']:['backRoll','alertLying','perch','sit','sithead','glance','clean','loaf','look','lookdown','stand','scratch','yawn','meow','chatter'];const peek=lookDownFacing(this.support,this.x,this.scale,this.facing),choices=base.filter(p=>(window.pixelCatBehaviourV1?.allowed(this,CAT_ART.idleSequences?.[p])!==false)&&(p!=='backRoll'||['loaf','alertLying'].includes(oldPose))&&(p!=='lookdown'||peek!==null)&&(!['sniff','scratch','yawn','sleep','meow','chatter'].includes(p)||CAT_ART.idleSequences?.[p]));
        if(!this.support.narrow&&!this.support.poses?.length&&this.config.mood_behaviour&&CAT_ART.idleSequences?.sleep&&window.pixelCatBehaviourV1?.allowed(this,CAT_ART.idleSequences.sleep)!==false&&!choices.includes('sleep'))choices.push('sleep');const inspection=this.inspectionPending;let pose=this.previewPose||this.play?.pose||this.previewBedPose||this.social?.restPose()||(inspection?'look':weightedPick(choices,p=>idlePoseWeight(p,this.recentPoses,peek)*(window.pixelCatBehaviourV1?.weight(this,CAT_ART.idleSequences?.[p])??1)*(this.social?.poseWeight(p)||1)*(window.pixelCatPostRestV1?.poseWeight(this,p)||1),this.config.mood_behaviour?()=>this.ensureMood().random():Math.random));if(!pose||window.pixelCatBehaviourV1?.allowed(this,CAT_ART.idleSequences?.[pose])===false)pose='stand';this.recentPoses||=[];this.recentPoses.push({pose});if(this.recentPoses.length>3)this.recentPoses.shift();if(['glance','lookdown'].includes(pose)&&!CAT_ART.idleSequences?.[pose])pose='sit';if(pose==='lookdown'&&peek!==null)this.facing=peek;this.inspectionPending=null;if(inspection)this.facing=inspection.lookAt.x>=this.x+12*this.scale?1:-1;this.idleSequence=(this.idleSequence||0)+1;
        this.previewBedPose=null;if(window.pixelCatBedEntryV1?.beforeIdle(this,pose,t,CAT_ART,groundedFront))return;
        const poseConfig=pose==='bat'?{...this.config,bat_stroke:this.play?.strokes?.[this.play.strokeIndex]}:this.config,first=idleSample(CAT_ART,pose,0,poseConfig);
        const duration={backRoll:16000,alertLying:12000,loaf:20000,sit:12000,sithead:12000,perch:12000,clean:3000,look:4000,lookdown:3000,glance:3000,stretch:1250,stand:6000,sniff:2200,scratch:2200,yawn:2300,sleep:8500,meow:950,chatter:850,rub:1900,bat:2600}[pose];
        const bridge=this.previewPose?[]:loafBridge(CAT_ART,oldPose==='sleep'?'loaf':oldPose,pose==='sleep'?'loaf':pose,oldIdle,this.config,t),bridgeMs=window.pixelCatPolishV1.bridgeDuration(bridge,this.config);
        this.idle={pose,bridge,bridgeMs,inspectionId:inspection?.id,start:t,poseUntil:t+bridgeMs+(this.social?.idleDuration(pose,duration,restDuration(this.config,this.support.home))??Math.min(duration,restDuration(this.config,this.support.home)/(pose==='sleep'?1.1:3))),support:this.support.id,contactX:idleTransitionContact(oldIdle,pose,bridge.length?{rows:bridge[0]}:first,this.facing,this.scale,this.x,previousFacing)};this.social?.prepareIdle?.(this.idle,t);if(this.previewPose)this.idle.poseUntil=this.forcedIdleUntil;if(this.play?.stage==='bat'&&pose==='bat'){this.idle.poseUntil=t+bridgeMs+batClipFor(CAT_ART,poseConfig).durations.reduce((a,b)=>a+b,0)*Math.max(80,Number(this.config.idle_frame_ms)||250)/250;this.play.waitUntil=this.idle.poseUntil;}window.pixelCatReactionsV1?.prepareIdle(this,this.idle,t,CAT_ART);window.pixelCatPostRestV1?.idleStarted(this,this.idle,CAT_ART);
      }
      const elapsed=t-this.idle.start,bridging=elapsed<(this.idle.bridgeMs||0),sample=bridging?window.pixelCatPolishV1.bridgeSample(this.idle.bridge,elapsed,Math.max(80,Number(this.config.idle_frame_ms)||250)):idleSample(CAT_ART,this.idle.pose,elapsed-(this.idle.bridgeMs||0),{...this.config,track_seed:this.ownerKey,bat_stroke:this.play?.strokes?.[this.play.strokeIndex],clip_exit_at_ms:this.idle.poseUntil-this.idle.start-(this.idle.bridgeMs||0)}),point=frameContact(sample.rows,this.facing,sample.anchor||idleContact(sample.rows));rows=sample.rows;this.setAttribute('data-frame-origin',sample.origin||'human');
      if(!bridging&&this.idle.bridgeMs&&!this.idle.bridgeDone){this.idle.contactX=idleTransitionContact(this.idle,this.idle.pose,sample,this.facing,this.scale,this.x);this.idle.bridgeDone=true;}
      if(this.support.narrow)this.idle.contactX=narrowIdleContact(this.support,rows,point,this.facing,this.scale,this.idle.contactX,this.idle.pose);
      placement={x:this.idle.contactX-point[0]*this.scale,top:this.support.top-(point[1]+1)*this.scale};
      placement=window.pixelCatSetupV1?.restPlacement(this,placement,rows,CAT_ART,t)||placement;
      this.idle.rows=rows;this.idle.anchor=sample.anchor;this.idle.facing=this.facing;this.idle.placement=placement;this.handleToyBatContact(sample,placement,bridging);this.social?.contactFrame?.(sample,placement,bridging,t);
      const contact=CAT_ART.interactionContacts?.[this.idle.pose];if(contact){const point=frameContact(rows,this.facing,contact.point);this.actionTarget={x:placement.x+(point[0]+.5)*this.scale,y:placement.top+(point[1]+.5)*this.scale,pose:this.idle.pose};this.setAttribute('data-action-contact',JSON.stringify(this.actionTarget));}else this.actionTarget=null;
      this.setAttribute('data-sequence-id',CAT_ART.idleSequences?.[this.idle.pose]?.sequenceId||this.idle.pose);
      this.setAttribute('data-frame-origin',sample.origin||'human');
      this.x=placement.x;this.y=this.support.top;this.setAttribute('data-frame',`${bridging?'transition':'idle'}-${this.idle.pose}-${sample.frame+1}`);this.setAttribute('data-pose',this.idle.pose);if(!bridging)window.pixelCatEffectsV1?.groom(this,sample,placement,t);
    }
    this.status(this.noPathMessage||`${this.motion?.kind || this.idle?.pose || (this.support?.home?'Home':'Perched')}`);
    this.draw(rows);window.pixelCatBedEntryV1?.mask(this,rows);
    if(placement) this.svg.style.transform=`translate(${placement.x}px,${placement.top}px)`;
    const drawn=/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(this.svg.style.transform||'');if(this.social&&drawn)this.social.capture(rows,{x:Number(drawn[1]),top:Number(drawn[2])});
    if(drawn)window.pixelCatMouthV1?.frame?.(this,rows,drawn,t,CAT_ART);
    this.renderMoodDebug(t);
    if(t>(this.debugAt||0)){this.debugAt=t+250;this.renderDebug();}
  }
}
if(!customElements.get('pixel-cat-home')) customElements.define('pixel-cat-home',PixelCatHome);
window.customCards=window.customCards||[];
if(!window.customCards.some(c=>c.type==='pixel-cat-home'))window.customCards.push({type:'pixel-cat-home',name:'Pixel Cat',description:'Welcome a cat to your dashboard, or add a shared performance monitor.',preview:true});
