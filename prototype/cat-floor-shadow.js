// A flat projection of the drawn pixels. Translucent black dims the backdrop
// even when the dashboard's scroll portal creates its own stacking context.
const catShadowViews=new WeakMap(),catShadowActors=new WeakMap();
const shadowSvg=tag=>document.createElementNS('http://www.w3.org/2000/svg',tag);
const shadowSide=Math.sin(Math.PI/10)/Math.tan(63*Math.PI/180);
const shadowDepth=.68*Math.cos(Math.PI/10)/Math.tan(63*Math.PI/180);
let catShadowSerial=0;
window.pixelCatFloorShadowV1={
 projection(rows,facing){
  const bottom=rows.findLastIndex(row=>/[^.]/.test(row))+1;
  let d='';
  for(let y=0;y<bottom;y++)for(const run of rows[y].matchAll(/[^.]+/g)){
   const w=run[0].length,x=facing<0?24-run.index-w:run.index,h=bottom-y-1;
   d+=`M${x+h*shadowSide} ${-h*shadowDepth}h${w}l${shadowSide} ${-shadowDepth}h-${w}Z`;
  }
  return {bottom,d};
 },
 view(root){
  let view=catShadowViews.get(root);if(view)return view;
  const layer=shadowSvg('svg'),defs=shadowSvg('defs'),clip=shadowSvg('clipPath'),cut=shadowSvg('path'),ink=shadowSvg('g');
  clip.id='pixel-cat-shadow-cut-'+(++catShadowSerial);
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
 sync(a,ground){
  if(!a.root||!a.svg||!a.active||typeof MutationObserver!=='function')return;
  let entry=catShadowActors.get(a);
  if(entry?.root!==a.root){this.remove(a);entry=null;}
  if(!entry){
   const view=this.view(a.root);
   entry={view,root:a.root,dark:window.pixelCatOutlineV1?.darkTheme?.()};catShadowActors.set(a,entry);view.actors.set(a,entry);
  }
  const {view}=entry;
  this.furniture(a,entry);
  if(a.config.floor_shadow!==false&&!entry.path){
   entry.path=shadowSvg('path');entry.path.dataset.catFloorShadow='';view.ink.append(entry.path);
   entry.observer=new MutationObserver(()=>this.paint(a,entry));
   entry.observer.observe(a.layer,{attributes:true,attributeFilter:['style']});
   entry.observer.observe(a.svg,{attributes:true,attributeFilter:['style','clip-path'],subtree:true,childList:true});
  }
  if(!entry.path)return;
  const overlay=window.pixelCatScrollOverlayV1;
  if(!overlay?.mount(view.layer,a.root))return;
  overlay.follow(view.layer,a.layer);
  const viewport=`${window.innerWidth}:${window.innerHeight}`;
  if(view.dirty||viewport!==view.viewport){
   view.dirty=false;view.viewport=viewport;
   view.cut.setAttribute('d',`M0 0H${window.innerWidth}V${window.innerHeight}H0Z`+[...view.actors.values()].map(other=>other.holes).join(''));
  }
  const dark=a._hass?.themes?.darkMode??entry.dark,opacity=dark?.6:.2;
  if(opacity!==entry.opacity){entry.opacity=opacity;entry.path.style.opacity=String(opacity);}
  const changed=entry.ground!==ground;entry.ground=ground;
  if(!entry.rows||changed&&['jump','startle'].includes(a.motion?.kind))this.paint(a,entry);
 },
 paint(a,entry){
  const {path}=entry,rows=a.drawnRows,s=a.scale;
  const transform=/^translate\(([-\d.]+)px,\s*([-\d.]+)px\)$/.exec(a.svg.style.transform);
  const visible=!!(rows&&transform&&a.layer.style.visibility==='visible'&&!a.userHeld&&!a.climb&&!a.bedInside&&!a.svg.firstElementChild?.hasAttribute('clip-path'));
  if(path.style.visibility!==(visible?'visible':'hidden'))path.style.visibility=visible?'visible':'hidden';
  if(!visible)return;
  if(rows!==entry.rows||a.drawnFacing!==entry.facing){
   entry.rows=rows;entry.facing=a.drawnFacing;entry.shape=this.projection(rows,a.drawnFacing);path.setAttribute('d',entry.shape.d);
  }
  const feet=Number(transform[2])+entry.shape.bottom*s,airborne=['jump','startle'].includes(a.motion?.kind);
  const lift=airborne?Math.max(0,(entry.ground-feet)/s):0;
  const place=`translate(${Number(transform[1])+lift*shadowSide*s} ${feet+lift*(1-shadowDepth)*s}) scale(${s})`;
  if(place!==entry.place){entry.place=place;path.setAttribute('transform',place);}
  if(!path.style.filter)path.style.filter='blur(.3px)';
 },
 remove(a){
  const entry=catShadowActors.get(a);if(!entry)return;
  entry.observer?.disconnect();entry.path?.remove();catShadowActors.delete(a);
  const {view}=entry;view.actors.delete(a);view.dirty=true;
  if(!view.actors.size){window.pixelCatScrollOverlayV1?.unmount(view.layer);view.layer.remove();catShadowViews.delete(entry.root);}
 }
};
