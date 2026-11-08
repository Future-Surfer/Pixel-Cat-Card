// Reuse this actor's existing visible memory; never inspect another cat's intent.
window.pixelCatObserverV1={
 step(layer,t){const a=layer.actor;if(a.config.third_party_awareness===false||!a.config.social_behaviour||!a.config.interaction_behaviour){layer.observerWatch=null;return;}
  const watch=layer.observerWatch;if(watch&&layer.clock>=watch.until){layer.observerWatch=null;layer.observerStats.expired++;layer.log('watch ended');}
  if(layer.clock<Math.max(layer.observerNext||0,layer.observerProbeAt||0)||layer.observerWatch||layer.episode||a.bedInside&&a.bedInside.config.bed_style!=='simple'||!layer.available(a)||!['loaf','alertLying','sit','sithead','stand','look'].includes(a.idle?.pose))return;layer.observerProbeAt=layer.clock+250;
  const cue=[...layer.memory.values()].find(m=>layer.clock-m.at<700&&layer.visible?.has(m.id)&&['moving','bat','wiggle','postScratch'].includes(m.pose));if(!cue)return;
  const stats=layer.observerStats||={opportunities:0,watches:0,ignored:0,expired:0};stats.opportunities++;const random=()=>a.ensureMood().random();layer.observerNext=layer.clock+12000+random()*23000;
  const pose=['loaf','alertLying'].includes(a.idle.pose)?'alertLying':'glance';if(a.support?.poses?.length&&!a.support.poses.includes(pose)||random()>.15+.3*layer.traits.curiosity){stats.ignored++;layer.log('noticed activity; continued',{source:cue.id});return;}
  const duration=1500+random()*2500;layer.observerWatch={source:cue.id,pose,until:layer.clock+duration};stats.watches++;a.facing=cue.x+12*cue.scale>=a.x+12*a.scale?1:-1;if(a.idle)a.idle.poseUntil=t;layer.log('quietly watching observed activity',{source:cue.id,duration:Math.round(duration)});
 },
 pose(layer){const a=layer.actor,w=layer.observerWatch;return a.config.third_party_awareness!==false&&a.config.social_behaviour&&a.config.interaction_behaviour&&!layer.episode&&w&&layer.available(a)&&layer.clock<w.until?w.pose:null;}
};
