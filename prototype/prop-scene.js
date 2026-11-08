// Shared, view-local props. The generated roaming module includes this source.
const DASHBOARD_PROP_SCENES=new WeakMap();
const propSurfaceSuffix=s=>s.id.slice(s.id.indexOf(':'));
const propSurfaceMaps=new WeakMap();
const propSurfaceFor=(cat,p)=>{const surfaces=cat.surfaces;if(!surfaces)return;let map=propSurfaceMaps.get(surfaces);if(!map){map=new Map();for(const s of surfaces)if(!s.home){let by=map.get(s.el);if(!by)map.set(s.el,by=new Map());by.set(propSurfaceSuffix(s),s);}propSurfaceMaps.set(surfaces,map);}return map.get(p.surfaceEl)?.get(p.surfaceSuffix);};
const propBoundsOn=(p,s)=>{const padding=p.asset.id==='ball'?p.asset.width*p.scale/2:Math.max(4*p.scale,p.asset.width*p.scale/2);return {left:s.left+padding,right:s.right-padding};};
const propPosition=(p,s)=>{const b=propBoundsOn(p,s),fall=p.ballMotion?.fall;return {x:fall?s.left+fall.x:b.left+(b.right-b.left)*p.u,y:s.top+(fall?.y||0),span:b.right-b.left};};
const paintDashboardProp=p=>{
 const mirror=p.asset.id==='toy_mouse'&&p.direction!==(p.asset.facing??-1),turn=p.asset.id==='ball'?((Math.round((p.spin||0)/(Math.PI/2))%4)+4)%4:0,key=mirror+':'+turn;if(p.paintKey===key)return;p.paintKey=key;
 const c=p.node.getContext('2d');c.clearRect(0,0,p.asset.width,p.asset.height);p.asset.pixels.forEach((r,y)=>r.forEach((v,x)=>{if(!v)return;let px=mirror?p.asset.width-1-x:x,py=y;for(let i=0;i<turn;i++)[px,py]=[p.asset.width-1-py,px];c.fillStyle=v;c.fillRect(px,py,1,1);}));p.node.dataset.facing=String(p.asset.id==='toy_mouse'?p.direction:1);
};
const ballBatApproach=(surface,toyX,catX,scale,tapX)=>!surface||surface.home||surface.narrow?null:[1,-1].map(direction=>({direction,approach:cellSnap(toyX-((direction>0?tapX:23-tapX)+.5)*scale,scale)})).filter(p=>p.approach>=surface.min&&p.approach<=surface.max).map(p=>({...p,cost:Math.abs(p.approach-catX)})).sort((a,b)=>a.cost-b.cost)[0]||null;
const ballDropTarget=(p,s,x,vx,surfaces)=>{
 const radius=p.asset.width*p.scale/2,g=400*p.scale;return surfaces.filter(t=>!t.home&&t.top>s.top+2*p.scale&&t.top-s.top<=110*p.scale&&t.el?.isConnected!==false).map(t=>{const seconds=Math.sqrt(2*(t.top-s.top)/g),landing=x+vx*seconds;return {surface:t,seconds,landing};}).filter(t=>t.landing-radius>=t.surface.left&&t.landing+radius<=t.surface.right).sort((a,b)=>a.seconds-b.seconds)[0]||null;
};
const advanceRollingBall=(p,s,dt,surfaces)=>{
 let remaining=Math.max(0,Math.min(100,dt))/1000;
 while(p.ballMotion&&remaining>0){const step=Math.min(remaining,1/120),m=p.ballMotion;remaining-=step;const radius=p.asset.width*p.scale/2,g=400*p.scale;
  if(m.fall){const f=m.fall,oldY=s.top+f.y,nextY=oldY+m.vy*step+.5*g*step*step,x=s.left+f.x,nextX=x+m.vx*step;
   const hits=surfaces.filter(t=>!t.home&&t.el?.isConnected!==false&&t.top>oldY-.001&&t.top<=nextY).map(t=>{const time=(-m.vy+Math.sqrt(m.vy*m.vy+2*g*Math.max(0,t.top-oldY)))/g;return {surface:t,time,x:x+m.vx*time};}).filter(h=>h.x-radius>=h.surface.left&&h.x+radius<=h.surface.right).sort((a,b)=>a.time-b.time);
   p.spin=(p.spin||0)+(nextX-x)/radius;if(hits.length){const hit=hits[0];s=hit.surface;p.surfaceEl=s.el;p.surfaceSuffix=propSurfaceSuffix(s);const b=propBoundsOn(p,s);p.u=Math.max(0,Math.min(1,(hit.x-b.left)/(b.right-b.left)));m.fall=null;m.vy=0;m.vx*=.55;p.node.dataset.lastLanding=s.id;}else{f.x+=m.vx*step;f.y+=m.vy*step+.5*g*step*step;m.vy+=g*step;f.age+=step;if(f.age>2||f.y>130*p.scale){p.expired=true;p.ballMotion=null;}}
  }else{const b=propBoundsOn(p,s),oldX=b.left+(b.right-b.left)*p.u,sign=Math.sign(m.vx),friction=60*p.scale,time=Math.min(step,Math.abs(m.vx)/friction),nextX=oldX+m.vx*time-.5*sign*friction*time*time;m.vx-=sign*friction*time;p.spin=(p.spin||0)+(nextX-oldX)/radius;
   const edge=m.vx>=0?s.right:s.left,over=nextX<b.left||nextX>b.right,drop=over&&ballDropTarget(p,s,edge,m.vx,surfaces);
   if(over&&drop&&(m.vx>0?nextX>=edge:nextX<=edge)){m.fall={x:nextX-s.left,y:0,age:0};m.vy=0;p.node.dataset.lastDrop=s.id;}
   else if(over&&!drop){p.u=nextX<b.left?0:1;m.vx*=-.35;}
   else p.u=(nextX-b.left)/(b.right-b.left);
   if(!m.fall&&Math.abs(m.vx)<p.scale){p.ballMotion=null;p.u=Math.max(0,Math.min(1,p.u));}
  }
 }
 return s;
};
// A private random stream keeps the toy schedule independent of cat decisions.
const mouseRandom=p=>{p.mouseSeed=((p.mouseSeed??123456789)*1664525+1013904223)>>>0;return p.mouseSeed/4294967296;};
const mouseIsPaused=p=>!p.moving||p.mouseMotion?.phase==='pause';
const mouseOpening=(p,catX,toyX,scale)=>mouseIsPaused(p)&&p.direction===Math.sign(toyX-(catX+12*scale));
const advanceDashboardProp=(p,dt,span)=>{
 if(!p.moving||span<=0||p.high<=p.low)return;
 const m=p.mouseMotion??={phase:'move',remaining:900+mouseRandom(p)*1800};let left=Math.max(0,Math.min(100,dt));
 while(left>0){const step=Math.min(left,m.remaining);left-=step;m.remaining-=step;
  if(m.phase==='move'){const next=p.u+p.direction*5*p.scale*step/1000/span;p.u=Math.max(p.low,Math.min(p.high,next));if(next<=p.low||next>=p.high){m.remaining=0;m.turn=true;}}
  if(m.remaining<=0){if(m.phase==='move'){m.phase='pause';m.remaining=1800+mouseRandom(p)*4200;}
   else {if(m.turn||mouseRandom(p)<.45)p.direction*=-1;m.turn=false;m.phase='move';m.remaining=900+mouseRandom(p)*2400;}}
 }
};
// Full cat origins remain within the surface. The landing paw meets the toy.
const toyApproach=(surface,toyX,catX,scale,pawFor)=>{
 if(!surface||surface.home||surface.narrow)return null;
 return [1,-1].map(direction=>{const landing=Math.round((toyX-pawFor(direction)*scale)/scale)*scale,approach=landing-direction*33*scale;return {direction,landing,approach,cost:Math.abs(approach-catX)};}).filter(p=>p.approach>=surface.min+scale&&p.approach<=surface.max-scale&&p.landing>=surface.min+scale&&p.landing<=surface.max-scale).sort((a,b)=>a.cost-b.cost)[0]||null;
};
// Only opaque artwork counts as contact; authored marker colours are still body pixels.
const propBrushesCat=(p,from,to,cat)=>{
 const idle=cat.idle;let rows=idle?.rows,place=idle?.placement,facing=cat.facing;if(cat.motion?.kind==='walk'){const snapshot=cat.social?.frame,m=/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(cat.svg?.style?.transform||'');rows=cat.drawnRows||snapshot?.rows;place=m?{x:Number(m[1]),top:Number(m[2])}:snapshot?.placement;facing=cat.drawnFacing??snapshot?.facing??cat.facing;}if(!rows||!place)return false;
 const scale=cat.scale,left=place.x,top=place.top,pw=p.asset.width*p.scale,ph=p.asset.height*p.scale;
 if(Math.max(from.x,to.x)+pw/2<left||Math.min(from.x,to.x)-pw/2>left+24*scale||Math.max(from.y,to.y)<top||Math.min(from.y,to.y)-ph>top+24*scale)return false;
 const steps=Math.max(1,Math.ceil(Math.hypot(to.x-from.x,to.y-from.y)/Math.min(scale,p.scale)));
 for(let i=0;i<=steps;i++){const x=from.x+(to.x-from.x)*i/steps-pw/2,y=from.y+(to.y-from.y)*i/steps-ph;
  for(let py=0;py<p.asset.height;py++)for(let px=0;px<p.asset.width;px++){if(!p.asset.pixels[py][px])continue;const mirror=p.asset.id==='toy_mouse'&&p.direction!==(p.asset.facing??-1),lx=x+(mirror?p.asset.width-1-px:px)*p.scale,ty=y+py*p.scale;
   for(let cy=Math.max(0,Math.floor((ty-top)/scale));cy<Math.min(24,Math.ceil((ty+p.scale-top)/scale));cy++)for(let cx=Math.max(0,Math.floor((lx-left)/scale));cx<Math.min(24,Math.ceil((lx+p.scale-left)/scale));cx++)if(rows[cy][facing<0?23-cx:cx]!=='.')return true;
  }
 }return false;
};
class DashboardPropScene{
 constructor(root){this.root=root;this.members=new Set();this.props=[];this.time=0;this.enabled=false;this.seeded=false;this.serial=0;this.movingMice=true;this.layer=document.createElement('div');this.layer.dataset.pixelCatProps='shared';this.layer.setAttribute('role','presentation');this.layer.style.cssText='position:fixed;inset:0;z-index:9;pointer-events:none;overflow:hidden';document.body.append(this.layer);}
 join(cat){this.members.add(cat);if(cat.config.dashboard_props===true&&!this.userOverride)this.enabled=true;}
 leave(cat){window.pixelCatMouthV1?.disconnect?.(cat);this.release(cat.ownerKey);this.members.delete(cat);if(!this.members.size){this.clear();window.pixelCatInteractionsV1?.clearProps(this.root);window.pixelCatScrollOverlayV1?.unmount(this.layer);this.layer.remove();DASHBOARD_PROP_SCENES.delete(this.root);}}
 setEnabled(value){this.controlsAt=0;this.enabled=value;this.userOverride=true;if(!value)this.clear();else {this.seeded=false;for(const a of this.members)a.homeMouseSeeded=false;}}
 release(owner,cooldown=0){for(const p of this.props)if(p.claimedBy===owner&&!p.carrier){p.claimedBy=null;p.cooldownUntil=this.time+cooldown;}}
 clear(){this.controlsAt=0;window.pixelCatInteractionsV1?.clearProps(this.root);for(const p of [...this.props]){if(p.carrier)window.pixelCatMouthV1?.release([...this.members].find(a=>a.ownerKey===p.carrier),p,this,performance.now(),true);window.pixelCatDepthV1?.removeProp(p);p.node.remove();};this.props=[];this.seeded=true;for(const m of this.members){for(const s of m.surfaces||[])s.propPoints=[];m.invalidate?.();}}
 contact(p,s,from,to,t,active){
  const geometry=[s.el,s.left,s.top,s.right],stable=p.contactGeometry?.every((v,i)=>v===geometry[i]);p.contactGeometry=geometry;
  const previous=p.bodyContacts||new Set(),next=new Set(),moved=Math.hypot(to.x-from.x,to.y-from.y)>.01;
  for(const cat of active){if(!cat.config.prop_reactions||cat.support?.el!==s.el||Math.abs(cat.support.top-s.top)>2||cat.motion&&cat.motion.kind!=='walk'||!cat.idle&&!cat.motion)continue;
   const overlap=propBrushesCat(p,to,to,cat);if(overlap)next.add(cat.ownerKey);
   if(!stable||!moved||previous.has(cat.ownerKey)||p.claimedBy===cat.ownerKey||p.node.dataset.lastStrike===cat.ownerKey||!propBrushesCat(p,from,to,cat))continue;
   cat.receiveDisturbance({id:p.id+'/brush/'+(++this.serial),kind:'Moving prop brush',source:p.id,x:to.x,y:to.y,intensity:.5},t);
  }p.bodyContacts=next;
 }
 strikeBall(id,owner,contact,direction,strength=1,allowRolling=false){const p=this.props.find(p=>p.id===id&&p.asset.id==='ball'&&!p.carrier&&!p.releaseFall&&p.claimedBy===owner&&(!p.ballMotion||allowRolling&&!p.ballMotion.fall)),cat=[...this.members].find(m=>m.ownerKey===owner),s=p&&cat&&propSurfaceFor(cat,p);if(!s)return false;const point=propPosition(p,s),rx=p.asset.width*p.scale/2,ry=p.asset.height*p.scale;
  if(Math.abs(contact.x-point.x)>rx||contact.y<point.y-ry||contact.y>point.y)return false;p.ballMotion={vx:direction*60*p.scale*Math.max(.1,Math.min(1,strength)),vy:0,fall:null};p.node.dataset.lastStrike=owner;p.node.dataset.strength=String(strength);p.node.dataset.contactFrame=String(CAT_ART.interactionContacts.bat.frame);return true;}
 touchMouse(id,owner,contact,pawScale){const p=this.props.find(p=>p.id===id&&p.asset.id==='toy_mouse'&&!p.carrier&&!p.releaseFall&&p.claimedBy===owner),cat=[...this.members].find(m=>m.ownerKey===owner),s=p&&cat&&propSurfaceFor(cat,p);if(!s)return false;
  const point=propPosition(p,s),left=Math.round((point.x-p.asset.width*p.scale/2)/p.scale)*p.scale,top=Math.round((point.y-p.asset.height*p.scale)/p.scale)*p.scale,half=pawScale/2,mirror=p.direction!==(p.asset.facing??-1);
  // Touch the actual opaque mouse cells, including edge contact at its ears.
  const hit=p.asset.pixels.some((row,y)=>row.some((colour,x)=>{if(!colour)return false;const px=left+(mirror?p.asset.width-1-x:x)*p.scale,py=top+y*p.scale;return contact.x+half>=px&&contact.x-half<=px+p.scale&&contact.y+half>=py&&contact.y-half<=py+p.scale;}));
  if(hit){p.node.dataset.lastBat=owner;p.node.dataset.contactFrame=String(CAT_ART.interactionContacts.bat.frame);}return hit;
 }
 spawn(cat,assetId='toy_mouse',placement=null){
  if(!placement&&this.props.filter(p=>!p.homeOwner).length>=8)return false;const asset=CAT_ART.dashboardProps?.find(p=>p.id===assetId);if(!asset)return false;
  const surfaces=placement?[placement.surface]:(cat.surfaces||[]).filter(s=>!s.home&&!s.narrow&&s.right-s.left>Math.max(cat.size+16*cat.scale,asset.width*(cat.worldScale||cat.scale)+24)&&s.top>=64&&s.top<(window.innerHeight||2000)-8&&cat.pathTo(s)&&cat.pathTo(cat.home,s));if(!surfaces.length)return false;
  const occupied=s=>this.props.filter(p=>p.surfaceEl===s.el&&p.surfaceSuffix===propSurfaceSuffix(s)).length,min=Math.min(...surfaces.map(occupied)),options=surfaces.filter(s=>occupied(s)===min),surface=options[Math.floor(Math.random()*options.length)];
  const node=document.createElement('canvas');node.width=asset.width;node.height=asset.height;node.style.cssText='position:absolute;image-rendering:pixelated;pointer-events:none';node.style.width=asset.width*(cat.worldScale||cat.scale)+'px';node.style.height=asset.height*(cat.worldScale||cat.scale)+'px';const c=node.getContext('2d');asset.pixels.forEach((r,y)=>r.forEach((v,x)=>{if(v){c.fillStyle=v;c.fillRect(x,y,1,1);}}));
  const u=placement?.u??(.12+Math.random()*.76),p={id:'prop-'+(++this.serial),asset,node,surfaceEl:surface.el,surfaceSuffix:propSurfaceSuffix(surface),scale:cat.worldScale||cat.scale,homeOwner:placement?cat:null,u,low:Math.max(.04,u-.18),high:Math.min(.96,u+.18),direction:Math.random()<.5?-1:1,moving:assetId==='toy_mouse'&&this.movingMice,mouseSeed:Math.floor(Math.random()*4294967296),cooldownUntil:0,claimedBy:null};node.style.visibility='hidden';node.dataset.propId=p.id;node.dataset.origin=asset.origin;node.dataset.assetId=asset.id;this.props.push(p);this.layer.append(node);if(asset.affordance==='scratch')window.pixelCatVerticalScratchV1?.bind(p,()=>this.members,this.root);this.enabled=true;this.seeded=true;for(const m of this.members)m.invalidate?.();return p;
 }
 controls(t){
  if(t<(this.controlsAt||0))return;this.controlsAt=t+250;const count=this.props.length,claimed=this.props.filter(p=>p.claimedBy).length;
  for(const m of this.members){m.setAttribute('data-dashboard-props',String(count));const toggle=m.shadowRoot?.querySelector('[data-props-toggle]'),moving=m.shadowRoot?.querySelector('[data-props-moving]'),status=m.shadowRoot?.querySelector('.prop-scene-status');if(toggle)toggle.checked=this.enabled;if(moving)moving.checked=this.movingMice;if(status)status.textContent=count+' shared props; '+claimed+' being investigated';}
 }
 tick(t,cat){
  if(this.lastAt===t)return;
  window.pixelCatScrollOverlayV1?.mount(this.layer,this.root);
  const visible=[...this.members].filter(m=>!document.hidden&&m.active&&!m.suspended&&!m.stranded&&m.isConnected&&m.href===location.pathname),active=visible.filter(m=>!m.paused&&!m.layoutPaused);this.layer.style.visibility=this.enabled&&visible.length?'visible':'hidden';
  this.controls(t);
  const dt=this.lastAt===undefined?0:Math.min(100,Math.max(0,t-this.lastAt));this.lastAt=t;if(!this.enabled||!visible.length){for(const p of this.props)if(p.node?.style)p.node.style.visibility='hidden';return;}if(active.length)this.time+=dt;
  if(!this.seeded&&active.length){if(!active.some(a=>a.config.dashboard_props&&a.config.show_home!==false&&a.config.home_mouse!==false))this.spawn(cat,'toy_mouse');this.spawn(cat,'ball');}window.pixelCatHomeLifeV1?.seedMice(this,active);
  for(const member of this.members)for(const s of member.surfaces||[])s.propPoints=[];
  for(const p of [...this.props]){
   if(window.pixelCatMouthV1?.carried?.(this,p,t,visible))continue;
   const source=p.homeOwner&&visible.includes(p.homeOwner)?p.homeOwner:visible.find(m=>propSurfaceFor(m,p));let s=source&&propSurfaceFor(source,p);if(!s||p.surfaceEl?.isConnected===false){window.pixelCatDepthV1?.removeProp(p);p.node.remove();this.props.splice(this.props.indexOf(p),1);continue;}
   const b=propPosition(p,s);if(b.span<=0){p.node.style.visibility='hidden';continue;}p.node.style.visibility='visible';advanceDashboardProp(p,active.length?dt:0,b.span);if(p.ballMotion){const targets=source.surfaces.filter(t=>source.pathTo(t)&&source.pathTo(source.home,t));s=advanceRollingBall(p,s,active.length?dt:0,targets);}if(p.expired){p.node.remove();this.props.splice(this.props.indexOf(p),1);continue;}window.pixelCatDepthV1?.prop(this,p,s,true,source);window.pixelCatEffectsV1?.paintPost(p);paintDashboardProp(p);const point=propPosition(p,s),px=s.left+Math.round((point.x-s.left-p.asset.width*p.scale/2)/p.scale)*p.scale,py=s.top+Math.round((point.y-s.top-p.asset.height*p.scale)/p.scale)*p.scale;p.node.style.transform=`translate(${px}px,${py}px)`;p.node.dataset.claimedBy=p.claimedBy||'';p.node.dataset.motion=p.ballMotion?.fall?'falling':p.ballMotion?'rolling':p.moving?(p.mouseMotion?.phase==='pause'?'paused':'moving'):'resting';p.node.dataset.phaseRemaining=String(Math.round(p.mouseMotion?.remaining||0));
   window.pixelCatInteractionsV1?.propTick(this,p,s,b,point,active.length?dt:0,t,active);
   this.contact(p,s,b,point,t,active);
   for(const member of this.members){const own=propSurfaceFor(member,p);if(!own||p.ballMotion)continue;(own.propPoints||=[]).push({id:p.id,x:cellSnap(Math.max(own.min,Math.min(own.max,point.x-12*member.scale)),member.scale),weight:1.3,propId:p.id,label:p.asset.name});}
  }

 }
}
