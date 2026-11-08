// Home furniture is rendered once in the dock and offers the same directed
// scratch faces as a loose post. It is independent of shared toy spawning.
window.pixelCatHomePostsV1={
 visible(a){return a.config.show_home!==false&&(a.config.show_scratching_post??a.config.scratching_posts??true)!==false;},
 offset(a,width){const available=width/(a.worldScale||a.scale);return available>=59?Math.min(49,available-14):null;},
 render(a,art){
  const dock=a.shadowRoot?.querySelector?.('.dock'),asset=art.dashboardProps?.find(p=>p.id==='scratching_post');if(!dock||!asset||!this.visible(a))return;
  if(a.homePost?.node?.isConnected)return;
  const node=document.createElement('canvas');node.width=asset.width;node.height=asset.height;node.dataset.catPost='';node.setAttribute('aria-label','Scratching post');
  node.style.cssText=`position:absolute;bottom:0;left:${49*(a.worldScale||a.scale)}px;image-rendering:pixelated;width:${asset.width*(a.worldScale||a.scale)}px;height:${asset.height*(a.worldScale||a.scale)}px;pointer-events:none`;
  const c=node.getContext('2d');asset.pixels.forEach((r,y)=>r.forEach((v,x)=>{if(v){c.fillStyle=v;c.fillRect(x,y,1,1);}}));dock.append(node);
  a.homePost={id:'home-post-'+a.ownerKey,asset,node,scale:(a.worldScale||a.scale),homeOwner:a,claimedBy:null,cooldownUntil:0};window.pixelCatVerticalScratchV1?.bind(a.homePost,()=>[...a.decisionLayer()?.owners()||[]].map(([owner])=>owner),a.root);this.sync(a,dock.clientWidth);
 },
 sync(a,width){const p=a.homePost;if(!p)return;if(a.ownerKey)p.id='home-post-'+a.ownerKey;const offset=this.offset(a,width??(a.home?.right-a.home?.left+8));p.offset=offset;p.node.style.display=this.visible(a)&&offset!==null?'':'none';if(offset!==null)p.node.style.left=offset*(a.worldScale||a.scale)+'px';window.pixelCatDepthV1?.home(a);},
 entries(layer){const a=layer.actor,out=[];if(typeof layer.owners!=='function')return out;for(const [owner,info]of layer.owners()){
  const p=owner.homePost;if(!p||!owner.active||!owner.isConnected||info.root!==a.root||!this.visible(owner)||!owner.home||p.offset===null||p.node.isConnected===false)continue;
  const s=owner===a?owner.home:a.surfaces?.find(s=>s.bedOwner===owner&&!s.bed&&!s.foodOwner);if(!s)continue;
  out.push({prop:p,surface:s,left:owner.home.left-4+p.offset*(owner.worldScale||owner.scale)});
 }return out.concat(window.pixelCatHomeLifeV1?.beds(layer)||[]);},
 publish(layer){window.pixelCatVerticalScratchV1?.publish(layer);for(const {prop:p,surface:s,left}of this.entries(layer))layer.world.props.set(p.id,{id:p.id,kind:'scratching_post',x:left+p.asset.width*p.scale/2,y:s.top,width:p.asset.width*p.scale,height:p.asset.height*p.scale,surface:s.el,top:s.top,moving:false,at:layer.world.clock});}
};
