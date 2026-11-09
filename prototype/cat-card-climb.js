// Optional native-card pilot. Existing props/background climbs retain their policy.
const cardClimbArt=()=>({...window.pixelCatRoamingArtV2,...window.pixelCatRoamingExtrasV1,idleSequences:{...window.pixelCatRoamingArtV2?.idleSequences,...window.pixelCatRoamingExtrasV1?.idleSequences,...window.pixelCatRoamingExtensionsV1?.idleSequences}});
const moveRect=(r,dx,dy)=>({...r,left:r.left+dx,right:r.right+dx,top:r.top+dy,bottom:r.bottom+dy});
window.pixelCatCardClimbV1={
 controls(a){
  const outer=a.shadowRoot?.querySelector('.cat-debug-host>details');if(!outer)return;const box=outer.querySelector('[data-cat-ui=\"climbing\"]')||outer,existing=outer.querySelector('[data-card-climb-preview]');if(existing){existing.disabled=!a.config.card_climbing;if(existing.parentElement!==box)box.append(existing);return;}
  const button=document.createElement('button');button.textContent='Try visible wall transfer';button.disabled=!a.config.card_climbing;button.setAttribute('data-card-climb-preview','');button.title='Experimental checked transfer to a visible card. Manual preview can bypass an ordinary route; autonomous routes prefer walking and jumping.';
  button.onclick=()=>{if(a.climb||a.motion||a.carriedToy||a.goal||a.command||a.previewPose||!a.config.card_climbing){a.status('Enable card climbing and try again when this cat is resting');return;}let next;for(const s of [...a.surfaces].filter(s=>s.id!==a.support?.id).sort((s,t)=>s.top-t.top)){next=this.route(a,s,a.support,true)?.[0];if(next)break;}if(!next){a.status('No checked visible-face transfer from here');return;}a.paused=false;a.idle=null;a.route=[{...next,preview:true}];this.start(a,a.route[0],performance.now());};box.append(button);
 },
 homeOwner(el){for(let p=el;p;p=p.parentElement||p.getRootNode?.()?.host)if(p.localName==='pixel-cat-home')return p;return null;},
 reconcile(a,manual=false){
  if(!manual&&!a.climb?.nativeTransfer&&!a.config?.card_climbing&&!a.debug?.verticalSurfaces&&!a.debug?.surfaces){a.cardGeometry=null;return null;}
  const old=a.cardGeometry,records=a.verticalCardRects,frames=window.pixelCatClimbAssetsV1?.centred.front.frames;
  if(!records||!frames||!a.worldRect||typeof getComputedStyle!=='function')return null;
  if(old?.records===records&&old.surfaces===a.surfaces&&old.scale===a.scale)return old;
  this.controls(a);
  const generation=(old?.generation||0)+1,byOwner=new Map(),sources=[...records],included=new Set(records.map(v=>v.el)),denied=new Map();
  // Detection retains excluded outer home cards without granting any affordance.
  for(const el of a.cardPanelElements||[]){if(included.has(el))continue;const owner=this.homeOwner(el);if(!owner||el!==owner.shadowRoot?.querySelector('ha-card'))continue;const reason=!owner.active?'Home inactive · outline only':owner.config?.show_home===false?'Home hidden · outline only':!a.config.shared_home_surfaces||!owner.config?.shared_home_surfaces?'Sharing off · both homes must opt in':'Home excluded · outline only';sources.push({el,r:window.pixelCatSurfaceWorldV1.rect(a.root,el),label:owner.config?.name||'Cat home'});included.add(el);denied.set(a.surfaceId(el),reason);a.observer?.observe(el);}
  const panels=snapshotVerticalPanels(sources.map(v=>({...v,id:a.surfaceId(v.el),label:v.label||a.surfaces.find(s=>s.el===v.el)?.label?.replace(/ · top$/,'')||v.el.localName})),a.worldRect);
  for(const p of panels)p.permissionReason=denied.get(p.id);
  for(const v of sources)byOwner.set(a.surfaceId(v.el),v.el);
  const supports=a.surfaces.filter(s=>!s.home&&!s.bed&&!s.narrow).map(s=>({...s,ownerId:a.surfaceId(s.el),connected:s.el?.isConnected!==false}));
  const found=discoverVerticalSurfaces({panels,supports,world:a.worldRect,scale:a.scale,frame:frames[0],frames,generation});
  return a.cardGeometry={...found,panels,byOwner,records,surfaces:a.surfaces,scale:a.scale,generation,cache:new Map()};
 },
 shift(a,dx,dy){if(a.verticalCardRects)a.verticalCardRects=a.verticalCardRects.map(v=>({...v,r:{...moveRect(v.r,dx,dy),width:v.r.width,height:v.r.height}}));const g=a.cardGeometry;if(!g)return;g.panels=g.panels.map(p=>({...p,rect:moveRect(p.rect,dx,dy),clip:moveRect(p.clip,dx,dy),blockers:p.blockers.map(r=>moveRect(r,dx,dy))}));g.faces=g.faces.map(f=>({...f,rect:moveRect(f.rect,dx,dy),grips:moveRect(f.grips,dx,dy)}));g.tops=g.tops.map(t=>({...t,left:t.left+dx,right:t.right+dx,min:t.min+dx,max:t.max+dx,top:t.top+dy}));g.records=a.verticalCardRects;g.surfaces=a.surfaces;g.cache.clear();},
 route(a,target,origin,fresh=false){
  if(target?.tree)return this.treeRoute(a,target,origin);
  if(a.config?.card_climbing!==true||!origin||!target||a.carriedToy||target.bed||target.narrow||Math.abs(origin.top-target.top)<8*a.scale)return null;
  const g=this.reconcile(a);if(!g)return null;
  const key=origin.id+'>'+target.id+':'+Math.round(a.x/a.scale),cached=g.cache.get(key);if(!fresh&&cached!==undefined)return cached;
  const model=window.pixelCatClimbModelV1,art=cardClimbArt(),frame=window.pixelCatClimbAssetsV1.centred.front.frames[0],probe=model.runtimeProbe(a.constructor,art,{...a.config,grip_max_rise:30,climbWorld:a.worldRect},a.scale),owner=g.panels.find(p=>g.byOwner.get(p.id)===target.el&&Math.abs(target.top-p.rect.top)<.5);
  let landing=target;if(owner){landing=g.tops.find(t=>t.sourceId===target.id||t.id===target.id);if(!landing){g.cache.set(key,null);return null;}}
  const candidates=[...g.faces].sort((f,h)=>Math.abs(f.grips.left-a.x)+Math.abs(f.grips.top-target.top)-Math.abs(h.grips.left-a.x)-Math.abs(h.grips.top-target.top)).slice(0,3);let best;
  for(const face of candidates){const result=planVerticalTransfer({face,from:origin,target:landing,startX:a.x,world:a.worldRect,scale:a.scale,frame,probe,framePlacement:model.framePlacement,generation:g.generation,maxChecks:32,clear:(s,x)=>a.social?.clear(s,x)!==false});if(result.ok&&(!best||result.route.cost<best.result.route.cost))best={face,result,landing};}
  const path=best?[{climbRoute:true,nativeTransfer:true,fromId:origin.id,surface:target,kind:best.result.route.kind,choice:best}]:null;
  if(g.cache.size>=64)g.cache.delete(g.cache.keys().next().value);g.cache.set(key,path);return path;
 },
 treeRoute(a,target,origin){
  if(!origin||(!origin.home&&!origin.tree)||origin.id!==a.support?.id||a.config.climbing===false||a.carriedToy||target.narrow)return null;
  const fromLevel=origin.tree||0,toLevel=target.tree;
  if(Math.abs(toLevel-fromLevel)!==1)return null;
  const face=window.pixelCatTreeV1?.face(a,Math.max(fromLevel,toLevel));
  if(!face)return null;
  const model=window.pixelCatClimbModelV1,frame=window.pixelCatClimbAssetsV1.frames.filter(f=>f.role==='cycle').at(-1);
  face.grips.left=face.grips.right=face.rect.left;
  const probe=model.runtimeProbe(a.constructor,cardClimbArt(),{...a.config,grip_max_rise:30,climbWorld:a.worldRect},a.scale);
  const result=planVerticalTransfer({face,from:origin,target,startX:a.x,world:a.worldRect,scale:a.scale,frame,probe,framePlacement:model.framePlacement,mode:'climb',side:'left',maxChecks:48,clear:(s,x)=>a.social?.clear(s,x)!==false});
  return result.ok?[{climbRoute:true,nativeTransfer:true,tree:true,fromId:origin.id,surface:target,kind:result.route.kind,choice:{face,result,landing:target,side:'left'}}]:null;
 },
 wallRoute(a,only){
  if(!a.support||a.carriedToy)return null;
  const g=this.reconcile(a,true);if(!g)return null;
  const model=window.pixelCatClimbModelV1,frame=window.pixelCatClimbAssetsV1.centred.front.frames[0],probe=model.runtimeProbe(a.constructor,cardClimbArt(),{...a.config,grip_max_rise:30,climbWorld:a.worldRect},a.scale);
  const distance=(x,y,r)=>Math.hypot(Math.max(r.left-x,0,x-r.right),Math.max(r.top-y,0,y-r.bottom));
  const faces=[...g.faces].filter(f=>!only||f.id===only.choice.face.id).sort((f,h)=>distance(a.x+12*a.scale,a.y,f.rect)-distance(a.x+12*a.scale,a.y,h.rect));
  const supports=a.surfaces.filter(s=>!s.bed&&!s.narrow&&s.el?.isConnected!==false),paths=new Map([[a.support.id,[]]]);let budget=512;
  for(const face of faces){
   const nearby=[...supports].sort((s,t)=>distance((s.min+s.max)/2,s.top,face.rect)-distance((t.min+t.max)/2,t.top,face.rect)),origins=only?[a.support]:[a.support,...nearby.filter(s=>s.id!==a.support.id).slice(0,3)];
   for(const origin of origins){
    if(!paths.has(origin.id))paths.set(origin.id,window.pixelCatSurfaceWorldV1.route(a,origin,a.support));
    const approach=paths.get(origin.id);if(!approach)continue;
    const targets=only?[a.surfaces.find(s=>s.id===only.surface.id)]:[...nearby.filter(s=>s.id!==origin.id).slice(0,5),origin];let best;
    for(const target of targets){
     if(!target||budget<=0)continue;
     const owner=g.panels.find(p=>g.byOwner.get(p.id)===target.el&&Math.abs(target.top-p.rect.top)<.5),landing=owner?g.tops.find(t=>t.sourceId===target.id||t.id===target.id):target;if(!landing)continue;
     const startX=origin===a.support?a.x:Math.max(origin.min,Math.min(origin.max,face.grips.left-12*a.scale));
     const result=planVerticalTransfer({face,from:origin,target:landing,startX,world:a.worldRect,scale:a.scale,frame,probe,framePlacement:model.framePlacement,generation:g.generation,maxChecks:Math.min(24,budget),mode:'wall-jump',clear:(s,x)=>a.social?.clear(s,x)!==false});budget-=result.stats.checks;
     if(result.ok&&(!best||result.route.cost<best.result.route.cost))best={face,result,landing,target};
    }
    if(best)return [...approach,{climbRoute:true,nativeTransfer:true,manualWallJump:true,preview:true,fromId:origin.id,surface:best.target,kind:'wall-jump',choice:best}];
   }
   if(budget<=0)break;
  }
  return null;
 },
 compile(a,choice){
  const model=window.pixelCatClimbModelV1,assets=window.pixelCatClimbAssetsV1,r=choice.result.route,f=choice.face,scene=a.climb.scene,segments=[],grips=[];let clock=0;
  const add=(s,ms)=>{segments.push({...s,start:clock,end:clock+ms,ms});clock+=ms;};
  if(r.approach)add({kind:'approach',phase:'Walking to visible face',jump:r.approach},r.approach.duration);
  add({kind:'attach',phase:'Leaping to card grip',jump:r.enter},r.enter.duration);
  const hold=root=>add({kind:'grip',phase:'Checked card grip',frame:r.frame,from:{...root},to:{...root}},160);hold(r.entryRoot);
  let root={...r.entryRoot},hops=0;const side=choice.side||'centre-front';scene.face={id:f.id,x:choice.side?root.x:root.x-8*a.scale,right:choice.side?f.rect.right:root.x+8*a.scale,top:f.grips.top-4*a.scale,bottom:f.rect.bottom,grippy:true,passThrough:true};scene.gripCeilingY=f.grips.top;scene.gripFloorY=f.grips.bottom;
  while(Math.abs(r.releaseRoot.y-root.y)>.01&&hops++<100){const plan=model.planClimb(a.climb.draft,{ground:()=>null,release:()=>null},{state:{surfaceId:f.id,root,side,frame:r.frame},action:r.releaseRoot.y<root.y?'up':'down',distanceCells:Math.abs(r.releaseRoot.y-root.y)/a.scale},{scene});if(!plan.ok)return null;for(const s of plan.segments.slice(1))add(s,s.ms);grips.push(...plan.grips);const next=plan.grips.at(-1).root;if(Math.abs(next.y-root.y)<.001)return null;root={...next};}
  if(hops>=100)return null;hold(r.releaseRoot);const releaseAt=clock;
  // Keep original support identity for ordinary landing/lifecycle ownership.
  r.exit.motion.target={...r.exit.motion.target,source:a.climb.goalSurface};add({kind:'jump',phase:r.kind==='wall-jump'?'Wall jump to landing':'Leaping off card',jump:r.exit},r.exit.duration);
  return {ok:true,scene,segments,grips,duration:clock,goalReached:true,releaseAt};
 },
 start(a,next,t){
  const C=window.pixelCatClimbV1,target=a.surfaces.find(s=>s.id===next.surface.id),ordinary=target&&window.pixelCatSurfaceWorldV1.route(a,target,a.support),last=a.route.at(-1);
  if(ordinary&&!next.preview&&!next.tree){a.route=[...ordinary,...last?.settle?[last]:[]];return true;}
  const current=next.manualWallJump?this.wallRoute(a,next)?.at(-1):this.route(a,target,a.support,true)?.[0];if(!current||a.support.id!==next.fromId){a.route=[];a.deadline=t+1000;if(next.manualWallJump){a.setAttribute('data-wall-jump-command','landing changed');a.status('Wall jump cancelled: entry or landing changed');}return true;}
  const choice=current.choice,remaining=a.route.slice(1),prop={id:'card-grip-'+a.ownerKey,virtual:true,claimedBy:a.ownerKey,scale:a.scale,node:{isConnected:true}},assets=window.pixelCatClimbAssetsV1,below=Math.max(...assets.centred.front.frames.map(f=>f.rows.findLastIndex(r=>r.includes('#')||r.includes('R'))+1-f.anchor.y));
  a.climb={stage:'approach',virtual:true,prop,face:{surface:a.support,below,direction:1},base:a.support,origin:a.x,goalSurface:target,remaining,started:t,last:t,age:0,decisions:0,serial:0};
  if(!C.setup(a,cardClimbArt())){C.cancel(a,'native entry unavailable',false);a.route=[];a.deadline=t+1000;return true;}
  const plan=this.compile(a,choice);if(!plan){C.cancel(a,'native grip path unavailable',false);a.route=[];a.deadline=t+1000;return true;}
  a.climb.plan=plan;a.climb.elapsed=0;a.climb.nativeTransfer={faceId:choice.face.id,rect:{...choice.face.rect},node:next.tree?a.catTree?.node:a.cardGeometry.byOwner.get(choice.face.panelId),tree:next.tree?Math.max(a.support.tree||0,target.tree):0,kind:choice.result.route.kind,releaseAt:plan.releaseAt};a.route=[];a.setAttribute('data-native-transfer',choice.result.route.kind);if(next.manualWallJump)a.setAttribute('data-wall-jump-command','wall-jump');return true;
 },
 audit(a){const e=a.climb,n=e.nativeTransfer;if(!n)return true;if(n.node?.isConnected===false)return false;const base=a.surfaces.find(s=>s.id===e.base.id),target=a.surfaces.find(s=>s.id===e.goalSurface.id),face=n.tree?window.pixelCatTreeV1?.face(a,n.tree):this.reconcile(a)?.faces.find(f=>f.id===n.faceId);if(!base||!target||!face)return false;const dx=base.left-e.geometry[0],dy=base.top-e.geometry[1];if(['left','right','top','bottom'].some(k=>Math.abs(face.rect[k]-n.rect[k]-(k==='left'||k==='right'?dx:dy))>.75))return false;
  if(!n.releaseChecked&&e.elapsed+50>=n.releaseAt){const flight=e.plan.segments.at(-1).jump,x=flight.landingX+dx;if(x<target.min||x>target.max||a.social?.clear(target,x)===false)return false;n.releaseChecked=true;}return true;
 },
 debug(a,add){
  const g=this.reconcile(a);if(!g)return;for(const p of g.panels){if(!p.visible||!p.connected)continue;const r=p.rect;add('rect',{x:r.left,y:r.top,width:r.right-r.left,height:r.bottom-r.top,rx:p.radius,fill:'none',stroke:'#008da8','stroke-width':1.5,'data-card-outline':p.id,'data-card-permission':p.permissionReason||'eligible','stroke-dasharray':p.permissionReason?'4 3':'none'});if(p.permissionReason)add('text',{x:r.left+5,y:r.top+14,fill:'#78623b','font-size':10,'data-card-exclusion':p.id},p.permissionReason);}
  if(!a.debug.verticalSurfaces)return;
  for(const f of g.faces){const r=f.rect;add('rect',{x:r.left,y:r.top,width:r.right-r.left,height:r.bottom-r.top,fill:'#a340c0','fill-opacity':.07,stroke:'#a340c0','stroke-width':1.5,'stroke-dasharray':'4 3','data-card-grip':f.id});}
  for(const t of g.tops)add('line',{x1:t.left,y1:t.top,x2:t.right,y2:t.top,stroke:'#079a63','stroke-width':3,'data-card-top':t.id});
  for(const r of g.rejected){const p=g.panels.find(p=>p.id===r.id);if(p?.visible&&!p.permissionReason)add('text',{x:p.rect.left+4,y:p.rect.top+14,fill:'#a45226','font-size':10},r.reason);}
  const w=a.worldRect;add('text',{x:w.left+10,y:w.top+16,fill:'#17383d',stroke:'#fff','stroke-width':3,'paint-order':'stroke','font-size':12},'Cyan: card outline · Purple: exposed grip area · Green: clear top');
 }
};
