// Per-bout choices, never per-frame random decisions. Existing motion remains
// authoritative: hesitation changes preparation only, not ballistic flight.
window.pixelCatMotionOptionsV1={
 select(a,kind,gait,target,x,art,basePace=9,random=Math.random){
  const p=window.pixelCatBehaviourV1,preference=kind==='walk'&&!gait?p?.preferredPace(a):null;
  if(kind!=='walk'||gait||!preference||!art.travelChoices)return this.legacy(a,kind,gait,target,x,art,random);
  const cells=Math.abs(x-a.x)/a.scale,options=[];
  for(const entry of art.travelChoices){const clip=art[entry.key];if(!clip||cells<(entry.minCells||0)||entry.engine!=='walk'&&!p.allowed(a,clip))continue;let speed,choice={};
   if(entry.engine==='walk')speed=basePace;
   else if(entry.engine==='step'){if(a.config.fast_walk===false)continue;speed=Math.max(15,Math.min(30,Number(a.config.fast_walk_fps)||clip.fps||21));choice.fast=clip;}
   else if(entry.engine==='bound'){if(!this.canBound(a,clip,target,x))continue;const rate=Math.max(15,Math.min(30,Number(a.config.gallop_fps)||clip.fps||25)),cycles=Math.floor(cells/clip.strideCells),seconds=cycles*clip.frames.length/rate+(cells-cycles*clip.strideCells)/12;speed=cells/seconds;choice.gallop=clip;}
   else continue;
   options.push({...choice,key:entry.key,speed,weight:p.paceWeight(speed,preference,entry.prior??1)});
  }
  if(!options.length)return {};let r=random()*options.reduce((n,o)=>n+o.weight,0);const chosen=options.find(o=>(r-=o.weight)<0)||options.at(-1);
  a.setAttribute?.('data-pace-choice',JSON.stringify({preferred:Number(preference.target.toFixed(1)),chosen:chosen.key,speed:Number(chosen.speed.toFixed(1)),options:options.map(o=>({key:o.key,speed:Number(o.speed.toFixed(1)),weight:Number(o.weight.toFixed(3))}))}));return chosen;
 },
 legacy(a,kind,gait,target,x,art,random){const gallop=this.gallop(a,kind,gait,target,x,art,random);const fast=!gallop&&kind==='walk'&&gait!=='sneak'&&a.config.fast_walk!==false&&window.pixelCatBehaviourV1?.allowed(a,art.fastWalk)!==false&&a.urgency&&!['relaxed','casual'].includes(a.urgency)&&Math.abs(x-a.x)>=8*a.scale?art.fastWalk:null;return {gallop,fast};},
 canBound(a,clip,target,x){
  if(a.config.gallop===false||target?.narrow||a.support?.narrow)return false;let start=a.x;
  if(a.idle){const front=(rows,facing)=>{const y=rows.findLastIndex(r=>r.includes('R')),x=rows[y]?.lastIndexOf('R');return x>=0?(facing<0?23-x:x):null;};const facing=x>=a.x?1:-1,next=front(clip.frames[0],facing),old=a.idle.rows&&front(a.idle.rows,a.idle.facing??a.facing),bearing=old!=null&&a.idle.placement?a.idle.placement.x+old*a.scale:a.idle.contactX;if(next==null||!Number.isFinite(bearing))return false;start=Math.round((bearing-next*a.scale)/a.scale)*a.scale;}
  const cells=Math.abs(Math.round(x/a.scale)*a.scale-start)/a.scale;return clip.strideCells>0&&cells>=clip.strideCells*(a.social?.episode?.kind==='chase'?1:2);
 },
 gallop(a,kind,gait,target,x,art,random=Math.random){
  if(kind!=='walk'||['sneak','trot'].includes(gait)||a.config.gallop===false||!art.gallop||target?.narrow||a.support?.narrow)return null;
  if(window.pixelCatBehaviourV1?.allowed(a,art.gallop)===false)return null;if(gait==='gallop')return art.gallop;
  const chase=a.social?.episode?.kind==='chase',purposeful=a.urgency==='prompted';
  const policy=window.pixelCatBehaviourV1,bias=policy?.weight(a,art.gallop)??1;
  if(!chase&&!purposeful&&!(bias>1&&(a.mood?.values?.playfulness||0)>.45&&a.urgency!=='casual'))return null;
  if(!this.canBound(a,art.gallop,target,x))return null;
  const mood=a.mood?.values,weight=mood?Math.max(.02,.14+.12*mood.playfulness-.12*mood.sleepiness):.14;
  return random()<Math.min(.65,weight*bias)?art.gallop:null;
 },
 hesitation(m,scale,random=Math.random){
  const down=m.y-m.fromY,across=Math.abs(m.x-m.fromX);
  if(m.jumpKind!=='descend'||down<12*scale||down<across*1.25||random()>=.45)return 0;
  return 250+Math.floor(random()*351);
 }
};
