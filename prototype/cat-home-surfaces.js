// A simple bed is a small support above its home floor, not an airborne jump.
Object.assign(window.pixelCatSetupV1,{
 surfaces(a){
  window.pixelCatHomePostsV1?.sync(a);
  window.pixelCatTreeV1?.surfaces(a);
  a.bedSurface=null;if(a.home&&a.config.show_home!==false)a.home.bedOwner=a;
  const owners=new Set([a,...window.pixelCatMouthV1?.homes||[]]);
  for(const owner of owners){if(owner!==a&&(!owner.active||owner.root!==a.root)||owner.config.show_home===false||!owner.home)continue;
   const own=owner===a,s=(owner.worldScale||owner.scale),h=owner.home,bed=this.bed(owner,window.pixelCatRoamingExtrasV1||{});if(!bed)continue;
   let floor=h;if(!own){const el=owner.shadowRoot?.querySelector?.('.dock');if(!el?.isConnected)continue;floor={...h,id:'bed-floor-'+owner.ownerKey,el,home:false,internal:true,bedOwner:owner,label:(owner.config.name||'Cat')+' · bed floor',source:'known home bed'};a.surfaces.push(floor);}
   if(owner.config.bed_style!=='simple'){window.pixelCatHomeLifeV1?.surfaces(a,owner,floor);continue;}
   const left=h.left-4+22*s,surface={...floor,id:own?'home:bed':'guest-bed-'+owner.ownerKey,bed:true,bedOwner:owner,label:(own?'Simple bed':owner.config.name||'Cat')+' · lining',left,right:left+bed.width*s,top:h.top-3*s,source:'authored bed lining'};
   a.surfaces.push(surface);if(own)a.bedSurface=surface;window.pixelCatHomeLifeV1?.surfaces(a,owner,floor);
  }
 },
 restSupport(a,t=0){
  if(a.bedEntryManaged)return;
  if(!a.bedSurface||a.support?.id!=='home'||a.motion||a.route?.length||a.goal||a.command||a.mouthAction)return;
  const b=a.bedSurface;if(Math.abs(a.x+12*a.scale-(b.left+b.right)/2)>10*a.scale)return;
  a.support=b;a.y=b.top;window.pixelCatExplorationV1?.observe(a,t);
 },
 stepOff(a,next,t){
  const from=a.support,to=next.settle?next.surface:next;if(!from||!to||from.id===to.id||!from.bed&&!to.bed)return false;
  const owner=(from.bed?from:to).bedOwner||a,floor=a.surfaces.find(s=>!s.bed&&s.bedOwner===owner)||a.surfaces.find(s=>s.id==='home');if(!floor)return false;
  // Foreign surfaces are reached from the home floor first; their original route remains queued.
  if(from.bed){
   const direction=((next.settle?next.x:(to.min+to.max)/2)+12*a.scale)>a.x+12*a.scale?1:-1;
   const x=Math.max(floor.min,Math.min(floor.max,a.x+direction*12*a.scale));if(Math.abs(x-a.x)<a.scale)return false;
   a.moveTo(x,floor.top,0,'walk',floor,t);if(a.motion)a.motion.homeStep=true;return true;
  }
  if(to.bed&&from.id===floor.id){
   a.route.shift();a.moveTo(to.min,to.top,0,'walk',to,t);if(a.motion)a.motion.homeStep=true;return true;
  }
  return false;
 },
 walkHeight(a,m,sample){
  const shallow=window.pixelCatShallowV1?.height(a,m,sample);if(shallow!=null)return shallow;
  if(!m.homeStep)return m.fromY;
  // Height changes follow the same native-cell clock as the planted walk cycle.
  const cells=Math.max(1,m.cells||1),step=Math.min(cells,Math.max(0,m.sneakTimeline?Math.abs(sample.x-m.fromX)/a.scale:sample.step||0)),u=m.target.bed?Math.max(0,(step-Math.max(0,cells-6))/Math.min(6,cells)):Math.min(1,step/Math.min(6,cells));
  const delta=m.y-m.fromY;
  if(u===1)return m.y;
  return m.fromY+Math.sign(delta)*Math.min(Math.abs(delta),Math.round(Math.abs(delta)/a.scale*u)*a.scale);
 }
});
