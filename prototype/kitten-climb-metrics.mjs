// Lab-only dual-clock traces. A frozen callback is not an active grip decision.
export class ClimbTrace {
 constructor(){this.events=[];this.cats=new Map();this.samples=0;this.earlyEvictions=0;this.births=0;this.strokeWidths=new Set();}
 event(cat,type,wall,active,detail={}){this.events.push({cat,type,wall:+wall.toFixed(2),active:+active.toFixed(2),...detail});if(this.events.length>10000)this.events.shift();}
 sample(id,state,wall,active){let c=this.cats.get(id);if(!c){c={ticks:0,slow:0,climbTicks:0,gripWall:0,gripActive:0,maxGripWall:0,maxGripActive:0,landed:0,recoveries:0,slides:0,phase:'',lastWall:wall,lastActive:active,lastClimbAge:null};this.cats.set(id,c);}
  const dw=Math.max(0,wall-c.lastWall),da=Math.max(0,active-c.lastActive),grip=state.kind==='grip';c.ticks++;this.samples++;if(state.dt>250)c.slow++;if(state.climbing)c.climbTicks++;
  if(grip){c.gripWall+=dw;c.gripActive+=da;c.runWall=(c.wasGrip?c.runWall:0)+dw;c.runActive=(c.wasGrip?c.runActive:0)+da;c.maxGripWall=Math.max(c.maxGripWall,c.runWall);c.maxGripActive=Math.max(c.maxGripActive,c.runActive);}else c.runWall=c.runActive=0;
  const key=[state.kind,state.phase,state.target,state.recovering,state.serial,state.waitReason,state.clock].join(':');if(key!==c.phase){this.event(id,'phase',wall,active,state);c.phase=key;}c.wasGrip=grip;c.lastWall=wall;c.lastActive=active;c.current=state;
 }
 report(wall,active,mode){return {mode,wallSeconds:+wall.toFixed(2),clockSeconds:+active.toFixed(2),samples:this.samples,decal:{births:this.births,earlyEvictions:this.earlyEvictions,strokeWidths:[...this.strokeWidths].sort()},cats:[...this.cats].map(([name,c])=>({name,ticks:c.ticks,callbacksOver250ms:c.slow,climbTicks:c.climbTicks,gripWallSeconds:+c.gripWall.toFixed(2),gripClockSeconds:+c.gripActive.toFixed(2),longestGripWall:+c.maxGripWall.toFixed(2),longestGripClock:+c.maxGripActive.toFixed(2),landed:c.landed,recoveries:c.recoveries,slides:c.slides,current:c.current})),events:this.events};}
}
