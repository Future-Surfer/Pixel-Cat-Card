// Shared semantic policy. New reviewed clips inherit profiles through metadata.
window.pixelCatBehaviourV1={
 profiles:{kitten:{cadence:{locomotion:1.35},bias:{energetic:1.8,play:1.7,startle:1.9,rest:.5,travel:1.35},playful:{energetic:.8,play:.4},restScale:.5,pace:{target:26,spread:.65}},adult:{},senior:{}},
 intentTags:{explore:['travel'],local:['travel'],leave:['travel'],stay:['rest'],settle:['rest'],chase:['play'],run:['play'],ambush:['play'],pat:['play'],catch:['play'],reverse:['play'],counter:['play'],hop:['startle']},
 choiceWeight(a,kind){return this.weight(a,{behaviourPolicy:{tags:this.intentTags[kind]||[]}});},
 stage(a={}){const s=a.lifeStage||a.config?.life_stage||a.life_stage;return ['kitten','adult','senior'].includes(s)?s:'adult';},
 allowed(a,clip){return !clip?.behaviourPolicy?.lifeStages||clip.behaviourPolicy.lifeStages.includes(this.stage(a));},
 weight(a,clip){if(!this.allowed(a,clip))return 0;const p=this.profiles[this.stage(a)],m=clip?.behaviourPolicy||{},tags=new Set([m.category,...m.tags||[]]);let w=1;for(const tag of tags)w*=(p.bias?.[tag]??1)+(p.playful?.[tag]||0)*Math.max(0,Math.min(1,a.mood?.values?.playfulness||0));return Math.max(.1,Math.min(4,w));},
 protected(a){return a.previewPose||a.play||a.toyHunt||a.command||a.goal||a.userHeld||a.social?.episode&&a.social.episode.kind!=='company';},
 restWindow(a,ms){const factor=this.profiles[this.stage(a)].restScale;if(!factor||this.protected(a))return ms;const sleepy=Math.max(0,Math.min(1,a.mood?.values?.sleepiness||0)),effort=window.pixelCatExertionV1?.strength(a)||0;return Math.max(Math.min(1200,ms),ms*Math.min(1,factor*(1+.6*sleepy+.6*effort)));},
 restBout(a,pose,clip,ms){if(!clip?.behaviourPolicy?.tags?.includes('rest'))return ms;const shortened=this.restWindow(a,ms);if(shortened===ms)return ms;const rate=Math.max(80,Number(a.config?.idle_frame_ms)||250)/250,minimum=clip.frames.reduce((n,_,i)=>n+(window.pixelCatPolishV1?.hold(pose,clip,i,rate)??clip.durations[i]*rate),0);return Math.min(ms,Math.max(shortened,minimum));},
 preferredPace(a){const p=this.profiles[this.stage(a)].pace;if(!p)return null;const v=a.mood?.values||{},effort=window.pixelCatExertionV1?.strength(a)||0;return {target:p.target*(.85+.5*(v.playfulness||0)-.35*(v.sleepiness||0))*(1-.35*effort),spread:p.spread};},
 paceWeight(speed,preference,prior=1){return prior*Math.max(.06,Math.exp(-Math.pow(Math.log(speed/preference.target)/preference.spread,2)));},
 movement(a,m,policy){if(m.cells===0){m.duration=1000/60;return;}const p=this.profiles[this.stage(a)],category=policy?.category;let factor=p.cadence?.[category]||1;if(factor===1)return;
  const beats=m.gallopTimeline||m.sneakTimeline;let min=Infinity,prior=0;for(const beat of beats||[]){min=Math.min(min,beat.until-prior);prior=beat.until;}if(!beats&&m.cumulativeMs){prior=0;for(const until of m.cumulativeMs){min=Math.min(min,until-prior);prior=until;}}else if(!beats)min=m.stepMs;
  factor=Math.max(1,Math.min(factor,min/(1000/(m.gallopTimeline?30:60))));m.cadenceFactor=factor;m.duration/=factor;if(Number.isFinite(m.stepMs))m.stepMs/=factor;if(m.cumulativeMs)m.cumulativeMs=m.cumulativeMs.map(t=>t/factor);if(beats)for(const beat of beats)beat.until/=factor;
 }
};
