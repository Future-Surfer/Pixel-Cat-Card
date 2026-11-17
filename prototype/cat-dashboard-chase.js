// Advance voluntary chase legs at grounded decisions using the standard route player.
(() => {
const MAX_TRANSFERS = 2;
const same = (a,b) => a?.el && a.el===b?.el && Math.abs(a.top-b.top)<2;
const broad = s => s?.el && s.el.isConnected!==false && !s.narrow && !s.bed && !s.foodOwner &&
 Number.isFinite(s.min) && Number.isFinite(s.max) && s.min<=s.max;
const active = a => a?.active && a.config.chasing!==false && a.config.social_behaviour &&
 a.config.interaction_behaviour && !a.paused && !a.suspended && !a.layoutPaused && !a.stranded &&
 !a.userHeld && !a.command && !a.goal && !a.previewPose && !a.play && !a.playRequested &&
 !a.toyHunt && !a.toyHuntRequested && !a.mouthAction && !a.recallPending;
const settled = a => !a.motion && !a.climb && !a.route?.length;
const snapped = (s,x,scale) => Math.max(s.min,Math.min(s.max,Math.round(x/scale)*scale));

function plan(a,surface,x) {
 if(!broad(surface)||!a.social.clear(surface,x))return null;
 // Point routes validate the exact takeoff and landing and use the existing bounded search.
 const steps=window.pixelCatPointRoutesV1?.plan(a,surface,x);
 if(!steps?.length||steps.length>4||steps.filter(s=>s.fromId!==s.surface.id).length!==1){
  a.social.log('chase route needs one checked transfer',{surface:surface.id,steps:steps?.length||0});
  return null;
 }
 for(const step of steps)if(!a.social.clear(step.surface,step.x))return null;
 if(!a.pathTo(a.support,surface)&&!window.pixelCatPointRoutesV1.plan(a,a.support,a.x,surface,x)){
  a.social.log('chase route has no return',{surface:surface.id});
  return null;
 }
 return {surface,x,steps};
}

function runnerPlan(runner,chaser,seenChaser) {
 const origin=runner.support,scale=runner.scale;
 const direction=seenChaser?Math.sign(runner.x-seenChaser.x)||runner.facing:runner.facing;
 const candidates=[];
 for(const s of runner.surfaces||[]){
  if(!broad(s)||s.internal||same(s,origin))continue;
  const gap=36*Math.max(scale,chaser.scale);
  if(s.max-s.min<gap)continue;
  const preferred=runner.x+direction*40*scale;
  const x=snapped(s,direction>0?Math.max(s.min+gap,preferred):Math.min(s.max-gap,preferred),scale);
  const dist=Math.hypot(x-runner.x,s.top-origin.top);
  if(dist<=100*scale&&direction*(x-runner.x)>=8*scale)candidates.push({s,x,dist});
 }
 candidates.sort((a,b)=>a.dist-b.dist);
 if(!candidates.length)runner.social.log('chase has no nearby card with braking room');
 for(const {s,x} of candidates.slice(0,2)){
  const choice=plan(runner,s,x);
  if(choice)return choice;
 }
 return null;
}

function commit(ep,a,choice,t) {
 const route=choice.steps;
 for(const step of route)step.chaseLeg=true;
 ep.dashboard.legs.set(a,{surface:choice.surface,x:choice.x,offset:choice.x-choice.surface.left});
 a.urgency='interested';
 a.route=route;
 a.deadline=t+1000;
 a.social.log('chase card route',{surface:choice.surface.id});
}

function groundedRouteValid(a) {
 if(a.motion||a.climb||!a.route?.length)return true;
 const next=a.route[0],surface=next.surface;
 if(!next.chaseLeg)return false;
 if(next.kind==='walk'&&same(a.support,surface))return a.social.corridor(surface,next.x);
 return a.social.clear(surface,next.x);
}

const report=(view,key)=>view.counts[key]=(view.counts[key]||0)+1;
const legFor=a=>a.social?.episode?.dashboard?.legs.get(a)||focusActors.get(a)?.leg;
const focusActors=new WeakMap();

function endFocusLeg(a,state){
 if(!state.leg)return;
 a.route=a.route?.filter(step=>!step.chaseFocus)||[];
 state.leg=null;
}

function focusTravel(a,state,choice,t,kind){
 for(const step of choice.steps)step.chaseFocus=true;
 state.leg={surface:choice.surface,offset:choice.x-choice.surface.left};
 a.route=choice.steps;
 a.urgency='interested';
 a.deadline=t+1500;
 a.social.log(kind,{surface:choice.surface.id});
 report(state.view,kind);
}

window.pixelCatDashboardChaseV1={
 detach(a){
  const state=focusActors.get(a);
  if(!state)return;
  endFocusLeg(a,state);
  if(state.looking&&a.labPose==='stand')a.labPose=null;
  state.view.chaseActors.delete(a);
  focusActors.delete(a);
 },
 resetFocus(view){
  for(const a of view.chaseActors||[])if(focusActors.get(a)?.view===view)this.detach(a);
  view.chaseActors?.clear();
 },
 focus(a,t,view){
  if(!active(a)||!broad(a.support)){
   const state=focusActors.get(a);
   if(state?.view===view)endFocusLeg(a,state);
   return 0;
  }
  const layer=a.decisionLayer?.();
  if(!layer||layer.episode)return 0;
  let state=focusActors.get(a);
  if(state?.view!==view){
   this.detach(a);
   state={view,seen:new Map(),next:t+a.ensureMood().random()*900};
   focusActors.set(a,state);
   (view.chaseActors??=new Set()).add(a);
  }
  if(state.leg){
   if(!a.motion&&!a.climb&&a.route?.length){
    const step=a.route[0];
    if(!step.chaseFocus||!layer.clear(step.surface,step.x))endFocusLeg(a,state);
   }else if(settled(a)){
    if(a.support.id===state.leg.surface.id)report(view,'Crossings');
    endFocusLeg(a,state);
   }
  }
  if(t<(state.sampleAt||0))return 0;
  state.sampleAt=t+200;
  const observations=[];
  for(const m of layer.memory.values()){
   if(!layer.visible?.has(m.id)||layer.clock-m.at>450)continue;
   const previous=state.seen.get(m.id);
   if(previous&&previous.at<m.at){
    const crossed=previous.surface!==m.surface||Math.abs(previous.surfaceTop-m.surfaceTop)>=2;
    if(crossed||Math.abs(m.x-previous.x)>=2*a.scale)state.lastMotion={m,previous,crossed,until:t+1200};
   }
   state.seen.set(m.id,m);
   observations.push(m);
  }
  for(const [id,m] of state.seen)if(layer.clock-m.at>2500)state.seen.delete(id);
  if(!settled(a)||t<state.next)return 0;
  const mood=a.ensureMood(),r=mood.random();
  state.next=t+1500+1200*mood.random();
  const cue=state.lastMotion;
  if(cue?.until>=t&&layer.visible?.has(cue.m.id)){
   const {m,previous,crossed}=cue;
   const direction=Math.sign(m.x-a.x)||a.facing;
   const gap=30*Math.max(a.scale,m.scale),distance=Math.abs(m.x-a.x);
   const away=(m.x-previous.x)*direction>0;
   if((crossed||away)&&distance>=gap&&r<.75){
    const surface=a.surfaces.find(s=>s.el===m.surface&&Math.abs(s.top-m.surfaceTop)<2);
    if(broad(surface)){
     const x=snapped(surface,m.x-direction*gap,a.scale);
     if(Math.abs(m.x-x)>=gap){
      if(!same(surface,a.support)){
       const choice=plan(a,surface,x);
       if(choice){focusTravel(a,state,choice,t,'Following');return 0;}
       report(view,'No safe route');
      }else if(Math.abs(x-a.x)>=5*a.scale&&layer.corridor(surface,x)){
       a.urgency='interested';
       a.moveTo(x,surface.top,0,'walk',surface,t);
       report(view,'Following');
       return 0;
      }
     }
    }
   }
   if(!crossed&&a.support.el===m.surface&&Math.abs(a.support.top-m.surfaceTop)<2&&distance>=gap+8*a.scale&&distance<=62*a.scale&&r>=.75){
    const surface=a.support;
    const x=snapped(surface,m.x-direction*gap,a.scale);
    if(Math.abs(x-m.x)>=gap&&layer.corridor(surface,x)&&a.moveTo(x,surface.top,0,'jump',surface,t)!==false){
     report(view,'Pounced');
     return 0;
    }
   }
   if(!away&&distance<=65*a.scale&&r<.38){
    a.facing=direction;
    a.labPose='stand';
    state.looking=true;
    if(a.idle)a.idle.poseUntil=t;
    a.deadline=t+1200;
    report(view,'Turned to watch');
    return 0;
   }
  }
  if(r<.48){
   const neighbour=observations.find(m=>Math.abs(m.x-a.x)<65*a.scale);
   const choice=runnerPlan(a,{scale:neighbour?.scale||a.scale},neighbour);
   if(choice){focusTravel(a,state,choice,t,'Running on');return 0;}
  }
  return 0;
 },
 reserved(other,surface,overlap) {
  const leg=legFor(other);
  if(!leg)return false;
  const current=other.surfaces?.find(s=>s.id===leg.surface.id);
  if(!same(surface,current))return false;
  const x=current.left+leg.offset;
  return overlap(x,x+24*other.scale);
 },
 release(a,ep) {
  if(!ep.dashboard)return;
  a.social.watchUntil=0;
  ep.dashboard.legs.delete(a);
  if(a.route?.some(s=>s.chaseLeg))a.route=a.route.filter(s=>!s.chaseLeg);
 },
 advance(layer,t) {
  const ep=layer.episode,a=layer.actor,b=ep.runner;
  if(a.config.dashboard_chasing!==true||b.config.dashboard_chasing!==true){
   if(!ep.dashboard||ep.dashboard.stage==='local')return false;
   layer.finish('dashboard chasing disabled');
   return true;
  }
  const state=ep.dashboard??={legs:new Map(),transfers:0,stage:'local',tryAt:0};
  if(state.stage==='local'){
   if(ep.stage!=='run'||state.transfers>=MAX_TRANSFERS||layer.clock<state.tryAt||
      a.climb||a.route?.length||!settled(b)||!active(a)||!active(b)||!broad(a.support)||!same(a.support,b.support))return false;
   state.tryAt=Infinity;
   const mood=b.ensureMood();
   if(mood.random()>=.25+.55*mood.values.playfulness*(1-mood.values.sleepiness))return false;
   const choice=runnerPlan(b,a,b.social.memory.get(a.ownerKey));
   if(!choice){layer.log('chase card route unavailable');return false;}
   state.stage='runner';
   state.transfers++;
   commit(ep,b,choice,t);
   return true;
  }
  if(!active(a)||!active(b)||a.root!==b.root||
     !groundedRouteValid(a)||!groundedRouteValid(b)){
   layer.finish('cross-card chase interrupted');
   return true;
  }
  if(state.stage==='runner'&&settled(b)){
   const leg=state.legs.get(b);
   state.legs.delete(b);
   if(b.support?.id!==leg?.surface.id){layer.finish('runner did not reach the next card');return true;}
   state.stage='observe';
   state.lookUntil=layer.clock+1300;
   layer.watchUntil=state.lookUntil;
   if(a.idle)a.idle.poseUntil=t;
  }
  if(state.stage==='observe'&&settled(a)){
   const sight=layer.memory.get(b.ownerKey);
   const seen=sight&&layer.visible?.has(sight.id)&&layer.clock-sight.at<=450;
   const candidates=seen?a.surfaces.filter(s=>s.el===sight.surface&&Math.abs(s.top-sight.surfaceTop)<2):[];
   const destination=candidates.find(s=>s.id===sight.supportId)||candidates[0];
   if(!destination||same(destination,a.support)){
    if(layer.clock>=state.lookUntil)layer.finish('lost sight at the card edge');
    return true;
   }
   const gap=30*Math.max(a.scale,b.scale),direction=Math.sign(sight.x-a.x)||a.facing;
   const x=snapped(destination,sight.x-direction*gap,a.scale);
   const choice=Math.abs(x-sight.x)>=gap&&plan(a,destination,x);
   if(!choice){layer.finish('no clear chase landing');return true;}
   state.stage='follow';
   commit(ep,a,choice,t);
  }
  if(state.stage==='follow'&&settled(a)){
   const leg=state.legs.get(a);
   state.legs.delete(a);
   if(a.support?.id!==leg?.surface.id){layer.finish('chaser did not reach the next card');return true;}
   layer.log('chase card transfer completed',{surface:a.support.id});
   state.stage='local';
   state.tryAt=layer.clock+650;
   ep.expires=Math.min(ep.expires,layer.clock+3000);
   return false;
  }
  return true;
 }
};
})();
