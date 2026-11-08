const nativeScratchCards=new WeakMap();let nativeScratchSerial=0;
// Explicit authored faces share one schema; automatic card-edge discovery is deferred.
window.pixelCatVerticalScratchV1={
 reconcile(a){
  window.pixelCatCardClimbV1?.reconcile(a);
  a.verticalFaces=[];a.verticalRejected=[];if(!a.config.native_vertical_surfaces&&!a.debug?.verticalSurfaces)return;const floors=(a.surfaces||[]).filter(s=>!s.home&&!s.bed&&!s.foodOwner&&s.el&&!s.narrow).sort((a,b)=>a.top-b.top);
  for(const {el,r}of a.verticalCardRects||[])for(const [side,x,direction]of [['left',r.left,1],['right',r.right,-1]]){
   if(r.bottom-r.top<17*a.scale)continue;let state=nativeScratchCards.get(el);if(!state){state=new WeakMap();nativeScratchCards.set(el,state);}
   let lo=0,hi=floors.length;while(lo<hi){const mid=(lo+hi)>>1;if(floors[mid].top<r.top+20*a.scale)lo=mid+1;else hi=mid;}
   for(let i=lo;i<floors.length&&floors[i].top<=r.bottom+3*a.scale;i++){const surface=floors[i];
    const origin=Math.round((x-(direction>0?18:5)*a.scale)/a.scale)*a.scale;
    if(origin<surface.min||origin>surface.max){if(a.debug?.verticalSurfaces)a.verticalRejected.push({x,top:r.top,bottom:r.bottom,reason:'no supported stance',surface});continue;}
    let supports=state.get(surface.el);if(!supports){supports=new Map();state.set(surface.el,supports);}const key=side+':'+surface.id.slice(surface.id.indexOf(':')+1);let prop=supports.get(key);
    if(!prop){prop={id:'native-edge-'+(++nativeScratchSerial),native:true,visualOwner:el,asset:{affordance:'scratch'},claimedBy:null,cooldownUntil:0};supports.set(key,prop);}
    a.verticalFaces.push({id:prop.id+':'+side,prop,surface,x,top:Math.max(r.top,surface.top-20*a.scale),bottom:Math.min(r.bottom,surface.top-3*a.scale),direction,origin,bearing:x-direction*9*a.scale,source:'native card edge · opt-in'});
   }
  }
 },
 publish(layer){if(!layer.actor.config.native_vertical_surfaces)return;for(const f of layer.actor.verticalFaces||[])if(f.prop.visualOwner.isConnected!==false)layer.world.props.set(f.prop.id,{id:f.prop.id,kind:'vertical-face',x:f.x,y:f.bottom,width:2,height:f.bottom-f.top,surface:f.surface.el,top:f.surface.top,moving:false,at:layer.world.clock});},
 stats(layer,key){const q=layer.scratchStats??={};q[key]=(q[key]||0)+1;layer.actor.setAttribute?.('data-scratch-stats',JSON.stringify(q));},
 bind(p,members,root){
  const n=p.node;n.dataset.catPost='';n.setAttribute('role','button');n.setAttribute('tabindex','0');n.setAttribute('aria-label','Invite a nearby cat to scratch');n.style.pointerEvents='auto';n.style.cursor='pointer';
  const offer=e=>{e.stopPropagation();this.invite(p,members(),p.homeOwner?.root??root,performance.now());};
  n.addEventListener?.('pointerdown',e=>e.stopPropagation());n.addEventListener?.('click',offer);
  n.addEventListener?.('keydown',e=>{if(!e.repeat&&(e.key==='Enter'||e.key===' ')){e.preventDefault();offer(e);}});
 },
 invite(p,members,root,t){
  if(t<(p.inviteAfter||0))return false;p.inviteAfter=t+4000;
  const choices=[];
  for(const a of new Set(members)){
   if(a.root!==root||!a.isConnected||!a.active||a.idle?.pose==='sleep'||!a.config.social_behaviour||!a.config.interaction_behaviour)continue;
   const layer=a.decisionLayer?.();if(!layer?.enabled()||!layer.available(a)||layer.episode||layer.scene.has(a))continue;
   const face=this.faces(layer).filter(f=>f.prop===p).sort((f,g)=>Math.abs(f.origin-a.x)-Math.abs(g.origin-a.x))[0];if(!face)continue;
   const distance=Math.hypot(face.x-(a.x+12*a.scale),face.surface.top-a.y);if(distance<=96*a.scale)choices.push({a,layer,face,distance});
  }
  choices.sort((a,b)=>a.distance-b.distance);
  for(const {a,layer,face}of choices){const mood=a.ensureMood();if(mood.random()>=.8*(1-.65*(mood.values?.sleepiness??.5)))continue;
   if(this.start(layer,face,t)){p.node.dataset.scratchResponse='accepted';layer.log('scratch invitation accepted',{post:p.id});return a;}
  }
  p.node.dataset.scratchResponse='no nearby willing cat';return false;
 },
 faces(layer,routed=true,includeBusy=false){const a=layer.actor,scene=a.propScene,out=[],entries=[...(scene?.enabled?scene.props:[]).map(prop=>({prop})),...window.pixelCatHomePostsV1?.entries(layer)||[]];
  for(const entry of entries){const p=entry.prop;if(p.asset.affordance!=='scratch'||!includeBusy&&(p.claimedBy||p.cooldownUntil>(p.homeOwner?layer.world.clock:scene?.time||0)))continue;const s=entry.surface||a.surfaces.find(s=>s.el===p.surfaceEl&&s.id.slice(s.id.indexOf(':'))===p.surfaceSuffix);
   if(!s||s.narrow||routed&&(!a.pathTo(s)||!a.pathTo(a.home,s))||p.asset.height*p.scale<(p.igloo?10:18)*a.scale)continue;
   const padding=Math.max(4*p.scale,p.asset.width*p.scale/2),left=entry.left??s.left+padding+(s.right-s.left-2*padding)*p.u-p.asset.width*p.scale/2;
   for(const [side,cell,direction]of (p.scratchFaces||[['left',4,1],['right',8,-1]])){const x=left+cell*p.scale,origin=Math.round((x-(direction>0?18:5)*a.scale)/a.scale)*a.scale;
    if(origin>=s.min&&origin<=s.max&&(!routed||layer.clear(s,origin,p.igloo?window.pixelCatHomeLifeV1.occupants(p.homeOwner):[])&&(!a.support||a.support.el!==s.el||layer.corridor(s,origin,p.igloo?window.pixelCatHomeLifeV1.occupants(p.homeOwner):[]))))out.push({id:p.id+':'+side,prop:p,surface:s,x,top:s.top-(p.igloo?13:20)*p.scale,bottom:s.top-3*p.scale,direction,origin,bearing:x-direction*9*a.scale,source:'authored post face'});
   }
  }
  if(a.config.native_vertical_surfaces)for(const f of a.verticalFaces||[]){const p=f.prop;if(!includeBusy&&(p.claimedBy||p.cooldownUntil>layer.world.clock)||p.visualOwner.isConnected===false)continue;if(!routed||a.pathTo(f.surface)&&a.pathTo(a.home,f.surface)&&layer.clear(f.surface,f.origin)&&(!a.support||a.support.el!==f.surface.el||layer.corridor(f.surface,f.origin)))out.push(f);}
  return out;
 },
 decide(layer,t,art){const a=layer.actor;if(!layer.enabled()||!a.config.social_behaviour||a.idle?.pose==='sleep'&&a.idle.poseUntil>t||!layer.available(a)||layer.episode||!art.idleSequences?.postScratch||layer.clock<(layer.nextVertical||0))return false;
  const r=()=>a.ensureMood().random();layer.nextVertical=layer.clock+8000+7000*r();this.stats(layer,'checks');
  const faces=this.faces(layer).filter(f=>{if(f.prop.igloo)return false;const m=layer.propMemory.get(f.prop.id);return m&&layer.clock-m.observedAt<1800;});if(!faces.length)return false;this.stats(layer,'noticedOpportunities');if(r()>.22)return false;this.stats(layer,'chosen');
  return this.start(layer,faces[Math.floor(r()*faces.length)],t);
 },
 start(layer,face,t){const a=layer.actor,path=a.pathTo(face.surface);if(!path||!layer.available(a)||layer.episode||face.prop.claimedBy||!layer.clear(face.surface,face.origin,face.prop.igloo?window.pixelCatHomeLifeV1.occupants(face.prop.homeOwner):[]))return false;
  face.prop.claimedBy=a.ownerKey;const ep={kind:'vertical-scratch',interaction:true,initiator:a,participants:[a],registry:layer.scene,faceId:face.id,prop:face.prop,surface:face.surface,offset:face.origin-face.surface.left,stage:'approach',expires:layer.clock+30000};
  layer.episode=ep;layer.scene.set(a,ep);a.route=[...path,{settle:true,surface:face.surface,x:face.origin}];a.destinationId=face.surface.id;a.urgency='relaxed';a.deadline=t+30000;layer.log('scratch face approach',{face:face.id});return true;
 },
 advance(layer,t){const a=layer.actor,ep=layer.episode,p=ep.prop;
  const present=p?.native?a.config.native_vertical_surfaces&&(a.verticalFaces||[]).some(f=>f.prop===p)&&p.visualOwner.isConnected!==false:p?.homeOwner?window.pixelCatHomePostsV1?.entries(layer).some(e=>e.prop===p):a.propScene?.props.includes(p);
  if(!layer.enabled()||!p||p.claimedBy!==a.ownerKey||!present||a.goal||a.command||a.previewPose||a.play||a.mouthAction||a.userHeld||layer.clock>=ep.expires){layer.finish('scratch interrupted or finished');return;}
  if(a.motion||a.route?.length)return;
  // Read the reserved face without releasing ownership to competing actors.
  const held=p.claimedBy;p.claimedBy=null;const face=this.faces(layer,false).find(f=>f.id===ep.faceId);p.claimedBy=held;
  if(!face){layer.finish('scratch face no longer reachable');return;}
  ep.surface=face.surface;ep.offset=face.origin-face.surface.left;ep.bearing=face.bearing;
  const frame=layer.frame;if(ep.stage==='stroke'&&a.idle?.pose==='postScratch'&&frame?.rows&&frame.placement&&ep.contactFrame!==a.getAttribute?.('data-frame')){ep.contactFrame=a.getAttribute?.('data-frame');const hit=frame.rows.some((row,y)=>y<22&&[...row].some((cell,x)=>cell==='F'&&Math.abs(frame.placement.x+(frame.facing<0?23-x:x)*a.scale-face.x)<=2*a.scale&&frame.placement.top+y*a.scale>=face.top-2*a.scale&&frame.placement.top+y*a.scale<=face.bottom+2*a.scale));if(hit){ep.contacts=(ep.contacts||0)+1;this.stats(layer,'contacts');const index=Number(a.getAttribute('data-frame').split('-').at(-1))-1,clip=layer.art?.().idleSequences?.postScratch,event=clip?.animationTracks?.tracks.find(x=>x.id===clip.animationTracks.driver)?.events?.find(e=>e.frameId===clip.frameIds[index]);if(event){const point={x:frame.placement.x+((frame.facing<0?23-event.x:event.x)+.5)*a.scale,y:frame.placement.top+(event.y+.5)*a.scale};window.pixelCatEffectsV1?.stroke(layer,face,point,index,t);}}}
  if(layer.clock>=(ep.clearAt||0)){ep.clearAt=layer.clock+500;if(!layer.clear(face.surface,face.origin,face.prop.igloo?window.pixelCatHomeLifeV1.occupants(face.prop.homeOwner):[])){layer.finish('scratch stance occupied');return;}}
  if(a.support.el!==face.surface.el||Math.abs(a.support.top-face.surface.top)>2||Math.abs(a.x-face.origin)>5*a.scale){layer.finish('scratch route ended elsewhere');return;}
  if(ep.stage==='approach'){ep.stage='stroke';ep.expires=layer.clock+6200;a.facing=face.direction;a.idle=null;a.deadline=t+6200;this.stats(layer,'strokes');layer.log(p.native?'scratching card edge':'scratching post',{face:face.id});}
 },
 prepare(layer,idle){if(layer.episode?.kind==='vertical-scratch'&&idle.pose==='postScratch')idle.contactX=layer.episode.bearing;},
 release(layer){const ep=layer.episode,p=ep.prop;window.pixelCatEffectsV1?.resetPost(p);if(ep.stage==='stroke')this.stats(layer,layer.clock>=ep.expires&&ep.contacts?'completed':'interrupted');if(p?.claimedBy===layer.actor.ownerKey){p.claimedBy=null;p.cooldownUntil=(p.homeOwner||p.native?layer.world.clock:layer.actor.propScene?.time||0)+60000+60000*layer.actor.ensureMood().random();}layer.nextVertical=layer.clock+45000;}
};
