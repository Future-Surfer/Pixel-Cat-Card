// Keep decorative pixels in the dashboard's scrolling/composited subtree.
// The camera converts existing viewport geometry; simulation coordinates stay unchanged.
const catScrollPortals=new WeakMap(),catScrollLayers=new WeakMap(),catScrollAnchors=new WeakMap();
window.pixelCatScrollOverlayV1={
 offset(layer,x=0){if(!layer?.style)return;const p=catScrollAnchors.get(layer);if(p)p.offset=x;const value=p?`${x-p.x}px ${-p.y}px`:x?`${x}px 0px`:'';if(layer.style.translate!==value)layer.style.translate=value;},
 anchor(layer,state){if(!state.rect)return;const p=catScrollAnchors.get(layer)||{offset:0};p.x=state.rect.left;p.y=state.rect.top;catScrollAnchors.set(layer,p);this.offset(layer,p.offset);},
 follow(layer,source){const p=catScrollAnchors.get(layer),s=catScrollAnchors.get(source);if(p&&s){p.x=s.x;p.y=s.y;this.offset(layer,p.offset);}},
 container(root){
  if(typeof getComputedStyle!=='function')return null;
  for(let el=root;el;el=el.parentElement||el.getRootNode?.()?.host){
   const css=getComputedStyle(el);if(css.transform&&css.transform!=='none')return null;
   if(['relative','absolute'].includes(css.position))return el.shadowRoot||el;
   // An outside containing block would leave us fixed while this element scrolls.
   if(/auto|scroll/.test(css.overflowY||css.overflow)&&el!==root)return null;
   if(el===document.body)return el;
  }return null;
 },
 mount(layer,root){
  if(!layer||!root)return null;const prior=catScrollLayers.get(layer);if(prior?.root===root&&prior.portal.isConnected){this.anchor(layer,prior);return prior;}
  const container=this.container(root);if(!container?.append)return null;
  let state=catScrollPortals.get(root);
  if(!state?.portal.isConnected){
   const portal=document.createElement('div'),camera=document.createElement('div');portal.dataset.pixelCatScrollPlane='';portal.setAttribute('role','presentation');
   portal.style.cssText='position:absolute;inset:0;z-index:10;pointer-events:none;overflow:clip';camera.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:visible';portal.append(camera);container.append(portal);
   state={root,portal,camera,layers:new Set()};catScrollPortals.set(root,state);
  }
  if(prior)this.unmount(layer);layer.style.position='absolute';layer.style.overflow='visible';state.camera.append(layer);state.layers.add(layer);catScrollLayers.set(layer,state);this.anchor(layer,state);return state;
 },
 sync(a,t){
  const held=a.climb?.stage==='grip'&&catScrollAnchors.get(a.layer),anchor=held&&{left:held.x,top:held.y};
  const state=this.mount(a.layer,a.root);if(!state)return;
  if(state.at!==t){state.at=t;state.rect=state.portal.getBoundingClientRect();state.event={type:'scroll',target:document};}this.anchor(a.layer,state);
  const r=state.rect,previous=a.scrollCamera;a.scrollCamera={root:a.root,x:r.left,y:r.top};
  if(previous?.root===a.root&&(Math.abs(r.left-previous.x)>.001||Math.abs(r.top-previous.y)>.001)){
   // Sample each animation frame too: touch inertia can outrun scroll-event delivery.
   window.pixelCatScrollV1?.mark(a,state.event);a.needsMeasure=true;
  }
  // A held/deferred climb retains the camera paired with its displayed pose.
  // Its next draw commits the current camera together with translated geometry.
  if(anchor)this.anchor(a.layer,{rect:anchor});
 },
 unmount(layer){const state=catScrollLayers.get(layer);if(!state)return;state.layers.delete(layer);catScrollLayers.delete(layer);catScrollAnchors.delete(layer);layer.style.translate='';if(!state.layers.size){state.portal.remove();if(catScrollPortals.get(state.root)===state)catScrollPortals.delete(state.root);}}
};
