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
const open=a=>active(a)&&settled(a)&&!a.bedInside&&!a.social?.episode;

function stagePair(a,b,view,t){
 const layer=a.social,scale=Math.max(a.scale,b.scale),source=a.support;
 const surface=a.surfaces.find(s=>same(s,b.support));
 if(!broad(surface)||surface.home||surface.max-surface.min<100*a.scale)return false;
 const direction=b.support.max-b.x>=b.x-b.support.min?1:-1;
 if(direction*((direction>0?b.support.max:b.support.min)-b.x)<14*b.scale)return false;
 const x=snapped(surface,b.x-direction*38*scale,a.scale);
 if(Math.abs(x-b.x)<32*scale||!layer.clear(surface,x)||!b.social.clear(b.support,b.x))return false;
 if(same(source,surface)&&Math.abs(a.x-x)<=6*scale){
  view.chasePair={a,b,until:t+4200};
 }else if(same(source,surface)){
  if(!layer.corridor(surface,x)||Math.abs(a.x-x)>65*a.scale)return false;
  a.route=[{settle:true,surface,x,chaseSetup:true}];
  view.chasePair={a,b,until:t+7500};
 }else{
  if(Math.hypot(x-a.x,surface.top-source.top)>140*a.scale)return false;
  const choice=plan(a,surface,x);
  if(!choice)return false;
  a.route=choice.steps.map(step=>({...step,chaseSetup:true}));
  view.chasePair={a,b,until:t+9000};
 }
 report(view,'Pairs staged');
 return true;
}

function gatherPair(a,b,view,t){
 const scale=Math.max(a.scale,b.scale);
 const nearby=a.surfaces.filter(s=>broad(s)&&!s.home&&!s.internal&&s.max-s.min>=100*scale)
  .sort((s,r)=>Math.hypot(s.min-a.x,s.top-a.y)-Math.hypot(r.min-a.x,r.top-a.y));
 for(const surface of nearby.slice(0,3)){
  const other=b.surfaces.find(s=>same(s,surface));
  if(!broad(other))continue;
  const x=snapped(surface,(surface.min+surface.max)/2-26*scale,a.scale);
  const y=snapped(other,x+38*scale,b.scale);
  if(other.max-y<14*b.scale||!a.social.clear(surface,x)||!b.social.clear(other,y))continue;
  if(Math.hypot(x-a.x,surface.top-a.y)>140*a.scale||Math.hypot(y-b.x,other.top-b.y)>140*b.scale)continue;
  const first=same(a.support,surface)?a.social.corridor(surface,x)&&[{settle:true,surface,x}]:plan(a,surface,x)?.steps;
  if(!first)continue;
  const second=same(b.support,other)?b.social.corridor(other,y)&&[{settle:true,surface:other,x:y}]:plan(b,other,y)?.steps;
  if(!second)continue;
  a.route=first.map(step=>({...step,chaseSetup:true}));
  b.route=second.map(step=>({...step,chaseSetup:true}));
  view.chasePair={a,b,until:t+12000};
  report(view,'Pairs staged');
  return true;
 }
 return false;
}

function releaseSetup(view){
 for(const a of [view.chasePair?.a,view.chasePair?.b]){
  if(!a)continue;
  a.route=a.route?.filter(step=>!step.chaseSetup)||[];
  a.labPose=null;
  if(a.social?.episode?.labChase===view)a.social.finish('chase focus ended');
 }
 view.chasePair=null;
}

window.pixelCatDashboardChaseV1={
 resetFocus(view){releaseSetup(view);view.chaseProbeAt=0;view.chaseNext=new WeakMap();},
 focus(a,t,view){
  const pair=view.chasePair;
  if(pair){
   if(a!==pair.a&&a!==pair.b)return 0;
   const {a:chaser,b:runner}=pair;
   if(pair.episode){
    if(chaser.social?.episode!==pair.episode){releaseSetup(view);view.chaseProbeAt=t+2600;}
    return 0;
   }
   if(!active(chaser)||!active(runner)||chaser.social?.episode||runner.social?.episode||t>=pair.until){
    if(t>=pair.until)report(view,'Lost sight');
    releaseSetup(view);view.chaseProbeAt=t+1200;
    return 0;
   }
   if(settled(a)){
    const other=a===chaser?runner:chaser;
    window.pixelCatSettlingV1?.wake(a,t);
    a.deadline=t+1800;
    if(a.labPose!=='stand'){a.labPose='stand';if(a.idle)a.idle.poseUntil=t;}
    const facing=Math.sign(other.x-a.x);
    if(facing&&a.facing!==facing){a.facing=facing;if(a.idle)a.idle.poseUntil=t;}
    a.social.nextEncounter=a.social.clock+500;
   }
   if(a!==chaser||!settled(chaser)||!settled(runner))return 0;
   const option=chaser.social.chaseOptions().find(o=>o.target===runner);
   if(option&&chaser.social.startChase(option,t,'run')&&chaser.social.episode){
    pair.episode=chaser.social.episode;
    pair.episode.labChase=view;
    chaser.labPose=runner.labPose=null;
    report(view,'Invitations');
   }
   return 0;
  }
  const next=view.chaseNext??=new WeakMap();
  if(t<(view.chaseProbeAt||0)||t<(next.get(a)||0)||!open(a)||!broad(a.support))return 0;
  const layer=a.decisionLayer?.();
  if(!layer)return 0;
  view.chaseProbeAt=t+650;
  next.set(a,t+5000);
  const peers=layer.peers().filter(b=>open(b)&&broad(b.support));
  peers.sort((b,c)=>Number(same(a.support,c.support))-Number(same(a.support,b.support))||
   Math.hypot(b.x-a.x,b.y-a.y)-Math.hypot(c.x-a.x,c.y-a.y));
  const nearby=peers.slice(0,6);
  if(!nearby.some(b=>stagePair(a,b,view,t))&&!nearby.slice(0,2).some(b=>gatherPair(a,b,view,t)))report(view,'Waiting for a shared runway');
  return 0; // The normal tick supplies perception, phase advancement and gait playback.
 },
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
  if(!ep.labChase&&(a.config.dashboard_chasing!==true||b.config.dashboard_chasing!==true)){
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
   if(!ep.labChase&&mood.random()>=.25+.55*mood.values.playfulness*(1-mood.values.sleepiness))return false;
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
    if(layer.clock>=state.lookUntil){if(ep.labChase)report(ep.labChase,'Lost sight');layer.finish('lost sight at the card edge');}
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
   if(ep.labChase)report(ep.labChase,'Crossings');
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
