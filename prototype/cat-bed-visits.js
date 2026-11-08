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
