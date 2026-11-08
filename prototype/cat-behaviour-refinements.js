window.pixelCatBehaviourRefinementsV1={
 apex(art,m,phase,config){
  if(m.jumpKind!=='ascend'||config.horizontal_apex===false||!art.acrossFlight?.frames.length||!m.jumpProfile?.flight)return null;
  m.horizontalApex??=Math.random()<.75;if(!m.horizontalApex)return null;
  const f=m.jumpProfile.flight,apex=-f.vy/f.gravity/f.seconds;
  if(phase<Math.max(.1,apex-.13))return null;
  const c=art.acrossFlight;return {rows:c.frames[0],origin:c.origins[0],sequenceId:c.sequenceId,assetFrame:0};
 },
 wiggle(a,p,t,art){
  if(p.stage==='wiggle'){p.stage='sneak';p.pose=null;return false;}
  if(p.stage!=='sneak'||p.wiggleChecked||!art.idleSequences?.wiggle)return false;
  p.wiggleChecked=true;if(a.ensureMood().random()>=.72)return false;
  p.stage='wiggle';p.pose='wiggle';p.waitUntil=t+600+600*a.ensureMood().random();a.deadline=p.waitUntil+1000;if(a.idle)a.idle.poseUntil=t;
  a.setAttribute('data-play-stage','wiggle');a.playHistory?.push('wiggle');return true;
 }
};
