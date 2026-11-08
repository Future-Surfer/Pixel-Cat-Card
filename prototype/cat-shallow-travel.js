// Optional small grounded height changes. Scratch faces never become colliders.
window.pixelCatShallowV1={
 edge(a,from,to,x=a.x){
  const s=a.scale,dy=Math.abs(from.top-to.top);if(from===to||from.bed||to.bed||from.narrow||to.narrow||dy<s*.25||dy>4*s||Math.max(0,from.left-to.right,to.left-from.right)>2*s)return null;
  const run=Math.max(6*s,dy*3)+4*s,direction=Math.sign((to.min+to.max)-(from.min+from.max))||a.facing||1,clamp=(v,f)=>Math.max(f.min,Math.min(f.max,v));
  for(const launch of [clamp(x??from.min,from),(from.min+from.max)/2,from.min,from.max])for(const d of [direction,-direction]){const landing=clamp(launch+d*run,to),distance=Math.abs(landing-launch);if(distance>=run-.01&&distance<=48*s)return{launch,landing,run};}return null;
 },
 step(a,next,t){if(next.settle)return false;const from=a.support,to=next,edge=this.edge(a,from,to);if(!edge)return false;
  const key=from.id+'>'+to.id;if(a.shallowChoice?.key!==key)a.shallowChoice={key,walk:!!a.command||!!a.goal||(a.ensureMood?.().random()??Math.random())<.88};if(!a.shallowChoice.walk)return false;
  if(Math.abs(a.x-edge.launch)>a.scale){a.moveTo(edge.launch,from.top,0,'walk',from,t);return true;}
  a.route.shift();a.shallowChoice=null;a.moveTo(edge.landing,to.top,0,'walk',to,t);if(a.motion){a.motion.shallow=true;a.motion.shallowFrom=from.id;a.setAttribute?.('data-transition','shallow-walk');}return true;
 },
 height(a,m,sample){if(!m.shallow)return null;const u=Math.max(0,Math.min(1,Math.abs(sample.x-m.fromX)/Math.max(a.scale,Math.abs(m.x-m.fromX)))),ease=u*u*(3-2*u);return m.fromY+Math.round((m.y-m.fromY)/a.scale*ease)*a.scale;}
};
