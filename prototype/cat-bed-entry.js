// Route to rest before applying its mask. The bed is an affordance, not a wall.
window.pixelCatBedEntryV1={
 beforeIdle(a,pose,t,art,front){
  a.bedEntryManaged=true;if(a.motion||a.route?.length||a.previewPose||a.play||a.mouthAction||a.goal||a.command)return false;if(this.exit(a,pose,t,art))return true;if(!['loaf','sleep'].includes(pose))return false;
  const owner=a.support?.bedOwner||a;if(owner.config.show_home===false||!owner.home||!a.support||a.support!==a.home&&!a.support.bedOwner)return false;
  const bed=window.pixelCatSetupV1.bed(owner,art),left=owner.home.left-4+22*(owner.worldScale||owner.scale),center=left+bed.width*(owner.worldScale||owner.scale)/2;if(Math.abs(a.x+12*a.scale-center)>24*a.scale)return false;
  if(a.bedInside===owner)return false;
  const clip=art.idleSequences[pose],reference=clip.frames[Math.max(0,clip.roles?.indexOf('cycle')??0)],xs=reference.flatMap(r=>[...r].flatMap((v,x)=>v==='.'?[]:[a.facing<0?23-x:x])),desired=left+Math.round((bed.width*(owner.worldScale||owner.scale)/2-(Math.min(...xs)+Math.max(...xs)+1)*a.scale/2)/a.scale)*a.scale;
  const facing=desired>=a.x?1:-1,restBearing=desired+front(reference,facing)*a.scale,gait=art.sneak?.every(Boolean)&&(owner.config.bed_style!=='simple'||(a.ensureMood?.().random()??Math.random())<.12)?'sneak':null,first=gait?art.sneak[0].frames[0]:art.walk[(a.walkSteps+1)%art.walk.length],x=restBearing-front(first,facing)*a.scale;
  const target=owner.config.bed_style==='simple'?a.surfaces.find(s=>s.bed&&s.bedOwner===owner):a.support;
  if(!target)return false;if(Math.abs(x-a.x)<=a.scale){a.bedInside=owner;return false;}
  const oldIdle=a.idle,oldMotion=a.motion;if(!gait)a.urgency='casual';a.moveTo(x,target.top,0,'walk',target,t,gait);if(!a.motion||a.motion===oldMotion){a.idle=oldIdle;return false;}
  if(gait){const m=a.motion;let best=null;for(let delta=-8;delta<=8;delta++){const end=x+delta*a.scale,cells=Math.round(Math.abs(end-m.fromX)/a.scale);if(cells<2||Math.sign(end-m.fromX)!==m.direction)continue;const timeline=window.pixelCatPolishV1.sneakTimeline(cells,art),last=timeline.at(-1),error=Math.abs(end+front(art.sneak[last.variant].frames[last.frame],m.direction)*a.scale-restBearing);if(!best||error<best.error)best={error,end,cells,timeline};}if(best){m.x=best.end;m.cells=best.cells;m.sneakTimeline=best.timeline;m.duration=best.timeline.at(-1).until;}}
  if(!gait){const m=a.motion;let best=null;for(let delta=-8;delta<=8;delta++){const end=m.x+delta*a.scale,cells=Math.round(Math.abs(end-m.fromX)/a.scale);if(cells<2||Math.sign(end-m.fromX)!==m.direction)continue;const last=art.walk[(m.gaitStart+cells+1)%art.walk.length],error=Math.abs(end+front(last,m.direction)*a.scale-restBearing);if(!best||error<best.error)best={end,error};}if(best&&best.end!==m.x){a.moveTo(best.end,target.top,0,'walk',target,t);a.motion.departure=m.departure;a.motion.start=m.start;}}
  if(target.bed)a.motion.homeStep=true;a.bedEntry={owner,pose,motion:a.motion,side:facing>0?'left':'right'};a.setAttribute?.('data-bed-entry','approach');return true;
 },
 exit(a,pose,t,art){
  const owner=a.bedInside;if(!owner||owner.config.bed_style==='simple'||['loaf','sleep'].includes(pose))return false;
  const floor=a.support,bed=window.pixelCatSetupV1.bed(owner,art),left=owner.home.left-4+22*(owner.worldScale||owner.scale),right=left+bed.width*(owner.worldScale||owner.scale),options=[{side:'right',x:right+2*a.scale},{side:'left',x:left-24*a.scale}];if(a.facing<0)options.reverse();
  const option=options.map(o=>({...o,x:Math.round(Math.max(floor.min,Math.min(floor.max,o.x))/a.scale)*a.scale})).find(o=>Math.abs(o.x-a.x)>2*a.scale&&(o.side==='right'?o.x>=right:o.x+21*a.scale<=left)&&a.social?.clear?.(floor,o.x)!==false);
  if(!option){if(a.idle){a.idle.poseUntil=t+1000;if(a.idle.rows&&a.idle.placement)window.pixelCatSetupV1.restPlacement(a,a.idle.placement,a.idle.rows,art,t);}return true;}
  a.moveTo(option.x,floor.top,0,'walk',floor,t,art.sneak?.every(Boolean)?'sneak':null);a.bedEntry={owner,pose,motion:a.motion,side:option.side,exit:true};a.setAttribute?.('data-bed-entry','departure');return true;
 },
 moving(a){a.bedInside=null;a.bedEntry=null;window.pixelCatSetupV1?.clearRestMask(a);},
 travelEnd(a,m){const e=a.bedEntry;if(e?.motion!==m)return;a.bedInside=e.exit?null:e.owner;a.previewBedPose=e.pose;a.bedEntry=null;a.idle&&(a.idle.poseUntil=0);a.setAttribute?.('data-bed-entry','inside');},
 mask(a,rows,ownerOverride,sideOverride){const e=ownerOverride?{owner:ownerOverride,side:sideOverride}:a.bedEntry;if(!ownerOverride&&e&&e.motion!==a.motion){a.bedEntry=null;return;}if(!e||e.owner.config.bed_style==='simple'||!a.svg?.firstElementChild)return;
  const owner=e.owner,s=a.scale,xy=/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(a.svg.style.transform||''),placement={x:xy?Number(xy[1]):a.x,top:xy?Number(xy[2]):a.y-24*s},path=window.pixelCatSetupV1.openingPath(owner,placement,s,window.pixelCatRoamingExtrasV1,e.side);
  if(!a.bedEntryMask){const ns='http://www.w3.org/2000/svg',defs=document.createElementNS(ns,'defs'),clip=document.createElementNS(ns,'clipPath'),shape=document.createElementNS(ns,'path');clip.id='cat-entry-'+a.ownerKey;clip.setAttribute('clipPathUnits','userSpaceOnUse');clip.append(shape);defs.append(clip);a.svg.append(defs);a.bedEntryMask={id:clip.id,shape};}
  a.bedEntryMask.shape.setAttribute('d',path);a.svg.firstElementChild.setAttribute('clip-path',`url(#${a.bedEntryMask.id})`);
 },
 rest(a,placement){if(!a.bedEntryManaged)return false;const owner=a.support?.bedOwner||a;return a.bedInside!==owner;}
};
