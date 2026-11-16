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

window.pixelCatDashboardChaseV1={
 reserved(other,surface,overlap) {
  const leg=other.social?.episode?.dashboard?.legs.get(other);
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
