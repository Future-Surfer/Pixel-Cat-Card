// Choose leisure intent before choosing a destination. More shelves must not
// manufacture more urgency. This is residence preference, not fatigue.
const catExploration={
 observe(a,t){
  const s=a.support;if(!s||a.config.local_exploration===false)return null;
  const rect=s.rectSnapshot||{left:s.left,top:0},span={el:s.el||s,left:s.left-rect.left,right:s.right-rect.left,y:s.top-rect.top};
  const q=a.explorationResidence,old=q?.span,overlap=old&&Math.min(old.right,span.right)-Math.max(old.left,span.left);
  if(!old||old.el!==span.el||Math.abs(old.y-span.y)>2*a.scale||overlap<.8*Math.min(old.right-old.left,span.right-span.left)){
   a.explorationResidence={since:t,span,horizon:14000+10000*a.ensureMood().random()};
  }else q.span=span;
  return a.explorationResidence;
 },
 plan(a,t,tools,localOnly=false){
  if(a.config.local_exploration===false||a.command||a.goal||a.motion||a.play||a.previewPose||a.toyHunt||a.social?.episode||a.paused||a.userHeld)return false;
  const q=this.observe(a,t);if(!q)return false;
  const mood=a.ensureMood(),r=()=>mood.random(),v=a.config.mood_behaviour?mood.values:{playfulness:.4,sleepiness:.35,alertness:.25};
  const residence=Math.max(0,Math.min(1,1-(t-q.since)/q.horizon)),s=a.support;
  const points=s.narrow?[]:tools.points(s).filter(p=>Number.isFinite(p.x)&&p.x>=s.min&&p.x<=s.max&&Math.abs(p.x-a.x)>=6*a.scale&&(!a.social?.corridor||a.social.corridor(s,p.x)));
  const choices=[{kind:'stay',weight:.25+.5*v.sleepiness+.4*residence}];
  if(points.length)choices.push({kind:'local',weight:.55+.6*residence});
  if(!localOnly)choices.push({kind:'leave',weight:.65+.4*v.alertness+.2*v.playfulness});
  const intent=tools.pick(choices,p=>p.weight*(window.pixelCatBehaviourV1?.choiceWeight(a,p.kind)??1),r).kind;
  const report={intent,surface:s.id,residenceMs:Math.max(0,Math.round(t-q.since)),preference:Number(residence.toFixed(2))};
  a.setAttribute?.('data-exploration',JSON.stringify(report));a.social?.log?.('exploration '+intent,report);
  if(intent==='leave')return false;
  a.noPathMessage='';a.urgency='relaxed';a.destinationId=s.id;
  if(intent==='stay'){
   const ms=3000+4000*r();a.route=[];a.deadline=t+(window.pixelCatBehaviourV1?.restWindow(a,ms)??ms);a.destinationPoint='observe';
   // Keep an ongoing restful pose; otherwise normal idle choice can continue.
  }else{
   const point=tools.pick(points,p=>(p.weight||1)*tools.weight(a.visits,s.id+'/'+p.id,t),r);
   a.destinationPoint=point.id;a.route=[{settle:true,surface:s,x:point.x}];a.deadline=0;
   window.pixelCatReactionsV1?.wander(a,false);
  }
  a.renderDebug?.();return true;
 }
};
window.pixelCatExplorationV1=catExploration;
