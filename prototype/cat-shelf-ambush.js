// Nearby perches may be level, slightly above, or a small drop below. This is
// one committed local pounce, never general cross-card pursuit.
window.pixelCatShelfAmbushV1={
 options(layer){const a=layer.actor;if(!layer.enabled()||!a.config.social_behaviour||!layer.available(a)||layer.episode||a.support?.home||a.support?.narrow)return [];const out=[];
  const add=(target,m,prop)=>{if(!m||layer.clock-(prop?m.observedAt:m.at)>500)return;const surface=a.surfaces.find(s=>s.el===m.surface&&Math.abs(s.top-(prop?m.top:m.surfaceTop))<2&&!s.home&&!s.narrow),drop=surface&&surface.top-a.support.top;
   if(!surface||surface.id===a.support.id||surface.el===a.support.el&&Math.abs(drop)<2||drop< -4*a.scale||drop>8*a.scale||!a.reachable(a.support,surface)||!a.pathTo(a.home,surface))return;
   const dir=Math.sign((prop?m.x:m.x+12*m.scale)-(a.x+12*a.scale))||a.facing,x=Math.round((prop?m.x-a.toyPaw(dir)*a.scale:m.x-dir*(24*Math.max(a.scale,m.scale)+4*Math.max(a.scale,m.scale)))/a.scale)*a.scale;
   if(Math.abs(x-a.x)<8*a.scale||Math.abs(x-a.x)>60*a.scale||!layer.clear(surface,x,prop?[]:[target]))return;
   const sneak=Math.max(a.support.min,Math.min(a.support.max,a.x+dir*8*a.scale));if(Math.abs(sneak-a.x)<2*a.scale||!layer.corridor(a.support,sneak))return;
   out.push({target,observed:{...m},surface,x,sneak,direction:dir,prop:!!prop});
  };
  for(const m of layer.memory.values()){const b=layer.peers().find(b=>b.ownerKey===m.id);if(!b||!layer.visible?.has(m.id)||!layer.available(b)||layer.scene.has(b)||!b.config.interaction_behaviour||!layer.world.ready(a,b))continue;add(b,m,false);}
  for(const m of layer.propMemory.values()){const p=a.propScene?.props.find(p=>p.id===m.id);if(!p||!['ball','toy_mouse'].includes(p.asset.id)||p.claimedBy||p.carrier||m.falling||p.cooldownUntil>a.propScene.time)continue;if(p.asset.id==='toy_mouse'&&(m.moving||m.direction!==Math.sign(m.x-(a.x+12*a.scale))))continue;add(p,m,true);}
  return out;
 },
 decide(layer,t){if(layer.clock<(layer.nextShelf||0))return false;layer.nextShelf=layer.clock+15000;const a=layer.actor,r=()=>a.ensureMood().random();if(r()>(.04+.12*a.ensureMood().values.playfulness)*(1-.7*a.ensureMood().values.sleepiness))return false;const options=this.options(layer);return options.length?this.start(layer,options[Math.floor(r()*options.length)],t):false;},
 start(layer,o,t){const a=layer.actor;if(!this.options(layer).some(p=>p.target===o.target))return false;const ep={...o,kind:'shelf-ambush',interaction:true,initiator:a,participants:o.prop?[a]:[a,o.target],registry:layer.scene,stage:'sneak',expires:layer.clock+14000};
  layer.episode=ep;layer.scene.set(a,ep);if(o.prop)o.target.claimedBy=a.ownerKey;else{layer.scene.set(o.target,ep);layer.world.cool(a,o.target);}a.facing=o.direction;a.urgency='relaxed';a.deadline=t+15000;a.moveTo(o.sneak,a.support.top,0,'walk',a.support,t,'sneak');layer.log('small-drop stalk',{target:o.prop?o.target.id:o.target.ownerKey});return true;
 },
 advance(layer,t,art){const a=layer.actor,ep=layer.episode,b=ep.target;
  if(!layer.enabled()||a.goal||a.command||a.previewPose||a.userHeld||a.play||a.mouthAction||layer.clock>=ep.expires||!a.active||a.paused||a.suspended){layer.finish('small-drop interrupted');return;}
  if(ep.prop?(!a.propScene?.props.includes(b)||b.claimedBy!==a.ownerKey):(!b.active||!layer.peers().includes(b)||ep.stage!=='land'&&!layer.available(b))){layer.finish('small-drop target removed or busy');return;}
  if(a.motion)return;
  if(ep.stage==='land'){
   if(ep.prop){const f=layer.frame;if(!f?.placement){layer.finish('small-drop contact unknown');return;}const c=art.leapAnchors[ep.jumpKind].at(-1).point,point={x:f.placement.x+((a.facing>0?c[0]:23-c[0])+.5)*a.scale,y:f.placement.top+(c[1]+.5)*a.scale};
    const hit=b.asset.id==='ball'?a.propScene.strikeBall(b.id,a.ownerKey,point,a.facing,.2):a.propScene.touchMouse(b.id,a.ownerKey,point,a.scale);layer.log(hit?'small-drop toy contact':'small-drop toy miss',{target:b.id});if(hit&&a.ensureMood().random()<.45)window.pixelCatMouthV1?.attach(a,b,t,art,true);
   }else if(a.support.el===b.support?.el&&Math.abs(a.y-b.y)<2&&Math.abs(a.x-b.x)<=34*Math.max(a.scale,b.scale)){layer.socialCue(ep,b,{x:a.x+12*a.scale,y:a.y},t,'Nearby play landing');return;}
   layer.finish('small-drop landed');a.deadline=t+2000;return;
  }
  const m=ep.prop?layer.propMemory.get(b.id):layer.memory.get(b.ownerKey);if(!m||layer.clock-(ep.prop?m.observedAt:m.at)>600||Math.abs(m.x-ep.observed.x)>4*a.scale){layer.finish('small-drop observation lost');return;}
  const s=a.surfaces.find(s=>s.id===ep.surface.id&&s.el===ep.surface.el);if(!s||s.top-a.support.top>8*a.scale||s.top-a.support.top< -4*a.scale){layer.finish('local-pounce support changed');return;}ep.x+=s.left-ep.surface.left;ep.surface=s;
  if(ep.stage==='sneak'&&art.idleSequences?.wiggle&&a.ensureMood().random()<.72){ep.stage='wiggle';ep.wait=layer.clock+600+500*a.ensureMood().random();a.idle=null;return;}
  if(ep.stage==='wiggle'&&layer.clock<ep.wait)return;
  if(!layer.clear(s,ep.x,ep.prop?[]:[b])||a.moveTo(ep.x,s.top,0,'jump',s,t)===false){layer.finish('small-drop landing unsafe');return;}ep.stage='land';ep.jumpKind=a.motion.jumpKind;layer.log('small-drop pounce committed',{target:ep.prop?b.id:b.ownerKey});
 },
 release(layer){const ep=layer.episode;if(ep.prop&&!ep.target.carrier&&ep.target.claimedBy===layer.actor.ownerKey){ep.target.claimedBy=null;ep.target.cooldownUntil=(layer.actor.propScene?.time||0)+30000;}layer.nextShelf=layer.clock+30000;}
};
