import {mirrorClimbFrame} from './climb-rotation.mjs';
// Isolated climb experiment. No production actor, Studio store or dashboard writes.
export const defaults={age:'kitten',mode:'climb',grippy:true,mirror:false,scale:3,rise:210,gap:100,postHeight:370,hop:1,gainBasis:2,tempo:2,hold:120,approach:650,attach:19,playHeight:45,maxCycles:32,entry:'walk',approachCells:36,entrySpeed:1,entryLedgeRise:100,leapRise:30,planeColour:'#d7d0ba',decisionHold:700,exitPose:'none',scenario:'single',rotationPath:'front',entryPose:'side'};
export const clone=value=>JSON.parse(JSON.stringify(value));
export function seedFrames(){
 const specs=[['Find grip','enter','front',170,0,0],['Gather hind legs','cycle','both',160,0,1],['Extend / push','cycle','hind',90,0,2],['Release and rise','cycle','free',100,5,3],['Reach higher','cycle','free',100,3,4],['Catch / wrap','cycle','front',100,0,5],['Grip and rest','cycle','front',260,0,6]];
 return specs.map(([name,role,contact,ms,gain,pose],i)=>{
  const p=Array.from({length:24},()=>Array(24).fill('.')),rect=(x,y,w,h,v='#')=>{for(let j=y;j<y+h;j++)for(let k=x;k<x+w;k++)if(p[j]?.[k]!==undefined)p[j][k]=v;},line=(x,y,tx,ty,v='#')=>{const n=Math.max(Math.abs(tx-x),Math.abs(ty-y));for(let j=0;j<=n;j++)rect(Math.round(x+(tx-x)*j/Math.max(1,n)),Math.round(y+(ty-y)*j/Math.max(1,n)),1,1,v);};
  // Upright torso close to the post; a folded/pushing rump and trailing tail.
  rect(12,8,5,10);rect(11,11,7,5);rect(14,3,6,5);rect(13,2,2,3);rect(17,1,2,3);rect(19,5,2,2);
  line(12,16,10,21);line(10,21,7+(pose%2),23);
  const folded=[1,3,6].includes(pose);line(14,16,folded?11:16,folded?18:21);line(folded?11:16,folded?18:21,19,folded?16:22);rect(19,folded?16:22,3,1,'R');
  if(contact==='front'||contact==='both'){line(15,9,19,4);rect(19,4,4,1,'R');line(16,10,20,8);rect(20,8,3,1,'R');}
  else if(pose===4){line(15,9,19,2);rect(19,2,3,1,'R');line(16,10,19,6);rect(19,6,3,1,'R');}
  else {line(15,9,17,7);rect(17,7,2,1,'R');line(16,10,18,10);rect(18,10,2,1,'R');}
  return {id:'ai-climb-'+i,name,role,contact,ms,gain,anchor:{x:20,y:4},paws:[{x:20,y:4},{x:21,y:8}],rows:p.map(r=>r.join('')),origin:'ai',reviewStatus:'draft',rest:pose===6};
 });
}
const range=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b;
export function validateDraft(d,{playback=true,contactPixels=true}={}){
 if(d?.schema!=='pixel-cat-climb-lab/v1'||!Array.isArray(d.frames)||d.frames.length<2||d.frames.length>64)throw Error('Expected a climb lab v1 draft with 2-64 frames.');
 if(!d.config||typeof d.config!=='object'||Array.isArray(d.config))throw Error('A draft config object is required.');
 if(d.config.gainBasis!==undefined&&![1,2].includes(d.config.gainBasis))throw Error('Unknown climb gain basis.');
 const config={...defaults,...d.config};if(d.config.hop!==undefined&&d.config.gainBasis!==2)config.hop=d.config.hop/2;config.gainBasis=2;
 d={...d,config};const c=d.config;if(!c||!['kitten','adult','senior'].includes(c.age)||!['auto','climb','rebound','return'].includes(c.mode))throw Error('Choose a valid age and route mode.');
 for(const [key,min,max]of [['scale',1,6],['rise',20,340],['gap',30,260],['postHeight',80,440],['hop',.125,2],['tempo',.25,6],['hold',40,1000],['approach',100,2000],['attach',8,120],['playHeight',8,120],['maxCycles',1,32],['approachCells',8,120],['entrySpeed',.25,3],['entryLedgeRise',0,240],['leapRise',12,100],['decisionHold',100,4000]])if(!range(c[key],min,max))throw Error('Invalid '+key+' setting.');
 if(!['walk','meander','trot','gallop','sneak','scratch','jump-up','pounce','ledge-jump','grip'].includes(c.entry)||!['none','stand','loaf','alertLying'].includes(c.exitPose))throw Error('Invalid neighbouring sequence.');
 if(!Number.isInteger(c.maxCycles)||typeof c.grippy!=='boolean'||typeof c.mirror!=='boolean')throw Error('Invalid grip, mirror or cycle limit.');
 if(!/^#[a-f0-9]{6}$/i.test(c.planeColour))throw Error('Use a six-digit plane colour.');
 if(!['side','centre-front','centre-back'].includes(c.entryPose))throw Error('Invalid entry grip pose.');
 if(!['single','rotate-exit','centre-route','plane'].includes(c.scenario)||!['front','back'].includes(c.rotationPath))throw Error('Invalid playground scenario or rotation path.');
 const ids=new Set();for(const f of d.frames){
  if(typeof f.id!=='string'||ids.has(f.id)||typeof f.name!=='string'||f.name.length>100)throw Error('Frame IDs must be unique; names up to 100 characters.');ids.add(f.id);
  if(!['enter','cycle'].includes(f.role)||!['front','hind','both','free'].includes(f.contact)||!['ai','human','mixed'].includes(f.origin)||!range(f.ms,20,2000)||!range(f.gain,0,24))throw Error('Invalid frame timing, gain, phase or provenance.');
  if(!Array.isArray(f.rows)||f.rows.length!==24||f.rows.some(r=>typeof r!=='string'||!/^[.#R]{24}$/.test(r)))throw Error('Each frame must be a 24 by 24 . # R grid.');
  if(f.depth!==undefined&&(!Array.isArray(f.depth)||f.depth.length!==24||f.depth.some((r,y)=>typeof r!=='string'||!/^[.NF]{24}$/.test(r)||[...r].some((v,x)=>v!=='.'&&f.rows[y][x]==='.'))))throw Error('Depth overrides must be 24 by 24 . N F guides on existing ink.');
  if(![f.anchor,...f.paws||[]].every(p=>p&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&range(p.x,0,23)&&range(p.y,0,23)))throw Error('Contact points must be inside the grid.');
  if(!Array.isArray(f.paws)||f.paws.length!==2)throw Error('Two forepaw contact markers are required.');
  if(!f.rows.some(r=>r.includes('#')))throw Error('Each frame needs body pixels.');
  if(playback&&f.contact!=='free'&&f.gain!==0)throw Error('Height gain belongs to released frames; planted paws must not slide.');
  if(playback&&contactPixels&&['front','both'].includes(f.contact)&&f.paws.some(p=>f.rows[p.y][p.x]==='.'))throw Error('A gripping frame must have visible ink at both forepaw contact guides.');
 }
 const cycle=d.frames.filter(f=>f.role==='cycle');if(playback&&(!cycle.length||cycle.reduce((n,f)=>n+f.gain,0)<=0||!['front','both'].includes(cycle.at(-1).contact)))throw Error('A cycle needs released height gain and must finish with a front-paw catch.');
 if(d.rotations!==undefined){if(!d.rotations||typeof d.rotations!=='object'||Array.isArray(d.rotations))throw Error('Invalid rotation clips.');for(const path of ['front','back']){const clip=d.rotations[path];if(!clip)continue;validateDraft({schema:d.schema,config:d.config,frames:clip.frames},{playback:false});if(playback&&contactPixels&&clip.frames.some(f=>['front','both'].includes(f.contact)&&f.paws.some(p=>f.rows[p.y][p.x]==='.')))throw Error('Rotation forepaw guides must be on visible ink.');if(clip.frames.length>32||clip.frames.some(f=>!range(f.around,0,1)||f.gain!==0)||playback&&(clip.frames.some((f,i)=>i>0&&f.around<clip.frames[i-1].around)||clip.frames[0].around!==0||clip.frames.at(-1).around!==1))throw Error('A rotation must progress from one side to the other at zero height gain.');}}
 if(d.centred!==undefined){if(!d.centred||typeof d.centred!=='object'||Array.isArray(d.centred))throw Error('Invalid centred clips.');for(const path of ['front','back'])if(d.centred[path])validateDraft({schema:d.schema,config:d.config,frames:d.centred[path].frames},{playback,contactPixels});}
 if(d.defaultProposal!==undefined){const p=d.defaultProposal;if(p?.schema!=='pixel-cat-climb-defaults/v1'||typeof p.id!=='string'||p.id.length>80||!Number.isFinite(Date.parse(p.submittedAt))||p.status!=='pending'||!p.values||!p.systemValues||!/^[a-f0-9]{64}$/.test(p.sourceVersion))throw Error('Invalid default submission.');for(const values of [p.values,p.systemValues]){if(Object.values(values).some(v=>typeof v!=='number'))throw Error('Default slider values must be numeric.');validateDraft({schema:d.schema,config:{...d.config,...values},frames:d.frames},{playback:false});}}
 return d;
}
export function freshDraft(){return {schema:'pixel-cat-climb-lab/v1',name:'Upright climb - AI orientation draft',config:clone(defaults),frames:seedFrames()};}
export function sceneFor(config){const c={...defaults,...config},scale=c.scale*(c.age==='kitten'?.5:1),floor={id:'home',left:50,right:['rotate-exit','centre-route'].includes(c.scenario)?900:840,top:540},face={id:'post',x:['rotate-exit','centre-route'].includes(c.scenario)?480:720,top:540-c.postHeight,bottom:540,grippy:c.grippy,passThrough:true,sides:['left','right']};face.right=face.x+(c.scenario==='plane'?100:26);face.material=c.scenario==='plane'?'wallpaper':'sisal';face.surfaceColour=c.scenario==='plane'?c.planeColour:'#b29b69';face.materialColour=face.surfaceColour;const target=['rotate-exit','centre-route'].includes(c.scenario)?{id:'upper-card',left:face.right+c.gap,right:Math.min(930,face.right+c.gap+240),top:540-c.rise}:{id:'upper-card',left:face.x-c.gap-260,right:face.x-c.gap,top:540-c.rise},startX=Math.max(floor.left,face.x-(20+c.approachCells)*scale),ledge={id:'entry-ledge',left:Math.max(50,startX-18*scale),right:Math.min(face.x-8*scale,startX+28*scale),top:floor.top-c.entryLedgeRise};return {scale,width:960,height:620,floor,face,target,startX,ledge};}
const ease=q=>1-(1-q)**2;
export function samplePlan(plan,ms){
 if(!plan?.segments?.length)return null;const t=Math.max(0,Math.min(plan.duration,ms));let lo=0,hi=plan.segments.length-1;
 while(lo<hi){const mid=(lo+hi)>>1;if(plan.segments[mid].end<=t)lo=mid+1;else hi=mid;}
 const seg=plan.segments[lo],elapsed=Math.max(0,Math.min(seg.ms,t-seg.start)),q=elapsed/seg.ms;
 if(seg.jump)return {...seg.jump.sample(elapsed),kind:seg.kind,phase:seg.phase||'release / flight / landing',contact:'free',segment:lo};
 const p=['rotation','slip'].includes(seg.kind)?q*q*(3-2*q):seg.frame.contact==='free'?ease(q):q,root={x:seg.from.x+(seg.to.x-seg.from.x)*p,y:seg.from.y+(seg.to.y-seg.from.y)*p};
 return {kind:seg.kind,phase:seg.phase||seg.frame.name,frame:seg.frame,root,contact:seg.kind==='slip'?'sliding':seg.frame.contact,cycle:seg.cycle,segment:lo,node:seg.node,facing:seg.node?.facing||1,draftDescent:seg.draftDescent};
}
// A grip is a support state, not a mandatory next-animation script. These pure
// transitions can later become bounded route-graph edges without a second planner.
export function planClimb(input,probe,resume=null,{contactPreview=false,previewRotation=null,scene:explicitScene=null,stopAtFirstGrip=false}={}){
 const d=validateDraft(input,{contactPixels:!contactPreview}),c=d.config;if(c.entryPose!=='side'&&!d.centred?.[c.entryPose.slice(7)])throw Error('Create the centred draft before choosing its landing pose.');const scene=explicitScene||sceneFor(c),s=scene.scale,{floor,face,target}=scene,entryFrames=c.entryPose==='side'?d.frames:d.centred[c.entryPose.slice(7)].frames,enter=entryFrames.filter(f=>f.role==='enter'),cycle=entryFrames.filter(f=>f.role==='cycle'),segments=[],attempts=[],grips=[],cache=new Map(),gripCeilingY=Math.max(face.top+4*s,scene.gripCeilingY??-Infinity),gripFloorY=scene.gripFloorY??floor.top-Math.max(...d.frames.map(f=>f.rows.findLastIndex(r=>r.includes('R'))+1-f.anchor.y))*s;let side=resume?.state.side||(c.entryPose==='side'?'left':c.entryPose),cursor=0,checks=0,cycles=0,root=resume?{...resume.state.root}:{x:face.x,y:floor.top-c.attach*s};
 const add=(seg,ms)=>{segments.push({...seg,ms,start:cursor,end:cursor+ms});cursor+=ms;};
 const sideX=value=>value==='right'?face.right:value.startsWith('centre-')?(face.x+face.right)/2:face.x;root.x=sideX(side);
 const goalSide=target.left>=face.right?'right':'left',sideFrame=frame=>side==='right'?mirrorClimbFrame(frame):frame,rotationFrames=path=>d.rotations?.[path]?.frames;
 const release=(point,frame,dest)=>{let departureSide=side;if(dest===target&&side!==goalSide&&c.scenario!=='plane'){const clip=rotationFrames(side.startsWith('centre-')?side.slice(7):c.rotationPath);if(!clip)return null;point={x:goalSide==='right'?face.right:face.x,y:point.y};frame=goalSide==='right'?clip.at(-1):clip[0];departureSide=goalSide;}const key=[point.x,point.y,frame.id,dest.id,departureSide].join(':');if(!cache.has(key)){if(checks>=95)return null;checks++;cache.set(key,probe.release(point,frame,dest,{side:departureSide}));}return cache.get(key);};
 const rotate=(path,destination=side==='left'?'right':'left')=>{
  if(side.startsWith('centre-')&&side.slice(7)!==path)throw Error('Return to a side before changing the rotation arc.');
  const clip=rotationFrames(path),a=side==='left'?0:side==='right'?1:.5,b=destination==='left'?0:destination==='right'?1:.5,list=clip.filter(f=>f.around>=Math.min(a,b)&&f.around<=Math.max(a,b));if(b<a)list.reverse();
  for(const frame of list){const from={...root};root={x:face.x+(face.right-face.x)*frame.around,y:root.y};add({kind:'rotation',sequence:path,phase:'Rotate '+path+' / '+frame.name,frame,from,to:{...root},cycle:cycles},Math.max(35,frame.ms*(1.35-Math.sin(Math.PI*2*frame.around)**2)* (frame.rest?c.hold/260:1)/c.tempo));}
  side=destination;if(!d.centred)return list.at(-1);const frame=side.startsWith('centre-')?d.centred[path].frames[0]:side==='right'?clip.at(-1):clip[0],from={...root};root.x=sideX(side);add({kind:'rotation',sequence:path,phase:'Settle / '+side,frame,from,to:{...root},cycle:cycles},80/c.tempo);return frame;
 };
 const currentCatch=()=>side.startsWith('centre-')?d.centred[side.slice(7)].frames.at(-1):sideFrame(d.frames.filter(f=>f.role==='cycle').at(-1));
 const finish=(route,exit=null)=>{if(exit){add({kind:'jump',jump:exit},exit.duration);if(c.exitPose!=='none'&&probe.settle){const rest=probe.settle(exit,c.exitPose);if(rest)add({kind:'rest',jump:rest,phase:'After landing / '+c.exitPose},rest.duration);}}const destination=resume?(resume.action==='floor'?floor:target):c.mode==='return'?floor:target;let safeReturn=destination===floor;if(exit&&!safeReturn){checks++;safeReturn=!!probe.ground(exit.landingX,destination,floor);}return {ok:true,route,scene,segments,grips,duration:cursor,checks,cycles,safeReturn,directReachable:!!direct,attempts,holdAtEnd:segments.at(-1)?.kind==='grip',goalReached:!!exit,returnNote:exit?(safeReturn?'A normal return jump is reachable.':'Outbound lab route only: a reviewed descent route is still needed.'):'Gripped support: pause, reassess or choose another available edge.'};};
 const baseGain=cycle.reduce((n,f)=>n+f.gain,0)*c.hop*c.gainBasis*s,first=enter[0]||cycle[0],catchFrame=cycle.at(-1),entryY=floor.top-c.attach*s;
 const direct=probe.ground(scene.startX,floor,target);checks++;
 if(!resume&&!['rotate-exit','centre-route'].includes(c.scenario)&&c.mode==='auto'&&direct&&c.entry!=='grip'){add({kind:'jump',jump:direct},direct.duration);checks++;return {ok:true,route:'direct jump',scene,segments,grips,duration:cursor,checks,cycles:0,directReachable:true,safeReturn:!!probe.ground(direct.landingX,target,floor)};}
 if(!face.grippy&&c.mode!=='rebound')return {ok:false,reason:'This face has no claw grip. Use a brief rebound; sustained climbing needs an explicit grippable face.',scene,checks,directReachable:!!direct,attempts};
 if(root.y<gripCeilingY||root.y>gripFloorY)return {ok:false,reason:'This grip lies outside the usable face. Extend the post or adjust the first-grip height.',scene,checks,directReachable:!!direct,attempts};
 const grip=(frame=currentCatch())=>{const upper=release(root,frame,target),down=release(root,frame,floor),node={id:'grip-'+grips.length,surfaceId:face.id,pose:side.startsWith('centre-')?'findGripCentred':'findGrip',side,facing:1,root:{...root},frame,heightCells:(floor.top-root.y)/s,options:[
  {id:'hold',label:'Stay / reassess',enabled:face.grippy},
  {id:'up',label:'Climb one step',enabled:face.grippy&&root.y>gripCeilingY},
  {id:'down',label:'Climb down one step (draft)',enabled:face.grippy&&root.y<gripFloorY},
  {id:'up-half',label:'Climb half a step',enabled:face.grippy&&root.y>gripCeilingY},
  {id:'down-half',label:'Climb down half a step',enabled:face.grippy&&root.y<gripFloorY},
  {id:'slide',label:'Slip / scrape down a little',enabled:face.grippy&&root.y<gripFloorY},
  {id:'upper',label:side===goalSide||c.scenario==='plane'?'Leap to upper card':'Rotate, then leap to upper card',enabled:!!upper},
  {id:'floor',label:'Leap to floor',enabled:!!down},
  {id:'side-front',label:'Around post / in front',enabled:face.grippy&&!!rotationFrames('front')&&(!side.startsWith('centre-')||side==='centre-front'),reason:rotationFrames('front')?'Rough rotation draft; review contact and depth handoffs.':'Needs rotation draft frames.'},
  {id:'side-back',label:'Around post / behind',enabled:face.grippy&&!!rotationFrames('back')&&(!side.startsWith('centre-')||side==='centre-back'),reason:rotationFrames('back')?'Rough rotation draft; review contact and depth handoffs.':'Needs rotation draft frames.'}
 ,...['front','back'].flatMap(path=>[{id:'centre-'+path,label:'Rotate to centre / '+path,enabled:face.grippy&&!!d.centred?.[path]&&!!rotationFrames(path)&&!side.startsWith('centre-')},...['left','right'].map(to=>({id:'to-'+to+'-'+path,label:'Rotate to '+to+' / '+path,enabled:face.grippy&&!!d.centred&&!!rotationFrames(path)&&side!==to&&(!side.startsWith('centre-')||side.slice(7)===path)}))])
 ],flights:{upper,floor:down}};grips.push(node);add({kind:'grip',phase:'Grip idle / reassess',frame,from:{...root},to:{...root},cycle:cycles,node},face.grippy?c.decisionHold:40);return node;};
 const moveCycle=(direction=1,distanceCells=Infinity)=>{const active=side.startsWith('centre-')?d.centred[side.slice(7)].frames.filter(f=>f.role==='cycle'):d.frames.filter(f=>f.role==='cycle'),list=direction>0?active:[...active].reverse(),gain=active.reduce((n,f)=>n+f.gain,0)*c.hop*c.gainBasis,portion=Math.max(0,Math.min(1,distanceCells/gain));for(const source of list){const frame=sideFrame(source),from={...root};root={x:sideX(side),y:Math.min(gripFloorY,Math.max(gripCeilingY,root.y-direction*frame.gain*c.hop*c.gainBasis*s*portion))};let ms=(frame.rest?frame.ms*c.hold/260:frame.ms)/c.tempo;if(!face.grippy&&['front','both'].includes(frame.contact))ms=Math.min(40,ms);add({kind:'climb',phase:direction<0?'Draft descent / '+frame.name:frame.name,frame,from,to:{...root},cycle:cycles,draftDescent:direction<0},ms);}};
 if(resume){
  if(resume.state.surfaceId!==face.id)return {ok:false,reason:'The gripped support no longer exists.',scene,checks,attempts};
  const node=grip(resume.state.frame||catchFrame),action=node.options.find(o=>o.id===resume.action);if(!action?.enabled)return {ok:false,reason:action?.reason||'That edge is not currently reachable.',scene,checks,attempts};
  if(resume.action==='upper'||resume.action==='floor'){let flight=node.flights[resume.action];if(resume.action==='upper'&&side!==goalSide&&c.scenario!=='plane'){const frame=rotate(side.startsWith('centre-')?side.slice(7):c.rotationPath,goalSide);flight=grip(frame).flights.upper;}return finish('grip / chosen '+resume.action+' leap',flight);}
  if(resume.action==='side-front'||resume.action==='side-back'){const frame=rotate(resume.action==='side-front'?'front':'back');grip(frame);return finish('grip / '+resume.action+' rotation draft');}
  if(resume.action.startsWith('centre-')||resume.action.startsWith('to-')){const parts=resume.action.split('-'),path=parts.at(-1),destination=parts[0]==='centre'?resume.action:parts[1];grip(rotate(path,destination));return finish('grip / chosen '+resume.action);}
  if(resume.action==='slide'){const from={...root},distance=Math.max(.5,Math.min(320,resume.distanceCells??4));root.y=Math.min(gripFloorY,root.y+distance*s);add({kind:'slip',phase:'Slip / scrape / catch',frame:resume.state.frame||currentCatch(),from,to:{...root},cycle:0},180+Math.min(8,(root.y-from.y)/s)*30+Math.max(0,(root.y-from.y)/s-8)*8);grip(resume.state.frame||currentCatch());}
  if(['up','down','up-half','down-half'].includes(resume.action)){cycles=1;moveCycle(resume.action.startsWith('up')?1:-1,resume.distanceCells??(resume.action.endsWith('-half')?baseGain/s/2:Infinity));grip();}
  return finish('grip / '+resume.action);
 }
 if(c.entry!=='grip'){
  if(['jump-up','pounce','ledge-jump'].includes(c.entry)){
   checks++;const jump=probe.attach?.(scene.startX,c.entry==='ledge-jump'?scene.ledge:floor,root,first,c.entry);if(!jump)return {ok:false,reason:'The chosen entry leap cannot reach this grip with the normal jump limits. Move the approach closer or adjust the first grip.',scene,checks,attempts};add({kind:'attach',phase:'Leap to Find grip / '+c.entry,jump},jump.duration);
  }else {
   const approach=probe.approach?.(c.entry==='scratch'?'meander':c.entry,scene.startX,floor,face.x-20*s,c.entrySpeed);if(approach)add({kind:'approach',phase:'Approach / '+c.entry,jump:approach},approach.duration);else add({kind:'approach',frame:first,from:{x:scene.startX+first.anchor.x*s,y:root.y},to:{...root},cycle:0},c.approach);
   const entry=probe.scratch?.(face,floor,c.entry==='scratch');if(entry)add({kind:'entry',phase:c.entry==='scratch'?'Scratch / consider climbing':'Raise shoulders / reach for grip',jump:entry},entry.duration);
  }
 }
 for(const frame of enter)add({kind:'climb',frame,from:{...root},to:{...root},cycle:0},frame.ms/c.tempo);
 const initialGrip=grip(first);if(c.entry==='grip'||stopAtFirstGrip)return finish('start on gripped support');
 let exit=null;const destination=c.mode==='return'?floor:target,limit=c.mode==='rebound'?1:c.maxCycles;
 // The destination and actual flight envelope decide release; post height only
 // bounds available grips. A failed goal leaves a playable state for reassessment.
 if(!['rotate-exit','centre-route'].includes(c.scenario)&&c.mode!=='rebound'&&c.mode!=='return')exit=initialGrip.flights.upper;
 for(let n=1;!exit&&n<=limit;n++){
  if(root.y<=gripCeilingY){attempts.push({cycle:n,reason:'Reached the highest usable grip; intended landing is still unreachable.'});break;}
  cycles=n;moveCycle();const node=grip(),candidate=node.flights[c.mode==='return'?'floor':'upper'];attempts.push({cycle:n,heightCells:node.heightCells,reachable:!!candidate});
  if(c.mode==='return'&&(entryY-root.y)<c.playHeight*s)continue;
  if(c.scenario==='centre-route'&&n===1&&!side.startsWith('centre-')&&d.centred?.[c.rotationPath]){grip(rotate(c.rotationPath,'centre-'+c.rotationPath));continue;}
  if(candidate)exit=candidate;
 }
 if(!exit){
  if(c.mode==='rebound')return {ok:false,reason:'One wall impulse cannot reach this landing.',scene,checks,directReachable:!!direct,attempts};
  if(previewRotation&&rotationFrames(previewRotation)){const frame=rotate(previewRotation);grip(frame);const held=finish('authoring rotation / unreachable destination');held.returnNote='Rotation preview only: the intended landing remains unreachable. Choose another available grip edge.';return held;}
  const held=finish('grip / reassess unreachable destination');held.returnNote='Intended landing remains unreachable. Holding at '+((floor.top-root.y)/s).toFixed(1)+' cat cells: choose another reachable edge, climb down or stay.';return held;
 }
 if(destination===target&&side!==goalSide&&c.scenario!=='plane'){const frame=rotate(side.startsWith('centre-')?side.slice(7):c.rotationPath,goalSide);exit=grip(frame).flights.upper;}
 return finish(c.mode==='return'?'climb and return':c.mode==='rebound'?'wall-assisted rebound':'grip / hop climb',exit);
}
export const framePlacement=(frame,root,scale)=>({x:root.x-frame.anchor.x*scale,top:root.y-frame.anchor.y*scale});
export function inkCentre(rows,facing=1){let x=0,y=0,n=0;rows.forEach((r,py)=>[...r].forEach((v,px)=>{if(v==='#'){x+=px+.5;y+=py+.5;n++;}}));return {x:facing<0?24-x/n:x/n,y:y/n};}
// This adapter uses the production trajectory and authored flight/landing art.
// Only contact registration and fixture endpoint selection live in the lab.
export function runtimeProbe(Home,art,config,scale){
 const actor=Object.assign(Object.create(Home.prototype),{config,scale,size:24*scale,facing:1,worldRect:config.climbWorld||{top:64}});
 const facingPoint=(p,f)=>({x:f<0?23-p[0]:p[0],y:p[1]});
 function make(fromX,fromY,target,centre,departureSide='left',fallCells=0){
  const x=Math.max(target.min??target.left,Math.min(target.max??target.right-24*scale,target.id==='home'?fromX+(departureSide==='right'?24:-24)*scale:fromX)),direction=x<fromX?-1:1,dy=target.top-fromY,dx=Math.abs(x-fromX),kind=Math.abs(dy)<=4*scale||Math.abs(dy)<=(dy>0?16:12)*scale&&dx>=2*Math.abs(dy)?'across':dy>0?'descend':'ascend';
  const m={kind:'jump',jumpKind:kind,direction,fromX,fromY,x,y:target.top,target};
  if(centre){const rows=art[kind][1],b=inkCentre(rows,direction);let ox,oy;
   if(kind==='descend'){const edge=art.descentEdges[1];ox=(direction>0?24:0)-(direction<0?23-edge.edgeX:edge.edgeX)+b.x;oy=b.y-(edge.support[1]+1);}
   else {const p=facingPoint(art.leapAnchors[kind][0].point,direction),q=facingPoint(art.leapAnchors[kind][1].point,direction);ox=p.x-q.x+b.x;oy=b.y-q.y-1;}
   m.fromX=centre.x-ox*scale;m.fromY=centre.y-oy*scale;
  }
  const jumper=Object.assign(Object.create(Home.prototype),{...actor,config:{...config,...(fallCells&&target.top>fromY?{climbFallCells:fallCells,climbFallSeconds:Math.sqrt(2*fallCells/100)+1}:{}),...(centre?{jump_max_rise:config.grip_max_rise??90}:{})}}),plan=jumper.planJump(m,config.climbWorld?.top);if(!plan)return null;m.jumpProfile=plan;m.duration=plan.duration;
  const skip=centre?plan.durations[0]+plan.durations[1]:0,duration=plan.duration-skip;
  return {duration,landingX:x,motion:m,start:plan.start,flight:plan.flight,sample:ms=>({...jumper.jumpSample(m,Math.min(1,(skip+Math.max(.001,ms))/plan.duration)),facing:m.direction})};
 }
 function attach(fromX,from,root,frame,style){
  const p=framePlacement(frame,root,scale),b=inkCentre(frame.rows),centre={x:p.x+b.x*scale,y:p.top+b.y*scale},direction=1,kind=style==='pounce'?'across':style==='jump-up'||centre.y<from.top-12*scale?'ascend':'descend',rows=art[kind][3],landing=art.leapAnchors[kind],last=landing.at(-1).point,point=landing[3].point,c=inkCentre(rows,direction),offset=kind==='ascend'?(landing[3].edgeOffset-7):0;
  const m={kind:'jump',jumpKind:kind,direction,fromX,fromY:from.top,x:centre.x-(last[0]+offset-point[0]+c.x)*scale,y:centre.y-(c.y-point[1]-1)*scale};
  const plan=actor.planJump(m,config.climbWorld?.top);if(!plan)return null;m.jumpProfile=plan;m.duration=plan.duration;const duration=plan.durations[0]+plan.durations[1]+plan.flight.flightMs;
  return {duration,landingKind:'grip',landingRoot:{...root},motion:m,end:plan.end,sample:ms=>({...actor.jumpSample(m,Math.min(duration-.001,ms)/plan.duration),facing:direction})};
 }
 function approach(kind,x,from,toX,speed=1){
  const a=Object.assign(Object.create(Home.prototype),{ownerKey:'climb-lab-probe',config:{...config,fast_walk:kind==='trot',gallop:kind==='gallop'},x,y:from.top,scale,facing:1,walkSteps:0,idle:null,urgency:kind==='meander'?'casual':kind==='trot'?'interested':'relaxed',support:{...from,min:from.left,max:from.right-24*scale},setAttribute(){}});
  a.moveTo(toX,from.top,0,'walk',a.support,0,['trot','gallop','sneak'].includes(kind)?kind:null);const m=a.motion;if(!m)return null;
  return {duration:m.duration/speed,motion:m,sample:ms=>{const t=Math.min(m.duration,ms*speed);let rows,offset,index=0;
   const list=m.gallopTimeline||m.sneakTimeline;if(list){while(index<list.length-1&&t>=list[index].until)index++;const beat=list[index];offset=beat.offset;rows=m.gallopTimeline?beat.rows:art.sneak[beat.variant].frames[beat.frame];}
   else {const holds=m.cumulativeMs||[];while(index<holds.length&&t>=holds[index])index++;offset=index;const frames=m.fastClip?.frames||art.walk;rows=frames[(m.gaitStart+index+1)%frames.length];}
   return {rows,x:m.fromX+m.direction*offset*scale,top:m.fromY-24*scale,facing:m.direction,origin:'authored runtime approach'};
  }};
 }
 function scratch(face,floor,strokes){
  const clip=art.idleSequences?.postScratch;if(!clip)return null;const indices=clip.roles.flatMap((r,i)=>r==='enter'||strokes&&r==='cycle'?[i]:[]),touch=clip.frames.find(r=>r.some(line=>line.includes('F'))),hits=touch?.flatMap((r,y)=>[...r].flatMap((v,x)=>v==='F'?[[x,y]]:[])),contact=hits?.at(-1)?.[0]??20,duration=indices.reduce((n,i)=>n+clip.durations[i],0);
  return {duration,sample:ms=>{let t=ms,index=indices.at(-1);for(const i of indices){index=i;if(t<clip.durations[i])break;t-=clip.durations[i];}return {rows:clip.frames[index],x:face.x-contact*scale,top:floor.top-24*scale,facing:1,origin:clip.origins?.[index]};}};
 }
 function settle(exit,pose){const clip=pose==='stand'?{frames:[art.stand],durations:[1500],origins:['authored runtime stand']}:art.idleSequences?.[pose];if(!clip)return null;const last=exit.sample(exit.duration),bottom=last.rows.findLastIndex(r=>r.includes('R')),front=last.rows[bottom].lastIndexOf('R'),bearing=last.x+(last.facing<0?23-front:front)*scale;
  return {duration:1500,sample:ms=>{let t=ms,index=0;for(let i=0;i<clip.frames.length;i++){index=i;if(t<clip.durations[i])break;t-=clip.durations[i];}const rows=clip.frames[index],y=rows.findLastIndex(r=>r.includes('R')),x=rows[y].lastIndexOf('R');return {rows,x:bearing-(last.facing<0?23-x:x)*scale,top:exit.motion.y-(y+1)*scale,facing:last.facing,origin:clip.origins[index]};}};
 }
 return {ground:(x,from,to)=>make(x,from.top,to),release:(root,frame,to,{side='left',fallCells=0}={})=>{const p=framePlacement(frame,root,scale),b=inkCentre(frame.rows);return make(p.x,p.top+24*scale,to,{x:p.x+b.x*scale,y:p.top+b.y*scale},side,fallCells);},attach,approach,scratch,settle};
}

export function contactWarnings(frames){return frames.flatMap((f,i)=>['front','both'].includes(f.contact)?f.paws.flatMap((p,j)=>f.rows[p.y][p.x]!=='.'?[]:[`Frame ${i+1}  -  ${f.name}: Forepaw ${j===0?'A':'B'} (${p.x}, ${p.y}) is on an empty cell. Move the guide onto the intended paw.`]):[]);}
