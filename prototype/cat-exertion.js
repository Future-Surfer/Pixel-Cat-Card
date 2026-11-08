// Active time only. Effort decays lazily when a choice/completion reads it.
window.pixelCatExertionV1={
 weights:{explore:-.3,chase:-.45,ambush:-.35,settle:.8,loaf:.7,sleep:.4,sit:.3,alertLying:.35},
 state(a){if(!a.exertion){let n=7;for(const c of String(a.ownerKey||'cat'))n=Math.imul(n^c.charCodeAt(0),31)>>>0;a.exertion={clock:0,at:0,level:0,threshold:.25+(n%20)/100,recovery:30000+n%40000};}return a.exertion;},
 clock(a,ms){if(a.config.exertion_behaviour===false||a.paused||a.suspended||a.layoutPaused||a.userHeld||a.stranded||a.active===false)return;this.state(a).clock+=ms>1000?0:Math.max(0,Math.min(250,ms||0));},
 strength(a){if(a.config.exertion_behaviour===false)return 0;const q=this.state(a);if(q.clock!==q.at){q.level*=Math.exp(-(q.clock-q.at)/q.recovery);q.at=q.clock;}return Math.max(0,(q.level-q.threshold)/(1-q.threshold));},
 launch(a,m){m.voluntaryEffort=!a.command&&!a.goal&&!a.previewPose&&!a.userHeld&&a.urgency!=='prompted'&&m.kind!=='startle';},
 complete(a,m){if(!m.voluntaryEffort||a.config.exertion_behaviour===false)return;const play=a.play||a.toyHunt||a.social?.episode?.kind==='chase';if(m.kind!=='jump'&&!play)return;this.strength(a);const q=this.state(a),distance=Math.hypot(m.x-m.fromX,m.y-m.fromY)/a.scale;
  q.level=Math.min(1,q.level+Math.min(.35,m.kind==='jump'?.05+distance/350+Math.abs(m.y-m.fromY)/a.scale/140:.02+distance/500));a.setAttribute?.('data-exertion',JSON.stringify({level:+q.level.toFixed(2),recoveryMs:q.recovery}));
 },
 weight(a,kind){return 1+this.strength(a)*(this.weights[kind]||0);}
};
