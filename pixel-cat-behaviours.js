
(()=>{
// Experimental, DOM-free perception. Raw authored markers remain unchanged.
function worldGaze(gaze,placement,scale,facing=1,range=180){
 if(!gaze)return {known:false,canSee:false,reason:'unknown'};
 const angle=gaze.angle*Math.PI/180;
 return {known:true,canSee:gaze.canSee!==false,reason:gaze.canSee===false?'blind':'enabled',
  x:placement.x+(facing<0?24-gaze.x-.5:gaze.x+.5)*scale,y:placement.top+(gaze.y+.5)*scale,
  dx:Math.cos(angle)*(facing<0?-1:1),dy:Math.sin(angle),fov:gaze.fov,range};
}
function targetVisibility(eye,target){
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
class Awareness {
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

// Opt-in decision pilot. Packaged with gaze helpers inside the extras resource.
// Registry geometry is for safety; decisions use observed snapshots only.
const moodPoseFactor=(pose,v)=>{
 if(pose==='sleep')return (.35+2.4*v.sleepiness)*Math.max(.01,(1-v.alertness)**3);
 if(['loaf','yawn'].includes(pose))return (.35+2.4*v.sleepiness)*(1-.55*v.alertness);
 if(['look','lookdown','glance','stand'].includes(pose))return .6+1.4*v.alertness;
 if(['sniff','chatter','meow'].includes(pose))return .5+1.5*v.playfulness;
 return 1;
};
const decisionWeights=v=>({explore:.6+1.1*v.playfulness+.6*v.alertness,settle:.25+2*v.sleepiness,company:.15+1.8*v.sleepiness,chase:.08+1.6*v.playfulness*(1-.7*v.sleepiness)});
const sampleDecision=(items,random,actor)=>{if(actor)for(const p of items)p.weight*=window.pixelCatBehaviourV1?.choiceWeight(actor,p.kind)??1;let r=random()*items.reduce((n,p)=>n+p.weight,0);return items.find(p=>(r-=p.weight)<0)||items.at(-1);};
const sameSupport=(a,b)=>!!a?.el&&a.el===b?.el&&Math.abs(a.top-b.top)<2;
const rowKey=rows=>{let h=2166136261;for(const row of rows)for(let i=0;i<row.length;i++)h=Math.imul(h^row.charCodeAt(i),16777619)>>>0;return h.toString(36);};
const SOCIAL_SCENES=new WeakMap();
class CatDecisions {
 constructor(actor,owners,art){this.actor=actor;this.owners=owners;this.art=art;this.clock=0;this.nextSense=0;this.nextSocial=0;this.memory=new Map();this.trace=[];this.rows=new WeakMap();this.awareness=new Awareness();}
 get scene(){let scene=SOCIAL_SCENES.get(this.actor.root);if(!scene){scene=new Map();SOCIAL_SCENES.set(this.actor.root,scene);}return scene;}
 peers(){const a=this.actor;return [...this.owners()].filter(([b,e])=>b!==a&&e.root===a.root&&b.active&&!b.userHeld&&!b.paused&&!b.layoutPaused&&!b.suspended&&!b.stranded&&b.social?.actor===b).map(([b])=>b);}
 available(a,moving=false){return a.active&&!a.climb&&!a.userHeld&&!a.paused&&!a.layoutPaused&&!a.suspended&&!a.stranded&&!a.mouthAction&&!a.goal&&!a.command&&!a.previewPose&&!a.play&&!a.playRequested&&!a.toyHunt&&!a.toyHuntRequested&&(!a.motion||moving&&a.motion.kind==='walk')&&!a.route?.length&&!a.recallPending;}
 log(kind,details={}){this.trace.unshift({at:Math.round(this.clock),kind,...details});this.trace.length=Math.min(30,this.trace.length);this.actor.setAttribute('data-decision',JSON.stringify(this.trace[0]));}
 gaze(rows,sequence){if(!rows)return null;const composite=window.pixelCatTrackRuntimeV1?.metadata(rows);if(composite)return composite.gaze??null;let key=this.rows.get(rows);if(!key){key=rowKey(rows);this.rows.set(rows,key);}const index=this.art().gazeIndex,specific=index?.sequences?.[sequence==='stand'?'sequence-stand':sequence==='walk'?'sequence-walk':sequence];return specific&&key in specific?specific[key]:index?.rows?.[key]??null;}
 capture(rows,placement){const a=this.actor,art=this.art(),sequence=a.getAttribute('data-sequence-id'),label=a.getAttribute('data-frame')||'';let gaze=this.gaze(rows,sequence),clip,frame;
  if(label.startsWith('idle-')){clip=art.idleSequences?.[a.idle?.pose];frame=Number(label.split('-').at(-1))-1;}
  else if(a.motion?.fastClip){clip=a.motion.fastClip;frame=Number(label.split('-').at(-1))-1;}
  if(clip&&Number.isInteger(frame)){const metadata=art.gazeIndex?.frames?.[clip.sequenceId]?.[clip.sourceFrames?.[frame]??frame];if(metadata?.key===this.rows.get(rows))gaze=metadata.gaze;}
  this.frame={rows,placement:{...placement},facing:a.facing,gaze};
 }
 sense(){const a=this.actor,f=this.frame;if(!f)return;const eye=worldGaze(f.gaze,f.placement,a.scale,f.facing,Math.max(24,Math.min(240,Number(a.config.social_sight_cells)||110))*a.scale),peers=this.peers();
  const targets=peers.map(b=>({id:b.ownerKey,label:b.config.name||b.ownerKey,x:b.x+12*b.scale,y:b.y-12*b.scale,width:20*b.scale,height:22*b.scale,moving:!!b.motion}));
  const result=this.awareness.update(eye,targets,this.clock,{dwell:250,motionDwell:120,memory:2500});
  for(const state of result.states){const b=peers.find(p=>p.ownerKey===state.id);if(state.visible&&state.aware){this.memory.set(b.ownerKey,{id:b.ownerKey,x:b.x,y:b.y,scale:b.scale,pose:b.motion?'moving':b.idle?.pose,surface:b.support?.el,surfaceTop:b.support?.top,at:this.clock});}}
  for(const [id,m]of this.memory)if(this.clock-m.at>2500||!peers.some(b=>b.ownerKey===id))this.memory.delete(id);
  this.visible=new Set(result.states.filter(s=>s.visible&&s.aware).map(s=>s.id));
 }
 step(ms,t){const a=this.actor;this.clock+=Math.max(0,Math.min(250,ms||0));if(!a.config.social_behaviour){if(this.episode?.kind==='bed')this.advance(t);else if(this.episode)this.finish('disabled');return;}
  if(this.clock>=this.nextSense){this.nextSense=this.clock+100;this.sense();}
  if(this.episode)this.advance(t);
 }
 // Reserve the whole canvas plus a small gap, conservatively, on broad surfaces.
 clear(surface,x,exclude=[]){const a=this.actor,w=24*a.scale;if(!surface||surface.narrow||!Number.isFinite(x)||x<surface.min||x>surface.max)return false;
  for(const [b,e]of this.owners()){if(b===a||exclude.includes(b)||e.root!==a.root||!b.active||b.userHeld)continue;const pad=4*Math.max(a.scale,b.scale),overlap=(left,right)=>x+w+pad>left&&x-pad<right;
   if(sameSupport(surface,b.support)&&overlap(b.x,b.x+24*b.scale))return false;
   if(b.motion&&sameSupport(surface,b.motion.target)&&overlap(Math.min(b.motion.fromX,b.motion.x),Math.max(b.motion.fromX,b.motion.x)+24*b.scale))return false;
   const ep=b.social?.episode;if(ep?.kind==='company'&&sameSupport(surface,ep.surface)&&overlap(ep.x,ep.x+24*b.scale))return false;
  }return true;
 }
 corridor(surface,x,exclude=[]){const a=this.actor,lo=Math.min(a.x,x),hi=Math.max(a.x,x);if(!this.clear(surface,x,exclude))return false;for(const [b,e]of this.owners()){if(b===a||exclude.includes(b)||e.root!==a.root||!b.active||b.userHeld)continue;const pad=4*Math.max(a.scale,b.scale),hits=(left,right)=>hi+24*a.scale+pad>left&&lo-pad<right;if(sameSupport(surface,b.support)&&hits(b.x,b.x+24*b.scale))return false;if(b.motion&&sameSupport(surface,b.motion.target)&&hits(Math.min(b.motion.fromX,b.motion.x),Math.max(b.motion.fromX,b.motion.x)+24*b.scale))return false;const ep=b.social?.episode;if(ep?.kind==='company'&&sameSupport(surface,ep.surface)&&hits(ep.x,ep.x+24*b.scale))return false;}return true;}
 companyOptions(){const a=this.actor,options=[];for(const m of this.memory.values()){if(!['loaf','sleep'].includes(m.pose))continue;const b=this.peers().find(b=>b.ownerKey===m.id);if(!b||this.scene.has(b)||this.scene.has(a))continue;const surface=a.surfaces.find(s=>s.el===m.surface&&Math.abs(s.top-m.surfaceTop)<2&&!s.narrow&&!s.home&&(!s.poses?.length||s.poses.includes('loaf')));if(!surface||!a.pathTo(surface)||!a.pathTo(a.home,surface))continue;
   const gap=6*Math.max(a.scale,m.scale);for(const x of [m.x-24*a.scale-gap,m.x+24*m.scale+gap]){const snapped=Math.round(x/a.scale)*a.scale;if(this.clear(surface,snapped)&&(!sameSupport(surface,a.support)||this.corridor(surface,snapped)))options.push({kind:'company',target:b,surface,x:snapped,observed:{...m}});}
  }return options;}
 chaseOptions(){const a=this.actor;if(a.support?.narrow||a.support?.home||a.support.max-a.support.min<100*a.scale)return [];const options=[];
  for(const m of this.memory.values()){const b=this.peers().find(b=>b.ownerKey===m.id);if(!b||!this.visible?.has(m.id)||!b.config.social_behaviour||!b.social.available(b)||!this.available(a)||this.scene.has(a)||this.scene.has(b)||b.social.clock<b.social.nextSocial||['loaf','sleep'].includes(m.pose)||!sameSupport(a.support,b.support))continue;
   // Both must have actually noticed the other. This is an invitation, not a rear ambush.
   if(!b.social.visible?.has(a.ownerKey))continue;const away=Math.sign(m.x-a.x);if(!away)continue;const s=b.support,x=Math.round(Math.max(s.min,Math.min(s.max,b.x+away*36*b.scale))/b.scale)*b.scale;
   if(away*(x-b.x)<12*b.scale||!b.social.corridor(s,x,[a]))continue;options.push({kind:'chase',target:b,surface:a.support,away,runnerX:x});
  }return options;
 }
 decide(t){const a=this.actor;if(!this.available(a)||this.episode)return false;const v=a.ensureMood().values,weights=decisionWeights(v),options=[{kind:'explore',weight:weights.explore},{kind:'settle',weight:weights.settle}];
  if(a.config.social_behaviour&&this.clock>=this.nextSocial){const company=this.companyOptions(),chase=this.chaseOptions();if(company.length)options.push({...company[Math.floor(a.ensureMood().random()*company.length)],weight:weights.company});if(chase.length)options.push({...chase[Math.floor(a.ensureMood().random()*chase.length)],weight:weights.chase});}
  for(const option of options)option.weight*=window.pixelCatPostRestV1?.choiceWeight(a,option.kind)??1;
  const chosen=sampleDecision(options,()=>a.ensureMood().random(),a);this.log(chosen.kind,{weights:options.map(p=>({kind:p.kind,weight:p.weight})),target:chosen.target?.ownerKey});
  if(chosen.kind==='explore')return false;
  if(chosen.kind==='settle'){const ms=4000+6000*a.ensureMood().random();a.deadline=t+(window.pixelCatBehaviourV1?.restWindow(a,ms)??ms);if(a.idle)a.idle.poseUntil=t;return true;}
  if(chosen.kind==='company')return this.startCompany(chosen,t);
  return this.startChase(chosen,t);
 }
 startCompany(option,t){const a=this.actor;if(this.scene.has(a)||this.scene.has(option.target)||!this.clear(option.surface,option.x))return false;const path=a.pathTo(option.surface);if(!path)return false;
  this.episode={...option,started:this.clock,stage:'approach',expires:this.clock+22000};this.scene.set(a,this.episode);a.route=[...path,{settle:true,surface:option.surface,x:option.x}];a.destinationId=option.surface.id;a.destinationPoint='quiet-company';a.urgency='relaxed';a.deadline=0;this.log('company approach',{target:option.target.ownerKey});return true;
 }
 startChase(option,t){const a=this.actor,b=option.target;if(!this.available(a)||!b.social.available(b)||this.scene.has(a)||this.scene.has(b))return false;
  const v=b.ensureMood().values,response=sampleDecision([{kind:'ignore',weight:.8+2*v.sleepiness},{kind:'watch',weight:.4+v.alertness},{kind:'run',weight:(.25+2*v.playfulness*(1-.8*v.sleepiness))*(window.pixelCatPostRestV1?.choiceWeight(b,'chase')??1)}],()=>b.ensureMood().random(),b).kind;
  b.social.log('chase invitation '+response,{source:a.ownerKey});this.nextSocial=this.clock+25000;b.social.nextSocial=b.social.clock+25000;
  if(response!=='run'){if(response==='watch'){const known=b.social.memory.get(a.ownerKey);if(known)b.facing=known.x>b.x?1:-1;b.previewPose='glance';b.forcedIdleUntil=t+1600;b.deadline=b.forcedIdleUntil;if(b.idle)b.idle.poseUntil=t;}a.deadline=t+2000;return true;}
  if(!b.social.corridor(b.support,option.runnerX,[a]))return false;
  const episode={kind:'chase',chaser:a,runner:b,started:this.clock,expires:this.clock+8000,stage:'run',runs:0};this.scene.set(a,episode);this.scene.set(b,episode);this.episode=episode;b.social.episode=episode;
  b.urgency='interested';b.moveTo(option.runnerX,b.support.top,0,'walk',b.support,t);b.deadline=t+10000;a.deadline=t+10000;this.log('chase accepted',{target:b.ownerKey});return true;
 }
 finish(reason){const ep=this.episode;if(!ep)return;const participants=ep.kind==='chase'?[ep.chaser,ep.runner]:[this.actor];for(const a of participants){const layer=a.social;if(!layer||layer.episode!==ep)continue;layer.episode=null;layer.scene.delete(a);layer.nextSocial=layer.clock+25000;layer.log('end '+ep.kind,{reason});a.deadline=0;if(ep.kind==='company'&&ep.stage==='approach'){a.route=[];a.finishing=false;}}
 }
 advance(t){const a=this.actor,ep=this.episode;if(a.paused||a.suspended||a.stranded||a.goal||a.command||a.previewPose||a.play||a.toyHunt||a.playRequested||a.toyHuntRequested||!ep.target?.active&&ep.kind==='company'){this.finish('interrupted or actor removed');return;}
  if(ep.kind==='company'){
   // Finish the reserved route, then settle independently; no following a departed sleeper.
   if(this.clock>ep.expires){this.finish('company timeout');return;}
   if(ep.stage==='approach'){
    const s=a.surfaces.find(s=>s.id===ep.surface.id);if(!s||s.el!==ep.surface.el){this.finish('surface changed');return;}ep.x+=s.left-ep.surface.left;ep.surface=s;
    if(!this.clear(s,ep.x)){this.finish('resting slot occupied');return;}
    if(!a.motion&&!a.route?.length){if(!sameSupport(a.support,s)||Math.abs(a.x-ep.x)>4*a.scale){this.finish('route ended elsewhere');return;}ep.stage='rest';ep.restStarted=this.clock;ep.expires=this.clock+10000;a.deadline=t+10000;if(a.idle)a.idle.poseUntil=t;this.log('company resting',{target:ep.target.ownerKey});}
   }return;
  }
  if(a!==ep.chaser)return;const b=ep.runner;
  if(!b.active||!b.social.available(b,true)||!sameSupport(a.support,b.support)||this.clock>=ep.expires){this.finish('chase ended / unavailable');return;}
  if(!a.motion){const seen=this.memory.get(b.ownerKey);if(!seen||this.clock-seen.at>1500){this.finish('lost sight');return;}const direction=Math.sign(seen.x-a.x),gap=24*Math.max(a.scale,b.scale)+6*Math.max(a.scale,b.scale),target=seen.x-direction*gap,x=Math.round((a.x+direction*Math.min(24*a.scale,Math.max(0,direction*(target-a.x))))/a.scale)*a.scale;
   if(Math.abs(x-a.x)>=2*a.scale&&this.corridor(a.support,x,[b])){a.urgency='interested';a.moveTo(x,a.support.top,0,'walk',a.support,t);}else if(!b.motion){this.finish('caught up with safe spacing');return;}
  }
  if(!b.motion){if(ep.runs++===0&&b.ensureMood().random()<.4){const direction=Math.sign(b.x-a.x),x=Math.round(Math.max(b.support.min,Math.min(b.support.max,b.x+direction*16*b.scale))/b.scale)*b.scale;if(Math.abs(x-b.x)>=8*b.scale&&b.social.corridor(b.support,x,[a])){b.urgency='relaxed';b.moveTo(x,b.support.top,0,'walk',b.support,t);return;}}ep.expires=Math.min(ep.expires,this.clock+1800);}
 }
 poseWeight(pose){if(pose==='backRoll')return .3+1.2*this.actor.ensureMood().values.playfulness;if(pose==='alertLying')return window.pixelCatAlertV1.weight(this);return this.actor.config.mood_behaviour?moodPoseFactor(pose,this.actor.ensureMood().values):1;}
 idleDuration(pose,normal,base){const ms=this.baseIdleDuration(pose,normal,base);return window.pixelCatBehaviourV1?.restBout(this.actor,pose,this.art().idleSequences?.[pose],ms)??ms;}
 baseIdleDuration(pose,normal,base){const a=this.actor;if(pose==='backRoll')return 16000+a.ensureMood().random()*4000;if(!['loaf','sleep'].includes(pose)||a.previewPose||a.play||this.episode&&!(this.episode.kind==='company'&&this.episode.stage==='rest'))return Math.min(normal,base/(pose==='sleep'?1.1:3));return pose==='loaf'?15000+a.ensureMood().random()*10000:25000+a.ensureMood().random()*20000;}
 restPose(){return this.episode?.kind==='company'&&this.episode.stage==='rest'?(this.clock-this.episode.restStarted<5000?'loaf':null):null;}
 dispose(){this.finish('removed');this.memory.clear();this.awareness.reset();}
}
window.pixelCatDecisionsV1=CatDecisions;

// Reuse this actor's existing visible memory; never inspect another cat's intent.
window.pixelCatObserverV1={
 step(layer,t){const a=layer.actor;if(a.config.third_party_awareness===false||!a.config.social_behaviour||!a.config.interaction_behaviour){layer.observerWatch=null;return;}
  const watch=layer.observerWatch;if(watch&&layer.clock>=watch.until){layer.observerWatch=null;layer.observerStats.expired++;layer.log('watch ended');}
  if(layer.clock<Math.max(layer.observerNext||0,layer.observerProbeAt||0)||layer.observerWatch||layer.episode||a.bedInside&&a.bedInside.config.bed_style!=='simple'||!layer.available(a)||!['loaf','alertLying','sit','sithead','stand','look'].includes(a.idle?.pose))return;layer.observerProbeAt=layer.clock+250;
  const cue=[...layer.memory.values()].find(m=>layer.clock-m.at<700&&layer.visible?.has(m.id)&&['moving','bat','wiggle','postScratch'].includes(m.pose));if(!cue)return;
  const stats=layer.observerStats||={opportunities:0,watches:0,ignored:0,expired:0};stats.opportunities++;const random=()=>a.ensureMood().random();layer.observerNext=layer.clock+12000+random()*23000;
  const pose=['loaf','alertLying'].includes(a.idle.pose)?'alertLying':'glance';if(a.support?.poses?.length&&!a.support.poses.includes(pose)||random()>.15+.3*layer.traits.curiosity){stats.ignored++;layer.log('noticed activity; continued',{source:cue.id});return;}
  const duration=1500+random()*2500;layer.observerWatch={source:cue.id,pose,until:layer.clock+duration};stats.watches++;a.facing=cue.x+12*cue.scale>=a.x+12*a.scale?1:-1;if(a.idle)a.idle.poseUntil=t;layer.log('quietly watching observed activity',{source:cue.id,duration:Math.round(duration)});
 },
 pose(layer){const a=layer.actor,w=layer.observerWatch;return a.config.third_party_awareness!==false&&a.config.social_behaviour&&a.config.interaction_behaviour&&!layer.episode&&w&&layer.available(a)&&layer.clock<w.until?w.pose:null;}
};

// Shared encounter system; built after CatDecisions and raw gaze helpers.
const INTERACTION_WORLDS=new WeakMap();
const bounded=(v,f=.5)=>Number.isFinite(Number(v))?Math.max(0,Math.min(1,Number(v))):f;
const temperament=(id,config={})=>{let seed=[...id].reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);return Object.fromEntries(['boldness','sociability','curiosity','patience'].map(k=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return [k,bounded(config[k],.25+.5*seed/4294967296)];}));};
class InteractionWorld{
 constructor(){this.clock=0;this.serial=0;this.events=[];this.props=new Map();this.motion=new WeakMap();this.pairs=new Map();}
 tick(t){if(this.last!==undefined)this.clock+=Math.max(0,Math.min(250,t-this.last>1000?0:t-this.last));this.last=t;this.events=this.events.filter(e=>this.clock-e.at<1800);for(const [id,p]of this.props)if(this.clock-p.at>400)this.props.delete(id);for(const [key,end]of this.pairs)if(end<=this.clock)this.pairs.delete(key);}
 emit(kind,data){const event={...Object.fromEntries(Object.entries(data).filter(([,v])=>['string','boolean'].includes(typeof v)||typeof v==='number'&&Number.isFinite(v))),id:'encounter-'+(++this.serial),kind,at:this.clock};this.events.push(event);if(this.events.length>64)this.events.shift();return event;}
 pair(a,b){return [a.ownerKey,b.ownerKey].sort().join('|');}
 ready(a,b){return !this.pairs.has(this.pair(a,b));}
 cool(a,b){this.pairs.set(this.pair(a,b),this.clock+30000);while(this.pairs.size>128)this.pairs.delete(this.pairs.keys().next().value);}
}
const interactionWorld=root=>{let w=INTERACTION_WORLDS.get(root);if(!w){w=new InteractionWorld();INTERACTION_WORLDS.set(root,w);}return w;};
const bodyHit=(frame,scale,point,pad=0)=>{if(!frame?.rows||!frame.placement)return false;const x=(point.x-frame.placement.x)/scale,y=(point.y-frame.placement.top)/scale,r=pad/scale;for(let cy=Math.max(0,Math.floor(y-r));cy<=Math.min(23,Math.floor(y+r));cy++)for(let cx=Math.max(0,Math.floor(x-r));cx<=Math.min(23,Math.floor(x+r));cx++)if(frame.rows[cy]?.[frame.facing<0?23-cx:cx]!=='.')return true;return false;};
const socialGap=(a,b)=>{const fa=a.social?.frame,fb=b.social?.frame;if(!fa||!fb)return Infinity;const bounds=(f,s)=>{const xs=[];for(const row of f.rows)for(let i=0;i<24;i++)if(row[i]!=='.')xs.push(f.facing<0?23-i:i);return [f.placement.x+Math.min(...xs)*s,f.placement.x+(Math.max(...xs)+1)*s];},aa=bounds(fa,a.scale),bb=bounds(fb,b.scale);return Math.max(0,aa[0]-bb[1],bb[0]-aa[1]);};
const nearbyPlayLanding=(a,b)=>sameSupport(a.support,b.support)&&socialGap(a,b)<=14*Math.max(a.scale,b.scale);
const predictRolling=(p,seconds,scale)=>{const friction=60*scale,time=Math.min(Math.max(0,seconds),Math.abs(p.vx)/friction);return p.x+p.vx*time-.5*Math.sign(p.vx)*friction*time*time;};
class CatInteractions extends CatDecisions{
 constructor(...args){super(...args);this.world=interactionWorld(this.actor.root);this.traits=temperament(this.actor.ownerKey,this.actor.config.temperament||{});this.propAwareness=new Awareness();this.propMemory=new Map();this.handled=new Set();this.nextProp=0;}
 enabled(){return !!this.actor.config.interaction_behaviour;}
 surfaceWeight(surface){if(!this.enabled()||surface.home||surface.narrow)return 1;const a=this.actor;for(const m of this.memory.values())if(this.clock-m.at<2500&&m.surface===surface.el&&Math.abs(m.surfaceTop-surface.top)<2&&m.pose!=='moving')return 1+3*a.ensureMood().values.playfulness+this.traits.sociability;return 1;}
 toyPoint(toy,surface,fallback,forced=false){if(!this.enabled()||forced)return fallback;const p=this.propMemory.get(toy.id);return p&&p.surface===surface?.el&&this.clock-p.observedAt<=300&&targetVisibility(this.eye(),{...p,y:p.y-p.height/2}).visible?p:null;}
 toyOpening(toy,catX,toyX,scale,fallback){if(!this.enabled()||this.actor.toyHunt?.forced)return fallback;const p=this.propMemory.get(toy.id);return !!p&&!p.moving&&p.direction===Math.sign(toyX-(catX+12*scale));}
 available(a,moving=false){if(super.available(a,moving))return true;return !!(moving&&a.motion?.kind==='jump'&&a.social?.episode?.interaction&&['land','catch'].includes(a.social.episode.stage)&&a.active&&!a.userHeld&&!a.paused&&!a.suspended&&!a.stranded&&!a.goal&&!a.command&&!a.previewPose&&!a.play&&!a.playRequested&&!a.toyHunt&&!a.toyHuntRequested&&!a.route?.length&&!a.recallPending);}
 unavailableReason(a){return !a.active?'inactive':a.paused?'paused':a.suspended?'overlay':a.stranded?'stranded':a.goal||a.command?'command':a.previewPose?'preview':a.play||a.playRequested?'play':a.toyHunt||a.toyHuntRequested?'toy':a.route?.length?'route':a.recallPending?'recall':a.motion?'motion':'available';}
 clear(surface,x,exclude=[]){if(!super.clear(surface,x,exclude))return false;const a=this.actor;for(const [b,e]of this.owners()){if(b===a||exclude.includes(b)||e.root!==a.root)continue;const ep=b.social?.episode;if(ep?.interaction&&ep.initiator===b&&sameSupport(surface,ep.surface)){const reserved=ep.offset===undefined?ep.x:ep.surface.left+ep.offset,pad=4*Math.max(a.scale,b.scale);if(x+24*a.scale+pad>reserved&&x-pad<reserved+24*b.scale)return false;}}return true;}
 corridor(surface,x,exclude=[]){if(!super.corridor(surface,x,exclude))return false;const a=this.actor;for(const [b,e]of this.owners()){if(b===a||exclude.includes(b)||e.root!==a.root)continue;const ep=b.social?.episode;if(ep?.interaction&&ep.initiator===b&&sameSupport(surface,ep.surface)){const reserved=ep.offset===undefined?ep.x:ep.surface.left+ep.offset,pad=4*Math.max(a.scale,b.scale);if(Math.max(a.x,x)+24*a.scale+pad>reserved&&Math.min(a.x,x)-pad<reserved+24*b.scale)return false;}}return true;}
 eye(){const a=this.actor,f=this.frame;return worldGaze(f?.gaze,f?.placement||{x:a.x,top:a.y-24*a.scale},a.scale,f?.facing||a.facing,Math.max(24,Math.min(240,Number(a.config.social_sight_cells)||110))*a.scale);}
 sense(){super.sense();if(!this.enabled())return;window.pixelCatHomePostsV1?.publish(this);const a=this.actor,targets=[...this.world.props.values()].map(p=>({id:p.id,x:p.x,y:p.y-p.height/2,width:p.width,height:p.height,moving:p.moving})),result=this.propAwareness.update(this.eye(),targets,this.clock,{dwell:220,motionDwell:120,memory:2500});
  for(const state of result.states)if(state.visible&&state.aware){const p=this.world.props.get(state.id);this.propMemory.set(state.id,{...p,observedAt:this.clock});}
  for(const [id,p]of this.propMemory)if(this.clock-p.observedAt>2500||!this.world.props.has(id))this.propMemory.delete(id);
  for(const b of this.peers())if(this.visible?.has(b.ownerKey)&&b.social.frame){const m=this.memory.get(b.ownerKey);if(m)m.frame={...b.social.frame,placement:{...b.social.frame.placement}};}
  for(const event of this.world.events){if(this.handled.has(event.id)||event.source===a.ownerKey||this.world.clock-event.at>1400)continue;const state=result.states.find(s=>s.id===event.subject);if(!state?.visible||!state.aware)continue;this.handled.add(event.id);while(this.handled.size>64)this.handled.delete(this.handled.values().next().value);this.reactMotion(event);}
 }
 reactMotion(event){const a=this.actor,p=this.propMemory.get(event.subject);if(!p)return;this.log('noticed prop motion',{event:event.id,subject:p.id,evidence:'gaze + notice dwell'});if(!this.available(a)||this.episode){if(Math.hypot(p.x-(a.x+12*a.scale),p.y-a.y)<=40*a.scale)a.receiveDisturbance?.({...event,x:p.x,y:p.y,intensity:.35},this.now,false,'social');return;}
  const opportunity=this.propOptions().find(o=>o.id===p.id),mood=a.ensureMood().values;if(opportunity&&this.clock>=this.nextProp&&a.ensureMood().random()<(.2+.6*mood.playfulness*this.traits.curiosity)*(1-.7*mood.sleepiness)){this.startProp(opportunity,this.now);return;}
  // Visual surprise is local; distant noticed objects can invite observation/play only.
  if(Math.hypot(p.x-(a.x+12*a.scale),p.y-a.y)<=40*a.scale){a.receiveDisturbance?.({...event,x:p.x,y:p.y,intensity:.35},this.now,false,'social');return;}
  const v=a.ensureMood().values,response=sampleDecision([{kind:'ignore',weight:.8+v.sleepiness},{kind:'watch',weight:.5+v.alertness+this.traits.curiosity}],()=>a.ensureMood().random(),a).kind;
  if(response==='watch'){a.facing=p.x>a.x+12*a.scale?1:-1;this.watchUntil=this.clock+900;a.deadline=this.now+1100;if(a.idle)a.idle.poseUntil=this.now;}
 }
 disturbanceChoice(cue){if(!this.enabled())return this.actor.ensureMood().landingChoice(window.pixelCatBehaviourV1?.choiceWeight(this.actor,'hop')??1);const a=this.actor,v=a.ensureMood().values,known=this.visible?.has(cue.source),gentle=cue.kind==='Gentle social pat',intensity=bounded(cue.intensity,1);if(cue.kind==='Nearby high landing'){const behind=(cue.x-a.x-12*a.scale)*a.facing<0;return sampleDecision([{kind:'ignore',weight:.3+.7*v.sleepiness},{kind:'watch',weight:.6+.4*v.alertness},{kind:'hop',weight:(behind?3:1.4)*(.6+intensity)*(1-.3*this.traits.boldness)}],()=>a.ensureMood().random(),a).kind;}return sampleDecision([{kind:'ignore',weight:.6+v.sleepiness*(gentle?2.5:1.3)},{kind:'watch',weight:.5+v.alertness+this.traits.boldness},{kind:'hop',weight:(.25+1.1*v.alertness+.65*v.playfulness)*(1-.6*this.traits.boldness)*(known?.35:1)*(gentle?.2:1)*Math.max(.4,intensity)}],()=>a.ensureMood().random(),a).kind;}
 step(ms,t){this.now=t;this.world.tick(t);super.step(ms,t);if(!this.enabled()){this.pendingImpact=null;if(this.episode?.interaction)this.finish('interaction disabled');return;}if(!this.actor.config.social_behaviour&&this.clock>=this.nextSense){this.nextSense=this.clock+100;this.sense();}if(this.watchUntil&&this.clock>=this.watchUntil)this.watchUntil=0;window.pixelCatObserverV1?.step(this,t);this.encounter(t);}
 // Reconsider observed neighbours at planted walk boundaries and during rests.
 // Never truncate a stride or override Home, previews, play or committed flights.
 encounter(t){const a=this.actor;if(this.clock<(this.nextEncounter||0)||this.episode||this.scene.has(a))return;
  if(!a.motion&&['loaf','sleep','scratch'].includes(a.idle?.pose)&&t<a.idle.poseUntil)return;
  if(a.goal||a.command||a.previewPose||a.play||a.playRequested||a.toyHunt||a.toyHuntRequested||a.recallPending||!a.active||a.paused||a.suspended||a.stranded)return;
  if(a.motion){this.walkingEncounter(t);return;}
  this.nextEncounter=this.clock+1800;const route=a.route;a.route=[];if(!this.available(a)){a.route=route;return;}
  const peers=this.peers(),seen=peers.filter(b=>this.visible?.has(b.ownerKey)),near=seen.filter(b=>sameSupport(a.support,b.support)),v=a.ensureMood().values,r=()=>a.ensureMood().random(),options=[{kind:'continue',weight:1.4+v.sleepiness}];
  const pat=this.clock>=this.nextSocial?this.socialOptions('pat'):[],ambush=this.clock>=this.nextSocial?this.socialOptions('ambush'):[];
  for(const [kind,list]of [['pat',pat],['ambush',ambush]])if(list.length){const target=list[Math.floor(r()*list.length)],m=target.observed,observedEye=worldGaze(m.frame.gaze,m.frame.placement,m.scale,m.frame.facing,110*m.scale),rear=observedEye.known&&!targetVisibility(observedEye,{x:a.x+12*a.scale,y:a.y-12*a.scale,width:20*a.scale,height:22*a.scale}).visible;const toyMemory=[...this.propMemory.values()].find(p=>p.carrier===target.target?.ownerKey&&this.clock-p.observedAt<300),toyInterest=toyMemory?(a.mouthState?.possessiveToy===toyMemory.id&&a.mouthState.clock<a.mouthState.possessiveUntil?2.3:1.5):1;options.push({...target,weight:toyInterest*(kind==='ambush'?(.25+1.8*v.playfulness)*(1-.7*v.sleepiness)*(rear?1.8:.5):(.2+v.playfulness)*this.traits.sociability)});}
  const passing=near.find(b=>this.clock>=(this.lastAcknowledgement?.get(b.ownerKey)||0)&&socialGap(a,b)<36*Math.max(a.scale,b.scale)&&!this.scene.has(b));if(passing)options.push({kind:'acknowledge',target:passing,weight:.35+this.traits.sociability});
  this.encounterStats||={checks:0,opportunities:0,starts:0,acknowledgements:0};const stats=this.encounterStats;stats.checks++;stats.opportunities+=pat.length+ambush.length;
  a.setAttribute('data-encounters',JSON.stringify({...stats,seen:seen.length,sameSurface:near.length,pat:pat.length,ambush:ambush.length,rejected:this.socialRejections,cooldown:Math.max(0,Math.round(this.nextSocial-this.clock)),self:this.unavailableReason(a)}));
  for(const b of seen){this.noticedAt||=new Map();if(this.clock-(this.noticedAt.get(b.ownerKey)??-Infinity)>15000){this.noticedAt.set(b.ownerKey,this.clock);a.ensureMood().experience('notice');}}while(this.noticedAt?.size>32)this.noticedAt.delete(this.noticedAt.keys().next().value);
  for(const option of options)option.weight*=window.pixelCatPostRestV1?.choiceWeight(a,option.kind)??1;
  const chosen=sampleDecision(options,r,a);if(chosen.kind==='continue'){a.route=route;return;}
  if(chosen.kind==='acknowledge'){stats.acknowledgements++;this.lastAcknowledgement||=new Map();this.lastAcknowledgement.set(chosen.target.ownerKey,this.clock+12000);while(this.lastAcknowledgement.size>32)this.lastAcknowledgement.delete(this.lastAcknowledgement.keys().next().value);a.facing=chosen.target.x>a.x?1:-1;this.watchUntil=this.clock+900;a.deadline=t+1100;a.finishing=false;if(a.idle)a.idle.poseUntil=t;this.log('passing acknowledgement',{target:chosen.target.ownerKey});return;}
  if(this.startSocial(chosen,t))a.finishing=false;else a.route=route;
 }
 walkingEncounter(t){const a=this.actor,m=a.motion;if(this.clock<(this.nextWalkingEncounter||0)||m.kind!=='walk'||m.gallopTimeline||m.sneakTimeline||!m.cumulativeMs?.length)return;this.nextWalkingEncounter=this.clock+2500;
  const b=this.peers().find(b=>this.visible?.has(b.ownerKey)&&this.available(b)&&sameSupport(a.support,b.support)&&!this.scene.has(b)&&this.world.ready(a,b)&&Math.abs(b.x-a.x)<100*a.scale&&Math.sign(b.x-a.x)===a.facing);if(!b||a.ensureMood().random()>.2+.5*a.ensureMood().values.playfulness)return;
  const elapsed=t-m.start,index=m.cumulativeMs.findIndex(ms=>ms>elapsed);if(index<0||index+1>=m.cells)return;const cells=index+1;m.cells=cells;m.x=m.fromX+m.direction*cells*a.scale;m.cumulativeMs=m.cumulativeMs.slice(0,cells);m.headOffsets=m.headOffsets?.slice(0,cells+1);m.duration=m.cumulativeMs.at(-1);this.log('noticed companion during walk',{target:b.ownerKey});this.nextEncounter=this.clock;
 }
 socialOptions(kind){const a=this.actor;this.socialRejections={};const reject=key=>{this.socialRejections[key]=(this.socialRejections[key]||0)+1;};if(!this.enabled()||!this.available(a)||a.support?.home||a.support?.narrow||this.scene.has(a)){reject('self / home / narrow');return [];}const options=[];
  for(const m of this.memory.values()){const b=this.peers().find(b=>b.ownerKey===m.id);if(!b?.config.interaction_behaviour||!m.frame||this.clock-m.at>700){reject('observation');continue;}if(!this.available(b)||this.scene.has(b)){reject('partner '+this.unavailableReason(b));continue;}if(!this.world.ready(a,b)){reject('pair cooldown');continue;}if(!sameSupport(a.support,b.support)||m.surface!==a.support.el){reject('different surface');continue;}
   const direction=Math.sign(m.x-a.x)||a.facing,s=a.support;let x;
   if(kind==='pat'){
    const c=this.art().interactionContacts?.bat;if(!c||!this.art().idleSequences?.bat)continue;const y=s.top-(24-c.point[1]-.5)*a.scale,row=Math.floor((y-m.frame.placement.top)/m.scale),pixels=m.frame.rows[row];if(!pixels)continue;const xs=[...pixels].flatMap((v,i)=>v==='.'?[]:[m.frame.facing<0?23-i:i]);if(!xs.length)continue;const cell=direction>0?Math.min(...xs):Math.max(...xs),contact=m.frame.placement.x+(cell+.5)*m.scale;x=contact-(direction>0?c.point[0]+.5:23-c.point[0]+.5)*a.scale;
   }else{x=direction>0?m.x-24*a.scale-4*Math.max(a.scale,m.scale):m.x+24*m.scale+4*Math.max(a.scale,m.scale);if(direction*(x-a.x)<8*a.scale){reject('too close to stalk');continue;}}
   x=Math.round(x/a.scale)*a.scale;if(x<s.min||x>s.max||!this.corridor(s,x,[b])||direction*(m.x-a.x)<=0||direction*(x-a.x)<-2*a.scale){reject('space / corridor');continue;}
   const option={kind,target:b,observed:{...m},surface:s,x,offset:x-s.left,direction};if(kind==='pat'&&!this.patClear(option))continue;options.push(option);
  }return options;
 }
 patClear(o){const a=this.actor,clip=this.art().idleSequences?.bat;if(!clip)return false;const top=o.surface.top-24*a.scale;for(const rows of clip.frames)for(let y=0;y<24;y++)for(let x=0;x<24;x++){if(rows[y][x]==='.'||x>=15&&y>=16&&y<=21)continue;const point={x:o.x+((o.direction>0?x:23-x)+.5)*a.scale,y:top+(y+.5)*a.scale};if(bodyHit(o.observed.frame,o.observed.scale,point))return false;}return true;}
 decide(t){if(!this.enabled())return super.decide(t);const a=this.actor;if(!this.available(a)||this.episode)return false;const v=a.ensureMood().values,r=()=>a.ensureMood().random(),options=[{kind:'ordinary',weight:1.3+v.sleepiness}];
  if(this.clock>=this.nextSocial){for(const kind of ['pat','ambush']){const list=this.socialOptions(kind);if(list.length)options.push({...list[Math.floor(r()*list.length)],weight:kind==='pat'?(.15+v.playfulness*.7)*this.traits.sociability:(.1+v.playfulness)*(1-v.sleepiness)*this.traits.boldness});}}
  const props=this.propOptions();if(props.length&&this.clock>=this.nextProp)options.push({...props[Math.floor(r()*props.length)],weight:(.2+v.playfulness)*this.traits.curiosity});
  const chosen=sampleDecision(options,r,a);if(chosen.kind==='ordinary')return super.decide(t);this.log('opportunity '+chosen.kind,{weights:options.map(o=>({kind:o.kind,weight:o.weight})),target:chosen.target?.ownerKey||chosen.id});return chosen.kind==='prop'?this.startProp(chosen,t):this.startSocial(chosen,t);
 }
 startSocial(option,t){const a=this.actor,b=option.target;if(!this.enabled()||!this.peers().includes(b)||!this.available(a)||!this.available(b)||this.scene.has(a)||this.scene.has(b)||!this.world.ready(a,b)||!sameSupport(a.support,b.support)||!this.corridor(a.support,option.x,[b]))return false;
  const ep={...option,registry:this.scene,interaction:true,initiator:a,participants:[a,b],stage:option.kind==='pat'?'approach':'sneak',expires:this.clock+10000+8000*this.traits.patience,beats:0};this.episode=ep;this.scene.set(a,ep);this.scene.set(b,ep);this.world.cool(a,b);this.watchUntil=0;
  if(option.kind==='pat'){a.urgency='relaxed';if(Math.abs(option.x-a.x)>a.scale)a.moveTo(option.x,a.support.top,0,'walk',a.support,t);}else this.sneakBeat(ep,t);
  this.encounterStats||={checks:0,opportunities:0,starts:0,acknowledgements:0};this.encounterStats.starts++;a.ensureMood().experience('play');a.deadline=t+15000;this.log('begin '+ep.kind,{target:b.ownerKey});return true;
 }
 sneakBeat(ep,t){const a=this.actor,remaining=ep.x-a.x,step=Math.sign(remaining)*Math.min(Math.max(0,Math.abs(remaining)-12*a.scale),(ep.beats===0?10:6)*a.scale);if(Math.abs(step)<2*a.scale){ep.stage='check';ep.wait=this.clock+400;return;}a.urgency='relaxed';a.moveTo(a.x+step,a.support.top,0,'walk',a.support,t,'sneak');ep.beats++;}
 prepareIdle(idle,t){const ep=this.episode,a=this.actor;if((!ep||ep.kind==='company'&&ep.stage==='rest')&&!a.play&&!a.previewPose&&['loaf','sleep'].includes(idle.pose)){a.deadline=Math.max(a.deadline||0,idle.poseUntil);if(ep)ep.expires=Math.max(ep.expires,this.clock+idle.poseUntil-t);}if(ep?.interaction&&ep.initiator===a&&ep.stage==='stroke'&&idle.pose==='bat')idle.poseUntil=t+this.art().idleSequences.bat.durations.reduce((n,d)=>n+d,0)*Math.max(80,Number(a.config.idle_frame_ms)||250)/250;}
 contactFrame(sample,placement,bridging,t){const a=this.actor,ep=this.episode,c=this.art().interactionContacts?.bat;if(!ep?.interaction||ep.initiator!==a||ep.stage!=='stroke'||ep.struck||bridging||a.idle?.pose!=='bat'||sample.frame!==c?.frame)return;ep.struck=true;const point={x:placement.x+((a.facing>0?c.point[0]:23-c.point[0])+.5)*a.scale,y:placement.top+(c.point[1]+.5)*a.scale},b=ep.target;
  const hit=sameSupport(a.support,b.support)&&bodyHit(b.social.frame,b.scale,point,a.scale/2);this.log('social pat '+(hit?'contact':'miss'),{target:b.ownerKey,point});if(hit)this.socialCue(ep,b,point,t,'Gentle social pat');
 }
 socialCue(ep,b,point,t,kind){const a=this.actor,event=this.world.emit(kind,{source:a.ownerKey,x:point.x,y:point.y,intensity:kind==='Gentle social pat'?.2:.55});this.finish('physical invitation delivered');a.deadline=t+2000;if(!window.pixelCatAlertV1?.recoil(b,point,t))b.receiveDisturbance?.(event,t,false,'social');}
 propOptions(){const a=this.actor,scene=a.propScene;if(!this.enabled()||!scene?.enabled||!this.available(a)||a.support?.home||a.support?.narrow||this.scene.has(a))return [];const options=[];
  for(const m of this.propMemory.values()){const p=scene.props.find(p=>p.id===m.id);if(m.kind!=='ball'||m.falling||!p||p.claimedBy||this.clock-m.observedAt>300||m.surface!==a.support.el||Math.abs(m.top-a.support.top)>2||scene.time<p.cooldownUntil&&!(p.lastInteractor!==a.ownerKey&&scene.time>=(p.availableToOthersAt??Infinity)))continue;const direction=Math.sign(m.x-(a.x+12*a.scale))||a.facing,x=Math.round((predictRolling(m,.6,p.scale)-a.toyPaw(direction)*a.scale)/a.scale)*a.scale;if(Math.abs(x-a.x)<6*a.scale||Math.abs(x-a.x)>45*a.scale||!this.corridor(a.support,x))continue;options.push({...m,kind:'prop',x,direction,offset:x-a.support.left,observed:{...m}});}
  return options;
 }
 startProp(option,t){const a=this.actor,p=a.propScene?.props.find(p=>p.id===option.id);if(!this.available(a)||this.scene.has(a)||!p||p.claimedBy||!this.corridor(a.support,option.x))return false;p.claimedBy=a.ownerKey;this.episode={...option,registry:this.scene,interaction:true,initiator:a,participants:[a],surface:a.support,stage:'watch',expires:this.clock+5000,wait:this.clock+150};this.scene.set(a,this.episode);this.nextProp=this.clock+12000;a.deadline=t+6000;if(a.idle)a.idle.poseUntil=t;this.log('prop reservation',{target:p.id,observedAt:option.observed.observedAt});return true;}
 advanceProp(ep,t){const a=this.actor,p=a.propScene?.props.find(p=>p.id===ep.id);if(!p||p.claimedBy!==a.ownerKey||!sameSupport(a.support,ep.surface)){this.finish('prop/claim/support changed');return;}if(a.motion)return;
  if(ep.stage==='watch'&&this.clock>=ep.wait){const m=this.propMemory.get(ep.id);if(!m||this.clock-m.observedAt>300||m.falling||m.surface!==a.support.el){this.finish('lost prop observation');return;}const direction=Math.sign(m.x-(a.x+12*a.scale))||a.facing;let x=Math.round((predictRolling(m,.6,p.scale)-a.toyPaw(direction)*a.scale)/a.scale)*a.scale;
   if(Math.abs(x-a.x)<6*a.scale||!this.corridor(a.support,x)){this.finish('no safe interception');return;}if(a.moveTo(x,a.support.top,0,'jump',a.support,t)===false){this.finish('intercept rejected');return;}
   // Recompute once from the actual planned flight time, then commit: no airborne homing.
   const seconds=a.motion.duration/1000;x=Math.round((predictRolling(m,seconds,p.scale)-a.toyPaw(direction)*a.scale)/a.scale)*a.scale;const motion=a.motion,refined={...motion,x},profile=this.corridor(a.support,x)&&a.planJump(refined);if(profile)Object.assign(motion,{x,jumpProfile:profile,duration:profile.duration});else{x=motion.x;this.log('prediction refinement unavailable');}ep.stage='land';ep.x=x;ep.offset=x-a.support.left;this.log('intercept committed',{target:p.id,x,observedAt:m.observedAt});
  }else if(ep.stage==='land'){const frame=this.frame,anchor=this.art().leapAnchors.across.at(-1).point,point={x:(frame?.placement.x??a.x)+(a.toyPaw(a.facing)+.5)*a.scale,y:(frame?.placement.top??a.support.top-24*a.scale)+(anchor[1]+.5)*a.scale},hit=a.propScene.strikeBall(p.id,a.ownerKey,point,a.facing,.5,true);this.log('prop intercept '+(hit?'contact':'miss'),{target:p.id,point});p.lastInteractor=a.ownerKey;this.finish(hit?'intercept contact':'intercept missed');a.deadline=t+1800;}
 }
 startChase(option,t){const ok=super.startChase(option,t),ep=this.episode;if(ok&&this.enabled()&&ep?.kind==='chase'){ep.interaction=true;ep.worldExpires=this.world.clock+10000;ep.runnerInterest=this.clock+1500+2500*option.target.ensureMood().random();ep.rolesSwapped=false;}return ok;}
 advanceChase(t){const a=this.actor,ep=this.episode;if(!ep||a!==ep.chaser)return super.advance(t);const b=ep.runner;if(this.world.clock>=ep.worldExpires){this.finish('shared chase horizon');return;}
  if(!this.available(a,true)||!b.social.available(b,true)||!b.config.interaction_behaviour||!sameSupport(a.support,b.support)){this.finish('chase interrupted');return;}
  if(ep.stage==='catch'){
   if(a.motion)return;const near=nearbyPlayLanding(a,b);this.log(near?'chase nearby landing':'chase catch miss',{target:b.ownerKey});if(near)this.socialCue(ep,b,{x:a.x+12*a.scale,y:a.support.top},t,'Nearby play landing');else this.finish('catch missed');return;
  }
  const m=this.memory.get(b.ownerKey),fresh=m&&this.clock-m.at<500,distance=m?Math.abs(m.x-a.x)/a.scale:Infinity;
  if(!a.motion&&!b.motion&&fresh&&distance>=34&&distance<=60&&this.world.ready(a,b)){
   this.world.cool(a,b);const v=b.ensureMood().values,offer=a.ensureMood().random()<(.2+.6*a.ensureMood().values.playfulness)*(1-.6*a.ensureMood().values.sleepiness),reply=sampleDecision([{kind:'disengage',weight:.6+v.sleepiness},{kind:'catch',weight:.3+v.playfulness},{kind:'reverse',weight:ep.rolesSwapped||!b.social.visible?.has(a.ownerKey)?0:.25+v.playfulness*b.social.traits.sociability}],()=>b.ensureMood().random(),b).kind;this.log('chase ending opportunity',{target:b.ownerKey,reply});
   if(reply==='reverse'){const away=Math.sign(a.x-b.x),x=Math.round(Math.max(a.support.min,Math.min(a.support.max,a.x+away*24*a.scale))/a.scale)*a.scale;if(Math.abs(x-a.x)>=12*a.scale&&this.corridor(a.support,x,[b])){a.urgency='interested';a.moveTo(x,a.support.top,0,'walk',a.support,t);ep.chaser=b;ep.runner=a;ep.rolesSwapped=true;ep.runs=0;ep.expires=b.social.clock+3500;ep.runnerInterest=b.social.clock+1800;b.social.log('chase roles swapped',{target:a.ownerKey});return;}}
   else if(reply==='catch'&&offer){const direction=Math.sign(m.x-a.x),x=Math.round((m.x-direction*(24*Math.max(a.scale,b.scale)+4*Math.max(a.scale,b.scale)))/a.scale)*a.scale;if(Math.abs(x-a.x)>=6*a.scale&&this.corridor(a.support,x,[b])&&a.moveTo(x,a.support.top,0,'jump',a.support,t)!==false){ep.stage='catch';return;}}
   this.finish('chase disengaged');return;
  }
  if(!b.motion&&this.clock>=ep.runnerInterest){ep.runs=2;if(b.social.propMemory.size){this.finish('runner distracted by observed prop');b.social.watchUntil=b.social.clock+1200;b.deadline=t+1200;if(b.idle)b.idle.poseUntil=t;return;}}
  return super.advance(t);
 }
 advance(t){const ep=this.episode;if(!ep?.interaction)return super.advance(t);const a=this.actor;
  if(ep.kind==='chase')return this.advanceChase(t);
  if(ep.initiator!==a){if(!this.available(a)||!ep.initiator.active)this.finish('recipient interrupted');return;}
  if(!this.enabled()||!this.available(a,true)||this.clock>=ep.expires){this.finish('interrupted / timeout');return;}
  if(ep.kind==='prop')return this.advanceProp(ep,t);
  const b=ep.target;if(!this.peers().includes(b)||!b.config.interaction_behaviour||!this.available(b)||!sameSupport(a.support,b.support)){this.log('partner eligibility',{reason:this.unavailableReason(b),inView:this.peers().includes(b),enabled:!!b.config.interaction_behaviour,sameSupport:sameSupport(a.support,b.support)});this.finish('partner unavailable');return;}
  const s=a.surfaces.find(s=>sameSupport(s,ep.surface));if(!s){this.finish('support changed');return;}ep.surface=s;ep.x=s.left+ep.offset;
  if(!this.clear(s,ep.x,[b])){this.finish('landing slot occupied');return;}if(a.motion)return;
  const m=this.memory.get(b.ownerKey);if(ep.stage!=='land'&&(!m||this.clock-m.at>1200||Math.abs(m.x-ep.observed.x)>4*a.scale)){this.finish('observation lost / partner moved');return;}
  if(ep.stage==='approach'){if(Math.abs(a.x-ep.x)>3*a.scale){this.finish('approach ended elsewhere');return;}ep.stage='stroke';ep.wait=this.clock+3600;a.facing=ep.direction;a.idle=null;this.log('pat ready',{target:b.ownerKey});}
  else if(ep.stage==='stroke'&&this.clock>=ep.wait)this.finish(ep.struck?'pat complete':'pat missed');
  else if(ep.stage==='sneak'){if(ep.beats<3)this.sneakBeat(ep,t);else{ep.stage='check';ep.wait=this.clock+500;}}
  else if(ep.stage==='wiggle'&&this.clock>=ep.wait){ep.stage='check';ep.wait=this.clock;}
  else if(ep.stage==='check'&&this.clock>=ep.wait){if(!ep.wiggled&&this.art().idleSequences?.wiggle&&a.ensureMood().random()<.72){ep.wiggled=true;ep.stage='wiggle';ep.wait=this.clock+600+600*a.ensureMood().random();a.idle=null;return;}const eye=worldGaze(m.frame?.gaze,m.frame?.placement||{x:m.x,top:s.top-24*m.scale},m.scale,m.frame?.facing,100*m.scale),noticed=targetVisibility(eye,{x:a.x+12*a.scale,y:a.y-12*a.scale,width:20*a.scale,height:22*a.scale}).visible;
   if(a.ensureMood().random()<(noticed?.65:.18)){this.finish(noticed?'apparently noticed / disengage':'interest faded');a.deadline=t+2000;return;}
   if(!this.corridor(s,ep.x,[b])||a.moveTo(ep.x,s.top,0,'jump',s,t)===false){this.finish('unsafe pounce');return;}ep.stage='land';this.log('ambush pounce',{lastSeen:m.at});
  }else if(ep.stage==='land'){const close=nearbyPlayLanding(a,b);this.log(close?'nearby play landing':'ambush miss',{target:b.ownerKey});if(close)this.socialCue(ep,b,{x:a.x+12*a.scale,y:s.top},t,'Nearby play landing');else this.finish('pounce landed short');}
 }
 finish(reason){this.pendingImpact=null;const ep=this.episode;if(!ep?.interaction||ep.kind==='chase')return super.finish(reason);const participants=ep.participants||[this.actor];for(const a of participants){const registry=ep.registry||this.scene;if(registry.get(a)===ep)registry.delete(a);const layer=a.social;if(!layer)continue;if(layer.scene.get(a)===ep)layer.scene.delete(a);if(layer.episode!==ep)continue;layer.episode=null;layer.nextSocial=layer.clock+25000;layer.watchUntil=0;layer.log('end '+ep.kind,{reason});a.deadline=0;}
  if(ep.kind==='prop'){const p=this.actor.propScene?.props.find(p=>p.id===ep.id);if(p?.claimedBy===this.actor.ownerKey){p.claimedBy=null;p.cooldownUntil=this.actor.propScene.time+5000;p.lastInteractor=this.actor.ownerKey;p.availableToOthersAt=this.actor.propScene.time+1000;}}
 }
 restPose(){const observed=window.pixelCatObserverV1?.pose(this);if(observed)return observed;const ep=this.episode;if(ep?.interaction&&ep.kind!=='chase'){if(ep.initiator!==this.actor)return this.actor.idle?.pose||'sit';return ep.stage==='wiggle'?'wiggle':ep.stage==='stroke'?'bat':ep.stage==='check'?'look':ep.stage==='watch'?'lookdown':'sit';}if(this.enabled()&&this.watchUntil>this.clock)return 'glance';return super.restPose();}
 dispose(){super.dispose();this.propAwareness.reset();this.propMemory.clear();this.handled.clear();}
}
const propInteractionTick=(scene,p,s,from,to,dt,t,active)=>{
 if(!active.some(a=>a.config.interaction_behaviour))return;const world=interactionWorld(scene.root);world.tick(t);const geometry=[s.el,s.left,s.top,s.right],old=world.motion.get(p),stable=old?.geometry.every((v,i)=>v===geometry[i]),moving=dt>0&&Math.hypot(to.x-from.x,to.y-from.y)>.05;
 const owner=[...scene.members].find(a=>a.ownerKey===p.claimedBy);if(!p.carrier&&owner?.play?.toyId===p.id&&['settle','groom'].includes(owner.play.stage)&&owner.toyHunt?.completed){owner.play.released=true;p.lastInteractor=owner.ownerKey;p.claimedBy=null;p.cooldownUntil=scene.time+45000;p.availableToOthersAt=scene.time+400;}
 const previous=stable?old:null,still=moving?null:previous?.still??world.clock;
 if(moving&&previous?.still!==null&&previous?.still!==undefined&&world.clock-previous.still>=900)world.emit('Sudden prop motion',{source:p.node.dataset.lastStrike||p.id,subject:p.id,x:to.x,y:to.y,surfaceId:s.id,top:s.top});
 world.motion.set(p,{geometry,still});world.props.set(p.id,{id:p.id,kind:p.asset.id,carrier:p.carrier||null,x:to.x,y:to.y,width:p.asset.width*p.scale,height:p.asset.height*p.scale,direction:p.direction,moving,falling:!!p.ballMotion?.fall,vx:p.ballMotion?.vx||((to.x-from.x)/Math.max(1,dt)*1000),surface:s.el,top:s.top,at:world.clock});
};
window.pixelCatInteractionsV1={propTick:propInteractionTick,world:interactionWorld,clearProps(root){const world=INTERACTION_WORLDS.get(root);if(world){world.props.clear();world.events=world.events.filter(e=>!e.subject);world.motion=new WeakMap();}}};
window.pixelCatDecisionsV1=CatInteractions;

// Beds are spatial affordances, not a relationship or compulsory eviction system.
class CatBedVisits extends window.pixelCatDecisionsV1{
 clear(surface,x,exclude=[]){if(!super.clear(surface,x,exclude))return false;const a=this.actor,owner=surface.bedOwner;if(!owner)return true;
  for(const [b,e]of this.owners())if(b!==a&&!exclude.includes(b)&&e.root===a.root&&b.active&&!b.userHeld&&b.support?.bedOwner===owner&&Math.abs(b.y-surface.top)<=4*Math.max(a.scale,b.scale)&&x+24*a.scale>b.x&&x<b.x+24*b.scale)return false;
  return true;
 }
 bedTargets(){
  const a=this.actor,targets=[];
  for(const s of a.surfaces||[]){const owner=s.bedOwner;if(!owner?.active||owner.root!==a.root||owner.config.show_home===false||s.foodOwner||s.bedFloor)continue;
   if(owner!==a&&!a.config.social_behaviour||!s.bed&&owner.config.bed_style==='simple')continue;
   const asset=window.pixelCatSetupV1?.bed(owner,this.art());if(!asset)continue;
   const center=s.bed?(s.left+s.right)/2:s.left-4+(22+asset.width/2)*(owner.worldScale||owner.scale);
   const x=Math.round((center-12*a.scale)/a.scale)*a.scale;
   if(x<s.min||x>s.max||!this.clear(s,x)||!a.pathTo(s)||!a.pathTo(a.home,s))continue;
   const booked=[...this.owners()].some(([b,e])=>b!==a&&e.root===a.root&&b.social?.episode?.kind==='bed'&&b.social.episode.owner===owner);
   if(!booked)targets.push({kind:'bed',owner,surface:s,x});
  }return targets;
 }
 decide(t){
  const a=this.actor,r=()=>a.ensureMood().random(),v=a.ensureMood().values;
  if(this.available(a)&&!this.episode&&this.clock>=(this.nextBed||0)&&a.config.mood_behaviour){
   // A separate, infrequent opportunity; ordinary exploration keeps its existing weights.
   this.nextBed=this.clock+18000+22000*r();
   const options=this.bedTargets();if(options.length&&r()<(.08+.48*v.sleepiness)*(1-.8*v.alertness)){
    const foreign=options.filter(o=>o.owner!==a).length;
    if(!options.some(o=>o.owner===a)&&r()>.25)return super.decide(t);
    const chosen=sampleDecision(options.map(o=>({...o,weight:o.owner===a?1:.12/Math.max(1,foreign)})),r);
    if(this.startBed(chosen,t))return true;
   }
  }
  if(window.pixelCatShelfAmbushV1?.decide(this,t,this.art()))return true;
  if(window.pixelCatVerticalScratchV1?.decide(this,t,this.art()))return true;
  return super.decide(t);
 }
 startBed(o,t){const a=this.actor,path=a.pathTo(o.surface);if(!this.available(a)||this.episode||!path||!this.clear(o.surface,o.x))return false;
  this.episode={...o,stage:'approach',expires:this.clock+45000};this.scene.set(a,this.episode);a.route=[...path,{settle:true,surface:o.surface,x:o.x}];a.destinationId=o.surface.id;a.destinationPoint='bed-rest';a.urgency='relaxed';a.deadline=0;this.log('bed approach',{owner:o.owner.ownerKey});return true;
 }
 step(ms,t){super.step(ms,t);const a=this.actor;
  if(!this.enabled()||!a.config.social_behaviour||!this.available(a)||this.episode||this.clock<(this.nextBedClaim||0))return;
  this.nextBedClaim=this.clock+6000;
  for(const m of this.memory.values()){
   const guest=this.peers().find(b=>b.ownerKey===m.id),visit=guest?.social?.episode;
   if(!guest||visit?.kind!=='bed'||visit.stage!=='rest'||visit.owner!==a||!this.visible?.has(m.id)||this.clock-m.at>500||!['sleep','loaf'].includes(m.pose)||!this.world.ready(a,guest))continue;
   this.nextBedClaim=this.clock+45000;const v=a.ensureMood().values;
   if(a.ensureMood().random()<.12+.2*v.playfulness+.16*v.alertness)this.startBedClaim(guest,t);
   else this.log('bed guest tolerated',{target:guest.ownerKey});
   break;
  }
 }
 startBedClaim(b,t){const a=this.actor,s=a.surfaces.find(s=>s.bedOwner===a&&!s.bed),path=s&&a.pathTo(s);
  if(!path||!this.available(a)||!this.available(b)||b.social.episode?.owner!==a||this.scene.has(a)||!this.art().interactionContacts?.bat)return false;
  const side=a.x>=b.x?1:-1,x=Math.round(Math.max(s.min,Math.min(s.max,b.x+side*28*a.scale))/a.scale)*a.scale;
  if(!this.clear(s,x,[b]))return false;
  b.social.finish('owner approaches bed');
  const ep={kind:'bed-claim',interaction:true,registry:this.scene,initiator:a,target:b,participants:[a,b],surface:s,stage:'approach',expires:this.clock+30000,offset:x-s.left};
  this.episode=b.social.episode=ep;this.scene.set(a,ep);this.scene.set(b,ep);this.world.cool(a,b);
  a.route=[...path,{settle:true,surface:s,x}];a.destinationId=s.id;a.urgency='relaxed';a.deadline=t+30000;this.log('bed owner approach',{target:b.ownerKey});return true;
 }
 advance(t){const ep=this.episode,a=this.actor;if(ep?.kind==='shelf-ambush')return window.pixelCatShelfAmbushV1.advance(this,t,this.art());if(ep?.kind==='vertical-scratch')return window.pixelCatVerticalScratchV1.advance(this,t,this.art());if(ep?.kind==='bed'){
   if(!a.config.mood_behaviour||ep.owner!==a&&!a.config.social_behaviour||!ep.owner.active||ep.owner.root!==a.root||ep.owner.config.show_home===false||a.paused||a.suspended||a.userHeld||a.goal||a.command||a.previewPose||a.play||a.mouthAction||this.clock>=ep.expires){this.finish('bed visit ended');return;}
   const s=a.surfaces.find(s=>s.id===ep.surface.id&&s.bedOwner===ep.owner);if(!s){this.finish('bed removed');return;}
   ep.surface=s;ep.x=s.bed?s.min:Math.round((s.left-4+(22+window.pixelCatSetupV1.bed(ep.owner,this.art()).width/2)*(ep.owner.worldScale||ep.owner.scale)-12*a.scale)/a.scale)*a.scale;
   if(ep.stage==='approach'&&!this.clear(s,ep.x)){this.finish('bed occupied');return;}
   if(!a.motion&&!a.route?.length){if(!sameSupport(a.support,s)||Math.abs(a.x-ep.x)>6*a.scale){this.finish('bed route ended elsewhere');return;}
    if(ep.stage==='approach'){ep.stage='rest';ep.expires=this.clock+25000+25000*a.ensureMood().random();a.deadline=t+ep.expires-this.clock;if(a.idle)a.idle.poseUntil=t;this.log('bed resting',{owner:ep.owner.ownerKey});}
   }return;
  }
  if(ep?.kind!=='bed-claim')return super.advance(t);
  if(ep.initiator!==a){if(!this.available(a))this.finish('bed guest interrupted');return;}
  const b=ep.target,s=a.surfaces.find(s=>s.bedOwner===a&&!s.bed),m=this.memory.get(b.ownerKey);
  if(!s||!this.available(a,true)&&!a.route?.length||!this.peers().includes(b)||!this.available(b)||b.support?.bedOwner!==a||!['sleep','loaf','sit'].includes(b.idle?.pose)||this.clock>=ep.expires){this.finish('bed invitation interrupted');return;}
  if(a.motion||a.route?.length)return;
  if(!sameSupport(a.support,s)||!m?.frame||this.clock-m.at>700||!this.visible?.has(b.ownerKey)){this.finish('bed guest no longer noticed');return;}
  if(ep.stage==='approach'){
   // Use the actual visible silhouette and authored paw-contact row, not bed centre.
   const c=this.art().interactionContacts.bat,y=s.top-(24-c.point[1]-.5)*a.scale,row=Math.floor((y-m.frame.placement.top)/m.scale),pixels=m.frame.rows[row];if(!pixels){this.finish('bed guest out of paw reach');return;}
   const xs=[...pixels].flatMap((v,i)=>v==='.'?[]:[m.frame.facing<0?23-i:i]);if(!xs.length){this.finish('no safe bed contact');return;}
   const direction=Math.sign(m.x-a.x)||a.facing,edge=direction>0?Math.min(...xs):Math.max(...xs),contact=m.frame.placement.x+(edge+.5)*m.scale,x=Math.round((contact-(direction>0?c.point[0]+.5:23-c.point[0]+.5)*a.scale)/a.scale)*a.scale;
   const o={surface:s,x,direction,observed:m};if(!this.corridor(s,x,[b])||!this.patClear(o)){this.finish('no safe bed pat');return;}
   ep.stage='align';ep.direction=direction;if(Math.abs(x-a.x)>a.scale)a.moveTo(x,s.top,0,'walk',s,t);
  }else if(ep.stage==='align'){ep.stage='stroke';ep.wait=this.clock+5000;a.facing=ep.direction;a.idle=null;this.log('bed pat ready',{target:b.ownerKey});}
  else if(ep.stage==='stroke'&&this.clock>=ep.wait)this.finish('bed pat missed');
 }
 prepareIdle(idle,t){window.pixelCatVerticalScratchV1?.prepare(this,idle,t);return super.prepareIdle(idle,t);}
 restPose(){const ep=this.episode;if(ep?.kind==='shelf-ambush')return ep.stage==='wiggle'?'wiggle':'look';if(ep?.kind==='vertical-scratch')return ep.stage==='stroke'?'postScratch':'stand';if(ep?.kind==='bed'&&ep.stage==='rest')return this.actor.ensureMood().values.alertness<.55?'sleep':'loaf';return super.restPose();}
 idleDuration(pose,normal,base){if(pose==='postScratch'&&this.episode?.kind==='vertical-scratch')return 6000;if(this.episode?.kind==='bed'&&this.episode.stage==='rest'&&['loaf','sleep'].includes(pose))return Math.min(30000,Math.max(8000,this.episode.expires-this.clock));return super.idleDuration(pose,normal,base);}
 contactFrame(sample,placement,bridging,t){const ep=this.episode,a=this.actor;if(ep?.kind!=='bed-claim')return super.contactFrame(sample,placement,bridging,t);
  const c=this.art().interactionContacts?.bat;if(ep.initiator!==a||ep.stage!=='stroke'||ep.struck||bridging||a.idle?.pose!=='bat'||sample.frame!==c?.frame)return;
  ep.struck=true;const b=ep.target,point={x:placement.x+((a.facing>0?c.point[0]:23-c.point[0])+.5)*a.scale,y:placement.top+(c.point[1]+.5)*a.scale},hit=b.support?.bedOwner===a&&bodyHit(b.social.frame,b.scale,point,a.scale/2);
  this.log('bed pat '+(hit?'contact':'miss'),{target:b.ownerKey});this.finish(hit?'bed pat delivered':'bed pat missed');a.deadline=t+2500;
  if(!hit)return;
  const v=b.ensureMood().values,leave=b.ensureMood().random()<.45+.25*v.alertness-.2*v.sleepiness;b.social.log(leave?'bed guest yields':'bed guest stays',{source:a.ownerKey});
  if(leave){const s=b.home,paths=b.pathTo(s);if(paths&&s.bedOwner!==a){b.route=[...paths,{settle:true,surface:s,x:Math.max(s.min,Math.min(s.max,b.x))}];b.destinationId=s.id;b.urgency='relaxed';b.deadline=0;if(b.idle)b.idle.poseUntil=t;}}
  else b.deadline=t+5000+5000*b.ensureMood().random();
 }
 finish(reason){const ep=this.episode;if(ep?.kind==='shelf-ambush')window.pixelCatShelfAmbushV1?.release(this);if(ep?.kind==='vertical-scratch')window.pixelCatVerticalScratchV1?.release(this);if(ep?.kind==='bed'){if(ep.stage==='approach'){this.actor.route=[];this.actor.finishing=false;}this.nextBed=this.clock+45000;}return super.finish(reason);}
}
window.pixelCatDecisionsV1=CatBedVisits;

// A hidden dock owns an actor, but contributes no physical surface. Its return
// anchor aliases an ordinary discovered surface, retaining normal graph routing.
window.pixelCatHiddenHomeV1={
 select(a){
  const eligible=a.surfaces.filter(s=>!s.narrow&&s.max-s.min>=4*a.scale);
  const previous=eligible.find(s=>s.id===a.hiddenHomeId);
  const visible=eligible.filter(s=>s.top>=Math.max(24,a.size)&&s.top<=innerHeight-8&&s.right>0&&s.left<innerWidth);
  const home=previous||visible.find(s=>!s.candidate)||visible[0];
  a.home=home||null;a.waitingForSurface=!home;
  if(home)a.hiddenHomeId=home.id;
 }
};

// Keep decorative pixels in the dashboard's scrolling/composited subtree.
// The camera converts existing viewport geometry; simulation coordinates stay unchanged.
const catScrollPortals=new WeakMap(),catScrollLayers=new WeakMap(),catScrollAnchors=new WeakMap();
window.pixelCatScrollOverlayV1={
 offset(layer,x=0){if(!layer?.style)return;const p=catScrollAnchors.get(layer);if(p)p.offset=x;const value=p?`${x-p.x}px ${-p.y}px`:x?`${x}px 0px`:'';if(layer.style.translate!==value)layer.style.translate=value;},
 anchor(layer,state){if(!state.rect)return;const p=catScrollAnchors.get(layer)||{offset:0};p.x=state.rect.left;p.y=state.rect.top;catScrollAnchors.set(layer,p);this.offset(layer,p.offset);},
 follow(layer,source){const p=catScrollAnchors.get(layer),s=catScrollAnchors.get(source);if(p&&s){p.x=s.x;p.y=s.y;this.offset(layer,p.offset);}},
 container(root){
  if(typeof getComputedStyle!=='function')return null;
  for(let el=root;el;el=el.parentElement||el.getRootNode?.()?.host){
   const css=getComputedStyle(el);if(css.transform&&css.transform!=='none')return null;
   if(['relative','absolute'].includes(css.position))return el.shadowRoot||el;
   // An outside containing block would leave us fixed while this element scrolls.
   if(/auto|scroll/.test(css.overflowY||css.overflow)&&el!==root)return null;
   if(el===document.body)return el;
  }return null;
 },
 mount(layer,root){
  if(!layer||!root)return null;const prior=catScrollLayers.get(layer);if(prior?.root===root&&prior.portal.isConnected){this.anchor(layer,prior);return prior;}
  const container=this.container(root);if(!container?.append)return null;
  let state=catScrollPortals.get(root);
  if(!state?.portal.isConnected){
   const portal=document.createElement('div'),camera=document.createElement('div');portal.dataset.pixelCatScrollPlane='';portal.setAttribute('role','presentation');
   portal.style.cssText='position:absolute;inset:0;z-index:10;pointer-events:none;overflow:clip';camera.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:visible';portal.append(camera);container.append(portal);
   state={root,portal,camera,layers:new Set()};catScrollPortals.set(root,state);
  }
  if(prior)this.unmount(layer);layer.style.position='absolute';layer.style.overflow='visible';state.camera.append(layer);state.layers.add(layer);catScrollLayers.set(layer,state);this.anchor(layer,state);return state;
 },
 sync(a,t){
  const held=a.climb?.stage==='grip'&&catScrollAnchors.get(a.layer),anchor=held&&{left:held.x,top:held.y};
  const state=this.mount(a.layer,a.root);if(!state)return;
  if(state.at!==t){state.at=t;state.rect=state.portal.getBoundingClientRect();state.event={type:'scroll',target:document};}this.anchor(a.layer,state);
  const r=state.rect,previous=a.scrollCamera;a.scrollCamera={root:a.root,x:r.left,y:r.top};
  if(previous?.root===a.root&&(Math.abs(r.left-previous.x)>.001||Math.abs(r.top-previous.y)>.001)){
   // Sample each animation frame too: touch inertia can outrun scroll-event delivery.
   window.pixelCatScrollV1?.mark(a,state.event);a.needsMeasure=true;
  }
  // A held/deferred climb retains the camera paired with its displayed pose.
  // Its next draw commits the current camera together with translated geometry.
  if(anchor)this.anchor(a.layer,{rect:anchor});
 },
 unmount(layer){const state=catScrollLayers.get(layer);if(!state)return;state.layers.delete(layer);catScrollLayers.delete(layer);catScrollAnchors.delete(layer);layer.style.translate='';if(!state.layers.size){state.portal.remove();if(catScrollPortals.get(state.root)===state)catScrollPortals.delete(state.root);}}
};

// A scroll is usually a uniform camera translation, not a new dashboard layout.
// Validate every known card rectangle before reusing its surfaces. Sticky/reflowed
// cards, nested content scrolling and resize events retain full discovery.
const catScrollRoots=new WeakMap();
const catOverlayGuards=new WeakMap(),catLayoutAttached=new WeakSet();
const catScrollRect=(state,el)=>{if(!state.rects.has(el))state.rects.set(el,el.getBoundingClientRect());return state.rects.get(el);};
const catScrollPoint=(p,dx,dy,cache)=>{if(!p||typeof p!=='object')return p;if(cache.has(p))return cache.get(p);const n={...p};cache.set(p,n);if(Number.isFinite(n.x))n.x+=dx;if(Number.isFinite(n.y))n.y+=dy;if(n.lookAt)n.lookAt=catScrollPoint(n.lookAt,dx,dy,cache);return n;};
const catScrollLayout={
 // Dialog discovery is identical for actors in the same view/RAF. Keep local
 // disconnected/navigation/visibility guards ahead of the shared result.
 attach(a){if(catLayoutAttached.has(a)||typeof a.blocked!=='function')return;catLayoutAttached.add(a);const original=a.blocked;a.blocked=function(frameTime){if(document.hidden||location.pathname!==this.href||!this.isConnected||this.root?.editMode)return true;if(!this.root||!Number.isFinite(frameTime))return original.call(this);let cached=catOverlayGuards.get(this.root);if(cached?.at===frameTime)return cached.value;const value=original.call(this);catOverlayGuards.set(this.root,{at:frameTime,value});window.pixelCatMonitorV1?.diagnostics?.count('overlayScans');return value;};},
 mark(a,event){
  a.scrollTranslation=null;
  if(event?.type!=='scroll'||!a.root||a.config?.scroll_reuse===false)return;
  let el=a.root;while(el&&el!==event.target)el=el.parentElement||el.getRootNode?.()?.host;
  if(!el&&event.target!==document)return;
  let state=catScrollRoots.get(a.root);if(!state){state={actors:new Set(),rects:new Map()};catScrollRoots.set(a.root,state);}
  if(state.event!==event){state.event=event;state.rects.clear();clearTimeout(state.timer);if(state.refreshRaf)cancelAnimationFrame(state.refreshRaf);state.refreshRaf=null;state.timer=setTimeout(()=>{state.refresh=[...state.actors];const step=()=>{state.refreshRaf=null;let cat;while(state.refresh.length){const next=state.refresh.shift();next.scrollTranslation=null;if(next.active&&next.isConnected){cat=next;break;}}if(cat)cat.invalidate();if(state.refresh.length)state.refreshRaf=requestAnimationFrame(step);else{state.actors.clear();state.rects.clear();state.event=null;}};state.refreshRaf=requestAnimationFrame(step);},160);}
  state.actors.add(a);a.scrollTranslation=state;
 },
 shift(a){
  const state=a.scrollTranslation;a.scrollTranslation=null;
  if(!state||!a.support||!a.home?.rectSnapshot||!a.surfaces?.length)return false;
  const dock=a.config?.show_home===false?a.home.el:a.shadowRoot.querySelector('.dock');if(!dock)return false;
  const r=catScrollRect(state,dock),old=a.home.rectSnapshot,dx=r.left-old.left,dy=r.top-old.top,root=catScrollRect(state,a.root);
  if(![dx,dy].every(Number.isFinite)||!a.worldRect||Math.abs(root.width-a.worldRect.width)>.5||Math.abs(root.height-a.worldRect.height)>.5)return false;
  for(const s of a.surfaces){const node=s.rectNode||(s.home?dock:s.el),rect=catScrollRect(state,node),snapshot=s.rectSnapshot;if(!s.el?.isConnected||node?.isConnected===false||!snapshot||['width','height'].some(k=>Math.abs(rect[k]-snapshot[k])>.5)||Math.abs(rect.left-snapshot.left-dx)>.5||Math.abs(rect.top-snapshot.top-dy)>.5)return false;}
  const pointCache=new Map(),point=p=>catScrollPoint(p,dx,dy,pointCache),rect=b=>{if(!b)return b;const n={...b};for(const k of ['left','right'])if(Number.isFinite(n[k]))n[k]+=dx;for(const k of ['top','bottom'])if(Number.isFinite(n[k]))n[k]+=dy;return n;};
  const surface=s=>{const n={...s};for(const k of ['left','right','min','max'])if(Number.isFinite(n[k]))n[k]+=dx;n.top+=dy;n.rectSnapshot=rect(s.rectSnapshot);for(const k of ['roamPoints','propPoints','inspectionPoints','inspectionTargets','points'])if(s[k])n[k]=s[k].map(point);return n;};
  const previous=a.surfaces,support=a.support;a.surfaces=previous.map(surface);a.home=a.surfaces.find(s=>s.id===a.home.id);a.bedSurface=a.surfaces.find(s=>s.bed&&(s.bedOwner===a||s.id==='home:bed'))||null;a.worldRect={left:root.left,top:root.top,right:root.right,bottom:root.bottom,width:root.width,height:root.height};
  a.surfaceCandidates=(a.surfaceCandidates||[]).map(surface);a.rejected=(a.rejected||[]).map(s=>({...s,left:s.left+dx,right:s.right+dx,top:s.top+dy}));
  if(a.inspectionPending)a.inspectionPending=point(a.inspectionPending);if(a.requestedPoint)a.requestedPoint=point(a.requestedPoint);if(a.actionTarget)a.actionTarget=point(a.actionTarget);
  window.pixelCatCardClimbV1?.shift(a,dx,dy);
  a.reconcileLayout(support,previous,performance.now(),true);a.needsMeasure=false;
  window.pixelCatMonitorV1?.diagnostics?.count('scrollTranslations');return true;
 }
};
window.pixelCatScrollV1=catScrollLayout;

// Bounded, browser-local evidence. No network uploads, DOM snapshots or pixels.
// Operation durations overlap (plan includes pathTo); never sum them as CPU use.
const createCatDiagnostics=hub=>{
 const cap=(list,value,max)=>{list.push(value);if(list.length>max)list.splice(0,list.length-max);};
 const number=v=>Number.isFinite(v)?Math.round(v*100)/100:0;
 const safe=v=>String(v||'').slice(0,200).replace(/(?:data|blob):[^\s]*/g,'[inline]').slice(0,100);
 const source=v=>{if(!v)return '';if(/^(data|blob):/.test(v))return '[inline module]';try{return new URL(v,location.href).pathname.split('/').slice(-2).join('/').slice(0,100);}catch{return '[unavailable]';}};
 const d={enabled:true,records:[],incidents:[],tasks:[],operations:[],bucket:{},counters:{},attached:new WeakSet(),observer:null,mode:'unavailable',savedAt:0,previous:null,storage:'not saved yet',lastIncident:-Infinity,
  key(){return 'pixel-cat-diagnostics-v1:'+location.pathname;},
  cats(){return [...hub.owners()].map(([a])=>a).filter(a=>a.active&&a.isConnected&&a.href===location.pathname);},
  context(details=false){const cats=this.cats(),actions={},moods={};let running=0,maxSurfaces=0;const scenes=new Set(),episodes=new Set();for(const a of cats){const action=a.social?.episode?.kind||a.motion?.kind||a.idle?.pose||'rest';actions[action]=(actions[action]||0)+1;const mood=a.mood?.label||'uninitialised';moods[mood]=(moods[mood]||0)+1;if(!a.paused&&!a.suspended&&!a.stranded)running++;maxSurfaces=Math.max(maxSurfaces,a.surfaces?.length||0);if(a.propScene)scenes.add(a.propScene);if(a.social?.episode)episodes.add(a.social.episode);}
   const c={mounted:cats.length,running,maxSurfaces,props:[...scenes].reduce((n,s)=>n+(s.props?.length||0),0),episodes:episodes.size,actions,moods};if(details)c.actors=cats.slice(0,24).map(a=>({id:safe(a.ownerKey),motion:a.motion?.kind||null,pose:a.idle?.pose||null,episode:a.social?.episode?.kind||null,route:a.route?.length||0,surfaces:a.surfaces?.length||0,needsMeasure:!!a.needsMeasure,paused:!!a.paused,suspended:!!a.suspended,stranded:!!a.stranded}));return c;
  },
  count(key){if(hub.listeners.size&&this.enabled)this.counters[key]=(this.counters[key]||0)+1;},
  attach(a){if(this.attached.has(a))return;this.attached.add(a);for(const name of ['measure','plan','pathTo','blocked']){const original=a[name];if(typeof original!=='function')continue;a[name]=function(...args){if(!hub.listeners.size||!d.enabled)return original.apply(this,args);const start=performance.now();try{return original.apply(this,args);}finally{const cost=performance.now()-start,b=d.bucket[name]||={calls:0,totalMs:0,maxMs:0};b.calls++;b.totalMs+=cost;b.maxMs=Math.max(b.maxMs,cost);if(cost>=12)cap(d.operations,{at:number(start),phase:name,ms:number(cost),cat:safe(this.ownerKey),surfaces:this.surfaces?.length||0},80);}};}},
  gap(at,ms){if(!this.enabled||ms<100||at-this.lastIncident<1000)return;this.lastIncident=at;cap(this.incidents,{at:number(at),gapMs:number(ms),scrolling:at-(this.scrolledAt??-Infinity)<300,context:this.context(true)},20);},
  tick(at,stats){if(!this.enabled)return;const phases=Object.fromEntries(Object.entries(this.bucket).map(([key,b])=>[key,{calls:b.calls,totalMs:number(b.totalMs),maxMs:number(b.maxMs)}]));cap(this.records,{at:number(at),fps:number(stats.fps),meanMs:number(stats.mean),p95Ms:number(stats.p95),longFrames:stats.long,context:this.context(),phases,counters:{...this.counters}},120);this.bucket={};this.counters={};if(at-this.savedAt>=30000){this.savedAt=at;this.persist();}},
  snapshot(){return {schema:1,build:'monitor-diagnostics-v1',page:location.pathname,timeOrigin:performance.timeOrigin,exportedAt:new Date().toISOString(),observer:this.mode,enabled:this.enabled,limits:{summaries:120,incidents:20,tasks:80,operations:80},records:this.records,incidents:this.incidents,tasks:this.tasks,operations:this.operations};},
  report(){return {...this.snapshot(),storage:this.storage,previousSession:this.previous,notes:['RAF gaps are scheduling evidence, not paint or CPU utilisation.','Operation timings overlap and cannot be added together.','Context is sampled at/after a stall; correlation does not prove cause.','Scroll translation reuses geometry only after validating every known card.']};},
  persist(){try{const snapshot=this.snapshot();for(const key of ['records','incidents','tasks','operations'])snapshot[key]=[...snapshot[key]];let value=JSON.stringify(snapshot),trimmed=false;for(let attempt=0;value.length>160000&&attempt<12;attempt++){for(const key of ['incidents','tasks','operations','records'])snapshot[key].splice(0,Math.ceil(snapshot[key].length/4));trimmed=true;value=JSON.stringify(snapshot);}localStorage.setItem(this.key(),value);this.storage=trimmed?'saved locally · oldest evidence trimmed':'saved locally';}catch{this.storage='memory only · storage unavailable';}},
  onScroll(){d.scrolledAt=performance.now();d.count('scrollEvents');},
  onPageHide(){d.persist();},
  observe(){
   this.observer?.disconnect();this.observer=null;this.mode='unavailable';if(!this.enabled||typeof PerformanceObserver==='undefined')return;
   const supported=PerformanceObserver.supportedEntryTypes||[],type=supported.includes('long-animation-frame')?'long-animation-frame':supported.includes('longtask')?'longtask':null;if(!type)return;
   try{this.observer=new PerformanceObserver(list=>{if(!d.enabled||!d.started||!hub.listeners.size||document.hidden)return;for(const e of list.getEntries().slice(-80))cap(d.tasks,{at:number(e.startTime),ms:number(e.duration),type,blockingMs:number(e.blockingDuration),layoutStart:number(e.styleAndLayoutStart),scripts:[...(e.scripts||[])].slice(0,40).sort((a,b)=>b.duration-a.duration).slice(0,5).map(s=>({ms:number(s.duration),forcedLayoutMs:number(s.forcedStyleAndLayoutDuration),position:Number.isFinite(s.sourceCharPosition)?s.sourceCharPosition:null,function:safe(s.sourceFunctionName),invoker:safe(s.invoker),source:source(s.sourceURL)}))},80);});this.observer.observe({type,buffered:false});this.mode=type;}catch{this.observer=null;this.mode='unavailable';}
  },
  start(){if(this.started)return;this.started=true;try{const raw=localStorage.getItem(this.key());if(raw&&raw.length<=180000){const previous=JSON.parse(raw);if(previous.schema===1&&previous.page===location.pathname)this.previous=previous;}}catch{}this.observe();document.addEventListener('scroll',this.onScroll,{capture:true,passive:true});window.addEventListener?.('pagehide',this.onPageHide);},
  stop(){if(!this.started)return;this.persist();this.started=false;this.observer?.disconnect();this.observer=null;document.removeEventListener('scroll',this.onScroll,true);window.removeEventListener?.('pagehide',this.onPageHide);},
  setEnabled(enabled){this.enabled=!!enabled;this.bucket={};this.counters={};this.observe();}
 };
 return d;
};

// One browser-frame sampler shared by all monitor cards, independent of actors.
// RAF measures foreground scheduling intervals, not CPU usage or GPU render time.
const catMonitorHub={
 listeners:new Set(),samples:[],history:[],last:null,published:null,raf:null,owners:()=>new Map(),
 reset(){this.samples=[];this.history=[];this.last=null;this.published=null;this.warmStarted=null;this.warmLast=null;this.quietUntil=0;this.readyProbeAt=0;this.readySignature=null;this.collecting=false;this.warmRemaining=8000;this.warmReason='Loading dashboard';},
 startup(t){
  if(this.collecting)return true;
  this.warmStarted??=t;
  if(this.warmLast!==null&&t-this.warmLast>100)this.quietUntil=t+2000;
  this.warmLast=t;
  if(t>=this.readyProbeAt){
   this.readyProbeAt=t+250;
   const cats=[...this.owners()].map(([a])=>a).filter(a=>a.active&&a.isConnected&&a.href===location.pathname);
   const ready=(!document.readyState||document.readyState==='complete')&&document.fonts?.status!=='loading'&&cats.every(a=>a.homeArtReady&&a.support&&!a.needsMeasure&&!a.waitingForSurface);
   const signature=cats.map(a=>a.ownerKey).sort().join('|');
   if(!ready||signature!==this.readySignature)this.quietUntil=t+2000;
   this.readySignature=signature;this.startupReady=ready;
  }
  this.warmRemaining=Math.max(0,this.warmStarted+8000-t,this.quietUntil-t,this.startupReady?0:1000);
  this.warmReason=this.startupReady?'Waiting for smooth frames':'Loading dashboard / cat surfaces';
  if(this.warmRemaining)return false;
  this.collecting=true;this.last=null;this.warmReason='';return true;
 },
 stats(){const n=this.samples.length,mean=n?this.samples.reduce((a,b)=>a+b,0)/n:0,sorted=[...this.samples].sort((a,b)=>a-b);return {mean,p95:n?sorted[Math.ceil(n*.95)-1]:0,fps:mean?1000/mean:0,long:this.samples.filter(v=>v>50).length,n};},
 frame(t){
  if(!document.hidden){
   const wasWarming=!this.collecting;this.startup(t);
   if(!this.warmRemaining&&this.last!==null&&t>this.last){this.diagnostics.gap(t,t-this.last);this.samples.push(t-this.last);if(this.samples.length>600)this.samples.shift();}
   this.last=this.warmRemaining?null:t;
   if(this.published===null||t-this.published>=1000||wasWarming&&!this.warmRemaining){this.published=t;const stats={...this.stats(),warmupMs:this.warmRemaining,warmupReason:this.warmReason};if(!this.warmRemaining)this.diagnostics.tick(t,stats);if(stats.n){this.history.push(stats);if(this.history.length>60)this.history.shift();}for(const fn of this.listeners)fn(stats,this.history);}
  }else this.last=null;
  this.raf=this.listeners.size&&!document.hidden?requestAnimationFrame(t=>this.frame(t)):null;
 },
 visibility(){catMonitorHub.last=null;if(!catMonitorHub.collecting){catMonitorHub.warmLast=null;catMonitorHub.quietUntil=0;catMonitorHub.readyProbeAt=0;catMonitorHub.readySignature=null;}if(document.hidden){if(catMonitorHub.raf!==null)cancelAnimationFrame(catMonitorHub.raf);catMonitorHub.raf=null;}else if(catMonitorHub.listeners.size&&catMonitorHub.raf===null)catMonitorHub.raf=requestAnimationFrame(t=>catMonitorHub.frame(t));},
 subscribe(fn){
  this.listeners.add(fn);
  if(this.listeners.size===1){this.reset();this.diagnostics.start();document.addEventListener('visibilitychange',this.visibility);this.visibility();}
  return ()=>{this.listeners.delete(fn);if(!this.listeners.size){if(this.raf!==null)cancelAnimationFrame(this.raf);this.raf=null;this.diagnostics.stop();document.removeEventListener('visibilitychange',this.visibility);this.reset();}};
 }
};
catMonitorHub.diagnostics=createCatDiagnostics(catMonitorHub);
window.pixelCatMonitorV1=catMonitorHub;
const catMonitorWorld=el=>{while(el){if(el.matches?.('[data-cat-world],hui-sections-view,hui-masonry-view'))return el;el=el.parentElement||el.getRootNode?.()?.host;}return null;};
// Frame-budget reference bands; no new sampling, only the existing 1s render.
function catMonitorChart(history){
 const max=Math.max(50,...history.map(s=>s.p95)),y=ms=>76-Math.min(max,ms)/max*68;
 const bands=[[0,16.7,'#43a047'],[16.7,33.3,'#f9a825'],[33.3,max,'#e53935']].map(([lo,hi,c])=>'<rect x="38" width="300" y="'+y(hi)+'" height="'+(y(lo)-y(hi))+'" fill="'+c+'" opacity=".13"/>').join('');
 const ticks=[max,33.3,16.7,0].filter(v=>v===max||v===0||y(v)>19&&y(v)<65).map(v=>'<line x1="38" x2="338" y1="'+y(v)+'" y2="'+y(v)+'" stroke="currentColor" opacity=".18"/><text x="34" y="'+(y(v)+3)+'" text-anchor="end" fill="currentColor" font-size="9">'+(v===max?Math.ceil(v):v)+'</text>').join('');
 return {max,background:bands+ticks,points:key=>history.map((s,i)=>(338-(history.length-1-i)*300/59)+','+y(s[key])).join(' ')};
}
class PixelCatMonitor extends HTMLElement{
 constructor(){super();this.attachShadow({mode:'open'});}
 setConfig(config){this.config={...config};this.render();if(this.isConnected)this.start();}
 set hass(value){} // HA state updates do not rebuild this card.
 getCardSize(){return 4;}
 getGridOptions(){return {columns:12,rows:'auto',min_columns:6};}
 static getStubConfig(){return {title:'Cat performance'};}
 connectedCallback(){if(this.config)this.start();}
 disconnectedCallback(){this.unsubscribe?.();this.unsubscribe=null;}
 start(){if(this.unsubscribe)return;for(let el=this;el;el=el.parentElement||el.getRootNode?.()?.host)if(['hui-card-preview','hui-card-picker','hui-dialog-edit-card','hui-dialog-edit-dashboard','hui-card-element-editor'].includes(el.localName)){this.shadowRoot.querySelector('.summary').textContent='Preview · monitoring starts on the dashboard';return;}this.unsubscribe=catMonitorHub.subscribe((stats,history)=>this.update(stats,history));}
 render(){
  if(!this.shadowRoot.querySelector('ha-card')){
   this.shadowRoot.innerHTML=`<style>
    :host{display:block}ha-card{padding:16px;box-sizing:border-box}h2{font-size:18px;margin:0 0 10px}.metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.metric{min-width:0}strong{display:block;font-size:22px;font-variant-numeric:tabular-nums}.metric span,small{color:var(--secondary-text-color,#777);font-size:12px}.summary{margin:10px 0;font-size:13px;min-height:34px}svg{display:block;width:100%;height:90px;background:var(--secondary-background-color,#8881);border-radius:5px}.mean{stroke:var(--primary-color,#03a9f4)}.p95{stroke:#e6a73e}polyline{fill:none;stroke-width:1.8;vector-effect:non-scaling-stroke}.legend{display:flex;justify-content:space-between;gap:6px;margin:5px 0}.note{display:block;line-height:1.4;margin-top:8px}button{font:inherit;color:var(--primary-text-color);background:var(--secondary-background-color,#8882);border:1px solid var(--divider-color,#8885);padding:5px 9px;border-radius:6px;cursor:pointer}.diagnostics{margin-top:10px;font-size:13px;position:relative}.diagnostics[open]{z-index:100}.diagnostic-body{position:absolute;left:0;right:0;top:100%;max-height:min(65vh,440px);overflow:auto;box-sizing:border-box;padding:10px;background:var(--ha-card-background,var(--card-background-color,#fff));border:1px solid var(--divider-color,#aaa);border-radius:6px;box-shadow:0 5px 18px #0003}.diagnostics summary{cursor:pointer}.diagnostics label,.capture-status{display:block;margin:8px 0}.report-buttons{display:flex;gap:6px;flex-wrap:wrap}.report-buttons button{font-size:12px}textarea{box-sizing:border-box;width:100%;margin-top:8px;font:11px monospace;resize:vertical}.footer{display:flex;align-items:center;justify-content:space-between;gap:8px}
   </style><ha-card><h2></h2><div class="metrics"><div class="metric"><strong class="fps">—</strong><span>Browser FPS</span></div><div class="metric"><strong class="mean-time">—</strong><span>Mean frame ms</span></div><div class="metric"><strong class="p95-time">—</strong><span>p95 frame ms</span></div></div><div class="summary" aria-live="off">Collecting foreground frames…</div><svg viewBox="0 0 340 90" preserveAspectRatio="none" role="img" aria-label="Frame timing in milliseconds: mean blue, p95 amber; green up to 16.7 ms, amber to 33.3 ms, red above"><g class="chart-background"></g><polyline class="mean"></polyline><polyline class="p95"></polyline></svg><div class="legend"><small>Mean / p95 · last minute · ms</small><small class="chart-scale">0–50 ms</small></div><div class="footer"><small>One shared sampler · 1s updates</small><button>Reset history</button></div><small class="note">Foreground browser timing includes this page’s workload. It is not CPU/GPU usage. Bands: green ≤16.7 ms (~60 FPS), amber ≤33.3 ms (~30 FPS), red above. Reference budgets, not device pass/fail. Long frames: &gt;50 ms. Individual cat profiling is optional.</small><details class="diagnostics"><summary>Diagnostics &amp; report</summary><div class="diagnostic-body"><label><input class="capture" type="checkbox" checked> Capture diagnostic evidence</label><small class="capture-status"></small><div class="report-buttons"><button class="report-refresh">Show / refresh report</button><button class="report-download">Download JSON</button><button class="report-clear">Clear log</button></div><textarea class="diagnostic-report" aria-label="Performance diagnostic report" readonly hidden rows="8" spellcheck="false"></textarea><small class="note">Kept in this browser only, saved about every 30 seconds. Report includes nearby activity and slow measured operations; these are clues, not proof of cause. Reset history does not clear this log.</small></div></details></ha-card>`;
   this.nodes=Object.fromEntries(['fps','mean-time','p95-time','summary','chart-scale','mean','p95','chart-background'].map(k=>[k,this.shadowRoot.querySelector('.'+k)]));
   const d=catMonitorHub.diagnostics,report=this.shadowRoot.querySelector('.diagnostic-report');
   this.shadowRoot.querySelector('.capture').onchange=e=>d.setEnabled(e.target.checked);
   this.shadowRoot.querySelector('.report-refresh').onclick=()=>{report.hidden=false;report.value=JSON.stringify(d.report(),null,2);};
   this.shadowRoot.querySelector('.report-download').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(d.report(),null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='cat-performance-report.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
   this.shadowRoot.querySelector('.report-clear').onclick=()=>{d.records=[];d.incidents=[];d.tasks=[];d.operations=[];d.bucket={};d.counters={};d.previous=null;d.lastIncident=-Infinity;d.persist();report.value='';report.hidden=true;};
   this.shadowRoot.querySelector('.footer button').onclick=()=>{catMonitorHub.reset();for(const fn of catMonitorHub.listeners)fn(catMonitorHub.stats(),catMonitorHub.history);};
  }
  this.shadowRoot.querySelector('h2').textContent=this.config.title||'Cat performance';
 }
 update(stats,history){
  const d=catMonitorHub.diagnostics,panel=this.shadowRoot?.querySelector('.diagnostics');if(panel?.open){this.shadowRoot.querySelector('.capture').checked=d.enabled;this.shadowRoot.querySelector('.capture-status').textContent=`${d.enabled?'Recording':'Paused'} · ${d.incidents.length} gaps ≥100 ms · ${d.tasks.length} browser long frames/tasks · ${d.operations.length} slow operations · ${d.mode} · ${d.storage}`;}
  const n=this.nodes,fmt=v=>stats.n?v.toFixed(1):'—';n.fps.textContent=fmt(stats.fps);n['mean-time'].textContent=fmt(stats.mean);n['p95-time'].textContent=fmt(stats.p95);
  const root=catMonitorWorld(this),cats=[...catMonitorHub.owners()].filter(([a,e])=>a.active&&a.isConnected&&e.root===root),running=cats.filter(([a])=>!a.paused&&!a.suspended&&!a.stranded).length,profiled=cats.filter(([a])=>a.config.debug_performance).length;
  n.summary.textContent=stats.warmupMs?`${stats.warmupReason||'Waiting for dashboard to settle'} · ${Math.ceil(stats.warmupMs/1000)}s · ${running}/${cats.length} cats running`:`${running}/${cats.length} cats running · ${stats.long}/${stats.n} frames >50 ms · ${profiled} individually profiled`;
  const chart=catMonitorChart(history);n['chart-scale'].textContent=`0–${Math.ceil(chart.max)} ms`;n['chart-background'].innerHTML=chart.background;
  for(const key of ['mean','p95'])n[key].setAttribute('points',chart.points(key));
 }
}
if(!customElements.get('pixel-cat-monitor'))customElements.define('pixel-cat-monitor',PixelCatMonitor);
// Compatibility type; select Performance monitor in the Pixel Cat editor.

// Grounded physical reactions can interrupt voluntary behaviour. A committed
// flight finishes before a queued reaction; no teleport or mid-air ground hop.
const catReactions={
 airborne(a,t){const m=a.motion;if(m?.kind==='jump')return true;if(m?.gallopTimeline){const beat=m.gallopTimeline.find(b=>t-m.start<b.until)||m.gallopTimeline.at(-1);return beat.grounded===false;}return false;},
 receive(a,cue,t,debug=false,type='prop'){
  if(!cue?.id||!Number.isFinite(cue.x)||!Number.isFinite(cue.y))return false;
  if(!debug&&!a.config[type==='landing'?'landing_reactions':type==='social'?'interaction_behaviour':'prop_reactions']||a.userHeld||a.paused||a.suspended||a.stranded||!a.active)return false;
  const mood=a.ensureMood();if(!mood.disturbance(cue))return false;
  if(a.motion?.kind==='startle'||a.pendingStartle||t<(a.nextLandingReactionAt||0)){a.setAttribute('data-'+type+'-response','cooldown / recorded');return false;}
  const choice=a.social?.disturbanceChoice?.(cue)??mood.landingChoice(window.pixelCatBehaviourV1?.choiceWeight(a,'hop')??1);a.nextLandingReactionAt=t+6000;let result=choice;
  if(choice==='hop'){
   const followup=!debug&&a.config.startle_followups?mood.startleFollowup():null;
   if(this.airborne(a,t)){
    const m=a.motion,surface=m.kind==='jump'?m.target:a.support;a.pendingStartle={cue:{...cue},type,offset:cue.x-surface.left,surfaceId:surface.id,expires:t+Math.max(1200,Math.min(5000,m.start+m.duration-t+1000)),followup};result='hop after landing';
   }else if(!a.requestStartle(cue,t))result='watch';
   else this.followup(a,cue,followup);
  }
  if(result==='watch'&&!a.motion&&!a.route?.length&&!a.play&&!a.social?.episode&&!a.goal&&!a.command){a.previewPose='glance';a.forcedIdleUntil=t+1200;a.deadline=a.forcedIdleUntil;if(a.idle)a.idle.poseUntil=t;}
  a.setAttribute('data-'+type+'-response',result);a.setAttribute('data-last-'+type+'-cue',JSON.stringify(Object.fromEntries(Object.entries(cue).filter(([key,value])=>['id','kind','source','subject','x','y','intensity','dropCells','at','surfaceId'].includes(key)&&['string','number','boolean'].includes(typeof value)))));a.social?.log('disturbance',{trigger:cue.kind,response:result});return true;
 },
 followup(a,cue,kind){if(kind&&a.motion?.kind==='startle')a.motion.followup={kind,sourceOffset:cue.x-a.support.left,el:a.support.el};},
 resume(a,t){const pending=a.pendingStartle;if(!pending)return;if(t>pending.expires||a.paused||a.suspended||a.stranded){a.pendingStartle=null;return;}if(this.airborne(a,t)||a.motion?.kind==='startle')return;a.pendingStartle=null;if(a.support?.id!==pending.surfaceId)return;const cue={...pending.cue,x:a.support.left+pending.offset};const hopped=a.requestStartle(cue,t);if(hopped)this.followup(a,cue,pending.followup);a.setAttribute('data-'+pending.type+'-response',hopped?'hop':'watch');},
 prepareIdle(a,idle,t,art){
  if(idle.pose!=='scratch')return;
  const clip=art.idleSequences?.scratch;if(!clip?.roles)return;const rate=Math.max(80,Number(a.config.idle_frame_ms)||250)/250,random=a.ensureMood().random(),cycles=3+Math.min(4,Math.floor(random*5));
  const duration=role=>clip.durations.reduce((n,d,i)=>n+(clip.roles[i]===role?(window.pixelCatPolishV1?.hold('scratch',clip,i,rate)??d*rate):0),0);
  idle.scratchCycles=cycles;idle.poseUntil=t+(idle.bridgeMs||0)+duration('enter')+duration('cycle')*cycles+duration('exit');a.deadline=Math.max(a.deadline||0,idle.poseUntil);if(a.previewPose==='scratch')a.forcedIdleUntil=idle.poseUntil;a.setAttribute('data-scratch-cycles',String(cycles));
 },
 wander(a,requested){
  a.casualWander=false;if(requested||a.command||a.goal||a.play||a.toyHunt||a.social?.episode||a.urgency!=='relaxed'||!a.route?.length||a.config.casual_wander===false)return;
  const mood=a.ensureMood(),v=mood.values,chance=Math.max(.15,Math.min(.85,.65+.3*v.sleepiness-.35*v.alertness-.15*v.playfulness));a.casualWander=mood.random()<chance;
 }
};
window.pixelCatReactionsV1=catReactions;

// Labels describe current state, never the last historical decision event.
const catBaseAction=a=>{
 if(a.userHeld)return a.dragState?.phase==='held'?'Picked up':'Landing after pickup';
 if(a.paused)return 'Paused';if(a.climb)return a.climb.sample?.kind==='grip'&&a.climb.waitReason?a.climb.waitReason:a.climb.sample?.phase||'Approaching a climb';if(a.suspended)return 'Waiting for dashboard';if(a.stranded)return 'Waiting for a safe route';
 const m=a.motion,ep=a.social?.episode,peer=b=>String(b?.config?.name||b?.ownerKey||'another cat');
 if(m?.kind==='startle')return 'Startled · hopping away';
 if(a.mouthAction)return (a.mouthAction.phase==='approach'?'Approaching · ':'')+({food:'Eating at the bowl',pickup:'Nibbling to pick up a toy',nose:'Nosing a toy',drop:'Putting down a toy',bat:'Preparing to bat'}[a.mouthAction.kind]||'Investigating');
 const poses={backRoll:'Resting on back',alertLying:'Lying alert',sit:'Sitting',sithead:'Looking around',perch:'Perching',stand:'Standing',loaf:'Loafing',sleep:'Sleeping',clean:'Grooming',scratch:'Scratching an ear',look:'Looking up',lookdown:'Looking down',glance:'Glancing around',stretch:'Stretching',sniff:'Sniffing',yawn:'Yawning',meow:'Meowing',chatter:'Chattering',rub:'Rubbing a cheek',bat:'Patting / batting',eat:'Eating',nose:'Nosing'};
 if(a.previewPose)return poses[a.previewPose]||a.previewPose;
 if(ep?.kind==='chase'){const runner=a===ep.runner;return (runner?'Running from ':ep.stage==='catch'?'Pouncing toward ':'Chasing ')+peer(runner?ep.chaser:ep.runner);}
 if(ep?.kind==='company')return (ep.stage==='rest'?'Resting near ':'Going to rest near ')+peer(ep.target);
 if(ep?.kind==='bed')return (ep.stage==='rest'?'Sleeping in ':'Going to ')+(ep.owner===a?'own bed':peer(ep.owner)+'’s bed');
 if(ep?.kind==='bed-claim')return ep.initiator===a?(ep.stage==='stroke'?'Patting a bed guest':'Approaching own bed'):'Resting in a borrowed bed';
 if(ep?.kind==='vertical-scratch')return ep.stage==='stroke'?(ep.prop?.igloo?'Scratching the igloo':'Scratching the post'):'Approaching a scratch surface';
 if(ep?.kind==='shelf-ambush')return ep.stage==='land'?'Pouncing down':ep.stage==='wiggle'?'Wiggling before pouncing':'Stalking from above';
 if(ep?.initiator===a){if(ep.kind==='pat')return (ep.stage==='stroke'?'Patting ':'Approaching to pat ')+peer(ep.target);if(ep.kind==='ambush')return ({sneak:'Stalking ',check:'Watching ',land:'Pouncing toward '}[ep.stage]||'Approaching ')+peer(ep.target);if(ep.kind==='prop')return ep.stage==='land'?'Pouncing on the ball':'Tracking the ball';}
 const p=a.play,toy=p?.toyId&&a.propScene?.props.find(t=>t.id===p.toyId),target=toy?.asset?.id==='ball'?'the ball':toy?'the mouse toy':'an imaginary target';
 if(p){if(p.stage==='bat')return (p.strokes?.[p.strokeIndex]==='bat'?'Batting ':'Patting ')+target;return {sit:'Preparing to play',notice:'Inspecting '+target,watch:'Watching '+target,sneak:'Stalking '+target,wiggle:'Wiggling before pouncing',pounce:'Pouncing on '+target,'bat-pause':'Pausing between pats',settle:'Settling after play',groom:'Grooming after play'}[p.stage]||'Playing';}
 if(a.toyHunt?.stage==='approach')return 'Approaching a toy';
 if(m?.kind==='jump')return m.jumpKind==='descend'?'Jumping down':m.jumpKind==='ascend'?'Jumping up':'Leaping across';
 if(m?.kind==='walk')return m.gallopTimeline?'Galloping':m.sneakTimeline?'Sneaking':m.fastClip?'Trotting':a.urgency==='casual'?'Meandering':a.urgency==='relaxed'?'Strolling':'Walking';
 return poses[a.idle?.pose]||'Resting';
};
const catActorAction=a=>catBaseAction(a)+(a.carriedToy?' · carrying a toy':'');
const catMoodTextColors={balanced:{text:'#111111',rgb:'17,17,17'},alertness:{text:'#c62828',rgb:'198,40,40'},playfulness:{text:'#188038',rgb:'24,128,56'},sleepiness:{text:'#7e47a7',rgb:'126,71,167'}};
const catLabelBounds=new WeakMap();
const catLabelNodes=new WeakMap();
const debugVisible=node=>{if(!node)return false;for(let el=node;el;el=el.parentElement)if(el.tagName==='DETAILS'&&!el.open)return false;return true;};
const catLabelPlace=a=>{const halo=a.moodHalo,nodes=halo&&catLabelNodes.get(halo);if(!nodes)return;const {name,state}=nodes,rows=a.social?.frame?.rows||a.idle?.rows;let bounds=rows&&catLabelBounds.get(rows);if(!bounds){let top=24,bottom=0;rows?.forEach((row,y)=>{if([...row].some(v=>v!=='.')){top=Math.min(top,y);bottom=y+1;}});bounds=bottom?{top,bottom}:{top:0,bottom:24};if(rows)catLabelBounds.set(rows,bounds);}const above=(36*a.scale-(6+bounds.top)*a.scale+3)+'px',below=((6+bounds.bottom)*a.scale+3)+'px';if(nodes.above!==above){name.style.bottom=above;nodes.above=above;}if(nodes.below!==below){state.style.top=below;nodes.below=below;}};
const catActorLabels=(a,mood)=>{
 const halo=a.moodHalo;if(!halo)return;let nodes=catLabelNodes.get(halo);
 if(!nodes){halo.replaceChildren();const style='position:absolute;left:50%;transform:translateX(-50%);text-align:center;font:11px/1.25 system-ui;color:var(--primary-text-color,#263238);text-shadow:0 0 2px #fff,0 0 3px #fff;border-radius:3px;padding:1px 4px;width:max-content;max-width:190px;pointer-events:none;',name=document.createElement('span'),state=document.createElement('span'),moodText=document.createTextNode(''),actionText=document.createTextNode('');name.dataset.catName='';name.style.cssText=style+'font-weight:600;white-space:nowrap;';state.dataset.catState='';state.style.cssText=style;state.append(moodText,document.createElement('br'),actionText);halo.append(name,state);nodes={name,state,moodText,actionText};catLabelNodes.set(halo,nodes);}
 const {name,state,moodText,actionText}=nodes;
 catLabelPlace(a);
 const labels=a.config.debug_labels!==false,hidden=!labels||a.config.debug_names!==true;if(name.hidden!==hidden)name.hidden=hidden;if(state.hidden===labels)state.hidden=!labels;const color=catMoodTextColors[mood.label]||catMoodTextColors.balanced;if(nodes.color!==color.text){name.style.color=state.style.color=color.text;name.style.backgroundColor=state.style.backgroundColor=`rgba(${color.rgb},0.12)`;nodes.color=color.text;}const title=a.config.name||a.ownerKey||'Cat';if(name.textContent!==title)name.textContent=title;const action=catActorAction(a),m=title;if(moodText.nodeValue!==m)moodText.nodeValue=m;if(actionText.nodeValue!==action){actionText.nodeValue=action;a.setAttribute('data-action-label',action);}
};
window.pixelCatLabelsV1={action:catActorAction,update:catActorLabels,place:catLabelPlace,visible:debugVisible,colors:catMoodTextColors};
// Reorganize existing controls without replacing their action handlers.
const debugStats=values=>{if(!values.length)return {mean:0,p95:0};const sorted=[...values].sort((a,b)=>a-b);return {mean:values.reduce((a,b)=>a+b,0)/values.length,p95:sorted[Math.ceil(sorted.length*.95)-1]};};
const catDebugSetup=(a,owners)=>{
 window.pixelCatScrollV1?.attach(a);
 if(window.pixelCatMonitorV1){window.pixelCatMonitorV1.owners=owners;window.pixelCatMonitorV1.diagnostics?.attach(a);}
 const root=a.shadowRoot,outer=root?.querySelector?.('details');if(outer?.tagName!=='DETAILS')return false;
 const section=(title,open=false)=>{const d=document.createElement('details'),s=document.createElement('summary');s.textContent=title;d.append(s);d.open=open;d.setAttribute('name','cat-menu');outer.append(d);return d;};
 const title=outer.querySelector('summary');title.textContent='Cat controls & diagnostics';
 const host=root.querySelector('.cat-debug-host')||document.createElement('div');host.hidden=a.config.show_controls===false;host.style.cssText='position:relative;height:26px;z-index:0';if(outer.parentElement!==host){outer.before(host);host.append(outer);}outer.style.cssText='position:absolute;left:0;right:0;top:0;margin:0;max-height:min(70vh,600px);overflow:auto;scrollbar-gutter:stable';outer.classList.add('cat-debug-panel');const card=root.querySelector('ha-card');if(card)card.style.overflow='visible';
 outer.addEventListener('toggle',e=>{if(e.target!==outer)return;host.style.zIndex=outer.open?'100':'0';if(outer.open)for(const [b,entry]of owners())if(b!==a&&entry.root===a.root){const other=b.shadowRoot?.querySelector('details');if(other)other.open=false;}});
 const labels=[...outer.querySelectorAll(':scope > label')],visit=outer.querySelector('.visit')?.parentElement,report=outer.querySelector('.surface-report')?.parentElement,mood=outer.querySelector('.mood-controls'),props=outer.querySelector('.dashboard-prop-controls'),diagnostics=outer.querySelector('.diagnostics'),preview=outer.querySelector('[aria-label="Preview refined action"]'),previewButton=preview?.nextElementSibling,canvas=outer.querySelector('.gallop-preview');
 const help=(parent,text)=>{const p=document.createElement('p');p.className='cat-menu-help';p.textContent=text;parent.append(p);return p;};
 const rename=(label,text)=>{if(!label)return;const input=label.querySelector('input');if(input)label.replaceChildren(input,document.createTextNode(text));};
 const hidden=document.createElement('div');hidden.hidden=true;outer.append(hidden);
 const combine=(parent,label,buttons,buttonText)=>{const row=document.createElement('div'),select=document.createElement('select'),button=document.createElement('button');row.className='cat-menu-row';select.setAttribute('aria-label',label);for(const [i,b]of buttons.entries()){const option=document.createElement('option');option.value=i;option.textContent=b.textContent;select.append(option);hidden.append(b);}button.textContent=buttonText;button.onclick=()=>buttons[Number(select.value)]?.click();row.append(select,button);parent.append(row);};
 help(outer,'Session controls. Use Edit card to save defaults.');
 const display=section('Display & overlays');
 for(const [key,text,value]of [['debug_labels','Name & action below cat',a.config.debug_labels!==false],['debug_names','Extra name above cat',a.config.debug_names===true]]){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=value;input.setAttribute('aria-label',text);input.onchange=()=>{a.config[key]=input.checked;a.moodDebugAt=0;a.renderMoodDebug(performance.now());};label.append(input,document.createTextNode(text));display.append(label);}
 const glow=mood?.querySelector('[data-mood-glow]')?.parentElement;if(glow)display.append(glow);
 const overlayNames={surfaces:'Walking supports',verticalSurfaces:'Card outlines & grip areas',paths:'Routes & leap arcs',pois:'Destination points'};
 for(const label of labels){const input=label.querySelector('[data-debug]');if(input){rename(label,overlayNames[input.dataset.debug]||label.textContent);display.append(label);}}
 help(display,'Cyan outlines follow card borders; walking supports can be inset. Purple areas fit a grip; green tops fit a landing.');
 const geometry=section('Travel & climbing');geometry.dataset.catUi='travel';if(visit)geometry.append(visit);
 const homeReset=visit?.querySelector('[data-action="reset"]');
 const climb=document.createElement('div');climb.dataset.catUi='climbing';geometry.append(climb);
 for(const [key,text]of [['card_climbing','Climb visible cards (experimental)'],['native_vertical_surfaces','Scratch card borders (experimental)']]){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=a.config[key]===true;input.setAttribute('aria-label',text);input.onchange=()=>{a.config[key]=input.checked;window.pixelCatCardClimbV1?.controls(a);a.invalidate();};label.append(input,document.createTextNode(text));climb.append(label);}
 window.pixelCatCardClimbV1?.controls(a);
 help(climb,'Enable card climbing to try a wall transfer while this cat is resting. Normal routes remain preferred; overlays show usable grips and landing tops.');
 const drop=outer.querySelector('[data-action="drop"]');if(drop)geometry.append(drop);
 for(const label of labels.filter(l=>!display.contains(l)&&!l.querySelector('select')))geometry.append(label);
 const play=section('Play & props'),playButtons=[outer.querySelector('[data-action="play"]'),...[...props?.querySelectorAll('button')||[]].filter(b=>['Bat a ball','Hunt a toy'].includes(b.textContent))].filter(Boolean);
 if(playButtons.length)combine(play,'Play invitation',playButtons,'Invite play');
 if(props){play.append(props);const buttons=[...props.querySelectorAll('button')].filter(b=>b.textContent.startsWith('Spawn '));if(buttons.length)combine(props,'Prop to spawn',buttons,'Spawn prop');const clear=[...props.querySelectorAll('button')].find(b=>b.textContent==='Clear props');if(clear)clear.textContent='Clear shared props';help(play,'Shared props and moving-mouse settings affect this dashboard. Cats choose whether to join play.');}
 const actions=section('Animation preview');if(preview)actions.append(preview,previewButton,canvas);
 for(const label of labels.filter(l=>l.querySelector('select')&&!display.contains(l)))actions.append(label);
 help(actions,'Preview a pose or contact sequence on this cat. Walking options change playback, not its personality.');
 if(mood){mood.setAttribute('name','cat-menu');mood.querySelector('summary').textContent='Behaviour & mood';outer.append(mood);const oldHelp=mood.querySelector('p');if(oldHelp)oldHelp.textContent='Sliders hold this cat’s mood. Resume natural drift to release them. Landing tests offer a cue, not a forced hop.';}
 if(mood&&a.config.interaction_behaviour){const layer=a.decisionLayer(),traits=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Temperament';traits.append(summary);for(const key of ['boldness','sociability','curiosity','patience']){const label=document.createElement('label'),input=document.createElement('input');label.textContent=key+' ';input.type='range';input.min=0;input.max=1;input.step=.05;input.value=layer.traits[key];input.setAttribute('aria-label','Temperament '+key);input.oninput=()=>{layer.traits[key]=Number(input.value);a.config.temperament={...layer.traits};};label.append(input);traits.append(label);}mood.append(traits);}
 const evidence=section('Diagnostics');a.debugPanelRefs={outer,evidence};if(diagnostics)evidence.append(diagnostics);if(report){report.querySelector('summary').textContent='Detailed surface report';evidence.append(report);}const decisions=mood?.querySelector('.decision-readout');if(decisions){const group=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Recent decisions';group.append(summary,decisions);evidence.append(group);}if(homeReset){homeReset.textContent='Reset this cat to home';evidence.append(homeReset);}
 const label=document.createElement('label'),toggle=document.createElement('input');toggle.type='checkbox';toggle.checked=!!a.config.debug_performance;toggle.dataset.performance='';toggle.onchange=()=>{a.config.debug_performance=toggle.checked;a.performanceSamples=[];a.performanceLast=null;a.performanceReadAt=0;};label.append(toggle,document.createTextNode('Live performance'));const readout=document.createElement('pre');readout.className='performance-readout';readout.setAttribute('aria-live','off');readout.style.cssText='font-size:10px;white-space:pre-wrap';const reset=document.createElement('button');reset.textContent='Reset performance sample';reset.onclick=()=>{a.performanceSamples=[];a.performanceLast=null;a.performanceReadAt=0;};evidence.prepend(label,reset,readout);
 const style=document.createElement('style');style.textContent='.cat-debug-panel>summary{position:sticky;top:0;background:var(--ha-card-background,var(--card-background-color,#fff));z-index:1}.cat-debug-panel button:disabled{opacity:.5;cursor:default}.cat-debug-panel summary{padding:7px 0;cursor:pointer}.cat-debug-panel label{display:flex;align-items:center;gap:7px;margin:8px 0}.cat-debug-panel input[type=checkbox]{width:17px;height:17px;flex:none}.cat-debug-panel button,.cat-debug-panel select{min-height:32px;box-sizing:border-box}.cat-menu-row{display:flex;gap:5px;flex-wrap:wrap}.cat-menu-row select{flex:1;min-width:0}.cat-menu-help{font-size:11px;line-height:1.4;opacity:.75;margin:7px 0}.cat-debug-panel[open]{padding:8px;background:var(--ha-card-background,var(--card-background-color,#fff));border:1px solid var(--divider-color,#bbb);border-radius:7px;box-shadow:0 5px 18px #0004}.cat-debug-panel details{padding:7px 0;border-top:1px solid var(--divider-color,#ddd)}.cat-debug-panel select{max-width:100%}.cat-debug-panel pre{overflow:auto;max-height:180px}.decision-readout{background:var(--secondary-background-color,#eee);padding:6px;border-radius:5px}';root.append(style);
 const view=document.createElement('details'),viewTitle=document.createElement('summary');viewTitle.textContent='Whole-dashboard test controls';view.append(viewTitle);const count=document.createElement('select');count.setAttribute('aria-label','Running cats in this view');const sizes=[...new Set([1,2,5,10,20,[...owners()].filter(([b,e])=>e.root===a.root&&b.active).length])].filter(n=>n>0);for(const n of sizes){const option=document.createElement('option');option.value=n;option.textContent=n+' running cats';count.append(option);}const running=[...owners()].filter(([b,e])=>e.root===a.root&&b.active&&!b.paused&&!b.suspended&&!b.stranded).length;if(running>0&&!sizes.includes(running)){const o=document.createElement('option');o.value=running;o.textContent=running+' running cats';count.append(o);}count.value=String(running||1);const apply=document.createElement('button');apply.textContent='Set running count';apply.onclick=()=>{const peers=[...owners()].filter(([b,e])=>e.root===a.root&&b.active);for(const [i,[b]]of peers.entries()){b.social?.finish('view test control');b.paused=i>=Number(count.value);b.performanceSamples=[];b.performanceLast=null;b.performanceReadAt=0;const button=b.shadowRoot.querySelector('[data-action="pause"]');if(button)button.textContent=b.paused?'Resume':'Pause';}};const sampleAll=document.createElement('button');sampleAll.textContent='Sample all cats in view';sampleAll.onclick=()=>{for(const [b,e]of owners())if(e.root===a.root&&b.active){b.config.debug_performance=true;b.performanceSamples=[];b.performanceLast=null;b.performanceReadAt=0;const input=b.shadowRoot.querySelector('[data-performance]');if(input)input.checked=true;}};view.append(count,apply,sampleAll);evidence.append(view);const note=document.createElement('small');note.textContent='View test controls affect every cat on this page. Paused cats remain mounted; FPS includes their idle overhead.';view.append(note);
 if(!a.debugTickOriginal){a.debugTickOriginal=a.tick.bind(a);a.tick=t=>{const enabled=a.config.debug_performance,start=enabled?performance.now():0;try{return a.debugTickOriginal(t);}finally{if(enabled&&a.active&&!a.paused&&!a.suspended&&!a.stranded&&!document.hidden){const frame=a.performanceLast===null||a.performanceLast===undefined?0:t-a.performanceLast;a.performanceLast=t;if(frame>0&&frame<1000){const sample={frame,cost:performance.now()-start,decision:a.decisionCost||0};a.performanceSamples||=[];a.performanceSamples.push(sample);if(a.performanceSamples.length>600)a.performanceSamples.shift();}}else a.performanceLast=null;
   if(a.debugPanelRefs?.outer.open&&a.debugPanelRefs?.evidence.open&&t>=(a.performanceReadAt||0)){a.performanceReadAt=t+1000;const node=a.shadowRoot.querySelector('.performance-readout');if(node){if(!enabled)node.textContent='Off · enable to collect foreground frames.';else{const samples=a.performanceSamples||[],frame=debugStats(samples.map(s=>s.frame)),cost=debugStats(samples.map(s=>s.cost)),decision=debugStats(samples.map(s=>s.decision)),peers=[...owners()].filter(([b,e])=>e.root===a.root&&b.active),running=peers.filter(([b])=>!b.paused&&!b.suspended&&!b.stranded),measured=running.filter(([b])=>b.config.debug_performance&&b.performanceSamples?.length),total=measured.reduce((n,[b])=>n+b.performanceSamples.reduce((sum,s)=>sum+s.cost,0)/b.performanceSamples.length,0);node.textContent=`${samples.length}/600 foreground samples · ${frame.mean?(1000/frame.mean).toFixed(1):'—'} FPS\nFrame mean / p95: ${frame.mean.toFixed(2)} / ${frame.p95.toFixed(2)} ms\nThis controller: ${cost.mean.toFixed(3)} / ${cost.p95.toFixed(3)} ms\nDecision + perception: ${decision.mean.toFixed(3)} / ${decision.p95.toFixed(3)} ms\n${running.length}/${peers.length} cats running · ${measured.length} sampled\nSum of sampled controller means: ${total.toFixed(3)} ms\nPaused/hidden frames excluded. FPS includes browser scheduling.`;}}}
  }};}
 return true;
};
window.pixelCatDebugV1=catDebugSetup;

// Mood labels and optional glow; DOM work stays cached and throttled.
window.pixelCatLabelsV1.render=function(t){
 if(typeof document==='undefined')return;
    if(!this.config.debug_mood&&this.config.debug_labels===false){this.moodHalo?.remove();this.moodHalo=null;}else if(this.svg&&this.layer){
      if(!this.moodHalo){const halo=document.createElement('div');halo.dataset.moodActor=this.ownerKey;halo.style.cssText=`position:absolute;left:0;top:0;width:${36*this.scale}px;height:${36*this.scale}px;pointer-events:none;border-radius:50%;`;this.layer.insertBefore(halo,this.svg);this.moodHalo=halo;}
      this.moodHalo.style.transform=this.svg.style.transform+` translate(${-6*this.scale}px,${-6*this.scale}px)`;
      window.pixelCatLabelsV1?.place(this);
    }
    if(!this.mood&&!this.config.debug_mood&&this.config.debug_labels===false)return;if(t<(this.moodDebugAt||0))return;this.moodDebugAt=t+200;
    const m=this.ensureMood().view(),text=`${m.label} · P ${m.values.playfulness.toFixed(2)} S ${m.values.sleepiness.toFixed(2)} A ${m.values.alertness.toFixed(2)} · ${m.held?'held':'drifting'}`;
    if(this.moodHalo){const background=this.config.debug_mood?`radial-gradient(ellipse,rgba(${m.color},${m.strength}) 0%,rgba(${m.color},0) 70%)`:'none';if(this.moodHalo.style.background!==background)this.moodHalo.style.background=background;window.pixelCatLabelsV1?.update(this,m);}
    this.setAttribute('data-mood',JSON.stringify(m));const readout=this.shadowRoot?.querySelector('.mood-readout');if(readout&&window.pixelCatLabelsV1?.visible(readout)){readout.textContent=text+' · seed '+m.seed+' · '+m.lastEvent;for(const input of this.shadowRoot.querySelectorAll('[data-mood]'))if(input!==document.activeElement)input.value=m.values[input.dataset.mood];}
    const decisions=this.shadowRoot?.querySelector('.decision-readout');if(decisions&&window.pixelCatLabelsV1?.visible(decisions))decisions.textContent=(this.getAttribute('data-encounters')||'')+'\n'+(this.social?.trace||[]).slice(0,5).map(e=>JSON.stringify(e)).join('\n');
  };

})();
