// Pointer interaction is confined to painted cat pixels; the dashboard remains usable.
// Held and release-flight states are local to this actor, never a shared pause.
const catDrag={
 grip(clip,facing){const [x,y]=clip.anchor,half=clip.anchorAtCellCenter?.5:0;return [facing<0?23-x+half:x+half,y+half];},
 target(a,x,top){
  const feet=top+23*a.scale;
  return (a.surfaces||[]).filter(s=>s.el?.isConnected!==false&&!s.narrow&&Number.isFinite(s.min)&&Number.isFinite(s.max)&&s.max>=s.min&&s.top>=feet-2*a.scale)
   .map(s=>({surface:s,x:Math.max(s.min,Math.min(s.max,x))}))
   .filter(p=>Math.abs(p.x-x)<=8*a.scale&&a.social?.clear?.(p.surface,p.x)!==false)
   .sort((p,q)=>p.surface.top-q.surface.top||Math.abs(p.x-x)-Math.abs(q.x-x))[0]||null;
 },
 install(a,art){
  if(!a.svg?.addEventListener||a.dragBinding)return;
  const svg=a.svg;
  const down=e=>{
   if(a.config.draggable===false||e.button!==0||e.isPrimary===false||a.userHeld||!a.active||a.suspended||a.stranded||!a.support||a.blocked?.())return;
   if(!art.lifted)return;
   e.preventDefault();e.stopPropagation();
   const t=performance.now(),s=a.support;
   a.dragState={pointer:e.pointerId,phase:'held',returnId:s.id,returnOffset:a.x-s.left,paused:a.paused,clientX:e.clientX,clientY:e.clientY,faceX:e.clientX,last:t};
   a.userHeld=true;window.pixelCatPostRestV1?.interrupt(a);
   window.pixelCatMouthV1?.startled?.(a,t);
   a.social?.finish('picked up');a.cancelPlay(t);
   a.arriving=null;a.arrived=true;a.motion=null;a.route=[];a.idle=null;a.goal=null;a.command=null;a.recallPending=false;a.finishing=false;a.inspectionPending=null;a.requestedPoint=null;a.toyHuntRequested=false;a.toyAssetRequest=null;
   if(a.social){a.social.pendingImpact=null;a.social.frame=null;}
   window.pixelCatSetupV1?.clearRestMask(a);
   svg.setPointerCapture(e.pointerId);svg.style.cursor='grabbing';
   a.setAttribute('data-drag-state','held');a.setAttribute('data-frame-origin',art.lifted.origin||'unknown');
   this.paint(a,art);
  };
  const move=e=>{const d=a.dragState;if(d?.phase!=='held'||d.pointer!==e.pointerId)return;e.preventDefault();if(Math.abs(e.clientX-d.faceX)>=2){a.facing=e.clientX>d.faceX?1:-1;d.faceX=e.clientX;}d.clientX=e.clientX;d.clientY=e.clientY;};
  const up=e=>{const d=a.dragState;if(d?.phase!=='held'||d.pointer!==e.pointerId)return;e.preventDefault();e.stopPropagation();if(a.blocked?.()){this.restore(a);return;}a.measure?.();d.clientX=e.clientX;d.clientY=e.clientY;this.paint(a,art);this.release(a,performance.now(),art);};
  const cancel=e=>{if(a.dragState&&(e.type==='blur'||e.type==='keydown'&&e.key==='Escape'||a.dragState.phase==='held'&&e.pointerId===a.dragState.pointer)){e.preventDefault?.();this.restore(a);}};
  const click=e=>{e.preventDefault();e.stopPropagation();};
  const menu=e=>{if(a.userHeld)e.preventDefault();};
  for(const [event,fn]of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['lostpointercapture',cancel],['click',click],['contextmenu',menu]])svg.addEventListener(event,fn);
  window.addEventListener('keydown',cancel);window.addEventListener('blur',cancel);
  a.dragBinding={svg,art,down,move,up,cancel,click,menu};
  svg.style.pointerEvents=a.config.draggable===false?'none':'visiblePainted';svg.style.touchAction='none';svg.style.cursor='grab';
 },
 preview(a,target){
  if(!a.dragMarker){const p=document.createElement('div');p.dataset.catDropMarker='';p.style.cssText='position:absolute;pointer-events:none;border-top:2px dashed #67ac86;opacity:.7';a.layer.append(p);a.dragMarker=p;}
  a.dragMarker.style.display=target?'':'none';
  if(target){a.dragMarker.style.width=24*a.scale+'px';a.dragMarker.style.transform=`translate(${target.x}px,${target.surface.top}px)`;}
 },
 paint(a,art){
  const d=a.dragState,clip=art.lifted,anchor=this.grip(clip,a.facing),s=a.scale;
  d.x=d.clientX-anchor[0]*s;d.top=d.clientY-anchor[1]*s;
  a.x=d.x;a.y=d.top+23*s;a.draw(clip.rows);a.svg.style.transform=`translate(${d.x}px,${d.top}px)`;
  a.svg.style.filter=`drop-shadow(${3*s}px ${4*s}px ${1.5*s}px rgba(0,0,0,.24))`;
  a.setAttribute('data-activity','held');a.setAttribute('data-pose','lifted');a.setAttribute('data-frame','lifted-1');a.setAttribute('data-sequence-id',clip.sequenceId);
  d.target=this.target(a,d.x,d.top);this.preview(a,d.target);a.renderMoodDebug?.(performance.now());a.status('Picked up · release above a surface; Escape cancels');
 },
 release(a,t,art){
  const d=a.dragState;if(!d?.target){this.restore(a);return false;}
  const target=d.target;d.phase='fall';d.targetId=target.surface.id;d.offset=target.x-target.surface.left;d.surfaceLeft=target.surface.left;d.surfaceTop=target.surface.top;d.fromX=d.x;d.fromTop=d.top;d.elapsed=0;d.last=t;
  const bottom=this.bottom(art.across.at(-1));d.height=Math.max(0,target.surface.top-bottom*a.scale-d.top);d.duration=Math.max(100,Math.min(1800,1000*Math.sqrt(2*d.height/(900*a.scale))));
  a.svg.style.filter='';a.svg.style.cursor='grab';a.dragMarker?.remove();a.dragMarker=null;a.setAttribute('data-drag-state','fall');
  if(a.svg.hasPointerCapture?.(d.pointer))a.svg.releasePointerCapture(d.pointer);
  return true;
 },
 bottom(rows){return rows.findLastIndex(r=>/[^.]/.test(r))+1;},
 finish(a,s,x,t){
  const d=a.dragState;a.support=s;a.x=x;a.y=s.top;a.motion=null;a.route=[];a.idle=null;a.explorationResidence=null;a.paused=d?.paused??a.paused;a.deadline=t+2500;a.nextStartleAt=t+500;window.pixelCatExplorationV1?.observe(a,t);
  a.dragState=null;a.userHeld=false;a.svg.style.filter='';a.svg.style.cursor='grab';a.dragMarker?.remove();a.dragMarker=null;a.signature=null;a.setAttribute('data-drag-state','released');a.setAttribute('data-activity',a.paused?'paused':s.home?'home':'perch');a.setAttribute('data-pose','landed');a.needsMeasure=true;
 },
 restore(a){
  const d=a.dragState;if(!d)return;
  const s=a.surfaces?.find(s=>s.id===d.returnId&&s.el?.isConnected!==false)||a.surfaces?.find(s=>!s.narrow&&s.el?.isConnected!==false);
  if(s){this.finish(a,s,Math.max(s.min,Math.min(s.max,s.left+d.returnOffset)),performance.now());const rows=a.dragBinding.art.stand;a.draw(rows);a.setAttribute('data-pose','stand');a.setAttribute('data-activity','perch');a.setAttribute('data-frame-origin','human');}
  else {a.dragState=null;a.userHeld=false;a.svg.style.filter='';a.dragMarker?.remove();a.dragMarker=null;a.waitingForSurface=true;a.needsMeasure=true;}
  if(a.svg.hasPointerCapture?.(d.pointer))a.svg.releasePointerCapture(d.pointer);
 },
 tick(a,t,art){
  const d=a.dragState;if(!d)return false;
  if(a.suspended||!a.active||typeof document!=='undefined'&&document.hidden){this.restore(a);return true;}
  if(t>=(d.checkAt||0)){d.checkAt=t+700;if(a.blocked?.()){this.restore(a);return true;}}
  a.layer.style.visibility='visible';a.propScene?.tick(t,a);
  if(d.phase==='held'){this.paint(a,art);return true;}
  const s=a.surfaces?.find(s=>s.id===d.targetId&&s.el?.isConnected!==false);
  if(!s){this.restore(a);return true;}
  d.fromX+=s.left-d.surfaceLeft;d.fromTop+=s.top-d.surfaceTop;d.surfaceLeft=s.left;d.surfaceTop=s.top;
  d.elapsed+=Math.min(50,Math.max(0,t-d.last));d.last=t;
  const u=Math.min(1,d.elapsed/d.duration),x=Math.max(s.min,Math.min(s.max,s.left+d.offset)),rows=u<.85?(art.freefallSequence?.frames?.[0]||art.across[2]):art.across.at(-1),end=s.top-this.bottom(rows)*a.scale;
  a.x=d.fromX+(x-d.fromX)*u;a.y=d.fromTop+(end-d.fromTop)*u*u+this.bottom(rows)*a.scale;a.draw(rows);a.setAttribute('data-activity','drop');a.setAttribute('data-pose','drop');a.setAttribute('data-frame-origin',u<.85?(art.freefallSequence?.origins?.[0]||'mixed'):art.frameProvenance?.across?.at(-1)||'human');a.renderMoodDebug?.(t);a.status('Landing after pickup');
  if(u===1){a.publishLanding?.({kind:'jump',fromY:d.fromTop+23*a.scale,y:s.top,target:s,x},t);this.finish(a,s,x,t);}
  return true;
 },
 uninstall(a){
  const b=a.dragBinding;if(!b)return;
  a.userHeld=false;a.dragState=null;
  for(const [event,fn]of [['pointerdown',b.down],['pointermove',b.move],['pointerup',b.up],['pointercancel',b.cancel],['lostpointercapture',b.cancel],['click',b.click],['contextmenu',b.menu]])b.svg.removeEventListener(event,fn);
  window.removeEventListener('keydown',b.cancel);window.removeEventListener('blur',b.cancel);a.dragMarker?.remove();a.dragMarker=null;a.dragBinding=null;
 }
};
window.pixelCatDragV1=catDrag;
