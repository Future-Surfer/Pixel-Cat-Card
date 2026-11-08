// Shared layout work has one bounded budget per view/frame, independent of actor clocks.
const catLayoutViews=new WeakMap();
window.pixelCatLayoutV1={
 changed(a){return a.surfaces?.some(s=>{const node=s.rectNode||(s.home?a.shadowRoot.querySelector('.dock'):s.el),old=s.rectSnapshot,removed=s.el.isConnected===false||node?.isConnected===false;if(!old&&!removed)return false;const r=removed?null:window.pixelCatSurfaceWorldV1.rect(a.root,node),keys=removed?['removed']:['left','top','width','height'].filter(k=>Math.abs(r[k]-old[k])>1);if(!keys.length)return false;a.setAttribute?.('data-layout-difference',JSON.stringify({id:s.id,keys,old,next:r&&Object.fromEntries(['left','top','width','height'].map(k=>[k,r[k]]))}));return true;});},
 join(a){if(!a.root)return;window.pixelCatEffectsV1?.join(a);let s=catLayoutViews.get(a.root);if(!s){s={members:new Set(),phase:'idle',generation:0,scans:0};catLayoutViews.set(a.root,s);}const added=!s.members.has(a);s.members.add(a);if(added&&s.phase==='settling'){s.changed=performance.now();s.probeAt=s.changed+260;s.stable=0;a.layoutPaused=true;a.layoutPauseStarted=s.changed;a.setAttribute?.('data-layout-state','settling');}else if(added&&s.phase!=='idle')this.notify(a,{type:'resize',source:'companion joined during recovery'});return s;},
 leave(a){window.pixelCatEffectsV1?.leave(a);const s=catLayoutViews.get(a.root);s?.members.delete(a);if(s&&!s.members.size)catLayoutViews.delete(a.root);delete a.layoutRecovery;a.layoutPaused=false;delete a.layoutRelocated;if(a.layer)a.layer.style.opacity='';if(a.postRenderLayer)a.postRenderLayer.style.opacity='';},
 repair(a,old,t){
  if(a.climb?.stage==='grip'){a.stranded=false;return true;}
  if(!old)return false;const live=s=>s&&s.el?.isConnected!==false,next=a.surfaces.find(s=>s.id===old.id&&live(s)),m=a.motion,target=m&&a.surfaces.find(s=>s.id===m.target?.id&&live(s));
  const resized=target&&['min','max'].some(k=>Math.abs((target[k]-target.left)-(m.target[k]-m.target.left))>1),shifted=next&&target&&m.kind==='walk'&&(Math.abs((target.left-m.target.left)-(next.left-old.left))>1||Math.abs((target.top-m.target.top)-(next.top-old.top))>1||resized&&(m.x+target.left-m.target.left<target.min||m.x+target.left-m.target.left>target.max));
  if(next&&(!m||target)&&!shifted)return false;
  const from=a.svg?.style.transform?.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/)?.slice(1).map(Number);
  a.setAttribute?.('data-layout-repair',JSON.stringify({support:old.id,next:next?.id,motion:m?.kind,target:m?.target?.id,found:target?.id,shifted,endpoint:m?.x,bounds:target&&[target.min,target.max]}));
  a.social?.finish?.('support changed');a.cancelPlay?.(t);window.pixelCatMouthV1?.cancel(a);window.pixelCatBedEntryV1?.moving(a);a.motion=null;a.route=[];a.idle=null;a.previewBedPose=null;a.finishing=false;a.recallPending=false;
  const safe=next||(live(a.home)&&a.surfaces.includes(a.home)?a.home:null)||a.surfaces.filter(s=>live(s)&&!s.narrow&&s.max>=s.min).sort((x,y)=>Math.abs(x.top-a.y)-Math.abs(y.top-a.y))[0];
  if(!safe){a.stranded=true;return false;}a.support=safe;a.x=Math.max(safe.min,Math.min(safe.max,a.x+(next?next.left-old.left:0)));a.y=safe.top;a.stranded=false;a.noPathMessage='';a.deadline=t+500;a.layoutRelocated=true;a.draw?.(window.pixelCatRoamingArtV2.stand);
  if(!a.layoutPaused){delete a.layoutRelocated;if(from){a.layoutPaused=true;a.layoutRecovery={local:true,start:t,ready:t+180,from,dx:a.x-from[0],dy:a.y-24*a.scale-from[1]};a.setAttribute?.('data-layout-state','local recovery');}}return true;
 },
 geometry(root){const s=catLayoutViews.get(root);return s?.phase==='reconcile'?s.capture:null;},
 notify(a,event){const s=this.join(a);if(!s)return;const t=performance.now();if(Array.isArray(event)){s.boxes||=new WeakMap();let changed=false;for(const e of event){if(!e.target||!e.contentRect)continue;const n=[e.contentRect.width,e.contentRect.height],old=s.boxes.get(e.target);if(old&&n.some((v,i)=>Math.abs(v-old[i])>1)){changed=true;s.boxDifference={from:old,to:n};}s.boxes.set(e.target,n);}if(changed&&s.phase!=='settling')event={type:'resize',source:'card geometry'};}if(event?.type==='resize'){
   if(![...s.members].some(b=>b.support))return;
   if(s.event===event)return;s.event=event;s.phase='settling';s.changed=t;s.probeAt=t+260;s.stable=0;s.signature=null;s.capture=null;s.generation++;s.queue=[];
   for(const b of s.members){delete b.layoutRecovery;b.layoutPaused=true;b.layoutPauseStarted=t;b.layer?.style&&(b.layer.style.opacity='.4');if(b.postRenderLayer)b.postRenderLayer.style.opacity='.4';b.setAttribute?.('data-layout-state','settling');b.setAttribute?.('data-layout-cause',JSON.stringify({generation:s.generation,source:event.source||'resize',actor:a.ownerKey,box:s.boxDifference}));}window.pixelCatEffectsV1?.clear(a.root);
  }else if(s.phase==='settling'&&Array.isArray(event)&&event.length){s.changed=t;s.probeAt=t+260;s.stable=0;}
 },
 freeze(a,t,s){const dt=Math.max(0,t-(a.lastTick??t));a.freezeClocks?.(dt);a.lastTick=t;if(s.phase!=='running'){if(a.social?.world)a.social.world.last=t;if(a.propScene)a.propScene.lastAt=t;}},
 gate(a,t){const s=catLayoutViews.get(a.root);if(a.layoutRecovery?.local){this.freeze(a,t,{phase:'running'});a.status?.('Recovering changed support');return this.recover(a,t,a.layoutRecovery,s);}if(!s||s.phase==='idle'||!a.layoutPaused)return false;
  this.freeze(a,t,s);a.status?.(s.phase==='settling'?'Waiting for dashboard resize':'Recovering dashboard layout');
  if(a.userHeld){window.pixelCatDragV1?.restore(a);return true;}
  if(s.phase==='settling'){
   if(t<s.probeAt)return true;s.probeAt=t+70;const r=a.root.getBoundingClientRect(),sig=[r.left,r.top,r.width,r.height].map(v=>Math.round(v*2)).join(',');
   s.stable=s.signature===sig?s.stable+1:0;s.signature=sig;if(t-s.changed<260||s.stable<2)return true;
   s.phase='reconcile';s.capture={rects:new Map()};s.queue=[...s.members].filter(b=>b.active&&b.isConnected!==false);s.reconciledAt=null;s.scans++;s.index=0;
  }
  if(s.phase==='reconcile'){
   while(s.queue.length&&(!s.queue[0].active||s.queue[0].isConnected===false))s.queue.shift();
   if(s.reconciledAt!==t){s.reconciledAt=t;const started=performance.now();do{const b=s.queue.shift();if(b?.active&&b.isConnected!==false)this.place(b,t,s);}while(s.queue.length&&performance.now()-started<4);}
   if(s.queue.length)return true;s.phase='running';s.capture=null;
  }
  return this.recover(a,t,a.layoutRecovery,s);
 },
 place(a,t,s){
    const old=a.support,from=a.svg?.style.transform?.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/),wasAir=a.motion&&['jump','startle'].includes(a.motion.kind);
    a.scrollTranslation=null;a.needsMeasure=true;a.measure();let target=a.support;
    if(a.climb?.stage==='grip'){a.stranded=false;a.layoutRecovery={start:t,ready:t+180};a.checkAt=t+700;return;}
    if(!a.waitingForPlacement&&(a.stranded||!target||target.el?.isConnected===false)){target=a.surfaces?.find(f=>f.id===old?.id&&f.el?.isConnected!==false)||a.home||a.surfaces?.find(f=>!f.narrow&&f.el?.isConnected!==false);if(target){a.support=target;a.stranded=false;a.motion=null;a.route=[];a.idle=null;a.x=Math.max(target.min,Math.min(target.max,a.x));a.y=target.top;}}
    if(wasAir&&target){a.social?.finish?.('layout recovery');a.motion=null;a.idle=null;a.route=[];a.x=Math.max(target.min,Math.min(target.max,a.x));a.y=target.top;a.draw?.(window.pixelCatRoamingArtV2.stand);}
    const dx=a.layoutRelocated&&from?a.x-Number(from[1]):target&&old?target.left-old.left:0,dy=a.layoutRelocated&&from?a.y-24*a.scale-Number(from[2]):target&&old?target.top-old.top:0;delete a.layoutRelocated;
    a.layoutRecovery={start:null,delay:(s.index++%7)*37,from:from?.slice(1).map(Number),dx,dy};a.checkAt=t+700;a.setAttribute?.('data-layout-state','reconcile');
 },
 recover(a,t,p,s){if(!p)return true;if(p.start===null){p.start=t+p.delay;p.ready=p.start+180;}
  if(p.from&&a.svg?.style&&!a.stranded){const u=Math.max(0,Math.min(1,(t-p.start)/180)),ease=u*u*(3-2*u),snap=v=>u===1?v:Math.round(v*ease/a.scale)*a.scale;a.svg.style.transform=`translate(${p.from[0]+snap(p.dx)}px,${p.from[1]+snap(p.dy)}px)`;if(a.carriedToy&&a.drawnRows)window.pixelCatMouthV1?.frame?.(a,a.drawnRows,[null,p.from[0]+snap(p.dx),p.from[1]+snap(p.dy)],t,a.carryArt||window.pixelCatRoamingArtV2);}
  if(t<p.ready)return true;a.layoutPaused=false;delete a.layoutRecovery;if(a.layer)a.layer.style.opacity='';if(a.postRenderLayer)a.postRenderLayer.style.opacity='';a.setAttribute?.('data-layout-state','running');if(!p.local&&[...s.members].every(b=>!b.layoutPaused||!b.active))s.phase='idle';return false;
 },
 report(root){const s=catLayoutViews.get(root);return s?{phase:s.phase,generation:s.generation,settledScans:s.scans,waiting:s.queue?.length||0}:null;}
};
