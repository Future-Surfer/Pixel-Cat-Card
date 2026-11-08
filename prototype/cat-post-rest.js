// A short active-time preference, not a needs meter or a forced wake-up script.
const catPostRest={
 state(a){return a.postRest||={clock:0,resting:false,since:0,slept:false,until:0,initial:0};},
 random(a){return a.ensureMood?.().random?.()??Math.random();},
 potential(q){const elapsed=q.clock-q.since;return q.resting?Math.max(0,Math.min(q.slept?1:.55,(elapsed-(q.slept?2500:6000))/(q.slept?8000:20000))):0;},
 strength(a){const q=a.postRest;if(!q||a.config?.[q.source==='meal'?'post_meal_behaviour':'post_rest_behaviour']===false)return 0;return Math.max(this.potential(q),q.until>q.clock?q.initial*(q.until-q.clock)/q.duration:0);},
 afterMeal(a){if(a.config?.post_meal_behaviour===false)return;const q=this.state(a);q.resting=false;q.closedIdle=a.idle;q.source='meal';q.duration=6000+6000*this.random(a);q.initial=.75;q.until=q.clock+q.duration;},
 leave(a){
  const q=this.state(a);if(!q.resting)return false;
  const strength=this.potential(q);q.closedIdle=a.idle;q.resting=false;
  if(strength<=0||a.config?.post_rest_behaviour===false)return false;
  q.duration=(q.slept?5000:2500)+this.random(a)*(q.slept?10000:5000);q.initial=strength;q.until=q.clock+q.duration;q.source=q.slept?'sleep':'loaf';
  return true;
 },
 interrupt(a){const q=this.state(a);q.closedIdle=a.idle;q.resting=false;q.initial=0;q.until=0;},
 step(a,ms){window.pixelCatSettlingV1?.step(a,ms);window.pixelCatExertionV1?.clock(a,ms);
  if(a.paused||a.suspended||a.userHeld||a.active===false)return;
  if(a.config?.post_rest_behaviour===false&&a.postRest?.source!=='meal'){if(a.postRest){a.postRest=null;a.removeAttribute?.('data-post-rest');}return;}
  const q=this.state(a);q.clock+=ms>1000?0:Math.max(0,Math.min(250,ms||0));
  const rest=a.config?.post_rest_behaviour!==false&&!a.motion&&!a.previewPose&&!a.play&&['sleep','loaf'].includes(a.idle?.pose);
  if(rest&&a.idle!==q.closedIdle){if(!q.resting){q.resting=true;q.since=q.clock;q.slept=false;q.until=0;q.initial=0;q.source=a.idle.pose;}q.slept||=a.idle.pose==='sleep';}
  else if(q.resting)this.leave(a);
  if(q.clock>=(q.debugAt||0)){q.debugAt=q.clock+500;const strength=q.until>q.clock?this.strength(a):0;if(strength>0){a.setAttribute?.('data-post-rest',JSON.stringify({source:q.source,strength:Number(strength.toFixed(2)),remainingMs:Math.round(q.until-q.clock)}));q.exposed=true;}else if(q.exposed){a.removeAttribute?.('data-post-rest');q.exposed=false;}}
 },
 beforePlan(a,t,requested){
  if(requested){this.interrupt(a);return false;}
  if(!this.leave(a))return false;
  // Some cats pause for a compatible idle; others simply begin a gentle stroll.
  if(this.random(a)>=.65)return false;
  a.deadline=t+800+this.random(a)*1800;if(a.idle)a.idle.poseUntil=t;return true;
 },
 poseWeight(a,pose){const effort=window.pixelCatExertionV1?.weight(a,pose)??1;return effort*this.restPoseWeight(a,pose);},
 restPoseWeight(a,pose){const s=this.strength(a);if(a.postRest?.source==='meal')return 1+s*({clean:4,sit:1,sithead:.7,stand:.3,stretch:.3}[pose]||0);return 1+s*({yawn:2,stretch:2.5,clean:.8,sit:.6,sithead:.8,look:.8,stand:.5,sleep:-.3,loaf:-.2}[pose]||0);},
 choiceWeight(a,kind){const effort=window.pixelCatExertionV1?.weight(a,kind)??1;return effort*this.restChoiceWeight(a,kind);},
 restChoiceWeight(a,kind){const s=this.strength(a);return Math.max(.1,1+s*({explore:-.55,settle:1,chase:-.85,ambush:-.8,pat:-.25}[kind]||0));},
 departure(a,kind,gait){
  this.leave(a);const s=Math.max(this.strength(a),window.pixelCatExertionV1?.strength(a)??0);
  if(kind==='walk'&&!gait&&s>0&&!a.command&&!a.goal&&!a.previewPose&&!a.play&&!a.toyHunt&&!a.social?.episode&&a.urgency!=='prompted'&&this.random(a)<.55+.4*s)a.urgency='casual';
 },
 idleStarted(a,idle,art){
  window.pixelCatSettlingV1?.begin(a,idle,art);
  if(!['loaf','sleep'].includes(idle.pose)&&this.strength(a)>0&&!a.previewPose&&!a.play&&!a.command&&!a.goal)a.deadline=Math.max(a.deadline||0,idle.poseUntil);
 }
};
window.pixelCatPostRestV1=catPostRest;
