// Paw-level contact shadows share a layer below the cats and their props.
const catShadowViews=new WeakMap(),catShadowActors=new WeakMap();
const shadowSvg=tag=>document.createElementNS('http://www.w3.org/2000/svg',tag);
let catShadowSerial=0;
window.pixelCatFloorShadowV1={
 view(root){
  let view=catShadowViews.get(root);if(view)return view;
  const layer=shadowSvg('svg'),defs=shadowSvg('defs'),clip=shadowSvg('clipPath'),cut=shadowSvg('path'),ink=shadowSvg('g');
  const serial=++catShadowSerial,gradient=shadowSvg('radialGradient');
  gradient.id='pixel-cat-shadow-ink-'+serial;
  for(const [offset,opacity]of [[0,1],[1,0]]){
   const stop=shadowSvg('stop');stop.setAttribute('offset',offset);stop.setAttribute('stop-opacity',opacity);gradient.append(stop);
  }
  defs.append(gradient);ink.setAttribute('fill',`url(#${gradient.id})`);
  clip.id='pixel-cat-shadow-cut-'+serial;
  cut.setAttribute('clip-rule','evenodd');clip.append(cut);defs.append(clip);
  ink.setAttribute('clip-path',`url(#${clip.id})`);layer.append(defs,ink);
  layer.setAttribute('aria-hidden','true');layer.dataset.catFloorShadows='';
  layer.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;overflow:visible';
  view={layer,cut,ink,actors:new Map()};catShadowViews.set(root,view);return view;
 },
 furniture(a,entry){
  const h=a.home,s=a.worldScale||a.scale,style=a.config.bed_style;
  const key=h&&a.config.show_home!==false?[h.left,h.top,s,style].join(':'):'';
  if(key===entry.furnitureKey)return;
  entry.furnitureKey=key;entry.holes='';entry.view.dirty=true;
  if(!key)return;
  const art=window.pixelCatRoamingExtrasV1;
  const bed=window.pixelCatSetupV1?.bed(a,art||{}),bowl=art?.homeProps?.bowl;
  for(const [asset,offset,bottom]of [[bed,22,h.top+(style==='simple'?s:0)],[bowl,7,h.top]]){
   if(asset)entry.holes+=`M${h.left-4+offset*s} ${bottom-asset.height*s}h${asset.width*s}v${asset.height*s}h-${asset.width*s}Z`;
  }
 },
 sync(a){
  if(!a.root||!a.svg||!a.active||typeof MutationObserver!=='function')return;
  let entry=catShadowActors.get(a);
  if(entry?.root!==a.root){this.remove(a);entry=null;}
  if(!entry){
   const view=this.view(a.root);
   entry={view,root:a.root,dark:window.pixelCatOutlineV1?.darkTheme?.()};catShadowActors.set(a,entry);view.actors.set(a,entry);
  }
  const {view}=entry;
  this.furniture(a,entry);
  if(a.config.floor_shadow!==false&&!entry.group){
   entry.group=shadowSvg('g');entry.group.dataset.catFloorShadow='';view.ink.append(entry.group);
   entry.observer=new MutationObserver(()=>this.paint(a,entry));
   entry.observer.observe(a.layer,{attributes:true,attributeFilter:['style']});
   entry.observer.observe(a.svg,{attributes:true,attributeFilter:['style','clip-path'],subtree:true,childList:true});
  }
  if(!entry.group)return;
  const overlay=window.pixelCatScrollOverlayV1;
  if(!overlay?.mount(view.layer,a.root))return;
  overlay.follow(view.layer,a.layer);
  const viewport=`${window.innerWidth}:${window.innerHeight}`;
  if(view.dirty||viewport!==view.viewport){
   view.dirty=false;view.viewport=viewport;
   view.cut.setAttribute('d',`M0 0H${window.innerWidth}V${window.innerHeight}H0Z`+[...view.actors.values()].map(other=>other.holes).join(''));
  }
  const dark=a._hass?.themes?.darkMode??entry.dark,strength=dark?.6:.4;
  if(strength!==entry.strength||a.surfaces!==entry.surfaces||a.support!==entry.support){
   entry.strength=strength;this.paint(a,entry);
  }
 },
 paint(a,entry){
  const {group}=entry,rows=a.drawnRows,s=a.scale;
  const transform=/^translate\(([-\d.]+)px,\s*([-\d.]+)px\)$/.exec(a.svg.style.transform);
  const visible=!!(rows&&transform&&a.layer.style.visibility==='visible'&&!a.userHeld&&!a.climb&&!a.bedInside&&!a.svg.firstElementChild?.hasAttribute('clip-path'));
  if(group.style.visibility!==(visible?'visible':'hidden'))group.style.visibility=visible?'visible':'hidden';
  if(!visible)return;
  const x=Number(transform[1]),top=Number(transform[2]),facing=a.drawnFacing,contact=contactRow(rows);
  const split=a.motion?.kind==='jump'||a.motion?.kind==='startle'||!!(a.motion?.gallopTimeline&&contact<23);
  if(rows===entry.rows&&facing===entry.facing&&x===entry.x&&top===entry.top&&split===entry.split&&a.surfaces===entry.surfaces&&a.support===entry.support&&entry.strength===entry.paintedStrength)return;
  Object.assign(entry,{rows,facing,x,top,split,surfaces:a.surfaces,support:a.support,paintedStrength:entry.strength});
  const surfaces=(a.surfaces||[]).filter(surface=>surface.right>x&&surface.left<x+24*s&&surface.top>=top&&surface.el?.isConnected!==false);
  const receivers=contactShadows({rows,x,top,facing,surfaces,split},s,4);
  let patchIndex=0;
  for(const [surface,points]of receivers){
   const {left,right,top:y,rectSnapshot:r}=surface;
   const depth=surface.home||surface.internal?2*s:r?Math.min(2*s,r.top+r.height-y):2*s;
   if(depth<=0)continue;
   let patch=group.children[patchIndex++];
   if(!patch){patch=shadowSvg('svg');patch.style.overflow='hidden';group.append(patch);}
   patch.style.display='';
   patch.setAttribute('x',left);patch.setAttribute('y',y);
   patch.setAttribute('width',right-left);patch.setAttribute('height',depth);
   let pointIndex=0;
   for(const {center,density,lift}of points){
    let ellipse=patch.children[pointIndex++];
    if(!ellipse){ellipse=shadowSvg('ellipse');ellipse.setAttribute('cy',0);patch.append(ellipse);}
    const spread=(2.5+Math.min(2,lift*.065))*s;
    ellipse.style.display='';ellipse.setAttribute('cx',center-left);ellipse.setAttribute('rx',spread);ellipse.setAttribute('ry',spread*.36);
    ellipse.setAttribute('opacity',(1-Math.exp(-density/2.1))*entry.strength*Math.exp(-lift/12)*.68);
   }
   for(let i=pointIndex;i<patch.children.length;i++)patch.children[i].style.display='none';
  }
  for(let i=patchIndex;i<group.children.length;i++)group.children[i].style.display='none';
 },
 remove(a){
  const entry=catShadowActors.get(a);if(!entry)return;
  entry.observer?.disconnect();entry.group?.remove();catShadowActors.delete(a);
  const {view}=entry;view.actors.delete(a);view.dirty=true;
  if(!view.actors.size){window.pixelCatScrollOverlayV1?.unmount(view.layer);view.layer.remove();catShadowViews.delete(entry.root);}
 }
};
