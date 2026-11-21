// Temporary focus reuses the normal reserved scratch episode and authored contacts.
const scratchContactBands=new WeakMap();
window.pixelCatLabScratchV1={
 enabled(a){return !!(a.config.native_vertical_surfaces&&a.config.social_behaviour&&a.config.interaction_behaviour);},
 ready(a){return !a.carriedToy&&!!a.decisionLayer?.()?.available(a);},
 reset(view){
  for(const a of view.scratchCats||[]){if(a.labScratch?.labView!==view)continue;if(a.social?.episode===a.labScratch)a.social.finish('scratch focus ended');a.labScratch=null;a.labPose=null;a.deadline=0;if(a.idle?.pose==='postScratch')a.idle.poseUntil=0;}
  view.scratchCats?.clear();
 },
 contactBand(a){
  const clip=a.decisionLayer?.()?.art?.().idleSequences?.postScratch;if(!clip)return null;
  if(!scratchContactBands.has(clip)){
   const driver=clip.animationTracks?.tracks.find(t=>t.id===clip.animationTracks.driver),ys=[];
   for(const event of driver?.events||[]){const i=clip.frameIds.indexOf(event.frameId),anchor=clip.anchors[i];if(anchor&&Math.abs(event.x-anchor[0]-9)<=2&&Number.isFinite(event.y))ys.push(event.y-anchor[1]);}
   scratchContactBands.set(clip,ys.length?{top:Math.min(...ys)-1,bottom:Math.max(...ys)}:null);
  }
  return scratchContactBands.get(clip);
 },
 exposed(a,face,g){
  const p=g?.panels.find(p=>g.byOwner.get(p.id)===face.prop.visualOwner),r=p?.rect,c=p?.clip,w=a.worldRect;
  if(face.prop.visualOwner.isConnected===false||!p||!p.connected||!p.visible||(!p.painted&&p.climb!=='on')||p.climb==='off'||p.permissionReason||p.unsupported)return false;
  const band=this.contactBand(a);if(!band)return false;
  const radius=p.radius||0,x=face.x,top=face.surface.top+band.top*a.scale,bottom=face.surface.top+band.bottom*a.scale;
  if(![x,top,bottom,r.left,r.right,r.top,r.bottom].every(Number.isFinite)||top>=bottom||top<r.top+radius||bottom>r.bottom-radius)return false;
  for(const box of [c,w].filter(Boolean))if(x<box.left||x>box.right||top<box.top||bottom>box.bottom)return false;
  return !(p.blockers||[]).some(b=>b.left<x+a.scale&&b.right>x-a.scale&&b.top<bottom&&b.bottom>top);
 },
 offer(a,t,report){
  const scratch=window.pixelCatVerticalScratchV1,layer=a.decisionLayer(),g=window.pixelCatCardClimbV1?.reconcile(a,true);
  const native=(a.verticalFaces||[]).filter(f=>f.prop.visualOwner.isConnected!==false&&this.exposed(a,f,g));
  if(!native.length){report('No usable edge');return false;}
  const allowed=new Set(native.map(f=>f.id)),faces=scratch.faces(layer).filter(f=>f.prop.native&&allowed.has(f.id)).sort((f,h)=>Math.hypot(f.origin-a.x,f.surface.top-a.y)-Math.hypot(h.origin-a.x,h.surface.top-a.y)).slice(0,8);
  if(!faces.length){report('No safe stance or route');return false;}
  if(a.ensureMood().random()>=.8*(1-.65*(a.ensureMood().values.sleepiness??.5))){report('Declined');return false;}
  for(const face of faces)if(scratch.start(layer,face,t)){
   const ep=layer.episode;ep.labReport=report;ep.labLast=t;ep.labRoot=a.root;a.labScratch=ep;report('Attempted');return true;
  }
  report('No safe stance or route');return false;
 },
 tick(a,t,focus){
  const ep=a.labScratch,layer=a.social;if(!ep)return false;
  if(layer?.episode===ep){
   if(focus!=='edgeScratch'||a.root!==ep.labRoot||!this.enabled(a)||a.command||a.goal||a.previewPose||a.carriedToy){layer.finish('scratch focus ended');}
   else {
    const raw=Math.max(0,t-ep.labLast);ep.labLast=t;layer.clock+=raw>1000?0:Math.min(50,raw);layer.world.tick(t);
    const face=(a.verticalFaces||[]).find(f=>f.id===ep.faceId),g=window.pixelCatCardClimbV1?.reconcile(a,true);
    if(!face||!this.exposed(a,face,g))layer.finish('scratch edge unavailable');
    else window.pixelCatVerticalScratchV1.advance(layer,t);
   }
  }
  a.propScene?.tick(t,a);
  if(layer?.episode===ep)return true;
  ep.labView?.scratchCats.delete(a);a.labScratch=null;if(a.idle?.pose==='postScratch')a.idle.poseUntil=t;
  return false;
 }
};
