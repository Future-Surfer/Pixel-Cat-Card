// Taps offer an existing hunt to one nearby cat. They never force a route or wake a sleeper.
window.pixelCatToyInvitationV1={
 bind(toy,scene,pointFor){
  const node=toy.node,label=toy.asset.id==='ball'?'ball':'mouse toy';
  node.setAttribute('role','button');node.setAttribute('tabindex','0');
  node.setAttribute('aria-label','Invite a nearby cat to investigate the '+label);
  node.style.pointerEvents='auto';node.style.cursor='pointer';node.style.touchAction='pan-x pan-y pinch-zoom';
  let start=null;
  const offer=event=>{event.stopPropagation();this.invite(toy,scene,pointFor,performance.now());};
  node.addEventListener?.('pointerdown',event=>{start={id:event.pointerId,x:event.clientX,y:event.clientY};});
  node.addEventListener?.('pointermove',event=>{if(start?.id===event.pointerId&&Math.hypot(event.clientX-start.x,event.clientY-start.y)>8)start=null;});
  node.addEventListener?.('pointercancel',()=>{start=null;});
  node.addEventListener?.('click',event=>{
   if(event.detail===0||start&&Math.hypot(event.clientX-start.x,event.clientY-start.y)<=8)offer(event);
   start=null;
  });
  node.addEventListener?.('keydown',event=>{
   if(!event.repeat&&(event.key==='Enter'||event.key===' ')){event.preventDefault();offer(event);}
  });
 },
 clip(toy,mirror,turn){
  const {width,pixels}=toy.asset,scale=toy.scale,paths=[];
  for(let y=0;y<pixels.length;y++)for(let x=0;x<width;x++){
   if(!pixels[y][x])continue;
   let px=mirror?width-1-x:x,py=y;
   for(let i=0;i<turn;i++)[px,py]=[width-1-py,px];
   paths.push(`M${px*scale} ${py*scale}h${scale}v${scale}h-${scale}Z`);
  }
  toy.node.style.clipPath=`path("${paths.join('')}")`;
 },
 invite(toy,scene,pointFor,t){
  if(!scene.enabled||!scene.props.includes(toy)||toy.claimedBy||toy.carrier||toy.ballMotion||toy.releaseFall||scene.time<Math.max(toy.cooldownUntil,toy.inviteAfter||0))return false;
  toy.inviteAfter=scene.time+4000;
  const choices=[];
  for(const cat of scene.members){
   if(cat.root!==scene.root||!cat.isConnected||cat.config.toy_hunting===false||cat.carriedToy||['sleep','loaf'].includes(cat.idle?.pose))continue;
   const layer=cat.decisionLayer?.();
   if(!layer?.available(cat)||layer.episode||layer.scene.has(cat))continue;
   const point=pointFor(cat,toy);
   if(!point)continue;
   const distance=Math.hypot(point.x-cat.x-12*cat.scale,point.y-cat.y)/cat.scale;
   if(distance<=96)choices.push({cat,distance});
  }
  choices.sort((a,b)=>a.distance-b.distance);
  for(const {cat}of choices){
   const mood=cat.ensureMood(),{playfulness=.5,sleepiness=.5}=mood.values||{};
   if(mood.random()<(.35+.55*playfulness)*(1-.6*sleepiness)&&cat.beginToyHunt(t,false,toy))return true;
  }
  return false;
 }
};
