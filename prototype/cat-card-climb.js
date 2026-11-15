// Optional native-card pilot. Existing props/background climbs retain their policy.
const cardClimbArt=()=>({...window.pixelCatRoamingArtV2,...window.pixelCatRoamingExtrasV1,idleSequences:{...window.pixelCatRoamingArtV2?.idleSequences,...window.pixelCatRoamingExtrasV1?.idleSequences,...window.pixelCatRoamingExtensionsV1?.idleSequences}});
const moveRect=(r,dx,dy)=>({...r,left:r.left+dx,right:r.right+dx,top:r.top+dy,bottom:r.bottom+dy});
window.pixelCatCardClimbV1={
 controls(a){
  const outer=a.shadowRoot?.querySelector('.cat-debug-host>details');if(!outer)return;const box=outer.querySelector('[data-cat-ui=\"climbing\"]')||outer,existing=outer.querySelector('[data-card-climb-preview]');if(existing){existing.disabled=!a.config.card_climbing;if(existing.parentElement!==box)box.append(existing);return;}
  const button=document.createElement('button');button.textContent='Try climbing a card';button.disabled=!a.config.card_climbing;button.setAttribute('data-card-climb-preview','');button.title='Climb an exposed card face, then leap to a checked landing.';
  button.onclick=()=>{if(a.climb||a.motion||a.carriedToy||a.goal||a.command||a.previewPose||!a.config.card_climbing){a.status('Enable card climbing and try again when this cat is resting');return;}if(!this.ascent(a,performance.now(),true))a.status('No reachable wall with room to climb and land higher');};box.append(button);
 },
 ascent(a,t,preview=false,accept,report,mode='ascent'){
  const from=a.support;
  if(!a.config.card_climbing||!from)return false;
  const world=window.pixelCatSurfaceWorldV1, across=mode.startsWith('card-');
  const geometry=across&&this.reconcile(a), origin=this.sourceCard(a,from);
  if(across&&(from.bed||!geometry?.faces.some(f=>geometry.byOwner.get(f.panelId)===origin))){
   report?.('Current card has no usable face');return false;
  }
  const tops=across&&new Set(geometry.tops.map(s=>s.sourceId));
  const distance=s=>Math.hypot(Math.max(s.min-a.x,0,a.x-s.max),from.top-s.top);
  const targets=a.surfaces.filter(s=>!s.tree&&!s.home&&!s.bed&&!s.narrow&&(across?s.el!==origin&&tops.has(s.id):from.top-s.top>=8*a.scale)).sort((x,y)=>distance(x)-distance(y)).slice(0,across?6:3);
  let hasReturn=false;
  for(const target of targets){
   if(!preview&&!world.route(a,a.home,target))continue;
   hasReturn=true;
   const next=this.route(a,target,from,true,mode)?.[0];
   if(!next)continue;
   if(accept&&!accept())return false;
   a.route=[next];this.start(a,next,t);
   if(a.climb){if(report){report('Attempted');a.climb.labReport=report;}a.paused=false;const pause=a.shadowRoot?.querySelector('[data-action="pause"]');if(pause)pause.textContent='Pause';return true;}
  }
  report?.(!targets.length?'No destination card':!hasReturn?'No way home':'No safe route');return false;
 },
 sourceCard(a,s){return s.el===a?a.shadowRoot?.querySelector('ha-card'):s.el;},
 homeOwner(el){for(let p=el;p;p=p.parentElement||p.getRootNode?.()?.host)if(p.localName==='pixel-cat-home')return p;return null;},
 reconcile(a,manual=false){
  if(!manual&&!a.climb?.nativeTransfer&&!a.config?.card_climbing&&!a.debug?.verticalSurfaces&&!a.debug?.surfaces){a.cardGeometry=null;return null;}
  const old=a.cardGeometry,records=a.verticalCardRects,frames=window.pixelCatClimbAssetsV1?.frames;
  if(!records||!frames||!a.worldRect||typeof getComputedStyle!=='function')return null;
  if(old?.records===records&&old.surfaces===a.surfaces&&old.scale===a.scale)return old;
  this.controls(a);
  const generation=(old?.generation||0)+1,byOwner=new Map(),sources=[...records],included=new Set(records.map(v=>v.el)),denied=new Map(),ownHome=a.shadowRoot?.querySelector('ha-card');
  // Detection retains excluded outer home cards without granting any affordance.
  for(const el of a.cardPanelElements||[]){if(included.has(el))continue;const owner=this.homeOwner(el);if(!owner||el!==owner.shadowRoot?.querySelector('ha-card'))continue;const reason=!owner.active?'Home inactive · outline only':owner.config?.show_home===false?'Home hidden · outline only':a.config.shared_home_surfaces===false||owner.config?.shared_home_surfaces===false?'Sharing off on one home':'Home excluded · outline only';sources.push({el,r:window.pixelCatSurfaceWorldV1.rect(a.root,el),label:owner.config?.name||'Cat home'});included.add(el);if(el!==ownHome||a.config.show_home===false)denied.set(a.surfaceId(el),reason);a.observer?.observe(el);}
  const panels=snapshotVerticalPanels(sources.map(v=>({...v,id:a.surfaceId(v.el),label:v.label||a.surfaces.find(s=>s.el===v.el)?.label?.replace(/ · top$/,'')||v.el.localName})),a.worldRect);
  for(const p of panels)p.permissionReason=denied.get(p.id);
  for(const v of sources)byOwner.set(a.surfaceId(v.el),v.el);
  const supports=a.surfaces.filter(s=>!s.home&&!s.bed&&!s.narrow).map(s=>({...s,ownerId:a.surfaceId(s.el),connected:s.el?.isConnected!==false}));
  const found=discoverVerticalSurfaces({panels,supports,world:a.worldRect,scale:a.scale,frame:frames[0],frames,generation});
  return a.cardGeometry={...found,ownHome,panels,byOwner,records,surfaces:a.surfaces,scale:a.scale,generation,cache:new Map()};
 },
 shift(a,dx,dy){if(a.verticalCardRects)a.verticalCardRects=a.verticalCardRects.map(v=>({...v,r:{...moveRect(v.r,dx,dy),width:v.r.width,height:v.r.height}}));const g=a.cardGeometry;if(!g)return;g.panels=g.panels.map(p=>({...p,rect:moveRect(p.rect,dx,dy),clip:moveRect(p.clip,dx,dy),blockers:p.blockers.map(r=>moveRect(r,dx,dy))}));g.faces=g.faces.map(f=>({...f,rect:moveRect(f.rect,dx,dy),grips:moveRect(f.grips,dx,dy)}));g.tops=g.tops.map(t=>({...t,left:t.left+dx,right:t.right+dx,min:t.min+dx,max:t.max+dx,top:t.top+dy}));g.records=a.verticalCardRects;g.surfaces=a.surfaces;g.cache.clear();},
 route(a,target,origin,fresh=false,mode='either',startX=a.x){
  if(target?.tree)return this.treeRoute(a,target,origin);
  if(a.config?.card_climbing!==true||!origin||!target||a.carriedToy||target.bed||target.narrow||!mode.startsWith('card-')&&Math.abs(origin.top-target.top)<8*a.scale)return null;
  const g=this.reconcile(a);if(!g)return null;
  const key=origin.id+'>'+target.id+':'+Math.round(startX/a.scale)+':'+mode,cached=g.cache.get(key);if(!fresh&&cached!==undefined)return cached;
  const owner=g.panels.find(p=>g.byOwner.get(p.id)===target.el&&Math.abs(target.top-p.rect.top)<.5);
  let landing=target;if(owner){landing=g.tops.find(t=>t.sourceId===target.id||t.id===target.id);if(!landing){g.cache.set(key,null);return null;}}
  const candidates=g.faces.filter(f=>mode.startsWith('card-')?g.byOwner.get(f.panelId)===this.sourceCard(a,origin):g.byOwner.get(f.panelId)!==g.ownHome).sort((f,h)=>Math.abs(f.grips.left-a.x)+Math.abs(f.grips.top-target.top)-Math.abs(h.grips.left-a.x)-Math.abs(h.grips.top-target.top)).slice(0,3);let best;
  for(const face of candidates){const result=this.edge(a,face,origin,landing,startX,mode);if(result.ok&&(!best||result.route.cost<best.result.route.cost))best={face,result,landing};}
  const path=best?[{climbRoute:true,nativeTransfer:true,fromId:origin.id,surface:target,kind:best.result.route.kind,mode,choice:best}]:null;
  if(g.cache.size>=64)g.cache.delete(g.cache.keys().next().value);g.cache.set(key,path);return path;
 },
 prefer(a,target){
  const t=performance.now(),from=a.support;
  if(!a.config.card_climbing||!from||!target||target.tree||target.el===this.sourceCard(a,from)||t<(a.wallRetry||0))return null;
  a.wallRetry=t+12000;
  const roll=a.ensureMood().random();if(roll>=.20)return null;
  const world=window.pixelCatSurfaceWorldV1;
  if(world.route(a,target,from)?.length!==1||!world.route(a,a.home,target))return null;
  return roll>=.08&&this.route(a,target,from,true,'card-ascent')||this.route(a,target,from,true,'card-wall-jump');
 },
 treeRoute(a,target,origin){
  if(!origin||(!origin.home&&!origin.tree)||origin.id!==a.support?.id||a.config.climbing===false||a.carriedToy||target.narrow)return null;
  const fromLevel=origin.tree||0,toLevel=target.tree;
  if(Math.abs(toLevel-fromLevel)!==1)return null;
  const face=window.pixelCatTreeV1?.face(a,Math.max(fromLevel,toLevel));
  if(!face)return null;
  const result=this.edge(a,face,origin,target,a.x,'climb',['left']);
  return result.ok?[{climbRoute:true,nativeTransfer:true,tree:true,fromId:origin.id,surface:target,kind:result.route.kind,choice:{face,result,landing:target,side:'left'}}]:null;
 },
 wallRoute(a,only){
  if(!a.support||a.carriedToy)return null;
  const g=this.reconcile(a,true);if(!g)return null;
  const distance=(x,y,r)=>Math.hypot(Math.max(r.left-x,0,x-r.right),Math.max(r.top-y,0,y-r.bottom));
  const faces=[...g.faces].filter(f=>g.byOwner.get(f.panelId)!==g.ownHome&&(!only||f.id===only.choice.face.id)).sort((f,h)=>distance(a.x+12*a.scale,a.y,f.rect)-distance(a.x+12*a.scale,a.y,h.rect));
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
     const result=this.edge(a,face,origin,landing,startX,'wall-jump',face.edges,Math.min(24,budget));budget-=Math.max(1,result.stats.checks);
     if(result.ok&&(!best||result.route.cost<best.result.route.cost))best={face,result,landing,target};
    }
    if(best)return [...approach,{climbRoute:true,nativeTransfer:true,manualWallJump:true,preview:true,fromId:origin.id,surface:best.target,kind:'wall-jump',choice:best}];
   }
   if(budget<=0)break;
  }
  return null;
 },
 edge(a,face,from,target,x,mode,sides=face.edges||['left','right'],limit=64){
  const s=a.scale,w=a.worldRect,m=window.pixelCatClimbModelV1,assets=window.pixelCatClimbAssetsV1;
  const probe=m.runtimeProbe(a.constructor,cardClimbArt(),{...a.config,grip_max_rise:30,climbWorld:w},s);
  const clear=(f,x)=>a.social?.clear(f,x)!==false,fit=f=>flightFits(f,w,s,m.framePlacement);
  const quick=mode.endsWith('wall-jump'),min=quick?0:4,direction=mode.endsWith('ascent')||target.top<from.top?1:-1;
  const speed=Math.max(.25,Math.min(3,Number(a.config.climb_speed)||2));
  const draft={...assets,config:{...m.defaults,entryPose:'side',entry:'jump-up',exitPose:'none',tempo:Math.min(6,2*speed),decisionHold:160,maxCycles:24}};
  const grips=face.grips,box=face.rect,stats={checks:0},frames=assets.frames;
  const width=Math.max(...frames.map(f=>f.anchor.x-frameBounds(f).left)),reach=Math.max(...frames.map(f=>frameBounds(f).right-f.anchor.x));
  let best;
  for(const side of sides){
   const edge=box[side];
   if(edge-(side==='left'?width:reach)*s<w.left||edge+(side==='left'?reach:width)*s>w.right)continue;
   const stance=Math.max(from.min,Math.min(from.max,edge-(side==='left'?30:-6)*s));
   if(!clear(from,stance))continue;
   const approach=Math.abs(x-stance)>s?probe.approach('meander',x,from,stance):null;
   if(Math.abs(x-stance)>s&&!fit(approach))continue;
   const attach=(...args)=>{if(stats.checks>=limit)return null;stats.checks++;const f=probe.attach(...args);return fit(f)?f:null;};
   const release=(root,frame,to,options)=>{
    if(to!==target||stats.checks>=limit)return null;
    stats.checks++;const f=probe.release(root,frame,to,options);
    return fit(f)&&clear(target,f.landingX)?f:null;
   };
   const scene={scale:s,floor:from,target,face:{id:face.id,x:box.left,right:box.right,top:grips.top-4*s,bottom:box.bottom,grippy:true},startX:stance,gripCeilingY:grips.top,gripFloorY:grips.bottom};
   const ys=new Set([from.top-20*s,target.top+12*s,from.top+24*s,from.top-52*s,grips.bottom].map(y=>Math.max(grips.top,Math.min(grips.bottom,y))));
   for(const entryY of ys){
    if(stats.checks>=limit)break;
    scene.transfer={entryY,side,quick,min,direction};
    const plan=m.planClimb(draft,{ground:()=>null,attach,release},null,{scene:{...scene}});
    if(!plan.goalReached)continue;
    const duration=approach?.duration||0;
    if(approach){
     for(const segment of plan.segments){segment.start+=duration;segment.end+=duration;}
     plan.segments.unshift({kind:'approach',phase:'Walking to card edge',jump:approach,start:0,end:duration,ms:duration});
     plan.duration+=duration;
    }
    const entry=plan.grips[0].root,last=plan.grips.at(-1).root;
    plan.releaseAt=plan.segments.at(-1).start;
    plan.segments.at(-1).phase=quick?'Wall jump to landing':'Leaping off card';
    if(!best||plan.duration<best.cost)best={plan,cost:plan.duration,kind:quick?'wall-jump':'climb-and-leap',distanceCells:Math.abs(entry.y-last.y)/s};
    break;
   }
  }
  return {ok:!!best,route:best,stats};
 },
 start(a,next,t){
  const C=window.pixelCatClimbV1,target=a.surfaces.find(s=>s.id===next.surface.id),ordinary=target&&!next.mode?.endsWith('ascent')&&next.mode!=='card-wall-jump'&&window.pixelCatSurfaceWorldV1.route(a,target,a.support),last=a.route.at(-1);
  if(ordinary&&!next.preview&&!next.tree){a.route=[...ordinary,...last?.settle?[last]:[]];return true;}
  const current=next.manualWallJump?this.wallRoute(a,next)?.at(-1):this.route(a,target,a.support,true,next.mode)?.[0];if(!current||a.support.id!==next.fromId){a.route=[];a.deadline=t+1000;if(next.manualWallJump){a.setAttribute('data-wall-jump-command','landing changed');a.status('Wall jump cancelled: entry or landing changed');}return true;}
  const choice=current.choice,remaining=a.route.slice(1),prop={id:'card-grip-'+a.ownerKey,virtual:true,claimedBy:a.ownerKey,scale:a.scale,node:{isConnected:true}},assets=window.pixelCatClimbAssetsV1,below=Math.max(...assets.centred.front.frames.map(f=>f.rows.findLastIndex(r=>r.includes('#')||r.includes('R'))+1-f.anchor.y));
  a.climb={stage:'approach',virtual:true,prop,face:{surface:a.support,below,direction:1},base:a.support,origin:a.x,goalSurface:target,remaining,started:t,last:t,age:0,decisions:0,serial:0};
  if(!C.setup(a,cardClimbArt())){C.cancel(a,'native entry unavailable',false);a.route=[];a.deadline=t+1000;return true;}
  const plan=choice.result.route.plan;
  plan.segments.at(-1).jump.motion.target={...target,source:target};
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
