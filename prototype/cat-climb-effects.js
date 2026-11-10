// Contact decoration borrows the existing effects clock; no observer or RAF loop.
const climbMarkViews=new WeakMap(),climbMarkLimits={actor:960,view:3840,layers:64};
window.pixelCatClimbMarksV1={
 colour(value){const hex=/^#[a-f\d]{6}$/i.exec(value||'');if(hex)return hex[0];const short=/^#([a-f\d]{3})$/i.exec(value||'');if(short)return '#'+[...short[1]].map(c=>c+c).join('');if(!/^(rgba?\(|color\(srgb )/.test(value||''))return null;const rgb=value.match(/[\d.]+/g)?.map(Number);if(!rgb||rgb.length<3||rgb[3]===0)return null;const factor=value.startsWith('color(')?255:value.includes('%')?2.55:1;return '#'+rgb.slice(0,3).map(v=>Math.max(0,Math.min(255,Math.round(v*factor))).toString(16).padStart(2,'0')).join('');},
 cards(a){const owners=new Set([a,a.climb?.base?.bedOwner,...window.pixelCatMouthV1?.homes||[]]);return [...owners].filter(o=>o&&(o===a||o.active&&o.root===a.root)).map(o=>o.shadowRoot?.querySelector?.('ha-card')).filter(Boolean).map(host=>({host,box:window.pixelCatSurfaceWorldV1?.rect(a.root,host)||host.getBoundingClientRect()}));},
 material(a,point,cards=this.cards(a)){
  if(typeof document==='undefined'||typeof getComputedStyle!=='function')return null;
  const decoration=n=>n?.closest?.('[data-pixel-cat-overlay],[data-pixel-cat-props],[data-cat-climb-marks],[data-cat-climb-far],[data-cat-home-furniture]'),pick=scope=>(scope.elementsFromPoint?.(point.x,point.y)||[scope.elementFromPoint(point.x,point.y)]).find(n=>n&&!decoration(n));
  let node=pick(document);
  for(let i=0;i<8&&node?.shadowRoot?.elementFromPoint;i++){const child=pick(node.shadowRoot);if(!child||child===node)break;node=child;}
  for(let p=node,i=0;p&&i<12;i++,p=p.parentElement||p.getRootNode?.()?.host)if(/^(button|input|select|textarea|a)$/.test(p.localName))return null;
  // Home cards can paint a background while letting pointer events pass through.
  for(const {host,box:r}of cards)if(point.x>=r.left&&point.x<=r.right&&point.y>=r.top&&point.y<=r.bottom){node=host;break;}
  for(let i=0;i<12&&node;i++,node=node.parentElement||node.getRootNode?.()?.host){
   if(/^(button|input|select|textarea|a)$/.test(node.localName))return null;
   const colour=this.colour(getComputedStyle(node).backgroundColor);if(colour)return {host:node===document.body||node===document.documentElement?a.root:node,colour};
  }
  const colour=this.colour(getComputedStyle(a.root).getPropertyValue('--primary-background-color'));return colour?{host:a.root,colour}:null;
 },
 // One paw stream per slide. Split actual travel at painted material edges;
 // returning to a previous material starts a new run, never bridges the gap.
 scrape(a,point,trail,index,cards){
  const e=a.climb;if(e.scrapeTrail!==trail){e.scrapeTrail=trail;e.scrapePaws=[];}
  const prior=e.scrapePaws[index],dx=e.dx||0,dy=e.dy||0,from=prior?{x:prior.x+dx,y:prior.y+dy}:point;
  const stream=prior||{run:0,host:null};e.scrapePaws[index]=stream;
  stream.x=point.x-dx;stream.y=point.y-dy;
  const travel=Math.hypot(point.x-from.x,point.y-from.y);if(travel<.001)return;
  const cuts=new Set([0,1]),end=this.material(a,point,cards),known=new Set(cards.map(c=>c.host)),boxes=cards.map(c=>c.box);
  for(const host of new Set([stream.host,end?.host]))if(host&&!known.has(host)){known.add(host);boxes.push(host.getBoundingClientRect());}
  const addBox=box=>{for(const [axis,edges,other,lo,hi]of [['y',[box.top,box.bottom],'x',box.left,box.right],['x',[box.left,box.right],'y',box.top,box.bottom]]){
   const d=point[axis]-from[axis];if(!d)continue;for(const edge of edges){const t=(edge-from[axis])/d,v=from[other]+(point[other]-from[other])*t;if(t>0&&t<1&&v>=lo&&v<=hi)cuts.add(t);}
  }};for(const box of boxes)addBox(box);
  // Extra probes cover unrelated painted elements between known home cards.
  const steps=Math.min(16,Math.ceil(travel/Math.max(2,4*a.scale)));for(let i=1;i<steps;i++)cuts.add(i/steps);
  const at=t=>({x:from.x+(point.x-from.x)*t,y:from.y+(point.y-from.y)*t}),samples=new Map(),materialAt=t=>{if(!samples.has(t))samples.set(t,this.material(a,at(t),cards));return samples.get(t);};
  let ts=[...cuts].sort((a,b)=>a-b);for(let i=1;i<ts.length;i++){const material=materialAt((ts[i-1]+ts[i])/2);if(material&&!known.has(material.host)){known.add(material.host);addBox(material.host.getBoundingClientRect());}}
  ts=[...cuts].sort((a,b)=>a-b);let group=null;
  const flush=()=>{if(group)this.mark(a,group.material.host,group.to,group.material.colour,true,0,null,null,trail+':'+index+':'+stream.run,group.from);};
  for(let i=1;i<ts.length;i++){
   const material=materialAt((ts[i-1]+ts[i])/2),host=material?.host||null;
   if(host!==stream.host){flush();group=null;stream.run++;stream.host=host;}
   if(!material)continue;
   if(!group)group={material,from:at(ts[i-1]),to:at(ts[i])};else group.to=at(ts[i]);
  }
  flush();
 },
 install(){
  const effects=window.pixelCatEffectsV1;if(!effects||this.installed===effects)return;this.installed=effects;const self=this,tick=effects.tick,leave=effects.leave,clear=effects.clear;
  effects.tick=function(a,t){tick.call(this,a,t);self.tick(a,t);};
  effects.leave=function(a){self.leave(a);return leave.call(this,a);};
  effects.clear=function(root){self.clear(root);return clear.call(this,root);};
 },
 contact(a,frame,placement,key,scrape=false,distance=0){
  this.install();const e=a.climb,fx=window.pixelCatEffectsV1;if(!e||!fx||a.config.effects===false||fx.reduced())return;
  if(e.nativeTransfer?.tree){
   const host=a.catTree?.ropeHosts?.[e.nativeTransfer.tree-1],box=host?.getBoundingClientRect();
   if(!box)return;
   for(const [index,paw] of frame.paws.entries()){
    const y=placement.top+(paw.y+.5)*a.scale;
    if(y<box.top||y>=box.bottom||frame.rows[paw.y]?.[paw.x]==='.')continue;
    const x=placement.x+(paw.x+.5)*a.scale;
    if(x<box.left-a.scale||x>box.right+a.scale)continue;
    this.mark(a,host,{x:Math.max(box.left+.5,Math.min(box.right-.5,x)),y},'#d7c490',scrape,distance,null,null,scrape?key+':'+index:null);
   }
   return;
  }
  const cards=e.virtual?this.cards(a):null,trail=e.serial+':'+e.sample.segment;
  const face=e.virtual?null:{...e.face,x:e.face.x+(e.dx||0),top:e.face.top+(e.dy||0),bottom:e.face.bottom+(e.dy||0),surface:{...e.face.surface,top:e.face.surface.top+(e.dy||0)}};
  for(const [index,paw]of frame.paws.entries()){
   if(frame.rows[paw.y]?.[paw.x]==='.'||!e.virtual&&frame.depth?.[paw.y]?.[paw.x]==='F')continue;
   const point={x:placement.x+(paw.x+.5)*a.scale,y:placement.top+(paw.y+.5)*a.scale},material=e.virtual?this.material(a,point,cards):null,
    contact=e.virtual?material&&{point,materialColour:material.colour}:fx.postContact(face,point);
   if(e.virtual&&scrape)this.scrape(a,point,trail,index,cards);
   if(!contact)continue;
   const ground=(a.surfaces||[]).filter(s=>s.top>=point.y&&point.x>=s.left&&point.x<=s.right).sort((x,y)=>x.top-y.top)[0];
   if(ground)fx.emit(a,'rope',contact.point,ground,key+':'+index,a.scale,contact);
   if(e.virtual&&!scrape||!e.virtual&&scrape){const face=e.scene.face,markPoint=e.virtual?point:{x:Math.max(face.x+(e.dx||0),Math.min(face.right+(e.dx||0),point.x)),y:contact.point.y},clip=e.virtual?null:{left:face.x+(e.dx||0),right:face.right+(e.dx||0),top:face.top+(e.dy||0),bottom:face.bottom+(e.dy||0)};this.mark(a,e.virtual?material.host:e.prop.node,markPoint,contact.materialColour||'#b29b69',scrape,distance,e.virtual?null:e.base.top,clip,scrape?e.serial+':'+e.sample.segment+':'+index:null);}
  }
  if(!e.virtual&&a.config.post_wiggle!==false)fx.wiggle(a,e.prop,e.face.direction);
 },
 mark(a,host,point,material,scrape,distance,depth,clip=null,trail=null,from=null){
  if(!a.root||a.config.climb_marks===false||!host?.getBoundingClientRect||typeof document==='undefined')return;
  const effects=window.pixelCatEffectsV1.join(a);if(!effects)return;let state=climbMarkViews.get(a.root);
  if(!state){state={marks:[],layers:new Map(),owners:new Map(),evicted:0};climbMarkViews.set(a.root,state);}
  let layer=state.layers.get(host);
  if(!layer){const box=host.getBoundingClientRect();if(!box.width||!box.height)return;
   if(state.layers.size>=climbMarkLimits.layers){const oldest=[...state.layers.values()].reduce((a,b)=>a.at<=b.at?a:b);for(let i=state.marks.length-1;i>=0;i--)if(state.marks[i].layer===oldest){this.drop(state,i);state.evicted++;}this.removeLayer(oldest);state.layers.delete(oldest.host);}
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.dataset.catClimbMarks='';svg.setAttribute('aria-hidden','true');svg.style.cssText='position:fixed;left:0;top:0;pointer-events:none;overflow:hidden';svg.setAttribute('shape-rendering','crispEdges');
   if(clip)svg.style.clipPath='inset('+Math.max(0,clip.top-box.top)+'px '+Math.max(0,box.right-clip.right)+'px '+Math.max(0,box.bottom-clip.bottom)+'px '+Math.max(0,clip.left-box.left)+'px)';
   layer={host,svg,box,owner:a,geometry:a.surfaces,depth,count:0,owners:new Map(),contactFrame:effects.frame};
   if(depth===null){layer.isolation=host.style.isolation||'';layer.priority=host.style.getPropertyPriority?.('isolation')||'';host.style.isolation='isolate';const mount=host.shadowRoot&&!host.shadowRoot.querySelector?.('slot:not([name]),slot[name=""]')?host.shadowRoot:host;mount.prepend(svg);}else document.body.append(svg);
   state.layers.set(host,layer);this.position(layer,a,state);
  }
  if(layer.contactFrame!==effects.frame){layer.contactFrame=effects.frame;const box=host.getBoundingClientRect();if(box.left!==layer.box.left||box.top!==layer.box.top||box.width!==layer.box.width||box.height!==layer.box.height){layer.box=box;this.position(layer,a,state);}}
  const existing=trail&&state.marks.find(m=>m.owner===a&&m.layer===layer&&m.trail===trail);let recycled;layer.at=effects.time;
  if(!existing)while(state.marks.length>=climbMarkLimits.view||(state.owners.get(a)||0)>=climbMarkLimits.actor){const owner=(state.owners.get(a)||0)>=climbMarkLimits.actor?a:null;let index=-1;for(let i=0;i<state.marks.length;i++)if((!owner||state.marks[i].owner===owner)&&(index<0||state.marks[i].at<state.marks[index].at))index=i;recycled=this.drop(state,index);state.evicted++;}
  const style=window.pixelCatClimbModelV1.scratchStyle(a.scale,scrape),x=existing?.x??(from?.x??point.x)-layer.box.left,y=point.y-layer.box.top,start=existing?.start??(from?from.y-layer.box.top:scrape?y-distance:y),length=scrape?y-start:style.length,endX=scrape?point.x-layer.box.left:x-.5*a.scale,node=existing?.node||recycled||document.createElementNS('http://www.w3.org/2000/svg','path');let path='';
  for(let claw=0;claw<style.claws;claw++){const offset=(claw-(style.claws-1)/2)*style.spread;path+='M'+(x+offset)+' '+start+'L'+(endX+offset)+' '+(start+length);}
  node.setAttribute('d',path);node.setAttribute('stroke',window.pixelCatClimbModelV1.scratchColour(material));node.setAttribute('stroke-width',style.width);node.setAttribute('fill','none');node.setAttribute('opacity',style.alpha);if(existing){existing.at=effects.time;existing.alpha=style.alpha;}else{layer.svg.append(node);state.marks.push({owner:a,layer,node,at:effects.time,life:style.life,alpha:style.alpha,trail,x,start});layer.count++;layer.owners.set(a,(layer.owners.get(a)||0)+1);state.owners.set(a,(state.owners.get(a)||0)+1);}return {node,created:!existing};
 },
 position(layer,a,state){const b=layer.box,svg=layer.svg;svg.style.width=b.width+'px';svg.style.height=b.height+'px';svg.setAttribute('viewBox','0 0 '+b.width+' '+b.height);
  if(layer.depth===null){let anchor=layer.host;for(let i=0;anchor&&i<20;i++){const css=getComputedStyle(anchor);if(css.position&&css.position!=='static'||css.transform&&css.transform!=='none')break;anchor=anchor.parentElement||anchor.getRootNode?.()?.host;}const origin=anchor===layer.host?b:anchor?.getBoundingClientRect?.()||{left:0,top:0};svg.style.position='absolute';svg.style.transform='translate('+(b.left-origin.left)+'px,'+(b.top-origin.top)+'px)';svg.style.zIndex='-1';return;}
  svg.style.transform='translate('+b.left+'px,'+b.top+'px)';const mounted=window.pixelCatScrollOverlayV1?.mount(svg,a.root);if(mounted){const stamp=window.pixelCatEffectsV1.join(a).frame;if(state.portalAt!==stamp||!state.portalBox){state.portalAt=stamp;state.portalBox=mounted.portal.getBoundingClientRect();}window.pixelCatScrollOverlayV1.anchor(svg,{rect:state.portalBox});}svg.style.overflow='hidden';window.pixelCatDepthV1?.set(svg,layer.depth,1);
 },
 drop(state,index){const m=state.marks[index];if(!m)return;m.node.remove();state.marks.splice(index,1);m.layer.count--;for(const counts of [state.owners,m.layer.owners]){const n=counts.get(m.owner)-1;if(n)counts.set(m.owner,n);else counts.delete(m.owner);}return m.node;},
 removeLayer(layer){window.pixelCatScrollOverlayV1?.unmount(layer.svg);layer.svg.remove();if(layer.depth===null&&layer.host.style.isolation==='isolate'){if(layer.host.style.setProperty)layer.host.style.setProperty('isolation',layer.isolation,layer.priority);else layer.host.style.isolation=layer.isolation;}},
 tick(a,t){const state=climbMarkViews.get(a.root);if(!state||state.frame===t)return;state.frame=t;const clock=window.pixelCatEffectsV1.join(a).time;
  for(let i=state.marks.length-1;i>=0;i--){const m=state.marks[i],age=clock-m.at;if(age>=m.life||m.layer.host.isConnected===false||m.owner.config.effects===false||m.owner.config.climb_marks===false){this.drop(state,i);continue;}const alpha=Math.round(.85*Math.min(1,(m.life-age)/6000)*20)/20;if(alpha!==m.alpha){m.node.setAttribute('opacity',alpha);m.alpha=alpha;}}
  for(const [host,layer]of state.layers){if(!layer.count){this.removeLayer(layer);state.layers.delete(host);continue;}
   if(!layer.owners.has(layer.owner)){layer.owner=layer.owners.keys().next().value;}if(layer.geometry!==layer.owner.surfaces){layer.geometry=layer.owner.surfaces;layer.box=host.getBoundingClientRect();this.position(layer,layer.owner,state);}layer.svg.style.visibility=layer.owner.active&&!layer.owner.suspended&&!layer.owner.stranded?'visible':'hidden';
  }
  if(!state.marks.length)this.clear(a.root);
 },
 leave(a){const state=climbMarkViews.get(a.root);if(!state)return;for(let i=state.marks.length-1;i>=0;i--)if(state.marks[i].owner===a)this.drop(state,i);if(!state.marks.length)this.clear(a.root);},
 clear(root){const state=climbMarkViews.get(root);if(!state)return;for(const layer of state.layers.values())this.removeLayer(layer);climbMarkViews.delete(root);},
 report(root){const s=climbMarkViews.get(root);return {active:s?.marks.length||0,capacity:climbMarkLimits.view,actorCapacity:climbMarkLimits.actor,layers:s?.layers.size||0,layerCapacity:climbMarkLimits.layers,evicted:s?.evicted||0,life:18000};}
};
