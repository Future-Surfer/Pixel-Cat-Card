// Advance voluntary chase legs at grounded decisions using the standard route player.
(() => {
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

const report=(view,key)=>{if(view)view.counts[key]=(view.counts[key]||0)+1;};
const legFor=a=>focusActors.get(a)?.leg;
const focusActors=new WeakMap();

function endFocusLeg(a,state){
 if(!state.leg)return;
 a.route=a.route?.filter(step=>!step.chaseFocus)||[];
 state.leg=null;
}

function focusTravel(a,state,choice,t,kind){
 for(const step of choice.steps)step.chaseFocus=true;
 state.leg={surface:choice.surface,offset:choice.x-choice.surface.left,crossing:true};
 a.route=choice.steps;
 a.urgency='interested';
 a.deadline=t+1500;
 a.social.log(kind,{surface:choice.surface.id});
 report(state.view,kind);
}

window.pixelCatDashboardChaseV1={
 pursuing(a){return !!legFor(a);},
 detach(a){
  const state=focusActors.get(a);
  if(!state)return;
  endFocusLeg(a,state);
  if(state.looking&&a.labPose==='stand')a.labPose=null;
  state.view?.chaseActors.delete(a);
  focusActors.delete(a);
 },
 resetFocus(view){
  for(const a of view.chaseActors||[])if(focusActors.get(a)?.view===view)this.detach(a);
  view.chaseActors?.clear();
 },
 natural(a,t){
  if(!focusActors.get(a)?.view)this.focus(a,t,null);
 },
 focus(a,t,view){
  if(!active(a)||!broad(a.support)||!view&&(a.bedInside||['sleep','loaf'].includes(a.idle?.pose))){
   const state=focusActors.get(a);
   if(state?.view===view)endFocusLeg(a,state);
   return 0;
  }
  const layer=a.decisionLayer?.();
  if(!layer)return 0;
  if(layer.episode){const state=focusActors.get(a);if(state?.view===view)endFocusLeg(a,state);return 0;}
  let state=focusActors.get(a);
  if(state?.view!==view){
   this.detach(a);
   state={view,seen:new Map(),next:view?t+a.ensureMood().random()*900:t};
   focusActors.set(a,state);
   if(view)(view.chaseActors??=new Set()).add(a);
  }
  if(state.leg){
   if(!a.motion&&!a.climb&&a.route?.length){
    const step=a.route[0];
    if(!step.chaseFocus||!(step.kind==='walk'&&same(a.support,step.surface)?layer.corridor(step.surface,step.x):layer.clear(step.surface,step.x)))endFocusLeg(a,state);
   }else if(settled(a)){
    if(state.leg.crossing&&a.support.id===state.leg.surface.id){report(view,'Crossings');layer.log('chase card transfer completed',{surface:a.support.id});}
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
  const cue=state.lastMotion;
  const observed=cue&&layer.memory.get(cue.m.id);
  const fresh=cue?.until>=t&&observed&&layer.clock-observed.at<=450&&layer.visible?.has(observed.id);
  if(!view&&!fresh)return 0;
  const mood=a.ensureMood(),r=mood.random();
  state.next=t+(view?1500+1200*mood.random():8000);
  if(!view)state.lastMotion=null;
  if(fresh){
   const {previous,crossed}=cue,m=observed;
   const direction=Math.sign(m.x-a.x)||a.facing;
   const gap=30*Math.max(a.scale,m.scale),distance=Math.abs(m.x-a.x);
   const away=(m.x-previous.x)*direction>0;
   if((crossed||away)&&distance>=gap&&r<(view ? .75 : Math.min(.6,(.12+.2*(mood.values?.playfulness??.5))*(window.pixelCatBehaviourV1?.choiceWeight(a,'chase')??1)*(window.pixelCatPostRestV1?.choiceWeight(a,'chase')??1)))){
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
       state.leg={surface,offset:x-surface.left,crossing:false};
       if(a.moveTo(x,surface.top,0,'walk',surface,t)===false){endFocusLeg(a,state);return 0;}
       layer.log('following observed motion',{surface:surface.id,target:m.id});
       report(view,'Following');
       return 0;
      }
     }
    }
   }
   if(view&&!crossed&&a.support.el===m.surface&&Math.abs(a.support.top-m.surfaceTop)<2&&distance>=gap+8*a.scale&&distance<=62*a.scale&&r>=.75){
    const surface=a.support;
    const x=snapped(surface,m.x-direction*gap,a.scale);
    if(Math.abs(x-m.x)>=gap&&layer.corridor(surface,x)&&a.moveTo(x,surface.top,0,'jump',surface,t)!==false){
     report(view,'Pounced');
     return 0;
    }
   }
   if(view&&!away&&distance<=65*a.scale&&r<.38){
    a.facing=direction;
    a.labPose='stand';
    state.looking=true;
    if(a.idle)a.idle.poseUntil=t;
    a.deadline=t+1200;
    report(view,'Turned to watch');
    return 0;
   }
  }
  if(view&&r<.48){
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
 }
};
})();
