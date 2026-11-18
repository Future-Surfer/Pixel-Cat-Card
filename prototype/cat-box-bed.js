/* The original box sheets share a fixed 24-cell canvas. The box itself stays
   anchored to the card while the cat follows the authored offsets. */
(() => {
const art=window.pixelCatBoxArtV1, source=art.asset;
const asset={...source,name:'Cardboard box',pixels:source.rows.map(row=>[...row].map(cell=>source.palette[cell]||null))};
const entry=[art.crouch,...art.entry];
const exit=[...art.exit,art.crouch];
const peek=art.beats.map(({head,tail})=>art.parts.head[head].map((row,y)=>
 [...row].map((cell,x)=>cell==='.'?art.parts.tail[tail][y][x]:cell).join('')));
const motion={
 entry:{frames:entry,holds:[300,115,115,140,130],columns:[21,21,15,7,3]},
 exit:{frames:exit,holds:[200,115,145,180]},
};
const sample=(elapsed,holds)=>{
 let index=0;
 while(index<holds.length-1&&elapsed>=holds[index])elapsed-=holds[index++];
 return {index,progress:Math.min(1,elapsed/holds[index])};
};
const time=holds=>holds.reduce((sum,hold)=>sum+hold,0);
const peekHolds=art.beats.map(beat=>beat.hold*260);
const poseFor={entry:'Jumping into the box',peek:'Resting in the box',exit:'Jumping out of the box'};

const geometry=(a,owner,floor=a.support)=>{
 const node=owner.shadowRoot?.querySelector('[data-cat-bed]');
 if(!floor||!owner.home||!node||node.isConnected===false||owner.config.show_home===false||owner.config.include_bed===false||owner.config.bed_style!=='box')return null;
 const s=a.scale,cell=owner.worldScale||owner.scale,left=owner.home.left-4+22*cell,right=left+asset.width*cell;
 // The furniture canvas sits one CSS pixel above the dock's floor border.
 const bottom=floor.top-1;
 return {floor,node,s,cell,left,right,rim:bottom-6*cell,upperEdge:bottom-asset.height*cell,centre:(left+right)/2};
};
const anchor=(g,column,facing)=>facing>0?g.left-column*g.s:g.right-(24-column)*g.s;
const clear=(a,g,x)=>x>=g.floor.min&&x<=g.floor.max&&a.social?.clear?.(g.floor,x)!==false;
const claimed=(a,owner)=>owner.boxClaim!==a&&owner.boxClaim?.active&&owner.boxClaim.boxBed?.owner===owner;
const close=(x,y,s)=>Math.abs(x-y)<=2*s;
const fit=(x,g)=>Math.max(g.floor.min,Math.min(g.floor.max,Math.round(x/g.s)*g.s));
const blocked=a=>a.userHeld||a.motion||a.climb||a.previewPose||a.play||a.mouthAction||a.command||a.goal||a.route?.length;
const escape=(a,g,facing)=>{
 for(const direction of [facing,-facing]){
  const x=fit(direction>0?g.right-3*g.s:g.left-21*g.s,g);
  if(clear(a,g,x)&&(direction>0?x+5*g.s>=g.right:x+19*g.s<=g.left))return {x,facing:direction};
 }
 return null;
};

function foreground(a,g,x,top,tucked) {
 const svg=a.svg,ns='http://www.w3.org/2000/svg';
 if(a.boxMask?.svg!==svg){
  const defs=document.createElementNS(ns,'defs'),clip=document.createElementNS(ns,'clipPath'),path=document.createElementNS(ns,'path');
  clip.id='cat-box-'+a.ownerKey;
  clip.append(path);defs.append(clip);svg.append(defs);a.boxMask={svg,clip,path};
 }
 const l=(g.left-x)/g.s,r=(g.right-x)/g.s,y=(g.rim-top)/g.s;
 // Everything above the rim and on either side can show through.
 a.boxMask.path.setAttribute('d',tucked?'M0 0Z':`M-100 -100H100V${y}H-100Z M-100 ${y}H${l}V100H-100Z M${r} ${y}H100V100H${r}Z`);
 svg.firstElementChild.setAttribute('clip-path',`url(#${a.boxMask.clip.id})`);
}

window.pixelCatBoxV1={
 asset,
 arrive(a,t){
  if(a.boxArrivalChecked||a.config.bed_style!=='box'||!a.home||a.support!==a.home)return;
  a.boxArrivalChecked=true;
  if(a.config.arrival===false||a.config.arrival==='none'||blocked(a))return;
  const g=geometry(a,a);
  if(this.canSettle(a,a,g))this.settle(a,a,g,t);
 },
 canSettle(a,owner,g){
  return !!g&&!claimed(a,owner)&&!!escape(a,g,a.facing)&&clear(a,g,g.centre-12*g.s);
 },
 settle(a,owner,g,t){
  this.cancel(a);
  a.boxArrivalChecked=true;
  owner.boxClaim=a;
  a.bedInside=owner;
  a.boxBed={owner,node:g.node,support:g.floor.id,phase:'peek',facing:a.facing,elapsed:0,rest:this.restDuration(a)};
  this.render(a,g,a.boxBed,t);
 },
 restDuration(a){return 9000+7000*a.ensureMood().random();},
 landing(a,surface,x,fromY){
  if(!Number.isFinite(x)||!Number.isFinite(fromY))return null;
  const centre=x+12*a.scale;
  let best=null;
  for(const floor of a.surfaces||[]){
   const owner=floor.bedOwner||(floor===a.home?a:null);
   if(!owner||floor.bed||floor.foodOwner||floor.toyHomeOwner||
      owner!==a&&(!owner.active||owner.root!==a.root)||floor.top<fromY||surface&&Math.abs(floor.top-surface.top)>1)continue;
   if(surface&&floor!==surface&&floor.el!==surface.el&&(!floor.rectNode||floor.rectNode!==surface.rectNode))continue;
   const g=geometry(a,owner,floor);
   if(!g||centre<g.left-2*g.cell||centre>g.right+2*g.cell||!this.canSettle(a,owner,g))continue;
   if(!best||floor.top<best.surface.top)best={surface:floor,x,owner,node:g.node,markerX:g.left+2*g.cell,markerY:g.rim,markerWidth:(asset.width-4)*g.cell};
  }
  return best;
 },
 project(a,x,top){return this.landing(a,null,x,top);},
 land(a,m){
  if(m.kind!=='jump'&&m.kind!=='startle')return;
  const target=this.landing(a,a.support,a.x,m.fromY);
  if(target)a.boxLanding={id:a.support.id,offset:a.x-a.support.left,owner:target.owner,node:target.node};
 },
 receiveLanding(a,t){
  const pending=a.boxLanding;
  if(!pending)return;
  a.boxLanding=null;
  if(a.userHeld||a.motion||a.climb||!a.active||a.support?.id!==pending.id)return;
  const target=this.landing(a,a.support,a.support.left+pending.offset,a.support.top);
  if(!target||target.owner!==pending.owner||target.node!==pending.node)return;
  a.social?.finish('landed in box');
  window.pixelCatDashboardChaseV1?.detach(a);
  a.cancelPlay?.(t);
  if(!a.command&&!a.goal)a.route=[];
  const g=geometry(a,target.owner,target.surface);
  a.support=target.surface;a.y=target.surface.top;
  this.settle(a,target.owner,g,t);
 },
 cancel(a){
  a.boxLanding=null;
  if(!a.boxBed)return;
  const {owner}=a.boxBed;
  if(a.bedInside===owner)a.bedInside=null;
  if(owner.boxClaim===a)owner.boxClaim=null;
  a.boxBed=null;
  window.pixelCatSetupV1?.clearRestMask(a);
 },
 begin(a,pose,t){
  if(!['loaf','sleep'].includes(pose)||blocked(a)||a.support!==a.home&&!a.support?.bedOwner)return false;
  const owner=a.support.bedOwner||a,g=geometry(a,owner);
  if(!g||Math.abs(a.x+12*g.s-g.centre)>24*g.cell||!escape(a,g,a.facing))return false;
  if(claimed(a,owner))return false;
  const directions=a.x+12*g.s<=g.centre?[1,-1]:[-1,1];
  const facing=directions.find(direction=>clear(a,g,fit(anchor(g,21,direction),g)));
  if(!facing)return false;
  const launch=fit(anchor(g,21,facing),g);
  const state={owner,node:g.node,support:g.floor.id,phase:'entry',facing,elapsed:0,rest:this.restDuration(a)};
  if(!close(a.x,launch,g.s)){
   a.moveTo(launch,g.floor.top,0,'walk',g.floor,t);
   if(!a.motion)return false;
   state.phase='approach';
  }
  owner.boxClaim=a;
  a.boxBed=state;
  return true;
 },
 tick(a,t,gap){
  this.receiveLanding(a,t);
  const state=a.boxBed;
  if(!state)return false;
  const {owner}=state,g=geometry(a,owner);
  if(!g||g.node!==state.node||g.floor.id!==state.support||owner!==a&&(!owner.active||owner.root!==a.root)){
   this.cancel(a);return false;
  }
  if(state.phase==='approach'){
   if(a.command||a.goal){this.cancel(a);return false;}
   if(a.motion)return false;
   state.phase='entry';
  }else if(a.motion||a.climb||a.userHeld){
   this.cancel(a);return false;
  }
  const delta=gap>=0&&gap<1000?Math.min(gap,50):0;
  state.elapsed+=delta;
  const wantsOut=a.command||a.goal||a.route?.length||a.previewPose||a.recallPending||a.playRequested;
  if(state.phase==='entry'&&state.elapsed>=time(motion.entry.holds)){
   state.phase='peek';state.elapsed=0;a.bedInside=owner;
  }
  if(state.phase==='peek'&&(wantsOut||state.elapsed>=state.rest)){
   const landing=escape(a,g,state.facing);
   if(landing){state.phase='exit';state.elapsed=0;state.facing=landing.facing;}
  }
  if(state.phase==='exit'&&state.elapsed>=time(motion.exit.holds)){
   const landing=escape(a,g,state.facing);
   if(!landing||landing.facing!==state.facing){state.phase='peek';state.elapsed=0;return true;}
   this.cancel(a);a.x=landing.x;a.y=g.floor.top;a.idle=null;a.deadline=t+1800;
   a.facing=landing.facing;a.draw(art.crouch);
   return true;
  }
  this.render(a,g,state,t);
  return true;
 },
 render(a,g,state,t){
  const phase=state.phase,kitten=a.lifeStage==='kitten',tucked=kitten&&phase==='peek';
  const clip=motion[phase],{index,progress}=sample(
   tucked?0:phase==='peek'?state.elapsed%time(peekHolds):state.elapsed,clip?.holds||peekHolds);
  const rows=(clip?.frames||peek)[index],inside=g.centre-12*g.s;
  const facing=state.facing;
  // The shallowest authored ear tips are on row 13. Put that full cell
  // above the upper edge while the lower front lip still masks the body.
  const restTop=kitten?g.rim-15*g.s:g.upperEdge-14*g.s;
  let x=inside,top=restTop;
  if(phase==='entry'){
   x=fit(anchor(g,clip.columns[index],facing),g);
   const blend=Math.max(0,(index+progress-3)/2);
   x+=(inside-x)*blend;
   top=g.floor.top-24*g.s+(restTop-(g.floor.top-24*g.s))*blend;
  }else if(phase==='exit'){
   const landing=escape(a,g,facing);
   const blend=Math.min(1,(index+progress)/3);
   if(landing)x+=(landing.x-x)*blend;
   top+=(g.floor.top-24*g.s-top)*blend;
  }
  a.x=x;a.y=g.floor.top;a.facing=facing;
  a.idle={pose:phase==='peek'?'loaf':'stand',start:t,poseUntil:t,rows,placement:{x,top},support:g.floor.id};
  a.draw(rows);a.svg.style.transform=`translate(${x}px,${top}px)`;
  foreground(a,g,x,top,tucked);
  const shown=tucked?'rest':phase;
  a.setAttribute('data-pose','box-'+shown);
  a.setAttribute('data-frame',`box-${shown}-${index+1}`);
  a.setAttribute('data-sequence-id',`box-${shown}`);
  a.setAttribute('data-frame-origin','human');
  a.status(poseFor[phase]);
 }
};
})();
