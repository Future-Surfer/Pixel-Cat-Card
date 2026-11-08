// A scroll is usually a uniform camera translation, not a new dashboard layout.
// Validate every known card rectangle before reusing its surfaces. Sticky/reflowed
// cards, nested content scrolling and resize events retain full discovery.
const catScrollRoots=new WeakMap();
const catOverlayGuards=new WeakMap(),catLayoutAttached=new WeakSet();
const catScrollRect=(state,el)=>{if(!state.rects.has(el))state.rects.set(el,el.getBoundingClientRect());return state.rects.get(el);};
const catScrollPoint=(p,dx,dy,cache)=>{if(!p||typeof p!=='object')return p;if(cache.has(p))return cache.get(p);const n={...p};cache.set(p,n);if(Number.isFinite(n.x))n.x+=dx;if(Number.isFinite(n.y))n.y+=dy;if(n.lookAt)n.lookAt=catScrollPoint(n.lookAt,dx,dy,cache);return n;};
const catScrollLayout={
 // Dialog discovery is identical for actors in the same view/RAF. Keep local
 // disconnected/navigation/visibility guards ahead of the shared result.
 attach(a){if(catLayoutAttached.has(a)||typeof a.blocked!=='function')return;catLayoutAttached.add(a);const original=a.blocked;a.blocked=function(frameTime){if(document.hidden||location.pathname!==this.href||!this.isConnected||this.root?.editMode)return true;if(!this.root||!Number.isFinite(frameTime))return original.call(this);let cached=catOverlayGuards.get(this.root);if(cached?.at===frameTime)return cached.value;const value=original.call(this);catOverlayGuards.set(this.root,{at:frameTime,value});window.pixelCatMonitorV1?.diagnostics?.count('overlayScans');return value;};},
 mark(a,event){
  a.scrollTranslation=null;
  if(event?.type!=='scroll'||!a.root||a.config?.scroll_reuse===false)return;
  let el=a.root;while(el&&el!==event.target)el=el.parentElement||el.getRootNode?.()?.host;
  if(!el&&event.target!==document)return;
  let state=catScrollRoots.get(a.root);if(!state){state={actors:new Set(),rects:new Map()};catScrollRoots.set(a.root,state);}
  if(state.event!==event){state.event=event;state.rects.clear();clearTimeout(state.timer);if(state.refreshRaf)cancelAnimationFrame(state.refreshRaf);state.refreshRaf=null;state.timer=setTimeout(()=>{state.refresh=[...state.actors];const step=()=>{state.refreshRaf=null;let cat;while(state.refresh.length){const next=state.refresh.shift();next.scrollTranslation=null;if(next.active&&next.isConnected){cat=next;break;}}if(cat)cat.invalidate();if(state.refresh.length)state.refreshRaf=requestAnimationFrame(step);else{state.actors.clear();state.rects.clear();state.event=null;}};state.refreshRaf=requestAnimationFrame(step);},160);}
  state.actors.add(a);a.scrollTranslation=state;
 },
 shift(a){
  const state=a.scrollTranslation;a.scrollTranslation=null;
  if(!state||!a.support||!a.home?.rectSnapshot||!a.surfaces?.length)return false;
  const dock=a.config?.show_home===false?a.home.el:a.shadowRoot.querySelector('.dock');if(!dock)return false;
  const r=catScrollRect(state,dock),old=a.home.rectSnapshot,dx=r.left-old.left,dy=r.top-old.top,root=catScrollRect(state,a.root);
  if(![dx,dy].every(Number.isFinite)||!a.worldRect||Math.abs(root.width-a.worldRect.width)>.5||Math.abs(root.height-a.worldRect.height)>.5)return false;
  for(const s of a.surfaces){const node=s.rectNode||(s.home?dock:s.el),rect=catScrollRect(state,node),snapshot=s.rectSnapshot;if(!s.el?.isConnected||node?.isConnected===false||!snapshot||['width','height'].some(k=>Math.abs(rect[k]-snapshot[k])>.5)||Math.abs(rect.left-snapshot.left-dx)>.5||Math.abs(rect.top-snapshot.top-dy)>.5)return false;}
  const pointCache=new Map(),point=p=>catScrollPoint(p,dx,dy,pointCache),rect=b=>{if(!b)return b;const n={...b};for(const k of ['left','right'])if(Number.isFinite(n[k]))n[k]+=dx;for(const k of ['top','bottom'])if(Number.isFinite(n[k]))n[k]+=dy;return n;};
  const surface=s=>{const n={...s};for(const k of ['left','right','min','max'])if(Number.isFinite(n[k]))n[k]+=dx;n.top+=dy;n.rectSnapshot=rect(s.rectSnapshot);for(const k of ['roamPoints','propPoints','inspectionPoints','inspectionTargets','points'])if(s[k])n[k]=s[k].map(point);return n;};
  const previous=a.surfaces,support=a.support;a.surfaces=previous.map(surface);a.home=a.surfaces.find(s=>s.id===a.home.id);a.bedSurface=a.surfaces.find(s=>s.bed&&(s.bedOwner===a||s.id==='home:bed'))||null;a.worldRect={left:root.left,top:root.top,right:root.right,bottom:root.bottom,width:root.width,height:root.height};
  a.surfaceCandidates=(a.surfaceCandidates||[]).map(surface);a.rejected=(a.rejected||[]).map(s=>({...s,left:s.left+dx,right:s.right+dx,top:s.top+dy}));
  if(a.inspectionPending)a.inspectionPending=point(a.inspectionPending);if(a.requestedPoint)a.requestedPoint=point(a.requestedPoint);if(a.actionTarget)a.actionTarget=point(a.actionTarget);
  window.pixelCatCardClimbV1?.shift(a,dx,dy);
  a.reconcileLayout(support,previous,performance.now(),true);a.needsMeasure=false;
  window.pixelCatMonitorV1?.diagnostics?.count('scrollTranslations');return true;
 }
};
window.pixelCatScrollV1=catScrollLayout;
