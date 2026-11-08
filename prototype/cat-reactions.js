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
