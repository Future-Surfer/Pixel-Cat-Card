// All supported scroll planes share a support-depth ordering. No layout reads here.
window.pixelCatDepthV1={
 key(y,tie=0){return Math.max(0,Math.min(2000000000,Math.round((Number(y)||0)*16)+1000000))*4+tie;},
 set(node,y,tie=0){if(!node?.style)return;const z=String(this.key(y,tie));if(node.style.zIndex!==z)node.style.zIndex=z;},
 cat(a,t){if(!a.layer)return;const m=a.motion,u=m?Math.max(0,Math.min(1,(t-m.start)/(m.duration||1))):0,y=m?m.fromY+(m.y-m.fromY)*u:a.support?.top??a.y;const ep=a.social?.episode,cuddled=ep?.kind==='cuddle'&&ep.stage==='cuddled'&&!m;this.set(a.layer,cuddled?Math.max(y,ep.target.support?.top??y):y,cuddled?3:2);if(a.userHeld)a.layer.style.zIndex='2147483647';this.home(a);window.pixelCatTreeV1?.tick(a,t);window.pixelCatFloorShadowV1?.sync(a);},
 prop(scene,p,s,visible=true,source){if(!p.node||!scene.root)return;window.pixelCatScrollOverlayV1?.mount(p.node,scene.root);window.pixelCatScrollOverlayV1?.follow(p.node,source?.layer);p.node.style.visibility=visible?'visible':'hidden';this.set(p.node,s.top);},
 home(a){const p=a.homePost;if(!p?.node||!a.active||!a.home||!a.root||typeof document==='undefined')return;
  if(!a.postRenderLayer){const n=document.createElement('div');n.style.cssText='position:fixed;inset:0;pointer-events:none';n.dataset.catHomeFurniture='';document.body?.append?.(n);a.postRenderLayer=n;}
  const mounted=window.pixelCatScrollOverlayV1?.mount(a.postRenderLayer,a.root);if(!mounted)return;
  if(p.node.parentElement!==a.postRenderLayer)a.postRenderLayer.append(p.node);p.node.style.bottom='auto';p.node.style.left='0px';p.node.style.top='0px';const transform=`translate(${a.home.left-4+(p.offset||0)*p.scale}px,${a.home.top-p.asset.height*p.scale}px)`;if(p.node.style.transform!==transform)p.node.style.transform=transform;
  window.pixelCatEffectsV1?.paintPost(p);this.set(a.postRenderLayer,a.home.top);a.postRenderLayer.style.visibility=a.layer?.style.visibility!=='hidden'&&!a.suspended&&!a.stranded&&a.active&&a.config.show_home!==false?'visible':'hidden';
 },
 remove(a){window.pixelCatFloorShadowV1?.remove(a);if(a.postRenderLayer){window.pixelCatScrollOverlayV1?.unmount(a.postRenderLayer);a.postRenderLayer.remove();a.postRenderLayer=null;}a.homePost=null;},
 removeProp(p){window.pixelCatScrollOverlayV1?.unmount(p.node);}
};
