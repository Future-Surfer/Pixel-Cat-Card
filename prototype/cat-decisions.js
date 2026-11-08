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
