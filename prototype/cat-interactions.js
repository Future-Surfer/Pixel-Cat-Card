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
const kitten=a=>window.pixelCatBehaviourV1?.stage(a)==='kitten';
const sleeping=(a,t)=>a.idle?.pose==='sleep'&&!a.motion&&t<a.idle.poseUntil;
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
 disturbanceChoice(cue){if(!this.enabled())return this.actor.ensureMood().landingChoice(window.pixelCatBehaviourV1?.choiceWeight(this.actor,'hop')??1);const a=this.actor,v=a.ensureMood().values,known=this.visible?.has(cue.source),gentle=cue.kind==='Gentle social pat',intensity=bounded(cue.intensity,1);if(cue.kind==='Companion woke')return 'hop';if(cue.kind==='Pounce beside sleeper')return a.ensureMood().random()<.8?'hop':'ignore';if(cue.kind==='Nearby high landing'){const behind=(cue.x-a.x-12*a.scale)*a.facing<0;return sampleDecision([{kind:'ignore',weight:.3+.7*v.sleepiness},{kind:'watch',weight:.6+.4*v.alertness},{kind:'hop',weight:(behind?3:1.4)*(.6+intensity)*(1-.3*this.traits.boldness)}],()=>a.ensureMood().random(),a).kind;}return sampleDecision([{kind:'ignore',weight:.6+v.sleepiness*(gentle?2.5:1.3)},{kind:'watch',weight:.5+v.alertness+this.traits.boldness},{kind:'hop',weight:(.25+1.1*v.alertness+.65*v.playfulness)*(1-.6*this.traits.boldness)*(known?.35:1)*(gentle?.2:1)*Math.max(.4,intensity)}],()=>a.ensureMood().random(),a).kind;}
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
  for(const [kind,list]of [['pat',pat],['ambush',ambush]])if(list.length){const target=list[Math.floor(r()*list.length)],m=target.observed,observedEye=worldGaze(m.frame.gaze,m.frame.placement,m.scale,m.frame.facing,110*m.scale),rear=observedEye.known&&!targetVisibility(observedEye,{x:a.x+12*a.scale,y:a.y-12*a.scale,width:20*a.scale,height:22*a.scale}).visible;const toyMemory=[...this.propMemory.values()].find(p=>p.carrier===target.target?.ownerKey&&this.clock-p.observedAt<300),toyInterest=toyMemory?(a.mouthState?.possessiveToy===toyMemory.id&&a.mouthState.clock<a.mouthState.possessiveUntil?2.3:1.5):1;options.push({...target,weight:toyInterest*(kind==='ambush'?(.25+1.8*v.playfulness)*(1-.7*v.sleepiness)*(m.pose==='sleep'&&kitten(a)?1.4*this.traits.boldness:rear?1.8:.5):(.2+v.playfulness)*this.traits.sociability)});}
  this.offerCuddle(options,v,r,t);
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
   if(kind==='ambush'&&(m.pose==='sleep'||b.idle?.pose==='sleep')&&kitten(a)&&this.traits.boldness<.45)continue;
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
  this.offerCuddle(options,v,r,t);
  const props=this.propOptions();if(props.length&&this.clock>=this.nextProp)options.push({...props[Math.floor(r()*props.length)],weight:(.2+v.playfulness)*this.traits.curiosity});
  const chosen=sampleDecision(options,r,a);if(chosen.kind==='ordinary')return super.decide(t);this.log('opportunity '+chosen.kind,{weights:options.map(o=>({kind:o.kind,weight:o.weight})),target:chosen.target?.ownerKey||chosen.id});return chosen.kind==='prop'?this.startProp(chosen,t):this.startSocial(chosen,t);
 }
 offerCuddle(options,v,random,t){
  const a=this.actor,s=a.support;
  if(!kitten(a)||this.clock<this.nextSocial||!s||s.home||s.narrow||!this.art().idleSequences?.sleep)return;
  const candidates=[];
  for(const b of this.peers()){
   const m=this.memory.get(b.ownerKey);
   if(m?.pose!=='sleep'||m.surface!==s.el||this.clock-m.at>700||!this.cuddlePartner(b,t)||!this.world.ready(a,b)||this.scene.has(b))continue;
   const x=Math.round((m.x+12*m.scale-12*a.scale)/a.scale)*a.scale;
   if(this.corridor(s,x,[b]))candidates.push({kind:'cuddle',target:b,surface:s,x,offset:x-s.left});
  }
  if(candidates.length)options.push({...candidates[Math.floor(random()*candidates.length)],weight:(.15+2*v.sleepiness)*this.traits.sociability});
 }
 cuddlePartner(b,t){
  const a=this.actor;
  return b.scale>a.scale&&b.config.social_behaviour&&b.config.interaction_behaviour&&this.available(b)&&sameSupport(a.support,b.support)&&sleeping(b,t)&&!b.social.episode;
 }
 advanceCuddle(ep,b,t){
  const a=this.actor,wasSleeping=ep.stage==='cuddled';
  if(!this.peers().includes(b)||!b.config.social_behaviour||!b.config.interaction_behaviour||!sameSupport(a.support,b.support)){this.finish('companion left');return;}
  const adultAsleep=sleeping(b,t),kittenAsleep=sleeping(a,t);
  if(wasSleeping&&(!adultAsleep||!kittenAsleep)){
   this.finish('cuddle ended');
   if(adultAsleep===kittenAsleep)return;
   const sleeper=kittenAsleep?a:b,waker=kittenAsleep?b:a;
   if(kittenAsleep)a.deadline=a.idle.poseUntil;
   if(this.available(sleeper)&&sleeper.ensureMood().random()<(kittenAsleep?.45:.25)){
    const cue=this.world.emit('Companion woke',{source:waker.ownerKey,x:waker.x+12*waker.scale,y:waker.y,intensity:.3});
    sleeper.receiveDisturbance?.(cue,t,false,'social');
   }
   return;
  }
  if(wasSleeping)return;
  if(!this.cuddlePartner(b,t)){this.finish('companion woke before arrival');return;}
  if(ep.stage==='settle')return;
  const x=ep.x;
  if(!this.corridor(ep.surface,x,[b])||Math.abs(b.x+12*b.scale-(x+12*a.scale))>3*a.scale){this.finish('cuddle spot changed');return;}
  if(a.motion)return;
  if(Math.abs(a.x-x)>3*a.scale){this.finish('cuddle approach ended elsewhere');return;}
  ep.stage='settle';a.facing=b.facing;a.idle=null;
 }
 startSocial(option,t){const a=this.actor,b=option.target;if(!this.enabled()||!this.peers().includes(b)||!this.available(a)||!this.available(b)||this.scene.has(a)||this.scene.has(b)||!this.world.ready(a,b)||!sameSupport(a.support,b.support)||!this.corridor(a.support,option.x,[b]))return false;
  if(option.kind==='cuddle'&&!this.cuddlePartner(b,t))return false;
  const ep={...option,registry:this.scene,interaction:true,initiator:a,participants:[a,b],stage:option.kind==='ambush'?'sneak':'approach',expires:this.clock+10000+8000*this.traits.patience,beats:0};this.episode=ep;this.scene.set(a,ep);this.scene.set(b,ep);this.world.cool(a,b);this.watchUntil=0;
  if(option.kind!=='ambush'){
   a.urgency='relaxed';
   if(Math.abs(option.x-a.x)>a.scale&&a.moveTo(option.x,a.support.top,0,'walk',a.support,t)===false){this.finish('approach rejected');return false;}
  }else this.sneakBeat(ep,t);
  this.encounterStats||={checks:0,opportunities:0,starts:0,acknowledgements:0};this.encounterStats.starts++;if(ep.kind!=='cuddle')a.ensureMood().experience('play');a.deadline=t+15000;this.log('begin '+ep.kind,{target:b.ownerKey});return true;
 }
 sneakBeat(ep,t){const a=this.actor,remaining=ep.x-a.x,step=Math.sign(remaining)*Math.min(Math.max(0,Math.abs(remaining)-12*a.scale),(ep.beats===0?10:6)*a.scale);if(Math.abs(step)<2*a.scale){ep.stage='check';ep.wait=this.clock+400;return;}a.urgency='relaxed';a.moveTo(a.x+step,a.support.top,0,'walk',a.support,t,'sneak');ep.beats++;}
 prepareIdle(idle,t){const ep=this.episode,a=this.actor;if(ep?.kind==='cuddle'&&ep.stage==='settle'&&idle.pose==='sleep'){ep.stage='cuddled';a.deadline=idle.poseUntil;ep.expires=this.clock+idle.poseUntil-t+500;}if((!ep||ep.kind==='company'&&ep.stage==='rest')&&!a.play&&!a.previewPose&&['loaf','sleep'].includes(idle.pose)){a.deadline=Math.max(a.deadline||0,idle.poseUntil);if(ep)ep.expires=Math.max(ep.expires,this.clock+idle.poseUntil-t);}if(ep?.interaction&&ep.initiator===a&&ep.stage==='stroke'&&idle.pose==='bat')idle.poseUntil=t+this.art().idleSequences.bat.durations.reduce((n,d)=>n+d,0)*Math.max(80,Number(a.config.idle_frame_ms)||250)/250;}
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
  const b=ep.target;
  if(ep.kind==='cuddle'){
   const s=a.surfaces.find(s=>sameSupport(s,ep.surface));
   if(!s){this.finish('support changed');return;}
   ep.surface=s;ep.x=s.left+ep.offset;return this.advanceCuddle(ep,b,t);
  }
  if(!this.peers().includes(b)||!b.config.interaction_behaviour||!this.available(b)||!sameSupport(a.support,b.support)){this.log('partner eligibility',{reason:this.unavailableReason(b),inView:this.peers().includes(b),enabled:!!b.config.interaction_behaviour,sameSupport:sameSupport(a.support,b.support)});this.finish('partner unavailable');return;}
  const s=a.surfaces.find(s=>sameSupport(s,ep.surface));if(!s){this.finish('support changed');return;}ep.surface=s;ep.x=s.left+ep.offset;
  if(!this.clear(s,ep.x,[b])){this.finish('landing slot occupied');return;}if(a.motion)return;
  const m=this.memory.get(b.ownerKey);if(ep.stage!=='land'&&(!m||this.clock-m.at>1200||Math.abs(m.x-ep.observed.x)>4*a.scale)){this.finish('observation lost / partner moved');return;}
  if(ep.stage==='approach'){if(Math.abs(a.x-ep.x)>3*a.scale){this.finish('approach ended elsewhere');return;}ep.stage='stroke';ep.wait=this.clock+3600;a.facing=ep.direction;a.idle=null;this.log('pat ready',{target:b.ownerKey});}
  else if(ep.stage==='stroke'&&this.clock>=ep.wait)this.finish(ep.struck?'pat complete':'pat missed');
  else if(ep.stage==='sneak'){if(ep.beats<3)this.sneakBeat(ep,t);else{ep.stage='check';ep.wait=this.clock+500;}}
  else if(ep.stage==='wiggle'&&this.clock>=ep.wait){ep.stage='check';ep.wait=this.clock;}
  else if(ep.stage==='check'&&this.clock>=ep.wait){if(!ep.wiggled&&this.art().idleSequences?.wiggle&&a.ensureMood().random()<.72){ep.wiggled=true;ep.stage='wiggle';ep.wait=this.clock+600+600*a.ensureMood().random();a.idle=null;return;}const eye=worldGaze(m.frame?.gaze,m.frame?.placement||{x:m.x,top:s.top-24*m.scale},m.scale,m.frame?.facing,100*m.scale),noticed=!(kitten(a)&&m.pose==='sleep')&&targetVisibility(eye,{x:a.x+12*a.scale,y:a.y-12*a.scale,width:20*a.scale,height:22*a.scale}).visible;
   if(a.ensureMood().random()<(noticed?.65:.18)){this.finish(noticed?'apparently noticed / disengage':'interest faded');a.deadline=t+2000;return;}
   if(!this.corridor(s,ep.x,[b])||a.moveTo(ep.x,s.top,0,'jump',s,t)===false){this.finish('unsafe pounce');return;}ep.stage='land';this.log('ambush pounce',{lastSeen:m.at});
  }else if(ep.stage==='land'){const close=nearbyPlayLanding(a,b);this.log(close?'nearby play landing':'ambush miss',{target:b.ownerKey});if(close)this.socialCue(ep,b,{x:a.x+12*a.scale,y:s.top},t,kitten(a)&&ep.observed.pose==='sleep'&&sleeping(b,t)?'Pounce beside sleeper':'Nearby play landing');else this.finish('pounce landed short');}
 }
 finish(reason){this.pendingImpact=null;const ep=this.episode;if(!ep?.interaction||ep.kind==='chase')return super.finish(reason);const participants=ep.participants||[this.actor];for(const a of participants){const registry=ep.registry||this.scene;if(registry.get(a)===ep)registry.delete(a);const layer=a.social;if(!layer)continue;if(layer.scene.get(a)===ep)layer.scene.delete(a);if(layer.episode!==ep)continue;layer.episode=null;layer.nextSocial=layer.clock+25000;layer.watchUntil=0;layer.log('end '+ep.kind,{reason});a.deadline=0;}
  if(ep.kind==='prop'){const p=this.actor.propScene?.props.find(p=>p.id===ep.id);if(p?.claimedBy===this.actor.ownerKey){p.claimedBy=null;p.cooldownUntil=this.actor.propScene.time+5000;p.lastInteractor=this.actor.ownerKey;p.availableToOthersAt=this.actor.propScene.time+1000;}}
 }
 restPose(){const observed=window.pixelCatObserverV1?.pose(this);if(observed)return observed;const ep=this.episode;if(ep?.interaction&&ep.kind!=='chase'){if(ep.initiator!==this.actor)return this.actor.idle?.pose||'sit';return ep.kind==='cuddle'&&['settle','cuddled'].includes(ep.stage)?'sleep':ep.stage==='wiggle'?'wiggle':ep.stage==='stroke'?'bat':ep.stage==='check'?'look':ep.stage==='watch'?'lookdown':'sit';}if(this.enabled()&&this.watchUntil>this.clock)return 'glance';return super.restPose();}
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
